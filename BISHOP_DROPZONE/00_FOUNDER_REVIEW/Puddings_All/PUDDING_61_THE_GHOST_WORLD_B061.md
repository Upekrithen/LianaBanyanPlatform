# Pudding #61: The Ghost World

*What if you could browse a store that does not exist yet — and make it real?*

---

## At a Glance

You are scrolling through a marketplace. You see a leather messenger bag you love. The listing says "Ghost" — it is not for sale yet. No one is making it. The listing was created by the community because someone said "I wish this existed."

You click "I Want This." So do 200 other people.

Somewhere, a leather crafter gets an email: "201 people want this bag. $4,800 committed. Claim your project."

The Ghost World is where demand goes to become reality.

---

## More Info

### The Inventory Problem

Traditional marketplaces require inventory. A seller must make the product, list it, photograph it, and wait for buyers. If buyers do not come, the inventory sits. The seller has spent money and time on something nobody wanted.

This is backwards. The seller guesses what buyers want. The buyer scrolls through what sellers guessed. The intersection of "what was made" and "what was wanted" is often empty.

### Ghost World Inverts the Sequence

In Ghost World, the product does not exist yet. What exists is *demand.*

A Ghost listing is created when:
1. A member says "I wish someone would make X"
2. The platform creates a placeholder listing from the description
3. Other members vote "I Want This" or pledge backing
4. When demand reaches a threshold, the platform recruits a creator (via the Red Carpet system) or matches the listing to an existing member with the right skills

The product is manufactured *after* demand is proven — not before. Zero waste. Zero unsold inventory. Zero guessing.

### Ghost Credits

When you vote "I Want This" on a Ghost listing, you can optionally pledge Ghost Credits — a commitment that converts to a real pre-order if the product goes live. Ghost Credits are not spent. They are held in escrow until either:

- **A creator claims the project** → your Ghost Credits convert to backing, and you are first in line
- **90 days pass with no creator** → your Ghost Credits return to you automatically

This means voting for a Ghost product costs you nothing unless the product actually gets made. And if it does get made, you are guaranteed a spot because you backed it before it existed.

---

## Full Detail

### The Demand Validation Engine

Ghost World is not just a wishlist. It is a demand validation engine that solves the cooperative's biggest manufacturing problem: what should we make?

Traditional manufacturers guess. They do market research, run focus groups, build prototypes, and hope. The cooperative does not guess. It measures.

Every Ghost listing accumulates three types of signal:

1. **"I Want This" votes** — free, no commitment. Shows interest.
2. **Ghost Credit pledges** — committed, escrowed. Shows willingness to pay.
3. **Comments** — qualitative feedback. Shows what people want and why.

A Ghost listing with 500 votes, $12,000 in pledged Credits, and 47 comments saying "I need this for my commute" is not a guess. It is a verified demand signal backed by financial commitment.

### From Ghost to Real

When a Ghost listing hits critical mass, three things can happen:

**Path A: Creator Recruitment.** The platform identifies a creator who can make the product and sends them the Red Carpet invitation. "500 people want this. $12,000 committed. Claim the project."

**Path B: Community Manufacturing.** If the product fits the cooperative's manufacturing infrastructure (Canister System for small plastics, HexIsle for terrain, Pioneer Nodes for larger production), the cooperative can manufacture it directly through its decentralized factory network.

**Path C: Design Democracy.** The community votes on the design. Multiple creators propose variations. The winning design gets manufactured. The losing designs go back to Ghost status for future consideration.

### Why Ghost World Matters for the Cooperative

Ghost World eliminates the cooperative's single biggest risk: producing things nobody wants.

Every Pioneer Node (manufacturing location) has limited capacity. Every material order costs money. Every production run takes time. If the cooperative manufactures the wrong product, it wastes all three.

Ghost World ensures that every production decision is backed by measured demand. The cooperative does not make something because a manager thinks it will sell. It makes something because 500 members said they want it and put money behind that claim.

This is Cost+20% applied to *decisions*, not just pricing. The cooperative does not spend money on products that might fail. It spends money on products that have already been validated by the people who will buy them.

### The 70/30 Browse Rule

Ghost World uses a 70/30 visibility rule: 70% of what you see in the marketplace is real products for sale. 30% is Ghost listings. The Ghost listings are clearly marked but integrated into the normal browse experience.

This means every time you shop, you encounter things that do not exist yet — and you have the power to make them exist. Browsing becomes a creative act. You are not just consuming. You are curating. Your "I Want This" vote shapes what the cooperative builds next.

The marketplace is not a catalog. It is a conversation between what exists and what should.

---

*Pudding #61 — The Ghost World*
*Bishop B061 | April 2, 2026*
*~850 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  61,
  'The Ghost World',
  'the-ghost-world',
  'What if you could browse a store that does not exist yet — and make it real?',
  'pudding-61-the-ghost-world',
  850,
  ARRAY['ghost-world', 'demand-validation', 'ghost-credits', 'manufacturing', 'zero-waste'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
