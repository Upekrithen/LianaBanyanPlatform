# Knight Session K374 — Wire ALL 42 Letters to Dispatch Contacts (K371 Fix)

**Bishop:** B091 | **Priority:** CRITICAL | **Depends on:** K371 (partial), K366 (done)

## Context

K371 only wired 2 of 43 contacts because it looked in ONE directory. Bishop B091 located ALL 42 letters across 5 directories. This session reads each letter file, extracts the body (stripping YAML frontmatter and Bishop metadata), and creates a migration to populate `letter_dispatch_queue.letter_body` for ALL contacts.

**IMPORTANT:** The K371 migration (20260409000001) already set placeholders. This migration UPDATES those placeholders with real letter content.

## EXACT FILE MAPPING — ALL 42 CONTACTS

**Base path:** `ARCHIVE2April2026/letters/` unless otherwise noted.

### Phase 1: The Board Table (9 contacts)

| # | recipient_name (EXACT) | Letter File Path |
|---|----------------------|------------------|
| 1 | Melinda French Gates | `outreach-letters/LETTER-MELINDA-FRENCH-GATES.md` |
| 2 | Craig Newmark | `outreach-letters/LETTER-CRAIG-NEWMARK.md` |
| 3 | Erik Brynjolfsson | `academic-letters/LETTER-ERIK-BRYNJOLFSSON.md` |
| 4 | Nathan Schneider | `academic-letters/LETTER-NATHAN-SCHNEIDER.md` |
| 5 | Trebor Scholz | `academic-letters/LETTER-TREBOR-SCHOLZ.md` |
| 6 | Cory Doctorow | `crown-letters/LETTER-CORY-DOCTOROW-01.md` |
| 7 | Daron Acemoglu | `academic-letters/LETTER-DARON-ACEMOGLU-01.md` |
| 8 | Yochai Benkler | `academic-letters/LETTER-YOCHAI-BENKLER-01.md` |
| 9 | Julian Posada | `../../BISHOP_DROPZONE/LETTER_DRAFT_POSADA_YALE_B082.md` (strip Bishop metadata, keep letter body only) |

### Phase 2: The Validators (14 contacts)

| # | recipient_name (EXACT) | Letter File Path |
|---|----------------------|------------------|
| 10 | Antonio Casilli | `../../BISHOP_DROPZONE/LETTER_DRAFT_CASILLI_B082.md` (strip Bishop metadata) |
| 11 | Paola Ricaurte Quijano | `../../BISHOP_DROPZONE/LETTER_DRAFT_RICAURTE_QUIJANO_B082.md` (strip Bishop metadata) |
| 12 | Netsaalem Gebrie | `../../Asteroid-ProofVault/02_WRITTEN/02_Circle_Letters/LETTER_NETSAALEM_GEBRIE_SYSTEMS_B053.md` |
| 13 | Shoshana Zuboff | `outreach-letters/LETTER-SHOSHANA-ZUBOFF-01.md` |
| 14 | Kate Raworth | `outreach-letters/LETTER-KATE-RAWORTH-01.md` |
| 15 | Mariana Mazzucato | `academic-letters/LETTER-MARIANA-MAZZUCATO-01.md` |
| 16 | Juliet Schor | `academic-letters/LETTER-JULIET-SCHOR-01.md` |
| 17 | Arun Sundararajan | `academic-letters/LETTER-ARUN-SUNDARARAJAN-01.md` |
| 18 | Douglas Rushkoff | `outreach-letters/LETTER-DOUGLAS-RUSHKOFF-01.md` |
| 19 | Howard Marks | `outreach-letters/LETTER-HOWARD-MARKS-01.md` |
| 20 | Seth Godin | `outreach-letters/LETTER-SETH-GODIN-01.md` |
| 21 | Li Jin | `outreach-letters/LETTER-LI-JIN-01.md` |
| 22 | Anand Giridharadas | `outreach-letters/LETTER-ANAND-GIRIDHARADAS.md` |
| 23 | Esther Perel | `outreach-letters/LETTER-ESTHER-PEREL-01.md` |

### Phase 3: The Amplifiers (14 contacts)

