---
title: "Mesh-Wide Rollout Plan — 12-Blade Epistemic Plow"
status: "plan-pending-m0-green"
session: "BP084"
plow_version: "12blade-bp084"
question_bank_sha: "e79142cf"
date: "2026-06-16"
---

# Mesh-Wide Rollout Plan — 12-Blade Epistemic Plow
## BP084 · Sonnet 4.6 · Liana Banyan Platform

**Status:** PLAN ONLY — awaiting M0 3-question validation green light  
**Question Bank:** Substrate Awakens fresh bank (SHA e79142cf)  
**NOT the 1,400-q distributed-eval bank from yesterday**

---

## Pre-Conditions Checklist

Before ANY peer receives the 12-blade binary:

- [ ] **GATE-1:** M0 3-question validation passes — all 12 blades fire GREEN (SEG-3 result)
- [ ] **GATE-2:** SEG-3 UI deploys with live blade-fire telemetry dashboard
- [ ] **GATE-3:** F1–F6 infrastructure: Ollama running + network-accessible on each peer
- [ ] **GATE-4:** plow-cli-12blade.js syntax-checked on each peer's Node.js version
- [ ] **GATE-5:** Vault path writable on each peer (`Asteroid-ProofVault/state/eblets/active/`)
- [ ] **GATE-6:** Aggregate receiver running (M0 or central) before distributing shards

---

## Per-Peer Shard Assignments

| Peer | Hardware | RAM | Model | Domains | ~Questions | Shard File |
|------|----------|-----|-------|---------|-----------|------------|
| **M0** (Founder, M0 main) | Desktop | 64 GB | gemma4:12b | math, chem, law, physics | ~500 | `shards/m0_12blade_shard.json` |
| **M1** | LAN box | 16 GB | gemma4:12b (tight) | engineering, cs | ~250 | `shards/m1_12blade_shard.json` |
| **M2** | LAN box | 32 GB | gemma4:12b | biology, business, economics | ~350 | `shards/m2_12blade_shard.json` |
| **M3** | LAN box | 32 GB | gemma4:12b | philosophy, history | ~250 | `shards/m3_12blade_shard.json` |
| **M5** | Son WAN | 8 GB (est.) | gemma2:2b (lightweight) | psychology, other | ~250 | `shards/m5_12blade_shard.json` |
| **Reserve** | M0 overflow | 64 GB | gemma4:12b | Code Breakers redundant | ~150 | `shards/reserve_12blade_shard.json` |

**Total: ~1,750 questions** (with ~250 reserve overlap for Code Breaker redundancy)

> Note: M5 uses gemma2:2b — results are AMBER (model substitution). Still valid for blade-fire
> verification; accuracy delta vs gemma4:12b will be flagged in aggregate.

---

## Per-Peer Invocation

```powershell
# M0 (PowerShell — 64 GB, gemma4:12b)
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"
node plow-cli-12blade.js shards/m0_12blade_shard.json `
  --model gemma4:12b `
  --out m0_12blade_results.jsonl `
  --telemetry m0_12blade_telemetry.json `
  --max-consequence-depth 3

# M1 / M2 / M3 (Linux/Mac bash or PowerShell)
node plow-cli-12blade.js shards/mX_12blade_shard.json \
  --model gemma4:12b \
  --out mX_12blade_results.jsonl \
  --telemetry mX_12blade_telemetry.json \
  --max-consequence-depth 2

# M5 (lightweight — gemma2:2b)
node plow-cli-12blade.js shards/m5_12blade_shard.json \
  --model gemma2:2b \
  --out m5_12blade_results.jsonl \
  --telemetry m5_12blade_telemetry.json \
  --max-consequence-depth 1
```

---

## Estimated Runtime Per Peer

