#!/usr/bin/env node
/**
 * generate-locale-stubs.cjs -- Wave D / D1
 * ==========================================
 * Generates translation stub files for all 150 languages in languages.json.
 *
 * Each stub contains:
 *   - _meta: { source, human-reviewed, bounty-open, generatedAt }
 *   - speakFriend namespace (required for CI gate)
 *   - languageSwitcher namespace (minimal)
 *
 * Other namespaces are intentionally omitted -- they fall back to EN via i18next.
 *
 * HUMAN REVIEW REQUIRED before publishing any stub as a ratified translation.
 * The bounty workflow (SpeakFriendPage -> BountyPosterGenerator) is the intended
 * path for human-reviewed translations to replace these stubs.
 *
 * Usage:
 *   node scripts/generate-locale-stubs.cjs
 *   node scripts/generate-locale-stubs.cjs --dry-run    # Print what would be created
 *   node scripts/generate-locale-stubs.cjs --force      # Overwrite existing stubs
 *   node scripts/generate-locale-stubs.cjs --lang=sw    # One language only
 *
 * MT Integration (future):
 *   Swap the buildSpeakFriendStub() function body to call an MT API
 *   (e.g., DeepL, Google Translate, LibreTranslate) and replace the EN text
 *   placeholders with actual translated strings before setting source="machine-translated".
 */

const fs = require("fs");
const path = require("path");

const LANGUAGES_FILE = path.join(__dirname, "..", "public", "locales", "languages.json");
const EN_FILE = path.join(__dirname, "..", "public", "locales", "en", "translation.json");
const LOCALES_DIR = path.join(__dirname, "..", "public", "locales");

// ── CLI args ──
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const SINGLE_LANG = (args.find((a) => a.startsWith("--lang=")) || "").replace("--lang=", "");

// ── Load source data ──

let langManifest;
try {
  langManifest = JSON.parse(fs.readFileSync(LANGUAGES_FILE, "utf8"));
} catch (err) {
  console.error(`FAIL: Could not load languages.json: ${err.message}`);
  process.exit(1);
}

let enData;
try {
  enData = JSON.parse(fs.readFileSync(EN_FILE, "utf8"));
} catch (err) {
  console.error(`FAIL: Could not load EN translation.json: ${err.message}`);
  process.exit(1);
}

const enSpeakFriend = enData.speakFriend || {};
const enLanguageSwitcher = enData.languageSwitcher || {};

/**
 * Build the speakFriend stub for a language.
 *
 * Currently returns EN text as placeholders. Replace with MT API calls here.
 * The speakFriendPhrase from the manifest is used for the subtitle to give each
 * stub at least one language-specific string.
 *
 * @param {object} lang - Language entry from languages.json
 * @returns {object} speakFriend namespace object
 */
function buildSpeakFriendStub(lang) {
  const stub = {};
  for (const [key, val] of Object.entries(enSpeakFriend)) {
    if (typeof val === "string") {
      // Use the native speakFriend phrase for the subtitle (the one real translated string)
      if (key === "subtitle" && lang.speakFriendPhrase) {
        stub[key] = `"${lang.speakFriendPhrase}"`;
      } else {
        stub[key] = val;
      }
    } else if (val !== null && typeof val === "object") {
      stub[key] = val;
    }
  }
  return stub;
}

/**
 * Build the languageSwitcher stub (minimal, all EN placeholders).
 */
function buildLanguageSwitcherStub() {
  const stub = {};
  for (const [key, val] of Object.entries(enLanguageSwitcher)) {
    if (typeof val === "string") {
      stub[key] = val;
    }
  }
  return stub;
}

// ── Main loop ──

const languages = langManifest.languages.filter((l) => l.code !== "en");
const targets = SINGLE_LANG
  ? languages.filter((l) => l.code === SINGLE_LANG)
  : languages;

if (SINGLE_LANG && targets.length === 0) {
  console.error(`FAIL: Language "${SINGLE_LANG}" not found in languages.json`);
  process.exit(1);
}

let created = 0;
let skipped = 0;
let updated = 0;
const errors = [];

for (const lang of targets) {
  const localeDir = path.join(LOCALES_DIR, lang.code);
  const localeFile = path.join(localeDir, "translation.json");

  const fileExists = fs.existsSync(localeFile);

  if (fileExists && !FORCE) {
    // Check if this existing file already has speakFriend + _meta
    let existingData;
    try {
      existingData = JSON.parse(fs.readFileSync(localeFile, "utf8"));
    } catch {
      existingData = null;
    }
    if (existingData && existingData.speakFriend && existingData._meta) {
      skipped++;
      console.log(`[${lang.code.padEnd(5)}] SKIP  -- already has speakFriend + _meta`);
      continue;
    }
    // File exists but missing _meta or speakFriend -- patch it
    if (existingData) {
      const patched = {
        _meta: {
          source: "existing-partial",
          "human-reviewed": false,
          "bounty-open": !lang.ratified,
          generatedAt: new Date().toISOString(),
          note: "Patched by generate-locale-stubs.cjs -- speakFriend stub added",
        },
        speakFriend: existingData.speakFriend || buildSpeakFriendStub(lang),
        languageSwitcher: existingData.languageSwitcher || buildLanguageSwitcherStub(),
        ...existingData,
      };
      if (!DRY_RUN) {
        fs.writeFileSync(localeFile, JSON.stringify(patched, null, 2) + "\n", "utf8");
      }
      updated++;
      console.log(`[${lang.code.padEnd(5)}] PATCH -- added _meta + speakFriend to existing file${DRY_RUN ? " (dry-run)" : ""}`);
      continue;
    }
  }

  // Create stub
  const stub = {
    _meta: {
      source: "machine-draft",
      "human-reviewed": false,
      "bounty-open": true,
      generatedAt: new Date().toISOString(),
      note: "Auto-generated stub. All strings are EN placeholders pending community translation. See SpeakFriendPage for bounty details.",
    },
    speakFriend: buildSpeakFriendStub(lang),
    languageSwitcher: buildLanguageSwitcherStub(),
  };

  if (DRY_RUN) {
    console.log(`[${lang.code.padEnd(5)}] WOULD CREATE: ${localeFile}`);
    created++;
    continue;
  }

  try {
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }
    fs.writeFileSync(localeFile, JSON.stringify(stub, null, 2) + "\n", "utf8");
    created++;
    console.log(`[${lang.code.padEnd(5)}] CREATE -- ${localeFile.replace(LOCALES_DIR, "")}`);
  } catch (err) {
    errors.push(`FAIL [${lang.code}]: ${err.message}`);
    console.error(`[${lang.code.padEnd(5)}] ERROR -- ${err.message}`);
  }
}

// ── Summary ──
console.log("");
console.log(`Done. Created: ${created} | Patched: ${updated} | Skipped: ${skipped} | Errors: ${errors.length}`);
if (errors.length > 0) {
  errors.forEach((e) => console.error(e));
  process.exit(1);
}
console.log("");
console.log("IMPORTANT: All generated stubs contain EN placeholder text.");
console.log("Human review is required before publishing any stub as a ratified translation.");
console.log("See /speak-friend/ for open translation bounties.");
