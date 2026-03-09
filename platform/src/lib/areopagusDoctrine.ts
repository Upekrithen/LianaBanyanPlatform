/**
 * AREOPAGUS DOCTRINE ENGINE
 * ==========================
 * Data layer for the doctrine-based knowledge system.
 * Organized by BELIEF at divergence points, NOT by denomination.
 *
 * Three Columns: Believed | Taught | Practiced
 * Dictionary: Linked terms with all definitions per tradition
 * CTA: Empty Column 3 → Calls to Action → 16 Initiatives
 *
 * Ethos: "Say what you Do. Do what you Say."
 * NOT a place to argue about God. A place to learn, verify, and ACT.
 *
 * Innovation #1517 — Areopagus Doctrine Engine (Session 7D)
 */

// ─── DOMAIN TYPES ───

export type DoctrineDomain =
  | "theology"       // Nature of God, Trinity, monotheism vs polytheism
  | "soteriology"    // Salvation, redemption, afterlife
  | "ecclesiology"   // Church structure, authority, governance
  | "sacraments"     // Baptism, communion, rituals
  | "ethics"         // Moral law, just war, dietary rules
  | "eschatology"    // End times, judgment, heaven/hell
  | "cosmology"      // Creation, evolution, nature of reality
  | "epistemology"   // How do we know? Scripture, tradition, reason, experience
  | "practice"       // Worship style, prayer, fasting, dress
  | "anthropology"   // Nature of humanity, free will, original sin
  | "pneumatology"   // Holy Spirit, spiritual gifts, mysticism
  | "hermeneutics";  // How to interpret scripture/sacred texts

export type DoctrineScope =
  | "universal"      // Applies across all belief systems
  | "abrahamic"      // Judaism, Christianity, Islam
  | "christian"      // All Christian traditions
  | "eastern"        // Buddhism, Hinduism, Taoism, etc.
  | "indigenous"     // Indigenous and traditional religions
  | "philosophical"  // Deism, existentialism, stoicism, etc.
  | "esoteric"       // Mysticism, occult, spiritualism, etc.
  | "secular"        // Atheism, Agnosticism, Secular Humanism, Rationalism
  | "syncretic"      // Baha'i, Unitarian Universalism, New Age, Theosophy
  | "adversarial";   // LaVeyan Satanism, Theistic Satanism, Luciferianism

export type EvidenceType =
  | "scripture"      // "The Bible says X in Chapter Y Verse Z"
  | "tradition"      // "This is what the Church has always taught"
  | "reason"         // "Philosophical/logical argument"
  | "experience"     // "Personal testimony / witnessing"
  | "scientific"     // "Scientific evidence supports/contradicts"
  | "historical"     // "Historical records/archaeology show"
  | "parental"       // "Raised in this tradition"
  | "societal"       // "Cultural/community expectation"
  | "revelation"     // "Direct divine communication claimed"
  | "authority"      // "Church/clergy/imam/rabbi teaches this"
  | "pragmatic"      // "It works / produces good outcomes"
  | "aesthetic";     // "Beauty/art/nature points to this"

export type ScholarLevel =
  | "strong_consensus"    // Academic scholars widely agree
  | "majority_view"       // Most scholars agree, some dissent
  | "debated"             // Active scholarly disagreement
  | "minority_view"       // Few scholars support, many laypeople do
  | "no_scholarly_basis"  // No academic support (popular belief only)
  | "interdisciplinary";  // Crosses disciplines, no single consensus

export type ScriptureCanon =
  | "hebrew_bible"        | "new_testament"     | "deuterocanonical"
  | "quran"               | "hadith"            | "vedas"
  | "upanishads"          | "bhagavad_gita"     | "tripitaka"
  | "tao_te_ching"        | "book_of_mormon"    | "avesta"
  | "guru_granth_sahib"   | "other";

export type DepthLevel = "overview" | "standard" | "deep" | "scholarly";

export type DisputeStatus = "consensus" | "active_debate" | "disputed" | "fringe";

// ─── CORE INTERFACES ───

