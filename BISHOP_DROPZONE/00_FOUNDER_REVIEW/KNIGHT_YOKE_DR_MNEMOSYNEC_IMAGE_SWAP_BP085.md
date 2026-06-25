# KNIGHT YOKE — Dr. MnemosyneC Image Swap · BP085
**Composed by Bishop · 2026-06-18 · Dropzone: 00_FOUNDER_REVIEW**

---

## PREAMBLE — SONNET 4.6 MANDATE (BP084 CANON · VERBATIM)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## BP085 BLOOD — SECRET HYGIENE

NEVER expose, echo, copy, show, pipe, log, or print any API key, secret key, Firebase token, service account credential, or any value from `C:\Users\Administrator\.claude\state\secrets\22May2026.env`. PATH is referable — CONTENTS are blood-statute forbidden. If any SEG touches Firebase CLI (deploy), it uses already-authenticated CLI state. No credential values in yoke returns, no credential values in logs. BP085 §14 BLOOD.

---

## BP085 §14 · §15 · §16 BLOOD LINES

- **§14 BLOOD** — Secret hygiene absolute. Zero credential exposure across all 4 SEGs and all yoke returns.
- **§15 BLOOD** — Truth-Always: backup old image BEFORE overwriting. Never destroy a creation. The clipped-ear Dr. MnemosyneC is Founder's prior work — preserve it with dated backup filename.
- **§16 BLOOD** — Do NOT touch publish drafts. Do NOT touch non-Dr.M assets. Surgical scope only.

---

## CONTEXT

Founder direct BP085: replace the Dr. MnemosyneC™ image across all sites.

- **Problem**: Current deployed image has a clipped-ear artifact.
- **Corrected source**: `C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png` (869×869 PNG · 190KB)
- **Sites in scope**: mnemosynec.ai · mnemosynec.org (same Firebase hosting target) · cerostechnology.com (if Dr.M image present) · Cephas Hugo build output
- **Strategy**: Do NOT rename files — overwrite content only. All existing HTML/Hugo references continue to resolve correctly.

**mnemosynec.org SSL NOTE**: At time of yoke composition, mnemosynec.org shows "Writing certificate" status in Firebase Console. SSL provisioning is in progress. Deploy to mnemosynec.ai proceeds immediately (already live). The corrected image will appear on mnemosynec.org automatically once SSL provisioning completes — same Firebase hosting target serves both domains. No special action required for .org.

---

## SCOPE

1. Locate every path where the Dr. MnemosyneC image lives across the Cephas Hugo repo and any staged site assets.
2. Backup old image(s) with dated suffix before overwrite.
3. Copy corrected image to every discovered path, verify SHA256 match.
4. Hugo build + Firebase deploy.
5. Live verify 5 Sharps GREEN.

**Out of scope**: any asset that is NOT the Dr. MnemosyneC image · any publish drafts · any config or code file.

---

## SEG-1 — Recon: Locate All Dr. MnemosyneC Image Instances

**Model**: Sonnet 4.6
**Context budget**: low — file system scan only

### Instructions

Glob the Cephas Hugo repo and all known asset directories for every filename variant of the Dr. MnemosyneC image. Report every match with full absolute path and file size in bytes.

