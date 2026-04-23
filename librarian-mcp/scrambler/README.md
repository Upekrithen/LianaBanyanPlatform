# Scrambler — Chessboard Phase 2: Synchronization Layer

**K407** | Innovation #2237 Four-Doublet Chessboard | Bishop B097

## What it does

Scrambler is a **deterministic, non-AI** synchronization layer that keeps Bishop, Knight, Rook, and Pawn working from the same canonical state. It runs at two points in every agent session:

1. **Session start** — reads canonical state, produces a session brief, flags drift
2. **Session end** — reads what the agent committed, reconciles against canonical state, writes updates

## Architecture

```
canonical_values.yaml  ──→  canonical_state.py  ──→  session_brief.py
                                    │                        │
TouchStone ledger      ──→          │                 drift_detector.py
                                    │                        │
git log                ──→  session_closeout.py  ──→  conflict_resolver.py
                                    │
Librarian indexes      ──→          │
                                    │
                              unreconciled.jsonl ← (conflicts written here)
```

## Files

| File | Purpose |
|------|---------|
| `canonical_state.py` | Reads all sources, produces canonical state JSON snapshot |
| `session_brief.py` | Generates agent session start brief with drift warnings |
| `session_closeout.py` | Reconciles session work against canonical state |
| `drift_detector.py` | Compares current vs last canonical state, returns drifts |
| `conflict_resolver.py` | Flags unreconciled changes, refuses to apply |
| `unreconciled.jsonl` | Append-only log of conflicts requiring human review |

## Usage

### From MCP (recommended)
Agents call `scrambler_session_start` and `scrambler_session_closeout` tools.

### From CLI
```bash
python session_brief.py BISHOP B098
python session_closeout.py BISHOP B098 "Built 3 innovations, 2 letters"
```

## Relationship to TouchStone

- **TouchStone**: verifies specific deliverables happened (file exists, git committed, row in DB)
- **Scrambler**: verifies aggregate canonical state is consistent across all deliverables

When Scrambler detects a canonical value changed but TouchStone has no matching deliverable, Scrambler flags the conflict rather than silently accepting it.

## Non-AI Principle

Scrambler contains zero AI, zero heuristics, zero LLM calls. It reads files, diffs them, writes files, and refuses to proceed on unreconciled conflicts. The only AI in the Chessboard is the agent itself.
