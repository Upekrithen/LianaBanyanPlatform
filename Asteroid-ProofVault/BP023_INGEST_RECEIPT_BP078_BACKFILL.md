# BP023 INGEST RECEIPT — BP078 Backfill

| Field | Value |
|---|---|
| **Ingested at** | BP078 (2026-06-09) |
| **Source file** | `C:\Users\Administrator\Documents\LianaBanyanKNIGHT\BP023.md` (335 lines) |
| **Coverage** | 100% — full sequential read |
| **SID (soccerball)** | `stub_bp023_bp078_backfill_seg_bv` |
| **Pearl ID** | `stub_pearl_bp023_bp078_backfill` |
| **canonical_ref** | `canon_bp023_session_ingest_receipt_bp078_backfill` |
| **Class / decay** | receipt / anchor |
| **Backfill reason** | No prior ingest receipt existed; Founder BP078 directive to recover all missing sessions |

---

## Session Identity

**BP023 = THIN SESSION — CODEX COLLISION RESOLUTION + BUSHEL 32B/C FOLLOW-ON + MCP SERVER RESTART.** Session date: 2026-05-04 (thin, 335 lines). Primary work: Bushel 32B codex reservation system follow-on (T1-T8 tests + Gate verification), MCP server restart coordination, Codex ledger reconciliation. Also context from BP022 carryover.

---

## Load-Bearing Items Recovered

### Bushel 32B Final Gate Verification (Post-Restart)
- G1-G7 all green: TypeScript extended, lookup paths, concurrency probe (10 concurrent exactly 1 wins), T1-T8, clean tsc, dogfood, 15 reservations eligible for 32C sweep
- Commit `a2ea415`, pre-commit hooks passed
- MCP server restart coordinated: old server killed by Knight -> Bishop verified PID 2908 started after patched build
- Stage-2 cache confirmed: compiled dist/server.js has all 3 Bushel 32B markers; ToolSearch returns old schema (Bishop's client session cache not refreshed)

### Bushel 32C Scope Confirmation
- 9 real BP022 reservations only (LB-CODEX-0035 -> LB-CODEX-0043)
- Test pollution: 6 rows from T2/T3 tests skipped (would write spurious test entries into prod corpus)
- LB-CODEX-0009 orphan = Bushel 32D scope (separate from 32C)
- Dry-run table ratified before live-fire

### Codex Dual-Serial-Space Sync Debt CLOSED
- Pre-patch: some serials bound without reservation-honor
- Post-32C: reservation-space and corpus-space unified
- Living Receipts: Bushel 32B compound-lift row added to Stack Ledger

### Session Boundary Note
- BP023 was initially mis-detected as BP024 (pre-Coffee-fix confusion)
- Founder confirmed: "No, it is BP022" (at prior session) -- Coffee is the authority
- BP023 is the correct name per Coffee at that point

---

## Eblet Written
`canon_bp023_session_ingest_receipt_bp078_backfill` (stub — pearl to be emitted follow-on)

---

_Ingest performed by SEG-BV (Sonnet 4.6) per BP078 Founder directive. Truth-Always: BP023 = thin session, 335 lines, Bushel 32B/C follow-on + MCP server coordination. Codex dual-serial-space sync debt closed._
