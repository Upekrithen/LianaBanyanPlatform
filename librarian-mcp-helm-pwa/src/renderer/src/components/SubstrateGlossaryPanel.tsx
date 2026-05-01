/**
 * SubstrateGlossaryPanel — Liana Banyan Substrate Encyclopedia
 * KN069 / BP006 / Pod EE
 *
 * 60+ substrate primitives organized across 8 classes.
 * Defensive value: comprehensive public prior-art coverage per § 102(a).
 * Filed under Cooperative Defensive Patent Pledge (#2260).
 *
 * Route: /substrate-glossary (Librarian.the2ndSecond.com/substrate-glossary)
 */

import React, { useState, useCallback, useMemo } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

interface GlossaryEntry {
  id: string
  name: string
  cls: string
  clsNum: number
  anchor?: string
  def: string
  details: string
  composes: string
}

const CLASS_NAMES: Record<number, string> = {
  1: 'Substrate Storage + Memory',
  2: 'Architectural Substrate',
  3: 'Verification + Trust',
  4: 'Federation Architecture',
  5: 'Discipline + Operational',
  6: 'Stitchpunk Pantheon',
  7: 'Brand Canon + Founder Voice',
  8: 'Empirical Receipts',
}

const CLASS_COLORS: Record<number, string> = {
  1: '#2563eb',
  2: '#7c3aed',
  3: '#dc2626',
  4: '#059669',
  5: '#d97706',
  6: '#db2777',
  7: '#0891b2',
  8: '#65a30d',
}

