# KNIGHT YOKE · LAN Omnibus Plow Tool + Tools Page Card · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — *"give me the powershell commands for each ... ok, yes cli everywhere, put it in tools and M0 keep going bc it can escalate anyway"*

**Goal:** repeatable LAN-cohort plow tool. Same UX as Son's M5 bundle, scaled to N nodes. Hosted on `mnemosynec.ai/tools/` so Founder, Son, and any future LAN cohort can run the mesh benchmark without bespoke setup.

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## What ships in this yoke

### Deliverable A — `MnemosyneC-Plow-CLI-Mesh-LAN.zip`

Single omnibus bundle. Contains:
- `plow-cli.js` (current canonical)
- `aggregate.js` (current canonical)
- `shards/` folder with ALL FIVE node shards: `m0_shard.json`, `m1_shard.json`, `m2_shard.json`, `m3_shard.json`, `m5_shard.json`
- `setup-helper.ps1` — bootstrap script (Deliverable B)
- `README.md` — 1-page "pick your node" instructions

### Deliverable B — `setup-helper.ps1`

PowerShell bootstrap helper. Runs on any Windows machine and prints a Truth-Always report:

```powershell
# Checks performed:
# 1. Node.js installed?    → if no, surfaces nodejs.org link with copy-button
# 2. node --version ≥ 18?  → if old, prompts to upgrade
# 3. Ollama running on localhost:11434? → if no, surfaces ollama.com/download
# 4. Is gemma4:12b pulled? → if no, runs `ollama pull gemma4:12b` (with confirm prompt — ~7 GB download)
# 5. Is gemma2:2b pulled?  → if no, optionally pulls (for lightweight tier machines)
# 6. Disk space check (need ≥ 20 GB free for safe gemma4:12b operation)
# 7. RAM check + auto-recommend node tier:
#    < 12 GB  → "lightweight" (gemma2:2b, suggest shard m5 or sit out)
#    12-20 GB → "standard"    (gemma2:2b primary, gemma4:12b possible but tight)
#    20-48 GB → "premium"     (gemma4:12b comfortable)
#    > 48 GB  → "heavy"       (gemma4:12b + capacity to also be Conductor)
# 8. Firewall port-open helper (optional, for future MIC LAN auto-discovery v0.5.0+):
#    - UDP 7475 inbound allow (LAN peer discovery)
#    - TCP 7474 inbound allow (peer dispatch)
#    - Requires elevation; helper prompts; on cancel, prints "skipped — needed only for MIC, not CLI"
# 9. Prints recommended invocation line per node based on RAM tier

# Exits with code 0 if "ready to plow," 1 if blocked.
```

**NEVER tampers with PATH, env vars, or services without user confirmation.** Every action requires explicit Y to proceed. Truth-Always — surfaces what's missing without auto-fixing.

### Deliverable D — `/tools/lan-mesh-cards/` page with copy-button paste cards

A new sub-page at `mnemosynec.ai/tools/lan-mesh-cards/` (and same on cephas) — discoverable from the Tools index. Each LAN node gets its own card with a **one-click "Copy" button** that copies the PowerShell block to clipboard.

**Page structure:**

