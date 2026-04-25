# Puzzle Rotation Content Schedule
## K501 / B124 — Phase A.3 Operational Scaffold

**Purpose:** Rolling 30-day content supply plan for the three shareable puzzle classes.
This file is a Founder-fillable operational scaffold. Content generation is a human/Pawn task.

---

## Rotation Cadence

| Puzzle Class | Rotation Frequency | Advance Notice Required |
|---|---|---|
| `golden_keys_treasure_map` | Every 30 days | 7 days before current expires |
| `codebreakers` | Every 30 days | 7 days before current expires |
| `six_sparks_path` | Every 30 days | 7 days before current expires |

**The system alerts content-ops 7 days before a variant expires** via the `checkRotationsDue()` cron result.
Content must be ready to load into `puzzle_content_rotation` before the current variant's `active_until`.

---

## Content Supply Pipeline

### Step 1: Receive alert (Day −7)
The `rotate_puzzles_daily` cron returns a list of puzzle classes with expiring variants.
Content-ops receives this alert and begins creating the next variant.

### Step 2: Draft new variant (Days −7 to −2)
For each puzzle class:
- Create new questions/challenges (must differ meaningfully from current variant)
- Hash the answer key (never store raw answers in `content_payload`)
- Set `expected_completion_time_seconds` based on difficulty calibration

### Step 3: Load into rotation table (Day −1 or earlier)
Use the `queueNextRotation()` helper or direct SQL insert:
```sql
INSERT INTO puzzle_content_rotation
  (puzzle_class, content_payload, active_from, active_until, expected_completion_time_seconds)
VALUES
  ('codebreakers', '{"version": N, "questions": [...], "answer_hash": "..."}',
   '<current_active_until>', '<current_active_until + 30 days>', <seconds>);
```

### Step 4: Verify (Day 0 — rotation day)
- Confirm `getActivePuzzle('codebreakers')` returns the new variant
- Spot-check completion flow works with new content
- Archive old variant (update status or just rely on `active_until` expiry)

---

## 30-Day Schedule Template

> **Founder: fill in content variant names/themes for each slot.**
> Dates below are relative (Week 1 = first rotation cycle after K501 deploys).

| Slot | Puzzle Class | Approximate Active Window | Content Theme | Status |
|------|-------------|---------------------------|---------------|--------|
| R1 | golden_keys_treasure_map | Week 1–4 | _(Founder fills)_ | ⬜ Planned |
| R1 | codebreakers | Week 1–4 | _(Founder fills)_ | ⬜ Planned |
| R1 | six_sparks_path | Week 1–4 | _(Founder fills)_ | ⬜ Planned |
| R2 | golden_keys_treasure_map | Week 5–8 | _(Founder fills)_ | ⬜ Planned |
| R2 | codebreakers | Week 5–8 | _(Founder fills)_ | ⬜ Planned |
| R2 | six_sparks_path | Week 5–8 | _(Founder fills)_ | ⬜ Planned |
| R3 | golden_keys_treasure_map | Week 9–12 | _(Founder fills)_ | ⬜ Planned |
| R3 | codebreakers | Week 9–12 | _(Founder fills)_ | ⬜ Planned |
| R3 | six_sparks_path | Week 9–12 | _(Founder fills)_ | ⬜ Planned |
| R4 | golden_keys_treasure_map | Week 13–16 | _(Founder fills)_ | ⬜ Planned |
| R4 | codebreakers | Week 13–16 | _(Founder fills)_ | ⬜ Planned |
| R4 | six_sparks_path | Week 13–16 | _(Founder fills)_ | ⬜ Planned |

---

## Content Design Constraints

To prevent answer-sharing across rotation boundaries:
1. **Questions must differ substantively** — not just paraphrase. Different topics preferred.
2. **Answer format should change** — multiple choice in R1, open-ended in R2, etc.
3. **Hints must not recycle** between variants of the same class.
4. **Expected completion time** should be calibrated: if the 5th-percentile of population completes in < X seconds, that's the anomaly threshold. Set `expected_completion_time_seconds` accordingly.

---

## Velocity Anomaly Monitoring

The `recordPuzzleCompletion()` system flags completions where:
- Completion time < 5th percentile for the puzzle class, AND
- Member account age < 30 days

**Review queue:** `/api/admin/spark_velocity_anomalies`

Flags are for human curator review only. Curator workflow:
1. Review flagged completion in the Upekrithen admin panel
2. If coordinated sharing is evident: revoke Spark credits, apply note to member record
3. If legitimate (member is just fast/experienced): unflag, no action
4. Document pattern for content-ops to adjust next rotation complexity

---

*Scaffold generated K501/B124. Founder to populate content slots. Content generation is not an AI task.*
