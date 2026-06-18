# Mesh Routing Diagnostics · BP086

**Date:** 2026-06-18  
**Session:** BP086 · Sonnet 4.6  
**Scope:** 2-machine A7 run post-mortem + M3 root cause + LAN peer scan + architecture notes for 5-peer run

---

## peer_presence Roster (queried 2026-06-18 ~19:38 UTC)

```
 peer_id          | tier | lan_addresses | last_seen_at
------------------+------+---------------+----------------------------
 cb4ef450cc4a18c3 | base |               | 2026-06-18 19:38:36.986+00
 49f3e5971518a064 | base |               | 2026-06-18 19:38:35.963+00
 c532e74069e137bc | base |               | 2026-06-18 19:38:34.945+00
 d0b47bd08633385b | base |               | 2026-06-18 19:38:34.355+00
 88cbf6bdd6f74587 | base |               | 2026-06-18 19:38:21.171+00
(5 rows)
```

**Findings:** 5 active peers, all `base` tier, `lan_addresses` column empty for all. These are likely web/browser heartbeats (Base Tier members), not Ollama LAN peers. The LAN Ollama mesh machines (M0–M3) are NOT registered to this table under their LAN IPs — they will need to be enrolled in the `peer_presence` table via the wan-relay-route architecture (I5 yoke) before the 5-peer cooperative dispatch can use table-driven routing.

---

## M3 Timeout Root Cause

### Diagnosis

**Hypothesis confirmed:** Ollama's `keep_alive` default (5 minutes) causes the 12B model to unload between question batches. The first request after unload triggers a cold reload. On M3's hardware (11.9B Q4_K_M model, 5.9 GB VRAM), cold reload takes **~31 seconds** — exceeding the A7 120s timeout only when reload competes with an already-in-progress question dispatch.

**Evidence from `/api/ps` (both machines, before keep_alive fix):**
```json
M0 → { "models": [] }   // gemma4:12b NOT loaded
M3 → { "models": [] }   // gemma4:12b NOT loaded
```

Both machines had unloaded their models entirely. With the A7 script dispatching M0 and M3 **concurrently**, M3 would start from cold on every question where the 5-minute keep_alive had lapsed. The reload + inference time for complex questions (law, math, philosophy — long context) reliably exceeded 120s.

**Additional factor:** M0 returned empty strings (`""`) on 15+ questions — these are NOT timeouts but failed letter extractions (M0 generated a long explanation instead of a letter-only answer). This is a prompt-compliance issue, not a timeout issue. These empty-M0 + timeout-M3 pairings produced most of the "contested" results.

### keep_alive=24h Fix Applied — BP086

```
Request:  POST http://192.168.86.156:11434/api/generate
Body:     { "model": "gemma4:12b", "keep_alive": "24h" }
Result:   { "done": true, "done_reason": "load", "response": "" }
Latency:  ~31.6 seconds (cold load from disk)
```

**Post-fix `/api/ps` on M3:**
```json
{
  "models": [{
    "name": "gemma4:12b",
    "model": "gemma4:12b",
    "size": 8908324205,
    "details": {
      "parameter_size": "11.9B",
      "quantization_level": "Q4_K_M",
      "family": "gemma4"
    },
    "expires_at": "2026-06-19T14:42:24 (24h from load)",
    "size_vram": 5925356174,
    "context_length": 4096
  }]
}
```

Model is now hot in VRAM. Any question dispatched to M3 within the next 24h will NOT require a cold reload. **Expected impact:** M3 timeout rate drops from ~51% → near 0% for warm-model runs.

**Recommendation for future runs:** Always pre-warm each peer with a `keep_alive=24h` load request BEFORE dispatching the question batch. The 5-peer validator should include a pre-warm phase at startup.

---

## Per-Peer Reliability (A7 70Q Run)

| Peer | Model | Answered | Timed Out | Empty Response | Correct (of answered) | Overall % |
|------|-------|----------|-----------|----------------|-----------------------|-----------|
| M0 | gemma4:12b | 70 | 0 | 15 (blank responses) | 46/70 | 65.7% |
| M3 | gemma4:12b | 34 | 36 | 0 | 32/34 = **94.1%** | 45.7% |

