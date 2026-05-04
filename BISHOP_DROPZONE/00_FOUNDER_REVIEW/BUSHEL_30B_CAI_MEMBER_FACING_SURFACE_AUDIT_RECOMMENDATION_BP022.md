---
title: Bushel 30B — CAI Member-Facing Surface Audit Recommendation (BP022 follow-on)
authored: 2026-05-03 BP022 turn 58 (Bishop autonomous parallel-stream)
session: BP022
class: Founder-review-pending audit-class proposal
parent_audit: BUSHEL 30 BP021 (HexIsle Game UI implementation status — 33 game-mechanics innovations)
calendar_convention: BC / AD
---

# Bushel 30B — CAI Member-Facing Surface Audit (proposed follow-on)

## Why this is its own audit class

**Bushel 30 (BP021 LANDED) audited 33 HexIsle game-mechanics innovations** — Hexel construction, character placement, Ouralis tide clock, Sawtooth60 directional current, ship physics, AC pressure, etc. The Bushel 30 readiness baseline does NOT cover the **CAI member-facing surface** — the question Founder asked earlier in BP022:

> *"is the LB Frame ready? Can we run it and use Google search in Chrome, and use Comet and use CAI in them the way most people already do?"*

That question is about **member-facing CAI productization** — the Cephas surfaces / browser extension / CAI ◌ NotCents productized interface — NOT HexIsle game mechanics. Different audit class. Bushel 30B closes the gap.

## Scope (proposed Bushel 30B)

Audit the **CAI member-facing surface coverage** along these axes:

### Axis 1 — Browser-extension productization (Comet Bridge K485A)

**What we know from substrate** (Toolsmith TS-017 + TS-018):
- K485A Comet Bridge Chrome extension was BUILT (REST sidecar via Python ThreadingHTTPServer + Chrome MV3 content-script intercept + native-value-setter for React inputs + recursion-guard via `_cometBridgeRefired` flag)
- Production-deploy state: UNKNOWN from substrate alone

**Audit task**:
- Verify if Comet Bridge extension is loaded in Founder's Chrome (`chrome://extensions/` check)
- Verify REST sidecar is running on its expected port
- Verify Chrome MV3 content-script intercept fires on target sites (Google search / Comet / etc.)
- Test query through the Bridge end-to-end
- If not loaded: package / install / verify

### Axis 2 — Cephas-side CAI surface (member-facing routes)

**Known Cephas surfaces** (per LB Librarian canon BP018):
- `librarian.lianabanyan.com` (productized LB Librarian surface)
- `helm.lianabanyan.com` (member's personal space)
- Bridge pages (project control panels)

**Audit task**:
- Inventory CAI-facing routes in Cephas codebase (`platform/src/pages/` + Cephas content registry)
- Identify which routes expose CAI ◌ NotCents brand-class interface
- Identify which routes have member-facing X-Ray Mode toggle (per BP022 X-Ray Mode canon)
- Identify gaps where CAI is brand-only (no UI surface) vs gaps where UI exists but routing is incomplete

### Axis 3 — Conductor's Baton routing #2277 productization

**Known canon** (BP021 Bushel X / LB-CODEX-0029):
- Conductor's Baton routing primitive at `platform/src/lib/conductor/`
- Routes Bishop-class substrate-audit tasks to Sonnet (default)
- Reserves Opus for synthesis-driven tasks
- ~5× cost efficiency on dominant task class

**Audit task**:
- Verify Conductor's Baton routing is wired to ANY member-facing surface (not just internal Bishop/Knight/Pawn assignment)
- Identify the bridge between Conductor's Baton (internal model selection) and CAI member-facing interface (member's design intent → routing)
- Document gaps

### Axis 4 — "the way most people already do" usability validation

**Member usage patterns Founder named**:
- Google search in Chrome
- Comet (Perplexity browser)
- CAI in those contexts

**Audit task**:
- Test each pattern end-to-end as a member would use it
- Identify which pattern is fully productized vs partial vs missing
- Surface gaps before Colossus-class empirical test fires (otherwise Colossus measures partial-surface throughput, not full-stack)

## Verification gates (proposed)

- **G1**: Comet Bridge Chrome extension load status documented (loaded / not-loaded / partial)
- **G2**: Cephas CAI route inventory complete (list of routes + CAI-surface coverage status per route)
- **G3**: Conductor's Baton member-facing wiring documented (wired to which member-surface / not wired anywhere)
- **G4**: 4 member usage patterns tested end-to-end (Google search / Comet / CAI in Chrome / CAI in Comet)
- **G5**: CAI surface gap-list authored (Bishop_DROPZONE/00_FOUNDER_REVIEW/CAI_SURFACE_GAP_LIST_BP022.md)
- **G6**: Recommended-first-build-targets list for closing the surface gaps
- **G7**: Codex draft `LB-CODEX-NNNN — Bushel 30B — CAI Member-Facing Surface Audit`

## Why this matters for Colossus

Per Bishop's earlier 3-gap analysis:
- **Gap 1 (substrate-density)**: Bushel 14 Phases 2-7 closes — chain-link in motion
- **Gap 2 (Comet Bridge production-deploy)**: Bushel 30B Axis 1 closes
- **Gap 3 (CAI member-facing surface)**: Bushel 30B Axis 2-4 closes

Once Bushel 14 + Bushel 30B BOTH LAND, Colossus has full-stack to measure. Otherwise Colossus produces metrics that under-represent ceiling.

## Filing-class implication

Bushel 30B findings feed:
- Stack Ledger row LB-STACK-30B (CAI surface lift per axis)
- Living Receipts entry (CAI productization compound-lift class)
- A&A formal candidate (CAI ◌ NotCents productized surface architecture — companion to existing CAI ◌ NotCents brand A&A)

## Status

- ✅ Audit class proposed BP022 turn 58 by Bishop autonomous (parallel with Knight chain-link)
- 🔥 Founder fires Bushel 30B at convenience (not gated; not on critical path for INDL-9)
- 🔶 Bushel 30B K-prompt drafted next session (when Founder ratifies the audit class)
- 🔶 Composes with Bushel 14 Phases 2-7 LANDING (substrate-density gate must close first per chain-link sequencing)

---

*Bushel 30B is Bushel 30's structural sister — same audit-class discipline, different surface (member-facing CAI vs HexIsle game mechanics). Founder fires when the chain-link Bushels LAND and Colossus readiness comes into focus.*
