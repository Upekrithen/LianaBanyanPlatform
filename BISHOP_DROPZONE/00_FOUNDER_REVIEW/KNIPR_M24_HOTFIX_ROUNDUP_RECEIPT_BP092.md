# KniPr — M24 HOTFIX · Posse Round-Up Protocol
## BP092 · 2026-06-23 · Knight Sonnet 4.6 · Caithedral™
## Branch: `knight-hotfix-m24-posse-roundup` (off main `acf914d`)
## Commit: `7bdd15f`

---

## STATUS: SEALED ✅

All 4 Blocks complete. Dry-run PASS. Commit on correct branch. §14 §15 §17 BLOOD satisfied.
Awaiting: Founder to fire full sweep once M13c final receipt confirmed.

---

## §1 Scope Reminder

**This hotfix is NARROW by design:**
- 4 Blocks only — no Electron rebuild, no version bump, no Firebase deploy
- 3 new files + 1 new health registry — zero edits to existing production code
- Purpose: fire Round-Up sweep on M13c miss-list within minutes of M13c completion
- Full M24 Marathon (`knight-m24-posse-tier2-abstain`) runs in parallel and handles production fleet integration

---

## §2 Branch Verification

| Item | Value |
|------|-------|
| Branch | `knight-hotfix-m24-posse-roundup` |
| Parent | `main` (`acf914d` — Wire plow=mesh-12-blade BP090) |
| Commit | `7bdd15f` |
| Pre-commit hooks | ALL PASS (gitleaks, size, merge-conflicts, private-key, YAML, JSON, whitespace, newline) |

---

## §3 M13c Receipt Used

| Field | Value |
|-------|-------|
| Receipt file | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json` |
| Session | `relay-2026-06-22T04-23-42` |
| Questions | 42 |
| Original score | **26/42 = 61.9%** |
| Original contested | 1 |

**Note on OQ-H3:** This is the most complete 42Q receipt available as of session start. If Founder fired a newer M13c run via `FIRE_M13c.cmd` after 2026-06-22T12:45 UTC, update `--receipt=` to point to that newer receipt before firing full sweep.

---

## §4 Miss-List (24 questions)

| Source ID | Domain | Correct | Original | Reason |
|-----------|--------|---------|----------|--------|
| 70 | business | I | null | contested+no_answer+peer_abstain |
| 6826 | economics | G | G | peer_abstain |
| 4669 | history | D | null | contested+no_answer+peer_abstain |
| 866 | law | D | D | peer_abstain |
| 7687 | math | H | C | peer_abstain |
| 10774 | philosophy | A | A | peer_abstain |
| 9044 | physics | I | G | peer_abstain |
| 1986 | psychology | E | A | peer_abstain |
| 71 | business | F | C | peer_abstain |
| 6827 | economics | A | I | peer_abstain |
| 6002 | health | C | A | peer_abstain |
| 867 | law | B | C | peer_abstain |
| 7688 | math | H | H | peer_abstain |
| 5060 | other | C | C | peer_abstain+peer_timeout |
| 10775 | philosophy | D | F | peer_abstain |
| 9045 | physics | D | H | peer_abstain |
| 1987 | psychology | I | E | peer_abstain |
| 72 | business | J | J | peer_abstain |
| 3528 | chemistry | B | B | peer_abstain |
| 10358 | computer_science | A | A | peer_abstain |
| 868 | law | F | A | peer_abstain |
| 5061 | other | B | null | contested+no_answer+peer_abstain |
| 10776 | philosophy | I | B | peer_abstain |
| 1988 | psychology | E | G | peer_abstain |

**Observations:**
- 24/42 questions triggered Round-Up (57%)
- Root cause: `c532e740` (CORE, gemma2:9b) consistently ABSTAINs → all 24 are `peer_abstain`
- 3 questions also have `no_answer` (ensemble couldn't decide) — highest priority for Round-Up
- Ensemble already got some right despite abstain (e.g., 6826 econ correct=G original=G) — Round-Up will confirm
- 1 timeout (`5060` other domain)

---

## §5 Files Authored

### Block 1 — `src/main/army_ants/posse_decompose.ts`
- Routes decomposition to ULTRA peer (llama3.3:70b via Supabase relay)
- Polls `relay_route_replies` table, parses JSON sub-claim array
- Falls back to single sub-claim if decomposition fails
- Writes each sub-claim to `posse_sub_claims` table (§15 BLOOD: table pre-applied by Bishop)
- Exports `healthCheck()` → registered in `health_registry.ts`

### Block 2 — `src/main/army_ants/posse_swarm.ts`
- Fans each sub-claim to tier-appropriate peer (HARD→ULTRA/FULL, MEDIUM/SHORT→any)
- Fires relay routes in parallel, aggregates weighted confidence votes
- Recurses on contested sub-claims up to depth 2 (timeout budget * 0.7 each level)
- Writes each run row to `posse_swarm_runs` table (§15 BLOOD)
- Extracts letter answer from raw peer reply (regex `^\\s*([A-J])\\b`)
- Exports `healthCheck()` → registered in `health_registry.ts`

### Block 3 — `tools/mesh-validation/round_up_sweep.mjs`
- Pure ESM, no compile step needed
- Reads receipt JSON, builds miss-list per Round-Up canon (contested / peer_abstain / peer_timeout / no_answer)
- `--dry-run` flag prints miss-list without firing relay
- `--max-misses=N` cap for smoke testing (smoke: N=3)
- Fires Posse sequential (not parallel) to avoid relay table saturation
- Tier 2 escalation: gated behind `--tier2-budget > 0` AND `ANTHROPIC_API_KEY` present
- Default: `--tier2-budget=0` → pure Posse cooperative mesh (no API cost)
- Writes `ROUND_UP_RECEIPT_<session>_<timestamp>.json` alongside original receipt
- Receipt fields: `original_score`, `miss_count`, `newly_resolved`, `still_missed`, `estimated_new_score`, `round_up_results[]`

### Registry — `src/main/health_registry.ts`
- §17 BLOOD: registers `posseDecomposeHealth` + `posseSwarmHealth`
- Hotfix-only (Tier 2 flagship not registered until full M24 lands)
- `runAllHealthChecks()` → `isHealthy()` exports

---

## §6 Compile Check

```
npx tsc --noEmit --skipLibCheck | Select-String "army_ants|posse_|health_registry"
→ (empty — zero errors on new hotfix files)
```

Pre-existing project errors (rootDir mismatches, missing caithedral-core declarations) are unrelated to this hotfix.

---

## §7 Dry-Run Result

```
POSSE ROUND-UP SWEEP · BP092 HOTFIX · Caithedral™
Session: roundup-2026-06-23T16-42-02
Receipt loaded: session=relay-2026-06-22T04-23-42 · questions=42
Original score: 26/42 = 61.9%

