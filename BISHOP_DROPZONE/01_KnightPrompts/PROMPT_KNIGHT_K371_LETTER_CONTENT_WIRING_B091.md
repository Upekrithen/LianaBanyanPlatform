# Knight Session K371 — Wire Letter Content to Dispatch Contacts

**Bishop:** B091 | **Priority:** HIGH | **Depends on:** K362 (done), K366 (done)

## Context

K366 loaded 43 contacts into `letter_dispatch_queue` with phases, emails, and notes. But the `letter_body` and `subject_line` fields are empty — contacts are shells waiting for content. The crown-initiative letters exist in `Cephas/cephas-hugo/content/letters/crown-initiative/` as Hugo markdown files (18 files, all SEC-clean). The letter dispatch system at `/v2/ops/letter-dispatch` (LetterDispatchPage.tsx) already renders letter_body when present.

## What to Build

### TASK 1: Extract letter content and populate dispatch queue

1. Read all letter files in `Cephas/cephas-hugo/content/letters/crown-initiative/` — each has frontmatter (title, recipient, weight) and markdown body
2. Create migration `20260409000001_k371_wire_letter_content.sql` that:
   - For each contact in `letter_dispatch_queue`, UPDATE the `letter_body` with the matching letter content (match by recipient name)
   - Set `subject_line` from each letter's title/frontmatter
   - For contacts WITHOUT a matching letter file, set a placeholder: `letter_body = '[CONTENT PENDING — no letter drafted for this recipient yet]'`
3. Contacts → Letter mapping (use ILIKE matching on recipient name):
   - Crown holders: Maneet Chauhan, Mary Beth Laughton, Kimberly Williams, Cathie Mahon, Dale Dougherty, Ruth Glenn, Robert Kaiser, Trebor Scholz, Muhammad Yunus, etc.
   - The 43 contacts span 4 phases — not all will have matching letters. That's OK.

### TASK 2: Add letter preview + edit capability to LetterDispatchPage

1. In `LetterDispatchPage.tsx`, enhance the letter preview panel:
   - Show full rendered letter body (currently shows raw text or "No letter body loaded yet")
   - Add an "Edit Letter" button that opens an inline editor (textarea, not a modal)
   - Save edits back to `letter_dispatch_queue.letter_body` via Supabase update
   - Show word count and "Last edited" timestamp
2. Add a "Content Status" column to the main table:
   - Green dot = letter_body populated
   - Red dot = empty/placeholder
   - Show count: "32/43 letters loaded" in the header

### TASK 3: Canonical stats verification

1. Grep all letter files in `Cephas/cephas-hugo/content/letters/crown-initiative/` for stale numbers
2. Any reference to innovation count should be 2,224 (not 2,130 or 2,222)
3. Any reference to patent applications should be 12 (not 11)
4. Any reference to Crown Jewels should be 202
5. Any reference to formal claims should be ~2,393
6. Fix any stale numbers found

## Done-when

- [ ] Migration populates letter_body for all matching contacts
- [ ] LetterDispatchPage shows full letter preview with edit capability
- [ ] Content status indicator shows how many letters are loaded
- [ ] No stale canonical numbers in any letter file
- [ ] Build passes
- [ ] TypeScript compiles cleanly
