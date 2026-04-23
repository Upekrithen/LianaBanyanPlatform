# SP-21 Tidbit Scribe — Spec

**Authored:** Bishop B116, 2026-04-22
**Trigger:** Founder-requested during B116 after noticing Bishop verified the K435 prompt slot (`ls PROMPT_KNIGHT_K43*`) before drafting. Founder wants this kind of verification behavior captured as first-class signal — *"whenever you do something like that, you automatically make a tidbit."*
**Status:** MVP file-ledger live (`stitchpunks/data/tidbits.jsonl`). Full MCP tool not yet built — this spec covers the full build for a future Knight.

---

## Purpose

Capture verify-before-assert actions (BRIDLE Rule 2 adherence) across agents as a durable ledger. Unlike SP-6 Scribe (session logs) or SP-5 Sentinel (canonical drift), SP-21 records the *discipline* — every time an agent checks state before making a claim, one JSON line lands. Over sessions, the ledger shows:

- Which verification categories are most common
- Which verifications prevent which classes of error
- Whether verification-frequency tracks session quality
- Where to invest in auto-verification (e.g., if `verify_slot_number` fires 20 times a week, make it a one-call tool)

## Non-goals

- Not a blame log. Do not record "agent lied without verification."
- Not a metric for performance reviews of AI agents.
- Not a substitute for SP-5 Sentinel's canonical drift verification — that's a different layer.

## Storage

`librarian-mcp/stitchpunks/data/tidbits.jsonl` — one JSON object per line, append-only.

## Schema

```json
{
  "ts": "ISO-8601 UTC timestamp",
  "agent": "BISHOP | KNIGHT | ROOK | PAWN",
  "session": "B116 | K431 | ...",
  "category": "verify_<action>",
  "observation": "one-sentence description of what was checked and what was found",
  "artifact": "file path or symbol the verification served",
  "bridle_rule": 2
}
```

**Canonical categories** (extend with care):
- `verify_slot_number`
- `verify_file_exists`
- `verify_commit_state`
- `verify_symbol_exists`
- `verify_current_state`
- `verify_canonical_value`
- `verify_route_exists`
- `verify_migration_state`

## MCP tool (to be built — Knight dispatch future)

Add to `server.ts`:

```ts
server.addTool({
  name: "log_tidbit",
  description: "Append a verification-behavior tidbit to the Stitchpunk ledger. Call whenever you perform a BRIDLE-Rule-2-style pre-assertion check.",
  inputSchema: {
    type: "object",
    properties: {
      agent: { type: "string", enum: ["BISHOP","KNIGHT","ROOK","PAWN"] },
      session: { type: "string", pattern: "^[BKRP]\\d+$" },
      category: { type: "string" },
      observation: { type: "string", minLength: 10, maxLength: 500 },
      artifact: { type: "string" }
    },
    required: ["agent","session","category","observation"]
  }
});
```

Implementation: append-only write to `stitchpunks/data/tidbits.jsonl` with the supplied fields + auto-injected `ts` (server clock, ISO-8601 UTC) + auto-injected `bridle_rule: 2`. Return `{"ok": true, "line_count": N}` on success.

## Session-end hook

Extend `sp6_scribe` session-end to print a tidbit summary:

> `SP-21 Tidbit Scribe: N tidbits logged this session (M verify_slot_number, K verify_file_exists, ...)`

This gives agents a self-check at closeout.

## Analysis helper (future)

`python librarian-mcp/stitchpunks/sp21_tidbit_analyzer.py` — prints:
- Total tidbits all-time
- Per-agent breakdown
- Per-category breakdown
- "Top categories this month"
- "Tidbit-light sessions" (sessions with <3 tidbits — may indicate under-verification)

## Migration from MVP

Until `log_tidbit` MCP tool is live, Bishop (and any other agent) writes directly to `tidbits.jsonl` via the Write tool. Feedback memory `feedback_auto_tidbit_verify_actions.md` enforces the discipline. When the MCP tool lands, update that feedback memory to reference the tool call instead of direct file writes.

## Open questions for Founder

1. **Should Knight and Pawn also log tidbits?** The current MVP is Bishop-only. Extending to other agents requires updating their session-hygiene instructions. Default proposal: yes, extend — more data is better data.
2. **Retention?** JSONL is append-only; the file grows. Propose: rotate to `tidbits_YYYY-MM.jsonl` monthly, starting after 10K lines.
3. **Public or private?** Currently private (not in librarian-mcp-public). Keep private until you decide otherwise.

---

*MVP ledger is live as of B116. Formal SP-21 Knight build is queued as a future dispatch — not urgent; file-append works until then.*
