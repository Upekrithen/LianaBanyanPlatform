---
title: "Constellation — MIC Multi-Machine Federation · MnemosyneC"
description: "MIC (Machine In Charge): any machine in your fleet can conduct a Plow. 5-machine fleet = 4x speedup. WAN + LAN support. Federation Node Frontier. Constellation Switchboard. NotCents shape mapping."
date: 2026-06-15
draft: false
---

# Constellation

**MIC (Machine In Charge) · Multi-Machine Federation · The Cooperative Plow Fleet**

*Any of your machines can be the Conductor. The constellation works together.*

[← Back to homepage](/) · [The Diagnosis](/diagnosis/) · [All Proofs](/proofs/)

---

## What Is MIC?

**MIC — Machine In Charge** — is the cooperative-class answer to fleet coordination.

In MnemosyneC v0.4.0+, **any machine in your fleet can be the Conductor of a Plow**. There is no designated server. There is no master node. Whichever machine you designate as the MIC takes charge of that Plow run — directing the Specialist swarm, collecting results, running Three Fates concordance, and writing eblets to the shared substrate.

Plain English: *"Your laptop at home, your desktop at work, your son's machine 5 miles away — any of them can run the show. The Constellation does the work. You get the answers."*

---

## 5-Machine Fleet Math — The 4× Speedup

A Canonical Plow of 70 MMLU-Pro questions takes ~70 minutes on a single machine (1 question/minute wall-clock).

**With Constellation, the Plow is parallelized across your fleet:**

| Fleet Size | Wall-Clock Time | Speedup |
|---|---|---|
| **1 machine** | ~24 hours (full domain set) | 1× baseline |
| **2 machines** | ~12 hours | 2× |
| **5 machines** | ~6 hours | 4× |
| **14 machines** | ~1.7 hours | ~14× |

*Assumes even load distribution, network latency < 50ms, all machines running Ollama + gemma4:12b.*

The speedup compounds with substrate: as your fleet's substrate grows, HOT retrieval replaces cold inference — shrinking wall-clock further on every subsequent run.

---

## The Constellation Switchboard

The Constellation Switchboard is the visual display of your fleet's live state. Each machine in your Constellation has a **NotCents™ shape** indicating its current role:

| Shape | State | Meaning |
|---|---|---|
| **▢ Square** (outline) | Idle | Machine is online, ready to work, no active task |
| **▢ Square** (filled) | Working | Machine is processing a Plow segment |
| **△ Triangle** (outline) | Active Conductor | MIC is awake, ready to conduct |
| **△ Triangle** (filled) | Conducting | MIC is actively directing a Plow |
| **◯ Circle** (outline) | Offline — reachable | Machine was seen recently, currently unreachable |
| **◯ Circle** (filled) | Offline — unreachable | Machine is not responding |
| **👑 Crown** | MIC designation | This machine is the current Machine In Charge |

**The crown follows the Conductor.** When you start a Plow from a different machine, the crown moves to that machine. The fleet reorganizes automatically — no configuration required.

---

## WAN + LAN Support

Constellation works across both **local networks (LAN)** and **wide area networks (WAN)**:

**LAN (same home/office network):**
- Automatic peer discovery via UDP multicast
- Median latency: 16.6ms p50 (BP067 mesh proof)
- No setup required — machines find each other

**WAN (machines in different locations):**
- Peer registration via cooperative Mesh Frontier™ relay
- Tested: Founder + son's machine 5 miles apart — full Constellation coordination
- Encrypted peer-to-peer substrate sync
- No central server required for operation (relay is discovery-only)

*"The son's machine 5 miles away joined the Constellation and participated in a full Plow run. The substrate sync was verified hash-by-hash. Latency held."* — BP083 WAN test

---

## Federation Node Frontier

The **Federation Node Frontier** is the cooperative layer beyond your personal fleet — the Liana Banyan cooperative network.

| Tier | Description | Access |
|---|---|---|
| **Personal Fleet** | Your own machines | Free, always |
| **Household Constellation** | Machines you explicitly authorize (family, household) | Free, by invitation |
| **Federation Node Frontier** | Cooperative member machines — Capsule rental + work-and-pay | $5/year membership |

**Capsule rental**: Federation Nodes can offer compute capacity to the cooperative network. Members who contribute compute earn Marks through the cooperative work-and-pay layer. Workers keep 83.3%. Platform takes Cost+20%.

**This is not a cloud service.** The Federation Node Frontier is peer-to-peer cooperative compute — members helping members, at cost, with transparent pricing, under the same Cooperative Defensive Patent Pledge that covers everything we build.

---

## Plow with Constellation — What the Button Does

When you click **"Plow with Constellation"** in MnemosyneC:

1. The MIC broadcasts a Plow job announcement to all Constellation peers
2. Available machines accept segments of the question set (work units)
3. Each machine runs its assigned questions through the full Canonical Plow Pipeline:
   - Spider → 9 External Specialists → Miner → Saladin → Furnace → Three Fates → Scribe
4. Results (verified eblets + quarantine flags) return to the MIC
5. MIC runs final Three Fates concordance across cross-machine results
6. Verified eblets are written to the shared substrate on ALL participating machines
7. Plow summary shows: total questions, pass rate, quarantine count, eblets grown, machines contributed

**Every machine in the Constellation gets the substrate benefit.** You don't just get a faster answer — every machine gets every verified eblet from the run.

---

## The Federated Andon Cord — 3-Tier Escalation

Constellation is also the mechanism for **Tier 2 of the Federated Andon Cord**:

| Tier | Scope | Action |
|---|---|---|
| **Tier 1** | Local machine | 3-voter concordance · up to 3 retries |
| **Tier 2** | Constellation (Federation) | Re-runs question on peer machines · different substrate context |
| **Tier 3** | Human Salt | Escalates to The Diagnosis cooperative peer network |

When your local machine's pipeline cannot reach concordance on a question, it does not silently fail. It **escalates to the Constellation** — other machines in your fleet with different substrate states may already have the answer. If the Constellation also cannot resolve it, **The Diagnosis** (Human Salt) is the final tier.

The cooperative never gives up on a question. It escalates until resolved — or honestly reports "not resolved" and quarantines.

---

## Why Constellation Matters

The extraction-class AI response to multi-machine coordination: centralize in a cloud, charge per API call, keep the substrate on their servers.

The cooperative-class response: **Constellation**.

Your machines. Your substrate. Your fleet. Coordinated cooperatively. Priced at Cost+20%. With 83.3% of every dollar going to the workers who built and maintain the infrastructure.

The substrate compounds with every Plow. Every machine in your Constellation gets stronger together. **Help each other help ourselves.**

---

## Getting Started with Constellation

*(Available in MnemosyneC v0.4.0+)*

1. **Install MnemosyneC** on each machine in your fleet: [Download v0.4.1](/download/)
2. **Open the Constellation tab** in any MnemosyneC instance
3. Machines on the same LAN are discovered automatically
4. For WAN peers, share your **Constellation invite code** (generated in-app)
5. Click **"Plow with Constellation"** on your next Plow run

The machine you click from becomes the MIC (Machine In Charge) for that run. The 👑 crown appears in the Switchboard.

---

*Constellation · MIC · Federated Andon Cord · MnemosyneC · Liana Banyan Corporation*

*Caithedral™ Federation Protocol · Cooperative-class · Help each other help ourselves.*

*[← Back to homepage](/) · [The Diagnosis](/diagnosis/) · [Proofs & Receipts](/proofs/) · [Download v0.4.1](/download/)*
