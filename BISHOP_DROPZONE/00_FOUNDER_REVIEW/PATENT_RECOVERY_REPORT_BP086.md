# Patent Recovery Report — BP086
Generated: 2026-06-18 | Sonnet 4.6 SEG

---

## Recovered to Canonical Folders

All 21 copies verified via `Test-Path` post-copy. Originals remain in Downloads as backup.

| PROV | Source | Canonical Target | Status |
|---|---|---|---|
| 08 | `Submission Receipt Patent Center - USPTO Provisional 8.pdf` | `64_009_803 Provisional Patent 8\PROV_08_FILING_USPTO.pdf` | OK |
| 08 | `Prov Patent 8 Payment Receipt USPTO.pdf` | `64_009_803 Provisional Patent 8\PROV_08_PAYMENT_RECEIPT.pdf` | OK |
| 09 | `64_017_140 Provisional Patent 9.pdf` | `64_017_140 Provisional Patent 9\PROV_09_FILING_USPTO.pdf` | OK |
| 09 | `Provisional 9.pdf` | `64_017_140 Provisional Patent 9\PROV_09_FILING_USPTO_alt.pdf` | OK — two copies found; Founder should confirm which is canonical |
| 10 | `Provisional 10 Patent Center - USPTO.pdf` | `64_017_457 Provisional Patent 10\PROV_10_FILING_USPTO.pdf` | OK |
| 10 | `Paid Submission Provisional 10 - Patent Center - USPTO.pdf` | `64_017_457 Provisional Patent 10\PROV_10_PAYMENT_RECEIPT.pdf` | OK |
| 12 | `12 Patent Center - USPTO.pdf` | `64_031_531 Provisional Patent 12\PROV_12_FILING_USPTO.pdf` | OK |
| 12 | `Payment Receipt - Provisional 12 USPTO.pdf` | `64_031_531 Provisional Patent 12\PROV_12_PAYMENT_RECEIPT.pdf` | OK |
| 13 | `Payment Receipt the 13th Patent USPTO.pdf` | `64_036_646 Provisional Patent 13\PROV_13_PAYMENT_RECEIPT.pdf` | OK — PAYMENT ONLY, no filing PDF found |
| 14 | `Provisional 14.pdf` | `64_052_602 Provisional Patent 14\PROV_14_FILING_USPTO.pdf` | OK |
| 15 | `Provision 15.pdf` | `64_052_618 Provisional Patent 15\PROV_15_FILING_USPTO.pdf` | OK |
| 16 | `Prov 16.pdf` | `64_060_080 Provisional Patent 16\PROV_16_FILING_USPTO.pdf` | OK |
| 17 | `Prov 17.pdf` | `64_060_093 Provisional Patent 17\PROV_17_FILING_USPTO.pdf` | OK |
| 20 | `Provisional 20.pdf` | `64_073_890 Provisional Patent 20\PROV_20_FILING_USPTO.pdf` | OK |
| 21 | `Provisional 21.pdf` | `PROV_21 Provisional Patent 21\PROV_21_FILING_USPTO.pdf` | OK |
| 21 | `PROV_21_COMBINED_FILING_BP068_v2.pdf` | `PROV_21 Provisional Patent 21\PROV_21_COMBINED_FILING_v2.pdf` | OK |
| 21 | `PROV_21_W5b_EXPANDED_BP057.pdf` | `PROV_21 Provisional Patent 21\PROV_21_W5b_EXPANDED.pdf` | OK |
| 21 | `PROV_21_ADDENDUM_EMPIRICAL_BP067.pdf` (from vault root) | `PROV_21 Provisional Patent 21\PROV_21_ADDENDUM_EMPIRICAL_BP067.pdf` | OK |

### _NEEDS_CATEGORIZATION folder

