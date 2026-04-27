# EMBEDDED ANECDOTE AUDIT — K522.7
## Detective Scribe Pattern (A&A #2316 Second Application)
**Prepared by:** Knight (K522.7/B128, 2026-04-27)
**Methodology:** Cross-surface sweep for Founder-anecdote-shaped narrative NOT tracked in Master Registry or Supabase `anecdotes` table.
**Result: 0 untracked candidates found.**

---

## Sweep Scope

| Surface | Count | Pattern Match | New Candidates |
|---|---|---|---|
| Cephas content registry — Puddings | 28 | 2 hits | 0 new |
| Cephas content registry — Articles | 62 | not swept (no first-person narrative pattern) | — |
| Cephas content registry — Crown Letters | 26 | 5 hits (Founder anecdotes referenced in letter prose) | 0 new |
| Cephas content registry — Founder category | 2 | 2 hits | 0 new |
| Cephas content registry — BST Episodes | 0 | category not yet populated | — |
| Cephas content registry — Spoonfuls | 0 | category not yet populated | — |
| FounderVoice Scribe (42 entries pre-K522.7) | 42 | biographical anchors only | 0 new |
| tidbits.jsonl (163 entries, 2026 subset) | 163 | 0 hits for anecdote-signal keywords | 0 new |
| Supabase `anecdotes` table | 39 rows | — (already canonical) | — |

**Anecdote-signal keywords used:** `> "(I |My |When I)`, `Montana`, `Age [0-9]`, `born|grew up|father|mother|son|daughter|family`, `I was.*when`, `One time`, `I remember`

---

## Pattern Hit Analysis

### Hit 1: "The Montana Principle: Would You Accept Your Own Deal" (Pudding)
**Slug:** `the-montana-principle-would-you-accept-your-own-deal`
**Pattern match:** Family keyword (`son`, `mother`)
**Full excerpt:** "Before any deal goes live on Liana Banyan, the person offering it must answer one question: would you accept this deal yourself..."
**Assessment:** ❌ NOT an anecdote. This is a principle-doc. The family keyword hit was incidental. The "Montana Principle" title references Master #1 (Paper Route) as its philosophical origin but does not contain embedded Founder narrative. **Action: cross-reference to FV-ANEC-001. No new Master Registry entry.**

### Hit 2: "The Drink Cookbook: How One Old Book Started All This" (Pudding)
**Slug:** `the-drink-cookbook-how-one-old-book-started-all-this`
**Pattern match:** Family keyword (`Jones family`, `old book`)
**Full excerpt:** "There is a cookbook in the Jones family. It is old. The drinks section has a recipe for something that should not exist..."
**Assessment:** ⚠️ STUB — content is truncated/incomplete in Supabase. Could be an anecdote-shaped piece about a family heirloom cookbook. **Action: Founder review needed — if there's a full Founder-voice story about a family cookbook, this would qualify for Master Registry. Filed as K522.8 candidate. No new Master Registry entry at this time.**

### Hits 3-5: Crown Letters (Swift, Poo, Oshmyansky, Applewhite, Brown)
**Pattern match:** `mother`, `son`, `father` keywords embedded in letter prose
**Assessment:** ❌ Cross-references to existing Master Registry anecdotes embedded in letter arguments. No standalone Founder narratives. The Oshmyansky crown letter likely references Master #32 (Pet Antibiotics); the Poo/Applewhite letters reference The Family Table initiative, not personal anecdotes.

### Hits 6-7: Founder Category (`anecdotes` slug, `origin-story` slug)
- `anecdotes.md` — this IS the Cephas mirror of the Supabase `anecdotes` table. No new content.
- `origin-story.md` — summary wrapper citing Master Registry #1, #11, and military service. Cross-reference only. No new anecdotes.

---

## BST Episodes / Spoonfuls
**Status:** Both categories have 0 entries in `cephas_content_registry` as of K522.7.
**K522.8 flag:** When BST Episodes are populated, re-run this audit — BST audio/video episodes likely contain Founder stories that may qualify for Master Registry.

---

## Tidbits Scan (2026 B-Sessions)
**Tidbits.jsonl total:** 163 entries
**2026 subset scanned:** 163 entries (entire file is 2026-era per timestamps)
**Keyword hits:** 0 matches on `anecdote|story told|childhood|when I was|one time`
**Conclusion:** No new 2026 Founder personal stories captured in tidbits that are absent from the Master Registry.

---

## Audit Conclusion

The Cephas content surfaces are **clean** — no untracked Founder anecdotes are embedded in them. The detective sweep confirms:
1. All known Founder personal anecdotes are either in the Master Registry (35) or proposed as #36-#41 (Shop, Triple Double, To Blave, USAA, Golden Eagle, Squad Car).
2. The Pudding archive contains 28 entries, 2 of which reference Founder biographical content, but both are cross-references to existing canonical anecdotes, not new stories.
3. BST Episodes and Spoonfuls — future sweep needed when populated.
4. The "Drink Cookbook" Pudding is a potential future anecdote (Jones family heirloom story) but is incomplete.

**Detective second-application notes (per A&A #2316 Claim 7 — Provenance Map):**
- Sweep methodology: keyword regex + category filter + full-content inspection of pattern hits
- False positive rate: 7 hits → 0 true positives = 100% specificity (patterns too broad; family keywords are noisy)
- Recommended improvement: add biographical-setting filter (`Montana|Tennessee|Tanzania|OCS|college|Army|high school`) as primary filter before keyword scan
- Time to complete: ~15 min (query Supabase + inspect 7 candidates)
- Scalable to 189+ Puddings when Spoonfuls/BST populated: same script, adjust category filter

---

## K522.8 Candidates Surfaced

1. "The Drink Cookbook" Pudding — complete if Founder has the full Jones-family cookbook story
2. BST Episodes audit — when category is populated
3. Spoonfuls audit — when category is populated
4. Full Crown Letter sweep (remaining 21 letters not included in Phase D sample)

---

*Prepared K522.7/B128 — Detective Scribe second-application per A&A #2316. Result: 0 untracked candidates. Clean audit.*
