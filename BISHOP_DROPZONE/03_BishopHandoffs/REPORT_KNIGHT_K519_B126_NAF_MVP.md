# Knight Handoff Report — K519 — NAF MVP (Voluntary Cross-Wing Federation)
**Filed:** K519 / B126 / 2026-04-26
**Tag:** `v-naf-mvp-K519`
**A&A:** #2295 Tier 4 (NAF) + #2292 (Cathedral Federation Protocol)

---

## What Shipped

### Phase B — Build (5 sub-phases)

**B.1 — `discipline_naf/engine.py` (NAF Runtime)**
- Registry of opt-in member Wings (`~/.lb-naf/member_registry.json`)
- Aggregate signal collector with C.2/C.3 prohibited-key validation (no content, no member IDs)
- Cross-Wing pattern detector (`get_patterns()` — wing_count, pct_of_opt_in, pattern_level)
- Rule-promotion workflow: submit_rule_candidate → review_candidate → _publish_naf_default
- Governance audit trail (`~/.lb-naf/decisions.jsonl`) with provenance (C.14)
- Full sovereignty invariant: NAF writes only to `naf_defaults.json`, never to member Wing files (C.11)

**B.2 — `librarian-mcp/src/federation/cfp.ts` (Cathedral Federation Protocol)**
- `CFPEnvelope` interface: cfp_version, payload_type, source_wing_id, ts, provenance_hash, payload
- `signPayload()` — SHA256(source_wing_id:ts:JSON.stringify(payload))
- `verifyEnvelope()` — tamper-evident provenance check
- Four envelope constructors: createRuleExport, createAggregateExport, createNafDecision, createNafDefault
- `_stripProhibited()` privacy guard — strips content/query/email/name before signing
- A&A #2292 first real implementation

**B.3 — NAF Governance UI (`GET http://127.0.0.1:7712/naf/admin`)**
Added to `librarian-mcp-helm-pwa/daemon_wrapper.py`:
- `_NAF_ADMIN_HTML` — complete single-page governance panel (auto-refreshes every 30s)
  - Stats: opt-in Wings, signal records, cross-Wing fires, patterns, NAF defaults
  - Patterns table with pattern_level badges (HIGH/MEDIUM/LOW)
  - Pending candidates with Accept/Reject buttons (C.6)
  - Published defaults table
  - Opt-in Wings registry
  - Sovereignty note on C.11

