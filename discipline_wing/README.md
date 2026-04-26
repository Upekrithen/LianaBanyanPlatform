# Bishop Discipline Wing — README

**K514 / B126 / A&A #2295 Tier 3 (Wing)**
**Five Augurs, one Squadron, one Consensus Layer.**

---

## Overview

The Bishop Discipline Wing is the operational validation of A&A #2295 Tier 3. It composes five discipline Augurs into a single Squadron, arbitrated by a Consensus Layer that delivers a single per-action decision: `block`, `warn`, or `allow`.

The Wing generalizes the single-Augur `bishop_librarian_gate.py` hook (shipped B126) into a multi-Augur architecture. Backward compat: Augur-Librarian continues to enforce as before; the Wing wraps it and adds four sibling Augurs.

---

## Architecture

```
PreToolUse (Write|Edit)
        │
        ▼
bishop_librarian_gate.py (hook)
        │
        ▼
discipline_wing.engine.evaluate(tool_call)
        │
        ├─── Augur-Librarian     [CRITICAL]  ─┐
        ├─── Augur-Toolsmith     [ADVISORY]  ─┤
        ├─── Augur-Pricing       [CRITICAL]  ─┼──► ConsensusLayer.arbitrate()
        ├─── Augur-Securities    [CRITICAL]  ─┤         │
        └─── Augur-Closeout      [ADVISORY]  ─┘         ▼
                                                 decision: block / warn / allow
                                                         │
                                                         ▼
                                              wing_telemetry.jsonl (append-only)
```

---

## The Five Starter Augurs

| Augur | Class | Action | Watches For |
|---|---|---|---|
| Augur-Librarian | CRITICAL | block | Gated artifact write without Librarian consult |
| Augur-Toolsmith | ADVISORY | warn | Ratification text without Toolsmith ts_id |
| Augur-Pricing | CRITICAL | block | Membership price != $5/year |
| Augur-Securities-Language | CRITICAL | block | Equity, shares, dividends, ROI, invest* |
| Augur-Closeout | ADVISORY | warn | Session close without milestone + rebuild |

---

## Consensus Layer Voting Rules

- **CRITICAL class Augur fires** → BLOCK (critical-override, wins regardless of advisory signals)
- **ADVISORY class Augur fires** → WARN (any advisory signal warns)
- **No Augur fires** → ALLOW

Priority hierarchy: `block > warn > enrich > allow`

Configurable via `~/.claude/state/bishop_wing_augurs.json` → `consensus_rules`.

---

## File Locations

| File | Purpose |
|---|---|
| `discipline_wing/engine.py` | Wing engine: loads configs, evaluates Augurs in parallel, writes telemetry |
| `discipline_wing/consensus.py` | Consensus Layer: arbitrates signals into single decision |
| `discipline_wing/tests.py` | 12-check verification suite (all pass K514) |
| `~/.claude/hooks/bishop_librarian_gate.py` | PreToolUse hook: delegates to Wing engine |
| `~/.claude/state/bishop_wing_augurs.json` | Wing config + Squadron definition |
| `~/.claude/state/wing_augurs/augur_*.json` | Individual Augur config files (5 starters) |
| `~/.claude/state/wing_telemetry.jsonl` | Append-only evaluation audit trail |
| `librarian-mcp-helm-pwa/src/renderer/src/components/WingDashboard.tsx` | Helm PWA Wing dashboard |

---

## Augur Config Format

Each Augur is a JSON file in `~/.claude/state/wing_augurs/`:

```json
{
  "id": "augur_example",
  "name": "Augur-Example",
  "class": "critical",          // "critical" | "advisory"
  "enabled": true,
  "trigger": {
    "tool_types": ["Write", "Edit"],
    "file_path_patterns": ["BISHOP_DROPZONE/.*\\.md$"],
    "text_patterns": ["(?i)\\bequity\\b"],
    // When BOTH specified → AND logic (path is scope, text is trigger)
    // Only path patterns → path match sufficient
    // Only text patterns → text match sufficient
    "text_anti_patterns": ["safe_token"],       // optional
    "require_anti_pattern_absent": true,        // optional
    "exclusion_path_patterns": ["discipline_wing/"]  // paths that bypass this Augur
  },
  "required_consult": {
    "type": "state_file",           // "state_file" | "text_contains" | "none"
    "path": "~/.claude/state/bishop_last_librarian_consult.ts",
    "freshness_seconds": 600
  },
  "failure_action": "block",        // "block" | "warn" | "enrich" | "substitute"
  "block_message": "BLOCKED: ...",
  "source_memory": "feedback_example.md"
}
```

