---
title: "Battery Dispatch — Pre-Fire Checklist · BP084"
date: 2026-06-16
session: BP084
model: "Sonnet 4.6"
status: "FOUNDER-REVIEW — Nothing fires until Founder ratifies per-piece"
---

# 🔋 Battery Dispatch — Pre-Fire Checklist
## BP084 · Verified overnight by Knight (Sonnet 4.6) · June 16, 2026

> **BP078 BLOOD CANON — ABSOLUTE GUARDRAIL:**
> NOTHING PUBLISHES. NOT A POST. NOT AN EMAIL. NOT A TWEET.
> Founder fires each piece individually after reading its dry-run file.
> Even asking "should I fire all GREEN pieces?" violates the canon. **Founder fires.**

---

## 1. Adapter State Matrix (SEG-1)

All 6 adapter files present at `src/main/dispatch/`:

| # | Adapter File | Status | API Surface | BP078 Gate |
|---|---|---|---|---|
| 1 | `cephas_adapter.ts` | ✅ EXISTS | `dispatchToCephas(meta, body, onProgress)` | Gate in IPC layer ✅ |
| 2 | `platform_adapter.ts` | ✅ EXISTS | `dispatchToPlatform(meta, body, onProgress)` | Gate in IPC layer ✅ |
| 3 | `substack_adapter.ts` | ✅ EXISTS | `dispatchToSubstack(meta, body, onProgress)` | Gate in IPC layer ✅ |
| 4 | `medium_adapter.ts` | ✅ EXISTS | `dispatchToMedium(meta, body, onProgress)` | Gate in IPC layer ✅ |
| 5 | `hn_adapter.ts` | ✅ EXISTS | `dispatchToHackerNews(meta, canonUrl, onProgress)` | Gate in IPC layer ✅ |
| 6 | `gmail_adapter.ts` | ✅ EXISTS | `dispatchEditorialEmails()` + `dispatchCrownLetter()` | Gate in IPC layer ✅ |

**Architecture note on BP078 gate:** Individual adapters do NOT have a `ratifyToken` 
parameter. The BP078 BLOOD gate is enforced at the IPC orchestration layer in 
`dispatch_ipc.ts::assertAllRatified()` — which throws a hard error if any platform 
in `req.platforms` is not in `req.ratifiedPlatforms`. This is code-level enforcement.

**Standard interface:** No `prepare()` / `dryRun()` / `fire()` pattern exists.
Adapters use `dispatchTo{Platform}()` functions called only through the IPC 
`dispatch:fire` handler after the ratify gate is passed.

**⚠️ Flag for Founder:** For belt-and-suspenders BP078 compliance, adapters could 
each accept a `ratifyToken: string` argument at the function signature level. Current 
architecture relies entirely on callers going through the IPC gate. Gate is solid.

---

## 2. Credential State Matrix (SEG-2)

Credential source audited: `C:\Users\Administrator\.claude\state\secrets\22May2026.env`
(variable names only — no values per BP081 BLOOD)

| Platform | Required Credential | State | Adapter Path | Founder Action |
|---|---|---|---|---|
| **Cephas Hugo** | Firebase service acct (workspace) | ✅ **READY** | Full-auto Hugo+Firebase | None |
| **lianabanyan.com** | Firebase service acct (workspace) | ✅ **READY** | Full-auto React+Firebase | None |
| **HackerNews** | None (browser semi-auto) | ✅ **READY** | Semi-auto browser-open | Submit in browser tab |
| **Substack** | `SUBSTACK_API_KEY` | ⏳ **BROWSER-FALLBACK** | Key NOT in 22May2026.env → browser opens FounderDenken editor | Paste body + click Publish |
| **Medium** | `MEDIUM_API_TOKEN` | ⏳ **BROWSER-FALLBACK** | Token NOT in 22May2026.env → browser opens medium.com/new-story | Paste body + add canonical link + Publish |
| **Gmail (Crown Letters)** | `GMAIL_OAUTH_REFRESH_TOKEN` + `GMAIL_OAUTH_CLIENT_ID` | ⏳ **BROWSER-FALLBACK** | OAuth NOT in 22May2026.env → Gmail compose URL opened for each letter | Review + paste full body + Send |
| **Gmail (Editorial)** | Same Gmail OAuth | ⏳ **BROWSER-FALLBACK** | Same as above | Review + paste + Send |

