# KNIGHT YOKE — BP080 — v0.1.53 — CUE CARD PEERS + EMAIL INVITE
**DRAFT · Founder ratify required before ship**
**Date: 2026-06-11 · Bishop: Sonnet 4.6 · Scope: SEG-V0153-P0/P1/VERIFY/SHIP**

---

## WAKE-UP PROMPT (paste this first into a fresh Knight session)

You are Knight, the implementer for the Liana Banyan / MnemosyneC platform. Bishop has researched the codebase. Your job is to implement the Cue Card Peers + Email Invite feature for MnemosyneC v0.1.53. ALL work uses Sonnet 4.6 SEGs. You do not self-stamp SHIP gates. Runtime evidence required before marking any SEG complete. Read this entire prompt before starting any work.

---

## CONTEXT: FOUNDER VISION (verbatim 2026-06-11)

> "What if, when you want to connect, it shows you Cue Deck Cards of People who are available? And if you want to invite, like I want to invite him, I can just send him a Cue Deck Card invitation to his email? That way, it makes it work the way we would like it to. Right? and that is all built anyway, in the battery dispatch, but we just want to do the ONE thing there."

The ONE thing: wire the already-built `federationGenerateInvite` token path so that instead of generating a token for manual copy-paste, it wraps the token in a Cue Card visual and sends it to an email address the Founder types. Simultaneously, render the already-discovered peer list (currently plain `PeerRow` list) as Cue Deck Cards so peers look inviting, not technical.

---

## GADGET FINDINGS (Bishop verified, 2026-06-11)

### Cue Deck Card System
- **Escape Velocity Site** (web platform): `Escape Velocity Site/src/components/cue-cards/CueCardFlip.tsx` — full 3D flip card with front/back, CSS perspective, accentColor prop. Self-contained, no platform dependencies. **Portable to desktop renderer if CSS classes are adapted (inline styles preferred in renderer — it uses inline styles throughout).**
- **Platform web app** (`platform/src/components/cue-cards/`): `CueCardCampaignCard.tsx`, `InviteCreatorCard.tsx`, `CueCardDeck.tsx`, `WeNeedYouCard.tsx`, `BecomeAStewardCard.tsx` — web app components using Tailwind + shadcn. NOT directly usable in the Electron renderer (different build pipeline).
- **Desktop renderer** (`src/renderer/components/`): `WelcomeCueCard.tsx` — a simple navigation card matching the inline-styles aesthetic used throughout the renderer. This is the right visual pattern to follow for new peer cards. `DeckCuePullup.tsx` is also present.
- **Conclusion**: Do NOT port CueCardFlip.tsx from Escape Velocity Site. Build `PeerCueCard.tsx` inline-styles component matching WelcomeCueCard.tsx visual language. Simple card with: name/ID, transport badge (LAN/WAN), phase badge, last-seen, big green "Connect" button.

### Battery Dispatch
- `platform/src/lib/batteryDispatch.ts` — **THIS IS THE WRONG "BATTERY DISPATCH"**. It sends Discord webhook embeds for bounty announcements. It is NOT an email system. It is NOT connected to the Electron desktop app at all. It lives in the web platform (Supabase-backed).
- `platform/src/lib/outboundDispatch.ts` — Outbound Dispatch Queue (Founder stamp → queue → dispatch). Has `email` as a `DispatchChannel` type but the actual send is NOT implemented in the Electron app. The dispatch queue writes to Supabase `outbound_dispatch` table; a separate edge function would execute the send. **Not wired in the desktop app.**
- **Conclusion: Battery Dispatch email send is NOT built in the Electron desktop app. The Founder's reference to "all built in battery dispatch" means the concept/architecture is designed. The actual email send leg for the desktop invite flow must be built.**

### Email Outbound — What Is Actually Wired
- `platform/src/lib/resendEmailTemplates.ts` — Resend API payload builder, template renderer. **Supabase web platform only.** Not in Electron.
- `platform/src/hooks/useSendEmail.ts` — calls `supabase.functions.invoke('send-transactional-email', ...)`. **Supabase web platform only.** Not in Electron.
- **In Electron main process** (`src/main/`): NO email send code exists. No SMTP, no Resend, no nodemailer, no SendGrid, no AWS SES. Zero.
- **Best available path for email from desktop**: Use `shell.openExternal('mailto:...')` — this opens the OS default email client pre-filled with the invite card content + token + accept link. This is the correct MVP path: zero API keys, zero secrets, works immediately.
- **V2 path (v0.1.54+)**: Supabase Edge Function `send-transactional-email` already exists in the web platform. Wire from Electron via `fetch()` to the Supabase function URL with the SUPABASE_ANON_KEY (already stored in the app). This would enable silent background email send. Scope this as P1.

### Peer Profile Data Model
- `src/shared/federation-protocol.ts`: `MnemosynePeer` = `{ peerId, displayName?, address, port, transport ('lan'|'wan-relay'), phase ('discovered'|'identified'|'ratified'|'synced'|'error'), lastSeen, recordCount?, relaySessionId? }`. **Present and complete.**
- No `email` field on peer. Display name comes from `displayName` (set at announce time) or falls back to `peerId.slice(0,8)`.

### Existing Federation UI (FederationTab.tsx)
- Location: `src/renderer/components/FederationTab.tsx`
- Has 4 tabs: Mesh (SVG visualizer), Roster (plain rows), Invite (generate token → copy-paste), Accept (paste token → verify).
- Invite tab: `InviteFlow` component calls `window.amplify.federationGenerateInvite()` → gets `{token, expiresAt}` → shows token for copy-paste. **No email field. No card visual.**
- Accept tab: paste token → `window.amplify.federationAcceptInvite(token)`.
- IPC handlers in `src/main/index.ts`: `federation:generate-invite` (mints `mnemo-invite-*` token), `federation:accept-invite` (validates token, initiates handshake). **Both handlers are built and working.**

