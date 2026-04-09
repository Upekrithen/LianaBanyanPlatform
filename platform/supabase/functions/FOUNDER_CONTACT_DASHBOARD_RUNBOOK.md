# Founder Contact Dashboard Runbook (K290 / B076)

## Scope

Implements:

- What-If commission templates and issuance tracking
- Founder call-prep contact dashboard
- Google Calendar OAuth + founder contact sync
- Commission acceptance automation (roles, notifications, follow-up events)
- MoneyPenny draft task extensions

## Required Secrets

Set in Supabase secrets:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FOUNDER_CALENDAR_TOKEN_SECRET` (used for AES-GCM refresh token encryption)

## New Migration

- `platform/supabase/migrations/20260404000040_whatif_commissions_and_founder_dashboard.sql`

Creates:

- `whatif_commission_templates`
- `whatif_commissions_issued`
- `founder_contacts`
- `member_roles` (if missing)
- `staff_members` OAuth columns for founder calendar tokens

Adds:

- acceptance trigger automation
- issue-time follow-up calendar event trigger
- seed templates (6 starter templates)

## New Edge Functions

- `google-calendar-oauth-start` (returns Google auth URL)
- `google-calendar-oauth-callback` (code exchange + encrypted token storage)
- `sync-google-calendar` (pulls upcoming Google events and maps to `founder_contacts`)

## Dashboard Route

- `/staff/founder-contacts`

Page:

- `platform/src/pages/staff/FounderContactDashboard.tsx`

## Verification Checklist

1. Open `/staff/founder-contacts`.
2. Click **Connect Google Calendar** and complete OAuth.
3. Click **Sync Calendar Events** and confirm contact rows update with `next_scheduled_at`.
4. Issue a commission from **Issue Now**.
5. Confirm row in `whatif_commissions_issued`.
6. Confirm follow-up event appears in `calendar_events`.
7. Mark commission accepted.
8. Confirm:
   - `status = accepted` and `accepted_at` populated
   - `member_roles` entry created
   - `founder_contacts.relationship_stage = commissioned` when linked
   - founder/recipient notifications inserted
