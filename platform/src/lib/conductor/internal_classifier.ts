/**
 * Conductor Internal Task Classifier
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Classifies an internal AI-cohort task into an InternalTaskClass so the
 * internal router can select the empirically-optimal model/vendor pair for
 * that task class.
 *
 * Task taxonomy (7 classes across 3 canonical agent roles):
 *
 *   Bishop role:
 *     bishop_canon_substrate_keeping — Eblets, Cathedral substrate writes,
 *       A&A formals, Scribe updates, session-close handoff records
 *     bishop_foreman_coordination    — Cross-agent coordination prompts,
 *       Knight/Pawn task dispatch, inter-agent handoff documents
 *
 *   Knight role:
 *     knight_authoring               — Greenfield code authoring, new feature
 *       build, net-new TypeScript/Python component creation
 *     knight_audit                   — Code review, test triage, diff audit,
 *       linter/build verification, migration correctness checks
 *     knight_implementation          — Prescribed implementation tasks,
 *       wiring, migration execution, schema apply, deploy sequences
 *
 *   Pawn role:
 *     pawn_research                  — Web research, domain lookup, source
 *       verification, competitive analysis, current-events queries
 *     pawn_validation                — Spec compliance review, patent/legal
 *       claim check, canon-discipline grading, contradiction detection
 *
 * Canonical-lock discipline (DO NOT REMOVE):
 *   The canonical defaults (Bishop=Opus, Knight=Sonnet, Pawn=Perplexity) are
 *   the permanent baseline preserved by canonical-lock mode. The internal
 *   router only departs from these when BOTH conditions are met:
 *     1. mode === "auto"
 *     2. internal_rankings has empirical data suggesting a better choice
 *   canonical-lock mode = zero behavioral change from pre-Conductor defaults.
 *
 * Composes with:
 *   classifier.ts   — member-query classification (separate concern)
 *   internal_rankings.ts — ranking table seeded from BP020/BP021 probe receipts
 *   internal_router.ts  — decision layer that calls classifyInternalTask()
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The 3 canonical agent roles in the LB AI cohort. */
export type AgentRole = "bishop" | "knight" | "pawn";

/**
 * The 7 internal task classes across Bishop / Knight / Pawn roles.
 * Each class maps to a distinct capability profile and empirical ranking seed.
 */
export type InternalTaskClass =
  | "bishop_canon_substrate_keeping" // Canon writes: Eblets, A&A, Scribes, handoffs
  | "bishop_foreman_coordination"    // Cross-agent dispatch, coordination, KnightQueue
  | "knight_authoring"               // Net-new code: greenfield features, new modules
  | "knight_audit"                   // Code review, test verification, diff grading
  | "knight_implementation"          // Prescribed tasks: migrations, wiring, deploys
  | "pawn_research"                  // Web research, live lookup, domain queries
  | "pawn_validation";               // Spec/legal/patent compliance check, contradiction

/** Map from InternalTaskClass to its canonical AgentRole. */
export const TASK_CLASS_ROLE: Record<InternalTaskClass, AgentRole> = {
  bishop_canon_substrate_keeping: "bishop",
  bishop_foreman_coordination:    "bishop",
  knight_authoring:               "knight",
  knight_audit:                   "knight",
  knight_implementation:          "knight",
  pawn_research:                  "pawn",
  pawn_validation:                "pawn",
};

export interface ClassifiedInternalTask {
  /** Raw task description or label provided to the classifier. */
  task: string;
  /** Winning internal task class. */
  class: InternalTaskClass;
  /** Canonical agent role for this class. */
  role: AgentRole;
  /** Aggregate heuristic confidence [0..1]. */
  confidence: number;
  /** Which heuristic signals fired. */
  signals: string[];
  /**
   * true  = classified via task label or metadata (high confidence)
   * false = classified via heuristic text analysis (lower confidence)
   */
  labelDerived: boolean;
}

// ---------------------------------------------------------------------------
// Heuristic thresholds
// ---------------------------------------------------------------------------

/** Below this aggregate confidence the classifier falls back to canonical-lock. */
const UNCERTAIN_THRESHOLD = 0.45;

// ---------------------------------------------------------------------------
// Heuristic rules
// ---------------------------------------------------------------------------

interface TaskHit {
  class: InternalTaskClass;
  confidence: number;
  signal: string;
}

