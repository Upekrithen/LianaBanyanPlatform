# Counsel Task — Pedestal Stake Consumer Flow (Offering Infrastructure)
## B111, April 20, 2026 — Founder-ratified same turn; concurrent with K427 platform build

**Engagement type:** Task-based per [project_counsel_task_based.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_counsel_task_based.md)
**Estimated counsel hours:** 15–25 hours across drafting, review, and filing (vs. the 4–6 for the bylaws task — this one is bigger)
**Urgency:** **Medium-high.** Cannot safely offer Pedestal Stakes in public Eyewitness Program recruitment until this infrastructure exists. Target: consumer flow live **by Q3 2026 (July–September)** per Founder timeline. Concurrent build with K427 platform work, not serial — counsel drafts while Knight builds the portal UI.
**Issuer entity:** Upekrithen LLC (per [project_upekrithen_seller_of_record.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_upekrithen_seller_of_record.md))
**Product:** Pedestal Stake — an equity-adjacent instrument representing a claim on a specific slice of the patent-portfolio cash flow (see IP Load Balancing v2 — 10% Individual Pedestals slice).

---

## What "consumer flow" means here

Today: a Pedestal Stake cannot be purchased by a consumer at a URL. Upekrithen LLC exists; the Path A / Open Water / SAA framework was vetted Howey-clean at B098; but there is no signup → KYC → payment → stake-issuance → statement pipeline. This task builds the legal + operational scaffolding for that pipeline.

---

## Deliverables (counsel produces)

### 1. Offering structure selection (counsel decides, Founder approves)

Evaluate these four SEC-exemption paths and recommend:

| Path | Max raise | Who can invest | Key tradeoff |
|---|---|---|---|
| **Reg D 506(b)** | Unlimited | Accredited + ≤35 friends-and-family | Fastest to stand up; no advertising; limited audience |
| **Reg D 506(c)** | Unlimited | Accredited only, verified | Can publicly advertise; requires third-party accreditation verification |
| **Reg CF (Regulation Crowdfunding)** | $5M / 12 months | General public | Most consumer-friendly; requires registered funding portal; annual financial disclosures |
| **Reg A+ (Regulation A)** | Tier 1: $20M / Tier 2: $75M | General public | "Mini-IPO"; SEC-qualified offering statement; ongoing reporting; highest legal cost (~$100k to file) |

**Bishop recommendation for counsel consideration:** **Reg CF for Pedestal Stake consumer flow** (matches the "$5 membership + modest consumer investment" story). Reg D 506(b) as a parallel track for accredited insiders (family, friends, early Red Carpet recipients who want larger stakes).

### 2. Offering Memorandum / Form C / PPM