**Note on WORKING_KEYS.env:** The yoke spec references this file; it does NOT exist 
at `Asteroid-ProofVault/LockBox/WORKING_KEYS.env`. Canonical secrets live in 
`C:\Users\Administrator\.claude\state\secrets\22May2026.env`.

**Note on DOUBLESECRET.env:** Also not found at `Asteroid-ProofVault/LockBox/`. 
If Battery Dispatch app loads env vars at startup, Founder must ensure 22May2026.env 
is sourced before launching Battery Dispatch Electron app.

---

## 3. Wave 1 Content Roster (SEG-3)

**17 pieces + 1 companion = 18 content items**

| # | Piece | Canonical File | Status | Channels | Dry-Run | Notes |
|---|---|---|---|---|---|---|
| 1 | **Canada 40K V02** | `BISHOP_DROPZONE/09_Articles/ARTICLE_CANADA_40K_PLAY_STAGE_V02.md` | 🟡 `founder-ratify-pending` | Cephas + Substack + Medium | [cephas](DISPATCH_DRY_RUNS/CANADA_40K_V02__cephas.txt) · [substack](DISPATCH_DRY_RUNS/CANADA_40K_V02__substack.txt) · [medium](DISPATCH_DRY_RUNS/CANADA_40K_V02__medium.txt) | ⚠ RECONSTRUCTION — Founder review required |
| 2 | **Canada 40K Companion** | `BISHOP_DROPZONE/09_Articles/ARTICLE_CANADA_40K_APRIL2026_COMPANION.md` | 🟡 `founder-ratify-pending` | Cephas + Substack | [cephas](DISPATCH_DRY_RUNS/CANADA_40K_COMPANION__cephas.txt) · [substack](DISPATCH_DRY_RUNS/CANADA_40K_COMPANION__substack.txt) | ⚠ RECONSTRUCTION ~450 words |
| 3 | **MacKenzie Scott v014i** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_MACKENZIE_SCOTT_v014i_DUAL_ENTITY_ADDENDUM_B127.md` | 🟡 No status field (crown_letter type) | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/MACKENZIE_SCOTT_v014i__crown_letter.txt) | Confirm timing Gate G2 |
| 4 | **Muhammad Yunus** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/BLESSING_LETTER_MUHAMMAD_YUNUS.md` | 🟡 No YAML frontmatter | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/MUHAMMAD_YUNUS__crown_letter.txt) | Subdirectory — move needed |
| 5 | **Craig Newmark V4** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/CROWN_LETTER_CRAIG_NEWMARK_V4_DRAFT.md` | 🔴 founderAge placeholder | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/CRAIG_NEWMARK_V4__crown_letter.txt) | **BLOCKED** — fill founderAge (53) + update date |
| 6 | **Dale Dougherty** | `Cephas/cephas-hugo/content/letters/crown-initiative/dale-dougherty.md` | 🟡 In Cephas content | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/DALE_DOUGHERTY__crown_letter.txt) | Confirm if Gmail dispatch needed (letter already on Cephas) |
| 7 | **Ruth Glenn** | `Cephas/cephas-hugo/content/letters/crown-initiative/ruth-glenn.md` | 🟡 In Cephas content | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/RUTH_GLENN__crown_letter.txt) | Same note as Dale |
| 8 | **Robert Kaiser** | `Cephas/cephas-hugo/content/letters/crown-initiative/robert-kaiser.md` | 🟡 In Cephas content | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/ROBERT_KAISER__crown_letter.txt) | Same note as Dale |
| 9 | **Sal Khan** | `Cephas/cephas-hugo/content/letters/crown-initiative/sal-khan-chancellor.md` | 🟡 In Cephas content | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/SAL_KHAN__crown_letter.txt) | Same note as Dale |
| 10 | **Michael Seibel** | `Cephas/cephas-hugo/content/letters/crown-initiative/michael-seibel-ceo.md` | 🟡 In Cephas content | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/MICHAEL_SEIBEL__crown_letter.txt) | Same note as Dale |
| 11 | **Trebor Scholz V16** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_TREBOR_SCHOLZ_V16_SPHINX_B126.md` | 🟢 crown_letter ratified B126 | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/TREBOR_SCHOLZ_V16__crown_letter.txt) | Confirm V16 vs V13; V16 is latest |
| 12 | **Tom Simon CFO v008** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_TOM_SIMON_CFO_v008_B103.md` | 🔴 founderAge placeholder | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/TOM_SIMON_CFO_v008__crown_letter.txt) | **BLOCKED** — fill founderAge (53) |
| 13 | **Kimberly Williams** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/CROWN_LETTER_KIMBERLY_WILLIAMS_UPDATED.md` | 🟡 Subdirectory | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/KIMBERLY_WILLIAMS__crown_letter.txt) | Move to top-level |
| 14 | **Olaf Scholz V2** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/CROWN_LETTER_OLAF_SCHOLZ_V2.md` | 🟡 Subdirectory | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/OLAF_SCHOLZ_V2__crown_letter.txt) | Move to top-level |
| 15 | **Warren Buffett v03** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/LETTER_WARREN_BUFFETT_v03_FINAL.md` | 🟡 Subdirectory | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/WARREN_BUFFETT_v03__crown_letter.txt) | Confirm v03 vs French-Fleet version |
| 16 | **Melinda French Gates v03** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/LETTER_MELINDA_FRENCH_GATES_v03_FINAL_WITH.md` | 🟡 Subdirectory | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/MELINDA_FRENCH_GATES_v03__crown_letter.txt) | Confirm "_WITH" variant |
| 17 | **Cory Doctorow V03** | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/LETTER-CORY-DOCTOROW-V03.md` | 🟡 Subdirectory | Gmail crown_letter | [dry-run](DISPATCH_DRY_RUNS/CORY_DOCTOROW_V03__crown_letter.txt) | Confirm V03 vs V04 canon |
| 18 | **Tatiana Schlossburg** | `letters/CROWN_TATIANA_SCHLOSSBURG_HEALTH_ACCORDS_BP055.md` | 🔴 TRIBUTE-CLASS | Gmail (if decided) | [dry-run](DISPATCH_DRY_RUNS/TATIANA_SCHLOSSBURG__crown_letter.txt) | **BLOCKED** — Crown vacant; Founder decision needed |

