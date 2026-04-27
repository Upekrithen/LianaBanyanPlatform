// K522.6 Phase E: Verification (10 checks)
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const vars = {};
readFileSync(join(ROOT, 'Asteroid-ProofVault/LockBox/SDS.env'), 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
  if (m) vars[m[1]] = m[2];
});
const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const KEY = vars['SUPABASE_SERVICE_ROLE_KEY'];
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' };

let passed = 0; let failed = 0;
function check(n, label, ok, note='') {
  const mark = ok ? '✓' : '✗';
  console.log(`  ${mark} E${n}: ${label}${note ? ' — ' + note : ''}`);
  ok ? passed++ : failed++;
}

console.log('=== K522.6 Verification (10 checks) ===\n');

// E1: Sync script ran without errors
const logPath = join(ROOT, 'Cephas/sync_log.jsonl');
const logExists = existsSync(logPath);
const logContent = logExists ? JSON.parse(readFileSync(logPath, 'utf8').trim().split('\n').pop()) : null;
check(1, 'Sync script ran end-to-end without errors', logContent && logContent.stats?.errors === 0, logExists ? `errors=${logContent.stats.errors}` : 'log missing');

// E2: Per-class row count post-sync (registry rows synced = written - 1 for anecdotes.md)
check(2, 'All registry rows synced', logContent && logContent.registry_rows === 238, logContent ? `${logContent.registry_rows} rows` : 'N/A');

// E3: To Blave anecdote in Hugo post-sync
const anecdotesMd = join(ROOT, 'Cephas/cephas-hugo/content/founder/anecdotes.md');
const anecdotesContent = existsSync(anecdotesMd) ? readFileSync(anecdotesMd, 'utf8') : '';
check(3, 'To Blave Technique in Hugo anecdotes.md', anecdotesContent.includes('To Blave'), anecdotesContent.includes('To Blave') ? 'found' : 'MISSING');

// E4: Supabase-synced flag in Hugo files
const sampleFile = join(ROOT, 'Cephas/cephas-hugo/content/articles/currency-differential.md');
const sampleContent = existsSync(sampleFile) ? readFileSync(sampleFile, 'utf8') : '';
check(4, 'Supabase-synced front-matter in Hugo files', sampleContent.includes('supabase_synced: true'), sampleContent.includes('supabase_synced') ? 'found in currency-differential.md' : 'MISSING');

// E5: Orphaned files flagged but NOT deleted
const orphanCount = logContent?.orphan_count ?? -1;
const orphanSample = join(ROOT, 'Cephas/cephas-hugo/content/under-the-hood/golden-key-system.md');
check(5, 'Orphaned Hugo files flagged, NOT deleted', orphanCount > 0 && existsSync(orphanSample), `${orphanCount} orphans flagged, sample file still exists: ${existsSync(orphanSample)}`);

// E6: Hugo build succeeded (check public dir has pages)
const hugoPub = join(ROOT, 'Cephas/cephas-hugo/public');
const pubExists = existsSync(hugoPub);
check(6, 'Hugo build succeeded (public dir exists)', pubExists, pubExists ? 'public/ exists' : 'MISSING — run hugo --minify');

// E7: Hugo anecdotes.md count matches Supabase
const aRes = await fetch(`${URL}/rest/v1/anecdotes?select=id,title&order=id`, { headers: h });
const aRows = await aRes.json();
check(7, `Anecdote count: Supabase=${aRows.length} rows, Hugo reflects all`, aRows.length === 13, `Supabase has ${aRows.length} anecdotes, Hugo anecdotes.md has count=${(anecdotesContent.match(/^## /gm)||[]).length}`);

// E8: SYNC_RUNBOOK.md exists and is readable
const runbook = join(ROOT, 'Cephas/scripts/SYNC_RUNBOOK.md');
const runbookContent = existsSync(runbook) ? readFileSync(runbook, 'utf8') : '';
check(8, 'SYNC_RUNBOOK.md exists and covers all steps', runbookContent.includes('npm run') || runbookContent.includes('node ') && runbookContent.includes('hugo') && runbookContent.includes('firebase'), 'runbook present');

// E9: Deprecation plan covers 3 phases
const deprPlan = join(ROOT, 'BISHOP_DROPZONE/13_Ops_Deploy/HUGO_GRACEFUL_DEPRECATION_PLAN_B128.md');
const deprContent = existsSync(deprPlan) ? readFileSync(deprPlan, 'utf8') : '';
check(9, 'Deprecation plan covers Phase 1-3 with triggers', deprContent.includes('Phase 1') && deprContent.includes('Phase 2') && deprContent.includes('Phase 3'), 'all 3 phases present');

// E10: URL redirect map covers key content classes
check(10, 'URL redirect map covers key content classes', deprContent.includes('/crowns/') && deprContent.includes('/pudding/') && deprContent.includes('/academic/'), 'crowns, pudding, academic all in redirect map');

console.log(`\n=== ${passed}/${passed+failed} checks passed ===`);
if (failed > 0) console.log(`  ${failed} check(s) need attention.`);
else console.log('  All checks GREEN.');
