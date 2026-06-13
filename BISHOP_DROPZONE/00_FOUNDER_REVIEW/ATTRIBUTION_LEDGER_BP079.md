# Attribution Ledger — BP079 Floor Mode

**Maintained by: Bishop (any session) per Kit C §2 protocol**
**Canonical path:** `LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\ATTRIBUTION_LEDGER_BP079.md`
**Statute bindings:** Truth-Always, ISO-8601 UTC timestamps, three-currency-no-fiat (BP078)**
**Status: ACTIVE — floor mode until Knight Wave A promotion_attributions table is live**

---

## Schema Reference

| Field | Format | Notes |
|---|---|---|
| ts_utc | ISO-8601 UTC | When the row was created (card handed or intro made) |
| introducer | string | "Founder" or LB member handle |
| merchant_type | enum | food_truck / coffee_shop / barber / daycare / other |
| business_name | string | As written on card or signage |
| business_owner_contact | string | Email and/or phone |
| stripe_payment_link | URL | Floor-mode Payment Link handed to this merchant |
| stripe_session_id | string | cs_live_... or cs_test_... — filled at payment |
| amount_cents | int | 500 = $5.00 |
| currency | enum | usd |
| paid_at_utc | ISO-8601 UTC | Filled at Stripe payment confirmed |
| attribution_class | enum | first_signup / first_payment / recurring_payment |
| introducer_credit_class | enum | Credits / Marks / Joules |
| introducer_credit_amount | numeric | TBD — per Knight Wave B vesting canon |
| vesting_unlock_at_utc | ISO-8601 UTC | TBD — per canonical vesting window |
| backfilled_to_promotion_attributions | bool | false until Wave A lands |
| backfill_row_id | uuid | promotion_attributions.id once backfilled, else blank |
| notes | string | Free-text — follow-up, specialty, anything Founder remembers |

---

## Rows

<!-- Bishop: add rows below this line. One H3 block per merchant conversation. -->
<!-- Protocol: see Kit C §2. Always timestamp with ISO-8601 UTC. Never estimate unpaid fields. -->

---

### Row 001 [EXAMPLE — NOT A REAL TRANSACTION]

| Field | Value |
|---|---|
| ts_utc | 2026-06-10T18:45:00Z |
| introducer | Founder |
| merchant_type | food_truck |
| business_name | Joe's Rolling Kitchen |
| business_owner_contact | joe@joesrollingkitchen.com / +1-555-222-3344 |
| stripe_payment_link | https://buy.stripe.com/example_replace_this |
| stripe_session_id | *(blank until payment)* |
| amount_cents | *(blank until payment)* |
| currency | *(blank until payment)* |
| paid_at_utc | *(blank until payment)* |
| attribution_class | *(blank until payment)* |
| introducer_credit_class | Credits |
| introducer_credit_amount | TBD |
| vesting_unlock_at_utc | TBD |
| backfilled_to_promotion_attributions | false |
| backfill_row_id | *(blank until Wave A lands)* |
| notes | [EXAMPLE ROW] Met outside the farmer's market on Main St. Owner expressed interest in a weekly subscriber list. Handed the payment link via text. Follow-up scheduled 2026-06-14. |

---

<!-- END OF EXAMPLE ROW -->
<!-- Bishop: insert real rows below here, starting at Row 002 -->

---

*Ledger initialized by Bishop SEG-KIT-C | 2026-06-10 | BP079*
*Do not delete example row until Founder confirms the schema is correct.*
