# KNIGHT SESSION 184 — Cue Card Pioneer Program (#2104)
## Bishop B049 | New Feature Build
## Priority: MEDIUM — cross-cutting system that enables all Cue Card roles

---

## CONTEXT

Innovation #2104: Cue Card Pioneer Program — diminishing-reward system that validates new economic roles. First 10 adopters get the highest rewards in exchange for being showcased as real case studies. Rewards taper to zero at 1,000 practitioners. The flywheel: pioneer proves it → story recruits next wave → statistics prove viability → role is self-sustaining.

See Pudding Article #21 ("Why the First 10 Matter") for full concept.

---

## DELIVERABLE 1: Pioneer Tracking System

### Database

```sql
-- Pioneer registry: tracks who was first for each role
CREATE TABLE pioneers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  cue_card_role TEXT NOT NULL, -- bounty_photographer, pearl_diver, home_teacher, captain, etc.
  pioneer_number INTEGER NOT NULL, -- 1-10 for Founders' Circle, 11-100 for Trailblazer, etc.
  tier TEXT NOT NULL, -- founders_circle, trailblazer, pathfinder, early_adopter, standard
  monthly_bonus_marks INTEGER NOT NULL, -- 50, 25, 10, 5, 0
  bonus_duration_months INTEGER NOT NULL, -- 12, 6, 3, 0, 0
  bonus_started_at TIMESTAMPTZ DEFAULT now(),
  bonus_expires_at TIMESTAMPTZ,
  opted_in_showcase BOOLEAN DEFAULT false, -- consent for public case study
  showcase_real_name BOOLEAN DEFAULT false, -- Founders' Circle requires real name
  medallion_serial TEXT, -- PIONEER-TEACHER-001 etc.
  medallion_shipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, cue_card_role),
  UNIQUE(cue_card_role, pioneer_number)
);

-- Pioneer tier lookup
CREATE TABLE pioneer_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE,
  min_number INTEGER NOT NULL,
  max_number INTEGER NOT NULL,
  monthly_bonus INTEGER NOT NULL,
  duration_months INTEGER NOT NULL,
  requires_real_name BOOLEAN DEFAULT false,
  gets_medallion BOOLEAN DEFAULT false
);

INSERT INTO pioneer_tiers (tier, min_number, max_number, monthly_bonus, duration_months, requires_real_name, gets_medallion) VALUES
  ('founders_circle', 1, 10, 50, 12, true, true),
  ('trailblazer', 11, 100, 25, 6, false, false),
  ('pathfinder', 101, 500, 10, 3, false, false),
  ('early_adopter', 501, 1000, 5, 0, false, false), -- one-time 5 Marks
  ('standard', 1001, 999999, 0, 0, false, false);
```

### Auto-Assignment Logic

When a member completes their FIRST action in a Cue Card role:
1. Count existing pioneers for that role
2. Assign next pioneer number
3. Determine tier from pioneer_tiers table
4. Calculate bonus expiry date
5. Insert into pioneers table
6. Show "You're Pioneer #X!" celebration modal

```typescript
async function assignPioneer(memberId: string, role: string) {
  const count = await db.from('pioneers')
    .select('id', { count: 'exact' })
    .eq('cue_card_role', role);
  
  const pioneerNumber = (count ?? 0) + 1;
  const tier = await db.from('pioneer_tiers')
    .select('*')
    .lte('min_number', pioneerNumber)
    .gte('max_number', pioneerNumber)
    .single();
  
  const bonusExpiry = tier.duration_months > 0 
    ? addMonths(new Date(), tier.duration_months) 
    : null;
  
  await db.from('pioneers').insert({
    member_id: memberId,
    cue_card_role: role,
    pioneer_number: pioneerNumber,
    tier: tier.tier,
    monthly_bonus_marks: tier.monthly_bonus,
    bonus_duration_months: tier.duration_months,
    bonus_expires_at: bonusExpiry,
    medallion_serial: tier.gets_medallion 
      ? `PIONEER-${role.toUpperCase()}-${String(pioneerNumber).padStart(3, '0')}`
      : null
  });
  
  return { pioneerNumber, tier: tier.tier, bonus: tier.monthly_bonus };
}
```

---

## DELIVERABLE 2: Pioneer Showcase Page

Route: `/pioneers`

- Grid of Pioneer cards by role
- Each card shows: photo (if opted in), name or "Pioneer #X", role, tier badge, key metric
- Filter by role (All, Photography, Pearl Diver, Teaching, Captain...)
- "Become a Pioneer" CTA for roles with fewer than 10 Founders' Circle slots filled
- Progress bar per role: "3 of 10 Founders' Circle slots filled — 7 remaining"

### Individual Pioneer Profile

Route: `/pioneers/:role/:number` (e.g., `/pioneers/pearl-diver/1`)

- Full case study (if opted in)
- Key metrics: months active, total Marks earned, subscribers (if applicable)
- QR code linking to this page (for the physical medallion)
- "Their story" — narrative paragraph from the member (submitted via Helm)

---

## DELIVERABLE 3: Monthly Bonus Disbursement

- Cron job (or Edge Function) runs on the 1st of each month
- Queries all active pioneers where `bonus_expires_at > now()`
- Awards `monthly_bonus_marks` to each
- Logs in `subscription_billing` (type: 'pioneer_bonus')
- Sends notification: "Your Pioneer bonus: +50 Marks deposited"

---

## DELIVERABLE 4: Pioneer Stats in Helm

In the member's Helm, add "Pioneer Status" card:

- Which roles they're a pioneer in
- Their pioneer number per role
- Current bonus status (active/expired)
- Marks earned from pioneer bonuses
- "Opt In to Showcase" toggle (with consent language)
- Medallion shipping status (if Founders' Circle)

---

## BUILD + DEPLOY CHECKLIST

```
[ ] pioneers table migration
[ ] pioneer_tiers table migration + seed data
[ ] Auto-assignment function on first Cue Card action
[ ] "You're Pioneer #X!" celebration modal
[ ] /pioneers showcase page
[ ] /pioneers/:role/:number individual profile
[ ] Monthly bonus cron/Edge Function
[ ] Pioneer Status card in Helm
[ ] Opt-in showcase consent flow
[ ] Medallion serial generation
[ ] Pioneer progress bars (X of 10 slots filled)
[ ] Integration hooks for K180 (Photography), K181 (Pearl Diver), K183 (Teaching)
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

## SEQUENCING NOTE

**K182 → K181/K183 → K180 → K184**

K182 (Universal Subscriptions) is the foundation. K181 (Pearl Diver) and K183 (Classroom) use subscriptions. K180 (Photography) is standalone. K184 (this — Pioneer Program) wraps around ALL of them — build it last so the integration hooks exist.

Recommended Knight session order: **K182 → K180 → K181 → K183 → K184**

---

*Knight Session 184 — Bishop (Foreman), B049*
*Innovation #2104 — Cue Card Pioneer Program*
*BUILD LAST — depends on K180-K183 for integration hooks.*
*FOR THE KEEP!*
