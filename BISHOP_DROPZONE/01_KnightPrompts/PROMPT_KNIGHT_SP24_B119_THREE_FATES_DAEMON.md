---
knight_session: SP24
bishop_session: B119
bridle_version: 10
status: READY TO DISPATCH
predecessor_gate: K451 baseline (v-migration-baseline-K451, eec98a7) ✓
target_tag: v-three-fates-daemon-SP24
task_class: Stitchpunk Corps new member — enforcement daemon
estimated_model: Opus 4.7 (design-dense; enforcement architecture matters)
scope_size: medium-large (single-session, 3-4 hours)
priority: HIGH — Founder-ratified B119 "pain medication doesn't work if you don't take it" compliance fix
---

**THE BRIDLE — read this before you respond. Follow all ten rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.
10. **MCP tooling discipline.** Always use `npm run build-guarded` (not raw `npm run build`) when modifying `librarian-mcp/src/`. Always use `npm start` (not raw `node dist/server.js`) to run the MCP server. The guard emits structured `server_rebuilding` errors during build windows; the supervisor auto-restarts on silent crash. Bypassing either returns us to the pre-K448 / pre-K449 silent-hang regime.

**End of BRIDLE. Task follows.**

---

## Context — the compliance-failure problem

**Founder-ratified B119:** *"The pain medication doesn't work if you don't take it."*

The Scribes Cathedral architecture (SP-22/SP-23) is correctly designed. The Three Fates routing — Clotho spins themes, Lachesis scores Scribes, Atropos dispatches — is specified in `feedback_three_fates_scribe_routing.md` as Bishop discipline. Bishop B119 failed to run it ritualistically and had to retro-log. Cultural preamble alone isn't enough. This session builds the **structural enforcement**.

Read before starting:
- `librarian-mcp/stitchpunks/SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md` (architecture reference)
- `librarian-mcp/stitchpunks/scribes/registry.yaml` (9 live Scribes; activation thresholds)
- `librarian-mcp/stitchpunks/scribes/scribe_*.jsonl` (example entries, per-Scribe)
- `librarian-mcp/src/server.ts` (MCP tools: `scribe_log`, `fates_route`, `consult_scribes`, `log_tidbit`)

---

## Scope — SP-24 Three Fates Daemon

### Phase 1 — Enforcement-mechanism design (pick defensibly)

**Three candidate enforcement paths, pick one:**

**A. MCP interceptor (preferred if feasible):** wrap every MCP tool response through a Fates-routing decorator. Any substantive tool output (>N words OR flagged `substantive: true`) auto-runs Fates classification and appends to matched Scribes before the response returns to the agent. Agent can't bypass without breaking the MCP contract.

**B. Log-scraping daemon:** agent session outputs to a structured log file at `librarian-mcp/stitchpunks/data/session_stream_<session_id>.jsonl`. Daemon watches the log, classifies entries, routes to Scribes. Requires agent discipline to log, but failure mode is observable (missing log = detectable session-end failure).

**C. Session-boundary audit:** lighter-weight — at `session_end`, daemon reads the session transcript (if exposed by platform) and retroactively runs Fates on all substantive segments. Batch, not streaming. Less immediate but simpler.

Pick **A** if MCP tool-response interception is feasible without breaking existing tool contracts; else **B**; else **C**. Document the choice + 1-paragraph rationale in your Phase 1 opening.

### Phase 2 — Implementation

File: `librarian-mcp/stitchpunks/sp24_three_fates_daemon.py` (mirrors other SPs). Zero-dep Python preferred (pattern from K438b standalone reader). Runtime dependencies: stdlib + `yaml` (if SP registry pattern already uses it).

Core functions:
```python
def classify_substantive(text: str) -> bool:
    """True if text meets substantive-exchange threshold (length, content signals)."""

def spin_themes(text: str) -> list[str]:
    """Clotho — extract primary themes from text for Scribe matching."""

def score_scribes(themes: list[str]) -> list[tuple[str, float]]:
    """Lachesis — score each Scribe by activation_threshold match against themes.
    Returns ranked list of (scribe_id, confidence_score)."""

def dispatch_to_scribes(text: str, scribe_scores: list[tuple[str, float]],
                        session_id: str, agent: str, threshold: float = 0.6) -> list[str]:
    """Atropos — append structured entries to all Scribes where score >= threshold.
    Returns list of scribe_ids actually written to."""

def run_fates(text: str, session_id: str, agent: str) -> dict:
    """End-to-end Fates run for one exchange. Returns audit record."""
```

Match Scribe activation thresholds from `registry.yaml` (do NOT hardcode; read the registry).

### Phase 3 — Session-lifecycle integration

