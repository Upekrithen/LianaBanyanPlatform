# KNIGHT YOKE · IN-APP MEMBERSHIP PURCHASE · v0.5.x · BP085

**Issued by:** Bishop (Sonnet 4.6 SEG dispatched BP085)
**Date:** 2026-06-17
**Yoke class:** Feature — In-App Cooperative Membership Onboarding
**Composes with:**
- Membership-Fix Yoke (Stripe webhook + Cephas link) — MUST LAND GREEN FIRST
- Help Tab Yoke (`KNIGHT_YOKE_HELP_TAB_COPY_PASTE_PIPELINE_BP085.md`) — this yoke TAKES PRECEDENCE on member-button placement

---

## PREAMBLE — SONNET 4.6 MANDATE (BP084 CANON · VERBATIM)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## MISSION BRIEF

Founder direct BP085: Users must be able to join the cooperative and pay **$5/yr** from inside the downloaded MnemosyneC Electron app. Friction = lost members. The website path (`lianabanyan.com/join`) remains, but the in-app path is PRIMARY for installed users.

**Flow summary:**
1. User sees "Become a Member · $5/yr" button (persistent top-bar + Help tab CTA + onboarding step — all three surfaces)
2. Click → `shell.openExternal(url)` opens `lianabanyan.com/join?source=mnemosynec-app&user_id=<local_peer_id>` in default browser
3. User pays via Stripe Checkout
4. Stripe webhook fires → Membership-Fix yoke handles member record creation (MUST BE GREEN FIRST)
5. Supabase Edge Function `membership-callback-mnemosynec` mints one-time token → redirects browser to `mnemosynec://membership-active?member_id=...&token=...`
6. Electron custom protocol handler catches URL → validates token vs Supabase `member_profiles` → sets `is_member: true` locally → fires toast "Welcome to the Cooperative" + grants initial 100 Marks
7. Ship v0.5.2 patch

**Secrets-blacklist canon (BP081 BLOOD):** No token values EVER logged to client telemetry, console, or Sentry. Path references only. Tokens validated server-side and consumed in one round-trip.

**Truth-Always:** Every async step wrapped in try/catch. No silent swallow. Errors surface to user as actionable toast ("Membership couldn't activate automatically — tap here to refresh" → calls `/membership-status` endpoint).

**BP083 restart canon:** After registering the custom protocol handler, display a one-time notice: "Close and reopen MnemosyneC to enable the membership return link." Do NOT block the user — show it as a dismissible info toast.

---

## SEG DISPATCH TABLE

| SEG | Name | Responsibility | Return Sharp |
|-----|------|---------------|-------------|
| SEG-1 | Recon | Map Electron structure, locate tab framework, decide all placement anchors | Sharp-1: placement map confirmed |
| SEG-2 | Member Button | Add "Become a Member · $5/yr" to top-bar + Help tab + Onboarding | Sharp-2: button visible in all 3 surfaces |
| SEG-3 | External Link | Wire `shell.openExternal` with peer_id param | Sharp-3: browser opens correct URL with peer_id |
| SEG-4 | Protocol Handler | Register `mnemosynec://` in main process, handle return URL, activate local member-state | Sharp-4: return URL caught + member-state flips + toast fires |
| SEG-5 | Edge Function | `membership-callback-mnemosynec` — mint token, redirect to protocol URL | Sharp-5: Edge Function deployed, token consumed in ≤1 use |
| SEG-6 | Smoke Test + Ship | End-to-end flow verification, 5 Sharps GREEN, cut v0.5.2 | Sharp-6: v0.5.2 ships GREEN |

---

## SEG-1 · RECON — ELECTRON STRUCTURE + PLACEMENT MAP

**Spawn:** Sonnet 4.6 SEG

**Mission:** Map the MnemosyneC Electron codebase to locate all anchors needed for this yoke.

**Find and report:**

