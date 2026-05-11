// tests/T1_fixtures_sanity.test.mjs
// T1: Each fixture loads + reference output diffs against itself (sanity).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES  = join(__dirname, '..', 'fixtures');

function collectFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) collectFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

test('T1a: W1 fixture — 12 TypeScript source files exist', () => {
  const srcDir = join(FIXTURES, 'w1-multi-file-refactor', 'src');
  assert.ok(existsSync(srcDir), `src dir missing: ${srcDir}`);
  const tsFiles = collectFiles(srcDir).filter(f => f.endsWith('.ts'));
  assert.equal(tsFiles.length, 12, `Expected 12 .ts files, got ${tsFiles.length}`);
});

test('T1b: W1 fixture — reference output exists with 12 files', () => {
  const refDir = join(FIXTURES, 'w1-multi-file-refactor', 'reference_output');
  assert.ok(existsSync(refDir), `reference_output dir missing`);
  const tsFiles = collectFiles(refDir).filter(f => f.endsWith('.ts'));
  assert.equal(tsFiles.length, 12, `Expected 12 reference .ts files, got ${tsFiles.length}`);
});

test('T1c: W1 fixture — reference output files contain import syntax (ESM)', () => {
  const refDir = join(FIXTURES, 'w1-multi-file-refactor', 'reference_output');
  const tsFiles = collectFiles(refDir).filter(f => f.endsWith('.ts'));
  for (const f of tsFiles) {
    const src = readFileSync(f, 'utf8');
    // The transformed files should use 'import' not 'require'
    assert.ok(!src.includes('require('), `${f} still has require() after transform`);
  }
});

test('T1d: W2 fixture — inventory.py exists and has expected classes/functions', () => {
  const pyPath = join(FIXTURES, 'w2-doc-test-gen', 'inventory.py');
  assert.ok(existsSync(pyPath), 'inventory.py missing');
  const src = readFileSync(pyPath, 'utf8');
  const expectedFns = [
    'compute_reorder_quantity', 'export_to_csv', 'import_from_csv',
    'generate_summary_report', 'find_items_by_location',
    'bulk_update_quantities', 'validate_csv_schema', 'iter_reorder_suggestions',
  ];
  for (const fn of expectedFns) {
    assert.ok(src.includes(`def ${fn}`), `inventory.py missing function: ${fn}`);
  }
  const expectedClasses = ['InventoryItem', 'StockMovement', 'Inventory'];
  for (const cls of expectedClasses) {
    assert.ok(src.includes(`class ${cls}`), `inventory.py missing class: ${cls}`);
  }
});

test('T1e: W3 fixture — raw_orders.csv exists and has ~5000 data rows', () => {
  const csvPath = join(FIXTURES, 'w3-data-cleaning', 'raw_orders.csv');
  assert.ok(existsSync(csvPath), 'raw_orders.csv missing');
  const lines = readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim());
  assert.ok(lines.length >= 5000, `Expected >=5000 rows, got ${lines.length - 1}`);
});

test('T1f: W3 fixture — reference outputs exist with 5 sections in report', () => {
  const refDir = join(FIXTURES, 'w3-data-cleaning', 'reference_outputs');
  assert.ok(existsSync(join(refDir, 'cleaned_orders.csv')), 'cleaned_orders.csv missing');
  assert.ok(existsSync(join(refDir, 'reference_report.json')), 'reference_report.json missing');
  const report = JSON.parse(readFileSync(join(refDir, 'reference_report.json'), 'utf8'));
  const REQUIRED = ['date_normalization', 'currency_normalization', 'dedup', 'encoding_repair', 'outlier_quarantine'];
  for (const s of REQUIRED) {
    assert.ok(s in report, `reference_report.json missing section: ${s}`);
  }
});
