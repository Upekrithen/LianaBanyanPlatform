# KNIGHT SESSION 278 — Vote Gate Public Progress Display
## Bishop B076 | April 4, 2026
## Source: Pawn B48 Distribution Strategy Analysis

---

## Mission

Implement public progress tracking for the BST vote gate: show members (and social audiences) how close each chapter is to unlocking its full paper on Cephas. Progress is measured as **aggregate engagement across all platforms** for a chapter's BST episodes, and displayed as both a live progress bar and periodic news-slot announcements.

## Why This Matters

Pawn B48 research: vote gates work psychologically (Zeigarnik effect, collective efficacy) when they're framed as **celebratory milestones**, not **paywalls**. Public progress display turns the gate from "waiting for something to open" into "we're building this together."

Key mechanics from B48:
- Count **mix of engagement** (likes, comments, shares, saves) — not single metric
- **Partial value BEFORE unlock** (BST episodes, Spoonfuls) — free substantive content
- **Public progress** displayed periodically ("Chapter 3 is 72% unlocked")
- Start with **low-to-moderate thresholds**, adjust after 2–3 chapters' baseline data

---

## Implementation

### Part 1 — Schema

```sql
-- Track chapter-level unlock thresholds and current progress
CREATE TABLE IF NOT EXISTS public.chapter_unlock_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL UNIQUE,  -- e.g. 'bst_ch_12_tca'
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  paper_slug TEXT NOT NULL,  -- the Cephas paper this unlocks
  engagement_threshold INTEGER NOT NULL DEFAULT 500,
  like_weight NUMERIC NOT NULL DEFAULT 1.0,
  comment_weight NUMERIC NOT NULL DEFAULT 3.0,
  share_weight NUMERIC NOT NULL DEFAULT 5.0,
  save_weight NUMERIC NOT NULL DEFAULT 2.0,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Raw engagement events from platform APIs (if tracked) or manual entry
CREATE TABLE IF NOT EXISTS public.chapter_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id TEXT NOT NULL REFERENCES public.chapter_unlock_config(chapter_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  episode_number INTEGER,
  event_type TEXT NOT NULL CHECK (event_type IN ('like','comment','share','save','view')),
  event_count INTEGER NOT NULL DEFAULT 1,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapter_engagement_chapter ON public.chapter_engagement_events(chapter_id);
CREATE INDEX idx_chapter_engagement_recorded ON public.chapter_engagement_events(recorded_at DESC);

ALTER TABLE public.chapter_unlock_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chapter unlock config" ON public.chapter_unlock_config FOR SELECT USING (true);
CREATE POLICY "Anyone can read engagement events" ON public.chapter_engagement_events FOR SELECT USING (true);
```

### Part 2 — Progress view

```sql
CREATE OR REPLACE VIEW public.chapter_unlock_progress AS
SELECT
  cuc.chapter_id,
  cuc.chapter_number,
  cuc.chapter_title,
  cuc.paper_slug,
  cuc.engagement_threshold,
  cuc.unlocked,
  cuc.unlocked_at,
  COALESCE(SUM(
    CASE e.event_type
      WHEN 'like' THEN e.event_count * cuc.like_weight
      WHEN 'comment' THEN e.event_count * cuc.comment_weight
      WHEN 'share' THEN e.event_count * cuc.share_weight
      WHEN 'save' THEN e.event_count * cuc.save_weight
      ELSE 0
    END
  ), 0) AS weighted_engagement,
  COALESCE(SUM(e.event_count) FILTER (WHERE e.event_type != 'view'), 0) AS raw_engagement,
  ROUND(
    LEAST(100, COALESCE(SUM(
      CASE e.event_type
        WHEN 'like' THEN e.event_count * cuc.like_weight
        WHEN 'comment' THEN e.event_count * cuc.comment_weight
        WHEN 'share' THEN e.event_count * cuc.share_weight
        WHEN 'save' THEN e.event_count * cuc.save_weight
        ELSE 0
      END
    ), 0) * 100.0 / NULLIF(cuc.engagement_threshold, 0))
  , 0) AS percent_unlocked
FROM public.chapter_unlock_config cuc
LEFT JOIN public.chapter_engagement_events e ON e.chapter_id = cuc.chapter_id AND e.event_type != 'view'
GROUP BY cuc.id;
```

### Part 3 — Auto-unlock trigger

