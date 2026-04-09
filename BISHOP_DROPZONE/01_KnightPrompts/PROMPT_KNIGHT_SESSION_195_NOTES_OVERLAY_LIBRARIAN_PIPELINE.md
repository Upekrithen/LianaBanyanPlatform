# KNIGHT SESSION 195 — Content Notes Overlay + Librarian Processing Pipeline
## Priority: HIGH (Pairs with K194 Guided Tour)
## Depends on: K194 (Guided Tour Engine), XRayOverlay pattern, MoneyPenny, Librarian Guild (#2099)
## Bishop B051 | Innovation #2117

---

## CONTEXT

K194 builds the Guided Tour Engine. This session adds the **notes overlay** — a floating panel where users annotate any content item, save notes locally or submit them for cooperative review.

The XRayOverlay pattern (builder/XRayOverlay.tsx) already exists for the "You Can Do Better!" builder feedback system. We reuse that floating overlay pattern — but for ALL users, on ALL content, during the Guided Tour.

Submitted notes feed into MoneyPenny (AI categorization) → Staff of Librarians (human processing by domain). This is the feedback loop that makes Cephas a living knowledge system.

---

## TASK 1: Database — Notes Storage & Librarian Queue

### Migration: `tour_notes_system`

```sql
-- Personal notes (saved locally for anonymous, in DB for authenticated)
CREATE TABLE IF NOT EXISTS tour_notes_personal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_slug TEXT NOT NULL,
  item_title TEXT NOT NULL,
  content TEXT NOT NULL,
  detail_level TEXT, -- which level they were viewing at
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Submitted notes — for cooperative review
CREATE TABLE IF NOT EXISTS tour_notes_submitted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_slug TEXT NOT NULL,
  item_title TEXT NOT NULL,
  content TEXT NOT NULL,
  detail_level TEXT,
  -- MoneyPenny categorization
  category TEXT DEFAULT 'uncategorized'
    CHECK (category IN ('correction', 'suggestion', 'question', 'praise', 'criticism', 'idea', 'uncategorized')),
  -- Librarian routing
  section_librarian INTEGER -- 1-7, assigned by MoneyPenny based on content domain
    CHECK (section_librarian BETWEEN 1 AND 7),
  -- Processing state
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'categorized', 'assigned', 'processing', 'resolved', 'archived')),
  resolution TEXT, -- what the librarian did with it
  response_to_member TEXT, -- if we're responding to a question
  processed_by TEXT, -- which librarian or AI processed it
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Section Librarian assignments (maps content domains to sections)
CREATE TABLE IF NOT EXISTS librarian_section_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 7),
  section_name TEXT NOT NULL,
  categories TEXT[] NOT NULL, -- which cephas_content_registry sections map here
  description TEXT
);

ALTER TABLE tour_notes_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_notes_submitted ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own personal notes" ON tour_notes_personal
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can create submitted notes" ON tour_notes_submitted
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own submitted notes" ON tour_notes_submitted
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages all submitted notes" ON tour_notes_submitted
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_submitted_notes_status ON tour_notes_submitted(status);
CREATE INDEX idx_submitted_notes_section ON tour_notes_submitted(section_librarian);
CREATE INDEX idx_personal_notes_user_slug ON tour_notes_personal(user_id, item_slug);

-- Seed Section Librarian map
INSERT INTO librarian_section_map (section_number, section_name, categories, description) VALUES
(1, 'Economics & Currency', ARRAY['economics', 'currency-architecture', 'sacred-texts'], 'Three-Gear system, Cost+20%, Credits, Marks, Joules'),
(2, 'Letters & Outreach', ARRAY['letters', 'outreach'], 'Crown Letters, partnership letters, media pitches'),
(3, 'Initiatives & Programs', ARRAY['initiatives', 'The Fourteen Projects', 'rally-group'], 'Sweet Sixteen, Rally Group, HexIsle programs'),
(4, 'Technology & Architecture', ARRAY['architecture', 'Infrastructure', 'deployment', 'Configuration'], 'Yggdrasil, Bifrost, HELM, system architecture'),
(5, 'Legal & Compliance', ARRAY['Privacy', 'governance', 'Governance', 'IP Protection'], 'Patents, bylaws, privacy, regulatory'),
(6, 'Content & Articles', ARRAY['articles', 'pudding', 'academic', 'academic-papers', 'Academics', 'Academic Papers'], 'Articles, pudding essays, academic papers'),
(7, 'HexIsle & Manufacturing', ARRAY['hexisle', 'bounties', 'kickstarter', 'innovations'], 'HexIsle, Canister System, manufacturing, Kickstarter');
```

---

## TASK 2: Notes Overlay Component

**NEW FILE**: `platform/src/components/tour/NotesOverlay.tsx`

Reuse the XRayOverlay floating panel pattern:

```typescript
interface NotesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  itemSlug: string;
  itemTitle: string;
  detailLevel: string;
}
```

### Layout

```
┌────────────────────────────────┐
│  📝 Notes: [Item Title]    ✕  │
│  ─────────────────────────────│
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │   [textarea]             │ │
│  │   Write your notes...    │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                               │
│  Previous notes for this item:│
│  ┌──────────────────────────┐ │
│  │ • "Interesting how..."   │ │
│  │ • "Compare this to..."   │ │
│  └──────────────────────────┘ │
│                               │
│  ┌─────────────┬────────────┐ │
│  │ 💾 Save     │ 📤 Submit  │ │
│  │ (personal)  │ (for review│ │
│  └─────────────┴────────────┘ │
└────────────────────────────────┘
```

