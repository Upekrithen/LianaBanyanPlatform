# Bishop Strategic Synthesis · BP091
## Citadel Master Plan — MnemosyneC UI Refactor

**Authored by:** Bishop Opus 4.7 via Sonnet 4.6 SEG
**Date:** 2026-06-22
**For:** Founder Review · Pre-Knight Ratify Lock
**Status:** STAGED FOR FOUNDER RATIFY · R1-R10 gates below

---

## 1. Strategic Mandate

> "We're building a citadel that is planned, not a haphazard city that just grew."
> — Founder, BP091

That sentence is the entire architectural brief. Every decision in this plan flows from it. A haphazard city has alleys you stumble into, streets with no exits, and important buildings buried behind three wrong turns. A planned citadel has a gate you enter intentionally, a floor plan you can read at a glance, inner keeps for power functions, and exits clearly carved into the walls. The current MnemosyneC settings UI is the haphazard city. M23 builds the citadel.

---

## 2. Source Intake

**Report 1 — Rook Report: MnemosyneC UI Redesign · Settings Audit (BP091)**
Path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\ROOK_REPORT_MNEMOSYNEC_UI_REDESIGN_SETTINGS_AUDIT_BP091.md`

**Report 2 — Pawn Report: MnemosyneC UI Redesign · Pattern Catalog (BP091)**
Path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\PAWN_REPORT_MNEMOSYNEC_UI_REDESIGN_PATTERN_CATALOG_BP091.md`

**Truth-Always Caveat on Rook's Component Map:**
Rook's agent prefaced its own report with a caveat that was added by Bishop after-the-fact: the component paths and line number ranges (e.g., `SettingsContainer.tsx Lines 45-320`) may have been generated without the agent reading the actual files. Rook's patterns — God Component, buried AIPowerTier, missing Quit, loose equality bug, hardcoded strings — are plausible architectural observations. The specific paths and line numbers are hypotheses.

Knight MUST NOT touch a file based solely on Rook's component map. Knight's pre-Block-1 gate is an empirical Component Map produced via grep/glob against the actual source tree. If actual file structure contradicts Rook's claims, Knight surfaces a KniPr update before any edits land. Rook's observations inform the search; they do not authorize the edit.

---

## 3. The Unified Design: Citadel Gate + Mode Banner

Pawn evaluated three candidates and scored them:

| Candidate | Score | Character |
|---|---|---|
| 1 — The Switchboard | 8/10 | Good gate marker; mode toggle shows identity clearly |
| 2 — The Citadel Gate | 9/10 | True Citadel — Quickstart portcullis, sidebar floor plan, inner keep |
| 3 — The Folded Map | 6/10 | Organized city — functional but grows rather than plans |

**Pawn's defended choice was Candidate 2, with a fusion recommendation: take the persistent Mode Toggle from Candidate 1 and embed it in Candidate 2's architecture.**

Bishop adopts this fusion recommendation without modification. The result is:

**"The Citadel Gate + Mode Banner"**

- Candidate 2 provides the skeleton: Quickstart Card portcullis + sidebar floor plan + inner keep for Advanced/Diagnostics + Quit carved in two walls.
- Candidate 1 provides the identity marker: persistent Peer/Power mode toggle, top-right, low-key pill style, always visible.
- The Mode Banner is not decorative. It is the gate's lock. Peer mode hides the inner keep. Power mode shows the floor plan in full. Switching modes is one click, always accessible, never buried.

This design is substrate-neutral by construction. The sidebar labels (Home, Models, Tasks, Appearance, Advanced, Diagnostics) contain no MnemosyneC branding. Any cooperative client running on the same substrate could adopt this shell. That is the "Designed to be Copied" canon honored in architecture before a line of copy is written.

---

## 4. The 7-Friction-Point Resolution Table

| # | Friction (from Rook + Founder testimony) | Design Element That Resolves It |
|---|---|---|
| F1 | Walking a remote user through tier selection required scrolling past 5+ sections | Models tab promoted to top-level Main Nav (sidebar item 2). AI Power Tier is never buried again. |
| F2 | Multiple ACTIVE tier tiles displayed simultaneously (radio bug) | Radio semantics enforced in TierTile — strict equality check. Composes with M18b §2 fix; Knight checks if already landed before duplicating. |
| F3 | Hardcoded model names in ULTRA tile violate Ah Hayelped dynamic sizing | Model names read from config/canon assignment object, not hardcoded JSX strings. |
| F4 | No visible Quit button — users trapped in Electron tray | Quit button in two locations: top chrome (right end) + sidebar footer. Always visible in both modes. |
| F5 | Substrate-Cure copy violation ("AI That Remembers" in Section_AICapability) | Copy updated to Substrate-Cure vocabulary throughout. Rook locates in Section_AICapability.tsx — Knight verifies path before edit. |
| F6 | Caithedral spelling typo in Section_AppVersion | Knight greps for typo before editing. Composes with M18b §4 sweep — Knight checks if M18b already resolved. |
| F7 | Interface Mode toggle does not persist after restart | localStorage.setItem call added for mode state. Mode Banner component owns its own persistence. |

