# KNIGHT QUICK FIX · Member CTA Barrier → Ghost World Compliance · BP092
## COMPOSE-ONLY · Founder must ratify before fire

**Bishop SEG:** Sonnet 4.6 · BP092 · 2026-06-22
**[SEG]/[MAIN] A15 BLOOD** — Sonnet 4.6 only, all sessions, no exceptions.
**MIC reporting per `canon_mic_reporting_regular_job_easier_than_work_bp092`** — MIC report at close of each Block.
**§14 BLOOD** — gadget-first, no assumptions, empirical only.
**§15 BLOOD** — Caithedral always; Postgres only, never SQLite primitives.
**§17 BLOOD** — absolute paths throughout, no relative.
**Caithedral always.**

---

## PROBLEM STATEMENT (Empirical · BP092)

Founder clicked the green **"Become a Member · $5/yr"** button in the Electron app topbar (visible in screenshot `C:\Users\Administrator\Pictures\Newest\Screenshot 2026-06-22 210810.png`). The button triggered `membership:open-checkout` IPC → `shell.openExternal('https://lianabanyan.com/join?source=mnemosynec-app&user_id=<peer_id>')`. The browser opened to a page titled **"Your Access Key"** (screenshot `C:\Users\Administrator\Pictures\Newest\Screenshot 2026-06-22 210933.png`) listing benefits and a "Join for $5/year" button — but no mechanism to dismiss or continue without joining. This is a **full-page barrier** that violates Ghost World canon.

**Canon violated:**
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_ghost_world_architecture_ungated_read_ghost_marks_bp092.eblet.md` — "ALL DOORS ARE OPEN so nothing needs auth gates, UNTIL you try to do something only a MEMBER can do … then it asks you if you want to become a member for $5 a year in a simple, easy, turnkey way so you can say yes, pay for it, and then keep going. 2 minutes, tops."
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_join_modal_benefits_over_barrier_copy_bp085.eblet.md` — ratified BP085 modal copy lock: must include "Maybe later" dismissal, never a full-page barrier.

**Root cause (empirical, Bishop SEG gadget-confirmed):**

1. **Electron topbar CTA** (`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanShell.tsx` L252) → calls `openMembershipCheckout()` → IPC `membership:open-checkout` (`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts` L4087–L4099) → `shell.openExternal('https://lianabanyan.com/join?...')` → opens system browser.

2. **Hugo `/join/` route** (`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\join\list.html`) renders a React island mounting `platform/src/pages/MembershipGate.tsx` — the "Your Access Key" page. This is a **standalone full-page route** with no "Maybe later" / dismiss option and no way to continue without paying.

3. **Platform `/join` React route** (`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\onboarding.tsx` L55) renders the same `MembershipGate` component — no dismiss path.

4. **`platform/src/components/MembershipGateModal.tsx`** is the CORRECT inline modal — it already has "Not ready? Keep browsing." — but it is NOT wired to the topbar CTA flow. It is only used via `useGateAction()` hook on action-gate points inside the platform app.

5. **`ProtectedRoute`** (`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\ProtectedRoute.tsx`) hard-redirects unauthenticated users to `/auth` for routes: `/first-steps`, `/invite`, `/pipeline`, `/onboarding/trickle`, `/onboarding/status`, `/agent-onboarding`. These are member-action routes — most are legitimate gates, but the audit in Block 2 will confirm disposition per Ghost World canon.

---

## BUNDLE RECOMMENDATION

Bishop recommends Knight **bundle this fix with `KNIGHT_QUICK_FIX_M22_REALTIME_WS_TRANSPORT_V061_BP092.md`** into a single v0.6.1 build. Both are quick-fix class. Sequential ship doubles overhead. Single v0.6.1 commit with two fix scopes is clean. If Founder prefers separate ships, this fix is v0.6.1a and WS-transport is v0.6.1b — but Bishop recommends bundle.

