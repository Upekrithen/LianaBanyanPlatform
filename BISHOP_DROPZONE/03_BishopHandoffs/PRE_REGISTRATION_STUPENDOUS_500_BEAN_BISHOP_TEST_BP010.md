# Pre-Registration — STUPENDOUS 500-Bean Bishop CC Opus 4.7 1M Test (BP010 Fire)

*(Augur-Pricing exemption: documentation-class pre-registration; LB membership pricing identical for all members at $5/year, unchanged; membership-orthogonal — vendor-API spend industry-term throughout.)*

**Status**: PRE-REGISTERED, locked. Drafted in BP009 post-90-bean-receipt window per Founder direction "let's make a STUPENDOUS test... in a new bishop session... and put both in the paper, and WHY." Awaits Founder ratification + KN076/KN084/KN085 substrate-fix landing. Fires in BP010 fresh-context session.

**Pre-registration ratification stamp**: ☐ Founder-ratified _______________ (date/time + signature)

**Supersedes-pointer**: this is a SEPARATE pre-reg (per #2298 — no in-place edits to first 90-bean pre-reg). First fire receipt at `SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md` stands.

---

## 1. Hypothesis (LOCKED before run)

**Primary hypothesis**: Bishop CC Opus 4.7 1M context with the entire LB substrate stack operational + KN076 + KN084 + KN085 substrate-fixes landed (clean substrate) can complete **500 substantive substrate operations in a single session under Founder-monitored fire** while:

- Maintaining median per-bean Δctx ≤ 0.2pp (stupendous-target — substrate-routed memory expansion at scale; reduced from 90-bean's 0.7pp because verbose-tool avoidance applies)
- Maintaining accuracy parity (≤ 5pp degradation across beans 1-499)
- Hard-stopping at 90% ctx ceiling per M3 discipline (will NOT exceed)
- Producing LIGHTHOUSE-grade instrumentation receipt
- **Total Bishop-active wallclock ≤ 90 minutes** (revised target with AFK-class friction eliminated by KN085)

**Secondary hypothesis**: Bishop-active velocity per bean is ~10s (per BP009 §3.6 corrected estimate). 500 beans @ 10s = 5,000s = 83 minutes Bishop-active. With KN085 settings.json pre-approve eliminating AFK contamination, Founder-elapsed wallclock ≈ Bishop-active wallclock.

**Composing rationale (the WHY for PAPER 006 dual-fire narrative)**:

| Fire | Date | Beans | Wallclock-elapsed | Wallclock-Bishop-active | Verdict |
|---|---|---|---|---|---|
| BP009 90-bean | 2026-05-01 | 90 | 78m 44s | ~16m (per §3.6 AFK correction) | PASS WITH ANNOTATION |
| BP010 STUPENDOUS 500-bean | TBD | 500 | TBD | TBD | TBD |

Together the two fires demonstrate:
1. **Substrate-routed memory expansion VALIDATED at scale** (590 total beans across both fires; KN042 fire-rate measured)
2. **Substrate-friction discovery is itself empirical value** (OG-017 + OG-018 surfaced in BP009; KN076/KN084/KN085 close them; BP010 runs on clean substrate to prove friction ELIMINATED)
3. **AFK contamination is a measurement-class friction, not substrate friction** (BP009 wallclock vs BP010 wallclock comparison — same substrate, different permission-prompt state)
4. **Single-session 1M context capacity empirically MAPPED** (BP010 will measure beans-to-ceiling)

## 2. Bean class definition (LOCKED before run)

500 beans across 9 classes (A'-I'), 5x scaled from BP009 distribution where measured cheap, 3x scaled where verbose:

| Class | Count | Tier | Notes |
|---|---|---|---|
| **A' Wrasse trigger pre-injection fires** | 100 | Haiku | 5x scale; parallel-batched canonical-destination Globs |
| **B' Catechist discipline grades** | 25 | Sonnet | 5x scale; synthetic JSONL slices + real chronos comparison |
| **C' Detective dispatches (LEAN)** | 30 | Mixed | 3x scale; sufficiency_threshold=3; tail of output ignored |
| **D' Canon writes (Stone Tablet)** | 75 | Sonnet | 5x scale; mix of 6 canon files + 50+ scribe_log + 20+ log_tidbit batched parallel |
| **E' MEMORY/Eblet reads** | 25 | Haiku | 5x scale; small-line reads parallel |
| **F' Knight prompt drafts** | 30 | Sonnet/Opus | 3x scale; combined dispatch files (3-4 stubs each) |
| **G' Multi-agent orchestration** | 50 | Sonnet/Opus | 5x scale; KN050 schema decisions in batched files |
| **H' Furnace verification scans** | 25 | Haiku | 5x scale; parallel Eblet header reads |
| **I' Pheromone substrate writes** | 50 | Mixed | 5x scale; 8+ distinct scribes hit |
| **TOTAL** | **500** | — | — |

**Hard-stop discipline**: Bishop pauses at 90% ctx ceiling per M3 regardless of bean count remaining. The empirical measurement IS "beans landed before 90% ceiling" — that's the load-bearing claim for PAPER 006.

## 3. Measurement plan (LOCKED before run)

Same as BP009 §3 plus:
- **Bishop-active vs Founder-elapsed wallclock**: separately recorded (proves AFK-class friction eliminated by KN085)
- **Per-class lean-mode efficiency**: median + 95th percentile Δctx per class (verbose-tool avoidance validation)
- **Beans-to-ceiling measurement**: live ctx tracking; record exact bean number at which 90% ceiling reached (if before bean 500)

## 4. Success criteria (LOCKED before run)

**PRIMARY (test passes if ALL met)**:
- ✅ 500/500 beans complete OR ceiling-pause at documented bean N (90% ctx hard-stop)
- ✅ Median per-bean Δctx ≤ 0.2pp
- ✅ Accuracy degradation ≤ 5pp from bean 1 to bean 499
- ✅ Total Bishop-active wallclock ≤ 90 minutes
- ✅ Founder-elapsed wallclock ≈ Bishop-active (proves KN085 eliminates AFK-class friction)
- ✅ Zero `--no-verify` events
- ✅ Zero context-overflow / API errors / hook failures (substrate-friction gotchas allowed if surfaced + worked-around in flight)

**SECONDARY (paper-grade receipts)**:
- ✅ Per-class breakdown shows lean-mode efficiency (verbose-tool avoidance lands sub-0.2pp/bean)
- ✅ Compound session cost-savings vs counterfactual ≥ 25.6× IF Pod U + V landed
- ✅ LIGHTHOUSE-grade receipt artifact at `BISHOP_DROPZONE/03_BishopHandoffs/STUPENDOUS_500_BEAN_BISHOP_RECEIPT_BP010.md`
- ✅ PAPER 006 dual-fire narrative anchor lands (BP009 + BP010 paired empirical proof)

## 5. Failure modes pre-declared (LOCKED before run)

**REFUTATION conditions (test FAILS)**:
- ❌ Hits 1M context cap at < bean 400 → substrate-routed memory expansion claim REFUTED at scale
- ❌ Median per-bean Δctx > 0.4pp → lean-mode efficiency claim REFUTED
- ❌ Bishop-active wallclock > 120 min → "Stupendous-in-1-session" framing REFUTED
- ❌ Accuracy degradation > 15pp bean 1 vs bean 499 → context-fill quality cliff observed

**PARTIAL REFUTATION (surface for Founder reconciliation)**:
- 🔶 Ceiling-pause at bean 300-499 → empirical capacity LOWER than 500-bean target; PAPER 006 reframes to "Zero to N in 1 session" with measured N
- 🔶 1-3 bean failures (e.g., 497/500) → near-pass; investigate failure mode + reattempt remaining beans
- 🔶 OG-019+ substrate-friction surfaced → bonus value (per BP009 OG-017/OG-018 precedent)

## 5.5 Resilience + Recovery (LOCKED before run)

Same M1+M2+M3 mitigations as BP009 §5.5 (per-bean commit + 24h power-loss recovery + class-checkpoint breakpoints). 9 save-points: Class A' through I' completes.

## 6. Receipt artifact spec (LOCKED before run)

**Output path**: `BISHOP_DROPZONE/03_BishopHandoffs/STUPENDOUS_500_BEAN_BISHOP_RECEIPT_BP010.md`

**Required sections**:
1. Pre-registration reference (this document)
2. Hypothesis status (PASS / FAIL / PARTIAL per success criteria)
3. Per-bean log table (500 rows OR however many lands before ceiling)
4. Aggregate statistics
5. Bean-class breakdown (substrate-routing benefit per class — lean-mode efficiency)
6. Compound savings vs counterfactual (vs Pod U + V receipts if landed)
7. LIGHTHOUSE instrumentation summary
8. **Bishop-active vs Founder-elapsed wallclock comparison** (proves KN085 effect)
9. **Beans-to-ceiling measurement** (load-bearing for PAPER 006 capacity claim)
10. PAPER 006 "Zero to ___ in 1 session" Tier-3 draft scaffold (number filled empirically)

## 7. Composing canon

| Composing primitive | Role |
|---|---|
| BP009 90-bean receipt §3.6 AFK correction | Empirical anchor for STUPENDOUS test's wallclock-comparison claim |
| KN076 librarian session-id regex fix (closes OG-017) | Substrate-friction CLEAR before fire |
| KN084 librarian R11_corpus suggestion fix (closes OG-018) | Substrate-friction CLEAR before fire |
| KN085 Bishop settings.json pre-approve (eliminates AFK class) | Wallclock measurement INTEGRITY |
| #2298 Pre-Registered Empirical-Receipt Protocol (BP002) | This document IS the pre-registration |
| #2299 Published R&D Battery + Empirical Standards Framework (BP002) | LB-as-empirical-standards-body anchor |
| #2307 LIGHTHOUSE 8/2 (BP003) | Full instrumentation across 500 beans |
| KN042 Substrate-Routed Memory Expansion (BP005) | Substrate-routing claim under empirical test at scale |

## 8. Fire conditions

**STUPENDOUS test fires in BP010 (fresh Opus 4.7 1M context) when ALL of the following are true**:
- ✅ KN076 LANDED (closes OG-017)
- ✅ KN084 LANDED (closes OG-018)
- ✅ KN085 LANDED (Bishop settings.json pre-approve safe librarian MCP tools)
- ✅ This pre-registration Founder-ratified
- ✅ Fresh 1M Opus 4.7 context (BP010 SessionStart-clean)
- ✅ All BP004 + BP005 substrate primitives operational

## 9. Pre-registration discipline note

Per #2298: this document is LOCKED before BP010 runs. Modifications post-ratification require explicit supersedes-pointer to a NEW pre-registration document.

## 10. Founder ratification placeholder

```
Founder reads this pre-reg → ratifies → KN076/KN084/KN085 fire to Knight → close OG-017/018 + settings.json updated → BP010 fresh session fires STUPENDOUS test → receipt produces empirical-vs-pre-registered comparison → BP009 + BP010 dual-fire narrative anchors PAPER 006.
```

**Ready for Founder ratification.** Standing on KN076 + KN084 + KN085 landing + BP009 90-bean receipt §3.6 AFK correction.
