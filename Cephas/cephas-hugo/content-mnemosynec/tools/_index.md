---
title: "Developer Tools & CLI Utilities"
slug: "tools"
date: 2026-06-15
draft: false
description: "Standalone CLI tools and benchmark utilities for MnemosyneC. Download and run — no UI required."
mimic-trunk-eligible: true
---

# Developer Tools &amp; CLI Utilities

Standalone scripts and benchmark runners for MnemosyneC. No desktop app required — just Node.js and Ollama.

---

<div style="background:#131b2e;border:2px solid #3d5a8e;border-radius:12px;padding:28px 32px;margin:28px 0;max-width:720px;">

<p style="font-size:20px;font-weight:800;color:#7fd1ff;margin:0 0 6px 0;">MnemosyneC Plow CLI &mdash; M5 Shard Bundle</p>

<p style="color:#bcd6ee;margin:0 0 14px 0;">Standalone Node.js benchmark runner. No UI required &mdash; runs against local Ollama.<br>
Executes the <strong>M5 psychology + other domains</strong> shard (200 questions).</p>

<p style="color:#a0c0e0;margin:0 0 10px 0;font-size:15px;">
<strong>Requirements:</strong> Node 18+, Ollama installed with <code>gemma2:2b</code> pulled
</p>

<p style="color:#a0c0e0;margin:0 0 20px 0;font-size:14px;">
Check Node version: <code>node --version</code> &nbsp;&middot;&nbsp; Pull model: <code>ollama pull gemma2:2b</code>
</p>

<a href="https://mnemosynec.ai/download/MnemosyneC-Plow-CLI-Son-M5.zip"
   style="display:inline-block;background:#1a4a8a;color:#7fd1ff;border:2px solid #5a9ae0;border-radius:8px;padding:12px 28px;font-size:16px;font-weight:700;text-decoration:none;margin-bottom:20px;">
  &#8595; Download ZIP (47.8 KB) &rarr;
</a>

<p style="color:#7a9ab8;font-size:14px;margin:0 0 6px 0;"><strong>Run after unzipping:</strong></p>
<pre style="background:#0d1520;border:1px solid #2a4060;border-radius:6px;padding:12px 16px;color:#7fd1ff;font-size:14px;margin:0 0 14px 0;overflow-x:auto;"><code>node plow-cli.js m5_shard.json</code></pre>

<p style="color:#7a9ab8;font-size:13px;margin:0;"><strong>BP084</strong> &middot; June 2026 &middot; Liana Banyan Platform</p>

</div>

---

### 🛰️ MnemosyneC Plow CLI — LAN Mesh Bundle {#mnemosynec-plow-cli-lan-mesh-bundle}

For running the mesh benchmark across multiple LAN machines.
Contains: plow-cli.js · aggregate.js · all 5 node shards · setup-helper.ps1 · README.md

**[Download MnemosyneC-Plow-CLI-Mesh-LAN.zip](/download/MnemosyneC-Plow-CLI-Mesh-LAN.zip)** (~250 KB)

1. Unzip on each LAN machine
2. Run `setup-helper.ps1` once per machine — checks Node + Ollama + recommends your shard
3. Run `node plow-cli.js shards\mX_shard.json --model gemma4:12b --out mX_results.jsonl`
4. Send `mX_results.jsonl` back to M0
5. M0 runs `aggregate.js` over all returned files

→ Need paste cards for each LAN node? Open the [LAN Mesh Cards](/tools/lan-mesh-cards/) page.

See [Son's bootstrap card](#mnemosynec-plow-cli-son-m5) for the single-node WAN pattern.

---

## How to use

**Step 1 — Install Ollama** (if not already installed)

Download from [ollama.com/download](https://ollama.com/download), then pull the benchmark model:

```
ollama pull gemma2:2b
```

Verify it runs:

```
ollama run gemma2:2b "Hello"
```

---

**Step 2 — Download the CLI bundle**

Click the Download ZIP button above, or go directly to:

```
https://mnemosynec.ai/download/MnemosyneC-Plow-CLI-Son-M5.zip
```

Unzip to any folder (e.g. `C:\MeshTest\` or `~/meshtest/`).

---

**Step 3 — Run the benchmark**

Open a terminal in the unzipped folder:

```
node plow-cli.js m5_shard.json
```

You'll see progress like:

```
[ 10/200] psychology   · 85.0% · 0 quarantined · ETA 42m
[ 20/200] psychology   · 87.5% · 1 quarantined · ETA 38m
...
[200/200] · 174 correct · 5 quarantined · score 87.3%
```

**If Ollama is on a different port:**
```
node plow-cli.js m5_shard.json --ollama http://localhost:11434
```

**Resume after a crash:**
```
node plow-cli.js m5_shard.json --resume
```

---

## ETA

| Model | Questions | Est. Time |
|---|---|---|
| gemma2:2b | 200 | 30–50 min |

---

## Troubleshooting

**"Cannot reach Ollama"** → Make sure Ollama is running. On Windows it starts automatically after install. On Mac/Linux run `ollama serve` in a separate terminal.

**"Model not found"** → Run `ollama pull gemma2:2b` first.

**Progress stops** → Ctrl+C, then re-run with `--resume` to continue.

---

*No npm install needed — the CLI uses only built-in Node modules. SSPL · BP084 · MnemosyneC*
