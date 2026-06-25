---
card_id: bounty_mac_port
card_type: bounty
section: bounties
status: OPEN
bp_session: BP086
drafted: 2026-06-18
---

# Bounty Card: macOS Desktop App Port

---

## FRONT FACE

**Eyebrow:** Open Bounty · Technical

**Status Badge:** OPEN

**Name:** macOS Port

**One-line descriptor:**
Port the MnemosyneC desktop app to macOS — signed installer, auto-update, DMG — so the ship sails on every dock.

**Icon:** Oar (grab an oar · technical crew role)

---

## BACK FACE

### Scope
MnemosyneC desktop is currently Windows-only (Electron). This Bounty covers:
- Full macOS Electron port (Intel + Apple Silicon universal binary)
- macOS code signing (Developer ID Application certificate)
- Notarization via Apple Notary Service
- DMG installer package (drag-to-Applications UX)
- Auto-update via existing update mechanism
- Smoke test pass on macOS 13 Ventura + 14 Sonoma minimum
- peer_presence registration confirmed functional on macOS (tier=base + tier=member paths both tested)

### Requirements
- Electron cross-compile experience (macOS target from existing codebase)
- Apple Developer account or coordination with Founder for signing credentials
- macOS hardware for final notarization + smoke test (required · no emulation substitute)
- Deliver: signed DMG · auto-update working · peer_presence mesh test passing on macOS

### What Counts as Done
1. Signed + notarized DMG installer produced and verified on macOS 13 + 14
2. Auto-update path tested (simulated update receipt minted)
3. Pipeline tab · peer_presence · Realtime channel confirmed functional (base tier, no JWT required per Generic Connection Membership canon)
4. Installer uploaded to release channel
5. Receipts: build log · smoke test log · peer_presence registration screenshot

### Marks Payout Structure
- Marks minted per verified milestone: DMG signed · notarization confirmed · smoke test receipt · release shipped
- CREW model applies: if you bring collaborators in, split is proportional to Marks each member earns during the work
- Membership required to claim Bounty share (full $5/year tier)
- Solo work is valid — solo PM earns 100% of the Bounty pool for this work

### Boarding Declaration
Clicking Apply is not a purchase. It is a Boarding Declaration — you are joining the crew for this Bounty.
Base tier auto-onboards at lianabanyan.com/join. Upgrade to member tier to earn.

### Legal Note
Marks are cooperative participation tokens — not securities, not equity.
No investment. No shares. No dividends. No ROI. No yield.

### Apply CTA
**Apply for this Bounty →**
Routes to: lianabanyan.com/join (cooperative checkout · Substitution rails: Fiat · Marks · Barter)

### Back affordance
← Back to Bounty Wall
