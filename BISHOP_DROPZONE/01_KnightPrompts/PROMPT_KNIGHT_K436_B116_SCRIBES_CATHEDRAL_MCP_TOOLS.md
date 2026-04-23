# Knight K436 — Formalize SP-22/23 Scribes Cathedral as MCP Tools
## Internal Cathedral infrastructure: `log_tidbit`, `fates_route`, `scribe_log`, `consult_scribes` MCP tools + session-start/end hook integration
## Bishop B116 — 2026-04-22 (night)
## Predecessor: SP-21 Tidbit Scribe MVP + SP-22/23 Cathedral MVP (both Bishop-shipped B116, file-append discipline)
## Spec: [SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md](../../librarian-mcp/stitchpunks/SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md)
## Sibling: K437 (SCEV-1 empirical test — will consume `consult_scribes` tool this phase exposes)

---

**THE BRIDLE — read this before you respond. Follow all nine rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.**
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it.
6. **No unasked scope.** No "while we're here." No bonus suggestions.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.

**End of BRIDLE. Task follows.**

---

## Session hygiene

1. `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K436`, `task="Formalize SP-22/23 Scribes Cathedral as MCP tools + session hooks"`.
2. `mcp__librarian__brief_me` with the same task.
3. Read in order:
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md` (the spec — authoritative)
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/SP21_TIDBIT_SCRIBE_SPEC.md` (predecessor)
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/scribes/registry.yaml` (the 4 pilot Scribes + 6 queued-for-first-trigger)
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/scribes/scribe_R9.jsonl`, `scribe_BRIDLE.jsonl`, `scribe_Landing.jsonl`, `scribe_Prov14.jsonl` (existing tablet format)
   - `LianaBanyanPlatform/librarian-mcp/stitchpunks/data/fates_log.jsonl`, `tidbits.jsonl` (existing ledger formats)
   - `LianaBanyanPlatform/librarian-mcp/src/server.ts` (current MCP tool registration pattern — match it)
   - Bishop memory: `feedback_three_fates_scribe_routing.md`, `feedback_auto_tidbit_verify_actions.md`, `feedback_keep_analysis_visible.md`
4. Confirm K429's fingerprint-based incremental rebuild is running (it is, per B116 handoff) — do not duplicate it.

---

## Scope — one sentence

Ship four MCP tools (`log_tidbit`, `fates_route`, `scribe_log`, `consult_scribes`) that replace Bishop-discipline file-append with canonical server calls, plus session-start/end hook integration that auto-routes each exchange through the Fates pipeline, such that K437 SCEV-1 can consume `consult_scribes` as a realistic production simulation of the HOT-cathedral condition.

---

## Deliverables

### 1. Four MCP tools in `librarian-mcp/src/server.ts`

Match existing tool-registration pattern (`server.addTool({...})` pattern used by `brief_me`, `run_session_start`, etc. — verify by reading server.ts before writing).

