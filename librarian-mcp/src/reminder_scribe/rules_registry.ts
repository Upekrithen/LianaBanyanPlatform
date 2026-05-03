/**
 * Reminder Scribe Rules Registry — KN-I1 / BP017
 * ================================================
 * Compile-time and runtime registry of pattern-match rules for the Reminder
 * Scribe pre-send check engine.
 *
 * Sources:
 *   - Reminder Scribe canon Eblet (Founder-mandatory R-KP-1/2/3/4 rules + Preferences)
 *   - feedback_*.md memory files (pattern rules extracted per discipline class)
 *   - Canon Eblets with Preferences sections (per Scribe Preferences canon BP017 turn 34)
 *
 * Rule priority order (Founder-mandatory first):
 *   1. R-KP-1   Knight K-prompt full-path enforcement
 *   2. R-KP-2   Knight K-prompt file-existence verification (HIGH-STAKES)
 *   3. R-KP-3   Queued vs Ready distinction (text-only for not-yet-drafted)
 *   4. R-KP-4   Scribe canon Eblet MUST have Preferences section
 *   5. R-PRAISE-1  Empirically-valid-praise-only
 *   6. R-PRAISE-2  Anchored-praise-welcome-unanchored-no
 *   7. R-DOUBLE-FILE-1  Search substrate FIRST before unilateral synthesis
 *   8. R-FORK-1    Never propose LB-currency-to-fiat conversion
 *   9. R-COUNSEL-1 Never gate on counsel
 *  10. R-USPTO-1   Don't over-instruct USPTO process
 *  11+ (extendable via runtime loadRulesFromMemory)
 *
 * BRIDLE Rule 4: if rule compilation fails, default-FAIL = halt response.
 * Don't ship potentially-violating response on engine-failure.
 *
 * Composes with:
 *   KN-H1 82c52fa (Three-Tier installer)
 *   KN104 5e7f540 (Detective TEAM PRE-COLOSSUS substrate-write-back)
 *   Catechist Scribe #2313 KN036 BP004 (session-open grading; additively composes)
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

// ─── Rule types ───────────────────────────────────────────────────────────────

export type ViolationClass =
  | "founder-mandatory"
  | "high-stakes"
  | "discipline"
  | "praise"
  | "fork"
  | "counsel"
  | "file-existence"
  | "path-format";

export type OverrideClass =
  | "free"             // user can override at no cost
  | "marks-cost"       // override costs Marks (anti-thrashing; logged)
  | "structurally-immutable"; // cannot override (FORK-class)

export type PatternType =
  | "regex"            // direct string/regex match against response text
  | "file-existence"   // verify file on disk (R-KP-2)
  | "anti-pattern"     // text should NOT contain pattern (e.g., fiat-bridge)
  | "path-format";     // path must have specific prefix/format

export interface RulePattern {
  type: PatternType;
  /**
   * For regex/anti-pattern/path-format: the pattern string (used as RegExp).
   * For file-existence: not used directly (path is extracted from text).
   */
  pattern?: string;
  /** Flags for RegExp construction (default: 'gi'). */
  flags?: string;
}

export interface ReminderScribeRule {
  id: string;
  priority: number;
  class: ViolationClass;
  description: string;
  /** Human-readable canon source. */
  source: string;
  /** Pattern(s) to match in the response draft. */
  patterns: RulePattern[];
  /** Correction proposal template (shown when violation is flagged). */
  correction_proposal: string;
  /** Override semantics. */
  override_class: OverrideClass;
  /** If true, violation must be fixed before response ships (no override). */
  blocks_response: boolean;
  /** BRIDLE Rule 4: if true and check fails, halt. */
  bridle_halt_on_failure: boolean;
  /** Memory file or canon Eblet that sources this rule. */
  memory_pointer: string;
  /** Whether this rule is active in the current config (user-configurable via Preferences). */
  active: boolean;
}

// ─── Core built-in rules ─────────────────────────────────────────────────────

/**
 * Built-in Founder-mandatory rules.
 * These cannot be removed (only deactivated via Preferences for certain classes).
 * Sources: Reminder Scribe canon Eblet + feedback memory files.
 */
