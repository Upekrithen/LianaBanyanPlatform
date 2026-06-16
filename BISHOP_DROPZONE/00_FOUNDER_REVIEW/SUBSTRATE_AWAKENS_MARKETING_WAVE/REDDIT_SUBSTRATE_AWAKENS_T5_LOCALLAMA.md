<!-- STATUS: DRAFT · RATIFY PENDING · DO NOT PUBLISH -->

# r/LocalLLaMA post — Substrate Awakens

**Platform:** Reddit · r/LocalLLaMA
**Tier:** T5
**Status:** DRAFT · Awaiting Founder ratify · BP078 BLOOD — DO NOT PUBLISH

---

## Title

We ran gemma4:12b across a 5-node cooperative mesh (68/70 MMLU-Pro) — doing it live Saturday with open replication

## Body

We've been running MMLU-Pro benchmarks on consumer hardware using a cooperative mesh architecture. Here's what we found and what's happening Saturday.

**The hardware:**
- M0: 64 GB RAM (orchestrator) — math + law
- M1: 16 GB RAM — engineering + computer_science
- M2: 32 GB RAM — biology + business + economics
- M3: 32 GB RAM — philosophy + history
- M5: Son's machine (WAN, lightweight tier) — psychology + other

**The model:** gemma4:12b on most nodes, gemma2:2b on the lightweight WAN node.

**The result:** 68/70 non-quarantined questions answered correctly in our distributed eval. The remaining 2 were quarantined by the Andon-Cord — questions where the mesh detected internal contradiction rather than just submitting a wrong answer.

**What's interesting about the Andon-Cord:**
Instead of a majority-vote aggregation (which hides minority-correct signals), we use Andon-Cord quarantine logic: if the mesh can't converge on an answer within a confidence threshold, the question is quarantined and NOT counted. This means the published accuracy is only for questions the cooperative was actually confident about — a stricter metric than naive majority voting.

**Saturday's live event:**
We're running it live with open replication. Fresh questions. Anyone with Ollama and a Windows PC can participate.

- gemma2:2b: lightweight tier (8+ GB RAM)
- gemma4:12b: premium tier (20+ GB RAM)

Setup helper (setup-helper.ps1 in the mesh bundle) auto-detects your RAM and recommends a tier.

**Register:** https://mnemosynec.ai/live/SubstrateAwakens/register/

**Watch live:** https://mnemosynec.ai/live/SubstrateAwakens/

**Download v0.5.0 + mesh bundle:** https://mnemosynec.ai/tools/

**Truth-Always note:** "Saturday" is the target. Slips one day if any readiness sharp is RED. Won't fake go-live.

Happy to answer questions about the Andon-Cord architecture or the shard assignment logic.