#### `log_tidbit`
- Schema per `SP21_TIDBIT_SCRIBE_SPEC.md` Step 3 (already spec'd).
- Appends to `librarian-mcp/stitchpunks/data/tidbits.jsonl`.
- Auto-injects `ts` (server UTC) and `bridle_rule: 2`.
- Returns `{ok: true, line_count: N}` on success.

#### `fates_route`
```ts
inputSchema: {
  type: "object",
  properties: {
    session_id: { type: "string" },
    text: { type: "string", minLength: 20 },
    agent: { type: "string", enum: ["BISHOP","KNIGHT","ROOK","PAWN"] }
  },
  required: ["session_id","text","agent"]
}
```
Behavior (per spec Section "Three Fates"):
- **Clotho:** extract themes from `text` — simple keyword match against each Scribe's `keywords` list in `registry.yaml`, plus named-entity extraction (canonical numbers, innovation IDs starting `#22`, session IDs like `B116`/`K432`).
- **Lachesis:** score each registered Scribe by keyword-match count + adjacent-field bonus. Thresholds: minimum 1 primary-field match OR 2 adjacent-field matches for a Scribe to wake. Score is `(primary_matches * 1.0) + (adjacent_matches * 0.5)`.
- **Atropos:** for each awakened Scribe, return a dispatch directive. Do NOT write to Scribe tablets directly — Atropos returns directives; the caller (hook or agent) decides whether to act.
- Log the full routing record to `stitchpunks/data/fates_log.jsonl` regardless.
- Cap dispatched Scribes at 5 per call (top scores win); flag coverage gaps (`coverage_gap: true` if a theme matched no Scribe).

Return shape:
```json
{
  "clotho_themes": ["..."],
  "lachesis_scores": {"R9": 0.6, "Prov14": 0.95, ...},
  "atropos_dispatch": [{"scribe_id": "Prov14", "directive": "...", "suggested_observation": "..."}],
  "coverage_gaps": ["theme that matched no Scribe"],
  "logged_to": "fates_log.jsonl"
}
```

#### `scribe_log`
```ts
inputSchema: {
  type: "object",
  properties: {
    scribe_id: { type: "string" },
    session_id: { type: "string" },
    observation: { type: "string", minLength: 10, maxLength: 500 },
    source: { type: "string", enum: ["founder_dialogue","bishop_ship","knight_ship","bishop_read","bishop_thresh","bishop_design","scribe_thresh","fates_auto"] },
    canonical_ref: { type: "string" }
  },
  required: ["scribe_id","session_id","observation","source"]
}
```
- Append entry to `stitchpunks/scribes/scribe_<scribe_id>.jsonl`. Auto-inject `ts`.
- Verify `scribe_id` is registered in `registry.yaml` before appending. If not: return `{ok: false, error: "unknown_scribe", registered: [...]}` — do NOT create new Scribes on the fly (registration is a registry-edit decision).
- Return `{ok: true, tablet: "...", line_count: N}`.

#### `consult_scribes` — the RAM-access pattern, K437 will use this
```ts
inputSchema: {
  type: "object",
  properties: {
    topic: { type: "string" },
    max_entries: { type: "number", default: 20 },
    since_ts: { type: "string" },
    include_adjacents: { type: "boolean", default: true }
  },
  required: ["topic"]
}
```
- Score `topic` against each Scribe's primary + adjacent keyword lists.
- Return up to `max_entries` recent observations from the highest-scoring Scribes (primary Scribe first, adjacents next if `include_adjacents: true`).
- Response includes `scribes_consulted: [...]` and per-entry `scribe_id` so callers can see which Scribe contributed what.
- If `since_ts` provided, filter entries newer than that timestamp.
- Optimize for speed — this is the RAM-access pattern. p95 latency target < 200ms for 20-tablet cathedral.

### 2. Registry loader

New file: `librarian-mcp/src/scribes/registry.ts` (or your preferred pathing — match existing indexer module conventions). Parses `stitchpunks/scribes/registry.yaml` once at server start, caches. Exposes:
- `getRegistry()` → full parsed object
- `getScribe(id)` → single-Scribe entry or null
- `scoreScribe(scribeId, themes)` → numeric score per Lachesis formula above

Write tests. At least:
- Parses all 4 pilot Scribes correctly (R9, BRIDLE, Landing, Prov14)
- Unknown scribe_id returns null
- Scoring produces expected ranks on a hand-crafted test text

### 3. Session-start hook integration

Extend `run_session_start` in `server.ts`:
- After the existing SP-6 / SP-1 / SP-5 / SP-7 pass, call a new SP-22 Fates pass with empty `text` (session-start itself has no content yet — just register session_id for later routing).
- Print a Cathedral status line: `SP-22/23 Cathedral: N Scribes registered, M total tablet entries all-time. Consult via consult_scribes tool.`

### 4. Session-end hook (new)

If `run_session_end` doesn't already exist in `server.ts`, add it. Mirrors session-start but outputs a Cathedral summary:
- Tidbits logged this session (by category)
- Scribe tablet entries this session (by scribe_id)
- Fates dispatches this session
- Coverage gaps detected
- Hottest Scribe(s) this session

### 5. Update `feedback_three_fates_scribe_routing.md` in Bishop memory

Add a section at the bottom: *"Tool-migration complete as of K436. Replace direct file-append via Write tool with `mcp__librarian__scribe_log(...)` and `mcp__librarian__fates_route(...)` calls. Direct file-append remains a valid fallback only if the MCP server is unavailable."*

Knight updates this memory file via the Edit tool at the end of the session (paths is `~/.claude/projects/C--Users-Administrator-Documents/memory/feedback_three_fates_scribe_routing.md`).

### 6. Tests

- `tests/test_scribe_tools.py` (or TS equivalent — match existing test style): exercise each tool's happy path + one error path.
- `tests/test_fates_router.py`: verify Clotho extracts themes, Lachesis scores correctly, Atropos produces expected dispatches on fixture text.
- `tests/test_consult_scribes_latency.py`: synthetic 500-entry tablet, verify p95 < 200ms.

All tests green before finish.

---

## Non-goals (explicit)

- **NO member-facing Cathedral scaffolding.** That's K438, explicitly after K437 SCEV-1 numbers land. Stay internal-only in this session.
- **NO new Scribes beyond the 4 pilots.** Registry has 6 more queued in comments; do NOT instantiate them. They're waiting for first-trigger in the field.
- **NO Claude Code hook configuration** (`~/.claude/settings.json`) changes. Session-start/end hooks in this scope are the MCP-server-side ones, not the Claude Code harness hooks. The Claude-Code-side `settings.json` hook is a future decision (see spec "Option 1 vs Option 2").
- **NO retrospective tablet backfill.** Existing tablets stay as-is; Bishop-direct entries from B116 are canonical seed data.
- **NO changes to `r9v2_base.md` or any preload files.** R10 canon is untouchable.
- **NO PyPI version bump.** These are server-side additions, not library API changes. Internal-only. Version bump happens with K435 Mellon (v0.3.0) or later.

---

## Acceptance criteria

- [ ] Four MCP tools registered and callable from any MCP client
- [ ] `mcp__librarian__log_tidbit(...)` appends to tidbits.jsonl; test file-tail confirms
- [ ] `mcp__librarian__fates_route(...)` on a B116-representative paragraph routes to ≥2 Scribes with correct keyword attribution
- [ ] `mcp__librarian__scribe_log(...)` appends correctly; unknown-scribe rejection works
- [ ] `mcp__librarian__consult_scribes(topic="Prov 14")` returns recent Prov14 Scribe entries in <200ms p95
- [ ] `run_session_start` output includes new Cathedral status line
- [ ] `run_session_end` (new) prints Cathedral session summary
- [ ] All tests green
- [ ] `feedback_three_fates_scribe_routing.md` updated with tool-migration note
- [ ] Commit tag: `v-cathedral-tools-K436`

---

## Rollback plan

If the tool registration breaks existing MCP operation (regression in `brief_me` or `run_session_start`), revert the PR and ship the tools under a feature flag (`LIBRARIAN_ENABLE_CATHEDRAL=1` env var) instead. Cathedral file-append discipline continues under Bishop-direct-Write-tool as MVP fallback.

---

## Handoff to K437

When this session lands, K437 (SCEV-1 empirical test) can dispatch immediately. Knight K437 will use `consult_scribes` as the HOT-cathedral condition backend instead of raw file-stuffing. That's what makes K437's numbers production-realistic, not synthetic.

---

*K436 authored by Bishop B116, 2026-04-22. Sibling dispatches: K435 (Mellon), K437 (SCEV-1), K438 stub (Member Cathedral — holds for K437 results).*
