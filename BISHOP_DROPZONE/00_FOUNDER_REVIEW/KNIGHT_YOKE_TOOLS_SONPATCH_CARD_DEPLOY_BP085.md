# KNIGHT YOKE · /tools/ SONPATCH CARD DEPLOY · BP085
## P0 — SonPatch.exe live at URL but not shown on /tools/ page

---

### PREAMBLE (VERBATIM BP084 CANON — READ BEFORE ANY ACTION)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

### SITUATION BRIEF

`mnemosynec.ai/tools/SonPatch.exe` — HEAD 200, binary live. But `mnemosynec.ai/tools/` index page shows NO SonPatch card. Page only shows Plow CLI bundles. An earlier SEG created `content/tools/_index.md` with a SonPatch card — but either the Hugo build did not run, the deploy did not happen, or the file was overwritten.

Fix is: verify the content file exists with the correct card, Hugo build, Firebase deploy, live verify.

Estimated Knight runtime: **10–20 minutes**

---

### SCOPE

Ensure `mnemosynec.ai/tools/` page renders a SonPatch card with three download links (`.exe`, `.ps1`, `.sha256`) and "Right-click → Run as Administrator" install instruction. Hugo build + Firebase deploy + live curl verify.

---

### SEG-1 · Verify or restore content file

**Task:** Confirm the SonPatch card exists in the Hugo content source. Restore if missing.

**Actions:**
1. Locate the correct Hugo content directory for mnemosynec. Try in order:
   - `Cephas/cephas-hugo/content-mnemosynec/tools/_index.md`
   - `Cephas/cephas-hugo/content/tools/_index.md`
   - `platform/cephas/content-mnemosynec/tools/_index.md`
   - Any path matching `*/content*mnemosynec*/tools/_index.md`

2. Read the file if found. Confirm it contains a SonPatch card block. The correct content should include:
   - Card title: **SonPatch**
   - Three download links:
     - `/tools/SonPatch.exe`
     - `/tools/SonPatch.ps1`
     - `/tools/SonPatch.exe.sha256`
   - Install instruction: "Right-click → Run as Administrator"
   - Brief description (one sentence is sufficient: "Patches MnemosyneC to the latest version without a full reinstall.")

3. If the file is MISSING or the SonPatch block is ABSENT, create/restore it. Minimal card frontmatter + content example:

```markdown
---
title: "Tools"
---

## SonPatch

Patches MnemosyneC to the latest version without a full reinstall.

| File | Link |
|------|------|
| Windows Installer (.exe) | [SonPatch.exe](/tools/SonPatch.exe) |
| PowerShell Script (.ps1) | [SonPatch.ps1](/tools/SonPatch.ps1) |
| SHA-256 Checksum | [SonPatch.exe.sha256](/tools/SonPatch.exe.sha256) |

**Install:** Right-click SonPatch.exe → Run as Administrator
```

Preserve any existing content (Plow CLI cards) above or below — do NOT overwrite the whole file if it already has other cards. Append or insert the SonPatch block only.

4. If file path is ambiguous (multiple `tools/_index.md` candidates), read the Hugo config (`config-mnemosynec.toml` or `config.toml`) to confirm which `contentDir` is used for the mnemosynec build.

**Sharp-1 return:** Absolute path of the content file · whether it existed (with/without SonPatch block) or was created · final state of SonPatch card in the file (paste the relevant lines).

---

### SEG-2 · Hugo build

**Task:** Build the mnemosynec Hugo site with the updated content.

**Actions:**
1. Navigate to the Hugo root (where `config-mnemosynec.toml` lives — likely `Cephas/cephas-hugo/` or equivalent).
2. Run:
```bash
hugo --minify --config config-mnemosynec.toml
```
Expected: Hugo outputs build summary, 0 errors, 0 warnings (minor warnings acceptable). Exit 0.

3. If the config file name differs (e.g., `hugo-mnemosynec.toml`, `config.mnemosynec.toml`), find it first:
```bash
ls *.toml
```
4. After build, confirm `public/tools/index.html` exists and contains the string "SonPatch":
```bash
grep -i "SonPatch" public/tools/index.html
```
Expected: at least one match.

5. Truth-Always: if Hugo exits non-zero or the grep finds no match, stop and report verbatim error. Do not proceed to deploy.

