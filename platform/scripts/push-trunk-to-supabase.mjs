/**
 * push-trunk-to-supabase.mjs
 *
 * Reads .md files from Upekrithen-Trunk/ and upserts them into the
 * compiled_documents table via the Supabase JavaScript client.
 *
 * Usage:  node scripts/push-trunk-to-supabase.mjs
 *
 * Excludes: CONFIDENTIAL/, INTERNAL_ONLY/, PLATFORM/ folders,
 *           README.md, and mapping/index files.
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { resolve, relative, basename, dirname } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ── paths ──────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const PLATFORM_ROOT = resolve(__dirname, "..");
const TRUNK_ROOT = resolve(PLATFORM_ROOT, "..", "Upekrithen-Trunk");
const ENV_FILE = resolve(PLATFORM_ROOT, ".env");

// ── env loader ─────────────────────────────────────────────────────────
async function loadEnv() {
  const raw = await readFile(ENV_FILE, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

// ── exclusion rules ────────────────────────────────────────────────────
const EXCLUDED_FOLDERS = new Set(["CONFIDENTIAL", "INTERNAL_ONLY", "PLATFORM"]);
const EXCLUDED_FILENAMES = new Set([
  "README.md",
  "INNOVATION_TO_UPEKRITHEN_TRUNK_MAPPING_B083.md",
]);

function isExcluded(relPath, fileName) {
  // Check if any path segment is an excluded folder
  const parts = relPath.split(/[\\/]/);
  for (const part of parts) {
    if (EXCLUDED_FOLDERS.has(part)) return true;
  }
  if (EXCLUDED_FILENAMES.has(fileName)) return true;
  // Skip anything that looks like a mapping/index meta-file
  if (/mapping|index/i.test(fileName) && !/journal/i.test(fileName)) return true;
  return false;
}

// ── recursive file discovery ───────────────────────────────────────────
function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── slug generation ────────────────────────────────────────────────────
function toSlug(name) {
  return name
    .replace(/_CONVERTED$/i, "")
    .replace(/_EXTRACTED$/i, "")
    .replace(/\.md$/i, "")
    .replace(/['']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// ── title extraction ───────────────────────────────────────────────────
function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return null;
}

function prettifyFilename(name) {
  return name
    .replace(/_CONVERTED$/i, "")
    .replace(/_EXTRACTED$/i, "")
    .replace(/\.md$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

// ── category mapping ───────────────────────────────────────────────────
const FOLDER_TO_CATEGORY = {
  ECONOMIC_PHILOSOPHY: "economic-philosophy",
  EXILE_ITHACA: "exile-ithaca",
  FAMILY_HERITAGE: "family-heritage",
  FOUNDERS_JOURNALS: "founders-journal",
  FOUNDERS_LORE: "founders-lore",
  GAME_DEVELOPMENT: "game-development",
  HEXISLE_CREATIVE: "hexisle-creative",
  MASTERS_ACADEMIC: "masters-academic",
  ORDINARY_WORLDS: "ordinary-worlds",
  SACRED_TEXTS: "sacred-texts",
  VIDEO_SCRIPTS: "video-scripts",
};

// ── main ───────────────────────────────────────────────────────────────
async function main() {
  const env = await loadEnv();

  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("ERROR: Missing SUPABASE_URL or key in .env.local");
    process.exit(1);
  }

  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Key type: ${env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon/publishable"}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Discover files
  const allFiles = walkDir(TRUNK_ROOT);
  const eligible = allFiles.filter((fp) => {
    const rel = relative(TRUNK_ROOT, fp);
    const fn = basename(fp);
    return !isExcluded(rel, fn);
  });

  console.log(`\nDiscovered ${allFiles.length} total .md files in Upekrithen-Trunk`);
  console.log(`Eligible after exclusions: ${eligible.length}\n`);

  let success = 0;
  let errors = 0;
  const errorList = [];

  for (let i = 0; i < eligible.length; i++) {
    const filePath = eligible[i];
    const rel = relative(TRUNK_ROOT, filePath);
    const fn = basename(filePath);

    // Determine folder (first path segment)
    const pathParts = rel.split(/[\\/]/);
    const topFolder = pathParts[0];
    // Section is subfolder(s) between top folder and filename, if any
    const section = pathParts.length > 2 ? pathParts.slice(1, -1).join("/") : null;

    try {
      let content = await readFile(filePath, "utf8");
      // Strip null bytes (PostgreSQL text columns reject \u0000)
      content = content.replace(/\0/g, "");
      const stats = statSync(filePath);
      const slug = toSlug(fn);
      const title = extractTitle(content) || prettifyFilename(fn);
      const category = FOLDER_TO_CATEGORY[topFolder] || topFolder.toLowerCase();
      const familyName = topFolder;

      const payload = {
        slug,
        title,
        family_name: familyName,
        section: section,
        category,
        compiled_markdown: content,
        source_files: [{ path: `Upekrithen-Trunk/${rel.replace(/\\/g, "/")}` }],
        source_count: 1,
        status: "canonical",
        compiled_by: "B084",
        compilation_notes: "Ingested from Upekrithen-Trunk archive by B084",
        content_size_bytes: stats.size,
      };

      const { error } = await supabase
        .from("compiled_documents")
        .upsert(payload, { onConflict: "slug" });

      if (error) {
        throw new Error(`Supabase error: ${error.message} (code: ${error.code})`);
      }

      success++;
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`[${i + 1}/${eligible.length}] OK   ${slug} (${sizeKb} KB)`);
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      errorList.push({ file: rel, error: msg });
      console.error(`[${i + 1}/${eligible.length}] ERR  ${rel}: ${msg}`);
    }
  }

  console.log("\n========================================");
  console.log("TRUNK INGESTION COMPLETE");
  console.log(`  Success: ${success}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`  Total:   ${eligible.length}`);
  console.log("========================================");

  if (errorList.length > 0) {
    console.log("\nFailed files:");
    for (const e of errorList) {
      console.log(`  ${e.file}: ${e.error}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
