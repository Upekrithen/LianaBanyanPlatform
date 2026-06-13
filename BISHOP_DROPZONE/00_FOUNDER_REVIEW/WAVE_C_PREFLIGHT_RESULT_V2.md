# Wave C Activation Pre-flight Result v2
Date: 2026-06-10
Session: BP079

## PRE-1 Fix
Migration file found: YES (platform/supabase/migrations/20260610180000_bp079_food_node_subscription.sql)
Migration applied: YES (applied via supabase db query --linked after fixing RLS column reference)

**Fix applied:** Migration referenced entity_memberships.user_id in RLS policy, but the actual column
is entity_memberships.primary_contact_user_id. Column name corrected in migration file before execution.

**Additional repair:** Remote had orphaned migration version 20260608 not matching local files.
Repaired via supabase migration repair --status reverted 20260608.

food_node_subscriptions present: GREEN
(Confirmed: SELECT from information_schema.tables returned table_name = 'food_node_subscriptions')

## PRE-2 Fix
Stripe price ID found in codebase: NO

Search result: All codebase references to STRIPE_PRICE_FOOD_NODE_WEEKLY point to a placeholder
value price_XXXXXXXXXXXXXXXX — no real Stripe price ID exists anywhere in the codebase or docs.

Secret set: FOUNDER_ACTION_REQUIRED
STRIPE_PRICE_FOOD_NODE_WEEKLY in secrets: RED

**Founder must:**
1. Log into the Stripe Dashboard (https://dashboard.stripe.com)
2. Create a new recurring Price for the Food Node Weekly product
   - Currency: USD
   - Billing interval: weekly
   - Amount: per your pricing model (Cost + 20%)
3. Copy the generated price ID (format: price_XXXXXXXXXXXXXXXXXXXX)
4. Set it in Supabase edge secrets:
   `powershell
   cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"
   npx supabase secrets set STRIPE_PRICE_FOOD_NODE_WEEKLY=price_XXXX --project-ref ruuxzilgmuwddcofqecc
   `
5. After setting, run:
   `powershell
   npx supabase secrets list --project-ref ruuxzilgmuwddcofqecc
   `
   Confirm STRIPE_PRICE_FOOD_NODE_WEEKLY appears in the list.

## PRE-3
GREEN (per Bishop)

## Wave C Gate
RED (1 blocker remaining)

## Remaining blockers
**PRE-2:** STRIPE_PRICE_FOOD_NODE_WEEKLY not set in Supabase edge secrets.
Founder must create the Stripe recurring price in the dashboard and set the secret.
See PRE-2 Fix section above for exact steps.

No further Knight action required for PRE-1 or PRE-3.
When Founder provides the Stripe price ID and sets the secret, PRE-2 flips GREEN and Wave C is clear to proceed.
