#!/usr/bin/env node
/**
 * Brand-Lint 90-Day Backfill Audit — K533 #27 / BP044 W1
 * Correction: BP044 W1 ASK E — adversarial-naming discrimination applied
 *
 * Scans last 90 days of:
 *   - BISHOP_DROPZONE/**  (SEG outputs, Knight prompts, Pawn prompts)
 *   - KNIGHT_BISHOP_MESSAGES.md
 *   - Git commit messages (last 90 days)
 *
 * DOES NOT auto-correct. Logs detected drift to:
 *   ~/.claude/state/brand_lint/backfill_audit_YYYYMMDD.jsonl
 *   + prints human-readable report to stdout.
 *
 * Usage:
 *   node scripts/brand-lint-audit.mjs
 *   node scripts/brand-lint-audit.mjs --since-days 30   (default: 90)
 *   node scripts/brand-lint-audit.mjs --path ./BISHOP_DROPZONE/some-file.md
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { load as yamlLoad } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const PLATFORM_ROOT = resolve(LIBRARIAN_ROOT, "..");
const PHRASES_CONFIG_PATH = resolve(LIBRARIAN_ROOT, "config", "canonical_phrases.yaml");
const BRAND_LINT_LOG_DIR = resolve(homedir(), ".claude", "state", "brand_lint");

// ─── Parse args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let sinceDays = 90;
let specificPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--since-days" && args[i + 1]) {
    sinceDays = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--path" && args[i + 1]) {
    specificPath = resolve(args[i + 1]);
    i++;
  }
}

const cutoffMs = Date.now() - sinceDays * 86_400_000;

// ─── Load canonical phrases config ────────────────────────────────────────────

const cfg = yamlLoad(readFileSync(PHRASES_CONFIG_PATH, "utf-8"));
const bypassToken = cfg.bypass.token;

// ─── Levenshtein (inline — no dep on compiled TS) ─────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

// ─── Identity-claim detection (ASK E directional-discrimination fix) ──────────

const IDENTITY_CLAIM_PATTERNS = [
  /\bwe(?:'re| are)(?: the| a| an)?\s*$/,
  /\bi(?:'m| am)(?: the| a| an)?\s*$/,
  /\bthis (?:is|platform|system|company|product)(?: the| a| an| our)?\s*$/,
  /\bour (?:platform|system|company|product|approach|model|fleet|armada|offer|business)\s*(?:is|=|:)?\s*$/,
  /\b(?:building|creating|launching|running|operating)(?: a| the| our| an)?\s*$/,
  /\bliana banyan (?:is|will be|becomes|operates as)(?: the| a| an)?\s*$/,
  /\bwe(?:'ve| have) (?:built|created|become)(?: the| a| an)?\s*$/,
];

function hasIdentityClaimContext(textNorm, matchIdx) {
  const contextBefore = textNorm.slice(Math.max(0, matchIdx - 120), matchIdx);
  return IDENTITY_CLAIM_PATTERNS.some(p => p.test(contextBefore));
}

function findNearMatch(words, needle, threshold) {
  const needleNorm = normalize(needle);
  const windowSize = needleNorm.split(" ").length;
  for (let i = 0; i <= words.length - windowSize; i++) {
    const window = words.slice(i, i + windowSize).join(" ");
    const dist = levenshtein(normalize(window), needleNorm);
    if (dist <= threshold) return { matched: window, at: i, distance: dist };
  }
  return null;
}

function lintContent(text, filepath) {
  const bypassActive = text.includes(bypassToken);
  const words = text.split(/\s+/).filter(Boolean);
  const textNorm = normalize(text);
  const violations = [];

  for (const phrase of cfg.phrases) {
    const threshold = phrase.drift_threshold_levenshtein;

    for (const inv of (phrase.structural_inversions || [])) {
      const invNorm = inv.phrase.toLowerCase();
      const idx = textNorm.indexOf(invNorm);
      if (idx === -1) continue;

      // ASK E directional-discrimination: identity_claim_only inversions only fire when
      // the adversarial phrase is used as a self-identity claim, not adversarial-naming.
      if (inv.identity_claim_only && !bypassActive) {
        if (!hasIdentityClaimContext(textNorm, idx)) {
          // Adversarial-naming context — correct cooperative canon.
          violations.push({
            phrase_id: phrase.id,
            canonical: phrase.canonical,
            matched_text: inv.phrase,
            severity: "wording_drift",
            rationale: `[ADVERSARIAL-NAMING — correct canon] ${inv.rationale}`,
            bypass_active: bypassActive,
            file: filepath,
            adversarial_naming_correct: true,
          });
          continue;
        }
      }

      violations.push({
        phrase_id: phrase.id,
        canonical: phrase.canonical,
        matched_text: inv.phrase,
        severity: bypassActive ? "wording_drift" : "structural_inversion",
        rationale: inv.rationale,
        bypass_active: bypassActive,
        file: filepath,
      });
    }

    const canonNorm = normalize(phrase.canonical);
    if (!textNorm.includes(canonNorm)) {
      const hasAlias = (phrase.aliases || []).some(a => textNorm.includes(normalize(a)));
      if (!hasAlias) {
        const near = findNearMatch(words, phrase.canonical, threshold);
        if (near && near.distance > 0) {
          const alreadyCaught = violations.some(
            v => v.phrase_id === phrase.id && normalize(v.matched_text) === normalize(near.matched)
          );
          if (!alreadyCaught) {
            violations.push({
              phrase_id: phrase.id,
              canonical: phrase.canonical,
              matched_text: near.matched,
              severity: "wording_drift",
              rationale: `Near-match (Levenshtein ${near.distance}) of canonical "${phrase.canonical}"`,
              levenshtein_distance: near.distance,
              bypass_active: bypassActive,
              file: filepath,
            });
          }
        }
      }
    }
  }

  return violations;
}

// ─── File scanner ─────────────────────────────────────────────────────────────

const SCANNABLE_EXTS = new Set([".md", ".txt", ".ts", ".js", ".mjs", ".yaml", ".yml", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "ArtAssets", "Asteroid-ProofVault"]);

function* walkFiles(dir) {
  if (!existsSync(dir)) return;
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    try {
      const st = statSync(full);
      if (st.isDirectory()) {
        yield* walkFiles(full);
      } else if (SCANNABLE_EXTS.has(extname(entry).toLowerCase())) {
        if (st.mtimeMs >= cutoffMs) yield full;
      }
    } catch { /* skip */ }
  }
}

