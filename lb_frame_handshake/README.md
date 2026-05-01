# LB Frame Handshake

**Substrate-install first-class bootstrap ritual for LB Frame**
KN086 / BP009 — Crown-Jewel candidate (Prov-16)

---

## What it does

The LB Frame Handshake is the canonical FIRST-INSTALL operational bootstrap that every LB Frame deployment runs to become operationally ready.

It generalizes Bishop's BP009 SessionStart sequence + KN085 settings.json pre-approve into a **UNIVERSAL primitive** callable on any LB-substrate-adopting Claude Code surface (CLI, IDE extension, web app, Federation member project).

### The 5 Phases

| Phase | Name | What happens |
|---|---|---|
| 1 | Discovery | Probe host: OS/shell, MCP servers, hooks, permissions, model availability, filesystem |
| 2 | Familiarize | Load substrate state: MEMORY.md, Pheromone, Wrasse, Augur, Stitchpunks, Ring of Three |
| 3 | Set defaults | Apply safe permissions to settings.json, set MCP timeouts, init session dirs (idempotent) |
| 4 | Verify | Smoke-test that changes landed; check librarian MCP built, pheromone substrate ready |
| 5 | Report | Render `HANDSHAKE_RECEIPT_<session>.md` — canonical Stone Tablet receipt artifact |

---

## When to run

1. **First install** — any new Claude Code environment adopting LB substrate
2. **Federation member onboarding** — any project owner adopting LB Frame
3. **After a major substrate upgrade** — to verify all components are aligned
4. **When permission-prompt friction recurs** — to re-apply the KN085 pre-approve list

---

## Usage

```bash
# Full Handshake (all 5 phases)
python -m lb_frame_handshake --session KN086

# Probe only — Phase 1, no changes (safe to run anywhere)
python -m lb_frame_handshake --probe-only

# Dry-run — all phases compute diffs but make no writes
python -m lb_frame_handshake --dry-run --session KN086

# Federation member mode
python -m lb_frame_handshake --session KN086 --federation "MyProject"
```

Python API:

```python
from lb_frame_handshake import handshake, HostContext

# Default host (standard LB Windows install)
result = handshake(session_id="KN086")

# Custom host (CI, Federation member, or different path layout)
host = HostContext(
    workspace_root="/path/to/project",
    claude_root="/home/user/.claude",
    lb_session_dir="/home/user/.lb-session",
)
result = handshake(host=host, session_id="KN086")

print(f"First-fire ready: {result.first_fire_ready}")
print(f"Receipt: {result.receipt_path}")
```

---

## What gets changed in settings.json

Phase 3 adds to `permissions.allow` (idempotent — no duplicates):

- All safe read-only librarian MCP tools (see `config/safe_mcp_tools.yaml`)
- Safe filesystem Write/Edit globs (see `config/safe_filesystem_globs.yaml`)
- `env.MCP_TIMEOUT = 300000` and `env.MCP_TOOL_TIMEOUT = 600000`

**Does NOT pre-approve:** `dispatch_pawn`, `angel_of_death_*`, `force_complete_*`, `run_session_start/end` — these remain prompt-per-call per KN085 least-privilege design.

---

## Receipt artifact

Phase 5 writes `HANDSHAKE_RECEIPT_<session>_<date>.md` to:
- `BISHOP_DROPZONE/03_BishopHandoffs/` (if present)
- `~/.lb-session/` (fallback)

This receipt is a Stone Tablet artifact — append-only. Corrections via supersedes-pointer to a new Handshake run.

---

## Running tests

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
python -m pytest lb_frame_handshake/tests/ -v

# Or with unittest directly:
python -m unittest discover lb_frame_handshake/tests
```

---

## Composing canon

| Canon | Role |
|---|---|
| `lb_frame_handshake_bp009.eblet.md` | This Handshake's own canon spec |
| `mechanical_computer_ai_electricity_meta_cubed_bp009.eblet.md` | Handshake wires the Mechanical Computer |
| `project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md` | Phase 3 delivers this to Federation members |
| KN085/BP009 | Empirical seed: Bishop's settings.json pre-approve session |
| BP009 A3.6 AFK correction | Root cause: ~63min wallclock contamination from first-MCP-prompt cliff |

---

## Founder ratification

Ratified by Founder (BP009): *"We need to add an LB frame Handshake for the programming to get to know the environment it is installed on, and familiarize and set stuff the way you just did."*

Implementation spec: KN086. Crown-Jewel candidate Prov-16 per BP009.

---

*KN086 / BP009. Append-only — corrections via new Handshake receipt.*
