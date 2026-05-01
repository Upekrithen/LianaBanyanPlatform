"""
server.py — Perplexity-Compatible HTTP Gateway for Librarian MCP Tools
KN092 / BP011 Pod W Bean 4

Flask HTTP server on configurable port (default localhost:8765).
Accepts Perplexity/OpenAI-format tool call requests from Pawn dispatch scripts.
Routes each call through auth + scope-check + tool_translator.

Endpoints:
  GET  /health            — health check (no auth required)
  GET  /tools             — list available tool schemas (no auth required)
  POST /v1/tool_call      — execute a single tool call (auth required)
  POST /v1/batch_call     — execute a batch of tool calls (auth required)

Auth header:
  Authorization: Bearer <dispatch-api-key>
  X-Session-Id: <session-id>   (e.g. "R11_pawn_abc123")

Request body (POST /v1/tool_call):
  {
    "tool_call": {
      "id": "<tool_call_id>",
      "type": "function",
      "function": {
        "name": "<tool_name>",
        "arguments": "<json_string>"
      }
    }
  }

Response (success):
  {
    "status": "ok",
    "result": {"role": "tool", "tool_call_id": "...", "content": "<json_string>"}
  }

Response (error):
  {"status": "error", "error": "<message>", "code": <int>}

Run standalone:
  python -m librarian_mcp.perplexity_gateway.server [--port 8765] [--host 127.0.0.1]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

# Flask import — available in this environment
from flask import Flask, jsonify, request

# Resolve workspace-relative imports (path-based; no top-level package required)
GATEWAY_DIR = Path(__file__).resolve().parent
SRC_DIR = GATEWAY_DIR.parent
LIBRARIAN_ROOT = SRC_DIR.parent
WORKSPACE_ROOT = LIBRARIAN_ROOT.parent
if str(LIBRARIAN_ROOT) not in sys.path:
    sys.path.insert(0, str(LIBRARIAN_ROOT))

from src.perplexity_gateway.auth import (   # noqa: E402
    AuthResult,
    ScopeError,
    authenticate,
    check_scope,
    get_safe_tool_list,
)
from src.perplexity_gateway.tool_translator import (   # noqa: E402
    list_available_tools,
    translate_and_execute,
)

DEFAULT_PORT = 8765
DEFAULT_HOST = "127.0.0.1"

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


# ── Utility ────────────────────────────────────────────────────────────────────

def _error(message: str, code: int = 400) -> tuple:
    return jsonify({"status": "error", "error": message, "code": code}), code


def _extract_auth(req) -> tuple[str, str]:
    """Extract api_key and session_id from request headers."""
    auth_header = req.headers.get("Authorization", "")
    api_key = ""
    if auth_header.startswith("Bearer "):
        api_key = auth_header[7:].strip()
    session_id = req.headers.get("X-Session-Id", "").strip()
    return api_key, session_id


def _parse_tool_call(tc: dict) -> tuple[str, str, dict]:
    """
    Parse a Perplexity/OpenAI tool_call object.
    Returns (tool_call_id, tool_name, arguments_dict).
    Raises ValueError on malformed input.
    """
    tool_call_id = tc.get("id", "")
    fn = tc.get("function", {})
    tool_name = fn.get("name", "")
    raw_args = fn.get("arguments", "{}")

    if not tool_name:
        raise ValueError("tool_call.function.name is required")

    if isinstance(raw_args, str):
        try:
            args = json.loads(raw_args)
        except json.JSONDecodeError as exc:
            raise ValueError(f"tool_call.function.arguments is not valid JSON: {exc}") from exc
    elif isinstance(raw_args, dict):
        args = raw_args
    else:
        args = {}

    return tool_call_id, tool_name, args


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "pawn-librarian-gateway",
        "version": "KN092-BP011",
        "port": app.config.get("GATEWAY_PORT", DEFAULT_PORT),
    })


@app.get("/tools")
def list_tools():
    return jsonify({
        "status": "ok",
        "tools": list_available_tools(),
        "safe_tool_list": get_safe_tool_list(),
    })


@app.post("/v1/tool_call")
def tool_call():
    # Auth
    api_key, session_id = _extract_auth(request)
    auth: AuthResult = authenticate(api_key, session_id)
    if not auth.ok:
        return _error(f"Unauthorized: {auth.error}", 401)

    # Parse body
    body = request.get_json(force=True, silent=True) or {}
    tc = body.get("tool_call")
    if not tc:
        return _error("Missing 'tool_call' in request body")

    try:
        tool_call_id, tool_name, args = _parse_tool_call(tc)
    except ValueError as exc:
        return _error(str(exc))

    # Scope check
    try:
        check_scope(tool_name, auth.scribe_id)
    except ScopeError as exc:
        return _error(str(exc), 403)

    # Execute via translator
    result = translate_and_execute(
        tool_name,
        tool_call_id,
        args,
        scribe_id=auth.scribe_id,
        shadow_pair=None,  # Shadow-alpha pairing injected via middleware if available
    )

    return jsonify({"status": "ok", "result": result})


@app.post("/v1/batch_call")
def batch_call():
    # Auth
    api_key, session_id = _extract_auth(request)
    auth: AuthResult = authenticate(api_key, session_id)
    if not auth.ok:
        return _error(f"Unauthorized: {auth.error}", 401)

    body = request.get_json(force=True, silent=True) or {}
    tool_calls = body.get("tool_calls", [])
    if not isinstance(tool_calls, list) or not tool_calls:
        return _error("Missing or empty 'tool_calls' list")

    from src.perplexity_gateway.auth import check_scope

    results = []
    for tc in tool_calls:
        try:
            tool_call_id, tool_name, args = _parse_tool_call(tc)
        except ValueError as exc:
            results.append({
                "tool_call_id": tc.get("id", ""),
                "status": "error",
                "error": str(exc),
            })
            continue

        try:
            check_scope(tool_name, auth.scribe_id)
        except ScopeError as exc:
            results.append({
                "tool_call_id": tool_call_id,
                "status": "error",
                "error": str(exc),
                "code": 403,
            })
            continue

        result = translate_and_execute(
            tool_name,
            tool_call_id,
            args,
            scribe_id=auth.scribe_id,
            shadow_pair=None,
        )
        results.append({"status": "ok", "result": result})

    return jsonify({"status": "ok", "results": results})


# ── CLI entry point ────────────────────────────────────────────────────────────

def create_app(port: int = DEFAULT_PORT, host: str = DEFAULT_HOST) -> Flask:
    """Factory for tests and wsgi runners."""
    app.config["GATEWAY_PORT"] = port
    app.config["GATEWAY_HOST"] = host
    return app


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Pawn-Librarian HTTP Gateway (KN092)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--host", type=str, default=DEFAULT_HOST)
    parser.add_argument("--debug", action="store_true", default=False)
    ns = parser.parse_args(argv)

    print(
        f"[KN092] Pawn-Librarian Gateway starting on {ns.host}:{ns.port}  "
        f"(debug={ns.debug})",
        flush=True,
    )
    create_app(ns.port, ns.host).run(host=ns.host, port=ns.port, debug=ns.debug)


if __name__ == "__main__":
    main()
