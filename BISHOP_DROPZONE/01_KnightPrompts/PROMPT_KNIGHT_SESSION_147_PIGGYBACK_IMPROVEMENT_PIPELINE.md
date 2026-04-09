# KNIGHT SESSION 147 — Piggyback Improvement Pipeline + STL Submission Flow + Tier Classification
## Bishop 036 | March 27, 2026
## Connects: K146 (Campaign Pages), K144 (HexIsle Downloads + tier system), K141 (X-Ray Bounty Arena), B011 (Open IP Model)

---

## CONTEXT

The Open IP model from B011 promises: "Download. Print. Improve. Get credited." Members download STL files, print them, test them, and submit improvements. Those improvements get classified into the 6-tier system (Tereno Certified → HexIsle Inspired) and the best ones become official products earning the contributor revenue share.

K144 built the HexIsle Downloads page with tier badges. K146 built the campaign pages with "Open Build" sections. K147 builds the SUBMISSION PIPELINE — where improvements actually flow in, get reviewed, get classified, and get credited.

This is the Piggyback Protocol — the community improvement engine that feeds Factory Nodes, strengthens patents, and turns downloaders into contributors.

**Depends on:** K146 (Campaign Pages), K144 (hexisle_downloads table + tier system), K141 (bounty system), K131 (Cue Card / IP Ledger), K124 (Process Pioneer).

---

## DELIVERABLE 1: Migration — `20260327000015_piggyback_submissions.sql`

```sql
-- K147: Piggyback Improvement Pipeline

-- Improvement submissions
CREATE TABLE IF NOT EXISTS piggyback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_download_id UUID REFERENCES hexisle_downloads(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  improvement_type TEXT NOT NULL CHECK (improvement_type IN (
    'tolerance_fix','print_orientation','fdm_optimization','material_change',
    'mechanism_redesign','new_function','aesthetic_improvement','assembly_simplification',
    'cost_reduction','other'
  )),
  stl_url TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  test_results TEXT,
  printer_used TEXT,
  material_used TEXT,
  print_settings TEXT,
  
  -- Classification
  proposed_tier TEXT CHECK (proposed_tier IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  assigned_tier TEXT CHECK (assigned_tier IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  
  -- Review
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted','under_review','approved','rejected','revision_requested','promoted'
  )),
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Rewards
  marks_awarded NUMERIC DEFAULT 0,
  is_process_pioneer BOOLEAN DEFAULT false,
  ip_ledger_entry TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE piggyback_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved submissions" ON piggyback_submissions 
  FOR SELECT USING (status IN ('approved','promoted') OR auth.uid() = submitter_id);
CREATE POLICY "Authenticated users submit" ON piggyback_submissions 
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Submitters update own" ON piggyback_submissions 
  FOR UPDATE USING (auth.uid() = submitter_id AND status IN ('submitted','revision_requested'));

-- Review queue for Founder/team
CREATE TABLE IF NOT EXISTS piggyback_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES piggyback_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approve','reject','request_revision','promote','assign_tier')),
  tier_assigned TEXT CHECK (tier_assigned IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE piggyback_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers manage reviews" ON piggyback_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Submitters read own reviews" ON piggyback_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM piggyback_submissions ps
      WHERE ps.id = piggyback_reviews.submission_id AND ps.submitter_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_piggyback_status ON piggyback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_piggyback_submitter ON piggyback_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_piggyback_tier ON piggyback_submissions(assigned_tier) WHERE assigned_tier IS NOT NULL;
```

---

## DELIVERABLE 2: Hooks — `usePiggyback.ts`

Create `/src/hooks/usePiggyback.ts`:

```typescript
// useSubmissions — CRUD for piggyback submissions
// - submitImprovement(data) → create submission with STL upload
// - getMySubmissions() → user's submissions with status
// - getApprovedSubmissions(downloadId?) → approved improvements for a piece
// - updateSubmission(id, data) → edit if status = submitted or revision_requested

// useReviewQueue — admin review workflow
// - getPendingReviews() → all submitted items awaiting review
// - reviewSubmission(submissionId, action, tier?, notes?) → approve/reject/promote
// - getReviewHistory(submissionId) → all review actions for a submission

// usePiggybackStats — community stats
// - getStats() → total submissions, approval rate, top contributors, tier distribution
// - getProcessPioneers() → first approved submission in each improvement_type category
```

---

## DELIVERABLE 3: Submission Page — `PiggybackSubmitPage.tsx`

