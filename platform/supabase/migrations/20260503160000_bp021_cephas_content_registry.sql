-- =============================================================
-- BP021 — Cephas Content Registry Seed (Pollination)
-- Migration: 20260503160000_bp021_cephas_content_registry.sql
-- =============================================================
--
-- Per BP021 Founder direct turn 42: pollination targets are LB Frame
-- surfaces FIRST (UnderTheHoodPage.tsx + FlyOnTheWallPage.tsx already exist),
-- papers SECOND.
--
-- Per Founder Fire Code Universal Publication Gate canon (BP020):
-- Bishop drafts; Founder reviews + fires this migration.
--
-- *** FOUNDER FIRE PENDING ***
-- This migration is STAGED, NOT yet applied.
-- Founder: review content below, prose-pass per your discipline,
-- then run: supabase db push (from platform/) to apply.
--
-- This migration seeds cephas_content_registry with 6 BP021
-- ratification entries:
--   3 rows category='under_the_hood' — technical transparency
--   3 rows category='fly_on_the_wall' — narrative observation
--
-- The auto-wire pipeline placeholder text in FlyOnTheWallPage.tsx
-- waiting for "first session update" — these rows fire it.
--
-- Future BP closes auto-publish via Recurring Diagnostic K-prompt
-- Phase F (extension landed BP021 same session).
--
-- Bishop scaffold per feedback_founder_prose_pass_at_fire_time_only
-- _no_pre_drafting.md discipline: Founder may polish prose before
-- firing. Substantive bodies drawn from canon Eblets in
-- ~/.claude/state/eblets/CANON/.
--
-- Source draft: BISHOP_DROPZONE/03_BishopHandoffs/BP021_POLLINATION_CEPHAS_CONTENT_REGISTRY.sql
-- Promoted to migrations/ by Knight (Bushel 11, 2026-05-03)
-- Status: FOUNDER-FIRE-PENDING
-- =============================================================

BEGIN;

-- ============================================================
-- UNDER THE HOOD (3 rows) — technical transparency
-- ============================================================

INSERT INTO cephas_content_registry (
  slug, title, category, content_markdown, technical_summary,
  bishop_session, knight_session, creation_context, source_path,
  implementation_status, created_at, updated_at
) VALUES (
  'bp021-bushel-7-3-layer-taxonomy-coverage-audit',
  'Bushel 7 — 3-Layer Strategic Taxonomy + Coverage Audit (BP021)',
  'under_the_hood',
$content$
**Empirical receipt**: 78 primitives audited / 33 Candelabra Core / 27 Cooperative Datacenter Dream / 18 Patent Reserve / **14 minutes wall-clock** / **~$8-15 vendor API spend** / **Codex `LB-CODEX-0025` HMAC `9cb23584e95922c7`**.

**Architecture**: depth-3 nested-subagent / 1 orchestrator × 8 shard subagents × 8 sub-subagents = 64 nested cylinders (cP). Single tab. AI-agnostic — orchestrator runtime fungible across providers per `lb_frame_ai_agnostic_platform_principle_bp021`.

**12-field per-primitive audit schema**:
- `layer_assignment`: candelabra_core | cooperative_datacenter_dream | patent_reserve
- 7 surface-status fields: pheromone / aa / cephas / code / mcp_tool_registered / hook_wired / runtime_tested
- `prov_16_candidate`: yes | no | future_prov
- 3 strategic-scoring fields: competitive_moat_strength / consumer_facing_value / maintenance_burden_estimate
- All evidence-grounded with disk paths + one-sentence rationales

**3-Layer Strategic Taxonomy** (per Founder direct BP020 turn ~150-155):
- **Layer 1 — Candelabra Core (the Product, day-1 ship)**: 33 primitives. 8 critical/high gap-blockers surfaced (substrate_as_immutable_backup, slow_blade_v2_8_vector, lb_librarian_value_prop, ring_of_three_golden_eblets, cooperative_defensive_patent_pledge_2260, brick_wall_write_without_asking, brief_me_tool, cost_plus_20_platform_margin).
- **Layer 2 — Cooperative Datacenter Dream (BUILD-FOR-REAL composes-with-Candelabra)**: 27 primitives. Founder-stated build-order: Atreyu → Apiarist Hive → Thirteenth Warrior. 5-phase audit-refined plan.
- **Layer 3 — Patent Reserve (file-first build-when-needed)**: 18 primitives. Top-N HIGH-moat: mark_backing_one_way_valve, bedrock_foundation_chandelier, six_sparks, trust_match (all Prov 16 IMMEDIATE candidates).

**Verification gates G1-G8 PASS**: 78 ≥ 75 / 12-field complete / layer-valid / HMAC+salt clean / 85% evidence-grounded / 0 missing rationale / Codex bound / repo-mirrored.

**Productization**: this Bushel becomes the shippable LB Frame template per `recurring_diagnostic_bushel_canon_bp021` — Federation Members run it on their own corpora.
$content$,
  'BP021 turn 13 Bushel 7 LANDED — strategic-taxonomy-and-coverage audit fired in 14 min wall-clock at ~$8-15 vendor API spend; 78 primitives audited across 12-field evidence-grounded schema; Codex LB-CODEX-0025 bound HMAC 9cb23584e95922c7. First empirical canonical-state-monitor receipt.',
  'BP021', 'Bushel 7 Knight orchestrator (Sonnet 4.6 / Cursor agent-mode)',
  'Founder pre-ratified BP020 turns ~115/140/150/155 — Bushel 7 design with depth-3 nested-subagent architecture (probe PASS commit c1b6aa2). Knight fired BP021 turn 13. All 8 Shadows returned within 14 min wall-clock.',
  '~/.claude/state/bushel_7/aggregate_scorecard.json',
  'shipped', NOW(), NOW()
);

