# KNIGHT MARATHON SESSION 16 — AUTH ROUTING FIX
## BP090 · 2026-06-22 · Founder-ratified (morning Central)

**Classification:** LAUNCH BLOCKER FIX  
**Priority:** CRITICAL — new-user funnel broken at sign-up  
**Fires independently of:** M11 / M13 / M14 / M15  
**Must complete before:** any launch-day social blast

---

## BISHOP PRE-FLIGHT (READ BEFORE WAKING)

Bishop has empirically verified the following from source. Knight does NOT need to re-read these files from scratch — use the line references below as surgical targets.

### Confirmed source state (read 2026-06-22)

**`platform/src/pages/Auth.tsx` line 40 — BUG 1 CONFIRMED**
```ts
const defaultPostAuth = portal === 'upekrithen' ? '/' : '/dashboard';
```
Non-Founder users redirect to `/dashboard` post-auth. Must change to `/welcome`.

**`platform/src/components/v2/mascot/MascotAuthGate.tsx` line 179 — BUG 1 CONFIRMED**
```ts
const redirectUrl = `${window.location.origin}/dashboard`;
```
Email-confirmation redirect URL baked as `/dashboard`. Must change to `/welcome`.

**`MascotAuthGate.tsx` lines 164–192 — BUG 2 CONFIRMED**
`handleSignUp()` calls `onAuthed?.()` immediately after `supabase.auth.signUp()` succeeds (line 191). With email confirmation enabled, no `SIGNED_IN` event fires — `onAuthed` triggers `navigate(defaultPostAuth)` which also does nothing useful because `user` is still null. The component has no "Check your email" state; the only loading label is `'Checking…'` at line 267 (scoped to the email-check RPC step, NOT sign-up — so Bug 2 is a silent hang after the toast, not an infinite spinner, but the UX is broken because the form stays interactive after sign-up without explanation).

**`platform/src/contexts/AuthContext.tsx` lines 44–64 — CONFIRMED**
`onAuthStateChange` waits for `SIGNED_IN` event. With email confirmation enabled, this never fires for new users pre-confirmation. The 5-second safety timer (line 40) only covers initial load, not sign-up flow.

**`platform/src/routes/onboarding.tsx` line 49 — CONFIRMED**
```tsx
<Route path="/welcome" element={<LazyPage><WelcomeV2Page /></LazyPage>} />
```
`/welcome` route exists and is NOT protected (no `<ProtectedRoute>` wrapper — correct, because email-link landing should work even before session is fully established).

**`platform/firebase.json` target `dotcom` — CONFIRMED**
`"target": "dotcom"` with `"public": "dist"` → deploys to lianabanyan.com. Confirmed at lines 23–39.

**`platform/src/components/ProtectedRoute.tsx` — CONFIRMED CLEAN**
No hardcoded `/dashboard` redirect. `ProtectedRoute` redirects unauthenticated users to `/auth`, storing `lb_auth_return_path`. `CaptainRoute` does the same. No auth-flow orphan `/dashboard` redirects here.

**T2 orphan scan result:** The `/dashboard` occurrences in `AppSidebar.tsx`, `Academy.tsx`, `BusinessApp.tsx`, `NetworkApp.tsx`, `NonprofitApp.tsx` etc. are NAVIGATION links, NOT post-auth redirect targets. Only the two lines in `Auth.tsx:40` and `MascotAuthGate.tsx:179` are auth-flow redirects. Both are targeted in Block 2.

---

## CANONICAL PATHS

```
React app root:     C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\
Build:              npm run build  (Vite → platform/dist/)
Deploy:             firebase deploy --only hosting:dotcom
Firebase config:    platform\firebase.json
.firebaserc:        platform\.firebaserc

Bug 1 files:
  platform\src\pages\Auth.tsx                                    line 40
  platform\src\components\v2\mascot\MascotAuthGate.tsx           line 179

Bug 2 files:
  platform\src\components\v2\mascot\MascotAuthGate.tsx           lines 41, 51-58, 164-192, 207 (type + state)

E2E smoke receipt target:
  C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\M16_E2E_SMOKE_RECEIPT_2026-06-22.md
```

