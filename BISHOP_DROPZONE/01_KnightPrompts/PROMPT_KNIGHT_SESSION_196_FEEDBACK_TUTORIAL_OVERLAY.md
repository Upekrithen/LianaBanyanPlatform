# KNIGHT SESSION 196 — Interactive Feedback Tutorial Overlay
## Priority: HIGH (First-visit experience)
## Depends on: K195 (Notes Overlay + Librarian Pipeline)
## Bishop B051 | Innovation #2118 (Crown Jewel)

---

## CONTEXT

K195 builds the Notes Overlay system — users can annotate any content item, save notes or submit for cooperative review. K196 builds the **tutorial** that teaches users HOW to use that system on their very first visit.

Currently, the first thing visitors see is the LRH (Little Red Hen) Fable slideshow. That stays — but now it's wrapped in an interactive tutorial overlay that teaches the feedback mechanism BY HAVING THE USER PRACTICE ON THE FABLE.

The Founder's directive: "The first thing they see should be 'FEEDBACK REQUESTED' with the overlay already in place, showing them how to use it."

---

## TASK 1: Database — Sequential Submission Numbers + Tutorial Preference

### Migration

```sql
-- Add sequential submission number to tour_notes_submitted
-- This gives every piece of feedback a trackable ID visible to the user
ALTER TABLE tour_notes_submitted 
  ADD COLUMN IF NOT EXISTS submission_number SERIAL;

-- Create unique index on submission_number for display
CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_submission_number 
  ON tour_notes_submitted(submission_number);

-- User preferences table (lightweight, extensible)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT 'true'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, key)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- For anonymous users, tutorial dismissal uses localStorage key:
-- feedback_tutorial_dismissed = true
```

---

## TASK 2: FeedbackTutorialOverlay Component

**NEW FILE**: `platform/src/components/tour/FeedbackTutorialOverlay.tsx`

### Props

```typescript
interface FeedbackTutorialOverlayProps {
  onDismiss: () => void; // called when tutorial completes or is dismissed
}
```

### State Machine

The tutorial has 4 states:

```typescript
type TutorialStep = 'welcome' | 'click_item' | 'write_submit' | 'thank_you';
```

### Step 1: WELCOME ("Like This")

**Full-screen semi-transparent overlay (z-50)** over the entire page.

The existing LRH Fable slideshow plays UNDERNEATH the overlay — visible through the semi-transparency. The fable component renders normally; the overlay sits on top.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ╔══════════════════════════════════════════════════╗    │
│  ║  FEEDBACK REQUESTED                              ║    │
│  ║                                                   ║    │
│  ║  You're exploring a live alpha preview that       ║    │
│  ║  actually works, but we need YOUR feedback        ║    │
│  ║  to shape how we continue.                        ║    │
│  ║                                                   ║    │
│  ║  Let us show you how easy it is.                  ║    │
│  ║                                                   ║    │
│  ║         [ Show Me How ]                           ║    │
│  ╚══════════════════════════════════════════════════╝    │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │                                              │       │
│  │    🐔 LRH Fable Slideshow (playing)          │       │
│  │    (visible through overlay, slightly dimmed) │       │
│  │                                              │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Button**: "Show Me How" → advances to Step 2.

### Step 2: CLICK_ITEM ("Click Item")

The overlay adjusts — a **spotlight cutout** opens around the LRH Fable slideshow box (the fable is now fully visible, not dimmed). Everything else stays dimmed.

**Instructional elements:**

```
┌─────────────────────────────────────────────────────────┐
│  (dimmed background)                                     │
│                                                          │
│     ╔═══════════════════════╗                           │
│     ║  CLICK THIS ITEM  ▼  ║   ← Big text + animated   │
│     ╚═══════════════════════╝     bouncing arrow         │
│                                   pointing DOWN at       │
│  ┌──────────────────────────┐     the fable box          │
│  │                          │                            │
│  │  🐔 LRH Fable Slideshow │  ← SPOTLIGHT (fully lit)  │
│  │     (playing normally)   │                            │
│  │                          │                            │
│  └──────────────────────────┘                            │
│                                                          │
│  (dimmed background)                                     │
└─────────────────────────────────────────────────────────┘
```

