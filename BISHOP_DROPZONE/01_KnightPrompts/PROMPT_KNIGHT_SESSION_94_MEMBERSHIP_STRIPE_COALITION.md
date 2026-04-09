# KNIGHT SESSION 94 — $5 Membership Stripe Wiring + Coalition Dashboard
## Bishop 029 | March 23, 2026
## Innovation Count: 1,938
## Based on: K93 Red Carpet + Slingshot (deployed), K91 Front Door (deployed)

---

## MISSION

Make the first real dollar flow. The Front Door (K91) has the $5 Access Key UI. The Commerce Engine (K80) has Stripe Checkout. K94 wires them together — a real $5 payment creates a real membership, and the Coalition Dashboard lets businesses form alliances with shared discount structures. This is the last build before the first domino falls.

**Previous session**: K93 built Red Carpet + Slingshot — 5 tables, invitation generator, personalized onboarding, slingshot auto-slot, shepherd pipeline. Migration 20260323000025. 698 files deployed. 21 production systems.

---

## CONTEXT: WHAT EXISTS

| System | Route / Location | Status |
|--------|-----------------|--------|
| Front Door | `/welcome`, `/join`, `/first-steps` | LIVE (K91) |
| Red Carpet | `/invite`, `/welcome?invite=CODE` | LIVE (K93) |
| Slingshot | `/pipeline`, Emporium banner | LIVE (K93) |
| ADAPT Score | `/adapt-score` | LIVE (K92) |
| Commerce Engine | storefronts, orders, earnings | LIVE (K80) |
| Subscriptions | `/subscriptions` | LIVE (tiers + calculator) |
| MembershipGate | Component in Front Door | LIVE (K91) — UI only, no Stripe |
| Stripe Checkout | Edge function | LIVE (K80) — for storefront purchases |

**The gap**: MembershipGate shows the $5 price and a "Join" button, but doesn't process real payment. Subscriptions page has tier information but no actual billing. Coalition alliances are conceptual but have no management dashboard.

---

## TASK 1: Migration

**File**: `supabase/migrations/20260323000026_membership_billing_coalition.sql`