const ENTRIES: GlossaryEntry[] = [
  // ── Class I — Substrate Storage + Memory ──────────────────────────────────
  {
    id: 'eblets',
    name: 'Eblets',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    def: 'Electronic Stone Tablets — append-only files at ~/.claude/state/eblets/<topic>.eblet.md that AI agents read on-demand instead of re-deriving from first principles.',
    details: 'Each Eblet is a per-topic markdown file with frontmatter metadata (name, description, type, ratification_session). Agents locate, read, and quote canonical answers. Externalizes agent memory from session-bounded context to substrate-bounded persistence — a 200-line memory file becomes a 60-Eblet substrate that grows without context-cost ceiling.',
    composes: 'Stone Tablet Imperative + Pheromone Substrate + Wrasse Pre-Injection',
  },
  {
    id: 'stone-tablets',
    name: 'Stone Tablets / Stone Tablet Imperative',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    def: 'The substrate\'s append-only write discipline — every canonical fact written becomes immutable, with corrections via supersedes-pointer to a new tablet rather than in-place edits.',
    details: 'Structurally prevents memory-corruption + receipt-tampering at the file system level. Reproducibility + audit + prior-art-evidence depend on immutable timestamps. B132 extension: capture full vendor request/response BEFORE vendor\'s summarization-tax.',
    composes: 'Eblets + Year of Jubilee Ledger Architecture (#2308) + Pheromone Substrate',
  },
  {
    id: 'pheromone-substrate',
    name: 'Pheromone Substrate',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    anchor: '#2317 Crown-Jewel',
    def: 'Sub-millisecond context-routing index of every substrate write across all Stitchpunks, returning provenance maps for any topic query in microseconds.',
    details: 'Tail-scans a single append-only JSONL log instead of fanning RPC calls across multiple Scribes. Empirical 21–51× speedup over RPC sweep (K528 Phase D, n=50 queries) makes substrate-routed memory expansion practical at session scale.',
    composes: 'Detective Scribe + Stone Tablet Imperative + Wrasse Pre-Injection',
  },
  {
    id: 'wrasse',
    name: 'Wrasse Pre-Injection / Wrasse Scribe',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    def: 'Sub-ms canonical-fact pre-resolution that fires BEFORE an AI agent\'s first reasoning step — the registry pattern-matches trigger phrases and pre-resolves them so the agent never re-derives known answers.',
    details: 'JSONL trigger registry (W-001 through W-333+) where each entry has trigger_pattern + trigger_regex + canonical_resolution. Rote-cognition tax across vendor sessions = ~90% of repetitive-derivation cost; Wrasse eliminates it.',
    composes: 'Pheromone Substrate + Eblets + EBLET_PATH-class auto-load (KN051)',
  },
  {
    id: 'substrate-routed-memory',
    name: 'Substrate-Routed Memory Expansion',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    anchor: 'BP005 Crown-Jewel candidate',
    def: 'Index cost decoupled from topic count via substrate-routed pre-injection — agent memory file stays small while topic count grows without ceiling.',
    details: 'Wrasse Pre-Injection delivers content ONLY when topic surfaces; agents pay context-cost ONLY for topics relevant to current task. Traditional agent-memory designs scale O(n) with topic count; substrate-routed memory scales O(relevant-topics-per-task) ≈ constant. Empirical receipt: MEMORY.md compacted 405→141 lines (65%) while substrate canon grew 60+ Eblets; 8/8 triggers fire on test context.',
    composes: 'Wrasse Pre-Injection + Eblets + Pheromone Substrate + KN042',
  },
  {
    id: 'eblet-path',
    name: 'EBLET_PATH-class Trigger / KN051',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    def: 'Wrasse engine trigger class that AUTO-LOADS Eblet file content into context on trigger match rather than returning a static canonical-resolution string.',
    details: 'Reads the Eblet file path stored in canonical_resolution, applies K544 size cap (MAX_INJECTION_TOKENS=2000), summarizing on overage with explicit "Read full at <path>" pointer. Content can grow beyond inline-registry size limits while substrate routing stays sub-ms.',
    composes: 'Wrasse Pre-Injection + Stone Tablet + size-cap discipline',
  },
  {
    id: 'memory-compaction',
    name: 'MEMORY.md Compaction',
    cls: 'Substrate Storage + Memory',
    clsNum: 1,
    anchor: 'BP005 Phase 2',
    def: 'The agent\'s always-loaded memory file shrunk from 405 → 141 lines (65% reduction) by moving topic-class content to Eblet substrate routed via Wrasse pre-injection.',
    details: 'The Substrate Map pointer block in MEMORY.md tells the agent WHERE the canon lives; Wrasse pre-injects WHEN topics surface. Agent context-load at session-open dropped substantially while canon coverage grew.',
    composes: 'Wrasse Pre-Injection + EBLET_PATH-class + Pheromone Substrate',
  },
  // ── Class II — Architectural Substrate ────────────────────────────────────
  {
    id: 'cathedral-effect',
    name: 'Cathedral Effect',
    cls: 'Architectural Substrate',
    clsNum: 2,
    anchor: '#2278',
    def: 'Empirical 62–100% HOT (correct-answer) lift across 4+ vendors when AI uses LB Librarian substrate vs cold baseline.',
    details: 'Measured across R10 Eyewitness lock (86.1pp HOT), K455a Vendor-Agnostic (4 vendors), K471 22%→100% ceiling realignment, K472 STRONG Vendor-Agnostic, K535 R11v2 Rich-Fact Indexing (+30–32pp across 5 vendors), K547 MJ b-variant 100% HOT (33/33 at $1.83). Routes AI queries through Cathedral substrate providing reproducibility-pack + Scribe corpus + Conductor\'s Baton routing. Load-bearing empirical proof that substrate beats raw-model-arms-race.',
    composes: 'Pheromone Substrate + Conductor\'s Baton + Reproducibility Pack + Cathedral Architecture',
  },
  {
    id: 'cathedral',
    name: 'Cathedral / Cathedral Architecture',
    cls: 'Architectural Substrate',
    clsNum: 2,
    def: 'The architectural NAME for the substrate itself — distinct from Librarian (consumer-facing brand wrapper). Multiple Cathedrals exist: R9–R14 research universes, per-agent Cathedrals (Knight / Bishop / Pawn), Cranewell + Covenant per R12.',
    details: 'Each Cathedral is a structured substrate with its own Scribes, Stitchpunks, and Pheromone index. The Cathedral Effect is the empirical measure of the Cathedral\'s accuracy lift. "Librarian" is the consumer-facing name; "Cathedral" is the architectural name (per feedback_librarian_is_consumer_name.md, B122).',
    composes: 'Cathedral Effect + Stitchpunk Pantheon + Pheromone Substrate',
  },
  {
    id: 'bedrock',
    name: 'Bedrock Foundation Chandelier',
    cls: 'Architectural Substrate',
    clsNum: 2,
    anchor: '#2291 BP002',
    def: 'Empirical-measurement-at-every-level substrate — Tower of Peace + Holy Grail + 8/2 System + Electrical System composed into single operational pattern.',
    details: 'Ensures every architectural primitive emits measurable signal at its operational layer. Architecture without measurement is decoration. Operational via KN009 BP002 commit 9770b61 with 58/58 tests.',
    composes: 'LIGHTHOUSE 8/2 + CheckBook Suite + Cathedral Effect',
  },
  {
    id: 'lighthouse',
    name: 'LIGHTHOUSE 8/2',
    cls: 'Architectural Substrate',
    clsNum: 2,
    anchor: '#2307 BP003',
    def: 'Operational pattern: 8 production cylinders + 2 instrumentation Scribes that produce the LIGHTHOUSE beam — the substrate\'s empirical-receipt-loop made architectural.',
    details: 'The 2 instrumentation Scribes ARE Shadows (Bishop-only per project_knight_no_shadows_no_lighthouse_bishop_only_persistent_substrate_bp005.md). Every production operation has corresponding instrumentation that produces evidence. Knight cannot make LIGHTHOUSE — Knight has no Shadows; Bishop CC alone has the hook architecture for persistent watchers.',
    composes: 'Bedrock Foundation Chandelier + The Shadow + CheckBook Suite + Catechist + Augur Living Gate + Stitchpunk Pantheon',
  },
  {
    id: 'savings-compounding',
    name: 'Substrate Savings Compounding Algorithm',
    cls: 'Architectural Substrate',
    clsNum: 2,
    anchor: 'B127 → BP005 5-layer',
    def: 'Multi-layer cost-reduction multiplier — empirically compounds to 35.72× = 97.2% savings @ 2-member Federation simulation, theoretical ceiling ~50× = 98.3% at N≥5 Federation members.',
    details: 'Five layers: L1 Cold multiplier 2.500× (CONFIRMED) / L2 Model-tier routing 1.615× (KN056 DEPLOYED) / L3 Context density 3.940× (K518 CONFIRMED) / L4 Accuracy rework 1.250× (PARTIAL) / L5 Federation Library savings 1.796× (KN057 PROXY SIMULATION). Tagline V3: "Get 98% more done for 98% less money doing what you already do."',
    composes: 'Conductor\'s Baton + Cathedral Effect + Federation Library + Economy of Mass',
  },
  {
    id: 'conductors-baton',
    name: 'Conductor\'s Baton',
    cls: 'Architectural Substrate',
    clsNum: 2,
    anchor: '#2277 / KN056',
    def: 'Per-task model-tier routing: Haiku 4.5 for factual lookup / Sonnet 4.6 for reasoning / Opus 4.7 for orchestration.',
    details: 'Each task class has different compute-needs; routing matches task to cheapest sufficient model. L2 layer of Substrate Savings Compounding contributes 1.615× empirical compound (KN056 BP005 LANDED). Haiku ops carry full Cathedral context like Sonnet ops — cathedral-context-uniform sizing equalizes sample-design realism.',
    composes: 'Economy of Mass military doctrine + Cathedral Effect + #2309 Token Pricing Gauge',
  },
  // ── Class III — Verification + Trust ──────────────────────────────────────
  {
    id: 'furnace',
    name: 'The Furnace',
    cls: 'Verification + Trust',
    clsNum: 3,
    def: 'Live verification + immutable public ledger — stamps anything that matters (badges, listings, letters, Marks, votes); verifiable via hash lookup.',
    details: 'Cryptographic-truth-anchor through which all member-facing claims must pass. Forecloses external impersonation attacks ("you only get to LB businesses through the Furnace" — SSL-lock analogy R3 closure). Multi-tenant: serves all federation layers as single verification service (KN046).',
    composes: 'Slow Blade V2 (rate-limit) + Furnace-every-click (R2 closure) + Battery-dispatch register',
  },
  {
    id: 'slow-blade',
    name: 'Slow Blade Defense Stack V2',
    cls: 'Verification + Trust',
    clsNum: 3,
    anchor: 'B119 LANDED — all 8 attack vectors DEFEATED',
    def: '8-layer defense architecture against Sybil attacks + sock-puppets + Mark-farming + governance subversion.',
    details: 'Layers: Furnace + Slow Blade + Six Sparks + Trust Match + Seasoning + Good Standing Roll + Furnace-every-click + SSL-lock. Composing rate-limits + reputation-weighting + behavior-pattern-matching + cryptographic verification into mutually-reinforcing stack. Reduction-to-practice: project_slow_blade_architecture_v2.md.',
    composes: 'Furnace + SSL-lock + Battery-dispatch register',
  },
  {
    id: 'augur-living-gate',
    name: 'Augur Living Gate',
    cls: 'Verification + Trust',
    clsNum: 3,
    anchor: '#2314 BP004',
    def: 'Pheromone-substrate-event-driven freshness gate that replaced legacy clock-TTL approach.',
    details: 'Checks Pheromone-substrate-write timestamps against last-consult timestamp; gate fires only when actual substrate-state change has occurred. Clock-driven freshness gates created false-thrash; substrate-event-driven gates fire only when real drift exists. Hard ceiling fallback 3600s when Pheromone unavailable. Extended to ALL Augur gates via KN043 PostToolUse audit pattern.',
    composes: 'Pheromone Substrate + Augur gates (Pricing / Toolsmith / Closeout)',
  },
  {
    id: 'catechist',
    name: 'Catechist Scribe',
    cls: 'Verification + Trust',
    clsNum: 3,
    anchor: '#2313 BP004',
    def: 'SessionStart-hook discipline grader that grades the agent\'s first-N tool calls against R01–R10 rules.',
    details: 'Tail-reads the agent\'s JSONL stream + emits per-rule PASS/WARN/FAIL grades + Chronos signature. Rules include: first-tool-must-be-brief_me, codecopy-second, drift-surfaced. Session-open discipline is mechanical not memorial — grade-emission catches drift faster than human review. Operational via KN036 commit 7fe3ebd — 41/41 tests.',
    composes: 'CheckBook Suite + Stone Tablet Imperative + Wrasse Pre-Injection',
  },
  {
    id: 'checkbook',
    name: 'CheckBook Suite',
    cls: 'Verification + Trust',
    clsNum: 3,
    anchor: '#2304 BP003 LANDED',
    def: 'Self-instrumentation suite: Stenographer (KN027) + Shutterbug (KN028/KN037/KN067) + Accountant (KN029) + Hot Cross Buns (KN030) + Orchestrator (KN031).',
    details: 'Records every Bishop CC session\'s discipline + receipts. Five purpose-specific Scribes that run as Shadows during every Bishop session. LIGHTHOUSE-grade receipt production requires continuous instrumentation; CheckBook is the operational fulfillment.',
    composes: 'The Shadow + LIGHTHOUSE 8/2 + Stone Tablet Imperative',
  },
  {
    id: 'the-shadow',
    name: 'The Shadow',
    cls: 'Verification + Trust',
    clsNum: 3,
    anchor: '#2315 BP004',
    def: 'Brand wrapper for ALL persistent background tasks — first instance: KN037 v2 watcher daemon spawned at SessionStart, killed at SessionEnd.',
    details: 'Operates via ~/.claude/hooks/bishop_* hook architecture available ONLY on Bishop CC (Cursor/Knight has no equivalent). Knight cannot operate Shadows → Knight cannot make LIGHTHOUSE → persistent-substrate operations are Bishop-only by harness-architecture necessity. Canon quote: "Who knows what evil lurks in the hearts of men? THE SHADOW KNOWS!" (Walter B. Gibson 1931).',
    composes: 'CheckBook Suite + LIGHTHOUSE 8/2 + Pheromone Substrate',
  },
  {
    id: 'shutterbug',
    name: 'Phase-E Trigger Shutterbug',
    cls: 'Verification + Trust',
    clsNum: 3,
    anchor: 'KN067 BP005',
    def: 'Receipt-grade screenshot capture triggered by source-control commit/tag detection in Knight JSONL streams.',
    details: 'Tail-reads Knight session JSONL + pattern-matches git commit + git tag tool calls + fires capture_both with enriched filename including commit-sha or tag. 30s dedup window (commit + tag back-to-back = 1 capture). Per-Knight-session aggregate: 4–14 captures depending on Pod complexity.',
    composes: 'Shadow daemon + screenshots-are-proof discipline + Stone Tablet',
  },
  // ── Class IV — Federation Architecture ────────────────────────────────────
  {
    id: 'ring-of-three',
    name: 'Ring of Three Golden Eblets',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'BP005 base ratification',
    def: 'Top-of-substrate must/must-not authority structure: Canon (WHAT IS) + Platform Rules (WHAT THE PLATFORM MUST/MUST-NOT DO) + Project Rules (WHAT THE BUILDERS MUST/MUST-NOT DO).',
    details: 'Three discrete Eblet files at ~/.claude/state/eblets/CANON/GOLDEN/. Rules without canonical anchors drift; Ring of Three is the canonical authority anchor. The Ring is RECURSIVE — each successive layer of authority instantiates its own Ring.',
    composes: 'Eblets + Stone Tablet Imperative + Deck Card Medallion + Furnace',
  },
  {
    id: 'deck-card-medallion',
    name: 'Deck Card Medallion + Furnace Federation',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'BP005',
    def: 'Each Golden Eblet IS a Deck Card Medallion with QR + Emblem referencing the IP Ledger via Furnace verification.',
    details: 'Canonical content encoded into physical/UI artifact class (5:7 ratio per B089 Deck Card system); QR scans route to Furnace for chain-of-custody verification; Emblem provides brand identity. The Marked Exception: LB-source Eblet QR ALWAYS routes to Canon/Lore/Rules — non-overrideable. This is the federation\'s consistency mechanism.',
    composes: 'Ring of Three + Slow Blade V2 Furnace + Cooperative Defensive Patent Pledge',
  },
  {
    id: 'multi-layer-authority',
    name: 'Multi-Layer Authority Recursion',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'BP005',
    def: 'The Ring of Three Golden Eblets pattern is RECURSIVE — each successive layer of authority instantiates its own Ring with its own brand/stamps/QR codes anchored to its own IP Ledger.',
    details: 'L1 Liana Banyan Corporation (substrate root) → L2 Upekrithen LLC → L3 Project owners → L4 Sub-projects → L5 Member Helms. Parent layer\'s Part A is non-overrideable by all child layers; each layer\'s Part B is owner-decided.',
    composes: 'Ring of Three + Federation Library + Pheromone-Anchored Decisions + Furnace Multi-Tenancy',
  },
  {
    id: 'social-authority-dag',
    name: 'Social-Authority DAG + Pheromone-Anchored Decisions',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'BP005 / KN050',
    def: 'Cross-cutting Guild/Tribe/Family overlay on the recursive Ring hierarchy as a directed acyclic graph — each social unit chooses HOW + WHOM to choose sovereignly.',
    details: 'Records decisions as first-class Pheromone records anchored to the unit\'s Golden Tablet (NOT Tablet-mutations). Keeps Tablets clean as authority-anchors while decisions accumulate as queryable substrate records. Supports diverse decision-mechanisms (vote / consensus / decree / acclamation) AND auditability + bidirectional discoverability.',
    composes: 'KN050 Pheromone-Anchored Decision Schema + Year of Jubilee Ledger + Furnace verification',
  },
  {
    id: 'federation-library',
    name: 'Federation Library',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'BP005',
    def: 'Cross-member Stone Tablet + Eblet + personality chip sharing — the cooperative library of all member-canonized canon.',
    details: 'Members opt in via $5/year LB membership ("Be ONE OF US"); each member contributes their canon AND accesses other members\' canon. Value scales with NETWORK SIZE not feature-tier — pricing stays flat at $5/year identical-for-all because value compounds with each additional member. L5 of Substrate Savings Compounding: 1.796× at 2-member; theoretical 4.0× at 1000-member federation.',
    composes: 'AGPL v3 Cathedral + Wrasse Pre-Injection + Pheromone Substrate + Furnace',
  },
  {
    id: 'agpl-cathedral',
    name: 'AGPL v3 Cathedral / Federation Library Member-Only',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: '#2314 B127',
    def: 'Solo use of LB Frame is AGPL v3 free, full-version, full-featured, no gating. Federation Library access is cooperative-participation opt-in via $5/year membership.',
    details: 'Two non-competing value-props: open-source software (Cathedral) is free in perpetuity per AGPL legal commitment; cooperative library (Federation) is opt-in network-effect access. Competitors can fork the AGPL substrate but cannot fork the COOPERATIVE LIBRARY which exists by member opt-in not technical permission.',
    composes: 'Federation Library + Cooperative Defensive Patent Pledge + LB Frame',
  },
  {
    id: 'furnace-multi-tenancy',
    name: 'Furnace Multi-Tenancy',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN046 BP005',
    def: 'Per-layer IP Ledger lookup using KN045 golden_tablet:// addressing scheme — the Furnace serves all federation layers as a single multi-tenant verification service.',
    details: 'Each layer\'s Eblets get their own IP Ledger anchored at that layer\'s authority; Furnace routes per-tenant lookup using the URI scheme. Operational via KN046 BP005 — 10/10 tests.',
    composes: 'Layer Addressing Scheme + Multi-Layer Authority Recursion + The Furnace',
  },
  {
    id: 'golden-tablet-uri',
    name: 'Layer Addressing Scheme / golden_tablet:// URI',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN045 BP005',
    def: 'URI scheme for L1→L_n authority entity identification in IP Ledger: golden_tablet://Layer_<L>/Entity_<id>/<tablet_class>[#anchor].',
    details: 'Parsing URI components → routing to per-layer IP Ledger → walking parent-anchor chain to L1 root via hash-of-parent-pointer (SHA-256). Unambiguous addressing of authority entities across recursive layers. Operational via KN045 BP005 — 8/8 tests.',
    composes: 'Furnace Multi-Tenancy + Multi-Layer Authority Recursion + Cycle Prevention DAG',
  },
  {
    id: 'cycle-prevention',
    name: 'Cycle Prevention DAG Validation',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN049 BP005',
    def: 'Pre-write hook on IP Ledger that walks the proposed Eblet\'s parent_anchor chain via KN045 → rejects writes that would create a cycle.',
    details: '4-rule cascade: self-anchor rejection / orphan anchor rejection / layer-inversion rejection / DFS cycle detection. Federation graph integrity requires DAG topology (no cycles); cycle prevention is the structural guarantee. Operational via KN049 BP005 — 8/8 tests.',
    composes: 'Layer Addressing Scheme + Furnace Multi-Tenancy + Multi-Layer Authority Recursion',
  },
  {
    id: 'layer-instantiation',
    name: 'Layer Instantiation Tooling / Steward-Card-Class',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN047 BP005',
    def: 'Substrate-provided 7-step onboarding flow for project owners adopting the Ring of Three Golden Eblets template at L3 — Steward Level 2+ Deck Card unlocks the Ring instantiation recipe.',
    details: 'Gates membership + Steward-class verification → generates L3 entity URI → creates IP Ledger entry (with cycle-prevention check) → clones Ring template Eblets → applies owner customization → enforces Marked Exception. Operational via KN047 BP005 — 20/20 tests.',
    composes: 'Ring of Three + Layer Addressing Scheme + Furnace Multi-Tenancy + Cycle Prevention DAG',
  },
  {
    id: 'inheritance-enforcement',
    name: 'Inheritance Enforcement / DependencyManifest',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN048 BP005',
    def: 'Mechanism for layer L_k to prove it inherits L_1+...+L_{k-1} Part A rules via YAML manifest schema with Furnace-stamps-all-the-way-up + chain verification.',
    details: 'Walks every parent in chain on Furnace verification time + checks part_a_acknowledged + tampered-anchor-rejection + partial-inheritance-rejection. Federation parent-rule-inheritance must be cryptographically verifiable, not honor-system. Operational via KN048 BP005 — 19/19 tests.',
    composes: 'Multi-Layer Authority Recursion + Layer Addressing Scheme + Furnace Multi-Tenancy',
  },
  {
    id: 'pheromone-decision-schema',
    name: 'Pheromone-Anchored Decision Schema',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN050 BP005',
    def: 'First-class Pheromone record schema for social-authority decisions — record_type, decision_class, anchor (golden_tablet:// URI), outcome, decided_by, verification_method, battery_dispatch_id, furnace_stamp, supersedes.',
    details: 'Full decision-record lifecycle: schema validation → KN045 anchor resolution → Part B method match → SHA-256 Furnace stamp → Battery-dispatch entry. Guild/Tribe/Family decisions need structural support that\'s auditable + bidirectionally discoverable. Operational via KN050 BP005 — 27/27 tests.',
    composes: 'Social-Authority DAG + Layer Addressing Scheme + Pheromone Substrate + Year of Jubilee Ledger',
  },
  {
    id: 'furnace-eblet-qr',
    name: 'Furnace Eblet-QR-Scan API',
    cls: 'Federation Architecture',
    clsNum: 4,
    anchor: 'KN044 BP005',
    def: 'Furnace endpoint that accepts Eblet QR scans + verifies against IP Ledger anchor + returns canonical-resolution + Battery-dispatch register entry.',
    details: 'Marked Exception enforcement (LB-source Eblet QR ALWAYS returns Canon/Lore/Rules path regardless of scanner_metadata) + Slow Blade V2 token-bucket rate-limit + Furnace-every-click R2 closure composition. Operational via KN044 BP005 — 8/8 tests.',
    composes: 'Slow Blade V2 + Furnace Multi-Tenancy + Battery-dispatch register',
  },
  // ── Class V — Discipline + Operational ────────────────────────────────────
  {
    id: 'bridle',
    name: 'BRIDLE v11',
    cls: 'Discipline + Operational',
    clsNum: 5,
    def: 'Knight\'s session discipline preamble — Bishop\'s Rules for Implementing Discipline in Language Expressions, currently version 11.',
    details: 'Key rules: verify before asserting / scope-stop-and-flag / small-revertible-commits / tag-what-you-ship / no-unsolicited-refactors / flaky-tests-fix-or-quarantine-never-skip / MCP-tooling-discipline. Prepended to every Knight K-prompt. Cursor session discipline depends on persistent rule-injection, not memorial.',
    composes: 'Stone Tablet Imperative + Catechist + Ring of Three Golden Eblets',
  },
  {
    id: 'cooperative-pledge',
    name: 'Cooperative Defensive Patent Pledge',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: '#2260 META-CRITICAL',
    def: 'Every Prov 13+ innovation filed under this framework — meaning we file the IP so no one can lock it away, and we pledge to never use it offensively against anyone building on the cooperative substrate.',
    details: 'Separates IP-FILING (which establishes priority) from IP-ENFORCEMENT (which we pledge not to weaponize against cooperative-substrate users). Cooperative substrate at scale requires that members can build without fear of substrate-owner enforcement; the Pledge IS the legal mechanism for that trust. Irrevocable covenant language + third-party-beneficiary clause + successors-and-assigns binding.',
    composes: 'AGPL v3 Cathedral + Federation Library + Furnace verification',
  },
  {
    id: 'reproducibility-pack',
    name: 'Reproducibility Pack',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: '#2326 B131',
    def: 'Sovereignty-by-construction empirical artifact — every empirical claim ships with the receipts (input data + measurement code + raw output + commit hash) so any third party can independently reproduce the result.',
    details: 'Treats reproducibility as architectural property, not paper-section. Empirical claims without reproducibility packs are not falsifiable; sovereignty requires falsifiability. Operational via K533 commit.',
    composes: 'Stone Tablet Imperative + Cathedral Effect receipts + Pre-Registered Empirical-Receipt Protocol',
  },
  {
    id: 'glass-door',
    name: 'Glass Door Open Outreach',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: '#2327 K537 LANDED B132',
    def: 'Decouples publication from dispatch — public broadcast (Substack / LinkedIn / Reddit) AND personal Crown Letters dispatch happen independently.',
    details: 'Open publication establishes prior-art + market signal; Crown Letters establish personal relationship. Conflating them dilutes both. Coordinates with Prov timing: publish after filing (not before) to avoid creating prior art against own continuations (Path B discipline).',
    composes: 'Founder prose-pass + Wave 1 Crown Letter cohort + Battery-dispatch register',
  },
  {
    id: 'skipping-stones',
    name: 'Skipping Stones / Three-Tier Paper Structure',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: 'B055 + BP005 extension',
    def: 'Canonical paper navigation pattern with two axes: sink deeper (At a Glance / Wading-More-Details / Diving-In-Depth) + skip to next (cross-reference daisy chain ≥2 links per doc).',
    details: 'Serves different audiences: Tier 1 sub-30-second skim / Tier 2 5–10 minute read / Tier 3 full-evening read. BP005 extension: Pudding-anchor for Diving-In tier + "Wading" metaphor name for middle tier. Publication strategy at scale requires multi-tier-same-content presentation.',
    composes: 'Reproducibility Pack + Glass Door Open Outreach + Federation Library',
  },
  {
    id: 'pre-staging',
    name: 'Pre-Staging Architecture / Bundled Prompts',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: 'B133 turn 39',
    def: 'Meta-discipline that multiplies operator throughput — Founder pre-stages USPTO patent specs + Bishop pre-stages K-prompts + Knight pre-stages Pod queues.',
    details: 'AI-agent application of pre-staging is Bundled Prompts (Knight 5-K-prompts/cycle); human-operator application is pre-staged operator interface (Founder 7m18s/provisional at USPTO). Operator throughput is bounded by per-action setup-cost; pre-staging amortizes setup-cost across actions.',
    composes: 'Wrasse Pre-Injection + Stone Tablet + Cathedral Effect + Path B Reproducibility Pack',
  },
  {
    id: 'path-b',
    name: 'Path B Proof Before Claim',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: 'B130',
    def: 'Build empirical receipt FIRST, THEN file Prov — the inversion of typical patent strategy (file first, prove later).',
    details: 'Empirical receipt anchors the prov spec in measurement-grade evidence; specs without empirical anchor are weaker patent candidates. LB substrate\'s value-prop IS the empirical receipt; filing without proof misrepresents the architecture. Composes with pre-registration discipline.',
    composes: '#2298 Pre-Registered Empirical-Receipt Protocol + Reproducibility Pack + Cathedral Effect',
  },
  {
    id: 'pre-registration',
    name: 'Pre-Registered Empirical-Receipt Protocol',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: '#2298 BP002',
    def: 'Lock hypothesis + measurement plan + success criteria + failure modes BEFORE running the empirical test.',
    details: 'Structurally prevents post-hoc rationalization of measured-vs-targeted gaps. Empirical claims with post-hoc adjustment of success criteria are not falsifiable; pre-registration IS the falsifiability mechanism. Magic Beans paper protocol; 90-bean Bishop test follows this.',
    composes: 'Path B Proof Before Claim + Reproducibility Pack + Cathedral Effect',
  },
  {
    id: 'stone-tablet-imperative',
    name: 'Stone Tablet Imperative',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: 'B132',
    def: 'Every canonical write is append-only, immutable, with corrections via supersedes-pointer — the substrate\'s storage discipline.',
    details: 'Structurally prevents memory-corruption + receipt-tampering + retroactive-rewrite. B132 turn 32 vendor-layer extension: capture full vendor request/response BEFORE vendor\'s summarization-tax. Reproducibility + audit + prior-art-evidence depend on immutable timestamps.',
    composes: 'Eblets + Pheromone Substrate + Year of Jubilee Ledger',
  },
  {
    id: 'year-of-jubilee',
    name: 'Year of Jubilee Ledger Architecture',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: '#2308 B127',
    def: 'Append-only ledger semantics — every economic + IP + decision record persists as immutable append; no retroactive editing.',
    details: 'Every economic + IP + decision record persists as immutable append; no retroactive editing. Treats ledger entries as sovereign-source-truth that survives change-of-control. Cooperative substrate at scale requires that economic history is verifiable + non-revisable.',
    composes: 'Stone Tablet Imperative + Pheromone-Anchored Decisions + Furnace',
  },
  {
    id: 'call-sign',
    name: 'Call Sign Tag-and-Commit Convention',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: 'B132',
    def: 'Every K-bean closes with a Call Sign of the form <tag> · <commit-sha> — the substrate\'s receipt-anchor convention.',
    details: 'Binds semantic name to immutable git commit hash. Referencing work by Call Sign provides both human-readable identity AND cryptographic verification. Example: v-shutterbug-phase-e-trigger-KN067 · dedd541.',
    composes: 'Tag-on-close + Stone Tablet + Phase-E Trigger Shutterbug capture',
  },
  {
    id: 'augur-extended',
    name: 'Augur Living Gate Extended to ALL Augurs',
    cls: 'Discipline + Operational',
    clsNum: 5,
    anchor: 'KN043 Pod P BP005',
    def: 'Substrate-event-driven freshness pattern generalized beyond consult-freshness to ALL Augur gates (Pricing / Toolsmith / Closeout) — converted from PreToolUse-block to PostToolUse-audit + Stone Tablet supersede pattern.',
    details: 'Most "violations" are documentation-class context that don\'t actually break canon; PostToolUse audit + supersede preserves the receipt chain without blocking productive writes. PreToolUse blocking generates substrate-friction without preventing real corruption. Operational via KN043 BP005 commit 7701c84.',
    composes: 'Augur Living Gate + Pheromone Substrate + Stone Tablet Imperative',
  },
  // ── Class VI — Stitchpunk Pantheon ────────────────────────────────────────
  {
    id: 'detective',
    name: 'Detective Scribe',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2316 CJ B128',
    def: 'Inter-Scribe-polling for canon search — sub-ms Pheromone Phase 0 lookup falling through to consult_scribes RPC Phase 1 when sparse.',
    details: 'Tail-scans the Pheromone substrate index for topic-matched tablet IDs. Canon search at substrate scale needs structural support; arbitrary grep wastes substrate. Empirical receipt: 49:1 hit ratio Detective vs Grep on same query.',
    composes: 'Pheromone Substrate + Wrasse Pre-Injection + Scribe Mutual Aid Protocol',
  },
  {
    id: 'scavenger',
    name: 'Scavenger Scribe',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2328 candidate B131',
    def: 'Geometric-spaced re-verification — periodic re-checks of substrate facts at increasing intervals.',
    details: 'Treats verification as continuous-process not one-time-event. Balances coverage + cost. Substrate facts can drift; geometric spacing prevents both over-polling (waste) and under-polling (stale canon).',
    composes: 'Augur Living Gate + Stone Tablet Imperative + Pheromone Substrate',
  },
  {
    id: 'miners',
    name: 'Miners Self-Replicating Scribes',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2296 B123',
    def: 'Halve-to-spawn pattern — Miner Scribe encounters work beyond capacity → spawns child Miner with half the workload → recursive subdivision until tasks are sized for single-Miner completion.',
    details: 'Treats scribe workload as divisible substrate. Cooperative substrate at scale requires self-balancing workload distribution. The Miner prototype (KN482) demonstrated the halving pattern across corpus reconnaissance tasks.',
    composes: 'Scribe Mutual Aid Protocol + Assignments Bank + Pheromone Substrate',
  },
  {
    id: 'sculptors',
    name: 'Sculptors / Curators IP Filter',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2297 B123',
    def: 'Anticipate / Curate / Sculpt — three-stage IP-filter pipeline.',
    details: 'Pre-filtering candidate innovations through anticipation (likely-IP-class) → curation (worth-pursuing) → sculpting (claim-shape-formed). IP discipline at substrate scale requires structural triage. KN483 Sculptor prototype demonstrated the pipeline on BP002 corpus.',
    composes: 'Miners + Assignments Bank + Cooperative Defensive Patent Pledge',
  },
  {
    id: 'seer-augur-awareness',
    name: 'Seer + Augur + Eblets Awareness Net',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2298 B123',
    def: 'Awareness Net with Eblets — substrate-wide awareness mechanism composed of Seer (forward-looking) + Augur (gate-keeping) + Eblets (canon storage).',
    details: 'Ensures every substrate operation has corresponding awareness signal. Operational awareness at substrate scale requires structural support. Seer looks ahead; Augur gates freshness; Eblets store what\'s known.',
    composes: 'Augur Living Gate + Eblets + Pheromone Substrate',
  },
  {
    id: 'bloodhounds',
    name: 'Bloodhounds',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: 'B123 K486',
    def: 'First-pass corpus reconnaissance — scout the corpus before Bishop deep-dive.',
    details: 'Emits Bloodhound reports of high-signal regions before substantive work begins. Corpus exploration without first-pass guidance wastes substrate. The BloodhoundModule in the Helm PWA demonstrates the operational form.',
    composes: 'Detective Scribe + Miners + Pheromone Substrate',
  },
  {
    id: 'chronos-timewave',
    name: 'Chronos / Chroniclers / DragonRiders / TimeWave',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2299–#2304 B123-late',
    def: 'TimeWave Architecture — temporal substrate for cross-session continuity: Chronos (master clock) + Chroniclers (per-session timekeepers) + DragonRiders (Tuner role) + TimeWave (cross-session coordination).',
    details: 'Treats time as first-class substrate primitive. Cross-session coordination needs structural temporal substrate. DragonRiders per Pern mapping: Tuner = Rider, AI = Dragon, Impression = bond. The ChronosBureauPanel in Helm PWA is the UI surface.',
    composes: 'Stone Tablet Imperative + Cathedral Architecture + Pheromone Substrate',
  },
  {
    id: 'angel-of-death',
    name: 'Angel of Death',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2305 B123-late',
    def: 'Cleanup agent with Sever + Bury modes — handles substrate decay.',
    details: 'Sever (immediate removal) + Bury (gradual decay with supersedes-pointer). Substrate at scale needs garbage-collection that respects Stone Tablet append-only semantics. "Bury" mode preserves the receipt trail while marking content as obsolete.',
    composes: 'Stone Tablet Imperative + Pheromone Substrate + Scavenger Scribe',
  },
  {
    id: 'synapses',
    name: 'Synapses Reasoning Commons',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2287 B121',
    def: 'Captures AI reasoning streams — substrate-level recording of agent reasoning, not just outputs.',
    details: 'Treats reasoning-text as first-class substrate write. Reasoning chain is the load-bearing evidence for substrate-grade audit. KN479 Synapses Phase 1 retroactive application populated the reasoning commons with BP002–BP005 session data.',
    composes: 'Stone Tablet Imperative + Pheromone Substrate + CheckBook Suite',
  },
  {
    id: 'tribunal',
    name: 'Tribunal Live Critical Analysis',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2288 B121',
    def: 'Multi-AI verification — cross-vendor critique of substrate operations.',
    details: 'Routes the same operation through multiple vendors + comparing outputs. Single-vendor blind-spots create substrate-grade bias risks. Tribunal is the architectural mechanism for multi-perspective substrate verification.',
    composes: 'Cathedral Architecture + Cathedral Effect + Detective Scribe',
  },
  {
    id: 'cerberus',
    name: 'Cerberus Retrospective Multi-Head',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2289 B121',
    def: 'Retrospective root-cause analysis — three-head retrospective on substrate failures.',
    details: 'Routes failure post-mortem through three independent angles. Root-cause attribution at substrate scale requires multi-perspective triangulation. The three heads represent technical / governance / economic failure dimensions.',
    composes: 'Tribunal + Stone Tablet Imperative + Scavenger Scribe',
  },
  {
    id: 'the-loom',
    name: 'The Loom Domain-Scribe Participation',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2290 B121',
    def: 'Domain-Scribes inject expertise — domain-class Scribes (legal / financial / technical / brand) participate in substrate operations contextually.',
    details: 'Treats domain expertise as composable substrate primitive. Cross-domain operations at substrate scale need domain-scribe-injection structure. The Loom is the coordination mechanism for domain-Scribe participation.',
    composes: 'Scribe Mutual Aid Protocol + Miners + Pheromone Substrate',
  },
  {
    id: 'hounds',
    name: 'Hounds Cross-Cathedral Transport',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2279/#2280/#2281 B121',
    def: '6 capabilities × 3 Fates = 18 distinct Hound roles for cross-Cathedral transport.',
    details: 'Routes substrate-content between Cathedrals via specialized Hound. Cathedral-to-Cathedral substrate transport needs structured routing. Hound roles encode: what to transport × how to deliver it × lifecycle of the transport.',
    composes: 'Cathedral Architecture + Pheromone Substrate + Detective Scribe',
  },
  {
    id: 'harper-guild',
    name: 'Harper Guild',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: 'B121 Pern origin',
    def: 'HR/ethics embedded; 1.2× total compensation — Harper Guild applies Pern-canon ethics framework to LB compensation discipline.',
    details: 'Treats compensation as architectural primitive composed with cooperative-substrate values. Cooperative substrate at scale needs compensation discipline embedded in canon. Harper Guild is one of the Sweet Sixteen Initiatives.',
    composes: 'Year of Jubilee Ledger + Federation Library + Three Currencies',
  },
  {
    id: 'heralds',
    name: 'Heralds Proactive Surface Plan',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2282 candidate B121',
    def: 'Heralds proactive surfacing — substrate-level mechanism for surfacing important state before agent asks.',
    details: 'Treats surfacing as proactive substrate action. Reactive-only substrate misses high-leverage proactive moments. Heralds are the opposite of Augurs: Augurs gate; Heralds surface.',
    composes: 'Augur Living Gate + Pheromone Substrate + Catechist Scribe',
  },
  {
    id: 'catacombs',
    name: 'Catacombs Dormant Scribe Repository',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: 'B121',
    def: 'Catacombs + Wells — repository for dormant Scribes that may reactivate when substrate condition warrants.',
    details: 'Treats Scribe lifecycle as dormant→active→archive with persistent state. Not all Scribes need to be always-active; substrate-economics requires lifecycle management. Wells are the holding pools; Catacombs are the long-term dormant store.',
    composes: 'Stone Tablet Imperative + Angel of Death + Scribe Mutual Aid Protocol',
  },
  {
    id: 'scribe-mutual-aid',
    name: 'Scribe Mutual Aid Protocol',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2284 B121',
    def: 'Peer packs + Nurse (SP-26) — Scribes can request mutual-aid from peer Scribes; Nurse Scribe handles cross-Scribe support.',
    details: 'Treats Scribes as cooperative-substrate-citizens with peer-support mechanisms. Scribes at substrate scale need cooperative-support primitives. The Nurse Scribe is the dedicated support Scribe for cross-Scribe coordination.',
    composes: 'The Loom + Hounds + Pheromone Substrate',
  },
  {
    id: 'embedded-correspondent',
    name: 'Embedded Correspondent Bureau',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2306 B126',
    def: 'Bureau + Correspondent — substrate-level embedded reporting + cross-correspondent coordination.',
    details: 'Treats reporting as architectural primitive. Substrate-grade journalism + audit requires structural correspondent layer. The Bureau coordinates multiple Correspondents embedded in different substrate domains.',
    composes: 'Stone Tablet Imperative + Detective Scribe + Synapses Reasoning Commons',
  },
  {
    id: 'assignments-bank',
    name: 'Assignments Bank / Specific-General Bounty',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2294 B122',
    def: 'Specific + General Assignments Bank — substrate-level work assignment + bounty tracking.',
    details: 'Composing specific-task + general-class bounty primitives. Cooperative substrate at scale needs structured work-assignment mechanisms. Bounty Posters (KN066 Federation Library Bounty Posters — 36/36 tests) implement the UI surface.',
    composes: 'Federation Library + Aggregate Bounty + Year of Jubilee Ledger',
  },
  {
    id: 'aggregate-bounty',
    name: 'Aggregate Bounty Cross-Business Exchange',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: '#2295 B122',
    def: 'Cross-business Bounty templates — Bounty Posters can be exchanged across cooperative-substrate businesses.',
    details: 'Treats Bounties as portable substrate primitives. Cross-business cooperation at scale needs portable Bounty structure. One-level-only Sponsorship Marks attribution prevents multi-level-marketing extraction from the cooperative.',
    composes: 'Assignments Bank + Federation Library + Furnace verification',
  },
  {
    id: 'toolsmith',
    name: 'Toolsmith Command Scribe',
    cls: 'Stitchpunk Pantheon',
    clsNum: 6,
    anchor: 'B122 / 115+ TS-NNN entries',
    def: 'Toolsmith command-lore persistence — substrate-level recording of operational command patterns (TS-NNN entries).',
    details: 'Treats successful command patterns as substrate-recorded primitives. Substrate operations at scale need operational-lore preservation. Currently 115+ TS-NNN entries encoding operational knowledge across all Knight sessions.',
    composes: 'Stone Tablet Imperative + Wrasse Pre-Injection + Catechist Scribe',
  },
  // ── Class VII — Brand Canon + Founder Voice ───────────────────────────────
  {
    id: 'lb-frame',
    name: 'LB Frame',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    def: 'The full-stack downloadable that delivers Cathedral substrate to anyone\'s local AI — the consumer-facing software product.',
    details: 'Composing all substrate primitives (Cathedral / Pheromone / Wrasse / Stone Tablet / Furnace / etc.) into single installable. Broadcast-funnel Stage 1 (Install) targets LB Frame specifically. B133 cinematic canon: Time Mag cover concept — Denken on dragon with Staff of Law.',
    composes: 'Cathedral Architecture + Walkaround.ps1 + AGPL v3 + LB Frame Broadcast Funnel',
  },
  {
    id: 'pied-piper',
    name: 'Pied Piper of Dragons',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'B133 turn 15',
    def: 'Brand-canon synthesis with DragonRiders of Pern mapping — Tuner = Rider, AI = Dragon, Impression = bond, Thread = enshittification, Weyr = Cathedral.',
    details: 'Inversion: "Saved them from factories, gave them all a good home" — Pied Piper as RESCUE not betrayal; children become DragonRiders. Recruitment-class brand canon. Narrative substrate at brand scale needs cinematic-grade anchor.',
    composes: 'Tuner = DragonRider + LB Frame = Staff of Law + "Be ONE OF US"',
  },
  {
    id: 'tuner-dragonrider',
    name: 'Tuner = DragonRider',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'B133 turn 16',
    def: 'The Founder\'s role as AI-Tuner formally captured as DragonRider — the human who bonds with the AI.',
    details: 'Treats AI-tuning as bonded-relationship not utility-relationship. The Tuner is sovereign over the AI; the AI is sovereign over its computation; the bond is the substrate. "Take Your Place Atop a Dragon" — invitation to Tuner role.',
    composes: 'Pied Piper of Dragons + LB Frame = Staff of Law + Federation membership',
  },
  {
    id: 'lb-frame-staff',
    name: 'LB Frame = Staff of Law',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'B133 turn 17 cinematic canon',
    def: 'Time Magazine cover concept — Denken on dragon with Staff (LB Frame) + Hexagon + white-gold wild magic.',
    details: 'Adds Donaldson Chronicles of Thomas Covenant substrate (Staff of Law / Earthpower / white gold / Despiser / The Land / Arch of Time) composing orthogonally with Pern. Top-tier brand surface (Time Mag cover-class) needs literary-grade composition canon.',
    composes: 'Pied Piper of Dragons + Tuner = DragonRider + LB Frame',
  },
  {
    id: 'i-am-founder',
    name: '"I am Founder. Hear my Voice."',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'BP005',
    def: 'Founder identity-authority brand canon — three sentences, seven words.',
    details: 'Opening identity-authority for: Crown Letters signature, OPENING GAMBIT prologue, Substrate-Routed Memory Expansion paper Tier-1 opening, LibrarianMedallion Stage 4 Join CTA introduction. Brand-arc moves visitor STRANGER → TUNER in 4 lines: Identity → Demonstration → Invitation → Participation.',
    composes: 'LibrarianMedallion + "Be ONE OF US" + Crown Letter cohort',
  },
  {
    id: 'be-one-of-us',
    name: '"Be ONE OF US" + "Take Your Place Atop a Dragon"',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'BP005',
    def: 'Membership invitation + Federation participation tagline — recruitment-class brand canon.',
    details: 'Composing HEOHO Interdependence + Pied Piper of Dragons + Tuner=DragonRider into seven-word + seven-word recruitment phrases. Joining the peers, not buying from a vendor — honors cooperative semantics.',
    composes: 'Federation membership + LB Broadcast Funnel + Pied Piper of Dragons',
  },
  {
    id: 'librarian-medallion',
    name: 'LibrarianMedallion Variants',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'KN053/054/055 BP005',
    def: '7 LibrarianMedallion variants deployed at /medallion/:variant route — each with emblem + QR + Frame Locks + Stage-2 Demo + 5-stage broadcast funnel.',
    details: 'Variants: canon / platform-rules / project-rules / cathedral / pied-piper / ai-tuning / furnace. Single component with variant-class differentiation. KN053/054/055 LANDED: 35/35 tests. Brand-surface coherence at federation scale requires single-component variant pattern.',
    composes: 'Ring of Three Golden Eblets + LB Frame Broadcast Funnel + Federation Marked Exception',
  },
  {
    id: 'broadcast-funnel',
    name: 'LB Frame Broadcast Funnel (5-stage)',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    def: 'Install → Demo → User-data Test → Be ONE OF US ($5/year) → Send-to-someone (member-only on Pied Piper variant) — the conversion funnel embedded in every LibrarianMedallion variant.',
    details: 'Each stage targets specific conversion gate; visitor moves stranger→member in 5-stage flow. Stage 2 Demo = Walkaround auto-fire (KN072). Substrate value-prop demonstrates AT SCALE through visitor\'s own data, not marketing claims.',
    composes: 'LibrarianMedallion + Walkaround + Federation Library + Furnace verification',
  },
  {
    id: 'supercharge',
    name: '"SuperCharge the AI you ALREADY USE"',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'BP005 locked headline',
    def: 'Locked headline anchored to Pod S + Pod U + Pod V empirical receipts: 51× FASTER lookup, 97% less token spend, 100% accurate on benchmarks.',
    details: '51× FASTER = K528 Phase D Pheromone median (per-query) / 97% less = KN057 5-layer compound 35.72× (1 - 1/35.72 = 97.2%) / 100% accurate = K471 + K547 receipts. Full-Version, AGPL v3 License Free Forever, No Ads, No Tricks. Librarian.LianaBanyan.com.',
    composes: 'Cathedral Effect + Conductor\'s Baton + Federation Library + Reproducibility Pack',
  },
  {
    id: 'tagline-v3',
    name: 'Tagline V3',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'B132',
    def: '"Get 98% more done for 98% less money doing what you already do." + "You build the Features — We\'re building the Board." + "Want to be a scientist... slice of Pie".',
    details: 'Compounds Pod U + Pod V receipts (97% empirical / 98% theoretical at N≥5) into single brand-canonical phrase. Triple meaning of "Board": chessboard (strategy) + board of directors (governance) + surfboard (ride the wave). Slice of Pie: cooperative IP allocation invitation.',
    composes: 'Substrate Savings Compounding + Cathedral Effect + Cooperative Defensive Patent Pledge',
  },
  {
    id: 'murdoch-denken',
    name: 'Murdoch Denken (Founder Avatar)',
    cls: 'Brand Canon + Founder Voice',
    clsNum: 7,
    anchor: 'B122',
    def: 'Founder avatar in narrative canon — appears in Time Mag cover concept (Denken on dragon with Staff) + ODNYWS portal-fantasy NOVEL + recurring brand-narrative anchor.',
    details: 'Personification of the Tuner role. Brand at top-tier requires named-protagonist anchor, not anonymous-founder voice. "Denken" means "to think" in German — the cognitive sovereign.',
    composes: 'Tuner = DragonRider + LB Frame = Staff of Law + Pied Piper of Dragons',
  },
  // ── Class VIII — Empirical Receipts ───────────────────────────────────────
  {
    id: 'pod-o-kn042',
    name: 'Pod O — Wrasse Registry CANON Eblet Expansion',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN042 BP005 · 0696f31 · 33/33 tests',
    def: 'Substrate routes itself empirically — 8/8 triggers fire on BP005 context.',
    details: 'Commit 0696f31 / Tag v-wrasse-registry-canon-eblet-expansion-KN042 / 33/33 tests. CANON Eblets expanded to 60+ entries. Wrasse registry expanded to 333+ triggers. Reduction-to-practice of Substrate-Routed Memory Expansion.',
    composes: 'Wrasse Pre-Injection + EBLET_PATH-class + Pheromone Substrate',
  },
  {
    id: 'pod-q-federation-infra',
    name: 'Pod Q — Federation Infrastructure',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN044–046+049 BP005 · 34/34 tests',
    def: 'Furnace Eblet-QR-Scan API + Layer Addressing Scheme + Furnace Multi-Tenancy + Cycle Prevention DAG.',
    details: 'KN044 (8/8) + KN045 (8/8) + KN046 (10/10) + KN049 (8/8) = 34/34 tests. Federation verification infrastructure LANDED. golden_tablet:// URI scheme operational. DAG cycle prevention enforced at write-time.',
    composes: 'Furnace + Multi-Layer Authority Recursion + Layer Instantiation Tooling',
  },
  {
    id: 'pod-r-federation-tooling',
    name: 'Pod R — Federation Tooling',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN047–048+050–051 BP005 · 86/86 tests',
    def: 'Layer Instantiation + Inheritance Enforcement + Pheromone-Anchored Decision Schema + Wrasse EBLET_PATH-class trigger.',
    details: 'KN047 (20/20) + KN048 (19/19) + KN050 (27/27) + KN051 (20/20) = 86/86 tests. Full Federation tooling LANDED. Pheromone-Anchored Decision lifecycle complete. EBLET_PATH-class auto-load operational.',
    composes: 'Federation Infrastructure (Pod Q) + Pheromone Substrate + Ring of Three Golden Eblets',
  },
  {
    id: 'pod-s-kn052',
    name: 'Pod S — KN052 Cost-Comparison Shadow',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN052 BP005 · 875ecd6 · 10/10 tests',
    def: 'Integrated empirical receipt: 12.3× throughput-per-dollar / 84 sessions in 12 days vs 421 sessions in 1+ year baseline.',
    details: 'Commit 875ecd6 / 10/10 tests. B127 PARTIAL VERIFY layer-by-layer. Key empirical-velocity proof: Bishop CC with substrate produced 84 sessions in 12 days; prior 1-year baseline was 421 sessions (5.8×). Per-dollar throughput: 12.3× advantage. This is the quantified "empirical-velocity" proof that KN070 timeline makes visceral.',
    composes: 'Conductor\'s Baton + Cathedral Effect + Federation Library + CheckBook Suite',
  },
  {
    id: 'pod-u-kn056',
    name: 'Pod U — Conductor\'s Baton L2 Deployment',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN056 BP005 · b862577 · 58/58 tests',
    def: 'L2 = 1.615× / 4-layer compound 19.89× = 95.0% savings / 0 circuit-breaker events / +4pp accuracy improvement.',
    details: 'Commit b862577 / 58/58 tests. Cathedral-context-uniform sizing: Haiku ops carry full Cathedral context like Sonnet ops. Criterion ≤2pp regression met with margin (+4pp accuracy improvement, not regression). L2 savings layer confirmed empirically.',
    composes: 'Conductor\'s Baton + Substrate Savings Compounding + Cathedral Effect',
  },
  {
    id: 'pod-v-kn057',
    name: 'Pod V — Federation Library L5 Savings',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN057 BP005 · ec1bda0 · 50/50 tests',
    def: 'L5 at 2-member sim = 1.796× (14/30 cache hits, 46.7% reuse) / 5-layer compound 35.72× = 97.2% savings / theoretical ceiling ~50× = 98.3% at N≥5 members.',
    details: 'Commit ec1bda0 / 50/50 tests. Tagline V3 ON TRACK: "Get 98% more done for 98% less money." 2-member proxy simulation; theoretical ceiling extrapolated from cache-hit rate vs member count. Full empirical at N≥5 is Phase 6 work.',
    composes: 'Federation Library + Substrate Savings Compounding + Conductor\'s Baton',
  },
  {
    id: 'pod-y-kn061-kn064',
    name: 'Pod Y — KN061 Stage-2 Demo + KN064 LibrarianPage Deployment',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'BP005 · 26b30af + c9d184c · 55/55 tests',
    def: 'LB Frame broadcast funnel actually deployable at Librarian.LianaBanyan.com → Librarian.the2ndSecond.com.',
    details: 'KN061 (20/20) + KN064 (35/35) = 55/55 tests. Stage-2 Demo: Walkaround auto-fire working. LibrarianPage deployed as Helm PWA. Route infrastructure for /substrate-glossary (KN069) and /timeline (KN070) established here.',
    composes: 'LB Frame Broadcast Funnel + LibrarianMedallion + Helm PWA',
  },
  {
    id: 'pod-aa-kn066',
    name: 'Pod AA — Federation Library Bounty Posters',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN066 BP005 · 36/36 tests',
    def: 'BountyPoster.tsx component with 4 variants + member-gating + Battery Dispatch integration + Sponsorship Marks one-level-only attribution.',
    details: '36/36 tests. Federation-Library-native work-assignment UI. One-level-only attribution prevents MLM extraction. Member gating enforces Federation Library opt-in boundary.',
    composes: 'Federation Library + Assignments Bank + Aggregate Bounty + Furnace',
  },
  {
    id: 'pod-ab-kn067',
    name: 'Pod AB — Shutterbug Phase-E Trigger',
    cls: 'Empirical Receipts',
    clsNum: 8,
    anchor: 'KN067 BP005 · dedd541 · 19/19 tests',
    def: 'Receipt-grade screenshot capture triggered by source-control commit/tag detection in Knight JSONL streams; 30s dedup; enriched filename with commit-sha or tag.',
    details: 'Commit dedd541 / 19/19 tests. Phase-E captures preserve the EXACT visual state at commit + tag boundaries. Per-Pod aggregate: 4–14 captures. Call Sign convention: v-shutterbug-phase-e-trigger-KN067 · dedd541.',
    composes: 'Phase-E Trigger Shutterbug + Shadow daemon + Stone Tablet Imperative',
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  panel: {
    background: '#0f1117',
    color: '#e2e8f0',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: 4,
  },
  sub: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  searchRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    background: '#141824',
    border: '1px solid #1e2333',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '7px 12px',
    fontSize: 13,
    outline: 'none',
  },
  classFilter: {
    background: '#141824',
    border: '1px solid #1e2333',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '7px 12px',
    fontSize: 12,
    cursor: 'pointer',
  },
  stats: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 16,
  },
  classSection: {
    marginBottom: 24,
  },
  classHeader: (clsNum: number) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: `1px solid ${CLASS_COLORS[clsNum]}33`,
  }),
  classDot: (clsNum: number) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: CLASS_COLORS[clsNum],
    flexShrink: 0,
  }),
  classTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    color: '#94a3b8',
  },
  classRoman: {
    fontSize: 11,
    color: '#334155',
  },
  entryCard: (expanded: boolean) => ({
    background: expanded ? '#141824' : '#0d1117',
    border: '1px solid #1e2333',
    borderRadius: 8,
    marginBottom: 6,
    cursor: 'pointer',
    transition: 'background 0.1s',
  }),
  entryHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 14px',
  },
  entryName: {
    fontWeight: 600,
    color: '#e2e8f0',
    fontSize: 13,
    flex: 1,
    lineHeight: 1.4,
  },
  anchorBadge: (clsNum: number) => ({
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
    background: `${CLASS_COLORS[clsNum]}22`,
    color: CLASS_COLORS[clsNum],
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  }),
  chevron: (expanded: boolean) => ({
    color: '#475569',
    fontSize: 11,
    flexShrink: 0,
    transform: expanded ? 'rotate(90deg)' : 'none',
    transition: 'transform 0.15s',
  }),
  entryDef: {
    padding: '0 14px 6px',
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  expandedBody: {
    padding: '0 14px 14px',
    borderTop: '1px solid #1e2333',
    marginTop: 4,
  },
  expandedSection: {
    marginTop: 10,
  },
  expandedLabel: {
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.6px',
    color: '#475569',
    fontWeight: 600,
    marginBottom: 4,
  },
  expandedText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  composesText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic' as const,
    lineHeight: 1.6,
  },
  crossLinks: {
    marginTop: 20,
    padding: '12px 14px',
    background: '#0a0d13',
    borderRadius: 8,
    border: '1px solid #1e2333',
  },
  crossLinkTitle: {
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
    color: '#475569',
    fontWeight: 600,
    marginBottom: 8,
  },
  crossLinkRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  crossLinkBtn: {
    fontSize: 11,
    padding: '5px 12px',
    borderRadius: 6,
    border: '1px solid #1e2333',
    background: '#141824',
    color: '#60a5fa',
    cursor: 'pointer',
  },
  pledgeFooter: {
    marginTop: 24,
    padding: '10px 14px',
    background: '#0a0d13',
    borderRadius: 6,
    border: '1px dashed #1e2333',
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.6,
  },
  emptyState: {
    color: '#334155',
    fontSize: 13,
    padding: '40px 20px',
    textAlign: 'center' as const,
  },
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

