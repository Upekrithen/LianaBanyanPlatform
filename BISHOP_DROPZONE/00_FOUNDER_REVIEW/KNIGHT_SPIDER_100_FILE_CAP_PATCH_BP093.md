# KNIGHT SPIDER 100-FILE CAP PATCH · BP093 SEG-AG

**Composer:** Sonnet 4.6 (claude-sonnet-4-6) · §17 BLOOD · segs: SEG-AE (Phase 4 bridge confirm) → SEG-AF (THIRD Plow 0-hit gadget) → SEG-AG (this patch composition)
**Canon ref:** canon_bishop_seg_self_report_truth_always_verify_with_independent_gadget_bp092 · canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092
**Wall-clock estimate:** ~30 min Knight patch + commit · then Founder fires FOURTH Plow (~45–90 min)

---

## 1 · PREAMBLE

Knight wakes fresh. This paste is a corrective patch dispatch — no exploratory work required. Root cause is confirmed by Bishop empirical read of source file. Instructions are surgical: read one function, apply one patch, syntax-check, commit. Then Founder fires the FOURTH Plow with the patched binary.

§17 BLOOD applies: Knight does not deviate from the patch spec. If Knight encounters an unexpected file state (function signature differs from what is shown below), Knight STOPS and reports the discrepancy to Bishop before touching the file.

---

## 2 · CONTEXT — Empirical finding + exact lines

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js`

**SEG-AE confirmed:** Phase 4 bridge wrote **17,646 TIC files** across 14 domains to:
```
C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\substrate_mmlu_pro_bp083_bridged\
```

**THIRD Plow result (SEG-AF gadget):** Spider returns `0 local hits` on Q1 (math · ring homomorphism) despite 17,646 files present.

**Root cause — lines 188–190 of plow-cli-12blade.js:**
```javascript
const files = fs.existsSync(vaultPath)
  ? fs.readdirSync(vaultPath).filter(f => f.endsWith('.json')).slice(0, 100)
  : [];
```

`slice(0, 100)` hard-caps Spider at 100 files. Files are returned in **alphabetical (lexicographic) order** by `fs.readdirSync`. With 17,646 files whose slugs follow the pattern `bp083_<domain>_<index>.json`, alphabetical order means the first 100 files are overwhelmingly from `bp083_biology_*` and `bp083_business_*`. Domains whose slugs sort later (math, physics, law, philosophy, psychology) receive **zero Spider coverage**.

**Coverage math:** 100 / 17,646 = **0.57%** sampled · math domain = 0 hits guaranteed.

---

## 3 · TASK 1 — Gadget the source (Knight reads full blade_spider)

Knight SHALL read lines 183–211 of:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js
```

Expected output — confirm the function matches exactly:

```javascript
async function blade_spider(question, domain, vaultPath) {
  const t = makeTelem(1, 'Spider');
  try {
    ensureDir(vaultPath);
    const hits  = [];
    const files = fs.existsSync(vaultPath)
      ? fs.readdirSync(vaultPath).filter(f => f.endsWith('.json')).slice(0, 100)
      : [];
    const qWords = new Set(question.toLowerCase().split(/\W+/).filter(w => w.length > 4));
    for (const f of files) {
      try {
        const data  = JSON.parse(fs.readFileSync(path.join(vaultPath, f), 'utf8'));
        const body  = JSON.stringify(data).toLowerCase();
        const overlap = [...qWords].filter(w => body.includes(w)).length;
        if (overlap >= 2) {
          for (const k of (data.known ?? []).slice(0, 2)) {
            const content = String(k.fact ?? k.statement ?? JSON.stringify(k)).slice(0, 600);
            if (content.length >= MINER_MIN_CONTENT_LEN) {
              hits.push({ source: 'substrate:spider', content, weight: 0.80, sid: stableId('substrate', f + content), domain });
            }
          }
        }
      } catch { /* skip malformed */ }
    }
    return { candidates: hits, telemetry: closeTelem(t, true, null, hits.length) };
  } catch (err) {
    return { candidates: [], telemetry: closeTelem(t, false, err.message) };
  }
}
```

If the function does not match, Knight STOPS and reports the discrepancy before proceeding.

---

## 4 · TASK 2 — Implement patch (domain-stratified sampling)

**Recommended approach: (B) Domain-stratified sampling**

Rationale vs alternatives:
- **(A) Lift cap to 1000** — simple but still alphabetically biased; biology/business still over-represented.
- **(B) Domain-stratified sampling** — parses domain from filename slug, groups by domain, samples N per domain. Guarantees Spider sees substrate from EVERY domain regardless of sort order. Empirically robust.
- **(C) Inverted-index pheromone-query** — most precise but requires index pre-build infrastructure not yet wired in this binary.

