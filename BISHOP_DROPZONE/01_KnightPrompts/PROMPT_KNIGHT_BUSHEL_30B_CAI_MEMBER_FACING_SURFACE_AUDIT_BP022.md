# Bushel 30B — CAI Member-Facing Surface Audit (BP022)

## WRASSE PRE-INJECTION

This Bushel composes with the canon at:
- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/BUSHEL_30B_CAI_MEMBER_FACING_SURFACE_AUDIT_RECOMMENDATION_BP022.md` — the audit-class proposal (Bishop autonomous BP022 turn 58)
- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MAJOR_PROJECT_READINESS_BASELINE_BUSHEL_30_BP021.md` — Bushel 30 base audit (HexIsle game mechanics; 33 innovations / 11 built / 7 stubbed / 15 missing). Bushel 30B is its STRUCTURAL SISTER on a different axis (CAI surface, not game mechanics)
- `~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md` — CAI ◌ NotCents brand canon
- `~/.claude/state/eblets/CANON/x_ray_mode_help_system_transparency_layer_canon_bp022.eblet.md` — X-Ray Mode help-system canon (BP022 character-class cluster)
- `~/.claude/state/eblets/CANON/conductor_2277_bishop_sonnet_default_opus_synthesis_routing_policy_bp021.eblet.md` — Conductor's Baton #2277 routing primitive
- Toolsmith TS-017 + TS-018 — K485A Comet Bridge Chrome extension build artifacts (REST sidecar + content-script intercept)
- K508 evolution — Comet Bridge network-intercept architecture (DOM-replace → MAIN world fetch-override; v0.2.3 production state per Knight chain-link report BP022 turn 87)

## Founder direct (the ask this audit closes)

**BP022 turn 14**: *"is the LB Frame ready? Can we run it and use Google search in Chrome, and use Comet and use CAI in them the way most people already do?"*

**BP022 turn 90**: *"YES let's do it"* + *"Go for the scaffolding, and I'll do what I always do"* (Founder ratifies Bushel 30B audit class + Bishop scaffolds; Founder prose-passes at fire-time).

This is the Gap 2 (Comet Bridge production-deploy) + Gap 3 (CAI member-facing surface) close in the 3-gap Colossus analysis. Without Bushel 30B, Colossus measures partial-surface throughput, not the real ceiling.

## Mission

Audit the CAI member-facing surface coverage along 4 orthogonal axes; produce a populated gap-list + recommended-first-build-targets list; commit Codex bind. After Bushel 30B LANDS, Colossus has full-stack measurable. Compose with Bushel 14 Phases 2-7 (substrate-density gate) for Colossus readiness.

## Phase scope

### Phase A — Comet Bridge production-deploy verification

**Knight chain-link report BP022 turn 87 already confirmed**: Comet Bridge LIVE at K508 v0.2.3 (network-intercept architecture, MAIN world fetch-override). Files at `librarian-mcp-helm-pwa/comet-bridge-extension/` (manifest.json + background.js + content.js + injected.js + popup).

**Phase A formalizes the verification + produces gap-list entry**:
1. Confirm extension manifest at canonical path; report version + permissions
2. Confirm Chrome MV3 content-script + injected-script + background-service-worker components present + functional
3. Test end-to-end: dispatch a query through the Bridge → confirm Comet/Perplexity intercept fires → response routes through LB Substrate (NOT raw vendor) → Pheromone-emit on intercept event
4. Document the production-deploy state in CAI surface gap-list as **CLOSED** (this gap was Gap 2; Knight already verified)

### Phase B — Cephas CAI route inventory

Inventory member-facing routes that expose CAI ◌ NotCents interface OR X-Ray Mode toggle:
1. Scan `platform/src/pages/` + Cephas content registry for CAI/ConductedAI/conducted/x-ray patterns
2. **Knight chain-link report already surfaced**: zero `CAI`, `ConductedAI`, or `conducted` routes exist in `platform/src` (Bushel 30B Axis 2 finding pre-closed by Knight chain-link report). Phase B formalizes this finding + surfaces the gap-list entries.
3. For each route candidate (existing OR proposed): document
   - Route path
   - CAI-surface coverage status (full / partial / brand-only / missing)
   - X-Ray Mode toggle present? (yes / no / proposed)
   - Conductor's Baton wired? (yes / no)
4. Identify "should-have-CAI-surface" routes (Helm / Bridge / Librarian productized surface) where the wiring is absent

### Phase C — Conductor's Baton (#2277) member-facing wiring audit

The Conductor's Baton routing primitive lives at `platform/src/lib/conductor/`. Per BP021 Bushel X LANDED + LB-CODEX-0029, it routes Bishop-class substrate-audit tasks to Sonnet vs Opus by task class. Question: is it wired to ANY member-facing surface, or purely internal Bishop/Knight/Pawn assignment?