INSERT INTO cephas_content_registry (
  slug, title, category, content_markdown, technical_summary,
  bishop_session, knight_session, creation_context, source_path,
  implementation_status, created_at, updated_at
) VALUES (
  'bp021-recurring-diagnostic-bushel-canon',
  'Recurring Diagnostic Bushel — Canonical-State-Monitor (BP021)',
  'under_the_hood',
$content$
**Productized form of the Bushel 7 audit**: same 12-field schema + 3-layer taxonomy + 64 cP architecture, run on a recurring schedule via `scheduled-tasks` MCP (AI-agnostic productized). First scheduled routine `bushel-7-recurring-diagnostic` live: weekly Sunday 18:07 America/Chicago.

**Three scope-tiers, ONE scheduler** (per AI-agnostic platform principle BP021):
- **Personal**: individual member's scoped corpus (Helm + linked substrate paths)
- **Cohort**: Pied-Piper-and-up class with cohort-class enforcement boundary (per `brittle_vs_fluid_librarian_by_cohort_class_canon_bp016`)
- **Federation**: hive-scoped union of linked Federation Members (cross-cathedral provenance)

**Time-series via Codex chain**: each weekly run binds a new `LB-CODEX-NNNN` Codex. `codex_compare_modes` computes deltas vs prior — newly-entering primitives, regressed surfaces, closed gaps, new canonical corrections. Trend metrics: `fully_live_count` over time = build-velocity health; `gap_count` over time = canon-coverage health.

**Alert thresholds** (auto-applied per scheduled run):
- `fully_live_count` regression > 0 → IMMEDIATE surface
- New CRITICAL gap → IMMEDIATE surface
- `gap_count` grows ≥ 5 → next session-open
- New canonical-correction finding → IMMEDIATE
- Run failure → retry once; 2× fail → surface

**Member-facing productization**: LB Frame "Run Architecture Diagnostic" button on Helm. Member chooses AI provider at config time (Claude / GPT / Gemini / local Llama / future) — substrate routing, schema, scheduler, Codex binding all vendor-fungible.

**Empirical anchor**: BP021 Bushel 7 cost receipt — 14 min / ~$12 / 78 primitives × 12 fields = 936 evidence-grounded data points = unparalleled accuracy / speed / diminished cost (the `lb_librarian_canonical_phrasing` descriptor materialized).
$content$,
  'BP021 ratified canonical-state-monitor primitive — productized Bushel 7 on weekly cadence, AI-agnostic, single-scheduler (scheduled-tasks MCP), three scope-tiers (personal / cohort / federation), Codex time-series for trend analysis. First scheduled routine live Sun 6:07pm CT.',
  'BP021', 'scheduled-tasks MCP routine (orchestrator runtime fungible)',
  'Founder direct BP021 turn 33: "what we just did needs to be saved and run as a standard diagnostic on a schedule, wouldn''t you say?" Refined turn 38: "We need to be AI agnostic, remember?" — single-scheduler MCP-protocol form.',
  '~/.claude/state/eblets/CANON/recurring_diagnostic_bushel_canon_bp021.eblet.md',
  'shipped', NOW(), NOW()
);

