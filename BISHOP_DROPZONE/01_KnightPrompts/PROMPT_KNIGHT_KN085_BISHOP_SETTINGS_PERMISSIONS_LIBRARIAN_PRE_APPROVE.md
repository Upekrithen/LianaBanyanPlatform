# PROMPT — Knight KN085: Bishop settings.json — pre-approve librarian MCP tools (eliminates AFK-permission-prompt friction class)

*(Augur-Pricing exemption: documentation-class K-prompt; LB membership pricing identical for all members at $5/year, unchanged; membership-orthogonal — vendor-API spend industry-term.)*

```
=== WRASSE PRE-INJECTION ===
[BP009 §3.6 AFK Discovery] First-MCP-invocation permission-prompt cliff: when Bishop's first librarian MCP call in a fresh session triggers user-approval, session blocks until Founder returns. AFK during this window contaminates wallclock measurement linearly. BP009 90-bean test discovered this empirically: ~63min Class D wallclock dominated by AFK time, not substrate-active operation.

Composing canon:
- ~/.claude/projects/C--Users-Administrator-Documents/memory/MEMORY.md (Bishop session-open discipline)
- BISHOP_DROPZONE/03_BishopHandoffs/SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md §3.6 AFK correction
- ~/.claude/settings.json (or settings.local.json) Bishop scope
=== END WRASSE ===

=== BRIDLE v11 ===
Rule 1 (trust-but-verify): inspect settings.json BEFORE editing; verify file location + scope (user vs project)
Rule 2 (pre-assertion): list Bishop's existing permissions; identify which librarian tools are already approved vs prompt-on-first-call
Rule 3 (least-privilege): only pre-approve KNOWN-SAFE librarian read/write tools; do NOT blanket-approve dangerous ops
=== END BRIDLE ===

PHASE A — DESIGN
Identify the safe-to-pre-approve librarian MCP tool set. Read-only and write-to-substrate-only tools are LOW RISK (substrate is canonical and append-only-by-design):

**Pre-approve (substrate-write read/write — low risk)**:
- mcp__librarian__brief_me (read)
- mcp__librarian__detective_investigate (read)
- mcp__librarian__check_consistency (read)
- mcp__librarian__scribe_log (substrate-append)
- mcp__librarian__log_tidbit (substrate-append)
- mcp__librarian__add_gotcha (substrate-append)
- mcp__librarian__consult_gotchas (read)
- mcp__librarian__correspondent_log (substrate-append)
- mcp__librarian__consult_scribes (read)
- mcp__librarian__update_session (substrate-append)
- mcp__librarian__chronos_query (read)
- mcp__librarian__pheromone_query (read)
- mcp__librarian__get_session_context (read)
- mcp__librarian__get_initiative (read)
- mcp__librarian__get_architecture (read)
- mcp__librarian__get_canonical_numbers (read)
- mcp__librarian__chandelier_*  (read/query)
- mcp__librarian__bureau_query (read)
- mcp__librarian__search_knowledge (read)
- mcp__librarian__detective_* (read)

**DO NOT blanket pre-approve (require Founder confirmation per call)**:
- mcp__librarian__angel_of_death_* (sever/bury — destructive)
- mcp__librarian__dispatch_pawn (Pawn dispatch — has cost)
- mcp__librarian__cancel_pawn_dispatch (cancellation — visible action)
- mcp__librarian__force_complete touchstone tools (state-changing for shared resources)
- mcp__librarian__refresh_substrate_cache (potentially expensive)
- mcp__librarian__run_session_start / run_session_end (session-mutating)

PHASE B — IMPLEMENT
1. Locate Bishop's settings.json. Check both:
   - C:\Users\Administrator\.claude\settings.json (user-scope)
   - C:\Users\Administrator\Documents\LianaBanyanPlatform\.claude\settings.json (project-scope)
2. Add `permissions.allow` entries for each pre-approve item. Format:
```json
{
  "permissions": {
    "allow": [
      "mcp__librarian__brief_me",
      "mcp__librarian__detective_investigate",
      "mcp__librarian__check_consistency",
      "mcp__librarian__scribe_log",
      "mcp__librarian__log_tidbit",
      "mcp__librarian__add_gotcha",
      ...
    ]
  }
}
```
3. Use the Claude Code `update-config` skill if available — that's the supported mechanism for settings.json edits.

PHASE C — VERIFY
1. Read settings.json post-edit — confirm permissions.allow entries are present + valid JSON
2. Restart Bishop session OR run `/permissions` slash command to confirm new allows are active

PHASE D — TEST
1. Open a fresh Bishop test session
2. Issue first librarian MCP call (e.g., `mcp__librarian__brief_me`)
3. Verify NO permission prompt appears — call proceeds immediately
4. Issue a write call (e.g., `mcp__librarian__scribe_log`) → verify NO prompt
5. Issue a non-pre-approved call (e.g., dispatch_pawn) → verify prompt DOES appear (proves least-privilege is preserved)

PHASE E — SHUTTERBUG
Capture filename: `KN085_BISHOP_SETTINGS_LIBRARIAN_PRE_APPROVE_<timestamp>.png` showing:
- Monitor 1: settings.json with new permissions.allow block
- Monitor 2: live test confirming no prompt on first MCP call

PHASE F — COMMIT
NOTE: settings.json may not be in git. If it's not tracked, document the change in a `BISHOP_SETTINGS_KN085_BP009.md` artifact in BISHOP_DROPZONE/15_BishopMisc/ for canon trace.

If tracked in repo:
```bash
cd <appropriate-repo-root>
git add .claude/settings.json
git commit -m "feat(bishop/KN085-BP009): pre-approve safe librarian MCP tools (eliminates AFK permission-prompt friction)

Empirical: BP009 90-bean test §3.6 documented ~63min Class D wallclock contamination from first-MCP-invocation permission prompt while Founder AFK. This pre-approves known-safe librarian read + substrate-append tools to eliminate the friction class. Destructive / Pawn-dispatch / state-changing tools remain prompt-required for least-privilege.

Receipt anchor: SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md §3.6"
```

Then scribe_log to OperationalGotchas: "AFK permission-prompt friction class eliminated by KN085 settings.json fix at <commit-sha or date>"

=== SUCCESS CRITERIA ===
- Bishop settings.json updated with permissions.allow for ~25 safe librarian tools
- Verified at next Bishop session start: no prompt on first librarian MCP call
- Least-privilege preserved (destructive/dispatch tools still prompt)
- Phase-E Shutterbug lands
- Canon trace recorded (BISHOP_SETTINGS_KN085_BP009.md or commit if tracked)

=== FOUNDER PROSE-PASS ===
Founder reviews the pre-approve list before settings.json apply. Bishop recommends the categorization above (safe vs require-prompt). Founder may add/remove entries.
```
