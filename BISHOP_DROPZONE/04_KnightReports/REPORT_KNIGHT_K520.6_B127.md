# Knight Report — K520.6 — Operational Gotchas Scribe MVP

**Session**: K520.6 / B127  
**Knight**: Cursor Sonnet 4.6  
**Filed**: 2026-04-26  
**Tag**: v-operational-gotchas-scribe-K520-6  
**Status**: LANDED  

---

## Summary

K520.6 implements the Operational Gotchas Scribe — a new `always_loaded` serving mode that injects all tablets into the K520.5 substrate cache at session start. 13 seed tablets seeded (OG-001..OG-013), including OG-012 and OG-013 discovered during K520.5. Three new MCP tools: `consult_gotchas`, `add_gotcha`, `promote_to_gotchas`. **8/8 Phase C checks pass.**

---

## Phase A — Audit

- **A.0 git check-ignore**: `BISHOP_DROPZONE/04_KnightReports/REPORT_KNIGHT_K520.6_B127.md` is gitignored — force-add required.
- **A.0a Toolsmith**: Architecture scribe confirmed: append-only JSONL tablets, registry.yaml is the mode-declaration surface, mode=corpus = deterministic full retrieval.
- **A.1 Scaffold**: 11 starter tablets from Bishop B127 + 2 from K520.5 = 13 total. Schema: `og_id, ts, session, observation, source, friction, workaround, agents_affected, promotion_class, recurrence_count`.
- **A.2 Registry**: `mode?: "observational" | "corpus"` in TypeScript — needs `"always_loaded"` addition. Two files: `registry.ts` + `consult.ts`.
- **A.3 Template**: Toolsmith uses `toolsmith_id, what_fails, what_works` format. OG entries extend standard schema (`ts, session, observation, source`) with OG-specific fields.

---

## Phase B — What Was Built

### B.1 `registry.yaml` — OperationalGotchas entry

```yaml
- id: OperationalGotchas
  mode: always_loaded
  primary:
    level: 1
    field: operational frictions and workarounds for AI agents (Bishop/Knight/Pawn)
```

### B.2 `scribe_OperationalGotchas.jsonl` — 13 seed tablets

| OG-ID | Friction | Session |
|---|---|---|
| OG-001 | PowerShell no heredoc | B127 |
| OG-002 | Bash heredoc apostrophes | B127 |
| OG-003 | Cursor context overflow at ~3 tasks | B127 |
| OG-004 | Knight can't see gitignored dirs | B127 |
| OG-005 | Firebase chains need `;` not `&&` | B127 |
| OG-006 | Use Glob/Grep/Read not find/grep/cat | B127 |
| OG-007 | Augur-Pricing false positives on `$` | B127 |
| OG-008 | Augur-Securities `invest*` wildcard | B127 |
| OG-009 | TimeWave escalates after 3 rejections | B127 |
| OG-010 | Glob brace `{A,B,C}` unreliable | B127 |
| OG-011 | New session costs 35K context tokens | B127 |
| OG-012 | PowerShell `Set-Content UTF8` writes BOM | K520.5 |
| OG-013 | Windows VM clock skew PS vs Python 6h | K520.5 |

### B.3 TypeScript mode type extension

- `registry.ts` `ScribeEntry.mode?: "observational" | "corpus" | "always_loaded"`
- `consult.ts` `ConsultResult.scribes_consulted[].mode` + `KnightScribesRegistry.scribes[].mode`

### B.4 `writeSubstrateCache()` updated

```typescript
function readGotchasForCache(): Array<Record<string, unknown>> {
  try { return readTablet("OperationalGotchas") as Array<Record<string, unknown>>; }
  catch { return []; }
}
// In writeSubstrateCache():
const gotchas = readGotchasForCache();
writeFileSync(CACHE_FILE, JSON.stringify({
  ts: ..., session_task: ..., briefing: ..., gotchas, cached_at: ...
}, null, 2), "utf-8");
```

### B.5 New MCP tools in `server.ts`

- **`consult_gotchas`**: Returns all OG tablets, formatted with og_id + friction + workaround + agents.
- **`add_gotcha`**: Appends new tablet, auto-assigns OG-NNN id.
- **`promote_to_gotchas`**: Reads Toolsmith by `toolsmith_ts_id`, maps `what_fails→friction`, `what_works→workaround`, appends to OG JSONL.

---

## Phase C — Verification (8/8 PASS)

| # | Check | Result |
|---|---|---|
| C.1 | `consult_gotchas` returns all 13 seed tablets | PASS |
| C.2 | `add_gotcha` appends; count becomes 14 | PASS |
| C.3 | `promote_to_gotchas(TS-001)` creates OG-015 | PASS |
| C.4 | substrate cache `gotchas[]` has ≥13 entries | PASS |
| C.5 | Refresh-read returns updated count | PASS |
| C.6 | Toolsmith tablet still readable (regression) | PASS |
| C.7 | First-Consult Edict gate unchanged (regression) | PASS |
| C.8 | All OG entries pass required schema fields | PASS |

**Friction encountered**: ESM relative imports fail from `%TEMP%` dir. Fix: run all `node --input-type=module --eval` inline from `librarian-mcp/` directory (not temp `.mjs` files).

**Fix-Along-the-Way**: Test tablets (C.2/C.3) removed from JSONL after verification to prevent test artifacts polluting always-loaded corpus. Rewrite with line-filter (og_id numeric <= 13).

---

## Files Modified

| File | Change |
|---|---|
| `librarian-mcp/stitchpunks/scribes/registry.yaml` | OperationalGotchas entry added |
| `librarian-mcp/src/scribes/registry.ts` | `always_loaded` in mode union |
| `librarian-mcp/src/scribes/consult.ts` | `always_loaded` in mode union (2 places) |
| `librarian-mcp/src/server.ts` | `readGotchasForCache()`, gotchas in `writeSubstrateCache()`, 3 new tools |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/OPERATIONAL_GOTCHAS_SCRIBE_B127_SCAFFOLD.md` | K520.6 SHIPPED section |

## Files Created

| File | Purpose |
|---|---|
| `librarian-mcp/stitchpunks/scribes/scribe_OperationalGotchas.jsonl` | 13 seed tablets |
| `librarian-mcp-helm-pwa/synapse_K520.6.jsonl` | 8 synapse entries |
| `BISHOP_DROPZONE/04_KnightReports/REPORT_KNIGHT_K520.6_B127.md` | This report |

---

*Filed 2026-04-26 by Knight (Cursor Sonnet 4.6). Long Haul AND Fix Along the Way.*