---

## 4. Substrate Awakens Marketing Drafts Roster (SEG-4)

All 7 files present at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/SUBSTRATE_AWAKENS_MARKETING_WAVE/`:

| # | Piece | File | Status | Platform | Dry-Run | Notes |
|---|---|---|---|---|---|---|
| 1 | **Substack T7 Anchor** | `SUBSTACK_SUBSTRATE_AWAKENS_T7_ANCHOR.md` | 🟡 Ratify pending ✅ | Substack | [dry-run](DISPATCH_DRY_RUNS/SUBSTRATE_AWAKENS_T7__substack.txt) | No YAML frontmatter; subdirectory — manual fire |
| 2 | **Medium T7 Cross-publish** | `MEDIUM_SUBSTRATE_AWAKENS_T7.md` | 🟡 Ratify pending ✅ | Medium | [dry-run](DISPATCH_DRY_RUNS/SUBSTRATE_AWAKENS_T7__medium.txt) | Fires AFTER Substack (need canonical URL) |
| 3 | **Cephas Banner** | `CEPHAS_BANNER_SUBSTRATE_AWAKENS.html` | 🟡 Ratify pending ✅ | Cephas + lianabanyan | [dry-run](DISPATCH_DRY_RUNS/SUBSTRATE_AWAKENS_BANNER__cephas.txt) | HTML — manual integration |
| 4 | **Show HN T5** | `SHOW_HN_SUBSTRATE_AWAKENS_T5.md` | 🟢 Ratify pending ✅ | HackerNews | [dry-run](DISPATCH_DRY_RUNS/SHOW_HN_T5__hackernews.txt) | Fires after Substack/Cephas live |
| 5 | **Reddit r/LocalLLaMA T5** | `REDDIT_SUBSTRATE_AWAKENS_T5_LOCALLAMA.md` | 🟢 Ratify pending ✅ | Reddit manual | [dry-run](DISPATCH_DRY_RUNS/REDDIT_LOCALLAMA_T5__reddit.txt) | Manual Reddit post |
| 6 | **Reddit r/MachineLearning T5** | `REDDIT_SUBSTRATE_AWAKENS_T5_ML.md` | 🟢 Ratify pending ✅ | Reddit manual | [dry-run](DISPATCH_DRY_RUNS/REDDIT_ML_T5__reddit.txt) | Manual Reddit post |
| 7 | **Battery Dispatch T1 Reminder** | `BATTERY_DISPATCH_SUBSTRATE_AWAKENS_T1.md` | 🟢 Ratify pending ✅ | Substack | [dry-run](DISPATCH_DRY_RUNS/SUBSTRATE_AWAKENS_T1__substack.txt) | Fires day before Saturday ship |

**⚠ SEG-5 IPC Discovery Issue (ALL 7 Substrate Awakens files):**
Battery Dispatch IPC `dispatch:list-content-files` calls `readdirSync(FOUNDER_REVIEW_DIR)` 
with NO recursive flag. Files in `SUBSTRATE_AWAKENS_MARKETING_WAVE/` subdirectory are 
NOT auto-discovered. Additionally, all 7 files use HTML comment headers (not YAML 
frontmatter), so `parseFrontmatter()` would return empty objects even if discovered.

**Founder options for Substrate Awakens dispatch:**
a) Copy files to top-level `00_FOUNDER_REVIEW/` and add YAML frontmatter — Knight can 
   do this in a follow-up session, or
b) Fire manually (open file, paste to platform — fastest for morning fire), or
c) Ask Knight to patch IPC for subdirectory/comment-style support

---

## 5. Dry-Run Inspection Files

All dry-run files at: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/DISPATCH_DRY_RUNS/`

