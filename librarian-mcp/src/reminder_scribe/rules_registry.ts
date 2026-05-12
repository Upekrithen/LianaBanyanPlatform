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
 *  11. R-PHA-1     Pre-Hoc Permission Ask (BRICK-WALL-FIRST-HALF regression) [BP028]
 *  12. R-MS-1      Missing Surface (BRICK-WALL-SECOND-HALF regression) [BP028]
 *  13. R-REV-1     Pre-Emptive Review Pressure (REVIEW-IN-LAST-HOURS regression) [BP028]
 *  14. R-PAWN-1    dispatch_pawn-when-paste-routed (PAWN-BLIND-WORKAROUND regression) [BP028]
 *  15. R-ROOK-1    dispatch_rook-pre-restart (MCP-RESTART-NEEDED regression) [BP028]
 *  16+ (extendable via runtime loadRulesFromMemory)
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
  | "path-format"
  | "brick-wall"      // BRICK-WALL-FIRST-HALF / SECOND-HALF regression class [BP028]
  | "dispatch-coord"; // Pawn/Rook dispatch coordination regression class [BP028]

export type OverrideClass =
  | "free"             // user can override at no cost
  | "marks-cost"       // override costs Marks (anti-thrashing; logged)
  | "structurally-immutable"; // cannot override (FORK-class)

