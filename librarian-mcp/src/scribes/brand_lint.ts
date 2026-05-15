/**
 * Brand-Lint Engine — K533 #27 / BP044 W1 / Founder-ratified
 * LB-STACK-BRAND-LINT-001
 *
 * Hard-enforcement gate for Armada-canon and cooperative-substrate brand identity.
 * Severity taxonomy:
 *   structural_inversion — adversarial inversion → AUTO-BLOCK + Founder-escalate
 *   wording_drift        — near-miss variation → soft-warn + Watchdog log
 *   innocent_variation   — fragment/benign shorthand → ignore
 *
 * Bypass token: [ARMADA_OVERRIDE] in payload → downgrade all structural_inversions to
 * wording_drift (for Coroner audits, K533 receipt-class, meta-discussion).
 *
 * Integrates with:
 *   - Watchdog history.jsonl (brand_lint_event entry class)
 *   - Coroner Scribe (escalation path for structural_inversion class)
 *   - SEG dispatch pre-emit hook (via checkBeforeEmit)
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { load as yamlLoad } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Config paths ─────────────────────────────────────────────────────────────

const LIBRARIAN_ROOT = resolve(__dirname, "..", "..");
const PHRASES_CONFIG_PATH = resolve(LIBRARIAN_ROOT, "config", "canonical_phrases.yaml");
const BRAND_LINT_LOG_DIR = resolve(homedir(), ".claude", "state", "brand_lint");
const BRAND_LINT_LOG_PATH = resolve(BRAND_LINT_LOG_DIR, "events.jsonl");
const WATCHDOG_HISTORY_PATH = resolve(homedir(), ".claude", "state", "watchdog", "history.jsonl");

// ─── Types ────────────────────────────────────────────────────────────────────

export type LintSeverity = "structural_inversion" | "wording_drift" | "innocent_variation";

export interface LintViolation {
  phrase_id: string;
  canonical: string;
  matched_text: string;
  matched_at_char: number;
  severity: LintSeverity;
  rationale: string;
  levenshtein_distance?: number;
  bypass_active: boolean;
}

export interface LintResult {
  passed: boolean;                   // false if any structural_inversion found (and no bypass)
  blocked: boolean;                  // true = emit BLOCKED; requires Founder override
  bypass_active: boolean;            // true = [ARMADA_OVERRIDE] token present
  violations: LintViolation[];
  structural_inversions: LintViolation[];
  wording_drifts: LintViolation[];
  founder_escalation_required: boolean;
  escalation_message?: string;
  provenance: string;
  session?: string;
  ts: string;
}

export interface BrandLintEvent {
  ts: string;
  event_type: "brand_lint_event";
  provenance: string;
  session?: string;
  severity: LintSeverity;
  phrase_id: string;
  canonical: string;
  matched_text: string;
  bypass_active: boolean;
  blocked: boolean;
  rationale: string;
}

// ─── YAML config schema ───────────────────────────────────────────────────────

interface PhraseDef {
  id: string;
  canonical: string;
  description: string;
  anchored_since: string;
  drift_threshold_levenshtein: number;
  aliases: string[];
  structural_inversions: Array<{
    phrase: string;
    rationale: string;
    /**
     * ASK E directional-discrimination fix (BP044 W1).
     * When true: inversion only fires when the adversarial phrase is used as a SELF-IDENTITY CLAIM
     * (e.g. "we are the Profit Armada"). Using it to NAME/CONTRAST the enemy is correct cooperative canon.
     * When false/absent: any occurrence fires (for factual errors like "$5/month", "will earn").
     */
    identity_claim_only?: boolean;
  }>;
}

interface PhrasesConfig {
  phrases: PhraseDef[];
  bypass: { token: string; scope: string };
  config: {
    default_levenshtein_threshold: number;
    normalize: boolean;
    inversion_case_insensitive: boolean;
  };
}

// ─── Config loader (lazy singleton) ──────────────────────────────────────────

let _config: PhrasesConfig | null = null;

export function loadPhrasesConfig(): PhrasesConfig {
  if (_config) return _config;
  if (!existsSync(PHRASES_CONFIG_PATH)) {
    throw new Error(`Brand-lint config not found at ${PHRASES_CONFIG_PATH}`);
  }
  const raw = readFileSync(PHRASES_CONFIG_PATH, "utf-8");
  _config = yamlLoad(raw) as PhrasesConfig;
  return _config;
}

