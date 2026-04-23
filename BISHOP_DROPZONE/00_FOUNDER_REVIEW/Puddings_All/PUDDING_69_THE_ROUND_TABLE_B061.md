# Pudding #69: The Round Table

*What if every member had a seat at governance — and nobody's seat was bigger?*

---

## At a Glance

King Arthur did not put a table in his hall. He put a *round* table. No head. No foot. Every seat equal. The shape was the message.

Liana Banyan's governance works the same way. Every member pays $5. Every member gets one vote. The Founder pays $5 and gets one vote. The Round Table is not a metaphor. It is the operating agreement.

---

## More Info

### The Governance Problem

Most platforms have no governance. You are a user, not a citizen. Facebook does not ask you what features to build. Amazon does not let you vote on its return policy. Uber does not give drivers a seat at the table.

Some platforms have governance theater — advisory boards, "creator councils," community feedback forms that go into a void. The decisions were already made. Your input is decoration.

Cooperative governance is different because it has to be. A cooperative is owned by its members. The members are the shareholders, the customers, and the workforce — simultaneously. When you make a governance decision in a cooperative, you are making it about your own platform, your own business, your own community.

### How the Round Table Works

The cooperative has three levels of governance:

**Level 1: Design Democracy.** What gets built. Members vote on product designs, feature proposals, and production priorities. This is where day-to-day decisions happen — which wallet design to manufacture, which feature to add next, which initiative to fund.

**Level 2: Initiative Councils.** Who leads. Each of the 16 initiatives (food security, healthcare, manufacturing, civic engagement, etc.) has a council. Council members are elected by the members who participate in that initiative. Each council elects a representative to the Board of Directors.

**Level 3: Board of Directors.** Where it all comes together. The Board sets strategic direction, approves budgets, and resolves major governance questions. Board members are elected by the councils — which means they are elected by members, through representatives, in a structure that ensures every initiative has a voice.

### One Member, One Vote

In Design Democracy votes, every member gets one vote. Marks provide a multiplier (1x to 3x based on contribution level), but the base is always one. A member with zero Marks still has one vote. A member with 10,000 Marks has three votes — not three hundred. Not three thousand. Three.

This is deliberate. Reputation should amplify, not dominate. A highly contributing member has earned a stronger voice — but not a voice so strong it drowns out everyone else. Three times one is influence. Three hundred times one is oligarchy.

---

## Full Detail

### The Crown System

Each initiative has a Crown — a designated first seat. The Crown holder is recruited (not elected) because they bring expertise, credibility, and commitment to the initiative. The Crown holder:

- Leads the initiative council
- Breaks tie votes
- Sets standards for the initiative's work
- Holds a seat on the Steering Committee

But the Crown holder can be replaced by the council through a vote. The Crown is not permanent. It is earned by contribution and maintained by service. A Crown holder who stops showing up loses their seat.

### The Star Chamber as Governance Backstop

When governance fails — when a vote is contested, a council is deadlocked, or a member files a formal grievance — the Star Chamber adjudicates. Three-member panels review the dispute, hear both sides, and issue a binding decision.

The Star Chamber is not a court of appeal for every disappointment. It is a backstop for genuine governance failures. If Design Democracy produced a result that violated the cooperative's bylaws, the Star Chamber can void it. If a council election was conducted improperly, the Star Chamber can order a new one. If the Board made a decision that contradicted the cooperative's structural bylaws (like changing Cost+20%), the Star Chamber can block it.

### Governance as Architecture

The Round Table is not just a governance model. It is an architectural requirement. Every technical system in the cooperative — the voting engine, the council management tools, the Board reporting dashboard — is built to enforce the governance rules:

- **Voting weights are calculated, not configured.** No admin can change a member's voting multiplier. It is derived from their Mark total.
- **Election results are final when posted.** No admin can override an election result. The system records votes, tallies them, and declares a winner.
- **Bylaws are code.** Cost+20% is not just a number in a document. It is enforced in the pricing engine. The membership price ($5) is not just a promise. It is the SKU in Stripe. Structural rules exist in both legal documents AND code — dual enforcement.

This is governance-as-code. The same way smart contracts enforce rules on a blockchain, the cooperative's code enforces rules on its platform. The difference: the code can be audited by any member, changed by a governance vote, and is backed by a legal operating agreement — not by "code is law" ideology.

### Why Round?

Because the shape matters. A long table has a head. A podium has a speaker. A stage has a performer.

A round table has members. Equal distance from the center. Equal voice. Equal stake.

The Founder sits at the Round Table. He pays $5. He gets one vote (with whatever Mark multiplier he has earned). He has no veto. He has no special authority in elections. He is the Founder — the person who built the table. But once the table is built, every seat is the same.

That is the promise. That is the architecture. That is the cooperative.

---

*Pudding #69 — The Round Table*
*Bishop B061 | April 2, 2026*
*~900 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  69,
  'The Round Table',
  'the-round-table',
  'What if every member had a seat at governance — and nobody''s seat was bigger?',
  'pudding-69-the-round-table',
  900,
  ARRAY['governance', 'round-table', 'voting', 'design-democracy', 'initiative-councils'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