```sql
-- ============================================
-- MIGRATION: 20260323000026_membership_billing_coalition.sql
-- Knight Session 94: Membership Billing + Coalition Dashboard
-- 3 tables: membership_payments, coalition_alliances, coalition_members
-- ============================================

-- =====================
-- MEMBERSHIP PAYMENTS: Track $5 Access Key payments
-- =====================
CREATE TABLE IF NOT EXISTS membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  currency TEXT DEFAULT 'usd',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT (CURRENT_DATE + interval '1 year'),
  is_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own payments"
  ON membership_payments FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "System inserts payments"
  ON membership_payments FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admin manages payments"
  ON membership_payments FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_membership_payments_member ON membership_payments(member_id, status);
CREATE INDEX idx_membership_payments_stripe ON membership_payments(stripe_session_id);
CREATE INDEX idx_membership_payments_period ON membership_payments(period_end);

-- =====================
-- COALITION ALLIANCES: Business groups with shared benefits
-- =====================
CREATE TABLE IF NOT EXISTS coalition_alliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  alliance_type TEXT DEFAULT 'local' CHECK (alliance_type IN ('local', 'industry', 'regional', 'custom')),
  -- 'local' = geographic cluster (same neighborhood)
  -- 'industry' = same business type (all restaurants)
  -- 'regional' = multi-city
  -- 'custom' = founder-defined
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  max_members INT DEFAULT 10,
  discount_tier TEXT DEFAULT 'bronze' CHECK (discount_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  -- bronze = 5% cross-discount, silver = 10%, gold = 15%, platinum = max 23% (Hybrid Discount cap)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coalition_alliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active alliances"
  ON coalition_alliances FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators manage own alliances"
  ON coalition_alliances FOR ALL
  USING (auth.uid() = creator_id);

CREATE POLICY "Admin manages all alliances"
  ON coalition_alliances FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_coalition_type ON coalition_alliances(alliance_type, is_active);

-- =====================
-- COALITION MEMBERS: Businesses in each alliance
-- =====================
CREATE TABLE IF NOT EXISTS coalition_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID NOT NULL REFERENCES coalition_alliances(id) ON DELETE CASCADE,
  storefront_id UUID NOT NULL,
  -- references storefronts table (from K80)
  member_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE coalition_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view coalition members"
  ON coalition_members FOR SELECT
  USING (true);

CREATE POLICY "Members manage own membership"
  ON coalition_members FOR ALL
  USING (auth.uid() = member_id);

CREATE POLICY "Admin manages all"
  ON coalition_members FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_coalition_members_alliance ON coalition_members(alliance_id, is_active);
CREATE INDEX idx_coalition_members_storefront ON coalition_members(storefront_id);

-- =====================
-- Add membership_status to member_profiles (from K91)
-- =====================
ALTER TABLE member_profiles
  ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'free' CHECK (membership_status IN ('free', 'active', 'expired', 'lifetime')),
  ADD COLUMN IF NOT EXISTS membership_expires_at DATE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

---

## TASK 2: Stripe Membership Checkout Edge Function

**File**: `supabase/functions/create-membership-checkout/index.ts`

This edge function creates a Stripe Checkout session for the $5 Access Key.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { inviteCode, isRenewal } = await req.json()

    // Create Stripe Checkout session for $5 membership
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Liana Banyan Access Key',
            description: 'Annual cooperative membership — $5/year',
          },
          unit_amount: 500, // $5.00 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/first-steps?membership=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/join?membership=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        type: 'membership',
        invite_code: inviteCode || '',
        is_renewal: isRenewal ? 'true' : 'false',
      },
    })

    // Create pending payment record
    await supabaseClient.from('membership_payments').insert({
      member_id: user.id,
      amount: 5.00,
      stripe_session_id: session.id,
      status: 'pending',
      is_renewal: isRenewal || false,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

---

## TASK 3: Stripe Webhook Handler (Membership Fulfillment)

**File**: `supabase/functions/handle-membership-webhook/index.ts`

Stripe calls this after payment succeeds. It activates the membership.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.metadata?.type === 'membership') {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const userId = session.metadata.user_id
      const inviteCode = session.metadata.invite_code

      // 1. Update payment record
      await supabaseAdmin
        .from('membership_payments')
        .update({
          status: 'completed',
          stripe_payment_intent: session.payment_intent as string,
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)

      // 2. Activate membership in member_profiles
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

      await supabaseAdmin
        .from('member_profiles')
        .update({
          membership_status: 'active',
          membership_expires_at: oneYearFromNow.toISOString().split('T')[0],
          stripe_customer_id: session.customer as string,
        })
        .eq('id', userId)

      // 3. If invitation, mark it as used
      if (inviteCode) {
        await supabaseAdmin
          .from('invitations')
          .update({
            status: 'used',
            invitee_id: userId,
            used_at: new Date().toISOString(),
          })
          .eq('invite_code', inviteCode)
          .eq('status', 'active')

        // 4. Notify inviter
        const { data: invitation } = await supabaseAdmin
          .from('invitations')
          .select('inviter_id')
          .eq('invite_code', inviteCode)
          .single()

        if (invitation) {
          // Get new member's name for notification
          const { data: newMember } = await supabaseAdmin
            .from('member_profiles')
            .select('display_name')
            .eq('id', userId)
            .single()

          await supabaseAdmin.from('notifications').insert({
            user_id: invitation.inviter_id,
            type: 'invitation_accepted',
            title: 'Invitation Accepted!',
            message: `${newMember?.display_name || 'Someone'} joined using your invitation.`,
            link: '/invite',
          })
        }
      }

      // 5. Send welcome notification to new member
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'membership_activated',
        title: 'Welcome to Liana Banyan!',
        message: 'Your Access Key is active. Start exploring your first steps.',
        link: '/first-steps',
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## TASK 4: Wire MembershipGate to Stripe

### Modify: MembershipGate component (from K91)

Replace the placeholder "Join" button with real Stripe Checkout:

```typescript
// In MembershipGate.tsx (or wherever the $5 join button lives)