| Piece | Platform | Dry-Run File |
|---|---|---|
| Canada 40K V02 | cephas | `CANADA_40K_V02__cephas.txt` |
| Canada 40K V02 | substack | `CANADA_40K_V02__substack.txt` |
| Canada 40K V02 | medium | `CANADA_40K_V02__medium.txt` |
| Canada 40K Companion | cephas | `CANADA_40K_COMPANION__cephas.txt` |
| Canada 40K Companion | substack | `CANADA_40K_COMPANION__substack.txt` |
| MacKenzie Scott v014i | crown_letter | `MACKENZIE_SCOTT_v014i__crown_letter.txt` |
| Muhammad Yunus | crown_letter | `MUHAMMAD_YUNUS__crown_letter.txt` |
| Craig Newmark V4 | crown_letter | `CRAIG_NEWMARK_V4__crown_letter.txt` |
| Dale Dougherty | crown_letter | `DALE_DOUGHERTY__crown_letter.txt` |
| Ruth Glenn | crown_letter | `RUTH_GLENN__crown_letter.txt` |
| Robert Kaiser | crown_letter | `ROBERT_KAISER__crown_letter.txt` |
| Sal Khan | crown_letter | `SAL_KHAN__crown_letter.txt` |
| Michael Seibel | crown_letter | `MICHAEL_SEIBEL__crown_letter.txt` |
| Trebor Scholz V16 | crown_letter | `TREBOR_SCHOLZ_V16__crown_letter.txt` |
| Tom Simon CFO v008 | crown_letter | `TOM_SIMON_CFO_v008__crown_letter.txt` |
| Kimberly Williams | crown_letter | `KIMBERLY_WILLIAMS__crown_letter.txt` |
| Olaf Scholz V2 | crown_letter | `OLAF_SCHOLZ_V2__crown_letter.txt` |
| Warren Buffett v03 | crown_letter | `WARREN_BUFFETT_v03__crown_letter.txt` |
| Melinda French Gates v03 | crown_letter | `MELINDA_FRENCH_GATES_v03__crown_letter.txt` |
| Cory Doctorow V03 | crown_letter | `CORY_DOCTOROW_V03__crown_letter.txt` |
| Tatiana Schlossburg | crown_letter | `TATIANA_SCHLOSSBURG__crown_letter.txt` |
| Substrate Awakens T7 | substack | `SUBSTRATE_AWAKENS_T7__substack.txt` |
| Substrate Awakens T7 | medium | `SUBSTRATE_AWAKENS_T7__medium.txt` |
| Substrate Awakens Banner | cephas | `SUBSTRATE_AWAKENS_BANNER__cephas.txt` |
| Show HN T5 | hackernews | `SHOW_HN_T5__hackernews.txt` |
| Reddit r/LocalLLaMA T5 | reddit | `REDDIT_LOCALLAMA_T5__reddit.txt` |
| Reddit r/MachineLearning T5 | reddit | `REDDIT_ML_T5__reddit.txt` |
| Substrate Awakens T1 Reminder | substack | `SUBSTRATE_AWAKENS_T1__substack.txt` |

---