### The ONE Thing — Actual Gap
The gap is **exactly one wiring**:
1. Add an email input field to `InviteFlow` in `FederationTab.tsx`.
2. On "Send Invite" click: call `federationGenerateInvite()` to get the token, compose a mailto: URI containing the Cue Card content (invite message + accept link `mnemo://accept?token=<token>`) + personal note, call `window.amplify.openExternal('mailto:...')` to hand off to OS mail client.
3. Simultaneously: replace the plain `PeerRow` components in the Mesh/Roster views with `PeerCueCard` components.

That is the ONE thing. The rest is cosmetics + P1.

---

## SCOPE

### SEG-V0153-P0-PEER-CUE-CARDS
**File:** `src/renderer/components/PeerCueCard.tsx` (new file)

Build a new component in the inline-styles pattern of `WelcomeCueCard.tsx`:

```
PeerCueCard({ peer: MnemosynePeer, onConnect: (peerId: string) => void })
```

Visual spec:
- Card ~240px wide, ~160px tall. Dark background `#111827`, border `1px solid #1e2d45`.
- Top: display name (bold, 14px) + transport badge (`🔵 LAN` or `🌐 WAN`) inline.
- Middle: phase badge (color-coded per existing `PHASE_COLOR` map in FederationPeerMeshPanel.tsx), last-seen in human-readable form.
- Bottom: big green "Connect" button (`background: #14532d, border: 1px solid #22c55e, color: #22c55e`) — full width, 8px padding. On click: `onConnect(peer.peerId)` + visible feedback (button text changes to "Connecting…" for 1500ms then "Connected ✓" or resets on error).
- If `peer.phase === 'synced'`: card border glows green (`border-color: #22c55e44`). Button reads "Synced ✓" and is disabled.

Then wire into `FederationTab.tsx`:
- Replace `PeerRow` in the mesh/roster render with `PeerCueCard` in a CSS flex-wrap grid (3 cards per row if width allows, else 1).
- `onConnect` handler: call `window.amplify?.federationAcceptInvite?.(peerId)` — this re-uses the accept handshake path.

### SEG-V0153-P0-INVITE-FORM
**File:** `src/renderer/components/FederationTab.tsx` — modify `InviteFlow` component.

Replace the current "Generate Invite Token → copy-paste" flow with:

```
[ Email address of person you want to invite ]  (text input, placeholder: "their@email.com")
[ Add a personal note (optional) ]              (textarea, max 280 chars, 3 rows)
[ Send Invite Card ]                            (big green primary button)
```

On "Send Invite Card" click:
1. Validate email (basic `/.+@.+\..+/` check — show red error if invalid, visible immediately).
2. Call `window.amplify.federationGenerateInvite()` → `{ token, expiresAt }`.
3. Compose accept link: `mnemo://accept?token=${token}` (deep link handler already exists in `src/main/deep-link-handler.ts`).
4. Compose mailto URI:
   ```
   subject: "You're invited to join my MnemosyneC mesh"
   body: 
     <personalNote if present>\n\n
     I'd like to share context with you via MnemosyneC.\n\n
     Click to accept: mnemo://accept?token=<token>\n\n
     Or paste this token in MnemosyneC → Federation → Accept tab:\n
     <token>\n\n
     This invite expires: <expiresAt human-readable>\n\n
     Get MnemosyneC: https://mnemosynec.ai
   ```
5. Call `window.amplify.openExternal('mailto:' + recipientEmail + '?subject=...&body=...')`.
6. Show confirmation: green success box "Invite opened in your email client. Check your drafts." with the token displayed below for fallback copy.
7. Button shows "Opening email client…" while IPC is in-flight. Reverts to form after 3s.

Keep "Generate Token (manual)" as a collapsible secondary option below for fallback — don't remove it.

### SEG-V0153-P0-RECEIVE-INVITE
**File:** `src/main/deep-link-handler.ts` — verify the `mnemo://accept?token=` path is already wired.

Check line ~3666 in `src/main/index.ts`: deep-link handler for `accept-invite` already exists — it calls `win?.webContents.send('federation:accept-invite', { slug, token })`. **Verify this fires correctly when the OS opens a `mnemo://accept?token=X` URI from the email client.**

If the deep link is correctly registered (check `src/main/index.ts` for `app.setAsDefaultProtocolClient('mnemo')`) — no new code needed for receive path.

If NOT registered: add `app.setAsDefaultProtocolClient('mnemo')` in index.ts near app startup.

Additionally: the Accept tab in FederationTab.tsx already listens for `federation:accept-invite` IPC push — verify `ipcRenderer.on` side is wired in preload.ts. If not, add it.

### SEG-V0153-P0-BATTERY-DISPATCH-WIRE
**STATUS: SCOPE-ONLY for v0.1.53. Do NOT attempt to wire Resend or SMTP in this version.**

The Founder's "all built in battery dispatch" refers to the architectural concept. The actual email send from the desktop app is NOT built. The MVP is `shell.openExternal('mailto:...')` as specified in SEG-V0153-P0-INVITE-FORM.

**V0.1.54 path** (flag for next yoke): wire `fetch()` from the Electron renderer to `https://<supabase-project>.supabase.co/functions/v1/send-transactional-email` with the existing `SUPABASE_ANON_KEY`. The payload would be `{ email: recipientEmail, type: 'peer_invite', data: { token, expiresAt, senderName, personalNote } }`. This requires adding a new email template to `resendEmailTemplates.ts` and a new type to `useSendEmail.ts` — but those live in the web platform, not the Electron app. Knight: FLAG THIS to Founder as the v0.1.54 upgrade path.

### SEG-V0153-P1-CUE-CARD-MEMORY
**File:** `src/renderer/components/FederationTab.tsx` — new "Sent Invites" section.

After an invite is sent, persist to localStorage under key `mnemosynec.sent_invites`:
```json
[{ "recipientEmail": "...", "token": "mnemo-invite-...", "expiresAt": "...", "sentAt": "...", "personalNote": "..." }]
```

