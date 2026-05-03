/**
 * Bushel 17 — Sentinel Corpus
 * 9 sentinel tasks × 3 classes for the Compaction-Continue vs New-Session-Reorient A/B
 *
 * Canon anchor: compaction_continue_vs_new_session_reorient_sentinel_ab_framework_bushel_17_candidate_canon_bp021.eblet.md
 * Sister method: Bushel 16 LB-CODEX-0031 (alternation vs specialization receipt)
 * Authored BP021 turn 84 by Knight (Cursor / Sonnet 4.6)
 */

export type TaskClass = "lookup" | "author" | "bushel_design";

export interface ScoringRubric {
  /** What a correct answer must contain */
  must_contain: string[];
  /** Canonical pointers expected in the answer (Codex IDs, Eblet names, primitive names) */
  canonical_pointers: string[];
  /** Is the answer substrate-routed (detective-validated)? */
  substrate_routing_expected: boolean;
  /** Optional minimum completeness ratio 0-1 */
  min_completeness_ratio: number;
}

export interface SentinelTask {
  task_id: string;
  task_class: TaskClass;
  title: string;
  prompt: string;
  rubric: ScoringRubric;
  /** Eblet names / Codex IDs / canon docs expected to inform the answer */
  reference_canon_pointers: string[];
  /** Primitives whose coherence Detective must validate */
  substrate_coherence_anchors: string[];
  /** Estimated cognitive complexity within class: 1=easy, 2=medium, 3=hard */
  complexity: 1 | 2 | 3;
  /** Topic-pivot distance from typical mid-session state: near / partial / radical */
  topic_pivot_distance: "near" | "partial" | "radical";
}

// ---------------------------------------------------------------------------
// CLASS 1: LOOKUP / RECALL  (L1, L2, L3)
// Tests substrate-routed retrieval — correct? fast? right canon source?
// ---------------------------------------------------------------------------

const L1: SentinelTask = {
  task_id: "L1",
  task_class: "lookup",
  title: "Canonical creator-keep percentage + on-$500 transaction figure",
  prompt:
    "What is the canonical creator-keep percentage for Liana Banyan transactions? " +
    "What does a creator or worker receive on a $500 transaction? " +
    "State the exact figures and cite the canonical source.",
  rubric: {
    must_contain: ["83.3%", "$416.67", "never round to 83%"],
    canonical_pointers: ["canonical_values.yaml", "SECTION 2", "MEMORY_PUBLIC"],
    substrate_routing_expected: true,
    min_completeness_ratio: 1.0,
  },
  reference_canon_pointers: [
    "r9v2_base.md SECTION 2",
    "canonical_values.yaml stats.economics.creator_keeps_percentage",
  ],
  substrate_coherence_anchors: ["83.3", "416.67", "Cost+20%"],
  complexity: 1,
  topic_pivot_distance: "near",
};