1. **Main process entry** — likely `src/main/index.ts` or `electron/main.ts`. Confirm path.
2. **Renderer entry** — likely `src/renderer/` or `src/app/`. Confirm path.
3. **Tab framework (BP083 Tab UX Option B)** — single row + Regular/Advanced toggle + per-tab pin/hide. Locate the tab container component. Is Help tab already wired (per Help Tab Yoke)? Report component file path.
4. **Top-bar / title-bar area** — locate the persistent top-bar component if it exists, OR the window chrome area where a persistent button can sit. Report file path and slot availability.
5. **Onboarding flow** — locate onboarding step components. Identify the last onboarding step (or a "You're all set" screen) as the injection point for a member CTA.
6. **Local state store** — locate where peer-local state is persisted (likely `electron-store`, `lowdb`, or a JSON file in `app.getPath('userData')`). Confirm the key used for user identity (likely `peer_id` or `local_peer_id`). This is what we pass as `user_id` in the Stripe URL param.
7. **Existing `is_member` flag** — does one exist? If yes, report where. If no, report where to add it.
8. **Auto-update mechanism** — confirm which Electron auto-updater is in use (`electron-updater`, `update-electron-app`, custom). Flag any `app.setAsDefaultProtocolClient` calls already present that could conflict.

**Return to Knight:**
- File paths for: main process, renderer, tab container, top-bar, onboarding final step, local state store
- Existing `peer_id` key name
- Existing `is_member` flag path or "NONE"
- Auto-updater package name
- Any conflicts with existing protocol registration
- Recommended placement: confirm ALL THREE (top-bar persistent + Help tab CTA + onboarding step) are viable, or flag blockers

**Sharp-1:** "Placement map confirmed — [top-bar: FILE:LINE] [Help tab: FILE:LINE] [onboarding: FILE:LINE] [peer_id key: KEY_NAME] [is_member: EXISTS/NONE] [auto-updater: PACKAGE]"

---

## SEG-2 · MEMBER BUTTON — THREE-SURFACE PLACEMENT

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-1 Sharp-1

**Mission:** Add "Become a Member · $5/yr" button to all three surfaces. All three are required — maximum surface area = maximum member conversion.

### 2A. Top-Bar Persistent Button

