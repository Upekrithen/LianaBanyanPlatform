# Bishop Synthesis · Member CTA Barrier Fix · BP092

**Date:** 2026-06-22 · **SEG:** Sonnet 4.6
**Status:** READY FOR FOUNDER RATIFY · Compose-only, do not fire

---

## What Happened (Empirical)

You clicked the green **"Become a Member · $5/yr"** button in the Electron topbar. It opened your browser to a page called **"Your Access Key"** — a full-page form with a list of benefits and a "Join for $5/year" button. No way out. No "Maybe later." You had to either pay or close the tab.

That is a Ghost World canon violation. The canon says: all doors open, auth only when you try to DO something member-only, and even THEN the ask is quick and dismissable — "2 minutes, tops."

---

## What Bishop SEG Found (Gadget-Confirmed)

**The CTA flow:**

1. Electron topbar "Become a Member · $5/yr" button (`LeanShell.tsx` L252) → calls `openMembershipCheckout()` → IPC `membership:open-checkout` (`src/main/index.ts` L4087) → `shell.openExternal('https://lianabanyan.com/join?source=mnemosynec-app&user_id=<peer_id>')` → opens system browser.

2. Browser lands on `/join` → Hugo `layouts/join/list.html` mounts `platform/src/pages/MembershipGate.tsx` → "Your Access Key" page. No dismiss. No exit.

**The existing correct component (not connected):**

`platform/src/components/MembershipGateModal.tsx` — the inline modal that already has "Not ready? Keep browsing." This is exactly right. It's just not wired to the topbar CTA. It's only used inside the platform app via `useGateAction()` hook at specific action points.

**The broader gate map:**

`platform/src/components/ProtectedRoute.tsx` hard-redirects unauthenticated users to `/auth` (not `/join`) for: `/first-steps`, `/invite`, `/pipeline`, `/onboarding/trickle`, `/onboarding/status`, `/agent-onboarding`. The `/auth` redirect is a second violation — it sends users to a sign-in page rather than the join flow.

---

## The Fix (Two Files, Option A)

Bishop recommends touching only two files in the platform React app (not the Electron app):

**File 1: `platform/src/pages/MembershipGate.tsx`**
- Replace the title and benefits copy with the BP085-ratified "Join the Cooperative — $5/year" copy (verbatim canon lock)
- Add a "Maybe later" dismiss button that goes back or to mnemosynec.org
- Remove the `if (!user) { navigate('/auth') }` auth-guard from `handlePayment` (pending verify that the Stripe edge function handles unauthenticated checkout — Knight confirms before removing)

**File 2: `platform/src/components/ProtectedRoute.tsx`**
- Replace `Navigate to="/auth"` with `Navigate to="/join"` (minimum fix: sends users to the join page with its new dismiss button, not the auth page)
- Enhanced option: surface the inline `MembershipGateModal` over a blurred page preview (truer Ghost World UX, slightly more work)

The Electron app files (`LeanShell.tsx`, `LeanHelpTab.tsx`, `LeanWelcomeView.tsx`, etc.) do NOT need to change. They open the browser to `/join`. Once `/join` is Ghost World compliant, the CTA flow is fixed.

---

## Bundle Recommendation

**Bundle this fix with the WS-transport quick-fix into a single v0.6.1 build.** Both are platform-level hotfixes. Sequential ships double overhead. No file overlap (WS-transport is relay/main-process code; this fix is platform React only).

---

## Worktree Collision Alert

M23 UI Citadel (`knight-marathon-23-ui-citadel`) touches `src/renderer/`. This fix (Option A) touches only `platform/src/` — **zero collision**. If Founder upgrades to Option B (in-app Electron modal), collision risk with M23 is HIGH. Bishop recommends Option A to keep M23 unblocked.

---

## Wall-Clock

- Option A (recommended): **1.5–2.5 hrs Knight**
- Bundled with WS-transport: add **~0.5 hrs**

---

## 3 Questions for Founder

1. **Bundle into v0.6.1 with WS-transport, or ship separately?**
   Bishop recommends: YES bundle.

2. **Option A (fix landing page only) or Option B (add in-app Electron modal)?**
   Bishop recommends: Option A first. Option B is future enhancement.

3. **ProtectedRoute change: minimum (Navigate to="/join") or enhanced (inline modal + blurred preview)?**
   Bishop recommends: minimum now, enhanced in a future session.

---

## Files Knight Touches

| File | Edit |
|---|---|
| `platform/src/pages/MembershipGate.tsx` | BP085 copy, "Maybe later", auth-guard removal |
| `platform/src/components/ProtectedRoute.tsx` | `/auth` → `/join` redirect (minimum) |
| `CHANGELOG.md` | v0.6.1 entry |
| `Cephas/cephas-hugo/static/download/version_trust.json` | Bump to 0.6.1 (if bundled) |

No Electron renderer files touched in Option A. M23 stays unblocked.

---

*Bishop SEG Sonnet 4.6 · BP092 · 2026-06-22 · Compose-only · Awaiting Founder ratify*
