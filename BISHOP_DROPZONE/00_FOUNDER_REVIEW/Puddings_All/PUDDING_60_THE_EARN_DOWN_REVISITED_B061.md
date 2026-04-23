# Pudding #60: The Keys to the Car

*What if your Uber built you participation instead of debt?*

---

## At a Glance

You drive for a rideshare company. You put 50,000 miles on your car this year. At the end of the year, you own... nothing. The car has less value than when you started. The company made money from your miles. You got a 1099.

What if every mile you drove paid down the car itself?

---

## More Info

### The Rideshare Extraction Model

Rideshare companies like Uber and Lyft have a structural problem: the driver provides the most expensive piece of equipment — the car — and the company captures the margin from its use. The driver absorbs:

- Depreciation (the car loses value with every mile)
- Fuel
- Insurance
- Maintenance
- Wear and tear on a personal asset used for commercial purposes

The company provides: an app and a payment system. The company earns: 25-40% of every fare.

After a year of full-time rideshare driving, the driver has earned income but *lost* participation. Their car is worth less. They have no ownership stake in anything. The miles they drove built the company's valuation, not their own.

### The Earn-Down

Liana Banyan's Local Wheels program inverts this. A cooperative vehicle is owned by the cooperative, not the driver. The driver earns equity in the vehicle through use.

Here is the math:

- The cooperative acquires a vehicle through Cooperative Purchasing (pooled buying power, Cost+20% pricing).
- The vehicle is assigned to a driver-member.
- Every fare the driver completes, 20% of the driver's share goes toward paying down the vehicle's cost.
- The other 80% is the driver's cash earnings — paid out immediately.
- When the paydown reaches 100%, the driver owns the vehicle outright.

The driver never takes a loan. Never makes a car payment. Never deals with a dealership. They drive, they earn, and the car gradually becomes theirs.

### The Numbers

Say the cooperative acquires a vehicle for $15,000 (used, reliable, inspected).

| Driver's fare share per ride | $12.00 |
|-----|------|
| 20% to earn-down | $2.40 |
| 80% cash to driver | $9.60 |
| Rides to full ownership (at $2.40/ride) | ~6,250 |
| At 25 rides/day, 5 days/week | ~50 weeks |

In roughly one year of full-time driving, the driver owns a $15,000 vehicle — without ever making a payment, taking a loan, or putting money down. They earned it by driving.

---

## Full Detail

### Why This Is Not a Lease

A lease gives you use of a vehicle in exchange for monthly payments. At the end, you return the vehicle or buy it at residual value. You built no equity during the lease.

The Earn-Down gives you use of a vehicle AND builds participation simultaneously. Every ride moves the needle. There are no monthly payments — the paydown happens automatically as a percentage of fares. If you drive more, you own faster. If you drive less, it takes longer. But the participation only goes in one direction: toward you.

### Why This Is Not a Loan

A loan requires qualification, credit checks, interest payments, and risk of repossession. The driver takes on debt.

The Earn-Down involves zero debt. The cooperative owns the vehicle until the paydown is complete. The driver is not borrowing money — they are earning equity through work. If the driver leaves the cooperative before completion, they keep whatever participation they have earned and the cooperative reassigns the vehicle. No collections. No credit hit. No repo.

### The Safety Ledger

Every Earn-Down vehicle has a Safety Ledger — a trip-by-trip log that records:

- Trip start and end (GPS coordinates if available)
- Fare amount
- Driver's cash share (80%)
- Earn-down contribution (20%)
- Running total toward ownership
- Vehicle condition notes

The Safety Ledger is transparent. The driver can see exactly how close they are to ownership at any time. The cooperative can verify that the vehicle is being used appropriately. Both sides have a complete, auditable record.

### The Hood Uber Connection

In March 2026, a MySA article documented "Hood Uber" — informal rideshare networks operating in San Antonio neighborhoods where Uber and Lyft do not reliably serve. Drivers in these communities are already doing the work. They just do not have the infrastructure.

Local Wheels with Earn-Down gives Hood Uber drivers:
- A vehicle they can earn into ownership
- Insurance tracking built into the platform
- A Cost+20% fare structure that is transparent to riders
- A Safety Ledger that protects both driver and rider
- No 25-40% platform extraction — the cooperative's margin is Cost+20% on the actual cost of the ride infrastructure, not 30% of the fare

The driver keeps 80% of their fare share as cash. The other 20% builds them an asset. After a year, they own a car. After two years, they own a car free and clear and keep 100% of their fare share minus Cost+20%.

### Why Cooperatives Can Do This

A corporation cannot do the Earn-Down because the corporation needs to own the fleet as an asset on its balance sheet. The fleet's value supports the company's valuation, which supports its stock price, which supports its backers' returns.

A cooperative does not have investors. It does not have a stock price. The fleet is not an asset to be maximized — it is a tool for members to use. Transferring ownership to the member who uses the vehicle is not "giving away assets." It is the cooperative fulfilling its purpose: helping members build economic independence.

The car was never the cooperative's to keep. It was always the driver's to earn.

---

*Pudding #60 — The Keys to the Car*
*Bishop B061 | April 2, 2026*
*~900 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  60,
  'The Keys to the Car',
  'the-keys-to-the-car',
  'What if your Uber built you participation instead of debt?',
  'pudding-60-the-keys-to-the-car',
  900,
  ARRAY['earn-down', 'local-wheels', 'vehicle', 'hood-uber', 'participation'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
