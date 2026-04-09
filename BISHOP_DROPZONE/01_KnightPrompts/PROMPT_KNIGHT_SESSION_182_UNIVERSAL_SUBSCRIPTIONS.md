# KNIGHT SESSION 182 — Universal Member Subscriptions (#2102)
## Bishop B049 | New Feature Build
## Priority: HIGH — enables all 4 currencies for recurring payments

---

## CONTEXT

Innovation #2102: Universal Member Subscriptions — any member can create a subscription channel accepting all 4 currencies (Marks, Credits, Joules, Dollars). This is the subscription backbone that Pearl Diver subscriptions (K181), Home Teacher subscriptions (K183), and all future recurring-payment roles depend on.

**Build this BEFORE K181 and K183** — those sessions wire role-specific subscription types into this universal system.

See Pudding Article #22 for full concept.

---

## DELIVERABLE 1: Universal Subscription Engine

### Core Tables

```sql
-- Subscription channels (what a creator offers)
CREATE TABLE subscription_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES members(id),
  title TEXT NOT NULL, -- "Tuesday Spanish Beginner" or "Diana's Deal Drops"
  description TEXT,
  price NUMERIC NOT NULL, -- amount per billing cycle (all currencies at parity)
  billing_cycle TEXT DEFAULT 'monthly', -- weekly, monthly, per_session
  max_subscribers INTEGER, -- null = unlimited
  current_subscribers INTEGER DEFAULT 0,
  category TEXT, -- teaching, deals, photography, cooking, general
  cue_card_role TEXT, -- pearl_diver, home_teacher, bounty_photographer, etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Active subscriptions (who subscribes to what)
CREATE TABLE member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES members(id),
  channel_id UUID REFERENCES subscription_channels(id),
  currency TEXT DEFAULT 'marks', -- marks, credits, joules, dollars
  status TEXT DEFAULT 'active', -- active, paused, cancelled, expired
  started_at TIMESTAMPTZ DEFAULT now(),
  next_billing_at TIMESTAMPTZ,
  last_billed_at TIMESTAMPTZ,
  total_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Billing history
CREATE TABLE subscription_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES member_subscriptions(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  creator_amount NUMERIC NOT NULL, -- 83.3% of amount
  platform_amount NUMERIC NOT NULL, -- 16.7% of amount
  stripe_fee NUMERIC DEFAULT 0, -- only for dollar payments
  status TEXT DEFAULT 'completed', -- completed, failed, refunded
  billed_at TIMESTAMPTZ DEFAULT now()
);
```

### Payment Logic

```typescript
// Pseudo-code for subscription billing
async function billSubscription(sub: MemberSubscription) {
  const channel = await getChannel(sub.channel_id);
  const amount = channel.price;
  
  if (sub.currency === 'dollars') {
    // Stripe recurring charge
    const stripeFee = amount * 0.029 + 0.30;
    const netAmount = amount - stripeFee;
    const creatorAmount = netAmount * 0.833;
    const platformAmount = netAmount * 0.167;
    await chargeStripe(sub.subscriber_id, amount);
    await recordBilling(sub.id, amount, 'dollars', creatorAmount, platformAmount, stripeFee);
  } else {
    // Internal ledger transfer — zero processing cost
    const creatorAmount = amount * 0.833;
    const platformAmount = amount * 0.167;
    await transferInternal(sub.subscriber_id, channel.creator_id, creatorAmount, sub.currency);
    await transferInternal(sub.subscriber_id, 'platform', platformAmount, sub.currency);
    await recordBilling(sub.id, amount, sub.currency, creatorAmount, platformAmount, 0);
  }
}
```

### Billing Scheduler

- Cron job (or Supabase Edge Function) runs daily
- Checks `member_subscriptions` where `next_billing_at <= now()`
- Bills each due subscription
- Updates `next_billing_at` based on `billing_cycle`
- Failed payments: retry once after 3 days, then pause subscription

---

## DELIVERABLE 2: Subscription Management in Helm

### Creator View (Helm → My Subscriptions → Creator Tab)

- List of channels I created
- Subscriber count per channel
- Revenue breakdown by currency (Marks/Credits/Joules/Dollars pie chart)
- "Create Subscription Channel" button
- Edit price, description, max subscribers

### Subscriber View (Helm → My Subscriptions → Subscriptions Tab)

- List of channels I subscribe to
- Current currency for each (with "Switch Currency" dropdown)
- Next billing date
- "Pause" and "Cancel" buttons
- Total spent across all subscriptions

---

## DELIVERABLE 3: Subscription Discovery

- `/subscriptions` route showing all active subscription channels
- Filter by: category, price range, location, creator rating
- Sort by: subscribers, newest, price
- Card layout with creator avatar, title, price, subscriber count
- "Subscribe" button → currency selector → confirm

---

## BUILD + DEPLOY CHECKLIST

```
[ ] subscription_channels table migration
[ ] member_subscriptions table migration
[ ] subscription_billing table migration
[ ] Internal ledger transfer for Marks/Credits/Joules
[ ] Stripe recurring billing for dollars
[ ] Billing scheduler (daily cron or Edge Function)
[ ] Failed payment retry logic
[ ] Creator subscription management in Helm
[ ] Subscriber management in Helm
[ ] Currency switcher component
[ ] /subscriptions discovery route
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 182 — Bishop (Foreman), B049*
*Innovation #2102 — Universal Member Subscriptions*
*BUILD THIS BEFORE K181 AND K183 — they depend on this engine.*
*FOR THE KEEP!*