/** Reload config from disk (use when hot-reloading after config edits). */
export function reloadPhrasesConfig(): PhrasesConfig {
  _config = null;
  return loadPhrasesConfig();
}

// ─── Levenshtein distance (Wagner-Fischer) ────────────────────────────────────

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// ─── Normalization ────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

// ─── Sliding window substring check ──────────────────────────────────────────

/**
 * Scans `haystack` for any window of `windowLen` words whose normalized form
 * is within `threshold` Levenshtein distance of `needle`.
 * Returns { matched, at, distance } or null.
 */
function findNearMatch(
  haystackWords: string[],
  needle: string,
  threshold: number
): { matched: string; at: number; distance: number } | null {
  const needleNorm = normalize(needle);
  const needleWordCount = needleNorm.split(" ").length;
  const windowSize = needleWordCount;

  for (let i = 0; i <= haystackWords.length - windowSize; i++) {
    const window = haystackWords.slice(i, i + windowSize).join(" ");
    const windowNorm = normalize(window);
    const dist = levenshtein(windowNorm, needleNorm);
    if (dist <= threshold) {
      return { matched: window, at: i, distance: dist };
    }
  }
  return null;
}

// ─── Identity-claim detection (ASK E directional-discrimination fix) ─────────

/**
 * Patterns that signal the speaker is CLAIMING IDENTITY with the adversarial phrase
 * (as opposed to naming/contrasting the adversary, which is correct cooperative canon).
 *
 * We scan the ~100 characters BEFORE the matched position in the normalized text.
 * If an identity-claim pattern is present, the inversion fires.
 * If absent, the phrase is read as adversarial-naming (correct) and is suppressed.
 *
 * Examples:
 *   IDENTITY CLAIM (fires):  "we are the Profit Armada" / "our Profit Armada model" /
 *                             "this is a Profit Armada" / "building a Profit Armada"
 *   ADVERSARIAL NAMING (ok): "unlike the Profit Armada" / "fighting the Profit Armada" /
 *                             "the Profit Armada extracts" / "what the Profit Armada does"
 */
