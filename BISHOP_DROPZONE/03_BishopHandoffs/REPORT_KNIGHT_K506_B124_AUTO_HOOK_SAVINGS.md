# REPORT: KNIGHT K506 — Set-and-Forget Auto-Hook for Substrate-Savings Telemetry

**Session:** K506 · Bishop B124  
**Predecessor:** K505 (`v-substrate-savings-telemetry-K505`, commit `7694708`)  
**Tag:** `v-auto-hook-substrate-savings-K506`  
**Wall time:** ~4 hours  
**Budget used:** ~$4.50 (platform-code work, minimal LLM token spend)

---

## Summary

K506 converts K505's manual savings-logging infrastructure into a **set-and-forget auto-hook** across all three agent layers (Bishop, Knight, Pawn) and adds the LB Test Frame member-install population-scale telemetry layer.

After K506, the substrate-savings dashboard at `librarian.the2ndsecond.com/founder-savings` (private) and `/community-empirical` (public, member-aggregate) populates automatically — every Bishop conversation, every Knight commit, every Pawn paste-back, and every member Test Frame use.

---

## Phase A — Bishop Auto-Hook ✅

**Files changed:** `librarian-mcp/src/server.ts`

### A.1 — In-process session tracker (`_sessionTracker`)
- Module-level singleton tracking `injection_count`, `overhead_tokens_estimate`, `session_start_ts`, `last_call_ts`, `tool_call_names[]`
- `registerTool` wrapper now increments the tracker after every MCP tool call:
  - `injection_count++` (exact count of substrate injection events)
  - `overhead_tokens_estimate += Math.ceil(responseText.length / 4)` (estimated from response size)

### A.2 — Auto-populate in `run_session_end`
- When `substrate_injection_count` is not supplied (or 0), auto-fills from `_sessionTracker.injection_count`
- When `substrate_overhead_tokens` is not supplied (or 0), auto-fills from `_sessionTracker.overhead_tokens_estimate`
- `autoMode: true` flag in log message indicates auto-populated values
- Tracker resets after each `run_session_end` call

### A.3 — New `get_session_telemetry` MCP tool
- Returns current session's accumulated injection count, overhead estimate, tool call breakdown
- Bishop can inspect before calling `run_session_end` to verify tracking is working

### A.4 — No regression
- K505 manual paths still work: supply `input_tokens + output_tokens` explicitly and they override auto-tracked values
- Auto-hook supplements; does not replace

### Honest limitation
Token counts (`input_tokens`, `output_tokens`) for the whole AI conversation still require explicit supply. These cannot be captured at the MCP server level (the MCP server sees tool calls, not the Anthropic conversation stream). The session tracker gives overhead metrics for free; the conversation token counts require one line from Bishop at session close.

---

## Phase B — Knight Auto-Hook ✅

**Files created:**
- `librarian-mcp/scripts/post_commit_savings.py` — post-commit hook script
- `librarian-mcp/scripts/knight_tag_watcher.py` — tag-watcher daemon
- `librarian-mcp/scripts/install_git_hooks.py` — idempotent hook installer
- `.git/hooks/post-commit` — installed by running `install_git_hooks.py`
- `.git/hooks/k506_post_commit.ps1` — PowerShell companion for Windows

### B.1 — Cursor session-event detection (Toolsmith TS-001)
> Evaluated Cursor IDE extension API. Cursor does **not** expose a public `session-ended` event as of 2026-04. B.1 declared non-viable. Fell back to B.2. Documented as Toolsmith TS-001.

### B.2 — Git post-commit hook (primary Knight auto-hook)
- Detects K-session from commit message (`K\d{3,4}` regex)
- Gets `git diff HEAD~1 --shortstat` for lines added/removed
- Estimates tokens: `(lines_added + lines_removed) × 45 chars/line / 4 chars/token`; input = 4× output (context window heuristic)
- Appends to `substrate_savings_log.jsonl` with `estimated: true` + `multiplier_provisional: true` (dual-flag)
- Deduplication guard: skips if same session_id + today's date + estimated=true already exists (handles `git commit --amend`)
- **Installed** and active: `.git/hooks/post-commit` written