**WORKTREE COLLISION RISK:** M23 UI Citadel (`knight-marathon-23-ui-citadel` branch) also touches `src/renderer/`. Specifically, `LeanShell.tsx` is in scope for BOTH this fix (Block 1) and M23 (tab layout). **Knight must branch this fix off `main` / `v0.6.0` — NOT off the M23 branch.** Merge order: this fix merges first → M23 rebases or merges after. Bishop flags this to Founder.

---

## PRE-BLOCK · Gadget-Verify Current State

Knight reads and empirically confirms the following before editing any file.

**PB-1. Confirm Electron topbar CTA wiring:**
- File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanShell.tsx`
- Confirm: `handleMemberCta` at approx. L322 calls `openMembershipCheckout()` which calls IPC `membership:open-checkout`
- Confirm: IPC handler at `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts` L4087 calls `shell.openExternal('https://lianabanyan.com/join?...')`
- Expected: YES — this opens the system browser to a full-page barrier.

**PB-2. Confirm MembershipGateModal is NOT wired to topbar CTA:**
- File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\MembershipGateModal.tsx`
- Confirm: `MembershipGateModal` has "Not ready? Keep browsing." dismiss button — this is the CORRECT Ghost World component.
- Confirm: It is only called via `useGateAction()` hook — NOT from Electron app topbar flow.
- Expected: Confirmed. Modal exists and is correct; just not connected to the right trigger path.

**PB-3. Confirm Hugo `/join/` layout renders MembershipGate island with no dismiss:**
- File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\join\list.html`
- File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages\MembershipGate.tsx`
- Confirm: No "Maybe later" / "Keep browsing" / dismiss button exists in `MembershipGate.tsx`.
- Expected: Confirmed. Full-page barrier, no exit path.

**PB-4. Confirm BP085 ratified modal copy:**
- File: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_join_modal_benefits_over_barrier_copy_bp085.eblet.md`
- Verbatim copy lock (read before editing): title "Join the Cooperative — $5/year", body as ratified, dismiss = "Maybe later".

**PB-5. Read `LeanShell.tsx` in full to understand the tab/topbar component structure before editing.**
- File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanShell.tsx`

**PB-6. Confirm no other Electron component opens a full-page barrier on member CTA click:**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanHelpTab.tsx` — calls `openMembershipCheckout()` same IPC path.
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanWelcomeView.tsx` — calls `openMembershipCheckout()` same IPC path.
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanAskTab.tsx` — calls `openExternal('https://lianabanyan.com/join')` directly.
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\FrameTab.tsx` — calls `openExternal('https://lianabanyan.com/join')`.
- All of these share the same IPC/external-URL problem. All go in-scope for Block 1.

**MIC REPORT — Pre-Block close:**
Knight posts: files confirmed read, current wiring verified, barrier confirmed, no dismiss path confirmed.

---

## BLOCK 1 · Remove the Full-Page Barrier · Wire Ghost World Inline Join

**GOAL:** When the Electron app user clicks "Become a Member · $5/yr" — in the topbar, in LeanHelpTab, in LeanWelcomeView, in LeanAskTab, in FrameTab — show an in-app inline modal (Ghost World compliant: dismiss button, no redirect to external barrier page). On success: deep-link back to app, mark member.

The `MembershipGateModal` component in `platform/src/components/MembershipGateModal.tsx` is the correct UI component — it already has "Not ready? Keep browsing." However it lives in the platform React app (lianabanyan.com), not in the Electron renderer. Knight chooses one of two paths:

**Option A (preferred — lower risk):** Keep the IPC/external-URL flow but fix the LANDING PAGE to be Ghost World compliant instead of a full-page barrier. This is a Hugo + platform change only, not an Electron renderer change.

**Option B (deeper):** Wire a native Electron in-app modal in the renderer layer, eliminating the browser redirect entirely for the join CTA.

**Bishop recommends Option A first** — it is lower-risk, zero Electron-main changes, and fixes the Founder's immediate pain point. Option B is a future enhancement.