// ─── Git commit scanner ───────────────────────────────────────────────────────

function getRecentCommitMessages() {
  try {
    const since = new Date(cutoffMs).toISOString().slice(0, 10);
    const raw = execSync(
      `git -C "${PLATFORM_ROOT}" log --since="${since}" --pretty=format:"%H %s"`,
      { encoding: "utf-8", timeout: 10_000 }
    );
    return raw.trim().split("\n").filter(Boolean).map(line => {
      const spaceIdx = line.indexOf(" ");
      return { hash: line.slice(0, spaceIdx), message: line.slice(spaceIdx + 1) };
    });
  } catch {
    return [];
  }
}

// ─── Main audit ───────────────────────────────────────────────────────────────

console.log(`\n🔍 Brand-Lint 90-Day Backfill Audit — K533 #27 / BP044 W1`);
console.log(`   ASK E directional-discrimination active: adversarial-naming = correct canon`);
console.log(`   Scanning last ${sinceDays} days · cutoff: ${new Date(cutoffMs).toISOString()}`);
console.log(`   Config: ${PHRASES_CONFIG_PATH}\n`);

const allViolations = [];
let scannedFiles = 0;

// Scan filesystem
const scanRoots = specificPath
  ? [specificPath]
  : [
      resolve(PLATFORM_ROOT, "BISHOP_DROPZONE"),
      resolve(PLATFORM_ROOT, "KNIGHT_DROPZONE"),
      resolve(PLATFORM_ROOT, "ROOK_DROPZONE"),
      resolve(PLATFORM_ROOT, "PAWN_DROPZONE"),
      resolve(PLATFORM_ROOT, "KNIGHT_BISHOP_MESSAGES.md"),
      resolve(PLATFORM_ROOT, "CONTEXT_MANAGEMENT"),
      resolve(PLATFORM_ROOT, "letters"),
    ];

