/**
 * Anecdote Eblet Schema — BP058 W15 V15.5
 *
 * AnecdoteEblet: member-authored experience stories attached to Sweet Sixteen initiatives.
 * Food-class taxonomy: Pantry / Bundle / Hard-Candy (per cooperative food economy canon).
 *
 * Scope note: MENUS integration + Phoebe UI surface deferred to V16 (platform/src scope).
 */

// ─── Sweet Sixteen Initiative Reference ────────────────────────────────────────

export const SWEET_SIXTEEN_INITIATIVES = [
  "lets_make_dinner",
  "lets_get_groceries",
  "lets_go_shopping",
  "household_concierge",
  "the_family_table",
  "tatiana_schlossburg_health_accords",
  "msa",
  "defense_klaus",
  "rally_group",
  "vsl",
  "lets_make_bread",
  "harper_guild",
  "jukebox",
  "didasko",
  "power_to_the_people",
  "brass_tacks",
] as const;

export type SweetSixteenInitiative = typeof SWEET_SIXTEEN_INITIATIVES[number];

// ─── Food-Class Taxonomy ──────────────────────────────────────────────────────

/**
 * Food-class taxonomy for anecdote categorization:
 *   Pantry   — staple / recurring / foundational experience (baseline value)
 *   Bundle   — grouped / cooperative / shared experience (relational value)
 *   HardCandy — special / memorable / high-impact experience (peak value)
 */
export const FOOD_CLASS_TAGS = ["pantry", "bundle", "hard_candy"] as const;
export type FoodClassTag = typeof FOOD_CLASS_TAGS[number];

// ─── Emotion Tags ─────────────────────────────────────────────────────────────

export const EMOTION_TAGS = [
  "gratitude",
  "relief",
  "joy",
  "belonging",
  "empowerment",
  "solidarity",
  "discovery",
  "hope",
  "trust",
  "surprise",
  "neutral",
  "other",
] as const;

export type EmotionTag = typeof EMOTION_TAGS[number];

// ─── Ratification Status ──────────────────────────────────────────────────────

export const RATIFY_STATUSES = [
  "draft",        // member submitted, not yet reviewed
  "pending",      // under cooperative review
  "ratified",     // accepted into canon substrate
  "returned",     // returned to member for revision
  "archived",     // preserved but not featured
] as const;

export type RatifyStatus = typeof RATIFY_STATUSES[number];

// ─── AnecdoteEblet Interface ──────────────────────────────────────────────────

/**
 * AnecdoteEblet — extends base Eblet schema for member-authored experience stories.
 *
 * An anecdote is a short, first-person account of how a cooperative initiative
 * touched a member's life. Anecdotes are the human substrate — "people ARE the substrate."
 */
export interface AnecdoteEblet {
  // ── Identity ──────────────────────────────────────────────────────────────
  anecdote_id: string;        // unique ID: anecdote_<uuid-short> (e.g., anecdote_a1b2c3d4)
  member_id: string;          // cooperative member ID (opaque reference, not PII)

  // ── Initiative Reference ──────────────────────────────────────────────────
  initiative: SweetSixteenInitiative;  // which Sweet Sixteen initiative this anecdote is about
  initiative_label?: string;           // human-readable label for display (denormalized)

  // ── Content ───────────────────────────────────────────────────────────────
  experience_text: string;    // member's first-person narrative (max 2,000 chars)
  title?: string;             // optional short title (max 80 chars)

  // ── Classification ────────────────────────────────────────────────────────
  emotion_tag: EmotionTag;                   // primary emotional quality of the experience
  food_class_tag: FoodClassTag;             // Pantry / Bundle / Hard-Candy taxonomy
  additional_emotions?: EmotionTag[];        // secondary emotions (optional)

  // ── Temporal ──────────────────────────────────────────────────────────────
  date_experienced: string;   // ISO 8601 date: YYYY-MM-DD (when experience happened)
  date_submitted: string;     // ISO 8601 datetime: when member submitted this anecdote

  // ── Workflow ──────────────────────────────────────────────────────────────
  ratify_status: RatifyStatus;
  ratified_at?: string;       // ISO 8601 datetime (when status became "ratified")
  ratified_by?: string;       // AI agent or human reviewer ID

  // ── Substrate Integration ─────────────────────────────────────────────────
  pearl_id?: string;          // Pearl ID if this anecdote has been Pearl-anchored
  soccerball_id?: string;     // Soccerball handle if bundled with other anecdotes