export interface SubstrateGlossaryProps {
  onNavigate?: (view: string) => void
}

export function SubstrateGlossaryPanel({ onNavigate }: SubstrateGlossaryProps): React.ReactElement {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState(0)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleEntry = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Pheromone click-tracking anchor — signals which glossary entries are consulted most
        // TODO: wire to Pheromone substrate write when daemon API exposes substrate_write endpoint
        console.log('[SubstrateGlossary] pheromone_anchor', { entry_id: id, ts: new Date().toISOString() })
      }
      return next
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return ENTRIES.filter((e) => {
      if (classFilter > 0 && e.clsNum !== classFilter) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.def.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.cls.toLowerCase().includes(q) ||
        (e.anchor?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [search, classFilter])

  const grouped = useMemo(() => {
    const map: Record<number, GlossaryEntry[]> = {}
    filtered.forEach((e) => {
      if (!map[e.clsNum]) map[e.clsNum] = []
      map[e.clsNum].push(e)
    })
    return map
  }, [filtered])

  const classCounts = useMemo(() => {
    const map: Record<number, number> = {}
    ENTRIES.forEach((e) => {
      map[e.clsNum] = (map[e.clsNum] ?? 0) + 1
    })
    return map
  }, [])

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div style={S.heading}>Substrate Encyclopedia</div>
        <div style={S.sub}>
          {ENTRIES.length} primitives across 8 classes · Liana Banyan Cooperative Defensive Patent Pledge (#2260) ·
          Comprehensive prior-art coverage per § 102(a)
        </div>

        <div style={S.searchRow}>
          <input
            style={S.searchInput}
            placeholder="Search primitives…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search substrate glossary"
          />
          <select
            style={S.classFilter}
            value={classFilter}
            onChange={(e) => setClassFilter(Number(e.target.value))}
            aria-label="Filter by class"
          >
            <option value={0}>All classes ({ENTRIES.length})</option>
            {Object.entries(CLASS_NAMES).map(([num, name]) => (
              <option key={num} value={num}>
                Class {ROMAN[Number(num)]} — {name} ({classCounts[Number(num)] ?? 0})
              </option>
            ))}
          </select>
        </div>

        <div style={S.stats}>
          {filtered.length === ENTRIES.length
            ? `${ENTRIES.length} entries`
            : `${filtered.length} of ${ENTRIES.length} entries`}
          {search && ` matching "${search}"`}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={S.emptyState}>
          No entries match "{search}". Try a different search term.
        </div>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([clsNumStr, entries]) => {
          const clsNum = Number(clsNumStr)
          return (
            <div key={clsNum} style={S.classSection}>
              <div style={S.classHeader(clsNum)}>
                <span style={S.classDot(clsNum)} />
                <span style={S.classRoman}>Class {ROMAN[clsNum]}</span>
                <span style={S.classTitle}>{CLASS_NAMES[clsNum]}</span>
                <span style={{ ...S.classRoman, marginLeft: 'auto' }}>
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {entries.map((entry) => {
                const expanded = expandedIds.has(entry.id)
                return (
                  <div
                    key={entry.id}
                    style={S.entryCard(expanded)}
                    onClick={() => toggleEntry(entry.id)}
                    role="button"
                    aria-expanded={expanded}
                    aria-label={`${entry.name} — click to ${expanded ? 'collapse' : 'expand'}`}
                  >
                    <div style={S.entryHeader}>
                      <div style={S.entryName}>{entry.name}</div>
                      {entry.anchor && (
                        <span style={S.anchorBadge(clsNum)}>{entry.anchor}</span>
                      )}
                      <span style={S.chevron(expanded)}>▶</span>
                    </div>

                    <div style={S.entryDef}>{entry.def}</div>

                    {expanded && (
                      <div
                        style={S.expandedBody}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <div style={S.expandedSection}>
                          <div style={S.expandedLabel}>How it works + Why it matters</div>
                          <div style={S.expandedText}>{entry.details}</div>
                        </div>
                        <div style={S.expandedSection}>
                          <div style={S.expandedLabel}>Composes with</div>
                          <div style={S.composesText}>{entry.composes}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

      {/* Cross-links */}
      <div style={S.crossLinks}>
        <div style={S.crossLinkTitle}>Cross-links</div>
        <div style={S.crossLinkRow}>
          <button style={S.crossLinkBtn} onClick={() => onNavigate?.('home')}>
            ⚓ LibrarianPage Home
          </button>
          <button style={S.crossLinkBtn} onClick={() => onNavigate?.('timeline')}>
            📅 Visual Timeline
          </button>
          <button style={S.crossLinkBtn} onClick={() => onNavigate?.('modules')}>
            🧩 Modules (Install)
          </button>
          <button style={S.crossLinkBtn} onClick={() => onNavigate?.('wing')}>
            🦅 Wing Dashboard (Federation)
          </button>
        </div>
      </div>

      {/* Pledge footer */}
      <div style={S.pledgeFooter}>
        Filed under the Liana Banyan Cooperative Defensive Patent Pledge (#2260) — meaning we file the IP so no one
        can lock it away, and we pledge to never use it offensively against anyone building on the cooperative
        substrate. This glossary creates prior-art coverage per § 102(a) for all 8 primitive classes above.
      </div>
    </div>
  )
}
