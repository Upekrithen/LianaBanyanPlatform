---
card_id: bounty_linux_port
card_type: bounty
section: bounties
status: OPEN
bp_session: BP086
drafted: 2026-06-18
---

# Bounty Card: Linux Desktop App Port

---

## FRONT FACE

**Eyebrow:** Open Bounty · Technical

**Status Badge:** OPEN

**Name:** Linux Port

**One-line descriptor:**
Port the MnemosyneC desktop app to Linux — AppImage · deb · rpm — and confirm it sails alongside Ollama on the open-water distros.

**Icon:** Oar (grab an oar · technical crew role)

---

## BACK FACE

### Scope
MnemosyneC desktop is currently Windows-only (Electron). This Bounty covers:
- Full Linux Electron port targeting:
  - AppImage (universal, self-contained)
  - .deb package (Debian / Ubuntu / Mint)
  - .rpm package (Fedora / RHEL / openSUSE)
- Ollama compatibility test: peer running local Ollama instance alongside MnemosyneC — both functional, no port conflicts
- Cross-distro test matrix (minimum: Ubuntu 22.04 LTS · Fedora 39 · Debian 12)
- peer_presence registration confirmed on Linux (tier=base + tier=member)
- Auto-update path tested on AppImage (auto-update behavior on .deb/.rpm may differ — document the behavior)

### Requirements
- Electron Linux packaging experience
- Linux hardware or VM access (required for real distro testing · no emulation substitute for final receipt)
- Ollama installed on test machine for compatibility pass
- Deliver: working AppImage + .deb + .rpm · smoke test receipts · distro matrix sign-off

### What Counts as Done
1. All three package formats build and install cleanly on the target distro matrix
2. Ollama compatibility confirmed (no interference · peer presence functional alongside)
3. peer_presence mesh test passing on Linux (base tier, no JWT required per Generic Connection Membership canon)
4. Cross-distro matrix completed: receipts for each distro
5. Packages uploaded to release channel
6. Receipts: build log · distro test matrix · peer_presence screenshot per distro

### Marks Payout Structure
- Marks minted per verified milestone: AppImage · deb · rpm · distro matrix sign-off · release shipped
- CREW model applies: bring collaborators (e.g., distro-specific testers), split proportional to Marks earned
- Membership required to earn Bounty share (full $5/year tier)
- Solo work valid — solo PM earns 100% of Bounty pool for this scope

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