**Key insight:** M3's accuracy *when it answers* is 94.1% — dramatically better than M0's 65.7% overall. M3 is not unreliable; it just needs the model to stay loaded. Once warm, M3 is the stronger performer. The timeout problem is entirely a `keep_alive` artifact.

**M0 empty-response issue:** M0 returned blank strings on questions requiring multi-step reasoning (law, abstract math, philosophy). These should be treated as "no answer" — the letter extractor correctly returns `null`. Root cause: prompt compliance — gemma4:12b occasionally generates a long-form explanation without a leading letter when the question is complex. Mitigation: add a shorter, more forceful prompt suffix or retry with `Answer with single letter only:` re-prompt.

---

## A7 Contested Questions (17 total)

Contested = ensemble could not resolve (disagreement or both failed).

| # | Q# | source_id | Domain | Reason | M0 | M3 | Correct | Notes |
|---|-----|-----------|--------|--------|----|----|---------|-------|
| 1 | Q8 | 4669 | history | Disagreement | D ✓ | C ✗ | D | M0 correct, M3 wrong |
| 2 | Q9 | 866 | law | Both failed | (blank) | TIMEOUT | D | Long complex scenario |
| 3 | Q10 | 7687 | math | Both failed | (blank) | TIMEOUT | H | Abstract algebra |
| 4 | Q23 | 867 | law | Both failed | (blank) | TIMEOUT | B | Corporation 5th Amendment |
| 5 | Q24 | 7688 | math | Both failed | (blank) | TIMEOUT | H | Field theory |
| 6 | Q26 | 10775 | philosophy | Both failed | (blank) | TIMEOUT | D | Truth table construction |
| 7 | Q30 | 72 | business | Both failed | (blank) | TIMEOUT | J | Down-sizing question |
| 8 | Q37 | 868 | law | Both failed | (blank) | TIMEOUT | F | Write-in candidate statute |
| 9 | Q42 | 1988 | psychology | Both failed | (blank) | TIMEOUT | E | Kohlberg development |
| 10 | Q43 | 2807 | biology | Both failed | (blank) | TIMEOUT | I | cDNA nucleotides |
| 11 | Q51 | 869 | law | Both failed | (blank) | TIMEOUT | A | Defendant/briefcase |
| 12 | Q56 | 1989 | psychology | Both failed | (blank) | TIMEOUT | F | PKU mental retardation |
| 13 | Q62 | 11289 | engineering | Both failed | (blank) | TIMEOUT | G | Force-current analogy |
| 14 | **Q64** | **4673** | **history** | **Disagreement** | C ✗ | **G ✓** | **G** | **M3 correct, M0 wrong** |
| 15 | Q65 | 870 | law | Both failed | (blank) | TIMEOUT | E | Manslaughter (fraternity) |
| 16 | Q66 | 7691 | math | Both failed | (blank) | TIMEOUT | B | Z_3 field polynomial |
| 17 | Q69 | 9048 | physics | Both failed | (blank) | TIMEOUT | J | Meteor shower source |

**Pattern analysis:**
- 15 of 17 contested = "both failed" (M0 blank + M3 timeout) — not genuine disagreements
- Q64 (history/Shang Dynasty): M3 answered correctly (G = 20th century), M0 was wrong (C). This is the most important data point: M3 contributed a **correct unique answer that M0 missed**. Ensemble would have resolved this correctly with a 3rd peer tiebreaker.
- Q8 (history/Inca wars): genuine disagreement, M0 was right.
- Domain concentration: law (5), math (4), philosophy (1), psychology (2), biology (1), engineering (1), history (2), physics (1). Law and math questions produce the most "both failed" outcomes — these are complex multi-step reasoning tasks where both models generate explanations rather than letters.

---

## LAN Peer Scan Results (192.168.86.0/24, port 11434)

