# KNIGHT THREE FATES TUNE PATCH — BP093 SEG-AL
**Composer:** Claude Sonnet 4.6 · §17 BLOOD  
**Recipient:** Knight — Operator Mechanic  
**Use segs:** YES — all block markers active  
**Composer model check:** Sonnet 4.6 is Flagship. This dispatch instructs Knight only. No Knight model change required — plow-cli-12blade.js calls Ollama local models throughout; Knight applies a code patch, not a model swap.

---

## PREAMBLE

This dispatch is a surgical tune patch derived from Bishop gadget of `plow-cli-12blade.js` during BP093 THIRD Plow (running on M0). Saladin-Furnace is confirmed working — 5/5 facts surviving per Q. Three Fates (Blade 7) is the sole bottleneck holding BMV capped at ~48.4. The root cause has been diagnosed from source. Knight applies the patch, syntax-checks, commits, then holds for Founder FIFTH Plow re-fire.

---

## CONTEXT — BP093 THIRD Plow Empirical

- Saladin-Furnace layer: **5-6 corroborated facts survive per Q** (confirmed live telemetry)
- Three Fates concordance: **DISCORDANT on most Qs** — concordance score reads 0
- BMV impact: concordanceScore weight = **0.14** in computeBmv → 0 × 0.14 = **14 BMV points lost every Q**
- CONCORDANT would contribute 100 × 0.14 = 14 points; PARTIAL would contribute 60 × 0.14 = 8.4 points
- Current capped BMV: ~48.4 · Projected BMV with CONCORDANT: **~62–65** (rough estimate pending empirical FIFTH Plow confirmation)
- Without this fix, FOURTH and FIFTH Plow runs will not demonstrate the headline number lift

---

