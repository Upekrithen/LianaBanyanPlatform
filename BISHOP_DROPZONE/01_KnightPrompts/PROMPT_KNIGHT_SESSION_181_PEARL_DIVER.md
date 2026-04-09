# KNIGHT SESSION 181 — Pearl Diver Resource Intelligence (#2101)
## Bishop B049 | New Feature Build
## Priority: HIGH — second Cue Card role for Diana Vigil

---

## CONTEXT

Innovation #2101: Pearl Diver Resource Intelligence — deal discovery, logging, and subscription system. Members find deals in the physical world (discount schedules, stacking combos, clearance timing) and log them to the cooperative's Resource Board. Two tracks: Quiet Pearl (logs only) and Pearl Influencer (logs + social media).

Icon: brass diving helmet. See Pudding Article #19 for full concept.

---

## DELIVERABLE 1: Resource Board

### User Story
As a Pearl Diver, I want to log a deal tip (store, discount, schedule, stacking info) to the Resource Board so other members can save money.

### Build

1. **New route: `/resource-board`**
   - Filterable by: location, category, store, date, Pearl Diver rating
   - Card-based layout showing deal tips
   - "Log a Deal" CTA button

2. **Deal Tip Form (`DealTipForm.tsx`)**
   ```
   Fields:
   - Store name (autocomplete or free text)
   - Store location (address or GPS pin)
   - Deal type: dropdown (clearance, discount day, stacking combo, veterans/military, senior, teacher, bulk deal, seasonal, other)
   - Description (500 chars — the actual tip)
   - Schedule (recurring? which days? what time of day?)
   - Stacking info (does this stack with other discounts?)
   - Confidence level (verified personally / heard from someone / unverified)
   - Social media URL (optional — for Pearl Influencer track)
   - "Submit Tip" button
   ```

3. **Database: `resource_board_tips` table**
   ```sql
   CREATE TABLE resource_board_tips (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     member_id UUID REFERENCES members(id),
     store_name TEXT NOT NULL,
     store_location GEOGRAPHY(POINT, 4326),
     deal_type TEXT NOT NULL,
     description TEXT NOT NULL,
     schedule_recurring BOOLEAN DEFAULT false,
     schedule_days TEXT[], -- ['monday', 'wednesday']
     schedule_time_hint TEXT, -- 'morning', 'after 3pm', etc.
     stacking_info TEXT,
     confidence TEXT DEFAULT 'verified', -- verified, heard, unverified
     social_url TEXT, -- Pearl Influencer track
     marks_awarded INTEGER DEFAULT 4,
     upvotes INTEGER DEFAULT 0,
     downvotes INTEGER DEFAULT 0,
     status TEXT DEFAULT 'active', -- active, expired, disputed
     created_at TIMESTAMPTZ DEFAULT now(),
     expires_at TIMESTAMPTZ -- auto-expire after 30 days unless refreshed
   );
   ```

4. **Mark allocation:**
   - Base: 4 Marks per verified tip
   - Bonus: +2 Marks if tip triggers a cooperative bulk buy
   - Bonus: +1 Mark per 10 upvotes from other members
   - Pearl Influencer bonus: +2 Marks if social_url is provided

---

## DELIVERABLE 2: Pearl Diver Subscriptions

Members can subscribe to a Pearl Diver's deal alerts:

1. **Subscription setup in Helm:**
   - Pearl Diver sets price (default: 10/month in any currency)
   - Pearl Diver sets delivery: instant alerts, daily digest, weekly roundup
   - Pearl Diver sets geographic radius filter

2. **Subscriber experience:**
   - Dashboard showing subscribed Pearl Divers
   - Deal alerts matching their filter preferences
   - In-app notification when a subscribed Pearl Diver logs a new tip

3. **Database: `pearl_diver_subscriptions` table**
   ```sql
   CREATE TABLE pearl_diver_subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     subscriber_id UUID REFERENCES members(id),
     pearl_diver_id UUID REFERENCES members(id),
     currency TEXT DEFAULT 'marks', -- marks, credits, joules, dollars
     price_per_month NUMERIC DEFAULT 10,
     delivery_preference TEXT DEFAULT 'daily', -- instant, daily, weekly
     geo_radius_km INTEGER DEFAULT 25,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now(),
     next_billing_at TIMESTAMPTZ
   );
   ```

---

## DELIVERABLE 3: Pearl Diver Cue Card

Create the Pearl Diver Cue Card template:

**Front:** "Pearl Diver — Find deals others miss. Get paid for what you already know."
**Back (mini business plan):**
- What you do: Shop where you already shop. Log deals to the Resource Board.
- What you earn: 4+ Marks per tip, subscriptions from followers, bulk buy bonuses
- What you need: A phone, feet in the aisles, and knowledge of your neighborhood stores
- Monthly potential: 120-250 Marks/month (Quiet Pearl) or 400-800 Marks/month (Pearl Influencer with subscriptions)
- Time commitment: 2-5 hours/week (you're already shopping)

Add to `cue_card_templates` table.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] resource_board_tips table migration
[ ] pearl_diver_subscriptions table migration
[ ] DealTipForm.tsx component
[ ] /resource-board route with filtering
[ ] Deal tip card display component
[ ] Upvote/downvote mechanism
[ ] Mark allocation on tip submission
[ ] Pearl Diver subscription setup in Helm
[ ] Subscriber dashboard and alerts
[ ] Pearl Diver Cue Card template
[ ] Helm "Pearl Diver" stats card
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 181 — Bishop (Foreman), B049*
*Innovation #2101 — Pearl Diver Resource Intelligence*
*FOR THE KEEP!*