```markdown
# LAN Mesh Cards · BP084

Paste-ready PowerShell blocks for running the mesh benchmark across LAN nodes.
Open this page on each LAN box → click Copy on your assigned card → paste in
PowerShell → enter M0 Admin creds when prompted.

> **Prerequisite:** Node.js ≥ 18, Ollama running, gemma4:12b pulled.
> Run `setup-helper.ps1` from the [Mesh LAN Bundle](#mnemosynec-plow-cli-lan-mesh-bundle)
> first if you're unsure.

## Card · M1 (16 GB tier · shard m2 · 200q · engineering+CS)
[copy-button: copies the M1 block]
```powershell
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
```

## Card · M2 (32 GB tier · shard m1 · 300q · biology+business+economics)
[copy-button]
```powershell
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
```

## Card · M3 (32 GB tier · shard m3 · 200q · philosophy+history)
[copy-button]
```powershell
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
```

## Card · M5 (Son · WAN · lightweight tier · shard m5 · 200q · psychology+other) — REFERENCE ONLY
[copy-button]
```powershell
# === BP084 mesh plow · M5 (WAN · gemma2:2b) · shard m5 · 200q ===
# Same pattern as Son's bootstrap card — assumes M5 cannot reach LAN \\LIANABANYAN share.
# Use the standalone bundle from /tools/ Son card instead for true WAN nodes.
node plow-cli.js shards\m5_shard.json --model gemma2:2b --out m5_results.jsonl
```

## Notes
- Each PowerShell window must stay open the entire run (~1-2 hours)
- If a window closes mid-run, re-paste the same block with `--resume` flag
- Results auto-copy back to M0's `results\` folder over the SMB share
- For long-haul deployments (v0.5.0+ with MIC LAN auto-discovery), see [the long-haul yoke spec](/docs/long-haul-mesh/)

## Future-proofing
- Replace the hardcoded `\\LIANABANYAN` hostname with the user's actual orchestrator hostname
- Replace shard assignments per the user's actual RAM tier map
- For non-Founder cohorts: shard assignments will be generated by the future MIC dispatcher pre-render

---

**Heartbeat-attested footer** (per [[canon-fork-derivative-cooperative-access-thorax-heartbeat-enforcement-bp084]]): if a Mimic Trunk forks this page with different paste cards, the heartbeat library still gates results submission to the cooperative substrate accumulator.
```

**Copy-button implementation:** small vanilla JS snippet shared across cards. Click → writes to clipboard via Navigator API → flashes "Copied!" toast (per BP078 every-click-feedback canon). Falls back to manual select-all on browsers without clipboard API.

**Hugo frontmatter:**
```yaml
---
title: "LAN Mesh Cards"
date: 2026-06-15
description: "Paste-ready PowerShell blocks for the mesh benchmark"
mimic-trunk-eligible: true
parent: tools
---
```

URL: `https://mnemosynec.ai/tools/lan-mesh-cards/` and `https://cephas.lianabanyan.com/tools/lan-mesh-cards/`

### Deliverable C — Tools page card update

`Cephas\cephas-hugo\content-mnemosynec\tools\_index.md` — add a new card alongside Son's M5 zip:

```markdown
### 🛰️ MnemosyneC Plow CLI — LAN Mesh Bundle

For running the mesh benchmark across multiple LAN machines.
Contains: plow-cli.js, aggregate.js, all 5 node shards, setup-helper.ps1.

**[Download MnemosyneC-Plow-CLI-Mesh-LAN.zip](/download/MnemosyneC-Plow-CLI-Mesh-LAN.zip)** (~250 KB)

1. Unzip on each LAN machine
2. Run `setup-helper.ps1` once per machine — surfaces Node + Ollama status and recommended shard
3. Run `node plow-cli.js shards\mX_shard.json --model gemma4:12b --out mX_results.jsonl`
4. Send `mX_results.jsonl` back to the M0 orchestrator
5. M0 runs `aggregate.js` over all returned files

See [Son's bootstrap card](#mnemosynec-plow-cli-son-m5) for the single-node WAN pattern.
```

---

## SEG-1 — Build the omnibus zip (Sonnet 4.6 SEG)

Script: `tools\plow-cli\build-mesh-lan-zip.ps1` — packages the omnibus bundle.

