# Pudding #73: The Crew Call

*What if finding help was as easy as posting a note on the community board?*

---

## At a Glance

You need someone to photograph your leather wallets for the marketplace. On Fiverr, you search through thousands of freelancers, compare prices, read reviews from strangers, and hope the person you pick actually delivers.

On Liana Banyan, you post a Crew Call: "Need product photos for 10 leather wallets. Location: San Antonio. Budget: 50 Credits. Deadline: Friday."

A member in your area who has photography skills sees the call. They accept. They show up. They take the photos. They earn 50 Credits and Marks for completing a bounty. You get your photos.

No algorithm. No bidding war. No platform taking 20-30% of the freelancer's payment.

---

## More Info

### The Gig Platform Problem

Gig platforms like Fiverr, Upwork, and TaskRabbit solve a real problem: connecting people who need work done with people who can do it. But they solve it with extraction:

- **Fiverr takes 20%** from the freelancer and 5.5% from the buyer
- **Upwork takes 10-20%** from the freelancer
- **TaskRabbit takes ~15%** from the Tasker plus a service fee from the client

The total platform tax on a simple job can reach 25-35%. On a $50 gig, the worker might get $35. The rest goes to the platform.

### How Crew Calls Work

A Crew Call is a structured request for help, posted to the cooperative's community board. It includes:

- **What you need:** Clear description of the task
- **Where:** Location (for in-person tasks) or "remote"
- **Budget:** In Credits, cash, or a combination
- **Deadline:** When the work needs to be done
- **Skills needed:** Tags that match to members' registered skills

Members who match the skills and location see the Crew Call in their feed. They can accept, ask questions, or pass. The first qualified member to accept gets the job — no bidding, no auction, no race to the bottom.

### The Cost Comparison

| Platform | Task: Product photography (10 items) | Worker receives | Platform takes |
|----------|--------------------------------------|----------------|---------------|
| Fiverr | $50 | ~$40 | ~$10 (20%) |
| Upwork | $50 | ~$40-45 | ~$5-10 (10-20%) |
| **Crew Call** | **50 Credits** | **50 Credits + Marks** | **Cost+20% of processing** |

On a Crew Call, the worker receives the full amount. The cooperative's Cost+20% applies only to the transaction processing — not to the worker's payment. If processing costs 50 cents, the cooperative takes 60 cents (50 + 20%). The worker gets everything else.

---

## Full Detail

### Skills Registry

Every member can register their skills — photography, writing, carpentry, web design, cooking, driving, teaching, translating. The skills registry is not a resume. It is a capability map that the Crew Call matching system uses.

When you post a Crew Call tagged "photography," every member within the specified radius who has registered photography as a skill gets notified. This is targeted, not broadcast. The photographer five miles away sees your call. The web designer across the country does not.

### Crew Calls and the ADAPT Score

Completing Crew Calls builds your ADAPT Score:

- **Activity:** You accepted and completed a job. Activity goes up.
- **Dependability:** You met the deadline. Dependability goes up.
- **Accountability:** You resolved any issues professionally. Accountability stays high.
- **Trust:** The requester rates the interaction. Trust adjusts accordingly.

Over time, members who consistently complete Crew Calls build a reputation that makes them the first choice for future calls. Not because an algorithm promotes them — because their ADAPT Score demonstrates they deliver.

### From Crew Call to Business

Many members discover their business through Crew Calls. A member who takes three photography Crew Calls and gets great ratings realizes: "I could do this as a business." They create a Treasure Map for photography services. They build a Cue Card. They register as a Bounty Photographer.

The Crew Call was the discovery mechanism. The cooperative provided the path from "I can take good photos" to "I run a photography business."

### Crew Calls vs. Full-Time Employment

Crew Calls are not jobs. They are tasks. The member is not an employee of the requester. There is no employment relationship, no benefits obligation, no scheduling authority.

This distinction matters for the cooperative's legal structure. Crew Call participants are independent members completing bounded tasks for Credits or cash. The cooperative facilitates the connection but does not employ either party. This keeps the cooperative clean under labor law while giving members a flexible way to earn and contribute.

The cooperative is not trying to replace employment. It is providing a mechanism for members to help each other — compensated, tracked, and reputation-building — outside the extractive gig economy.

---

*Pudding #73 — The Crew Call*
*Bishop B061 | April 2, 2026*
*~800 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  73,
  'The Crew Call',
  'the-crew-call',
  'What if finding help was as easy as posting a note on the community board?',
  'pudding-73-the-crew-call',
  800,
  ARRAY['crew-call', 'gig-economy', 'skills', 'adapt-score', 'bounty'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
