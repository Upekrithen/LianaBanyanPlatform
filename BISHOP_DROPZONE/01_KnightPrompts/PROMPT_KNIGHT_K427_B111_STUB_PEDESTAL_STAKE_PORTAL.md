# Knight K427 — Pedestal Stake Consumer Portal Platform Build — STUB
## B111, April 20, 2026 — Founder-ratified; concurrent with counsel task

**Status:** Stub — full prompt finalized after counsel selects offering structure (Reg CF vs Reg D vs Reg A+).
**Do NOT dispatch until:** counsel recommends offering path + drafts offering memorandum + Founder approves.
**Concurrent with:** Counsel task `COUNSEL_TASK_PEDESTAL_STAKE_CONSUMER_FLOW_B111.md` (parallel, not sequential — counsel drafts while Knight builds).

**Scope expansion (Founder-ratified B111, "Do it"):** K427 now covers THREE parallel consumer flows, not just one:
1. **Pedestal Stake consumer portal** (original scope — securities-compliant investment-adjacent instrument via Upekrithen LLC)
2. **Entity membership tier** — NEW: a separate cooperative-membership flow for companies/entities (not just individuals). Signup + payment + entity-scoped dashboard. Aligns with the B111 licensing question: "if a member works at Microsoft, can they use R9 for Microsoft work?" Answer: the ENTITY needs its own membership. This flow gives Microsoft (or any multi-person company) a cooperative path instead of only a commercial-license path. Tiers to consider: Small Business ($X/yr, <10 employees), Medium ($Y/yr, 10-100), Enterprise ($Z/yr, 100+). Membership-tier-based licensing.
3. **"Who Can Use the Librarian" public docs page** (referenced below, low-engineering) — clarifies the licensing-question space so 90% of "am I allowed to…" questions are answered before they reach counsel.

### Added scope item — Entity membership flow

**Why:** B111 Founder raised the enforcement question ("if a member works as CEO of Microsoft, can they use R9 for Microsoft work?"). Bishop's recommended answer: individual membership ≠ entity membership. The ENTITY must hold its own membership. Entities that would otherwise need a commercial license via Upekrithen now have a cooperative path at a tier appropriate to their size.

**Requirements:**
- Route: `lianabanyan.com/entity-membership/apply`
- Entity-type selector: Small Business / Medium / Enterprise / Nonprofit (Nonprofit routes to Pledged Commons grant path — free under AGPL + Pledge, no payment needed)
- Entity KYC (EIN verification, address, officer signatures) — third-party provider (Middesk or similar for entity-level KYC)
- Payment (Stripe ACH for larger entity tiers — cards not appropriate for $1000+/yr)
- Entity-scoped dashboard: whichever employees the entity designates get access under the entity's membership (seat management)
- Entity-member license contract — cooperative-scoped, not commercial. Counsel drafts the template.

### Added scope item — Public docs page "Who Can Use the Librarian"

**File path:** `LianaBanyanPlatform/docs/who-can-use-librarian.md` (then rendered at `lianabanyan.com/who-can-use` or similar)

**Content:** clear table of natural-person member uses / entity member uses / commercial license / Pledged Commons grant / edge cases. Plain language, not legalese. Prevents 90% of "am I allowed to use this for X?" questions from reaching counsel or Founder.

Bishop drafted the initial docs page at [docs/who-can-use-librarian.md](../../docs/who-can-use-librarian.md) (stub — to be fleshed out during K427 execution with counsel-approved final licensing language).

---

## Why this exists

Pedestal Stakes (via Upekrithen LLC) are the equity-adjacent instrument in the two-track economy (Marks + Pedestal Stakes, per B111 B-with-A ratification). Today the legal framework exists but the consumer flow does not. This Knight task builds the platform-side of the consumer flow — signup, KYC, payment, issuance, dashboard — once counsel selects the offering structure.

---

## Intended scope (counsel-dependent; revise after counsel lands)

### 1. Route + page structure

