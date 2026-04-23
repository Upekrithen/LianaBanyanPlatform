# Pudding #50: The Four-Dollar Question

*You keep 83.3%. But where does the other 16.7% go?*

---

## At a Glance

On most platforms, when you sell something for $5, you wonder: how much am I actually getting? The answer is usually depressing. Etsy takes about 20-25% after all fees. Amazon takes 30-45%. The App Store takes 30%. Uber takes 25-40%.

On Liana Banyan, if you sell something for $5, you keep $4.17. Every time. The math never changes.

But here is the question nobody asks: where does the other 83 cents go?

---

## More Info

### The 83-Cent Tour

On a $5 transaction, the platform takes 83 cents. That is the Cost+20% margin. Let us follow the money.

**What "Cost+20%" actually means:** The platform calculates its actual operational cost to process the transaction — payment processing fees, server costs, edge function execution, storage. Call it 69 cents on a $5 transaction. Then it adds 20% of that cost. That is about 14 cents. Total: 83 cents.

Wait. The platform's *profit* on a $5 transaction is 14 cents? 

Yes. Fourteen cents. The rest — 69 cents — is the actual cost of doing business. The platform does not mark up the product. It marks up *its own costs.* By 20%. And that 20% markup is what funds everything else.

### What the 14 Cents Funds

That 14-cent margin, multiplied across every transaction on the platform, funds:

- **Sixteen charitable initiatives** — food security, healthcare access, education, housing, civic engagement, and eleven more
- **The AI development team** — four AI agents that build and maintain the platform
- **Infrastructure** — servers, databases, edge functions, deployment
- **Patent protection** — defensive IP filings to prevent extraction

The 14 cents is not profit extracted by shareholders. There are no shareholders. It is the cooperative's operating margin — locked by structural bylaw at exactly 20% above cost. Not 21%. Not 25% "for a little cushion." Twenty percent.

### Why "Cost+20%" and Not Just "20%"

This distinction matters enormously.

"We take 20%" means: on a $5 sale, the platform takes $1.00 and you keep $4.00.

"Cost+20%" means: on a $5 sale, the platform takes 83 cents (its actual cost of 69 cents plus a 20% margin of 14 cents) and you keep $4.17.

The difference is 17 cents per transaction. That does not sound like much until you multiply it by every sale, every creator, every day. On a platform doing $1 million in annual transactions, the difference between "20% fee" and "Cost+20% margin" is $17,000 that stays with creators instead of the platform.

And that is on a *small* platform. Scale it up and the numbers get serious fast.

### The Comparison

| Platform | You sell for $5 | You keep | Platform takes |
|----------|----------------|----------|---------------|
| Etsy (after all fees) | $5.00 | ~$3.75-4.00 | ~$1.00-1.25 |
| Amazon (FBA) | $5.00 | ~$2.75-3.50 | ~$1.50-2.25 |
| App Store | $5.00 | $3.50 | $1.50 |
| Uber (driver) | $5.00 | ~$3.00-3.75 | ~$1.25-2.00 |
| **Liana Banyan** | **$5.00** | **$4.17** | **$0.83** |

The gap between Liana Banyan and every other platform is not a pricing decision. It is a structural decision. Cost+20% is a constitutional bylaw — it cannot be changed by management, by a board vote, or by investor pressure, because there is no investor pressure. There are no investors.

---

## Full Detail

### The Math on the Label

Pudding #46 introduced the idea that 83.3% is a structural claim, not a marketing number. This article shows you the mechanics underneath.

Every transaction on the platform goes through a pricing engine that:

1. **Calculates actual cost** — payment processor fee (typically 2.9% + $0.30), server compute, storage, function execution
2. **Adds exactly 20%** — not an estimate, not a range, not "up to 20%"
3. **Shows the breakdown** — the creator sees exactly what the cost was and what the margin is

This transparency is not optional. It is built into the transaction display. You do not have to trust the cooperative's marketing. You can see the math.

### Why Platforms Don't Do This

Most platforms cannot adopt Cost+20% because their business model requires variable margins:

- **Surge pricing** (Uber) — margins increase when demand is high
- **Promotional fees** (Etsy) — additional charges for visibility, advertising, payment processing
- **Tiered commissions** (Amazon) — different rates for different categories, different seller levels
- **In-app purchase tax** (Apple) — flat 30% regardless of actual cost

All of these require opacity. The platform cannot show you its actual cost because the margin varies and, in many cases, the actual cost is *far below* the fee they charge. The gap between cost and fee is profit — and showing that gap would invite the question: why are you taking so much?

Cost+20% answers the question before it is asked. The margin is 20%. It is always 20%. Here is the cost. Here is the 20%. Here is your $4.17. Next question.

### The Fourteen-Cent Economy

Fourteen cents of margin on a $5 transaction seems impossibly thin. How does a platform survive on that?

Three answers:

**Volume.** Fourteen cents times a thousand transactions a day is $140/day, or $51,100/year. That funds a meaningful operating budget. At ten thousand transactions a day, it is $511,000/year — enough to run serious infrastructure.

**AI, not employees.** The Four-Agent development team costs API tokens per session ($5-15 per Knight session), not salaries. No office. No benefits. No HR department. The development overhead that would cost a traditional startup $500K-2M/year in engineering salaries costs the cooperative a fraction of that in AI compute.

**No investors to feed.** Every cent of that 14-cent margin goes back into the cooperative. No dividends. No stock buybacks. No board demanding 40% margins to justify a valuation. The cooperative's only obligation is to its members — and the members are getting $4.17 out of every $5.

### The Four-Dollar Question, Answered

You keep $4.17 on a $5 sale. The other 83 cents keeps the platform running, funds sixteen charitable initiatives, protects the intellectual property from extraction, and pays for the AI team that builds everything.

And here is the part that matters most: that 83 cents will *never increase* as a percentage. Cost+20% means if the platform's actual costs go *down* (more efficient servers, better payment processing), the margin goes down too. The savings pass to the creator automatically. The bylaw does not say "at least 83.3%." It says "Cost+20%." If cost drops, your percentage goes up.

No other platform can make that promise. Because no other platform is built this way.

---

*Pudding #50 — The Four-Dollar Question*
*Bishop B061 | April 2, 2026*
*~1,100 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  50,
  'The Four-Dollar Question',
  'the-four-dollar-question',
  'You keep 83.3%. But where does the other 16.7% go?',
  'pudding-50-the-four-dollar-question',
  1100,
  ARRAY['cost-plus-20', 'creator-economics', 'transparency', 'margin', 'pricing'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