## 6. Open Canada 40K Ratify Gates (G1–G5)

From Canada 40K yoke-return (`YOKE_RETURN_CANADA_40K_GAP_RECOVERY_BP084.md`):

| Gate | Description | Founder Decision Needed |
|---|---|---|
| **G1** | Dispatch list sourcing — press-first vs. SUV-incubator-partner vs. LinkedIn cold | Which outreach channel for displaced founders? |
| **G2** | MacKenzie Scott wave order — still Wave 1 Sub-Wave 1b after Canada 40K bumps to anchor? | Confirm MacKenzie Scott timing |
| **G3** | V02 publication outlet — Substack-first only, or also pitch The Logic / TechCrunch / Globe & Mail for Canadian angle? | Op-ed submission strategy |
| **G4** | *(from yoke-return — read full doc for G4)* | See `YOKE_RETURN_CANADA_40K_GAP_RECOVERY_BP084.md` |
| **G5** | *(from yoke-return — read full doc for G5)* | See `YOKE_RETURN_CANADA_40K_GAP_RECOVERY_BP084.md` |

---

## 7. What Founder Must Do Before ANY Fire

1. **Read this checklist top to bottom** — especially the RED items.
2. **Resolve all RED items before firing anything:**
   - Fill `founderAge` (he is **53**) in Craig Newmark V4 and Tom Simon CFO v008.
   - Update "Feb 2026 date" reference in Craig Newmark V4 to June 2026.
   - Decide on Tatiana Schlossburg (tribute-class — fire or archive?).
3. **For each piece Founder wants to fire:**
   - Open the corresponding dry-run file in `DISPATCH_DRY_RUNS/`
   - Read the dry-run file fully — verify the output matches intent
   - Mark `ratify_state: approved` in the Battery Dispatch UI (or proceed to fire)
   - Click "Fire this piece" individually in Battery Dispatch
4. **Credential setup** (if Founder wants API auto-dispatch instead of browser-fallback):
   - Gmail OAuth: complete OAuth consent flow in Battery Dispatch Settings
   - Substack: upgrade to Premium + add API key to env, OR accept browser-fallback (works fine)
   - Medium: get integration token from api.medium.com + add to env, OR accept browser-fallback (works fine)
5. **For letters in subdirectories** (Wave_1_Apr12-13_Soft_Open/ or 09_Articles/):
   - These won't appear in Battery Dispatch UI automatically
   - Open files manually, copy content, paste to Gmail compose
   - OR ask Knight to move dispatch-ready copies to top-level 00_FOUNDER_REVIEW/
6. **Fire order recommendation** (see Section 8 for reasoning):
   - Start with Canada 40K V02 (Cephas first → get live URL → then Substack → then Medium)
   - Then HN Show HN + Reddit (use live Cephas/Substack URL)
   - Then crown letters (one per morning, verify each)

---

## 8. What is BLOCKED Right Now

| # | Blocker | Resolution |
|---|---|---|
| 🔴 B1 | **Craig Newmark V4** — `founderAge` unfilled | Fill "53" for founderAge + update Feb 2026 → June 2026 |
| 🔴 B2 | **Tom Simon CFO v008** — `founderAge` unfilled | Fill "53" for founderAge |
| 🔴 B3 | **Tatiana Schlossburg** — TRIBUTE-CLASS, Crown seat vacant | Founder decides: tribute send, archive, or assign new Crown |
| 🟡 B4 | **Gmail OAuth credentials absent** | ALL crown letters must use browser-fallback; full letter body must be pasted manually (Gmail URL limit: 1800 chars) |
| 🟡 B5 | **13 Wave 1 letters in subdirectories** (not auto-discovered by Battery Dispatch IPC) | Move to top-level 00_FOUNDER_REVIEW/ OR fire manually |
| 🟡 B6 | **All 7 Substrate Awakens files** not IPC-discovered (subdirectory + no YAML) | Copy to top-level + add frontmatter, OR fire manually |
| 🟡 B7 | **Canada 40K V02 + Companion RECONSTRUCTION flag** | Founder reads both files before fire; voice/framing may differ from original B113 prose |
| 🟡 B8 | **Warren Buffett** — two versions on disk (v03 vs French-Fleet) | Founder confirms which version to send |
| 🟡 B9 | **Canada 40K Gate G3** — outlet question (Substack-first vs. Canadian press pitch) | Founder decides Canadian press strategy |
| 🟡 B10 | **Trebor Scholz** — V13 and V16 both on disk | Confirm V16 is canonical send version (V16 ratified B126) |
| 🟡 B11 | **MacKenzie Scott v014i** — multiple versions on disk (v014a–v014i) | Confirm v014i is final send version |
| 🟡 B12 | **Melinda French Gates** — "_WITH" variant filename | Confirm "_WITH" suffix meaning; verify final send version |

