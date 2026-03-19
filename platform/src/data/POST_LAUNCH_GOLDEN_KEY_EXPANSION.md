# POST-LAUNCH: Golden Key Quest Expansion
## Priority: HIGH (after launch stabilization)

### Current State
- **Self-Attest** ("I read the full paper") → 10 Marks — works for ALL letters
- **Quiz** (5 questions, up to 10 Marks) — ONLY seeded for Scott and Buffett
- **Treasure Keys** (hidden words in articles) — limited coverage

### Required Work
Every letter on Cephas (now 102 files) needs EITHER:
- **Quiz questions** (5-question multiple choice, 3 difficulty tiers), OR
- **Treasure Keys** (hidden keywords for the word search system), OR
- **BOTH** (in addition to Self-Attest, which stays universal)

### Scope
- 102 Cephas letter files across 8 categories
- Need quiz question pools (8+ questions per letter for randomization)
- Need treasure key word placement in letter content
- Acrostic puzzles for select letters (Buffett has short-answer format)
- Cross-link quizzes to Golden Key Quest page progression

### Implementation Notes
- Quiz seeding migration needed (extend `20260315000007_quiz_tables_and_seed.sql` pattern)
- Each quiz needs: paper_id matching Cephas slug, 8+ questions across easy/medium/hard
- Treasure keys need: hidden word markers in letter content, submission validation
- Consider AI-generated question pools reviewed by Founder for accuracy
- Prioritize Crown Letters first (highest engagement value), then Circles, then Pitches