**Choice: (B).** 50 files per domain × 14 domains = **700 total files sampled** (7× lift, 100% domain coverage).

### BEFORE (lines 188–190):

```javascript
    const files = fs.existsSync(vaultPath)
      ? fs.readdirSync(vaultPath).filter(f => f.endsWith('.json')).slice(0, 100)
      : [];
```

### AFTER (replace lines 188–190 with the following block):

```javascript
    const SPIDER_PER_DOMAIN = 50;
    const allFiles = fs.existsSync(vaultPath)
      ? fs.readdirSync(vaultPath).filter(f => f.endsWith('.json'))
      : [];
    // Domain-stratified sampling: parse domain from bp083_<domain>_* slug.
    // Groups files by domain, then takes up to SPIDER_PER_DOMAIN from each group.
    // Guarantees coverage across all domains regardless of alphabetical sort order.
    const domainBuckets = {};
    for (const f of allFiles) {
      const m = f.match(/^bp083_([a-z_]+?)_/);
      const dom = m ? m[1] : '__other__';
      if (!domainBuckets[dom]) domainBuckets[dom] = [];
      domainBuckets[dom].push(f);
    }
    const files = Object.values(domainBuckets).flatMap(bucket => bucket.slice(0, SPIDER_PER_DOMAIN));
```

**What is unchanged:**
- `qWords` construction (line 191) — untouched
- `overlap >= 2` threshold — untouched
- `data.known ?? []` extraction — untouched
- `MINER_MIN_CONTENT_LEN` guard — untouched
- hit shape `{ source, content, weight, sid, domain }` — untouched

**Expected result after patch:**
- 14 known domains → 14 × 50 = 700 files sampled (up from 100)
- Any domain with fewer than 50 files → all files included (no under-sampling)
- Files not matching `bp083_<domain>_*` slug → bucketed under `__other__` (safe fallback)
- Math/physics/law/philosophy/psychology all guaranteed representation

---

## 5 · TASK 3 — Verify patch

After applying the patch, Knight SHALL:

**Step 3a — Read back the patched function (lines 183–215 approx) and confirm:**
1. `SPIDER_PER_DOMAIN = 50` constant is present
2. `domainBuckets` grouping loop is present
3. Old `.slice(0, 100)` line is GONE
4. `qWords` line immediately follows the `files` assignment

**Step 3b — Syntax check:**
```powershell
node -c "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js"
```
Expected output: `C:\...\plow-cli-12blade.js OK`

If syntax check fails, Knight reads the error, fixes, and re-checks before committing.

**Step 3c — Commit:**
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
git add tools/plow-cli/plow-cli-12blade.js
git commit -m "spider domain-stratified sample BP093 SEG-AG"
```

Capture and report:
- Commit SHA (full)
- Lines changed (diff stat)
- Syntax check output (pass/fail)

---

## 6 · TASK 4 — Re-fire THIRD Plow with patched Spider (Founder fires)

**Founder action required** — Knight does NOT fire the Plow run. Founder copies the exact arguments used for the THIRD Plow run and re-fires with the patched binary.

Output directory for FOURTH Plow:
```
C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\FOURTH_PLOW_42Q_BRIDGED_STRATIFIED_BP093\
```

Knight creates the output directory before the run:
```powershell
New-Item -ItemType Directory -Force "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\PLOW\FOURTH_PLOW_42Q_BRIDGED_STRATIFIED_BP093"
```

**After FOURTH Plow completes**, Bishop will gadget the telemetry receipt for:
- Spider hit count per domain (table: domain · files_sampled · hits · hit_rate)
- Verification that math/physics/law/philosophy/psychology each show >0 hits on domain-relevant Qs
- Overall Spider hit rate vs THIRD Plow baseline (expected: significant lift from ~0% to measurable)
- Any new failure modes (timeout, malformed, overlap < 2 on niche Qs)

---

## 7 · TASK 5 — Yoke return

Knight reports back with:

| Field | Value |
|---|---|
| Commit SHA | (Knight fills) |
| Patched LOC | 3 lines removed · 12 lines inserted |
| Syntax check | PASS / FAIL |
| ELECTRON_TOUCHED | NO |
| FILES_TOUCHED | tools/plow-cli/plow-cli-12blade.js only |
| FOURTH_PLOW_DIR_CREATED | YES / NO |
| Ready for Founder FOURTH Plow fire | YES / BLOCKED (reason) |

---

*Composed by Bishop · Sonnet 4.6 · BP093 SEG-AG · 2026-06-24*
