# Pudding #72: The Family Table

*What if the cooperative knew your family — not your data?*

---

## At a Glance

You are a member. Your spouse is a member. Your two kids are on your account. Your mother-in-law lives with you and needs prescriptions delivered.

On Amazon, you are five separate customer profiles being cross-sold to individually. On Liana Banyan, you are a family — and the cooperative serves the family.

The Family Table is where the cooperative sees households, not user accounts.

---

## More Info

### The Household Gap

Most platforms see individuals. One account, one customer, one set of recommendations, one purchase history. This ignores reality: most economic decisions are made by households, not individuals.

A family of five does not need five separate grocery orders. They need one. A household with an elderly parent does not need a separate healthcare initiative membership. They need the family's initiative participation to cover everyone under the roof.

The Family Table connects individual memberships into household units. Each person keeps their own account, their own ADAPT Score, their own Marks. But the cooperative understands that they shop together, eat together, and make economic decisions together.

### What the Family Table Does

**Shared Cooperative Purchasing.** The family aggregates their grocery needs into one order. Instead of three separate orders for rice, the household orders once. The wholesale price applies to the combined quantity.

**Family-linked initiatives.** When one family member participates in an initiative (healthcare access, food security, housing), the entire household benefits. The grandmother does not need her own $5 membership to receive prescriptions through the healthcare initiative — she is covered by the family's participation.

**Household budgeting.** The Family Table shows combined spending across all family members. "Last month, our household spent $387 through the cooperative and saved $142 compared to retail." This is the number that matters to families — not individual transaction histories.

**Children's accounts.** Kids under 18 get linked accounts with parental controls. They can participate in age-appropriate activities (Cue Card sharing, Design Democracy voting for kids' products) without independent membership. When they turn 18, their account becomes independent — and their participation history carries forward.

---

## Full Detail

### Family Types

The Family Table supports multiple household configurations:

- **Nuclear family.** Two parents, children. Standard setup.
- **Extended family.** Grandparents, aunts, uncles under the same roof. Common in many communities.
- **Multigenerational household.** Three or more generations. Increasingly common as housing costs rise.
- **Roommate household.** Unrelated adults sharing expenses. Connected through the Roommate Accountability system.
- **Single-parent household.** One adult, children. Gets the same cooperative purchasing benefits as a two-parent household.
- **Chosen family.** Close friends who function as a family unit. The cooperative does not define "family" by blood — it defines it by shared economic life.

Each configuration gets the same benefits. The cooperative does not privilege one family structure over another.

### The Privacy Balance

The Family Table knows who lives together. This is sensitive information. The cooperative handles it with two rules:

**Rule 1: Opt-in only.** Family connections are created by the members, not discovered by the platform. You add your spouse. Your spouse confirms. The connection exists because both people chose it.

**Rule 2: Individual accounts remain private.** Your personal purchase history, your ADAPT Score, your Marks — these are yours. Family Table shows aggregate household data (combined spending, combined savings) but does not let one family member see another's individual transactions unless both opt in.

The cooperative knows your household for the purpose of serving your household better. It does not use that information to target, profile, or cross-sell.

### Family Table and Cold Start

For the cooperative, the Family Table multiplies the impact of every membership. One $5 membership brings one person. But if that person connects their household, the cooperative now serves four or five people — for the same $5.

This is intentional. The cooperative's goal is not to maximize memberships. It is to maximize the number of people served. A family of five on one membership is better — for the cooperative and for the family — than five separate memberships with five separate grocery orders and five separate Cooperative Purchasing accounts.

The Family Table turns individual memberships into household service. And households are where economic life actually happens.

---

*Pudding #72 — The Family Table*
*Bishop B061 | April 2, 2026*
*~750 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  72,
  'The Family Table',
  'the-family-table',
  'What if the cooperative knew your family — not your data?',
  'pudding-72-the-family-table',
  750,
  ARRAY['family-table', 'household', 'cooperative-purchasing', 'privacy', 'cold-start'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
