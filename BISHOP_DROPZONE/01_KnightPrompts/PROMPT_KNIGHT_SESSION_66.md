# Knight Session 66 Prompt
## Subscription Explanation Page + Coalition System + Cephas SEC Fixes + Crown Letter Content
## Priority: HIGH — New innovations (#1811-#1828) need platform representation
## Innovation Count: 1,828

---

## Task 0: Supabase Migration Push (from Session 65)

Push the crown_letter_updates migration that was built but not yet applied:

```bash
supabase db push
```

Verify `crown_letter_updates` table exists with: id, letter_slug, recipient_name, letter_sent_date, updates (jsonb), created_at, updated_at.

---

## Task 1: Subscription Explanation Page (`/subscriptions`)

**Innovation #1826.** New page explaining the subscription model to BOTH businesses and members.

1. Create `src/pages/Subscriptions.tsx`
2. Route: `/subscriptions`
3. Layout: PortalPageLayout variant="stage"
4. Add to sidebar navigation under "Economy" or "Services" section

**Sections:**

### For Members
- **Why Subscribe?** — savings, variety, convenience, support local businesses
- **Tier comparison table:** Taste (3/wk, 10% off) | Regular (5/wk, 15% off) | All-In (7/wk, 20% off)
- **How it works:** Pick cuisines/services → commit to tier → LB Card auto-bills monthly → choose weekly
- **Coalition benefits:** "10 businesses, your choice of 5+, one subscription"

### For Businesses
- **Why Offer Subscriptions?** — guaranteed demand, reduced waste, data, cross-promotion
- **The All Day Buffet Problem:** Prepare for too many = waste. Too few = missed revenue + bad impression.
- **The solution:** Subscriptions eliminate uncertainty. "Your customers already committed."
- **Turn-key:** "One toggle. LB handles billing, scheduling, skip/modify."

### Coalition Section
- What is a Coalition? (10+ businesses, voluntary alliance, shared subscriber pool)
- How to form one (BandWagon integration — link to `/bandwagon`)
- Active Coalitions in your area (placeholder — wired to Supabase later)
- Browse + Join buttons

### Interactive Tier Calculator (optional — build if time allows)
- Input: meals/week, number of cuisines/businesses
- Output: monthly cost, savings vs. walk-in pricing, businesses served

### Chewy Comparison Callout
- "Like Chewy's Autoship for everything local. Predictable. Flexible. Cheaper."

---

## Task 2: Subscription Migration

Create migration `20260321000002_subscription_system.sql`:

```sql
-- Subscription tiers available per business
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  tier_name TEXT NOT NULL, -- 'taste', 'regular', 'all_in', 'blind_box'
  frequency_per_week INT NOT NULL DEFAULT 3,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 10.0,
  min_categories INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Member subscription commitments
CREATE TABLE IF NOT EXISTS member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id),
  coalition_id UUID, -- null if single-business subscription
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  selected_businesses UUID[] NOT NULL, -- array of business IDs chosen
  payment_method TEXT NOT NULL DEFAULT 'credits', -- 'credits' or 'marks'
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Coalitions
CREATE TABLE IF NOT EXISTS business_coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  area_definition JSONB, -- geographic boundary
  min_businesses INT DEFAULT 10,
  min_subscribers INT DEFAULT 200,
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coalition membership (which businesses are in which coalition)
CREATE TABLE IF NOT EXISTS coalition_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coalition_id UUID NOT NULL REFERENCES business_coalitions(id),
  business_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Subscription orders (what the member actually picked each week)
CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES member_subscriptions(id),
  business_id UUID NOT NULL,
  order_date DATE NOT NULL,
  items JSONB,
  discount_applied DECIMAL(5,2),
  credits_charged DECIMAL(10,2),
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_coalitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coalition_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can view coalitions" ON business_coalitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view coalition members" ON coalition_members FOR SELECT USING (true);
CREATE POLICY "Members manage own subscriptions" ON member_subscriptions FOR ALL USING (auth.uid() = member_id);
CREATE POLICY "Members manage own orders" ON subscription_orders FOR ALL USING (
  subscription_id IN (SELECT id FROM member_subscriptions WHERE member_id = auth.uid())
);
CREATE POLICY "Admin manages tiers" ON subscription_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manages coalitions" ON business_coalitions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manages coalition members" ON coalition_members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

---

## Task 3: Innovation Count Update

Update `useCanonicalStats.ts` DEFAULTS: innovationCount → **1,828**

---

## Task 4: Cephas SEC Fixes (URGENT — 3 drafts + 4 word replacements)

### 4A: Mark 3 ancient files as `draft: true`

These files contain massive SEC violations and outdated architecture. Add `draft: true` to Hugo frontmatter:

1. `Cephas/cephas-hugo/content/articles/the-covenant.md`
2. `Cephas/cephas-hugo/content/articles/business-plan.md`
3. `Cephas/cephas-hugo/content/articles/genesis-vault.md`

### 4B: SEC word replacements in 4 live files

**`content/articles/academic-currency-differential.md`:**
- "Unclearable Marks convert to 'redeemable equity'" → "Unclearable Marks convert to increased SAA (Service Allocation Authority)"
- "investment instruments" → "governance instruments"
- "transferable claims on future platform profits" → "transferable claims on future cooperative service allocation"

**`content/articles/anticipated-critiques.md`:**
- "Option C: 2x Equity" → "Option C: 2x Participation Credit"
- "Medallions are Warrants" → "Medallions are Membership Participation Instruments"
- All "equity" in LB context → "participation"
- All "investor" referring to LB backers → "sponsor"

**`content/articles/lifeline-medications-detailed.md`:**
- "medallions (ownership stakes)" → "membership participation (Founding Medallions)"
- "fourteen initiatives" → "sixteen initiatives"

**`content/articles/tatiana-schlossberg-letter.md`:**
- "fourteen initiatives" → "sixteen initiatives"
- "ownership stakes" → "membership participation"
- "Workers paid in ownership stakes" → "Members earn through membership participation"

### 4C: Cephas Deploy

After all fixes:
```bash
cd Cephas/cephas-hugo
hugo --gc --minify
firebase deploy --only hosting:cephas-lianabanyan
```

---

## Task 5: Add `/subscriptions` to Navigation

Add sidebar entry near BandWagon and Main Square (economy section).

---

## Notes
- Do NOT start Part 2 (color token sweep) yet
- Innovation count is now 1,828
- Two A&A documents: `AA_SESSION_019A_SUBSCRIPTION_NETWORK.md` (#1811-#1818) and `AA_SESSION_019B_COALITION_AND_SUBSCRIPTION_TURNKEY.md` (#1819-#1828)
- Full Cephas SEC audit at `BISHOP_DROPZONE/CEPHAS_SEC_AUDIT_SESSION_019.md`
- Press articles reviewed and ready for Founder review
- IP Governance paper SEC-fixed
- Defense Klaus shield deployed in 3 spots (Session 65)
- Privacy/Terms pages live (Session 65)
- Lemonade Stand flipbook rhymes CONFIRMED present and working