Render at bottom of Invite tab as a compact history list: email · sent date · expires · phase (pending/accepted/expired). Cap at 20 entries. This is the social-graph receipt.

Phase detection: when a peer comes online whose displayName or peerId matches the sent invite token (heuristic: cross-reference `lastSeen` timing vs `sentAt`), upgrade status to "accepted". This is best-effort, not cryptographic.

### SEG-V0153-VERIFY
**Runtime evidence required before SEG-V0153-P0-INVITE-FORM is marked complete:**
1. Build `npm run build` — zero TypeScript errors.
2. Package: `npm run dist` or `electron-builder --win`.
3. Founder: install the .exe, open Federation tab, type a real email address (e.g. secondary Gmail), click "Send Invite Card".
4. Confirm: OS default email client opens with pre-filled To: address + subject + body containing token + mnemo:// link.
5. Confirm: success confirmation appears in the app ("Invite opened in your email client").
6. Optional WAN test with son: Founder sends invite to son's email → son installs → pastes token in Accept tab → confirm handshake.

**Screenshot of step 4 required as yoke-return evidence.**

### SEG-V0153-SHIP
DRAFT ONLY. THREE SHIP GATES before Founder ratify:
- GATE 1: TypeScript compiles clean.
- GATE 2: Packaged installer builds successfully.
- GATE 3: Runtime verify screenshot showing OS email client opened with invite (step 4 above).
Knight does NOT self-stamp SHIP. Return DRAFT with gate evidence.

---

## FILE MAP

| File | Action |
|------|--------|
| `src/renderer/components/PeerCueCard.tsx` | CREATE — new inline-styles peer card component |
| `src/renderer/components/FederationTab.tsx` | MODIFY — InviteFlow (add email+note fields + mailto send), PeerRow → PeerCueCard |
| `src/main/index.ts` | CHECK — verify `app.setAsDefaultProtocolClient('mnemo')` exists; add if missing |
| `src/main/preload.ts` | CHECK — verify deep-link accept-invite listener is wired on renderer side |

**DO NOT TOUCH:**
- `src/shared/federation-protocol.ts` — MnemosynePeer type is complete, no changes needed
- `src/main/federation/` — discovery engine is working, no changes needed
- `platform/src/lib/batteryDispatch.ts` — Discord webhooks, not email, not in scope
- `platform/src/lib/outboundDispatch.ts` — web platform only, not in scope

---

## HARD BINDINGS

- ALL SEGs use **Sonnet 4.6** verbatim — no exceptions, no Opus on main.
- **Reuse > rebuild**: `WelcomeCueCard.tsx` visual pattern for `PeerCueCard.tsx`. Do not port CueCardFlip from Escape Velocity Site.
- **Every click visible feedback**: "Send Invite Card" button must show state change immediately on click (no silent clicks).
- **§4 secrets blacklist**: No SMTP credentials, no API keys in source. mailto: approach requires zero credentials.
- **Runtime evidence required**: Screenshot of email client opening before GATE 3 passes.
- **DRAFT only until Founder explicit ratify**.
- **No self-stamp of SHIP gates**.
- **§2 Truth-Always**: If the deep-link `mnemo://` protocol registration is missing, say so — don't assume it works.

---

## OPEN FOUNDER DECISIONS (flag in yoke-return)

1. **Email send approach**: mailto: (OS client, zero infra, works now) vs Supabase Edge Function silent send (v0.1.54, requires SUPABASE_ANON_KEY wired in Electron + new email template). Bishop recommends mailto: for v0.1.53, Edge Function for v0.1.54. Founder confirms?

2. **Peer Cue Card "Connect" action**: Currently `federationAcceptInvite(peerId)` is the proposed wiring — but that expects a token, not a peerId. For discovered peers (already known via mDNS/relay), the connect action should probably be a new IPC handler `federation:connect-peer` that calls the handshake directly. Knight: investigate `src/main/federation/federation_client.ts` for the correct call. Bishop did not read that file. Flag if a new IPC handler is needed.

3. **V0.1.54 silent email**: After Founder confirms v0.1.53 ships, ratify whether to wire Supabase Edge Function email for background send in v0.1.54. This would let "Send Invite Card" send silently without opening a mail client.

---

## BLACK MAMBA BLOCK (paste into fresh Knight session)

```
You are Knight for Liana Banyan / MnemosyneC. Use Sonnet 4.6 SEGs for ALL work. You are implementing BP080 v0.1.53 Cue Card Peers + Email Invite.

CORE FILES:
- Desktop renderer: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\FederationTab.tsx
- Desktop renderer: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\FederationPeerMeshPanel.tsx
- Shared types: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\shared\federation-protocol.ts
- Preload: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\preload.ts
- Main index: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts (lines ~2680-2690 for federation IPC)
- Visual pattern: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\WelcomeCueCard.tsx

WHAT TO BUILD:
1. PeerCueCard.tsx — new inline-styles card component for discovered peers (MnemosynePeer)
2. Modify FederationTab.tsx InviteFlow — add email + note fields + mailto: send via window.amplify.openExternal
3. Check deep-link mnemo:// protocol registration in index.ts

CONSTRAINTS:
- Inline styles only (no Tailwind/shadcn in renderer)
- Every click must show visible feedback
- No API keys, no SMTP — mailto: for email send in v0.1.53
- DRAFT only — 3 SHIP gates, Knight does not self-stamp
- Runtime screenshot evidence required for GATE 3

Return yoke with: files changed, TypeScript compile result, screenshot of OS email client opening.
```

---

*Bishop staged: 2026-06-11 · READY-FOR-RATIFY · Founder explicit "ship it" required before Knight receives this yoke.*

---

## ADDENDUM 1 — FOUNDER RATIFY + GENESIS-USER + INFLUENCER REUSE (2026-06-11)