function _bishopCanonSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(eblet|A&A\s*formal|a&a\s+#|scribe|stitchpunk|cathedral\s+(write|update|append|substrate)|canon\s+(write|append|update|commit)|session[\s-]close|handoff\s+(record|document)|moneypenny_debrief|wrasse|substrate\s+write|cathedral\s+substrate|pheromone|pheromonate)\b/i.test(t)) {
    hits.push({ class: "bishop_canon_substrate_keeping", confidence: 0.75, signal: "canon-substrate-term" });
  }
  if (/\b(innovation\s+(count|#|number)|crown\s+jewel|patent\s+(claim|application|filing)|provisional|A&A\s+\d+|formal\s+\d+|milestone\s+handoff)\b/i.test(t)) {
    hits.push({ class: "bishop_canon_substrate_keeping", confidence: 0.60, signal: "patent-canon-term" });
  }
  if (/\b(letter\s+(sync|draft|dispatch)|cephas\s+(mirror|sync|letter)|launch\s+document|MILESTONE_HANDOFF)\b/i.test(t)) {
    hits.push({ class: "bishop_canon_substrate_keeping", confidence: 0.55, signal: "letter-sync-term" });
  }
  return hits;
}

function _bishopForemanSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(knight\s+(dispatch|prompt|queue|task)|pawn\s+(dispatch|prompt|task)|KNIGHT_QUEUE|BISHOP_DROPZONE|agent\s+coordination|cross[\s-]agent|foreman|inter[\s-]agent|handoff\s+to\s+(knight|pawn)|dispatch\s+(knight|pawn))\b/i.test(t)) {
    hits.push({ class: "bishop_foreman_coordination", confidence: 0.70, signal: "foreman-dispatch-term" });
  }
  if (/\b(K\d{3,4}\s+prompt|B\d{3,4}\s+session|session\s+open|session\s+start|brief\s+(knight|pawn))\b/i.test(t)) {
    hits.push({ class: "bishop_foreman_coordination", confidence: 0.60, signal: "session-coordination-term" });
  }
  return hits;
}

function _knightAuthoringSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(build|author|create|scaffold|greenfield|net[\s-]new|new\s+(component|module|feature|file|page|hook|service|class|interface))\b/i.test(t)) {
    hits.push({ class: "knight_authoring", confidence: 0.55, signal: "authoring-verb" });
  }
  if (/\b(typescript|react|python|fastapi|supabase\s+migration|sql\s+migration|firebase|MCP\s+(tool|server))\b/i.test(t) && /\b(write|create|build|author|implement)\b/i.test(t)) {
    hits.push({ class: "knight_authoring", confidence: 0.60, signal: "tech-authoring-combo" });
  }
  if (/\b(bushel|shadow\s+\d|shard|phase\s+[A-Z])\b/i.test(t)) {
    hits.push({ class: "knight_authoring", confidence: 0.50, signal: "bushel-build-term" });
  }
  return hits;
}

function _knightAuditSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(audit|review|verify|triage|check|test\s+(pass|fail|result)|linter|diff|coverage|QA|quality\s+check|gate\s+(pass|fail))\b/i.test(t)) {
    hits.push({ class: "knight_audit", confidence: 0.60, signal: "audit-term" });
  }
  if (/\b(circuit[\s-]breaker|telemetry\s+check|benchmark\s+(verify|run|result)|HMAC|hmac|salt\s+check|schema\s+compliance)\b/i.test(t)) {
    hits.push({ class: "knight_audit", confidence: 0.55, signal: "technical-audit-term" });
  }
  return hits;
}

function _knightImplSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(wire|wiring|implement|migrate|apply\s+(migration|schema)|deploy|configure|install|plug\s+in|connect|integrate|setup|run\s+(migration|build|deploy))\b/i.test(t)) {
    hits.push({ class: "knight_implementation", confidence: 0.60, signal: "implementation-verb" });
  }
  if (/\b(supabase\s+(apply|run|push)|firebase\s+deploy|npm\s+(run|build|install)|git\s+(commit|push|tag))\b/i.test(t)) {
    hits.push({ class: "knight_implementation", confidence: 0.65, signal: "deploy-command-term" });
  }
  return hits;
}

function _pawnResearchSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(research|search|lookup|look\s+up|find\s+(info|article|source|data|reference)|web\s+search|perplexity|sonar|current\s+(events?|news|status)|domain\s+lookup|competitive\s+analysis|market\s+research)\b/i.test(t)) {
    hits.push({ class: "pawn_research", confidence: 0.70, signal: "research-term" });
  }
  if (/\b(what\s+(is|are)\s+the\s+(latest|current|recent)|find\s+out|investigate\s+(whether|if|how)|source\s+verification)\b/i.test(t)) {
    hits.push({ class: "pawn_research", confidence: 0.55, signal: "research-question-stem" });
  }
  return hits;
}

