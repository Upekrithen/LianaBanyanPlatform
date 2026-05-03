/**
 * Bushel 11 — Cluster K Tier-1 Trademark Batch Manifest
 *
 * Aggregates all Tier-1 (and select Tier-2/3) trademark candidates surfaced
 * across BP011→BP021 canon Eblets, the trademark filing queue, and Founder-direct
 * naming-acts. Designed for export to counsel session prep and USPTO filing pipeline.
 *
 * Canon sources:
 *   - orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md
 *   - cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md
 *   - architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md
 *   - mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
 *   - paper_a_considered_approach_to_universal_abundant_low_cost_energy_canon_bp021.eblet.md
 *   - founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
 *   - bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md
 *   - slow_blade_defense_stack_v2_master_canon_bp021.eblet.md
 *   - project_trademark_filing_queue.md (B103 + B130 additions)
 *
 * Authored BP022 by Knight (Cursor / Sonnet 4.6) — Bushel 11 session
 */

export type TierLevel = 1 | 2 | 3;

export type MarkType =
  | "word"
  | "design"
  | "composite"
  | "slogan"
  | "certification"
  | "service_mark"
  | "trade_dress";

export type MarkStructure = "standalone" | "composition" | "series_pattern";

export type CounselAction =
  | "file_immediate"
  | "search_then_file"
  | "counsel_review_required"
  | "sui_generis_distinguishing"
  | "defer_post_launch";

export interface ClusterKMark {
  /** Sequential reference number within Cluster K */
  id: number;
  /** The mark text exactly as it should appear in USPTO filing */
  markText: string;
  /** Short canonical name for internal use */
  canonicalName: string;
  /** Tier 1 = register-strategic (file now); 2 = build-phase; 3 = monitor */
  tier: TierLevel;
  /** Word mark, design mark, composite, slogan, etc. */
  markType: MarkType | MarkType[];
  /** standalone = one mark alone; composition = paired with another; series_pattern = title-class */
  structure: MarkStructure;
  /** Wrasse-routable source Eblet path or project memory file */
  canonicalSourceEblet: string;
  /** Which BP session the mark was first ratified */
  originSession: string;
  /** USPTO class(es) most likely to cover this mark */
  usptoClasses: number[];
  /** Pre-existing conflict notes — what the counsel search must address */
  preExistingConflictNotes: string;
  /** Whether biblical, literary, or pop-culture reference requires distinguishing argument */
  requiresDistinguishingArgument: boolean;
  /** Distinguishing strategy if required */
  distinguishingStrategy?: string;
  /** Recommended counsel action */
  recommendedCounselAction: CounselAction;
  /** Notes for Founder fire-time decisions */
  founderDecisionPoints: string;
}

// ============================================================
// CLUSTER K — COMPLETE MANIFEST (35 marks)
// ============================================================