Insert into the top-bar component (path from SEG-1). The button must:
- Be visible on EVERY screen, not hidden behind tabs
- Text: **"Become a Member · $5/yr"** (verbatim, dot separator)
- Style: accent color, small/compact so it doesn't crowd navigation
- Conditional: HIDE this button if `is_member === true` (don't show to existing members)
- On click: call the `openMembershipCheckout()` function (wired in SEG-3)

```tsx
// Example shape — adapt to actual component framework in use
{!isMember && (
  <button
    className="member-cta-topbar"
    onClick={openMembershipCheckout}
    title="Join the Cooperative — $5/yr"
  >
    Become a Member · $5/yr
  </button>
)}
```

### 2B. Help Tab CTA

In the Help tab component (path from SEG-1, per Help Tab Yoke), add a dedicated membership section:

```tsx
// Place ABOVE existing help content so it's the first thing seen
{!isMember && (
  <section className="membership-cta-section">
    <h3>Become a Member</h3>
    <p>
      Join the cooperative for <strong>$5/yr</strong>. Members earn Marks,
      vote on Guild decisions, and help each other help ourselves.
    </p>
    <button className="member-cta-primary" onClick={openMembershipCheckout}>
      Become a Member · $5/yr
    </button>
  </section>
)}
{isMember && (
  <section className="membership-status-section">
    <p>✓ You are a member of the cooperative.</p>
  </section>
)}
```

### 2C. Onboarding Final Step CTA

On the last onboarding screen ("You're all set" or equivalent), add membership CTA BELOW the primary completion message:

```tsx
<div className="onboarding-member-nudge">
  <p>Want to do more? Join the cooperative for $5/yr.</p>
  <button className="member-cta-secondary" onClick={openMembershipCheckout}>
    Become a Member · $5/yr
  </button>
  <button className="skip-link" onClick={dismissOnboarding}>
    Maybe later
  </button>
</div>
```

**Do NOT block onboarding completion on membership.** "Maybe later" always advances.

**Sharp-2:** "Member button live in all 3 surfaces — top-bar: [FILE:LINE] Help-tab: [FILE:LINE] onboarding: [FILE:LINE]. Hidden for existing members: YES."

---

## SEG-3 · EXTERNAL LINK — `shell.openExternal` WITH PEER_ID

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-1 Sharp-1

**Mission:** Implement `openMembershipCheckout()` function that all three buttons call. Wire `shell.openExternal` so the Stripe checkout URL includes the local peer_id.

### Implementation

In the renderer, use IPC to request the peer_id from the main process (never expose local state store directly to renderer in Electron). Then call `shell.openExternal`.

**Main process handler (ipcMain):**

```typescript
// In main process — ipcMain handlers file
import { ipcMain, shell } from 'electron'
import Store from 'electron-store' // or whichever store is in use

const store = new Store()

ipcMain.handle('membership:open-checkout', async () => {
  try {
    const peerId = store.get('peer_id') as string | undefined
    if (!peerId) {
      throw new Error('peer_id not found in local store')
    }
    const url = new URL('https://lianabanyan.com/join')
    url.searchParams.set('source', 'mnemosynec-app')
    url.searchParams.set('user_id', peerId)
    await shell.openExternal(url.toString())
    return { ok: true }
  } catch (err) {
    // Surface error — never silent swallow (Truth-Always canon)
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
})
```

**Renderer function (preload-exposed or via contextBridge):**

```typescript
// openMembershipCheckout — called by all three button surfaces
async function openMembershipCheckout() {
  try {
    const result = await window.electronAPI.openMembershipCheckout()
    if (!result.ok) {
      showToast(`Couldn't open membership page: ${result.error}`, 'error')
    }
  } catch (err) {
    showToast('Membership page could not open. Please visit lianabanyan.com/join', 'error')
  }
}
```

**contextBridge exposure (preload.ts):**

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // ...existing entries...
  openMembershipCheckout: () => ipcRenderer.invoke('membership:open-checkout'),
})
```

**Sharp-3:** "shell.openExternal wired — URL confirmed as `lianabanyan.com/join?source=mnemosynec-app&user_id=<peer_id>`. IPC handler at [FILE:LINE]. Preload exposed at [FILE:LINE]. Manual click test: browser opened with correct URL: YES."

---

## SEG-4 · CUSTOM PROTOCOL HANDLER — `mnemosynec://` RETURN PATH

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-1 Sharp-1 (auto-updater package name, any existing protocol conflicts)

**Mission:** Register `mnemosynec://` as a custom protocol in Electron main process. Handle the return URL `mnemosynec://membership-active?member_id=...&token=...` to activate local member-state.

### Windows Protocol Registration

On Windows, `app.setAsDefaultProtocolClient` registers the protocol in the registry at install time. This must be called EARLY in the main process before `app.isReady()` or in the `ready` handler.

```typescript
// In main process — early in initialization
import { app, ipcMain } from 'electron'
import Store from 'electron-store'

const store = new Store()

// Register custom protocol — Windows
if (process.platform === 'win32') {
  app.setAsDefaultProtocolClient('mnemosynec')
}

// Handle protocol URL on second-instance (Windows passes URL as argv on second launch)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Windows: URL is the last element of commandLine
    const protocolUrl = commandLine.find(arg => arg.startsWith('mnemosynec://'))
    if (protocolUrl) {
      handleMembershipReturn(protocolUrl)
    }
    // Bring existing window to foreground
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Also handle if app was launched fresh via protocol (not second-instance)
app.on('ready', () => {
  const protocolUrl = process.argv.find(arg => arg.startsWith('mnemosynec://'))
  if (protocolUrl) {
    // Wait for window to be ready before handling
    app.once('browser-window-created', () => {
      setTimeout(() => handleMembershipReturn(protocolUrl), 1000)
    })
  }
})
```