Source files from `tools\plow-cli\` (current canonical), include all 5 shards, exclude `results/`, `node_modules/`, `*.log`.

Output: `Cephas\cephas-hugo\static\download\MnemosyneC-Plow-CLI-Mesh-LAN.zip`

Verify zip integrity: extract to temp folder + sanity-check files exist + delete temp.

---

## SEG-2 — Write `setup-helper.ps1` (Sonnet 4.6 SEG)

Implement all 9 checks listed above. Truth-Always pattern — REPORTS state, doesn't silently fix.

Special attention:
- The `ollama pull gemma4:12b` step shows current download progress (Ollama provides this natively) — pipe through to user terminal
- Firewall port-open step uses `New-NetFirewallRule` with explicit `-Profile Domain,Private` (NOT Public)
- All admin-required actions check `IsElevated` first and abort with clean message if not

Include header banner:
```
=== MnemosyneC Plow CLI · LAN Mesh Bundle · Setup Helper ===
Truth-Always: this script REPORTS your machine's readiness.
It does NOT modify anything without explicit confirmation.
```

---

## SEG-3 — Tools page card (Sonnet 4.6 SEG)

Edit `Cephas\cephas-hugo\content-mnemosynec\tools\_index.md` per Deliverable C above.

Preserve existing Son M5 card (Knight already shipped it last yoke wave). New LAN card placed BELOW the Son card with clear "for multi-machine LAN setups" framing.

Add anchor IDs so the cross-link works (`#mnemosynec-plow-cli-son-m5` and `#mnemosynec-plow-cli-lan-mesh-bundle`).

---

## SEG-3b — Build the `/tools/lan-mesh-cards/` page (Sonnet 4.6 SEG)

Implement Deliverable D above. Write `Cephas\cephas-hugo\content-mnemosynec\tools\lan-mesh-cards\_index.md` with the four PowerShell cards verbatim.

Implement the copy-button widget in `Cephas\cephas-hugo\static\js\copy-button.js` — small vanilla JS, listens for `.copy-card-button` clicks, finds the `<pre>` sibling, copies inner text via `navigator.clipboard.writeText()`, flashes "Copied! ✓" toast for 1.2s. Mount in `layouts/partials/footer.html` so it's available site-wide for any future copy-card pattern.

Update the Tools index card from Deliverable C to surface a link: *"→ Need paste cards for each LAN node? Open the [LAN Mesh Cards](/tools/lan-mesh-cards/) page."*

Mirror the LAN Mesh Cards page to `cephas.lianabanyan.com/tools/lan-mesh-cards/` (same Hugo build).

## SEG-4 — Deploy + Truth-Always Sharps (Sonnet 4.6 SEG)

Use atomic-deploy.ps1. Sharps (all literal HTTP 200 first hop):

- Sharp 1: `curl -sI https://mnemosynec.ai/download/MnemosyneC-Plow-CLI-Mesh-LAN.zip` → 200 + Content-Length ≥ 100,000 bytes
- Sharp 2: `curl -sI https://mnemosynec.ai/tools/` → 200 + body grep "LAN Mesh Bundle"
- Sharp 3: Download the zip + unzip + verify contents (plow-cli.js, aggregate.js, 5 shard files, setup-helper.ps1, README.md all present)
- Sharp 4: `Get-AuthenticodeSignature` on setup-helper.ps1 returns sane result (not Tampered)
- Sharp 5: README.md links to /tools/ AND back-link to Son card
- Sharp 6: `curl -sI https://mnemosynec.ai/tools/lan-mesh-cards/` → 200 + body grep "M1 (16GB)" AND "M2 (32GB)" AND "M3 (32GB)"
- Sharp 7: Copy-button widget functional (headless browser test: click button → check clipboard via DOM exec)
- Sharp 8: Tools index page links to `/tools/lan-mesh-cards/` AND back-links to Son's bootstrap card

NO COSMETIC-GREEN. HONEST RED if any 302 or 404.

---

## SEG-5 — Composition with Mimic Trunks (Sonnet 4.6 SEG)

Per [[canon-mimic-trunks-gate-and-tunnel-partner-cooperative-volume-benefits-bp084]] — add `mimic-trunk-eligible: true` to the Tools page frontmatter. The Mimic Trunk pattern applies: a partner can fork the Tools page + improve the setup-helper UX + Mimic Trunk merges back. Footer mimic-trunk link appears site-wide per the combined Gemma yoke.

---

## Yoke-return spec

Each SEG status + commits + 5 Sharps with literal HTTP codes + screenshot of `/tools/` page showing both cards + verbatim "Sonnet 4.6".

---

**FOR THE KEEP.**

Tonight's mesh uses Path A (UNC). Tomorrow's and Son's future runs use this proper Tools page download.
