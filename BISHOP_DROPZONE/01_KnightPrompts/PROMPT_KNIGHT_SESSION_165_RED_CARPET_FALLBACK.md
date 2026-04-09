# KNIGHT SESSION 165 — Red Carpet Personalization + Fallback
## Dirty Dozen DD-7 — CRITICAL PATH FOR WAVE 1
## Every Crown Letter says "LianaBanyan.com/RedCarpet — enter your email and it will recognize you."
## If Red Carpet doesn't work, the letters are broken promises. This session fixes that.

---

## CONTEXT

28 Crown Letter recipients (Wave 1) + 6 investors (Wave 2) + 10 academics (Wave 3) + 15 media (Wave 4) = **59 recipients** will hit LianaBanyan.com/RedCarpet with their email address expecting a personalized walkthrough. If nothing loads, or if it loads generic content, the most important first impression in the platform's history fails.

Red Carpet was deployed in K117. This session verifies it works for actual recipients, adds personalization data, and builds a bulletproof fallback.

---

## TASK 1: Verify Red Carpet Current State

**Goal:** Determine what `/RedCarpet` currently does when someone enters an email.

**Steps:**
1. Navigate to LianaBanyan.com/RedCarpet (or /red-carpet — check routing)
2. Check: Does the page load? Is there an email input field?
3. Try entering a test email — what happens?
4. Check `red_carpet_recipients` table in Supabase (or equivalent) — does it exist? What columns?
5. Check if K117 Red Carpet code is still intact or was overwritten

**Deliverable:** Status report — working / partially working / broken. What exists, what's missing.

---

## TASK 2: Seed Red Carpet Recipient Data

**Goal:** Create or populate the recipient recognition table so emails are recognized.

**Schema needed** (create if not exists):

```sql
CREATE TABLE IF NOT EXISTS red_carpet_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_domain TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  role_offered TEXT,
  initiative TEXT,
  wave INTEGER NOT NULL DEFAULT 1,
  personalized_greeting TEXT,
  walkthrough_sections JSONB DEFAULT '[]',
  photo_path TEXT,
  attachment_paths JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_visited TIMESTAMPTZ,
  visit_count INTEGER DEFAULT 0
);
```

**Seed data for the 12 SEC-clean Crown Letter recipients + key Wave 2:**

```sql
-- Wave 1: Crown Letters (Leadership Seats)
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, personalized_greeting) VALUES
('ycombinator.com', 'Michael Seibel', 'CEO', 'Liana Banyan Corporation', 1, 'Mr. Seibel, welcome to Liana Banyan. This walkthrough was built for you.'),
('michaelseibel.com', 'Michael Seibel', 'CEO', 'Liana Banyan Corporation', 1, 'Mr. Seibel, welcome to Liana Banyan. This walkthrough was built for you.'),
('simoninvestigations.com', 'Tom Simon', 'CFO', 'Financial Integrity', 1, 'Mr. Simon, welcome. The architecture is laid bare — exactly as promised in the letter.'),
('alumni.clemson.edu', 'Tom Simon', 'CFO', 'Financial Integrity', 1, 'Mr. Simon, welcome. The architecture is laid bare — exactly as promised in the letter.'),
('craigslist.org', 'Craig Newmark', 'Infrastructure Chancellor', 'Platform Integrity', 1, 'Mr. Newmark, welcome. No pitch deck, no salesperson — just the architecture.'),
('craignewmarkphilanthropies.org', 'Craig Newmark', 'Infrastructure Chancellor', 'Platform Integrity', 1, 'Mr. Newmark, welcome. No pitch deck, no salesperson — just the architecture.'),
('khanacademy.org', 'Sal Khan', 'Chancellor', 'Didasko Education', 1, 'Sal, welcome to Didasko — the education initiative built on your principles.'),

-- Wave 2: Investors / Philanthropists
('berkshirehathaway.com', 'Warren Buffett', 'French Fleet', 'Seed Capital + Credibility', 2, 'Mr. Buffett, welcome. The math is here. The sails are waiting.'),

-- Wave 3: Academics (top 3)
('newschool.edu', 'Trebor Scholz', 'Academic Advisor', 'Platform Cooperativism', 3, 'Professor Scholz, someone actually built it. Here''s how.'),
('colorado.edu', 'Nathan Schneider', 'Academic Advisor', 'Cooperative Economics', 3, 'Professor Schneider, everything for everyone — literally. The walkthrough is yours.'),
('stanford.edu', 'Erik Brynjolfsson', 'Academic Advisor', 'Digital Economy', 3, 'Professor Brynjolfsson, the metrics are built in. Here''s the full architecture.');

-- Add more recipients as Founder provides email domains
```

**IMPORTANT:** We match on email DOMAIN, not full email address. This means anyone from @ycombinator.com gets Seibel's Red Carpet. If this is a problem, add full email matching as priority. Founder can provide specific email addresses later.

**Also seed these domain aliases** — recipients may use personal emails:
- Seibel: @gmail.com with "michael.seibel" prefix? (Founder to confirm)
- Khan: @salkhanconsulting.com? (Founder to confirm)

---

## TASK 3: Build Personalized Walkthrough Flow

**Goal:** When a recognized email is entered, show a personalized walkthrough — NOT the generic welcome page.

