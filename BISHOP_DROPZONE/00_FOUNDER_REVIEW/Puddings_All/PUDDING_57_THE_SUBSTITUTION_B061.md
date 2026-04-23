# Pudding #57: The Substitution

*How a cooperative moves real money without becoming a bank.*

---

## At a Glance

You make leather wallets. A customer wants one. On Etsy, the customer pays Etsy, Etsy takes 20-25%, and eventually you get the rest. On your own website, the customer pays you directly and you keep everything — minus payment processing.

On Liana Banyan, something different happens. The customer pays cash through the platform. The platform takes exactly Cost+20% — its actual cost to process the transaction, plus a 20% margin. You get 83.3% in actual cash. That cash can go to your bank account or your LB Card.

No tokens were converted. No internal currency was exchanged. Cash came in, cash went out. The cooperative is not a bank. It is a checkout counter.

---

## More Info

### The Banking Trap

Most platform cooperatives that try to handle money run into a wall: money transmission laws. The moment you accept money from Person A and send it to Person B, regulators want to know if you are a money transmitter. If you are, you need licenses in every state. Those licenses cost tens of thousands of dollars each, require compliance infrastructure, and take months to years to obtain.

This kills cooperative platforms. A small cooperative cannot afford the compliance burden that PayPal and Venmo carry. So most cooperatives either avoid handling money entirely (limiting their usefulness) or partner with a payment processor and accept whatever terms they get.

Liana Banyan does something structurally different.

### The Substitution Method

When a customer buys a product through the cooperative, here is what actually happens:

1. **Customer pays cash.** Credit card, debit card, bank transfer — standard payment through Stripe. Real money. Real dollars.

2. **Stripe processes the payment.** Stripe is a licensed payment processor. It handles the regulatory burden of accepting and routing payments. This is what Stripe does for millions of businesses.

3. **Platform takes Cost+20%.** The cooperative's actual cost to process this transaction — Stripe's fee, server costs, function execution — plus exactly 20% of that cost. On a $5 transaction, this is about 83 cents.

4. **Creator gets 83.3% in cash.** Not in Credits. Not in tokens. In actual USD. The creator chooses: bank deposit or LB Card load.

That is the entire money flow. Cash in from the customer. Cash out to the creator. The cooperative is a pass-through — a checkout counter that adds value (the marketplace, the community, the manufacturing infrastructure) but does not hold, convert, or transform the money.

### Where the Internal Currencies Fit

Credits, Marks, and Joules operate on a completely separate ledger. They track governance participation, reputation, and platform service access. They are arcade tokens — valuable inside the cooperative, meaningless outside it.

When a creator sells a wallet for $30 and gets $25 in cash, that creator might also earn 15 Marks for the transaction (reputation) and some Credits for platform service access. But the Marks and Credits are not the payment. They are metadata. The payment is $25 in cash.

This separation is the key to the entire design. Because the internal currencies never touch fiat, the cooperative is not converting anything. It is not transmitting money. It is not issuing stored value. It is processing standard commerce transactions through licensed infrastructure (Stripe for payments, Netspend for cards, Pathward for banking) while running a separate, internal, non-monetary system for governance.

---

## Full Detail

### Why Not Just Use Credits?

A reasonable question: if Credits are worth $1 each on the platform, why not just use Credits as money?

Because the moment you do, you become a money transmitter.

If Credits can be exchanged for dollars — if a member can "cash out" their Credits — then Credits are stored monetary value. Stored monetary value is regulated. You need licenses. You need compliance. You need capital reserves. You need examinations. You need lawyers.

By making Credits non-cashable, non-transferable arcade tokens, the cooperative avoids all of this. Credits are a service access mechanism — like a gym membership or a Costco card. They let you do things on the platform. They are not money.

The cash handling is done by licensed entities: Stripe processes payments. Netspend issues cards. Pathward provides banking. The cooperative sits in the middle, adding value through its marketplace and community, but never touching the money in a way that triggers regulatory classification.

### The LB Card Connection

The LB Card (issued through Netspend, backed by Pathward) is funded by actual cash — the creator's 83.3% share from sales, or cash loaded through standard reload channels. From Netspend's perspective, this is a normal prepaid card program. Cash goes in. Card gets loaded. Member spends. Standard.

What Netspend never sees: Credits, Marks, or Joules. Those live on Liana Banyan's internal ledger and never cross the boundary into the financial system. The card program and the currency system are two separate machines running side by side. One handles money. The other handles governance.

### Why This Matters

The Substitution Method is not a workaround. It is a design philosophy.

Most platforms blur the line between their internal economy and the real financial system. Facebook Credits (remember those?) tried to be both a game currency and a payment method. It got messy. Uber's driver earnings are tangled up in Uber's own financial infrastructure. Airbnb holds your money for days before releasing it.

The cooperative draws a bright line: cash on one side, governance tokens on the other. They never cross. The licensed financial partners handle everything on the cash side. The cooperative handles everything on the governance side. Nobody is confused about what is money and what is not.

And the member? The member gets their $25 in cash the same way they would from any other marketplace. Plus some Marks that unlock better features next month. Plus the knowledge that the platform took 83 cents instead of five dollars.

---

*Pudding #57 — The Substitution*
*Bishop B061 | April 2, 2026*
*~950 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  57,
  'The Substitution',
  'the-substitution',
  'How a cooperative moves real money without becoming a bank.',
  'pudding-57-the-substitution',
  950,
  ARRAY['substitution-method', 'payment', 'money-transmission', 'lb-card', 'compliance'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
