// Designed-to-be-Copied
/**
 * BP077 — sync-letters-to-supabase.mjs
 *
 * Reads all *.md files from letters/ directory, parses YAML frontmatter,
 * and upserts each letter into the Supabase `outreach_letters` table.
 *
 * Idempotent: ON CONFLICT (slug) → updates full_text, source_letter_file, updated_at.
 * Drafts are synced to Supabase but NEVER published to Cephas (enforced in sync-letters-to-cephas.mjs).
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_KEY=... node scripts/sync-letters-to-supabase.mjs
 *
 * Dependency:
 *   @supabase/supabase-js — present in platform/package.json (^2.74.0).
 *   If running from repo root, either:
 *     npm install @supabase/supabase-js          (adds to root node_modules)
 *   or run from platform/:
 *     cd platform && node ../scripts/sync-letters-to-supabase.mjs
 *
 * Env vars required:
 *   SUPABASE_URL         — e.g. https://ruuxzilgmuwddcofqecc.supabase.co
 *   SUPABASE_SERVICE_KEY — service role key (bypasses RLS; never use anon key here)
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const LETTERS_DIR = join(REPO_ROOT, 'letters');

// ─── ISO timestamp helper ─────────────────────────────────────────────────────
const ts = () => new Date().toISOString();

// ─── Env validation ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(`[${ts()}] FATAL: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment.`);
  process.exit(1);
}

// ─── Supabase client (service role — bypasses RLS) ───────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── YAML frontmatter parser (no external deps) ───────────────────────────────
/**
 * Splits a markdown file into { frontmatter: Record<string,any>, body: string }.
 * Handles simple scalar values, quoted strings, arrays, and nested keys.
 * Not a full YAML parser — covers the letter frontmatter format in use.
 */
