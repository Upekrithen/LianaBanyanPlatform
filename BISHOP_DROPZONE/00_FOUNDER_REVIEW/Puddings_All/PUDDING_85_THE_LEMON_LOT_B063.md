# Pudding #85 — The Lemon Lot

*Community vehicle sharing at $15 a day, because the military already proved it works.*

---

On every military installation in America, there is a parking lot — sometimes near the PX, sometimes near the barracks — where service members park vehicles they want to sell or lend. It is called the Lemon Lot. No dealership. No intermediary. Just a vehicle, a sign with a phone number, and trust between neighbors who serve together.

The Lemon Lot on Liana Banyan digitizes this. A member lists their vehicle. Another member rents it. The floor rate is $15 per day — a platform-enforced minimum that ensures no one undercuts themselves into unprofitability. The database enforces this with a CHECK constraint: `daily_rate >= 15`. If you try to list your car for $10 a day, the system will not let you.

Why $15? Because that is the Cost+20% floor for a basic vehicle rental when you account for wear, insurance verification, and the member's time. The platform does not set a ceiling — if your truck is worth $75 a day, list it at $75. But the floor exists to protect the lister from the race to the bottom that destroyed driver economics on gig platforms.

Insurance verification is required before a listing goes live. The form collects proof of coverage, and the listing shows a verified or pending badge. No badge, no rental. This is a hard constraint, not a suggestion.

During the rental window, both the owner and the renter have access to trip logging through the safety ledger. Start trip. End trip. Each entry records the trip type, timestamp, and rental ID. If there is a dispute about mileage, condition, or timing, the ledger has the record. No he-said-she-said.

The Lemon Lot is not a car rental company. It is a neighbor-to-neighbor tool. The platform does not own vehicles, employ drivers, or set surge pricing. It provides the listing, the floor rate, the insurance check, the safety ledger, and the Cost+20% transparent economics. Everything else is between the two members who live in the same community.

The military figured out decades ago that people who trust each other will share resources without a corporation in the middle. The Lemon Lot just gives that trust a digital infrastructure.

---

*Pudding #85 | Bishop B063 | April 2, 2026*
*$15/day floor. Insurance verified. The Lemon Lot is open.*
