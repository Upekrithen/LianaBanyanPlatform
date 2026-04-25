# K505 — Substrate Savings Calibration Plan (Phase E.2)

**Created:** 2026-04-25 · K505 · B124
**Status:** ACTIVE — multipliers provisional until first calibration run

---

## Current Provisional Multipliers

| Agent | Cold Multiplier | Basis | Source |
|---|---|---|---|
| BISHOP | 3.0× | R13 within-Anthropic 21.6× / cross-vendor 78× (conservative) | K499/R13 |
| KNIGHT | 2.5× | Founder observation B123: "Sonnet with substrate ≈ Opus without" | B123 Founder directive |
| PAWN   | 3.5× | Friction: 3+ "yes/that/do it" × avg input tokens + counterfactual | project_pawn_friction_secondary_cathedral_effect.md |
| ROOK   | 2.5× | Same as KNIGHT; no formal R-run equivalent yet | conservative default |

---

## Calibration Schedule

### 30-Day Calibration Runs (recurring)

**Trigger:** Every 30 days from first savings record, Bishop runs the analysis pass.

**Procedure:**

1. Call `substrate_savings_summary(window="30d")` to get empirical data.
2. Compute actual multiplier from 30-day data:
   ```
   empirical_multiplier = total_counterfactual_cost / total_actual_cost
   ```
   (Note: this is the multiplier the savings model is claiming. Compare against what
   we'd measure if we ran a cold session of the same task.)
3. If empirical multiplier differs from provisional by > 20%, update the defaults in:
   - `librarian-mcp/src/server.ts` → `COLD_MULTIPLIERS` constant
   - `librarian-mcp/scripts/knight_session_savings.py` → `COLD_MULTIPLIER`
   - `librarian-mcp/scripts/pawn_session_savings.py` → `COLD_MULTIPLIER`
4. Set `multiplier_provisional: false` in saved records going forward (via a new
   `multiplier_version` field added to the record schema).
5. Log the calibration event as a Scribe R11 entry.

### Pawn Friction Calibration

**Trigger:** Every 30 days, if ≥ 5 Pawn records exist.

1. Compute average `friction_confirmations` across all Pawn records.
2. If average ≠ 3 (±1 tolerance):
   - Adjust `PAWN_FRICTION_CONFIRMATIONS_DEFAULT` in pawn script.
   - Update Pawn cold_multiplier: `pawn_mult = pawn_cold_mult + (avg_friction - 3) × friction_token_cost_multiplier`
3. Document change in this file with date and new value.

### Cross-Agent R-Run Calibration (quarterly)

**Trigger:** Quarterly (first B-session after 90 days from K505 landing).

Run a formal R-run comparing task quality and cost across:
- Cold Bishop session (flagship model, no substrate)
- Substrate Bishop session (same flagship model, Librarian injected)
- Same task set, same evaluation rubric as R13

This produces an empirical Bishop cold_multiplier that replaces the R13-derived 3.0×.
Equivalent runs for Knight and Pawn follow in subsequent R-sessions.

---

## Calibration Log (append below)

| Date | Agent | Previous Mult | New Mult | Reason | Signed |
|---|---|---|---|---|---|
| (first run TBD) | — | provisional | TBD | initial calibration | — |

---

## Calibration Fields Logged Per Session (Phase E.1)

Each `substrate_savings_log.jsonl` entry contains:

```json
{
  "substrate_injection_count": 4,
  "substrate_overhead_tokens": 12300,
  "friction_confirmations": 0,
  "multiplier_provisional": true
}
```

These fields accumulate to enable:
- Injection count → substrate context cost per session trend
- Overhead tokens → actual substrate cost as fraction of session cost
- Friction confirmations → Pawn cold_multiplier refinement
- Provisional flag → shows which records predate calibration

---

## Honest Math Commitment (per #41 good-name guardrail)

1. **Never inflate.** Cold multipliers are CONSERVATIVE. Empirical data may show higher
   savings — calibrate UP only when verified, never preemptively.
2. **Always subtract overhead.** Substrate isn't free. The overhead token cost is subtracted
   from savings before reporting net savings.
3. **Label provisional.** Until a calibration run confirms the multiplier, all records
   carry `multiplier_provisional: true` and dashboards show the provisional flag visibly.
4. **Member savings opt-in only.** K502 member dashboard exposes personal savings to
   the member only by default. Aggregate sharing requires explicit opt-in-share toggle.

---

*K505 Phase E.2 — Bishop B124, 2026-04-25. FOR THE KEEP.*
