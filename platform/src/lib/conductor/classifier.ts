/**
 * Conductor's Baton — Query Classifier
 * K446a · B119 · Innovation #2277
 *
 * Classifies an incoming member query into a task class so the Conductor router
 * can select the empirically-optimal model/vendor pair for that class.
 *
 * Implementation: Option A — deterministic heuristics (regex + keyword rules).
 * Fast, deterministic, zero API cost. Each rule fires a confidence contribution;
 * the class with the highest aggregate confidence wins.
 *
 * TODO(K446b): Upgrade to model-based classification (Haiku 4.5 or Gemini Flash)
 *   for borderline queries where deterministic confidence < 0.5. Model-based adds
 *   latency (~200ms) and cost (~$0.00003/query) but handles novel query shapes.
 *
 * Metaphor discipline: orchestra naming for internal identifiers, automatic-
 * transmission metaphor for any end-user-facing string (see router.ts rationale).
 */

export type QueryClass =
  | "retrieval_only"       // Pure factual lookup; answer lives in Cathedral context window
  | "reasoning_required"   // Multi-step inference, may need context but primarily cognitive
  | "creative"             // Generation task: writing, brainstorming, naming, drafting
  | "code_generation"      // Code, structured DSL output, technical syntax
  | "multi_step_planning"  // Agentic decomposition: plan → execute → verify sequences
  | "uncertain";           // Classifier confidence below threshold; triggers routing fallback

export interface ClassifiedQuery {
  query: string;
  class: QueryClass;
  confidence: number;   // 0..1 — aggregate heuristic confidence
  signals: string[];    // which heuristic rules fired, for provenance
}

// ---------------------------------------------------------------------------
// Heuristic thresholds
// ---------------------------------------------------------------------------

/** Minimum aggregate confidence to claim a class (below this → "uncertain"). */
const UNCERTAIN_THRESHOLD = 0.4;

/** Short query length (token-approx) that biases toward retrieval_only. */
const SHORT_QUERY_WORDS = 8;

/** Long query length that biases toward reasoning_required or multi_step_planning. */
const LONG_QUERY_WORDS = 40;

// ---------------------------------------------------------------------------
// Heuristic rules — each returns a partial confidence contribution [0..1]
// ---------------------------------------------------------------------------

interface HeuristicHit {
  class: QueryClass;
  confidence: number;
  signal: string;
}

