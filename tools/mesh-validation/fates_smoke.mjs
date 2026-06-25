#!/usr/bin/env node
/**
 * fates_smoke.mjs - Bishop-side Three Fates smoke
 * BP094 Session 5 - Tests runFates pipeline and fates_log.jsonl append
 */

import { readFileSync, appendFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FATES_DIST = resolve(__dirname, '../../librarian-mcp/dist/scribes/fates.js');
const FATES_LOG = resolve(__dirname, '../../librarian-mcp/stitchpunks/data/fates_log.jsonl');

// Sample session text fixture (~500 words, contains required markers)
const SAMPLE_TEXT = `
Session update for innovation #2270 in BP094 Knight Session 5.
session_id: ses_test_001

This session is executing the Posse module path fix and Three Fates smoke
validation for the M13c THUNDERCLAP gate. The Founding Foundation of the
cooperative platform, established over 37 years of development, represents
the canonical spine of the Liana Banyan Corporation.

The Army Ants Posse decompose primitive (SP-22 / SP-23 Three Fates and
Scribes Cathedral spec) routes hard questions through sub-claim decomposition.
Round-Up sweep fires Posse on each contested or abstained question. The ULTRA
peer (llama3.3:70b) handles generation tasks like decomposition.

Innovations: This session documents the Fates Layer empirical validation as
reduction-to-practice for patent claim purposes. The Three Fates pipeline
(Clotho extraction, Lachesis scoring, Atropos dispatch) routes session content
to the correct Cathedral Scribes for logging and triply-redundant witness.

K438b member-scoped Cathedral surface enables per-member Scribe routing.
Member Scribes include Work, Learning, Projects, Health, and Family.
The triple-witness threshold requires at least 3 Scribes to match before
routing is considered complete (innovation #2270 Claim 4).

Coverage gaps fire when fewer than 3 Scribes match the theme set as a whole.
This is the first empirical smoke run of the Fates layer from a validation
harness context rather than through the MCP tool interface.

Bishop BP094 authorized this Session 5 execution via the Yoke bridge.
Knight reads KNIGHT_QUEUE.md at session start. The THUNDERCLAP gate requires
2/2 PASS via weighted_consensus, escalation_consensus, or roundup_consensus.
The Session 4 Mamba 2 gate polls for both Q01 and Q02 to resolve correctly.

Session 5 scope: Posse path fix in validate-relay.mjs (src->dist correction)
and Three Fates smoke instrumentation. The Banyan Metric ledger row will be
appended after this session lands. Truth-Always principle: report empirical
results verbatim, including failures.

Prov 14 innovation threshing connects to the Scribes Cathedral architecture.
The stitchpunks SP-22 and SP-23 spec anchored Three Fates and member-facing
Cathedrals as canonical architectural primitives. Bishop session B116 opened
the fates_log.jsonl on 2026-04-22.

The cooperative model ensures each member retains cooperative ownership. The
Founding Foundation coordinates the Sweet Sixteen initiatives: Let's Make
Dinner, Household Concierge, MSA Medical Savings Accounts, VSL Very Short
Loans, and the full initiative suite across cooperative domains.

This smoke text is designed to trigger multiple Cathedral Scribes including
Prov14, R9, BRIDLE, Landing, and others. The session validates that the
Fates routing pipeline correctly identifies themes, scores Scribes via the
Lachesis module, and dispatches directives via Atropos. Coverage gap
detection runs after dispatch capping at MAX_DISPATCH = 5 entries.
`;

async function main() {
  // Import runFates
  let runFates;
  try {
    const mod = await import(pathToFileURL(FATES_DIST).href);
    runFates = mod.runFates;
    if (typeof runFates !== 'function') throw new Error('runFates is not a function');
  } catch (err) {
    console.error('[FATES_SMOKE BISHOP] FATAL: cannot import runFates:', err.message);
    process.exit(1);
  }

  // Capture fates_log.jsonl size before
  let sizeBefore = 0;
  let linesBefore = 0;
  try {
    const content = readFileSync(FATES_LOG, 'utf8');
    linesBefore = content.split('\n').filter(l => l.trim()).length;
    sizeBefore = statSync(FATES_LOG).size;
  } catch { /* file may not exist yet */ }

  // Run the Three Fates pipeline
  let result;
  try {
    result = runFates(SAMPLE_TEXT);
  } catch (err) {
    console.error('[FATES_SMOKE BISHOP] FATAL: runFates threw:', err.message);
    process.exit(1);
  }

  const ok = (result && Array.isArray(result.atropos_dispatch) && 'coverage_gaps' in result);
  const dispatchCount = result.atropos_dispatch?.length ?? 0;
  const coverageGaps = result.coverage_gaps ?? [];

  // Append to fates_log.jsonl (caller responsibility per SP-22 spec)
  const logEntry = JSON.stringify({
    ts: new Date().toISOString(),
    session: 'ses_test_001_bp094_session5',
    clotho_themes: result.clotho_themes,
    named_entities: result.named_entities,
    lachesis_scores: result.lachesis_scores,
    atropos_dispatch: result.atropos_dispatch,
    coverage_gaps: result.coverage_gaps,
    source_exchange: 'BP094 Session 5 fates_smoke.mjs - bishop-side smoke validation',
  });

  let appendOk = false;
  let tailLine = '';
  try {
    appendFileSync(FATES_LOG, '\n' + logEntry, 'utf8');
    appendOk = true;
    // Read tail
    const updated = readFileSync(FATES_LOG, 'utf8');
    const lines = updated.split('\n').filter(l => l.trim());
    tailLine = lines[lines.length - 1] ?? '';
  } catch (err) {
    tailLine = `APPEND_FAILED: ${err.message}`;
  }

  // Output
  console.log(`[FATES_SMOKE BISHOP] ok: ${ok}`);
  console.log(`[FATES_SMOKE BISHOP] dispatches count: ${dispatchCount}`);
  console.log(`[FATES_SMOKE BISHOP] coverage_gaps: ${coverageGaps.length > 0 ? coverageGaps.join(', ') : '(empty)'}`);
  console.log(`[FATES_SMOKE BISHOP] fates_log.jsonl tail: ${tailLine.slice(0, 200)}${tailLine.length > 200 ? '...' : ''}`);
  console.log(`[FATES_SMOKE BISHOP] themes extracted: ${result.clotho_themes?.length ?? 0}`);
  console.log(`[FATES_SMOKE BISHOP] entities: ${result.named_entities?.join(', ') ?? '(none)'}`);
  console.log(`[FATES_SMOKE BISHOP] fates_log.jsonl appended: ${appendOk}`);

  if (!ok) {
    console.error('[FATES_SMOKE BISHOP] ASSERTION FAILED: ok is false');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FATES_SMOKE BISHOP] FATAL:', err);
  process.exit(1);
});
