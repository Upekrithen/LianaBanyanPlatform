---
target_publication: reddit.com/r/programming
format: reddit-self-text
anchor: K540-Wrasse-0.059ms + K528-Pheromone-21-51x
depth: alpha
status: DRAFT — FOUNDER PROSE-PASS REQUIRED BEFORE DISPATCH
filed: 2026-04-29
---

# REDDIT DRAFT — r/programming
## [TITLE CANDIDATES]
### Option A: "Sub-millisecond stigmergic retrieval: 21-51x speedup vs RPC on a 1,122-record canonical index"
### Option B: "I measured my AI agent's pre-injection latency: 0.059ms mean lookup. Here's the architecture."

---

*[α skeleton — ~700 words framework. Founder adds voice and subreddit-appropriate framing at fire-time.]*

---

## Opening Hook

Benchmarked the lookup layer of a retrieval substrate this week. Sub-millisecond mean (0.059ms). Wanted to share the architecture and the methodology because the numbers surprised me, and I think the pattern is generalizable.

---

## The System: Wrasse Scribe + Pheromone Substrate

**What it is:** A pre-injection layer that resolves canonical facts *before* any LLM session opens. The agent's first tool call for recurring context is pre-resolved at session start — no live lookup required.

**Wrasse Scribe architecture:**
- Registry: 66+ entries at current build (K540/B132). Trigger classes: `k_prefix` / `ts_prefix` / `call_sign` / `vocabulary` / `file_path` / `canonical_number`
- Lookup: Python-side regex match against in-memory registry. Mean latency: **0.059ms** (K540 empirical run)
- Injection: matched entries inserted at prompt header before session opens
- Phase E gate cleared: 41.1% of rote-cognition tokens resolved at proxy lower bound

**Pheromone Substrate underneath it** (A&A #2317):
- Stigmergic index: 1,122 records / 7,372 topics
- Empirical speedup vs RPC Detective sweep: **21-51x** (mean 21x, median 51x, pure-query 47x)
- Baseline: local subprocess. Conservative — production cross-service RPC would widen the gap further

*[ANCHOR: K540 Wrasse lookup 0.059ms mean. K528 Pheromone 21-51x speedup vs RPC, n=50.]*

---

## Why This Matters (Skeleton — Founder fills)

[FOUNDER: Explain the pattern for r/programming audience. Key: this is a general architectural pattern — any agent with recurring canonical context benefits from pre-injection. The sub-ms lookup is achievable because the registry is small (66 entries), in-memory, and regex-based. The architectural claim is that the Phase E 41.1% coverage represents a floor, not a ceiling — real sessions include MCP tool responses and file reads not captured in the proxy measurement.]

---

## The Methodology

Per Brynjolfsson methodology-mirror discipline: all receipts are Stone-Tablet-preserved (append-only, full payload), third-party-replicable, and explicitly classified by honest-receipt class (ANCHORED / HYPOTHESIS / CONFOUND-DOCUMENTED).

Stone Tablets: `librarian-mcp/stitchpunks/wrasse/session_ledger.jsonl`

[FOUNDER: Add GitHub / Cephas link when Wave 1 fires]

---

## What's Next (Skeleton)

- Phase F (real-session measurement): replacing the prompt-file proxy with instrumented MCP-server middleware + Bishop-side filesystem watcher. Will produce publication-grade delta rather than proxy lower bound.
- Wrasse Registry Live Update: Detective→Wrasse live write so new triggers added after K540 build time become auto-resolvable. Closes the registry-staleness drift.

---

## CTA

[FOUNDER: community-appropriate close. r/programming readers want to see the code / methodology. If open-sourcing any piece of the substrate is in scope at fire-time, that's the CTA here. Otherwise: link to Cephas where methodology is documented.]

*Liana Banyan Corporation, Wyoming C-Corp, EIN 41-2797446*

---
**[DRAFT — PUBLICATION GATE HARD — FOUNDER PROSE-PASS + DISPATCH AUTHORIZATION REQUIRED]**