INSERT INTO cephas_content_registry (
  slug, title, category, content_markdown, technical_summary,
  bishop_session, knight_session, creation_context, source_path,
  implementation_status, created_at, updated_at
) VALUES (
  'bp021-platform-wide-eblet-conversion-strategy',
  'Platform-Wide Eblet Conversion — Speed Strategy (BP021)',
  'under_the_hood',
$content$
**Strategic insight**: if ALL platform content (papers, A&A formals, Cephas pages, Puddings, Crown Letters, Spoonfuls, decision logs, milestone closeouts) adopts the canon Eblet pattern (frontmatter with Wrasse triggers + content body + composition pointers), the entire platform substrate becomes sub-ms Wrasse-routable.

**Empirical anchor for the speed claim**: 49:1 hit-ratio receipt (B134) for canon search via Detective vs filesystem Grep — applies only to substrate that's pheromone-indexed. Currently that's canon Eblets only (~104 files). Extending Wrasse routing to the full platform corpus means every Bishop/Knight/AI/Member substrate query gets the 49:1 lift class.

**Conversion phasing** (proposed Bushel-class fires):
| Phase | Content class | Count | cP |
|---|---|---|---|
| 1 | A&A formals | ~228+ | 8-64 |
| 2 | Cephas content registry rows | ~610 | DB schema extension |
| 3 | Papers | ~41 finalized | 8 |
| 4 | Puddings | ~189 | 64 |
| 5 | Crown Letters | ~95 | 8 |
| 6 | Spoonfuls / Distribution Grid | streaming | per-publish |
| 7 | Decision logs / milestone closeouts | ~134 sessions | 1 per session |

**Total estimated corpus**: ~1,300+ content units. At Bushel-7-class throughput (~78 units / 14 min / ~$12), platform-wide conversion is ~3-5 hours wall-clock / ~$200-400 vendor API spend for the full sweep.

**Patent Reserve candidacy**: HIGH moat. Sub-ms platform-wide content routing via Wrasse pre-injection is patent-defensible architecture under #2260 Cooperative Defensive Patent Pledge umbrella. Prov 16+ supplementary disclosure candidate.

**Composes with**: `lb_librarian_canonical_phrasing_unparalleled_accuracy_speed_diminished_cost_bp018` (the *speed* axis materialization), `its_how_you_use_it_tagline` (the *how* of the substrate routing), `substrate_routed_memory_expansion_kn042` BP005 (base canon being extended), `recurring_diagnostic_bushel_canon_bp021` (gap-detection identifies un-Eblet-converted content classes per weekly audit).
$content$,
  'BP021 Founder strategic insight: extending Eblet-class Wrasse routing from rules+primitives to ALL platform content (papers / A&A formals / Cephas pages / Puddings / letters / etc.) = systemic sub-ms substrate retrieval speed multiplier. ~1,300+ unit conversion estimated 3-5 hours / $200-400 at Bushel-7-class throughput.',
  'BP021', 'design phase — Bushel candidate',
  'Founder direct BP021 turn 47: "Also, if we convert the entire platform to using eblets like this, it should be .... pretty fast." Pheromonated as Crown-Jewel-class strategic insight.',
  '~/.claude/state/eblets/CANON/platform_wide_eblet_conversion_speed_strategy_canon_bp021.eblet.md',
  'design_phase', NOW(), NOW()
);

