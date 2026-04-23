# Knight K427 — B113 ADDENDUM: Partial Dispatch (Workstreams 2 + 3 Only)
## B113, April 22, 2026
## Supplements (does not supersede): `PROMPT_KNIGHT_K427_B111_STUB_PEDESTAL_STAKE_PORTAL.md`

---

## Why this addendum

The B111 stub's dispatch gate read:

> **Do NOT dispatch until:** counsel recommends offering path + drafts offering memorandum + Founder approves.

That gate **is still in force for Workstream 1 (Pedestal Stake consumer portal)**. Counsel selecting Reg CF vs Reg D vs Reg A+ defines the entire architecture of the securities flow — building before counsel decides means building the wrong architecture. Workstream 1 stays blocked.

**However, the B111 stub contained three workstreams:**

1. Pedestal Stake consumer portal (Workstream 1) — **counsel-blocked, defer**
2. **Entity membership tier** (Workstream 2) — cooperative-scoped, NOT a securities flow, does not need counsel offering path
3. **"Who Can Use the Librarian" public docs page** (Workstream 3) — pure documentation, zero legal structure decisions

**Workstreams 2 and 3 are dispatchable now** — this addendum authorizes partial dispatch of those two only.

---

## Partial dispatch scope

### Workstream 2 — Entity Membership Tier (DISPATCH)

From B111 stub, reiterated for Knight clarity:

**Purpose:** Entity-scoped LB membership, distinct from individual $5/yr membership. Solves the B111 Founder-raised question ("If a member works as CEO of Microsoft, can they use R9 for Microsoft work?"). Answer: the ENTITY must hold its own membership. This gives Microsoft (or any multi-person company) a cooperative path instead of only the commercial-license path.

**Required deliverables:**

- Route: `lianabanyan.com/entity-membership/apply`
- Entity-type selector: Small Business / Medium / Enterprise / Nonprofit
  - **Nonprofit routes to Pledged Commons grant path — free under AGPL + Pledge, no payment needed.** Document the nonprofit-specific signup as a separate non-payment flow.
  - **Small Business** (<10 employees) — $X/yr, Stripe ACH
  - **Medium** (10–100 employees) — $Y/yr, Stripe ACH
  - **Enterprise** (100+ employees) — $Z/yr, Stripe ACH
- Entity KYC (EIN verification, address, officer signatures) — third-party provider (Middesk or similar for entity-level KYC). **Knight: research Middesk API + Alloy API + pick whichever has cleaner docs for K427 scope; document the choice in the PR.**
- Payment (Stripe ACH for larger entity tiers — cards NOT appropriate for $1000+/yr recurring commitments)
- Entity-scoped dashboard: whichever employees the entity designates get access under the entity's membership (seat management). Knight: build seat-add and seat-remove flows.
- Entity-member license contract — cooperative-scoped, NOT commercial.
  - **Placeholder language** for the contract template: Knight uses a draft contract stub. Final contract language comes from counsel in Workstream 1's dependency chain, but the entity membership flow ships with the stub; contract updates ship as a follow-up Knight when counsel delivers.

**Pricing tier numbers for the stub:**
- Founder to fill in $X, $Y, $Z before production launch. Reasonable starting points for Knight to put in the stub: $99/yr Small Business, $499/yr Medium, $2,999/yr Enterprise. Founder adjusts at production launch.

### Workstream 3 — "Who Can Use the Librarian" Public Docs Page (DISPATCH)

