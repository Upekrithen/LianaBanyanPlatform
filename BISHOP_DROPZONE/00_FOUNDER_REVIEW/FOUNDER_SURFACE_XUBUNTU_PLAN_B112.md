# Founder Machine Prep — Surface → Xubuntu Fresh Install
## B112, April 21, 2026 — Red Carpet physical-ship prep
## For: Founder's $2k Surface laptop → Xubuntu 24.04 LTS fresh install + Eyewitness stack

**Purpose:** Prepare the Founder's high-end Surface laptop to be physically shipped as a Red Carpet Eyewitness demo machine — **recipient: Trebor Scholz** (platform cooperativism scholar, The New School). Founder-clarified B112 — earlier "default Scholz" language in B111 closeout meant TREBOR Scholz, not MacKenzie Scott. MacKenzie Scott is the written Crown Letter target (Wave 1 Apr 22–23); Scholz is the physical machine target (ship ~Apr 29–May 2). Both tracks run in parallel and reinforce each other.

Machine arrives with Xubuntu + Librarian MCP + Eyewitness Benchmark + pre-set demo sequence, so Trebor unboxes, plugs in, and sees the 8-model table running live inside 5 minutes.

**Tailoring register (locked B112):** platform cooperativism + anti-enshittification + developer-literate. NOT grantee-verification register. Trebor will `pip install` himself, so the ship optimizes for **academic-authority demo + newsletter/New School amplification**, not for demo-as-foundation-ops-showcase.

**Founder parallel track:** LinkedIn outreach to Trebor concurrent with / before machine arrival. The physical ship reinforces the LinkedIn conversation. Do NOT time the ship to arrive before the LinkedIn message — ship **second**, so the LinkedIn dialogue primes him for "and there's a laptop coming."

**Why Xubuntu not Ubuntu:** original B111 plan said Ubuntu 24.04 LTS. Founder's B112 resumption prompt changed to **Xubuntu** (Xfce desktop). Decision locks: Xfce is lighter on resources, boots faster, looks less "cloud-vendor-ified," and works better as a portable physical-ship machine. Ubuntu's GNOME default has Snap-store / cloud-account-prompt friction that undermines the "your number, private to you" thermometer story.

**Target delivery window:** Apr 26–27 (Eyewitness Program public launch) is too tight; realistic target is Apr 29–May 2 for physical shipment.

---

## STAGE 1 — Backup (BEFORE any disk wipe)

**Do this first. Do not skip. Do not shortcut.** The Surface laptop likely has Founder materials that don't live in the synced cloud — session notes, screenshots, one-off prompts, maybe photos. Backup is the only way to discover what was load-bearing.

### 1a. Full-disk image backup (overnight)

- **Tool:** `dd` + external drive, or Macrium Reflect Free (Windows-side), or Clonezilla (USB-bootable, runs under either OS).
- **Target:** external USB-3 SSD, ≥2TB. Founder confirms availability; if not, purchase today.
- **Command (Clonezilla, USB-boot then):** `device-image → savedisk → choose local source disk → choose target external → -z1p (gzip compression)`.
- **Estimated time:** 2–6 hours depending on disk-used. Run overnight.
- **Verification:** post-image, Clonezilla offers `chkimg` — run it. Do not proceed to Stage 2 until chkimg passes.

### 1b. Selective user-data copy (day-of, before wipe)

Even with a full-disk image, copy these to an additional USB stick or cloud for fast-access recovery:

- `Documents/` (all)
- `Desktop/`
- `Downloads/` (filter to `.md`, `.docx`, `.pdf`, `.txt`, `.py`, `.sh`, `.json`, `.yaml`, `.env`)
- `Pictures/` (all) — screenshots often capture session state that only exists in image form
- Browser bookmarks + saved passwords (export each browser: Edge, Chrome, Firefox if present)
- `%APPDATA%/Claude/` if present (session history / config)
- `.ssh/` if present
- `.gitconfig`, `.gitignore_global`
- Any `*.pem`, `*.key`, `*.pfx` files (credentials Founder may have forgotten about — check before wipe)

### 1c. Credential audit (critical)

- Open each browser password manager. Decide per-credential: keep on shipped machine for demo (none recommended), copy to Founder's primary machine, or destroy.
- Check for wallet files: `.dat` (Bitcoin), `keystore/` (Ethereum), hardware-wallet seed phrases written in text files (unlikely but audit).
- SSH keys: the shipped machine must NOT carry any Founder-signing SSH keys. Generate a fresh demo-machine key during Stage 3.