for (const root of scanRoots) {
  if (!existsSync(root)) continue;
  const st = statSync(root);
  const filePaths = st.isDirectory() ? [...walkFiles(root)] : [root];
  for (const fp of filePaths) {
    try {
      const content = readFileSync(fp, "utf-8");
      const violations = lintContent(content, fp.replace(PLATFORM_ROOT, ""));
      if (violations.length > 0) {
        allViolations.push(...violations);
        const siCount = violations.filter(v => v.severity === "structural_inversion").length;
        const wdCount = violations.filter(v => v.severity === "wording_drift").length;
        console.log(`  📁 ${fp.replace(PLATFORM_ROOT + "\\", "")}`);
        if (siCount > 0) console.log(`     🚨 ${siCount} structural inversion(s)`);
        if (wdCount > 0) console.log(`     ⚠️  ${wdCount} wording drift(s)`);
      }
      scannedFiles++;
    } catch { /* skip unreadable */ }
  }
}

// Scan git commits
const commits = getRecentCommitMessages();
let commitViolations = 0;
for (const { hash, message } of commits) {
  const violations = lintContent(message, `git:${hash.slice(0, 8)}`);
  if (violations.length > 0) {
    commitViolations += violations.length;
    allViolations.push(...violations);
    console.log(`  🔧 git commit ${hash.slice(0, 8)}: "${message.slice(0, 80)}"`);
    for (const v of violations) {
      const icon = v.severity === "structural_inversion" ? "🚨" : "⚠️ ";
      console.log(`     ${icon} [${v.phrase_id}] "${v.matched_text}" → ${v.rationale}`);
    }
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────

const structuralInversions = allViolations.filter(v => v.severity === "structural_inversion");
const wordingDrifts = allViolations.filter(v => v.severity === "wording_drift");
const adversarialNamingCorrect = wordingDrifts.filter(v => v.adversarial_naming_correct);

console.log(`\n${"═".repeat(60)}`);
console.log(`BACKFILL AUDIT SUMMARY — ASK E corrected logic`);
console.log(`${"═".repeat(60)}`);
console.log(`  Files scanned:         ${scannedFiles}`);
console.log(`  Commits scanned:       ${commits.length}`);
console.log(`  Total violations:      ${allViolations.length}`);
console.log(`  Structural inversions: ${structuralInversions.length} 🚨  (identity-claim only)`);
console.log(`  Wording drifts:        ${wordingDrifts.length} ⚠️`);
console.log(`  ↳ Adversarial-naming (correct canon, demoted from SI): ${adversarialNamingCorrect.length} ✅`);
console.log(`\n  NOTE: This is LOG-ONLY — no auto-corrections applied.`);
console.log(`        Human judgment required for retroactive correction.`);

if (structuralInversions.length > 0) {
  console.log(`\n🚨 STRUCTURAL INVERSIONS DETECTED (require Founder review):`);
  for (const v of structuralInversions) {
    console.log(`   [${v.phrase_id}] "${v.matched_text}" in ${v.file}`);
    console.log(`   Inverts "${v.canonical}" — ${v.rationale}`);
  }
}

// ─── Persist audit log ────────────────────────────────────────────────────────

if (!existsSync(BRAND_LINT_LOG_DIR)) mkdirSync(BRAND_LINT_LOG_DIR, { recursive: true });

const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const auditLogPath = resolve(BRAND_LINT_LOG_DIR, `backfill_audit_${dateStr}.jsonl`);

const auditRecord = {
  ts: new Date().toISOString(),
  audit_type: "backfill_90day",
  since_days: sinceDays,
  scanned_files: scannedFiles,
  commits_scanned: commits.length,
  total_violations: allViolations.length,
  structural_inversions_count: structuralInversions.length,
  wording_drifts_count: wordingDrifts.length,
  adversarial_naming_correct_count: adversarialNamingCorrect.length,
  ask_e_correction: "adversarial-naming = correct canon; identity_claim_only discrimination active",
  violations: allViolations,
};

writeFileSync(auditLogPath, JSON.stringify(auditRecord, null, 2), "utf-8");
console.log(`\n  Audit log written: ${auditLogPath}`);
console.log(`\n🌊⚓🪙 FOR THE KEEP.\n`);