New routes in the platform:
- `lianabanyan.com/pedestal-stake/learn` — public-facing overview (post-counsel-approval only; before counsel clears, route returns a "coming Q3 2026" holding page)
- `lianabanyan.com/pedestal-stake/apply` — gated signup flow
- `lianabanyan.com/my/pedestal-stake` — logged-in investor dashboard (once holding)
- `admin.lianabanyan.com/pedestal-stake` — staff-side issuance + compliance view

### 2. Signup flow

Steps (counsel to validate against selected exemption):
1. Email capture + consent to receive offering materials
2. Offering Memorandum download + attestation
3. Accreditation / investor-type self-declaration (Reg D) OR Reg CF limit calculator (Reg CF)
4. KYC via third-party provider (Persona / Alloy / Synapse — counsel-selected)
5. Subscription agreement e-signature (DocuSign / HelloSign)
6. Payment — Stripe or bank ACH depending on offering structure
7. Confirmation + issuance triggered + dashboard access granted

### 3. Issuance mechanics

- Pedestal Stakes NOT stored as blockchain tokens (avoid crypto-regulatory overlay; simpler compliance)
- Database-backed ownership records in Supabase, mirroring what a transfer agent would do
- Per-stake certificate generated as PDF + signed via DocuSign
- Immutable issuance log (Supabase audit table with write-only policy)

### 4. Dashboard (logged-in investor view)

- Current holdings (stake count, issuance date, valuation-at-issuance)
- Cash-flow distributions received (quarterly or annual, per offering structure)
- Upekrithen LLC filings / financial reports
- Downloadable Pedestal Stake certificate PDF
- Transfer restrictions notice (Pedestal Stakes illiquid)

### 5. Admin / staff view

- Issuance queue (applications awaiting approval / KYC review)
- Compliance dashboard (per-investor accreditation status, KYC status, form-filing status)
- Cap table for Upekrithen LLC (separate from Liana Banyan Corp cap table — two-track economy integrity)
- Distribution trigger (manual, with dual-approval logic)

### 6. Integration with Liana Banyan cooperative

**CRITICAL: enforce separation.** The two-track economy works only if instruments are legally and operationally distinct:
- Liana Banyan Corp cooperative membership = $5/yr, non-securities, voting in cooperative governance
- Upekrithen LLC Pedestal Stake = securities, no cooperative voting, economic exposure to patent-portfolio cash flow
- Database separation: `liana_banyan.members` vs `upekrithen.pedestal_holders`. No foreign-key relationship implies identity equivalence (a person can be both, but the systems don't assume it).
- UI separation: different dashboards, different logins if possible, explicit "switching contexts" language when a person holds both.

### 7. Compliance + reporting

- Automated Form D / Form C filings (depending on exemption)
- Annual investor statements (PDF + email)
- Blue-sky state filings (Reg D) or Form C-AR (Reg CF)
- State-by-state investor residence tracking for compliance

---

## Dependencies

- K423 complete (independent — Eyewitness Benchmark doesn't touch Pedestal Stake build)
- **Counsel selects offering path** (critical blocker — dictates the entire architecture)
- **Counsel drafts offering memorandum** (critical — Knight displays it but doesn't write it)
- KYC provider account provisioned (Founder / counsel action — Persona, Alloy, or similar)
- Stripe or bank ACH integration (Founder action — provision the payment-side accounts)
- Upekrithen LLC banking + accounting ready for receiving investor funds
- `COUNSEL_TASK_PEDESTAL_STAKE_CONSUMER_FLOW_B111.md` deliverables complete

---

## Rough size estimate

2–3 Knight sessions. First session: routes + signup flow + KYC integration. Second session: issuance logic + dashboard. Third session: admin view + compliance automation.

Cannot estimate wall-clock until counsel delivers structure selection.

---

## Witness Program recruitment text coordination

**Before K427 lands (and counsel completes):** Witness Program recruitment text should say *"Pedestal Stake exposure via Upekrithen LLC — consumer flow lands Q3 2026, join the early-interest list for notifications when it opens"* rather than offering Pedestal Stakes directly. Bishop to edit `WITNESS_PROGRAM_RECRUITMENT_B111.md` per Founder's "After K423 lands" instruction.

---

*Stub saved B111, April 20, 2026. Founder-ratified concurrent with counsel task. Full prompt finalized after counsel recommends offering path (est. 2–4 weeks).*