### B.3 — Tag-watcher daemon
- `knight_tag_watcher.py` polls `git tag -l 'v-*-K*'` at configurable interval (default 60s)
- On new tag: extracts session ID, checks if already logged, auto-logs estimated record
- State file: `stitchpunks/data/k506_tag_watcher_state.json` (survives restarts)
- Can run as Task Scheduler job (see `install-task-scheduler.ps1`)

### B.4 — Manual override preserved
- K505 `python scripts/knight_session_savings.py log K### ...` still works for explicit override

---

## Phase C — Pawn Auto-Hook ✅

**Files changed:** `librarian-mcp/src/server.ts`

New MCP tool: **`detect_and_log_pawn_session`**

- Input: `text` (pasted content) + `session_id` + optional `friction_confirmations` + `notes`
- Scans text against 8 Pawn-layer signatures:
  - `Prepared using (Gemini|Sonar|GPT|...)` model attribution footers
  - `Sonar Pro`, `Gemini 3.x`, `pawn_session`, `PAWN TASK` markers
  - `[P\d+]` Pawn session tags
  - `PROMPT_PAWN_B\d+` prompt file references
- Token extraction: reads embedded `tokens: N in / M out` footer if present; falls back to text-length estimate (35% input / 25% output ratio)
- Records `estimated: true` or `false` based on extraction method
- Auto-logs to `substrate_savings_log.jsonl` with `auto_detected: pawn_paste_back`

**Usage:** Bishop calls `detect_and_log_pawn_session(text=<paste>, session_id="B124")` whenever Founder pastes Pawn output into the conversation. The logging is then automatic.

---

## Phase D — LB Test Frame Member-Install Auto-Hook ✅

**Files created/changed:**
- `platform/supabase/migrations/20260425180001_k506_test_frame_savings.sql` (new migration)
- `platform/src/pages/TestFrameLanding.tsx` (Privacy & Telemetry UI section added)

### D.1 — Schema additions (all nullable, backward-compatible)
New columns on `test_frame_results`:
- `query_input_tokens` — member AI input tokens for this query
- `query_output_tokens` — member AI output tokens for this query
- `substrate_injection_tokens` — Cathedral substrate tokens injected
- `cold_baseline_estimated_tokens` — counterfactual token estimate (R13 multiplier)
- `member_friction_confirmations` — yes/do-it confirmation count (default 0)
- `savings_estimated` — boolean, true when tokens estimated from query size
- `savings_logged_at` — timestamp of savings computation

### D.2 — New aggregate view: `test_frame_savings_aggregate`
- `total_runs`, `runs_with_savings_data`, `mean_lift_pp`
- `total_input_tokens`, `total_output_tokens`, `total_substrate_tokens`
- `pct_of_cold_baseline` (actual/counterfactual ratio)
- `avg_friction_confirmations`, `measured_runs`, `estimated_runs`
- Powers `librarian.the2ndsecond.com/community-empirical`

### D.3 — Opt-in-share default: OFF
Existing K502 behavior preserved. New savings columns only shared when opt-in-share toggle is ON.

### D.4 — Member transparency UI (Privacy & Telemetry section)
Added four-card section to `TestFrameLanding.tsx`:
1. **Logged locally—always**: local savings dashboard regardless of sharing
2. **Shared with LB—opt-in only**: explicit toggle required, default OFF
3. **Estimated vs. measured**: every record labeled clearly, never mixed in aggregates
4. **Right to deletion**: Settings → Privacy & Telemetry → Delete all my data; 24-hour compliance

---

## Phase E — Calibration Auto-Pipeline ✅

**Files created:**
- `librarian-mcp/scripts/calibration_runner.py` — monthly calibration engine
- `.github/workflows/k506-savings-calibration.yml` — GitHub Action (1st of month, 06:00 UTC)