```sql
CREATE OR REPLACE FUNCTION public.check_chapter_unlock()
RETURNS TRIGGER AS $$
DECLARE
  v_config public.chapter_unlock_config;
  v_weighted NUMERIC;
BEGIN
  SELECT * INTO v_config FROM public.chapter_unlock_config WHERE chapter_id = NEW.chapter_id;
  IF v_config.unlocked THEN RETURN NEW; END IF;

  SELECT COALESCE(SUM(
    CASE event_type
      WHEN 'like' THEN event_count * v_config.like_weight
      WHEN 'comment' THEN event_count * v_config.comment_weight
      WHEN 'share' THEN event_count * v_config.share_weight
      WHEN 'save' THEN event_count * v_config.save_weight
      ELSE 0 END
  ), 0) INTO v_weighted
  FROM public.chapter_engagement_events
  WHERE chapter_id = NEW.chapter_id AND event_type != 'view';

  IF v_weighted >= v_config.engagement_threshold THEN
    UPDATE public.chapter_unlock_config
      SET unlocked = true, unlocked_at = now(), updated_at = now()
      WHERE chapter_id = NEW.chapter_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chapter_unlock_check ON public.chapter_engagement_events;
CREATE TRIGGER chapter_unlock_check
  AFTER INSERT ON public.chapter_engagement_events
  FOR EACH ROW EXECUTE FUNCTION public.check_chapter_unlock();
```

### Part 4 — UI: Progress card component

Create a React component `ChapterUnlockProgress.tsx`:
- Reads from `chapter_unlock_progress` view via Supabase
- Displays: chapter number, title, progress bar (0–100%), current raw/weighted engagement vs threshold, paper slug (when unlocked, shows link)
- States: locked (with progress bar), unlocked (with celebratory unlock badge + link)
- Accepts optional `chapter_id` prop; if omitted, shows all active chapters

Place on:
- **Cephas chapter pages** — one card per chapter showing its own progress
- **Staff dashboard** — grid view of all chapters
- **News slot template** — injected progress card for high-progress chapters (>70%)

### Part 5 — News slot auto-generator

Add an edge function `generate-unlock-progress-update` (or cron job) that:
- Runs daily at a configurable time
- Finds chapters with progress between 50% and 99% (not yet unlocked)
- Generates news-slot posts like: *"Chapter 12 (Temporal Content Architecture) is 78% unlocked. Help us cross the line — every like, comment, share, and save counts."*
- Posts via Battery Dispatch news slot on selected platforms

### Part 6 — Seed data for current BST chapters

```sql
INSERT INTO public.chapter_unlock_config
  (chapter_id, chapter_number, chapter_title, paper_slug, engagement_threshold)
VALUES
  ('bst_ch_07_lighthouse_ladder', 7, 'The Lighthouse Ladder', 'lighthouse-ladder', 500),
  ('bst_ch_08_invisible_temperament', 8, 'The Invisible Temperament', 'invisible-temperament', 500),
  ('bst_ch_09_self_funding_economics', 9, 'Self-Funding Economics', 'self-funding-economics', 500),
  ('bst_ch_10_portable_reputation', 10, 'Portable Reputation', 'portable-reputation', 500),
  ('bst_ch_11_contingency_operators', 11, 'Contingency Operators', 'contingency-operators', 500),
  ('bst_ch_12_tca', 12, 'Temporal Content Architecture', 'temporal-content-architecture', 500)
ON CONFLICT (chapter_id) DO UPDATE SET updated_at = now();
```

Start with threshold = 500 weighted engagement (per Pawn B48's low-to-moderate recommendation). Adjust after baseline data from first 2–3 chapters.

### Part 7 — Engagement event ingestion (manual-first)

For now, engagement events can be **manually entered** via a staff dashboard form OR **bulk-imported via CSV** from platform analytics exports. Full API integration with X/Threads/LinkedIn APIs is a separate K### session.

Add a minimal admin UI to `platform/src/pages/staff/` for inserting engagement events with: chapter_id (dropdown), platform, episode_number, event_type, event_count.

---

## Deliverables

1. **Migration**: `platform/supabase/migrations/20260404000032_chapter_unlock_progress.sql` (tables + view + trigger + seed)
2. **Component**: `platform/src/components/cephas/ChapterUnlockProgress.tsx`
3. **Admin UI**: `platform/src/pages/staff/ChapterEngagementInput.tsx` (minimal form for manual event entry)
4. **Edge function** (optional this session): `generate-unlock-progress-update` for news-slot automation
5. **Verification**:
   - Insert test engagement events for `bst_ch_12_tca`, verify `percent_unlocked` updates in view
   - Cross threshold, verify `unlocked = true` and `unlocked_at` populates
   - Render progress card on a test Cephas chapter page

---

## Context References

- **Pawn B48**: `BISHOP_DROPZONE/PAWN_B48_DISTRIBUTION_STRATEGY_ANALYSIS.md` (§6 Vote Gate Psychology, §8 Implementation)
- **Canonical context**: `BISHOP_DROPZONE/PAWN_B47_CANONICAL_CONTEXT_BLOCK_B076.md`

*Knight: execute end-to-end. FOR THE KEEP.*
