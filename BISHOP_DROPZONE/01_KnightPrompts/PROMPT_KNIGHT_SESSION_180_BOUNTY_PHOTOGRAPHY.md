# KNIGHT SESSION 180 — Bounty Photography Network (#2100)
## Bishop B049 | New Feature Build
## Priority: HIGH — feeds Battery Dispatch content + Opening Gambit

---

## CONTEXT

Innovation #2100: Bounty Photography Network — zero-storage, dual-channel photography system. Members photograph local businesses and post to their own social media. LB stores only metadata (~850 bytes per item). Two channels: Instagram/TikTok (visual) and the cooperative Resource Board (data).

This is one of Diana Vigil's Cue Card roles (see B048 family Cue Cards).

**Key architectural insight:** LB never hosts a photo. Instagram/TikTok does. We store the URL + attribution + Mark allocation. See Pudding Article #18 ("Zero Storage, Full Income") for the full explanation.

---

## DELIVERABLE 1: Bounty Photography Claim Flow

### User Story
As a member, I want to claim a photography bounty by pasting a social media URL, tagging a business, and earning Marks — without uploading any files to LB.

### Build

1. **New route: `/bounty/photography`**
   - Shows available photography bounties near the member's location
   - Bounties are auto-generated from businesses in the directory that lack recent photos
   - Manual bounties can be posted by Captains or business owners

2. **Claim Bounty Component (`BountyClaimForm.tsx`)**
   ```
   Fields:
   - Social media URL (Instagram, TikTok, Facebook, X — validate URL pattern)
   - Business name (autocomplete from business directory)
   - Business location (auto-fill from directory, or manual GPS pin)
   - Photo description (optional, 280 chars max)
   - "Claim Bounty" button
   ```

3. **Database: `bounty_claims` table**
   ```sql
   CREATE TABLE bounty_claims (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     member_id UUID REFERENCES members(id),
     bounty_id UUID REFERENCES bounties(id) NULL, -- null if organic (no specific bounty)
     social_url TEXT NOT NULL,
     social_platform TEXT NOT NULL, -- instagram, tiktok, facebook, x
     business_name TEXT NOT NULL,
     business_id UUID REFERENCES businesses(id) NULL,
     location GEOGRAPHY(POINT, 4326),
     description TEXT,
     marks_awarded INTEGER DEFAULT 2,
     status TEXT DEFAULT 'pending', -- pending, verified, rejected
     verified_by UUID REFERENCES members(id) NULL,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

4. **Database: `bounties` table**
   ```sql
   CREATE TABLE bounties (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     business_id UUID REFERENCES businesses(id),
     business_name TEXT NOT NULL,
     location GEOGRAPHY(POINT, 4326),
     bounty_type TEXT DEFAULT 'photography', -- photography, video, review
     marks_reward INTEGER DEFAULT 2,
     max_claims INTEGER DEFAULT 10, -- max photos per bounty
     claims_count INTEGER DEFAULT 0,
     status TEXT DEFAULT 'active', -- active, filled, expired
     posted_by UUID REFERENCES members(id),
     expires_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

5. **Mark allocation:** 2 Marks per verified photo claim. Auto-verified if member has TasteMaker status. Otherwise, peer verification (another member confirms the photo exists at the URL).

---

## DELIVERABLE 2: Photography Dashboard in Helm

In the member's Helm, add a "Photography" card:

- Total photos claimed
- Total Marks earned from photography
- Map view of their claimed locations (dots on a map)
- "Claim New Bounty" CTA button
- List of recent claims with status (pending/verified/rejected)

---

## DELIVERABLE 3: Business Intelligence View

For Captains and the Captain's Dashboard:

- Which businesses have photography coverage?
- Which businesses LACK coverage? (auto-generate bounties for these)
- Geographic heat map of photo density
- "Post Bounty" button to create manual bounties for specific businesses

---

## BUILD + DEPLOY CHECKLIST

```
[ ] bounties table migration
[ ] bounty_claims table migration
[ ] BountyClaimForm.tsx component
[ ] URL validation for Instagram/TikTok/Facebook/X
[ ] Business autocomplete integration
[ ] /bounty/photography route
[ ] Mark allocation on verified claim
[ ] Helm Photography card
[ ] Captain's Dashboard business coverage view
[ ] Auto-generate bounties for uncovered businesses
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 180 — Bishop (Foreman), B049*
*Innovation #2100 — Bounty Photography Network*
*FOR THE KEEP!*