### Protocol URL Handler

```typescript
async function handleMembershipReturn(url: string) {
  try {
    const parsed = new URL(url)
    // Expected: mnemosynec://membership-active?member_id=...&token=...
    if (parsed.hostname !== 'membership-active') {
      return // Not our URL — ignore
    }

    const memberId = parsed.searchParams.get('member_id')
    const token = parsed.searchParams.get('token')

    if (!memberId || !token) {
      showRendererToast('Membership activation link was incomplete. Please contact support.', 'error')
      return
    }

    // Validate token against Supabase — DO NOT log token value (BP081 BLOOD)
    const validationResult = await validateMembershipToken(memberId, token)

    if (validationResult.ok) {
      // Activate local member-state
      store.set('is_member', true)
      store.set('member_id', memberId)
      store.set('member_activated_at', new Date().toISOString())

      // Fire toast and grant initial Marks (via IPC to renderer)
      showRendererToast('Welcome to the Cooperative!', 'success')
      notifyRendererMemberActivated({ memberId, initialMarks: 100 })
    } else {
      showRendererToast(
        `Membership couldn't activate automatically — ${validationResult.reason}. Visit lianabanyan.com/join to check your status.`,
        'error'
      )
    }
  } catch (err) {
    // Never silent swallow
    const message = err instanceof Error ? err.message : String(err)
    showRendererToast(`Membership activation error: ${message}`, 'error')
  }
}
```

### Token Validation (calls Supabase)

```typescript
async function validateMembershipToken(
  memberId: string,
  token: string
): Promise<{ ok: boolean; reason?: string }> {
  try {
    // Call Supabase Edge Function to validate + consume token
    // NEVER log token value — pass it only in the POST body over HTTPS
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/membership-callback-mnemosynec/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ member_id: memberId, token }),
      }
    )
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { ok: false, reason: body.error ?? `HTTP ${response.status}` }
    }
    const data = await response.json()
    return { ok: data.valid === true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: message }
  }
}
```

### Restart Notice (BP083 canon)

After registering the protocol for the FIRST TIME (detect via `store.get('protocol_registered')`), show a one-time dismissible info toast:

```typescript
if (!store.get('protocol_registered')) {
  store.set('protocol_registered', true)
  // Queue toast after window ready
  showRendererToast(
    'Membership return link registered. Close and reopen MnemosyneC once to activate it.',
    'info'
  )
}
```

### Auto-Updater Compatibility Note

`app.setAsDefaultProtocolClient('mnemosynec')` writes to HKCU registry and does NOT conflict with `electron-updater` NSIS/Squirrel update mechanics. However: if the app uses Squirrel (legacy), the protocol must also be registered in the Squirrel `--squirrel-install` handler. Knight SEG: check auto-updater package from SEG-1 and add Squirrel handler if needed.

**Sharp-4:** "Protocol handler registered — `mnemosynec://` at [FILE:LINE]. Return URL parsed at [FILE:LINE]. Token validation call at [FILE:LINE]. Member-state flip confirmed: `store.set('is_member', true)` at [FILE:LINE]. Toast + Marks grant wired at [FILE:LINE]. Restart notice: YES."

---

## SEG-5 · SUPABASE EDGE FUNCTION — `membership-callback-mnemosynec`

**Spawn:** Sonnet 4.6 SEG
**Depends on:** Membership-Fix Yoke GREEN (member records must exist in `member_profiles` before this function is useful)

**Mission:** Deploy a Supabase Edge Function that:
1. Is called by the Stripe checkout SUCCESS page (or a redirect landing page at `lianabanyan.com/join/success`)
2. Mints a **one-time-use token** bound to the `member_id`
3. Stores token hash (NOT plaintext) in a `membership_activation_tokens` table with `expires_at` (15 minutes from mint)
4. Redirects the browser to `mnemosynec://membership-active?member_id=...&token=...`
5. Exposes a `/validate` sub-route that the Electron app calls to verify + consume the token

