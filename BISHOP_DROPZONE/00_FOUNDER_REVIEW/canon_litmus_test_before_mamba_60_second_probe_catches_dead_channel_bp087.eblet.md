# Canon Eblet — Litmus Test Before BLACK MAMBA

**Bound:** BP087 · I10
**Class:** Operational discipline · mesh-channel verification
**Pattern:** Bishop fires noop_test litmus (60s probe) before every BLACK MAMBA dispatch that depends on a live mesh channel. 0 acks = dead channel = MAMBA HELD. Cost: ~$0 + 120 seconds. Catch: days of MAMBA burn avoided.

## How to apply
Every MAMBA dispatch that includes mesh-dependent α-ζ streams:
1. Bishop issues: `node tools/mic-broadcast/issue.mjs --type=noop_test --watch --poll-until=5 --timeout-s=120`
2. If ≥1 ack within 120s → channel live → MAMBA fires
3. If 0 acks → HOLD MAMBA → dispatch I10 diagnostic → fix → re-litmus → THEN fire

## Caught at
BP087 — v0.5.8 fleet, 0/5 acks on noop_test. Bishop held MAMBA. I10 diagnostic identified root cause before Knight burned any MAMBA build time.