Create `/src/pages/PiggybackSubmitPage.tsx` at route `/piggyback`:

**Layout (wizard flow):**

**Step 1: What Are You Improving?**
- Search/select from hexisle_downloads (the original piece)
- Or "New piece not in library" option
- Shows the original piece info: name, tier, thumbnail

**Step 2: What Did You Change?**
- Improvement type dropdown (10 categories from migration)
- Title (short description)
- Description (detailed explanation of what changed and why)
- Test results (what you tested, how it performed vs original)

**Step 3: Upload Evidence**
- STL file upload (drag and drop)
- Photo upload (multiple, drag and drop) — before/after comparison encouraged
- Video upload (optional — link to YouTube/etc)
- Printer used, material used, print settings (helps reproducibility)

**Step 4: Proposed Tier**
- Self-assessment: which tier do you think this qualifies for?
- Tier descriptions shown for reference
- "Not sure? We'll classify it for you."

**Step 5: Submit**
- Review summary
- "By submitting, you agree to the Piggyback Protocol: your improvement enters the IP Ledger and may be manufactured by the cooperative. You retain attribution and earn Marks + revenue share if promoted to production."
- Submit button → creates record → coin animation → "Submission received! You'll be notified when reviewed."

---

## DELIVERABLE 4: Review Dashboard — `PiggybackReviewPage.tsx`

Create `/src/pages/PiggybackReviewPage.tsx` at route `/dashboard/piggyback-review`:

**Admin-only page (check user_roles for admin):**

- Queue of pending submissions, sorted by date
- Each card shows: title, submitter, original piece, improvement type, proposed tier, photos
- Review actions: Approve / Reject / Request Revision / Promote to Production
- Tier assignment dropdown (can override submitter's self-assessment)
- Notes field for reviewer feedback
- On approve: auto-awards Marks (scale by tier: Inspired=25, Adaptable=50, Compatible=75, Official=100, Approved=150, Certified=200)
- On promote: creates new entry in hexisle_downloads at assigned tier + awards bonus Marks + triggers Process Pioneer check

---

## DELIVERABLE 5: My Submissions Dashboard — `MyPiggybackPage.tsx`

Create `/src/pages/MyPiggybackPage.tsx` at route `/dashboard/my-improvements`:

- List of user's submissions with status badges
- Submitted (blue), Under Review (amber), Approved (green), Rejected (red), Revision Requested (orange), Promoted (gold)
- Click to expand: full details, reviewer notes, marks awarded
- "Edit" button if status = submitted or revision_requested
- Stats: total submissions, approval rate, total Marks earned, tiers achieved

---

## DELIVERABLE 6: Routes and Navigation

**Routes:**
```
/piggyback → PiggybackSubmitPage
/dashboard/piggyback-review → PiggybackReviewPage (admin)
/dashboard/my-improvements → MyPiggybackPage
```

**Navigation:**
- HexIsle Downloads page: "Submit Improvement" button → /piggyback
- Dashboard sidebar: "My Improvements" with Wrench icon
- X-Ray Overlay: "Submit improvement" action → /piggyback
- Campaign pages "Open Build" section: link to /piggyback

---

## CRITICAL RULES

1. **IP Ledger entry on every approved submission.** Permanent. Timestamped. The contributor's name stays on the piece forever.
2. **Process Pioneer:** First approved submission in each improvement_type category earns the badge + 25 bonus Marks.
3. **Marks scale by tier:** Inspired=25, Adaptable=50, Compatible=75, Official=100, Approved=150, Certified=200.
4. **Promoted submissions** become new hexisle_downloads entries and feed the Campaign product pipeline.
5. **Revenue share:** Promoted pieces earn the 83.3% creator split when manufactured through a project-entity.
6. **No securities language.** "Revenue share" only used in the context of contractor compensation through project-entities (HexIsle LLC).

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `supabase/migrations/20260327000015_piggyback_submissions.sql` | CREATE |
| 2 | `src/hooks/usePiggyback.ts` | CREATE |
| 3 | `src/pages/PiggybackSubmitPage.tsx` | CREATE |
| 4 | `src/pages/PiggybackReviewPage.tsx` | CREATE |
| 5 | `src/pages/MyPiggybackPage.tsx` | CREATE |
| 6 | `src/App.tsx` | MODIFY (routes) |
| 7 | `src/components/AppSidebar.tsx` | MODIFY (nav) |

**7 files (5 new, 2 modified).**

---

**FOR THE KEEP.** 🏰
