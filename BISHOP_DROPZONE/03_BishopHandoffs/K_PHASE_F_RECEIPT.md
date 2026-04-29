# K-Phase-F-Substrate-Instrument — Empirical Receipt
## [PENDING EMPIRICAL PAIR RUN]

**Infrastructure landed:** K551/B133, 2026-04-29
**Call sign:** v-phase-f-substrate-instrument-K551

---

## Status: INFRASTRUCTURE LANDED — EMPIRICAL PAIR RUN REQUIRED

Phase F instrumentation infrastructure is deployed. The empirical pair run (baseline + wrasse-on sessions) is the next step.

### To run the Phase F empirical pair:

**1. Enable Phase F logging** in `librarian-mcp/config/wrasse.json`:
```json
{ "PHASE_F_LOGGING_ENABLED": true }
```

**2. Run baseline session** (new Knight session, wrasse injection DISABLED):
```powershell
# In a separate terminal, start the filesystem watcher:
cd librarian-mcp; python stitchpunks/wrasse/phase_f_fs_watcher.py --session=K<NNN> --wrasse=off
# Fire the RC alias-audit K-class task in a fresh Knight session
```

**3. Run wrasse-on session** (next Knight session, wrasse injection ENABLED):
```powershell
cd librarian-mcp; python stitchpunks/wrasse/phase_f_fs_watcher.py --session=K<NNN+1> --wrasse=on
# Fire the same RC alias-audit task with Wrasse pre-injection active
```

**4. Compute delta and generate closeout report:**
```powershell
cd librarian-mcp; python stitchpunks/wrasse/phase_f_substrate_instrument.py --mode=closeout-report --baseline=K<NNN> --wrasse-on=K<NNN+1>
```

---

## Phase E Gate (K545 proxy lower bound — already cleared)

| Metric | Value |
|---|---|
| K545 Phase E gate | CLEARED at 41.1% proxy lower bound |
| Phase F gate target | ≥40% net measured reduction (real session) |
| Phase F status | PENDING empirical pair run |

---

## Methodology Notes

- Instrumentation: Phase F γ (Bishop-side fs-watcher + MCP response logger)
- Baseline: same RC alias-audit task, wrasse injection disabled
- Wrasse-on: same task, wrasse pre-injection active
- Stone Tablets: all records in `session_ledger.jsonl` (Phase F extended records)
- Confound: fs-watcher captures all file access events in watched dirs — clean-session protocol required

*PUBLICATION GATE HARD — internal-only until Founder Phase E review + Prov 15 ratification*

*Filed: K-Phase-F-Substrate-Instrument / B133 / 2026-04-29 by Knight (infrastructure only)*
