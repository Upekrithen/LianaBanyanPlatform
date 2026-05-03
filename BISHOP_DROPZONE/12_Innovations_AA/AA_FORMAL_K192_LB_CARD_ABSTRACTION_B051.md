---
name: K192 LB Card Abstraction Layer
description: Provider-agnostic card issuing infrastructure implementing the CardIssuer abstraction interface with Lithic and Stripe implementations, Walking Billboard signals, and five edge functions supporting existing LB Card innovations #1967-#1971.
type: aa_formal
innovation_id: "K192"
ratification_session: K192/B051
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: false
wrasseTriggers:
  - lb card abstraction layer
  - card issuer interface
  - lithic card issuer
  - k192 lb card
  - walking billboard card signals
  - provider agnostic card issuing
  - lb card edge functions
canon_eblet_pointer: lb_frame_viral_onboarding_cue_card_pied_piper_bp009.eblet.md
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — K192 LB Card Abstraction Layer
## Bishop B051 (post-hoc documentation)
## Note: K192 is infrastructure — no NEW innovation number assigned
## CardIssuer interface, Lithic implementation, Walking Billboard, and 5 edge functions
## All supporting existing innovations (#1967-#1971 LB Card from B033, Walking Billboard from B034)

---

K192 implements the provider-agnostic card issuing infrastructure designed in B050. It does NOT create a new innovation — it implements the architecture for existing innovations. The key contribution is making DD-2 (LB Card) technically ready for ANY provider approval.

### What Was Built
- CardIssuer abstraction interface (_shared/cardIssuer.ts)
- LithicCardIssuer implementation (_shared/lithicCardIssuer.ts)
- StripeCardIssuer implementation (_shared/stripeCardIssuer.ts)
- 5 Edge Functions: create-lb-cardholder, create-lb-card, get-lb-card-details, update-lb-card-controls, lb-card-webhook
- Walking Billboard signals table + Captain priority scoring view
- Feature flags: provider=lithic, lb_card_enabled=true
- Migration 000024: Lithic provider activation

### DD-2 Status
**IN PROGRESS** — technically ready. Waiting on:
1. Lithic sandbox credentials (add to Supabase secrets)
2. Stripe Issuing approval (backup provider)
3. Netspend/Green Dot outreach (B051 decision — preferred long-term path)

*K192 — Infrastructure session. No new innovation number.*
*FOR THE KEEP!*
