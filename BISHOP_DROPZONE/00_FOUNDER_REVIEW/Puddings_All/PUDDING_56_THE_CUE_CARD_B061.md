# Pudding #56: The Cue Card

*Fifteen seconds to explain what you do. That is all you get.*

---

## At a Glance

You make leather wallets. Someone asks what you do. You have fifteen seconds before their eyes glaze over. What do you say?

Most makers fumble this. They talk about materials, process, inspiration, their Etsy shop, their Instagram, their journey. By the time they are done, the listener has mentally left.

A Cue Card solves this. Front: what you make and why it matters. Back: how to buy it. Fifteen seconds. Done.

---

## More Info

### The Elevator Pitch Problem

The "elevator pitch" is a concept from startup culture: explain your business in the time it takes to ride an elevator. The problem is that elevator pitches are designed for investors, not customers. They emphasize market size, competitive advantage, and growth potential — things an investor cares about and a potential customer does not.

A customer wants to know three things:
1. What is it?
2. Why should I care?
3. How do I get it?

A Cue Card answers all three in fifteen seconds.

### Anatomy of a Cue Card

**Front (the hook):**
One sentence. Asks a question or makes a statement that the listener can instantly relate to.

"Are you tired of your wallet falling apart every six months?"

**Back (the answer):**
What you make. What makes it different. How to get it. A link or a QR code.

"Hand-stitched leather wallets. Built to last twenty years. Cost+20% pricing — you pay what it costs to make, plus 20%. No markup. No middleman. [QR code to your project page]"

**Say It Fast (the spoken version):**
The fifteen-second script a member memorizes for in-person conversations.

"I make leather wallets by hand. They are built to last twenty years. You can see my work at [link]. Five bucks a year to join the cooperative — that is it."

### How Members Use Cue Cards

- **In person**: At craft fairs, farmers markets, family gatherings. The Say It Fast script is what you actually say. The QR code on the card is what you hand over.
- **Online**: Share the Cue Card as an image on social media. The front is the hook. The link goes to your project page.
- **In the cooperative**: Cue Cards are how members introduce each other's work. "You should check out Maria's leather wallets. Here is her Cue Card." Members become each other's salesforce — not because they are paid, but because the Cue Card makes it *easy*.

---

## Full Detail

### The Attribution Chain

When you share a Cue Card and someone joins the cooperative through it, the system records the chain:

```
Maria (leather maker) created the Cue Card
→ James (Maria's friend) shared it
→ Sarah (James's coworker) signed up through it
```

Maria gets credit as the creator. James gets credit as the sharer. Sarah is the new member. This chain is tracked — not for commissions (the cooperative does not do MLM) — but for recognition. One level only. James helped Maria's card reach Sarah. That is recorded. But if Sarah shares the card to a fourth person, James gets no credit for that. One level. Period.

This matters because multi-level attribution is the mechanism that turns legitimate sharing into predatory schemes. The cooperative cuts it at one level by design — Sponsorship Marks are one level only.

### Cue Cards as Cold Start Tools

For the cooperative, every Cue Card is a micro-marketing tool that costs nothing to produce and nothing to distribute. A member with a compelling Cue Card is a walking advertisement for both their product and the cooperative itself.

The math: if every active member creates one Cue Card and shares it with five people, and 10% of those people sign up, the cooperative grows by 50% of its active membership — with zero advertising spend. The growth is organic, personal, and trust-based. Nobody signed up because of a Facebook ad. They signed up because someone they know handed them a card and said "check this out."

### The Cue Card Campaign Library

Not every member knows what to say on their Cue Card. The cooperative maintains a library of campaign templates — proven Cue Card formats organized by craft type, industry, and use case.

A leather crafter can browse the library and find: "Here are three Cue Card templates that work for handmade leather goods. Pick one, customize it with your product, and you are done."

The templates are based on what actually works — which Cue Cards generate the most signups, the most shares, the most project page visits. The library learns from the cooperative's own data.

### The Say It Fast Challenge

Once a month, the cooperative runs a Say It Fast Challenge: members record a fifteen-second video of their Cue Card pitch. The community votes on the best ones. Winners get featured on the front page.

This is not a sales competition. It is a practice opportunity. Most makers have never practiced saying what they do in fifteen seconds. The Challenge gives them a reason to practice — and the community feedback helps them improve.

Fifteen seconds. That is all you get. Make them count.

---

*Pudding #56 — The Cue Card*
*Bishop B061 | April 2, 2026*
*~850 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  56,
  'The Cue Card',
  'the-cue-card',
  'Fifteen seconds to explain what you do. That is all you get.',
  'pudding-56-the-cue-card',
  850,
  ARRAY['cue-card', 'say-it-fast', 'cold-start', 'attribution', 'marketing'],
  ARRAY['1945']::text[],
  'bishop',
  'draft'
);
```
