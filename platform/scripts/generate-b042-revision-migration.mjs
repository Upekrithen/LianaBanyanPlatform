/**
 * generate-b042-revision-migration.mjs
 * Reads BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md (revised),
 * splits by ## SLUG: delimiters, generates UPDATE SQL for each entry.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

const source = readFileSync(
  resolve(root, 'BISHOP_DROPZONE', 'B042_CONTENT_BACKFILL.md'),
  'utf-8'
);

const entries = [];
const blocks = source.split(/^## SLUG: /m).slice(1);

for (const block of blocks) {
  const lines = block.split('\n');
  const slug = lines[0].trim();

  const titleMatch = block.match(/^## TITLE: (.+)$/m);
  const categoryMatch = block.match(/^## CATEGORY: (.+)$/m);

  const title = titleMatch ? titleMatch[1].trim() : slug;
  const category = categoryMatch ? categoryMatch[1].trim() : 'article';

  // Skip: line 0 (slug), then all ## metadata lines, then leading blank lines
  let contentStart = 1; // skip slug line
  while (contentStart < lines.length) {
    const line = lines[contentStart];
    if (line.startsWith('## ') || line.trim() === '') {
      contentStart++;
    } else {
      break;
    }
  }

  const content = lines.slice(contentStart).join('\n').trim();

  if (content.length < 100) {
    console.warn(`SKIP: ${slug} — content too short (${content.length} chars)`);
    continue;
  }

  entries.push({ slug, title, category, content });
  console.log(`  ${slug}: ${(content.length / 1024).toFixed(1)} KB — starts with: "${content.slice(0, 60)}..."`);
}

console.log(`\nParsed ${entries.length} entries from B042 backfill.`);

let sql = `-- Migration: 20260329000006_b042_content_revision.sql
-- Updates 11 Cephas entries with revised content sourced from actual A&A documents,
-- Vault specs, and academic papers (Bishop B042 revision).
-- Previous migration 000005 had first-pass content; this replaces with source-grounded versions.

`;

for (const entry of entries) {
  sql += `-- ${entry.slug} (${entry.category}): ${entry.title}\n`;
  sql += `UPDATE cephas_content_registry\n`;
  sql += `SET content_markdown = $b042rev$\n${entry.content}\n$b042rev$,\n`;
  sql += `    updated_at = now()\n`;
  sql += `WHERE slug = '${entry.slug}';\n\n`;
}

const outPath = resolve(
  root,
  'platform',
  'supabase',
  'migrations',
  '20260329000006_b042_content_revision.sql'
);
writeFileSync(outPath, sql, 'utf-8');

const sizeKB = (Buffer.byteLength(sql, 'utf-8') / 1024).toFixed(1);
console.log(`Written: ${outPath}`);
console.log(`Size: ${sizeKB} KB, ${entries.length} UPDATE statements`);
