# KNIGHT SESSION 272 — Pudding Hot Pepper Rating System
## Bishop B075 | April 4, 2026

---

## MISSION

Build a "Hot Pepper" rating system for Puddings that activates after 100 views and tracks reader-rated heat/engagement. This gives Bishop and the Founder a feedback loop on which Puddings land and which are dry.

---

## CONTEXT

120+ Puddings exist in `cephas_puddings`. The Founder wants to know which ones are hitting and which are missing. A rating system prevents guessing and informs future Pudding production. Rating activates only AFTER 100 views to ensure statistical meaning.

The Pepper spice (from the Ten Spices taxonomy) maps to Legal/Compliance — but the visual hot-pepper metaphor is universal. 1 pepper = mild/dry, 5 peppers = scorching hot.

---

## DELIVERABLES

### 1. Database Migration

```sql
-- Add rating columns to cephas_puddings
ALTER TABLE cephas_puddings
ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pepper_rating_avg NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS pepper_rating_count INT DEFAULT 0;

-- Create ratings table
CREATE TABLE IF NOT EXISTS pudding_pepper_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pudding_number INT NOT NULL REFERENCES cephas_puddings(pudding_number),
  rater_id UUID, -- member who rated (NULL for anonymous)
  pepper_count INT NOT NULL CHECK (pepper_count BETWEEN 1 AND 5),
  comment TEXT, -- optional short reaction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pudding_number, rater_id)
);

CREATE INDEX idx_pepper_ratings_pudding ON pudding_pepper_ratings(pudding_number);

-- Auto-activate rating after 100 views (trigger)
CREATE OR REPLACE FUNCTION activate_pudding_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.view_count >= 100 AND OLD.rating_active = FALSE THEN
    NEW.rating_active := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pudding_rating_activation
  BEFORE UPDATE ON cephas_puddings
  FOR EACH ROW
  EXECUTE FUNCTION activate_pudding_rating();
```

### 2. View Counter

Edge function `track-pudding-view`:
- POST { pudding_number, viewer_id? }
- Increments view_count
- Returns { view_count, rating_active, pepper_rating_avg }

Or: direct client-side increment on page load (with rate limiting).

### 3. Rating UI Component

`PuddingPepperRating.tsx`:
- Only renders if `rating_active === true`
- Shows 5 pepper icons (🌶️) — user clicks 1-5
- After submission, shows: "You rated: [N] peppers. Average: [X.X] from [count] raters"
- Member rating (authenticated): stored with rater_id, one-per-member per-pudding
- Anonymous rating: also allowed, stored with NULL rater_id

### 4. Rating Aggregator

Edge function `aggregate-pudding-ratings` (runs hourly via cron):
- For each pudding with new ratings: recompute pepper_rating_avg and pepper_rating_count
- Update cephas_puddings row

### 5. Dashboard Panel

Add to staff dashboard (e.g., `/staff/social-media` or a new `/staff/pudding-analytics`):
- Table of Puddings sorted by rating (hottest → coldest)
- Columns: #, Title, Views, Rating, Rater Count, Date Published
- Filter: only show rating_active = true
- Visual: 🌶️ icons showing avg rating

---

## VISUAL DESIGN

```
┌─────────────────────────────────────────┐
│ Pudding #108 — The Spice Must Flow      │
│                                         │
│ How hot was this? (rate after reading)  │
│                                         │
│  🌶️  🌶️  🌶️  🌶️  🌶️                │
│  (click 1-5 to rate)                    │
│                                         │
│ Current average: 🌶️🌶️🌶️🌶️ 4.2       │
│ From 247 raters                         │
└─────────────────────────────────────────┘
```

---

## ACCEPTANCE CRITERIA

- [ ] Migration deployed (columns + table + trigger)
- [ ] View counter increments properly
- [ ] Rating UI appears only after 100 views
- [ ] Authenticated users can rate once per Pudding
- [ ] Anonymous ratings accepted
- [ ] Aggregator updates averages hourly
- [ ] Dashboard shows sorted Puddings by rating
- [ ] `npm run build` passes

---

## DO NOT

- Show ratings before 100 views (avoid small-sample bias)
- Allow multiple ratings per authenticated user per Pudding
- Delete or alter rating data once submitted
- Reduce the 100-view threshold without Founder approval
