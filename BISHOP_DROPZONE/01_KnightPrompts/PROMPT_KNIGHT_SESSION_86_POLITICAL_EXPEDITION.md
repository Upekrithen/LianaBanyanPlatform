# KNIGHT SESSION 86 — Political Expedition (Power to the People)
## Bishop 025 | March 22, 2026
## Initiative #15: Power to the People / Political Expedition
## Innovation Count: 1,935

---

## MISSION

Build the Political Expedition page — Initiative #15. Rep lookup by address, bill tracker, voting record display, and "Write Your Rep" template generator. Non-partisan. The tool helps members engage with their representatives regardless of political affiliation.

This is the "Patriotic Interdependentalist" in action: not left or right, forward.

---

## TASK 1: Database Tables

Create migration `20260322000017_political_expedition.sql`:

```sql
-- Cached representative data (refreshed periodically)
CREATE TABLE rep_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bioguide_id TEXT UNIQUE, -- official Congress ID
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- 'Senator', 'Representative', 'Governor', etc.
  party TEXT,
  state TEXT NOT NULL,
  district TEXT, -- null for senators
  chamber TEXT, -- 'senate', 'house', 'state_senate', 'state_house'
  phone TEXT,
  website TEXT,
  office_address TEXT,
  photo_url TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  next_election TEXT,
  committees TEXT[] DEFAULT '{}',
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Member-saved representatives
CREATE TABLE member_reps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rep_id UUID REFERENCES rep_cache(id) NOT NULL,
  address_used TEXT, -- the address they used to look up
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rep_id)
);

-- Bill tracker (simplified — pulled from Congress.gov API)
CREATE TABLE tracked_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL, -- 'HR-1234', 'S-567'
  title TEXT NOT NULL,
  summary TEXT,
  sponsor_name TEXT,
  sponsor_party TEXT,
  status TEXT, -- 'introduced', 'committee', 'passed_house', 'passed_senate', 'signed', 'vetoed'
  introduced_date DATE,
  last_action_date DATE,
  last_action TEXT,
  tags TEXT[] DEFAULT '{}', -- 'cooperative', 'housing', 'food_security', 'transportation'
  lb_relevance TEXT, -- why this matters to LB members
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member bill tracking
CREATE TABLE member_bill_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bill_id UUID REFERENCES tracked_bills(id) NOT NULL,
  tracking_since TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Letter templates
CREATE TABLE rep_letter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL, -- 'cooperative_support', 'food_security', 'housing', 'small_business', 'general'
  template_body TEXT NOT NULL, -- with {{name}}, {{rep_name}}, {{district}} placeholders
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE rep_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reps" ON rep_cache FOR SELECT USING (true);
CREATE POLICY "Admin manages" ON rep_cache FOR ALL USING (public.is_admin());

ALTER TABLE member_reps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own" ON member_reps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users save own" ON member_reps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own" ON member_reps FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE tracked_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bills" ON tracked_bills FOR SELECT USING (true);
CREATE POLICY "Admin manages bills" ON tracked_bills FOR ALL USING (public.is_admin());

ALTER TABLE member_bill_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own tracking" ON member_bill_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own" ON member_bill_tracking FOR ALL USING (auth.uid() = user_id);

ALTER TABLE rep_letter_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates" ON rep_letter_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manages templates" ON rep_letter_templates FOR ALL USING (public.is_admin());

-- Seed letter templates
INSERT INTO rep_letter_templates (title, topic, template_body) VALUES
('Support for Cooperatives', 'cooperative_support', 'Dear {{rep_name}},

I am writing as a constituent from {{district}} and a member of Liana Banyan, a cooperative platform that serves working families in our community. I am asking you to support legislation that strengthens cooperative businesses.

Cooperatives create local jobs, keep money in communities, and give workers real ownership of their economic future. Liana Banyan alone has documented over 1,900 innovations in cooperative economics, and our platform helps families access affordable food, housing, and transportation.

I would appreciate the opportunity to discuss how cooperatives benefit {{district}} and how federal policy can support this model.

Thank you for your service.

Sincerely,
{{name}}'),
('Food Security Initiative', 'food_security', 'Dear {{rep_name}},

I am writing as a constituent from {{district}} to urge your support for food security programs in our community.

Through Liana Banyan cooperative, I have seen firsthand how local food networks can reduce food insecurity. Our Mission ONE — "EVERYONE Eats Tonight" — connects local restaurants with families who need affordable meals, using a cooperative model where 83.3% of every dollar goes directly to the food provider.

I urge you to support legislation that funds local food cooperatives and community-based food distribution.

Thank you,
{{name}}'),
('Affordable Housing', 'housing', 'Dear {{rep_name}},

I am writing about the critical need for affordable housing in {{district}}.

Our cooperative, Liana Banyan, is developing innovative approaches to cooperative housing — where members collectively acquire and maintain properties at cost-plus-20%, eliminating profit extraction from housing. This model has precedent in successful cooperatives like Mondragon and the cooperative housing movements in New York and other cities.

I ask for your support of legislation that enables cooperative housing acquisition and protects tenants'' rights to organize cooperative ownership.

Thank you for your attention to this issue.

Sincerely,
{{name}}');
```

