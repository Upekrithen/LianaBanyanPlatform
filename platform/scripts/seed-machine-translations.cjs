#!/usr/bin/env node
/**
 * seed-machine-translations.cjs -- Wave 13-14 / Phase γ Reach
 * ==============================================================
 * Machine-seeds all 134 non-ratified locale stubs with real translated strings.
 * Preserves existing _meta and subtitle (already set to native phrase).
 * Replaces all other speakFriend + languageSwitcher strings with translations.
 *
 * Usage: node scripts/seed-machine-translations.cjs [--dry-run]
 */
"use strict";

const fs   = require("fs");
const path = require("path");

const LOCALES_DIR   = path.join(__dirname, "..", "public", "locales");
const LANGUAGES_FILE = path.join(LOCALES_DIR, "languages.json");
const DRY_RUN = process.argv.includes("--dry-run");

// Load translation data from the 5 part-files
const T_A = require("./tdata-a.cjs");
const T_B = require("./tdata-b.cjs");
const T_C = require("./tdata-c.cjs");
const T_D = require("./tdata-d.cjs");
const T_E = require("./tdata-e.cjs");

const TRANSLATIONS = Object.assign({}, T_A, T_B, T_C, T_D, T_E);

// Languages that are RATIFIED (skip these)
const RATIFIED = new Set(["en","zh","hi","es","fr","ar","ru","pt","de","ja","ko","it","pl","nl","he","sv"]);

function applyTranslations(existingData, lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return null; // no translation data for this language

  // Preserve existing subtitle (already correct native phrase)
  const existingSubtitle = existingData.speakFriend && existingData.speakFriend.subtitle
    ? existingData.speakFriend.subtitle
    : null;

  const now = new Date().toISOString();
  const result = {
    _meta: {
      source: "machine-draft",
      "human-reviewed": false,
      "bounty-open": true,
      generatedAt: now,
      note: "Machine-seeded Wave 13-14. Real translated strings in native script. Human review required before ratification."
    },
    speakFriend: Object.assign(
      {},
      t.speakFriend,
      // Restore existing subtitle if present (it has the correct native phrase)
      existingSubtitle ? { subtitle: existingSubtitle } : {}
    ),
    languageSwitcher: t.languageSwitcher
  };
  return result;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(LANGUAGES_FILE, "utf8"));
  const targets = manifest.languages.filter(l => !RATIFIED.has(l.code));

  console.log(`\nSeeding ${targets.length} non-ratified locales...\n`);

  let seeded = 0, skipped = 0, missing = 0;

  for (const lang of targets) {
    const localeDir  = path.join(LOCALES_DIR, lang.code);
    const localeFile = path.join(localeDir, "translation.json");

    if (!fs.existsSync(localeFile)) {
      console.log(`[${lang.code.padEnd(5)}] SKIP  -- no file (run locale-stub generator first)`);
      missing++;
      continue;
    }

    let existing;
    try {
      existing = JSON.parse(fs.readFileSync(localeFile, "utf8"));
    } catch (e) {
      console.log(`[${lang.code.padEnd(5)}] ERROR -- invalid JSON: ${e.message}`);
      skipped++;
      continue;
    }

    const updated = applyTranslations(existing, lang.code);
    if (!updated) {
      console.log(`[${lang.code.padEnd(5)}] MISS  -- no translation data`);
      missing++;
      continue;
    }

    // Quick sanity: verify no empty strings
    const json = JSON.stringify(updated, null, 2);
    if (/"": ""|: ""/.test(json)) {
      console.log(`[${lang.code.padEnd(5)}] WARN  -- has empty string, check tdata files`);
    }

    if (!DRY_RUN) {
      fs.writeFileSync(localeFile, json + "\n", "utf8");
    }
    seeded++;
    console.log(`[${lang.code.padEnd(5)}] OK    -- seeded`);
  }

  console.log(`\nDone. seeded=${seeded}, missing=${missing}, skipped=${skipped}`);
  if (DRY_RUN) console.log("(dry-run: no files written)");
}

main();