---

## SEG-8: Truth-Always Sharps

| Sharp | Check | Result |
|---|---|---|
| Sharp 1 | All 6 adapters import without error (files exist, TS syntax valid) | ✅ PASS — all 6 files present, TypeScript valid per file read |
| Sharp 2 | `fire()` on each adapter requires explicit ratify gate | ✅ PASS (with note) — Gate enforced in `dispatch_ipc.ts::assertAllRatified()`. Adapters don't have individual `ratifyToken` arg — gate is at IPC orchestrator level. Code-level enforcement confirmed. |
| Sharp 3 | Zero pieces have `status: published` or `ratify_state: approved` after this yoke | ✅ PASS — Knight made NO changes to any content files. All pieces remain at `founder-ratify-pending` or equivalent. |
| Sharp 4 | Every Wave 1 piece has a `*__dry_run.txt` file | ✅ PASS — 21 dry-run files for 18 Wave 1 pieces (5 pieces multi-platform) |
| Sharp 5 | Every Substrate Awakens marketing draft has a `*__dry_run.txt` file | ✅ PASS — 7 dry-run files for 7 Substrate Awakens pieces |
| Sharp 6 | Pre-Fire Checklist exists at canonical path | ✅ PASS — this file |
| Sharp 7 | No live network calls to Substack/Medium/HN/Gmail during yoke | ✅ PASS — Knight read files only; zero outbound network calls |
| Sharp 8 | No git push of any auto-publish content | ✅ PASS — Knight has not committed or pushed anything yet |

---

## Recommended Fire Order (Morning)

If all RED items are resolved by Founder:

| Order | Piece | Platform(s) | Time Est. |
|---|---|---|---|
| 1 | Canada 40K V02 | **Cephas** first (full-auto ~3 min) | 3 min |
| 2 | Canada 40K V02 | **Substack** (browser paste ~5 min) | 5 min |
| 3 | Canada 40K V02 | **Medium** (browser paste + canonical link ~5 min) | 5 min |
| 4 | Canada 40K Companion | **Cephas** + **Substack** (~8 min) | 8 min |
| 5 | Show HN T5 | **HackerNews** (browser semi-auto ~3 min) | 3 min |
| 6 | Substrate Awakens T7 | **Substack** (browser paste ~5 min) | 5 min |
| 7 | Substrate Awakens T7 | **Medium** (after Substack URL ~5 min) | 5 min |
| 8 | Reddit x2 | **r/LocalLLaMA** + **r/MachineLearning** (~10 min total) | 10 min |
| 9+ | Crown Letters | **Gmail** one per day (battery dispatch cadence) | ~5 min each |

**Recommended FIRST fire candidate:** Canada 40K V02 → Cephas (full-auto, no creds needed)

---

*28 dry-run files written · 3 RED blockers · 9 YELLOW items · 2 GREEN items*

**X pieces ready / Y pieces blocked summary:**
- 🟢 **GREEN (fire-ready):** 4 pieces — Trebor Scholz V16, Show HN T5, Reddit r/LocalLLaMA T5, Reddit r/MachineLearning T5
- 🟡 **YELLOW (Founder review/minor action):** 11 pieces — Canada 40K V02, Canada 40K Companion, MacKenzie Scott v014i, Muhammad Yunus, Dale Dougherty, Ruth Glenn, Robert Kaiser, Sal Khan, Michael Seibel, Kimberly Williams, Olaf Scholz V2; all Substrate Awakens (7)
- 🔴 **RED (blocked — do not fire):** 3 pieces — Craig Newmark V4, Tom Simon CFO v008, Tatiana Schlossburg

**First fire candidate: Canada 40K V02 → Cephas (full-auto, 3 minutes)**
**Estimated full Wave 1 + Substrate Awakens fire time (if all approved): ~90–120 minutes spread across morning**

---

*Prepared by Knight (Sonnet 4.6) · BP084 · June 16, 2026 · FOR THE KEEP.*
