---
knight_session: K452
bishop_session: B119
bridle_version: 10
predecessor_gate: K451 landing (v-migration-baseline-K451, eec98a7) ✓
target_tag: v-session-gap-diagnostic-K452
task_class: DIAGNOSTIC ONLY (no fixes shipped in this session)
estimated_model: Sonnet 4.6 — scope is analysis, not code
scope_size: small (single-session, under 2 hours)
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

## Context

Every Bishop session opens with `brief_me` and consistently sees the line:

> **Session gaps: 758**

The number has been climbing for multiple sessions (B115 saw it, B117 saw it, B118 saw it, B119 sees it). It's flagged in the `VERIFICATION STATUS` block of `brief_me` output alongside `Stale: 49` and `Orphaned: 0`. The count suggests the session reconciliation pipeline isn't closing sessions as fast as they open.

**What we don't know** (and what K452 will answer):
1. What does a "session gap" mean structurally in the librarian-mcp index?
2. Where is the 758 number computed? Which file, which function?
3. Are the 758 gaps one class of problem, or many different causes grouped?
4. What's the cheapest fix? (ranked options with effort + risk)

**K452 is DIAGNOSTIC ONLY.** Do NOT fix anything in this session. The output is a report that a future session (K453+) acts on. A diagnostic that tries to fix-in-place produces neither good diagnosis nor good fix.

---

## Scope

### Phase 1 — Locate the counter

Grep the librarian-mcp codebase for where `session_gaps`, `session gaps`, `sessionGaps`, or the literal number computation lives. Likely candidates:
- `librarian-mcp/stitchpunks/sp5_sentinel.py` (sentinel logic)
- `librarian-mcp/src/` (Node side of MoneyPenny `brief_me`)
- `librarian-mcp/stitchpunks/session_start.py` / `session_end.py`
- `librarian-mcp/touchstone/` (verify.py perhaps)

Output: file path + line number where the 758 is computed, and the SQL/JSONL input that feeds the computation.

### Phase 2 — Characterize the gap

Pull a sample of 20 gaps (first 10 chronologically + 10 most recent) and classify each:
- What session ID or timestamp shows a gap?
- Is it a Bishop / Knight / Rook / Pawn session?
- Did `session_start` fire without a matching `session_end`?
- Did a session_start fire for a session ID that was never logged elsewhere?
- Is the gap a reconciliation mismatch (ledger says X, ground-truth file says Y)?

Output: a 20-row table categorizing each sample gap by cause class. Likely classes:
- `no_end`: session_start logged, no matching session_end
- `no_start`: session_end logged without prior session_start
- `orphan_tag`: session ID referenced but no session file exists
- `reconcile_mismatch`: ledger + ground-truth disagree
- `unknown`: doesn't fit any of the above (flag for Bishop review)

### Phase 3 — Count by class

Given the 758 total, produce a histogram:

```
no_end:             X (XX%)
no_start:           Y (YY%)
orphan_tag:         Z (ZZ%)
reconcile_mismatch: A (AA%)
unknown:            B (BB%)
```

Run this on ALL 758 gaps, not just the sample. Output the exact counts.

### Phase 4 — Cheapest-fix analysis

For EACH class above that has non-zero count, propose a fix strategy:
- **Effort** estimate (LOC + time)
- **Risk** (what could break)
- **Blast radius** (does this require touching canonical memory, or is it self-contained?)

Rank by cheapest-first. The goal is to know which one class, if fixed, would drop the 758 to <100.

### Phase 5 — One-page report

Output at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K452_B119_SESSION_GAP_DIAGNOSTIC.md`:

```markdown
# K452 Session-Gap Diagnostic — Report

## Where the counter lives
{file:line} computes {value} by reading {source}.

## Histogram of 758 gaps
no_end: X (XX%)
...

## Root cause ranking (cheapest to most expensive)
1. {class_name} — {effort} — {risk} — drops count by ~{N}
2. ...

## Recommended K453 scope
Fix {class_name} first. Specific approach: {2-3 sentences}.

## What I didn't investigate (flagged for Bishop)
- {anything you couldn't confidently classify}
```

Keep it under one printed page. This is a decision document, not a dissertation.

---

## Non-goals (do not do)

- Do NOT write any fix code in K452. Fix proposals live in prose, not commits.
- Do NOT touch `canonical_values.yaml` or any memory file.
- Do NOT modify the `brief_me` output format (that's K453+'s call, after we know the cause).
- Do NOT re-run the librarian rebuild. If the counter changes between your first and last grep, note the delta; don't chase it.
- Do NOT delete any session-log lines, even if they look like orphans. Treat logs as append-only truth.

---

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | Counter location (file + line + source) | Phase 1 |
| 2 | 20-row sample table with classes | Phase 2 |
| 3 | Full histogram across all 758 | Phase 3 |
| 4 | Ranked fix proposals with effort/risk | Phase 4 |
| 5 | Report at path above | Phase 5 |
| 6 | Tag `v-session-gap-diagnostic-K452` on commit containing only the report | Phase 5 |

**No code changes in the commit.** Just the report file + tag. If the commit contains `.ts` or `.py` edits, Knight has broken scope.

---

## BRIDLE compliance (for your handoff)

| Rule | How to demonstrate |
|---|---|
| Rule 2 (verify before assert) | Every class count backed by a grep/SQL output snippet in the appendix |
| Rule 5 (no invention) | If the 758 is actually computed from N things and you can only classify M, say `M/N classified; (N-M) flagged as uncertain` |
| Rule 6 (no unasked scope) | Zero fix code. Zero refactors. |
| Rule 7 (plain close) | Report's last line: "Done. Histogram produced. Top-1 fix would drop count by ~X. No code changed." |

---

*Knight K452 authored by Bishop B119, 2026-04-23. Diagnostic-only. K453+ acts on the output. FOR THE KEEP.*
