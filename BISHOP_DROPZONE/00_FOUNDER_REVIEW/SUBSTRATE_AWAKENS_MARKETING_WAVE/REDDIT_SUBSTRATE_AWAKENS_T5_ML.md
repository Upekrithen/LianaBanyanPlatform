<!-- STATUS: DRAFT · RATIFY PENDING · DO NOT PUBLISH -->

# r/MachineLearning post — Substrate Awakens

**Platform:** Reddit · r/MachineLearning
**Tier:** T5
**Status:** DRAFT · Awaiting Founder ratify · BP078 BLOOD — DO NOT PUBLISH

---

## Title

[Project] Cooperative substrate accumulator architecture for federated mesh benchmarking — live event Saturday

## Body

We're running the first live public demonstration of a cooperative substrate accumulator — a distributed memory layer for local inference that enables federated mesh benchmarking. Here's the architecture and what's happening Saturday.

**Architecture overview:**

The cooperative substrate accumulator (CSA) is a BM25-weighted eblet index distributed across peer nodes. Each peer contributes inference results; the substrate accumulates correct-answer evidence across all domains. The key novel element is the Andon-Cord quarantine system.

**Andon-Cord quarantine:**
When a question is submitted to the mesh, each node runs inference independently. If the mesh detects internal contradiction (high entropy across node answers), the question is quarantined — it does NOT get submitted to the aggregate score. Quarantine is self-reported by the cooperative rather than hidden.

This differs from standard majority voting in two ways:
1. Quarantined questions are NOT counted in accuracy (stricter metric)
2. Quarantine is visible to all participants — the cooperative's uncertainty is surfaced, not papered over

**Distributed eval results:**
5-node mesh, 1,400 MMLU-Pro questions across 14 domains, consumer hardware (gemma4:12b + gemma2:2b):
- 68/70 non-quarantined questions correct
- 2 quarantined (Andon-Cord detected contradiction)
- Full reproducibility pack at mnemosynec.ai/proofs/

**Saturday's live event:**
First live run with open replication. Fresh questions (not the 1,400 from the proof). Real-time dashboard showing:
- Peer constellation map (active/quarantine/dropped states)
- Per-peer accuracy streams
- Aggregate accuracy of non-quarantined nodes
- Failure banners if relay degrades or aggregate stalls

**Architecture stack:**
- Local inference: Ollama (gemma4:12b / gemma2:2b)
- Substrate index: BM25-weighted eblet scoring
- Peer communication: Supabase Realtime (peer_presence table)
- Heartbeat attestation: HMAC-SHA256 per node_id
- Dashboard: Vanilla JS WebSocket subscription to Supabase Realtime

**Participate:**
https://mnemosynec.ai/live/SubstrateAwakens/

Questions about the CSA architecture, Andon-Cord design, or BM25-weighted eblet indexing welcome.
