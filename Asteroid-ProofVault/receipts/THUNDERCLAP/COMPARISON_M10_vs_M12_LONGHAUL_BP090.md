# COMPARISON RECEIPT: M10 vs M12 LONGHAUL
# Trial 02-PREVIEW 42Q — Marathon 10 vs Marathon 12
**Filed:** 2026-06-22T05:00 UTC  
**By:** Knight (Claude Sonnet 4.5 · Cursor) · K-MARATHON-12 Block 5  
**Canon:** canon_fix_as_we_go_build_for_the_long_haul_bp053  
**Founder ratify:** 2026-06-21 ~21:30 Central  

---

## Run Identity

| Field | M10 | M12 LONGHAUL |
|-------|-----|--------------|
| Trial ID | TRIAL_02_PREVIEW_42Q | TRIAL_02_PREVIEW_42Q_LONGHAUL |
| Session | relay-2026-06-22T03-00-12 | relay-2026-06-22T04-23-41 (in progress) |
| Questions | 42 | 42 |
| Per-domain timeout | NOT ACTIVE (300s global) | ACTIVE (600/900/1500s by domain) |
| Escalation | NOT AVAILABLE | ACTIVE (Star Chamber, andon-threshold=15%) |
| Marathon | K-MARATHON-10 | K-MARATHON-12 |

---

## Overall Accuracy

| Metric | M10 | M12 (partial) |
|--------|-----|---------------|
| Correct | 25/42 | TBD (in progress) |
| **Accuracy** | **59.5%** | **TBD** |
| Contested | 0 | TBD |
| Escalation fired | N/A | Q01: 1+ (quorum shortfall) |
| Wall-clock per Q | ~143s avg | ~540s (Q01, includes escalation) |

**T3 gate status:** M12 42Q is running in background. Final accuracy comparison pending.

---

## Per-Domain Accuracy: M10 vs M12

| Domain | Category | Timeout M12 | M10 Accuracy | M12 Accuracy |
|--------|----------|-------------|-------------|--------------|
| biology | low | 600s | 3/3 = 100% | TBD |
| business | low | 600s | 1/3 = 33% | TBD |
| chemistry | medium | 900s | 3/3 = 100% | TBD |
| computer_science | medium | 900s | 3/3 = 100% | TBD |
| economics | low | 600s | 2/3 = 67% | TBD |
| engineering | medium | 900s | 3/3 = 100% | TBD |
| health | low | 600s | 2/3 = 67% | TBD |
| history | low | 600s | 2/3 = 67% | TBD |
| law | high | 1500s | 1/3 = 33% | TBD |
| math | high | 1500s | 1/3 = 33% | TBD |
| other | low | 600s | 2/3 = 67% | TBD |
| philosophy | high | 1500s | 1/3 = 33% | TBD |
| physics | high | 1500s | 1/3 = 33% | TBD |
| psychology | medium | 900s | 0/3 = 0% | TBD |
| **TOTAL** | | | **25/42 = 59.5%** | **TBD** |

**M10 diagnosis:** High-disagreement domains (law, math, philosophy, physics) all scored 1/3 = 33%.
Expected M12 improvement: longer timeouts + Star Chamber escalation should help these domains.

---

## Per-Peer Participation

### M10
| Peer | Answered | Correct | % |
|------|---------|---------|---|
| d0b47bd0 | 42 | 19 | 45.2% |
| 88cbf6bd | 42 | 20 | 47.6% |
| cb4ef450 | 37 | 15 | 40.5% |
| 49f3e597 | 42 | 22 | 52.4% |

### M12 (in progress)
| Peer | Q01 bio | Notes |
|------|---------|-------|
| d0b47bd0 | TIMEOUT (ESC:B✓) | Slow response Q01 — escalation covered |
| 88cbf6bd | TIMEOUT (ESC:B✓) | Slow response Q01 — escalation covered |
| cb4ef450 | B ✓ (primary) | Fast responder Q01 |
| 49f3e597 | TIMEOUT (ESC:B✓) | Slow response Q01 — escalation covered |

Note: Q01 slowness attributed to peers processing orphaned routes from killed first run attempt.
Expected to normalize from Q02 onward.

---

## M12 Architecture Improvements

| Feature | M10 | M12 |
|---------|-----|-----|
| Per-domain timeout | ✗ | ✓ 600/900/1500s by domain |
| Escalation (Star Chamber) | ✗ | ✓ fires at 80% of timeout, variance >15% |
| Quorum shortfall detection | ✗ | ✓ triggers escalation when <50% peers answered |
| Early-exit variance check | ✗ | ✓ unanimous answers exit immediately |
| Loop exit bug (pre-threshold) | N/A | FIXED (escalation-before-exit restructure) |

---

## Escalation Summary (M12 partial)

| Q# | Domain | Escalation | Source | Result |
|----|--------|-----------|--------|--------|
| Q01 | biology | FIRED (quorum shortfall: 1/4) | escalation_consensus | B ✓ |
| Q02+ | TBD | TBD | TBD | TBD |

---

## Smoke Test Escalation Verification (T2)

Prior to 42Q, Block 3 smoke test confirmed escalation architecture:

| Q# | Domain | Escalation | Trigger | Result |
|----|--------|-----------|---------|--------|
| Q01 | biology | NOT fired | Unanimous (0% variance) | B ✓ |
| Q02 | math | FIRED | 50% variance at 98s ≥ 96s (80% of 120s) | CONTESTED |
| Q03 | law | FIRED | Quorum shortfall (1/4 < 2) at 98s | D ✓ |

**T2 gate: PASSED** — escalation fires correctly on high-disagreement domains.

---

## Truth-Always Disclosures

1. **M10 ran all 42 questions** (not aborted at Q30 as initially characterized). M10 = complete 42Q baseline at 59.5%.
2. **M12 42Q is in progress** at time of this comparison receipt. Final M12 accuracy = TBD.
3. **Q01 biology slowness** due to peers processing orphaned routes from first M12 run attempt (killed at 390s). Not representative of steady-state performance.
4. **T3 gate** (M12 accuracy ≥ M10 baseline) cannot be evaluated until M12 completes.
5. This receipt will be updated when M12 42Q finalizes.

---

*Composed by Knight (Claude Sonnet 4.5 · Cursor) · K-MARATHON-12 Block 5 · BP090*  
*canon_fix_as_we_go_build_for_the_long_haul_bp053 · Founder ratify 2026-06-21 ~21:30 Central*