**The animated arrow**: CSS animation — bounces up and down, pointing at the fable box. Use a large SVG arrow or a Lucide `ArrowDown` icon at 48px+ with `animate-bounce`.

**User interaction**: The user must CLICK the fable box. The tutorial listens for clicks inside the spotlight area. When the user clicks the fable → the Notes Overlay (from K195) opens on the fable item → tutorial advances to Step 3.

**If user clicks outside spotlight**: Nothing happens (or subtle pulse on the arrow to redirect attention).

### Step 3: WRITE_SUBMIT ("Write & Submit")

The Notes Overlay is now OPEN on the fable (from K195's NotesOverlay component). The tutorial overlay adjusts to show instructional text around the notes panel:

```
┌─────────────────────────────────────────────────────────┐
│  (dimmed background)                                     │
│                                                          │
│  ┌──────────────────────┐  ╔═══════════════════════╗   │
│  │                      │  ║                       ║   │
│  │  🐔 LRH Fable       │  ║  Write what you want  ║   │
│  │  (still playing)     │  ║  in the Textbox, and  ║   │
│  │                      │  ║  hit "Ok" to submit   ║   │
│  └──────────────────────┘  ║                       ║   │
│                             ╚═══════════════════════╝   │
│  ┌──────────────────────────────────────┐               │
│  │  📝 Notes: The Little Red Hen        │  ← SPOTLIGHT │
│  │  ┌──────────────────────────────┐    │               │
│  │  │  [textarea — user types]     │    │               │
│  │  └──────────────────────────────┘    │               │
│  │          [ Ok ]                      │               │
│  └──────────────────────────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**The NotesOverlay textarea** is real — the user can actually type. They can also leave it blank and just hit OK.

**When user clicks OK**:
1. The note is submitted via K195's submission pipeline (or skipped if blank)
2. The submission gets a sequential number from `tour_notes_submitted.submission_number`
3. Tutorial advances to Step 4

### Step 4: THANK_YOU

The overlay shows the confirmation:

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ╔══════════════════════════════════════════════════╗    │
│  ║                                                   ║    │
│  ║         SAVED as 00000129                         ║    │
│  ║                                                   ║    │
│  ║  Your feedback has been received and will be      ║    │
│  ║  reviewed by our team.                            ║    │
│  ║                                                   ║    │
│  ║  You can leave feedback on ANY item, anytime,     ║    │
│  ║  by clicking the 📝 icon or pressing N.           ║    │
│  ║                                                   ║    │
│  ╚══════════════════════════════════════════════════╝    │
│                                                          │
│                                                          │
│         Thank you!                                       │
│                                                          │
│         ☐ Do not show these directions again             │
│                                                          │
│                   [ Continue ]                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Sequential number**: Zero-padded 8-digit from the `submission_number` column. If the user submitted a blank note (skipped), show "Thank you!" without the SAVED number, and instead show "You can submit feedback anytime."

**"Do not show again" checkbox**:
- If checked + authenticated: saves to `user_preferences` (key: `feedback_tutorial_dismissed`, value: `true`)
- If checked + anonymous: saves to `localStorage.setItem('feedback_tutorial_dismissed', 'true')`
- If unchecked: tutorial will show again next visit

**Continue button**: Closes overlay, tutorial complete, page loads normally.

---

## TASK 3: Wire Tutorial into First-Visit Experience

### Where it triggers

In the main app layout (AppShell.tsx or equivalent), on mount:

```typescript
const [showTutorial, setShowTutorial] = useState(false);

useEffect(() => {
  const dismissed = localStorage.getItem('feedback_tutorial_dismissed');
  if (dismissed === 'true') return;
  
  // If authenticated, check user_preferences
  if (user) {
    supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'feedback_tutorial_dismissed')
      .single()
      .then(({ data }) => {
        if (!data) setShowTutorial(true);
      });
  } else {
    setShowTutorial(true);
  }
}, [user]);
```

### Integration with existing first-visit content

The LRH Fable slideshow component (`LemonadeStandFlipbook.tsx` or `OriginStoryFlipbook.tsx`) should be visible on the page UNDERNEATH the tutorial overlay. The tutorial doesn't replace the fable — it uses it as demo content.

Check which component renders on the landing page (`/` or Index.tsx) and ensure it renders the fable in a position that the tutorial can spotlight.

---

## TASK 4: Replace Beta Banner Text

Find the existing banner that says:
> "You're exploring a preview, some features are coming soon, and your feedback shapes what we build."

Replace with:
> **FEEDBACK REQUESTED** — You're exploring a live alpha preview that actually works, but we need YOUR feedback to shape how we continue.

This is likely in `BetaBanner.tsx` or a similar component. The text change applies whether the tutorial is showing or not — it's the permanent banner.

---

## TASK 5: Submission Number Display Utility

Create a helper for formatting submission numbers:

```typescript
// platform/src/lib/formatSubmissionNumber.ts
export function formatSubmissionNumber(n: number): string {
  return n.toString().padStart(8, '0');
}
// formatSubmissionNumber(129) → "00000129"
```

Use this in:
- The tutorial Step 4 ("SAVED as 00000129")
- The NotesOverlay confirmation (K195 — when user submits any note, show the number)
- The LibrarianDashboard (K195 — show submission numbers in the queue)

---

## TASK 6: Innovation Log

```sql
INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES (
  2118,
  'Interactive Feedback Tutorial with Sequential Tracking',
  'First-visit interactive tutorial overlay teaching the cooperative feedback mechanism. Three guided steps: (1) welcome with FEEDBACK REQUESTED banner over live content, (2) spotlight + animated arrow directing user to click content item, (3) notes overlay opens for user to write and submit. Submissions get sequential 8-digit numbers (SAVED as 00000129) visible to user. Dismissable with persistent do-not-show preference. Feeds into MoneyPenny categorization → Librarian Guild processing pipeline.',
  'user_experience',
  'implemented',
  true
) ON CONFLICT (innovation_number) DO NOTHING;