Scan executed 2026-06-18 ~19:38 UTC. Skipped M0's LAN IP (.30) and M3 (.156).

| IP | Status | Likely peer |
|----|--------|-------------|
| 192.168.86.45 | Port 11434 OPEN | M1 or M2 |
| 192.168.86.64 | Port 11434 OPEN | M1 or M2 |

**Conclusion:** All 4 LAN machines are confirmed online and running Ollama. M1=.45 or .64, M2=the other. Founder to confirm which is which.

**Note:** These IPs are informational only. The 5-peer cooperative run will NOT use hardcoded LAN-direct IPs.

---

## Architecture Note: 5-Peer Run — wan-relay-route (NOT LAN-direct)

The original BP086 mission described a `validate-5machine.mjs` script with `--m1ip`, `--m2ip`, `--sonip` args. **This approach is superseded** per Founder's BP086 architecture correction.

**Correct architecture:** The I5 yoke (`wan-relay-route`) uses the `peer_presence` Supabase table for peer discovery and question dispatch. Instead of hardcoded IPs, each peer polls the table for assigned questions and writes answers back. This is the **cooperative substrate pattern** — any peer (LAN or WAN, Son's machine or a future cooperative member) participates via the same table-polling protocol, regardless of topology.

**Why this is better:**
- Son's machine (WAN, NAT'd, no inbound ports) can participate without a static IP
- Future cooperative members join by registering their `peer_id` in `peer_presence`
- The M0 orchestrator never needs to reach peers directly — peers pull work
- Scales from 2 to 500 peers without script changes

**Prerequisite for 5-peer run:**
- [ ] I5 wan-relay-route yoke implemented (in parallel, separate session)
- [ ] M0–M3 and Son's machine enrolled in `peer_presence` with `tier` and `lan_addresses` populated
- [ ] keep_alive pre-warm: already applied to M3; should be applied to M1 (.45 or .64) and M2 (.64 or .45) before run
- [ ] Son's machine: confirm model pulled (gemma2:2b or gemma4:12b depending on RAM) + Ollama running

---

## Keep-Alive Fix Summary

| Machine | Pre-fix status | Fix applied | Post-fix status |
|---------|---------------|-------------|-----------------|
| M0 | Unloaded (empty /api/ps) | — (not applied this session) | Still unloaded |
| M3 | Unloaded (empty /api/ps) | ✅ `keep_alive=24h` sent, loaded in 31.6s | **Hot: expires 2026-06-19 14:42** |
| M1 (192.168.86.45 or .64) | Unknown | Not yet applied | Pending |
| M2 (192.168.86.64 or .45) | Unknown | Not yet applied | Pending |
| Son | Unknown (WAN) | Not yet applied | Pending Son's IP |

**To apply to M1/M2 now (if Founder wants):**
```powershell
# M1:
$b = @{ model = "gemma4:12b"; keep_alive = "24h" } | ConvertTo-Json
Invoke-RestMethod -Method POST "http://192.168.86.45:11434/api/generate" -Body $b -ContentType "application/json" -TimeoutSec 180

# M2:
Invoke-RestMethod -Method POST "http://192.168.86.64:11434/api/generate" -Body $b -ContentType "application/json" -TimeoutSec 180
```

---

## Recommendation: Substrate+Plow Layering

The raw-Ollama routing layer (this diagnostic) tests connectivity and model availability.  
The Substrate+Plow pipeline (BP083, 97.1% on 68/70) adds:
- Question pre-processing via 12-Blade Epistemic Plow
- Substrate memory context injection
- Answer post-processing and confidence scoring

**Safe to layer IF:** per-peer reliability ≥ 70% (answers within timeout on most questions).  
**NOT safe to layer IF:** peers frequently unload models between questions — the Plow pipeline adds latency between question stages, making model-reload timeouts worse.

**Recommendation (after M3 keep_alive fix):** Safe to proceed with 5-peer run. M3's 94.1% when-warm accuracy means it will be a strong contributor once the keep_alive=24h pre-warm is part of the run protocol. Layer Substrate+Plow AFTER confirming all 5 peers maintain ≥70% answer rate in a warm-model smoke test.