---

## BLOCK 1 — DIAGNOSE + VERIFY ENVIRONMENT (15–30 min)

**Purpose:** Confirm nothing has drifted between Bishop's read and Knight's execution.

### 1a. Confirm canonical codebase
```powershell
# Must NOT be the archived variant
Get-ChildItem "C:\Users\Administrator\Documents\LianaBanyanPlatform\" -Directory | Select-Object Name
# Expect: platform/ is present; platform-v2-ARCHIVED-B133 or similar must NOT be the working dir
```

### 1b. Confirm Firebase dotcom target
```powershell
Get-Content "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\.firebaserc"
# Expect: targets.lianabanyan-403dc.hosting.dotcom entry present
```

### 1c. Spot-check line numbers match
```powershell
# Auth.tsx line 40
(Get-Content "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages\Auth.tsx")[39]
# Expect: const defaultPostAuth = portal === 'upekrithen' ? '/' : '/dashboard';

# MascotAuthGate.tsx line 179
(Get-Content "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\v2\mascot\MascotAuthGate.tsx")[178]
# Expect: const redirectUrl = `${window.location.origin}/dashboard`;
```

If either line does not match exactly, STOP. Read the full file and re-identify the correct line before proceeding. Do not guess.

### 1d. Supabase email confirmation check
Supabase email confirmation is empirically confirmed enabled (the sign-up flow shows this behavior). Knight does not need to verify in the Supabase dashboard — trust Bishop's empirical receipt. Do NOT disable email confirmation. The fix is a UI state change, not a Supabase config change.

**T1 Gate:** Lines match. `dotcom` target confirmed in `.firebaserc`. `platform/` is the canonical directory.

---

## BLOCK 2 — FIX BUG 1: POST-AUTH REDIRECT (30–45 min)

### 2a. Auth.tsx — change defaultPostAuth

File: `platform/src/pages/Auth.tsx`

Change line 40 from:
```ts
const defaultPostAuth = portal === 'upekrithen' ? '/' : '/dashboard';
```
To:
```ts
const defaultPostAuth = portal === 'upekrithen' ? '/' : '/welcome';
```

**Rule:** Founder portal `upekrithen` STILL goes to `/` (admin home). All other portals go to `/welcome`. Do not change any other line in this file.

### 2b. MascotAuthGate.tsx — fix emailRedirectTo

File: `platform/src/components/v2/mascot/MascotAuthGate.tsx`

Change line 179 from:
```ts
const redirectUrl = `${window.location.origin}/dashboard`;
```
To:
```ts
const redirectUrl = `${window.location.origin}/welcome`;
```

This is inside `handleSignUp()` and sets the `emailRedirectTo` option for `supabase.auth.signUp()`. When the user clicks their confirmation email link, Supabase will redirect them to `/welcome` instead of `/dashboard`.

### 2c. T2 orphan verification
After making both edits, run:
```powershell
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages\Auth.tsx" -Pattern "/dashboard"
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\v2\mascot\MascotAuthGate.tsx" -Pattern "/dashboard"
```
Both must return zero matches. If any remain, investigate before proceeding.

**T2 Gate:** Zero `/dashboard` occurrences in the two auth-flow redirect files. `ProtectedRoute.tsx` has no `/dashboard` redirects (already confirmed by Bishop — no re-read needed).

---

## BLOCK 3 — FIX BUG 2: SIGN-UP SUCCESS STATE (Option a) (60–90 min)

### Overview
With email confirmation enabled, `supabase.auth.signUp()` returns success but no session. The current `handleSignUp()` calls `onAuthed?.()` immediately, which triggers `navigate('/welcome')` — but with no user session, the `/welcome` route renders fine (it is not protected), so this actually partly works for Bug 1. However, the UX problem is that the form remains in its current state with no clear signal to the user. Option (a): render an explicit "Check your email" success panel.

### 3a. Expand the Step type

File: `platform/src/components/v2/mascot/MascotAuthGate.tsx`

Change line 41 from:
```ts
type Step = 'email' | 'signin-password' | 'signup-password';
```
To:
```ts
type Step = 'email' | 'signin-password' | 'signup-password' | 'email-sent';
```