  // ── Metadata ──────────────────────────────────────────────────────────────
  schema_version: 1;          // fixed at 1 for this schema version
  is_public: boolean;         // whether member consents to public display
  anonymize_member?: boolean; // whether to strip member_id on public display
}

// ─── Validation ───────────────────────────────────────────────────────────────

export class AnecdoteValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(`AnecdoteEblet validation error [${field}]: ${message}`);
    this.name = "AnecdoteValidationError";
  }
}

/**
 * validateAnecdote — validate raw data as AnecdoteEblet.
 * Throws AnecdoteValidationError with field name on first failure.
 * Returns typed AnecdoteEblet on success.
 */
export function validateAnecdote(data: unknown): AnecdoteEblet {
  if (typeof data !== "object" || data === null) {
    throw new AnecdoteValidationError("root", "data must be a non-null object");
  }

  const d = data as Record<string, unknown>;

  // Required string fields
  const requiredStrings = [
    "anecdote_id",
    "member_id",
    "initiative",
    "experience_text",
    "emotion_tag",
    "food_class_tag",
    "date_experienced",
    "date_submitted",
    "ratify_status",
  ] as const;

  for (const field of requiredStrings) {
    if (typeof d[field] !== "string" || (d[field] as string).length === 0) {
      throw new AnecdoteValidationError(field, `must be a non-empty string`);
    }
  }

  // Initiative enum check
  if (!SWEET_SIXTEEN_INITIATIVES.includes(d.initiative as SweetSixteenInitiative)) {
    throw new AnecdoteValidationError(
      "initiative",
      `must be one of: ${SWEET_SIXTEEN_INITIATIVES.join(", ")}`
    );
  }

  // Emotion tag check
  if (!EMOTION_TAGS.includes(d.emotion_tag as EmotionTag)) {
    throw new AnecdoteValidationError(
      "emotion_tag",
      `must be one of: ${EMOTION_TAGS.join(", ")}`
    );
  }

  // Food class check
  if (!FOOD_CLASS_TAGS.includes(d.food_class_tag as FoodClassTag)) {
    throw new AnecdoteValidationError(
      "food_class_tag",
      `must be one of: ${FOOD_CLASS_TAGS.join(", ")}`
    );
  }

  // Ratify status check
  if (!RATIFY_STATUSES.includes(d.ratify_status as RatifyStatus)) {
    throw new AnecdoteValidationError(
      "ratify_status",
      `must be one of: ${RATIFY_STATUSES.join(", ")}`
    );
  }

  // Length checks
  const text = d.experience_text as string;
  if (text.length > 2000) {
    throw new AnecdoteValidationError("experience_text", "must be ≤ 2,000 characters");
  }

  if (d.title !== undefined && (typeof d.title !== "string" || (d.title as string).length > 80)) {
    throw new AnecdoteValidationError("title", "must be a string ≤ 80 characters");
  }

  // Boolean checks
  if (typeof d.is_public !== "boolean") {
    throw new AnecdoteValidationError("is_public", "must be a boolean");
  }

  // Schema version
  if (d.schema_version !== 1) {
    throw new AnecdoteValidationError("schema_version", "must be 1");
  }

  // Date format checks (ISO 8601)
  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(d.date_experienced as string)) {
    throw new AnecdoteValidationError("date_experienced", "must start with YYYY-MM-DD");
  }
  if (!dateRegex.test(d.date_submitted as string)) {
    throw new AnecdoteValidationError("date_submitted", "must start with YYYY-MM-DD");
  }

  return data as AnecdoteEblet;
}

/**
 * createAnecdoteDraft — factory for creating a draft AnecdoteEblet.
 * Uses sensible defaults for workflow fields.
 */
export function createAnecdoteDraft(params: {
  anecdote_id: string;
  member_id: string;
  initiative: SweetSixteenInitiative;
  experience_text: string;
  emotion_tag: EmotionTag;
  food_class_tag: FoodClassTag;
  date_experienced: string;
  is_public?: boolean;
  title?: string;
}): AnecdoteEblet {
  return {
    anecdote_id: params.anecdote_id,
    member_id: params.member_id,
    initiative: params.initiative,
    experience_text: params.experience_text,
    emotion_tag: params.emotion_tag,
    food_class_tag: params.food_class_tag,
    date_experienced: params.date_experienced,
    date_submitted: new Date().toISOString(),
    ratify_status: "draft",
    is_public: params.is_public ?? false,
    schema_version: 1,
    ...(params.title ? { title: params.title } : {}),
  };
}