### 1d. Windows license + recovery key

- Pull Windows product key (in case wipe is reversed). Command on current Windows: `wmic path softwarelicensingservice get OA3xOriginalProductKey`.
- If BitLocker is enabled, record the recovery key to a location NOT on the Surface. It will be needed if Stage 2 disk-prep triggers a re-encryption check.

---

## STAGE 2 — Boot-USB prep (can parallel Stage 1b/1c)

### 2a. Ventoy flash (USB stick ≥16GB)

- Download Ventoy from official site. Verify checksum (NEVER skip checksum for a boot tool).
- Flash USB stick with Ventoy via the Ventoy GUI installer.
- **Do NOT put the Xubuntu ISO on the USB yet** — put it there AFTER Ventoy install so the ISO sits on the resulting FAT32 partition.

### 2b. Download Xubuntu 24.04 LTS ISO

- Source: official Xubuntu mirror (xubuntu.org/download → 24.04 LTS "Noble Numbat" amd64).
- Verify SHA256 checksum against the published value.
- Drag ISO to the Ventoy USB's data partition (Ventoy boots any ISO placed on that partition — no per-ISO re-flash needed).

### 2c. Optional: add a second ISO for comparison / fallback

- Ubuntu 24.04 LTS (GNOME) — in case Xfce has a hardware driver issue on Surface.
- Clonezilla live — for the Stage 1 disk image if you didn't use it there.

---

## STAGE 3 — Fresh install (Xubuntu on wiped Surface)

### 3a. BIOS / firmware prep

- Enter Surface firmware (hold Volume-Up + Power on boot).
- Disable Secure Boot (Xubuntu supports it, but disabling simplifies troubleshooting if driver signing is flaky).
- Set USB boot priority above internal drive.

### 3b. Live-boot Xubuntu

- Boot USB → Ventoy menu → select Xubuntu 24.04 LTS → "Try or Install Xubuntu."
- Test touch, keyboard, trackpad, WiFi, suspend/resume — for ~10 minutes. Surface laptops historically had touch-driver gaps in Linux; if any are deal-breakers, switch to Ubuntu GNOME fallback and re-test.

### 3c. Install