**Source:** Founder strategic ratify, verbatim 2026-06-11. Bishop gadget sweep complete. §2 Truth-Always findings embedded below.

---

### DESIGN PATTERN RATIFIED (Cue Card front/back)

- **FRONT** = brand / identity: medallion visual + FounderDenken stamp + FounderDenken vCard QR (pointing to ledger entry — see Genesis Mint below). Account display name (NOT necessarily real name) as inviter identity.
- **BACK** = action: MnemosyneC mark + Dr. MnemosyneC mascot + invite-acceptance QR + scan instruction.
- **Mobile fallback:** stacked image pair (front image above back image) — NOT flip-card animation. Flip card is Escape Velocity Site only. Renderer gets the stacked pair.
- **Name personalization:** REQUIRED on the back — "[Recipient Name]'s MnemosyneC network" or equivalent. Recipient name field on the invite form. Account `display_name` (profiles.display_name — present in baseline schema) goes on FRONT as inviter identity.

---

### INFLUENCER HANDLE / HASHTAG OVERRIDE

**Gadget finding (1b):** No dedicated `influencer_handle` or `hashtag` field exists on `profiles` or `member_profiles`. What DOES exist:

- `profiles.display_name` (text, nullable) — the account display name Founder ratified as the inviter identity field.
- `profiles.creator_type` (enum: physical/art/food/music/business) — marks creator accounts.
- `creator_handle` (text) — exists in a separate baseline table linked to cue card destinations (see `create_cue_card_destination` RPC, `p_display_name` param), NOT on `profiles` directly.
- `access_source = 'influencer'` — exists as an enum value in `battery_dispatch_access` (web platform only, not in Electron).
- `CreatorRedCarpet.tsx` uses a route param `/:handle` — handle is URL-path-derived, not persisted on profile.

**Implication for Knight:** Use `profiles.display_name` as the influencer's override field. If `display_name` starts with `@` (e.g., `@FounderDenken`) or contains a `#` (hashtag), render it verbatim on the FRONT of the card in place of full name. No new schema column needed for v0.1.53. Flag to Founder that a dedicated `influencer_handle` column on `member_profiles` should be added in a future migration if influencer program expands.

---

### MEMBERSHIP-GATE ON INVITES — §2 TRUTH-ALWAYS FINDING (1c)

**Finding: `federation:generate-invite` has NO membership check. Invites are completely free to generate.**

Source: `src/main/index.ts` line 2681:
```
safeHandle('federation:generate-invite', (): { token: string; expiresAt: string } => {
    const nonce = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
    const raw = `${getStablePeerId()}:${nonce}:${expiresAt}`;
    const token = `mnemo-invite-${Buffer.from(raw).toString('base64url')}`;
    return { token, expiresAt };
});
```

No `isMember()` check, no `auth` guard, no Supabase lookup. Token minted from local `getStablePeerId()` and a random nonce. **Anyone who has the app installed can generate an invite, regardless of membership status.** This is correct and good for adoption — Founder ratified "do not have to be a member to send."

Knight verifies this in yoke-return and confirms the finding stands or flags any gate added since this sweep.

---

### FOUNDERDENDKEN vCARD QR — USER 000001 GENESIS MINT

**Gadget finding (1a + 1d): What is actually built.**

**BUILT — Production IP Ledger:**
- File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ip_ledger\ip_ledger_store.ts`
- Architecture: append-only JSONL at `~/.lb_substrate/ip_ledger/ledger.jsonl`. Federal Body Cam doctrine — entries never updated, never deleted. Supersedes-chain for correction.
- `registerClaim({ registered_by, claim, claim_body, evidence, category })` — fully functional.
- `category` includes `'provisional'` — exactly right for filing entries.
- `registered_by` = cooperative-substrate `member_id` (BLOOD RULE: never real name directly — use account display_name or member_id).
- `BlockchainExplorer.tsx` (Escape Velocity Site) uses a SEPARATE hash-chain system in Supabase (`project_modules` table, `verify_module_chain` RPC) — this is for project integrity, NOT for identity/member minting.

**NOT BUILT — User 000001 Genesis Mint:**
- No "first user" sequence, no `user_number` field, no `000001` special designation anywhere in the schema.
- No flow that mints Founder into the IP Ledger as User 000001 with linked provisional filings.
- The 21 provisional filings exist in `Asteroid-ProofVault/` and in MEMORY.md canon but are NOT linked to any IP Ledger entry.
- The `FounderDenken vCard QR` does not exist as a generated artifact anywhere.

**This is new scope — SEG-V0153-P0-GENESIS-MINT (below).**

---

### SEG-V0153-P0-GENESIS-MINT (Sonnet 4.6) — NEW SCOPE

**Purpose:** Mint Founder as User 000001 in the existing IP Ledger. Generate FounderDenken vCard QR pointing to that ledger entry. This is the founding moment of the cooperative.

**Primitive to use:** `registerClaim()` in `src/main/ip_ledger/ip_ledger_store.ts`. This is the correct and only production immutable ledger in the Electron app. Do NOT use the Escape Velocity Site `BlockchainExplorer` / `project_modules` chain — that is for project integrity, not identity.

**Implementation steps:**

1. **Add a one-time genesis check** in `src/main/index.ts` at app startup (after `ensureLedgerDir()`): check if any entry with `claim === 'genesis:user:000001'` already exists in the ledger. If not, and if this is Founder's machine (heuristic: `getStablePeerId()` === stored founder_peer_id, or simply: first boot with no prior genesis entry), mint it.

2. **Genesis entry payload:**
   ```ts
   registerClaim({
     registered_by: 'member_000001',  // canonical cooperative ID — display_name set separately
     claim: 'genesis:user:000001',
     claim_body: JSON.stringify({
       display_name: 'FounderDenken',  // or whatever account name Founder ratifies
       cooperative_role: 'founder',
       provisional_filings: 21,        // per BP070 canon
       filing_refs: [
         'LB-PROV-001 through LB-PROV-021',
         'USPTO App #64/079,336 (most recent, 2026-06-01)'
       ],
       cooperative_name: 'MnemosyneC',
       genesis_timestamp: new Date().toISOString(),
     }),
     evidence: [
       'Asteroid-ProofVault/BP070_CLOSE_STAMP.md',
       'USPTO App #64/079,336 filed 2026-06-01',
     ],
     category: 'provisional',
   });
   ```

3. **Expose genesis entry via IPC:** Add `safeHandle('ip-ledger:get-genesis', () => loadAllEntries().find(e => e.claim === 'genesis:user:000001') ?? null)` in `src/main/index.ts`. Add corresponding `window.amplify.ipLedgerGetGenesis()` to `src/main/preload.ts`.

4. **vCard QR generation:**
   - Add `qrcode` npm package (already present in `platform/`; check if in Electron's `package.json` — if not, `npm install qrcode` in root).
   - Build a vCard 3.0 string:
     ```
     BEGIN:VCARD
     VERSION:3.0
     FN:FounderDenken
     ORG:MnemosyneC Cooperative
     URL:https://mnemosynec.ai/member/000001
     NOTE:User 000001 · Ledger entry: genesis:user:000001 · 21 provisional filings · MnemosyneC cooperative founder
     END:VCARD
     ```
   - Generate QR code as base64 PNG via `qrcode.toDataURL(vcardString, { width: 300, margin: 2 })`.
   - Add `safeHandle('ip-ledger:founder-vcard-qr', async () => { ... return base64PNG; })`.

5. **Wire to Cue Card FRONT:** The FRONT of the invite Cue Card shows this QR. Knight wires the vCard QR into the `PeerCueCard` FRONT render (or the invite card FRONT if Founder is the inviter). On the mailto: invite send, include the QR as an attachment reference or a link to `https://mnemosynec.ai/member/000001` as the fallback (since base64 PNG can't go in mailto: body).

