# SUPERSEDED — SEE K192

This file was created by Bishop B051 before discovering that K192 (from B050) already covers the LB Card Provider Abstraction in full detail, including CardIssuer interface, Lithic implementation, Walking Billboard signals, and all edge functions.

**K191 is already assigned**: Creator/Press Red Carpet + Outreach Pipeline (see PROMPT_KNIGHT_SESSION_191_CREATOR_PRESS_RED_CARPET.md)

**K192 is the LB Card session**: PROMPT_KNIGHT_SESSION_192_LB_CARD_ABSTRACTION_LAYER.md

## B051 UPDATE TO K192

Based on Pawn B29 research (delivered March 30), K192 should be updated:

1. **Add Netspend/Green Dot as provider options** alongside Lithic:
   - Extend provider CHECK constraint: `('stripe', 'lithic', 'netspend', 'green_dot', 'generic_pm')`
   - These are white-label PM providers (distributor model), NOT API-first issuers
   - PM providers handle compliance/issuance — LB is branded distributor

2. **Add reload_method column** to `lb_card_funding`:
   - `('stripe_connect', 'direct_deposit', 'cash_reload', 'p2p_transfer', 'platform_payout')`
   - PM cards support bankless loading (cash reload at retail + direct deposit)

3. **LB Card Program Brief** is ready for sales calls:
   - See `BISHOP_DROPZONE/LB_CARD_PROGRAM_BRIEF_FOR_SALES_CALLS.md`
   - Founder needs to decide avg monthly load: $100 / $300-500 / $1000-1500 per card

4. **DD-2 is no longer fully BLOCKED** — it's IN PROGRESS:
   - Lithic app submitted March 30
   - Stripe Issuing app submitted March 30
   - White-label PM (Netspend/Green Dot) is the NEW realistic path from Pawn B29
   - First to approve goes live

*This file is a PATCH to K192, not a replacement.*
*FOR THE KEEP!*
