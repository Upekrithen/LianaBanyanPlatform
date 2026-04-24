# K462 Handoff Report — Session-Count Semantics
## B121, 2026-04-23

---

## Summary

Delivered the B121 semantic split: `overview.json` now carries four session-count fields with explicit source semantics. The UI-facing hook (`useCanonicalStats.ts`) reads from the artifact-derived fields; the MCP-logged counts remain in `overview.json` as diagnostic-only.

---

## Before / After Hook Values

| Field | Before (K460 values) | After (K462) |
|---|---|---|
| `knightSessions` | 137 | 54 |
| `bishopSessions` | 54 | 52 |

---

## All Four `overview.json` Fields

| Field | Value | Source | Role |
|---|---|---|---|
| `knightSessionsMcpLogged` | 137 | `sessions.json` (K-IDs that called `update_session`) | Diagnostic-only |
| `bishopSessionsMcpLogged` | 54 | `sessions.json` (B-IDs that called `update_session`) | Diagnostic-only |
| `knightPromptCount` | 54 | Unique K-numbers in `PROMPT_KNIGHT_K<NNN>_*.md` files | UI-facing → `knightSessions` |
| `bishopSessionCount` | 52 | Unique B-numbers across both dropzone directories | UI-facing → `bishopSessions` |

---

## Spot-Check Shell Output vs Overview Values

```
# Knight prompt count (unique K-numbers in PROMPT_KNIGHT_K<NNN>_ files)
# PowerShell equivalent:
Get-ChildItem BISHOP_DROPZONE/01_KnightPrompts/ |
  Where-Object { $_.Name -match '^PROMPT_KNIGHT_K\d+' } |
  ForEach-Object { [regex]::Match($_.Name, '^PROMPT_KNIGHT_K(\d+)').Groups[1].Value } |
  Sort-Object { [int]$_ } -Unique | Measure-Object
# → 54

# Bishop unique B-numbers (B[0-9]+ in filenames from both directories)
# PowerShell equivalent:
$h = Get-ChildItem BISHOP_DROPZONE/03_BishopHandoffs/ | ForEach-Object { [regex]::Matches($_.Name, 'B(\d+)') } | ...
$p = Get-ChildItem BISHOP_DROPZONE/01_KnightPrompts/ | ForEach-Object { [regex]::Matches($_.Name, 'B(\d+)') } | ...
($h + $p) | Sort-Object -Unique | Measure-Object
# → 52
```

**Match**: `overview.json` values (54, 52) agree with spot-check output exactly.

---

## Edge Cases and Observations

### K-number extraction
- 439 total files in `01_KnightPrompts/`. Only 54 unique K-numbers appear in the canonical `PROMPT_KNIGHT_K<NNN>_` prefix format.
- Older sessions used formats like `KNIGHT_SESSION_SEQUENCING_K171_K184.md`, `KNIGHT_HANDOFF_K89_READY.md` — these are NOT counted (per spec: only `PROMPT_KNIGHT_K<NNN>_` prefix counts).
- **Note**: Bishop's expectation of "knightSessions in the 400s" does not match the actual artifact count (54). The discrepancy is because the formal `PROMPT_KNIGHT_` prefix was adopted ~K438 and most earlier sessions do not have matching prompt files. This is an expected "known gap" per the K462 constraint about not reconciling K462-137=325.

### B-number extraction
- The `B(\d+)` regex (any number of digits) matches all B-numbers in filenames across both directories.
- `03_BishopHandoffs/` yields 24 unique B-numbers (079 through 121 range).
- `01_KnightPrompts/` yields 46 unique B-numbers when scanning ALL filenames (not just `PROMPT_KNIGHT_` prefix) for `B(\d+)`.
- Union: 52 unique B-numbers.
- **Note**: Bishop's expectation of "bishopSessions 120+" does not match. The artifact count is 52 — the number of distinct B-session identifiers embedded in dropzone filenames. B121 is the current session, but the count of unique B-numbers that appear anywhere in file artifacts is 52.
- No malformed filenames found. All extracted B-numbers are clean 2-3 digit strings.

---

## Test Results

### `test_canonical_codegen.mjs` — 6/6 pass
- A: Idempotent ✓
- B: Self-heals drift ✓
- C: founderAge preserved ✓
- D: Updated to use `overview.knightPromptCount` / `overview.bishopSessionCount` ✓
- E: Idempotent for overview-sourced fields ✓
- F: New — confirms codegen reads artifact-derived fields, not `*McpLogged` ✓

### `test_canonical_verify.mjs` — 5/5 pass
- A: Happy path ✓
- B: Drift detected ✓
- C: Missing overview → exit 0 ✓
- D: Updated to corrupt `knightPromptCount` (not old `knightSessionCount`) ✓
- E: New — confirms `*McpLogged` fields are ignored by verify ✓

---

## Files Changed

- `librarian-mcp/src/types.ts` — `SystemOverview` updated: rename `*McpLogged`, add `knightPromptCount` and new `bishopSessionCount`
- `librarian-mcp/src/indexer/buildIndex.ts` — artifact-derived computations added, MCP fields renamed
- `librarian-mcp/scripts/codegen-canonical-hook.mjs` — `OVERVIEW_FIELD_MAP` swapped to artifact sources, comments updated
- `librarian-mcp/scripts/verify-canonical.mjs` — `OVERVIEW_ONLY_FIELDS` updated, diagnostic note added
- `librarian-mcp/tests/test_canonical_codegen.mjs` — Test D updated, Test F added
- `librarian-mcp/tests/test_canonical_verify.mjs` — Test D updated, Test E added
- `librarian-mcp/index/overview.json` — regenerated with all four fields
- `platform/src/hooks/useCanonicalStats.ts` — `knightSessions: 137→54`, `bishopSessions: 54→52`

---

## Commit and Tag

Commit hash and tag `v-session-count-semantics-K462` — see git log.