export const CLUSTER_K_MANIFEST: ClusterKMark[] = [

  // ─────────────────────────────────────────────────────────
  // GROUP 1 — ORCHESTRA LIBRARIAN BRAND ARCHITECTURE
  // Canon: orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 1,
    markText: "ORCHESTRA LIBRARIAN",
    canonicalName: "orchestra_librarian",
    tier: 1,
    markType: "word",
    structure: "composition",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42],
    preExistingConflictNotes:
      "\"Librarian\" alone is generic; compound \"Orchestra Librarian\" is distinctive. Orchestra mark space is crowded in class 41 (music) but lightly occupied in class 42 (software/AI services). Preliminary search shows no direct hit on compound.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Confirm primary class filing: class 42 (AI/software platform services). Consider class 41 (educational/cultural) as secondary given Cephas content surface.",
  },

  {
    id: 2,
    markText: "CANDELABRA CORE",
    canonicalName: "candelabra_core",
    tier: 2,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Internal architecture term; less likely to be consumer-facing. Low conflict risk given technical-platform context. No prominent prior art found in class 42.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Decision: file as Tier-2 (internal + technical documentation protection) or defer to launch. Candelabra Core is explicitly internal; public face is Orchestra Librarian.",
  },

  {
    id: 3,
    markText: "IT'S HOW YOU USE IT",
    canonicalName: "its_how_you_use_it",
    tier: 1,
    markType: "slogan",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP018",
    usptoClasses: [42, 35],
    preExistingConflictNotes:
      "Phrase is broadly used colloquially; slogan marks face high distinctiveness bar. Counsel must argue acquired distinctiveness via consistent use in specific LB AI-platform context. No direct competitor use of this exact phrase in class 42 found, but search needed.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "Position as Intel-Inside-class slogan — a specific product-philosophy claim in AI-substrate context, not a generic statement. Evidence of consistent first-use in LB marketing context establishes acquired distinctiveness. File with specimen of use.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "File as standalone slogan-class mark OR as part of composite with Orchestra Librarian mark? Counsel should advise whether standalone slogan filing is worth pursuing given cost-vs-likelihood-of-approval tradeoff.",
  },

  {
    id: 4,
    markText: "YOUR SEAT AT THE GROWN-UP TABLE IS RESERVED",
    canonicalName: "grown_up_table_reserved",
    tier: 1,
    markType: "slogan",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 35],
    preExistingConflictNotes:
      "No known prior use in AI or cooperative-platform context. Distinctive tagline. Founder canonical phrasing — declarative peer-tier voice.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Deploy on Crown Letter letterhead and Cephas surfaces before filing OR file first? Rule: do not publicly deploy a mark until at minimum `searched` status per filing-queue canon.",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 2 — CAI ◌ NotCents COMPOSITE BRAND
  // Canon: cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 5,
    markText: "CAI",
    canonicalName: "cai_wordmark",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 9],
    preExistingConflictNotes:
      "\"CAI\" as acronym has broad existing use (China Association for Standardization, various software companies). Three-letter acronym marks are frequently challenged. Priority of use + specific AI-substrate-conducting context needed for class 42 distinctiveness argument.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File as class 42 (AI platform services) with specimen showing \"CAI\" used specifically to denote Conducted AI architecture. Bundle with CONDUCTED AI long-form for coverage. Canonical pronunciation documentation (\"Kay-Eye\") reinforces distinct identity from other CAI acronyms.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Three-letter acronym: file standalone CAI OR rely on composite CAI ◌ NotCents for primary protection? Counsel should advise risk-adjusted strategy given acronym crowding.",
  },

  {
    id: 6,
    markText: "CONDUCTED AI",
    canonicalName: "conducted_ai_longform",
    tier: 1,
    markType: "word",
    structure: "composition",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42],
    preExistingConflictNotes:
      "\"Conducted AI\" as a compound is distinctive and novel. No direct prior art found. \"AI\" alone is generic; the compound with \"Conducted\" creates specific category-naming claim.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File CONDUCTED AI as the primary long-form and CAI as the shortened form. Both should be in the same filing cluster for USPTO cost efficiency.",
  },

  {
    id: 7,
    markText: "CONDUCTED INTELLIGENCE",
    canonicalName: "conducted_intelligence",
    tier: 1,
    markType: "word",
    structure: "composition",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Alternate long-form of CAI. Novel compound. No known prior art in AI platform context. Provides broader coverage than CONDUCTED AI alone.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File alongside CONDUCTED AI in same class 42 cluster or defer as Tier-2 alternate?",
  },

  {
    id: 8,
    markText: "NOTCENTS",
    canonicalName: "notcents_word",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md",
    originSession: "B103",
    usptoClasses: [36, 42, 35],
    preExistingConflictNotes:
      "Pre-existing LB brand element; canonical glyph at platform/src/pages/Index.tsx + platform/src/lib/platformBlueprint.ts. In filing queue since B103. \"NotCents\" as a coined term is highly distinctive. No known trademark conflict. The cent-inversion concept is novel.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "file_immediate",
    founderDecisionPoints:
      "Already in trademark queue (B103). Elevate to immediate filing — mark has been in use on platform surfaces and needs registered protection before broader marketing launch.",
  },

  {
    id: 9,
    markText: "NOTCENTS DESIGN MARK (double-barred backward C — ↋)",
    canonicalName: "notcents_design",
    tier: 1,
    markType: "design",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md",
    originSession: "B103",
    usptoClasses: [36, 42, 35],
    preExistingConflictNotes:
      "Distinctive typographical design mark (double-barred backward C — visual inversion of cent sign ¢). No direct design mark conflict expected. Needs design-mark specimen for USPTO filing.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "file_immediate",
    founderDecisionPoints:
      "Submit PNG/vector of the canonical NotCents symbol (double-barred backward C) to counsel as design-mark specimen. Bundle with word mark filing for efficiency.",
  },

  {
    id: 10,
    markText: "CAI ◌ NOTCENTS",
    canonicalName: "cai_notcents_composite",
    tier: 1,
    markType: "composite",
    structure: "composition",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/cai_conducted_ai_notcents_composite_brand_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 35],
    preExistingConflictNotes:
      "Composite marks (wordmark + logomark) receive strongest USPTO distinctiveness treatment. No prior art on this specific composite. Highest-priority filing in the CAI group.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "file_immediate",
    founderDecisionPoints:
      "Primary protection vehicle for the brand-category claim. File as composite (wordmark CAI + design ↋). Intel-Inside filing strategy: both elements together + each standalone.",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 3 — ARCHITECTURE BEATS MORE PHILOSOPHY
  // Canon: architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 11,
    markText: "ARCHITECTURE BEATS MORE",
    canonicalName: "architecture_beats_more",
    tier: 1,
    markType: "slogan",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 35],
    preExistingConflictNotes:
      "Distinctive short-form philosophy phrase. No known prior use in AI/cooperative-platform context. Strong distinctiveness as compressed category-claim.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File as slogan class alongside IT'S HOW YOU USE IT? Counsel should advise whether both slogans are worth filing independently vs. relying on trademark protection via composite marks.",
  },

  {
    id: 12,
    markText: "THE SUBSTRATE ORCHESTRA IN SYMPHONY",
    canonicalName: "substrate_orchestra_symphony",
    tier: 1,
    markType: "word",
    structure: "composition",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Novel compound anchoring the architectural metaphor. No known prior art in software/AI class. Distinctive.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Bundle with ORCHESTRA LIBRARIAN filing for cost efficiency? Same counsel session.",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 4 — HOT WATER COMPANY / SAVE THE WORLD SERIES
  // Canon: paper_a_considered_approach_to_universal_abundant_low_cost_energy_canon_bp021.eblet.md
  //         paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 13,
    markText: "THE HOT WATER COMPANY",
    canonicalName: "hot_water_company",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/paper_a_considered_approach_to_universal_abundant_low_cost_energy_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [11, 37, 40, 42],
    preExistingConflictNotes:
      "\"Hot water company\" is descriptive in utility/plumbing contexts — may face 2(e)(1) refusal for describing the goods/services directly. Counsel must argue that LB's \"The Hot Water Company\" is distinctive in the cooperative-energy-platform context (Stirling+hydraulic+hydrogen canister product-line, not a conventional plumber). Consider geographic descriptiveness issues if mark is used internationally.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "Brand as cooperative-platform energy sovereignty product line, not descriptive of conventional hot water utility services. File in class 40 (treatment of materials — hydrogen production) and class 11 (heating apparatus/energy appliances) with specimens showing distinctive brand use. Acquired distinctiveness argument via BP021 paper publication + first-use evidence.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Highest-priority mark in the energy-paper group — productization surface depends on trademark protection. Counsel: is THE HOT WATER COMPANY registrable as-is, or does it need a distinctive design element/logo composite to clear 2(e)(1)?",
  },

  {
    id: 14,
    markText: "SAVE THE WORLD FOUNDATION",
    canonicalName: "save_the_world_foundation",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/paper_a_considered_approach_to_universal_abundant_low_cost_energy_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 36, 45],
    preExistingConflictNotes:
      "\"Save the World\" as a phrase has broad usage; standalone it is aspirational/generic. In combination with Foundation it creates a charitable/organizational category mark. Multiple existing entities use similar names. Counsel search needed for class 42 + 45. Liana Banyan Corporation as the foundation-vehicle already filed (Wyoming C-Corp 41-2797446) provides first-use grounding.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "Anchor to Liana Banyan Corporation as the already-extant foundation entity. File mark in context of cooperative-energy-economics-AI trilogy mission. The compound with \"Foundation\" in specific cooperative-platform services class is more distinctive than \"Save the World\" alone.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Founder direct BP021: \"I'm going to start the 'Save the World' foundation. Liana Banyan Corporation..oh wait, I already did. lol.\" — Entity exists; mark should track entity. Decision: file as service mark for the trilogy-mission services, OR defer until public launch of the Foundation surface?",
  },

  {
    id: 15,
    markText: "HOUSEHOLD HYDROGEN CANISTER",
    canonicalName: "household_hydrogen_canister",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/paper_a_considered_approach_to_universal_abundant_low_cost_energy_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [11, 40],
    preExistingConflictNotes:
      "Descriptive risk: \"hydrogen canister\" is a product description. \"Household\" prefix narrows but may not cure descriptiveness. Bernzomatic owns the canister-format market vocabulary. Counsel must navigate descriptiveness + prior art on hydrogen storage products.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File as product-class mark for the specific Bernzomatic-pattern LB cooperative-manufactured canister format. Include distinctive design element (canister logo) as composite to strengthen distinctiveness. File in class 40 (material treatment — hydrogen production/storage).",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Product not yet manufactured — file intent-to-use or defer until actual manufacturing partnership established? Intent-to-use application preserves priority date without requiring specimen at filing.",
  },

  {
    id: 16,
    markText: "A CONSIDERED APPROACH TO UNIVERSAL ___",
    canonicalName: "considered_approach_series_pattern",
    tier: 1,
    markType: "series_pattern" as MarkType,
    structure: "series_pattern",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [41, 42],
    preExistingConflictNotes:
      "Series title-pattern mark. \"A Considered Approach to\" is a compositional pattern; the blank is filled with specific paper topics. Counsel must argue series-title distinctiveness as a publication-class mark. No known prior art on this exact title pattern in AI/cooperative-platform context.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "File as series title mark covering all 12 papers, or file each paper title individually? Counsel should advise on cost-efficient series-mark coverage strategy for a 12-paper publication class.",
  },

  {
    id: 17,
    markText: "THE 12-PAPER SAVE-THE-WORLD SERIES",
    canonicalName: "twelve_paper_save_the_world_series",
    tier: 1,
    markType: "word",
    structure: "series_pattern",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [41, 42],
    preExistingConflictNotes:
      "Novel series name. No known prior art. Highly distinctive as a compound.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Bundle with SAVE THE WORLD FOUNDATION filing for counsel efficiency.",
  },

  {
    id: 18,
    markText: "HOW TO SAVE THE WORLD IN 6 EASY STEPS",
    canonicalName: "how_to_save_world_6_steps",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md",
    originSession: "BP016",
    usptoClasses: [41, 42],
    preExistingConflictNotes:
      "Title-class phrase. Some prior usage in self-help/book contexts but not in AI/cooperative-platform. Strong distinctiveness as 6-step overarching framework paper. Counsel search needed.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File as publication-title mark (class 41) for the overarching 6-easy-steps paper?",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 5 — MORDECAI-ESTHER PEDESTAL FORUM
  // Canon: mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 19,
    markText: "MORDECAI-ESTHER PEDESTAL FORUM",
    canonicalName: "mordecai_esther_pedestal_forum",
    tier: 1,
    markType: "word",
    structure: "composition",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 45],
    preExistingConflictNotes:
      "Biblical reference (Mordecai + Esther) — names are not protectable standing alone, but as a compound in a specific cooperative-platform context the combination is highly distinctive. Fair-use analysis needed: biblical names are in public domain; composition-mark context is the protectable element.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File with emphasis on the unique compound concept — Mordecai-Esther Pedestal Forum as a specific cooperative-platform collaboration mechanism for immutable-substrate-published papers (distinct from any religious, theatrical, or educational use). Prior-art classes: biblical commentary, theater, academic publications — LB use is structurally distinct.",
    recommendedCounselAction: "sui_generis_distinguishing",
    founderDecisionPoints:
      "Biblical-class mark: counsel must confirm fair-use safe harbor for composition-mark using biblical names in software/platform class 42. Priority fire-time decision.",
  },

  {
    id: 20,
    markText: "PEDESTAL FORUM",
    canonicalName: "pedestal_forum",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 45],
    preExistingConflictNotes:
      "Compound of two common words but in specific cooperative-platform context (member-visible surface for co-equal decree additions). No known prior art in this specific compound sense for software platform services.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Standalone filing for PEDESTAL FORUM vs. relying on MORDECAI-ESTHER PEDESTAL FORUM as the primary mark? Both should be filed; PEDESTAL FORUM is the more broadly usable term.",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 6 — BAGS OF HOLDING + TARZAN MOVE
  // Canon: bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md
  // Note: Tagged Cluster J in Eblet, but included here per Bushel 11 scope aggregation
  // ─────────────────────────────────────────────────────────

  {
    id: 21,
    markText: "BAGS OF HOLDING",
    canonicalName: "bags_of_holding",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md",
    originSession: "BP017",
    usptoClasses: [42],
    preExistingConflictNotes:
      "CRITICAL — D&D (Dungeons & Dragons / Wizards of the Coast / Hasbro) \"bag of holding\" is a well-known fictional item from the D&D IP. Wizards holds trademark registrations in gaming contexts. LB use is specifically in AI-platform cooperative-session-architecture context (not gaming/tabletop), which is a structurally distinct use class. Sui-generis distinguishing argument REQUIRED.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File exclusively in class 42 (computer software/AI services) — the D&D registration is primarily in gaming/entertainment classes. Build concurrent-use or coexistence argument: LB Bags of Holding = AI session context budgets; D&D Bags of Holding = fictional gaming item. Two entirely separate commercial contexts. Counsel to assess likelihood of confusion analysis and whether coexistence agreement with Hasbro/WotC is needed.",
    recommendedCounselAction: "sui_generis_distinguishing",
    founderDecisionPoints:
      "Highest-conflict mark in Cluster K. Counsel session REQUIRED before filing. Decision: pursue independent registration (requires robust distinguishing) OR secure coexistence agreement with Hasbro/WotC first? Cost + timeline implications either way.",
  },

  {
    id: 22,
    markText: "THE TARZAN MOVE",
    canonicalName: "tarzan_move",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md",
    originSession: "BP017",
    usptoClasses: [42],
    preExistingConflictNotes:
      "\"Tarzan\" is a trademarked character owned by Edgar Rice Burroughs, Inc. (EBR). EBR actively defends the Tarzan mark. However, \"The Tarzan Move\" as a compound describing an operational pattern (bag-handoff through the LB substrate-warehouse) in class 42 (AI software services) is potentially sui-generis. Counsel review needed for potential trademark dilution claim by EBR.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File as descriptive-of-method mark in class 42 with evidence that \"The Tarzan Move\" is a coined operational term (not a character reference) in LB Frame context. Metaphorical usage in software-operational description has precedent. However, EBR is aggressive; counsel should advise on cease-and-desist risk before public marketing deployment.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Use THE TARZAN MOVE in marketing materials before counsel clears it? Per filing-queue canon: do not deploy publicly until at minimum `searched`. Tarzan IP risk = medium-high.",
  },

  {
    id: 23,
    markText: "THE COOPERATIVE DATACENTER",
    canonicalName: "cooperative_datacenter",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md",
    originSession: "BP016",
    usptoClasses: [42, 38],
    preExistingConflictNotes:
      "Descriptive risk: \"cooperative datacenter\" describes the service category. However \"The Cooperative Datacenter\" as a proper-noun brand with definite article is more distinctive. Existing datacenters use \"cooperative\" in their names but not as a Platform-Federation-Hive architecture brand. Counsel search needed.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File as class 42 (cloud/distributed computing services) or defer until Cooperative Datacenter Phase 1-5 build-order execution begins?",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 7 — FOUNDER VOICE MARKS
  // Canon: founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 24,
    markText: "CREWMAN #6",
    canonicalName: "crewman_6",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md",
    originSession: "BP021",
    usptoClasses: [42, 35],
    preExistingConflictNotes:
      "Star Trek \"red shirt\" / interchangeable crewman reference — cultural shorthand broadly used. \"Crewman #6\" specifically as a mark in cooperative-platform/AI-services context is novel. No known trademark conflict on this exact compound.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Founder canonical self-identification. File as part of brand-voice marks package. Unique use case: a Founder who trademarks their own self-deprecating title = cooperative sincerity-brand move.",
  },

  {
    id: 25,
    markText: "SIPPING ETHEREAL T",
    canonicalName: "sipping_ethereal_t",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md",
    originSession: "BP021",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Highly distinctive coined phrase (Founder coinage, BP021 turn 90). No known prior art. \"T\" = vendor API spend (LB canonical — T not Tea). Unique compound; strong distinctiveness.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File with canonical casing — SIPPING ETHEREAL T (not \"Tea\"). Brief counsel on the single-letter wordplay to ensure the filing preserves the \"T\" identity.",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 8 — SLOW BLADE DEFENSE STACK MECHANISMS
  // Canon: slow_blade_defense_stack_v2_master_canon_bp021.eblet.md
  // ─────────────────────────────────────────────────────────

  {
    id: 26,
    markText: "THE FURNACE",
    canonicalName: "the_furnace",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42],
    preExistingConflictNotes:
      "\"The Furnace\" is used broadly in brand names (manufacturing, fitness, etc.). In class 42 (software platform verification/stamping services) the usage is more distinctive. \"The Furnace\" as the LB immutable public ledger + badge-stamping mechanism is a specific product surface — see `platform/src/pages/TheFurnace.tsx`.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Already deployed as a platform surface (TheFurnace.tsx). File based on existing first-use evidence from platform deployment. Class 42 filing.",
  },

  {
    id: 27,
    markText: "SLOW BLADE",
    canonicalName: "slow_blade",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Dune reference — Frank Herbert's \"the slow blade penetrates the shield\" (Dune, 1965). The Herbert estate actively manages Dune IP; Legendary Entertainment holds film rights. \"Slow Blade\" as a coined product name for a rate-limiting mechanism in class 42 (software) may face fair-use challenge. Counsel REQUIRED for literary-reference distinguishing.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File as class 42 mark for a specific rate-limiting product feature (distinct from literary/entertainment use). The phrase itself is not trademarked by the Herbert estate (it is dialogue from a novel, not a registered product mark). Basis: coined metaphorical use in software security context. Counsel to advise on likelihood of challenge from Herbert estate or Legendary.",
    recommendedCounselAction: "sui_generis_distinguishing",
    founderDecisionPoints:
      "Dune IP landscape: Herbert estate + Legendary. Decision: proceed with SLOW BLADE registration in class 42 (software security) with sui-generis argument, OR rename the mechanism for marketing surfaces while preserving internal use? Counsel session priority item.",
  },

  {
    id: 28,
    markText: "GLASS DOOR",
    canonicalName: "glass_door",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42],
    preExistingConflictNotes:
      "CRITICAL — Glassdoor.com (Recruit Holdings) is a well-known trademark in class 35/42 employment services. \"Glass Door\" (two words) vs. \"Glassdoor\" (one word) — may not be sufficient differentiation given phonetic identity. Counsel must assess likelihood of confusion with Glassdoor registration.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "LB use of GLASS DOOR is as a transparency/visibility mechanism in cooperative-platform moderation (not employment reviews). Class 42 + specific product context may enable coexistence, but Glassdoor.com's multi-class registrations may create blocking marks. Counsel search REQUIRED before any public marketing use.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "HIGH RISK — Glassdoor phonetic conflict. Counsel session priority: is GLASS DOOR registrable with Glassdoor.com in the field, or does LB need to rename this mechanism for any public surface? Internal/patent use may be fine; marketing surface needs clearance.",
  },

  {
    id: 29,
    markText: "TRUST MATCH",
    canonicalName: "trust_match",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42, 36],
    preExistingConflictNotes:
      "Compound mark. Some prior use of \"TrustMatch\" in identity verification/fintech contexts. Counsel search needed. LB Trust Match (mutual Mark-staking between strangers) is architecturally distinct from typical identity verification. Class 36 (financial services / Mark-staking) + class 42 (platform services) filing cluster.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "A&A Formal #2329 already drafted (Crown Jewel candidate). Bundle trademark filing with patent prosecution timeline for coordinated IP protection strategy.",
  },

  {
    id: 30,
    markText: "SIX SPARKS",
    canonicalName: "six_sparks",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42],
    preExistingConflictNotes:
      "\"Six Sparks\" as a compound is relatively clean. Some usage in entertainment/band names but limited class 42 conflicts expected. LB Six Sparks = acceleration-path system for new-member visibility — specific product feature.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File as class 42 mark for the new-member visibility pathway system. Bundle with GOOD STANDING ROLL filing.",
  },

  {
    id: 31,
    markText: "GOOD STANDING ROLL",
    canonicalName: "good_standing_roll",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Novel compound. \"Good standing\" is common legal/financial language but GOOD STANDING ROLL as a specific compound in cooperative-platform moderation context (inverted allowlist — bad actors opt out by bad behavior) is distinctive. No known prior art as a compound mark.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "Bundle with SIX SPARKS in same class 42 defense-mechanism filing cluster.",
  },

  {
    id: 32,
    markText: "SEASONING",
    canonicalName: "seasoning",
    tier: 2,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/slow_blade_defense_stack_v2_master_canon_bp021.eblet.md",
    originSession: "B119",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Highly generic single word. \"Seasoning\" in food/culinary contexts is essentially unprotectable. In class 42 (software) it is more distinctive as a coined mechanism-name (account-maturation anti-abuse). However, single generic words face high USPTO refusal risk even in specific classes. Tier-2 candidate — file after higher-priority marks clear.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File only if counsel believes sui-generis use in software/platform context is distinguishable from culinary generic. May be better protected via patent (A&A #2330 in draft) than trademark.",
    recommendedCounselAction: "defer_post_launch",
    founderDecisionPoints:
      "Defer SEASONING trademark until after higher-priority marks filed. Protect via A&A #2330 patent path primarily.",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 9 — FEDERATION TIER NAMES (LIBRARIAN VARIANTS)
  // Canon: orchestra_librarian + brittle_vs_fluid + thirteenth_warrior + apiarist + atreyu eblets
  // ─────────────────────────────────────────────────────────

  {
    id: 33,
    markText: "ATREYU",
    canonicalName: "atreyu_librarian",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP016",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Atreyu = character from The Neverending Story (Michael Ende, 1979) and the 1984 film. Concorde Pictures / Warner Bros. hold rights. Also: metal band \"Atreyu\" has trademark registrations in class 41 (entertainment). Class 42 (AI/software) may be clear, but character-name use requires counsel review. Also: \"Atreides\" in Dune is phonetically different — no conflict there.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File exclusively in class 42 (AI platform personal-tier services) — distinct from entertainment/music classes. Atreyu in LB context = personal-tier cooperative AI (first layer of Federation organism). Neverending Story rights and Atreyu band are both class 41; class 42 overlap unlikely but counsel confirmation needed.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Literary character + band name: counsel must confirm class 42 is clear. If conflict found, decision: rename Atreyu tier OR proceed with coexistence filing?",
  },

  {
    id: 34,
    markText: "APIARIST",
    canonicalName: "apiarist_librarian",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP016",
    usptoClasses: [42],
    preExistingConflictNotes:
      "\"Apiarist\" = beekeeper. Some existing use in class 42 (honey/agriculture tech software). The compound Apiarist + Hive in LB context is distinctive as an AI-federation cohort tier name. Counsel search for class 42.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "File APIARIST as a tier-brand mark for the Hive-cohort federation tier of LB Frame. Bundle with THIRTEENTH WARRIOR in same counsel session for efficiency.",
  },

  {
    id: 35,
    markText: "THIRTEENTH WARRIOR",
    canonicalName: "thirteenth_warrior",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/state/eblets/CANON/orchestra_librarian_umbrella_brand_with_candelabra_internal_architecture_canon_bp021.eblet.md",
    originSession: "BP016",
    usptoClasses: [42],
    preExistingConflictNotes:
      "The 13th Warrior = 1999 Disney/Touchstone film (source: Michael Crichton's \"Eaters of the Dead\"). Touchstone/Disney holds marks for the film title. In class 42 (AI platform / cooperative datacenter build-order tier), the phrase THIRTEENTH WARRIOR is used metaphorically for the civilization-scale federation layer — distinct from film context. Prior art film title = Tier-1 counsel review required.",
    requiresDistinguishingArgument: true,
    distinguishingStrategy:
      "File in class 42 only. Distinguish from film: LB THIRTEENTH WARRIOR = architectural metaphor for Atreyu→Apiarist→Thirteenth Warrior Federation build-order (one AI per member at civilization scale). Historical/literary Norseman reference (underlying Crichton novel source = Ahmad ibn Fadlan — 10th century Islamic traveler) predates film by ~1100 years; no single entity owns the underlying historical reference.",
    recommendedCounselAction: "counsel_review_required",
    founderDecisionPoints:
      "Disney/Touchstone film title conflict. Counsel: does THIRTEENTH WARRIOR in class 42 create likelihood of confusion with the 1999 film mark? If yes, decision: rename this tier OR coexist with class 42 distinction argument?",
  },

  // ─────────────────────────────────────────────────────────
  // GROUP 10 — PRE-EXISTING QUEUE MARKS (B103/B130 carry-forward)
  // Canon: project_trademark_filing_queue.md
  // ─────────────────────────────────────────────────────────

  {
    id: 36,
    markText: "ROMULATOR 9000",
    canonicalName: "romulator_9000",
    tier: 1,
    markType: "word",
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/projects/C--Users-Administrator-Documents/memory/project_trademark_filing_queue.md",
    originSession: "B103",
    usptoClasses: [42],
    preExistingConflictNotes:
      "Pre-existing queue mark since B103. Distinctive coined word + number compound. \"Romulator\" is novel; \"9000\" is generic but the compound is distinctive. No known prior art. In queue: pending.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "file_immediate",
    founderDecisionPoints:
      "Already in filing queue. Elevate to Cluster K counsel session for filing. Patent provisional App 64/036,646 (filed Apr 12, 2026) covers architecture — trademark provides brand-layer protection.",
  },

  {
    id: 37,
    markText: "THE REPERTORY",
    canonicalName: "the_repertory",
    tier: 1,
    markType: ["word", "design"] as MarkType[],
    structure: "standalone",
    canonicalSourceEblet:
      "~/.claude/projects/C--Users-Administrator-Documents/memory/project_trademark_filing_queue.md",
    originSession: "B130",
    usptoClasses: [42, 35],
    preExistingConflictNotes:
      "B130 Founder-flagged as likely-untrademarked. \"The Repertory\" — some existing use in theater/arts contexts (The Repertory Theatre of Louisville, etc.) and software contexts. Class 42 (marketplace for Plays / AI script marketplace) + class 35 (advertising) may be clear. Trademark search needed before public surface per B130 Founder directive.",
    requiresDistinguishingArgument: false,
    recommendedCounselAction: "search_then_file",
    founderDecisionPoints:
      "B130 Founder directive: search before public deploy. Already in filing queue. Add to Cluster K counsel session.",
  },
];

