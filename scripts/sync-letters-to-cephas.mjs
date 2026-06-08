// Designed-to-be-Copied
/**
 * BP077 — sync-letters-to-cephas.mjs
 *
 * Queries Supabase `outreach_letters` WHERE state = 'dispatched' and writes
 * Hugo content files to Cephas/cephas-hugo/content/letters/{slug}.md
 *
 * FOUNDER-RATIFY GATE (BINDING):
 *   canon_bp077_founder_ratify_gate_no_drafts_published_only_final_copy_bp077
 *   ONLY letters with state = 'dispatched' may publish to Cephas.
 *   Drafts, proposed, scheduled, and all other states are BLOCKED here.
 *   This gate is enforced by the SQL query predicate and the runtime check below.
 *
 * Idempotent: overwrites existing Hugo content files on each run.
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_KEY=... node scripts/sync-letters-to-cephas.mjs
 *
 * Env vars required:
 *   SUPABASE_URL         — Supabase project URL
 *   SUPABASE_SERVICE_KEY — service role key
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const CEPHAS_LETTERS_DIR = join(REPO_ROOT, 'Cephas', 'cephas-hugo', 'content', 'letters');

// ─── ISO timestamp helper ─────────────────────────────────────────────────────
const ts = () => new Date().toISOString();

// ─── Env validation ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(`[${ts()}] FATAL: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment.`);
  process.exit(1);
}

// ─── Supabase client (service role) ──────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── FOUNDER-RATIFY GATE ──────────────────────────────────────────────────────
const RATIFIED_STATE = 'dispatched';

/**
 * Runtime gate check. Belt-and-suspenders: even if a record somehow slips
 * through the SQL WHERE clause, this check ensures it is not written to Cephas.
 */
function assertRatified(letter) {
  if (letter.state !== RATIFIED_STATE) {
    throw new Error(
      `FOUNDER-RATIFY GATE VIOLATION: letter slug="${letter.slug}" has state="${letter.state}" — ` +
        `only state="${RATIFIED_STATE}" may publish to Cephas. Blocked.`
    );
  }
}

// ─── Hugo frontmatter builder ─────────────────────────────────────────────────
function buildHugoFrontmatter(letter) {
  const meta = typeof letter.metadata === 'object' && letter.metadata !== null
    ? letter.metadata
    : {};

  const title = meta.frontmatter_title || letter.recipient_name || letter.slug;
  const date = letter.dispatched_at
    ? letter.dispatched_at.split('T')[0]
    : (meta.frontmatter_date || letter.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const organization = meta.frontmatter_organization || '';
  const tags = Array.isArray(meta.frontmatter_tags) ? meta.frontmatter_tags : [];

  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: "${date}"`,
    `slug: "${letter.slug}"`,
    `recipient_name: ${JSON.stringify(letter.recipient_name)}`,
    `recipient_category: "${letter.recipient_category}"`,
    `recipient_tier: ${letter.recipient_tier ?? 5}`,
  ];

  if (organization) lines.push(`organization: ${JSON.stringify(organization)}`);
  if (tags.length > 0) {
    lines.push(`tags:`);
    for (const tag of tags) lines.push(`  - "${tag}"`);
  }
  if (meta.frontmatter_initiative) {
    lines.push(`initiative: ${JSON.stringify(meta.frontmatter_initiative)}`);
  }

  lines.push(`draft: false`);
  lines.push(`state: "${letter.state}"`);
  if (letter.dispatched_at) lines.push(`dispatched_at: "${letter.dispatched_at}"`);
  lines.push(`source_letter_file: ${JSON.stringify(letter.source_letter_file || '')}`);
  lines.push('---');

  return lines.join('\n');
}

// ─── Strip frontmatter from stored full_text to get clean body ───────────────
function extractBody(fullText) {
  const fmMatch = fullText.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return fmMatch ? fmMatch[1] : fullText;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function main() {
  console.log(`[${ts()}] sync-letters-to-cephas START`);
  console.log(`[${ts()}] FOUNDER-RATIFY GATE ACTIVE: only state='dispatched' will be published`);
  console.log(`[${ts()}] Cephas letters dir: ${CEPHAS_LETTERS_DIR}`);

  // Ensure content/letters directory exists
  await mkdir(CEPHAS_LETTERS_DIR, { recursive: true });

  // Query ONLY dispatched letters — this is the primary gate enforcement
  const { data: letters, error: queryError } = await supabase
    .from('outreach_letters')
    .select(
      'letter_id, slug, recipient_name, recipient_category, recipient_tier, state, full_text, ' +
      'source_letter_file, dispatched_at, created_at, metadata'
    )
    .eq('state', RATIFIED_STATE)
    .order('dispatched_at', { ascending: true });

  if (queryError) {
    console.error(`[${ts()}] FATAL: Supabase query failed: ${queryError.message}`);
    process.exit(1);
  }

  console.log(`[${ts()}] Found ${letters.length} dispatched letter(s) to publish to Cephas`);

  if (letters.length === 0) {
    console.log(`[${ts()}] Nothing to publish. Set state='dispatched' in Supabase to publish a letter.`);
    console.log(`[${ts()}] sync-letters-to-cephas DONE — 0 files written`);
    return { writtenCount: 0, errorCount: 0 };
  }

  let writtenCount = 0;
  let errorCount = 0;

  for (const letter of letters) {
    try {
      // Belt-and-suspenders runtime gate
      assertRatified(letter);

      const hugoFrontmatter = buildHugoFrontmatter(letter);
      const body = extractBody(letter.full_text || '');
      const hugoContent = `${hugoFrontmatter}\n${body}`;
      const outPath = join(CEPHAS_LETTERS_DIR, `${letter.slug}.md`);

      await writeFile(outPath, hugoContent, 'utf8');
      console.log(`[${ts()}] WRITTEN ${letter.slug}.md → ${outPath}`);
      writtenCount++;
    } catch (err) {
      console.error(`[${ts()}] ERROR  slug="${letter.slug}": ${err.message}`);
      errorCount++;
    }
  }

  console.log(`[${ts()}] sync-letters-to-cephas DONE — ${writtenCount} file(s) written, ${errorCount} error(s)`);
  return { writtenCount, errorCount };
}

// Run directly if this is the entry point
if (process.argv[1] === __filename) {
  main().then(({ errorCount }) => process.exit(errorCount > 0 ? 1 : 0));
}
