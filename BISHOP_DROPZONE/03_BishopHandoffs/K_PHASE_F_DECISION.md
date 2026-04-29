# K-Phase-F-Substrate-Instrument — Architecture Decision D.2

**Session:** K-Phase-F-Substrate-Instrument / B133 (K551)
**Decision type:** Agent-side file-read instrumentation location
**Filed:** 2026-04-29
**Founder pre-ratified:** D.2 = γ

---

## D.2 — Agent-side file-read instrumentation (RATIFIED γ — Bishop-side filesystem watcher)

**Option γ (RATIFIED):** Bishop-side filesystem watcher — monitor file mtime + read events via OS-level fs notify (watchdog). Least Cursor-coupling; works with any agent reading files in the watched directory tree.

**Rationale:**

α (wrap Cursor's Read tool via Cursor extension API) requires Cursor cooperation and is coupled to Cursor's internal tool implementation — fragile and extension API not publicly available for this use case.

β (parse Cursor's terminal/log output stream) requires Cursor to write structured logs in a parseable format and is coupled to Cursor's log format, which changes across versions.

γ (Bishop-side filesystem watcher) is independent of Cursor's internal architecture. The `watchdog` Python library monitors OS-level file access events (inotify on Linux, kqueue on macOS, ReadDirectoryChangesW on Windows). Every file read in the LianaBanyanPlatform directory tree produces an `on_modified`/`on_accessed` event. The watcher logs: file path + timestamp + estimated size. The Phase F harness then computes whether each read would have been Wrasse-resolvable.

**Key limitation:** OS-level fs notify captures file accesses, not "which agent made the read." During the empirical pair run, a clean session (single agent, no background processes) ensures all file reads are attributable to the Knight session under measurement.

## Implementation summary

**Files created:**
- `librarian-mcp/stitchpunks/wrasse/phase_f_substrate_instrument.py` — Phase F harness (substrate-instrument mode, coverage delta, session pair comparison, closeout report)
- `librarian-mcp/stitchpunks/wrasse/phase_f_fs_watcher.py` — Bishop-side filesystem watcher (γ, watchdog-based)
- `librarian-mcp/src/phase_f_logger.ts` — MCP server middleware: logs every tool response char count + tool name + timestamp to `phase_f_call_log.jsonl`
- `librarian-mcp/stitchpunks/wrasse/phase_f_call_log.jsonl` — (created on first run; append-only per Stone Tablet)

**Empirical pair run (Scope C):**
Baseline + wrasse-on RC alias-audit sessions. Run after this K lands with `python phase_f_substrate_instrument.py --run-pair`. See K_PHASE_F_RECEIPT.md for results when filled.

**Stone Tablet:** all Phase F records append-only to `session_ledger.jsonl` (Phase F extended records) and `phase_f_call_log.jsonl`.

*Filed by Knight (K-Phase-F-Substrate-Instrument), B133, 2026-04-29*