**Path:** `LianaBanyanPlatform/docs/who-can-use-librarian.md` (create if doesn't exist; Bishop may have stubbed at B111)

**Content requirements (Knight fleshes from this outline):**

```markdown
# Who Can Use the Librarian?

## Free uses (AGPL license covers you)
- Individual developers, researchers, hobbyists
- Open-source projects that are themselves AGPL-compatible
- Teaching / academic coursework
- Personal journaling, note-taking, any non-commercial use

## Pledged Commons grant (additional rights — LB membership required)
- Embedding librarian-mcp in your own tools for redistribution
- Avoiding AGPL copyleft virality in non-AGPL projects
- Individual LB membership: $5/yr ($5 entry, covered by membership)
- Entity LB membership (for companies): [link to entity-membership page]

## Commercial license (no LB membership)
- Companies that do NOT want either AGPL copyleft OR entity membership
- Negotiated directly with Liana Banyan Corporation
- Typically more expensive than entity membership; not the recommended path

## Edge cases
- "I'm an individual LB member but I use R9 for my employer's closed-source product" — your EMPLOYER needs entity membership or commercial license. Individual membership is for your own work only.
- "I'm an academic researcher at a university" — AGPL covers research + teaching use. If your university plans to license research outputs commercially, the entity path may apply.
- "I maintain an open-source project and want to embed R9" — AGPL is fine; your users will be covered by AGPL too. If you want your project to use a non-AGPL license, you need Pledged Commons membership.
- "I'm at Microsoft" — Microsoft needs entity membership. Your individual account doesn't transfer use rights to Microsoft.

## Routes
- AGPL: nothing to sign; just follow the license.
- Individual membership: $5/yr at [lianabanyan.com/membership](https://lianabanyan.com/membership)
- Entity membership: [lianabanyan.com/entity-membership/apply](https://lianabanyan.com/entity-membership/apply)
- Commercial license: contact Founder@LianaBanyan.com
```

**Plain language, not legalese.** Aim for someone with a basic legal-literacy level to understand in one pass. If it takes two readings, it's too legal — rewrite.

**Render at:** `lianabanyan.com/who-can-use` (or `/licensing`, Knight's choice based on existing routing conventions).

---

## Workstream 1 — DO NOT EXECUTE

The Pedestal Stake consumer portal (routes at `/pedestal-stake/learn`, `/apply`, `/my/pedestal-stake`, admin view, issuance mechanics, compliance/reporting) — **skip entirely in this K427 execution.** Comes back to life as its own Knight session ("K427B" or similar) once counsel lands.

If during K427 execution Knight encounters a strong reason to pre-scaffold Workstream 1 (e.g. routing conflicts with Workstream 2), flag to Bishop rather than proceeding — avoiding commitment to any Pedestal-Stake-specific architecture that counsel might invalidate.

---

## Acceptance criteria (this partial dispatch)

- [ ] `lianabanyan.com/entity-membership/apply` route exists, renders a working multi-step flow
- [ ] Entity-type selector with 4 options (Small Business / Medium / Enterprise / Nonprofit)
- [ ] Nonprofit flow doesn't charge (Pledged Commons grant auto-applied)
- [ ] Stripe ACH integration functional for the three paid tiers
- [ ] Entity KYC third-party integration chosen + documented + wired
- [ ] Entity-scoped dashboard (minimum: list designated seats, add seat, remove seat)
- [ ] Entity-member license contract stub ships (counsel finalizes later)
- [ ] `docs/who-can-use-librarian.md` exists with plain-language content per the outline above
- [ ] Rendered version of the docs page accessible from the platform (Knight picks `/who-can-use` or `/licensing`)
- [ ] Link from `librarian-mcp-public/README.md` to the live "Who Can Use" page added (updates the README K424 shipped)
- [ ] Build passes, TypeScript compiles clean, database migrations land

---

## Non-goals (this partial dispatch)

- Pedestal Stake consumer portal (Workstream 1) — defer entirely.
- Final legal contract language for entity membership — Knight ships stub contracts; counsel delivers production language later.
- Blockchain/crypto integration — NOT part of Pedestal Stake OR entity membership (B111 stub's explicit guidance).
- Cross-entity transfers of membership — out of scope for first release.

---

## Reporting requirements

1. Commit SHA for the merge
2. Chosen entity-KYC provider + why (Middesk vs Alloy vs other)
3. Screenshots or GIF of the entity-membership signup flow end-to-end
4. Rendered "Who Can Use" page URL
5. Any Stripe Connect / ACH setup gotchas for future Knight

---

*Addendum drafted B113, April 22, 2026. Bishop (Claude Opus 4.7, 1M context). Supplements K427 B111 stub with partial-dispatch authorization. Workstreams 2 + 3 are OPEN; Workstream 1 remains counsel-blocked.*