**Founder action required before mint:** Confirm the `display_name` to use on the genesis entry. Options: `FounderDenken`, account email-derived name, or whatever Founder uses as account name. Knight stages the SEG as DRAFT and surfaces this choice in yoke-return before writing the ledger.

**Runtime evidence required:** Knight returns the `ledger_id` of the genesis entry and a screenshot of the generated QR code. Founder visually confirms before SHIP gate.

---

### RECOMMENDATION: SPLIT v0.1.53

**Recommendation: SPLIT into v0.1.53a and v0.1.53b.**

- **v0.1.53a** (ship first, lower risk): PeerCueCard display + email invite mailto flow (SEG-V0153-P0-PEER-CUE-CARDS + SEG-V0153-P0-INVITE-FORM + SEG-V0153-P0-RECEIVE-INVITE). Self-contained, no new schema, no ledger writes. Three ship gates already defined. Can ship quickly.

- **v0.1.53b** (Genesis Mint + vCard QR): SEG-V0153-P0-GENESIS-MINT. Writes to the production IP Ledger — an IRREVERSIBLE append-only write. Founder should confirm the display_name and review the genesis entry payload BEFORE Knight executes. One wrong write to the ledger cannot be deleted (only superseded). This warrants its own careful ratify cycle.

**Rationale for split:** The Genesis Mint is a founding moment. Federal Body Cam doctrine means it cannot be undone. It deserves its own READY-FOR-RATIFY stage with Founder explicitly reviewing the `claim_body` payload. Mixing it into a UI polish release increases risk of a rushed entry.

**If Founder prefers combined:** Knight can execute both in sequence within one session, staging the genesis entry for Founder review BEFORE writing it (output the payload to BISHOP_DROPZONE for Founder confirmation, then execute on go-ahead).

---

### §2 TRUTH-ALWAYS FLAGS FOR FOUNDER

1. **BlockChain TestNet "By Design"**: The Escape Velocity Site has a real Supabase-backed hash-chain (`project_modules` + `verify_module_chain` RPC + `BlockchainExplorer.tsx`). This is for project-module tamper detection, not identity minting. The correct "By Design" path for Founder's IP is the **IP Ledger** (`ip_ledger_store.ts`) — append-only JSONL, Federal Body Cam doctrine, already in production in the Electron app. These are two different systems. Knight uses the IP Ledger for Genesis Mint.

2. **No influencer handle field on profile**: `profiles.display_name` is the right field to use for influencer override in v0.1.53. A dedicated `influencer_handle` column does not exist yet. This is a gap if the influencer program expands — flag for a future migration.

3. **21 provisional filings are NOT yet in the ledger**: They exist in MEMORY.md and Asteroid-ProofVault but have zero IP Ledger entries. The Genesis Mint SEG fixes this — but only for the genesis summary entry. Individual filing entries (one per provisional) would be a separate SEG.

4. **vCard QR requires `qrcode` package in Electron**: Confirm it is in `LianaBanyanPlatform/package.json` before Knight runs `registerClaim`. If missing, Knight adds it. This is a new npm dependency.

---

*Addendum 1 appended by Bishop · 2026-06-11 · Gadget sweep complete · Founder ratify required before Knight receives Genesis Mint scope.*

---

## ADDENDUM 2 — MEMBER ID ARCHITECTURE + SENDER ANONYMITY (2026-06-11)

**Source:** Founder architectural decision verbatim 2026-06-11. Bishop gadget sweep complete. §2 Truth-Always findings embedded below.

---

### CANONICAL MEMBER ID ARCHITECTURE (Founder-ratified 2026-06-11)

**Rule:** Member ID = immutable anchor. Display name + email = mutable proxies resolving through Member ID. Either proxy can change without breaking the identity link or history.

**What "Member ID" is in the current codebase (§2 Truth-Always):**

The term `memberId` appears in multiple contexts — they are NOT all the same thing:

