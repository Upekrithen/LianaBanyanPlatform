---
title: "LAN Mesh Cards"
date: 2026-06-15
description: "Paste-ready PowerShell blocks for the mesh benchmark"
mimic-trunk-eligible: true
parent: tools
---

# LAN Mesh Cards · BP084

Paste-ready PowerShell blocks for running the mesh benchmark across LAN nodes.
Open this page on each LAN box → click Copy on your assigned card → paste in PowerShell.

> **Prerequisite:** Node.js ≥ 18, Ollama running, gemma4:12b pulled.
> Run `setup-helper.ps1` from the [Mesh LAN Bundle](/tools/#mnemosynec-plow-cli-lan-mesh-bundle) first if unsure.

---

## Card · M1 (16 GB tier · shard m2 · 200q · engineering+CS) {#card-m1}

<div class="copy-card-wrapper">
<button class="copy-card-button" data-target="card-m1-pre">Copy</button>
<pre id="card-m1-pre">
# === BP084 mesh plow · M1 (16GB) · shard m2 · engineering+CS · 200q ===
$cred = Get-Credential -Message "M0 Admin creds for \\LIANABANYAN"
$src  = "\\LIANABANYAN\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"
$local = "C:\plowmesh"
New-PSDrive -Name P -PSProvider FileSystem -Root $src -Credential $cred | Out-Null
if (-not (Test-Path $local)) { New-Item -ItemType Directory -Path $local | Out-Null }
robocopy P:\ $local plow-cli.js aggregate.js /NFL /NDL /NJH /NJS /NC /NS
robocopy P:\shards "$local\shards" m2_shard.json /NFL /NDL /NJH /NJS /NC /NS
cd $local
node plow-cli.js shards\m2_shard.json --model gemma4:12b --out m2_results.jsonl
Copy-Item m2_results.jsonl "P:\results\m2_results.jsonl" -Force
"M1 done · file copied back to M0"
</pre>
</div>

## Card · M2 (32 GB tier · shard m1 · 300q · biology+business+economics) {#card-m2}

<div class="copy-card-wrapper">
<button class="copy-card-button" data-target="card-m2-pre">Copy</button>
<pre id="card-m2-pre">
# === BP084 mesh plow · M2 (32GB) · shard m1 · biology+business+economics · 300q ===
$cred = Get-Credential -Message "M0 Admin creds for \\LIANABANYAN"
$src  = "\\LIANABANYAN\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"
$local = "C:\plowmesh"
New-PSDrive -Name P -PSProvider FileSystem -Root $src -Credential $cred | Out-Null
if (-not (Test-Path $local)) { New-Item -ItemType Directory -Path $local | Out-Null }
robocopy P:\ $local plow-cli.js aggregate.js /NFL /NDL /NJH /NJS /NC /NS
robocopy P:\shards "$local\shards" m1_shard.json /NFL /NDL /NJH /NJS /NC /NS
cd $local
node plow-cli.js shards\m1_shard.json --model gemma4:12b --out m1_results.jsonl
Copy-Item m1_results.jsonl "P:\results\m1_results.jsonl" -Force
"M2 done · file copied back to M0"
</pre>
</div>

## Card · M3 (32 GB tier · shard m3 · 200q · philosophy+history) {#card-m3}

<div class="copy-card-wrapper">
<button class="copy-card-button" data-target="card-m3-pre">Copy</button>
<pre id="card-m3-pre">
# === BP084 mesh plow · M3 (32GB) · shard m3 · philosophy+history · 200q ===
$cred = Get-Credential -Message "M0 Admin creds for \\LIANABANYAN"
$src  = "\\LIANABANYAN\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"
$local = "C:\plowmesh"
New-PSDrive -Name P -PSProvider FileSystem -Root $src -Credential $cred | Out-Null
if (-not (Test-Path $local)) { New-Item -ItemType Directory -Path $local | Out-Null }
robocopy P:\ $local plow-cli.js aggregate.js /NFL /NDL /NJH /NJS /NC /NS
robocopy P:\shards "$local\shards" m3_shard.json /NFL /NDL /NJH /NJS /NC /NS
cd $local
node plow-cli.js shards\m3_shard.json --model gemma4:12b --out m3_results.jsonl
Copy-Item m3_results.jsonl "P:\results\m3_results.jsonl" -Force
"M3 done · file copied back to M0"
</pre>
</div>

## Card · M5 (Son · WAN · gemma2:2b · shard m5 · 200q · psychology+other) — REFERENCE ONLY {#card-m5}

<div class="copy-card-wrapper">
<button class="copy-card-button" data-target="card-m5-pre">Copy</button>
<pre id="card-m5-pre">
# === BP084 mesh plow · M5 (WAN · gemma2:2b) · shard m5 · 200q ===
# Use standalone bundle from /tools/ Son card for true WAN nodes.
node plow-cli.js shards\m5_shard.json --model gemma2:2b --out m5_results.jsonl
</pre>
</div>

---

## Notes

- Each PowerShell window must stay open the entire run (~1-2 hours for LAN nodes)
- If a window closes mid-run, re-paste with `--resume` flag appended
- Results auto-copy back to M0's `results\` folder over the SMB share
- Replace `\\LIANABANYAN` with your actual orchestrator hostname if different
