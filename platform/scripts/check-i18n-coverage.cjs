#!/usr/bin/env node
/**
 * check-i18n-coverage.js -- Wave D / D3
 * =======================================
 * CI harness for translation locale file quality.
 *
 * Checks all 150 languages from languages.json (plus legacy 15 full-check).
 *
 * Rules:
 *   EN reference:
 *     - Must exist and be valid JSON
 *     - Must contain all 4 required namespaces
 *
 *   All 149 non-EN locales (loaded from languages.json):
 *     - Must exist (translation.json file present)
 *     - Must be valid JSON
 *     - Must have a non-empty speakFriend namespace (minimum viable locale)
 *     - speakFriend keys that are present must not be empty strings
 *
 *   Legacy 15 locales (ratified community translations):
 *     - Additionally: no empty-string values in ANY present namespace
 *     - (These had full checks before Wave D -- keep the bar)
 *
 * Missing keys in non-EN files are ALLOWED (i18next fallbackLng="en" handles them).
 * Empty-string values are NOT allowed (they surface as blank in the UI).
 *
 * Exit 0 = all checks pass.
 * Exit 1 = any failure.
 *
 * Usage: node scripts/check-i18n-coverage.cjs
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(__dirname, "..", "public", "locales");
const EN_FILE = path.join(LOCALES_DIR, "en", "translation.json");
const LANGUAGES_FILE = path.join(__dirname, "..", "public", "locales", "languages.json");

// Critical namespaces that must exist in EN
const REQUIRED_EN_NAMESPACES = [
  "speakFriend",
  "howItAllWorks",
  "untech",
  "languageSwitcher",
];

// Legacy 15 ratified locales -- full no-empty-string check on ALL present keys
const LEGACY_FULL_CHECK = new Set([
  "es", "pt", "fr", "de", "zh", "ja", "ko", "ar", "hi",
  "ru", "it", "nl", "pl", "sv", "he",
]);

let exitCode = 0;
const errors = [];
const warnings = [];

// ── Helpers ──

function collectLeafKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...collectLeafKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

function checkNoEmptyStrings(localeData, locale, scope = "all") {
  const leafKeys = collectLeafKeys(localeData);
  let emptyCount = 0;
  for (const key of leafKeys) {
    // Skip _meta fields
    if (key.startsWith("_meta")) continue;
    const val = getNestedValue(localeData, key);
    if (val === "") {
      errors.push(`FAIL [${locale}]: Empty string value for key "${key}" -- remove or translate`);
      exitCode = 1;
      emptyCount++;
    }
  }
  return emptyCount;
}

function checkSpeakFriendNamespace(localeData, locale) {
  const sf = localeData.speakFriend;
  if (!sf || typeof sf !== "object") {
    errors.push(`FAIL [${locale}]: Missing required "speakFriend" namespace`);
    exitCode = 1;
    return false;
  }
  // Check all speakFriend leaf values are non-empty strings
  const sfLeaves = collectLeafKeys(sf);
  let emptyCount = 0;
  for (const key of sfLeaves) {
    const val = getNestedValue(sf, key);
    if (val === "") {
      errors.push(`FAIL [${locale}]: Empty string in speakFriend.${key}`);
      exitCode = 1;
      emptyCount++;
    }
  }
  return emptyCount === 0 && sfLeaves.length > 0;
}

// ── 1. Load EN reference file ──

let enData;
try {
  const raw = fs.readFileSync(EN_FILE, "utf8");
  enData = JSON.parse(raw);
} catch (err) {
  console.error(`FAIL: Could not parse EN locale file: ${err.message}`);
  process.exit(1);
}

// ── 2. Verify required EN namespaces exist ──

for (const ns of REQUIRED_EN_NAMESPACES) {
  if (!enData[ns] || typeof enData[ns] !== "object") {
    errors.push(`EN translation.json missing required namespace: "${ns}"`);
    exitCode = 1;
  }
}

// ── 3. Pseudo-locale check: EN speakFriend must have all string leaves ──

if (enData.speakFriend) {
  const sfLeaves = collectLeafKeys(enData.speakFriend);
  for (const key of sfLeaves) {
    const val = getNestedValue(enData.speakFriend, key);
    if (typeof val !== "string") {
      errors.push(`FAIL [en]: speakFriend.${key} is not a string (got ${typeof val})`);
      exitCode = 1;
    } else if (val === "") {
      errors.push(`FAIL [en]: speakFriend.${key} is an empty string`);
      exitCode = 1;
    }
  }
}

const enLeafKeys = collectLeafKeys(enData);

// ── 4. Load languages.json for the full 150 list ──

let languageManifest;
try {
  languageManifest = JSON.parse(fs.readFileSync(LANGUAGES_FILE, "utf8"));
} catch (err) {
  console.error(`FAIL: Could not parse languages.json: ${err.message}`);
  process.exit(1);
}

const allLocales = languageManifest.languages
  .filter((l) => l.code !== "en")
  .map((l) => l.code);

console.log(`Checking ${allLocales.length} non-EN locales (from languages.json)...`);
console.log("");

// ── 5. Check each locale ──

let passCount = 0;
let warnCount = 0;
let failCount = 0;

for (const locale of allLocales) {
  const localeFile = path.join(LOCALES_DIR, locale, "translation.json");

  // Check file exists
  if (!fs.existsSync(localeFile)) {
    errors.push(`FAIL [${locale}]: Missing translation.json -- run: node scripts/generate-locale-stubs.cjs --lang=${locale}`);
    exitCode = 1;
    failCount++;
    console.log(`[${locale.padEnd(5)}] FAIL  -- missing file`);
    continue;
  }

  // Check valid JSON
  let localeData;
  try {
    const raw = fs.readFileSync(localeFile, "utf8");
    localeData = JSON.parse(raw);
  } catch (err) {
    errors.push(`FAIL [${locale}]: Invalid JSON -- ${err.message}`);
    exitCode = 1;
    failCount++;
    console.log(`[${locale.padEnd(5)}] FAIL  -- invalid JSON`);
    continue;
  }

  // speakFriend check (required for ALL 149 locales)
  const sfOk = checkSpeakFriendNamespace(localeData, locale);

  // Legacy full check (15 ratified locales -- no empty strings anywhere)
  let legacyEmptyCount = 0;
  if (LEGACY_FULL_CHECK.has(locale)) {
    legacyEmptyCount = checkNoEmptyStrings(localeData, locale);
  }

  // Coverage summary (informational)
  const localeLeafKeys = collectLeafKeys(localeData).filter((k) => !k.startsWith("_meta"));
  const translated = localeLeafKeys.filter((k) => enLeafKeys.includes(k));
  const coverage = enLeafKeys.length > 0
    ? Math.round((translated.length / enLeafKeys.length) * 100)
    : 0;

  const isLegacy = LEGACY_FULL_CHECK.has(locale);
  const hasFailure = !sfOk || legacyEmptyCount > 0;

  if (hasFailure) {
    failCount++;
    console.log(
      `[${locale.padEnd(5)}] FAIL  | ${String(translated.length).padStart(4)} / ${enLeafKeys.length} keys | ${String(coverage).padStart(3)}% coverage${isLegacy ? " [legacy]" : ""}`
    );
  } else if (coverage < 5 && !isLegacy) {
    // Stub files with <5% coverage get a STUB status (informational only, not a failure)
    warnCount++;
    passCount++;
    console.log(
      `[${locale.padEnd(5)}] STUB  | ${String(translated.length).padStart(4)} / ${enLeafKeys.length} keys | ${String(coverage).padStart(3)}% coverage -- bounty open`
    );
  } else {
    passCount++;
    console.log(
      `[${locale.padEnd(5)}] OK    | ${String(translated.length).padStart(4)} / ${enLeafKeys.length} keys | ${String(coverage).padStart(3)}% coverage${isLegacy ? " [legacy]" : ""}`
    );
  }
}

// ── Report ──

console.log("");
console.log(`Results: ${passCount} pass | ${failCount} fail | ${warnCount} stubs with open bounty`);
console.log("");

if (errors.length > 0) {
  errors.forEach((e) => console.error(e));
  console.log("");
  console.error(`i18n coverage check FAILED with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log(`i18n coverage check PASSED. All ${allLocales.length} locales are valid JSON with non-empty speakFriend namespace.`);
  console.log(`${warnCount} stub locales have open translation bounties -- see /speak-friend/ to claim.`);
  process.exit(0);
}