| # | recipient_name (EXACT) | Letter File Path |
|---|----------------------|------------------|
| 24 | Kara Swisher | `outreach-letters/LETTER-KARA-SWISHER.md` |
| 25 | Ezra Klein | `outreach-letters/LETTER-EZRA-KLEIN.md` |
| 26 | Nilay Patel | `outreach-letters/LETTER-NILAY-PATEL-01.md` |
| 27 | Hank Green | `outreach-letters/LETTER-HANK-GREEN.md` |
| 28 | Paris Marx | `outreach-letters/LETTER-PARIS-MARX-01.md` |
| 29 | Ed Zitron | `outreach-letters/LETTER-ED-ZITRON-01.md` |
| 30 | Brian Merchant | `outreach-letters/LETTER-BRIAN-MERCHANT-01.md` |
| 31 | Molly White | `crown-letters/LETTER-MOLLY-WHITE-01.md` |
| 32 | Tim Ingham | `crown-letters/LETTER-TIM-INGHAM-01.md` |
| 33 | Kiko Martinez | `../../Asteroid-ProofVault/02_WRITTEN/02_Circle_Letters/LETTER_KIKO_MARTINEZ_HOOD_UBER.md` |
| 34 | Ai-jen Poo | `crown-letters/CROWN_LETTER_AI_JEN_POO-01.md` |
| 35 | Majora Carter | `outreach-letters/LETTER-MAJORA-CARTER-01.md` |
| 36 | Simon Sinek | `outreach-letters/LETTER-SIMON-SINEK-01.md` |

### Phase 4: The Stars (6 contacts)

| # | recipient_name (EXACT) | Letter File Path |
|---|----------------------|------------------|
| 37 | Taylor Swift | `crown-letters/CROWN_LETTER_TAYLOR_SWIFT-02.md` |
| 38 | Dolly Parton | `blessing-letters/LETTER_DOLLY_PARTON_BLESSING.md` |
| 39 | Jimmy Kimmel | `blessing-letters/LETTER_JIMMY_KIMMEL_BLESSING.md` |
| 40 | Pitbull | `blessing-letters/LETTER_PITBULL_BLESSING.md` |
| 41 | Ziwe Fumudoh | `sponsorship-letters/LETTER_ZIWE_FUMUDOH_SPONSORSHIP.md` |
| 42 | Bambu Lab | `../../ARCHIVE2April2026/LAUNCH_TONIGHT_JAN28/LETTER_BAMBU_LAB_PARTNERSHIP.md` |

## What to Build

### TASK 1: Read all 42 letters and create migration

1. For each file above, read the content
2. Strip YAML frontmatter (everything between `---` delimiters at top of file)
3. Strip Bishop metadata headers (lines starting with `# BISHOP`, `## FOUNDER REVIEW`, `## NOTES FOR FOUNDER`, `## CROWN ROLE DETAILS`)
4. Keep only the actual letter body (starting from "Dear..." or the salutation)
5. Escape single quotes for SQL (`'` → `''`)
6. Create migration `20260409100001_k374_wire_all_42_letters.sql`:

```sql
-- K374: Wire ALL 42 letters to dispatch contacts
-- Bishop B091 located every letter across 5 directories

UPDATE letter_dispatch_queue SET letter_body = E'[escaped letter content]'
WHERE recipient_name = '[exact name]';
```

7. For the `subject_line`, use the existing subject_line from K366 migration (already set). Only update letter_body.

### TASK 2: Verify content loaded

After migration, add a verification query at the bottom:

```sql
-- Verify: should return 0 rows (no contacts without real letter content)
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM letter_dispatch_queue
  WHERE letter_body IS NULL
     OR letter_body LIKE '%CONTENT PENDING%';
  
  IF missing_count > 0 THEN
    RAISE WARNING 'K374: % contacts still missing letter content', missing_count;
  ELSE
    RAISE NOTICE 'K374: All 42 contacts have letter content loaded';
  END IF;
END $$;
```

### TASK 3: Update content status in LetterDispatchPage

The K371 UI already shows green/red dots for content status. After this migration:
- All 42 dots should be green
- The "Letters Loaded" counter should show "42/43 Letters Loaded" (43rd is Bambu Lab if contact exists as 43rd)
- Verify this renders correctly

## Done-when

- [ ] All 42 letter files read and content extracted
- [ ] Migration populates letter_body for ALL 42 contacts
- [ ] Verification query confirms 0 missing
- [ ] No placeholder text remains in any contact's letter_body
- [ ] Build passes