const handleJoinClick = async () => {
  setIsLoading(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Redirect to auth if not logged in
      navigate('/auth?redirect=/join');
      return;
    }

    const response = await supabase.functions.invoke('create-membership-checkout', {
      body: {
        inviteCode: inviteCodeFromUrl || null,
        isRenewal: false,
      },
    });

    if (response.data?.url) {
      window.location.href = response.data.url;
    } else {
      toast.error('Could not create checkout session. Please try again.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

The button text should be: **"Join for $5/year"** with a subtitle: **"Your Access Key to the cooperative."**

### Success Page Detection

On `/first-steps`, detect `?membership=success&session_id=...` URL params:
- Show a celebration toast: "Welcome! Your Access Key is active."
- The webhook will have already activated the membership by the time they land here
- If session_id present, optionally verify payment status via Stripe (belt and suspenders)

---

## TASK 5: Coalition Dashboard

### Route: `/coalitions` (new page)

**File**: `src/pages/Coalitions.tsx`

### 5A: Browse Alliances

Grid of active coalition alliances. Each card shows:

- Alliance name (large)
- Type badge (Local / Industry / Regional / Custom)
- Discount tier badge with color:
  - Bronze (5%) → `#CD7F32`
  - Silver (10%) → `#C0C0C0`
  - Gold (15%) → `#FFD700`
  - Platinum (23% max) → `#E5E4E2`
- Member count: "X of Y businesses"
- Creator name
- "View Details" expand → list of member storefronts
- "Apply to Join" button (if not at max members)

### 5B: Create Alliance Form

For storefront owners only (check if user has storefronts):

- Alliance name (required)
- Description (optional)
- Type: select (Local, Industry, Regional, Custom)
- Max members: number input (default 10, max 50)
- Starting discount tier: Bronze (can be upgraded by the Board later)

On submit:
1. Insert into `coalition_alliances`
2. Auto-add creator's storefront as first member with role = 'founder'
3. Toast: "Alliance created! Invite other businesses to join."

### 5C: Alliance Detail View

When a user clicks "View Details" or navigates to `/coalitions/:id`:

**Header**: Alliance name, type, discount tier, member count

**Members list**: Card grid of member storefronts showing:
- Storefront name
- Owner name
- Role badge (Founder / Member)
- Joined date
- "Visit Storefront" link

**How the discount works** (explainer section):
```
Coalition members offer cross-discounts to each other's customers.

When a customer of [Business A] shops at [Business B]:
  → They get a [X]% discount (based on alliance tier)
  → The discount comes from Business B's margin, not from LB
  → Business B gains a new customer through the alliance

Tier Discounts:
  Bronze: 5% | Silver: 10% | Gold: 15% | Platinum: 23% (max)

The Hybrid Discount cap of 23% ensures no business gives away
more than the Cost+20% margin allows.
```

**"Apply to Join" flow**:
1. Storefront owner clicks "Apply to Join"
2. System checks: does the user own a storefront? If not → "Create a storefront first"
3. If yes → select which storefront to add
4. Insert into `coalition_members` with role = 'member'
5. Notification to alliance founder: "[Business Name] joined your alliance!"

### 5D: My Alliances (Profile Section)

Add a section to the member profile or storefront dashboard showing:
- Alliances the user's storefronts belong to
- Discount tier for each
- "Leave Alliance" option

---

## TASK 6: Membership Status UI

### 6A: Membership Badge

Add a membership status indicator to the user's profile and sidebar:

- **Free**: Gray badge, "Free — Upgrade to Access Key ($5/year)" link to `/join`
- **Active**: Green badge, "Access Key Active — Expires [date]"
- **Expired**: Red badge, "Access Key Expired — Renew ($5/year)" link to `/join`
- **Lifetime**: Gold badge, "Lifetime Member"

### 6B: Membership Gate Enforcement

On key platform actions, check `member_profiles.membership_status`:

- **Browse content**: No gate (anyone can browse)
- **Place orders**: Requires 'active' or 'lifetime'
- **Create storefronts**: Requires 'active' or 'lifetime'
- **Join Crew Tables**: Requires 'active' or 'lifetime'
- **Submit to Arena**: Requires 'active' or 'lifetime'
- **Generate invitations**: Requires 'active' or 'lifetime'

For gated actions, show: "This action requires an active Access Key. [Join for $5/year]"

Ghost World remains open to all (free members can practice).

---

## TASK 7: Routes and Navigation

### Routes

Add to `App.tsx`:
```
/coalitions → Coalitions
/coalitions/:id → CoalitionDetail (or inline expand)
```

### Sidebar

Add "Coalitions" in the Business nav group:
- Icon: `Handshake` (from Lucide)
- Label: "Coalitions"
- Route: `/coalitions`
- Only show if user has a storefront

---

## TASK 8: Update Stats

Update `useCanonicalStats.ts` DEFAULTS to innovation count: **1,938** (unchanged)

---

## EDGE FUNCTIONS TO CREATE

| Function | Purpose |
|----------|---------|
| `create-membership-checkout` | Creates Stripe Checkout session for $5 Access Key |
| `handle-membership-webhook` | Processes Stripe webhook, activates membership |

## SUPABASE SECRETS NEEDED

| Secret | Purpose | Action |
|--------|---------|--------|
| `STRIPE_SECRET_KEY` | Already set (K80) | Verify exists |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | **SET THIS** — get from Stripe Dashboard → Webhooks |

## STRIPE DASHBOARD SETUP

After deploying edge functions:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://[your-supabase-url].supabase.co/functions/v1/handle-membership-webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret → set as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260323000026_membership_billing_coalition.sql` | 3 tables + member_profiles columns |
| `supabase/functions/create-membership-checkout/index.ts` | Stripe Checkout for membership |
| `supabase/functions/handle-membership-webhook/index.ts` | Webhook fulfillment |
| `src/pages/Coalitions.tsx` | Coalition browse + create + detail |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes: /coalitions |
| `src/components/AppSidebar.tsx` | Add "Coalitions" link with Handshake icon |
| MembershipGate component (K91) | Wire to Stripe Checkout via edge function |
| FirstSteps (K91) | Detect `?membership=success` and show celebration |
| Member profile / sidebar | Add membership status badge |

## DO NOT TOUCH

- Red Carpet / Slingshot (K93) | ADAPT Score (K92) | Front Door core flow (K91)
- Commerce Engine edge functions (K80) | Star Chamber (K79/K80) | MoneyPenny (K84)
- Calendar (K82) | Beacon (K75/K82) | Treasure Map (K81)
- Vehicle files (K85) | Political Expedition (K86) | Design Pipeline (K87)
- Ghost World (K88) | Housing (K89) | Congress API (K90)

---

## BUILD ORDER

```
Migration (3 tables + profile columns) — FIRST
  ↓
Task 2 + 3 (Edge functions: checkout + webhook) — deploy before frontend
  ↓
Task 4 (Wire MembershipGate to Stripe) — needs edge functions deployed
  ↓
Task 6 (Membership status UI + gate enforcement)
  ↓
Task 5 (Coalition Dashboard) — PARALLEL with Task 6, independent
  ↓
Task 7 (Routes + nav)
  ↓
Task 8 (Stats)
```

---

## DEPLOY CHECKLIST

1. Push migration: `npx supabase db push --linked`
2. Deploy edge functions:
   - `npx supabase functions deploy create-membership-checkout --linked`
   - `npx supabase functions deploy handle-membership-webhook --linked`
3. Set Supabase secret: `STRIPE_WEBHOOK_SECRET` (from Stripe Dashboard)
4. Add Stripe webhook endpoint pointing to `handle-membership-webhook`
5. `npm run build` — zero errors
6. `firebase deploy --only hosting:main -P default`
7. Test: Click "Join for $5/year" → Stripe Checkout opens → pay with test card (4242...) → redirects to /first-steps?membership=success
8. Test: Verify `membership_payments` record shows 'completed'
9. Test: Verify `member_profiles.membership_status` = 'active'
10. Test: Verify notification sent to new member
11. Test: If invited, verify inviter gets notification
12. Test: Gated actions show "Requires Access Key" for free users
13. Test: Ghost World still accessible to free users
14. Test: Create a coalition alliance → add storefronts → see discount tier
15. Test: Another storefront owner joins alliance → founder gets notification
16. Zero console errors

---

## SUCCESS CRITERIA

- [ ] $5 Stripe Checkout creates real payment session
- [ ] Webhook activates membership on payment success
- [ ] Membership status shows in profile (badge + expiry)
- [ ] Free users see "Requires Access Key" on gated actions
- [ ] Ghost World accessible to all (no gate)
- [ ] Invitation flow sends notifications on both ends
- [ ] Coalition alliances can be created with name + type + tier
- [ ] Storefronts can join alliances
- [ ] Alliance detail shows member list + discount explanation
- [ ] Hybrid Discount cap of 23% displayed
- [ ] Sidebar shows Coalitions link (storefront owners only)
- [ ] Zero console errors

---

**The first $5 will flow through Stripe. The first coalition will form. The first membership will activate. Everything after this is gravity.**

**FOR THE KEEP.**