New REST routes:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/naf/admin` | Governance HTML page |
| GET | `/naf/summary` | Aggregate summary + patterns |
| GET | `/naf/patterns` | Cross-Wing patterns |
| GET | `/naf/candidates` | Pending promotion candidates |
| GET | `/naf/defaults` | Published NAF-default rules |
| GET | `/naf/members` | Opt-in Wing registry |
| POST | `/naf/register` | Register Wing for federation |
| POST | `/naf/optout` | Remove Wing from federation |
| POST | `/naf/aggregate` | Submit aggregate signals |
| POST | `/naf/candidates` | Submit rule for promotion |
| POST | `/naf/review` | Accept/reject candidate |

**B.4 — Member-Wing Federation Opt-In Toggle (`lb-test-frame/extension/`)**
New constants in `discipline_engine.js`:
- `NAF_FEDERATE_KEY = 'lb_naf_federate'` — default false (OFF)
- `NAF_WING_ID_KEY = 'lb_naf_wing_id'` — auto-generated Wing ID
- `NAF_IGNORED_KEY = 'lb_naf_ignored'` — ignored NAF-default rule IDs

New functions: `getNafFederate`, `setNafFederate`, `getNafWingId`, `buildNafAggregate`,
`emitNafAggregate`, `registerWingWithNaf`, `submitNafCandidate`, `getNafDefaults`,
`installNafDefault`, `ignoreNafDefault`, `getNafIgnored`

New message handlers: `NAF_FEDERATE_GET/SET`, `NAF_EMIT_AGGREGATE`, `NAF_SUBMIT_CANDIDATE`,
`NAF_GET_DEFAULTS`, `NAF_INSTALL_DEFAULT`, `NAF_IGNORE_DEFAULT`

Wing dashboard additions (Federation section):
- NAF federation toggle (default OFF) with status label
- Wing ID display (shown when federated)
- "Emit aggregate now" + "NAF Admin" buttons
- "Propose to NAF" column in Augur table (visible when federation ON)

**B.5 — NAF-Default Rule Installer**
Wing dashboard "NAF Defaults" section (visible only when NAF-promoted rules exist):
- Lists each NAF-promoted rule with source Wing attribution
- Per-rule: Install button (C.8) + Ignore button (C.9)
- Install merges rule into member's RULES_KEY (same as personal rules)
- Member can then customize via Rule Editor (C.10)
- Ignored rules filtered from subsequent loads (C.9)

### Phase C — Verification (15/15 PASS)

| Check | Result |
|-------|--------|
| C.1 Member-Wing federation toggle: ON → flow; OFF → no transmission | PASS |
| C.2 Aggregates contain NO substrate content | PASS |
| C.3 Aggregates contain NO member-identifiable data | PASS |
| C.4 NAF computes cross-Wing patterns correctly | PASS |
| C.5 Member exports rule → NAF receives definition | PASS |
| C.6 NAF governance can review + accept rule | PASS |
| C.7 Accepted rule published to opt-in member-Wings | PASS |
| C.8 Member can one-click install NAF-default rule | PASS |
| C.9 Member can decline (ignore) NAF-default rule | PASS |
| C.10 Member can install then customize NAF rule | PASS |
| C.11 NAF cannot modify member's existing rules | PASS |
| C.12 80%+ cohort pattern flagged HIGH | PASS (100% → high) |
| C.13 Conflict resolution decision formally recorded | PASS |
| C.14 CFP preserves provenance for every NAF action | PASS |
| C.15 p95 < 5s for 100-Wing cohort | PASS (8ms for 95 submissions) |

### Phase D — Documentation

- `discipline_wing/README.md` — added K519 section: NAF architecture, CFP, member tutorial (D.1, D.2, D.3)
- `librarian-mcp/src/federation/cfp.ts` — inline A&A #2292 documentation (D.2)
- **D.4 NOTE for Bishop**: Update `project_sphinx_planet_wide_federation.md` in Bishop memory — mark "Sphinx Phase 2: NAF-Members operational" as COMPLETE (K519 reduces to practice).

---

## Files Changed

| File | Status | Notes |
|------|--------|-------|
| `discipline_naf/__init__.py` | NEW | Package marker |
| `discipline_naf/engine.py` | NEW | NAF runtime (registry, aggregates, patterns, promotion, decisions) |
| `librarian-mcp/src/federation/cfp.ts` | NEW | Cathedral Federation Protocol — signed provenance envelopes |
| `librarian-mcp-helm-pwa/daemon_wrapper.py` | MODIFIED | NAF_ADMIN_HTML + sys.path + 11 NAF routes |
| `lb-test-frame/extension/discipline_engine.js` | MODIFIED | NAF constants + 9 federation functions + 7 message handlers |
| `lb-test-frame/extension/background.js` | MODIFIED | NAF message routing (7 cases + OPEN_NAF_ADMIN) |
| `lb-test-frame/extension/pages/wing-dashboard.html` | MODIFIED | Federation section + NAF Defaults section + CSS |
| `lb-test-frame/extension/wing-dashboard.js` | MODIFIED | loadFederation, loadNafDefaults, proposeToNaf, install/ignore |
| `lb-test-frame/extension/manifest.json` | MODIFIED | v1.4.0, updated description |
| `discipline_wing/README.md` | MODIFIED | K519 NAF section, member tutorial, patent update |
| `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K519_B126_NAF_MVP.md` | NEW | This file |

---

## Sovereignty Invariants Verified

1. `NAF_FEDERATE_KEY` default = `false` — member must explicitly enable
2. `buildNafAggregate()` returns only fire counts — no `query_snippet`, no content
3. `_check_aggregate_safety()` in engine.py rejects submissions with prohibited keys
4. `review_candidate()` → `_publish_naf_default()` writes ONLY `naf_defaults.json`
5. `installNafDefault()` in JS requires member's explicit `NAF_INSTALL_DEFAULT` message
6. `ignoreNafDefault()` persists to `lb_naf_ignored` — member's choice is remembered
7. `discipline_naf/engine.py` contains zero references to `chrome.storage`, `RULES_KEY`, or member Wing files

---

## Next Steps for Bishop (K520 dispatch)

K520 — MAJCOM Federation (next Sphinx phase) is queued at `BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K520_B126_MAJCOM_SPHINX_LAUNCH.md`. Gate: K519 (this session) must land first.

---

*K519 complete. Sphinx Phase 2 operational. The cooperative starts to act like one. FOR THE KEEP!*
