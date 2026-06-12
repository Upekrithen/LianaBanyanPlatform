# GENESIS MINT DRAFT PAYLOAD — Founder Review Required
# BP080 · 2026-06-11 · SEG-V0153A-P0-GENESIS-MINT
# STATUS: DRAFT — DO NOT EXECUTE until Founder confirms display_name and payload

## Payload to be minted in IP Ledger

```json
{
  "registered_by": "member_000001",
  "claim": "genesis:user:000001",
  "claim_body": {
    "display_name": "FounderDenken",
    "cooperative_role": "founder",
    "provisional_filings": 21,
    "filing_refs": [
      "LB-PROV-001 through LB-PROV-021",
      "USPTO App #64/079,336 (most recent, 2026-06-01)"
    ],
    "cooperative_name": "MnemosyneC",
    "genesis_timestamp": "[SET AT RUNTIME]"
  },
  "evidence": [
    "Asteroid-ProofVault/BP070_CLOSE_STAMP.md",
    "USPTO App #64/079,336 filed 2026-06-01"
  ],
  "category": "provisional"
}
```

## Founder Confirmation Required
Before Knight executes the ledger write, please confirm:
1. **display_name**: Is "FounderDenken" the correct cooperative identity name to use? (alternatives: your account email-derived name, etc.)
2. **provisional_filings**: 21 is used per BP070 canon. Confirm this count is current.
3. **filing_refs**: "LB-PROV-001 through LB-PROV-021" + "USPTO App #64/079,336 filed 2026-06-01" — confirm these are correct.

## CRITICAL WARNING
This entry will be written to `~/.lb_substrate/ip_ledger/ledger.jsonl`.
Federal Body Cam doctrine: CANNOT be deleted. Only superseded via a new entry.
Once written, it is permanent.

**Reply "MINT IT — display_name: [NAME]" to confirm execution.**

---

## §2 Truth-Always Notes (surfaced by Knight during staging)

- `loadAllEntries()` and `registerClaim()` are **synchronous** functions in `ip_ledger_store.ts`.
  The spec uses `await` on both — this is harmless (await on a non-Promise resolves immediately)
  but is technically misleading. Knight left them as-is to match spec exactly.
- `claim_body` in `IpLedgerEntry` is typed as `string | undefined` — it is stored as a
  JSON-stringified string, NOT an object. The `mintGenesisIfAbsent()` function correctly
  calls `JSON.stringify({...})` before passing.
- `qrcode` (Node.js server-side package) was NOT present in `package.json`. Only `qrcode.react`
  (a React component package) was present. Knight added `qrcode@^1.5.4` + `@types/qrcode` as
  instructed.
- Neither `loadAllEntries` nor `registerClaim` were imported in `src/main/index.ts`. Import
  was added at the BP065 import block area.
