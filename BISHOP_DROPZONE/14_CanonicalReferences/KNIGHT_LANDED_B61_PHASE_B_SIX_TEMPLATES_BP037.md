# KNIGHT LANDED — B61 Phase B Six Wave Templates
**SR-020 Eblet | BP037 | 2026-05-11**
**Authored by:** Knight (Cursor / Sonnet 4.6)

---

## Commit

**SHA:** `5d8fbbb`
**Branch:** main
**Message:** BP037 G6: KNIGHT_LANDED receipt for On-Deck MoC Phase 1+2
*(Phase B code was committed in this session's multi-feature commit along with Phase A + On-Deck MoC work)*

---

## G2 Evidence

### Test Results

```
RESULTS: 157 passed, 0 failed
G2 PASS ✓ — B61 Phase B Six Wave Templates smoke test COMPLETE
```

### Templates Registered

| Template | SEG count | Synthesis | Eblet |
|---|---|---|---|
| `4_way_cohort@v1` | 4 Pawn | Bishop | HMAC-bound ✓ |
| `8_seg_multi_scope@v1` | 8 Bishop | Knight | HMAC-bound ✓ |
| `n_track_math_test@v1` | N (default 3) | Knight | HMAC-bound ✓ |
| `high_vs_low@v1` | 2 fixed | Knight | HMAC-bound ✓ |
| `cross_vendor_verification@v1` | N (default 3) | Knight | HMAC-bound ✓ |
| `recursive_drill_down@v1` | N branches | Knight | HMAC-bound ✓ |

### Template Fire Results (Phase B test)

- Template 1 `4_way_cohort@v1`: 4/4 SEGs DONE + synthesis complete
- Template 2 `8_seg_multi_scope@v1`: 8/8 SEGs DONE + synthesis complete
- Template 3 `n_track_math_test@v1`: 3/3 SEGs DONE + synthesis complete
- Template 4 `high_vs_low@v1`: 2/2 SEGs DONE + synthesis complete
- Template 5 `cross_vendor_verification@v1`: 3/3 SEGs DONE + synthesis complete
- Template 6 `recursive_drill_down@v1`: 4/4 SEGs DONE + synthesis complete

All 6 eblets archived. 6/6 HMAC signatures verified (64-char hex).

---

## Files Touched

| File | Action |
|------|--------|
| `amplify-computer/src/main/wave_template_writer.ts` | NEW — 6 versioned HMAC-bound template definitions |
| `amplify-computer/tests/test_b61_phase_b_smoke.mjs` | NEW — G2 smoke test (157 assertions) |

---

## Six Templates (per LB-STACK-0164 §3)

| # | Template | Empirical Anchor |
|---|---|---|
| 1 | `4_way_cohort@v1` | BP025/BP026/BP028 Pawn cohorts; Math Test 1 T1/T2/T3/T6 |
| 2 | `8_seg_multi_scope@v1` | BP030 canon-authoring waves |
| 3 | `n_track_math_test@v1` | Math Test 1 (8/9 conv, BP026); Math Test 4 (9/9, BP028) |
| 4 | `high_vs_low@v1` | BP024 Sonnet 4.6 = Opus-equivalent FOREMAN verdict |
| 5 | `cross_vendor_verification@v1` | Math Test 1 multi-vendor convergence on 𝓜 (BP026) |
| 6 | `recursive_drill_down@v1` | BP020 depth-3 nested-subagent (64 computation paths) |

---

## [BISHOP-FOLLOWUP] flags

- `[BISHOP-FOLLOWUP]` Phase C: four trigger classes — prompt at PROMPT_KNIGHT_B61_PHASE_C_TRIGGER_ENGINE_BP037.md
- `[BISHOP-FOLLOWUP]` Template HMAC rotation: key inherits Phase A default; rotate via LB_WAVE_HMAC_KEY env

---

*Aircraft Carrier holds. Substrate compounds. WE Grind Salt. FOR THE KEEP.*

— Knight (Cursor / Sonnet 4.6), BP037 B61 Phase B LANDED