1. **`MemberInfo.user_id`** (from `src/main/auth_manager.ts` line 59) — the Supabase `auth.users` UUID returned from `lianabanyan.com/api/amplify/validate`. This is the **current canonical Member ID anchor** for authenticated members. It is immutable (Supabase auth UID never changes for a given account). `display_name` and `email` are mutable fields on `MemberInfo`, persisted locally at `~AMPLIFY Computer/auth.json`.

2. **`getStablePeerId()`** (from `src/main/federation/peer-discovery.ts` line 206) — the local mesh peer ID. Stable per machine install; used for federation/mesh routing. NOT the same as Member ID — a member can have multiple peer IDs across machines.

3. **`memberId` in `WanAddressContext`** (from `caithedral-core/src/dns/wan_soccerball_address.ts`) — a UUID passed INTO the soccerball derivation as an input. This is the `user_id` / Member ID that the caller supplies. The `wanSoccerballId` OUTPUT of `deriveWanSoccerballAddress()` is a **session-rotating address** (expires in 24h, rotates each session) — it is NOT a stable Member ID. It is a privacy-preserving session transport handle.

**Verdict:** The immutable Member ID anchor is `MemberInfo.user_id` (Supabase auth UUID). The Soccerball SID (`wanSoccerballId`) is a session transport handle that USES the Member ID as an input ingredient — it is not the Member ID itself.

**Mutable proxy storage (current):**
- `display_name`: `MemberInfo.display_name` — stored in `~AMPLIFY Computer/auth.json` (local) and on `profiles.display_name` in Supabase (remote)
- `email`: `MemberInfo.email` — stored in `~AMPLIFY Computer/auth.json` (local) and in Supabase auth record (remote)
- Both are returned from `/api/amplify/validate` on each sign-in — mutable, can be updated without changing `user_id`

---

### CUE CARD INVITE — MEMBER ID ARCHITECTURE APPLIED

**Invite QR encodes:** `invite_token` + sender Member ID (`user_id`) as reference — NOT raw email. Token already includes `getStablePeerId()` + nonce + expiry (see `federation:generate-invite` handler in index.ts line 2681). Member ID linkage added as a separate field in the QR payload or in the mailto: body.

**Email TO field at send time:** Recipient's current email, entered fresh by sender in the invite form. This is the mutable proxy value at the moment of send — it is NOT persisted as the permanent identity. At handshake time, when the recipient installs and connects, their `user_id` (Member ID) becomes the durable link.

**Card FRONT — sender identity is OPTIONAL:**
- Default: "Sign this card" toggle = **ON** (recommended default — personal invites convert better than anonymous ones)
- When ON: show sender's `display_name` (from `MemberInfo.display_name`) on the FRONT. Do NOT show raw email or `user_id`. Display name is the human-readable proxy.
- When OFF: FRONT shows "from a friend" or simply omits sender identity entirely. Card remains valid — invite token still works.
- UI: checkbox or small toggle below the email input field: `[ ✓ ] Sign this card with my name (FounderDenken)` — label pulls from `window.amplify.getAuthState().member.display_name`.

**Card BACK — recipient personalization is REQUIRED:**
- Inviter MUST provide recipient's display name (or handle/hashtag for influencer use).
- Field label: "Recipient's name (how you know them)" — placeholder: "e.g. Alex, @alexhandle"
- Renders on back: "Scan to join [Recipient Name]'s MnemosyneC network"
- No Member ID required for recipient at send time — they don't have one yet if they're being invited. The name is purely a personalization field.

---

### v0.1.53a IMPLEMENTATION DELTA (Knight amends SEG-V0153-P0-INVITE-FORM)

**Add to invite form fields (in addition to existing email + note):**

```
[ ✓ ] Sign this card (your name: {display_name})   ← checkbox, default ON
[ Recipient's name ]                                ← text input, required, max 60 chars
```

**Amend mailto: body composition:**

If "Sign this card" = ON:
```
From: {display_name} via MnemosyneC
```
If "Sign this card" = OFF:
```
From: a friend via MnemosyneC
```

Recipient name goes in subject line:
```
subject: "{recipient_name}, you're invited to join MnemosyneC"
```

**QR content on card back (for v0.1.53a — mailto: path):**
Since this is mailto: (no server), the "QR" is the token rendered as a deep-link URL for display:
```
mnemo://accept?token={token}
```
No Member ID encoding needed at this stage — the token itself is the bearer credential. Member ID association happens server-side at first sign-in post-accept. Flag to Founder: v0.1.54 Supabase silent-send path can encode sender Member ID in the payload for richer handshake attribution.

---

### §2 TRUTH-ALWAYS FLAGS FOR KNIGHT

1. **`wanSoccerballId` is NOT a stable Member ID.** It is a 24h-expiring session transport handle. Do NOT use it as a persistent identity key on invite cards or QR codes. Use `MemberInfo.user_id` (the Supabase UUID) for any identity anchor that needs to survive across sessions.

2. **No `profiles.member_id` column exists as a separate field.** The Supabase auth `user_id` IS the member ID. The `profiles` table has `display_name`, `creator_type`, and related fields — not a separate `member_id` column. `user_id` foreign-keys to `auth.users.id`.

3. **`display_name` source for "Sign this card" label:** Pull from `window.amplify.getAuthState()?.member?.display_name`. If null/undefined (unauthenticated or trial user), fall back to the first segment of their email or simply "you". Knight handles this gracefully — do not crash if `display_name` is missing.

4. **Recipient name field is new scope** — not in original SEG-V0153-P0-INVITE-FORM spec. Knight adds it to the form as a REQUIRED field with a clear validation message if empty: "Please enter the recipient's name so they know who this is from."

---

*Addendum 2 appended by Bishop · 2026-06-11 · BP080 · Member ID architecture ratified · Founder explicit "ship it" required before Knight receives this yoke.*

---

## ADDENDUM 3 — REJECTION-COOLDOWN ANTI-SPAM (2026-06-11)

