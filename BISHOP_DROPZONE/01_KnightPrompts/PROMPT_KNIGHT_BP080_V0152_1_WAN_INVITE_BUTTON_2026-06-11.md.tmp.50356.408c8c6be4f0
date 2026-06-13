# KNIGHT YOKE · BP080 · v0.1.52.1 · WAN Invite Button
**Issued:** 2026-06-11 · **Bishop:** orchestrator-only · **All SEGs:** Sonnet 4.6

---

## WAKE-UP PROMPT (paste this to Knight first)

Knight, you are picking up a tiny LEAN patch for MnemosyneC v0.1.52.1. The LEAN Gauntlet federation panel (`LeanGauntletTab.tsx`) has a "Connect via Email ID" button that accepts invite tokens but has no way to GENERATE one without DevTools. Founder's son is 5 miles away on a different ISP ready for SEG-WAN-3. Your job: add a "Generate Invite Token" button, relabel the connect button correctly, and polish the panel flow so both directions of the handshake are obvious. Tiny patch — do NOT refactor the federation panel or touch IPC. Use Sonnet 4.6 SEGs for ALL work.

---

## CONTEXT

**File to patch:** `src/renderer/components/LeanGauntletTab.tsx`
(confirmed path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\LeanGauntletTab.tsx`)

**Current state of `LeanFederationPanel` (lines 29–312):**

- State: `connectEmail`, `showEmailForm`, `connectStatus` — no invite-generation state
- Button at line 236–251: labeled "Connect via Email ID", toggles `showEmailForm`
- Email form (line 255–293): label says "Enter the MnemosyneC Email ID of the other machine:", placeholder `peer@example.com`
- Calls `window.amplify?.federationAcceptInvite?.(connectEmail.trim())` at line 88
- `window.amplify.federationGenerateInvite()` is ALREADY WIRED in preload.ts (line 385–386) — returns `{ token: string; expiresAt: string }`
- Reference implementation of generate+copy flow: `src/renderer/components/FederationTab.tsx` lines 201–289 (`InviteFlow` component) — Knight should read this for the exact pattern already proven

**Hard bindings:**
- §3 Sonnet 4.6 for ALL SEGs
- Every click visible feedback — [[feedback_every_click_visible_feedback_canon_bp078]]
- Runtime evidence required — [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]
- DRAFT until Founder explicit ratify
- 3 SHIP gates mandatory (build header verify + content verify + anonymous-download verify)
- Bishop orchestrator-only — no self-stamping
- TINY PATCH: do not refactor, do not touch IPC, do not change GauntletTab or FederationTab

---

## SEG SEQUENCE

### SEG-V0152.1-P0-INVITE-BUTTON (Sonnet 4.6) — run first

**File:** `src/renderer/components/LeanGauntletTab.tsx`

Add invite-generation state to `LeanFederationPanel`:

```typescript
const [inviteToken, setInviteToken] = useState<string | null>(null);
const [inviteExpiry, setInviteExpiry] = useState<string | null>(null);
const [inviteGenerating, setInviteGenerating] = useState(false);
const [inviteCopied, setInviteCopied] = useState(false);
const [inviteError, setInviteError] = useState<string | null>(null);
```

Add `handleGenerateInvite` callback:

```typescript
const handleGenerateInvite = useCallback(async () => {
  if (inviteGenerating) return;
  setInviteGenerating(true);
  setInviteError(null);
  setInviteToken(null);
  setInviteExpiry(null);
  setInviteCopied(false);
  try {
    const result = await window.amplify?.federationGenerateInvite?.();
    if (result?.token) {
      setInviteToken(result.token);
      setInviteExpiry(result.expiresAt ?? null);
    } else {
      setInviteError('Generate failed — no token returned. Try again.');
    }
  } catch (e) {
    setInviteError('Generate error: ' + String(e));
  } finally {
    setInviteGenerating(false);
  }
}, [inviteGenerating]);

const handleCopyInvite = useCallback(async () => {
  if (!inviteToken) return;
  try {
    await navigator.clipboard.writeText(inviteToken);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  } catch {
    setInviteError('Could not copy to clipboard.');
  }
}, [inviteToken]);
```

**UI — add ABOVE the existing action row (line 216), separated by a thin divider:**

```tsx
{/* ── INVITE SECTION ─────────────────────────── */}
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>
    Invite someone to your mesh:
  </div>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
    <button
      onClick={handleGenerateInvite}
      disabled={inviteGenerating}
      style={{
        background: inviteGenerating ? '#1e2a38' : '#2563eb',
        color: inviteGenerating ? '#475569' : '#fff',
        border: 'none',
        borderRadius: 5,
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 600,
        cursor: inviteGenerating ? 'not-allowed' : 'pointer',
        fontFamily: 'system-ui, sans-serif',
        outline: 'none',
      }}
    >
      {inviteGenerating ? 'Generating…' : 'Generate Invite Token'}
    </button>
    {inviteToken && (
      <button
        onClick={handleCopyInvite}
        style={{
          background: inviteCopied ? '#166534' : '#065f46',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          padding: '5px 12px',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          outline: 'none',
        }}
      >
        {inviteCopied ? 'Copied!' : 'Copy Token'}
      </button>
    )}
  </div>
  {inviteToken && (
    <div style={{ marginTop: 8 }}>
      <input
        readOnly
        value={inviteToken}
        onClick={(e) => (e.target as HTMLInputElement).select()}
        style={{
          background: '#070d1a',
          border: '1px solid #1e3a5f',
          borderRadius: 4,
          color: '#6ee7b7',
          fontFamily: 'monospace',
          fontSize: 11,
          padding: '5px 8px',
          width: '100%',
          boxSizing: 'border-box' as const,
          outline: 'none',
        }}
      />
      {inviteExpiry && (
        <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
          Expires: {new Date(inviteExpiry).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · Single-use · do not share publicly
        </div>
      )}
    </div>
  )}
  {inviteError && (
    <div style={{ marginTop: 6, fontSize: 11, color: '#f87171' }}>
      {inviteError} <button
        onClick={handleGenerateInvite}
        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: 11, padding: 0 }}
      >Retry</button>
    </div>
  )}
