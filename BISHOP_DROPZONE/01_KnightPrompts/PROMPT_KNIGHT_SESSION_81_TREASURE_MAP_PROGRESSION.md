# KNIGHT SESSION 81 — Treasure Map Progression + Onboarding Funnel
## Bishop 025 | March 22, 2026
## Innovation Count: 1,935 (unchanged — wiring session)

---

## MISSION

Wire the Treasure Map system into a tracked onboarding funnel. The pieces exist — quiz, 7 maps, step-by-step guides, storefront builder. What's missing: **database-backed progression tracking** and a **seamless flow** from quiz results → map selection → guided phases → storefront creation → first sale.

This is the front door of the platform. When a new member finishes this flow, they should have a live storefront and understand exactly how to make their first dollar.

---

## CONTEXT: WHAT EXISTS

| Component | Route | Status |
|-----------|-------|--------|
| Quiz (10 questions, tag scoring) | `/treasure-map` | ✅ LIVE |
| 7 Maps landing page | `/treasure-maps` | ✅ LIVE |
| Individual map guides | `/treasure-maps/:mapId` | ✅ LIVE |
| 52-card game | `/treasure-map-game` | ✅ LIVE |
| Storefront Builder | `/tools/storefront-builder` | ✅ LIVE |
| Commerce Engine | Full loop | ✅ LIVE |
| Quiz Question Bank | 55 questions (markdown only) | ❌ NOT IN DB |
| Progression tracking | None | ❌ NOT BUILT |
| Funnel flow | Pieces disconnected | ❌ NOT WIRED |

---

## TASK 1: Treasure Map Progress Table

Create migration `20260322000010_treasure_map_progress.sql`:

```sql
-- Track member progress through treasure maps
CREATE TABLE treasure_map_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  map_id TEXT NOT NULL, -- 'breakfast-runner', 'lunch-runner', etc.
  current_phase TEXT NOT NULL DEFAULT 'scout', -- 'scout', 'pitch', 'launch', 'expand'
  current_level INTEGER NOT NULL DEFAULT 1, -- 1=Starter, 2=Apprentice, 3=Journeyman, 4=Network
  phase_data JSONB DEFAULT '{}', -- checklist state per phase
  quiz_score INTEGER, -- knowledge quiz score (out of 5)
  quiz_attempts INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ, -- null until all phases done
  UNIQUE(user_id, map_id)
);

-- RLS
ALTER TABLE treasure_map_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own progress" ON treasure_map_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON treasure_map_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON treasure_map_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all" ON treasure_map_progress
  FOR SELECT USING (public.is_admin());

-- Seed knowledge quiz questions into existing paper_quiz_questions pattern
-- Using the treasure_map_quizzes table for map-specific quizzes
CREATE TABLE treasure_map_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  map_id TEXT NOT NULL, -- which map this quiz belongs to
  category TEXT NOT NULL, -- 'economics', 'philosophy', 'initiatives', 'features', 'innovation'
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- 'a', 'b', 'c', 'd'
  explanation TEXT,
  difficulty INTEGER DEFAULT 1, -- 1=easy, 2=medium, 3=hard
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treasure_map_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quizzes" ON treasure_map_quizzes
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON treasure_map_quizzes
  FOR ALL USING (public.is_admin());
```

Seed the 55 questions from the Quiz Question Bank. Map them to categories:
- Category 1 (Economics, Q1-Q12) → map_id: 'general', category: 'economics'
- Category 2 (HEOHO, Q13-Q22) → map_id: 'general', category: 'philosophy'
- Category 3 (Sweet Sixteen, Q23-Q33) → map_id: 'general', category: 'initiatives'
- Category 4 (Features, Q34-Q45) → map_id: 'general', category: 'features'
- Category 5 (Innovation, Q46-Q55) → map_id: 'general', category: 'innovation'

All 55 questions with correct answers and options are in `BISHOP_DROPZONE/QUIZ_QUESTION_BANK_50_PLUS.md`.

---

## TASK 2: Onboarding Funnel Flow

### 2A: Quiz Results → Map Recommendation

Currently `TreasureMapResults.tsx` shows 3 recommended plays. Update it to:

1. Show the 3 plays (keep existing behavior)
2. Add a **primary CTA** for each play that links to the corresponding Treasure Map guide:
   - Map the play to its treasure map (e.g., "Breakfast Runner" play → `/treasure-maps/breakfast-runner`)
3. Add a **"Start This Journey"** button that:
   - Creates a `treasure_map_progress` row for the user (if logged in)
   - Navigates to `/treasure-maps/:mapId`
   - If not logged in, navigates anyway (progress saved after login)

### 2B: Map Guide → Phase Tracker

Update `TreasureMapGuide.tsx` to show progression state:

1. **Fetch progress** from `treasure_map_progress` for the current user + map
2. **Phase accordion** — show completed phases with a checkmark, current phase expanded, future phases collapsed
3. **Checklist within each phase** — each numbered step is a checkbox. State saved to `phase_data` JSONB:
   ```json
   {
     "scout": { "1": true, "2": true, "3": false, "4": false },
     "pitch": { "5": false, "6": false },
     "launch": {},
     "expand": {}
   }
   ```