- Installation type: **Erase disk and install Xubuntu** (full wipe — backup must already be complete at this step).
- Encryption: **yes, encrypt with LVM + LUKS passphrase.** Write the passphrase into the shipped-machine README (see Stage 5) so the recipient can unlock on first boot, then change it if they want.
- User account: `eyewitness` (not Founder's name; this is a demo machine)
- Hostname: `pine-books-demo` (Pine Books anchor, per memory `project_pine_books_anchor.md`). Or Founder's preferred hostname.
- Enable auto-updates at install time.

### 3d. First-boot updates

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y curl git build-essential python3-venv python3-pip tmux htop neovim
sudo reboot
```

---

## STAGE 4 — Eyewitness stack install

### 4a. Python environment

```bash
python3 -m venv ~/.venv/eyewitness
source ~/.venv/eyewitness/bin/activate
echo 'source ~/.venv/eyewitness/bin/activate' >> ~/.bashrc
pip install --upgrade pip
```

### 4b. Librarian MCP server

```bash
# If K424 has merged to main at ship time, install v0.2.0:
pip install git+https://github.com/Upekrithen/librarian-mcp.git@v0.2.0
# If K424 not yet landed, pin to v0.1.0-alpha:
pip install git+https://github.com/Upekrithen/librarian-mcp.git@v0.1.0-alpha
```

Verify:
```bash
python -m librarian_mcp --version
python -c "from librarian_mcp import librarian_context; print(len(librarian_context()['packet']))"
```

### 4c. Eyewitness benchmark repo

```bash
cd ~
git clone https://github.com/Upekrithen/librarian-mcp.git librarian-mcp-repo
cd librarian-mcp-repo/r10_cross_vendor
# Copy pre-populated results from Founder's main machine so demo opens instantly:
# (scp from Founder machine or put on backup USB)
# results/run_2026-04-20_K423_final/ → this path
```

### 4d. Pre-cached demo script

Create `~/demo.sh`:

```bash
#!/usr/bin/env bash
set -e
echo "========================================="
echo "  The Eyewitness Benchmark — LIVE DEMO   "
echo "  Liana Banyan Corporation · April 2026  "
echo "========================================="
echo ""
echo "Press ENTER to display the 8-model cross-vendor table."
read
cat ~/librarian-mcp-repo/r10_cross_vendor/results/run_2026-04-20_K423_final/TABLE.md
echo ""
echo "Press ENTER to verify the Librarian preload on your own machine (costs < \$0.01)."
read
python ~/librarian-mcp-repo/r10_cross_vendor/demo_smoke.py
```

`chmod +x ~/demo.sh`. Also add a desktop launcher so the recipient can double-click it.

### 4e. Keys — DO NOT SHIP LIVE KEYS

- The shipped machine ships with **empty** `.env`. Recipient adds their own vendor key to run the live smoke test.
- Pre-load read-only sample outputs (the JSONL from K423) so the recipient can inspect the data without needing a key at all.
- If Founder wants to include a $20-credit demo key (Anthropic), that's a separate decision — documented choice, not default. My recommendation: don't. The demo is stronger if the recipient uses their own key.

---

## STAGE 5 — Physical ship prep

### 5a. Printed README

Single sheet, inside the laptop lid. Contents:
- Laptop is yours. Wipe it, reinstall anything, sell it. It's a demo gift, not a conditional loan.
- Login user: `eyewitness`. LUKS passphrase: `<from Stage 3c>`. User password: `<chosen at install>`. Change both on first boot.
- To see the Eyewitness Benchmark: double-click `~/demo.sh` on the desktop, or run `~/demo.sh` in a terminal.
- To install the Librarian in a fresh Python project: `pip install librarian-mcp` (or the git URL printed in `~/README.txt`).
- Contact: Founder@LianaBanyan.com · 406-578-1232. No obligation to respond.

### 5b. Physical packaging

- Original Surface box if available; otherwise crushable foam + charger in same box
- Printed benchmark table + one-pager letter from Founder (handwritten signature, short)
- Do NOT include the backup USB from Stage 1 (that stays with Founder)
- Tracked shipping. Recipient-signature-required.

### 5c. Customs / cross-border

- If recipient is outside US: check export-control on encryption (LUKS is routine, should clear). Declare laptop at real value ($2k) with demonstration purpose. Insurance up to value.

---

## STAGE 6 — Post-ship tracking

- Auto-create Helm task: `fire_at = shipped + 48h`, `priority_tier = 1`, `source_kind = "red_carpet_shipment"`. Body: "Confirm delivery. If delivered, no-follow-up unless recipient initiates. If undeliverable, retrieve and hold for alternate recipient."
- Red Carpet registry entry: insert row with shipping tracking number, recipient, date, machine serial.
- Glass Door entry (optional, Founder judgment): publish the fact of the physical-demo ship as a short Cephas post. Reinforces "the thermometer is real." Do NOT name the recipient publicly unless they agree.

---

## RISKS / OPEN QUESTIONS

1. **Surface Linux driver gaps** — specifically touch + suspend/resume. The live-boot step (Stage 3b) is the go/no-go checkpoint. If suspend/resume fails, ship with a note; if touch fails, ship with a note; if WiFi fails, don't ship (blocker).
2. **Who receives it?** B111 closeout says "default Scholz." Founder's B112 prompt says "Red Carpet physical ship" without naming. Confirm recipient before printing the README or the letter.
3. **Ship timing vs. Eyewitness Program launch.** Physical ship won't land in recipient hands by Apr 26–27. The public launch goes ahead without the physical ship being a prerequisite. The physical ship is a standalone high-conversion gesture.
4. **Which package version at ship time?** Depends on whether K424 merges before ship. If yes, v0.2.0. If no, v0.1.0-alpha is fine — the demo script only needs the preload + the benchmark data.
5. **Backup verification** — Stage 1a `chkimg` is a hard gate. If it fails, do not wipe.

---

## READY FOR

- **Founder confirmation of recipient** (Scholz default per B111, or redirect)
- **Founder action:** external SSD procurement if needed (Stage 1a)
- **Founder action:** Windows product key + BitLocker recovery key capture (Stage 1d)
- **Bishop drafts**: printed one-pager letter to accompany the ship (Stage 5b) once recipient is confirmed — pairs with the Crown Letter already in flight for that recipient

---

*Saved B112, April 21, 2026. Xubuntu per Founder B112 prompt. Ventoy + LUKS + Librarian v0.2.0-ready pipeline. Bishop (Claude Opus 4.7, 1M context).*