---

## 5. Canon Honor Matrix

| Canon | Design Choice That Honors It |
|---|---|
| **Heart-of-Peace** — autonomy, transparent choice | Mode toggle is always visible, never hidden, never decided for the user. Peer/Power is an identity marker the user controls. |
| **Ah Hayelped** — dynamic hardware sizing, no hardcoded assignments | Model names in tier tiles read from config object. When hardware profile changes, tile labels update automatically. |
| **Substrate Cure to AI Amnesia** (supersedes "AI That Remembers") | All public-facing UI copy uses Substrate-Cure vocabulary. "AI That Remembers" removed from Section_AICapability. |
| **Designed to be Copied** | Sidebar labels are substrate-neutral. No MnemosyneC branding in nav chrome. Any cooperative client can fork the shell. |
| **TCP/IP Graceful Degradation** | Diagnostics section shows real connection state. Mesh connection status indicator in footer. If relay is unreachable, status is surfaced not hidden. |
| **MIC = Machine In Charge (not Master In Cluster)** | No UI element implies a static "master" peer. Mesh activity widget (from M22 if landed) shows rotating MIC role dynamically. |

---

## 6. Resolution of Pawn's 8 Open Questions

**Q1 — Tier vocabulary: "Peer / Power User" or "Member / Steward"?**
Decision: **"Peer / Power"** — lowercase, cooperative-aligned, low-jargon.
Rationale: "Member / Steward" implies hierarchy — the Steward governs Members. That contradicts cooperative doctrine. "Peer / Power" signals collaborative identity (Peer = every participant is equal by design) + capability tier (Power = additional surfaces unlocked, not elevated status). The word "Power" in this context reads as "power user" — someone who wants the dashboard, not someone who rules others.

**Q2 — Model discovery: when new model added, how surface it?**
Decision: **Auto-appear in model picker with a NEW badge for 7 days** after first availability.
Rationale: Preferences are inferred, not interrogated (canon). No notification pop-up. No questionnaire. Model simply appears in the list with a badge the peer can acknowledge or ignore. After 7 days the badge clears. Zero cognitive tax for peers who do not care; zero friction for power users who do.

**Q3 — Substrate vs MnemosyneC identity: branded or substrate-neutral?**
Decision: **Substrate-neutral vocabulary throughout settings and nav.** MnemosyneC name appears only in: (a) title bar / window caption, (b) About page / version screen.
Rationale: Settings are substrate-level infrastructure. A peer using the substrate mesh should be able to read nav labels without learning a brand. The Designed-to-be-Copied canon demands it. App identity lives in the chrome, not the floor plan.

**Q4 — Diagnostic surface scope: what does Power mode expose?**
Decision: **Four surfaces behind the Diagnostics nav item:**
1. Raw logs viewer — read-only, filterable by level (info/warn/error), last 500 lines with scroll
2. Config JSON editor — read/write, full current config object, saves on explicit "Apply" button (no auto-save for safety)
3. Active process list — what's running (ollama, relay, inference workers) with PID + uptime
4. Temperature + context-window override sliders — power-user inference tuning, resets on app restart unless pinned
Rationale: These four together give a power user everything needed for self-service troubleshooting without exposing destructive system ops.

