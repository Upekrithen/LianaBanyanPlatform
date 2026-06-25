# KNIGHT PHASE 4 — SUBSTRATE BRIDGE · BP093
**Composed by:** Claude claude-sonnet-4-6 (Sonnet 4.6) · SEG-AB  
**Date:** 2026-06-23  
**§§ BLOOD:** §3 §14 §15 §17  
**Dropzone:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\`

---

## 1. PREAMBLE

**Model confirmation:** This paste was composed by Sonnet 4.6 (`claude-sonnet-4-6`). Per BP093 corrective canon: any Bishop dispatch claiming to route substrate or empirical work MUST confirm the Composer model explicitly. Sonnet 4.6 is the correct model for BP093 SEG composition.

**§17 BLOOD — Discovery rule:** Knight reads this paste fresh. The §17 BLOOD discovery rule requires Knight to gadget-verify all empirical claims independently before treating them as settled. Do NOT skip verification steps on the grounds that Bishop "already checked." Bishop checked; Knight must also check.

**SEG-AA empirical findings used:** The context below quotes the SEG-AA substrate audit findings that motivated this Phase 4 build. If anything below contradicts what Knight observes on disk, Knight's fresh gadget wins (canon: `canon_bishop_seg_self_report_truth_always_verify_with_independent_gadget_bp092.eblet.md`).

**§3 BLOOD — Postgres only:** No SQLite primitives. This phase is Node.js only (no SQL migrations), but the output TIC files are consumed by `plow-cli-12blade.js` which writes to Supabase via §15 BLOOD. All new files are filesystem JSON — no schema drift risk. Still: Knight self-audits any incidental DB touch.

**§14 BLOOD — No Electron/peer code touched:** This phase is tools-only (`tools/plow-cli/`). Knight SHALL confirm `ELECTRON_TOUCHED: NO` in Yoke return.

**§15 BLOOD — Supabase direct:** Not applicable to Phase 4 (no migrations). If Task 4 Plow run writes vault files that Sentinel blade later upserts to Supabase, that is handled by existing `plow-cli-12blade.js` logic — Knight does not add new Supabase code here.

---

## 2. CONTEXT — SEG-AA EMPIRICAL FINDINGS

Source file confirmed on disk:  
`C:\Users\Administrator\AppData\Roaming\mnemosynec\substrate\verified_eblets.jsonl`

**Line count:** 17,926 lines (Bishop observed; Knight re-verify with `(Get-Content <path> | Measure-Object -Line).Lines`)

**Class breakdown (Bishop count — Knight re-verify):**
| Class | Pattern | Count |
|---|---|---|
| Class A | `context_seed:mmlu_pro:<domain>:bp083` | 12,062 |
| Class B | `canonical_plow:wikipedia\|arxiv\|openalex:<domain>:bp083` | 5,584 |
| Starter | `starter_chocolate:<domain>:v0.3.7` | 280 |
| **Total** | | **17,926** |

> Note: SEG-AA memo cited 316 Class A and 5,827 Class B. Bishop recount found 12,062 Class A and 5,584 Class B. The Class A figure is substantially larger — likely because the JSONL grew since SEG-AA was written. Knight takes the on-disk count as truth. The bridge script processes all three classes: Class A, Class B, and optionally Starter (treated as Class A for bridge purposes).

**Why the bridge is needed:**  
`plow-cli-12blade.js` Spider blade (Blade 1) reads `<vault>/*.json` files. It calls `fs.readdirSync(vaultPath).filter(f => f.endsWith('.json'))`, parses each as JSON, and looks for `data.known[]` arrays. It matches question keywords against `JSON.stringify(data).toLowerCase()`. The flat JSONL at `verified_eblets.jsonl` is invisible to Spider — it only reads individual `.json` files.

**First Plow baseline (empirical receipt):**  
- Run: `FIRST_PLOW_42Q_BP093` · 6 questions complete  
- Spider hits (`eblet_snapshot.known_count`) across all 6 Q: **0** (zero)  
- Avg BMV: **31.7**  
- Concordant: 1 · Discordant: 4 · Partial: 1  

This is the zero-substrate baseline. After the bridge, the THIRD run should show Spider hits > 0 and BMV uplift.

---

## 3. TASK 1 — BUILD FLAT→TIC BRIDGE SCRIPT

**Target path:**  
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js`

**Write this file exactly:**

```javascript
#!/usr/bin/env node
/**
 * bridge_flat_to_tic_bp093.js
 * Converts verified_eblets.jsonl (flat) → TIC-schema .json files
 * that plow-cli-12blade.js Spider blade can read.
 *
 * Usage:
 *   node bridge_flat_to_tic_bp093.js \
 *     --in  <path/to/verified_eblets.jsonl> \
 *     --out <path/to/output-vault-dir> \
 *     [--class A|B|both|all]   (default: both = A+B)
 *
 * NEVER loads whole file into memory. Stream-parses line by line via readline.
 *
 * §14 BLOOD: no Electron/peer code touched.
 * §17 BLOOD: empirical — run and inspect sample output before claiming success.
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const readline = require('readline');
const crypto  = require('crypto');

// ── CLI args ──────────────────────────────────────────────────────────────────
function getArg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const IN_FILE   = getArg('--in',    null);
const OUT_DIR   = getArg('--out',   null);
const CLASS_ARG = (getArg('--class', 'both')).toLowerCase();

if (!IN_FILE || !OUT_DIR) {
  console.error('Usage: node bridge_flat_to_tic_bp093.js --in <jsonl-path> --out <vault-dir> [--class A|B|both|all]');
  process.exit(1);
}

const INCLUDE_A       = ['a', 'both', 'all'].includes(CLASS_ARG);
const INCLUDE_B       = ['b', 'both', 'all'].includes(CLASS_ARG);
const INCLUDE_STARTER = CLASS_ARG === 'all';

// ── Helpers ───────────────────────────────────────────────────────────────────
function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function sha8(sha256) {
  return String(sha256 || '').slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, 'x');
}

function domainFromProvenance(prov) {
  // context_seed:mmlu_pro:<domain>:bp083
  // canonical_plow:wikipedia:<domain>:bp083
  // starter_chocolate:<domain>:v0.3.7
  const parts = String(prov || '').split(':');
  if (parts[0] === 'context_seed')    return parts[2] || 'unknown';
  if (parts[0] === 'canonical_plow')  return parts[2] || 'unknown';
  if (parts[0] === 'starter_chocolate') return parts[1] || 'unknown';
  return 'unknown';
}

function classifyEntry(prov) {
  if (!prov) return null;
  if (prov.startsWith('context_seed:'))    return 'A';
  if (prov.startsWith('canonical_plow:'))  return 'B';
  if (prov.startsWith('starter_chocolate:')) return 'STARTER';
  return null;
}

function safeSlug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

function buildFact(entry, cls) {
  if (cls === 'A' || cls === 'STARTER') {
    // Class A: question → answer pair
    const q = String(entry.question || '').trim();
    const a = String(entry.answer   || '').trim();
    return `${q} → ${a}`;
  }
  if (cls === 'B') {
    // Class B: retrieved text (stored in answer field by Plow)
    const text = String(entry.answer || '').trim();
    return text.length > 500 ? text.slice(0, 500) + '…' : text;
  }
  return String(entry.answer || entry.question || '').slice(0, 500);
}

function buildTIC(entry, cls, bridgedAt) {
  const domain = domainFromProvenance(entry.provenance);
  const id8    = sha8(entry.sha256);
  const fact   = buildFact(entry, cls);

  return {
    id:       entry.sha256 ? entry.sha256.slice(0, 16) : crypto.randomBytes(8).toString('hex'),
    domain,
    known: [
      {
        fact,
        source:   entry.provenance || 'unknown',
        sha256:   entry.sha256     || '',
        verified: true
      }
    ],
    theories_open:            [],
    eliminated:               [],
    dependencies_upstream:    [],
    applications_downstream:  [],
    provenance:    entry.provenance || '',
    bridged_at_iso: bridgedAt
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  ensureDir(OUT_DIR);

  const BRIDGED_AT = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  let written   = 0;
  let skipped   = 0;
  let lineNo    = 0;
  let filteredOut = 0;

  const domainCounts = {};

  const rl = readline.createInterface({
    input:     fs.createReadStream(IN_FILE, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lineNo++;
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry;
    try {
      entry = JSON.parse(trimmed);
    } catch {
      skipped++;
      continue;
    }

    const cls = classifyEntry(entry.provenance);
    if (!cls) { skipped++; continue; }

    // Filter by --class arg
    if (cls === 'A'       && !INCLUDE_A)       { filteredOut++; continue; }
    if (cls === 'B'       && !INCLUDE_B)       { filteredOut++; continue; }
    if (cls === 'STARTER' && !INCLUDE_STARTER) { filteredOut++; continue; }

    // Build TIC
    const tic = buildTIC(entry, cls, BRIDGED_AT);

    // Filename: bp083_<domain>_<sha256[:8]>.json  — idempotent re-run safe
    const domain   = tic.domain;
    const filename = `bp083_${safeSlug(domain)}_${sha8(entry.sha256)}.json`;
    const outPath  = path.join(OUT_DIR, filename);

    try {
      fs.writeFileSync(outPath, JSON.stringify(tic, null, 2), 'utf8');
      written++;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch (err) {
      console.error(`[bridge] write error line ${lineNo}: ${err.message}`);
      skipped++;
      continue;
    }

    // Progress every 500 entries written
    if (written % 500 === 0) {
      console.log(`[bridge] progress: ${written} written (line ${lineNo}, skipped ${skipped})`);
    }
  }

  // ── Final summary ────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('BRIDGE COMPLETE');
  console.log(`  Input file:     ${IN_FILE}`);
  console.log(`  Output dir:     ${OUT_DIR}`);
  console.log(`  Lines read:     ${lineNo}`);
  console.log(`  Written:        ${written}`);
  console.log(`  Skipped:        ${skipped}`);
  console.log(`  Filtered out:   ${filteredOut}`);
  console.log('\nPer-domain breakdown:');
  for (const [d, c] of Object.entries(domainCounts).sort()) {
    console.log(`  ${d.padEnd(20)} ${c}`);
  }
  console.log('══════════════════════════════════════════\n');

  // ── Write _MANIFEST.md ───────────────────────────────────────────────────
  let inputSha256 = '';
  try {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(IN_FILE);
    await new Promise((resolve, reject) => {
      stream.on('data', d => hash.update(d));
      stream.on('end',  resolve);
      stream.on('error', reject);
    });
    inputSha256 = hash.digest('hex');
  } catch { inputSha256 = 'error-computing'; }

  const domainRows = Object.entries(domainCounts).sort()
    .map(([d, c]) => `| ${d} | ${c} |`).join('\n');

  const manifest = `# _MANIFEST.md — Substrate Bridge BP093
Generated: ${new Date().toISOString()}
Source: ${IN_FILE}
Source sha256: ${inputSha256}
Class filter: ${CLASS_ARG}

## Totals
| Metric | Count |
|---|---|
| Lines read | ${lineNo} |
| TIC files written | ${written} |
| Skipped (malformed) | ${skipped} |
| Filtered out (class) | ${filteredOut} |

## Per-Domain Count
| Domain | Files |
|---|---|
${domainRows}
`;

  fs.writeFileSync(path.join(OUT_DIR, '_MANIFEST.md'), manifest, 'utf8');
  console.log(`[bridge] Manifest written → ${path.join(OUT_DIR, '_MANIFEST.md')}`);
}

main().catch(err => {
  console.error('[bridge] fatal:', err);
  process.exit(1);
});
```

**Write the above to:**  
`C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js`

---

## 4. TASK 2 — RUN THE BRIDGE

After writing the script, execute:

```powershell
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js" `
  --in  "C:\Users\Administrator\AppData\Roaming\mnemosynec\substrate\verified_eblets.jsonl" `
  --out "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged" `
  --class both
```

**Expected behavior:**
- Output dir created automatically if absent: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged\`
- Progress printed every 500 entries written
- Final summary shows per-domain breakdown
- `_MANIFEST.md` written to output dir
- Expected TIC files: ~17,646 (Class A: 12,062 + Class B: 5,584) if `--class both`
  - (Starter 280 excluded by `--class both`; use `--class all` to include)

**§17 BLOOD verify:** After run completes, confirm:
```powershell
(Get-ChildItem "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged" -Filter "*.json" | Where-Object { $_.Name -ne '_MANIFEST.md' }).Count
```
Count must be > 0. If 0, the stream-parse failed — check Node version (`node --version` must be ≥ 14 for `for await` readline).

---

## 5. TASK 3 — SAMPLE VERIFY (5 FILES)

After Task 2 completes, Knight reads 5 files from the output vault to confirm TIC schema is correct.

**Method:** Use Glob on `substrate_mmlu_pro_bp083_bridged/*.json` to find files, then Read 5 of them.

For each, confirm:
- `id` field present (16-char hex string)
- `domain` field is a valid MMLU-Pro domain string (e.g., `math`, `physics`, `engineering`)
- `known` is an array with at least 1 element
- `known[0].fact` is a non-empty string ≥ 10 chars
- `known[0].verified` is `true`
- `known[0].source` matches the original provenance pattern
- `theories_open`, `eliminated`, `dependencies_upstream`, `applications_downstream` are all empty arrays
- `bridged_at_iso` is `"2026-06-23"`

**Pass criteria:** All 5 files pass all checks. If any fail, report exact field/value that failed. Do NOT proceed to Task 4 if schema is wrong — Task 4's entire value depends on Spider blade reading these files correctly.

---

## 6. TASK 4 — FIRE PLOW PRIMED-SUBSTRATE RUN (THIRD RUN)

**First: check if M0 is idle**

```powershell
curl -s http://localhost:11434/api/ps
```

If response shows any model with `size_vram > 0` and `expires_at` in the future, M0 is busy. **Queue Task 4** for after current work completes. Do not interrupt Founder's W1 if running.

If M0 is idle (empty `models` array), proceed:

```powershell
New-Item -ItemType Directory -Force "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093" | Out-Null

node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js" `
  "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\shard_42q_12blade_bp093.json" `
  --model llama3.3:70b `
  --ollama http://localhost:11434 `
  --out "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\twelveblade_bridged.jsonl" `
  --telemetry "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\twelveblade_telem_bridged.json" `
  --vault "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged"
```

**What this proves:** Spider blade will now scan up to 100 files from `substrate_mmlu_pro_bp083_bridged/`, match question keywords, and inject `known[]` facts as context. The BMV uplift (if any) is the substrate-compounding empirical receipt.

**Wave-clock:** Note start time and end time in Yoke return. Expected wall-clock: 45–90 min for 42Q at llama3.3:70b.

---

## 7. TASK 5 — EMPIRICAL COMPOUNDING REPORT

After Task 4 completes, Knight writes a comparison report.

**Report path:**  
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_COMPOUNDING_RECEIPT_BP093.md`

**Gadget these comparisons:**

### Per-Q Spider hits
```powershell
# First Plow (baseline):
Get-Content "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\FIRST_PLOW_42Q_BP093\twelveblade_telemetry.jsonl" |
  ForEach-Object { try { ($_ | ConvertFrom-Json).eblet_snapshot.known_count } catch { 0 } } |
  Measure-Object -Sum -Average

# Third Plow (bridged):
Get-Content "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\THIRD_PLOW_42Q_BRIDGED_BP093\twelveblade_telem_bridged.json" |
  ConvertFrom-Json | ... # adapt to actual structure
```

### Per-Q BMV comparison
Extract `bmv_score` per question from First and Third runs. Compute:
- Δ BMV per Q (Third − First)
- Mean BMV uplift across all Q
- # of Q where BMV improved vs regressed

### Three Fates (concordance) distribution
| Outcome | First | Third | Δ |
|---|---|---|---|
| CONCORDANT | ? | ? | ? |
| PARTIAL | ? | ? | ? |
| DISCORDANT | ? | ? | ? |

### Furnace survivor comparison
- Blade 8 (Furnace) survivor count: First vs Third

**Report must include:**
1. Whether Spider hit count increased (expected: yes, if domain keywords overlap ≥ 2 words)
2. Whether BMV improved (expected: yes for domain-matched Q)
3. Honest null result if no uplift: state "substrate compounding not demonstrated at 42Q scale — possible causes: Spider 100-file cap, keyword overlap threshold ≥ 2"
4. Next step recommendation (scale bridge → full 17K files visible, increase Spider cap to 500)

---

## 8. TASK 6 — YOKE RETURN

Knight returns to Bishop with:

```
PHASE 4 YOKE RETURN — BP093

Bridge script:       C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\bridge_flat_to_tic_bp093.js
TIC files written:   <count>
Sample verify:       PASS / FAIL (list any failures)
MANIFEST sha256:     <input file sha256 from _MANIFEST.md>

THIRD Plow run:
  Start:             <HH:MM UTC>
  End:               <HH:MM UTC>
  Wave-clock:        <minutes>
  OR Queue status:   QUEUED — M0 busy with <model>, ETA <time>

Compounding report:  C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_COMPOUNDING_RECEIPT_BP093.md
  Spider hit delta:  +<n> (First: 0, Third: <n>)
  BMV delta:         +<n> (First avg: 31.7, Third avg: <n>)
  Concordance delta: CONCORDANT <first>→<third>

ELECTRON_TOUCHED: NO
FILES_TOUCHED:
  - tools/plow-cli/bridge_flat_to_tic_bp093.js (NEW)
  - Asteroid-ProofVault/state/eblets/substrate_mmlu_pro_bp083_bridged/ (NEW DIR, <n> files)
  - receipts/PLOW/THIRD_PLOW_42Q_BRIDGED_BP093/ (NEW DIR)
  - BISHOP_DROPZONE/00_FOUNDER_REVIEW/SUBSTRATE_COMPOUNDING_RECEIPT_BP093.md (NEW)
```

---

## 9. §14 §15 §17 BLOOD REMINDERS

**§14 BLOOD:** No Electron, no peer-mesh, no MnemosyneC app code. This phase touches `tools/plow-cli/` only. If Knight accidentally opens any file under `src/` (Electron/React) it must stop and return to Bishop.

**§15 BLOOD:** Supabase direct access stays within existing `plow-cli-12blade.js` patterns. Knight does not add new Supabase endpoints. The bridge writes filesystem JSON only.

**§17 BLOOD — Discovery rule (verbatim for Knight):** If any empirical observation during this phase contradicts the Context section (section 2), Knight's fresh observation wins. Log the discrepancy in the Yoke return. Bishop will update MEMORY.md.

**Postgres syntax reminder (§3 BLOOD):** No SQL in this phase, but note for any incidental DB work: `gen_random_uuid()` not `uuid()`, `TIMESTAMPTZ` not `DATETIME`, `BIGSERIAL` not `INTEGER AUTOINCREMENT`.

---

## 10. WALL-CLOCK ESTIMATES

| Task | Estimated time |
|---|---|
| Task 1: Write bridge script | ~5 min |
| Task 2: Run bridge (17K entries, stream) | ~5–10 min |
| Task 3: Sample verify (5 files) | ~2 min |
| Task 4: Third Plow run (42Q, llama3.3:70b) | ~45–90 min |
| Task 5: Empirical compounding report | ~10 min |
| **Total** | **~67–117 min** |

Tasks 1–3 can complete immediately. Task 4 can run in background while Knight completes other Phases. Task 5 gates on Task 4 completion.

---

*End of Knight Phase 4 paste — BP093 SEG-AB · Sonnet 4.6 · 2026-06-23*
