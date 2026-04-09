/**
 * Parse B042_CONTENT_BACKFILL.md and generate SQL migration
 * Reads delimited entries (## SLUG:, ## TITLE:, ## CATEGORY:, ## STYLE:)
 * and generates ON CONFLICT (slug) DO UPDATE statements.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, '../../BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md');
const dest = resolve(__dirname, '../supabase/migrations/20260329000005_b042_content_backfill.sql');

const raw = readFileSync(src, 'utf-8');

// Split on --- separators, then parse each block
const blocks = raw.split(/\n---\n/).filter(b => b.includes('## SLUG:'));

const entries = [];

for (const block of blocks) {
  const slugMatch = block.match(/## SLUG:\s*(.+)/);
  const titleMatch = block.match(/## TITLE:\s*(.+)/);
  const categoryMatch = block.match(/## CATEGORY:\s*(.+)/);
  const styleMatch = block.match(/## STYLE:\s*(.+)/);

  if (!slugMatch || !titleMatch) continue;

  const slug = slugMatch[1].trim();
  const title = titleMatch[1].trim();
  const category = categoryMatch ? categoryMatch[1].trim() : 'article';
  const style = styleMatch ? styleMatch[1].trim() : 'pudding';

  // Content is everything after the last ## header line
  const lines = block.split('\n');
  let contentStart = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('## STYLE:') || lines[i].startsWith('## CATEGORY:') ||
        lines[i].startsWith('## TITLE:') || lines[i].startsWith('## SLUG:')) {
      contentStart = i + 1;
      break;
    }
  }

  // Find content start — skip ## meta lines
  let firstContentLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## SLUG:') || lines[i].startsWith('## TITLE:') ||
        lines[i].startsWith('## CATEGORY:') || lines[i].startsWith('## STYLE:')) {
      firstContentLine = i + 1;
    }
  }

  let content = lines.slice(firstContentLine).join('\n').trim();
  // Remove trailing legal notices that are part of the article
  // (keep them — they're part of the content)

  const mappedStyle = style === 'clean_technical' ? 'clean_academic' : style;
  entries.push({ slug, title, category, style: mappedStyle, content });
}

console.log(`Parsed ${entries.length} entries:`);
entries.forEach(e => console.log(`  - ${e.slug} (${e.category}/${e.style}) [${e.content.length} chars]`));

// Generate SQL
let sql = `-- ============================================
-- B042 Content Backfill — Knight Session 156+
-- 7 articles + 4 system_design entries
-- Source: BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md
-- ============================================

`;

for (const entry of entries) {
  const tag = `b042_${entry.slug.replace(/-/g, '_')}`;
  sql += `INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  '${entry.slug}',
  '${entry.title.replace(/'/g, "''")}',
  '${entry.category}',
  '${entry.style}',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $${tag}$
${entry.content}
$${tag}$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

`;
}

writeFileSync(dest, sql, 'utf-8');
console.log(`\nWrote migration to: ${dest}`);
console.log(`Total size: ${(sql.length / 1024).toFixed(1)} KB`);