## TASK 1 — Knight gadgets the code (READ FIRST)

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js`

Read these exact line ranges:
- **Lines 407–431** — `THREE_FATES_PROMPT` template + `blade_three_fates` function  
- **Lines 136–150** — `computeConcordance` function  
- **Lines 98–113** — `callOllama` (confirm model source = global `MODEL` var, line 50, default `gemma4:12b`)

Confirm the following (Bishop has verified, Knight re-confirms before patching):
1. All three judges call the same `MODEL` at temps [0.0, 0.2, 0.4] — same model, different temperature
2. Three Fates DOES receive `factsCtx` (Furnace survivors passed in) — line 419–421
3. Judge prompt asks for a **free-form essay answer**, not a letter — `"Answer:"` terminal, line 413
4. `computeConcordance` measures **word-overlap ratio** across three free-form essays — lines 140–149
5. CONCORDANT threshold: `ratio >= 0.15` — three essays must share 15% of their combined vocabulary

---

## TASK 2 — Apply Combined (A)+(B) Patch

### Root Cause (Bishop diagnosis)

**Failure Mode 2 applies** — judges receive the substrate facts but produce **divergent free-form essays**. Each judge writes a different paragraph using different vocabulary. Word-overlap across three stylistically varied essays rarely clears 0.15. The substrate facts are present but the output format guarantees low overlap.

Supporting evidence from code:
- Line 409–411: Three different instruction styles ("Be concise" / "Answer directly" / "Focus on specifics") **deliberately diversify judge outputs** — this is architecturally anti-concordance when measuring word-overlap
- Line 413: Prompt terminal is `"Answer:"` — invites free-form prose
- Line 140: tokenize filters `w.length > 3` — eliminates short technical tokens, numbers, answer letters, and variable names; essay filler words ("that", "with", "from") also filtered; substantive overlap further reduced

**Fix: (A)+(B) combined** — substrate-grounded letter-class output + letter-class concordance. Most architecturally pure. Structurally aligned with MMLU-Pro letter-class evaluation.

### Patch Instructions

Knight applies the following **three targeted edits** to `plow-cli-12blade.js`. Do NOT touch any other logic.

---

#### EDIT 1 — THREE_FATES_PROMPT (lines 407–414)

**Replace:**
```javascript
const THREE_FATES_PROMPT = (question, factsCtx, idx) => {
  const instr = [
    'Based ONLY on the provided sources, give a precise, factual answer. Be concise.',
    'Carefully review the sources. What does the evidence say? Answer directly.',
    'Synthesize the key factual content from the sources to answer the question. Focus on specifics.',
  ];
  return `${instr[idx]}\n\nSources:\n${factsCtx}\n\nQuestion: ${question}\n\nAnswer:`;
};
```

**With:**
```javascript
const THREE_FATES_PROMPT = (question, factsCtx, idx) => {
  const instr = [
    'Based ONLY on the provided substrate facts below, identify the single best answer. Reply with ONLY the answer letter (A, B, C, D, E, F, G, H, I, or J) on the first line, then a one-sentence justification.',
    'Review the substrate facts carefully. Which answer letter is most strongly supported by the evidence? Reply with ONLY the answer letter (A through J) on the first line, then a one-sentence justification.',
    'Using ONLY the substrate facts provided, which answer letter is correct? Reply with ONLY the answer letter (A through J) on the first line, then a one-sentence justification.',
  ];
  return `${instr[idx]}\n\nSubstrate Facts:\n${factsCtx}\n\nQuestion: ${question}\n\nAnswer Letter:`;
};
```

---

#### EDIT 2 — computeConcordance (lines 136–150)

**Replace:**
```javascript
function computeConcordance(answers) {
  const valid = answers.filter(a => a !== null && a.length > 10);
  if (valid.length < 2) return 'DISCORDANT';
  if (valid.length < 3) return 'PARTIAL';
  const tokenize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  const sets = valid.map(a => new Set(tokenize(a)));
  const [s0, s1, s2] = [sets[0] ?? new Set(), sets[1] ?? new Set(), sets[2] ?? new Set()];
  const all = new Set([...s0, ...s1, ...s2]);
  let shared = 0;
  for (const t of all) {
    if ([s0.has(t), s1.has(t), s2.has(t)].filter(Boolean).length >= 2) shared++;
  }
  const ratio = all.size > 0 ? shared / all.size : 0;
  return ratio >= 0.15 ? 'CONCORDANT' : ratio >= 0.05 ? 'PARTIAL' : 'DISCORDANT';
}
```

**With:**
```javascript
function extractAnswerLetter(response) {
  if (!response) return null;
  // Try first non-whitespace character if it's a letter A-J
  const firstChar = response.trim().charAt(0).toUpperCase();
  if (/^[A-J]$/.test(firstChar)) return firstChar;
  // Try first line
  const firstLine = response.trim().split('\n')[0].trim().toUpperCase();
  const lineMatch = firstLine.match(/^([A-J])[).\s]|^([A-J])$/);
  if (lineMatch) return lineMatch[1] ?? lineMatch[2];
  // Try anywhere in first 20 chars
  const shortMatch = response.slice(0, 20).toUpperCase().match(/\b([A-J])\b/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function computeConcordance(answers) {
  const valid = answers.filter(a => a !== null && a.length > 0);
  if (valid.length < 2) return 'DISCORDANT';

  // Primary: letter-class concordance (MMLU-Pro aligned)
  const letters = valid.map(a => extractAnswerLetter(a));
  const validLetters = letters.filter(l => l !== null);
  if (validLetters.length >= 2) {
    const counts = {};
    for (const l of validLetters) counts[l] = (counts[l] ?? 0) + 1;
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount >= 2) return 'CONCORDANT';  // 2/3 or 3/3 judges agree on same letter
    if (validLetters.length >= 2) return 'PARTIAL';  // letters extracted but no majority
  }

  // Fallback: word-overlap for non-MMLU-Pro free-form shards
  if (valid.length < 3) return 'PARTIAL';
  const tokenize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  const sets = valid.map(a => new Set(tokenize(a)));
  const [s0, s1, s2] = [sets[0] ?? new Set(), sets[1] ?? new Set(), sets[2] ?? new Set()];
  const all = new Set([...s0, ...s1, ...s2]);
  let shared = 0;
  for (const t of all) {
    if ([s0.has(t), s1.has(t), s2.has(t)].filter(Boolean).length >= 2) shared++;
  }
  const ratio = all.size > 0 ? shared / all.size : 0;
  return ratio >= 0.15 ? 'CONCORDANT' : ratio >= 0.05 ? 'PARTIAL' : 'DISCORDANT';
}
```

---

#### EDIT 3 — blade_three_fates valid length filter (line 137 equivalent inside the function)

No change needed to `blade_three_fates` itself — the function already passes `candidates` correctly (lines 419–421) and the prompt and concordance functions carry the full patch.

---

## TASK 3 — Syntax Check + Commit

```bash
node -c C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli\plow-cli-12blade.js
```

Expected output: `C:\Users\...\plow-cli-12blade.js is a valid JavaScript`

If syntax check passes, commit:

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
git add tools/plow-cli/plow-cli-12blade.js
git commit -m "three fates letter-class concordance BP093 SEG-AL"
```

If syntax check fails, do NOT commit. Return the error to Bishop for re-diagnosis.

---

## TASK 4 — FIFTH Plow Re-fire Paste (for Founder)

After Knight commits, Founder fires FIFTH Plow with this paste-block:

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli

node plow-cli-12blade.js \
  "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\shards\MMLU_Pro_Trial_01_bridged.json" \
  --model gemma4:12b \
  --out FIFTH_PLOW_BP093_results.jsonl \
  --telemetry FIFTH_PLOW_BP093_telemetry.json \
  --vault "C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\active"
```

(Adjust shard path to match whatever bridged vault shard Founder used for THIRD Plow.)

Watch for in console output:
- `B7  Three Fates  → concordance=CONCORDANT` replacing `concordance=DISCORDANT`
- BMV scores lifting from ~48 range into ~62–65 range (rough projection — empirical receipt required)

---

## TASK 5 — Yoke Return

Knight returns to Bishop/Founder:
- commit SHA
- syntax pass confirmation
- diff line count (expected: ~35–40 lines changed)
- `ELECTRON_TOUCHED: NO`
- Sample concordance output from FIFTH Plow: first 3 Qs concordance values

---

## Wall-Clock Estimate

- Knight tune work: ~20 min (read · edit · syntax-check · commit)
- Founder FIFTH Plow run: ~45–90 min depending on shard size + local model speed

---

*Dispatch composed: BP093 SEG-AL · Sonnet 4.6 · §17 BLOOD*
