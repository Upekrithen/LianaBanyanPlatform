# Prov 14 Filing Manifest — TODAY Dispatch (B117)

**Target:** File provisional patent application #14 today via USPTO Patent Center.
**Fee:** $65 (micro-entity basic filing).
**Applicant:** Liana Banyan Corporation (Wyoming C-Corp, EIN 41-2797446).
**Inventor:** Jonathan Jones (sole inventor).
**Priority date goal:** 2026-04-23 (today).
**Conversion deadline:** 2027-04-23 (12 months from filing).

---

## What's filing-ready right now (13 innovations)

**Section 1 (B110 K422 inventory, Founder-greenlit, ready to file):**

| # | Title | A&A Formal Status |
|---|---|---|
| 2263 | Triple-Redundant Verification Architecture | ✓ `AA_FORMAL_2263_TRIPLE_REDUNDANT_VERIFICATION.md` |
| 2264 | Commons Licensing Dividend | ⚠️ Description in PROV_14_DRAFT.md only — file as description + dependent claims (B117 follow-on: write formal claims) |
| 2265 | Commons Admission Protocol | ⚠️ Same as 2264 |
| 2266 | Opt-In Member Documentation with Benefits | ⚠️ Same as 2264 |
| 2267 | Member-Generated Guide Corpus | ⚠️ Same as 2264 |

**Section 2 (B117 formalized this session, full claims drafted):**

| # | Title | Claims Proposed | File |
|---|---|---|---|
| 2268 | Member-Owned Scribes Cathedral | 2 ind + 7 dep | `AA_FORMAL_2268_*` |
| 2269 | Three Fates Routing Pipeline | 2 ind + 7 dep | `AA_FORMAL_2269_*` |
| 2270 | Scribes Cathedral architecture | 2 ind + 7 dep | `AA_FORMAL_2270_*` |
| 2271 | SP-21 Tidbit Scribe | 2 ind + 7 dep | `AA_FORMAL_2271_*` |
| 2272 | Cost-Slasher Claim Ladder | 2 ind + 7 dep | `AA_FORMAL_2272_*` |
| 2273 | Fingerprint Incremental Index | 2 ind + 7 dep | `AA_FORMAL_2273_*` |
| 2274 | Parallel Preload Multilingual | 2 ind + 7 dep | `AA_FORMAL_2274_*` |
| 2275 | AI Companion Vendor-Neutral Bridge | 2 ind + 7 dep | `AA_FORMAL_2275_*` |

**Total: 13 innovations, 8 with full claim drafting, 5 description-only.**
**Claims: 16 independent + 56 dependent = 72 formal claims proposed (Section 2 only).** Section 1 innovations add claim count after conversion.

Counsel practice: provisional filings allow description-only filings; claims get finalized during the 12-month conversion window. All 13 innovations ARE provisional-filing-ready. The 5 description-only Section 1 innovations simply carry their PROV_14_DRAFT.md descriptions into the provisional spec.

---

## Filing package structure

USPTO Patent Center wants one combined PDF as the "specification." Separate uploads for inventor declaration and micro-entity certification.

### Required files for upload

1. **`PROV_14_FILING_SPECIFICATION.pdf`** — compiled document containing:
   - Cover page (applicant, inventor, title, filing date)
   - Table of contents
   - Section 1: Descriptions of #2263–#2267 (from PROV_14_DRAFT.md)
   - Section 2: Full A&A Formals of #2268–#2275 (the 8 files from 12_Innovations_AA/)
   - Appendix: claim summary across all 13 innovations
2. **Inventor oath/declaration** — USPTO Form PTO/AIA/08 or PTO/AIA/01. Fill on USPTO site; print + sign + scan + upload.
3. **Micro-entity certification** — USPTO Form PTO/SB/15A. Certifies LB Corp qualifies as micro-entity (<$200K/yr gross income + <4 prior applications). Already eligible per prior filings.
4. **Assignment (optional for provisional)** — USPTO Form PTO/SB/81 assigning invention from Jonathan Jones (inventor) to Liana Banyan Corporation (applicant). Can be filed later; provisional doesn't require it today.

---

## Build the specification PDF

### Quick path (pandoc, ~5 min)

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\Prov14_Building

# Concatenate PROV_14_DRAFT + all A&A Formals in innovation-ID order, convert to PDF
$files = @(
  "PROV_14_DRAFT.md"
  "..\AA_FORMAL_2263_TRIPLE_REDUNDANT_VERIFICATION.md"
  "..\12_Innovations_AA\AA_FORMAL_2268_MEMBER_OWNED_SCRIBES_CATHEDRAL_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2269_THREE_FATES_ROUTING_PIPELINE_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2270_SCRIBES_CATHEDRAL_ARCHITECTURE_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2271_SP21_TIDBIT_SCRIBE_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2272_COST_SLASHER_CLAIM_LADDER_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2273_FINGERPRINT_INCREMENTAL_INDEX_RECONCILIATION_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2274_PARALLEL_PRELOAD_MULTILINGUAL_B117.md"
  "..\12_Innovations_AA\AA_FORMAL_2275_AI_COMPANION_VENDOR_NEUTRAL_BRIDGE_B117.md"
)

pandoc $files `
  -o PROV_14_FILING_SPECIFICATION.pdf `
  --metadata title="Provisional Patent Application 14 - Liana Banyan Corporation" `
  --metadata author="Jonathan Jones" `
  --metadata date="April 23, 2026" `
  --toc --toc-depth=2 `
  --pdf-engine=wkhtmltopdf `
  -V geometry:margin=1in
```