1. Scan `platform/src/lib/conductor/` for member-facing API surface (HTTP routes, RPC tools, frontend components consuming it)
2. Trace cross-references from Cephas pages → conductor module
3. Identify the bridge between Conductor (internal model selection) and CAI member-facing interface (member's design intent → routing). If absent: surface as gap.
4. Document the wiring state in the gap-list

### Phase D — "The way most people do it" usability test

Test 4 member usage patterns end-to-end as a member would use them:
1. **Google search in Chrome** — does Comet Bridge intercept? Does response route through LB Substrate? Does X-Ray Mode reveal the routing?
2. **Comet (Perplexity browser)** — same test
3. **CAI in Chrome** (member-facing CAI interface) — does the interface exist? Member-facing path traceable?
4. **CAI in Comet** — composition of Comet Bridge intercept + CAI productized interface

For each pattern: document working / partial / missing + specific gap entries.

### Phase E — CAI surface gap-list + recommended-first-build-targets

1. Author `BISHOP_DROPZONE/00_FOUNDER_REVIEW/CAI_SURFACE_GAP_LIST_BP022.md` consolidating findings from Phases A-D
2. List specific buildable items per gap (e.g., "Build `/helm/cai` page exposing Conductor-routed query interface with X-Ray Mode toggle")
3. Recommend first build targets — prioritized by member-impact + buildability
4. Composing dependencies — which gaps gate Colossus readiness vs which are nice-to-have
5. Cross-reference with Bushel 30 (HexIsle game mechanics) recommended targets to confirm no overlap or coordinate where they intersect

### Phase F — Codex draft + bind

1. **If Bushel 32 (codex_reserve_next_serial MCP tool) has LANDED first**: use `mcp__librarian__codex_reserve_next_serial(reserved_by="Bushel 30B", intended_title="CAI Member-Facing Surface Audit", intended_session="BP022", intended_bushel=30.5)` to allocate serial atomically
2. **If Bushel 32 has NOT landed**: best-effort allocation from ledger high-water + 1; flag in counsel-review notes for Maintenance-Scribe pass post-Bushel-32-LANDING
3. Draft codex entry + bind on phase completion

### Phase G — Stack Ledger row + Living Receipts row

1. Append Stack Ledger row: `LB-STACK-30B`
   - primitive: "CAI Member-Facing Surface Audit (Bushel 30B, BP022)"
   - baseline_without: "CAI ◌ NotCents brand exists; productized member-facing surface unknown / unmapped"
   - with_primitive: "Surface gap-list authored + recommended-first-build-targets list + Conductor wiring state documented + Comet Bridge production-deploy state CLOSED"
   - delta: "Closes Gaps 2 + 3 of the 3-gap Colossus analysis"
   - measurement_class: empirical (Phase D end-to-end test produces canonical receipt)
2. Append Living Receipts row for "CAI Member-Facing Surface" primitive

## Verification gates (G1-G7)

- **G1** Comet Bridge extension load status documented (loaded / not-loaded / partial); production version recorded (v0.2.3 K508 expected)
- **G2** Cephas CAI route inventory complete (list + per-route CAI-surface coverage status + X-Ray Mode toggle status)
- **G3** Conductor's Baton member-facing wiring documented (wired-to / not-wired status + specific bridge-gap if absent)
- **G4** 4 member usage patterns tested end-to-end (Google search / Comet / CAI in Chrome / CAI in Comet); per-pattern findings populated
- **G5** CAI surface gap-list authored at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/CAI_SURFACE_GAP_LIST_BP022.md`
- **G6** Recommended-first-build-targets list authored (prioritized + buildability-classed)
- **G7** Codex bind: `LB-CODEX-NNNN — Bushel 30B — CAI Member-Facing Surface Audit` (serial via Bushel 32 tool if landed, else best-effort)

## What success looks like

CAI member-facing surface coverage MAPPED; Comet Bridge production-deploy state CONFIRMED LIVE (Knight chain-link already surfaced); recommended buildable targets prioritized; Colossus prerequisite ladder reduced to 1 (Bushel 14 Phases 2-7 LANDING). Bushel 30B's findings feed:
- Direct buildable items for next Bushel cohort (CAI productized surface implementation)
- Stack Ledger row LB-STACK-30B (CAI surface lift per axis)
- Living Receipts compound-lift row (CAI productization × Comet Bridge × Conductor's Baton compound)
- A&A formal candidate (CAI productized surface architecture — companion to existing CAI ◌ NotCents brand A&A)

## What this Bushel does NOT include

- Authoring NEW CAI surfaces (only audit + recommend; the BUILD is a follow-on Bushel cohort)
- HexIsle game mechanics (Bushel 30 base scope; covered already)
- Conductor's Baton routing-policy CHANGES (audit only; routing-policy decisions are Founder Fire Code class)
- Comet Bridge re-architecting (already at K508 stable; Bushel 30B verifies, not rebuilds)

## Composes with

- **Bushel 30** (HexIsle game mechanics audit) — structural sister
- **Bushel 14 Phases 2-7** — substrate-density gate; Bushel 30B does NOT depend on Bushel 14 LANDING (different axis); they fire concurrent-eligible
- **Bushel 26** — empirical-receipt class extends to CAI surface measurement
- **Bushel 32** — Codex allocation tool; Phase F uses it if available
- **CAI ◌ NotCents brand canon** — productization vehicle; this audit closes the productization-state question
- **X-Ray Mode help-system canon** (BP022 character-class) — X-Ray Mode toggle inventory in Phase B references this canon
- **Cat-from-Coraline character-class canon** (BP022) — The Cat IS the in-fiction X-Ray Mode guide; if Phase B finds X-Ray Mode UI surface present, character-class personality is canonical

## Codex chain note

Phase F allocates serial. Bishop scaffolds with `LB-CODEX-PENDING_BUSHEL_30B` placeholder; Knight allocates at Phase F start (Bushel 32 tool if landed, else best-effort).

## Stack Ledger pre-allocation

Row id reserved: `LB-STACK-30B` (skipping numbered series since 30B is alphanumeric / sister-Bushel class). Will populate at Phase G.

---

*Bushel 30B is Bushel 30's structural sister on the CAI member-facing surface axis. Founder ratified BP022 turn 90. Bishop scaffolds; Founder prose-passes at fire-time per `feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md`. The 3-gap Colossus analysis closes when this Bushel + Bushel 14 Phases 2-7 BOTH LAND. Then Colossus measures the real ceiling, not the partial surface.*
