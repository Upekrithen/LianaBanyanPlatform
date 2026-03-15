/**
 * Parse Bishop's SPEC_EXPANSION_BATCH_*.md files → SQL migration
 * Run: cd platform && node scripts/parse_spec_expansions.cjs
 *
 * Reads all SPEC_EXPANSION_BATCH_*.md from BISHOP_DROPZONE, extracts
 * innovation number + full spec paragraph, generates a single SQL migration.
 */

const fs = require('fs');
const path = require('path');

const DROPZONE = path.resolve(__dirname, '..', '..', 'BISHOP_DROPZONE');
const OUTPUT = path.resolve(__dirname, '..', 'supabase', 'migrations', '20260315000001_innovation_log_spec_expansion.sql');

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

function parseSpecFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];

  const regex = /## Innovation #(\d+)\s*[—–-]\s*(.+?)[\r\n]+(?:\*\*Category:\*\*.*?[\r\n]+)?(?:\*\*Patent Bag:\*\*.*?[\r\n]+)?[\r\n]*(A system comprises:[\s\S]*?)(?=\n## Innovation #|\n---\s*\n## |$)/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1], 10);
    const title = match[2].trim();
    let spec = match[3].trim();

    // Remove trailing "---" separators
    spec = spec.replace(/\n---\s*$/, '').trim();
    // Collapse internal newlines to single spaces for SQL
    spec = spec.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

    if (num && spec.length > 50) {
      results.push({ num, title, spec });
    }
  }

  return results;
}

function main() {
  const files = fs.readdirSync(DROPZONE)
    .filter(f => f.startsWith('SPEC_EXPANSION_BATCH_') && f.endsWith('.md'))
    .sort()
    .map(f => path.join(DROPZONE, f));

  if (files.length === 0) {
    console.error('No SPEC_EXPANSION_BATCH_*.md files found in', DROPZONE);
    process.exit(1);
  }

  console.log(`Found ${files.length} spec expansion files:`);
  files.forEach(f => console.log('  ', path.basename(f)));

  let allSpecs = [];
  for (const f of files) {
    const specs = parseSpecFile(f);
    console.log(`  ${path.basename(f)}: parsed ${specs.length} innovations`);
    allSpecs = allSpecs.concat(specs);
  }

  // Deduplicate by innovation number (keep last)
  const byNum = new Map();
  for (const s of allSpecs) {
    byNum.set(s.num, s);
  }
  const deduped = Array.from(byNum.values()).sort((a, b) => a.num - b.num);

  console.log(`\nTotal unique innovations parsed: ${deduped.length}`);

  // Generate SQL
  const lines = [
    '-- Innovation Log Specification Expansion (Session 19/20 — Bishop harvest)',
    '-- Updates description column with full "system comprises" patent-quality specs',
    '-- Only updates innovations #1001-#1572 that had terse SQL summaries',
    '-- Does NOT overwrite #1-#150 (patent bags) or #1600-#1662 (addendum)',
    '',
  ];

  for (const { num, title, spec } of deduped) {
    if (num >= 1600) continue; // skip addendum range
    if (num < 1001) continue;  // skip patent bag range
    lines.push(`UPDATE public.innovation_log SET description = '${escapeSQL(spec)}' WHERE innovation_number = ${num} AND (description IS NULL OR length(description) < ${Math.min(spec.length, 200)});`);
  }

  lines.push('');
  lines.push(`-- Parsed ${deduped.length} innovations from ${files.length} batch files`);

  fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
  console.log(`\nMigration written to: ${OUTPUT}`);
  console.log(`SQL statements: ${deduped.filter(s => s.num >= 1001 && s.num < 1600).length}`);
}

main();