### E.1 — Calibration runner
- Reads `substrate_savings_log.jsonl`, optionally windowed (default 90d)
- Computes per-agent: session count, measured vs. estimated split, mean actual/counterfactual costs, multiplier variance
- **Honest scoping**: flags `empirical_multiplier_note: "tautological_until_control_pairs_available"` because current records were generated using the provisional multiplier (counterfactual = actual × provisional). True calibration requires paired control sessions.
- Outputs `calibration_status: "provisional"` or `"calibrated"` (calibrated only when control pairs available)
- Writes to `substrate_savings_calibration_log.jsonl` (immutable, append-only)

### E.2 — GitHub Action cron
- Runs monthly: `cron: "0 6 1 * *"` (1st of month, 06:00 UTC)
- Also supports `workflow_dispatch` for ad-hoc runs
- Commits calibration results to repo with audit-trail commit message
- Manual override: `workflow_dispatch` with custom `window_days` and `min_sessions`

### Honest note on Phase E
The multipliers remain **provisional** until we have paired cold/hot data from R14/R15 quarterly runs or Test Frame member cold-vs-hot comparisons. The runner ships the infrastructure and correctly flags its own limitation. This is the BRIDLE #41 good-name pattern applied to calibration math.

---

## Phase F — Synapse + Report ✅

- `librarian-mcp/stitchpunks/synapses/synapse_K506.jsonl` — 14 clusters ✅
- This report: `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K506_B124_AUTO_HOOK_SAVINGS.md` ✅
- Toolsmith entry: TS-001 (Cursor session-event API non-viable) documented in synapse

---

## Success Criteria Review

| Criterion | Status |
|---|---|
| Phase A: Bishop auto-hook — overhead auto-tracked; manual token supply still works | ✅ |
| Phase B: Knight auto-hook — git post-commit hook installed; tag-watcher ready; `estimated:true` flag honest | ✅ |
| Phase C: Pawn auto-hook — `detect_and_log_pawn_session` tool; paste-back detection; estimated vs. measured | ✅ |
| Phase D: LB Test Frame — schema additions; opt-in-share gating; transparency UI | ✅ |
| Phase E: Calibration pipeline — monthly cron; honest tautology flag; immutable log | ✅ |
| No regression: K505 manual paths intact; existing dashboards unaffected | ✅ |

**5 of 6 full criteria met (Phase B Cursor extension fell back to git-hook per prompt — honest fallback, not a failure). All 6 criteria functionally met.**

---

## Files Changed This Session

### New files
- `librarian-mcp/scripts/post_commit_savings.py`
- `librarian-mcp/scripts/knight_tag_watcher.py`
- `librarian-mcp/scripts/install_git_hooks.py`
- `librarian-mcp/scripts/calibration_runner.py`
- `librarian-mcp/stitchpunks/synapses/synapse_K506.jsonl`
- `platform/supabase/migrations/20260425180001_k506_test_frame_savings.sql`
- `.github/workflows/k506-savings-calibration.yml`
- `.git/hooks/post-commit` (installed)
- `.git/hooks/k506_post_commit.ps1` (installed)
- `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K506_B124_AUTO_HOOK_SAVINGS.md` (this file)

### Modified files
- `librarian-mcp/src/server.ts` — Phase A tracker + `get_session_telemetry` + Phase C `detect_and_log_pawn_session`
- `platform/src/pages/TestFrameLanding.tsx` — Privacy & Telemetry section + FAQ additions

---

## Pending / K-Future

- **Control pair data** for real calibration (R14/R15 quarterly benchmark or Test Frame cold-vs-hot comparisons)
- **Cursor extension API** — check if future Cursor versions expose session-event hooks (would replace git-hook for cleaner Knight token measurement)
- **Test Frame native savings popup** — the popup UI showing per-session savings to the member (UI wireframe exists; backend schema ready from Phase D)
- **Bishop memory file updates** (per Phase F spec): update `project_pawn_friction_secondary_cathedral_effect.md` and `project_librarian_mcp_public.md` — these live in the Claude Code memory vault and require Bishop session to update

---

*K506 complete. Set and forget. Population-scale by default. By their fruits, automatically and forever.*

**FOR THE KEEP.**

— Knight K506 / B124
