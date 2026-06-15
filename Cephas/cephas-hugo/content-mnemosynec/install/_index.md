---
title: "Install MnemosyneC — Windows"
description: "Five-step install guide for MnemosyneC on Windows. NANO vs FULL install explained. SmartScreen warning, binary integrity check, and first-launch walkthrough."
date: 2026-06-13
draft: false
---

# Install MnemosyneC — Windows

**Offline-first &middot; No account required &middot; Right-click → Run as Administrator**

[← Back to homepage](/) &middot; [Download v0.1.60](/download/)

---

## NANO vs FULL Install

MnemosyneC ships one installer that sets up two modes:

| Mode | What it includes | When to use |
|---|---|---|
| **NANO** | qwen2.5:0.5b (bundled, tiny, instant-on) | First install, low-RAM machines, quick start |
| **FULL** | Gemma 4 12B (downloaded at runtime via Ollama) | Full substrate power, higher accuracy, needs 8 GB+ RAM |

**Start with NANO.** You can upgrade to FULL from inside the app: Settings → AI Engine → Switch to Gemma 4 12B.

---

## Five-Step Install Guide

### Step 1 — Download

[→ Download MnemosyneC-Setup-0.1.60.exe](https://github.com/liana-banyan/mnemosyne/releases/download/v0.1.60/MnemosyneC-Setup-0.1.60.exe)

**Before running:** verify the SHA-256 hash.

```powershell
Get-FileHash MnemosyneC-Setup-0.1.60.exe -Algorithm SHA256
```

Compare to the hash on the [GitHub release page](https://github.com/liana-banyan/mnemosyne/releases/tag/v0.1.60). If it matches: proceed. If it doesn't: do not run the file — download again from the official link above.

### Step 2 — SmartScreen Warning

Windows may show a SmartScreen warning: *"Windows protected your PC."*

**This is expected.** MnemosyneC is a new application. SmartScreen reputation is built over time as more users install the same signed binary. The binary is code-signed — SmartScreen is warning about reputation, not about malware.

To proceed:

1. Click **"More info"**
2. Click **"Run anyway"**

If you verified the SHA-256 hash in Step 1, you have confirmed the binary is the exact file we published.

### Step 3 — Run as Administrator

Right-click the installer → **"Run as Administrator"**

Administrator privileges are required to:
- Install the Ollama AI engine runtime
- Register the MnemosyneC service
- Create the substrate directory at `%APPDATA%\MnemosyneC\substrate\`

### Step 4 — Wait for First-Launch Initialization

On first launch, MnemosyneC initializes:

1. **Ollama runtime** — the local AI engine (bundled)
2. **Substrate directory** — your personal Eblet™ store
3. **NANO model** — qwen2.5:0.5b, pulled from Ollama registry on first run

This takes 1–5 minutes on first run depending on your internet speed (model download) and hardware speed (model initialization). After that: instant-on.

You will see a progress indicator. Wait until the UI shows **"Ready."**

### Step 5 — Ask It Something

Type a question in the Ask bar. You will get an answer — local, private, no cloud.

**Offline test:** disconnect from the internet and ask again. It still works.

---

## Post-Install: Upgrade to FULL

To switch from NANO (qwen2.5:0.5b) to FULL (Gemma 4 12B):

1. Open MnemosyneC
2. Settings → AI Engine
3. Select **"Gemma 4 12B (FULL)"**
4. Click **"Download & Switch"**
5. Wait for the model download (~8 GB)

**Requirements for FULL:** 8 GB+ RAM recommended. 16 GB for comfortable operation. The NANO model remains available as fallback.

---

## Binary Integrity

Every MnemosyneC release is:

- **Code-signed** — Windows Authenticode signature on the installer
- **SHA256-verified** — hash published on the GitHub release page
- **Append-only substrate** — every Eblet™ record is independently verifiable

Your substrate is stored at:
```
%APPDATA%\MnemosyneC\substrate\eblets.jsonl
```

This is a plain JSONL file. You can read it, copy it, verify it, and export it at any time.

---

## Troubleshooting

**"The application failed to start because its side-by-side configuration is incorrect"**
→ Install Microsoft Visual C++ Redistributable (latest, x64). Available from [Microsoft](https://aka.ms/vs/17/release/vc_redist.x64.exe).

**"Ollama port already in use"**
→ If you already have Ollama installed, MnemosyneC will use your existing Ollama instance. No conflict. If port 11434 is blocked by firewall, add an exception.

**Model download stalls**
→ The NANO model download requires internet access on first launch only. If it stalls: close MnemosyneC, check your connection, relaunch. The download resumes where it left off.

**Substrate directory missing after reinstall**
→ Your substrate (`%APPDATA%\MnemosyneC\substrate\`) is preserved across reinstalls. Uninstall does not delete it. If you want a clean slate: delete the substrate directory manually before reinstalling.

---

*Install Guide &middot; MnemosyneC v0.1.60 &middot; Windows*

*[← Back to homepage](/) &middot; [All proofs](/proofs/) &middot; [Community](/community/)*
