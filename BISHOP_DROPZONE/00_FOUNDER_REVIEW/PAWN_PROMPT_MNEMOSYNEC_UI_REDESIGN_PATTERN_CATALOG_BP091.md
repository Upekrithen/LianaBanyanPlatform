# Pawn Dispatch — MnemosyneC UI Redesign · Pattern Catalog + Best-Practice Survey
## BP091 · 2026-06-22 · Bishop-composed for Founder paste to Pawn · Sonnet 4.6

---

## Mission

You are the **Pawn**, the dispatch/exploration crew member of the cooperative-class chess team. Your job is to **survey existing Electron-app + desktop-app UX patterns** for the "simple-vs-advanced settings" paradigm, then catalog the canonical patterns that map to MnemosyneC's actual needs, then surface 3-5 specific candidate redesigns Bishop can choose from.

**You are NOT writing code, committing changes, or deploying anything.** You are researching, cataloging, and proposing. Knight will execute later under Bishop's dispatch composed from your + Rook's outputs.

---

## Empirical context (same as Rook — Founder-direct BP091 2026-06-22 ~16:30 Central)

Founder's exact words: *"It needs a serious redesign, so that it's simple for simple and more in depth for technical users, where and when wanted, etc."*

Founder is explicit: **planned citadel, not haphazard city.** Pawn's catalog must give Bishop enough variety to design a STRUCTURE, not patch leaks.

---

## What to research

### Existing app patterns to study (use WebFetch for these — these are public)

Survey how each of these apps handles the "simple settings vs advanced settings" tension, specifically for: model selection / tier selection / power-user features hidden from new users.

| App | Pattern | What to extract |
|---|---|---|
| **Discord** | Settings → User Settings → categorized sidebar | Sidebar discoverability, accessibility |
| **Slack** | Preferences modal with sidebar + simple/advanced split | Onboarding flow, default vs power |
| **VS Code** | Settings split-view (UI vs JSON) + Settings Sync | Tier-by-power-user surfacing |
| **Obsidian** | Settings modal with collapsible categories + "Show advanced" toggles | Progressive disclosure |
| **ChatGPT desktop app** | Minimalism — Settings hidden mostly | Minimalism trade-offs |
| **Ollama desktop UI** | Direct relevance — same domain (local model picker) | Direct precedent — model picker patterns |
| **LM Studio** | Power-user-first model selection | Power-user-first design language |
| **Mac System Preferences (now System Settings)** | Categorized, search-bar, lots of nesting | iOS-style search dominance |
| **Windows Settings (Win11)** | Sidebar + search + categorized | Modern Win OS settings best-practice |

For each: note the simple/advanced delineation mechanism, the discoverability story, and the friction points users complain about (search engineering blogs / Reddit / app reviews).

### Cooperative-class adjacent patterns

These don't quite fit "consumer SaaS" so worth studying:
- **F-Droid** (FOSS Android store) — explicit "Newcomer / Intermediate / Advanced" filter
- **Element / Matrix clients** — privacy-aware progressive disclosure
- **Nextcloud** — self-hosted SaaS with admin/user split
- **Tailscale UI** — sysadmin-friendly with consumer-friendly defaults

### Cooperative-specific UX considerations Bishop has canonized

Read these — they constrain your recommendations:
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md` — Ah Hayelped policy (the tier UI must honor "every peer carries what it can carry")
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_heart_of_peace_arbinger_anatomy_of_peace_outward_mindset_bp051.eblet.md` — every UI element honors Heart-of-Peace toward the user (no dark patterns, no FOMO, no urgency manipulation)
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089.eblet.md` — language discipline
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_designed_to_be_copied_autonomous_propagation_doctrine_bp051.eblet.md` — UI should be one of many possible clients on the substrate (don't lock UX paradigms to MnemosyneC's quirks)
- Glob `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_*` for any existing onboarding / UX / accessibility / Heart-of-Peace canon

---

## Deliverables

Produce a structured report at:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\PAWN_REPORT_MNEMOSYNEC_UI_REDESIGN_PATTERN_CATALOG_BP091.md
```

The report MUST contain:

### 1. Pattern catalog (from research above)
Table summarizing each surveyed app: simple/advanced delineation mechanism, what works, what doesn't, fit for MnemosyneC.

### 2. Five canonical patterns
Distill the survey into 5 distinct UX paradigms that could apply to MnemosyneC:
- e.g., "Sidebar-categorized + Search" (Win11/Mac style)
- e.g., "Modal-with-tabs + Show-Advanced toggle" (Obsidian style)
- e.g., "Inline-progressive-disclosure" (one page, collapsibles)
- e.g., "Skill-level filter" (F-Droid style)
- e.g., "Quickstart card + nested-advanced" (onboarding-first)

For each paradigm: pros / cons / cooperative-fit score (1-10) / estimated complexity to implement in MnemosyneC's React codebase.

### 3. Mapped recommendations for MnemosyneC's 7 friction points
The current friction list (from Bishop's audit):
1. AI POWER TIER buried 5 scroll-sections down
2. Multiple ACTIVE tiles bug (separately fixed by M18b — but the UX should make this kind of bug HARD to write)
3. Hardcoded model names in tile bodies
4. No visible Quit affordance
5. Settings can't be walked-through by phone
6. New user has no orientation card
7. Power-user (Founder) wants override + diagnostic surfaces but doesn't want them in non-power-user faces

For each friction point: which of your 5 patterns best addresses it, with rationale.

### 4. Three concrete candidate redesigns
Sketch 3 specific layouts (text/ascii diagrams or detailed prose) that combine 2-3 of your 5 patterns into a coherent design. For each:
- The Settings home view (what the user sees first)
- Where AI model selection lives (target: ≤2 clicks from app launch)
- Where advanced/power surfaces live (target: discoverable but not in face)
- Where Quit lives
- How onboarding works for first-time users
- Mobile-friendliness consideration (Electron app on Windows touchscreens / future macOS)
- Accessibility (keyboard nav, screen reader, contrast)

### 5. Founder-decision matrix
A small table listing 5-10 design decisions Founder needs to make (e.g., "Tier override behind 'Advanced' or always visible? Search-bar prominent or hidden? Quit in footer or main-nav-overflow?"). With Pawn's recommendation per row.

### 6. Composition with the citadel doctrine
Founder said: "We are building a citadel that is planned." Map your 3 candidate redesigns to the citadel doctrine — which one feels most like a citadel (planned, defensible, member-honoring) vs a city (organic, sprawling, friction-accumulating)? Defend your choice.

### 7. Open questions for Founder
What does Bishop need to ask Founder before composing the Knight Marathon for refactor?

---

## Constraints

- **No code changes.** Research, catalog, propose only.
- **Truth-Always.** If a pattern won't fit MnemosyneC for a clear reason, say so explicitly — don't recommend something that won't work.
- **Full absolute paths.** Per Bishop discipline.
- **Honor canon.** Heart-of-Peace. Ah Hayelped. Substrate-cure language. Designed-to-be-Copied (UI is one of many possible clients).
- **Length:** ~2500 words. Diagrams are fine. Code snippets only if illustrative.

---

## After you complete

Bishop reads your report + Rook's audit, strategizes a unified design (the citadel master plan), composes a Knight Marathon dispatch for refactor. You don't need to design the new UI to completion — give Bishop the structural options.

Sonnet 4.6 throughout. Pawn tooling: Read, Grep, Glob, WebFetch, WebSearch, Bash for reading. No Edit/Write to source code.
