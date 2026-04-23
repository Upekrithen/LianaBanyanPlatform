# Pudding #67: The Safety Ledger

*Every trip has a receipt. Every receipt tells the truth.*

---

## At a Glance

You are a rideshare driver. You pick up a passenger. You drive them home. On Uber, there is a GPS log somewhere in Uber's servers. You cannot see it. The passenger cannot see it. If something goes wrong, Uber decides what the data says.

On Liana Banyan, both of you see the same Safety Ledger. Start time, end time, GPS coordinates, fare breakdown. Every trip. Every time. No edits. No exceptions.

---

## More Info

### The Trust Problem in Rideshare

Rideshare platforms have a trust asymmetry. The platform sees everything — every trip, every location, every fare. The driver sees a summary. The passenger sees a receipt. Neither can independently verify what the other was charged or paid.

This creates problems:
- **Driver disputes:** "I drove 12 miles. Uber charged the rider for 12 miles. I got paid for 9." How do you prove it?
- **Passenger disputes:** "The driver took the long way. The fare was $8 more than it should have been." How do you verify?
- **Safety incidents:** "Something happened during the ride. Where exactly were we at 9:47 PM?" The platform knows. You do not.

### The Safety Ledger

The Safety Ledger is a per-trip record that both driver and passenger can see. It captures:

- **Trip start:** Time and GPS coordinates (if the device allows)
- **Trip end:** Time and GPS coordinates
- **Route:** Waypoints along the path (when GPS is available)
- **Fare breakdown:** Base cost, mileage, time, Cost+20% margin, driver's 80% share, earn-down contribution (if applicable)
- **Vehicle info:** Which cooperative vehicle was used
- **Condition notes:** Any notes about vehicle condition before or after the trip

This record is created at trip start and finalized at trip end. Both parties can view it immediately. It is not editable after finalization.

### Why "Safety" Ledger?

Because the first purpose is safety, not accounting.

If a passenger feels unsafe during a ride, they can share the Safety Ledger in real time — the live GPS location, the driver's identity, the vehicle information — with a trusted contact. If a driver feels unsafe, they can do the same. The ledger is not just a receipt. It is a witness.

After the ride, the ledger becomes accounting — the fare breakdown, the earn-down progress, the vehicle condition record. But the design priority is safety first, accounting second.

---

## Full Detail

### The Earn-Down Connection

For drivers in the Earn-Down program (where 20% of their fare share pays down a cooperative vehicle), the Safety Ledger is also their equity tracker. Every trip shows:

```
Trip #4,219
├── Fare: $14.00
├── Cost+20% margin: $2.33
├── Driver share (80%): $9.33
├── Earn-down (20%): $2.34
├── Total earn-down to date: $11,204 of $15,000
├── Ownership progress: 74.7%
└── Estimated rides to ownership: ~1,625
```

The driver can watch their ownership percentage climb with every trip. This is not a promise in a contract. It is a running total, updated in real time, backed by every individual trip record in the ledger.

### The Insurance Verification

K225 added insurance tracking to the vehicle system. Every cooperative vehicle in the Safety Ledger shows:

- Insurance provider
- Policy number (masked)
- Verification status: Insured / Insurance Pending
- Expiry date

A passenger getting into a cooperative vehicle can see — before the trip starts — that the vehicle is insured. A driver operating a cooperative vehicle has proof of insurance on file. The Safety Ledger makes insurance status transparent to both parties.

### GPS and Privacy

The Safety Ledger captures GPS coordinates when the device provides them. This raises a legitimate privacy question: who can see where you went?

The answer: **only the two parties in the trip.** The Safety Ledger is not public. It is shared between the driver and the passenger for that specific trip. The cooperative's admin can access it for dispute resolution (Star Chamber cases), but no other member can see your trip history.

GPS data is retained for 90 days after the trip, then automatically deleted. The fare and accounting data remains permanently (for earn-down tracking and tax records), but the granular location data expires. You have a right to your financial records. You also have a right to not be tracked forever.

### The Cost+20% Transparency

The Safety Ledger shows the full fare breakdown on every trip. The rider sees exactly what the trip cost and where the money went:

```
Rider paid: $14.00
├── Platform operating cost: $1.94
├── Cost+20% margin: $0.39
├── Driver cash (80%): $9.33
└── Driver earn-down (20%): $2.34
```

Compare this to Uber, where the rider sees "$14.00" and the driver sees "$9.80" and neither knows exactly how the $4.20 gap was calculated. The Safety Ledger eliminates that opacity. Every cent is accounted for. Every trip. Every time.

---

*Pudding #67 — The Safety Ledger*
*Bishop B061 | April 2, 2026*
*~800 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  67,
  'The Safety Ledger',
  'the-safety-ledger',
  'Every trip has a receipt. Every receipt tells the truth.',
  'pudding-67-the-safety-ledger',
  800,
  ARRAY['safety-ledger', 'rideshare', 'transparency', 'earn-down', 'gps-privacy'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
