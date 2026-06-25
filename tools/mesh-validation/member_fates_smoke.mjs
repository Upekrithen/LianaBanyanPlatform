#!/usr/bin/env node
/**
 * member_fates_smoke.mjs - Member-side Three Fates smoke
 * BP094 Session 5 - Tests memberFatesRoute pipeline and cathedral.fates_log insert
 *
 * NOTE: cathedral schema is not exposed via Supabase REST API (PostgREST only
 * exposes public + graphql_public by default). This smoke injects a mock
 * Supabase client that proxies member_scribes reads and fates_log inserts
 * via direct psql (SUPABASE_DB_URL) using the test seam __setCathedralClientForTest.
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MEMBER_FATES_DIST = resolve(__dirname, '../../librarian-mcp/dist/cathedral_supabase/member_fates.js');
const CLIENT_DIST = resolve(__dirname, '../../librarian-mcp/dist/cathedral_supabase/client.js');
const SECRETS_PATH = 'C:/Users/Administrator/.claude/state/secrets/22May2026.env';
const PUBLIC_ENV_PATH = resolve(__dirname, '../../resources/supabase_public.env');

// Load env files without echoing
function loadEnvFile(filePath) {
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      const m = line.match(/^([A-Z_a-z][A-Z_a-z0-9]*)=(.+)$/);
      if (m) {
        let val = m[2].trim();
        const hashIdx = val.indexOf('#');
        if (hashIdx > -1) val = val.slice(0, hashIdx).trim();
        process.env[m[1]] = val;
      }
    }
  } catch { /* absent */ }
}

loadEnvFile(SECRETS_PATH);
loadEnvFile(PUBLIC_ENV_PATH);

function getDbUrl() {
  return process.env.SUPABASE_DB_URL || '';
}