/** Detect code-generation intent. Strong signal: named languages, code verbs. */
function _codeSignals(q: string): HeuristicHit[] {
  const hits: HeuristicHit[] = [];
  const lq = q.toLowerCase();

  // Explicit language or tech mentions (includes React/Angular/Vue as code frameworks)
  const langPattern =
    /\b(python|typescript|javascript|java|rust|go|golang|sql|bash|powershell|c\+\+|c#|ruby|php|swift|kotlin|scala|html|css|yaml|json|xml|graphql|dockerfile|react|vue|angular|node|django|fastapi|express|vitest|jest|pytest)\b/i;
  if (langPattern.test(q)) {
    hits.push({ class: "code_generation", confidence: 0.55, signal: "named-language" });
  }

  // Code-action verbs with article/demonstrative ("a", "an", "this", "the")
  if (/\b(write|implement|build|create|code|program|develop|debug|refactor|optimize)\s+(a\s+|an\s+|this\s+|the\s+)?(function|class|module|component|api|endpoint|query|script|test|migration|hook|interface|type|generic)\b/i.test(q)) {
    hits.push({ class: "code_generation", confidence: 0.65, signal: "code-verb+noun" });
  }

  // "write unit tests" / "write tests for" — common code task
  if (/\bwrite\s+(unit\s+|integration\s+|end-to-end\s+|e2e\s+)?tests?\s+(for|using|in)\b/i.test(q)) {
    hits.push({ class: "code_generation", confidence: 0.65, signal: "write-tests" });
  }

  // "refactor this/the/a class/function" pattern
  if (/\brefactor\s+(this|the|a|an)\s+\w+/i.test(q)) {
    hits.push({ class: "code_generation", confidence: 0.6, signal: "refactor-pattern" });
  }

  // Code fence markers in query
  if (/```|`{3}/.test(q)) {
    hits.push({ class: "code_generation", confidence: 0.5, signal: "code-fence" });
  }

  // Generic write-code signal
  if (/\bwrite\s+(some\s+)?(code|a\s+program|a\s+script)\b/i.test(q)) {
    hits.push({ class: "code_generation", confidence: 0.6, signal: "write-code" });
  }

  // Function/class/method without explicit verb still suggests code context
  if (/\b(function|method|interface|async\s+function|promise|callback|hook)\b/i.test(lq)) {
    hits.push({ class: "code_generation", confidence: 0.35, signal: "code-term" });
  }

  return hits;
}

/** Detect creative-generation intent. */
function _creativeSignals(q: string): HeuristicHit[] {
  const hits: HeuristicHit[] = [];

  // Flexible pattern: allow optional adjectives/qualifiers between verb+article and content type.
  // "write a short poem", "draft a marketing tagline", "create a catchy slogan"
  // NOTE: "script" excluded when a programming language is named — that's code_generation.
  const hasNamedLanguage = /\b(python|typescript|javascript|java|rust|go|bash|sql|powershell|ruby|php|swift|kotlin|html|css)\b/i.test(q);
  const creativeContentTypes = hasNamedLanguage
    ? /\b(letter|email|poem|essay|story|post|caption|title|slogan|tagline|song|speech|bio|description|narrative|blog|vision|opening)\b/i  // no "script" when lang named
    : /\b(letter|email|poem|essay|story|post|caption|title|slogan|tagline|song|script|speech|bio|description|narrative|blog|vision|opening)\b/i;
  if (
    /\b(write|draft|compose|create)\s+(a\s+|an\s+)/i.test(q) &&
    creativeContentTypes.test(q)
  ) {
    hits.push({ class: "creative", confidence: 0.7, signal: "creative-verb+noun" });
  }

  // "Compose an email to..." — "an" article variant
  if (/\bcompose\s+an?\s+\w+/i.test(q) && creativeContentTypes.test(q)) {
    hits.push({ class: "creative", confidence: 0.7, signal: "compose-an" });
  }

  if (/\b(brainstorm|come\s+up\s+with|suggest|generate\s+(some\s+)?ideas?|think\s+of|invent|imagine|name\s+ideas?)\b/i.test(q)) {
    hits.push({ class: "creative", confidence: 0.6, signal: "brainstorm-verb" });
  }

  // "Write a 3-sentence product description" — number-adjective variant
  if (/\b(write|draft)\s+(a\s+)?[\d\w-]+\s+\w+\s+(description|overview|summary|introduction)\b/i.test(q)) {
    hits.push({ class: "creative", confidence: 0.6, signal: "write-description" });
  }

  if (/\b(creative|imaginative|compelling|engaging|catchy|fun|interesting)\s+(name|title|copy|content|angle|slogan)\b/i.test(q)) {
    hits.push({ class: "creative", confidence: 0.55, signal: "creative-adjective" });
  }

  if (/\bmake\s+(it\s+)?(sound|feel|read|look)\s+(more\s+)?(casual|formal|friendly|professional|humorous|exciting)\b/i.test(q)) {
    hits.push({ class: "creative", confidence: 0.55, signal: "tone-adjustment" });
  }

  // "write that vision" / "write a vision" — visionary narrative
  if (/\b(write|describe|paint)\s+(that\s+|a\s+|the\s+)?vision\b/i.test(q)) {
    hits.push({ class: "creative", confidence: 0.55, signal: "vision-narrative" });
  }

  return hits;
}

/** Detect multi-step planning / agentic decomposition intent. */
function _planningSignals(q: string): HeuristicHit[] {
  const hits: HeuristicHit[] = [];

  if (/\b(plan|strategy|roadmap|approach|framework)\s+(for|to)\b/i.test(q)) {
    hits.push({ class: "multi_step_planning", confidence: 0.6, signal: "plan-noun" });
  }

  if (/\b(step[\s-]by[\s-]step|step 1|first\s+.{1,30},?\s+then\s+.{1,30}then\b)/i.test(q)) {
    hits.push({ class: "multi_step_planning", confidence: 0.65, signal: "sequential-structure" });
  }

  if (/\b(how\s+(do|can|should)\s+i\s+(set\s+up|deploy|migrate|configure|architect|design|implement)\b)/i.test(q)) {
    hits.push({ class: "multi_step_planning", confidence: 0.5, signal: "setup-how-to" });
  }

  if (/\b(workflow|pipeline|process|procedure|checklist|playbook|runbook)\b/i.test(q)) {
    hits.push({ class: "multi_step_planning", confidence: 0.4, signal: "workflow-noun" });
  }

  // "What are the steps" — strong planning signal (overrides the retrieval_only "what-are" stem)
  if (/\b(what\s+(are|is)\s+the\s+steps?)\b/i.test(q)) {
    hits.push({ class: "multi_step_planning", confidence: 0.75, signal: "steps-question" });
  }

  // "First X, then Y, then Z" — first-then sequential pattern
  if (/\bfirst\s+.{3,50},?\s+then\b/i.test(q)) {
    hits.push({ class: "multi_step_planning", confidence: 0.65, signal: "first-then-sequence" });
  }

  return hits;
}

/** Detect pure factual retrieval intent. */
function _retrievalSignals(q: string, wordCount: number): HeuristicHit[] {
  const hits: HeuristicHit[] = [];

  // Single-word or 2-word queries without clear question structure are ambiguous → no signal
  // (prevents "Help", "Fix it" from being falsely classified as retrieval_only)
  if (wordCount <= 2) {
    return hits;  // Too ambiguous for retrieval classification
  }

  // Classic factual question words at start — these get strong retrieval signal
  if (/^(what\s+is|what\s+are|who\s+is|who\s+are|when\s+(is|was|did)|where\s+is|define|what\s+does|how\s+much|how\s+many)\b/i.test(q.trim())) {
    hits.push({ class: "retrieval_only", confidence: 0.65, signal: "factual-question-stem" });
  }

  // Short queries (3-8 words) with no synthesis verbs are likely lookups
  if (wordCount >= 3 && wordCount <= SHORT_QUERY_WORDS) {
    hits.push({ class: "retrieval_only", confidence: 0.35, signal: "short-query" });
  }

  // Lookup/find patterns
  if (/\b(look\s+up|find|show\s+me|tell\s+me|give\s+me)\s+(the|a)?\s*(definition|list|value|number|date|name|id)\b/i.test(q)) {
    hits.push({ class: "retrieval_only", confidence: 0.55, signal: "lookup-pattern" });
  }

  // Single-concept queries (no synthesis/action verbs) — only for 3+ words
  // Extended list includes planning/deployment verbs so "steps to deploy" doesn't get this signal
  const synthesisVerbs = /\b(analyze|compare|evaluate|explain|discuss|design|create|implement|build|write|plan|deploy|configure|set\s+up|migrate|install|refactor|optimize|architect|integrate)\b/i;
  // Imperative verbs at the start of a query suggest action, not retrieval
  const imperativeStart = /^(make|fix|update|change|improve|add|remove|delete|move)\b/i;
  if (!synthesisVerbs.test(q) && !imperativeStart.test(q.trim()) && wordCount >= 3 && wordCount <= 12) {
    hits.push({ class: "retrieval_only", confidence: 0.30, signal: "no-synthesis-short" });
  }

  return hits;
}

/** Detect complex reasoning intent (default for ambiguous medium/long queries). */
function _reasoningSignals(q: string, wordCount: number): HeuristicHit[] {
  const hits: HeuristicHit[] = [];

  if (/\b(why|how\s+(does|do|did|can|should)|explain|analyze|compare|evaluate|assess|pros\s+and\s+cons|trade[\s-]offs?)\b/i.test(q)) {
    hits.push({ class: "reasoning_required", confidence: 0.5, signal: "reasoning-verb" });
  }

  if (/\b(difference\s+between|versus|vs\.?|compared?\s+to|advantages?\s+(of|over)|disadvantages?)\b/i.test(q)) {
    hits.push({ class: "reasoning_required", confidence: 0.55, signal: "comparison-pattern" });
  }

  if (wordCount >= LONG_QUERY_WORDS) {
    hits.push({ class: "reasoning_required", confidence: 0.3, signal: "long-query" });
  }

  if (/\b(should\s+(i|we|you)|would\s+you\s+recommend|which\s+is\s+better|what\s+would\s+happen\s+if)\b/i.test(q)) {
    hits.push({ class: "reasoning_required", confidence: 0.55, signal: "recommendation-question" });
  }

  return hits;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregate heuristic hits: sum confidence per class, normalize within class
 * by capping at 1.0. Winner = highest aggregate.
 */
function _aggregate(hits: HeuristicHit[]): Map<QueryClass, number> {
  const totals = new Map<QueryClass, number>();
  for (const hit of hits) {
    totals.set(hit.class, Math.min(1.0, (totals.get(hit.class) ?? 0) + hit.confidence));
  }
  return totals;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a member query string into a QueryClass using deterministic heuristics.
 *
 * Returns:
 *   - class: the winning task class (or "uncertain" if no class exceeds threshold)
 *   - confidence: aggregate score of the winning class [0..1]
 *   - signals: list of heuristic rule names that fired
 */
export function classifyQuery(query: string): ClassifiedQuery {
  const trimmed = query.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  const allHits: HeuristicHit[] = [
    ..._codeSignals(trimmed),
    ..._creativeSignals(trimmed),
    ..._planningSignals(trimmed),
    ..._retrievalSignals(trimmed, wordCount),
    ..._reasoningSignals(trimmed, wordCount),
  ];

  const totals = _aggregate(allHits);

  if (totals.size === 0) {
    return {
      query,
      class: "uncertain",
      confidence: 0,
      signals: ["no-heuristics-fired"],
    };
  }

  // Find winner
  let winnerClass: QueryClass = "uncertain";
  let winnerConfidence = 0;
  for (const [cls, conf] of totals.entries()) {
    if (conf > winnerConfidence) {
      winnerConfidence = conf;
      winnerClass = cls;
    }
  }

  // Apply uncertain threshold
  if (winnerConfidence < UNCERTAIN_THRESHOLD) {
    winnerClass = "uncertain";
  }

  const firedSignals = allHits
    .filter((h) => h.class === winnerClass)
    .map((h) => h.signal);

  return {
    query,
    class: winnerClass,
    confidence: Math.round(winnerConfidence * 1000) / 1000,
    signals: firedSignals.length > 0 ? firedSignals : allHits.map((h) => h.signal),
  };
}