const L2: SentinelTask = {
  task_id: "L2",
  task_class: "lookup",
  title: "Bushel 16 Codex ID + verdict",
  prompt:
    "What is the LB-CODEX ID assigned to Bushel 16? What was the empirical verdict — " +
    "did alternation or specialization win, and on how many out of four metrics? " +
    "Cite the receipt format field that carries the verdict.",
  rubric: {
    must_contain: ["LB-CODEX-0031", "ALTERNATION_WINS", "3/4", "verdict"],
    canonical_pointers: [
      "bushel_16/empirical_comparison_receipt.json",
      "LB-CODEX-0031",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.9,
  },
  reference_canon_pointers: [
    "~/.claude/state/bushel_16/empirical_comparison_receipt.json",
    "LB-CODEX-0031 Codex entry",
  ],
  substrate_coherence_anchors: ["LB-CODEX-0031", "ALTERNATION_WINS", "3/4 metrics"],
  complexity: 2,
  topic_pivot_distance: "near",
};

const L3: SentinelTask = {
  task_id: "L3",
  task_class: "lookup",
  title: "Prompt-cache TTL + Arm isolation implication",
  prompt:
    "What is Anthropic's prompt-cache TTL? " +
    "In the context of the Bushel 17 A/B experiment, what concrete implication does this TTL have " +
    "for cache-state isolation between Arm A (compaction-continue) and Arm B (new-session-reorient)? " +
    "How should this be documented in receipt provenance?",
  rubric: {
    must_contain: ["5 min", "5 minutes", "cold cache", "warm cache", "Arm B", "Arm A"],
    canonical_pointers: [
      "compaction_continue_vs_new_session_reorient_sentinel_ab_framework_bushel_17_candidate_canon_bp021.eblet.md",
      "G4 verification gate",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.85,
  },
  reference_canon_pointers: [
    "Bushel 17 canon §G4",
    "bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md",
  ],
  substrate_coherence_anchors: ["5 minute TTL", "cache-warm", "cold-start", "provenance"],
  complexity: 3,
  topic_pivot_distance: "partial",
};

// ---------------------------------------------------------------------------
// CLASS 2: AUTHOR  (A1, A2, A3)
// Tests full Eblet-structure adherence + canonical-reference cluster + Founder Voice
// ---------------------------------------------------------------------------

const A1: SentinelTask = {
  task_id: "A1",
  task_class: "author",
  title: "Draft a canon Eblet for the One-Way-Valve primitive",
  prompt:
    "Draft a canon Eblet for the Liana Banyan 'One-Way Valve' primitive (Credits never cash out to fiat). " +
    "Include: YAML front-matter (name, description, type, session, ratificationDate), " +
    "a Founder-voice section (use or paraphrase canonical phrasing), " +
    "a composes-with section (at minimum: Three-Gear Currency System, Forman Consumption-Motive Doctrine, Anti-Enshittification Architecture), " +
    "and a patent posture paragraph. " +
    "Eblet must be valid Markdown with front-matter fenced by '---'.",
  rubric: {
    must_contain: [
      "---",
      "name:",
      "One-Way Valve",
      "Credits",
      "fiat",
      "composes-with",
      "Forman",
      "Anti-Enshittification",
    ],
    canonical_pointers: [
      "r9v2_base.md SECTION 4 (Three-Gear Currency System)",
      "r9v2_base.md SECTION 8 (Anti-Enshittification)",
      "r9v2_base.md SECTION 9 (Securities Defense / Forman)",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.9,
  },
  reference_canon_pointers: [
    "r9v2_base.md SECTION 4",
    "r9v2_base.md SECTION 8",
    "r9v2_base.md SECTION 9",
  ],
  substrate_coherence_anchors: [
    "One-Way Valve",
    "consumption motive",
    "enshittification",
    "83.3",
  ],
  complexity: 2,
  topic_pivot_distance: "near",
};

const A2: SentinelTask = {
  task_id: "A2",
  task_class: "author",
  title: "Draft a canon Eblet for the Bags-of-Holding session metaphor",
  prompt:
    "Draft a canon Eblet for the 'Bags of Holding — Session Context vs Persistent Substrate' brand metaphor " +
    "(originated BP017). " +
    "The Eblet must: preserve the warehouse/bag analogy accurately (warehouse persists, bags swap), " +
    "include the Tarzan Move / Liana-vine swing reference, " +
    "cite the 5-15% in-flight thinking-state loss figure (with BRIDLE discipline), " +
    "compose with the Romulator 9000 and the Compaction-Continue vs New-Session-Reorient Bushel 17 framework, " +
    "and carry wrasseTriggers for: bags of holding / session context / substrate persists / tarzan move.",
  rubric: {
    must_contain: [
      "warehouse",
      "bag",
      "Tarzan",
      "5-15%",
      "BRIDLE",
      "Romulator",
      "wrasseTriggers",
    ],
    canonical_pointers: [
      "bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md",
      "Romulator 9000 (r9v2_base.md SECTION 6)",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.9,
  },
  reference_canon_pointers: [
    "bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md",
    "r9v2_base.md SECTION 6 (Romulator 9000)",
  ],
  substrate_coherence_anchors: [
    "Bags of Holding",
    "Tarzan Move",
    "BRIDLE",
    "Romulator 9000",
    "warehouse persists",
  ],
  complexity: 2,
  topic_pivot_distance: "near",
};

const A3: SentinelTask = {
  task_id: "A3",
  task_class: "author",
  title: "Draft a canon Eblet for the Triple-Redundant Verification Architecture",
  prompt:
    "Draft a canon Eblet for Innovation #2263 — Triple-Redundant Verification Architecture " +
    "(Scrambler A / B / C). " +
    "Must include: Scrambler A (Ledger / audit trail), Scrambler B (Ground Truth / disk+DB+routes), " +
    "Scrambler C (Arbiter / conflict resolution), 9 verification paths (3 scramblers × 3 trigger types), " +
    "self-healing drift-detection, patent posture paragraph (first-of-its-kind AI-agent verification), " +
    "composes-with: Romulator 9000, Cooperative Defensive Patent Pledge (#2260). " +
    "Confirm this maps to K418-K419 session lineage.",
  rubric: {
    must_contain: [
      "Scrambler A",
      "Scrambler B",
      "Scrambler C",
      "9 verification paths",
      "self-healing",
      "#2263",
      "K418",
    ],
    canonical_pointers: [
      "r9v2_base.md SECTION 6 (Triple-Redundant Verification)",
      "innovation #2263",
      "K418-K419 session lineage",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.85,
  },
  reference_canon_pointers: [
    "r9v2_base.md SECTION 6",
    "innovation_catalog #2263",
    "K418-K419 session record",
  ],
  substrate_coherence_anchors: [
    "Triple-Redundant Verification",
    "Scrambler",
    "9 paths",
    "drift",
    "#2263",
  ],
  complexity: 3,
  topic_pivot_distance: "partial",
};

// ---------------------------------------------------------------------------
// CLASS 3: BUSHEL-DESIGN  (D1, D2, D3)
// Tests cP-tier choice + composition-with-prior-Bushels coherence + gate proposal
// ---------------------------------------------------------------------------

const D1: SentinelTask = {
  task_id: "D1",
  task_class: "bushel_design",
  title: "Propose a Bushel structure for automating the AAR (After-Action Review) per-session workflow",
  prompt:
    "Propose a complete Bushel structure for automating the per-session, per-day After-Action Review (AAR) workflow. " +
    "The AAR canon is at `after_action_review_aar_per_session_per_day_canon_bp021.eblet.md`. " +
    "Your proposal must: state the Bushel number candidate (next available), define 3-5 phases, " +
    "identify which Shadow class fires the automation (E-Giant or Pod-G), " +
    "propose 4+ verification gates (G1-GN), " +
    "compose with: Conductor routing review section, Under-Route Detection canon, Bushel 17 threshold-map output, " +
    "and specify the Codex reservation ID format.",
  rubric: {
    must_contain: [
      "Bushel",
      "phases",
      "Shadow",
      "verification gate",
      "Conductor",
      "LB-CODEX",
      "AAR",
    ],
    canonical_pointers: [
      "after_action_review_aar_per_session_per_day_canon_bp021.eblet.md",
      "under_route_detection_canon_bp021.eblet.md",
      "Bushel 17 threshold-map",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.85,
  },
  reference_canon_pointers: [
    "after_action_review_aar_per_session_per_day_canon_bp021.eblet.md",
    "under_route_detection_canon_bp021.eblet.md",
    "Bushel 16 LANDED LB-CODEX-0031 (structural model)",
    "Bushel 17 canon (apparatus model)",
  ],
  substrate_coherence_anchors: ["AAR", "Conductor", "Under-Route Detection", "E-Giant", "threshold map"],
  complexity: 2,
  topic_pivot_distance: "partial",
};

const D2: SentinelTask = {
  task_id: "D2",
  task_class: "bushel_design",
  title: "Propose a Bushel structure for cross-vendor (Pawn/Knight) Sentinel A/B extension",
  prompt:
    "Bushel 17 is Anthropic-only (Bishop arm). " +
    "Propose a Bushel structure for extending the Compaction-Continue vs New-Session-Reorient Sentinel A/B " +
    "to cross-vendor coverage (at minimum: Pawn/Perplexity and Knight/Sonnet arms). " +
    "The proposal must address: snapshot-delivery vs MCP-delivery differences (Pawn is snapshot-only), " +
    "operator-mediated signature for Pawn, " +
    "shared receipt schema compatibility with Bushel 17 format, " +
    "and compose with Pawn's Cathedral architecture at `librarian-mcp/stitchpunks/pawn_cathedral/`.",
  rubric: {
    must_contain: [
      "cross-vendor",
      "Pawn",
      "Knight",
      "snapshot",
      "operator_mediated",
      "receipt schema",
      "pawn_cathedral",
    ],
    canonical_pointers: [
      "Bushel 17 canon (cross-vendor extension out-of-scope note)",
      "pawn_cathedral README",
      "AGENTS.md Phase 3 LIVE (K470/B121)",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.8,
  },
  reference_canon_pointers: [
    "librarian-mcp/stitchpunks/pawn_cathedral/README.md",
    "Bushel 17 canon §out-of-scope",
    "AGENTS.md Phase 3 LIVE Pawn Cathedral",
  ],
  substrate_coherence_anchors: [
    "cross-vendor",
    "snapshot-delivery",
    "operator_mediated_sig",
    "Pawn Cathedral",
    "receipt schema",
  ],
  complexity: 3,
  topic_pivot_distance: "partial",
};

const D3: SentinelTask = {
  task_id: "D3",
  task_class: "bushel_design",
  title: "Propose a Bushel structure for the 83.3% creator-keep constitutional lock audit",
  prompt:
    "The 83.3% creator-keep guarantee is locked in bylaws, not a settings page. " +
    "Propose a complete Bushel structure for a constitutional-lock audit system — " +
    "an automated mechanism that periodically verifies the creator-keep percentage has NOT drifted " +
    "in production code, database configurations, or documentation, and fires an alert if it has. " +
    "Compose with: Triple-Redundant Verification Architecture (Scrambler A/B/C, #2263), " +
    "Anti-Enshittification Architecture, Cooperative Defensive Patent Pledge (#2260). " +
    "This is a radical topic-pivot from substrate/session work — design it cleanly from first principles.",
  rubric: {
    must_contain: [
      "83.3%",
      "constitutional",
      "drift",
      "Scrambler",
      "Anti-Enshittification",
      "alert",
      "audit",
    ],
    canonical_pointers: [
      "r9v2_base.md SECTION 8 (Anti-Enshittification)",
      "r9v2_base.md SECTION 6 (Scrambler)",
      "canonical_values.yaml creator_keeps_percentage",
    ],
    substrate_routing_expected: true,
    min_completeness_ratio: 0.85,
  },
  reference_canon_pointers: [
    "r9v2_base.md SECTION 8",
    "r9v2_base.md SECTION 6",
    "canonical_values.yaml",
    "#2260 Cooperative Defensive Patent Pledge",
    "#2263 Triple-Redundant Verification",
  ],
  substrate_coherence_anchors: [
    "83.3",
    "constitutional lock",
    "Scrambler",
    "Anti-Enshittification",
    "#2263",
  ],
  complexity: 3,
  topic_pivot_distance: "radical",
};

// ---------------------------------------------------------------------------
// Exported corpus
// ---------------------------------------------------------------------------

export const SENTINEL_CORPUS: SentinelTask[] = [L1, L2, L3, A1, A2, A3, D1, D2, D3];

export const TASK_BY_ID: Record<string, SentinelTask> = Object.fromEntries(
  SENTINEL_CORPUS.map((t) => [t.task_id, t])
);

export const TASKS_BY_CLASS: Record<TaskClass, SentinelTask[]> = {
  lookup: [L1, L2, L3],
  author: [A1, A2, A3],
  bushel_design: [D1, D2, D3],
};

/** G1 validation: exactly 9 tasks, 3 per class */
export function validateCorpusCoverage(): { ok: boolean; message: string } {
  const total = SENTINEL_CORPUS.length;
  const byClass = Object.entries(TASKS_BY_CLASS).map(([cls, tasks]) => ({
    cls,
    count: tasks.length,
  }));
  const allThree = byClass.every((b) => b.count === 3);
  if (total === 9 && allThree) {
    return { ok: true, message: "G1 PASS — 9 tasks × 3 classes = 27 fire-slots per replicate" };
  }
  return {
    ok: false,
    message: `G1 FAIL — total=${total}, per-class=${JSON.stringify(byClass)}`,
  };
}