### 3b. Add resend timer state

After line 58 (the `sendingReset` state declaration), add two new state declarations:
```ts
const [emailSentTo, setEmailSentTo] = useState('');
const [resendCountdown, setResendCountdown] = useState(0);
```

### 3c. Rewrite handleSignUp()

Replace lines 164–192 (the entire `handleSignUp` function) with:

```ts
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    passwordSchema.parse(password);
  } catch (err) {
    if (err instanceof z.ZodError) {
      toast.error(err.errors[0].message);
      return;
    }
  }
  if (password !== confirm) {
    toast.error('Passwords do not match.');
    return;
  }
  setLoading(true);
  const redirectUrl = `${window.location.origin}/welcome`;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl },
  });
  setLoading(false);
  if (error) {
    toast.error('Sign-up failed. Please try again.');
    return;
  }
  // Email confirmation required — show explicit success state.
  // Do NOT call onAuthed(); user must click email link first.
  setEmailSentTo(email);
  setStep('email-sent');
  setResendCountdown(30);
};
```

### 3d. Add resend countdown effect

After the existing state declarations (around line 60, before `const bubbleMessage`), add:

```ts
// Countdown timer for "Resend email" button
React.useEffect(() => {
  if (resendCountdown <= 0) return;
  const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
  return () => clearTimeout(t);
}, [resendCountdown]);

const handleResendEmail = async () => {
  if (resendCountdown > 0) return;
  setLoading(true);
  const redirectUrl = `${window.location.origin}/welcome`;
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: emailSentTo,
    options: { emailRedirectTo: redirectUrl },
  });
  setLoading(false);
  if (error) {
    toast.error('Could not resend. Please try again.');
    return;
  }
  toast.success('Confirmation email resent.');
  setResendCountdown(30);
};
```

### 3e. Add email-sent render branch

The component renders a 3D flip card (front = sign-in, back = sign-up). The `email-sent` state should render INSTEAD of the flip card — replace the entire return block with a conditional.

In the `return (...)` block, wrap the existing `<div className="flex flex-col items-center">` content so that when `step === 'email-sent'`, a success panel renders instead:

```tsx
return (
  <div className="flex flex-col items-center">
    {step === 'email-sent' ? (
      /* ── Email-sent success panel ── */
      <div
        className="relative p-5 space-y-4 w-full"
        style={{
          maxWidth: 360,
          background: 'rgba(15, 23, 42, 0.97)',
          border: '1.5px solid rgba(34, 211, 238, 0.45)',
          color: '#e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          borderRadius: '0.75rem',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Glasses className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-cyan-300 text-[13px]">Check your email</span>
        </div>
        <div className="text-slate-300 text-[12px] leading-snug space-y-2">
          <p>
            We sent a confirmation link to{' '}
            <span className="font-medium text-slate-100">{emailSentTo}</span>.
          </p>
          <p>Click the link to finish signing up — you can close this tab.</p>
        </div>
        <Button
          type="button"
          onClick={handleResendEmail}
          disabled={loading || resendCountdown > 0}
          variant="outline"
          className="w-full border-slate-500 text-slate-200 hover:bg-slate-700 text-[12px]"
        >
          {resendCountdown > 0
            ? `Resend email (${resendCountdown}s)`
            : loading
            ? 'Sending…'
            : 'Resend email'}
        </Button>
        <button
          type="button"
          className="text-[11px] text-slate-500 hover:text-slate-300 underline w-full text-center"
          onClick={() => {
            setStep('email');
            setFlipped(false);
            setPassword('');
            setConfirm('');
            setEmailSentTo('');
            setResendCountdown(0);
          }}
        >
          Use a different email
        </button>
        {/* Tail */}
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            marginLeft: -6,
            width: 12,
            height: 12,
            transform: 'rotate(45deg)',
            background: 'rgba(15, 23, 42, 0.97)',
            borderRight: '1.5px solid rgba(34, 211, 238, 0.45)',
            borderBottom: '1.5px solid rgba(34, 211, 238, 0.45)',
          }}
        />
      </div>
    ) : (
      /* ── Existing 3D flip card (unchanged) ── */
      <div
        className="relative"
        style={{
          perspective: '1200px',
          width: '100%',
          maxWidth: 360,
        }}
      >
        {/* ... all existing flip card JSX goes here unchanged ... */}
      </div>
    )}
  </div>
);
```

