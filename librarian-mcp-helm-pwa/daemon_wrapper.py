"""
Helm daemon wrapper — starts librarian-mcp as an SSE HTTP server.

Spawned by the Helm Electron shell on startup. Supervised by the shell;
restarts on crash (5s delay) are handled by Electron's child_process logic.

Usage (shell calls this):
    python daemon_wrapper.py --port 7711 --cathedral-dir ~/.librarian/

Transport: SSE (FastMCP built-in).
  GET  http://localhost:<port>/sse      — SSE stream endpoint (AI tool connection)
  POST http://localhost:<port>/messages/ — MCP message endpoint
  GET  http://localhost:<port>/mcp      — streamable-http endpoint

Comet Bridge / Pawn Portal endpoints (REST, port = main_port + 1, default 7712):
  GET  http://127.0.0.1:<rest_port>/health   — liveness check
  POST http://127.0.0.1:<rest_port>/enrich   — Cathedral injection (enriched query only)
       Body:    { "query": "..." }
       Returns: { "enriched_query": "...", "intent": "...", "token_count": N }
  POST http://127.0.0.1:<rest_port>/pawn     — Cathedral injection + Perplexity API call
       Body:    { "query": "...", "model": "(optional)" }
       Returns: { "answer": "...", "intent": "...", "token_count": N,
                  "enriched_chars": N, "error": null }
       Requires: PPLX_API_KEY in environment

The REST server is a lightweight threading.HTTPServer — no extra deps, additive
to the existing MCP/SSE surface.

Architecture note (K484 / K485A / K509):
  This wrapper is intentionally thin. It imports the published
  librarian-mcp-public package without modification (BRIDLE guardrail).
  Future features (bedrock ingest, Miner/Sculptor triggers) are added
  via the Helm module framework — not by patching this wrapper.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ─── Iter-A / K477 authoritative-source wrapper ───────────────────────────────
# This format produced the 80% HOT result in K477 empirical testing.

_AUTHORITY_HEADER = (
    "The following is authoritative reference material from the Liana Banyan Cathedral — "
    "a canonical local knowledge base. It represents the ground truth for this domain. "
    "Use these sources as the primary basis for your answer. "
    'If the sources do not contain the answer, say "The provided sources do not contain this information." '
    "Do NOT supplement with web search if the sources are sufficient.\n\n"
    "=== BEGIN AUTHORITATIVE SOURCES ==="
)
_AUTHORITY_FOOTER = "=== END AUTHORITATIVE SOURCES ==="

_MAX_CONTEXT_CHARS = 10_000  # Perplexity practical input limit safety buffer


# ─── Intent inference from query keywords ────────────────────────────────────

def _infer_intent(query: str) -> str:
    """Route query to the most relevant Cathedral preload intent.

    Keyword-based routing for V0 — no ML, no external calls.
    Default falls back to 'canonical' (richest general context).
    """
    q = query.lower()

    arch_words = [
        "cathedral", "miner", "sculptor", "librarian", "architecture", "scribe",
        "stitchpunk", "pawn", "bishop", "knight", "rook", "helm", "system",
        "eblet", "tablet", "substrate", "bedrock",
    ]
    benchmark_words = [
        "benchmark", "hot", "hit", "miss", "r10", "r11", "r12", "k477",
        "eyewitness", "accuracy", "empirical", "evidence",
    ]
    founder_words = [
        "founder", "vision", "mission", "philosophy", "why liana", "purpose",
        "help each other", "37 years", "1989",
    ]
    canonical_words = [
        "patent", "innovation", "claim", "pledge", "liana banyan", "member",
        "creator", "83.3", "sweet sixteen", "initiative", "opening gambit",
        "cathedral effect",
    ]

    if any(w in q for w in arch_words):
        return "architecture"
    if any(w in q for w in benchmark_words):
        return "benchmark"
    if any(w in q for w in founder_words):
        return "founder_voice"
    if any(w in q for w in canonical_words):
        return "canonical"
    return "canonical"  # richest general-purpose fallback


# ─── Build Cathedral injection ────────────────────────────────────────────────

def _build_enriched_query(query: str) -> dict:
    """Return { enriched_query, intent, token_count, packet_chars }.

    Falls back gracefully if librarian_mcp.context is unavailable.
    """
    intent = _infer_intent(query)

    try:
        from librarian_mcp.context import build_packet  # type: ignore
        result = build_packet(intent=intent, max_tokens=8_000, lang="en")
        packet: str = result.get("packet", "")
        token_count: int = result.get("token_count", 0)
    except Exception as exc:
        print(f"[enrich] WARNING: build_packet failed ({exc}); returning bare query.", flush=True)
        return {
            "enriched_query": query,
            "intent": intent,
            "token_count": 0,
            "packet_chars": 0,
            "error": str(exc),
        }

    if not packet:
        return {
            "enriched_query": query,
            "intent": intent,
            "token_count": 0,
            "packet_chars": 0,
        }

    # Truncate context to stay within Perplexity's input cap
    available_ctx = _MAX_CONTEXT_CHARS - len(query) - 200  # 200 chars for wrapper text
    if len(packet) > max(0, available_ctx):
        packet = packet[:available_ctx] + "\n…[context truncated]"

    enriched = (
        f"{_AUTHORITY_HEADER}\n\n"
        f"{packet}\n\n"
        f"{_AUTHORITY_FOOTER}\n\n"
        f"Question: {query}"
    )

    return {
        "enriched_query": enriched,
        "intent": intent,
        "token_count": token_count,
        "packet_chars": len(packet),
    }


# ─── Perplexity API call ─────────────────────────────────────────────────────

# Default model — sonar-pro has web search + long context; good for Cathedral
# augmented queries where authority wrapper should dominate web results.
_DEFAULT_PPLX_MODEL = "sonar-pro"


def _call_perplexity(enriched_query: str, api_key: str, model: str = _DEFAULT_PPLX_MODEL) -> dict:
    """POST enriched_query to Perplexity API. Returns { answer, usage, error }.

    Uses stdlib urllib only — no extra dependencies.
    Blocks until the full response arrives (non-streaming, V0).
    Timeout: 90s (Perplexity can be slow on complex queries with web search).
    """
    url = "https://api.perplexity.ai/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": enriched_query}],
        "stream": False,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage  = data.get("usage", {})
            return {"answer": answer, "usage": usage, "error": None}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return {"answer": "", "usage": {}, "error": f"HTTP {exc.code}: {body[:300]}"}
    except Exception as exc:
        return {"answer": "", "usage": {}, "error": str(exc)}


# ─── REST HTTP handler ────────────────────────────────────────────────────────

class EnrichHandler(BaseHTTPRequestHandler):
    """Minimal REST handler for the Comet Bridge extension + Wing (K518)."""

    # Allowed CORS origins for Chrome extensions
    _CORS_ORIGIN = "*"  # chrome-extension://* is not a wildcard CORS origin; wildcard is safe for localhost

    def log_message(self, fmt, *args):
        # Route to stdout with our prefix so Electron's log tail picks it up
        print(f"[enrich-rest] {fmt % args}", flush=True)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", self._CORS_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, data: dict, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict | None:
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 512_000:
                return None
            raw = self.rfile.read(length)
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return None

    def do_OPTIONS(self):
        """Preflight CORS."""
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"status": "ok", "service": "comet-bridge", "wing": "available"})

        elif self.path == "/wing/rules":
            # Return current Wing rules from local file
            try:
                from wing_host import load_rules
                rules = load_rules()
                self._send_json({"rules": rules, "count": len(rules)})
            except Exception as exc:
                self._send_json({"rules": [], "count": 0, "error": str(exc)})

        elif self.path == "/wing/dashboard":
            # Return Wing dashboard stats
            try:
                from wing_host import get_dashboard
                self._send_json(get_dashboard())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/wing/export":
            # Export Wing config + telemetry as portable JSON
            try:
                from wing_host import export_wing
                self._send_json(export_wing())
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        elif self.path == "/wing/starters":
            # Return the 5 starter Augurs
            try:
                from wing_host import STARTER_RULES
                self._send_json({"starters": STARTER_RULES})
            except Exception as exc:
                self._send_json({"error": str(exc)}, 500)

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path not in ("/enrich", "/pawn", "/wing/evaluate", "/wing/rules",
                             "/wing/import", "/wing/install-starters",
                             "/wing/mark-consulted", "/wing/enabled"):
            self.send_response(404)
            self.end_headers()
            return

        # ── Wing-specific POST endpoints (K518) ───────────────────────────────

        if self.path == "/wing/evaluate":
            payload = self._read_json_body()
            if payload is None:
                self._send_json({"error": "bad_request"}, 400)
                return
            query_text = payload.get("query", "").strip()
            if not query_text:
                self._send_json({"error": "missing query"}, 400)
                return
            try:
                from wing_host import evaluate as wing_evaluate
                self._send_json(wing_evaluate(query_text))
            except Exception as exc:
                self._send_json({"action": "allow", "error": str(exc)})
            return

        if self.path == "/wing/rules":
            payload = self._read_json_body()
            if payload is None or "rules" not in payload:
                self._send_json({"error": "missing rules"}, 400)
                return
            try:
                from wing_host import save_rules
                save_rules(payload["rules"])
                self._send_json({"ok": True, "saved": len(payload["rules"])})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/import":
            payload = self._read_json_body()
            if payload is None:
                self._send_json({"error": "bad_request"}, 400)
                return
            try:
                from wing_host import import_wing
                self._send_json(import_wing(payload))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/install-starters":
            payload = self._read_json_body() or {}
            starter_ids = payload.get("starter_ids")
            try:
                from wing_host import install_starter_augurs
                self._send_json(install_starter_augurs(starter_ids))
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/mark-consulted":
            payload = self._read_json_body() or {}
            try:
                from wing_host import mark_consulted
                mark_consulted(payload.get("source", "cathedral"), payload.get("domain"))
                self._send_json({"ok": True})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        if self.path == "/wing/enabled":
            payload = self._read_json_body() or {}
            try:
                from wing_host import load_prefs, save_prefs
                prefs = load_prefs()
                prefs["wing_enabled"] = bool(payload.get("enabled", True))
                save_prefs(prefs)
                self._send_json({"ok": True, "wing_enabled": prefs["wing_enabled"]})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)}, 500)
            return

        # ── /enrich and /pawn: parse query from body ───────────────────────────

        length = int(self.headers.get("Content-Length", 0))
        if length > 64_000:
            self.send_response(413)
            self.end_headers()
            return

        try:
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8"))
            query: str = payload.get("query", "").strip()
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        if not query:
            self.send_response(400)
            self._send_cors_headers()
            self.end_headers()
            return

        # ── /enrich — Cathedral injection only ───────────────────────────────
        if self.path == "/enrich":
            result = _build_enriched_query(query)
            body = json.dumps(result, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        # ── /pawn — Cathedral injection + Perplexity API ─────────────────────
        api_key = os.environ.get("PPLX_API_KEY", "").strip()
        if not api_key:
            err = json.dumps({
                "error": "PPLX_API_KEY not found in daemon environment. "
                         "Load SDS.env before starting Helm.",
                "answer": "",
            }).encode()
            self.send_response(503)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(err)
            return

        model = payload.get("model", _DEFAULT_PPLX_MODEL)
        enrich = _build_enriched_query(query)
        pplx   = _call_perplexity(enrich["enriched_query"], api_key, model)

        result = {
            "answer":         pplx["answer"],
            "intent":         enrich["intent"],
            "token_count":    enrich.get("token_count", 0),
            "enriched_chars": len(enrich["enriched_query"]),
            "usage":          pplx.get("usage", {}),
            "error":          pplx["error"],
        }
        body = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


def _start_rest_server(rest_port: int) -> None:
    """Start the REST server in a daemon thread. Returns immediately."""

    def _run():
        server = ThreadingHTTPServer(("127.0.0.1", rest_port), EnrichHandler)
        print(f"[enrich-rest] Comet Bridge REST server on http://127.0.0.1:{rest_port}", flush=True)
        print(f"[enrich-rest]   GET  /health         — liveness check", flush=True)
        print(f"[enrich-rest]   POST /enrich         — Cathedral injection endpoint", flush=True)
        print(f"[enrich-rest]   POST /wing/evaluate  — Wing rule evaluation (K518)", flush=True)
        print(f"[enrich-rest]   GET  /wing/rules     — Load member Wing rules", flush=True)
        print(f"[enrich-rest]   POST /wing/rules     — Sync member Wing rules", flush=True)
        print(f"[enrich-rest]   GET  /wing/dashboard — Wing telemetry summary", flush=True)
        print(f"[enrich-rest]   GET  /wing/export    — Export Wing config+telemetry", flush=True)
        server.serve_forever()

    t = threading.Thread(target=_run, name="comet-bridge-rest", daemon=True)
    t.start()


# ─── Entry point ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        prog="helm-daemon",
        description="Helm daemon wrapper for librarian-mcp (SSE transport + Comet Bridge REST).",
    )
    parser.add_argument("--port", type=int, default=7711,
                        help="MCP SSE port (default: 7711)")
    parser.add_argument("--rest-port", type=int, default=None,
                        help="Comet Bridge REST port (default: main port + 1, i.e. 7712)")
    parser.add_argument("--cathedral-dir", default=None,
                        help="Cathedral directory for Librarian (default: ~/.librarian/)")
    args = parser.parse_args()

    rest_port = args.rest_port if args.rest_port is not None else args.port + 1

    # Propagate cathedral dir to Librarian via env var
    if args.cathedral_dir:
        os.environ["LIBRARIAN_CATHEDRAL_DIR"] = args.cathedral_dir

    # Import after env setup so cathedral_dir is visible to the server module
    try:
        from librarian_mcp.server import mcp
    except ImportError as exc:
        print(f"[helm-daemon] ERROR: librarian-mcp not installed: {exc}", file=sys.stderr)
        print("[helm-daemon] Install with: pip install librarian-mcp", file=sys.stderr)
        sys.exit(1)

    # Patch port onto the FastMCP settings object
    mcp.settings.port = args.port
    mcp.settings.host = "127.0.0.1"

    print(f"[helm-daemon] Starting Librarian SSE server on http://127.0.0.1:{args.port}/sse")
    print(f"[helm-daemon] Cathedral: {args.cathedral_dir or '~/.librarian/'}")
    sys.stdout.flush()

    # Start Comet Bridge REST server in background thread
    _start_rest_server(rest_port)

    # Block on MCP SSE server (uvicorn main thread)
    mcp.run(transport="sse")


if __name__ == "__main__":
    main()
