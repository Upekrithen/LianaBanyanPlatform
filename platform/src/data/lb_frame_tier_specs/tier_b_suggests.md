# Tier B — SUGGESTS
<!-- Canonical spec document — KN-H3 / BP017 Pod-H #3 of 5 -->
<!-- Source: lb_frame_resource_config_sovereignty_three_tier_user_choice_canon_bp017.eblet.md -->
<!-- Update tier_b_suggests_spec.ts in sync with this file. -->
<!-- Composes with KN-H1 (installer + UI) + KN-H2 (Tier A baseline) + KN102/KN103 (cohort-class + Pied Piper) + KN104 (Detective TEAM write-back) -->

## What Tier B means

Tier B is the recommended uplift. Run LB Frame on Claude Code Max (or equivalent
higher-tier plan) for documented better experience over Tier A.

**Tier B is recommended, not required.** Tier A users get the same warehouse-access;
Tier B uplifts the bag-size and velocity. Anyone can run any tier — barrier-of-entry
is not capital.

## Canonical spec properties

| Property | Spec | Source |
|---|---|---|
| Claude Code plan | Claude Code Max OR equivalent higher-tier (recommended, not required) | `tier_config_probe.ts` `plan_tier_advisory` |
| Token budget per message | 1M-context for Opus 4.7 (vs default for Tier A) | Composing with Bishop=Opus 4.7 1M discipline |
| Message rate limits | Recommended higher-limit floor for sustained Reckoning + Pod-scaffolding cadence | Empirical: Class 3-9 Reckoning sustained at SUGGESTS-tier per BP017 cascade |
| MCP server slots | 15–20 slots minimum (vs typical 5–10 default at Tier A) | LB Frame core + Cathedral + Pheromone + Detective TEAM + Apiarist Hive |
| Cohort-class | Pied Piper Tier 1+ recommended (separately advanceable; composes with Brittle/Fluid class per BP016) | Better experience composes with cohort-class advancement |
| Substrate | Pheromone **read + write** · Detective TEAM **full** · **Fluid** Cathedral fingerprint (event-driven via Cue Card recency gate) · opt-in Apiarist Hive | Composes with KN102+KN103 LANDED + KN104 PRE-COLOSSUS LANDED |
| Bag-of-Holding class | Bigger bag (Claude Code Max context-budget); event-driven warehouse-write at Pied Piper+ cohort | Compose with Bags of Holding canon |

## What's included over Tier A

- **Token budget uplift**: 1M context for Opus 4.7 (vs default for Tier A)
- **15–20 MCP slots minimum** (vs typical 5–10 default — room for full LB Frame core + Cathedral + Pheromone + Detective TEAM + Apiarist Hive)
- **Full Pheromone substrate (read + write)** — was read-only at Tier A; Tier B enables cooperative warehouse contribution
- **Detective TEAM full access** — was read-only at Tier A; Tier B enables substrate write-back loop (KN104)
- **Fluid Cathedral fingerprint via Cue Card 7-day recency gate** — was Brittle (cron-class) at Tier A; Tier B enables event-driven freshness (KN102/KN103)
- **Pied Piper Tier 1+ cohort-class recommended** — separately advanceable; composes with Fluid Cathedral fingerprint
- **Opt-in Apiarist Hive participation** — available at Tier B (Federation cohort-class required separately)

## Empirical uplift over Tier A

Retrieval HOT-rate is substrate-dependent, not plan-dependent — the same R10 cross-vendor
benchmark results apply at both Tier A and Tier B (89.3%–98.7% HOT-rate range, mean 86.2pp
lift over cold baseline). **Tier B does not degrade retrieval quality.** Tier B uplifts
**velocity** — how fast Reckoning and Pod-scaffolding run.

| Metric | Tier A baseline | Tier B SUGGESTS | Uplift source |
|---|---|---|---|
| HOT-rate (hard-retrieval) | 89.3%–98.7% (8 vendors) | ≥ Tier A (Fluid Cathedral may improve in fast-evolving domains) | R10 cross-vendor (K477+K481); substrate-dependent |
| Reckoning velocity | ~1× baseline | 2–3× Tier A (5-min cluster fan-out vs 15-min) | BP017 canon spec; architectural basis (higher token budget + message-rate limits) |
| Pod scaffolding rate | ~1 K-prompt per 60 min | ~1 K-prompt per 30 min sustained | BP017 canon spec; architectural basis |
| Cathedral Effect HOT-rate at Pied Piper+ | Brittle fingerprint (cron-refresh) | HOT 70–85% maintained between rebuilds (Fluid event-driven) | KN102/KN103 Cue Card recency gate |

Receipt pointer: `BISHOP_DROPZONE/14_CanonicalReferences/TIER_B_EMPIRICAL_UPLIFT_RECEIPT_BP017.json`

## What you cannot do at Tier B (without separate advancement)

- **Excalibur Class subscription** — requires Excalibur subscriber (KN105) — separately advanceable
- **Federation full-write to Project Gold** — requires Federation cohort-class — separately advanceable
- **Civilization-tier Codex / Reliquary write** — requires Thirteenth Warrior cohort — separately advanceable

## Plan-tier advisory

If you select Tier B but run a plan below Claude Code Max-equivalent, LB Frame still runs.
The plan-tier advisory is informational only — it does NOT block execution. You have full
sovereignty to pick any tier. Tier B is recommended because the bigger bag enables faster
Reckoning; a smaller bag still reaches the warehouse.

## Anti-extraction note

Tier B is recommended, not required. Tier A users get the same warehouse-access;
Tier B uplifts the bag-size. Anyone can run any tier. Barrier-of-entry is not capital.
The cooperative is non-extractive by structural form: this is a mechanical constraint,
not a marketing statement.

---

*KN-H3 / BP017 Pod-H #3 of 5. Canonical spec ratified by Founder. Update `tier_b_suggests_spec.ts` in sync.*
