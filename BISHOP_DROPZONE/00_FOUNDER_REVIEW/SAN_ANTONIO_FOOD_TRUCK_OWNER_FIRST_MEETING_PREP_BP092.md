# SAN ANTONIO FOOD TRUCK OWNER — FIRST MEETING PREP
**BP092 · Bishop SEG · Sonnet 4.6 · 2026-06-23**
**Status: FOUNDER REVIEW — do not print until Section 5 estimates are verified**

---

## 1. WHO YOU'RE MEETING

The owner of 2 food trucks and 1 restaurant in San Antonio. His sister runs the business operations side and is coordinating your first meeting. He's inbound — he already heard about the subscription pre-order model and reached out interested.

---

## 2. WHY HE FITS

- **Restaurant = commercial kitchen access** — NODE D Meal Prep Job kitchen-access requirement is already met; no hunting for a prep facility
- **2 food trucks = delivery route infrastructure** — last-mile distribution for subscription meal pickups or drop-offs is already in his operating DNA
- **Sister runs operations** — built-in operations coordinator, not a solo-founder dependency; she becomes the cooperative's first point of contact for scheduling, batch timing, and subscriber logistics
- **Already inbound on subscriptions** — pre-aligned to Kit-F-class advance-order pricing; the hardest part of the pitch (explaining why pre-pay matters) is already done
- **3 revenue surfaces** — 2 trucks + 1 restaurant lets him stress-test the cooperative model across multiple touchpoints in one pilot, which gives us richer empirical data faster

---

## 3. WHAT YOU OFFER HIM

**Lead with what he keeps.**

Every meal sold through the cooperative subscription: he keeps **83.3%**. The cooperative takes Cost+20% — not 30% to DoorDash, not 25% to UberEats, not 15% to Square Online. His existing customers are his customers — the cooperative does not own them, does not sell their data, does not redirect them. His menu is his menu — the cooperative does not dictate ingredients, dish names, or portion sizes.

**Then what the cooperative gives him that he can't get alone.**

**Cash flow inversion via subscription pre-pay.** Members pay a week ahead. He gets the money before he cooks. That is the opposite of every delivery platform he's ever used. Example math (back-of-envelope, not a promise): $5 per meal × 7 meals per household × 20 households = $700 pre-paid before he touches a single ingredient. *(Founder note: verify subscriber count is realistic for San Antonio Week 1 before quoting this number.)*

**Bulk grocery sourcing through Let's Get Groceries (LGG).** LGG is the cooperative's wholesale grocery channel — bulk pickup cuts per-serving COGS below the $4.17/serving floor needed to make Cost+20% work at the $5 pre-order price. *(Founder note: LGG COGS estimate is back-of-envelope only — mark as estimate, not commitment, until first bulk pickup happens with actual invoices.)*

**No-show forfeit protection.** Missed pickups roll forward 7 days. After 7 days the prepayment forfeits to the community food pool (effectively a neighbor-SNAP donation). The subscriber loses that week's slot. He already got paid. Food doesn't get wasted — it feeds someone else. This is canon-locked, not negotiable, but it's customer-protective: the subscriber knew upfront.

**IP Ledger attribution.** Every dish, every menu, every successful batch run is stamped to his name immutably across the Frontier Mesh. If he invents a signature sauce or a batch technique that gets replicated cooperative-wide, that attribution travels with the substrate forever.

**Substrate Market preference inference.** Cooperative members' food preferences are inferred from interaction — what they search, save, return to, reorder — not from questionnaires. No survey spam, no form-filling. His dishes surface to members whose inferred preferences match. He doesn't have to advertise; the substrate does the match.

**No paid LLM API calls for menu and route planning.** Cooperative reasoning across the mesh helps him model batch sizes, route timing, and menu mix without paying Anthropic, OpenAI, or anyone else per-token. The substrate workers run locally on cooperative hardware.

---

## 4. WHAT YOU ASK HIM

**Phase 1 — 4-week pilot. Concrete and scoped.**