---

## TASK 2: Rep Lookup Edge Function

Create `supabase/functions/rep-lookup/index.ts`:

Uses the **Google Civic Information API** (free, no key required for basic usage, or use the existing GOOGLE_API_KEY if set):

```
GET https://www.googleapis.com/civicinfo/v2/representatives?address={address}&key={apiKey}
```

1. Accept: `{ address: string }`
2. Call Google Civic API with the address
3. Parse response: extract officials with their offices, parties, phones, websites, photos
4. Upsert into `rep_cache` table (update if exists, insert if new)
5. Return the list of representatives

Fallback: If Google API fails, check `rep_cache` for any reps matching the state from the address.

Rate limit: Cache results for 7 days per address pattern.

---

## TASK 3: Political Expedition Page

Create `src/pages/PoliticalExpedition.tsx`:

### Section 1: "Find Your Representatives"
- Address input field (street, city, state, zip)
- "Look Up" button → calls `rep-lookup` edge function
- Results: Cards for each rep (photo, name, title, party, district, phone, website)
- "Save" button on each card → saves to `member_reps`

### Section 2: "Your Representatives" (logged-in users)
- Cards for saved reps from `member_reps`
- Quick actions: "Call", "Visit Website", "Write a Letter"

### Section 3: "Bills That Matter"
- List of `tracked_bills` relevant to cooperative/food/housing topics
- Each bill card: number, title, status badge, sponsor, last action
- "Track This Bill" button → saves to `member_bill_tracking`
- LB Relevance note explaining why this bill matters to members

### Section 4: "Write Your Rep"
- Select a rep from saved list
- Select a template topic (cooperative, food security, housing, general)
- Template auto-fills with member name, rep name, district
- "Copy to Clipboard" button
- "Open Email" button (mailto: link with subject + body)
- Usage count incremented on copy/email

### Header Banner
Non-partisan statement: "Not left or right. Forward. This tool helps you engage with YOUR representatives regardless of party. Democracy works when citizens participate."

Route: `/political-expedition`

Use `PortalPageLayout` with `variant="default"` (light — this is a workshop tool, not a showcase).

---

## TASK 4: Admin Bill Seeding

Create a simple admin panel (or seed in migration) with 5-10 bills relevant to LB's mission:
- Any cooperative-related legislation
- Food security bills
- Housing bills
- Small business support bills

These can be manually maintained by admin. No need for live Congress.gov API integration yet — that's a future enhancement.

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260322000017_political_expedition.sql` | Tables + templates + seed data |
| `supabase/functions/rep-lookup/index.ts` | Google Civic API rep lookup |
| `src/pages/PoliticalExpedition.tsx` | Main page with all 4 sections |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add route: `/political-expedition` |

---

## DEPLOY CHECKLIST

1. Set GOOGLE_API_KEY in Supabase secrets (if not already set for Gemini)
2. `npx supabase db push --linked`
3. Deploy `rep-lookup` edge function
4. Test: Enter address → see representatives
5. Test: Save rep → see in "Your Representatives"
6. Test: Select template → see auto-filled letter → copy to clipboard
7. Deploy to Firebase

---

## SUCCESS CRITERIA

- [ ] Address lookup returns real representatives (federal + state)
- [ ] Rep cards show photo, name, title, party, contact info
- [ ] Members can save their reps
- [ ] Bill tracker shows relevant legislation with status
- [ ] Letter templates auto-fill with member/rep details
- [ ] Copy to clipboard and mailto links work
- [ ] Non-partisan banner displayed prominently
- [ ] No party favoritism in UI or content

---

**Democracy is a muscle. This page is a gym.**

**FOR THE KEEP.**