| File | Notes |
|---|---|
| `PROV_FEB24_COMPLETE_OFFSITE.pdf` | 22MB — from LianaBanyanOFFSITE/2026; likely the combined multi-invention Feb 24 filing |
| `PROV_FEB24_PAYMENT_RECEIPT.pdf` | `Payment Receipt - Submissions - Patent Center - USPTO.pdf` (Feb 24, 279K) |
| `PROV_FEB24_RECEIPT_USPTO.pdf` | `Receipt_PROVISIONAL_PATENT_FEB24_COMPLETE_USPTO.pdf` |
| `Submission_Receipt_Mar15_A.pdf` | Dated 2026-03-15 01:14 — possibly PROV 1 or 2 |
| `Submission_Receipt_Mar15_B.pdf` | Dated 2026-03-15 01:24 — possibly PROV 2 or 3 |

Founder action needed: identify which app#s these map to and move to the correct numbered folders.

---

## Recycle Bin Restores

| File | Result |
|---|---|
| `PROV_21_ADDENDUM_EMPIRICAL_BP067.pdf` | Restored — found at vault root, copied to PROV_21 canonical folder |
| `PROV_21_COMBINED_FILING_BP068.pdf` (v1) | Shell reported "Restored" but file not found anywhere on disk after restore — destination path likely no longer exists. **Effectively still missing.** v2 (`PROV_21_COMBINED_FILING_BP068_v2.pdf`) is present and copied. |

---

## ZIP Inventory (`LianaBanyanHandoffNEWNEWpatents.zip`)

Extracted to: `C:\Users\Administrator\Downloads\_zip_inventory_BP086\`

Contains **2 markdown files only — NO PDFs**:

| File | Size | mtime |
|---|---|---|
| `LIANA-BANYAN-HANDOFF-MASTER.md` | 9,795 bytes | 2025-11-28 |
| `PROVISIONAL-PATENT-INNOVATIONS-39-53.md` | 21,025 bytes | 2025-11-28 |

No PROV 1–7, 11, 13, 18, or 19 PDFs were in this ZIP.

---

## Still Missing — Need USPTO Patent Center Download

These app# folders are empty (no PDFs recovered from any source):

| PROV | App# | Notes |
|---|---|---|
| 1 | 63_925_672 | No PDF found in Downloads, ZIP, vault, or Recycle Bin |
| 2 | 63_927_674 | No PDF found — Mar 15 submission receipts in _NEEDS_CATEGORIZATION may be PROV 1/2 |
| 3 | 63_938_216 | No PDF found — Mar 15 submission receipts in _NEEDS_CATEGORIZATION may be PROV 2/3 |
| 4 | 63_967_200 | No PDF found |
| 5 | 63_969_601 | No PDF found |
| 6 | 63_989_913 | No PDF found — NOTE: mission brief originally named this as PROV_08 source folder; confirmed folder is `64_009_803` for PROV 8. Feb24 combined filing may include PROV 6. |
| 7 | 64_006_010 | No PDF found |
| 11 | 64_025_635 | No PDF found |
| 13 | 64_036_646 | Payment receipt present; **filing PDF missing** — download from USPTO Patent Center |
| 18 | 64_062_332 | No PDF found |
| 19 | 64_062_334 | No PDF found |

**11 provisional filing PDFs still unrecovered.** Priority for USPTO Patent Center download.

---

## VSS Previous Versions Check

Not run from this SEG (needs UAC-elevated prompt). Recommend Founder open elevated cmd and run:

```
vssadmin list shadows
```

If shadows exist with date before 2026-03-12, the full 32GB vault may be recoverable. This could surface PROV 1–7, 11, 13, 18, 19 without a USPTO download.

---

## Canonical Structure Confirmation

- All 20 numbered folders confirmed present and named correctly.
- New folder created: `PROV_21 Provisional Patent 21`
- New folder created: `_NEEDS_CATEGORIZATION`
- Originals preserved in `C:\Users\Administrator\Downloads\` — do NOT delete until Founder confirms.
