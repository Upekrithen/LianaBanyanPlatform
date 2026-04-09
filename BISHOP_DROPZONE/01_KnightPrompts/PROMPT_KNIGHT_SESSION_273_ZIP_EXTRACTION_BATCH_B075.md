# KNIGHT SESSION 273 — ZIP Archive Extraction & Classification
## Bishop B075 | April 4, 2026

---

## MISSION

Extract all 24+ ZIP archives in `00_INBOX_FOR_SYNTHESIS/0_AllTheThingsSheSaid/` and `00_INBOX_FOR_SYNTHESIS/` root, compare contents against canonical directories, classify each file as unique-content or duplicate-of-canonical, and produce a manifest for Bishop to file.

---

## CONTEXT

Bishop B075 survey of the Inbox identified 24+ ZIP archives as "black boxes" — their contents cannot be searched, compiled, or compared against canonical directories without extraction. Total unprocessed file count in the Inbox: 242 files + unknown contents of ZIPs.

Known ZIP archives (partial list):
- `007 Wave One Letters.zip`
- `01 Rewrite this.zip`
- `010 Muzzle Not the Ox.zip`
- `02 Bifrost Update.zip`
- `03 Not quite army grasshoppers.zip`
- `05 ALLdemLettahs.zip`
- `06 Kickstarter Appeal.zip`
- `07 Building the Ship.zip`
- `08 KS appeal and such.zip`
- `51Innovations.zip`
- `52Years.zip`
- `Academic Paper for Currency Differential UPDATED.zip`
- `Academic Paper for Currency Differential.zip`
- `COMPARISON_VAULT_BACKUP_20260122_130133.zip`
- Plus ~10 more

**⚠️ Critical concern**: `Academic Paper for Currency Differential.zip` AND `Academic Paper for Currency Differential UPDATED.zip` sit next to each other. The canonical version is unclear until both are extracted and diffed.

---

## DELIVERABLES

### Step 1: Extract All ZIPs

Create extraction workspace:
```bash
mkdir -p "Asteroid-ProofVault/_ZIP_EXTRACTED_B075/"
```

For each ZIP in `00_INBOX_FOR_SYNTHESIS/`:
```bash
# Create a subdirectory named after the ZIP
unzip "00_INBOX_FOR_SYNTHESIS/0_AllTheThingsSheSaid/01 Rewrite this.zip" -d "_ZIP_EXTRACTED_B075/01_Rewrite_this/"
```

Sanitize subdirectory names (remove spaces, special chars).

### Step 2: Build Content Inventory

For each extracted directory, generate a file manifest:
```bash
find "_ZIP_EXTRACTED_B075/01_Rewrite_this/" -type f > "_ZIP_EXTRACTED_B075/01_Rewrite_this_MANIFEST.txt"
```

### Step 3: Content Comparison Against Canonical

For each extracted file, check if it exists in canonical directories:
```python
# Pseudocode
for extracted_file in all_extracted_files:
    canonical_paths = search_for_identical_content_in_vault(extracted_file)
    if canonical_paths:
        classify_as_duplicate(extracted_file, canonical_paths)
    else:
        classify_as_unique(extracted_file)
```

Methods for duplicate detection:
- **Filename match**: Same filename exists in canonical directory
- **Content hash match**: SHA-256 hash of file matches existing file
- **Near-duplicate**: >90% content similarity

### Step 4: Classification Manifest

Produce `_ZIP_EXTRACTED_B075/CLASSIFICATION_MANIFEST.md` with:

```markdown
# ZIP Extraction Classification Manifest

## ZIP: 01_Rewrite_this.zip
### Extracted to: _ZIP_EXTRACTED_B075/01_Rewrite_this/

| File | Classification | Canonical Location | Action |
|------|---------------|-------------------|--------|
| document1.md | DUPLICATE | 02_CROWN_LETTERS/LETTER-X.md | Archive |
| document2.md | UNIQUE | none | File to proper location |
| document3.md | NEAR-DUPLICATE | 02_WRITTEN/paper1.md (94% match) | Human review |

### Summary:
- Total files: N
- Duplicates: X
- Unique: Y
- Near-duplicates: Z (needs review)
```

Repeat for every ZIP.

### Step 5: Special Handling

**For `Academic Paper for Currency Differential.zip` and UPDATED version**:
- Extract both
- Run a diff between them
- Identify differences
- Flag for Bishop review with diff summary

**For `COMPARISON_VAULT_BACKUP_20260122_130133.zip`**:
- This is a full vault backup from Jan 22
- Do NOT extract into the Inbox
- Extract to a separate `_BACKUPS_EXTRACTED/` directory for reference only

### Step 6: Preserve Original ZIPs

**DO NOT delete original ZIPs** until Bishop confirms manifest is accurate. Keep originals in place. Bishop will decide archive policy after reviewing.

---

## ACCEPTANCE CRITERIA

- [ ] All 24+ ZIPs extracted to `_ZIP_EXTRACTED_B075/`
- [ ] File manifest generated per ZIP
- [ ] Classification manifest produced
- [ ] Academic Paper Currency Differential diff computed
- [ ] Original ZIPs preserved (not deleted)
- [ ] Classification summary shared with Bishop

---

## DO NOT

- Delete any ZIP archives until Bishop confirms manifest
- Extract COMPARISON_VAULT_BACKUP into the Inbox (it's a full backup, huge)
- File extracted content to canonical locations yet (Bishop decides placement)
- Skip the content hash comparison (filename-only matching misses renamed duplicates)
