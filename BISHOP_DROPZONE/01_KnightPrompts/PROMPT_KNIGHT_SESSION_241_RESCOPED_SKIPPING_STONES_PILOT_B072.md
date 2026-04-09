# KNIGHT SESSION 241 — RE-SCOPED: Skipping Stones Pilot + Librarian V2.2 Pagination
## Dispatched by: Bishop B072
## Date: April 3, 2026
## Priority: HIGH — New distribution channel + tool maintenance
## Original scope: Journal 005 compilation (COMPLETED by Founder in K238 pre-work)

---

## MISSION

Two priorities (re-scoped from original Journal 005 task):
1. **Skipping Stones Pilot**: Generate section-level Cue Card content for 3 academic papers (pilot batch)
2. **Librarian V2.2 Pagination**: Add offset/limit/filter params to large-result-set tools

---

## PRIORITY 1: SKIPPING STONES PILOT

### Context (READ FIRST)
Innovation #2139 (Skipping Stones Depth Navigation) creates a four-layer reading depth system:
1. **Skipping Stone** = section-level teaser (Cue Card with skipping stone logo + QR)
2. **"The Proof is in the Pudding"** = transition CTA when they scan/click
3. **Pudding** = accessible 500-1000 word version
4. **"This is NOT Pudding"** = full academic paper deep-link

### Pilot Papers (3)
Generate Skipping Stones for these three papers:

1. **"StarScreaming: THROUGH the AI Brick Wall"** (~4,800 words)
   - Source: `BISHOP_DROPZONE/PAPER_STARSCREAMING_THROUGH_THE_AI_BRICK_WALL_B069.md`
   - Expected stones: ~8-10

2. **"The Blizzard: When AI Says Success and You Can Prove Failure"** (~3,800 words)
   - Source: `BISHOP_DROPZONE/PAPER_THE_BLIZZARD_WHEN_AI_SAYS_SUCCESS_B070.md`
   - Expected stones: ~6-8

3. **"How to Bake an AI Cake"** (V2, ~8,000+ words)
   - Source: `BISHOP_DROPZONE/PAPER_HOW_TO_BAKE_AI_CAKE_V2_FULL_B063.md`
   - Expected stones: ~12-15

### Output Format — Per Paper

Create one file per paper:
- `BISHOP_DROPZONE/SKIPPING_STONES_STARSCREAMING_B072.md`
- `BISHOP_DROPZONE/SKIPPING_STONES_BLIZZARD_B072.md`
- `BISHOP_DROPZONE/SKIPPING_STONES_AI_CAKE_B072.md`

Each file contains:

```markdown
# Skipping Stones — [Paper Title]
## Source: [filename]
## Stones: [count]

---

### STONE 01 — [Section Title]
**Hook**: [1 sentence, max 140 chars — the Cue Card text]
**Pudding preview**: [2-3 sentences — what the accessible version would cover]
**Paper anchor**: [Section heading in source paper for deep-link]
**Depth keywords**: [3-5 tags for Reading Beacon categorization]

### STONE 02 — [Section Title]
...
```

### Rules
- Each Stone maps to ONE first-level section of the paper
- Hook must be self-contained and intriguing — someone who knows nothing about the paper should want to scan
- Do NOT summarize the full section — the hook is a surface skip, not a synopsis
- Pudding preview describes what a future Pudding article WOULD cover (we write those separately)
- Paper anchor must match the actual heading in the source paper exactly

---

## PRIORITY 2: LIBRARIAN V2.2 PAGINATION

### Spec
Read: `BISHOP_DROPZONE/LIBRARIAN_V2_2_PAGINATION_SPEC_B072.md`

### Implementation

Source: `librarian-mcp/src/`

Update these tool handlers to accept pagination options:

1. **`get_dropzone_task`** — Add `offset`, `limit` (default 50), `session` filter, `pattern` filter
2. **`get_component`** — Add `offset`, `limit` (default 50), `type` filter
3. **`search_knowledge`** — Add `offset`, `limit` (default 20)

All three should return:
```json
{
  "results": [...],
  "total_count": 1269,
  "offset": 0,
  "limit": 50,
  "has_more": true
}
```

### Steps
1. Read current tool handlers in `librarian-mcp/src/`
2. Add optional params with backward compatibility (omitting options caps at default limit, not unlimited)
3. Rebuild: `cd librarian-mcp && npm run build`
4. Test: verify `get_dropzone_task("BISHOP")` returns paginated results
5. Verify existing callers (brief_me, moneypenny_checklist) still work

### Important
- Do NOT change any existing tool signatures in a breaking way
- Default behavior should be "first 50 results" not "all results"
- The `session` filter for dropzone should match filenames containing the session ID (e.g., "B071" matches `*_B071.md`)

---

## SESSION LOGGING

After completion:
```
update_session(session_id="K241", summary="Re-scoped: Skipping Stones pilot (3 papers, ~30 stones) + Librarian V2.2 pagination (3 tools updated)", ...)
```

---

## VALIDATION CHECKLIST

- [ ] 3 Skipping Stones files created with correct format
- [ ] Each stone maps to exactly one first-level paper section
- [ ] Hooks are <=140 chars and self-contained
- [ ] Librarian pagination working for all 3 tools
- [ ] `npm run build` succeeds in librarian-mcp
- [ ] Existing tool callers unbroken
- [ ] Session logged via Librarian
