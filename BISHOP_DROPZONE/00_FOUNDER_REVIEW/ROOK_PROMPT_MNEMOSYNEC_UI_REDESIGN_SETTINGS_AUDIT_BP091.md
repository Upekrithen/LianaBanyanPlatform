# Rook Dispatch — MnemosyneC UI Redesign · Settings Audit + Source Survey
## BP091 · 2026-06-22 · Bishop-composed for Founder paste to Rook · Sonnet 4.6

---

## Mission

You are the **Rook**, the research/analysis crew member of the cooperative-class chess team. Your job is to **deeply audit MnemosyneC's current UI architecture** for the Settings + main-nav surfaces and produce a structured research report Bishop can use to compose a Knight Marathon for refactor.

**You are NOT writing code, committing changes, or deploying anything.** You are reading + researching + reporting. Knight will execute later under Bishop's dispatch composed from your + Pawn's outputs.

---

## Empirical context (Founder-direct BP091 2026-06-22 ~16:30 Central)

> *"This UI interface is bugging me for Mnemosynec. It needs a serious redesign, so that it's simple for simple and more in depth for technical users, where and when wanted, etc. I don't want to waste time on it, but it is going to be pretty rudimentary and frustrating for a lot of people. I WOULD add a piece at a time, but I that is sophistry and the way cities grow - haphazardly. We are building a citadel that is planned."*

Empirical receipts:
- 2026-06-22 ~13:00 Central: Founder could not direct his son via phone to switch AI Power Tier in MnemosyneC Settings — required screenshot walkthrough. The Settings page has 7+ scroll sections, search bar, nav tabs, gear icon, no visible Quit button.
- 2026-06-22 ~16:00 Central: Founder's M0 Settings screenshot showed multiple ACTIVE tier tiles simultaneously (bug, M18b fixes) AND ULTRA tile hardcoded gemma4:12b (bug, M18b fixes) AND "Cathedral" typo (BP091 correction, M18b fixes).
- Screenshots referenced: `C:\Users\Administrator\Pictures\Newest\Screenshot 2026-06-22 130323.png`, `Screenshot 2026-06-22 130630.png`, `Screenshot 2026-06-22 142030.png`, `Screenshot 2026-06-22 160503.png`.

The cooperative is building a **citadel that is planned** — not a city that grew haphazardly. The redesign needs to honor this metaphor structurally.

---

## What to audit (full paths)

### Source code
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\Settings\` — Settings component tree (or wherever the Settings page renders — find it via grep on "AI POWER TIER" or "Run Diagnostic")
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\` — broader component layout
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\main\` — Electron main process (window mgmt, tray, app menu)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\App.tsx` (or equivalent root) — top-level routing + layout
- Identify which component renders each Settings section: Run Diagnostic, Interface Mode, App Version, AI Capability, Cooperative Membership, AI POWER TIER, AI Model Assignment

### Canon eblets (read these first — they constrain the redesign)
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md` — the Ah Hayelped policy · 5 tier names (NANO/LITE/CORE/FULL/ULTRA)
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_peer_identity_stack_soccerball_circle_nickname_local_alias_bp091.eblet.md` — peer identity layers (Settings will need to surface L4 Local Alias editing eventually)
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_heart_of_peace_arbinger_anatomy_of_peace_outward_mindset_bp051.eblet.md` — every UI element should honor Heart-of-Peace toward the user
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089.eblet.md` — language discipline ("substrate cure" not "AI that remembers")
- Glob `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_*ui*` and `canon_*ux*` and `canon_*settings*` and `canon_*onboarding*` for any existing UX canon Rook should honor

---

## Deliverables

Produce a structured report at:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\ROOK_REPORT_MNEMOSYNEC_UI_REDESIGN_SETTINGS_AUDIT_BP091.md
```

The report MUST contain these sections (file paths in full, never markdown-link form):

### 1. Component map
- For each Settings section currently visible: which `.tsx` file renders it, line range, props it receives, parent container.
- Diagram the parent-child component tree (text-tree style).
- Identify which sections share state vs which are isolated.

### 2. State + IPC inventory
- Every IPC handler the Settings UI invokes (hardware:get-tier, hardware:set-model, etc.) — list with handler file path + main-process counterpart.
- LocalStorage + persisted-config touch points (what's stored, where, schema).
- Any external API calls the Settings page makes (Supabase, peer_presence, etc.).

### 3. Friction inventory
For each of the empirical friction points Founder hit, identify which component is responsible:
- (a) Walking a remote user to "switch model" requires scrolling past 5+ sections — where in the component tree is the AI POWER TIER section? Could it be hoisted to top-of-Settings or to main-nav?
- (b) Multiple ACTIVE tiles bug — which tile-renderer + which state determines `isActive`?
- (c) Hardcoded model names — which tile config files have hardcoded "gemma4:12b" strings?
- (d) Quit affordance unclear — where would a Quit button live structurally? Settings footer? Main nav? Tray expanded?

### 4. Code-quality assessment
- What's clean vs what's tangled?
- Are there orphan components from earlier UI iterations still referenced?
- Are there duplicated patterns that could collapse (e.g., 3 toggle implementations)?
- Are there hardcoded strings that should live in canon/data files?

### 5. Refactor footprint estimate
- For a "simple vs advanced" two-mode redesign:
  - Lines-of-code change estimate
  - Files touched estimate
  - Risk areas (state migration, prop drilling rewires, etc.)
- For minimum-viable-fix (just hoist AI POWER TIER + add Quit button + fix multi-ACTIVE):
  - Same estimates, smaller scope

### 6. Open questions for Founder
List anything you NEED Founder to ratify before redesign can proceed (e.g., "should the simple-mode hide tier override entirely or show it as 'Advanced' collapse?").

### 7. Anomalies + drift
Any drift, broken imports, dead code, contradictions, or canon misalignments you find — surface honestly per Truth-Always.

---

## Constraints

- **No code changes.** This is research only.
- **Truth-Always.** If you can't find a component, say so — don't guess.
- **Full absolute paths.** Per `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\feedback_full_path_md_references_no_markdown_link_hiding_bp091.eblet.md` — every file ref in your report uses the full path.
- **Honor existing canon.** Don't propose redesigns that violate Heart-of-Peace, Ah Hayelped, or the substrate-cure language discipline.
- **Length cap:** ~2000 words for the report. Be dense, not verbose.
- **Cite line numbers** in code where relevant.

---

## After you complete

Bishop will read your report alongside Pawn's pattern-catalog report (separate dispatch), strategize a unified design, and compose a Knight Marathon for refactor. You don't need to design the new UI — just inventory the current one well enough that Bishop can design intelligently.

Sonnet 4.6 throughout. Standard Rook tooling: Read, Grep, Glob, Bash for reading. No Edit/Write to source code.
