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

The port is patched onto mcp.settings after import. FastMCP's SSE runner
uses uvicorn under the hood; host is pinned to 127.0.0.1 for security.

Architecture note (K484):
  This wrapper is intentionally thin. It imports the published
  librarian-mcp-public package without modification (BRIDLE guardrail).
  Future features (bedrock ingest, Miner/Sculptor triggers) are added
  via the Helm module framework — not by patching this wrapper.
"""

from __future__ import annotations

import argparse
import os
import sys

def main() -> None:
    parser = argparse.ArgumentParser(
        prog="helm-daemon",
        description="Helm daemon wrapper for librarian-mcp (SSE transport).",
    )
    parser.add_argument("--port", type=int, default=7711,
                        help="Port to listen on (default: 7711)")
    parser.add_argument("--cathedral-dir", default=None,
                        help="Cathedral directory for Librarian (default: ~/.librarian/)")
    args = parser.parse_args()

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
    # (FastMCP constructor defaults to port=8000; we override here without forking)
    mcp.settings.port = args.port
    mcp.settings.host = "127.0.0.1"

    print(f"[helm-daemon] Starting Librarian SSE server on http://127.0.0.1:{args.port}/sse")
    print(f"[helm-daemon] Cathedral: {args.cathedral_dir or '~/.librarian/'}")
    sys.stdout.flush()

    mcp.run(transport="sse")


if __name__ == "__main__":
    main()