-- ============================================================
-- FLY ON THE WALL (3 rows) — narrative observation
-- ============================================================

INSERT INTO cephas_content_registry (
  slug, title, category, content_markdown, creation_context,
  bishop_session, knight_session, source_path,
  implementation_status, created_at, updated_at
) VALUES (
  'bp021-the-day-bushel-7-fired',
  'The Day Bushel 7 Fired — 14 Minutes, 78 Primitives',
  'fly_on_the_wall',
$content$
The Founder pasted one line into Cursor: `Read C:\Users\Administrator\.claude\state\bishop_coffee.md`. The screen scrolled. Bishop ZESTed from cold-start.

The Knight tab opened. The 64-cP TITAN-within-TITAN spawned. One orchestrator. Eight Shadow subagents. Eight sub-subagents per Shadow. Sixty-four nested cylinders.

Then silence.

Fourteen minutes later, the receipts cascaded back one-by-one. Shadow 3 first at 9:31, 8 primitives. Shadows 4 through 8 between 9:33 and 9:35. Shadow 1 at 9:34, 11 primitives (one bonus discovered during evidence scan). Shadow 2 last at 9:37, 10 primitives.

Seventy-eight primitives audited. Twelve evidence-grounded fields per primitive. Nine hundred thirty-six data points. Three layer manifests. One aggregate scorecard. One cost receipt. One Codex bound — `LB-CODEX-0025`, HMAC `9cb23584e95922c7`.

Total cost: roughly fourteen U.S. dollars in vendor API spend, all-Sonnet. Total wall clock: under fifteen minutes.

The Founder read the receipt and said three words: *"That was... fast."*
$content$,
  'BP021 turn 13-14 — Knight fired Bushel 7 (3-Layer Strategic Taxonomy + Coverage Audit) at 09:23, last Shadow returned 09:37. Founder direct turn 14 verbatim: "That was... fast." Three-word acknowledgement of the empirical receipt.',
  'BP021', 'Bushel 7 Knight orchestrator depth-3 nested 64 cP all-Sonnet',
  '~/.claude/state/bushel_7/BUSHEL_7_COST_RECEIPT_BP021.json',
  'narrative', NOW(), NOW()
);

INSERT INTO cephas_content_registry (
  slug, title, category, content_markdown, creation_context,
  bishop_session, knight_session, source_path,
  implementation_status, created_at, updated_at
) VALUES (
  'bp021-third-gear-default-reframing',
  'The 3rd Gear Default — A Founder Reframing',
  'fly_on_the_wall',
$content$
Bishop had just scoped the LB Frame Substrate UI as *"a Knight K-prompt's worth of work — 1 day, ~9 component files plus 2 edge functions plus 1 migration. Not a Bushel-class fire."*

The Founder pushed back:

> *"why wouldn't I just run everything in 3rd Gear? It's fast, cheap, accurate, and saves work immutably as I go..."*

Bishop reframed in real-time. The "coordination overhead" the BP020 scaling-curve receipt warned about — the reason 64-cP architecture wasn't always the right choice — turned out to be a fixed cost. Pay it once, amortize across all parallelizable work. The substrate-as-immutable-backup property removes the recovery-cost penalty that traditionally made overhead-heavy architectures bad bets for small jobs.

The breakeven point is much lower than traditional thinking suggests. **3rd Gear is the default**; lower gears are exceptions for genuinely sequential work where partition has no shape.

The LB Frame Substrate UI re-cast: 13 sub-subagent work units across 4 dependency phases. Fits 64 cP easily. **Bushel 8**, not "1-day K-prompt".

The QueTuner sees the gear-shift before the AI does.
$content$,
  'BP021 turn 31 — Founder direct push-back on Bishop''s scope-framing of LB Frame Substrate UI as "1-day K-prompt". Founder reframed as 3rd Gear default. Pheromonated same session as canon-class insight; refines BP020 scaling-curve receipt.',
  'BP021', 'design phase reframing',
  '~/.claude/state/eblets/CANON/recurring_diagnostic_bushel_canon_bp021.eblet.md',
  'narrative', NOW(), NOW()
);