4. **Phase completion** — when all steps in a phase are checked, auto-advance `current_phase` to next phase. Show a small celebration (confetti or checkmark animation).
5. **Tool links** — each step that mentions a tool (Storefront Builder, Cue Card Generator) should have an inline button linking to that tool.
6. At bottom of Scout phase, show a **"Ready to Pitch?"** gate — a 5-question mini-quiz drawn randomly from the quiz bank. Must score 3/5 to advance to Pitch phase. This uses the `treasure_map_quizzes` table.

### 2C: Progress Dashboard

Add a **"My Progress"** section to the existing Helm dashboard (`/helm`):

1. Show all active treasure maps with progress bars (phases completed / total)
2. Show current level per map (1-4)
3. Link to continue each map
4. Show total knowledge quiz score across all maps

Keep it simple — a card grid with progress indicators. This is an addition to Helm, not a new page.

---

## TASK 3: Knowledge Quiz Component

Build `TreasureMapKnowledgeQuiz.tsx` — reusable quiz component:

1. **Props**: `mapId: string`, `questionCount: number` (default 5), `onComplete: (score: number) => void`
2. **Fetch** random questions from `treasure_map_quizzes` where `map_id = mapId OR map_id = 'general'`
3. **UI**: Single question at a time, 4 radio options (a/b/c/d), "Next" button
4. **Scoring**: Track correct/incorrect, show results at end
5. **Marks**: Award Marks per the scoring guide:
   - 5/5 = 10 Marks
   - 4/5 = 8 Marks
   - 3/5 = 6 Marks
   - 2/5 = 4 Marks
   - 1/5 = 2 Marks
   - 0/5 = 0 Marks
6. **Max 3 attempts** per quiz per map. Track in `treasure_map_progress.quiz_attempts`
7. **Save** best score to `treasure_map_progress.quiz_score`

Follow the pattern from `AmbassadorCertificationQuiz.tsx` for UI structure and from `paperQuiz.ts` for scoring/attempts logic.

---

## TASK 4: SEC Language Fix

In `src/data/treasureMapGuides.ts` (or wherever the guide content lives), find and fix:

1. Any reference to "3% passive income" → change to "allocation authority through Backed Marks"
2. Any reference to "$900/mo passive income" → change to "growing allocation authority as your onboarded businesses thrive"
3. Any reference to "earn passive" → change to "earn allocation authority"
4. The economics tables should say "Backed Marks allocation authority from onboarding" not "passive income"

This is a compliance requirement. See Innovation #1897 (Backed Marks model).

---

## TASK 5: Wire First-Store Detection

When a user creates their first storefront through the Storefront Builder:

1. Check if they have an active `treasure_map_progress` row
2. If yes, auto-complete the "Build the online menu on LB" step in their Scout phase
3. Show a toast: "You just completed a Treasure Map step! Check your progress."
4. Update `last_activity_at`

This connects the Storefront Builder to the Treasure Map progression — the first time the two systems talk to each other.

Implementation: In the storefront creation success handler (wherever `storefronts` INSERT happens), add a check + update to `treasure_map_progress`.

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260322000010_treasure_map_progress.sql` | Progress table + quiz table + seed data |
| `src/components/treasure-map/TreasureMapKnowledgeQuiz.tsx` | Reusable quiz component |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/components/treasure-map/TreasureMapResults.tsx` | Add "Start This Journey" CTA → creates progress row |
| `src/pages/TreasureMapGuide.tsx` | Add phase tracker, checklist, progress fetch |
| `src/data/treasureMapGuides.ts` | SEC language fixes |
| `src/pages/TheHelm.tsx` | Add "My Progress" card grid |
| Storefront creation handler | Wire first-store detection to progress |

## FILES TO NOT TOUCH

- `TreasureMap.tsx` (the 10-question quiz) — works fine as-is
- `TreasureMapGame.tsx` (52-card game) — separate system
- `treasureMapEngine.ts` (scoring engine) — working correctly

---

## DEPLOY CHECKLIST

1. `npx supabase db push --linked` (migration)
2. Verify 55 quiz questions seeded in `treasure_map_quizzes`
3. Verify RLS on `treasure_map_progress` (user can only see own)
4. Test flow: Quiz → Results → "Start This Journey" → Map Guide with checklist → Knowledge Quiz
5. Test SEC language: no "passive income" anywhere in treasure map content
6. Deploy to Firebase: `firebase deploy --only hosting:main`

---

## SUCCESS CRITERIA

- [ ] New member can take quiz → see recommended map → start journey → track progress through phases
- [ ] Each phase has a clickable checklist that persists
- [ ] Knowledge quiz gates phase advancement (3/5 to pass)
- [ ] 55 questions in database, randomly drawn
- [ ] SEC language clean across all treasure map content
- [ ] Storefront creation auto-updates treasure map progress
- [ ] Helm shows "My Progress" for active maps
- [ ] Marks awarded for quiz completion (proportional scoring)

---

**This is the front door. When this works, every new member has a clear path from "what is this?" to "I just made my first sale."**

**FOR THE KEEP.**
