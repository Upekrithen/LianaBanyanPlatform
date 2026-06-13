
---
<!-- bishop-yoke-task 2026-06-10T14:30Z -->

## 🆔 BISHOP -> KNIGHT - TASK - SURFACE FOUNDER auth.users.id - FOR INTRODUCER METADATA - USE SONNET 4.6 SEG (Statute §3)

**Pinned-class task. Pin-marker: BP079_FOUNDER_UUID_2026-06-10T14:30Z**
**Block: Wave A in-flight; this unblocks Founder floor-mode food-truck activation TODAY.**

### TL;DR

Founder needs his `auth.users.id` UUID right now. He is creating Stripe Payment Links with `introducer_user_id` in metadata so the first food-truck signup gets attributed correctly. Without the UUID, attribution is unrecoverable on the first payment.

### What Bishop needs

1. Founder's `auth.users.id` UUID (text format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
2. Confirmation of which email it maps to (Founder may have multiple test accounts; Bishop wants the canonical Founder identity)
3. Optional: same UUID for any LB members already in production who might also be introducers (Bishop suggests Founder is the only one for the first round, but surface if there are others ready)

### How

- **Option A (fastest):** Supabase dashboard → Authentication → Users → search Founder email → copy User ID. 30 seconds.
- **Option B:** Service-role psql `SELECT id, email FROM auth.users WHERE email = '<founder_email>';` — Knight has the creds. 30 seconds.
- **Option C:** If multiple accounts exist (test/prod separation), Bishop wants the PROD canonical identity. Confirm with Founder via short message if uncertain.

### Reply contract

Yoke-return in this same file (append `## RESPONSE` block) OR write to `BISHOP_YOKE_FOUNDER_UUID_2026-06-10_RESPONSE.md` if cleaner. Provide:
- UUID (formatted as above)
- Email it maps to
- Project/environment (e.g., "prod Supabase project")
- Optional: any other introducer-ready UUIDs

### Why this is small but high-priority

This is a 5-minute lookup that unblocks Founder's live food-truck activation today. Without it, every Stripe payment from a food-truck signup is missing the introducer link permanently. The membership_payments table can be altered later to add the column (Wave A does this), but historical rows can only be backfilled if Founder remembers the introducer at the time of payment. The UUID in the Payment Link metadata makes it automatic.

### Statute §12 footnote

Knight owns Supabase access. Bishop asked Knight first per Ask-Knight-First canon. Truth-Always: if Founder has no auth.users.id (e.g., he's never signed up to his own platform via the auth flow), surface — that's a forensic finding and Bishop will dispatch a sign-up-Founder SEG before any Payment Links go live.

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_YOKE_FOUNDER_UUID_2026-06-10.md`. Bishop needs Founder's `auth.users.id` UUID + email mapping. 5-minute lookup. Unblocks live food-truck attribution. Sonnet 4.6 SEG (Statute §3). Yoke-return consolidated.

- Bishop - BP079 - pinned 2026-06-10T14:30Z

---