**Sharp-2 return:** Hugo exit code · line count of `public/tools/index.html` · grep output confirming "SonPatch" present.

---

### SEG-3 · Firebase deploy

**Task:** Deploy the built site to Firebase Hosting (mnemosynec target).

**Actions:**
1. From the Hugo root (or project root where `.firebaserc` / `firebase.json` lives), run:
```bash
firebase deploy --only hosting:mnemosyne
```
Expected: Firebase CLI outputs deploy summary and live URL. Exit 0.

2. If the hosting target name differs (check `.firebaserc` for the exact target alias), use the correct name.
3. If not logged in: `firebase login` (interactive — may require Founder action). Note in Sharp-3 if auth is needed.
4. Confirm the deploy URL shown by Firebase matches `mnemosynec.ai`.

**Sharp-3 return:** Firebase deploy exit code · final hosting URL printed by CLI · any auth issues surfaced.

---

### SEG-4 · Live verify

**Task:** Confirm the live site shows SonPatch card and all three download URLs return 200.

**Actions:**
1. Wait 30 seconds post-deploy for CDN propagation.

2. curl the /tools/ page and grep for SonPatch:
```bash
curl -s "https://mnemosynec.ai/tools/" | grep -i "SonPatch"
```
Expected: at least one match (card title, link text, or both).

3. HEAD-check all three download URLs:
```bash
curl -sI "https://mnemosynec.ai/tools/SonPatch.exe" | head -1
curl -sI "https://mnemosynec.ai/tools/SonPatch.ps1" | head -1
curl -sI "https://mnemosynec.ai/tools/SonPatch.exe.sha256" | head -1
```
Expected: all three → `HTTP/2 200` (or `HTTP/1.1 200`).

4. Truth-Always: if any URL returns non-200, or if the grep finds no "SonPatch" on the live page, report failure verbatim. Do not mark GREEN.

Note: `.ps1` and `.sha256` files may not exist yet as static assets — if they return 404, report the 404s in Sharp-4 as a follow-on item (do NOT block the yoke for missing supplementary files if the `.exe` is 200 and the card renders). The card must render; the `.exe` must be 200. The other two are best-effort.

**Sharp-4 return:** grep output from live `/tools/` page · HEAD status for all three URLs · GREEN or RED verdict per deliverable.

---

### SHARPS RETURN TABLE

| Sharp | SEG | Deliverable | Status |
|-------|-----|-------------|--------|
| Sharp-1 | SEG-1 | Content file path + SonPatch card verified/restored | [ ] |
| Sharp-2 | SEG-2 | Hugo exit 0 + "SonPatch" in `public/tools/index.html` | [ ] |
| Sharp-3 | SEG-3 | Firebase deploy exit 0 + hosting URL confirmed | [ ] |
| Sharp-4 | SEG-4 | Live grep finds "SonPatch" · SonPatch.exe HEAD 200 | [ ] |

All 4 Sharps GREEN = yoke complete. Any RED = stop and surface honest error to Founder. Truth-Always — BP083 BLOOD.

---

### CONSTRAINTS

- Sonnet 4.6 SEGs exclusively. NEVER COMPOSER.
- Truth-Always: do not mark any Sharp GREEN if the actual result is an error, 404, or empty grep.
- Do NOT overwrite existing Plow CLI card content on the `/tools/` page — SonPatch card is an addition, not a replacement.
- NEVER SCROLL SIDEWAYS: if adding HTML/markdown, ensure no line produces horizontal overflow (BP081 BLOOD).
- $5/year plan membership not relevant here, but if any pricing copy is touched: 83.3% creator share verbatim.

---

### PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read this yoke file in full before acting:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_TOOLS_SONPATCH_CARD_DEPLOY_BP085.md

Task: SonPatch.exe is live at mnemosynec.ai/tools/SonPatch.exe (200 confirmed) but the /tools/ index page has no SonPatch card. Verify or restore the Hugo content file, build (hugo --minify --config config-mnemosynec.toml), deploy (firebase deploy --only hosting:mnemosyne), and live-verify the card renders + SonPatch.exe HEAD 200. 4 SEGs, 4 Sharps. Return all 4 Sharps GREEN or honest RED diagnosis. Sonnet 4.6.
```