Miss-list: 24 questions
[24 miss lines printed — see §4 table above]

[DRY-RUN] Would fire Posse on 24 questions. Exiting without firing.
Exit code: 0
```

**Status: DRY-RUN PASS** ✅

---

## §8 How to Fire Full Round-Up Sweep

### Prerequisites
1. Confirm fleet is running (5 peers active in `peer_presence`)
2. Use most recent M13c final receipt (update path if newer run completed)
3. Fleet must have been idle (0 `mesh_task_queue` pending rows) before firing

### Smoke test (3 misses, no API cost)
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node round_up_sweep.mjs `
  --receipt="C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json" `
  --tier-config="ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" `
  --timeout=120 `
  --max-misses=3 `
  --session="ROUNDUP_SMOKE_3Q"
```

**Smoke pass gate:** at least 1 of the 3 resolves correctly.

### Full Round-Up sweep (24 misses, pure Posse, no API cost)
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node round_up_sweep.mjs `
  --receipt="C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json" `
  --tier-config="ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" `
  --timeout=180 `
  --tier2-budget=0 `
  --session="ROUNDUP_M13c_FULL"
```

**Optional: add question bank for full text (better decomposition):**
```powershell
--question-bank="C:\Users\Administrator\Documents\LianaBanyanPlatform\lb-reproducibility-pack\datasets\mmlu_pro_merged_bank.json"
```

### With Tier 2 budget (if Founder approves API spend — OQ-H1)
```powershell
--tier2-budget=5000   # ~$5 USD equivalent for still-contested escalations
```

---

## §9 Estimated Score Impact

The Round-Up targets 24 questions. Potential improvements:
- **3 no_answer questions** (source_ids 70, 4669, 5061): currently 0% — any correct answer = gain
- **Questions where original was WRONG** (7687 math C→H, 71 biz C→F, 6827 econ I→A, 6002 health A→C, 867 law C→B, 10775 phil F→D, 9045 physics H→D, 1987 psych E→I, 868 law A→F, 10776 phil B→I, 1988 psych G→E, 9044 physics G→I, 1986 psych A→E): 13 incorrectly-answered → Round-Up resolution needed
- **Questions where original was RIGHT but abstain flagged** (6826, 866, 10774, 7688, 5060, 10358, 72, 3528): 8 already correct — Round-Up confirms/reinforces

Conservative estimate: if Posse resolves 8/24 wrong→right, new score = 34/42 = **81%** (from 61.9%).
Best-case: 16/24 misses resolved → 42/42 = **100%** (ULTRA model should handle most).

---

## §10 Open Questions for Founder Ratify

**OQ-H1 · Tier 2 budget:** Default `--tier2-budget=0` (pure Posse, no API cost per user instruction "Skip Tier 2 flagship integration"). Override with `--tier2-budget=5000` if still-contested questions remain after Posse.

**OQ-H2 · Question bank:** `round_up_sweep.mjs` uses `question_preview` (truncated) from receipt. For best decomposition, point `--question-bank` to merged MMLU-Pro bank. Knight can assemble from `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/<domain>/questions.json` if needed.

**OQ-H3 · Receipt currency:** Receipt used is from 2026-06-22T12:45 UTC. If Founder's `FIRE_M13c.cmd` produced a newer 42Q receipt (likely — process was running at 03:50 UTC 2026-06-23), use that instead. Command: update `--receipt=` path.

---

## §11 Wall-Clock

| Phase | Time |
|-------|------|
| Task read + brief_me | ~3 min |
| Gadget (receipt scan) | ~2 min |
| Branch creation | ~5 min (branch recreation needed) |
| Block 1 (posse_decompose.ts) | ~3 min |
| Block 2 (posse_swarm.ts) | ~3 min |
| Block 3 (round_up_sweep.mjs) | ~4 min |
| Compile check + dry-run | ~5 min |
| Commit + MIC log + KniPr | ~8 min |
| **Total** | **~33 min** |

---

## §12 Merge Note

**This hotfix does NOT auto-merge to main.** Bishop reviews this KniPr. If Round-Up sweep shows score improvement, Founder ratifies merge. Full M24 Marathon on `knight-m24-posse-tier2-abstain` handles full production integration including Electron rebuild + Firebase deploy.

---

*Sealed by Knight Sonnet 4.6 · BP092 · 2026-06-23T16:45 UTC*
*Caithedral™ · The Substrate Cure to AI Amnesia*
*"I want to Round Up all the ones we missed. ALL of them." — Founder BP092*
*"If ANYONE can figure out the answer, SO CAN WE." — Substrate Capability Floor Canon*

**FOR THE KEEP!**