**Trigger logic:** When both `file_path_patterns` AND `text_patterns` are specified, the Augur fires only when BOTH match (path = scope, text = trigger). This prevents false positives on benign files that happen to match path patterns.

---

## Telemetry Schema

Every evaluation appends one JSON line to `~/.claude/state/wing_telemetry.jsonl`:

```json
{
  "ts": "2026-04-26T20:00:00.000Z",
  "tool_call": { "tool": "Write", "file_path": "/path/to/file.md" },
  "augur_results": [
    { "augur_id": "augur_librarian", "triggered": true, "signal": "block",
      "augur_class": "critical", "reason": "...", "elapsed_ms": 2 }
  ],
  "triggered_augurs": ["augur_librarian"],
  "consensus_decision": "block",
  "consensus_reason": "Critical-override: augur_librarian dominates.",
  "elapsed_ms": 15
}
```

---

## Constraints (from K514 prompt)

- **#2295 Wing primitive sovereignty preserved** — Augur authors retain authority over their own rules; Wing composes without modifying Augurs
- **Voluntary federation** — telemetry stays local to Bishop; cross-Wing federation is K519 territory
- **Backward compat** — prior B126 hook behavior preserved as Augur-Librarian in the Wing
- **Fail-safe** — any engine error → allow (never block legitimate work due to hook bugs)

---

## Verification

Run `python -m discipline_wing.tests` from the workspace root. All 12 checks must pass.

K514 landing: 12/12 passed. Tag: `v-bishop-wing-mvp-K514`.

---

## K518 — Member-Tier Wing Deployment

K518 (B126) extends the Wing to every LB member via two host environments:

### Frame Extension Wing Host (JavaScript)

`lb-test-frame/extension/discipline_engine.js` — the JavaScript port of this engine.

| Storage | Value |
|---|---|
| Rules | `chrome.storage.local` → `lb_discipline_rules` |
| Wing enabled | `chrome.storage.local` → `lb_wing_enabled` |
| Wing telemetry | `chrome.storage.local` → `lb_wing_telemetry` (last 1000) |
| Per-rule audit | `chrome.storage.local` → `lb_audit_<rule_id>` |

Key additions (K518):
- `WING_ENABLED_GET / SET` — member can disable Wing entirely (C.5)
- `WING_GET_DASHBOARD` — per-Augur fire counts + recent events (C.6)
- `WING_EXPORT / WING_IMPORT` — portable JSON export/import (C.8, C.9)
- `WING_INSTALL_STARTERS` — one-click all 5 starter Augurs (C.2)

### Helm PWA Wing Host (Python)

`librarian-mcp-helm-pwa/wing_host.py` — Python Wing engine for the Helm PWA daemon.

| Storage | Value |
|---|---|
| Rules | `~/.lb-helm/wing_state/rules.json` |
| Wing prefs | `~/.lb-helm/wing_state/wing_prefs.json` |
| Telemetry | `~/.lb-helm/wing_state/telemetry.jsonl` |
| Consult state | `~/.lb-helm/wing_state/consult_state.json` |

REST endpoints (port 7712):
- `POST /wing/evaluate` — evaluate rules against a query (C.11)
- `GET  /wing/rules` — load member rules
- `POST /wing/rules` — sync rules from Frame
- `GET  /wing/dashboard` — telemetry summary
- `GET  /wing/export` — portable export
- `POST /wing/import` — import config
- `POST /wing/install-starters` — install all 5 starters
- `POST /wing/mark-consulted` — update consult freshness
- `POST /wing/enabled` — enable/disable Wing

### Onboarding Wizard

`lb-test-frame/extension/pages/onboarding.html` — 6-step flow (3 existing + 3 Wing):
- Step 4: Wing Welcome — explain Wing, offer to configure or skip
- Step 5: Pick Starter Augurs — 5 starter Augurs, all pre-selected, toggleable
- Step 6: Freshness Windows — pick default consult freshness (10min / 1hr / 8hr / 24hr)