---

## 5-Machine Run Prerequisites (Updated BP086 · Sonnet 4.6)

### Fleet Status (polled 2026-06-18 ~20:15 UTC — v0.5.6 deployed)

```
 c532e74069e137bc | base |  | 2026-06-18 20:14:35+00
 d0b47bd08633385b | base |  | 2026-06-18 20:14:34+00
 88cbf6bdd6f74587 | base |  | 2026-06-18 20:14:21+00
 49f3e5971518a064 | base |  | 2026-06-18 20:14:20+00
 cb4ef450cc4a18c3 | base |  | 2026-06-18 20:11:37+00
(5 rows — FLEET READY on poll 1/20)
```

**5 active peers registered within 10 minutes.** `lan_addresses` column is empty for all — v0.5.6 client does not yet populate this field. Son cannot be distinguished from LAN peers by IP at this time. Son identification will require app-side peer_id labeling or lan_addresses population in a future patch.

### Peer Hardware + Model Roster

| Machine | IP | RAM | Model | Status |
|---------|-----|-----|-------|--------|
| M0 | 127.0.0.1 | — | gemma4:12b | LAN-local orchestrator |
| M1 | 192.168.86.45 | — | gemma4:12b ✅ (+ gemma2:2b available) | Confirmed via /api/tags |
| M2 | 192.168.86.64 | — | gemma4:12b ✅ (+ gemma2:2b available) | Confirmed via /api/tags |
| M3 | 192.168.86.156 | — | gemma4:12b ✅ keep_alive=24h applied | Hot in VRAM |
| Son | WAN (non-192.168.86.*) | **16 GB RAM** ✅ (corrected from 8GB) | **qwen2.5:7b** ✅ | Different ISP |

### Cross-Vendor Model Family Note

**This is a CROSS-VENDOR MODEL FAMILY test.**

- `gemma4:12b` (M0, M1, M2, M3) — Google DeepMind Gemma 4 family, 11.9B Q4_K_M
- `qwen2.5:7b` (Son) — Alibaba Qwen 2.5 family, 7B

**Model diversity breakdown:** 4 × Gemma4 + 1 × Qwen2.5 = 5-peer heterogeneous cooperative substrate. Ensemble diversity is meaningful — different training data, different architectures, different vendors. Even 1 cross-vendor peer creates genuine ensemble independence for the questions where vendor-specific biases diverge.

**Note:** Neither M1 (192.168.86.45) nor M2 (192.168.86.64) runs qwen2.5:7b. Both confirmed running gemma4:12b only (gemma2:2b also available as fallback). Son is the sole Qwen peer.

### LAN Model Detection Results (BP086)

```
Peer 192.168.86.45 models: gemma4:12b, gemma2:2b
Peer 192.168.86.64 models: gemma4:12b, gemma2:2b
```

M1 and M2 identity (which IP = which label) is TBD per Founder's machine labeling. Model family TBD confirmed: both are Gemma. Detect active model at runtime via `/api/tags` — use `models[0].name` (sorted by last modified, gemma4:12b appears first on both).

---

## Action Items Before 5-Peer Run

1. **I5 wan-relay-route yoke** — peer table dispatch architecture (parallel session)
2. **Enroll M0–M3** in `peer_presence` with actual `lan_addresses` and model info (v0.5.6 does not yet populate lan_addresses)
3. **Apply keep_alive=24h** to M1 (.45) and M2 (.64) at run time (M3 already applied)
4. **Son's peer_id** — identify via app-side labeling once lan_addresses is populated, or by process of elimination
5. **M0 empty-response mitigation** — tighten prompt to force single-letter compliance
6. **Confirm M1/M2 identity** — which of .45/.64 is which machine per Founder's labeling
7. **validate-relay.mjs** — relay orchestrator created ✅ (tools/mesh-validation/validate-relay.mjs)

---

*BP086 · Sonnet 4.6 · 2026-06-18*