function psqlQuery(sql) {
  const dbUrl = getDbUrl();
  if (!dbUrl) throw new Error('SUPABASE_DB_URL not set');
  const tmpFile = join(tmpdir(), `fates_smoke_${Date.now()}.sql`);
  try {
    writeFileSync(tmpFile, sql, 'utf8');
    const out = execSync(`psql "${dbUrl}" -t -A -f "${tmpFile}"`, {
      encoding: 'utf8', timeout: 15000
    });
    return out.trim();
  } finally {
    try { unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

// Hardcoded scribe data fetched empirically from cathedral.member_scribes via psql
// member_id: 5ed029bd-21e2-45c9-97f5-7a7974e647b7 (Work, Learning, Projects, Health, Family scribes)
const HARDCODED_SCRIBES = [
  { scribe_id: '3e199855-75c5-4023-9263-59d5f1ebf0fb', member_id: '5ed029bd-21e2-45c9-97f5-7a7974e647b7', name: 'Work', primary_field: 'your professional domain', adjacents: [{"field":"current role and responsibilities","level":2},{"field":"team and collaborators","level":3},{"field":"tools and software you rely on","level":3},{"field":"industry context and trends","level":4},{"field":"career goals and trajectory","level":5}], keywords: ['work','job','role','team','project','meeting','client','colleague'], active: true, share_level: null, share_target_id: null, created_at: null, updated_at: null },
  { scribe_id: '89df9222-da48-4687-a9f6-32a0a572dbaf', member_id: '5ed029bd-21e2-45c9-97f5-7a7974e647b7', name: 'Learning', primary_field: 'what you are currently studying', adjacents: [{"field":"courses and curricula","level":2},{"field":"books and articles","level":3},{"field":"concepts and frameworks","level":4},{"field":"questions you are still resolving","level":5}], keywords: ['learn','study','read','course','book','class','tutorial','concept'], active: true, share_level: null, share_target_id: null, created_at: null, updated_at: null },
  { scribe_id: 'bc8a4b01-ee80-4338-922d-b88834e7f92a', member_id: '5ed029bd-21e2-45c9-97f5-7a7974e647b7', name: 'Projects', primary_field: 'active projects', adjacents: [{"field":"milestones and deadlines","level":2},{"field":"blockers and dependencies","level":3},{"field":"stakeholders and reviewers","level":3},{"field":"lessons learned","level":5}], keywords: ['project','milestone','deadline','build','ship','launch','release'], active: true, share_level: null, share_target_id: null, created_at: null, updated_at: null },
  { scribe_id: '5c95f288-11f7-4c0f-bcf4-ffb7a69d586e', member_id: '5ed029bd-21e2-45c9-97f5-7a7974e647b7', name: 'Health', primary_field: 'personal health context, medications, providers', adjacents: [{"field":"providers and appointments","level":2},{"field":"medications and dosages","level":3},{"field":"symptoms and observations","level":4},{"field":"diet and exercise routines","level":5}], keywords: ['doctor','medication','appointment','symptom','exercise','sleep','diet'], active: true, share_level: null, share_target_id: null, created_at: null, updated_at: null },
  { scribe_id: 'bc0f1ea5-b1c2-4cbb-accd-efb2b9a9f0ca', member_id: '5ed029bd-21e2-45c9-97f5-7a7974e647b7', name: 'Family', primary_field: 'family members, dates, preferences, traditions', adjacents: [{"field":"names and relationships","level":2},{"field":"birthdays and anniversaries","level":3},{"field":"preferences and dislikes","level":4},{"field":"traditions and recurring events","level":5}], keywords: ['family','spouse','partner','child','parent','sibling','birthday','anniversary'], active: true, share_level: null, share_target_id: null, created_at: null, updated_at: null },
];

// Create a minimal mock Supabase client for cathedral schema
// Proxies member_scribes (hardcoded) and fates_log (via psql INSERT)
function makeMockCathedralClient() {
  return {
    from(tableName) {
      if (tableName === 'member_scribes') {
        // Return mock query builder for member_scribes
        let filtered = [...HARDCODED_SCRIBES];
        const builder = {
          select() { return builder; },
          eq(col, val) {
            filtered = filtered.filter(r => String(r[col]) === String(val));
            return builder;
          },
          then(resolve, reject) {
            return Promise.resolve({ data: filtered, error: null }).then(resolve, reject);
          },
        };
        return builder;
      }

      if (tableName === 'fates_log') {
        let insertData = null;
        const builder = {
          insert(row) {
            insertData = row;
            return builder;
          },
          select() { return builder; },
          single() {
            return new Promise((resolve) => {
              try {
                // Insert via psql
                const logId = randomUUID();
                const sessParam = insertData.session_id ? `$sess$${insertData.session_id}$sess$` : 'NULL';
                const sql = `INSERT INTO cathedral.fates_log (log_id, member_id, session_id, content_hash, themes, scores, dispatches, coverage_gaps) VALUES ('${logId}', '${insertData.member_id}', ${sessParam}, '${insertData.content_hash}', $themes$${JSON.stringify(insertData.themes)}$themes$::jsonb, $scores$${JSON.stringify(insertData.scores)}$scores$::jsonb, $dispatches$${JSON.stringify(insertData.dispatches)}$dispatches$::jsonb, $gaps$${JSON.stringify(insertData.coverage_gaps)}$gaps$::jsonb) RETURNING log_id;`;
                const out = psqlQuery(sql);
                const returnedId = out.split('\n')[0].trim() || logId;
                resolve({ data: { log_id: returnedId }, error: null });
              } catch (err) {
                resolve({ data: null, error: { message: `psql insert failed: ${err.message}` } });
              }
            });
          },
        };
        return builder;
      }

      // Unknown table - return error
      return {
        select() { return this; },
        eq() { return this; },
        insert() { return this; },
        single() { return Promise.resolve({ data: null, error: { message: `unknown table: ${tableName}` } }); },
        then(resolve) { return Promise.resolve({ data: null, error: { message: `unknown table: ${tableName}` } }).then(resolve); },
      };
    },
  };
}

// Test member_id: 5ed029bd-21e2-45c9-97f5-7a7974e647b7
const TEST_MEMBER_ID = '5ed029bd-21e2-45c9-97f5-7a7974e647b7';

// Same sample text as bishop-side smoke
const SAMPLE_TEXT = `
Session update for innovation #2270 in BP094 Knight Session 5.
session_id: ses_test_001

This session is executing the Posse module path fix and Three Fates smoke
validation for the M13c THUNDERCLAP gate. The Founding Foundation of the
cooperative platform, established over 37 years of development, represents
the canonical spine of the Liana Banyan Corporation.

Work and Learning projects drive family health outcomes through cooperative
engagement. The Projects scribe tracks technical deliverables. Health outcomes
are logged when cooperative participation increases member wellbeing.
Family coordination is central to the cooperative model. Team collaboration
on projects meets deadlines. Client meetings advance career goals.

K438b member-scoped Cathedral surface enables per-member Scribe routing.
Member Scribes include Work, Learning, Projects, Health, and Family.
The triple-witness threshold requires at least 3 Scribes to match before
routing is considered complete (innovation #2270 Claim 4).

Coverage gaps fire when fewer than 3 Scribes match the theme set as a whole.
This is the first empirical smoke run of the member-side Fates layer from
a validation harness context (BP094 Session 5).

Bishop BP094 authorized this Session 5 execution via the Yoke bridge.
Knight reads KNIGHT_QUEUE.md at session start. The THUNDERCLAP gate requires
2/2 PASS. Session 5 scope: Three Fates smoke instrumentation confirming
cathedral.fates_log row write path is operational. Truth-Always principle:
report empirical results verbatim, including failures and honest error traces.
`;

async function main() {
  // Import test seam and memberFatesRoute
  let memberFatesRoute, __setCathedralClientForTest;
  try {
    const clientMod = await import(pathToFileURL(CLIENT_DIST).href);
    __setCathedralClientForTest = clientMod.__setCathedralClientForTest;
    if (typeof __setCathedralClientForTest !== 'function') throw new Error('__setCathedralClientForTest not found in client.js');
  } catch (err) {
    console.error('[FATES_SMOKE MEMBER] FATAL: cannot import client test seam:', err.message);
    process.exit(1);
  }

  try {
    const mod = await import(pathToFileURL(MEMBER_FATES_DIST).href);
    memberFatesRoute = mod.memberFatesRoute;
    if (typeof memberFatesRoute !== 'function') throw new Error('memberFatesRoute is not a function');
  } catch (err) {
    console.error('[FATES_SMOKE MEMBER] FATAL: cannot import memberFatesRoute:', err.message);
    process.exit(1);
  }

  // Get cathedral.fates_log count before
  let countBefore = '0';
  try {
    countBefore = psqlQuery('SELECT COUNT(*) FROM cathedral.fates_log;').trim();
  } catch (err) {
    countBefore = `query_failed: ${err.message}`;
  }

  // Inject mock client via test seam
  const mockClient = makeMockCathedralClient();
  __setCathedralClientForTest(mockClient);

  // Call memberFatesRoute with mock client injected via test seam
  const result = await memberFatesRoute({
    member_id: TEST_MEMBER_ID,
    session_id: 'ses_test_001_bp094_session5',
    content: SAMPLE_TEXT,
    persist: true,
    // client param not passed - uses getCathedralClient() which returns mockClient via test seam
  });

  // Reset test seam
  __setCathedralClientForTest(undefined);

  // Get cathedral.fates_log count after
  let countAfter = '?';
  try {
    countAfter = psqlQuery('SELECT COUNT(*) FROM cathedral.fates_log;').trim();
  } catch (err) {
    countAfter = `query_failed: ${err.message}`;
  }

  // Assertions
  const ok = result && result.ok === true;
  const dispatchCount = result.dispatches?.length ?? 0;
  const coverageGaps = result.coverage_gaps ?? [];
  const fatesLogId = result.fates_log_id ?? null;

  // Output
  console.log(`[FATES_SMOKE MEMBER] ok: ${result.ok ?? false}`);
  console.log(`[FATES_SMOKE MEMBER] member_id resolved: ${TEST_MEMBER_ID}`);
  console.log(`[FATES_SMOKE MEMBER] dispatches count: ${dispatchCount}`);
  console.log(`[FATES_SMOKE MEMBER] coverage_gaps: ${coverageGaps.length > 0 ? coverageGaps.join('; ') : '(empty)'}`);
  console.log(`[FATES_SMOKE MEMBER] cathedral.fates_log row count: ${countAfter}`);
  console.log(`[FATES_SMOKE MEMBER] fates_log_id: ${fatesLogId}`);
  console.log(`[FATES_SMOKE MEMBER] triple_witness_met: ${result.triple_witness_met}`);
  console.log(`[FATES_SMOKE MEMBER] count before: ${countBefore} -> after: ${countAfter}`);

  if (!ok) {
    const errResult = result;
    console.error(`[FATES_SMOKE MEMBER] ASSERTION FAILED: ok=false error=${errResult.error ?? '?'} hint=${errResult.hint ?? '?'}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FATES_SMOKE MEMBER] FATAL:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
