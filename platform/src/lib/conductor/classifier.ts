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

/**
 * LB Platform domain categories — sourced from R11 (K471 sealed bank).
 * Maps to the 6 question categories used in the cross-vendor memory benchmark.
 * When detected, the router applies R11 category-aware priors to the ranking.
 *
 * Routing relevance (R11 empirical findings, K444/B129):
 *   economic_governance  → Gemini 22% HOT (avoid); Perplexity/OpenAI/Claude 89–100%
 *   member_journey       → Gemini + Claude Sonnet 50% HOT (de-rank); Perplexity/OpenAI 100%
 *   canonical_statistics → Gemini 56% HOT (de-rank); others 100%
 *   architecture_mechanics → Gemini 50% HOT; others 88–100%
 *   historical_precedent → Gemini 62% HOT; others 100%
 *   regulatory_compliance → Gemini 62% HOT; others 88–100%
 */
export type LbDomainCategory =
  | "economic_governance"    // Governance rules, cooperative economics, voting, financial policy
  | "member_journey"         // Member onboarding, benefits, progression, experience
  | "canonical_statistics"   // Specific numbers, metrics, statistics, counts
  | "architecture_mechanics" // System architecture, technical mechanisms, how-it-works
  | "historical_precedent"   // Historical data, past events, precedents, timelines
  | "regulatory_compliance"; // Regulations, legal requirements, compliance standards

