# ArtAssets VSS Recovery Inventory — BP086
**Shadow Copy:** `{7702fe0e-18e4-4037-b521-49507c0f63c8}`
**Shadow Creation Time:** 2026-06-03 09:05:31 AM
**Shadow Volume Path:** `\\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy4`
**SEG Model:** Sonnet 4.6
**Receipt Date:** 2026-06-18
**Mission:** Non-destructive inventory + copy from earliest VSS shadow into new restore folder

---

## §14 BLOOD GADGET RECEIPTS — All Steps Verified

### Step 1 — CURRENT ArtAssets State
- **Path:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\ArtAssets`
- **Items:** 18 (all directories, zero actual files)
- **File size:** 0 MB (0 bytes in files)
- **Top-level folders:** CeltBook (4), Celticazure (113), frames, pages, receipts, Seagrimoire, Softcastlecore (122)

### Step 2 — Shadow Path Readability
- `Get-Item -LiteralPath` on shadow path: **READABLE — YES**
- `.NET [System.IO.Directory]::Exists()`: **TRUE**
- No admin escalation required — shadow copy readable at current privilege level

### Step 3 — Destination Created + Shadow ArtAssets Inventory
- **Dest created:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\_RESTORE_VSS_2026-06-03\`
- **Dest was empty before copy:** YES (0 items confirmed)
- **SHADOW ArtAssets total items:** 18 (all directories)
- **SHADOW ArtAssets total FILES:** 0 (zero actual files)
- **SHADOW ArtAssets file size:** 0 MB

Shadow ArtAssets top-level (same structure as current):
| Folder | Last Modified |
|---|---|
| CeltBook (4) | 2026-06-02 01:45:44 AM |
| Celticazure (113) | 2026-06-02 01:45:44 AM |
| frames | 2026-04-13 04:58:11 PM |
| pages | 2026-04-13 05:12:53 PM |
| receipts | 2026-06-02 01:45:46 AM |
| Seagrimoire | 2026-06-02 01:45:46 AM |
| Softcastlecore (122) | 2026-06-02 01:45:46 AM |

**KEY FINDING:** The June 2 timestamps at 01:45–01:46 AM are the mass-wipe event. The shadow captured state AFTER the gutting, not before.

### Step 4 — Copy Operation
- **Method:** `Copy-Item -LiteralPath -Recurse` (robocopy exit 16 on `\\?\GLOBALROOT\` paths — fallback used)
- **What was copied:** Empty folder structure only (7 top-level dirs + sub-directories)
- **Destination:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\_RESTORE_VSS_2026-06-03\ArtAssets\`
- **Copied items:** 19 directory entries
- **Copied files:** 0
- **Existing production files touched:** NONE (non-destructive confirmed)

---

## DELTA ANALYSIS

### ArtAssets — Shadow vs Current
| Metric | Current | Shadow (2026-06-03) | Delta |
|---|---|---|---|
| Items | 18 | 18 | 0 |
| Files | 0 | 0 | 0 |
| Size | 0 MB | 0 MB | 0 MB |

**VERDICT: No recoverable content in this shadow for ArtAssets. The gutting happened before 2026-06-03 09:05 AM — specifically on 2026-06-02 between 01:45–01:48 AM (all affected folders share that timestamp cluster).**

---

## BONUS PEEK — Asteroid-ProofVault in Shadow

### 0 Patents Filed (shadow 2026-06-03)
- **Path:** `...\03_PATENT_BAGS\0 Patents Filed`
- **Total items:** 31 (all directories except 2 files)
- **Files:** 2 (pdf_gen_err.log 375 bytes, pdf_gen.log 0 bytes — both dated 2026-05-01)
- **PDFs:** 0
- **Patent folders present:** 20 provisional patent directories (63_925_672 through 64_073_890) — all EMPTY in shadow
- **Folder timestamps:** All show 2026-06-02 01:46 AM — same wipe event

### 0 Patents Filed — CURRENT (2026-06-18) vs Shadow
| Metric | Current | Shadow | Delta |
|---|---|---|---|
| Items | 56 | 31 | +25 |
| Files | 25 | 2 | +23 |
| Size | 26.50 MB | ~0.0004 MB | +26.5 MB |

**FINDING: The current state of `0 Patents Filed` is RICHER than the shadow. 25 files totaling 26.5 MB have been added since 2026-06-03. The shadow has LESS value here — do NOT restore it. The current live folder is more complete.**

### Asteroid-ProofVault Root (shadow 2026-06-03)
- **Total items:** 2,092
- **Files:** 157
- **Total file size:** 1,179 MB (~1.15 GB)
- **Top-level folders:** 70+ (full list in body above)
- **Notable root-level files preserved in shadow:** _prov21_base_v4.pdf, BP072 session docs, COUNSEL_BUNDLE files, SWEET16_CROWN_ROSTER, NYT_SUBMISSION_DRAFT, and more

**FINDING: The Asteroid-ProofVault shadow has 157 files / 1.18 GB — this is potentially the most valuable shadow content for recovery if any of those files are missing or degraded on current disk.**

---

## CONCLUSIONS

### ArtAssets
- **Shadow is NOT useful for ArtAssets recovery.** Gutting happened on 2026-06-02 ~01:45 AM, before the 2026-06-03 snapshot.
- To recover the original ArtAssets images (CeltBook, Celticazure 113, Softcastlecore 122, etc.), need a shadow from BEFORE 2026-06-02 01:45 AM — likely none exist given this is the earliest shadow.
- The `_RESTORE_VSS_2026-06-03\ArtAssets\` folder has been created with the empty structure only as a record.

### Worth doing for other paths/shadows?
**STRONG YES — specifically for Asteroid-ProofVault.**
- The shadow has 157 files / 1.18 GB — run a diff against current state to identify any that were lost or changed.
- Recommend: inventory current Asteroid-ProofVault file list, compare against shadow manifest, identify any files present in shadow but missing today.
- The root-level BP072 session docs, PROV_21 PDFs, and counsel packages in the shadow are worth cross-checking.
- **Do NOT restore `0 Patents Filed`** — current state is newer and more complete.

### Shadow Coverage Note
The 2026-06-03 09:05 AM shadow captures post-wipe state for ArtAssets and Patent Bags. The wipe timestamp cluster (2026-06-02 01:45–01:48 AM) appears in BOTH locations, suggesting a single automated or scripted event cleared multiple folders simultaneously. Earlier shadows (if any) would be needed to recover pre-wipe content.

---

## Restore Folder Path
`C:\Users\Administrator\Documents\LianaBanyanPlatform\_RESTORE_VSS_2026-06-03\ArtAssets\`
*(Empty folder structure only — no files recovered as shadow had none to give)*

---

*Receipt generated by Sonnet 4.6 SEG · BP086 · §14 BLOOD gadget-verified · §4 BLOOD paths only, no secrets*
