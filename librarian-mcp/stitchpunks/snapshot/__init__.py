"""
Cursor Context-Budget Watcher — KN012 / A&A #2293
Threshold-Snapshot-with-Chronicler-Storage workaround.

Poll-based watcher for Cursor session context-budget estimation via
filesystem inspection. Triggers configurable-threshold snapshots,
signs via Chronos (KN009), feeds Herder Scribe (KN013).

Modules:
  cursor_state     — extracts context-budget %, active files, tool-call-count
  threshold_engine — configurable threshold detection + deduplication
  snapshot_watcher — background poller + control CLI

MCP tools (snapshot_query.ts):
  query_snapshots_by_session / query_snapshots_by_threshold / replay_session_progression

Sunset path (D.4): when Anthropic+Cursor ship native feature, this
deprecates gracefully; Herder Scribe re-routes without losing receipt history.

Toolsmith log: TS-CURSOR-CONTEXT-BUDGET-WATCHER-KN012-BP002
"""