### B1-1. Fix `platform/src/pages/MembershipGate.tsx` — Add dismiss path

The "Your Access Key" page is reached from the browser (external URL). It needs a **"No thanks, keep browsing"** / "Maybe later" link that returns the user to wherever they came from (or to the home page). This is a single addition: a dismiss/back button below the "Join for $5/year" CTA.

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages\MembershipGate.tsx`

**Change:** After the existing `<Button>Join for $5/year</Button>` block, add:

```tsx
<p className="text-center text-sm text-muted-foreground mt-1">
  Your access key. $5/year funds the substrate.
</p>

<button
  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-2"
  onClick={() => {
    // Return to where they came from, or to home if no referrer
    if (document.referrer && document.referrer !== window.location.href) {
      window.history.back();
    } else {
      window.location.href = 'https://mnemosynec.org';
    }
  }}
>
  Maybe later
</button>
```

The "Already a member? Sign in" link below remains unchanged.

**Full ratified title copy:** Replace the existing `<h1>Your Access Key</h1>` and subtitle with BP085 modal copy verbatim:

```tsx
<h1 className="text-3xl font-bold tracking-tight mb-2">Join the Cooperative — $5/year</h1>
<p className="text-muted-foreground">
  The receipts are public. The full audit trail is for members.
  $5/year. Funds the substrate. Your membership is the cooperative.
</p>
```

Replace the existing `benefits` array with the BP085-ratified benefits list:

```tsx
const benefits = [
  'Full audit trail — member-only access to the deep /proofs/ archive',
  'Vote in the cooperative — governance, realm-name decisions, leader confirms',
  'Earn Marks — adversarial testing, knowledge contributions, eblet mints (Code Breakers Guild eligible)',
  'Co-authorship eligibility on the next patent bag (PROV_23 — real attribution, not gestural credit)',
  'Mesh Test access — live when we hit 1,000 members, shooting for this week',
];
```

Replace the "Join for $5/year" button label with:
```tsx
'Join the Cooperative →'
```

**Truth-Always:** "Co-authorship eligibility" (not "your name will be on") per BP085 canon until PROV_23 filing receipt exists.

### B1-2. Update the page `<title>` to match

Hugo `/join/` content title (`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\join\_index.md`) currently reads: `"Join the Cooperative"` — this is correct, no change needed.

Hugo `layouts/join/list.html` mounts the React island — no change needed here either.

### B1-3. Fix `handlePayment` in `MembershipGate.tsx` — remove auth-gate redirect

Current code at L22–L26:
```tsx
if (!user) {
  navigate(`/auth?redirect=/join${inviteCode ? `?invite=${inviteCode}` : ''}`);
  return;
}
```

This is a **Ghost World violation**: a user who clicked the "Join" button should NOT be redirected to `/auth` first. They should go directly to the Stripe checkout. The Stripe session itself handles email capture.

**Change:** Remove the `if (!user) { navigate('/auth'); return; }` guard. Let unauthenticated users proceed directly to `create-membership-checkout`. The edge function already creates a Stripe checkout that handles user creation/linking on return.

**Knight verify first:** Read `platform/supabase/functions/handle-membership-webhook/index.ts` and `platform/supabase/functions/create-membership-checkout/index.ts` to confirm the edge function handles unauthenticated checkout creation before removing the auth guard. If the edge function REQUIRES an auth token, flag to Bishop — do NOT remove the guard without confirming. If it does require auth, the correct fix is: let unauthenticated users create a guest Stripe session (no `access_token` required), and link on webhook return by email match. Flag this as open if Knight cannot confirm in this session.

### B1-4. No changes needed to `LeanShell.tsx`, `LeanHelpTab.tsx`, `LeanWelcomeView.tsx`, `LeanAskTab.tsx`, `FrameTab.tsx`

These all open the browser to `https://lianabanyan.com/join`. After B1-1 fixes that landing page to be Ghost World compliant (with dismiss), the Electron CTA flow is fixed without touching any Electron renderer files. This also eliminates the worktree collision risk with M23.