IMPORTANT: The existing flip-card JSX (lines 213–433 of the original file) goes inside the `else` branch exactly as-is. Do not modify it.

### 3f. Import React explicitly if needed

The `React.useEffect` usage in step 3d requires React in scope. Check the import at line 17:
```ts
import React, { useState } from 'react';
```
React is already imported. The `useEffect` hook is not currently destructured — either add it to the destructure:
```ts
import React, { useState, useEffect } from 'react';
```
...and change `React.useEffect` to `useEffect`, OR keep `React.useEffect`. Either is fine. Prefer the destructured form for consistency.

### 3g. Verify "Checking…" label scope

Line 267 in the original file:
```tsx
{loading ? 'Checking…' : 'Enter'}
```
This is the email-step "Enter" button. `loading` here is the RPC check for whether the email exists. This is CORRECT behavior — it only shows "Checking…" during the brief RPC call, then transitions to sign-in or sign-up password step. No change needed here.

**T3 Gate:** With a fresh test email (e.g., `bishop+test-{timestamp}@lianabanyan.com`), the sign-up flow shows the "Check your email" panel within 2 seconds of clicking "Sign Up". The form does not remain interactive post-sign-up. No infinite "Checking…" state.

---

## BLOCK 4 — BUILD + FIREBASE DEPLOY (10 min)

```powershell
Set-Location "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"
npm run build
```

