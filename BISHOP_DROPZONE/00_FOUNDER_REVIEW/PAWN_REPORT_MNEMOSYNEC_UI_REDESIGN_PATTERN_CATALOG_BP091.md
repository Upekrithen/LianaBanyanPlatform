# Pawn Report — MnemosyneC UI Redesign · Pattern Catalog (BP091)

TO: BISHOP (Strategist) · FOUNDER (Review)
FROM: PAWN (Research/Pattern Catalog)
DATE: 2026-06-22

## Section 4 (full) — Three Concrete Candidate Redesigns (excerpt — partial pasted by Founder)

### Candidate 1 — "The Switchboard"
Persistent always-visible mode toggle top-right (Peer / Power User). Mode dictates which surfaces are visible. Quick to switch identity.

### Candidate 2 — "The Citadel Gate"
- Quickstart Card on first launch (portcullis — intentional entry)
- Sidebar floor plan with categories (General / Models / Tasks / Appearance | Advanced / Diagnostics)
- Search prominent in modal header
- Advanced + Diagnostics below a visual divider (inner keep)
- Quit in two places: top chrome + sidebar footer
- AI model selection: ≤2 clicks from app launch
- Mobile: 44px touch targets · tab-based modal on narrow viewport
- Accessibility: ARIA navigation, keyboard-first

### Candidate 3 — "The Folded Map"
- AI model selection: ESSENTIALS block at top — 0 additional clicks (always visible)
- Advanced/power surfaces: Collapsed accordion; Diagnostics section requires Power tier
- Quit: Bottom of settings scroll AND in top chrome
- Onboarding: Quickstart card on first launch
- Mobile: Single scroll axis — ideal for touchscreen; no sidebar to manage
- Accessibility: Accordions need careful ARIA

---

## Section 5 — Founder Decision Matrix

| # | Decision | Pawn Recommendation | Rationale |
|---|---|---|---|
| 1 | Tier/mode — always visible toggle or buried? | Always visible toggle (top-right, low-key) | Tier is identity. Visibility honors autonomy (Heart-of-Peace). |
| 2 | Model selector — main screen or settings only? | Main screen — always visible | ≤2-click rule demands it on home view |
| 3 | Quit — footer, top chrome, or both? | Both | Keyboard users (top) + scroll-to-bottom users (footer) |
| 4 | Advanced — hidden from Peer mode or de-emphasized? | Hidden, accessible via "Unlock Advanced" | Reduces cognitive load; one-click unlock available |
| 5 | Onboarding card — show once or explicit dismiss? | Show until explicitly dismissed (re-summonable via Help) | First-launch with dismiss button |
| 6 | Search bar — prominent or secondary? | Prominent in settings modal header | VS Code precedent: search-first is right default |
| 7 | Task tile selection — radio or checkbox? | Radio / exclusive select | Multiple-active bug structurally impossible with radio |
| 8 | Diagnostics — Power-tier-gated or separate window? | Same window, collapsible, gated | Separate window = haphazard city |
| 9 | Mobile / touchscreen — optimize now or future? | Optimize now (tab-based modal, 44px targets) | Retrofitting always more expensive |
| 10 | "Designed to be Copied" — MnemosyneC branding or generic? | Generic (substrate vocabulary) | Per canon: settings are substrate-level |

---

## Section 6 — Composition with the Citadel Doctrine

| Candidate | Citadel Score | Character |
|---|---|---|
| 1 — The Switchboard | 8/10 | Planned Citadel — mode toggle as gate, but mode can feel "developer preference" rather than cooperative identity |
| 2 — The Citadel Gate | **9/10** | **True Citadel** — Quickstart Card = portcullis · sidebar = floor plan · search = directory · Advanced/Diagnostics = inner keep · Quit = clearly marked exits |
| 3 — The Folded Map | 6/10 | Organized City — single-scroll, grows organically; accordion headings are walls (functional, softer than gate-keep structure) |

### Pawn's Defended Choice — Candidate 2 ("The Citadel Gate")

1. **Entry is intentional** — Quickstart Card is the portcullis · every peer enters through same gate
2. **Sidebar is the floor plan** — members orient without exploring · scroll page has no floor plan, just a hallway
3. **Advanced + Diagnostics are the inner keep** — visible on map, separated by divider, not where daily business happens
4. **Quit is carved into the wall** — two locations, both logical
5. **Substrate-ready** — sidebar generic enough that any client could adopt · labels = substrate vocabulary

**Pawn's fusion recommendation for Bishop:** Combine the persistent Mode Toggle from Candidate 1 (always-visible, top-right) with the Sidebar + Quickstart architecture of Candidate 2. Citadel with a visible gate identity marker — best of both.

---

## Section 7 — Open Questions for Founder

1. **Tier vocabulary** — Mode toggle names? ("Peer / Power User" or cooperative terms like "Member / Steward"?)
2. **Model discovery flow** — When new model added, how surface it? Auto-appear / notification badge?
3. **Substrate vs MnemosyneC identity** — Branded settings or substrate-neutral throughout?
4. **Diagnostic surface scope** — What surfaces does Power mode expose? (Raw logs / config JSON editor / process list / temperature override sliders?)
5. **Onboarding persistence** — Quickstart reappears on new peer account, or only first app install?
6. **Quit semantics** — Exit Electron process or end session (substrate runs in background)?
7. **Phone walkthrough requirement** — Current need (Founder walking someone via phone) or future mobile client?
8. **Multi-active tile fix coordination** — Assume M18b merged (radio enforced) or include radio-enforcement in this Marathon?

---

*End of Pawn Report BP091 · 2026-06-22*
*Pawn produced via Perplexity Sonnet 4.6*