**MIC REPORT — Block 1 close:**
Knight posts: MembershipGate.tsx updated (diff inline), benefits list replaced with BP085-ratified copy, "Maybe later" dismiss added, auth-guard in handlePayment status (removed or flagged for Bishop review).

---

## BLOCK 2 · Auth-Gate Audit — All Routes

**GOAL:** Build a verified audit table of every auth-gated route across Hugo + Electron + platform, with Ghost World disposition for each.

Knight reads `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\onboarding.tsx` (already read by Bishop SEG) and all other route files to compile the full gate list.

### B2-1. Read all route files

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\index.ts
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\onboarding.tsx     ← already read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\dashboard.tsx      ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\production.tsx     ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\initiatives.tsx    ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\hexisle.tsx        ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\social.tsx         ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\commerce.tsx       ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\cephas.tsx         ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\tools.tsx          ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\admin.tsx          ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\captain.tsx        ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\defense.tsx        ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\redCarpet.tsx      ← read
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\routes\misc.tsx           ← read
```

### B2-2. Build the audit CSV

Output a CSV file to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\AUTH_GATE_AUDIT_GHOST_WORLD_BP092.csv`

Columns:
```
route_path, gate_type, page_component, ghost_world_disposition, action_required
```

`gate_type` values:
- `ProtectedRoute` — hard redirect to `/auth` if no user
- `CaptainRoute` — requires captain role
- `ExplorerRoute` — allows ghost view, shows bottom-bar join nudge (Ghost World compliant)
- `OPEN` — no gate
- `PORTAL_GATED` — portal group check in AppRouter (not per-route auth)

`ghost_world_disposition` values:
- `KEEP` — legitimate member-only action gate (e.g., `/first-steps` wallet setup, `/invite` generator)
- `OPEN` — should be open per Ghost World canon (read-only content)
- `REVIEW` — Bishop/Founder must confirm

Known from Bishop SEG gadget (onboarding.tsx):
- `/first-steps` → ProtectedRoute → KEEP (member action: wallet setup)
- `/invite` → ProtectedRoute → KEEP (member action: invite generation)
- `/pipeline` → ProtectedRoute → KEEP (member action: Founder pipeline)
- `/onboarding/trickle` → ProtectedRoute → KEEP (member onboarding)
- `/onboarding/status` → ProtectedRoute → KEEP (member status)
- `/agent-onboarding` → ProtectedRoute → KEEP (member action)
- `/join` → OPEN → KEEP (Ghost World: join page is always open, dismiss fixed in B1)
- `/join/creator` → ExplorerRoute → Ghost World compliant (ghost can view)
- `/creators` → ExplorerRoute → Ghost World compliant
- `/crew-call` → ExplorerRoute → Ghost World compliant

Knight fills in all other routes from the remaining route files.

### B2-3. Flag any ProtectedRoute on READ-ONLY content pages

If Knight finds any `ProtectedRoute` wrapping a page that only DISPLAYS content (not performs an action), flag it for removal and replacement with either `OPEN` route or `ExplorerRoute`. Knight does NOT change these without Bishop/Founder ratify — just flags in the CSV with `action_required = OPEN_AFTER_FOUNDER_RATIFY`.

**MIC REPORT — Block 2 close:**
Knight posts: CSV written, total route count, count by gate type, count flagged for disposition review.

---

## BLOCK 3 · Wire 2-Minute Turnkey Join at Every Action-Gate Point

**GOAL:** Per Founder verbatim: "then it asks you if you want to become a member … in a simple, easy, turnkey way so you can say yes, pay for it, and then keep going. 2 minutes, tops." Action-gate points should NOT hard-redirect to `/auth` — they should surface `MembershipGateModal` inline, preserve state, and on join-success resume the original action.

`MembershipGateModal` (`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\MembershipGateModal.tsx`) already has the correct UX. `useGateAction()` hook is the wiring mechanism. The problem is that `ProtectedRoute` bypasses this and hard-redirects.

