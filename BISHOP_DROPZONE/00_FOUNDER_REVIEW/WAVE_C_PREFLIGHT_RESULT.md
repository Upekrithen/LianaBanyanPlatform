# Wave C Activation Pre-flight Result
Date: 2026-06-10
Session: BP079

| Check | Status | Detail |
|-------|--------|--------|
| PRE-1: Migrations | RED | Live REST probe (`GET /rest/v1/<table>?select=*&limit=1`, project `ruuxzilgmuwddcofqecc`): **found (HTTP 200)** — `leviathan_cue_cards`, `promotion_attributions`, `cue_card_destinations`, `cue_card_share_clicks`, `red_carpet_access`, `cue_card_templates`, `social_frame_locks`, `creator_referrals`. **Missing (HTTP 404)** — `food_node_subscriptions`. |
| PRE-2: Stripe env var | RED | `supabase secrets list --project-ref ruuxzilgmuwddcofqecc` (CLI, names only): **`STRIPE_PRICE_FOOD_NODE_WEEKLY` not present**. Edge function `create-food-node-subscription-checkout` reads this var. Management API `GET /v1/projects/.../secrets` with anon key returned HTTP 401 (not used for final verdict). |
| PRE-3: Firebase domains | GREEN | Confirmed by Bishop SEG-FIREBASE-FIX |

## Credential notes (no values echoed)
- Specified `Asteroid-ProofVault/LockBox/SDS.env`: **file not found** on this host; `SUPABASE_SERVICE_ROLE_KEY` was not loaded from that path.
- REST table probes used `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` from `platform/.env` (process scope only).

## Action Required
1. **Apply BP079 food-node migration** so `public.food_node_subscriptions` exists in production (repo migration: `platform/supabase/migrations/20260610180000_bp079_food_node_subscription.sql`). Re-run PRE-1 until `food_node_subscriptions` returns HTTP 200.
2. **Set Supabase edge secret** `STRIPE_PRICE_FOOD_NODE_WEEKLY` to the Stripe weekly price ID used for Food Node checkout, then confirm via `supabase secrets list`.

## Wave C Gate
**RED — blocked** until PRE-1 and PRE-2 are GREEN.