UPDATE platform_canonical SET value = 2118, updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 164, updated_at = now() WHERE key = 'crown_jewel_count';
```

---

## CONSTRAINTS
- The LRH Fable slideshow STAYS — it's demo content, not replaced
- Tutorial is INTERACTIVE (Option B) — user clicks, not simulated
- Anonymous users can complete the tutorial (localStorage persistence)
- Blank submissions are allowed (user can skip writing)
- Sequential numbers never reset, never reuse — they're permanent IDs
- The tutorial should not block page rendering — it's an overlay, the page loads underneath
- Mobile responsive — all steps must work on phone screens
- Do NOT use any third-party tour library (Shepherd, Intro.js) — build native with React + CSS animations

---

## ACCEPTANCE CRITERIA
- [ ] `submission_number SERIAL` column added to `tour_notes_submitted`
- [ ] `user_preferences` table created with RLS
- [ ] FeedbackTutorialOverlay component with 4 steps
- [ ] Step 1: Welcome screen with "FEEDBACK REQUESTED" + fable visible
- [ ] Step 2: Spotlight on fable + animated bouncing arrow + user clicks
- [ ] Step 3: Notes overlay opens on fable + instructional text
- [ ] Step 4: "SAVED as 00000129" confirmation + "Do not show again" checkbox
- [ ] Tutorial triggers on first visit, respects dismissal preference
- [ ] Beta banner text updated to "FEEDBACK REQUESTED" message
- [ ] `formatSubmissionNumber` utility created and used
- [ ] Innovation #2118 logged as Crown Jewel
- [ ] Crown Jewel count updated to 164
- [ ] Build passes, deploy all 8 targets

---

*Knight Session 196 — Interactive Feedback Tutorial*
*First thing they see. Learn by doing. Every voice gets a number.*
*FOR THE KEEP!*