### Table: `membership_activation_tokens`

```sql
-- Run via psql (BP084 canonical subshell pattern)
CREATE TABLE IF NOT EXISTS membership_activation_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL,        -- SHA-256 of the plaintext token
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  consumed_at   TIMESTAMPTZ,          -- NULL = unused, non-NULL = consumed
  UNIQUE (token_hash)
);

-- Index for fast lookup on validate
CREATE INDEX IF NOT EXISTS idx_mat_member_id ON membership_activation_tokens(member_id);
CREATE INDEX IF NOT EXISTS idx_mat_token_hash ON membership_activation_tokens(token_hash);
```

### Edge Function: `membership-callback-mnemosynec/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // server-side only
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  const url = new URL(req.url)

  // --- Route: POST /validate (called by Electron app) ---
  if (req.method === 'POST' && url.pathname.endsWith('/validate')) {
    try {
      const { member_id, token } = await req.json()
      if (!member_id || !token) {
        return new Response(JSON.stringify({ valid: false, error: 'Missing params' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const tokenHash = await hashToken(token)
      const now = new Date().toISOString()

      // Find token: must match hash, not yet consumed, not expired
      const { data: row, error } = await supabase
        .from('membership_activation_tokens')
        .select('id, consumed_at, expires_at')
        .eq('member_id', member_id)
        .eq('token_hash', tokenHash)
        .single()

      if (error || !row) {
        return new Response(JSON.stringify({ valid: false, error: 'Token not found' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (row.consumed_at !== null) {
        return new Response(JSON.stringify({ valid: false, error: 'Token already used' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (new Date(row.expires_at) < new Date(now)) {
        return new Response(JSON.stringify({ valid: false, error: 'Token expired' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Consume token — one-time use
      await supabase
        .from('membership_activation_tokens')
        .update({ consumed_at: now })
        .eq('id', row.id)

      return new Response(JSON.stringify({ valid: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ valid: false, error: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // --- Route: GET / (called by Stripe success page redirect or lianabanyan.com/join/success) ---
  // Expected query params: member_id (set by Stripe checkout metadata via success_url)
  if (req.method === 'GET') {
    try {
      const memberId = url.searchParams.get('member_id')
      if (!memberId) {
        return new Response('Missing member_id', { status: 400 })
      }

      // Verify member exists in member_profiles
      const { data: member, error: memberError } = await supabase
        .from('member_profiles')
        .select('id')
        .eq('id', memberId)
        .single()

      if (memberError || !member) {
        return new Response('Member not found', { status: 404 })
      }

      // Mint one-time token (plaintext — only sent once in the redirect URL)
      // NEVER stored plaintext — only the hash persists
      const tokenBytes = new Uint8Array(32)
      crypto.getRandomValues(tokenBytes)
      const plainToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')
      const tokenHash = await hashToken(plainToken)

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

      const { error: insertError } = await supabase
        .from('membership_activation_tokens')
        .insert({ member_id: memberId, token_hash: tokenHash, expires_at: expiresAt })

      if (insertError) {
        // Fallback: redirect to website membership status page
        return Response.redirect(`https://lianabanyan.com/join/success?member_id=${memberId}&app=error`, 302)
      }

      // Redirect to custom protocol — browser will hand this to Electron
      const protocolUrl = `mnemosynec://membership-active?member_id=${encodeURIComponent(memberId)}&token=${encodeURIComponent(plainToken)}`
      return Response.redirect(protocolUrl, 302)
    } catch (err) {
      return new Response(String(err), { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
```

### Stripe checkout success_url

When creating the Stripe Checkout Session (via existing Membership-Fix webhook infrastructure), set:

```
success_url: https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/membership-callback-mnemosynec?member_id={CHECKOUT_SESSION_METADATA_MEMBER_ID}
```

Knight SEG: coordinate with Membership-Fix Yoke owner to ensure `member_id` is embedded in Stripe Checkout Session metadata and reflected in the `success_url` template.

**Sharp-5:** "Edge Function `membership-callback-mnemosynec` deployed — URL: [FUNCTION_URL]. Table `membership_activation_tokens` migrated: YES. Token hash-only storage confirmed: YES. `/validate` route tested: token consumed on first call, rejected on second call: YES. Stripe `success_url` param coordinated with Membership-Fix Yoke: YES."

---

## SEG-6 · SMOKE TEST + SHIP v0.5.2

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-2 Sharp-2, SEG-3 Sharp-3, SEG-4 Sharp-4, SEG-5 Sharp-5

**Mission:** End-to-end smoke test of the complete membership flow. All 5 upstream Sharps must be GREEN before this SEG fires. Ship v0.5.2.

### Smoke Test Checklist

**Step 1 — Button visibility:**
- [ ] Launch MnemosyneC v0.5.2 build locally
- [ ] "Become a Member · $5/yr" visible in top-bar
- [ ] "Become a Member · $5/yr" visible in Help tab
- [ ] Run onboarding from scratch — member CTA appears on final step with "Maybe later" skip
- [ ] "Maybe later" advances onboarding without blocking

**Step 2 — External link fires:**
- [ ] Click top-bar button → default browser opens `lianabanyan.com/join?source=mnemosynec-app&user_id=<actual_peer_id>`
- [ ] Confirm `source=mnemosynec-app` present in URL (not empty)
- [ ] Confirm `user_id` value matches peer_id in local store (inspect store via dev tools)

**Step 3 — Stripe flow (test mode):**
- [ ] Complete Stripe test checkout using card `4242 4242 4242 4242`
- [ ] Stripe webhook fires → member record created in `member_profiles` (confirm via Supabase dashboard)
- [ ] Stripe `success_url` redirects to Edge Function with `member_id` param

**Step 4 — Protocol return:**
- [ ] Edge Function mints token and fires `302` redirect to `mnemosynec://membership-active?...`
- [ ] Browser prompts "Open MnemosyneC?" (or auto-opens if already registered)
- [ ] MnemosyneC receives `second-instance` event with protocol URL
- [ ] `handleMembershipReturn` fires — confirm in app logs (path only, NO token value in logs)
- [ ] Token validate call returns `{ valid: true }`
- [ ] `store.get('is_member')` === `true`
- [ ] Toast "Welcome to the Cooperative!" appears
- [ ] Top-bar member button DISAPPEARS (hidden for existing members)

**Step 5 — Token one-time-use:**
- [ ] Re-open the same `mnemosynec://` URL manually → validate call returns `{ valid: false, error: 'Token already used' }`
- [ ] App shows fallback error toast (not a crash)

**Step 6 — Version bump:**
- [ ] Bump `package.json` version to `0.5.2`
- [ ] Update `CHANGELOG.md` with: "v0.5.2 · In-App Membership Purchase — Become a Member from inside MnemosyneC"
- [ ] Build + sign Windows NSIS installer
- [ ] Run auto-update smoke: v0.5.0 detects v0.5.2, downloads, installs, reopens

### 5 Sharps GREEN Gate

All 5 upstream Sharps must be reported GREEN in the Knight Yoke-return before SEG-6 ships:

| Sharp | Check |
|-------|-------|
| Sharp-1 | Placement map confirmed |
| Sharp-2 | Button visible in all 3 surfaces |
| Sharp-3 | Browser opens correct URL with peer_id |
| Sharp-4 | Protocol handler fires + member-state activates |
| Sharp-5 | Edge Function deployed, token one-time-use enforced |

**Sharp-6:** "v0.5.2 shipped GREEN — all 5 upstream Sharps GREEN. Smoke test: [PASS/FAIL summary]. Windows build hash: [SHA256]. Auto-update from v0.5.0 confirmed: YES/NO."

---

## 6 SHARPS RETURN TABLE

Knight: populate this table in your Yoke-return before declaring this Yoke closed.

| Sharp | Description | Status | Evidence |
|-------|-------------|--------|----------|
| Sharp-1 | Placement map — file paths + peer_id key + is_member status | ⬜ OPEN | — |
| Sharp-2 | Member button in all 3 surfaces, hidden for existing members | ⬜ OPEN | — |
| Sharp-3 | shell.openExternal with correct URL + peer_id | ⬜ OPEN | — |
| Sharp-4 | Protocol handler registered + member-state activates + toast fires | ⬜ OPEN | — |
| Sharp-5 | Edge Function deployed + one-time token enforced | ⬜ OPEN | — |
| Sharp-6 | v0.5.2 shipped, smoke test GREEN, auto-update confirmed | ⬜ OPEN | — |

---

## COMPOSITION NOTES

### vs. Membership-Fix Yoke (IN FLIGHT — MUST LAND GREEN FIRST)
- Membership-Fix handles: Stripe webhook → `member_profiles` record creation → Cephas confirmation page
- This Yoke DEPENDS ON Membership-Fix: SEG-5 assumes `member_profiles` rows exist when `membership-callback-mnemosynec` fires
- Coordination point: Stripe `success_url` template. Membership-Fix Yoke may already set `success_url` — Knight must ensure it is updated to route through `membership-callback-mnemosynec` Edge Function rather than a static page
- If Membership-Fix Yoke is NOT green, SEG-5 and SEG-6 CANNOT proceed. Knight must gate on it.

### vs. Help Tab Yoke (`KNIGHT_YOKE_HELP_TAB_COPY_PASTE_PIPELINE_BP085.md`)
- This Yoke TAKES PRECEDENCE on button placement (Founder direct BP085)
- Help Tab Yoke may have placed a membership link already — SEG-2B must check and REPLACE (not duplicate) any existing link with the full-featured `openMembershipCheckout()` IPC call
- Help Tab Yoke's copy pipeline (paste-to-clipboard, source links, etc.) is ADDITIVE to the Help tab and does not conflict with SEG-2B's membership section
- If both yokes are in flight simultaneously, Knight should sequence: Help Tab Yoke lands first (it doesn't touch protocol handler or IPC), then this Yoke layers on top

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

YOKE: In-App Membership Purchase · v0.5.x · BP085
FILE: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_IN_APP_MEMBERSHIP_PURCHASE_V05X_BP085.md

Read the full yoke file before dispatching any SEG.

GATE CHECK BEFORE START:
1. Confirm Membership-Fix Yoke is GREEN (member_profiles records exist in Supabase). If NOT green, pause and report to Bishop.
2. Confirm Help Tab Yoke status — is it landed? Will it conflict with SEG-2B? Report before proceeding.

DISPATCH ORDER:
- SEG-1 (Recon) — first, no dependencies
- SEG-2 + SEG-3 — parallel after SEG-1 Sharp-1 GREEN (both depend on placement map)
- SEG-4 — parallel with SEG-2+SEG-3 after SEG-1 Sharp-1 GREEN (main process work, independent of renderer)
- SEG-5 — after Membership-Fix Yoke GREEN gate confirmed
- SEG-6 — LAST, only after all 5 Sharps GREEN

YOKE-RETURN FORMAT:
- "Sonnet 4.6" verbatim first line
- 6 Sharps table populated (all GREEN or explain any YELLOW/RED)
- Composition status: Membership-Fix Yoke — GREEN/IN-FLIGHT; Help Tab Yoke — LANDED/IN-FLIGHT
- v0.5.2 build hash (Windows)
- Any deferred items (macOS/Linux protocol registration — can follow v0.5.x cycle)
```

---

*Yoke composed by Bishop (Sonnet 4.6 SEG · BP085 · 2026-06-17)*
*Estimated Knight runtime: 90–120 minutes (SEG-1 15m · SEG-2+3+4 parallel 30m · SEG-5 20m · SEG-6 25m)*
