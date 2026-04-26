# KNIGHT REPORT — K518 — Member-Tier Wing Deployment

**Session:** K518  
**Bishop session:** B126  
**Date:** 2026-04-26  
**Tag:** `v-member-wing-deployment-K518`  
**A&A:** #2295 Tier 3 distribution to members  
**Synapse count:** 13 (≥12 required)  
**Toolsmith entries:** TS-063 (member_wing), TS-064 (onboarding), TS-065 (portable_export)

---

## What Shipped

### B.1 — Frame Extension Wing Host (verified complete from K513)

`lb-test-frame/extension/discipline_engine.js` is the JavaScript port of `discipline_wing/engine.py`. Same Augur format (trigger + required_consult + failure_action), same evaluation semantics (keyword match, freshness check, priority block > warn > enrich > allow), same fail-safe (any error → allow). This was already shipped by K513; K518 confirms and extends it.

**K518 additions to discipline_engine.js:**
- `WING_ENABLED_KEY` + `getWingEnabled()` / `setWingEnabled()` — master Wing on/off (C.5)
- `WING_TELEMETRY_KEY` + `appendWingTelemetry()` / `getWingTelemetry()` — aggregate fire log (C.6, C.7)
- `getWingDashboard()` — per-Augur fire counts + recent events
- `exportWing()` / `importWing()` — portable JSON export/import (C.8, C.9)
- Wing enable/disable check at top of `evaluate()` (C.5)
- Wing telemetry write on every rule fire (C.6)
- New message handlers: `WING_ENABLED_GET/SET`, `WING_GET_DASHBOARD`, `WING_EXPORT`, `WING_IMPORT`, `WING_INSTALL_STARTERS`

### B.2 — Helm PWA Wing Host

**New:** `librarian-mcp-helm-pwa/wing_host.py`
- Standalone Python Wing engine (independent of `discipline_wing/engine.py`)
- Rule storage: `~/.lb-helm/wing_state/rules.json`
- Consult state: `~/.lb-helm/wing_state/consult_state.json`
- Wing prefs: `~/.lb-helm/wing_state/wing_prefs.json`
- Telemetry: `~/.lb-helm/wing_state/telemetry.jsonl` (trimmed to 1000 lines)
- `evaluate(query_text)` — same semantics as JS engine, fail-safe allow
- `install_starter_augurs()` — one-click install all 5 starters
- `export_wing()` / `import_wing()` — portable export/import
- `get_dashboard()` — telemetry summary
- `mark_consulted()` / `load_prefs()` / `save_prefs()`

**Updated:** `librarian-mcp-helm-pwa/daemon_wrapper.py`
- New REST endpoints (port 7712):
  - `POST /wing/evaluate` — Wing rule evaluation before Pawn/Enrich calls
  - `GET  /wing/rules` — load member rules
  - `POST /wing/rules` — sync rules from Frame
  - `GET  /wing/dashboard` — telemetry summary
  - `GET  /wing/export` — portable export
  - `POST /wing/import` — import config
  - `POST /wing/install-starters` — install starter Augurs
  - `POST /wing/mark-consulted` — update consult freshness
  - `POST /wing/enabled` — enable/disable Wing
  - `GET  /wing/starters` — return 5 starter Augurs
- Added `_send_json()` and `_read_json_body()` helper methods

### B.3 — Onboarding Wizard (Wing Steps)

**Updated:** `lb-test-frame/extension/pages/onboarding.html`
- 3 new steps added after the existing 3:
  - Step 4 `step-wing-welcome`: Wing explanation + LRH speech + skip option
  - Step 5 `step-wing-augurs`: 5 starter Augurs with checkbox toggles (all pre-checked)
  - Step 6 `step-wing-freshness`: 4 freshness window options (10min/1hr/8hr/24hr)

**Updated:** `lb-test-frame/extension/onboarding.js`
- `goToWingWelcome()`, `goToWingAugurs()`, `goToWingFreshness()` step transitions
- `toggleAugur()` — checkbox toggle for Augur picker
- `selectFreshness()` — freshness option selection
- `finishWingSetup()` — installs selected starters + applies freshness to all installed rules
- `skipWing()` — marks `wingOnboardingSkipped` pref and closes
- `showStep()` extended to include all 6 step IDs

### B.4 — Member Wing Dashboard

**New:** `lb-test-frame/extension/pages/wing-dashboard.html`
- Master Wing enable/disable toggle
- Stats: active Augurs, total fires, blocks, warns
- Per-Augur fire counts table with activity bars
- Recent events timeline (last 50)
- Export / Import / Clear telemetry / Rule Editor links
- Sovereignty note (personal-scope, never shared without consent)