### Behavior

1. **Open**: Click pencil icon (📝) on any content item, or press `N` key
2. **Textarea**: Free-form writing, auto-saves draft to localStorage every 5 seconds
3. **Previous notes**: Shows any personal notes for this item
4. **Save (personal)**: Saves to `tour_notes_personal` (authenticated) or localStorage (anonymous)
5. **Submit (for review)**: Saves to `tour_notes_submitted`, shows confirmation: "Your note has been submitted for review by our Librarian team. If it's a question, you'll receive a response."
6. **Close**: `✕` button or `Esc` key
7. **Note indicator**: After saving, a small dot appears on the content item's card

---

## TASK 3: MoneyPenny Categorization Edge Function

**NEW FILE**: `supabase/functions/categorize-tour-note/index.ts`

Called via database trigger or direct invocation when a note is submitted.

```typescript
// Input: { note_id, content, item_slug, item_title }
// Process:
//   1. Analyze note content to determine category:
//      - "this is wrong" / "should be X" → 'correction'
//      - "what about" / "could you add" → 'suggestion'
//      - "why" / "how does" / "what is" → 'question'
//      - "great" / "love this" / "well done" → 'praise'
//      - "don't like" / "confusing" / "bad" → 'criticism'
//      - "what if" / "imagine" / "could be" → 'idea'
//   2. Look up item_slug's section in cephas_content_registry
//   3. Map section to librarian_section_map → get section_number
//   4. Update tour_notes_submitted: set category, section_librarian, status='categorized'
```

Simple keyword/pattern matching first (no LLM call needed — save costs). Can upgrade to LLM categorization later if accuracy matters.

---

## TASK 4: Librarian Dashboard (Admin)

**NEW FILE**: `platform/src/pages/LibrarianDashboardPage.tsx`

Route: `/admin/librarian` (ProtectedRoute, admin only)

Shows:
1. **Queue**: All notes with status='categorized' or 'assigned', grouped by section
2. **Stats**: Notes by category, by section, response rate, avg processing time
3. **Actions per note**:
   - Read note + context (which content item, what detail level)
   - Set resolution (incorporated, rejected, needs-discussion, escalated-to-founder)
   - Write response to member (for questions)
   - Mark as processed
4. **Filters**: By section, by category, by status, by date range

---

## TASK 5: Wire Notes Overlay into GuidedTourPage

In GuidedTourPage (from K194):
1. Add pencil icon (📝) to every content item's header
2. Add `N` keyboard shortcut to open notes overlay for current item
3. Show note indicator dots on items that have personal notes
4. Add notes count to progress display: "3 notes saved"

Also add the overlay to:
- CephasContentDetailPage (for non-tour content browsing)
- Any page that displays Cephas content

---

## TASK 6: Innovation Log

```sql
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (
  2117,
  'Content Notes Overlay with Librarian Processing Pipeline',
  'Floating overlay for annotating any content item during Guided Tour or content browsing. Dual-path: save locally as personal notes or submit for cooperative review. Submitted notes categorized by MoneyPenny (correction/suggestion/question/praise/criticism/idea), routed to 7 Section Librarians by content domain. Librarians process notes: incorporate corrections, answer questions (response sent to member), flag suggestions for Founder. Reuses XRayOverlay floating panel pattern.',
  'community',
  'implemented'
) ON CONFLICT (innovation_number) DO NOTHING;

UPDATE platform_canonical SET value = 2117, updated_at = now() WHERE key = 'innovation_count';

-- Crown Jewel: Notes Overlay + Librarian Pipeline
UPDATE innovation_log SET is_crown_jewel = true WHERE innovation_number = 2117;

-- Also mark #2115 as Crown Jewel
UPDATE innovation_log SET is_crown_jewel = true WHERE innovation_number = 2115;

-- Update crown jewel count: 161 + 2 = 163
UPDATE platform_canonical SET value = 163, updated_at = now() WHERE key = 'crown_jewel_count';
```

---

## CONSTRAINTS
- Notes overlay must work for anonymous users (localStorage) AND authenticated users (DB)
- MoneyPenny categorization uses keyword matching, NOT LLM calls (cost control)
- Librarian Dashboard is admin-only — members never see other people's notes
- If a member asks a question, the response appears in their Helm notifications
- Notes content is NEVER displayed publicly — it's internal cooperative feedback
- Keep the overlay lightweight — it should not block content consumption

---

## ACCEPTANCE CRITERIA
- [ ] tour_notes_personal, tour_notes_submitted, librarian_section_map tables created
- [ ] 7 sections seeded in librarian_section_map
- [ ] NotesOverlay component works on all content pages
- [ ] Personal notes save to DB (authenticated) or localStorage (anonymous)
- [ ] Submitted notes trigger MoneyPenny categorization
- [ ] LibrarianDashboardPage at /admin/librarian with queue + actions
- [ ] Note indicator dots on content items with saved notes
- [ ] `N` keyboard shortcut opens overlay
- [ ] Innovation #2117 logged as Crown Jewel
- [ ] Crown Jewel count updated to 163
- [ ] Build passes, deploy all 8 targets

---

*Knight Session 195 — Notes Overlay + Librarian Pipeline*
*Users annotate. MoneyPenny categorizes. Librarians process. Cephas evolves.*
*FOR THE KEEP!*