// ============================================================
// VERIFICATION GATES
// ============================================================

/** G1 — Cluster K manifest covers ≥30 Tier-1 marks */
export const G1_MARK_COUNT = CLUSTER_K_MANIFEST.length;

/** G2 — Every mark has a canonical-source-Eblet pointer (Wrasse-routable) */
export function verifyG2(): { pass: boolean; missingSourceEblet: number[] } {
  const missing = CLUSTER_K_MANIFEST.filter(
    (m) => !m.canonicalSourceEblet || m.canonicalSourceEblet.trim() === ""
  ).map((m) => m.id);
  return { pass: missing.length === 0, missingSourceEblet: missing };
}

/** G3 — Counsel session decision points present for all marks */
export function verifyG3(): { pass: boolean; missingDecisionPoints: number[] } {
  const missing = CLUSTER_K_MANIFEST.filter(
    (m) => !m.founderDecisionPoints || m.founderDecisionPoints.trim() === ""
  ).map((m) => m.id);
  return { pass: missing.length === 0, missingDecisionPoints: missing };
}

/** Summary statistics for counsel brief */
export function clusterKSummary() {
  const byTier: Record<TierLevel, number> = { 1: 0, 2: 0, 3: 0 };
  const byAction: Record<CounselAction, number> = {
    file_immediate: 0,
    search_then_file: 0,
    counsel_review_required: 0,
    sui_generis_distinguishing: 0,
    defer_post_launch: 0,
  };

  for (const mark of CLUSTER_K_MANIFEST) {
    byTier[mark.tier]++;
    byAction[mark.recommendedCounselAction]++;
  }

  return {
    totalMarks: CLUSTER_K_MANIFEST.length,
    byTier,
    byAction,
    requiresDistinguishingArgument: CLUSTER_K_MANIFEST.filter(
      (m) => m.requiresDistinguishingArgument
    ).length,
    tier1Marks: CLUSTER_K_MANIFEST.filter((m) => m.tier === 1),
  };
}

// Verification output at module load (for CI / rebuild checks)
const g1 = G1_MARK_COUNT;
const g2 = verifyG2();
const g3 = verifyG3();

if (g1 < 30) {
  throw new Error(
    `G1 FAIL: Cluster K manifest has ${g1} marks — minimum 30 required.`
  );
}
if (!g2.pass) {
  throw new Error(
    `G2 FAIL: Missing canonicalSourceEblet on mark IDs: ${g2.missingSourceEblet.join(", ")}`
  );
}
if (!g3.pass) {
  throw new Error(
    `G3 FAIL: Missing founderDecisionPoints on mark IDs: ${g3.missingDecisionPoints.join(", ")}`
  );
}