export interface DoctrineBranch {
  id: string;
  slug: string;
  title: string;
  description: string;
  parentBranchId: string | null;
  divergencePoint: string;
  divergenceDate: string | null;
  divergenceEvent: string | null;
  domain: DoctrineDomain;
  scope: DoctrineScope;
  depthLevel: number;               // 0 = root, 1 = major split, etc.
  locReference: string | null;      // Library of Congress classification
  scholarConsensus: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DoctrinalPosition {
  id: string;
  branchId: string;
  positionLabel: string;            // e.g. "Immersion Only"

  // THE THREE COLUMNS
  believed: string;
  taught: string;
  practiced: string | null;         // null → triggers CTA

  // Who holds this position
  adherentGroups: AdherentGroup[];
  estimatedAdherents: number | null;

  // Evidence basis
  evidenceBasis: EvidenceBasis[];

  // Scholar distinction
  scholarSupport: ScholarLevel;
  scholarNotes: string | null;
  popularNotes: string | null;

  // Sources
  scriptureReferences: ScriptureRef[];
  historicalSources: HistoricalRef[];
  locReferences: string[];

  // Dictionary links (positions in believed/taught text that link to terms)
  keyTermLinks: DictionaryLink[];

  // Quality
  qualityScore: number;
  disputeStatus: DisputeStatus;

  // CTA (when practiced is null/empty)
  callToAction: CallToAction | null;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AdherentGroup {
  name: string;
  tradition: string;
  estimatedMembers: number | null;
  region: string | null;
  foundedDate: string | null;
}

export interface EvidenceBasis {
  type: EvidenceType;
  description: string;
  weight: "primary" | "secondary" | "supporting";
  citations: string[];
}

export interface ScriptureRef {
  canon: ScriptureCanon;
  book: string;
  chapter: number | null;
  verse: string | null;
  translation: string | null;
  originalLanguage: string | null;
  interpretationNotes: string | null;
}

export interface HistoricalRef {
  title: string;
  author: string;
  year: number | null;
  locClassification: string | null;
  doi: string | null;
  peerReviewed: boolean;
  source: "academic_journal" | "book" | "encyclopedia" | "primary_source" | "archaeology" | "lecture";
}

// ─── DICTIONARY ───

export interface AreopagusTerm {
  id: string;
  term: string;                     // "eis", "baptizo", "ecclesia"
  originalLanguage: string;         // "Greek", "Hebrew", "Arabic"
  originalScript: string;           // "εἰς", "כנסיה"
  transliteration: string;
  pronunciation: string | null;
  definitions: TermDefinition[];
  scriptureOccurrences: ScriptureOccurrence[];
  rootWord: string | null;
  cognates: string[];
  historicalEvolution: string | null;
  lexiconEntries: LexiconEntry[];
  locClassification: string | null;
  qualityScore: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TermDefinition {
  id: string;
  definition: string;               // "for the purpose of"
  usageContext: string;
  traditions: string[];              // ["Church of Christ", "Catholic"]
  doctrinalImplication: string;
  lexiconSupport: string[];
  contextualArgument: string;
  scholarLevel: ScholarLevel;
  counterArguments: string[];
}

export interface ScriptureOccurrence {
  reference: ScriptureRef;
  contextQuote: string;
  translationComparison: TranslationVariant[];
}

export interface TranslationVariant {
  translation: string;              // "KJV", "NIV", "ESV"
  rendering: string;                // "for the remission"
  definitionApplied: string;        // TermDefinition ID
}

export interface LexiconEntry {
  lexiconName: string;              // "BDAG", "Thayer's", "Strong's"
  entryNumber: string;
  definition: string;
  isAcademicStandard: boolean;
}

export interface DictionaryLink {
  termId: string;
  startOffset: number;
  endOffset: number;
  displayText: string;
  definitionUsed: string | null;    // Which definition THIS tradition uses
}

// ─── CALL TO ACTION ───

export interface CallToAction {
  message: string;
  connectedInitiatives: InitiativeLink[];
  activeCampaigns: CampaignLink[];
}

export interface InitiativeLink {
  initiativeNumber: number;
  initiativeName: string;
  relevance: string;
  actionUrl: string;
}

export interface CampaignLink {
  campaignId: string;
  campaignName: string;
  actionUrl: string;
}

// ─── PRACTICAL QUESTIONS (Dell Decision Matrix) ───

export interface PracticalQuestion {
  id: string;
  question: string;
  domain: DoctrineDomain;
  scope: DoctrineScope;
  relatedBranches: string[];
  positions: PracticalPosition[];
  equalTimeStatus: "balanced" | "needs_more_voices" | "under_review";
}

export interface PracticalPosition {
  id: string;
  positionLabel: string;
  summary: string;
  believed: string;
  taught: string;
  practiced: string | null;
  traditions: string[];
  notableFigures: string[];
  evidenceBasis: EvidenceBasis[];
  scriptureRefs: ScriptureRef[];
  steelmanOpposing: string;
  scholarLevel: ScholarLevel;
}

// ─── CONTRIBUTOR ───

export interface AreopagusStamp {
  id: string;
  stampType: AreopagusStampType;
  earnedAt: string;
  branchId: string | null;
  value: number;
}

export type AreopagusStampType =
  | "first_contribution"
  | "source_verified"
  | "scholar_endorsed"
  | "balanced_voice"
  | "steelman_master"
  | "archaeological_link"
  | "loc_reference_added"
  | "dispute_resolved"
  | "deep_dive"
  | "cross_tradition"
  | "community_trust";

// ─── VERIFICATION NETWORK (Rook R-019 Constitution Integration) ───
// No council. No political seats. No elections.
// Badge-based recognition earned through stamps.
// Harper Guild as neutral referee.

export type VerificationBadge =
  | "contributor"      // Has made at least 1 contribution
  | "insider"          // Recognized by tradition as knowledgeable representative
  | "reviewer"         // Has verified sources, earned source_verified stamps
  | "steward"          // Has resolved disputes, earned balanced_voice stamps
  | "arbiter";         // Has deep_dive + cross_tradition + community_trust stamps

export const VERIFICATION_BADGE_REQUIREMENTS: Record<VerificationBadge, {
  label: string;
  description: string;
  requiredStamps: { type: AreopagusStampType; minCount: number }[];
  minTotalValue: number;
}> = {
  contributor: {
    label: "Contributor",
    description: "Has made at least one verified contribution to the Areopagus",
    requiredStamps: [{ type: "first_contribution", minCount: 1 }],
    minTotalValue: 1,
  },
  insider: {
    label: "Tradition Insider",
    description: "Recognized representative of a specific tradition",
    requiredStamps: [
      { type: "first_contribution", minCount: 1 },
      { type: "community_trust", minCount: 1 },
    ],
    minTotalValue: 10,
  },
  reviewer: {
    label: "Academic Reviewer",
    description: "Has verified sources and earned source verification stamps",
    requiredStamps: [
      { type: "source_verified", minCount: 3 },
      { type: "scholar_endorsed", minCount: 1 },
    ],
    minTotalValue: 25,
  },
  steward: {
    label: "Dialogue Steward",
    description: "Has demonstrated balanced perspective and resolved disputes",
    requiredStamps: [
      { type: "balanced_voice", minCount: 3 },
      { type: "steelman_master", minCount: 2 },
      { type: "dispute_resolved", minCount: 1 },
    ],
    minTotalValue: 50,
  },
  arbiter: {
    label: "Arbiter",
    description: "Highest recognition — deep knowledge across traditions with community trust",
    requiredStamps: [
      { type: "deep_dive", minCount: 3 },
      { type: "cross_tradition", minCount: 3 },
      { type: "community_trust", minCount: 5 },
      { type: "dispute_resolved", minCount: 3 },
    ],
    minTotalValue: 100,
  },
};

/**
 * Calculate which badge a contributor has earned based on their stamps.
 */
export function calculateBadge(stamps: AreopagusStamp[]): VerificationBadge | null {
  const stampCounts: Record<string, number> = {};
  let totalValue = 0;

  for (const stamp of stamps) {
    stampCounts[stamp.stampType] = (stampCounts[stamp.stampType] || 0) + 1;
    totalValue += stamp.value;
  }

  // Check badges from highest to lowest
  const badgeOrder: VerificationBadge[] = ['arbiter', 'steward', 'reviewer', 'insider', 'contributor'];

  for (const badge of badgeOrder) {
    const requirements = VERIFICATION_BADGE_REQUIREMENTS[badge];
    if (totalValue < requirements.minTotalValue) continue;

    const meetsAll = requirements.requiredStamps.every(
      req => (stampCounts[req.type] || 0) >= req.minCount
    );

    if (meetsAll) return badge;
  }

  return null;
}

// ─── AREOPAGUS CONTENT MODES (Constitution Article II) ───

export type AreopagusContentMode =
  | "mode_a"    // Internal self-description: tradition describes itself
  | "mode_b"    // External/academic: outsider or scholar analysis
  | "mode_c";   // Dialogue/case: cross-tradition conversation

export const CONTENT_MODE_CONFIG: Record<AreopagusContentMode, {
  label: string;
  description: string;
  whoCanWrite: string;
  reviewProcess: string;
}> = {
  mode_a: {
    label: "Self-Description",
    description: "A tradition describes its own beliefs, teachings, and practices",
    whoCanWrite: "Tradition Insiders (insider badge) or verified practitioners",
    reviewProcess: "Reviewed by other insiders of the same tradition",
  },
  mode_b: {
    label: "Academic/External",
    description: "Scholarly or outsider analysis of a tradition's positions",
    whoCanWrite: "Academic Reviewers (reviewer badge) or verified scholars",
    reviewProcess: "Peer-reviewed by scholars and fact-checked by insiders",
  },
  mode_c: {
    label: "Dialogue/Case Study",
    description: "Cross-tradition conversations, real-world case studies, comparative analysis",
    whoCanWrite: "Dialogue Stewards (steward badge) or above",
    reviewProcess: "Reviewed by stewards from ALL represented traditions",
  },
};

// ─── FOUNDATIONAL ROOT QUESTIONS ───
// These go ABOVE all doctrine domains — they are the questions
// from which all doctrinal positions ultimately flow.

export const FOUNDATIONAL_QUESTIONS: Array<{
  id: string;
  question: string;
  domain: DoctrineDomain;
  scope: DoctrineScope;
  positions: string[];
  realWorldConsequence: string;
}> = [
  {
    id: "root-god-exists",
    question: "Does God Exist?",
    domain: "theology",
    scope: "universal",
    positions: [
      "YES — Theism (monotheism, polytheism, pantheism, deism)",
      "NO — Atheism (materialist, existentialist, nihilist)",
      "UNKNOWABLE — Agnosticism (weak and strong)",
      "WRONG QUESTION — Non-theistic frameworks (Buddhism, Taoism)",
    ],
    realWorldConsequence: "This question determines the entire structure of moral reasoning, law, governance, education, and human rights frameworks in every civilization.",
  },
  {
    id: "root-spiritual-realm",
    question: "Is There a Spiritual Realm?",
    domain: "cosmology",
    scope: "universal",
    positions: [
      "YES — Supernaturalism",
      "NO — Naturalism / Materialism",
      "IT'S ALL SPIRITUAL — Panpsychism, Animism",
    ],
    realWorldConsequence: "Determines whether prayer, meditation, rituals, and spiritual practices are seen as meaningful or empty. Shapes healthcare, mental health treatment, and education policy.",
  },
  {
    id: "root-bible-true",
    question: "Is the Bible True?",
    domain: "hermeneutics",
    scope: "abrahamic",
    positions: [
      "LITERALLY TRUE — Biblical Literalism / Inerrancy",
      "INSPIRED BUT NOT LITERAL — Biblical Inspiration (mainstream)",
      "HISTORICALLY VALUABLE BUT NOT DIVINE — Academic / Critical",
      "ONE OF MANY SACRED TEXTS — Comparative Religion view",
      "NO — Secular / Atheist view",
    ],
    realWorldConsequence: "Young Earth vs evolution in schools. Marriage definition debates. Political movements. Scientific research funding. Medical ethics. Environmental policy.",
  },
  {
    id: "root-after-death",
    question: "What Happens After Death?",
    domain: "eschatology",
    scope: "universal",
    positions: [
      "Heaven / Hell (criteria vary by tradition)",
      "Reincarnation (Hindu, Buddhist, etc.)",
      "Annihilation / Soul Sleep",
      "Nothing — consciousness ends",
      "Unknown / Agnostic position",
    ],
    realWorldConsequence: "Shapes end-of-life care, funeral practices, estate law, suicide prevention approaches, risk-taking behavior, and martyrdom motivations.",
  },
  {
    id: "root-free-will",
    question: "Do Humans Have Free Will?",
    domain: "anthropology",
    scope: "universal",
    positions: [
      "YES — Libertarian Free Will (Arminianism, most secular philosophy)",
      "NO — Predestination / Determinism (Calvinism, hard determinism)",
      "COMPATIBILISM — Both (soft determinism, Molinism)",
      "ILLUSION — Free will is a useful fiction (some Buddhist, some neuroscience)",
    ],
    realWorldConsequence: "Criminal justice (punishment vs rehabilitation). Addiction treatment. Education methods. Political philosophy (meritocracy vs systemic analysis). Pre-millennialism + predestination shaped U.S. support for Israel's founding.",
  },
];

// ─── DEPTH LEVEL CONFIG ───

export const DEPTH_CONFIG: Record<DepthLevel, {
  label: string;
  description: string;
  showEvidence: boolean;
  showScripture: boolean;
  showScholarNotes: boolean;
  showArchaeology: boolean;
  showLOCReferences: boolean;
}> = {
  overview: {
    label: "Overview",
    description: "Quick summary — 2-3 sentences per position",
    showEvidence: false,
    showScripture: false,
    showScholarNotes: false,
    showArchaeology: false,
    showLOCReferences: false,
  },
  standard: {
    label: "Standard",
    description: "Full three columns with evidence basis",
    showEvidence: true,
    showScripture: true,
    showScholarNotes: false,
    showArchaeology: false,
    showLOCReferences: false,
  },
  deep: {
    label: "Deep Dive",
    description: "Everything including scholar notes and archaeology",
    showEvidence: true,
    showScripture: true,
    showScholarNotes: true,
    showArchaeology: true,
    showLOCReferences: false,
  },
  scholarly: {
    label: "Scholarly",
    description: "Academic-grade with full citations and LOC references",
    showEvidence: true,
    showScripture: true,
    showScholarNotes: true,
    showArchaeology: true,
    showLOCReferences: true,
  },
};

// ─── DOMAIN LABELS & ICONS ───

export const DOMAIN_LABELS: Record<DoctrineDomain, { label: string; emoji: string }> = {
  theology: { label: "Theology", emoji: "✝️" },
  soteriology: { label: "Salvation & Redemption", emoji: "🕊️" },
  ecclesiology: { label: "Church & Authority", emoji: "🏛️" },
  sacraments: { label: "Sacraments & Rituals", emoji: "🕯️" },
  ethics: { label: "Ethics & Moral Law", emoji: "⚖️" },
  eschatology: { label: "End Times & Afterlife", emoji: "🌅" },
  cosmology: { label: "Creation & Reality", emoji: "🌌" },
  epistemology: { label: "Knowledge & Revelation", emoji: "📖" },
  practice: { label: "Worship & Practice", emoji: "🙏" },
  anthropology: { label: "Human Nature", emoji: "🧬" },
  pneumatology: { label: "Spirit & Mysticism", emoji: "💨" },
  hermeneutics: { label: "Interpretation", emoji: "🔍" },
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, { label: string; emoji: string }> = {
  scripture: { label: "Scripture", emoji: "📜" },
  tradition: { label: "Tradition", emoji: "🏛️" },
  reason: { label: "Reason/Logic", emoji: "🧠" },
  experience: { label: "Experience/Testimony", emoji: "💡" },
  scientific: { label: "Scientific", emoji: "🔬" },
  historical: { label: "Historical", emoji: "📚" },
  parental: { label: "Parental/Familial", emoji: "👨‍👩‍👧‍👦" },
  societal: { label: "Societal/Cultural", emoji: "🌍" },
  revelation: { label: "Revelation", emoji: "⚡" },
  authority: { label: "Authority/Clergy", emoji: "👑" },
  pragmatic: { label: "Pragmatic", emoji: "🛠️" },
  aesthetic: { label: "Aesthetic/Beauty", emoji: "🎨" },
};

export const SCHOLAR_LEVEL_LABELS: Record<ScholarLevel, { label: string; color: string }> = {
  strong_consensus: { label: "Strong Scholarly Consensus", color: "text-green-600" },
  majority_view: { label: "Majority Scholarly View", color: "text-emerald-600" },
  debated: { label: "Actively Debated", color: "text-amber-600" },
  minority_view: { label: "Scholarly Minority View", color: "text-orange-600" },
  no_scholarly_basis: { label: "No Scholarly Basis", color: "text-red-600" },
  interdisciplinary: { label: "Interdisciplinary", color: "text-blue-600" },
};

// ─── CTA → INITIATIVE MAPPING ───

/** Corrected per Founder:
 * Let's Make Bread = business incubator (making money, NOT food)
 * Let's Make Dinner = community food
 * Let's Get Groceries = food access
 */
export const CHARITABLE_INITIATIVE_MAP: Record<string, InitiativeLink[]> = {
  "feed_hungry": [
    { initiativeNumber: 7, initiativeName: "Let's Make Dinner", relevance: "Community meal programs", actionUrl: "/initiatives/lets-make-dinner" },
    { initiativeNumber: 7, initiativeName: "Let's Get Groceries", relevance: "Food access and distribution", actionUrl: "/initiatives/lets-get-groceries" },
    { initiativeNumber: 12, initiativeName: "Household Concierge", relevance: "Household food coordination", actionUrl: "/initiatives/household-concierge" },
  ],
  "shelter_homeless": [
    { initiativeNumber: 5, initiativeName: "VSL (Voucher Short Loans)", relevance: "Housing assistance through voucher loans", actionUrl: "/initiatives/vsl" },
    { initiativeNumber: 7, initiativeName: "Let's Make Bread", relevance: "Economic empowerment through business incubation", actionUrl: "/initiatives/lets-make-bread" },
  ],
  "heal_sick": [
    { initiativeNumber: 8, initiativeName: "MSA (Medical Savings Accounts)", relevance: "Community medical savings", actionUrl: "/initiatives/msa" },
  ],
  "educate": [
    { initiativeNumber: 10, initiativeName: "Schoolhouse", relevance: "Education access and tools", actionUrl: "/initiatives/schoolhouse" },
  ],
  "environment": [
    { initiativeNumber: 15, initiativeName: "Power to the People", relevance: "Environmental and civic action", actionUrl: "/initiatives/power-to-the-people" },
  ],
  "economic_justice": [
    { initiativeNumber: 5, initiativeName: "VSL (Voucher Short Loans)", relevance: "Economic justice through accessible lending", actionUrl: "/initiatives/vsl" },
  ],
  "community": [
    { initiativeNumber: 16, initiativeName: "Seed the Quan", relevance: "Community building and connection", actionUrl: "/initiatives/seed-the-quan" },
  ],
  "truth_transparency": [
    { initiativeNumber: 0, initiativeName: "Harper Guild", relevance: "Ethics verification and truth-telling", actionUrl: "/guilds" },
  ],
  "creative_expression": [
    { initiativeNumber: 13, initiativeName: "JukeBox", relevance: "Music licensing and creative support", actionUrl: "/initiatives/jukebox" },
  ],
  "family_support": [
    { initiativeNumber: 14, initiativeName: "Family Table", relevance: "Private family operations and support", actionUrl: "/initiatives/family-table" },
  ],
};

// ─── HELPER FUNCTIONS ───

/**
 * Get CTA for an empty Column 3
 */
export function getCallToAction(
  charitableDomain: string,
): CallToAction {
  const initiatives = CHARITABLE_INITIATIVE_MAP[charitableDomain] || CHARITABLE_INITIATIVE_MAP["community"] || [];

  return {
    message: "This column is empty. Want to change that?",
    connectedInitiatives: initiatives,
    activeCampaigns: [], // Populated from database at runtime
  };
}

/**
 * Check if a position's practiced column is effectively empty
 */
export function isPracticedEmpty(practiced: string | null): boolean {
  if (!practiced) return true;
  return practiced.trim().length === 0;
}

/**
 * Get depth-appropriate fields for a position
 */
export function getVisibleFields(depth: DepthLevel) {
  return DEPTH_CONFIG[depth];
}

/**
 * Get breadcrumb trail for a doctrine branch
 */
export function getBranchBreadcrumb(
  branch: DoctrineBranch,
  allBranches: DoctrineBranch[],
): DoctrineBranch[] {
  const trail: DoctrineBranch[] = [branch];
  let current = branch;
  while (current.parentBranchId) {
    const parent = allBranches.find((b) => b.id === current.parentBranchId);
    if (!parent) break;
    trail.unshift(parent);
    current = parent;
  }
  return trail;
}

/**
 * Get child branches of a given parent
 */
export function getChildBranches(
  parentId: string | null,
  allBranches: DoctrineBranch[],
): DoctrineBranch[] {
  return allBranches.filter((b) => b.parentBranchId === parentId);
}