Document that goes to every investor before they invest. Contents:
- Business description (Liana Banyan + Upekrithen + IP portfolio)
- Use of proceeds
- Risk factors (extensive — patent conversion, market risk, liquidity risk, concentration)
- Financial statements (Upekrithen audited or reviewed, per exemption requirements)
- Management description
- Capital structure (existing equity, how Pedestal Stakes fit)
- Valuation basis (conservative methodology tied to Paper #40A projections, discounted heavily)
- Transfer restrictions (Pedestal Stakes illiquid by design)

### 3. Subscription Agreement template

Per-investor contract. Standard Reg CF / Reg D template adapted to the Pedestal Stake mechanics:
- Investor representations (accreditation if applicable, investment sophistication, risk acknowledgment)
- Stake mechanics (what the investor is buying — claim on 10% Individual Pedestal slice cash flow)
- Transfer restrictions
- Information rights
- Dispute resolution

### 4. KYC / AML compliance path

- If Reg CF: the funding portal handles KYC/AML.
- If Reg D: issuer (Upekrithen) responsible. Typical path: third-party KYC provider (Persona, Alloy, or similar) integrated into the signup flow.

### 5. Ongoing compliance

- Reg CF: annual Form C-AR + audited financials (if raise > $535k)
- Reg D: Form D filing within 15 days of first sale
- State blue-sky compliance: Reg CF preempts most state filings; Reg D requires state notice filings
- Investor reporting cadence (quarterly statements recommended)

### 6. Integration with Liana Banyan Corporation

Critical: Pedestal Stakes are issued by **Upekrithen LLC**, not by Liana Banyan Corporation. The Cooperative's membership is $5/yr and non-securities; Upekrithen's Pedestal Stakes are securities. Counsel must ensure the boundary is crystal-clear so that holding a Pedestal Stake does NOT convey any Liana Banyan cooperative voting rights, and cooperative membership conveys NO Pedestal Stake. Two-track economy (per B111 B-with-A ratification) must be legally watertight at the instrument level.

### 7. Counsel-drafted investor-communication FAQ

Plain-English explanation of:
- What is a Pedestal Stake?
- What am I buying?
- How is it different from Liana Banyan cooperative membership?
- What are the risks?
- How do I get my money out? (answer: illiquid, long-hold)
- Who is Upekrithen LLC and why is it separate from Liana Banyan Corp?

---

## Specific counsel questions

1. **Reg CF portal selection.** If Reg CF is the recommended path, counsel should advise on portal selection (Wefunder, Republic, StartEngine, NextSeed, etc.). Each has different fees, audience, and investor experience.
2. **Upekrithen LLC jurisdiction.** Is Wyoming LLC the right entity for this? Any advantage to Delaware LLC for a Reg CF offering?
3. **Pre-sale communications.** What can be said publicly about Pedestal Stakes BEFORE the offering is filed/qualified? General solicitation restrictions under Reg D vary significantly from Reg CF. Bishop (and Founder publicly) should not market Pedestal Stakes in ways that violate quiet-period rules.
4. **Founder / family initial stakes.** Can Founder, spouse, and adult children take Pedestal Stakes during the pre-offering period (as insider purchases) without triggering integration issues with the public offering later? Counsel should advise.
5. **Valuation challenge.** Pedestal Stakes represent claims on projected patent-portfolio cash flow that has not yet materialized (patents not yet converted to utility patents; no licensing revenue yet). How does counsel recommend valuing the offering without triggering FTC or SEC concern about misleading projections?
6. **Coordination with bylaws amendment.** The parallel bylaws-amendment counsel task (see COUNSEL_TASK_BYLAWS_AMENDMENT_B111.md) affects Liana Banyan Corporation, not Upekrithen LLC. But it affects the "structural durability" story in the Pedestal Stake offering memorandum. Same counsel or coordinated counsels is ideal.

---

## Concurrent Knight work — K427 stub

**K427 builds the platform-side consumer portal** that operationalizes whatever structure counsel selects. Stub staged at `PROMPT_KNIGHT_K427_B111_STUB_PEDESTAL_STAKE_PORTAL.md`. K427 dispatches after:
- Counsel recommends offering path (Reg CF / Reg D / etc.)
- Counsel drafts the offering memorandum
- Founder approves the structure

Estimated K427 platform-build scope: signup flow + KYC integration + payment integration (Stripe-compatible) + stake-issuance logic + investor-statement dashboard + compliance logging. 2–3 Knight sessions.

---

## Public-communication guardrails until this lands

**Before counsel completes + first Form filed:**
- Do NOT offer Pedestal Stakes in Eyewitness Program recruitment text. (Current Witness Program draft needs edit per B111 Founder instruction "After K423 lands.")
- Do NOT publish valuation numbers in letters or op-eds. The $900M–$1.3B projection is internal-tracking only; public use before offering is filed could be deemed misleading.
- DO mention the existence of the two-track economy (Marks + Pedestal Stakes) in principle, with "consumer flow landing Q3 2026" qualifier. Principle-level commitment is fine; offer-level commitment is not.

**After first Form filed:**
- Full disclosure permitted per the exemption's advertising rules.

---

*Staged B111, April 20, 2026. Founder-ratified "I am the one doing it all, now. :D" — concurrent execution authorized alongside K423/K424/K425/K426 + bylaws-amendment counsel task.*
