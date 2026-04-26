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

## Patent Backing

A&A #2295 — Augur MAJCOM Discipline Hierarchy
- Tier 1: Single Augur (K511)
- Tier 2: Squadron (K512/K513)
- **Tier 3: Wing with Consensus Layer (K514) ← THIS MODULE**
- Tier 4: MAJCOM Federation (K519+)

---

*Filed K514, B126, 2026-04-26. FOR THE KEEP!*