**Flow:**
```
User enters email at /RedCarpet
  │
  ├─ MATCH FOUND (domain or full email in red_carpet_recipients)
  │   │
  │   ├─ Show personalized greeting: "Mr. Seibel, welcome to Liana Banyan."
  │   ├─ Show their role: "You've been offered the CEO Crown."
  │   ├─ Show relevant sections based on their interest:
  │   │   ├─ Economics Deep Dive (Cost+20%, Three-Gear Currency)
  │   │   ├─ Production Systems Overview (31 live systems)
  │   │   ├─ Their Initiative Details (if applicable)
  │   │   ├─ Patent Portfolio Summary
  │   │   ├─ Academic Papers (if academic recipient)
  │   │   └─ "What Other Leaders Are Joining" (ecosystem forming)
  │   ├─ Show Founder contact: 406-578-1232 | Founder@LianaBanyan.com
  │   ├─ Link to Cephas for deep dive
  │   ├─ Link to Press Junket (for domain-verified review)
  │   └─ Track visit (update last_visited, increment visit_count)
  │
  └─ NO MATCH (email domain not recognized)
      │
      └─ FALLBACK (see Task 4)
```

**Design:**
- Clean, dignified, personal — NOT a SaaS onboarding flow
- Large text, generous whitespace, no clutter
- Founder's photo (optional, per letter package)
- "This walkthrough was prepared specifically for you" feeling
- Scrollable single page, not a multi-step wizard
- Mobile responsive (recipient may open on phone from physical letter)

**Sections for each recipient type:**

| Recipient Type | Sections to Show |
|---------------|-----------------|
| CEO/CFO/Board (Seibel, Simon, Scott) | Full economics, governance, all 16 initiatives, patent portfolio, team |
| Initiative Leads (Khan, Dougherty, Glenn, etc.) | Their specific initiative deep-dive, economics, how Crown works |
| Investors (Buffett) | ROI paper, economics, competitive analysis, the ask |
| Academics (Scholz, Schneider, Brynjolfsson) | Academic papers, methodology, peer review invitation, Press Junket |
| Media (Doctorow, Newton, etc.) | Platform overview, enshittification defense, press kit, interview offer |

Store section configuration in `walkthrough_sections` JSONB field.

---

## TASK 4: Build Bulletproof Fallback

**Goal:** If Red Carpet fails — email not recognized, DB error, page broken — the recipient STILL gets a good experience and can reach the Founder.

**Fallback page must include:**

1. **Founder contact — PROMINENTLY displayed:**
   - Phone: **406-578-1232** (large, tappable on mobile)
   - Email: **Founder@LianaBanyan.com** (large, clickable)
   - "Jonathan Jones, Founder & General Manager"

2. **Brief platform overview** — 3 sentences max:
   - What Liana Banyan is (cooperative commerce, Cost+20%)
   - What it does (16 initiatives, creators keep 83.3%)
   - Why they're here (someone sent you a letter)

3. **Links to key resources:**
   - Cephas.LianaBanyan.org (full economics)
   - Cephas.LianaBanyan.org/under-the-hood/ (deep dive)
   - "If you received a letter from Jonathan Jones, please call or email directly."

4. **Email capture** (optional):
   - "Enter your email and we'll notify Jonathan you visited"
   - Stores to a `red_carpet_fallback_visits` table
   - Founder gets notified (email or platform notification)

**Fallback triggers:**
- Email domain not in recipients table
- DB connection error
- Any unhandled exception on Red Carpet page
- Direct navigation to /RedCarpet without entering email

**The rule: NO recipient should ever see a blank page, error screen, or generic 404. The worst case is: they see Founder's phone number and a brief explanation.**

---

## TASK 5: Test with 3 Recipient Emails

**Goal:** Verify end-to-end before declaring DD-7 GREEN.

Test these three domains:
1. `test@ycombinator.com` → should show Seibel's Red Carpet
2. `test@simoninvestigations.com` → should show Simon's Red Carpet
3. `test@newschool.edu` → should show Scholz's Red Carpet
4. `test@randomdomain.com` → should show FALLBACK (not error)
5. Navigate to /RedCarpet directly (no email) → should show email input or fallback

**Acceptance criteria:**
- [ ] Recognized email → personalized walkthrough loads
- [ ] Unrecognized email → fallback with Founder contact
- [ ] DB error → fallback with Founder contact
- [ ] Direct navigation → email input field or fallback
- [ ] Mobile responsive (test at 375px width)
- [ ] Visit tracking works (last_visited, visit_count update)

---

## BUILD + DEPLOY

After all tasks pass:
1. Run build — must succeed with zero errors
2. Push migration to remote DB
3. Deploy to all 8 hosting targets
4. Verify LianaBanyan.com/RedCarpet loads correctly post-deploy
5. Test one more time with `test@ycombinator.com`

---

## DIRTY DOZEN STATUS

When this session completes successfully:
- **DD-7 (Red Carpet + Fallback): GREEN** ✅

This unblocks Wave 1 Crown Letters. Every letter promises "LianaBanyan.com/RedCarpet — enter your email and it will recognize you." Now it will.

---

## FILES TO MODIFY/CREATE

| File | Action |
|------|--------|
| `platform/src/pages/RedCarpet.tsx` | Verify/rebuild personalized walkthrough |
| `platform/supabase/migrations/20260329000013_red_carpet_recipients.sql` | Create + seed table |
| `platform/src/components/RedCarpetFallback.tsx` | NEW — bulletproof fallback |
| `platform/src/components/RedCarpetWalkthrough.tsx` | NEW — personalized sections |

---

## WHAT NOT TO DO

- Do NOT require authentication to view Red Carpet — recipients are not members yet
- Do NOT show pricing, signup flows, or "join now" pressure — this is a dignified invitation
- Do NOT use a generic template — the WHOLE POINT is that it feels personal
- Do NOT hide Founder's phone number — if anything goes wrong, they must be able to call
- Do NOT run Hugo builds — all content from DB via React SPA (Founder decision B045)

---

*Prompt by Bishop (Foreman), Session B046*
*Dirty Dozen DD-7 — CRITICAL PATH*
*FOR THE KEEP!*