</div>

{/* ── OR DIVIDER ──────────────────────────────── */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 10,
}}>
  <div style={{ flex: 1, height: 1, background: '#1a2332' }} />
  <span style={{ fontSize: 10, color: '#334155', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
  <div style={{ flex: 1, height: 1, background: '#1a2332' }} />
</div>
```

---

### SEG-V0152.1-P0-RELABEL (Sonnet 4.6) — run with INVITE-BUTTON (parallel ok)

**File:** `src/renderer/components/LeanGauntletTab.tsx`

Two targeted string changes only:

1. Button label line 250: `Connect via Email ID` → `Connect via Invite Token`
2. Form subtitle line 258: `Enter the MnemosyneC Email ID of the other machine:` → `Paste an invite token from the other machine:`
3. Input placeholder line 264: `peer@example.com` → `mnemo-invite-...`
4. Error string line 94: `Check the Email ID and try again.` → `Check the invite token and try again.`

Do NOT change any other text or logic.

---

### SEG-V0152.1-P0-UX-FLOW (Sonnet 4.6) — run after INVITE-BUTTON + RELABEL land

Verify the rendered order inside `expanded` block is:

1. Machine info grid (already at top — keep)
2. Peer list if found (keep)
3. **INVITE SECTION** (Generate Invite Token button + token display) — NEW, added by INVITE-BUTTON SEG
4. **OR divider** — NEW, added by INVITE-BUTTON SEG
5. **Action row** (Scan button + "Connect via Invite Token" button) — existing, relabeled
6. **Connect form** (token paste field + Connect button) — existing, relabeled
7. `connectStatus` display — existing
8. Distributed mode indicator — existing (keep at bottom)

If the order is correct after the prior two SEGs land, this SEG is a READ-ONLY VERIFY with a written confirmation. If order is wrong, fix it with minimal surgical moves only.

Add a label above the action row to mirror the invite-section label:

```tsx
<div style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>
  Accept an invite from someone:
</div>
```

Insert this immediately before the action-row `<div>` that contains the Scan button and Connect via Invite Token button (current line 216).

---

### SEG-V0152.1-VERIFY (Sonnet 4.6) — sequential, after all three P0 SEGs

**Runtime verify steps (Knight must collect actual evidence):**

1. Build the app (`npm run build` or equivalent build command for this project)
2. Launch the packaged/dev build
3. Navigate to Gauntlet tab → LEAN federation panel
4. Confirm: "Generate Invite Token" button is visible and blue
5. Click it → button must show "Generating…" during call (visible feedback canon)
6. Token appears in monospace read-only field below button
7. "Copy Token" button appears → click → shows "Copied!" for ~2 seconds
8. Click "Connect via Invite Token" to expand the accept form
9. Paste the generated token into the accept field → submit
10. Expected: either "Connected" if self-connection works, OR a clear error message (self-peer rejection is acceptable — the error must be readable, not silent)
11. **Evidence required:** DevTools console screenshot OR Diagnostic log showing the generate-invite IPC call succeeded (returns a real `mnemo-invite-*` token, not undefined)

Per [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]: source change alone does NOT verify. Knight must collect actual runtime evidence before marking VERIFY complete.

Note: Cross-WAN verify with Founder's son is the real SEG-WAN-3 receipt — NOT required to block this ship. That happens after Founder ratifies and son installs.

---

### SEG-V0152.1-SHIP (Sonnet 4.6) — DRAFT, after VERIFY passes

**DRAFT ONLY — Founder explicit ratify required before any ship action.**

Three SHIP gates (Knight prepares, does NOT self-stamp):

**Gate 1 — Build header verify:**
- `npm run build` completes with zero TypeScript errors
- Built artifact exists at expected path
- Electron packager produces installer or dev-build launchable

**Gate 2 — Content verify:**
- Federation panel renders in packaged/dev build (not just source)
- "Generate Invite Token" button visible and functional
- "Connect via Invite Token" label correct
- Both directions labeled clearly (Invite someone / Accept an invite)
- No console errors related to federation panel on tab open

**Gate 3 — Anonymous-download verify (post-deploy only if deploying):**
- If this patch ships as a new installer version: anonymous HEAD request to download URL returns HTTP 200 and size > 100 MB
- If dev-build only: Gate 3 = N/A, note explicitly

**Knight return format:**
```
SEG-V0152.1 YOKE RETURN
Status: DRAFT — awaiting Founder ratify
Gate 1: [PASS/FAIL + evidence]
Gate 2: [PASS/FAIL + evidence]
Gate 3: [PASS/N/A + evidence]
Runtime evidence: [console log excerpt or screenshot ref]
Token generated: [first 20 chars of actual token returned, e.g. mnemo-invite-a3f...]
Anomalies: [any]
```

---

## HARD BINDINGS CHECKLIST

- [ ] All SEGs use Sonnet 4.6 verbatim — no other model
- [ ] Every button click produces visible feedback (Generating…, Copied!, error message)
- [ ] Runtime evidence collected before VERIFY marked complete
- [ ] DRAFT status held — Founder explicit ratify required
- [ ] 3 SHIP gates documented in return
- [ ] Scope: LeanGauntletTab.tsx only — no changes to FederationTab.tsx, preload.ts, index.ts, or IPC handlers
- [ ] "Connect via Email ID" relabeled everywhere in this file (no orphaned references)

---

## REFERENCE

- `FederationTab.tsx` lines 201–289: proven `InviteFlow` pattern — read before writing INVITE-BUTTON SEG
- `preload.ts` line 385: `federationGenerateInvite()` signature confirmed wired
- `amplify.d.ts` line 346: TypeScript type confirmed
- [[feedback_every_click_visible_feedback_canon_bp078]]
- [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]
- [[feedback_knight_yoke_seg_mandatory]] — Sonnet 4.6 SEGs for ALL work, hard binding not soft suggestion

---

*Bishop orchestrator-only — [[feedback_bishop_orchestrator_knight_implementer_canon_bp080]]*
*DRAFT · Not ratified · Do not publish or ship without Founder explicit instruction*
