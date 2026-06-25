# BISHOP ANALYSIS · EMPRESS CAMPAIGN DATES · EVENT-DRIVEN vs ROLLING COHORTS
## BP092 · Bishop SEG · Sonnet 4.6 · 2026-06-22
## For Founder review — one recommendation at end

---

## CONTEXT

Founder Q10 answer (verbatim): "NOT time-driven, EVENT-driven. Starts ASAP, ends when we have 10k users.
OR (I like this better) we have another one every week. Or better - we start another one every week,
and they finish every 3 weeks, so we always have three going."

Three structural options below. One recommendation at the end.

---

## OPTION A · Single Campaign · Starts ASAP · Ends at 10k Members

**Structure:** One campaign. Opens immediately. Closes when membership hits 10,000. One Empress
crowned at end. One winner draw for 60 slots.

**Pros:**
- Operationally simple — one set of tables, one leaderboard, one draw.
- Clean narrative arc: "The campaign that crowned the Empress" — single historical event.
- No concurrent leaderboard state to manage.
- Press story is singular and powerful: "10,000 members chose her name."

**Cons:**
- Late entrants are structurally disadvantaged — a member who joins at 9,800 has days to
  compete; a day-one member has the full runway. Fairness perception problem.
- No recurring engagement spike or Press cadence. One launch, one close, quiet in between.
- If 10k takes 6 months, the campaign feels stale by month 3. No freshness mechanism.
- All prize load lands on one date — operational concentration risk.

---

## OPTION B · Perpetual Rolling Cohorts · New Cohort Weekly · Always 3 Concurrent

**Structure:** Open one new cohort per week. Each runs 3 weeks. From week 3 onward: always
3 cohorts running. Each cohort = own leaderboard, own winner draw, own Empress candidate pool.
Perpetual until membership hits 10k (or Founder calls it).

**Pros:**
- Continuous Press cadence — new cohort = new story every 7 days. Consistent drumbeat.
- Late entrants always have a fresh cohort. No "I missed it" barrier. Lowers join friction.
- Distributes prize load — one cohort closes per week, manageable.
- Multiple Empresses crowned over time (or multiple name candidates surfaced for final vote).
- "Always 3 going" creates the sense that the campaign is alive and ongoing.

**Cons:**
- Backend complexity: multiple concurrent campaign_ids, concurrent leaderboard state, cohort
  overlap logic (which cohort does a proposal join?).
- Prize pool math is non-obvious: 60 winners per cohort (expensive at scale) vs 60 winners
  total across all cohorts (allocation math needed). Founder must choose.
- Risk of "the campaign never ends" fatigue if not paired with a clear 10k milestone celebration.
- If cohorts run perpetually with their own 60-winner draws, total prize cost scales with
  number of cohorts. Budget planning needed.

---

## OPTION C (BISHOP RECOMMENDATION) · Hybrid · Cohort 1 Solo → Rolling from Week 2

**Structure:**

- **Week 1:** Cohort 1 opens. Runs alone for its first week. Clean launch narrative.
- **Week 2:** Cohort 1 (week 2) + Cohort 2 opens. Now 2 concurrent.
- **Week 3:** Cohort 1 (week 3, final) + Cohort 2 (week 2) + Cohort 3 opens. Now 3 concurrent.
- **Week 4:** Cohort 1 CLOSES + winner draw (first Empress crowned). Cohort 4 opens. Perpetual
  rolling 3 from here.

**Pros — why this is better than A or B:**

1. **Founder gets a clean week-1 narrative.** First cohort launches alone. Full Press focus on
   the launch. "The campaign to name the Empress is live." Undivided attention.

2. **Founder gets the rolling engine.** From week 4 onward: every week a new cohort opens and
   an old one closes. Continuous cadence without losing the launch moment.

3. **First Empress crowned at week 4** — a concrete milestone. The first winner is a major event.
   Subsequent closings are smaller celebration beats. Escalating rhythm rather than a single peak.

4. **Operationally gentler ramp.** Week 1 = one cohort (simple ops). Week 2 = two (learn).
   Week 3 = three (full load). By the time rolling is perpetual, the team has 3 weeks of
   operational experience.

5. **Late entrants enter Cohort 2 or 3** — never disadvantaged vs Cohort 1's full-duration members.

**Cons / tradeoffs:**

- Still requires cohort data model complexity (though simpler than Option B at launch, since
  you ramp into it).
- Founder must decide: 60 winners per cohort, or 60 total? Bishop proposes: **60 winners total
  across all cohorts forever; each cohort awards a proportional slice based on that cohort's
  eligible-member participation count at close.** Formula: cohort_winner_slots = ROUND(60 ×
  cohort_member_count / cumulative_total_members). Founder confirms or overrides.

---

## RECOMMENDATION

**Option C (Hybrid).**

Run Cohort 1 solo for the full first week — clean launch story. Start Cohort 2 in week 2.
Start Cohort 3 in week 3. From week 4: perpetual rolling 3, one new cohort per week, one
closing per week.

Prize pool: 60 total winners distributed proportionally across cohorts. Each cohort's winner
count scales with that cohort's participation, not a fixed 60 per cohort. Founder confirms
or overrides the prize math.

10k event gate still applies: when membership hits 10,000, Founder calls the final cohort
close. The last cohort is a named celebration event ("The Final Court"). All concurrent
cohorts at that moment close simultaneously with their own draws.

**Implementation note for Knight dispatch:** Empress cohorts schema needs `empress_cohorts`
table with cohort_number, opened_at, closes_at (opened_at + 21 days), status. Cohort opener
runs as a cron job (weekly). The Court leaderboard shows "Current Cohort" tab by default
with cohort selector for archived cohorts.

---

*Bishop SEG · Sonnet 4.6 · BP092 · BISHOP_DROPZONE/00_FOUNDER_REVIEW*