export interface ClassifiedQuery {
  query: string;
  class: QueryClass;
  confidence: number;           // 0..1 — aggregate heuristic confidence
  signals: string[];            // which heuristic rules fired, for provenance
  domainCategory: LbDomainCategory | null;  // LB domain category if detected; null if not
  domainConfidence: number;     // 0..1 — confidence that domain category is correct
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
// Domain category detection
// Detects LB Platform domain signals independent of task class.
// Each fired signal contributes to one LbDomainCategory bucket.
// The highest-confidence bucket becomes the domainCategory output.
// ---------------------------------------------------------------------------

interface DomainHit {
  category: LbDomainCategory;
  confidence: number;
  signal: string;
}

function _domainSignals(q: string): DomainHit[] {
  const hits: DomainHit[] = [];

  // ── economic_governance ────────────────────────────────────────────────
  if (/\b(governance|cooperative\s+governance|federated|federation|vote\s+threshold|voting|constitutional\s+amendment|ledger\s+standard|economic\s+polic|equity\s+stake|governance\s+model|governance\s+rule|profit[\s-]shar|distribution\s+(formula|rule)|creator\s+(keep|share|earn|split)|platform\s+margin|member[\s-]owner|cooperative\s+econom)\b/i.test(q)) {
    hits.push({ category: "economic_governance", confidence: 0.65, signal: "governance-term" });
  }
  if (/\b(83\.3%|83\.3|416\.67|\$416|prov\s+14|patent|provisional|filing|crown\s+jewel|innovation\s+count|a&a\s+formal)\b/i.test(q)) {
    hits.push({ category: "economic_governance", confidence: 0.6, signal: "lb-governance-number" });
  }
  if (/\b(16\.7%|cost\s+\+\s*20%?|platform\s+fee|transaction\s+fee|royalt|licensing\s+fee)\b/i.test(q)) {
    hits.push({ category: "economic_governance", confidence: 0.55, signal: "economic-fee-term" });
  }

  // ── member_journey ─────────────────────────────────────────────────────
  if (/\b(member[\s-]journey|onboard(ing)?|sign[\s-]?(up|in)|membership|join|register|red\s+carpet|welcome|first[\s-]time\s+member|member\s+experience|get\s+started|new\s+member|member\s+benefit|member[\s-]owner\s+(join|sign))\b/i.test(q)) {
    hits.push({ category: "member_journey", confidence: 0.65, signal: "member-journey-term" });
  }
  if (/\b(my\s+account|my\s+profile|my\s+membership|my\s+balance|member\s+dashboard|helm|member\s+portal|member\s+id)\b/i.test(q)) {
    hits.push({ category: "member_journey", confidence: 0.55, signal: "member-portal-term" });
  }
  if (/\b(\$5\/year|\$5\s+per\s+year|membership\s+(fee|cost|price|dues)|annual\s+(fee|membership))\b/i.test(q)) {
    hits.push({ category: "member_journey", confidence: 0.6, signal: "membership-fee-term" });
  }

  // ── canonical_statistics ───────────────────────────────────────────────
  if (/\b(how\s+many|how\s+much|what\s+percent|what\s+is\s+the\s+(count|number|total|amount|rate|percentage)|how\s+large|how\s+big|statistic|metric)\b/i.test(q)) {
    hits.push({ category: "canonical_statistics", confidence: 0.5, signal: "stats-question-stem" });
  }
  if (/\b(2,267|2267|225\s+crown|13\s+provisional|2,412|36\s+production|2,080|member[\s-]owner[\s-]count)\b/i.test(q)) {
    hits.push({ category: "canonical_statistics", confidence: 0.75, signal: "lb-canonical-number" });
  }
  if (/\b(total\s+(transactions?|volume|amount|spend|revenue)|transaction\s+volume|fiscal\s+year|Q[1-4]\s+\d{4}|quarter(ly)?)\b/i.test(q)) {
    hits.push({ category: "canonical_statistics", confidence: 0.5, signal: "financial-stats-term" });
  }

  // ── architecture_mechanics ──────────────────────────────────────────────
  if (/\b(how\s+(does|do)\s+.{2,40}work|architecture|substrate|indexed\s+retrieval|cathedral\s+(effect|mechanic|substrate|architecture)|scribe|stitchpunk|touchstone|eblet|seer\.py|librarian[\s-]mcp|conductor('s\s+baton)?|adapter|MCP\s+tool|MCP\s+server)\b/i.test(q)) {
    hits.push({ category: "architecture_mechanics", confidence: 0.6, signal: "architecture-term" });
  }
  if (/\b(TF[\s-]IDF|IDF|bedrock\s+eblet|synthetic\s+bridg|vocabulary\s+bridg|corpus[\s-]normalized|retrieval[\s-]augmented|RAG)\b/i.test(q)) {
    hits.push({ category: "architecture_mechanics", confidence: 0.65, signal: "retrieval-mechanics" });
  }

  // ── historical_precedent ───────────────────────────────────────────────
  if (/\b(histor(y|ical)|precedent|prior\s+to|founded|established|origin|when\s+(was|did|were)\s+.{2,40}(start|found|establish|creat|launch|begin)|first\s+(time|recorded|documented|instance)|timeline|chronolog)\b/i.test(q)) {
    hits.push({ category: "historical_precedent", confidence: 0.55, signal: "historical-term" });
  }
  if (/\b(1989|since\s+198\d|since\s+199\d|since\s+200\d|37\s+years|21\s+years|founding\s+(year|date)|formation\s+date)\b/i.test(q)) {
    hits.push({ category: "historical_precedent", confidence: 0.65, signal: "lb-historical-date" });
  }

  // ── regulatory_compliance ──────────────────────────────────────────────
  if (/\b(regulat(ion|ory|ed)|compliance|legal\s+(requirement|standard|obligation)|law|statute|rule\s+under|bylaw|article\s+of\s+incorporat|wyoming|c[\s-]corp|ein|EIN|tax|AML|KYC|SEC|FINRA|anti[\s-]money|audit\s+requirement)\b/i.test(q)) {
    hits.push({ category: "regulatory_compliance", confidence: 0.6, signal: "regulatory-term" });
  }
  if (/\b(41[\s-]2797446|liana\s+banyan\s+corporation|EIN\s+41|wyoming\s+c[\s-]corp)\b/i.test(q)) {
    hits.push({ category: "regulatory_compliance", confidence: 0.7, signal: "lb-regulatory-id" });
  }

  return hits;
}

/**
 * Aggregate domain hits; return the winning domain category and its confidence.
 * Returns null domain if no category exceeds the detection threshold.
 */
function _detectDomain(q: string): { category: LbDomainCategory | null; confidence: number } {
  const hits = _domainSignals(q);
  if (hits.length === 0) return { category: null, confidence: 0 };

  const totals = new Map<LbDomainCategory, number>();
  for (const hit of hits) {
    totals.set(hit.category, Math.min(1.0, (totals.get(hit.category) ?? 0) + hit.confidence));
  }

  let bestCat: LbDomainCategory | null = null;
  let bestConf = 0;
  for (const [cat, conf] of totals.entries()) {
    if (conf > bestConf) {
      bestConf = conf;
      bestCat = cat;
    }
  }

  // Minimum domain confidence threshold: 0.5
  if (bestConf < 0.5) return { category: null, confidence: 0 };
  return { category: bestCat, confidence: Math.round(bestConf * 1000) / 1000 };
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

  // Domain detection is independent of task class
  const domain = _detectDomain(trimmed);

  const totals = _aggregate(allHits);

  if (totals.size === 0) {
    return {
      query,
      class: "uncertain",
      confidence: 0,
      signals: ["no-heuristics-fired"],
      domainCategory: domain.category,
      domainConfidence: domain.confidence,
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
    domainCategory: domain.category,
    domainConfidence: domain.confidence,
  };
}