function parseFrontmatter(raw) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) return { frontmatter: {}, body: raw };

  const yamlBlock = fmMatch[1];
  const body = fmMatch[2];
  const fm = {};

  let currentKey = null;
  let inArray = false;
  const arrayBuffer = [];

  for (const line of yamlBlock.split(/\r?\n/)) {
    // Array item
    if (inArray) {
      const arrItem = line.match(/^\s+-\s+"?(.+?)"?\s*$/);
      if (arrItem) {
        arrayBuffer.push(arrItem[1].replace(/^["']|["']$/g, ''));
        continue;
      } else {
        fm[currentKey] = [...arrayBuffer];
        arrayBuffer.length = 0;
        inArray = false;
      }
    }

    // Skip comments and blank lines
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Key-value or key-only (array follows)
    const kvMatch = line.match(/^(\w[\w_.-]*):\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1].trim();
    const val = kvMatch[2].trim();

    if (val === '' || val === '|' || val === '>') {
      currentKey = key;
      inArray = false;
      continue;
    }

    if (val.startsWith('[')) {
      // Inline array: ["a", "b"]
      try {
        fm[key] = JSON.parse(val.replace(/'/g, '"'));
      } catch {
        fm[key] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
      }
      continue;
    }

    // Array start (value is empty after colon on next lines)
    if (val === '') {
      currentKey = key;
      inArray = true;
      continue;
    }

    // Scalar — strip surrounding quotes
    fm[key] = val.replace(/^["']|["']$/g, '');
  }

  // Flush trailing array
  if (inArray && arrayBuffer.length > 0) {
    fm[currentKey] = [...arrayBuffer];
  }

  return { frontmatter: fm, body };
}

// ─── Slug derivation ──────────────────────────────────────────────────────────
function slugFromFilename(filename) {
  return basename(filename, '.md')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// ─── Recipient category mapping ───────────────────────────────────────────────
const VALID_CATEGORIES = new Set([
  'crown_letter', 'research_invitation', 'press_pitch',
  'partnership_ask', 'patron_outreach', 'media_pitch',
  'follow_up', 'apology', 'other',
]);

function deriveCategory(fm) {
  const raw = (fm.type || fm.letter_type || fm.recipient_category || '').toString();
  const normalized = raw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return VALID_CATEGORIES.has(normalized) ? normalized : 'other';
}

// ─── State derivation ─────────────────────────────────────────────────────────
const VALID_STATES = new Set([
  'draft', 'proposed', 'scheduled', 'dispatched',
  'acknowledged', 'answered', 'no_response', 'withdrawn', 'retracted',
]);

function deriveState(fm, filename) {
  // Explicit state in frontmatter takes precedence
  const fmState = (fm.state || '').toString().toLowerCase().trim();
  if (VALID_STATES.has(fmState)) return fmState;

  // _DRAFT suffix in filename
  if (basename(filename, '.md').toUpperCase().endsWith('_DRAFT')) return 'draft';

  // Status field contains SCAFFOLD / DRAFT keywords
  const status = (fm.status || '').toString().toUpperCase();
  if (status.includes('SCAFFOLD') || status.includes('DRAFT') || status.includes('NOT FINAL')) {
    return 'draft';
  }

  // Safe default — founders must explicitly set state='dispatched' to publish to Cephas
  return 'draft';
}

// ─── what_we_are_asking extraction ───────────────────────────────────────────
/**
 * Required NOT NULL column. Checks frontmatter first, then looks for a
 * "## What We Are Asking" section in body. Falls back to placeholder.
 */
function extractWhatWeAreAsking(fm, body) {
  if (fm.what_we_are_asking) return fm.what_we_are_asking.toString();

  const sectionMatch = body.match(
    /##\s+(?:What\s+We\s+Are\s+Asking|Our\s+Ask|The\s+Ask)[^\n]*\n+([\s\S]*?)(?=\n##|\n---|\n$|$)/i
  );
  if (sectionMatch) {
    return sectionMatch[1].trim().slice(0, 2000);
  }

  return '(See full_text — what_we_are_asking not yet extracted by founder)';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function main() {
  console.log(`[${ts()}] sync-letters-to-supabase START`);
  console.log(`[${ts()}] Letters directory: ${LETTERS_DIR}`);

  let files;
  try {
    files = (await readdir(LETTERS_DIR)).filter((f) => f.endsWith('.md'));
  } catch (err) {
    console.error(`[${ts()}] FATAL: Cannot read letters directory: ${err.message}`);
    process.exit(1);
  }

  console.log(`[${ts()}] Found ${files.length} letter file(s)`);

  let successCount = 0;
  let errorCount = 0;

  for (const filename of files) {
    const filepath = join(LETTERS_DIR, filename);
    const relativePath = `letters/${filename}`;

    try {
      const raw = await readFile(filepath, 'utf8');
      const { frontmatter: fm, body } = parseFrontmatter(raw);

      const slug = fm.slug ? fm.slug.toString() : slugFromFilename(filename);
      const recipientName = (fm.recipient || fm.recipient_name || basename(filename, '.md'))
        .toString()
        .trim();
      const recipientCategory = deriveCategory(fm);
      const state = deriveState(fm, filename);
      const whatWeAreAsking = extractWhatWeAreAsking(fm, body);

      const record = {
        slug,
        recipient_name: recipientName,
        recipient_category: recipientCategory,
        state,
        full_text: raw,
        what_we_are_asking: whatWeAreAsking,
        source_letter_file: relativePath,
        metadata: {
          frontmatter_title: fm.title || null,
          frontmatter_date: fm.date || null,
          frontmatter_tags: fm.tags || [],
          frontmatter_organization: fm.organization || null,
          frontmatter_initiative: fm.initiative || null,
          frontmatter_bp_version: fm.bp_version || fm.session || null,
          source_sync: 'sync-letters-to-supabase.mjs',
          synced_at: ts(),
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('outreach_letters')
        .upsert(record, {
          onConflict: 'slug',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`[${ts()}] ERROR  ${filename} (slug: ${slug}): ${error.message}`);
        errorCount++;
      } else {
        console.log(`[${ts()}] OK     ${filename} → slug="${slug}" state="${state}" category="${recipientCategory}"`);
        successCount++;
      }
    } catch (err) {
      console.error(`[${ts()}] ERROR  ${filename}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`[${ts()}] sync-letters-to-supabase DONE — ${successCount} ok, ${errorCount} errors`);
  return { successCount, errorCount };
}

// Run directly if this is the entry point
if (process.argv[1] === __filename) {
  main().then(({ errorCount }) => process.exit(errorCount > 0 ? 1 : 0));
}
