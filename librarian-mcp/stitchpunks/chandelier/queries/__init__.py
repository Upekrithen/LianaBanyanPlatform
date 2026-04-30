"""
Chandelier Diagnostic Queries — KN010 / A&A #2291

Query API layer on top of the KN009 Chandelier substrate.

Exported components:
  right_recipe_engine  — argmax subset engine (full-enum ≤12, beam-search >12)
  crown_jewel_temporal — per-hour/day/week CJ production rate diagnostics
  continuous_stretch   — longest gap-free productive span finder
  substrate_correlator — which primitives correlate with peak-productivity periods
  falsification_test   — given a claimed effect, tests against Chandelier receipts

TypeScript MCP tools (in this directory):
  query_receipts.ts    — direct receipt lookup
  three_mode_compare.ts — three-mode comparator wrapper
  pudding_render.ts    — JSON → human-readable pudding markdown

Toolsmith log: TS-CHANDELIER-DIAGNOSTIC-QUERIES-KN010-BP002
"""
