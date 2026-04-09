# KNIGHT SESSION 283 — DOCX Journal Extraction
## Bishop B075 | April 4, 2026

---

## MISSION

Convert Series 2 Journal DOCX files (Journal_09-13) to Markdown for readability and Bishop classification. Preserve originals.

---

## CONTEXT

`Asteroid-ProofVault/Journal_Archive/` contains 15 Series 2 Journal files. Journals 01-08 and 14-15 are markdown (readable). Journal_09 is RTF. Journals 10-13 are DOCX (binary, unreadable via text tools).

Bishop cannot classify DOCX contents without extraction. Knight has DOCX-to-text conversion libraries available.

---

## DELIVERABLES

### 1. Install mammoth (DOCX parser)

```bash
cd platform
npm install mammoth --save-dev
```

(Or use it as a standalone node dependency outside the platform package if preferred.)

### 2. Extraction Script

Create `platform/scripts/extract-journal-docx.ts`:

```typescript
import mammoth from 'mammoth';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const JOURNAL_DIR = path.resolve('../Asteroid-ProofVault/Journal_Archive/');
const TARGETS = ['Journal_10.docx', 'Journal_11.docx', 'Journal_12.docx', 'Journal_13.docx'];

for (const filename of TARGETS) {
  const docxPath = path.join(JOURNAL_DIR, filename);
  const result = await mammoth.convertToMarkdown({ path: docxPath });
  const outputPath = docxPath.replace('.docx', '_EXTRACTED.md');
  await writeFile(outputPath, result.value);
  console.log(`Extracted: ${outputPath} (${result.value.length} chars)`);
  if (result.messages.length > 0) {
    console.log(`  Messages: ${result.messages.length} warnings/errors`);
  }
}
```

### 3. RTF Extraction (Journal_09)

For `FoundersJournal09.rtf`:
- Use `rtf-parser` or convert via Pandoc
- Output: `FoundersJournal09_EXTRACTED.md`

### 4. Run Extraction

```bash
cd platform
npx tsx scripts/extract-journal-docx.ts
```

### 5. Report

Produce a summary file `BISHOP_DROPZONE/JOURNAL_EXTRACTION_REPORT_B075.md` containing:
- Each extracted file path
- Character count
- First 500 chars of each extracted file (for Bishop classification)
- Any extraction warnings

---

## ACCEPTANCE CRITERIA

- [ ] mammoth installed
- [ ] Journal_10_EXTRACTED.md through Journal_13_EXTRACTED.md exist
- [ ] FoundersJournal09_EXTRACTED.md exists
- [ ] Original DOCX/RTF files preserved (not deleted)
- [ ] Summary report in BISHOP_DROPZONE with content previews
- [ ] `npm run build` passes (if any platform code touched)

## DO NOT

- Delete original DOCX/RTF files
- Modify extracted content (preserve as-extracted)
- Commit mammoth-added dependencies without Founder review
- Skip the content preview in the summary report