const IDENTITY_CLAIM_PATTERNS: RegExp[] = [
  /\bwe(?:'re| are)(?: the| a| an)?\s*$/,
  /\bi(?:'m| am)(?: the| a| an)?\s*$/,
  /\bthis (?:is|platform|system|company|product)(?: the| a| an| our)?\s*$/,
  /\bour (?:platform|system|company|product|approach|model|fleet|armada|offer|business)\s*(?:is|=|:)?\s*$/,
  /\b(?:building|creating|launching|running|operating)(?: a| the| our| an)?\s*$/,
  /\bliana banyan (?:is|will be|becomes|operates as)(?: the| a| an)?\s*$/,
  /\bwe(?:'ve| have) (?:built|created|become)(?: the| a| an)?\s*$/,
];

/**
 * Returns true if the text context before `matchIdx` indicates the matched adversarial phrase
 * is being used as an identity claim (fires inversion) rather than adversarial-naming (correct).
 */
function hasIdentityClaimContext(textNorm: string, matchIdx: number): boolean {
  const contextBefore = textNorm.slice(Math.max(0, matchIdx - 120), matchIdx);
  return IDENTITY_CLAIM_PATTERNS.some((p) => p.test(contextBefore));
}

// ─── Core lint function ───────────────────────────────────────────────────────

export interface LintOptions {
  provenance: string;
  session?: string;
  /** Override config's levenshtein threshold for all phrases */
  levenshtein_override?: number;
}

export function lintText(text: string, opts: LintOptions): LintResult {
  const cfg = loadPhrasesConfig();
  const bypassActive = text.includes(cfg.bypass.token);
  const words = text.split(/\s+/).filter(Boolean);
  const textNorm = normalize(text);

  const violations: LintViolation[] = [];

  for (const phrase of cfg.phrases) {
    const threshold = opts.levenshtein_override ?? phrase.drift_threshold_levenshtein;

    // ── 1. Structural inversion check (exact substring, case-insensitive) ──
    for (const inv of phrase.structural_inversions) {
      const invNorm = inv.phrase.toLowerCase();
      const idx = textNorm.indexOf(invNorm);
      if (idx === -1) continue;

      // ASK E directional-discrimination: identity_claim_only inversions only fire when
      // the adversarial phrase is used as a self-identity claim, not as adversarial-naming.
      if (inv.identity_claim_only && !bypassActive) {
        if (!hasIdentityClaimContext(textNorm, idx)) {
          // Adversarial-naming context — correct cooperative canon, suppress inversion.
          // Demote to wording_drift so it's still auditable but doesn't block emit.
          violations.push({
            phrase_id: phrase.id,
            canonical: phrase.canonical,
            matched_text: inv.phrase,
            matched_at_char: idx,
            severity: "wording_drift",
            rationale: `[ADVERSARIAL-NAMING — correct canon] ${inv.rationale}`,
            bypass_active: bypassActive,
          });
          continue;
        }
      }

      violations.push({
        phrase_id: phrase.id,
        canonical: phrase.canonical,
        matched_text: inv.phrase,
        matched_at_char: idx,
        severity: bypassActive ? "wording_drift" : "structural_inversion",
        rationale: inv.rationale,
        bypass_active: bypassActive,
      });
    }

    // ── 2. Wording drift check (Levenshtein sliding window on canonical) ──
    // Skip if canonical itself appears literally (no violation)
    const canonNorm = normalize(phrase.canonical);
    if (!textNorm.includes(canonNorm)) {
      // Also skip if any alias appears
      const hasAlias = phrase.aliases.some((a) => textNorm.includes(normalize(a)));
      if (!hasAlias) {
        const nearMatch = findNearMatch(words, phrase.canonical, threshold);
        if (nearMatch && nearMatch.distance > 0) {
          // Make sure this wasn't already caught as structural inversion
          const alreadyCaught = violations.some(
            (v) =>
              v.phrase_id === phrase.id &&
              normalize(v.matched_text) === normalize(nearMatch.matched)
          );
          if (!alreadyCaught) {
            violations.push({
              phrase_id: phrase.id,
              canonical: phrase.canonical,
              matched_text: nearMatch.matched,
              matched_at_char: nearMatch.at,
              severity: "wording_drift",
              rationale: `Near-match (Levenshtein ${nearMatch.distance}) of canonical "${phrase.canonical}"`,
              levenshtein_distance: nearMatch.distance,
              bypass_active: bypassActive,
            });
          }
        }
      }
    }
  }

  const structuralInversions = violations.filter((v) => v.severity === "structural_inversion");
  const wordingDrifts = violations.filter((v) => v.severity === "wording_drift");

  const blocked = structuralInversions.length > 0 && !bypassActive;
  const founderEscalationRequired = blocked;

  let escalationMessage: string | undefined;
  if (founderEscalationRequired) {
    const summary = structuralInversions
      .map((v) => `"${v.matched_text}" (inverts "${v.canonical}" — ${v.rationale})`)
      .join("; ");
    escalationMessage =
      `🚨 STRUCTURAL INVERSION DETECTED — EMIT BLOCKED — FOUNDER ESCALATION REQUIRED\n` +
      `Violations: ${summary}\n` +
      `To override: add [ARMADA_OVERRIDE] token to prompt for intentional canon discussion.`;
  }

  const result: LintResult = {
    passed: !blocked,
    blocked,
    bypass_active: bypassActive,
    violations,
    structural_inversions: structuralInversions,
    wording_drifts: wordingDrifts,
    founder_escalation_required: founderEscalationRequired,
    escalation_message: escalationMessage,
    provenance: opts.provenance,
    session: opts.session,
    ts: new Date().toISOString(),
  };

  // Persist all violations to brand-lint log + watchdog history
  if (violations.length > 0) {
    _logViolations(result);
  }

  return result;
}

// ─── Logging ──────────────────────────────────────────────────────────────────

function ensureLogDir(): void {
  if (!existsSync(BRAND_LINT_LOG_DIR)) {
    mkdirSync(BRAND_LINT_LOG_DIR, { recursive: true });
  }
}

function _logViolations(result: LintResult): void {
  ensureLogDir();

  for (const v of result.violations) {
    const event: BrandLintEvent = {
      ts: result.ts,
      event_type: "brand_lint_event",
      provenance: result.provenance,
      session: result.session,
      severity: v.severity,
      phrase_id: v.phrase_id,
      canonical: v.canonical,
      matched_text: v.matched_text,
      bypass_active: v.bypass_active,
      blocked: result.blocked,
      rationale: v.rationale,
    };

    // Append to brand-lint events log
    try {
      appendFileSync(BRAND_LINT_LOG_PATH, JSON.stringify(event) + "\n", "utf-8");
    } catch { /* non-fatal */ }

    // Also append to Watchdog history.jsonl as brand_lint_event class
    try {
      const watchdogDir = resolve(homedir(), ".claude", "state", "watchdog");
      if (!existsSync(watchdogDir)) mkdirSync(watchdogDir, { recursive: true });
      appendFileSync(
        WATCHDOG_HISTORY_PATH,
        JSON.stringify({
          event_type: "brand_lint_event",
          subject: `brand_lint:${v.phrase_id}`,
          details: `[${v.severity.toUpperCase()}] "${v.matched_text}" in ${result.provenance} — ${v.rationale}`,
          severity: v.severity,
          phrase_id: v.phrase_id,
          canonical: v.canonical,
          bypass_active: v.bypass_active,
          blocked: result.blocked,
          session: result.session,
          ts: result.ts,
        }) + "\n",
        "utf-8"
      );
    } catch { /* non-fatal */ }
  }
}

// ─── Pre-emit gate (SEG dispatch hook) ───────────────────────────────────────

/**
 * Drop-in pre-emit gate for SEG dispatch, Cephas publish, and Knight commit flows.
 *
 * Returns:
 *   { proceed: true }           — no violations, emit is clear
 *   { proceed: true, warnings } — wording_drift found, emit permitted, log appended
 *   { proceed: false, blocked_result } — structural_inversion found, emit BLOCKED
 *
 * Usage:
 *   const gate = checkBeforeEmit(payload, { provenance: "seg_dispatch", session: "BP044-SEG-01" });
 *   if (!gate.proceed) {
 *     throw new Error(gate.blocked_result!.escalation_message);
 *   }
 */
export function checkBeforeEmit(
  payload: string,
  opts: LintOptions
): { proceed: true; warnings?: LintViolation[] } | { proceed: false; blocked_result: LintResult } {
  const result = lintText(payload, opts);

  if (result.blocked) {
    return { proceed: false, blocked_result: result };
  }

  if (result.wording_drifts.length > 0) {
    return { proceed: true, warnings: result.wording_drifts };
  }

  return { proceed: true };
}

// ─── Query / audit helpers ────────────────────────────────────────────────────

export interface BrandLintQueryResult {
  total_events: number;
  structural_inversions: BrandLintEvent[];
  wording_drifts: BrandLintEvent[];
  blocked_count: number;
  bypass_count: number;
  by_phrase_id: Record<string, number>;
  log_path: string;
}

export function queryBrandLintLog(opts: { limit?: number; since_days?: number } = {}): BrandLintQueryResult {
  if (!existsSync(BRAND_LINT_LOG_PATH)) {
    return {
      total_events: 0,
      structural_inversions: [],
      wording_drifts: [],
      blocked_count: 0,
      bypass_count: 0,
      by_phrase_id: {},
      log_path: BRAND_LINT_LOG_PATH,
    };
  }

  const lines = readFileSync(BRAND_LINT_LOG_PATH, "utf-8").split("\n").filter(Boolean);
  let events: BrandLintEvent[] = lines.map((l) => {
    try { return JSON.parse(l) as BrandLintEvent; } catch { return null; }
  }).filter((e): e is BrandLintEvent => e !== null);

  if (opts.since_days) {
    const cutoff = Date.now() - opts.since_days * 86_400_000;
    events = events.filter((e) => new Date(e.ts).getTime() >= cutoff);
  }

  if (opts.limit) {
    events = events.slice(-opts.limit);
  }

  const byPhraseId: Record<string, number> = {};
  for (const e of events) {
    byPhraseId[e.phrase_id] = (byPhraseId[e.phrase_id] ?? 0) + 1;
  }

  return {
    total_events: events.length,
    structural_inversions: events.filter((e) => e.severity === "structural_inversion"),
    wording_drifts: events.filter((e) => e.severity === "wording_drift"),
    blocked_count: events.filter((e) => e.blocked).length,
    bypass_count: events.filter((e) => e.bypass_active).length,
    by_phrase_id: byPhraseId,
    log_path: BRAND_LINT_LOG_PATH,
  };
}

// ─── Exports for MCP tool layer ───────────────────────────────────────────────

export {
  PHRASES_CONFIG_PATH,
  BRAND_LINT_LOG_PATH,
  BRAND_LINT_LOG_DIR,
};