**Q5 — Onboarding persistence: per-app-install or per-account?**
Decision: **Show once per app install, dismissible with a single explicit button.**
Rationale: The Quickstart Card is a welcome gate for the machine, not the identity. Re-summonable via Help menu for users who dismissed too fast. No recurring pop-up on login. No "Don't show again" checkbox (the dismiss button IS the don't-show-again).

**Q6 — Quit semantics: exit Electron process or end session?**
Decision: **Exit Electron process. Mesh participation ends when the app exits.**
Rationale: No surprise background residue. "Quit" means quit. The peer is explicitly closing the application. If the substrate mesh needs to keep running headlessly, that is a separate "Run as Service" mode that does not exist yet and must be explicitly configured by the peer. Default = quit means quit. This honors Heart-of-Peace: the peer is in control of what runs on their machine.

**Q7 — Phone walkthrough requirement: current need or future mobile client?**
Decision: **Current need, treat as MVP mobile requirement for M23.**
Rationale: Founder confirmed by trying it in BP091. The failure mode is real: a peer calls for help, the helper navigates verbally, and tier selection requires scrolling past five sections the caller can't see. The Citadel Gate design solves this structurally (Models is nav item 2), but M23 must also verify 44px touch targets and tab-based modal layout on narrow viewport. Mobile is not deferred.

**Q8 — Multi-active tile fix coordination: assume M18b or include in M23?**
Decision: **Assume M18b merged (radio semantics enforced by M18b §2).** M23's Block 1 composes with M18b — Knight checks if the fix already landed before duplicating. If M18b is not yet merged when M23 fires, Block 1 includes the radio fix as a fallback. No double-patching.

---

## 7. Resolution of Rook's 3 Open Questions

**RQ1 — Nav Hierarchy: Settings or promote to primary nav?**
Decision: **Promote AI Power Tier to Main Nav as "Models" — top-level citizen, sidebar item 2.**
Rook recommended promotion. Pawn's Citadel Gate architecture makes this structural. AI tier selection is the highest-frequency action in the settings surface. Burying it under Settings was the primary friction point. It moves to the floor plan's second room. Done.

**RQ2 — Quit Logic: terminate background processes or just close window?**
Decision: **Explicitly terminate. Mesh participation visibly ends.**
See Q6 above. Quit button text in UI: "Quit MnemosyneC" (not "Close"). Tooltip on hover: "Exits the application. Mesh participation ends." No ambiguity.

**RQ3 — Simple Mode: hide Diagnostic/Version or behind "More..."?**
Decision: **In Peer mode, Diagnostics and Advanced are absent from the sidebar (not hidden behind disclosure).** Version string remains visible in footer (non-intrusive, no click required). Power mode shows full sidebar including Advanced and Diagnostics nav items.
Rationale: "More..." disclosure triangles are the accordion pattern — that is Candidate 3 (Folded Map, 6/10). The Citadel uses rooms, not drawers. Peer mode peers simply do not have keys to the inner keep.

---

## 8. Citadel Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP CHROME                                                           │
│  [MnemosyneC]                      [peer ▾ / power]    [Quit]        │
│   title (left)                      Mode Toggle        always visible │
│                                     (top-right pill)   (top-right)   │
├──────────────────────────────────────────────────────────────────────┤
│  MAIN NAV (sidebar · Power mode)  │  CONTENT AREA                    │
│  ─────────────────                │  ─────────────────────────────── │
│  ○ Home          (substrate feed) │  Renders selected nav item       │
│  ○ Models        (AI Power Tier)  │                                   │
│  ○ Tasks         (queue + active) │  First launch: Quickstart Card   │
│  ○ Appearance    (theme/display)  │  overlays content area with      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ (divider)    │  dismiss button. Shows once      │
│  ○ Advanced      (power only)     │  per install. Re-summonable      │
│  ○ Diagnostics   (power only)     │  via Help menu.                  │
│                                   │                                   │
│  [Peer mode: sidebar hidden;       │                                   │
│   Home + Models accessible         │                                   │
│   via simplified top bar]          │                                   │
├──────────────────────────────────────────────────────────────────────┤
│  FOOTER (always visible)                                              │
│  v0.5.19  ●  relay connected  ·  mesh: 3 peers               [Quit] │
└──────────────────────────────────────────────────────────────────────┘
```

**Mobile / Narrow Viewport (< 768px):**
```
┌────────────────────────────┐
│  [≡]  MnemosyneC  [mode▾]  │
├────────────────────────────┤
│  TAB BAR:                  │
│  Home · Models · Tasks     │
│  (Power: + Adv · Diag)     │
├────────────────────────────┤
│  CONTENT (single scroll    │
│  axis, 44px touch targets) │
├────────────────────────────┤
│  v0.5.19 · ● connected     │
│  [Quit MnemosyneC]         │
└────────────────────────────┘
```

**Quickstart Card (first launch overlay):**
```
┌──────────────────────────────────────────────────┐
│  Welcome to MnemosyneC                           │
│  The Substrate Cure to AI Amnesia                │
│                                                  │
│  1. Choose your AI tier under Models             │
│  2. Connect to the cooperative mesh              │
│  3. You're in.                                   │
│                                                  │
│  [Got it — let me in]                            │
└──────────────────────────────────────────────────┘
```

---

## 9. Implementation Phasing

Bishop recommends Knight execute **Option A: The Full Citadel** — not Rook's Option B Swift Fix. Rook estimated Option B at ~150 LOC across 3 files. Option B would fix the visible bugs but leave the haphazard city standing. The Founder's mandate is the planned citadel. Band-aid scope contradicts the mandate.

Within the full Citadel scope, Bishop recommends **3 phases delivered in a single unified Marathon (M23)** with explicit block-per-phase structure. Three phases in one Marathon, not three separate Marathons, because the phases compose — you cannot ship Phase 2 (sidebar architecture) without Phase 1 (AIPowerTier promoted), and you cannot verify Phase 3 (Quickstart Card) without Phase 2 (sidebar) in place.

**Phase 1 — Foundations (Block 1)**
- Promote AIPowerTier to main nav as "Models" tab
- Add Quit button (top chrome + footer)
- Fix radio semantics for tier selection (composes with M18b §2 — Knight checks if already landed)
- Substrate-Cure copy fix in Section_AICapability.tsx (Knight verifies path first)
- Caithedral spelling fix (composes with M18b §4 sweep — Knight checks if already resolved)

**Phase 2 — Citadel Gate Architecture (Block 2)**
- Mode Toggle component (Peer/Power, top-right, pill style)
- Sidebar navigation component (with conditional render per mode)
- Peer mode simplified layout (top bar only, Models accessible)
- localStorage persistence for mode + sidebar collapse state

**Phase 3 — Inner Keep + Portcullis (Block 3)**
- Quickstart Card overlay (first launch, dismissible, re-summonable via Help)
- Advanced section content (power-user settings surfaces)
- Diagnostics section (logs viewer + process list + config editor + inference sliders)
- Mesh activity widget (M22 compose-in if landed; stub if M22 pending)

**Phase 0 — Pre-Block Empirical Component Map (Knight gate, before Block 1)**
Knight greps the actual source tree and produces a verified component map. Rook's component tree is treated as a hypothesis until Knight confirms or contradicts it. If actual file structure differs substantially, Knight surfaces a KniPr update and adjusts block targets accordingly.

---

## 10. Recommended Knight Marathon Scope

**Unified M23 spanning all three phases.**

Rationale: Three separate Marathons for three phases means three cold-starts, three pre-flight checks, three Tower deploys. M23 is structured in three blocks with clear gate checks between phases. If Knight encounters a Phase 2 blocker that cannot be resolved in session, Knight ships Phase 1 and returns the Phase 2 partial — but the default goal is full Citadel in one Marathon.

Estimated wall-clock: 12-20 hours (phases parallel-able in some segments; empirical smoke test adds time).

---

## 11. Dependencies + Composition

**M18b must land before M23 fires (or M23 Block 1 absorbs M18b's Phase 1-2 work).**
M18b carries: radio semantics fix (§2) + Caithedral sweep (§4). If M18b is not yet merged when M23 fires, Knight absorbs those fixes into M23 Block 1 as fallback. No double-patching if M18b is already merged.

**M22 ideally lands before M23 fires.**
M22 carries: tier-aware routing + MIC rotation. The Models tab in M23's sidebar needs real data to display. If M22 is landed, the Models tab connects to M22's tier-aware data layer. If M22 is pending, Models tab renders a stub with a "M22 pending" note in the component (not in the UI).

**M23 fires next session OR after M22 lands — Founder decides.**

---

## 12. Ratification Gates (R1-R10)

| Gate | Question | Founder Action Required |
|---|---|---|
| R1 | Adopt "Peer / Power" as official mode toggle vocabulary? | Ratify or substitute |
| R2 | Confirm unified M23 (not Option B Swift Fix) as scope? | Ratify or override |
| R3 | Confirm Quit = exit Electron process (no background residue)? | Ratify or override |
| R4 | Confirm Diagnostics 4-surface scope (logs + config editor + process list + sliders)? | Ratify or scope-trim |
| R5 | Confirm "Models" as nav label for AI Power Tier section? | Ratify or relabel |
| R6 | Confirm M23 fires after M22 lands (not immediately)? | Ratify or unblock now |
| R7 | Confirm mobile MVP included in M23 scope (not deferred)? | Ratify or defer |
| R8 | Confirm Quickstart Card wording ("The Substrate Cure to AI Amnesia" in card body)? | Ratify or revise copy |
| R9 | Confirm MnemosyneC name appears only in title bar + About page? | Ratify or expand brand surface |
| R10 | Confirm v0.6.0 version bump for this release (full architecture change warrants minor bump)? | Ratify or stay on 0.5.x |

---

*Bishop Strategic Synthesis · BP091 · Citadel Master Plan · 2026-06-22*
*Authored by Sonnet 4.6 SEG on behalf of Bishop Opus 4.7*
*Truth-Always discipline: Rook component paths are hypotheses pending Knight empirical verification*