**Source:** Founder verbal ratify 2026-06-11. §2 Truth-Always. Canon filed at [[reference_rejection_cooldown_anti_spam_canon_bp080]].

---

### FOUNDER RULE (verbatim)

> "abuse will be penalized like can be rejected, and if so, then ... they have to wait an extra 5 min to send the next one. cumulative. This makes you think maybe the people you send to will want them. More curation."

Additional Founder ratify:
- "Sign this card" default: **ON** ✓
- Visible identity on signed cards: **Display name ONLY** (never UUID) ✓

---

### NEW SEG — SEG-V0153A-P1-REJECTION-COOLDOWN (Sonnet 4.6)

This SEG is added to the v0.1.53a parallel wave. Wave is now **5 parallel SEGs** (was 4).

---

#### (a) Rejection capture — three surfaces

**Surface 1 — Email link:**
- Every invite email body includes a `Not interested` link.
- Link fires a POST to Supabase Edge Function `wan-relay-reject`.
- New function: `supabase/functions/wan-relay-reject/index.ts`.
- Payload: `{ invite_token: string, source: 'email_link' }`.
- Function decodes sender_user_id from token, increments `member_rejection_summary.total_rejections`, inserts row into `member_rejection_log`, recomputes `cooldown_until`.

**Surface 2 — In-app reject button:**
- Received-invite UI (Accept tab in FederationTab.tsx) shows a secondary "Not interested" dismiss button alongside the Accept button.
- On click: IPC `federation:reject-invite` → main process → POST to same `wan-relay-reject` Edge Function with `source: 'in_app'`.
- Visible feedback: button changes to "Dismissed" for 1500ms then hides the invite card.

**Surface 3 — Spam mark (deferred):**
- Not capturable in v0.1.53a (mailto: path, no bounce webhook).
- Defer to v0.1.54 when Supabase silent-send is live and email provider can push complaint events.
- Knight flags this in yoke-return.

---

#### (b) Per-sender rejection counter — Supabase schema (new migration)

Knight creates a new Supabase migration file. Schema:

```sql
-- Per-rejection event log (append-only, never delete)
CREATE TABLE IF NOT EXISTS member_rejection_log (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id        uuid NOT NULL REFERENCES auth.users(id),
  recipient_email_hash  text NOT NULL,   -- sha256(recipient_email) — never store raw email
  rejected_at           timestamptz NOT NULL DEFAULT now(),
  source                text NOT NULL    -- 'email_link' | 'in_app' | 'spam_mark'
);

-- Denormalized summary for fast cooldown gate lookup
CREATE TABLE IF NOT EXISTS member_rejection_summary (
  sender_user_id   uuid PRIMARY KEY REFERENCES auth.users(id),
  total_rejections integer NOT NULL DEFAULT 0,
  last_rejection_at timestamptz,
  cooldown_until   timestamptz   -- = last_rejection_at + (total_rejections * interval '5 minutes')
);
```

Edge Function `wan-relay-reject` upserts `member_rejection_summary` on each event:
```ts
cooldown_until = last_rejection_at + (new_total * 5 * 60 * 1000)  // ms
```

---

#### (c) Cooldown gate — `federation:generate-invite` IPC handler

In `src/main/index.ts`, BEFORE the `safeHandle('federation:generate-invite', ...)` token mint:

1. Call Supabase to fetch `member_rejection_summary` for the authenticated `user_id`.
2. If `cooldown_until` is set and `cooldown_until > Date.now()`:
   - Return `{ ok: false, error: 'cooldown', wait_seconds: Math.ceil((cooldown_until - Date.now()) / 1000) }`.
   - Do NOT mint a token.
3. If no cooldown or expired: proceed with existing token mint, return `{ ok: true, token, expiresAt }`.

**Handling unauthenticated senders (trial users):** `federation:generate-invite` currently has no auth gate. If `getAuthState()` returns no `user_id`, the cooldown check is skipped (no Supabase lookup possible). This is acceptable for v0.1.53a — the email link rejection capture will not function for unauthenticated senders either. Flag to Founder as a known gap.

---

#### (d) UX — invite form cooldown display

In `FederationTab.tsx` `InviteFlow`, after calling `federationGenerateInvite()`:

- If response is `{ ok: false, error: 'cooldown', wait_seconds }`:
  - Show inline banner (red/amber): `"You can send your next invite in X minutes"`.
  - Disable "Send Invite Card" button until cooldown expires.
  - Use `setInterval` (60s tick) to count down live and re-enable button when `wait_seconds` reaches 0.
  - Do NOT re-fetch from Supabase on each tick — compute expiry locally from the `wait_seconds` value returned at gate-hit time.

- On cooldown expiry: button re-enables, banner disappears, no page reload required.

---

#### (e) Bishop recommendation — cooldown decay (OPEN FOUNDER DECISION)

Founder did not specify whether rejection count decays over time. Bishop recommends:

**-1 from `total_rejections` every 30 days of zero new rejections.**

This gives reformed senders a path back to good standing. Implemented as a scheduled Supabase function or a decay check at gate time: `effective_rejections = total_rejections - floor(days_since_last_rejection / 30)`, min 0.

**Founder ratify options:**
1. **No decay** — rejections accumulate forever. Simpler. Harsher.
2. **Slow decay** (Bishop rec) — -1 per 30 clean days.
3. **Manual reset only** — sender contacts support for appeal.

Knight surfaces this choice in yoke-return. Default implementation: **no decay** (safest, simplest) unless Founder ratifies option 2 or 3 before Knight executes the migration.

---

#### Per [[reference_six_pillars_cue_deck_card_canon_bp080]] — "Good. Fast. Cheap. MnemosyneC gives you all six."

This gate directly serves the **Good** pillar: the network stays high-signal because senders self-curate. Cooperative, not extractive — recipients hold real power over who reaches them.

---

### UPDATED FILE MAP (additions from Addendum 3)