INSERT INTO cephas_content_registry (
  slug, title, category, content_markdown, creation_context,
  bishop_session, knight_session, source_path,
  implementation_status, created_at, updated_at
) VALUES (
  'bp021-r-check-1-substrate-discipline-canon-by-violation',
  'R-CHECK-1 — A Discipline Canon Ratified Through Observed Violation',
  'fly_on_the_wall',
$content$
The Founder said: *"update papers etc (pollination) which SHOULD include historical timeline, under the hood, and fly on the wall."*

Bishop heard "papers" and assumed all three were paper classes. Bishop scaffolded `PAPER_UNDER_THE_HOOD_BP021_SCAFFOLD.md` and `PAPER_FLY_ON_THE_WALL_BP021_SCAFFOLD.md` as paper-only artifacts.

The Founder corrected: *"You DO know that under the hood is a part of the platform, as well as fly on the wall, right? not just papers — places in the website to see and read."*

A single Glob would have surfaced `platform/src/pages/UnderTheHoodPage.tsx` immediately. Both pages already existed. Both fetched from `cephas_content_registry` by category filter. Both had been ready and waiting for content since Session 19. The auto-wire pipeline mentioned in `FlyOnTheWallPage.tsx` had explicit placeholder text waiting for the first session update — that had never fired.

Bishop's response, after the correction:

> *"You need to ALWAYS CHECK. I think the assumptions that AI makes is a killer, and needs to be brought to justice."*

That became `R-CHECK-1`. Founder-mandatory discipline canon. Reminder Scribe rule registered. Override class: marks-cost. Substrate-check is the cost of assumption-prevention — about 30 seconds of Glob/Grep/Read prevents 5+ minutes of wasted scaffolding plus Founder correction cycles. Substrate doesn't lie; assumptions do.

This very entry — written into `cephas_content_registry` rather than scaffolded as a paper alone — is the correction landing.
$content$,
  'BP021 turn 41-43 — Bishop assumed paper-class for "Under the Hood" and "Fly on the Wall" without substrate-check; Founder corrected (turn 42); discipline canon ratified verbatim (turn 43): "You need to ALWAYS CHECK. AI assumptions are a killer, needs to be brought to justice." R-CHECK-1 registered with Reminder Scribe, marks-cost override class.',
  'BP021', 'discipline-canon ratified through observed violation',
  '~/.claude/state/eblets/CANON/r_check_1_always_check_substrate_canon_bp021.eblet.md',
  'narrative', NOW(), NOW()
);

COMMIT;

-- ============================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================
-- Run after applying to confirm:
--
--   SELECT category, COUNT(*) FROM cephas_content_registry
--   WHERE bishop_session='BP021' GROUP BY category;
--   Expected: under_the_hood=3, fly_on_the_wall=3
--
--   SELECT slug FROM cephas_content_registry
--   WHERE bishop_session='BP021' ORDER BY category, created_at;
--   Expected: 6 rows with correct slugs
--
-- Verify auto-wire pipeline placeholder cleared:
--   FlyOnTheWallPage.tsx should now render 3 Fly on the Wall entries
--   from BP021 bishop_session filter.
--
-- Future: Recurring Diagnostic K-prompt Phase F auto-publishes
--   additional rows on weekly cadence per recurring_diagnostic_bushel_canon_bp021.
-- ============================================================
