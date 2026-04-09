# KNIGHT SESSION 191 — Creator & Press Red Carpet + Outreach Pipeline
## Bishop B050 | Wire outreach for 47+ creators, all sponsors, all letter recipients, and press
## Opening Gambit needs EVERYONE to have a landing page and a contact path

---

## CONTEXT

The Opening Gambit fires 100 letters + 47 Instagram creators + press outreach simultaneously. EVERY recipient needs:
1. A personalized Red Carpet landing page (or mini version for creators)
2. A contact/outreach mechanism
3. A cue card business card they can scan

Currently:
- Red Carpet exists for ~20 VIP Crown Letter recipients (domain-matched walkthrough)
- 47 Instagram creators are in a static data file (`productionRunDraft.ts`) — NOT in DB
- `creator_draft_picks` table exists but only has 10 demo entries
- No Press Junket feature exists for walk-in press
- No outreach pipeline connects MoneyPenny to the send queue

---

## DELIVERABLE 1: Seed 47 Creators into Database

**MODIFY:** Existing `creator_draft_picks` table or create seed migration.

Read all 47 creators from `src/data/productionRunDraft.ts` and insert into `creator_draft_picks` with:
- `platform` = 'instagram' (or their actual platform)
- `creator_handle` = their handle
- `status` = 'undrafted' (ready for outreach)
- `cue_card_sent_at` = NULL (not yet contacted)

---

## DELIVERABLE 2: Mini Red Carpet for Creators

**NEW FILE:** `src/pages/CreatorRedCarpet.tsx`

Route: `/welcome/creator/:handle`

A simpler version of the VIP Red Carpet, personalized for Instagram/maker creators:
- **Header:** "Welcome, @{handle} — you were selected for the Liana Banyan Creator Program"
- **What this is:** Brief explanation of the cooperative (2-3 sentences, not the full Crown pitch)
- **What you get:** 
  - Keep 83.3% of everything you earn (compare to Instagram/Etsy/etc.)
  - $5/year membership — unlimited career attempts
  - Your own storefront, cue cards, QR codes
  - Pioneer Program bonuses (first 10 in each role)
- **Your Cue Card:** Pre-generated cue card with their handle, scannable QR linking back to their profile
- **CTA:** "Claim Your Spot" → membership signup flow (pre-filled with their handle as referral source)
- **Skip for now:** Ghost browsing option — let them explore without signing up

---

## DELIVERABLE 3: Press Junket Landing Page

**NEW FILE:** `src/pages/PressJunket.tsx`

Route: `/press`

A public page for ANY press person (not just big outlets):

### Sections:
1. **Hero:** "Welcome to Liana Banyan — Press Room"
2. **Quick Facts:** Innovation count, production systems, patent count, membership cost — all from `{{template}}` variables
3. **The Story:** 1-paragraph summary (link to full Cephas articles)
4. **Press Kit:** Downloadable assets
   - Logo files
   - Founder headshot
   - Key statistics one-pager
   - Academic papers (links to Cephas)
5. **Guided Tour:** Interactive walkthrough of the platform
   - Option 1: "I have 5 minutes" → highlights reel
   - Option 2: "I have 30 minutes" → full tour through portals
   - Option 3: "I want the deep dive" → link to Cephas economics library
6. **Ask Questions:** Embedded form that creates a MoneyPenny inbox item
   - Fields: Name, outlet/publication, email, question/topic
   - Submits to `moneypenny_inbox` (or create if doesn't exist)
   - Auto-response: "Thank you — Jonathan will respond within 24 hours"
7. **Schedule Interview:** Link to Calendar booking (if available) or email
8. **For Large Outlets:** Special note — "If you're from a publication with 100K+ readers, mention it in your message and we'll prioritize a dedicated briefing"

---

## DELIVERABLE 4: Universal Red Carpet for ALL Letter Recipients

**MODIFY:** Red Carpet system

Currently `red_carpet_recipients` has ~20 VIP entries. Expand to cover ALL outbound:

1. Seed ALL 100 letter recipients into `red_carpet_recipients` with:
   - `recipient_name`, `recipient_email` (if known), `domain` (for domain-matching)
   - `walkthrough_type`: 'crown' (full VIP), 'academic' (research-focused), 'media' (press-focused), 'blessing' (short + warm), 'creator' (mini biz card style)
   - Each type renders a different Red Carpet experience
   
2. For recipients without known email domains, create a fallback: `/welcome/:code` where `code` is a unique 6-character invite code stored on the recipient row.

3. For ALL sponsors (Vince Staples, future Medallion Sponsorship invitees): create sponsor-specific Red Carpet at `/welcome/sponsor/:code` showing the patent selection + 50-person sponsorship flow.

---

## DELIVERABLE 5: Outreach Pipeline via MoneyPenny

**MODIFY:** MoneyPenny or create a new outreach sub-system

Wire the Content Command Center (K190) to outreach:

1. When Founder approves a letter in Content Command Center with destination='email':
   - Create a `moneypenny_outbound` record: recipient, subject, body (from content_markdown), attachments, status='queued'
   - MoneyPenny dashboard shows "Outbound Queue: X items ready to send"
   - Founder clicks "Send" on each item (or "Send All Approved")
   - MoneyPenny compiles the actual email (or marks it for manual send if email not available)

2. For Instagram creators (destination='social'):
   - Generate a cue card image with their handle + QR to `/welcome/creator/:handle`
   - Queue a DM draft (text + image) in the social dispatch system
   - Or generate a "share link" the Founder can manually DM

3. For press (destination='press'):
   - Auto-create a Press Junket invitation with personalized link
   - Queue in MoneyPenny outbound

---

## DELIVERABLE 6: Cue Card Business Cards for Every Recipient

For EACH person in the outreach pipeline:
1. Auto-generate a personalized cue card using CueCardGeneratorV2 templates:
   - Front: "[Recipient Name] — Invited to Liana Banyan" + QR code to their Red Carpet
   - Back: What they'll find inside (customized by walkthrough_type)
2. Store the generated card in `helm_content_queue` as content_type='cue_card'
3. Physical card option: create a `print_orders` record with order_type='cue_card' when Founder opts in

---

## DELIVERABLE 7: Stats + Deploy

- Update useCanonicalStats: knightSessions=191
- Build: zero errors
- Deploy all 8 targets

---

## CRITICAL RULES

- Cost + 20% is CONSTITUTIONAL. Creators keep 83.3%.
- Entity is Liana Banyan CORPORATION. NOT an LLC.
- Credits NEVER cash out to fiat. One-way valve.
- Single-level attribution ONLY. NOT MLM.
- Press Junket must be accessible to ANY press person, not just big outlets.
- ALL outreach goes through Founder approval first (Content Command Center).

---

## BUILD + DEPLOY CHECKLIST

```
[ ] Seed 47 Instagram creators into creator_draft_picks
[ ] CreatorRedCarpet.tsx — /welcome/creator/:handle
[ ] PressJunket.tsx — /press
[ ] Expand red_carpet_recipients for ALL 100 letter recipients
[ ] Fallback invite codes for recipients without known domains
[ ] MoneyPenny outbound queue (wire to Content Command Center)
[ ] Auto-generate personalized cue cards for each recipient
[ ] Physical card ordering option
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 191 — Bishop (Foreman), B050*
*EVERYONE gets a Red Carpet. EVERYONE gets a cue card. EVERYONE gets a contact path.*
*FOR THE KEEP!*