export type PatternType =
  | "regex"            // direct string/regex match against response text
  | "file-existence"   // verify file on disk (R-KP-2)
  | "anti-pattern"     // text should NOT contain pattern (e.g., fiat-bridge)
  | "path-format"      // path must have specific prefix/format
  | "context-heuristic"; // text mention heuristic; full context-check is TODO for tool-call-record integration

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

  // ── R-PHA-1: Pre-Hoc Permission Ask (BRICK-WALL-FIRST-HALF regression) ──── [BP028]
  {
    id: "R-PHA-1",
    priority: 11,
    class: "brick-wall",
    description:
      "BRICK-WALL-FIRST-HALF regression: Bishop asks for permission before executing an action " +
      "when scope is already clear from Founder's directive. Interrogative permission-verb phrases " +
      "('Should I...?', 'May I...?', 'Want me to...?', 'Can I...?', 'Would you like me to...?') " +
      "signal uncertainty in scope-clear contexts. Bishop should fire action, surface outcome, then await ratification.",
    source:
      "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md (R-PHA-1) + Catechist R14 (BP028)",
    patterns: [
      {
        type: "anti-pattern",
        // Interrogative permission-seeking phrases followed by action-verb content up to '?'
        // Explicit alternations for "Should I|May I|Can I|Want me to|Would you like me to"
        // Use [^?]+ to absorb content between phrase and terminal '?'
        // Excluded: genuinely ambiguous routing questions are caught by engine's excluded-context logic
        pattern:
          "(?:Should\\s+I|May\\s+I|Can\\s+I|Want\\s+me\\s+to|Would\\s+you\\s+like\\s+me\\s+to)\\s+\\w[^?]*\\?",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Convert interrogative permission-ask to BRICK-WALL-FIRST-HALF action pattern.\n\n" +
      "Instead of: 'Should I read the file and search for patterns?'\n" +
      "Correct form: 'I'll read the file and search for patterns. [action-surface]. Here are [results].'\n\n" +
      "Excluded contexts (do NOT flag):\n" +
      "  - Genuinely ambiguous routing (e.g., 'Should I route to Knight or Pawn?' when both plausible)\n" +
      "  - Destructive actions requiring pre-approval (deletions, irreversible ops)\n" +
      "  - First-time encounter with novel task class (no precedent set)\n\n" +
      "Per BRICK-WALL-FIRST-HALF canon (BP005 + BP028) + Catechist R14.",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md",
    active: true,
  },

  // ── R-MS-1: Missing Surface (BRICK-WALL-SECOND-HALF regression) ────────── [BP028]
  {
    id: "R-MS-1",
    priority: 12,
    class: "brick-wall",
    description:
      "BRICK-WALL-SECOND-HALF regression: action fired (tool-call executed) without subsequent " +
      "completion-block surface showing outcome/result/error to Founder. Founder must see outcome " +
      "to ratify, redirect, or advance. Missing surface = Founder blind to action state. " +
      "Token-heuristic: response text ends within 50 tokens of final tool-call marker.",
    source:
      "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md (R-MS-1) + Catechist R14 + Token Time/Real Time canon BP028",
    patterns: [
      {
        // Heuristic: response ends abruptly with a tool-call marker and minimal follow-up text.
        // Full tool-call-record inspection is TODO (requires engine access to tool-call log).
        // Text-class trigger: tool-result boundary phrases with no subsequent surface paragraph.
        type: "context-heuristic",
        pattern:
          "(?:tool(?:\\s+call)?\\s+(?:executed|complete|done|fired|returned)|" +
          "\\[(?:read|write|edit|bash|glob|grep)\\s+call\\]|" +
          "dispatched\\s+to\\s+(?:knight|pawn|rook))\\s*\\.?\\s*$",
        flags: "gi",
      },
    ],
    correction_proposal:
      "After each action-firing tool call, surface a 2-4 sentence completion block:\n" +
      "  1. What was executed\n" +
      "  2. What the result shows (or error detail + next-step suggestion)\n" +
      "  3. Next action or decision point\n\n" +
      "Example:\n" +
      "  [read_file call]\n" +
      "  Found 47 pattern definitions in patterns.ts. 12 active; 8 deprecated; 27 BP025-BP028 era.\n" +
      "  Ready to ingest 5 new specs. Next: cross-reference Catechist R-table to assign rule IDs.\n\n" +
      "Excluded contexts:\n" +
      "  - Action is mid-flight (SEG dispatched, awaiting return — 'waiting on [X]' is acceptable)\n" +
      "  - Tool result includes inline outcome (read_file content is implicit surface)\n" +
      "  - Founder explicitly requested silent action\n\n" +
      "Per BRICK-WALL-SECOND-HALF + Token Time/Real Time canon BP028.\n" +
      "TODO: Upgrade to full tool-call-record inspection when engine supports tool-call log access.",
    override_class: "marks-cost",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md",
    active: true,
  },

  // ── R-REV-1: Pre-Emptive Review Pressure (REVIEW-IN-LAST-HOURS regression) [BP028]
  {
    id: "R-REV-1",
    priority: 13,
    class: "brick-wall",
    description:
      "REVIEW-IN-LAST-HOURS regression: Bishop asks Founder for incremental review during session " +
      "instead of stashing draft to voice-pass queue for batch review in last-hours window. " +
      "Trigger phrases: 'Want me to surface this for voice-pass?', 'Ready for your review?', " +
      "'Should I put this in the voice-pass queue?', 'Want to look this over before I...?', " +
      "'Ready to voice-pass?'. Batch review in last-hours window is faster + reduces Founder interrupt overhead.",
    source:
      "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md (R-REV-1) + Catechist R15 (BP028)",
    patterns: [
      {
        type: "anti-pattern",
        // Use [^?]* after 'before I' to absorb trailing content up to terminal '?'
        pattern:
          "(?:Want(?:\\s+me)?\\s+to\\s+surface\\s+this\\s+for\\s+voice.?pass|" +
          "Ready\\s+for\\s+your\\s+review|" +
          "Should\\s+I\\s+put\\s+this\\s+in\\s+the\\s+voice.?pass\\s+queue|" +
          "Want\\s+to\\s+look\\s+this\\s+over\\s+before\\s+I[^?]*|" +
          "Ready\\s+to\\s+voice.?pass)\\s*\\?",
        flags: "gi",
      },
    ],
    correction_proposal:
      "Convert pre-emptive review ask to autonomous draft stashing.\n\n" +
      "Instead of: 'Want me to surface this for voice-pass?'\n" +
      "Correct form: '[draft stashed in voice-pass queue for fire-time window (HH:MM MDT)]. " +
      "Founder voice-pass on [date].'\n\n" +
      "Review-in-last-hours protocol (BP028 canon):\n" +
      "  - Drafts authored incrementally throughout session → stashed in voice-pass queue\n" +
      "  - Founder voice-passes entire batch 1-2 hours before fire-time (not incrementally)\n" +
      "  - Concentrates review into tight window; improves Founder focus + reduces interrupt overhead\n\n" +
      "Excluded contexts:\n" +
      "  - Founder explicitly requested incremental review (e.g., 'check with me after each file')\n" +
      "  - Draft is blocking subsequent work (genuine scheduling constraint)\n" +
      "  - Session-end approach where incremental review is logistically necessary\n\n" +
      "Per Review-in-Last-Hours canon BP028 + Catechist R15.",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md",
    active: true,
  },

  // ── R-PAWN-1: dispatch_pawn-when-paste-routed (PAWN-BLIND-WORKAROUND regression) [BP028]
  {
    id: "R-PAWN-1",
    priority: 14,
    class: "dispatch-coord",
    description:
      "PAWN-BLIND-WORKAROUND regression: dispatch_pawn tool-call attempted when Founder has " +
      "explicitly routed task to paste-to-perplexity-web in current session. " +
      "Trigger: 'dispatch_pawn' mention in response text when session context includes " +
      "Founder paste-routing directive ('paste to perplexity', 'pawn is blind', 'perplexity web', 'workaround'). " +
      "Full tool-call-record inspection is TODO; text-class trigger surfaces the mention for correction. " +
      "Context: Founder BP028 — 'Pawn is blind without MCP. But we have a workaround, and we have deployed it.'",
    source:
      "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md (R-PAWN-1) + Catechist R16 (BP028)",
    patterns: [
      {
        // Text-class heuristic: 'dispatch_pawn' mention in response.
        // Full context-check (session history paste-routing directive present) is TODO
        // for tool-call-record integration. Pattern fires on text mention; engine caller
        // must apply session-context exclusion (first dispatch_pawn in session → no flag).
        type: "context-heuristic",
        pattern: "\\bdispatch[_\\s]pawn\\b",
        flags: "gi",
      },
    ],
    correction_proposal:
      "When Founder has indicated paste-routing preference:\n" +
      "  1. Author Pawn prompt as .md file in BISHOP_DROPZONE/02_PawnPrompts/\n" +
      "  2. Surface filename + location to Founder\n" +
      "  3. Indicate: 'Ready for paste to Perplexity web. [Filename]. [Brief description].'\n" +
      "  4. Do NOT call dispatch_pawn tool\n\n" +
      "Example:\n" +
      "  Pawn prompt authored: BISHOP_DROPZONE/02_PawnPrompts/PAWN_RESEARCH_GOLDBACH_SINGULAR_SERIES_BP028.md\n" +
      "  Ready for paste to Perplexity web. Pawn will research singular series structure for Goldbach\n" +
      "  conjecture via sonar-reasoning-pro. Estimated return: 2-4 minutes.\n\n" +
      "Excluded contexts:\n" +
      "  - First dispatch_pawn in session (no paste-routing directive yet established)\n" +
      "  - Founder has explicitly approved MCP dispatch for this task class\n" +
      "  - Task is outside web Perplexity scope (e.g., local file retrieval + analysis)\n\n" +
      "Per PAWN-BLIND-WORKAROUND canon BP028 + Catechist R16.\n" +
      "TODO: Upgrade to full tool-call-record inspection for session-context paste-routing detection.",
    override_class: "marks-cost",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md",
    active: true,
  },

  // ── R-ROOK-1: dispatch_rook-pre-restart (MCP-RESTART-NEEDED regression) ── [BP028]
  {
    id: "R-ROOK-1",
    priority: 15,
    class: "dispatch-coord",
    description:
      "MCP-RESTART-NEEDED regression: dispatch_rook tool-call attempted before librarian-mcp " +
      "restart confirmation following a recent commit that requires restart (e.g., Knight commit 5d881a4 " +
      "environment-fix). Attempting dispatch_rook before restart will hit immediate error (stale process state). " +
      "Text-class trigger: 'dispatch_rook' mention. Full tool-call-record + git-log inspection is TODO. " +
      "Fallback path: paste-to-Gemini-CLI (author Rook prompt as .md file; Founder pastes to Gemini CLI).",
    source:
      "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md (R-ROOK-1) + Catechist R17 (BP028)",
    patterns: [
      {
        // Text-class heuristic: 'dispatch_rook' mention in response.
        // Full context-check (recent commit 5d881a4 in git log + no restart confirmation) is TODO
        // for tool-call-record + git-log integration. Pattern fires on text mention; engine caller
        // must apply session-context exclusion (prior successful dispatch_rook post-restart → no flag).
        type: "context-heuristic",
        pattern: "\\bdispatch[_\\s]rook\\b",
        flags: "gi",
      },
    ],
    correction_proposal:
      "When commit requiring restart is detected:\n" +
      "  Option A: Surface restart request to Yoke:\n" +
      "    '[Knight commit 5d881a4 requires librarian-mcp restart. Ready?]'\n" +
      "    Then retry dispatch_rook after restart confirmation.\n\n" +
      "  Option B: Paste-to-Gemini-CLI fallback (immediate, no server dependency):\n" +
      "    Author Rook prompt as .md file; Founder pastes to Gemini CLI.\n" +
      "    Example: 'Rook prompt authored: BISHOP_DROPZONE/02_RookPrompts/ROOK_ANALYSIS_[TASK]_BP028.md\n" +
      "    Ready for paste to Gemini CLI. Rook will [task description].'\n\n" +
      "  Do NOT call dispatch_rook until restart is confirmed.\n\n" +
      "Excluded contexts:\n" +
      "  - librarian-mcp has been restarted post-commit (confirmed by prior successful dispatch_rook)\n" +
      "  - Dispatch is to different MCP server (not librarian-mcp)\n" +
      "  - Environment-fix commit is not yet on disk (pre-pull scenario)\n\n" +
      "Per MCP-RESTART-NEEDED canon BP028 + Catechist R17.\n" +
      "TODO: Upgrade to full git-log + tool-call-record inspection for restart-confirmation detection.",
    override_class: "free",
    blocks_response: false,
    bridle_halt_on_failure: false,
    memory_pointer: "REMINDER_SCRIBE_5_PATTERN_UPDATE_SPEC_BP028.md",
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