| Peer | Model | Q Count | Avg Per-Q (est.) | Blade 10 Overhead | Total Est. |
|------|-------|---------|-----------------|-------------------|-----------|
| M0   | gemma4:12b | 500 | ~45s (KNOWN/ELIM) + ~3m (THEORY_OPEN) | +~30m for ~75 theory-open Qs | ~6–8h |
| M1   | gemma4:12b | 250 | ~45s | minimal (eng/cs rarely theory-open) | ~3–4h |
| M2   | gemma4:12b | 350 | ~45s + some B10 | ~15m overhead | ~4–5h |
| M3   | gemma4:12b | 250 | ~45s + heavy B10 (philosophy) | +~45m | ~3–5h |
| M5   | gemma2:2b  | 250 | ~20s | depth=1 only | ~1.5–2h |

**Constellation total wall time:** ~8h (all peers in parallel)  
**Single-peer sequential:** ~22–24h (not recommended)

---

## Shard Generation

Generate fresh shards from the Substrate Awakens bank (SHA e79142cf):

```powershell
# M0 shard generation (node generate-shard.js for each peer)
node generate-shard.js \
  --bank substrate_awakens_bank_e79142cf.json \
  --peer m0 --domains "math,chemistry,law,physics" --count 500 \
  --out shards/m0_12blade_shard.json

node generate-shard.js \
  --bank substrate_awakens_bank_e79142cf.json \
  --peer m1 --domains "engineering,cs" --count 250 \
  --out shards/m1_12blade_shard.json

# ... repeat for m2 (biology,business,economics,350q), m3 (philosophy,history,250q),
#     m5 (psychology,other,250q), reserve (code_breakers,150q)
```

---

## Aggregation Step

After all peers return results:

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"

node aggregate.js \
  m0_12blade_results.jsonl \
  m1_12blade_results.jsonl \
  m2_12blade_results.jsonl \
  m3_12blade_results.jsonl \
  m5_12blade_results.jsonl \
  --out constellation_12blade_aggregate.json
```

**aggregate.js extensions needed** (add before constellation run):
- Parse `eblet_snapshot` fields: count TIC-distinguished `known_count`, `theories_open_count`, `eliminated_count`
- Sum `consequence_count`, `elimination_count`, `downstream_flags` across peers
- Per-peer blade-fire audit: flag any blade with 0 fires (silent skip = RED)
- Model-tier column: separate gemma4:12b rows from gemma2:2b (M5)

---

## Dashboard

Live view at MnemosyneC console during constellation run:

| Column | Source |
|--------|--------|
| Peer | `node_id` in each result |
| Blade fires (1-12) | `blades_fired[]` per result |
| KNOWN / THEORY_OPEN / ELIMINATED counts | `eblet_snapshot.*_count` |
| Consequence probes | `consequence_count` |
| Eliminations confirmed | `elimination_count` |
| Downstream flags | `downstream_flags` |
| Quarantine rate | `quarantined` / `total` |

---

## Post-Constellation Steps

1. **Aggregate** all peer JSONL files → `constellation_12blade_aggregate.json`
2. **Vault merge** — copy all peer vault eblets to M0 canonical vault
3. **Review queue** — process `review_queue.json` for downstream re-evaluation candidates
4. **Code Breakers queue** — process `code_breaker_queue` entries in elimination results
5. **Receipt** — fill in `PUBLISHABLE_RECEIPT_TEMPLATE_12_BLADE_PLOW_CONSTELLATION_BP084.md`
6. **Canon eblet** — mint `canon_12_blade_plow_constellation_bp084.eblet.md` after Founder review
7. **68/70 comparison** — compute honest delta (different Q bank, different blade depth; not a head-to-head)

---

## Notes on 68/70 Canonical Receipt

The 12-blade constellation uses the **Substrate Awakens fresh bank (SHA e79142cf)**.  
This is a **different question bank** from the 1,400-q distributed-eval bank that produced 68/70.  
**Do NOT compare percentages directly** — the comparison must note:  
- Different Q bank scope  
- Different blade depth (12 vs original 1-blade pass)  
- TIC-distinguished output (new; no equivalent in prior run)  
- Constituency differences (THEORY_OPEN and ELIMINATED classes new)

The 68/70 canonical receipt is **NOT modified** by this run.  
It stands as the canonical accuracy benchmark for its question bank and model configuration.

---

*Plan authored BP084 · Sonnet 4.6 · Knight (Cursor AI)*