**Primary repo root to scan**:
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\
```

**Glob patterns to run** (run all, report all matches):
- `**/dr_mnemosynec*`
- `**/Dr.Mnemosynec*`
- `**/Dr_Mnemosynec*`
- `**/mnemosynec*.png`
- `**/mnemo*.png`
- `**/dr-mnemosynec*`
- `**/drmnemosynec*`

**Subdirectories to check explicitly** (in addition to glob):
- `static/img/`
- `static/images/`
- `assets/img/`
- `assets/images/`
- `content/img/`
- `content-mnemosynec/img/`
- `themes/PaperMod/static/`
- `public/` (Hugo build output — if present)

**Also scan** for cerostechnology reference:
- Search for any file named `cerostechnology.html` or staged cerostechnology assets in the repo
- If found, grep for `img` tags referencing Dr.M filenames

**Deliverable from SEG-1**:
```
RECON RESULTS:
- PATH: <absolute path> | SIZE: <bytes> | FILENAME: <filename>
- PATH: <absolute path> | SIZE: <bytes> | FILENAME: <filename>
...
FILENAME VARIANTS FOUND: [list]
CEROSTECHNOLOGY Dr.M reference: [YES path / NO]
```

---

## SEG-2 — Copy Corrected Image · Backup Old · Verify SHA256

**Model**: Sonnet 4.6
**Depends on**: SEG-1 RECON RESULTS
**Context budget**: low — file operations only

### Instructions

For EACH path returned by SEG-1:

**Step A — Backup**
Copy the existing file to a backup alongside it:
```
<original_path_without_extension>_clipped_ear_backup_2026-06-18.png
```
Example: if original is `static/img/dr_mnemosynec.png`, backup is `static/img/dr_mnemosynec_clipped_ear_backup_2026-06-18.png`.

**Step B — Overwrite**
Copy the corrected source image to the original path:
```
Source: C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png
Destination: <original_path> (overwrite)
```

**Step C — SHA256 Verify**
Compute SHA256 of:
1. `C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png` (source)
2. `<destination_path>` (just written)

Confirm hashes match. If mismatch → HALT, report RED Sharp, do not proceed to SEG-3.

**PowerShell command for SHA256**:
```powershell
Get-FileHash -Algorithm SHA256 "C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png"
Get-FileHash -Algorithm SHA256 "<destination_path>"
```

**Deliverable from SEG-2**:
```
COPY RESULTS:
- PATH: <destination> | BACKUP: <backup_path> | SHA256_MATCH: YES/NO
...
ALL SHA256: MATCH (proceed) or MISMATCH at <path> (HALT)
```

---

## SEG-3 — Hugo Build + Firebase Deploy

**Model**: Sonnet 4.6
**Depends on**: SEG-2 ALL SHA256: MATCH
**Context budget**: medium — build + deploy

### Instructions

**Step A — Hugo Build (mnemosynec)**
```
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo --minify --config config-mnemosynec.toml
```
- Must exit 0
- If non-zero exit: HALT, report build error verbatim, do not deploy

**Step B — Verify image in build output**
After build completes, confirm the corrected image exists in `public/`:
```powershell
Get-FileHash -Algorithm SHA256 ".\public\<discovered_output_path>\<filename>"
```
Compare to source SHA256. Must match.

**Step C — Firebase Deploy**
```
firebase deploy --only hosting:mnemosyne
```
- Must exit 0
- If non-zero: HALT, report Firebase error verbatim

**Step D — cerostechnology (if applicable)**
If SEG-1 found a cerostechnology Dr.M image reference AND cerostechnology has its own deploy target:
- Run the appropriate cerostechnology deploy command
- Report which deploy target was used

**Note on mnemosynec.org**: No separate deploy needed. mnemosynec.org is the same Firebase hosting target as mnemosynec.ai. SSL provisioning ("Writing certificate" status) is in progress — image will be live on .org once SSL completes.

**Deliverable from SEG-3**:
```
BUILD: EXIT 0 / ERROR: <message>
BUILD OUTPUT SHA256 MATCH: YES/NO
DEPLOY mnemosynec.ai: EXIT 0 / ERROR: <message>
DEPLOY cerostechnology: EXIT 0 / SKIPPED (no Dr.M image found) / ERROR: <message>
```

---

## SEG-4 — Live Verify · 5 Sharps

**Model**: Sonnet 4.6
**Depends on**: SEG-3 DEPLOY EXIT 0
**Context budget**: low — HTTP checks only

### Instructions

**Sharp 1 — HTTP HEAD: image URL**
```
curl -I https://mnemosynec.ai/<discovered_image_path>
```
Expected: `HTTP/2 200` + `content-type: image/png`
Result: GREEN / RED

**Sharp 2 — Content-Length matches source**
From the HEAD response, check `content-length` matches the deployed file size (190KB ± small minification variance — PNG is binary, should be exact 190KB or very close).
Result: GREEN / RED

**Sharp 3 — Homepage references correct image path**
```
curl -s https://mnemosynec.ai/ | grep -i "dr"
```
or grep for the image filename. Confirm the homepage HTML references the Dr.M image at the expected path.
Result: GREEN / RED

**Sharp 4 — Download byte-verify (optional but preferred)**
Download the live image:
```
curl -o dr_mnemosynec_live.png https://mnemosynec.ai/<image_path>
Get-FileHash -Algorithm SHA256 dr_mnemosynec_live.png
```
Compare SHA256 to source. Proves CDN is serving the corrected image, not a cached old version.
Result: GREEN / RED (or SKIPPED with note if CDN cache delay expected)

**Sharp 5 — No 404s on related pages**
Curl at least one additional page that displays Dr. MnemosyneC (e.g., /about/ or /download/ if she appears there). Confirm HTTP 200 and image reference present.
Result: GREEN / RED

**Deliverable from SEG-4**:
```
Sharp 1 — HTTP 200 + image/png: GREEN / RED
Sharp 2 — Content-Length match: GREEN / RED
Sharp 3 — Homepage image reference: GREEN / RED
Sharp 4 — SHA256 byte-verify: GREEN / RED / SKIPPED
Sharp 5 — Related page 200: GREEN / RED

ALL 5 SHARPS: GREEN ✓ / RED at Sharp N — <details>
```

---

## YOKE RETURN FORMAT

Knight returns:
```
Sonnet 4.6

SEG-1 RECON: <summary — N paths found, filename variants>
SEG-2 COPY: <N paths overwritten, all SHA256 MATCH>
SEG-3 BUILD+DEPLOY: <Hugo exit 0 · Firebase exit 0>
SEG-4 SHARPS: <5/5 GREEN or N/5 GREEN — details>

mnemosynec.org SSL: Provisioning in progress at deploy time — image will appear on .org once SSL completes. No action needed.

BP085 §14 §15 §16: HONORED — zero credential exposure · old image backed up at <backup_path> · no non-Dr.M assets touched · no publish drafts touched.
```

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read your full yoke at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_DR_MNEMOSYNEC_IMAGE_SWAP_BP085.md

BP085 task: Swap the Dr. MnemosyneC image (clipped-ear artifact → corrected 869×869 version) across mnemosynec.ai, mnemosynec.org (same Firebase target), cerostechnology.com (if present), and Cephas Hugo build output.

Source image: C:\Users\Administrator\Pictures\Newest\Dr.Mnemosynec.png (869×869 · 190KB)

4 SEGs: SEG-1 Recon → SEG-2 Backup+Copy+SHA256 → SEG-3 Hugo build+Firebase deploy → SEG-4 5 Sharps live verify.

BP085 §14 §15 §16 BLOOD: zero credential exposure · backup old image before overwrite · do not touch any non-Dr.M assets · do not touch publish drafts.

mnemosynec.org SSL note: "Writing certificate" status at deploy time — same Firebase target, will go live on .org once SSL completes. No separate action needed.

Estimated runtime: 15-25 minutes.
```

---

*Composed by Bishop · BP085 · 2026-06-18*
*Composes with: [[reference-amnesia-substrate-cure-dr-mnemosynec-canon]] · [[feedback-knight-yoke-prompts-to-md-file-bp081]] · BP081 BLOOD*
