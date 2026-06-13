---
spec: BP081_FEATURE_SPEC_INVITE_TOKEN_AVAILABILITY_TAB
composed_at: 2026-06-12
composed_by: Bishop (Founder direct ratify)
target_version: v0.1.56 (or interleaved into v0.1.55.1 if cheap)
purpose: Connect Via Invite Token availability → button → tab that shares + receives Cue Deck Cards. Founder's own card ALWAYS visible.
status: SPEC — Knight implements
hard_bindings:
  - "Sonnet 4.6 for all SEGs (BP081 BLOOD STATUTE)"
  - "Every-click visible feedback (BP078)"
  - "Bishop-orchestrator / Knight-implementer (BP080)"
---

# Feature Spec · Connect Via Invite Token Availability Tab

**Founder direct BP081 2026-06-12:**

> *"Connect via invite token — that needs to say Connect Via Invite Token Availability — and make it a button that opens up the tab that shares the Cue Deck Cards, and shows any others that are shared. That way, it's dead simple to send off to other people, AND MY Cue Deck Card is ALWAYS available. So they can always share with me."*

## §1 Rename

Wherever the current UI says **"Connect via invite token"**, change to:

**"Connect Via Invite Token Availability"**

Verbatim capitalization. (Title Case with "Via" capitalized; "Availability" is the new tail word — that's the canonical phrasing.)

## §2 Behavior

The text-string is now a **button**. Clicking it opens a tab (existing tab or new tab — Knight chooses simplest path) called something like **"Cue Deck Cards · Share & Receive"** (Knight may refine).

## §3 Tab contents

Two regions, both always-visible inside this tab:

### §3.1 MY CUE DECK CARD (always available)

- Renders Founder's own Cue Deck Card prominently at the top
- "Share" actions visible: copy invite token to clipboard, copy share URL, generate QR code, send via mesh peer (if connected)
- The "available" framing is structural: this card is *always* present in the tab so the user (Founder) can hand it off frictionlessly to anyone, any moment

### §3.2 OTHERS' SHARED CARDS (received)

- Renders a list of Cue Deck Cards that have been shared TO this user (via mesh, via invite token redemption, via WAN relay handshake)
- Each entry shows: sender name + card preview + accept/connect button + dismiss
- Empty state: "No cards received yet — share yours to invite others"

## §4 Why this matters (Founder framing)

> *"That way, it's dead simple to send off to other people, AND MY Cue Deck Card is ALWAYS available. So they can always share with me."*

Two-way symmetry:
- **Outbound:** Founder can share his card with anyone, anywhere, anytime — without hunting through menus
- **Inbound:** anyone who shares THEIR card with Founder, it lands here visibly

The button-rename to "Availability" is structural: the user is declaring *I am available to receive your card · here is mine*.

## §5 Composes with existing canon

- [[reference_six_pillars_cue_deck_card_canon_bp080]] — Cue Deck Card is the canonical user representation; this tab is its share/receive surface
- [[feedback_every_click_visible_feedback_canon_bp078]] — every share/receive button must produce visible feedback (copied! / sent / received)
- [[reference_socceri_email_identifier_transport_canon_bp080]] — mesh delivery uses email-derived soccerball ID; invite tokens are the share-path's payload
- [[reference_member_id_immutable_anchor_mutable_proxy_bp080]] — cards encode invite tokens NOT raw email; this tab's share-out generates the token

## §6 Out of scope for this feature

- Card editing / customization UI — separate scope
- Mesh trust model changes — separate scope (use existing peer trust)
- Card monetization / payments — not in this feature

## §7 Implementation hints for Knight

- The button-rename is a 1-line change wherever the string lives in `src/renderer/`
- The tab is likely a new component under `src/renderer/components/` — e.g., `CueDeckShareTab.tsx`
- "My card" section reads from local member-info store (MemberInfo.user_id anchor)
- "Received cards" section reads from a new local store (`receivedCueDeckCards`) that the existing mesh/relay receive-path writes to on incoming share events
- Empty state + heartbeat for in-flight share operations (Founder-pet-peeve: silence = broken)

## §8 Verify (when Knight ships)

- Button labeled exactly "Connect Via Invite Token Availability"
- Click → tab opens
- Founder's own card visible at top
- "Share to clipboard" produces toast feedback
- Test inbound: simulate a card share from M0 → M1; M1's tab shows it in §3.2
- Screenshot all states in yoke-return (UX SEG mandatory screenshot canon)

— Bishop · BP081 · 2026-06-12