Build must exit 0. If TypeScript errors appear, fix them before deploying. Common issues to watch for:
- `resendCountdown` used before declaration if state order matters (it doesn't in React — declaration order is fine)
- `supabase.auth.resend` type signature — verify it exists on the Supabase client version in use; if not available, fallback is to call `supabase.auth.signUp` again with the same credentials (Supabase treats re-signup of unconfirmed email as a resend)

```powershell
firebase deploy --only hosting:dotcom
```

**T4 Gate:** `npm run build` exits 0. `firebase deploy` reports "Deploy complete". `https://lianabanyan.com` returns HTTP 200 within 60 seconds of deploy completing.

---

## BLOCK 5 — END-TO-END SMOKE (3 scenarios) (30 min)

Use a browser in a fresh incognito/private session for each scenario. Record results in the receipt file at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\M16_E2E_SMOKE_RECEIPT_2026-06-22.md`

### Scenario A — New email sign-up
1. Open `https://lianabanyan.com/auth` in incognito
2. Enter a fresh email (e.g., `bishop+m16a-{unix-timestamp}@lianabanyan.com`)
3. Click Enter → expect: RPC check completes, card flips to sign-up panel
4. Enter password + confirm → click Sign Up
5. Expected within 2 seconds: "Check your email" panel appears with the email address shown
6. No infinite "Checking…" hang. Form is no longer interactive (password fields gone).
7. PASS receipt: capture screenshot or describe UI state

### Scenario B — Existing email sign-in
1. Open `https://lianabanyan.com/auth` in incognito
2. Enter Founder's email (`Social@lianabanyan.com`)
3. Click Enter → expect: card stays on sign-in side (not flipped)
4. Enter correct password → click Sign In
5. Expected: redirect to `/welcome` (NOT `/dashboard`, NOT `/dashboard/upekrithen`)
6. PASS receipt: capture final URL

### Scenario C — Already-signed-in Founder clicks Join
1. In a normal browser session where Founder is signed in
2. Navigate to `https://lianabanyan.com/auth` (or any join/auth trigger)
3. Expected: immediate redirect to `/welcome` via the `useEffect` in `Auth.tsx` (user is already non-null)
4. `/dashboard/upekrithen` must NOT appear
5. PASS receipt: capture final URL

**T5 Gate:** All 3 scenarios pass. Receipt file written with results.

---

## BLOCK 6 — STRIPE-TEST PREP (15 min)

### 6a. Verify Stripe Checkout loads on /welcome → /join flow
1. Navigate to `https://lianabanyan.com/welcome`
2. Click the "Join for $5/year" CTA (or equivalent join trigger)
3. Proceed to `/join` (the `MembershipGate` page per `onboarding.tsx` line 55)
4. Confirm Stripe Checkout UI renders — look for Stripe.js loading in browser DevTools Network tab (`js.stripe.com` request)
5. Do NOT complete the purchase — Founder will run the actual $5 transaction separately

### 6b. Verify environment variables are live (not placeholder)
```powershell
# Check the built JS for the Stripe publishable key
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\dist\assets\*.js" -Pattern "pk_live_" | Select-Object -First 3
```
Must find `pk_live_` (not `pk_test_` and not `VITE_STRIPE_PUBLISHABLE_KEY` literal placeholder).

Also spot-check Supabase anon key:
```powershell
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\dist\assets\*.js" -Pattern "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" | Select-Object -First 1
```
Must return a match (Supabase JWT anon keys start with this base64 prefix).

**T6 Gate:** Stripe Checkout renders at `/join`. `pk_live_` confirmed in built JS. Supabase JWT confirmed in built JS. Founder cleared to run $5/yr test from a fresh account.

---

## RETURN-TO-BISHOP SPEC

When all 6 blocks are complete, return to Bishop with:

```
M16 COMPLETE

Commit hash: [git commit hash of auth fix]
Firebase deploy URL: https://lianabanyan.com (deploy receipt timestamp)

E2E Scenario A (new sign-up): PASS / FAIL — [notes]
E2E Scenario B (existing sign-in → /welcome): PASS / FAIL — [notes]
E2E Scenario C (signed-in Founder → /welcome): PASS / FAIL — [notes]

Stripe pk verification: pk_live_ CONFIRMED / NOT FOUND
Supabase anon key: CONFIRMED / NOT FOUND

Founder Stripe-test status: CLEARED TO PROCEED / BLOCKED (reason)

Any deviations from yoke or blockers encountered:
[list or NONE]
```

---

## TRUTH-ALWAYS GATES SUMMARY

| Gate | Condition |
|------|-----------|
| T1 | `platform/` is canonical; `dotcom` target confirmed; line numbers match |
| T2 | Zero `/dashboard` in auth-flow redirect paths after edits |
| T3 | Sign-up shows "Check your email" panel within 2 sec; zero indefinite hang |
| T4 | `npm run build` exits 0; Firebase deploy reports complete; site returns 200 |
| T5 | All 3 E2E scenarios pass; receipt file written |
| T6 | `pk_live_` confirmed in built JS; Stripe Checkout renders |

---

## WALL-CLOCK ESTIMATE

| Block | Description | Est. |
|-------|-------------|------|
| 1 | Diagnose + verify | 15–30 min |
| 2 | Bug 1 fix (redirect) | 30–45 min |
| 3 | Bug 2 fix (email-sent state) | 60–90 min |
| 4 | Build + deploy | 10 min |
| 5 | E2E smoke | 30 min |
| 6 | Stripe prep | 15 min |
| **TOTAL** | | **2.5–3.5 hrs** |

---

## KNOWN CONSTRAINTS

- Do NOT disable Supabase email confirmation. The fix is UX-only.
- Do NOT modify `AuthContext.tsx` or `ProtectedRoute.tsx` — they are not part of the bug.
- Do NOT change the Founder portal (`upekrithen`) redirect — it must stay at `/`.
- `supabase.auth.resend()` API: verify this method exists on the installed `@supabase/supabase-js` version before using it. Run `npm list @supabase/supabase-js` to check version. If version < 2.x or method missing, substitute a second `supabase.auth.signUp()` call with the same credentials — Supabase treats this as a resend for unconfirmed emails.
- Build artifacts in `platform/dist/` are NOT committed to git — Firebase deploys from the built output. Always rebuild before deploying.

---

*Composed by Bishop SEG (Sonnet 4.6) · BP090 · 2026-06-22*  
*Source reads completed before yoke composition — line references are empirically verified*
