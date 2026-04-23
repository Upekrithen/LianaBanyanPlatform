# Pudding #58: The Red Carpet

*What if your first customer was already waiting before you signed up?*

---

## At a Glance

You are a leather crafter. You have never heard of Liana Banyan. But 47 people on the platform have heard of you — because someone shared your Instagram, and other members said "I want that."

Now you get an email: "47 people want your product. $1,200 in backing committed. Click here to claim your page."

You click. Your project page is already built. Your backers are already there. Your first month of pre-orders is already funded.

That is the Red Carpet.

---

## More Info

### The Cold Outreach Problem

Every marketplace has the same chicken-and-egg problem: you need sellers to attract buyers, and buyers to attract sellers. The standard solution is to recruit sellers first — cold emails, social media ads, "join our platform" campaigns. The seller signs up, lists their product, and waits. Sometimes buyers come. Usually they do not. The seller leaves. The marketplace has burned money acquiring a seller who produced nothing.

### The Red Carpet Inverts the Model

Instead of recruiting sellers and hoping buyers follow, the Red Carpet recruits demand first.

Here is the sequence:

**Step 1: A member nominates a creator.** "I follow this leather crafter on Instagram. I wish she was on the platform." The member shares the creator's social media link.

**Step 2: Other members pile on.** They visit the pre-populated Red Carpet page — which the platform built automatically from the creator's public social media — and click "I Want This." Some go further and pledge Credits (platform service tokens) or actual cash backing.

**Step 3: Demand accumulates.** Over days or weeks, the page collects "I Want This" votes, pledged backing, and comments. The platform tracks everything.

**Step 4: The creator gets the email.** Not a generic "join our marketplace" pitch. A specific, data-backed message: "47 people want your leather wallets. $1,200 committed. Here is your page — it is already built."

**Step 5: One-click claim.** The creator clicks "Claim This Project." In a single action:
- Their page goes live
- All pledges convert to pre-orders
- All "I Want This" voters join their notification list
- Their Cue Card and Treasure Map activate
- They are operational — with customers — in under two minutes

### Why This Works

The email the creator receives is not a pitch. It is evidence.

"Join our marketplace" is a pitch. Every marketplace sends that email. It means nothing.

"47 real people pledged $1,200 for your product" is evidence. The creator can visit the page and see the pledges. They can read the comments. They can verify every number. This is not marketing. This is proof of demand.

And because the pledges are real — backed by actual committed funds — the creator does not have to take a leap of faith. Their first month of sales is already funded before they make their first product on the platform.

---

## Full Detail

### The Pre-Population Engine

The Red Carpet page is built automatically from the creator's public social media. The platform extracts:

- **Name and profile image** from their Instagram/Etsy/website
- **Product images** from their public posts
- **Description** from their bio

This pre-populated page is clearly labeled "This creator has not joined yet — this page was built by the community." There is no impersonation. The creator's work is attributed. The community is openly saying: "We want this person here."

### The Demand Signal Cascade

When a creator claims their page, a cascade fires:

1. **Pledges convert.** Every financial commitment transitions from "held" to "active." The creator's first production run is funded.
2. **Voters convert.** Every "I Want This" vote becomes a notification subscription. The creator has a mailing list before they send their first message.
3. **Treasure Map activates.** The creator's business plan — craft-specific, with economics already calculated — opens at the appropriate step (experienced creators skip beginner content).
4. **Cue Card generates.** A shareable card is created so the creator can start spreading the word immediately.

All of this happens in one click. The infrastructure was pre-built by the community. The creator just walks in and starts working.

### The 90-Day Safety Net

What if the creator never claims? The pledges do not hang forever. After 90 days, unclaimed pledges automatically refund. Every pledger gets their money back. No one loses anything except the hope that the creator would join.

This time limit creates natural urgency — the community knows that if they want the creator, they need to reach out personally, not just pledge and wait. "Hey, 47 people on this platform want your stuff. You have 60 days before the pledges expire. Here is the link." That peer-to-peer outreach is more effective than any marketing email the platform could send.

### Why No Other Marketplace Does This

Most marketplaces cannot pre-populate seller pages because:
1. They would need the seller's permission (Red Carpet uses only publicly available information)
2. Their business model charges sellers to list (Red Carpet is free — $5/year membership covers everything)
3. They have no mechanism for community-funded pre-orders (Red Carpet uses the pledge escrow system)
4. They would cannibalize their own acquisition budget (Red Carpet replaces the acquisition budget entirely)

The Red Carpet works because the cooperative's economics are different. The platform does not need to charge sellers. It does not need an advertising budget. It needs members who care enough to say "I want that creator here" — and a system that converts that desire into a funded welcome.

---

*Pudding #58 — The Red Carpet*
*Bishop B061 | April 2, 2026*
*~950 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  58,
  'The Red Carpet',
  'the-red-carpet',
  'What if your first customer was already waiting before you signed up?',
  'pudding-58-the-red-carpet',
  950,
  ARRAY['red-carpet', 'demand-signal', 'creator-recruitment', 'cold-start', 'pre-orders'],
  ARRAY['1948', '1949', '1950', '1955']::text[],
  'bishop',
  'draft'
);
```
