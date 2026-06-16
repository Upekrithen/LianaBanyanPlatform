<!-- STATUS: DRAFT · RATIFY PENDING · DO NOT PUBLISH -->

# Show HN: We ran a 5-node cooperative mesh benchmark (68/70 MMLU-Pro) and we're doing it live Saturday with open replication

**Platform:** Hacker News · Show HN
**Tier:** T5
**Status:** DRAFT · Awaiting Founder ratify · BP078 BLOOD — DO NOT PUBLISH

---

## Title

Show HN: We ran a 5-node cooperative mesh benchmark (68/70 MMLU-Pro) and we're doing it live Saturday with open replication

## Body

**What MnemosyneC is:**
MnemosyneC is a local-first AI app that runs inference via Ollama and participates in a cooperative substrate accumulator — a distributed memory layer that improves accuracy across all connected peers. No paid API keys. No cloud model. Workers keep 83.3%.

**What the 5-node benchmark was:**
We ran 1,400 MMLU-Pro questions across 5 machines using a cooperative mesh: each node ran a subset (shards m0–m5), results aggregated with Andon-Cord quarantine logic (questions where the mesh was internally contradictory got self-quarantined rather than submitted). We scored 68/70 across the non-quarantined pool. The full proof and reproducibility pack are at mnemosynec.ai/proofs/.

**What Saturday's event is:**
The first *live* run. Same architecture, but:
- Fresh questions (not the 1,400 from the proof)
- Open registration — anyone with a Windows PC, Node.js, and Ollama can participate
- Live dashboard at mnemosynec.ai/live/SubstrateAwakens/ showing real-time peer presence
- Andon-Cord quarantines visible to all watchers in real time
- Peer dropouts shown as "handled" — no hidden failures

**How to participate:**
1. Register at mnemosynec.ai/live/SubstrateAwakens/register/ — get a one-time heartbeat token
2. Install MnemosyneC v0.5.0 from mnemosynec.ai/download/
3. Launch → Settings → Join Live Event → paste token
4. Run gemma2:2b (lightweight) or gemma4:12b (premium) against your assigned shard
5. Results stream live to the dashboard

**What you earn:**
- Crow Feather "First Live Mesh · Substrate Awakens"
- 100 Marks (cooperative contingent accounts payable)
- Founding Replicator status (first 100)

**Truth-Always note:**
"Saturday" is the target. Slips one day if any readiness sharp is RED Saturday morning. We won't fake go-live.

Links:
- Dashboard: https://mnemosynec.ai/live/SubstrateAwakens/
- Register: https://mnemosynec.ai/live/SubstrateAwakens/register/
- Download v0.5.0: https://mnemosynec.ai/download/
- Proof: https://mnemosynec.ai/proofs/
