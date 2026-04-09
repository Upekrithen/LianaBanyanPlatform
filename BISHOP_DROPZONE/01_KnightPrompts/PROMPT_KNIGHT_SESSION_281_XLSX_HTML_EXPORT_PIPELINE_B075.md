# KNIGHT SESSION 281 — XLSX → HTML Export Pipeline for Public Ops Documents
## Bishop B075 | April 4, 2026

---

## MISSION

Build an automated pipeline that converts `.xlsx` ops workbooks (like `PAWN_B45_CAMPAIGN1_OPS_WORKBOOK.xlsx`) into published HTML views on Cephas. Excel is the editable source of truth; HTML is the public display surface.

---

## CONTEXT

The Founder's principle: "Documentation as Democracy." Ops work lives in Excel (editable, formulas, collaborative). Public display lives in HTML (web-native, linkable, searchable, embedded in Cephas).

**First document to pipeline**: `PAWN_B45_CAMPAIGN1_OPS_WORKBOOK.xlsx`
- 4 tabs: REWARD_MATRIX, STRETCH_GOALS, TIER_CARDS, COPY_FRAGMENTS
- Content: Kickstarter Campaign 1 "Ladder Campaign" operational specs
- Intended publication: `cephas.lianabanyan.com/kickstarter-campaign-1-ops`

---

## DELIVERABLES

### 1. Conversion Script

`platform/scripts/xlsx-to-cephas-html.ts`

```typescript
// Reads .xlsx, converts each tab to an HTML section, emits a Cephas-ready page
// Uses: node-xlsx or xlsx library
// Output: single .md file (Hugo-compatible) with embedded HTML tables
```

Features:
- Read all tabs from an .xlsx file
- Convert each tab to an HTML `<table>` with Cephas styling
- Preserve tab titles as section headers
- Auto-generate Hugo frontmatter (title, date, tags, description)
- Output to `Cephas/cephas-hugo/content/ops/` directory

### 2. Cephas Styling

Add CSS rules for ops-document tables in Cephas theme:
- Striped rows
- Responsive overflow for wide tables
- Print-friendly version
- Mobile-friendly (collapse columns or scroll horizontally)

### 3. Hugo Integration

Create new content section: `/cephas/ops/` for operations documents published publicly.

Add to Cephas navigation under "Transparency" or "Documentation as Democracy" menu.

### 4. First Pipelined Document

Run the pipeline on `PAWN_B45_CAMPAIGN1_OPS_WORKBOOK.xlsx`:
- Output: `Cephas/cephas-hugo/content/ops/kickstarter-campaign-1.md`
- URL: `cephas.lianabanyan.com/ops/kickstarter-campaign-1`
- Contains all 4 tabs rendered as HTML sections

### 5. Re-run Capability

Script must be idempotent — running it again with an updated .xlsx overwrites the HTML output without breaking formatting.

Also: add a `last_synced_from` frontmatter field showing the source .xlsx filename and timestamp.

---

## STRETCH: Auto-Watch

Optional: watch the Downloads folder (or a designated `ops_workbooks/` directory) for `.xlsx` updates and auto-republish.

---

## ACCEPTANCE CRITERIA

- [ ] `xlsx-to-cephas-html.ts` script created
- [ ] Converts all tabs preserving structure
- [ ] PAWN_B45 workbook published to `/ops/kickstarter-campaign-1`
- [ ] Cephas navigation includes new Ops section
- [ ] Styling is readable on mobile + print-friendly
- [ ] Re-run produces identical output (idempotent)
- [ ] `npm run build` passes

## DO NOT

- Modify the source .xlsx (read-only conversion)
- Skip the `last_synced_from` frontmatter (provenance matters)
- Invent data not in the workbook
- Publish without the "Documentation as Democracy" disclaimer footer