### Wing Dashboard

`lb-test-frame/extension/pages/wing-dashboard.html` — full telemetry dashboard:
- Master Wing toggle (C.5)
- Stats: active Augurs, total fires, blocks, warns
- Per-Augur fire counts with activity bars
- Recent events timeline
- Export / Import / Clear telemetry

### Cross-Device Independence (C.12)

Frame extension (laptop) and Helm PWA (phone/desktop) each host independent Wings. Rules stored separately; no conflict. Federation is K519 opt-in only.

---

## K519 — NAF MVP (Voluntary Cross-Wing Federation)

**Filed K519 / B126 / A&A #2295 Tier 4 + A&A #2292 CFP.**

NAF (Numbered Air Force) is the governance tier above member Wings.  It receives
opt-in aggregate signals (per-rule fire counts only — never substrate content) from
member Wings, detects cross-Wing patterns, and manages the rule-promotion workflow.

### Architecture additions (K519)

| Component | Location | Description |
|---|---|---|
| NAF engine | `discipline_naf/engine.py` | Registry, aggregate collection, pattern detection, rule-promotion workflow |
| CFP transport | `librarian-mcp/src/federation/cfp.ts` | Cathedral Federation Protocol — SHA256 provenance envelopes |
| NAF governance UI | `GET http://127.0.0.1:7712/naf/admin` | Admin panel for Bishop+Founder — review candidates, view patterns |
| Federation toggle | Wing dashboard Federation section | `NAF_FEDERATE_KEY` default OFF — member opts in explicitly |
| NAF defaults | Wing dashboard NAF Defaults section | Install / Ignore per promoted rule (C.8, C.9) |

### Sovereignty invariants (C.11)

1. Member opt-in toggle (default OFF) gates all aggregate emission.
2. Aggregates contain ONLY per-rule fire counts — no query content, no member IDs.
3. NAF can only ADD rules to `naf_defaults.json` (for opt-in install) — it never modifies, overrides, or deletes any member's existing Wing rules.
4. Members install NAF defaults with explicit one-click choice (Install / Ignore / Customize).
5. Federation state survives Wing toggle — disabling the Wing does not auto-disable federation.

### Member tutorial (D.3)

> **Federation: opt in if you want. Sovereignty stays yours.**
>
> Your Wing's discipline rules are yours. They live on your device in `chrome.storage.local` and never leave without your consent.
>
> The NAF federation toggle (off by default) lets you share **aggregate signals** — how many times each rule fired — with the NAF governance tier. No query content is ever shared. No member-identifiable data is ever shared. Just counts.
>
> When the NAF council promotes a rule as a "NAF default," you'll see it in the "NAF Defaults" section of your Wing dashboard. You can install it, ignore it, or install and then customize it. NAF cannot install anything into your Wing without your explicit click.
>
> **This is what a cooperative AI architecture looks like: discipline by consent, patterns by participation, sovereignty by design.**

### CFP — Cathedral Federation Protocol (A&A #2292)

Every federation payload is wrapped in a CFP envelope:
- `source_wing_id` — the origin Wing
- `ts` — ISO timestamp
- `provenance_hash` — SHA256 of `source_wing_id:ts:payload` for tamper-evidence
- `payload_type` — `rule_export` | `aggregate_export` | `naf_decision` | `naf_default`

The `verifyEnvelope()` function confirms integrity before any NAF-tier action is taken.

---

## Patent Backing

A&A #2295 — Augur MAJCOM Discipline Hierarchy
- Tier 1: Single Augur (K511)
- Tier 2: Squadron (K512/K513)
- **Tier 3: Wing with Consensus Layer (K514) ← THIS MODULE**
- **Tier 3 distribution to members: K518 ← Member-Tier Wing Deployment**
- **Tier 4: NAF Federation (K519) ← Voluntary Cross-Wing Federation OPERATIONAL**

A&A #2292 — Cathedral Federation Protocol (CFP)
- First real implementation: K519 `librarian-mcp/src/federation/cfp.ts`

---

*Filed K514 + K518 + K519, B126, 2026-04-26. FOR THE KEEP!*
