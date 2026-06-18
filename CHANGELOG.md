# MnemosyneC Changelog

## v0.5.2 · 2026-06-18 · BP085
**In-App Membership Purchase — Become a Member from inside MnemosyneC**

### New Features
- **"Become a Member · $5/yr" button** visible in the top-bar (TabBar) on every screen for non-members
- **Help tab membership CTA** — full section with description, button, and member status confirmation
- **Onboarding nudge** — "Maybe later" advances always; never blocks the onboarding flow
- **`membership:open-checkout` IPC** — opens `https://lianabanyan.com/join?source=mnemosynec-app&user_id=<peer_id>`
- **`mnemosynec://` protocol registered** — handles `mnemosynec://membership-active?member_id=...&token=...` return
- **One-time token validation** — server-side via `membership-callback-mnemosynec` Edge Function
- **`membership_activation_tokens` table** — token hash-only storage, 15-min expiry, one-time consumption
- **Local persistence** — `userData/member_status.json` written on activation; read at startup

### Security
- Token value is NEVER logged (BP085 BLOOD)
- Only SHA-256 hash stored in database
- `/validate` returns `{ valid: false }` on second call (consumed_at enforced)

## v0.5.1 · 2026-06-17 · BP085
- Pipeline tab (Founder↔Son peer copy/paste + screenshot pipeline)
- Help Tab expanded with community connections

## v0.5.0 · 2026-06-15 · BP083–BP084
- The Diagnosis tab (federated human-salt queries)
- Battery Publish tab
- v0.4.x — Pinch Seasoning, Salt Tiers, Glow
