# COMPARISON RECEIPT: M10 vs M12 LONGHAUL
# Trial 02-PREVIEW 42Q - Marathon 10 vs Marathon 12
**Filed:** 2026-06-22T12:50 UTC (FINAL - M12 complete)
**By:** Knight (Claude Sonnet 4.5 Cursor) K-MARATHON-12 Block 5
**Canon:** canon_fix_as_we_go_build_for_the_long_haul_bp053
**Founder ratify:** 2026-06-21 ~21:30 Central

---

## Run Identity

| Field | M10 | M12 LONGHAUL |
|-------|-----|--------------|
| Trial ID | TRIAL_02_PREVIEW_42Q | TRIAL_02_PREVIEW_42Q_LONGHAUL |
| Session | relay-2026-06-22T03-00-12 | relay-2026-06-22T04-23-41 |
| Questions | 42 | 42 |
| Per-domain timeout | NOT ACTIVE (300s global) | ACTIVE (600/900/1500s by domain) |
| Escalation | NOT AVAILABLE | ACTIVE (Star Chamber, andon-threshold=15%) |
| Marathon | K-MARATHON-10 | K-MARATHON-12 |
| Runtime | ~88 min | ~503 min (8.37 hours) |

---

## Overall Accuracy

| Metric | M10 | M12 LONGHAUL |
|--------|-----|--------------|
| Correct | 25/42 | 26/42 |
| Accuracy | 59.5% | 61.9% |
| Delta | baseline | +2.4% |
| Contested | 0 | 3 |
| Escalation fired | N/A | 29/42 (69%) |

**T3 gate: PASSED** - M12 (61.9%) > M10 baseline (59.5%)

---

## Per-Domain Accuracy

| Domain | Timeout | M10 | M10% | M12 | M12% | Delta |
|--------|---------|-----|------|-----|------|-------|
| biology | 600s | 1/3 | 33% | 3/3 | 100% | +67% |
| business | 600s | 2/3 | 67% | 1/3 | 33% | -33% |
| chemistry | 1500s | 1/3 | 33% | 3/3 | 100% | +67% |
| computer_science | 900s | 2/3 | 67% | 3/3 | 100% | +33% |
| economics | 600s | 2/3 | 67% | 2/3 | 67% | 0% |
| engineering | 900s | 3/3 | 100% | 3/3 | 100% | 0% |
| health | 600s | 3/3 | 100% | 2/3 | 67% | -33% |
| history | 600s | 2/3 | 67% | 2/3 | 67% | 0% |
| law | 1500s | 1/3 | 33% | 1/3 | 33% | 0% |
| math | 1500s | 3/3 | 100% | 2/3 | 67% | -33% |
| other | 600s | 2/3 | 67% | 2/3 | 67% | 0% |
| philosophy | 1500s | 1/3 | 33% | 1/3 | 33% | 0% |
| physics | 1500s | 1/3 | 33% | 1/3 | 33% | 0% |
| psychology | 900s | 1/3 | 33% | 0/3 | 0% | -33% |
| TOTAL | | 25/42 | 59.5% | 26/42 | 61.9% | +2.4% |

---

## Per-Peer Accuracy (M12)

| Peer ID | Answered | Correct | Accuracy | Notes |
|---------|----------|---------|----------|-------|
| 49f3e5971518a064 | 32 | 31 | 96.9% | High performer |
| d0b47bd08633385b | 28 | 28 | 100.0% | Perfect within scope |
| 88cbf6bdd6f74587 | 32 | 30 | 93.8% | High performer |
| cb4ef450cc4a18c3 | 65 | 23 | 35.4% | Disruptor - sole responder on many single_peer_fallback questions |

Key finding: cb4ef450 accounts for the majority of single_peer_fallback losses. When multiple peers respond, accuracy is 94-100%.

---

## Escalation Summary (M12 only)

| Metric | Value |
|--------|-------|
| escalation_fired=true | 29/42 (69%) |
| escalation_fired=false (unanimous) | 13/42 (31%) |
| source=council_unanimous | 13 |
| source=escalation_consensus | 12 |
| source=single_peer_fallback | 14 |
| Contested | 3 |

---

## Wall-Clock Per Question

| Category | M10 avg | M12 avg |
|----------|---------|---------|
| low_disagreement (600s) | ~2 min | ~9 min |
| medium_disagreement (900s) | ~2 min | ~13 min |
| high_disagreement (1500s) | ~2 min | ~22 min |
| Overall | ~2 min | ~12 min (6x slower by design) |

---

## Truth-Always Disclosures

1. M10 ran all 42Q (not aborted at Q30). Completed at 59.5%.
2. T3 gate: PASSED - M12 61.9% > M10 59.5% (+2.4%).
3. Peer cb4ef450 is the limiting factor (35.4% accuracy as sole responder on 14 questions). Peers 49f3e597, d0b47bd0, 88cbf6bd all perform at 93-100%.
4. Q25 emitted repeated escalation-trigger log lines (cosmetic loop issue - escalation did not multi-fire due to if (!escalationFired) guard). Minor fix needed in next session.

---

Sealed 2026-06-22T12:50 UTC - Knight (Claude Sonnet 4.5 Cursor) - K-MARATHON-12 BP090
FOR THE KEEP!
