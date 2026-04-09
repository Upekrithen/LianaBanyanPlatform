# KNIGHT SESSION 146 — Kickstarter Campaign Pages + Pledge Flow + Chain Sync
## Bishop 036 | March 27, 2026
## Connects: K144 (Chain Dashboard, 13 campaigns seeded), B011 (Kickstarter Strategy)

---

## CONTEXT

K144 seeded 13 Kickstarter campaigns in the DB and built the Chain Dashboard. K146 builds the actual campaign pages — where members view, pledge to, and track individual campaigns. This connects Kickstarter backers to the LB platform through the chain mechanic.

**Depends on:** K144 (kickstarter_campaigns + chain_links tables), K142 (Production Projects), K131 (WelcomeGatePage / Red Carpet), B011 (Kickstarter Strategy — reward tiers, chain mechanic, Leap Frog cadence).

---

## DELIVERABLE 1: Campaign Detail Page — `KickstarterCampaignPage.tsx`

Create `/src/pages/KickstarterCampaignPage.tsx` at route `/hexisle/campaign/:slug`:

**Hero Section:**
- Campaign number badge: "Campaign 1 of 13"
- Title: "SlottedTop — Universal Hex Adapter"
- Type badge: Component / Character / Creature / Assembly (color-coded)
- Status: Upcoming / Live / Funded / Fulfilled
- Funding progress bar: "$X raised of $Y goal" with percentage
- Backer count
- Days remaining (if live)
- "Back This Campaign" CTA button

**Chain Banner (prominent, above the fold — per B011):**
> THE HEXISLE CHAIN — 13 Campaigns. One Journey.
> Back this campaign → earn a Chain Link → 5% bonus per link
> Your chain: X links → next link = Y% bonus
> Chain expires in Z days — don't break the chain!

**Reward Tiers Section:**
- 6 tiers from B011 (K144 seed data doesn't include tiers — hardcode or add column):
  - $5 Digital (STL + spec card + chain link)
  - $15 Single (1 unit + spec card + chain link)
  - $25 Pair (2 units + chain link)
  - $50 Starter Island (7 units + pouch + Cue Card deck + chain link)
  - $100 Builder (19 units + case + founding badge + Cue Card deck + chain link)
  - $250 Architect (37 units + premium case + 1yr membership + name in credits + chain link)
- Each tier: price, name, description, "Select This Tier" button
- Early Bird badge on first 100 at $15 tier ("$12 — 20% off!")

**Campaign Roadmap Section:**
- Vertical timeline showing all 13 campaigns
- Current campaign highlighted
- Leap Frog pattern visible (component vs character alternation)
- Chain bonus accumulation shown at each step

**Open Build Section (per B011):**
> OPEN BUILD: Download, Print, Improve
> STL file included at $5+ tier. Print it yourself. Test it.
> Submit improvements at /piggyback
> - Minor tweak → HexIsle Approved (Tier 2)
> - Compatible redesign → HexIsle Compatible (Tier 4)
> - Full innovation → Tereno Certified (Tier 1)

**Related Bounties:**
- Show open bounties from the bounty board related to this campaign's product

---

## DELIVERABLE 2: Campaign Pledge Flow — `CampaignPledgeModal.tsx`

Create `/src/components/hexisle/CampaignPledgeModal.tsx`:

- Triggered from "Back This Campaign" or "Select This Tier"
- Shows selected tier details
- Payment options: Credits (platform) / External (Kickstarter link)
- If paying via Credits: creates a pledge + chain_link record
- If external: redirects to Kickstarter URL with tracking param
- On success: chain extends, coin animation, "Link X earned! Bonus now Y%"
- Chain timer resets to 14 days from now

---

## DELIVERABLE 3: Campaign Directory — `HexIsleCampaignsPage.tsx`

Create `/src/pages/HexIsleCampaignsPage.tsx` at route `/hexisle/campaigns`:

- Grid of all 13 campaign cards
- Each card: campaign number, title, type icon, status, funding progress, backer count
- Color coding: Upcoming (gray), Live (amber pulse), Funded (green), Fulfilled (blue)
- Leap Frog visual: components in one color, characters in another
- "View Campaign" button on each
- Chain status banner at top: "Your chain: X links | Next: Campaign Y"

---

## DELIVERABLE 4: Hook — `useKickstarterCampaigns.ts`

Create `/src/hooks/useKickstarterCampaigns.ts`:

```typescript
// useCampaign(slug) → single campaign with pledge tiers
// useCampaigns() → all 13 campaigns with status + funding
// usePledge() → mutation: create pledge + chain_link
// useMyPledges() → user's pledge history across campaigns
// useCampaignBounties(campaignId) → related bounties
```

---

## DELIVERABLE 5: Routes and Navigation

**Routes:**
```
/hexisle/campaigns → HexIsleCampaignsPage
/hexisle/campaign/:slug → KickstarterCampaignPage
```

**Navigation:**
- HexIsle portal sidebar: "Campaigns" with Rocket icon
- Chain Dashboard: link to individual campaigns
- 2nd Second landing: link to /hexisle/campaigns

---

## CRITICAL RULES

1. **5% per link, 13 links = 65% max.** Non-negotiable.
2. **14-day chain timer.** Resets on each pledge.
3. **20% floor on break.** Chain breaks → bonus drops to 20%, not zero.
4. **No securities language.** "Backing" not "investing." "Tiers" not "shares."
5. **Early Bird: first 100 at $15 tier get $12.** 20% off, not more.
6. **Chain banner MUST be prominent** — above the fold on every campaign page.
7. **STL downloads at $5+ tier.** Per B011 Open IP model.

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | `src/pages/KickstarterCampaignPage.tsx` | CREATE |
| 2 | `src/components/hexisle/CampaignPledgeModal.tsx` | CREATE |
| 3 | `src/pages/HexIsleCampaignsPage.tsx` | CREATE |
| 4 | `src/hooks/useKickstarterCampaigns.ts` | CREATE |
| 5 | `src/App.tsx` | MODIFY (routes) |
| 6 | `src/components/AppSidebar.tsx` | MODIFY (nav) |

**6 files (4 new, 2 modified).**

---

**FOR THE KEEP.** 🏰