**session_start hook** (`session_start.py`): spawn daemon OR register interceptor, whichever Phase 1 chose. Log start to `librarian-mcp/stitchpunks/data/fates_audit.jsonl`.

**session_end hook** (`session_end.py`): verify coverage. Fail session-close if **Fates-run count == 0** for substantive exchanges in this session. Report count + matched Scribes in session-end summary.

Coverage threshold policy (B119 canonical, hardcode for now):
- 0 Fates runs in session = **session close FAILS** with loud error
- 1-2 Fates runs = **warning** ("Session Fates coverage low — discipline check")
- ≥3 Fates runs = **pass**

### Phase 4 — `brief_me` integration

When `brief_me` runs (session start), it already reports session_gaps. Add a new field: `fates_coverage_last_session` showing run-count + matched-scribes count from the prior session's audit log. Makes compliance visible at every session_start.

### Phase 5 — Tests

- Unit: `classify_substantive` on 30 reference strings (mix of substantive and conversational)
- Unit: `spin_themes` on 15 reference texts
- Unit: `score_scribes` against known activation-threshold cases from registry.yaml
- Integration: end-to-end `run_fates` with mocked Scribe file append
- Failure-path: session_end with zero Fates runs — assert the failure fires
- pytest green, ≥70% coverage

### Phase 6 — Retroactive for B119 session

**BEFORE session close**: run the daemon retroactively on Bishop B119 session transcript (if accessible) to fill coverage gap. Produce a session B119 Fates-coverage report at `librarian-mcp/stitchpunks/data/fates_audit.jsonl` with all substantive exchanges routed to Scribes. This closes the B119 compliance gap as a proof-of-design.

### Phase 7 — Cultural preamble strengthening (hand-off to Bishop)

This session does NOT modify agent preambles directly — that's a Bishop memory-layer update. In your handoff report, include a recommended preamble text block for Bishop to paste into:
- Bishop system prompt
- BRIDLE v11 Rule 11 (candidate — Bishop review required)
- `feedback_three_fates_scribe_routing.md` (add enforcement notice)

Recommended text: *"After every substantive exchange, Three Fates MUST run. The SP-24 daemon will fail session_end if coverage drops to zero. Verify compliance via `brief_me`'s `fates_coverage_last_session` field before closing."*

### Phase 8 — Tag + handoff

Tag `v-three-fates-daemon-SP24`. Report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_SP24_B119_THREE_FATES_DAEMON.md`.

---

## Non-goals (do not do)

- Do NOT change the Scribes registry.yaml (Bishop owns Scribe taxonomy).
- Do NOT redesign the Three Fates naming / roles. Clotho / Lachesis / Atropos stay.
- Do NOT modify MCP tool API signatures. Interceptor wraps existing tools; doesn't replace them.
- Do NOT hardcode Scribe activation thresholds. Read from registry.yaml every run.
- Do NOT build a new UI surface for Fates audit. CLI-surfacing via `brief_me` is sufficient.
- Do NOT delete or modify existing Scribe entries (append-only ledger semantics).

---

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | Phase 1 enforcement-mechanism pick + 1-paragraph rationale in handoff | Phase 1 |
| 2 | `sp24_three_fates_daemon.py` implementing all 5 core functions | Phase 2 |
| 3 | `session_start.py` + `session_end.py` hooks wired | Phase 3 |
| 4 | `brief_me` output includes `fates_coverage_last_session` field | Phase 4 |
| 5 | pytest green, ≥70% coverage, failure-path test covered | Phase 5 |
| 6 | B119 session retroactive Fates run produces `fates_audit.jsonl` entries | Phase 6 |
| 7 | Preamble-update recommendation block in handoff for Bishop | Phase 7 |
| 8 | Tag `v-three-fates-daemon-SP24` + handoff report | Phase 8 |

---

## BRIDLE compliance (demonstrate in handoff)

| Rule | Demonstrate |
|---|---|
| Rule 2 | Read SP22/23 spec + registry.yaml + server.ts before writing a line; cite specific sections |
| Rule 5 | If a Scribe activation threshold is ambiguous, say so and flag — don't guess match criteria |
| Rule 6 | Phase 7 hands preamble-update to Bishop — don't rewrite preambles yourself |
| Rule 10 | If Phase 1 pick is MCP interceptor, ALL edits to `librarian-mcp/src/` must use `build-guarded` |

---

## Clarifying-question budget (BRIDLE Rule 3)

One permitted, if Phase 1 mechanism choice produces ambiguous architectural signal. Otherwise pick defensibly and proceed.

---

*Knight SP-24 authored by Bishop B119, 2026-04-23. Structural enforcement of Three Fates discipline. Founder-ratified directive: "The pain medication doesn't work if you don't take it." FOR THE KEEP.*