function _pawnValidationSignals(t: string): TaskHit[] {
  const hits: TaskHit[] = [];
  if (/\b(validate|validation|compliance\s+(check|review)|legal\s+review|patent\s+(review|check|claim\s+check)|spec\s+compliance|contradiction\s+(check|detect)|canon[\s-]discipline|grading|PAWN|pawn\s+(review|check|validate|grade))\b/i.test(t)) {
    hits.push({ class: "pawn_validation", confidence: 0.70, signal: "validation-term" });
  }
  if (/\b(does\s+this\s+(conform|comply|violate)|check\s+against\s+(spec|canon|rule|standard)|verify\s+(claim|statement|number|assertion))\b/i.test(t)) {
    hits.push({ class: "pawn_validation", confidence: 0.60, signal: "validation-question-stem" });
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Label-derived fast path
// ---------------------------------------------------------------------------

/**
 * If the task string is an exact or near-exact InternalTaskClass label,
 * return it immediately with high confidence.
 */
function _tryLabelFastPath(t: string): InternalTaskClass | null {
  const normalized = t.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const classes: InternalTaskClass[] = [
    "bishop_canon_substrate_keeping",
    "bishop_foreman_coordination",
    "knight_authoring",
    "knight_audit",
    "knight_implementation",
    "pawn_research",
    "pawn_validation",
  ];
  for (const cls of classes) {
    if (normalized === cls || normalized.startsWith(cls)) return cls;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

function _aggregate(hits: TaskHit[]): Map<InternalTaskClass, number> {
  const totals = new Map<InternalTaskClass, number>();
  for (const hit of hits) {
    totals.set(hit.class, Math.min(1.0, (totals.get(hit.class) ?? 0) + hit.confidence));
  }
  return totals;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify an internal AI-cohort task description into an InternalTaskClass.
 *
 * When the classification is uncertain (no class exceeds UNCERTAIN_THRESHOLD),
 * falls back to the canonical role assignment for the explicitly-specified role
 * — or to knight_implementation as the safest Knight default.
 *
 * @param task  Task description, label, or metadata string.
 * @param roleHint  Optional: caller-supplied agent role hint (bypasses heuristics
 *   for the role dimension; the sub-class is still heuristic-derived).
 */
export function classifyInternalTask(
  task: string,
  roleHint?: AgentRole,
): ClassifiedInternalTask {
  const trimmed = task.trim();

  // Fast path: exact label match
  const labelClass = _tryLabelFastPath(trimmed);
  if (labelClass) {
    return {
      task,
      class: labelClass,
      role: TASK_CLASS_ROLE[labelClass],
      confidence: 1.0,
      signals: ["label-exact-match"],
      labelDerived: true,
    };
  }

  const allHits: TaskHit[] = [
    ..._bishopCanonSignals(trimmed),
    ..._bishopForemanSignals(trimmed),
    ..._knightAuthoringSignals(trimmed),
    ..._knightAuditSignals(trimmed),
    ..._knightImplSignals(trimmed),
    ..._pawnResearchSignals(trimmed),
    ..._pawnValidationSignals(trimmed),
  ];

  const totals = _aggregate(allHits);

  // Filter by roleHint if provided (only consider classes for that role)
  const candidateTotals = roleHint
    ? new Map([...totals.entries()].filter(([cls]) => TASK_CLASS_ROLE[cls] === roleHint))
    : totals;

  if (candidateTotals.size === 0) {
    return _fallback(task, roleHint, allHits);
  }

  let winnerClass: InternalTaskClass | null = null;
  let winnerConf = 0;
  for (const [cls, conf] of candidateTotals.entries()) {
    if (conf > winnerConf) {
      winnerConf = conf;
      winnerClass = cls;
    }
  }

  if (!winnerClass || winnerConf < UNCERTAIN_THRESHOLD) {
    return _fallback(task, roleHint, allHits);
  }

  const firedSignals = allHits
    .filter((h) => h.class === winnerClass)
    .map((h) => h.signal);

  return {
    task,
    class: winnerClass,
    role: TASK_CLASS_ROLE[winnerClass],
    confidence: Math.round(winnerConf * 1000) / 1000,
    signals: firedSignals.length > 0 ? firedSignals : allHits.map((h) => h.signal),
    labelDerived: false,
  };
}

function _fallback(
  task: string,
  roleHint: AgentRole | undefined,
  allHits: TaskHit[],
): ClassifiedInternalTask {
  // Canonical defaults per role — same as canonical-lock assignments
  const fallbackClass: InternalTaskClass =
    roleHint === "bishop"  ? "bishop_canon_substrate_keeping"
    : roleHint === "pawn"  ? "pawn_research"
    : "knight_implementation"; // knight default or no hint

  return {
    task,
    class: fallbackClass,
    role: TASK_CLASS_ROLE[fallbackClass],
    confidence: 0,
    signals: allHits.length > 0 ? allHits.map((h) => h.signal) : ["no-heuristics-fired"],
    labelDerived: false,
  };
}