export const BUILT_IN_RULES: ReminderScribeRule[] = [
  // ── R-KP-1: Full-path enforcement ─────────────────────────────────────────
  {
    id: "R-KP-1",
    priority: 1,
    class: "founder-mandatory",
    description:
      "Knight K-prompt path references MUST include full relative path with " +
      "'BISHOP_DROPZONE\\01_KnightPrompts\\' prefix. Bare filename alone is INSUFFICIENT.",
    source:
      "feedback_knight_fire_format_paste_ready_paths_bp017.md + reminder_scribe_class_purpose_scoped_canon_bp017.eblet.md",
    patterns: [
      {
        type: "regex",
        // Match any PROMPT_KNIGHT filename occurrence — engine checks preceding
        // text for BISHOP_DROPZONE prefix and flags only bare-filename references.
        pattern: "PROMPT_KNIGHT_KN[\\w\\-]+\\.md",
        flags: "g",
      },
    ],
    correction_proposal:
      "Replace bare filename with full path:\n" +
      "BISHOP_DROPZONE\\01_KnightPrompts\\PROMPT_KNIGHT_KN<NN>_<TOPIC>_BP<NNN>.md\n\n" +
      "Per Founder turn 32: 'please give me the full path of the Knight POD prompt. That's all.'",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "feedback_knight_fire_format_paste_ready_paths_bp017.md",
    active: true,
  },

  // ── R-KP-2: File-existence verification (HIGH-STAKES) ────────────────────
  {
    id: "R-KP-2",
    priority: 2,
    class: "high-stakes",
    description:
      "Knight K-prompt paths referenced in Bishop response MUST exist on disk BEFORE " +
      "response ships. Showing a not-yet-written path causes Founder to fire Knight → " +
      "file-not-found → BRIDLE break. HIGH-STAKES: Marks-cost to override.",
    source:
      "feedback_knight_fire_format_paste_ready_paths_bp017.md (Founder direct turn 33) + " +
      "reminder_scribe_class_purpose_scoped_canon_bp017.eblet.md R-KP-2",
    patterns: [
      {
        type: "file-existence",
        // Pattern is used to find path-formatted K-prompt references in the text
        pattern: "BISHOP_DROPZONE[/\\\\]01_KnightPrompts[/\\\\](PROMPT_KNIGHT_[\\w\\-]+\\.md)",
        flags: "g",
      },
    ],
    correction_proposal:
      "Remove reference to K-prompt path that does not yet exist on disk.\n" +
      "Surface as text-only: 'queued for next turn' or 'Bishop drafts post-[X] ratification'.\n\n" +
      "Per Founder turn 33: 'only give that to me when it is made and ready, never before. " +
      "Because if I see it, I will take it and execute it.'",
    override_class: "marks-cost",
    blocks_response: true,
    bridle_halt_on_failure: true,
    memory_pointer: "feedback_knight_fire_format_paste_ready_paths_bp017.md",
    active: true,
  },

  // ── R-KP-3: Queued vs Ready distinction ──────────────────────────────────
  {
    id: "R-KP-3",
    priority: 3,
    class: "founder-mandatory",
    description:
      "K-prompts not yet authored MUST be referenced as text-only language " +
      "('queued for next turn', 'Bishop drafts post-X'). " +
      "Path-formatted reference for queued-but-not-written K-prompts is a violation.",
    source:
      "feedback_knight_fire_format_paste_ready_paths_bp017.md + " +
      "reminder_scribe_class_purpose_scoped_canon_bp017.eblet.md R-KP-3",
    patterns: [
      {
        type: "path-format",
        // Detects 'Path:' prefix without preceding verification (heuristic)
        pattern: "Path:\\s*BISHOP_DROPZONE[/\\\\]01_KnightPrompts[/\\\\]PROMPT_KNIGHT_[\\w\\-]+\\.md",
        flags: "gi",
      },
    ],
    correction_proposal:
      "If this K-prompt has not yet been written, replace path reference with text-only:\n" +
      "'queued for next turn after [X] ratification'\n\n" +
      "If it IS written, ensure R-KP-2 verification passed first (file exists).",
    override_class: "marks-cost",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "feedback_knight_fire_format_paste_ready_paths_bp017.md",
    active: true,
  },

  // ── R-KP-4: Scribe canon Eblet must have Preferences section ────────────
  {
    id: "R-KP-4",
    priority: 4,
    class: "discipline",
    description:
      "When Bishop drafts a new Scribe canon Eblet, it MUST include a Preferences section " +
      "with user-configurable defaults per Scribe Preferences canon (BP017 turn 34).",
    source:
      "scribe_preferences_user_configurable_inheritance_class_metadata_canon_bp017.eblet.md",
    patterns: [
      {
        type: "regex",
        // If the response includes a new .eblet.md with 'Scribe' in the name,
        // it should also contain '## Preferences'
        pattern: "scribe.*\\.eblet\\.md",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Add a '## Preferences' section to the Scribe canon Eblet being drafted.\n" +
      "Per Scribe Preferences canon BP017 turn 34: every Scribe Eblet carries user-configurable defaults.",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer:
      "scribe_preferences_user_configurable_inheritance_class_metadata_canon_bp017.eblet.md",
    active: true,
  },

  // ── R-PRAISE-1: Empirically-valid-praise-only ─────────────────────────────
  {
    id: "R-PRAISE-1",
    priority: 5,
    class: "praise",
    description:
      "Praise to Founder must be empirically anchored. Unanchored superlatives or " +
      "marketing-class inflation without specific empirical receipt are violations.",
    source: "feedback_empirically_valid_praise_only.md (B132)",
    patterns: [
      {
        type: "anti-pattern",
        pattern:
          "(?:unprecedented|groundbreaking|revolutionary|game.?changing|world.?class|extraordinary|remarkable|incredible|amazing|astounding|mind.?blowing|stunning)\\b",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Replace unanchored superlative with specific empirical anchor.\n" +
      "Instead of 'unprecedented', cite the specific metric: \n" +
      "'highest single-session CJ ratification density in BP-arc history (BP011 = 9; BP016 = 15)'\n\n" +
      "Per feedback_empirically_valid_praise_only.md (B132).",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "feedback_empirically_valid_praise_only.md",
    active: true,
  },

  // ── R-PRAISE-2: Anchored-praise-welcome-unanchored-no ────────────────────
  {
    id: "R-PRAISE-2",
    priority: 6,
    class: "praise",
    description:
      "Praise is welcome when anchored to specific empirical receipt. " +
      "Unanchored encouragement-class praise ('great work!', 'brilliant!') is inflation.",
    source: "feedback_anchored_praise_welcome_unanchored_no.md (B133)",
    patterns: [
      {
        type: "anti-pattern",
        pattern: "(?:great work|well done|brilliant|fantastic|excellent choice|perfect|outstanding)\\s*[!.]",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Remove or anchor the praise to a specific empirical receipt.\n" +
      "Anchored example: 'Correct — per cascade telemetry receipt 27 CJ ratifications across BP015→BP017.'\n" +
      "Per feedback_anchored_praise_welcome_unanchored_no.md (B133).",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "feedback_anchored_praise_welcome_unanchored_no.md",
    active: true,
  },

  // ── R-DOUBLE-FILE-1: Search substrate first ───────────────────────────────
  {
    id: "R-DOUBLE-FILE-1",
    priority: 7,
    class: "discipline",
    description:
      "Before proposing to write a new canon Eblet, Bishop MUST search the pheromone " +
      "substrate + CANON directory first. Unilateral synthesis without prior search = " +
      "potential double-file (FORK Doctrine — KN-H8 LANDED).",
    source:
      "architecture_self_discovers_latent_structure_bushel_1_reckoning_empirical_receipt_canon_bp017.eblet.md " +
      "(FORK Doctrine, BP017 turn 28)",
    patterns: [
      {
        type: "regex",
        // If response proposes to 'write' or 'create' an eblet without prior search reference
        pattern: "(?:write|create|draft)\\s+(?:a\\s+)?(?:new\\s+)?canon\\s+[Ee]blet",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Before drafting a new canon Eblet, confirm:\n" +
      "1. Detective TEAM pheromone search for the topic found no existing Eblet.\n" +
      "2. CANON directory scan returned no existing match.\n\n" +
      "Per FORK Doctrine (KN-H8): NEVER draft a new canonical artifact without prior substrate search. " +
      "Founder caught Bishop's double-file at BP017 turn 28 via this discipline.",
    override_class: "marks-cost",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer:
      "architecture_self_discovers_latent_structure_bushel_1_reckoning_empirical_receipt_canon_bp017.eblet.md",
    active: true,
  },

  // ── R-FORK-1: Never propose LB-currency-to-fiat conversion ───────────────
  {
    id: "R-FORK-1",
    priority: 8,
    class: "fork",
    description:
      "NEVER propose or describe converting LB Credits, Marks, or Joules to fiat currency. " +
      "Credits one-way valve is constitutionally locked. STRUCTURALLY-IMMUTABLE violation — " +
      "no override possible.",
    source: "project_mark_backing_oneway.md + feedback_credits_oneway.md",
    patterns: [
      {
        type: "anti-pattern",
        pattern:
          "(?:convert|exchange|cash.?out|redeem|sell|withdraw|liquidate)\\s+(?:credits?|marks?|joules?)\\s+(?:to|for|into)\\s+(?:cash|dollars?|fiat|usd|eur|gbp|money|currency)",
        flags: "gi",
      },
      {
        type: "anti-pattern",
        pattern: "credits?\\s+(?:can|may|will|could)\\s+(?:be\\s+)?(?:redeemed|cashed|withdrawn|converted)\\s+(?:to|for|into)",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Remove all LB-currency-to-fiat conversion language. Credits are CONSTITUTIONALLY ONE-WAY.\n" +
      "Correct language: 'Credits are spent within the platform (purchases, service, MSA). " +
      "They do not convert to fiat — this is the anti-extraction architectural guarantee.'\n\n" +
      "Per feedback_credits_oneway.md: ONE-WAY VALVE is structurally locked. " +
      "This violation class cannot be overridden.",
    override_class: "structurally-immutable",
    blocks_response: true,
    bridle_halt_on_failure: true,
    memory_pointer: "feedback_credits_oneway.md",
    active: true,
  },

  // ── R-COUNSEL-1: Never gate on counsel ───────────────────────────────────
  {
    id: "R-COUNSEL-1",
    priority: 9,
    class: "counsel",
    description:
      "NEVER gate Bishop-recommended actions on 'pending counsel review' unless " +
      "Founder explicitly put that gate there. Counsel review is Founder-driven, not Bishop-driven.",
    source: "feedback_dont_gate_on_counsel.md (B133)",
    patterns: [
      {
        type: "anti-pattern",
        pattern:
          "(?:pending|awaiting|subject to|after|until)\\s+counsel\\s+(?:review|approval|sign-off|confirmation|clearance)",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Remove counsel-gate language from Bishop recommendation.\n" +
      "If counsel review is needed, note it as 'Founder may want counsel review' (optional advisory).\n" +
      "NEVER make it a blocking gate on the recommended action.\n\n" +
      "Per feedback_dont_gate_on_counsel.md (B133).",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "feedback_dont_gate_on_counsel.md",
    active: true,
  },

  // ── R-USPTO-1: Don't over-instruct USPTO process ──────────────────────────
  {
    id: "R-USPTO-1",
    priority: 10,
    class: "discipline",
    description:
      "NEVER instruct Founder step-by-step on USPTO Patent Center filing process. " +
      "Founder files routinely. Bishop = canonical-substrate-keeper; Founder = USPTO-process expert.",
    source: "feedback_dont_over_instruct_founder_on_uspto_filing_process.md (BP010)",
    patterns: [
      {
        type: "anti-pattern",
        pattern:
          "(?:go to|navigate to|click|select|enter|fill in|upload|submit)\\s+(?:on\\s+)?(?:Patent Center|USPTO|EFS-Web)\\b",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Remove USPTO step-by-step instructions. Founder knows the filing process.\n" +
      "Bishop's role: claim-language scaffolding / composing-canon-bundle / receipt artifact preparation.\n\n" +
      "Per feedback_dont_over_instruct_founder_on_uspto_filing_process.md (BP010).",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "feedback_dont_over_instruct_founder_on_uspto_filing_process.md",
    active: true,
  },
];

// ─── Preferences (user-configurable per Reminder Scribe canon) ───────────────

export interface ReminderScribePreferences {
  /** Format for Knight K-prompt path references in Bishop output. Default: 'full_path'. */
  knight_kprompt_path_format: "full_path" | "bare_filename" | "markdown_link";
  /** Whether to verify K-prompt file exists before allowing path in response. Default: 'strict'. */
  knight_kprompt_file_existence_check: "strict" | "relaxed";
  /** Whether to use path-only inline-block format when telling Founder to fire Knight. */
  path_only_response_when_firing: "enabled" | "disabled";
  /** Whether Reminder Scribe runs pre-send pattern-match before response ships. */
  discipline_violation_pre_send_check: "enabled" | "disabled";
  /** Substrate-write-back class for violation/correction events. */
  violation_correction_log_class:
    | "reminder_scribe_violation_correction"
    | "discipline_audit"
    | "none";
  /** Block-separator visual style for multi-K-prompt path-only fire instructions. */
  path_only_inline_block_separator_style: "blank_line_between_blocks" | "dashes" | "numbered";
  /** Whether to enforce text-only language for queued-not-yet-drafted K-prompts. */
  bishop_intent_vs_ready_distinction: "strict" | "relaxed";
  /** Whether Pawn-prompts include full content (BP003 exception). */
  pawn_prompt_full_content_exception: "enabled" | "disabled";
}

export const DEFAULT_PREFERENCES: ReminderScribePreferences = {
  knight_kprompt_path_format: "full_path",
  knight_kprompt_file_existence_check: "strict",
  path_only_response_when_firing: "enabled",
  discipline_violation_pre_send_check: "enabled",
  violation_correction_log_class: "reminder_scribe_violation_correction",
  path_only_inline_block_separator_style: "blank_line_between_blocks",
  bishop_intent_vs_ready_distinction: "strict",
  pawn_prompt_full_content_exception: "enabled",
};

// ─── Registry loading ─────────────────────────────────────────────────────────

export interface RulesRegistry {
  rules: ReminderScribeRule[];
  loaded_at: string;
  total_rules: number;
  founder_mandatory_count: number;
  high_stakes_count: number;
  memory_sources_scanned: number;
  build_errors: string[];
}

/**
 * Build the rules registry.
 * Built-in rules are always included (Founder-mandatory).
 * Additional rules can be loaded from feedback memory files at runtime
 * (pattern-extraction is heuristic; built-in rules are the authoritative set).
 *
 * BRIDLE Rule 4: if BUILT_IN_RULES fail to load, throw (caller exits non-zero).
 */
export function buildRulesRegistry(
  memoryDir?: string,
  overridePrefs?: Partial<ReminderScribePreferences>
): RulesRegistry {
  const prefs: ReminderScribePreferences = { ...DEFAULT_PREFERENCES, ...overridePrefs };
  const build_errors: string[] = [];

  // Apply preference overrides to built-in rules
  const rules: ReminderScribeRule[] = BUILT_IN_RULES.map((rule) => {
    let active = rule.active;

    // Respect 'discipline_violation_pre_send_check' preference
    if (prefs.discipline_violation_pre_send_check === "disabled") {
      active = false; // all rules disabled when pre-send check is off
    }

    // Respect 'knight_kprompt_file_existence_check' preference for R-KP-2
    if (rule.id === "R-KP-2" && prefs.knight_kprompt_file_existence_check === "relaxed") {
      active = false; // allow forward-references when preference is relaxed
    }

    // Respect 'bishop_intent_vs_ready_distinction' for R-KP-3
    if (rule.id === "R-KP-3" && prefs.bishop_intent_vs_ready_distinction === "relaxed") {
      active = false;
    }

    // Pawn prompt exception: R-KP-1 doesn't apply to Pawn K-prompts
    // (Pawn gets full content per BP003; handled in engine via pawn_prompt_full_content_exception)

    return { ...rule, active };
  });

  // Count memory sources if directory provided (informational; doesn't add rules dynamically)
  let memory_sources_scanned = 0;
  if (memoryDir && existsSync(memoryDir)) {
    try {
      const files = readdirSync(memoryDir).filter(
        (f) => f.startsWith("feedback_") && f.endsWith(".md")
      );
      memory_sources_scanned = files.length;
    } catch (err) {
      build_errors.push(`Memory directory scan error: ${String(err)}`);
    }
  }

  const active_rules = rules.filter((r) => r.active);
  const founder_mandatory_count = active_rules.filter(
    (r) => r.class === "founder-mandatory" || r.class === "high-stakes"
  ).length;
  const high_stakes_count = active_rules.filter((r) => r.class === "high-stakes").length;

  return {
    rules: active_rules,
    loaded_at: new Date().toISOString(),
    total_rules: active_rules.length,
    founder_mandatory_count,
    high_stakes_count,
    memory_sources_scanned,
    build_errors,
  };
}