### B3-1. Modify `ProtectedRoute` to surface inline modal instead of hard redirect (platform only)

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\ProtectedRoute.tsx`

**Current behavior (Ghost World violation):**
```tsx
if (!user) {
  sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
  return <Navigate to="/auth" replace />;
}
```

**Target behavior (Ghost World compliant):**
When `!user`, instead of hard-redirecting to `/auth`, surface `MembershipGateModal` inline over the route content (or a blurred preview of it). On modal "Maybe later" dismiss, user stays on the page in ghost mode. On modal "Join for $5/year" click, navigate to `/join` with `lb_auth_return_path` set — then on post-join deep-link return, route back automatically.

**Implementation pattern:**
```tsx
// In ProtectedRoute, when !user:
const [showGate, setShowGate] = useState(true);

if (!user && showGate) {
  return (
    <>
      {/* Blurred preview of content */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
      <MembershipGateModal
        open={true}
        onClose={() => {
          // "Maybe later" — dismiss and let ghost explore the blurred preview, or navigate back
          if (document.referrer) window.history.back();
          else navigate('/');
        }}
        action={gateContext}
      />
    </>
  );
}
```

**Knight note:** This is a significant behavioral change to `ProtectedRoute`. Knight must:
1. Read ALL places `ProtectedRoute` is used (Bishop SEG found: `/first-steps`, `/invite`, `/pipeline`, `/onboarding/trickle`, `/onboarding/status`, `/agent-onboarding`)
2. Confirm that blurred-preview approach is safe for each (no sensitive data leaking through blur)
3. If any route shows sensitive member data in its page skeleton, keep as `Navigate to="/join"` — NOT to `/auth` (Ghost World canon: join flow, not auth flow)

**Conservative option:** If Knight finds the blurred-preview pattern risky, acceptable minimum is: replace `Navigate to="/auth"` with `Navigate to="/join"` everywhere in `ProtectedRoute`. This at least routes ghost users to the join page (now fixed in B1 to have "Maybe later"), not the `/auth` barrier.

### B3-2. Confirm deep-link return path wiring

After a user joins via Stripe checkout and returns via the `mnemosynec://` deep-link or webhook, `lb_auth_return_path` should route them back to the original action. Verify:
- `sessionStorage.getItem('lb_auth_return_path')` is read on join-success and router navigates to it
- File to check: wherever the join-success redirect logic lives (likely `platform/src/pages/MembershipGate.tsx` or `platform/supabase/functions/handle-membership-webhook/index.ts`)

Flag if broken; do not fix in this session if it requires edge-function changes (those require separate Bishop dispatch).

**MIC REPORT — Block 3 close:**
Knight posts: ProtectedRoute change applied (diff or flagged), return-path wiring confirmed or flagged.

---

## BLOCK 4 · Dual-Price Display (Normal + Member Price) at Priced Items

**GOAL:** Per Founder: "we offer the 'normal' prices and the Member Prices — but you can only purchase C+20 to the degree that you either offer it or purchase credits to back the marks you use."

This block is **SURVEY + STUB only** in this session — do not implement full dual-price display in a quick-fix session. Scope:

### B4-1. Survey priced-item components

Find all places in the platform where prices are displayed to users. Look for:
- `Cost+20%` display logic
- Mark-purchase / Credit-backing checks
- Any place a price amount is rendered to the user

```
grep -r "cost.*20\|C\+20\|marks.*purchase\|credits.*back\|price.*member\|member.*price" platform/src --include="*.tsx" --include="*.ts" -l
```

### B4-2. Output a stub list

Write a single markdown list to the bottom of this dispatch under `## BLOCK 4 STUB — Priced Item Components Found` listing all files discovered. This becomes the input for a future Knight session to implement dual-price display.

Knight does NOT implement dual-price display in this session. Stub only.

**MIC REPORT — Block 4 close:**
Knight posts: N files found containing price display logic, stub list appended.

---

## BLOCK 5 · Deploy All Touched

Knight runs the standard deploy gate for every file touched:

**Platform (lianabanyan.com):**
- `platform/src/pages/MembershipGate.tsx` — modified
- `platform/src/components/ProtectedRoute.tsx` — modified (or flagged)
- `platform/src/components/MembershipGateModal.tsx` — read-only (no change)

**Hugo (mnemosynec.org / lianabanyan.com static):**
- `Cephas/cephas-hugo/layouts/join/list.html` — read-only (no change)
- `Cephas/cephas-hugo/content/join/_index.md` — read-only (no change)

**Electron app:**
- No Electron renderer or main files changed in this session (Option A path). The CTA flow is fixed by fixing the landing page.

**Deploy gate checklist:**
- [ ] `npm run build` (platform) — zero TypeScript errors
- [ ] `npm run typecheck` if separate from build
- [ ] Hugo build: `hugo --minify` in `Cephas/cephas-hugo/` — zero errors
- [ ] Platform deploy: `npx supabase functions deploy` for any edge-function changes (only if B3-2 required edge function edits)
- [ ] Hugo deploy: Firebase or Netlify per Knight toolchain
- [ ] Smoke-test: visit `https://lianabanyan.com/join` → confirm "Maybe later" button visible, confirm BP085 copy displayed

**MIC REPORT — Block 5 close:**
Knight posts: build output (pass/fail), deploy confirmation.

---

## BLOCK 6 · Build + Ship v0.6.1

**GOAL:** Bundle this fix with the already-staged `KNIGHT_QUICK_FIX_M22_REALTIME_WS_TRANSPORT_V061_BP092.md` WS-transport fix into a single v0.6.1 build, if Founder approves bundle (Bishop recommends yes).

### B6-1. If BUNDLED (Bishop recommendation):

1. Knight reads `KNIGHT_QUICK_FIX_M22_REALTIME_WS_TRANSPORT_V061_BP092.md` at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` to confirm WS-transport fix scope and any Electron files touched.
2. Confirm no file overlap between the two fixes (WS-transport is likely `src/main/` relay code; this fix touches `platform/src/` only → zero overlap expected).
3. Combine into a single `v0.6.1` version bump commit.
4. Update `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\version_trust.json` → `"version": "0.6.1"`.
5. Ship.

### B6-2. If SEPARATE (Founder override):

This fix ships as a platform-only hotfix (no Electron version bump). WS-transport fix ships as the v0.6.1 Electron build separately.

### B6-3. Update CHANGELOG

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\CHANGELOG.md`

Add entry under new `## v0.6.1` header:
```
### Ghost World UX Fix (BP092)
- MembershipGate page now Ghost World compliant: "Maybe later" dismiss added, BP085-ratified copy applied
- Removed auth-barrier redirect from MembershipGate join flow
- ProtectedRoute updated: action gates surface inline modal (not hard /auth redirect)
- Auth-gate audit CSV generated: AUTH_GATE_AUDIT_GHOST_WORLD_BP092.csv
```

**MIC REPORT — Block 6 close:**
Knight posts: v0.6.1 shipped, version_trust.json updated, CHANGELOG updated, deploy receipt.

---

## OPEN QUESTIONS FOR FOUNDER REVIEW

1. **Bundle with WS-transport fix into single v0.6.1?** Bishop recommends YES. Founder may override to separate.
2. **Scope: Hugo + platform only, or add Electron in-app modal (Option B)?** Bishop recommends Option A first (fix landing page), Option B is a future enhancement. Founder may override to Option B if 2-minute turnkey requires full in-app modal.
3. **ProtectedRoute change: blurred-preview + modal, or conservative Navigate to="/join"?** Bishop recommends conservative navigate-to-join as minimum; blurred preview is enhanced Ghost World UX but requires more testing.
4. **`create-membership-checkout` edge function: requires auth token?** Knight gadgets this in B1-3. If YES, Bishop will draft a separate Knight dispatch for unauthenticated Stripe checkout flow.
5. **Worktree collision with M23 UI Citadel?** M23 touches `src/renderer/`. This fix (Option A) touches only `platform/src/`. **Zero collision if Option A.** If Founder chooses Option B (in-app modal in renderer), collision risk with M23 is HIGH — serialize: this fix before M23.

---

## WALL-CLOCK ESTIMATE

- Option A (Hugo + platform only, Bishop recommendation): **1.5–2.5 hrs Knight**
- Option B (adds Electron in-app modal): **3–5 hrs Knight**
- Bundled with WS-transport: add 0.5 hrs

---

## FILES KNIGHT WILL EDIT (Option A)

| File | Change |
|---|---|
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages\MembershipGate.tsx` | Add dismiss button, replace title+benefits with BP085 copy, remove auth-guard in handlePayment (pending B1-3 edge-function verify) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\ProtectedRoute.tsx` | Replace `Navigate to="/auth"` with `Navigate to="/join"` (conservative) or inline modal (enhanced) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\CHANGELOG.md` | Add v0.6.1 entry |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\download\version_trust.json` | If bundled: bump to 0.6.1 |

**Read-only (no edit):**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanShell.tsx`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\MembershipGateModal.tsx`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\join\list.html`

---

## BLOCK 4 STUB — Priced Item Components Found

Survey grep (BP092) — UI components for future dual-price (Normal + Member / C+20) session. Excludes tests/scripts.

- `platform/src/components/CostPlusBadge.tsx`
- `platform/src/components/CostPlusJourneyWidget.tsx`
- `platform/src/components/CostPlusCertificationForm.tsx`
- `platform/src/components/C20BalanceDisplay.tsx`
- `platform/src/components/JouleToC20Converter.tsx`
- `platform/src/components/BountyPaymentToggle.tsx`
- `platform/src/components/BusinessListing.tsx`
- `platform/src/components/GroceryBoxConfigurator.tsx`
- `platform/src/components/v2/crew-call/CostPlusTransparencyPanel.tsx`
- `platform/src/components/v2/membership/CreatorEconomicsExample.tsx`
- `platform/src/components/turnkey/TurnKeyWizard.tsx`
- `platform/src/components/turnkey/TurnKeyProjectDetail.tsx`
- `platform/src/components/crew/CrewBackingFlow.tsx`
- `platform/src/components/crew/CrewFulfillment.tsx`
- `platform/src/pages/CPlus20Dashboard.tsx`
- `platform/src/pages/C20PilotDashboard.tsx`
- `platform/src/pages/C20Leaderboard.tsx`
- `platform/src/pages/MembershipDashboard.tsx`
- `platform/src/pages/MSAPage.tsx`
- `platform/src/pages/MarketplaceV2Page.tsx`
- `platform/src/pages/StorefrontDetailPage.tsx`
- `platform/src/pages/PreOrderFlow.tsx`
- `platform/src/pages/ProductCatalog.tsx`
- `platform/src/pages/CatalogProductDetail.tsx`
- `platform/src/pages/RestaurantDetailPage.tsx`
- `platform/src/pages/RideshareRoutes.tsx`
- `platform/src/pages/museum/PrintStudioPage.tsx`
- `platform/src/pages/museum/ProducerBoardPage.tsx`
- `platform/src/pages/hub/AIModelsHubPage.tsx`
- `platform/src/lib/costPlusService.ts`
- `platform/src/lib/c20Service.ts`
- `platform/src/lib/c20ReciprocityService.ts`
- `platform/src/hooks/useCreateTurnKey.ts`
- `platform/src/hooks/useEarnings.ts`

**Total grep hits (incl. tests/lib/data):** ~130 files — full list available on request.

---

## RECEIPT

Bishop SEG Sonnet 4.6 · BP092 · 2026-06-22
Composed: YES · Fired: NO · Awaiting Founder ratify.
