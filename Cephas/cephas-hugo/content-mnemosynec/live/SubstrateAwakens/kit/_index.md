---
title: "Substrate Awakens · Replicate"
date: 2026-06-20
description: "Join the first live cooperative mesh benchmark. Watch and replicate."
mimic-trunk-eligible: true
---

# Watch and Replicate

Join the first live cooperative mesh benchmark.

## What you need
- Windows PC with 8+ GB RAM (lightweight tier works)
- [MnemosyneC v0.5.0](/download/MnemosyneC-Setup-0.5.0.exe) installed
- [Ollama](https://ollama.com/download) running with `gemma2:2b` or `gemma4:12b` pulled
- Node.js 18+ (check with `node --version`)
- ~10 GB free disk space

## Steps
1. Install MnemosyneC v0.5.0 from the [Tower of Peace](/download/)
2. [Register for Substrate Awakens](/live/SubstrateAwakens/register/) and enter your email
3. Receive your one-time heartbeat token by email
4. Launch MnemosyneC → Settings → Join Live Event → paste token
5. App auto-handshakes, fetches your shard, runs plow against your local Gemma
6. Your results stream to the [live dashboard](/live/SubstrateAwakens/) in real time
7. Earn: Crow Feather "First Live Mesh · Substrate Awakens" + 100 Marks + Founding Replicator status (first 100)

## FAQ

**What's collected?** Heartbeat-attested benchmark results only. No PII beyond your email (used for token issuance only).

**What's NOT collected?** No telemetry, no browsing history, no model outputs beyond benchmark answers.

**What if my machine disconnects mid-run?** The CLI checkpoints every 10 questions. Re-paste the same invocation with `--resume`.

**What model do I need?** gemma4:12b for premium/heavy tier; gemma2:2b for lightweight tier. setup-helper.ps1 auto-detects and recommends.

→ [Setup helper + LAN Mesh Bundle](/tools/#mnemosynec-plow-cli-lan-mesh-bundle)
