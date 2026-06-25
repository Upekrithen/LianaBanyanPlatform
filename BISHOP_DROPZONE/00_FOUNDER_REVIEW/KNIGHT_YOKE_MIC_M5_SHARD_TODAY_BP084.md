# KNIGHT YOKE · MIC M5 Shard TODAY · Son's Mesh-Test CLI Path · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — *"BIGGEST focus right now is to deliver my son 5 miles away a viable download that he can run a mesh test with me now ... cut it down to 5 hours."*
**Paired with:** YOKE-MESH-WAN-NAT-LONG-HAUL (proper long-haul build runs in parallel)

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. Zero Composer 2.5 contamination — BP081 BLOOD.

---

## Why CLI today (not UI install)

Son's M5 has three blockers stacked against the UI install path right now:
1. **Onboarding stuck-at-Stage-B** (BP083 son's-machine empirical, not auto-fixed in v0.4.3)
2. **No NAT traversal in v0.4.3** — peer must be manually added, port 7474 must be reachable, no STUN/TURN
3. **Model mismatch** — MIC defaults to gemma4:12b but Son's RAM tier needs gemma2:2b

The CLI shard path **bypasses ALL THREE** in ~2h of Knight work. Son runs a standalone Node script against his already-installed Ollama. No MnemosyneC UI required. No WAN handshake required. No port forwarding required.

The long-haul WAN/NAT build proceeds in parallel via YOKE-MESH-WAN-NAT-LONG-HAUL. CLI is the bridge from "today" to "when the proper build lands."

---

## SEG-1 — Question shard generator (Sonnet 4.6 SEG)

**File:** `LianaBanyanPlatform\tools\plow-cli\generate-shard.js`

Read `lb-reproducibility-pack/datasets/mmlu_pro_per_domain/` and produce per-machine shard files.

**5-node split (1,400 q total):**
- M0 (Founder, gemma4:12b, premium): math + chemistry + law + physics = 400 q **[hardest domains, best model]**
- M1 (LAN, gemma4:12b, premium): biology + business + economics = 300 q
- M2 (LAN, gemma4:12b, premium): engineering + computer-science = 200 q
- M3 (LAN, gemma4:12b, premium): philosophy + history = 200 q
- M5 (Son WAN, gemma2:2b, lightweight): **psychology + other = 200 q [easier domains for the smaller model]**

Total: 1,300 (10 domains × ~varies + remainder). Adjust to hit 1,400 / 5 nodes target = 280/node nominal.

Accuracy preservation rationale: gemma2:2b underperforms on math-heavy/symbolic domains. Give it psychology + other (verbal-heavy, less symbolic) where the small model has its best relative performance.

Output per shard: `{node_id, model_tier, domains[], questions: [...]}` written to `tools/plow-cli/shards/{node_id}_shard.json`.

---

## SEG-2 — Standalone CLI plow runner (Sonnet 4.6 SEG)

**File:** `LianaBanyanPlatform\tools\plow-cli\plow-cli.js`

Single-file Node.js script Son runs in his terminal. Dependencies: just `node-fetch` (or fetch native in Node 18+). No Electron, no MnemosyneC UI, no IPC.

**Invocation:** `node plow-cli.js m5_shard.json [--model gemma2:2b] [--ollama http://localhost:11434] [--out son_results.jsonl]`

**Behavior:**
- Connect to local Ollama via http://localhost:11434
- Reuses the canonical_pipeline question-handling logic from `LianaBanyanPlatform\src\main\plow\canonical_pipeline.ts` — port to plain JS in the CLI
- For each question: prompt Ollama → parse answer → write eblet to `son_results.jsonl` (one JSON-line per question)
- Andon-Cord behavior preserved: if model returns low-confidence/ambiguous response, mark `quarantined: true` in the result line (do NOT count toward score)
- Print progress every 10 questions: `[42/280] biology · 96% · 4 quarantined · ETA 47m`
- Checkpoint every 10 questions so if Son's machine dies, he resumes via `--resume`
- On completion: print final summary `[280/280] · 269 correct · 11 quarantined · score 96.1%`

**Truth-Always:** report quarantined count separately from correct. NEVER round up. Match the 68/70 disk-backed receipt discipline.

**Pack into a zip** with a README: `MnemosyneC-Plow-CLI-Son-M5.zip` containing:
- `plow-cli.js`
- `m5_shard.json`
- `README.txt` (5 lines — `node plow-cli.js m5_shard.json`)

Place zip at: `Cephas\cephas-hugo\static\download\MnemosyneC-Plow-CLI-Son-M5.zip` (Founder emails Son the link).

---

## SEG-3 — Results aggregator on M0 (Sonnet 4.6 SEG)

**File:** `LianaBanyanPlatform\tools\plow-cli\aggregate.js`

Takes N `*_results.jsonl` files (one per node), merges into:
- `aggregate_results.jsonl` (single line-delimited corpus)
- `aggregate_summary.json` — per-domain accuracy, per-node accuracy, total-correct, total-quarantined, overall-score
- Optionally appends valid eblets into MnemosyneC's `%APPDATA%/mnemosynec/substrate/verified_eblets.jsonl`

**Invocation:** `node aggregate.js m0_results.jsonl m1_results.jsonl m2_results.jsonl m3_results.jsonl m5_results.jsonl --out aggregate_summary.json`

**Receipt header:** include each node's `{node_id, model, total_q, correct, quarantined, accuracy, runtime_seconds}` in the summary.

This becomes the publishable receipt for the 5-node constellation 1,400-q campaign once all nodes report.

---

## SEG-4 — Son onboarding workaround card (Sonnet 4.6 SEG)

**File:** `Asteroid-ProofVault\SON_M5_BOOTSTRAP_CARD_BP084.md`

One-page card Founder texts/emails to Son. Steps:

1. **Install Ollama** (if not already): https://ollama.com/download — pull `gemma2:2b` model: `ollama pull gemma2:2b`
2. **Download CLI bundle**: https://mnemosynec.ai/download/MnemosyneC-Plow-CLI-Son-M5.zip
3. **Unzip** to any folder
4. **Run**: open terminal in that folder → `node plow-cli.js m5_shard.json`
5. **When done**: email `son_results.jsonl` back to Dad

ETA on Son's hardware (gemma2:2b, 200 questions): ~30-50 minutes. He can do other things while it runs.

**If Son also wants to install the UI** (optional, separate path): include the BP083 onboarding workaround — rename `%APPDATA%\mnemosynec\` (lowercase) → close + reopen MnemosyneC → complete onboarding → tabs appear.

---

## SEG-5 — Test on M0 first (Sonnet 4.6 SEG)

Before sending to Son, run the CLI locally with a 20-question test shard on M0's Ollama. Confirm:
- Script runs end-to-end without crash
- Output JSONL parses correctly
- Aggregator merges correctly
- Checkpoint/resume works (Ctrl+C mid-run, then `--resume`)

If all GREEN, ship the zip + send Founder the bootstrap card.

---

## Truth-Always Sharps

- Sharp 1: `node plow-cli.js` runs on Ollama localhost:11434 without crash (M0 dry-run)
- Sharp 2: `aggregate.js` produces summary that matches manual count
- Sharp 3: Zip file exists at canonical static path + downloadable from mnemosynec.ai/download/
- Sharp 4: HEAD `curl -sI https://mnemosynec.ai/download/MnemosyneC-Plow-CLI-Son-M5.zip` → HTTP/1.1 200 OK
- Sharp 5: Bootstrap card file exists at Vault path

---

## Yoke-return spec

Report each Sharp + paste 5-line sample from M0 dry-run output + report total bytes of zip + report card path. Include verbatim "Sonnet 4.6" model line.

---

## Bishop reminder

When Son's results return → Bishop assembles the 5-node receipt → publishes only if **clean** per BP083 Truth-Always canon. 800/1400-style partial does NOT publish.

**FOR THE KEEP.**
