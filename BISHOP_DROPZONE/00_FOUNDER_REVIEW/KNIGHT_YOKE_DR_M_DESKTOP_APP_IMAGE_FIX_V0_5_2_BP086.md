# KNIGHT YOKE — Dr. Mnemosynec Desktop App Image Fix → v0.5.2

**Session:** BP086 · **Composed:** 2026-06-18 · **Origin:** Founder report — clipped-ear Dr.M still shipping in v0.5.1 installer on M0 + M3 despite the prior web Image Swap yoke (BP085) returning GREEN.

**Knight preamble (BP084 HARD BINDING):** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14 BLOOD · §15 BLOOD · §16 BLOOD · §4 secrets BLOOD (never echo keys; paths only).

---

## Root cause (already gadgeted — do NOT re-recon)

The BP085 Image Swap yoke fixed only the **web** mascot at `mnemosynec.ai/img/mascots/dr-mnemosynec.png`. The desktop app bundles a **separate** image at build time. v0.5.1 was cut with the stale clipped-ear file.

**Stale path (165,348 bytes — CLIPPED EAR):**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\public\icons\mnemosynec-mark.png`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\dist\renderer\icons\mnemosynec-mark.png` (build output)

**Correct source (190,364 bytes — EAR-FIXED):**
- `C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png`
- Also already present at `resources/cue-card/DrMnemosyneC.png` (same bytes)

**Build pipeline (already mapped):**
- `vite.renderer.config.ts:7` `root: './src/renderer'` → `publicDir = src/renderer/public/`
- `package.json` `build.files`: `"src/renderer/public/**/*"` + `"dist/**/*"` → both paths ship into `app.asar`

**Component refs (all relative to bundled path — no CDN):**
- `src/renderer/components/LeanHomeTab.tsx:369` `src="icons/mnemosynec-mark.png"`
- `src/renderer/components/LeanWelcomeView.tsx:396` same
- `src/renderer/components/MnemosyneTabView.tsx:825` same
- `src/renderer/components/WelcomeView.tsx:225` same

**No code changes needed.** Single file overwrite + rebuild + installer reship.

---

## SEGs (Sonnet 4.6 each)

### SEG-1 · Overwrite source image
1. Backup current stale: copy `src/renderer/public/icons/mnemosynec-mark.png` → `src/renderer/public/icons/mnemosynec-mark_clipped_ear_backup_2026-06-18.png`
2. Copy `C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png` (190,364 bytes) → `src/renderer/public/icons/mnemosynec-mark.png`
3. Verify SHA256 matches source (`9019B2F5...` start)
4. Report: old size, new size, SHA256 match

### SEG-2 · Rebuild renderer + main
1. `npm run build:renderer` (regenerates `dist/renderer/icons/mnemosynec-mark.png`)
2. `npm run build:main` (if separate step)
3. Verify `dist/renderer/icons/mnemosynec-mark.png` is now 190,364 bytes
4. Report: build exit codes, output sizes

### SEG-3 · Bump version + build installer
1. Bump `package.json` version `0.5.1` → `0.5.2`
2. Update `release-notes` or equivalent with single line: "v0.5.2 — corrected Dr. Mnemosynec mascot (clipped-ear → ear-fixed)"
3. Run `npm run dist:win` (or whichever full installer script is canonical)
4. Verify `MnemosyneC-Setup-0.5.2.exe` lands in `release/` (or equivalent)
5. Report: installer path, installer size, build exit code

### SEG-4 · Ship to web + auto-update channel
1. Copy installer to `mnemosynec.ai` static download path (per BP085 prior canon)
2. Update `latest.yml` / auto-update manifest with v0.5.2 metadata + SHA256
3. Firebase deploy hosting target `mnemosynec-lianabanyan`
4. Smoke: `Invoke-WebRequest https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.2.exe -Method Head` → confirm 200 + correct Content-Length
5. Report: live URL, HTTP status, size match

### SEG-5 · Live verify
1. Confirm `https://mnemosynec.ai/download/` UI shows v0.5.2 as LATEST
2. Confirm `latest.yml` (or equivalent) advertises v0.5.2
3. Confirm auto-update channel for v0.5.1 installs will pull v0.5.2 on next launch
4. Report: 5 Sharps GREEN/RED

---

## 5 Sharps (return as table)

| # | Sharp | Pass criteria |
|---|---|---|
| 1 | Source overwrite | `src/renderer/public/icons/mnemosynec-mark.png` = 190,364 bytes, SHA256 matches canonical |
| 2 | Build output | `dist/renderer/icons/mnemosynec-mark.png` = 190,364 bytes |
| 3 | Installer built | `MnemosyneC-Setup-0.5.2.exe` exists, build exit 0 |
| 4 | Web deploy | `mnemosynec.ai/download/MnemosyneC-Setup-0.5.2.exe` returns 200 + correct size |
| 5 | Auto-update advertised | `latest.yml` (or canonical manifest) shows v0.5.2 with correct hash |

---

## Founder action after Knight returns GREEN

Reinstall on M0 and M3 (or let auto-update fire). Verify the ear is fixed in:
- Home tab
- Welcome view
- Mnemosyne tab
- Lean welcome (first-run)

If any surface still shows clipped ear after v0.5.2 install: there's a 5th unmapped reference. Re-grep needed.

---

**Composed by Bishop BP086. Not yet dispatched. Awaiting Founder one-pass ratify per §16.**
