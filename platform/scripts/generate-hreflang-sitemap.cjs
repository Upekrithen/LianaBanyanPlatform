#!/usr/bin/env node
/**
 * generate-hreflang-sitemap.cjs -- Wave 15 / Phase γ i18n Hardening
 * ===================================================================
 * Generates a 150-language hreflang sitemap (sitemap.xml) from
 * public/locales/languages.json.
 *
 * Also verifies that index.html contains the correct count of
 * hreflang <link> elements (150 locales + x-default = 151 total).
 *
 * Outputs:
 *   public/sitemap.xml  (updated with 150-language alternates)
 *
 * Usage:
 *   node scripts/generate-hreflang-sitemap.cjs [--dry-run] [--verify-only]
 *
 * Flags:
 *   --dry-run      Print the generated sitemap to stdout, do not write
 *   --verify-only  Only count hreflang tags in index.html and exit
 *
 * Exit 0 = success
 * Exit 1 = error or verification failure
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LANGUAGES_FILE = path.join(ROOT, "public", "locales", "languages.json");
const SITEMAP_OUT = path.join(ROOT, "public", "sitemap.xml");
const INDEX_HTML = path.join(ROOT, "index.html");

const BASE_URL = "https://lianabanyan.com";
const DRY_RUN = process.argv.includes("--dry-run");
const VERIFY_ONLY = process.argv.includes("--verify-only");

// ── Load languages ──

let languages;
try {
  const raw = fs.readFileSync(LANGUAGES_FILE, "utf8");
  const parsed = JSON.parse(raw);
  languages = parsed.languages;
  if (!Array.isArray(languages) || languages.length !== 150) {
    console.error(`FAIL: Expected 150 languages, got ${languages?.length ?? "unknown"}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`FAIL: Could not load languages.json: ${err.message}`);
  process.exit(1);
}

console.log(`Loaded ${languages.length} languages from languages.json`);

// ── Verify index.html hreflang count (always runs) ──

let indexHtml;
try {
  indexHtml = fs.readFileSync(INDEX_HTML, "utf8");
} catch (err) {
  console.error(`WARN: Could not read index.html: ${err.message}`);
  indexHtml = "";
}

const hreflangMatches = [...indexHtml.matchAll(/rel="alternate"\s+hreflang="/g)];
const hreflangCount = hreflangMatches.length;
const EXPECTED_HREFLANG = 151; // 150 locales + x-default

console.log(`index.html hreflang count: ${hreflangCount} (expected: ${EXPECTED_HREFLANG})`);
if (hreflangCount !== EXPECTED_HREFLANG) {
  console.warn(
    `WARN: Expected ${EXPECTED_HREFLANG} hreflang tags in index.html, found ${hreflangCount}.`,
    `Run this script without --verify-only to regenerate, then sync index.html.`
  );
  if (VERIFY_ONLY) {
    process.exit(1);
  }
} else {
  console.log(`OK: index.html hreflang count correct (${hreflangCount})`);
}

if (VERIFY_ONLY) {
  process.exit(hreflangCount === EXPECTED_HREFLANG ? 0 : 1);
}

// ── Build sitemap ──

const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

/**
 * Escape XML special characters.
 */
function xmlEscape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build the href for a given language code.
 * English gets the bare root URL; all others get ?lang=XX.
 */
function langHref(code) {
  if (code === "en") return BASE_URL + "/";
  return `${BASE_URL}/?lang=${xmlEscape(code)}`;
}

// Core SPA routes that deserve hreflang coverage.
// Add more as the public route surface grows.
const PUBLIC_ROUTES = [
  { path: "/",                 changefreq: "weekly",  priority: "1.0" },
  { path: "/speak-friend",     changefreq: "monthly", priority: "0.9" },
  { path: "/how-it-all-works", changefreq: "monthly", priority: "0.8" },
  { path: "/marketplace",      changefreq: "weekly",  priority: "0.8" },
  { path: "/proofs",           changefreq: "monthly", priority: "0.7" },
];

const urlNodes = PUBLIC_ROUTES.map((route) => {
  const canonicalUrl = BASE_URL + route.path;

  const alternateLinks = [
    `      <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(canonicalUrl)}" />`,
    ...languages.map((lang) => {
      const href = langHref(lang.code) + (route.path !== "/" ? route.path : "");
      return `      <xhtml:link rel="alternate" hreflang="${xmlEscape(lang.code)}" href="${xmlEscape(href)}" />`;
    }),
  ].join("\n");

  return `  <url>
    <loc>${xmlEscape(canonicalUrl)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${alternateLinks}
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Wave 15 i18n Hardening -- 150-language hreflang sitemap -->
<!-- Generated: ${now} by scripts/generate-hreflang-sitemap.cjs -->
<!-- Languages: ${languages.length} (${languages.filter((l) => l.rtl).length} RTL) -->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlNodes.join("\n")}
</urlset>
`;

// ── Output ──

if (DRY_RUN) {
  console.log("\n--- DRY RUN: sitemap output ---");
  console.log(sitemap.slice(0, 2000) + "\n... (truncated)");
  console.log(`--- Total routes: ${PUBLIC_ROUTES.length}, Total <url> nodes: ${urlNodes.length} ---`);
  console.log("DRY RUN complete. No files written.");
  process.exit(0);
}

fs.writeFileSync(SITEMAP_OUT, sitemap, "utf8");

const sitemapStats = {
  routes: PUBLIC_ROUTES.length,
  languages: languages.length,
  rtlLanguages: languages.filter((l) => l.rtl).length,
  urlNodes: urlNodes.length,
  totalAlternateLinks: urlNodes.length * (languages.length + 1), // +1 for x-default
  fileSizeKb: Math.round(Buffer.byteLength(sitemap, "utf8") / 1024),
};

console.log("\nSitemap written to:", SITEMAP_OUT);
console.log("Stats:", sitemapStats);
console.log("\nOK: generate-hreflang-sitemap.cjs complete.");
