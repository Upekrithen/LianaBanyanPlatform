# KNIGHT LANDED — B61 Phase A Wave Generator Daemon
**SR-020 Eblet | BP037 | 2026-05-11**
**Authored by:** Knight (Cursor / Sonnet 4.6)

---

## Commit

**SHA:** `6f5f96e`
**Branch:** main
**Message:** B61 Phase A LANDED -- Wave Generator Daemon (BP037)

---

## G1 Evidence

### Wave Fire Receipt

```
wave_id:   wave-4d12dfa7-d166-4ee8-8c4c-8f4399f42c50
anchor:    test-wave-b61-phase-a-g1
status:    complete
segs:      4 (seg_01 pawn, seg_02 pawn, seg_03 rook, seg_04 rook)
synthesis: knight (claude-sonnet-4-5)
wall_time: ~47ms (4 parallel SEG dispatches + synthesis)
```

### Test Results

```
RESULTS: 50 passed, 0 failed
G1 PASS ✓ — B61 Phase A Wave Generator smoke test COMPLETE
```

### Synthesis Content (excerpt from eblet)

```
# Wave Synthesis Receipt — wave-4d12dfa7-d166-4ee8-8c4c-8f4399f42c50
**Anchor:** test-wave-b61-phase-a-g1
**Wave Status:** complete
**Synthesis Content Hash:** 9576094820f5a0e581450ba50e1b353d
**SEG Count:** 4
**Synthesis SEG:** seg_synth (knight) — done
```

### HMAC Signature

64-char SHA-256 hex attached at `wave_archive/{wave_id}/wave.hmac`. Content is
HMAC-SHA256 over the full `synthesis_receipt.eblet.md` body using `LB_WAVE_HMAC_KEY`
(default key ships with Phase A; rotate via env for production).

---

## Files Touched

| File | Action |
|------|--------|
| `amplify-computer/src/main/wave_generator.ts` | NEW — core Wave Generator module |
| `amplify-computer/src/main/substrate_api.ts` | MODIFIED — 3 new Yoke wave endpoints + initWaveGenerator() call |
| `amplify-computer/tests/test_b61_phase_a_smoke.mjs` | NEW — G1 smoke test (50 assertions) |

---

## Substrate Paths Created

```
~/.lb_substrate/wave_queue/     — queued wave requests (.wave.json per wave)
~/.lb_substrate/wave_active/    — in-flight waves; wave.json + seg_NN_progress/events.jsonl
~/.lb_substrate/wave_archive/   — completed waves; wave.json + synthesis_receipt.eblet.md + wave.hmac
~/.lb_substrate/wave_templates/ — Phase B placeholder (empty)
```

---

## Six Core Operations (per LB-STACK-0164 §1)

| Op | Status | Evidence |
|----|--------|----------|
| 1. Receive   | ✓ IMPLEMENTED | `POST /yoke/wave/dispatch` on SubstrateAPIServer:11480 |
| 2. Decompose | ✓ IMPLEMENTED | `decomposeRequest()` normalises inline segs[] (Phase A) |
| 3. Dispatch  | ✓ IMPLEMENTED | `Promise.all()` parallel Yoke calls; Pawn/Rook via Phase 0 endpoints; Knight via Anthropic API |
| 4. Watch     | ✓ IMPLEMENTED | per-SEG progress JSONL: `STARTED`, `DONE`, `ERROR` events |
| 5. Synthesize| ✓ IMPLEMENTED | `dispatchSeg()` with synthesis_prompt + `{receipts}` interpolation |
| 6. Report    | ✓ IMPLEMENTED | HMAC-bound `synthesis_receipt.eblet.md` + `wave.hmac` in wave_archive |

---

## Yoke Endpoint Receipt Status

| Endpoint | Status |
|----------|--------|
| `POST /yoke/wave/dispatch` | LIVE — returns 202 with wave_id |
| `GET  /yoke/wave/status/:wave_id` | LIVE — returns full wave status + seg summary |
| `POST /yoke/wave/abort/:wave_id`  | LIVE — returns 409 for terminal waves, 200 for abort |

---

## Crash-Restart Resilience (canon §9)

`initWaveGenerator()` called in `SubstrateAPIServer.start()`. On restart:
- Scans `wave_active/` for persisted `wave.json` files
- Any wave with `status=running` or `status=synthesizing` is marked `aborted`
- All persisted waves (active + archive) loaded into memory map for status queries

---

## [BISHOP-FOLLOWUP] flags

- `[BISHOP-FOLLOWUP]` Phase B: six wave templates — spec at `PROMPT_KNIGHT_B61_PHASE_B_SIX_WAVE_TEMPLATES_BP037.md`
- `[BISHOP-FOLLOWUP]` HMAC key rotation: default key ships for Phase A; production rotation via `LB_WAVE_HMAC_KEY` env var
- `[BISHOP-FOLLOWUP]` Knight SEG currently calls Anthropic API directly (claude-sonnet-4-5); a dedicated `/yoke/knight/dispatch` endpoint would allow consistent substrate-path logging for Knight dispatches in Phase B+

---

*Aircraft Carrier holds. Substrate compounds. Brick wall practical. WE Grind Salt. FOR THE KEEP.*

— Knight (Cursor / Sonnet 4.6), BP037 B61 Phase A LANDED