If pandoc isn't installed: `winget install --id JohnMacFarlane.Pandoc` (one-line install on Windows).

If wkhtmltopdf isn't installed (PDF engine): `winget install wkhtmltopdf.wkhtmltopdf` OR use `--pdf-engine=weasyprint` (after `pip install weasyprint`) OR use `--pdf-engine=context` / `xelatex` if LaTeX is available.

### Fallback path (manual concat + online MD-to-PDF)

If pandoc fails and time is tight:
1. PowerShell concatenate: `Get-Content $files | Set-Content PROV_14_COMBINED.md`
2. Upload `PROV_14_COMBINED.md` to `md-to-pdf.io` or similar
3. Download the PDF, use for filing

### Verification before upload

- [ ] PDF opens without error
- [ ] Table of contents lists all 13 innovations
- [ ] #2275 AI Companion claims show "Founder-ratified B117" — this is the just-ratified CJ
- [ ] Claim numbering is consistent across innovations (each A&A uses its own Claim 1, Claim 2, etc. — OK for provisional; counsel normalizes during conversion)
- [ ] Total page count — expected 100–150 pages
- [ ] No truncation of any A&A file

---

## USPTO Patent Center step-by-step

1. **Sign in** at [patentcenter.uspto.gov](https://patentcenter.uspto.gov) using your existing LB Corporation USPTO account.
2. **Start new submission** → select **"Provisional"** application type.
3. **Applicant data:**
   - Applicant: Liana Banyan Corporation
   - Applicant type: Small entity → Micro-entity (requires SB/15A cert)
   - Title of invention: **"Cooperative-Platform AI Memory Infrastructure: Scribes Cathedral, Three Fates Routing, Fingerprint Reconciliation, Multilingual Preload, and Vendor-Neutral Companion Bridge"** (or split if USPTO field is char-limited — Founder preference)
4. **Inventor data:**
   - Inventor: Jonathan Jones
   - Residence: [your address]
   - Citizenship: USA
5. **Upload files:**
   - Specification PDF: `PROV_14_FILING_SPECIFICATION.pdf` (from build step above)
   - Oath/declaration: Form PTO/AIA/01 (fill online, print, sign, scan, upload)
   - Micro-entity cert: Form PTO/SB/15A
6. **Fee payment:**
   - Micro-entity provisional filing fee: **$65** (2026 rate; verify before paying)
   - Pay via credit card on USPTO site
7. **Confirm submission.** USPTO returns an application number in the format **63/xxx,xxx** or **64/xxx,xxx** (64/ has been used for recent LB filings like Prov 13 at 64/036,646).
8. **Immediately after filing:**
   - Update `canonical_values.yaml` and `MEMORY.md` with the new Prov 14 application number
   - File AP# → Bishop memory → Scribe Vault

---

## After filing — immediate follow-ups

1. **Update canonical numbers.** Prov count 13 → **14**. Crown Jewel count 225 → **226** (adding #2275). Innovation count 2,267 → **2,268** (#2275 is genuinely new; #2263–#2274 were pre-existing).
2. **Renumber MEMORY.md** to reflect Prov 14 filed.
3. **Draft A&A Formals for #2264, #2265, #2266, #2267** during the 12-month conversion window (B118+).
4. **Confirm pre-registration with counsel** — optional but recommended — send the filed PDF to Harrity & Harrity or Lloyd & Mousilli for post-filing review before the 12-month conversion deadline.
5. **R11 benchmark dispatch** now unblocked — Prov 14 filed means the Cathedral architecture has priority date; R11 publication no longer risks disclosing unprotected art.
6. **K438 Member Cathedral dispatch** now unblocked on the IP side — SCEV-1 SEALED-50 PASS still gates product ship per Prove-Then-Product.
7. **Companion engineering dispatch** (K445+) now unblocked on the IP side — standalone Companion packaging can begin.

---

## Bishop-side status after filing

| Metric | Before Prov 14 filing | After Prov 14 filing |
|---|---|---|
| Provisional applications | 13 | **14** |
| Innovations filed (cumulative) | 2,262 (end of Prov 13 range) | **2,275** |
| Crown Jewels filed (cumulative) | 27 (Prov 13) + Section 1 CJs | +8 (Section 2 CJs ratified) |
| Claims filed | ~2,412 | +72 from Section 2 = **~2,484** |

---

## Risk notes

1. **Self-filing risk.** Filing without counsel means post-conversion claim amendments may be wider than if counsel drafted. Mitigation: file fast (priority date matters more than perfect claims), then pay Harrity & Harrity for conversion-time claim polish.
2. **Micro-entity disqualification.** Filing 5+ provisionals per year can disqualify micro-entity status in some interpretations. Check: LB's prior filings this calendar year (Prov 10 Jan, 11 Feb, 12 Apr 7, 13 Apr 12, 14 Apr 23 = 5 this year?). If disqualified, fee jumps to small-entity ~$130 or regular-entity ~$300. Still filable today.
3. **Assignment not filed today.** The inventor-to-corporation assignment is a separate form. Can be filed any time before conversion. Not today-blocking.
4. **Disclosure before filing.** If any of #2268–#2275 were publicly disclosed in a paper / blog / talk BEFORE today, the US 1-year grace period applies; non-US countries may have already lost patentability. No-action items here for US filing today.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Everything is ready. Run the pandoc command, fill the USPTO forms, pay $65. Priority date anchors by end of day if USPTO servers are up.*

**FILE TODAY.**
