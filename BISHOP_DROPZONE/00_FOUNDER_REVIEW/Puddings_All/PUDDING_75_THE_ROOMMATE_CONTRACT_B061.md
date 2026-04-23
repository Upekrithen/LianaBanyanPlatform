# Pudding #75: The Roommate Contract

*What if living together came with a playbook — not a prayer?*

---

## At a Glance

You move in with someone. You split rent. You split utilities. You agree on who cleans what.

Three months later, they have not cleaned the bathroom once. The electric bill is $80 higher because they leave every light on. You are furious. They are oblivious.

The Roommate Contract exists because good intentions are not a system.

---

## More Info

### The Roommate Problem

Living with other people is the most common economic arrangement in America — and the least structured. Millions of households operate on verbal agreements, assumed expectations, and hope.

The failure modes are predictable:
- **Chore disputes.** "I always do the dishes." "No, I do."
- **Financial disputes.** "You owe me for last month's electric." "I thought we split it."
- **Behavioral disputes.** "Your guests stay too late." "You never told me that bothered you."

None of these are personality problems. They are systems problems. The household has no written expectations, no tracking mechanism, and no resolution process.

### How the Roommate Contract Works

Through Liana Banyan's Housing domain, roommates create a digital Roommate Contract. It covers:

**Responsibilities.** Who does what. Not "we'll take turns" — a specific schedule. Monday: Person A cleans the kitchen. Tuesday: Person B takes out trash. The schedule is visible to everyone in the household.

**Finances.** How costs are split. Rent: 50/50. Utilities: proportional to bedroom size. Groceries: separate unless Cooperative Purchasing (shared). The numbers are specific and tracked.

**House Rules.** Quiet hours. Guest policies. Shared space usage. Pet rules. Anything that matters to the household. Written down, agreed to, visible.

**Grace Periods.** Life happens. A roommate gets sick and misses their chore day. The contract includes a grace period — a defined window before a missed responsibility becomes a formal issue. Three days? A week? The household decides.

### The Stamp System

When a responsibility is missed beyond the grace period, the Roommate Contract uses a stamp system — the same acknowledgment stamp model as the political arenas:

- **Stamp 1:** Notification. "Your Tuesday trash duty was missed. This is your first stamp."
- **Stamp 2:** Warning. "This is your second stamp. A third will trigger a household meeting."
- **Stamp 3:** Household meeting. The roommates sit down (or message) and address the pattern. Not the individual incident — the pattern.

Stamps reset after 90 days of clean compliance. The system is designed for accountability, not punishment.

---

## Full Detail

### The Three-Level Appeal

What if a stamp is unfair? The roommate who got stamped can appeal:

**Level 1: Direct conversation.** "I was stamped for missing trash duty, but I swapped with you last week and you forgot." The other roommate can remove the stamp.

**Level 2: Household vote.** If the household has three or more people, the other roommates vote on whether the stamp stands.

**Level 3: Star Chamber.** If the dispute cannot be resolved internally, it can be escalated to the cooperative's dispute resolution system. A three-member panel reviews the contract, the stamps, and both sides' positions.

This three-level system means no single roommate has unchecked power. A vindictive roommate cannot stamp you into oblivion — the appeal process provides checks at every level.

### Photo Consent and Privacy

The Housing domain includes a Photo Consent layer. In shared living spaces, members may take photos of common areas (for before/after cleaning documentation, maintenance requests, etc.). The Roommate Contract specifies:

- Photos of common areas: allowed for documentation purposes
- Photos of private rooms: only with the room occupant's consent
- Photos shared with the cooperative (for maintenance or disputes): must be flagged and consented

This is especially important for FHA (Fair Housing Act) compliance. The cooperative does not collect, store, or require photos that could be used for discriminatory purposes. Photo documentation serves the household's accountability system — not surveillance.

### Why Digital, Not Paper

A paper roommate agreement sits in a drawer and is forgotten. The digital Roommate Contract is:

- **Always accessible.** On your phone, in the cooperative's app.
- **Self-updating.** When the chore schedule changes, everyone sees it immediately.
- **Tracked.** Completion of responsibilities is logged. Not by a camera — by the members themselves checking off tasks.
- **Connected.** The contract integrates with Cooperative Purchasing (shared grocery orders), the Family Table (household financial tracking), and the Housing domain's maintenance request system.

### The Housing Vision

The Roommate Contract is one piece of the cooperative's housing strategy. The full vision:

- **WaterWheel.** Revenue from cooperative housing flows in a 30/40/15/15 split — 30% to property improvement, 40% to member equity, 15% to cooperative reserve, 15% to operating costs.
- **Roommate Accountability.** The contract and stamp system for shared living.
- **Vacation Coordination.** Household members coordinate time off so responsibilities are covered.
- **Vehicle Sharing.** Household members share cooperative vehicles through Local Wheels.

Together, these systems treat housing not as a transaction but as a community — structured, accountable, and connected to the cooperative's broader economy.

---

*Pudding #75 — The Roommate Contract*
*Bishop B061 | April 2, 2026*
*~850 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  75,
  'The Roommate Contract',
  'the-roommate-contract',
  'What if living together came with a playbook — not a prayer?',
  'pudding-75-the-roommate-contract',
  850,
  ARRAY['roommate-contract', 'housing', 'accountability', 'stamps', 'grace-period'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
