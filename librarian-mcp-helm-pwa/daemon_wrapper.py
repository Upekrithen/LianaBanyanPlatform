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

Comet Bridge endpoints (REST, separate port = main_port + 1, default 7712):
  GET  http://127.0.0.1:<rest_port>/health   — liveness check
  POST http://127.0.0.1:<rest_port>/enrich   — Cathedral injection for a query
       Body:    { "query": "..." }
       Returns: { "enriched_query": "...", "intent": "...", "token_count": N }

The REST server is a lightweight threading.HTTPServer — no extra deps, additive
to the existing MCP/SSE surface. Chrome extensions call the REST port; AI clients
connect via SSE/MCP on the main port.

Architecture note (K484 / K485A):
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


# ─── REST HTTP handler ────────────────────────────────────────────────────────

class EnrichHandler(BaseHTTPRequestHandler):
    """Minimal REST handler for the Comet Bridge extension."""

    # Allowed CORS origins for Chrome extensions
    _CORS_ORIGIN = "*"  # chrome-extension://* is not a wildcard CORS origin; wildcard is safe for localhost

    def log_message(self, fmt, *args):
        # Route to stdout with our prefix so Electron's log tail picks it up
        print(f"[enrich-rest] {fmt % args}", flush=True)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", self._CORS_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        """Preflight CORS."""
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            body = json.dumps({"status": "ok", "service": "comet-bridge"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/enrich":
            self.send_response(404)
            self.end_headers()
            return

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

        result = _build_enriched_query(query)
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
        print(f"[enrich-rest]   GET  /health — liveness check", flush=True)
        print(f"[enrich-rest]   POST /enrich — Cathedral injection endpoint", flush=True)
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
