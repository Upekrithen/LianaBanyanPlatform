# Knight Session 11B — Bishop Handoff
## March 13, 2026

---

## CONTEXT

Session 11 main build is done (WelcomeGate, SA landing, cue cards, HexIsle). Session 11B innovations (#1600-#1613) are threshed and pushed. The LMD pipeline strategy is decided (see `LMD_STRATEGY_DECISIONS_SESSION_11B.md`).

This handoff contains implementation tasks from Bishop's strategy decisions.

---

## TASK 1: Apply Pending Migration

```bash
cd platform && npx supabase db push --linked
```

This applies:
- `20260313000010_lmd_charitable_buffer_marks_reservation_reviews.sql`
- `20260313000011_innovation_log_session_11b.sql`

---

## TASK 2: Marks Reservation Phase Column

Add `reservation_phase` to `marks_reservation` table.

**Migration:** `20260313000012_marks_reservation_phase.sql`

```sql
-- Add reservation_phase for two-step conversion (hotel-style hold)
-- See BISHOP_DROPZONE/LMD_STRATEGY_DECISIONS_SESSION_11B.md Section 3

ALTER TABLE marks_reservation
ADD COLUMN IF NOT EXISTS reservation_phase TEXT
  NOT NULL DEFAULT 'full_hold'
  CHECK (reservation_phase IN ('full_hold', 'grocery_deducted', 'delivery_completed'));

COMMENT ON COLUMN marks_reservation.reservation_phase IS
  'Two-step conversion: full_hold → grocery_deducted (50% charged at LGG lead time) → delivery_completed (remaining 50% at fulfillment)';
```

---

## TASK 3: LMD Config Additions (dna_lock)

**Same migration or new one — Knight's call:**

```sql
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('lmd_ondemand_release_window_days', '14', 'integer', true, 'bishop', 'Days stored meals stay in On-Demand Available before charitable release', 'lmd'),
  ('larder_base_credits_month', '50', 'integer', true, 'bishop', 'Base monthly Credits per chest freezer for Larder Keeper bounty', 'lmd'),
  ('larder_per_meal_day_credits', '0.25', 'decimal', true, 'bishop', 'Credits per meal per day stored (variable component of Larder Keeper bounty)', 'lmd'),
  ('larder_fifo_bonus_credits', '10', 'integer', true, 'bishop', 'Monthly FIFO compliance bonus for Larder Keepers (zero spoilage)', 'lmd')
ON CONFLICT (parameter_key) DO NOTHING;
```

---

## TASK 4: Palate Guild Seed

Add to the official guilds:

```sql
INSERT INTO guilds (name, slug, description, guild_type, category, is_official)
VALUES (
  'Palate Guild',
  'palate-guild',
  'Food reviewers who test recipes and provide quality feedback. Rank progression: Nibbler → Taster → Sampler → Connoisseur → Sommelier → Grand Palate.',
  'skill',
  'quality',
  true
)
ON CONFLICT (slug) DO NOTHING;
```

---

## TASK 5: Thresh One More Innovation

From the "No Atomo" paper addition (see `INNOVATION_NO_ATOMO_AI_COLLABORATION_VALUE.md`):

```sql
INSERT INTO innovation_log (innovation_number, title, description, status, patent_bag)
VALUES (
  1614,
  'Directed-Thought ROI in Human-AI Collaboration',
  'The theorem that a founder''s strategic prompt (~$0.10 in tokens) produces orders of magnitude more value than the cost of wrong implementations it prevents. Demonstrated: 14 innovations from one conversational message. The directed thought is the highest-value resource in human-AI collaboration.',
  'pending',
  'Single Provisional'
)
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;
```

**Update count to 1,614** across all locations per `INNOVATION_COUNT_LOCATIONS.md`.

---

## TASK 6: Crown Letter Count Update (Platform Copies)

Bishop already updated the `01 MarkupFiles/CANONICAL/` copies to 1,613. Once Task 5 brings the count to 1,614, Knight should update:
- `platform/src/data/crown-letters/LOCKED_TOM_SIMON_CFO.md` → 1,614
- All platform src files that Knight's propagation script touches

(Bishop will re-update the `01 MarkupFiles/CANONICAL/` copies after Knight confirms.)

---

## TASK 7: Commit and Push

```
feat: Session 11B — reservation phase, Palate Guild, Larder config, innovation #1614
```

---

## PRIORITY ORDER

1 → 2 → 3 → 4 → 5 → 6 → 7

Tasks 2-5 can be in a single migration if Knight prefers.

---

*Handoff by Bishop. March 13, 2026.*
*FOR THE KEEP.*