**New:** `lb-test-frame/extension/wing-dashboard.js`
- Loads `WING_GET_DASHBOARD` + `DISCIPLINE_GET_RULES` on init
- Renders per-Augur fire table with colored action badges
- Renders recent events with rule name + query snippet
- Export: Blob download of portable JSON
- Import: `<input type=file>` reads JSON, calls `WING_IMPORT`
- Clear telemetry: wipes `lb_wing_telemetry` key

**Updated:** `lb-test-frame/extension/pages/popup.html`
- Wing section between injection toggle and action buttons
- Master Wing toggle (calls `WING_ENABLED_SET`)
- Stats: Augur count + total fires
- Dashboard link (`OPEN_WING_DASHBOARD`)
- Manage Wing Rules button

**Updated:** `lb-test-frame/extension/popup.js`
- Loads `WING_ENABLED_GET` on init, wires toggle
- Loads `WING_GET_DASHBOARD` for stats
- `openDisciplineRules()` + `openWingDashboard()` functions

### B.5 — Member Wing Telemetry

- Aggregate: `lb_wing_telemetry` in chrome.storage.local (last 1000, compact)
- Per-rule: `lb_audit_<rule_id>` in chrome.storage.local (last 500 per rule)
- Helm PWA: `~/.lb-helm/wing_state/telemetry.jsonl` (last 1000 lines)
- Export: both rules + telemetry in portable JSON envelope
- Never transmitted to LB servers without explicit opt-in

### Updated Files

| File | Change |
|---|---|
| `lb-test-frame/extension/discipline_engine.js` | Wing enable/disable + telemetry + export/import + new message handlers |
| `lb-test-frame/extension/background.js` | Route WING_* + OPEN_WING_DASHBOARD messages |
| `lb-test-frame/extension/popup.js` | Wing section controller |
| `lb-test-frame/extension/onboarding.js` | Wing steps 4-6 |
| `lb-test-frame/extension/discipline-rules.js` | Export/import handlers |
| `lb-test-frame/extension/pages/popup.html` | Wing section (toggle, stats, links) |
| `lb-test-frame/extension/pages/onboarding.html` | Steps 4-6 + wing-specific CSS |
| `lb-test-frame/extension/pages/discipline-rules.html` | Export/import section at bottom |
| `lb-test-frame/extension/pages/wing-dashboard.html` | NEW — full Wing dashboard |
| `lb-test-frame/extension/wing-dashboard.js` | NEW — dashboard controller |
| `lb-test-frame/extension/manifest.json` | v1.3.0, wing-dashboard.html added |
| `librarian-mcp-helm-pwa/wing_host.py` | NEW — Helm PWA Wing engine |
| `librarian-mcp-helm-pwa/daemon_wrapper.py` | /wing/* REST endpoints |
| `discipline_wing/README.md` | K518 member-tier documentation |
| `project_sphinx_planet_wide_federation.md` | Sphinx Phase 1 marked COMPLETE |
| `librarian-mcp/stitchpunks/scribes/scribe_Toolsmith.jsonl` | TS-063, TS-064, TS-065 |
| `librarian-mcp/stitchpunks/synapses/synapse_K518.jsonl` | NEW — 13 synapses |

---

## Verification — 12/12 Checks Passed

| Check | Result |
|---|---|
| C.1 — Onboarding wizard with starter Augurs | ✓ PASS |
| C.2 — One-click install all 5 starters | ✓ PASS |
| C.3 — cite-source rule fires (action: warn) | ✓ PASS |
| C.4 — Rule edit via Discipline Rule Editor | ✓ PASS |
| C.5 — Member can disable Wing entirely | ✓ PASS |
| C.6 — Wing telemetry visible in dashboard | ✓ PASS |
| C.7 — Telemetry personal-scope (chrome.storage.local) | ✓ PASS |
| C.8 — Export Wing config + telemetry as JSON | ✓ PASS |
| C.9 — Import Wing config (round-trip tested) | ✓ PASS |
| C.10 — Frame works without Wing (wing_disabled: true → allow) | ✓ PASS |
| C.11 — Helm PWA Wing enforces decisions | ✓ PASS |
| C.12 — Cross-device independence (separate storage) | ✓ PASS |

Python wing_host tests: 9/9 checks passed (verified in session).  
JavaScript syntax: 5/5 modified files clean.

---

## Sphinx Phase Status

**Sphinx Phase 1: COMPLETE** — K518 landed B126, 2026-04-26.

Every LB member who installs the LB Frame extension OR runs the Helm PWA now gets their own personal Wing: one node in the cooperative-AI-discipline architecture, ready for opt-in federation in K519.

> "Members get the Wing. Sphinx Phase 1 ready. Long haul. Always."  
> — Bishop B126

---

**FOR THE KEEP!**

— Knight K518, B126, 2026-04-26
