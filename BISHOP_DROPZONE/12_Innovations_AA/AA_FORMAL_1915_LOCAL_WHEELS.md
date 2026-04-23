# A&A FORMAL — Innovation #1915: Local Wheels (Cooperative Vehicle Provision Model)
## Bishop Session 027 | March 22, 2026
## Patent Relevance: HIGH

---

## Classification

| Field | Value |
|-------|-------|
| Innovation # | 1915 |
| Name | Local Wheels (renamed from Running Jewels) |
| Parent Initiative | Rally Group (#8) / Mission THREE (Transport) |
| Parent Innovations | #1922 (Lemon Lot), #1924 (Vehicle Contribution Onboarding), #1925 (Transport Bundle Architecture), #1926 (Safety Ledger) |
| Session Originated | Bishop 021 |
| Built | Knight 85 — `/local-wheels` page + `local_wheels_fleet` table |
| Priority | HIGH |
| Status | DEPLOYED (K85) |

---

## Description

Local Wheels is the Liana Banyan cooperative's **fleet vehicle provision model**. LB acquires vehicles and provides them to members who become delivery drivers. The member earns income while simultaneously paying down the vehicle — a cooperative alternative to commercial fleet ownership, rideshare vehicle leasing (Uber/Lyft), and traditional auto loans.

### The Three Problems It Solves

1. **Delivery fleet**: LB-branded businesses (restaurants, groceries, storefronts) need delivery infrastructure. Local Wheels provides it.
2. **Member transportation**: Members who need a vehicle for daily life (commuting, errands, childcare transport) get one through work, not through a predatory auto loan.
3. **Member income**: The driver earns 80% of delivery fees — a living wage from cooperative work, not gig economy scraps.

## Mechanics

### Vehicle Acquisition

Three paths for vehicles entering the Local Wheels fleet (#1924 Vehicle Contribution Onboarding):

| Path | How It Works | Who Owns the Vehicle |
|------|-------------|---------------------|
| **Sale** | Member sells vehicle to LB fleet outright. Payment in Credits, eligible Marks, or cash. | LB |
| **Earn-Down** | Vehicle transfers to fleet. 20% of driver earnings → vehicle payoff. 80% → driver. When fully paid, member owns free and clear. | LB → Member (when paid) |
| **Lease-In** | FUTURE only. Requires commercial insurance solution. Not yet available. | Member |

### The 80/20 Split

For every delivery fee earned by a Local Wheels driver:

- **80%** → Driver's income (LB Card or Credits, driver's choice)
- **20%** → Vehicle payoff fund (reduces the remaining balance on the Earn-Down)

When the 20% accumulations fully cover the vehicle acquisition cost + maintenance reserve:

- The vehicle title transfers to the driver
- The driver keeps 100% of future earnings (minus the standard Cost+20% platform fee)
- The driver can continue delivering for LB, list the vehicle on Lemon Lot (#1922), or use it privately

### Payoff Math (Founder's Test Case)

**Vehicle**: 2005 Suburban
**Acquisition cost**: ~$3,000 (purchased at auction through Running Jewels, Founder's existing business)
**Repair costs**: ~$500 (battery + tuneup = first Shade-Tree Mechanic Crew Call)
**Total to pay down**: $3,500

**Delivery revenue per month** (conservative):
- 3 deliveries/day × $8 average fee × 22 working days = $528/month gross
- Driver gets 80% = $422/month
- Earn-Down gets 20% = $106/month

**Payoff timeline**: $3,500 ÷ $106/month = **33 months** (under 3 years)

At payoff, the driver owns a working vehicle with zero debt and an established delivery route earning $422+/month.

### Multi-Use Vehicle Schedule

Local Wheels vehicles serve multiple cooperative functions on a daily schedule:

| Time | Use | Revenue Source |
|------|-----|---------------|
| 6:00-8:00 AM | Pickup/dropoff rides (Mission THREE) | Rider fees at Cost+20% |
| 8:00 AM-2:00 PM | Delivery route (restaurants, groceries) | Delivery fees at Cost+20% |
| 2:00-4:00 PM | Pickup/dropoff rides | Rider fees |
| 4:00-7:00 PM | Evening delivery route | Delivery fees |
| Off-hours | Available for Lemon Lot rental or Crew Call transport | Rental fees or Crew Call bounty |

One vehicle, five revenue streams, continuous earning.

### Safety Ledger Integration (#1926)

Every Local Wheels trip requires Safety Ledger documentation:

- Photo of driver and customer/passenger (PEOPLE, not vehicle condition)
- GPS location stamp
- Timestamp
- Trip ID linked to order/ride

Protocol is mandatory for all delivery trips. For rides: mandatory for first ride per new pair, optional for repeat rides.

## Patentable Elements

1. **Cooperative vehicle provision with Earn-Down**: 80/20 split where driver earnings simultaneously fund income AND vehicle acquisition
2. **Multi-use vehicle scheduling**: Single vehicle serving delivery, rideshare, rental, and Crew Call functions on a daily rotation
3. **Title transfer on payoff completion**: Vehicle ownership transitions from cooperative to member automatically upon Earn-Down completion
4. **Three-path onboarding**: Sale, Earn-Down, and Lease-In as distinct vehicle contribution models within a single cooperative fleet system

## First Real-World Test

The Founder's 2005 Suburban is the first Local Wheels test case:

1. Vehicle acquired through Running Jewels (Founder's existing car auction business)
2. Battery + tuneup = first Shade-Tree Mechanic Crew Call
3. La Capital del Sabor (local restaurant) = first delivery route
4. Founder's Ambassador son = first driver candidate
5. Delivery route: La Capital → nearby office buildings for lunch orders

This single vehicle tests the entire Mission THREE pipeline:
- Vehicle acquisition (Running Jewels → Local Wheels)
- Vehicle repair (Crew Call → Shade-Tree Mechanic)
- Delivery route (Commerce Engine → order → dispatch → deliver)
- Driver income (80% to driver via LB Card)
- Vehicle payoff (20% to Earn-Down fund)
- Safety documentation (Safety Ledger for every trip)

## Connection Map

```
#1915 Local Wheels
  ├── #1922 Lemon Lot (member-owned vehicles, distinct from fleet)
  ├── #1923 Rideshare Routes (commute matching, own insurance)
  ├── #1924 Vehicle Contribution Onboarding (3 paths into fleet)
  ├── #1925 Transport Bundle Architecture (4 systems under Rally Group)
  ├── #1926 Safety Ledger (mandatory for all fleet trips)
  ├── #1911 Two-Domain (driver earns eligible Marks if funded project)
  ├── #1913 Shepherding (driver as standing delivery Shepherd)
  ├── Mission ONE (food delivery from LMD storefronts)
  ├── Mission TWO (housing residents need transport)
  └── Mission THREE (transport eliminates homelessness barrier)
```

## SEC/Legal Notes

- Earn-Down is a **conditional sale agreement**, not a security
- No expectation of investment returns — driver earns through LABOR
- Vehicle title transfer is a commercial transaction, not a financial instrument
- 80/20 split is a compensation structure, not a profit-sharing arrangement
- Insurance: LB carries commercial fleet insurance on all Local Wheels vehicles (cost included in Cost+20% calculation)

---

**FOR THE KEEP.**