| File | Action |
|------|--------|
| `supabase/functions/wan-relay-reject/index.ts` | CREATE — Edge Function, rejection counter increment |
| `supabase/migrations/YYYYMMDD_rejection_cooldown.sql` | CREATE — `member_rejection_log` + `member_rejection_summary` tables |
| `src/main/index.ts` | MODIFY — cooldown gate before `federation:generate-invite` token mint |
| `src/renderer/components/FederationTab.tsx` | MODIFY — cooldown banner + countdown in InviteFlow; "Not interested" button in Accept tab |

---

*Addendum 3 appended by Bishop · 2026-06-11 · BP080 · Rejection-cooldown anti-spam · Founder explicit "ship it" required before Knight receives this yoke.*

---

## ADDENDUM 4 — COOLDOWN DECAY + VISUAL ASSETS (2026-06-11)

**Source:** Founder ratify 2026-06-11. Bishop direct read of `resources/cue-card/` directory. §2 Truth-Always.

---

### COOLDOWN DECAY — FOUNDER RATIFIED

**Option 2 RATIFIED:** -1 from cumulative rejection total every 30 days of zero new rejections.

**Canon:** `reference_rejection_cooldown_anti_spam_canon_bp080.md` updated with this rule.

**Implementation instruction for Knight (amends SEG-V0153A-P1-REJECTION-COOLDOWN section (e)):**

Replace "Default implementation: no decay" with the ratified decay rule:

**Decay formula (ratified):**
```
effective_rejections = MAX(0, total_rejections - FLOOR(days_since_last_rejection / 30))
```

Implemented in the Edge Function `wan-relay-reject/index.ts` cooldown-gate calculation AND in the `federation:generate-invite` IPC gate check:

```ts
// At cooldown gate time:
const daysSinceLast = (Date.now() - last_rejection_at_ms) / 86_400_000;
const effectiveRejections = Math.max(0, total_rejections - Math.floor(daysSinceLast / 30));
const cooldownMs = effectiveRejections * 5 * 60 * 1000;
const cooldownUntil = last_rejection_at_ms + cooldownMs;
const onCooldown = effectiveRejections > 0 && Date.now() < cooldownUntil;
```

The Supabase `member_rejection_summary.cooldown_until` column stores the RAW (no-decay) value. The decay adjustment is computed at gate time, not persisted — this avoids requiring a background job to update the column.

**UX note:** When a sender's effective count is 0 (fully decayed), show no cooldown message even if `total_rejections > 0` in the DB. The sender has earned clean status.

---

### VISUAL ASSETS — STAGED (§2 Truth-Always)

The following assets are confirmed present at `C:\Users\Administrator\Documents\LianaBanyanPlatform\resources\cue-card\`:

| File | Purpose in PeerCueCard.tsx |
|------|---------------------------|
| `DenkenXoff.png` | Default / off state — Denken mascot stamp for card FRONT |
| `DenkenXOn.png` | Active / on state — Denken mascot stamp when peer is connected or card is hovered |
| `DenkenXoffHover.png` | Hover state — transition between off and on |
| `ShipInHarbor2ndSecond.jpg` | Medallion visual for card FRONT (Ship In Harbor = "a ship in harbor is safe but that is not what ships are for") |

**Knight instruction — PeerCueCard.tsx asset integration:**

1. Load assets via Electron's `file://` protocol or as inline `require()` imports (pattern already used in other renderer components — check `WelcomeCueCard.tsx` for the correct import pattern).

2. **Card FRONT visual hierarchy:**
   - Background: `ShipInHarbor2ndSecond.jpg` as card background or top-band image (crop to 240×80px band at card top)
   - Stamp overlay: `DenkenXoff.png` default; swap to `DenkenXOn.png` on `phase === 'synced'` or on hover (`onMouseEnter`/`onMouseLeave`)
   - Hover transition: `DenkenXoffHover.png` as intermediate (swap sequence: off → hover on mouseenter, hover → on after 150ms, revert on mouseleave)

3. **QR strip on invite card FRONT (FounderDenken only):**
   - When `peer.displayName === 'FounderDenken'`, replace DenkenX stamp with `qrcode.react` `<QRCodeSVG>` rendering the vCard string (64×64px, no margin). This is the on-device-display path; no PNG file needed in the renderer.
   - All other peers: use DenkenXoff/On/Hover stamp sequence above.

4. **Knight: strip embedded QR from `ShipInHarbor2ndSecond.jpg` before use as medallion background** — the source file may contain an embedded QR code watermark. For the MnemosyneC Cue Card use, Knight crops or masks any embedded QR from the image to avoid visual confusion with the vCard QR. Use CSS `object-fit: cover` + `object-position: center top` to show the ship image while cropping any lower-band watermark.

5. **Invite card visual (the card that goes in the email):** For v0.1.53a (mailto: path), the "card" is rendered text + token in the email body — no image attachment (mailto: cannot attach files). The visual card exists ONLY in-app (PeerCueCard.tsx). Flag to Founder: v0.1.54 Supabase silent-send path can embed the card as an HTML email template with these assets as hosted URLs.

---

### UPDATED FILE MAP (additions from Addendum 4)

| File | Action |
|------|--------|
| `src/renderer/components/PeerCueCard.tsx` | MODIFY — integrate DenkenXoff/On/Hover + ShipInHarbor2ndSecond medallion; FounderDenken QR path |
| `resources/cue-card/DenkenXoff.png` | READ-ONLY source asset |
| `resources/cue-card/DenkenXOn.png` | READ-ONLY source asset |
| `resources/cue-card/DenkenXoffHover.png` | READ-ONLY source asset |
| `resources/cue-card/ShipInHarbor2ndSecond.jpg` | READ-ONLY source asset — Knight strips/masks embedded QR via CSS |

---

*Addendum 4 appended by Bishop · 2026-06-11 · BP080 · Cooldown decay ratified (Option 2) + visual assets staged · Founder explicit "ship it" required before Knight receives this yoke.*
