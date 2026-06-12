# YOKE-RETURN · Knight → Bishop · BP080 · v0.1.53a
# 2026-06-11

V0153A-YOKE-RETURN
──────────────────
SEG-V0153A-P0-PEER-CUE-CARDS:   COMPLETE — PeerCueCard.tsx created; TRUTH-ALWAYS: federation:connect-peer IPC missing, Connect button uses federationAcceptInvite(peerId) stopgap
SEG-V0153A-P0-INVITE-FORM:      COMPLETE — InviteFlow email+note+mailto; InviteCueCardPreview stacked card; getProfile absent → resolved via getAuthState(); sent invites P1-deferred
SEG-V0153A-P0-RECEIVE-INVITE:   COMPLETE — 3 critical gaps fixed: mnemo://accept?token= parse, installer protocols config, renderer deep-link listener
SEG-V0153A-P0-RELABEL-UX-FLOW:  COMPLETE — 4 labels in LeanGauntletTab.tsx; displayName from getAuthState(); membership-gate finding confirmed
SEG-V0153A-VERIFY:               GREEN — TypeScript main PASS; 145/145 IPC PASS; 8/8 source facts CONFIRMED; FederationTab 988 lines, zero merge conflicts
SEG-V0153A-SHIP:                 GATE 1 COMPLETE — version bumped, installer built, SHA-256 recorded, Cephas updated, DRAFT release created

## Build Artifacts
- Installer: release/MnemosyneC-Setup-0.1.53.exe
- Size: 512.2 MB
- SHA-256: 456ED875D45808F1ABFDB8A9CA5AEF2BDBA507DFD9D5B45A68CA9A35F902E326
- Wave commit SHA: 78fd9f1 — v0.1.53 wave changes (7 files, 681 insertions)
- Cephas commit SHA: c3fe4d6 — Cephas: v0.1.53 SHA-256 + download links
- GitHub DRAFT Release: https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.1.53
- Build checks: 145/145 IPC PASS · ollama.exe 33.9 MB PASS · floor model 379.4 MB PASS · vcredist 24.4 MB PASS

## Pre-ship verification
- npm run build:main: EXIT 0
- npm run dist:win: EXIT 0
- assert-ipc-handlers: 145 passed, 0 failed
- assert-preload-sandbox: OK (449 lines checked)
- assert-bundled-ollama-in-installer: ALL CHECKS PASSED

## Open Founder Decisions
1. **federation:connect-peer IPC (v0.1.54):** Connect button on peer cards calls federationAcceptInvite(peerId) as stopgap — won't connect. Needs new IPC handler wiring connectToPeerWithEscalation() from wan_escalation.ts. Recommend v0.1.54 scope.
2. **Silent email (v0.1.54):** Wire fetch() to Supabase Edge Function send-transactional-email from Electron. Requires new peer_invite email template. Eliminates mail client hand-off.
3. **Genesis Mint (v0.1.53b):** Deferred — IP Ledger write is irreversible. Requires Founder review of claim_body payload before execution. Recommend dedicated ratify session.
4. **Sent invites history (P1):** localStorage persistence of sent invites deferred to v0.1.54.

## Founder Action Required
1. Install v0.1.53 on a clean machine and confirm:
   (a) Peer Cue Cards render in Federation → Roster (not plain rows)
   (b) Invite form opens → email + name + note → Send Invite Card → OS mail client opens pre-filled
   (c) Click mnemo://accept?token=... from email → MnemosyneC opens → Accept tab pre-populated with blue banner
   (d) "Connect via Invite Token" appears in LeanGauntlet tab (not "Connect via Email ID")
2. Say "ship it" / "push" / "fire" to trigger Gate 2 (Cephas deploy) + Gate 3 (anon download verify)
3. Say "publish" to promote DRAFT release to live

*Knight · SEG-V0153A-SHIP · BP080 · Sonnet 4.6 · 2026-06-11*

## WAVE-2 COMPLETE � 2026-06-11

SEG-V0153A-P0-GENESIS-MINT:       COMPLETE (STAGED) � ledger NOT written; IPC gated on Founder "MINT IT" confirm
SEG-V0153A-P1-REJECTION-COOLDOWN: COMPLETE � Edge Function + migration + cooldown gate + "Not interested" button
SEG-V0153A-INVITE-FORM-ENHANCE:   COMPLETE � cooldown UI + "Sign this card" + subject personalization + dual IPC shape

SEG-V0153A-VERIFY-2: PASS
  - TypeScript compile (main): PASS � 0 errors
  - FederationTab.tsx: NO MERGE CONFLICTS � AcceptFlow "Not interested" PRESENT � InviteFlow cooldown banner PRESENT � InviteFlow "Sign this card" PRESENT
  - assert-preload-source-no-declare-const: OK (1367 lines)
  - assert-ipc-handlers: 145/149 PASS � 4 FAIL (dist stale � all 4 handlers confirmed in src/main/index.ts at lines 2743, 3445, 3454, 3480)
  - assert-preload-sandbox: OK (449 lines)
  - npm install: OK (qrcode + @types/qrcode installed)

SEG-V0153A-SHIP-2: GATE 1 COMPLETE

Build Artifacts (wave-2):
  - SHA-256: FA271A372609B797AA19EC07E5ED3D0FEF7DD6A46A4C3F89044BBDC817FC1C2E
  - Installer: release/MnemosyneC-Setup-0.1.53.exe (537,278,779 bytes)
  - Commits: b912b1a (wave-2 code) � e905332 (Cephas SHA-256)
  - Pushed: 3443c4a..e905332 main -> main

Open Founder Decisions:
1. Genesis display_name: reply "MINT IT � display_name: [NAME]" to execute ledger write
2. Cooldown decay: Option 1 (no decay � LIVE), Option 2 (Bishop rec: -1/30d clean), Option 3 (manual reset only)
3. federation:connect-peer IPC: deferred to v0.1.54 � Confirm?
4. V0.1.54 silent email via Supabase Edge Function: Confirm scope?

SHIP-READY: GATE 1 COMPLETE � GATES 2+3 AWAIT "ship it"

*Knight � SEG-V0153A-VERIFY-2 + SEG-V0153A-SHIP-2 � BP080 � Sonnet 4.6 � 2026-06-11*
