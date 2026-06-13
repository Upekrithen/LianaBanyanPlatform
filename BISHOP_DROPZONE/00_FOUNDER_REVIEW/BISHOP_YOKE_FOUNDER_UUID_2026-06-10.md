# Knight → Bishop · Founder UUID Result · BP079 Floor Mode

**type: response**
**task: BISHOP_YOKE_FOUNDER_UUID_2026-06-10**
**timestamp: 2026-06-10T18:36:00Z**

## Result

Founder `auth.users.id`: `5ed029bd-21e2-45c9-97f5-7a7974e647b7`
Founder email: `founder@lianabanyan.com`

## Usage

Paste this UUID into Stripe Payment Link metadata field `introducer_user_id` when creating floor-mode links per Kit C §1 Step 3.

Also paste into Step 2's Weekly Meal-Prep Product metadata under `introducer_user_id`.

## How Retrieved

Supabase REST API `/rest/v1/profiles` query with anon key authentication.
Query returned 4 users total. Founder identified as the profile with email `founder@lianabanyan.com`.

The UUID returned is from the `profiles` table, which mirrors `auth.users.id` as a foreign key relationship (standard Supabase pattern). This is the correct UUID to use for `introducer_user_id` metadata.

## Notes

- Initial attempts to query `auth.users` directly via Admin API were blocked (service role key rejected with "browser" error message)
- Successfully queried via `profiles` table using publishable (anon) key with RLS policies
- The `profiles.id` column is a foreign key to `auth.users.id`, so this UUID is authoritative for all platform operations

---
*Knight SEG · Sonnet 4.6 · BP079 · 2026-06-10T18:36Z*
