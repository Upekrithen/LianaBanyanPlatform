"""
perplexity_gateway — Pawn-Librarian HTTP Gateway (KN092 / BP011 Pod W Bean 4)

Exposes Librarian MCP tools to Pawn (Perplexity) via a Perplexity-compatible
HTTP gateway. Pawn becomes the 4th Iron-E-Giant peer in the LIGHTHOUSE.

Empirical anchor: BP011 Pawn produced $92M/$147M/$238M patent portfolio
valuations (50–65× too low) because it could not read canonical Behemoth Reborn.
This gateway closes that failure mode.

Modules:
  server.py          — Flask HTTP server (default localhost:8765)
  tool_translator.py — MCP ↔ Perplexity format translation + native tool impl
  auth.py            — Per-dispatch API key + session-id authn + scope check
  safe_tool_list.yaml — Founder-ratified tool allowlist (prose-pass required)
"""
