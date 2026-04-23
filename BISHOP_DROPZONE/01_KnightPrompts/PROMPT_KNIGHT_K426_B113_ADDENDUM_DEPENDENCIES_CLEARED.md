# Knight K426 — B113 ADDENDUM: Dependencies Cleared, Dispatch Ready
## B113, April 22, 2026
## Supplements (does not supersede): `PROMPT_KNIGHT_K426_B111_STUB_RED_CARPET_HARDWARE_CLOUD_HYBRID.md`

---

## Why this addendum

The B111 stub's dispatch gate read:

> **Do NOT dispatch until:** K423 complete + Perplexity quota resolved OR 3-vendor partial run locked in OR Wave 2 Doctorow V04 sent.

All conditions are met. This addendum clears the gate so any future Knight session reading the stub doesn't re-pause.

---

## Dependency check — CLEARED as of B113, 2026-04-22

| Condition | Status |
|---|---|
| K423 complete | ✓ CLEARED — R10 Eyewitness Benchmark shipped, 8-model × 4-vendor × 1,200 calls, κ 0.883/0.850, HOT 94.8% / COLD 8.7%, mean lift 86.1pp |
| Perplexity quota resolved | ✓ CLEARED — K423 successfully ran Perplexity sonar (92.0% HOT) and sonar-pro (98.0% HOT). Quota was sufficient. |
| 3-vendor partial fallback | n/a — didn't need fallback; 4-vendor full run succeeded |
| Wave 2 Doctorow V04 sent | n/a — any single condition cleared is enough |

**Gate status: OPEN.** K426 is dispatchable now.

---

## Post-K425 adjustments to B111 stub

### Scoped API-key provisioning (Part A.2 step 4)

K425 Workstream A delivered `scripts/sync-sds-from-vault.py` and the canonical env-var namespace. Per-recipient scoped key provisioning should now use that architecture:

- Create recipient-specific entries in Supabase Vault with a naming prefix like `recipient_<name>_<vendor>_api_key` (e.g., `recipient_scholz_anthropic_api_key`)
- The machine's `.env` file gets regenerated from Vault via the K425 sync script with the recipient's scoped keys written as standard canonical names (`ANTHROPIC_API_KEY`, etc.) — the recipient never sees the Vault internal naming
- Per-key budget caps remain $20–$50 per vendor, $80–$200 total per recipient

### `librarian-mcp` install (Part A.2 step 3)

K424 shipped v0.2.0 with PyPI packaging. If PyPI publish has completed by K426 execution time, install via `pip install librarian-mcp`. If PyPI publish is still pending (Founder token/secret action), install via `pip install git+https://github.com/liana-banyan/librarian-mcp.git@v0.2.0` as the reliable fallback.

### Ubuntu variant — stay with Xubuntu 24.04 LTS recommendation

B111 stub's Xubuntu call stands. No change.

### Founder's Surface flash-drive issue (B113 observation)

Founder mentioned at B113 close: "I cannot get [the Ubuntu flash drive] to do what I want… It won't recognize from the normal surface windows environment." This is the second Surface (broken wifi under Windows) referenced in Part A of the B111 stub.

**Knight action:** include a diagnostic section in the Part A fresh-install documentation covering:
- Boot-order changes in Surface UEFI to recognize USB boot (Microsoft Surface devices often need Secure Boot disabled + USB priority set via the UEFI menu — hold Volume Down while powering on, or Shift+Restart → UEFI Firmware Settings)
- Verifying flash drive format (should be FAT32 for the ESP partition; Rufus with "DD mode" often more reliable for Surface than "ISO mode")
- What to do if wifi driver remains broken post-install (ethernet-only mode acceptable for ship-to-academic-with-ethernet; document as known-limitation)

---

## Timing recommendation

Dispatch Knight on **Part B (Cloud VM provisioning)** first — that's the fully Knight-owned scope. **Part A (physical machine prep)** depends on Founder finishing the Surface fresh-install locally; Knight can prepare documentation + the welcome-doc templates in parallel, ready to drop onto the machine once Founder's install completes.

Founder + Knight can work Part A + Part B concurrently. Target: first physical machine shipped to Scholz by the `WITNESS_PROGRAM_RECRUITMENT_B111` launch window (or shortly after).

---

*Addendum drafted B113, April 22, 2026. Bishop (Claude Opus 4.7, 1M context). Supplements K426 B111 stub; does not supersede. Gate is OPEN — proceed with execution.*
