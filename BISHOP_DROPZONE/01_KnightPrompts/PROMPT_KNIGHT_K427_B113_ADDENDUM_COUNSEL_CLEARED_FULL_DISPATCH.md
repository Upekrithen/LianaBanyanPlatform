# Knight K427 — B113 ADDENDUM: Counsel Cleared, FULL Three-Workstream Dispatch
## B113, April 22, 2026 (later same day than the partial-dispatch addendum)
## Supplements (and supersedes): `PROMPT_KNIGHT_K427_B113_ADDENDUM_PARTIAL_DISPATCH.md`
## Does not supersede: `PROMPT_KNIGHT_K427_B111_STUB_PEDESTAL_STAKE_PORTAL.md`

---

## Why this addendum supersedes the partial-dispatch addendum

Earlier today (B113), Bishop wrote a partial-dispatch addendum that authorized only Workstreams 2 + 3 because Workstream 1 (Pedestal Stake consumer portal) was blocked on counsel selecting an SEC offering path (Reg CF vs Reg D vs Reg A+).

**Counsel has now cleared the Reg CF path.** Founder consulted counsel B113 and received: *"Yes on your read. Do that."* Bishop's read was:

> Given: non-VC, cooperative ethos, public solicitation yes, non-accredited crowd welcome, fast launch preferred, compliance budget modest, illiquid participation rights — **Reg CF looks like the strongest fit** (up to $5M/year, retail-friendly, general solicitation allowed, moderate compliance, instruments naturally illiquid, matches the platform's transparency requirements via Form C disclosures).
>
> If target raise is larger than $5M/yr OR includes Herjavec-tier investors in the same instrument as retail, **Reg A+ Tier 2** OR **parallel 506(c) + Reg CF** become the path.

With counsel's green-light, **Workstream 1 is no longer blocked.** This addendum supersedes the partial-dispatch one and authorizes the full three-workstream scope.

---

## Dispatch status

| Workstream | Status | Notes |
|---|---|---|
| 1 — Pedestal Stake consumer portal | **OPEN, dispatchable NOW** | Build against **Reg CF** architecture. Founder/counsel may later add a parallel **506(c)** track for accredited-tier investors; design Workstream 1 so that parallel track is additive (separate route + separate admin view) rather than requiring a rebuild. |
| 2 — Entity membership tier | **OPEN** (unchanged from partial dispatch) | Small Business / Medium / Enterprise / Nonprofit tiers. Stripe ACH. Entity KYC (Middesk or Alloy). Contract stub shipped; counsel updates final contract language later. |
| 3 — "Who Can Use the Librarian" public docs page | **OPEN** (unchanged from partial dispatch) | Plain-language licensing explainer at `lianabanyan.com/who-can-use` (or `/licensing`). |

---

## Workstream 1 — Reg CF scope, specific to counsel's selection

### Architecture implications of the Reg CF path

Per SEC Regulation Crowdfunding:
- **Annual cap: $5M per 12-month period.** Design the admin view to track cumulative raise against the annual cap and alert when approaching.
- **Individual investor caps** based on income and net worth. The signup flow must compute this per-investor in real time. Formula (per SEC amended rules): if both annual income AND net worth are ≥ $124K, investor can invest 10% of the greater of income or net worth (cap $124K); otherwise, they're limited to the greater of $2,500 or 5% of the greater of income or net worth.
- **FINRA-registered intermediary required.** Upekrithen LLC cannot sell Reg CF securities directly; must go through a registered funding portal (e.g., StartEngine, Republic, Wefunder) OR a registered broker-dealer. **Founder + counsel choose the intermediary; Knight builds the integration layer generically so the chosen intermediary is pluggable.**
- **Form C filing** with the SEC at offering launch. Form C-U updates during the campaign. Form C-AR annual reports thereafter.
- **Testing-the-waters permitted** (Reg CF specifically allows this). The signup flow should include a "register early interest" state that doesn't require KYC yet — legitimate under Reg CF.
- **12-month bad-actor disqualification checks** required for officers / directors / >20% beneficial owners of Upekrithen. KYC provider choice (Middesk / Alloy) must support this.

### Routes for Workstream 1

Per B111 stub, confirmed with Reg CF scope:
- `lianabanyan.com/pedestal-stake/learn` — public overview, offering materials link, Form C reference, risk-factors block
- `lianabanyan.com/pedestal-stake/early-interest` — testing-the-waters signup (email + consent only; no payment, no KYC yet)
- `lianabanyan.com/pedestal-stake/apply` — full signup flow (gated, requires completed identity verification)
- `lianabanyan.com/my/pedestal-stake` — logged-in investor dashboard
- `admin.lianabanyan.com/pedestal-stake` — staff-side issuance + compliance view

### Signup flow (full, post-counsel-clearance)

1. Email capture + explicit consent to receive offering materials (CAN-SPAM-compliant)
2. Offering Memorandum + Form C download + reader attestation
3. Reg CF investor-limit self-declaration (income + net worth — system computes individual cap from inputs)
4. KYC via chosen provider (Middesk or Alloy — Knight implements adapter that handles both, Founder/counsel selects production provider)
5. Bad-actor check (provider-supported; integrated in the KYC flow)
6. Subscription agreement e-signature (DocuSign or HelloSign)
7. Payment via registered intermediary's ACH flow
8. Confirmation + issuance triggered + dashboard access granted

### Issuance mechanics (unchanged from B111 stub)

- Pedestal Stakes **NOT** stored as blockchain tokens (avoid crypto-regulatory overlay)
- Database-backed ownership records in Supabase (Upekrithen-scoped tables, **not** Liana Banyan Corp tables — preserve two-track-economy separation)
- Per-stake certificate as PDF + e-signed
- Immutable issuance log with write-only RLS policy (audit table)

### Parallel 506(c) readiness (forward-compatible)

If Founder + counsel later add a parallel Reg D 506(c) accredited-investor track (for Herjavec-tier investors who want a different instrument structure), Workstream 1 design should anticipate:
- A separate route `/pedestal-stake/accredited/apply` (never mixes with Reg CF flow)
- Separate investor-table slice (no cross-contamination of Reg CF cap tracking with 506(c) raises)
- Separate Form filings (Reg CF = Form C; Reg D 506(c) = Form D)
- Same issuance back-end (Pedestal Stakes themselves identical; only the investor-side compliance differs)

**Knight: do NOT build the 506(c) track in K427.** Just leave the data model + route space additive-safe so it can be added later without rebuild.

### Two-track economy separation enforcement (from B111 stub — REITERATE)

Critical: Liana Banyan Corp membership is NOT the same thing as holding Pedestal Stakes in Upekrithen. Database, UI, and legal separation must be airtight.

- Database: `liana_banyan.members` (cooperative) vs `upekrithen.pedestal_holders` (securities). No FK relationship implying identity equivalence. A natural person can be both, but the systems track them independently.
- UI: distinct dashboards. "Switching contexts" language when a user who holds both views cross-system data.
- Voting rights: LB cooperative members vote in cooperative governance. Pedestal Stake holders do NOT vote in cooperative governance. (They may have Upekrithen-internal consent rights on certain material changes, per counsel's drafting.)

---

## Workstream 2 — Entity membership tier (unchanged from partial dispatch)

Scope, deliverables, and acceptance criteria exactly as specified in `PROMPT_KNIGHT_K427_B113_ADDENDUM_PARTIAL_DISPATCH.md`. Re-reference that file for detail.

**Quick recap:**
- Tiers: Small Business (<10 employees) / Medium (10-100) / Enterprise (100+) / Nonprofit (free under Pledged Commons)
- Stripe ACH for paid tiers
- Entity KYC (Middesk or Alloy — Knight picks + documents choice)
- Seat management (entity adds/removes designated employees)
- Placeholder pricing: $99/$499/$2,999 — Founder adjusts at production launch

---

## Workstream 3 — "Who Can Use the Librarian" public docs page (unchanged from partial dispatch)

Scope and content outline as specified in the partial-dispatch addendum. Plain-language table, render at `/who-can-use` or `/licensing`, README link added to librarian-mcp-public.

---

## Acceptance criteria (ALL three workstreams)

### Workstream 1
- [ ] All five Pedestal Stake routes live and functional
- [ ] Reg CF signup flow computes individual investor cap correctly across the SEC thresholds
- [ ] Testing-the-waters flow separate from full-application flow
- [ ] KYC provider integration working end-to-end for a test identity
- [ ] Bad-actor check integrated in KYC
- [ ] Funding-portal / broker-dealer integration stub in place (pluggable; actual intermediary selection by Founder/counsel)
- [ ] Issuance record writes to Upekrithen-scoped Supabase tables with immutable audit
- [ ] Per-stake PDF certificate generation
- [ ] Investor dashboard shows current holdings + cash-flow distributions
- [ ] Admin dashboard shows issuance queue + cap-table + annual-raise-tracking
- [ ] 506(c) route-space reserved (not built, not conflicting)

### Workstream 2
- All criteria from partial-dispatch addendum stand.

### Workstream 3
- All criteria from partial-dispatch addendum stand.

---

## Non-goals (for THIS K427 execution)

- **Do NOT select the funding portal / broker-dealer partner.** That's a Founder + counsel decision based on fee structure, platform capabilities, and timing. Knight builds a pluggable integration layer.
- **Do NOT draft final legal language** for the subscription agreement, offering memorandum, or cap-table documents. Those come from counsel. Knight ships drafts that display counsel-provided content but does not author it.
- **Do NOT build 506(c) accredited-investor flow.** Reserve data model + route space; defer build.
- **Do NOT integrate blockchain/crypto** for Pedestal Stakes. B111 stub was clear, Reg CF path confirms: database-backed records only.

---

## Dependencies + sequencing

- K423, K424, K425 complete ✓
- Counsel: has cleared Reg CF ✓; will deliver final Form C content, offering memorandum language, subscription agreement template during Workstream 1 build (parallel, not sequential — Knight ships routes + flow skeleton with counsel's drafts plugged in as they arrive)
- Founder: selects KYC production provider (Middesk vs Alloy) before Workstream 2 production launch; selects funding portal / broker-dealer before Workstream 1 production launch
- FINRA-registered intermediary account provisioned (Founder + counsel action during Knight build window)
- Upekrithen LLC banking + accounting ready to receive investor funds (Founder action — Mercury business banking relationship per [project_mercury_bank.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_mercury_bank.md))

---

## Rough size estimate

- Workstream 1: 2–3 Knight sessions (routes + signup flow + KYC, then issuance + dashboards, then admin + compliance)
- Workstream 2: 1–2 Knight sessions (entity signup flow + KYC + Stripe + seat management)
- Workstream 3: <1 Knight session (pure docs + routing)

Total across all three: **4–6 Knight sessions** over the coming week or two.

---

## Reporting requirements

1. Commit SHAs per workstream
2. Chosen KYC provider + rationale
3. Reg CF testing-the-waters flow screenshots
4. Form C integration reference (counsel's drafted content placeholder → live)
5. Two-track separation verification (tests that prove `liana_banyan.members` and `upekrithen.pedestal_holders` don't cross-contaminate)
6. Public "Who Can Use" page URL
7. Any funding-portal integration gotchas for next Knight

---

*Addendum drafted B113, April 22, 2026, later same day. Bishop (Claude Opus 4.7, 1M context). Supersedes the earlier B113 partial-dispatch addendum; counsel's Reg CF clearance unblocks Workstream 1. All three workstreams OPEN.*