| What | Detail |
|---|---|
| Weekly batch | 3–7 recipes from his existing menu, his choice, locked at week-start |
| Subscriber target | 20 households *(Founder note: verify this is achievable from SA member base or Founder's network before quoting)* |
| Pre-order price | $5/meal advance (Kit-F-class) · $10/meal same-day pickup at restaurant (Tab-class) |
| Pre-pay window | 1 week ahead · secured by member vouched funds · he gets paid before he cooks |
| His cut | 83.3% of every transaction · cooperative keeps Cost+20% |
| Duration | 4 weeks · empirical receipt gathered at end |

**What HE provides:**
- Restaurant kitchen for weekly batch-prep (off-hours or existing hours, his call)
- Menu of 3–7 recipes per week
- Sister coordinates subscriber list, pickup timing, logistics with cooperative

**What the COOPERATIVE provides:**
- LGG bulk grocery sourcing
- Substrate registration for his trucks + restaurant as service nodes
- Subscriber acquisition from San Antonio cooperative member presence
- Vouched-funds escrow for prepayments (he gets paid week-ahead, not chasing invoices)
- IP Ledger attribution for every meal and batch
- Member Price vs Normal Price display on Substrate Market (members get a small Marks discount; he still keeps 83.3% of both)

**Empirical proof we gather in 4 weeks:**
- Actual COGS/serving via LGG vs his current retail cost
- Actual subscription renewal % at week 4
- Actual Cost+20% margin vs prediction
- No-show rate and community pool forfeits (real data, published to Substack anonymized)

---

## 5. WHAT FOUNDER BRINGS TO THE MEETING

- [ ] **This printed prep doc** (single-sided, 1 page — trim if needed before printing)
- [ ] **Empirical receipts:** first paid member (anonymized), v0.6.1 LIVE on 5-peer mesh, 60 swarm_runs in DB — say "the substrate works" because it does
- [ ] **MnemosyneC laptop demo** — interface in alpha, substrate LIVE; show the distinction clearly: "the interface is alpha, the substrate is live"
- [ ] **Subscription pre-pay math sheet:** $5 × 7 meals × 20 households = $700/week pre-paid before he cooks — cash flow inversion written on paper *(mark as estimate pending actual subscriber sign-ups)*
- [ ] **LGG COGS back-of-envelope:** best estimate of per-serving cost reduction via bulk pickup *(Founder: this is back-of-envelope — label it clearly as estimate, not commitment, until first real bulk invoice)*
- [ ] **Kitchen Table first-event offer:** cooperative funds venue + ingredients for the first Kitchen Table gathering at his restaurant or a community center (free first event = social proof, not a freebie — it generates the first real subscriber data)

---

## 6. WHAT NOT TO PROMISE (Truth-Always)

- **Do NOT say "we'll get you 100 subscribers"** — we don't know yet; 20 is the pilot target and even that is an estimate
- **Do NOT say "the platform is finished"** — the interface is in alpha; the substrate is LIVE; be precise about which is which
- **Do NOT promise a specific COGS reduction %** until LGG bulk pickup happens once with real invoices
- **Do NOT promise a specific subscription renewal %** until week 4 actual data
- Say this instead: *"We're shipping in public. You're going to see the math as it happens, including when it's wrong. That's the point — we're building empirical receipts together."*

---

## 7. POSSIBLE OBJECTIONS + HONEST ANSWERS

**"What if subscribers don't show up?"**
You already got the prepayment. The 7-day roll-forward gives the subscriber a chance to reschedule. After 7 days, the meal credit forfeits to the community food pool — your food feeds a neighbor, not a dumpster. You're protected. (Canon-locked: canon_no_show_forfeit_community_pool_policy_7_day_roll_forward_bp086)

**"What if the platform goes away?"**
The cooperative substrate is content-addressed and self-replicating across every member's local Frame. The mesh IS the backup. If Liana Banyan Corporation ever disappeared, your IP Ledger attribution and customer relationships are recoverable from any member's local replica. Your data lives on the mesh, not in our server room.

**"Why not just use DoorDash and Square?"**
They take 30%. We take Cost+20% and you keep 83.3%. You also keep your customer relationships, your data, and your menu autonomy. Run the math on your current monthly DoorDash take vs 83.3% of the same volume.

**"What if I want out later?"**
You can leave anytime. Your IP Ledger attribution stays with you. Your customer relationships stay with you. The only cooperative obligation on exit is Pledge #2260: don't enshittify on the way out — don't poach the cooperative's members into a competing extractive platform using what you learned inside. That's the only string attached.

---

## 8. NEXT STEPS IF HE SAYS YES

1. He and his sister both onboard as Members ($5/yr each)
2. His trucks + restaurant register as substrate service nodes
3. Bishop drafts NODE D Meal Prep Job operator agreement: Marks accrual schedule + Cost+20% split + vouched-funds threshold
4. Week 1: 20 subscriber target — cooperative recruits from existing San Antonio member presence + Founder's network
5. LGG bulk grocery pickup arranged for Week 1 batch
6. Week 2: First batch-prep run + first Kitchen Table gathering offer
7. Weeks 3–4: Empirical receipts gather; Founder publishes weekly progress to Substack (anonymized)

---

## 9. IF HE SAYS NO

He was inbound interested, so a no is unusual. If no: ask why, record the objection verbatim, publish anonymized to Substack as "Objection #1 from first meeting, San Antonio." That's an empirical receipt of where the pitch needs work. No hard sell. The cooperative doesn't beg. The math is real or it isn't.

---

*BP092 · Bishop SEG · Sonnet 4.6 · empirical-only · no false promises*
*FOUNDER VERIFICATION REQUIRED before printing: LGG COGS estimate · 20-household subscriber target · subscriber math ($700/week pre-pay figure)*
