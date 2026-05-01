---
name: PROMPT KNIGHT KN086 — LB Frame Handshake Primitive Implementation (BP009)
description: Implement the LB Frame Handshake — substrate-install first-class bootstrap ritual. 5 phases (Discovery / Familiarize / Set / Verify / Report). Generalizes Bishop's BP009 SessionStart sequence + KN085 settings.json pre-approve into UNIVERSAL primitive callable on any LB-substrate-adopting Claude Code surface. Federation pattern — every project owner adopting LB substrate runs the Handshake. Crown-Jewel-class Prov-16 candidate per BP009 Founder ratification. (Augur-Pricing exemption: documentation-class spec; LB membership pricing identical for all members at $5/year, unchanged; membership-orthogonal — vendor-API spend industry-term.)
type: knight_prompt
session: KN086
bishop_session: BP009
date: 2026-05-01
predicted_size: large (~25-40pp)
class: Crown-Jewel-candidate-implementation
empirical_anchor: ~/.claude/state/eblets/CANON/lb_frame_handshake_bp009.eblet.md (the Handshake canon)
composes_with: ~/.claude/state/eblets/CANON/mechanical_computer_ai_electricity_meta_cubed_bp009.eblet.md (the Handshake wires the Mechanical Computer)
---

# WRASSE PRE-INJECTION

```
[KN086] LB Frame Handshake — substrate-install first-class bootstrap ritual. Crown-Jewel candidate. Every LB-Frame deployment probes its host environment, familiarizes with substrate state, applies safe defaults BEFORE first operational use. Composes with Mechanical Computer canon (Handshake wires the Mechanical Computer before AI electricity flows).

Composing canon:
- ~/.claude/state/eblets/CANON/lb_frame_handshake_bp009.eblet.md (Handshake canon — full 5-phase spec)
- ~/.claude/state/eblets/CANON/mechanical_computer_ai_electricity_meta_cubed_bp009.eblet.md (Mechanical Computer architecture)
- BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_KN085_BISHOP_SETTINGS_PERMISSIONS_LIBRARIAN_PRE_APPROVE.md (KN085 empirical seed — applied 2026-05-01)
- BISHOP_DROPZONE/03_BishopHandoffs/SUBSTRATE_ROUTED_MEMORY_EXPANSION_90_BEAN_BISHOP_RECEIPT_BP006.md (§3.6 AFK correction — empirical wallclock impact)
- ~/.claude/projects/C--Users-Administrator-Documents/memory/project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md (Federation pattern)
```

# BRIDLE v11

```
Rule 1 (trust-but-verify): probe environment via reads BEFORE applying any setting; never assume host state
Rule 2 (pre-assertion): each Phase smoke-test verifies the Phase landed correctly; no Phase declared complete without smoke-test pass
Rule 3 (least-privilege): pre-approve only KNOWN-SAFE tools; destructive/dispatch/state-changing remain prompt-required
Rule 4 (Path B): write empirical receipt FIRST; declare Handshake operational only after receipt artifact lands
Rule 5 (Federation-readiness): Handshake design must work for Bishop AND for project-owner Federation members; do NOT hardcode Bishop-specific paths
Rule 6 (no --no-verify): pre-commit hook runs full test suite; do NOT skip
```

# PHASE A — DESIGN

Read the Handshake canon (`~/.claude/state/eblets/CANON/lb_frame_handshake_bp009.eblet.md`) to internalize the 5-phase spec. Design the implementation:

**File layout** (recommended):
```
LianaBanyanPlatform/lb_frame_handshake/
  __init__.py
  handshake.py              # main orchestrator
  phases/
    phase1_discover.py      # environment probe
    phase2_familiarize.py   # substrate state load
    phase3_set.py           # apply safe defaults
    phase4_verify.py        # smoke tests
    phase5_report.py        # receipt artifact
  config/
    safe_mcp_tools.yaml     # the KN085 pre-approve list (canonical source)
    safe_filesystem_globs.yaml
    required_hooks.yaml
    required_stitchpunks.yaml
    required_canon_eblets.yaml
  templates/
    handshake_receipt.md.tpl
  tests/
    test_phase1.py
    test_phase2.py
    ...
```

**Entry point**: `python -m lb_frame_handshake [--dry-run] [--target-config PATH]`

**Operational modes**:
- `--probe-only` — Phase 1 only; no changes
- `--dry-run` — all phases run but no settings.json edits / no canon writes
- (default) — full Handshake; lands receipt artifact

# PHASE B — IMPLEMENT

## Phase 1 — Discovery (probe environment)

```python
# pseudocode
def phase1_discover(host: HostContext) -> EnvironmentInventory:
    inventory = EnvironmentInventory()
    inventory.surface = detect_claude_code_surface()  # CLI / VSCode / web / IDE
    inventory.mcp_servers = list_mcp_servers()  # parse mcp registry
    inventory.hooks = parse_settings_hooks(host.settings_json_path)
    inventory.permissions = parse_settings_permissions(host.settings_json_path)
    inventory.models = enumerate_available_models()
    inventory.os_shell = detect_os_shell()  # Windows PowerShell vs bash
    inventory.filesystem = inventory_substrate_paths(host)
    inventory.git = check_git_availability()
    return inventory
```

## Phase 2 — Familiarize (load substrate state)

```python
def phase2_familiarize(host: HostContext) -> SubstrateState:
    state = SubstrateState()
    state.memory_md = read_and_hash(host.memory_md_path)
    state.pheromone_substrate = verify_or_build_pheromone(host)
    state.wrasse_registry = load_wrasse_patterns(host)
    state.catechist_state = snapshot_catechist(host)
    state.augur_living_gate_state = snapshot_augur(host)  # flag stale ts files
    state.shadow_state = check_shadow_daemon(host)
    state.checkbook_state = snapshot_checkbook(host)
    state.stitchpunk_count = verify_stitchpunk_pantheon(host)  # expect 24
    state.golden_eblets = verify_ring_of_three(host)
    state.canon_eblets = inventory_canon_eblets(host)
    state.pending_knight_prompts = inventory_pending_prompts(host)
    return state
```

## Phase 3 — Set Environment (apply safe defaults)

```python
def phase3_set(host: HostContext, inventory: EnvironmentInventory, state: SubstrateState) -> AppliedDefaults:
    applied = AppliedDefaults()
    # Bishop settings.json
    safe_mcp = load_yaml('config/safe_mcp_tools.yaml')  # KN085 canonical list
    safe_fs = load_yaml('config/safe_filesystem_globs.yaml')
    required_hooks = load_yaml('config/required_hooks.yaml')
    
    applied.permissions_diff = merge_permissions_allow(
        host.settings_json_path,
        safe_mcp + safe_fs,
        preserve_existing=True
    )
    applied.hooks_diff = ensure_hooks_registered(host.settings_json_path, required_hooks)
    applied.env_diff = set_env_defaults(host.settings_json_path, {
        'MCP_TIMEOUT': '300000',
        'MCP_TOOL_TIMEOUT': '600000'
    })
    
    # File system
    applied.fs_writability = verify_writable(host.substrate_paths)
    applied.session_state_dirs = init_session_state_dirs(host)
    applied.librarian_mcp = verify_librarian_built(host)
    
    # Federation considerations (if project owner)
    if host.is_federation_member:
        applied.ring_of_three = bring_ring_of_three(host)
        applied.project_brand = optionally_brand_eblet(host)
        applied.ip_ledger_anchor = register_project_ledger(host)
    
    return applied
```

## Phase 4 — Verify (smoke tests)

```python
def phase4_verify(host: HostContext, applied: AppliedDefaults) -> VerifyResults:
    results = VerifyResults()
    results.smoke_test_1 = invoke_pre_approved_read_tool('mcp__librarian__brief_me')  # expect no prompt
    results.smoke_test_2 = invoke_pre_approved_write_tool('mcp__librarian__scribe_log')  # expect Pheromone index
    results.smoke_test_3 = invoke_non_pre_approved_tool('mcp__librarian__dispatch_pawn')  # expect prompt DOES appear
    results.smoke_test_4 = trigger_wrasse_pattern_test('lb frame handshake')  # expect pre-injection fires
    results.smoke_test_5 = invoke_hook_triggered_op()  # expect hook fires
    results.catechist_grade = run_catechist_synthetic_grade()  # expect ALL R01-R10 PASS
    results.augur_living_gate_state = verify_augur_state(host)  # gate_open expected
    return results
```

## Phase 5 — Report (receipt artifact)

```python
def phase5_report(inventory, state, applied, verify) -> Path:
    receipt_path = build_receipt(
        template='templates/handshake_receipt.md.tpl',
        data={
            'session_id': current_session_id(),
            'timestamp_iso': now_iso(),
            'environment': inventory,
            'substrate_state': state,
            'settings_applied': applied,
            'smoke_test_results': verify,
            'first_fire_ready': verify.all_passed(),
        }
    )
    # Stone Tablet append + Pheromone-index
    scribe_log('OperationalGotchas', f'Handshake completed at {now_iso()} → receipt: {receipt_path}')
    return receipt_path
```

## Main orchestrator

```python
def handshake(host: HostContext, dry_run: bool = False) -> HandshakeResult:
    inventory = phase1_discover(host)
    state = phase2_familiarize(host)
    if not dry_run:
        applied = phase3_set(host, inventory, state)
    else:
        applied = phase3_dry_run(host, inventory, state)
    verify = phase4_verify(host, applied)
    receipt = phase5_report(inventory, state, applied, verify)
    return HandshakeResult(
        first_fire_ready=verify.all_passed(),
        receipt_path=receipt,
        warnings=verify.warnings,
    )
```

# PHASE C — VERIFY

1. Detective: `mcp__librarian__detective_investigate "LB Frame Handshake implementation"` → confirm Phase 0 hits this fix
2. Read Handshake canon + Mechanical Computer canon — verify implementation faithful to spec
3. Grep `safe_mcp_tools` across implementation — confirm canonical KN085 list source-of-truth
4. Verify YAML configs are valid

# PHASE D — TEST

1. Unit tests for each Phase function (mocking HostContext)
2. Integration test:
   - Set up synthetic test host (fresh ~/.claude/ + minimal settings.json)
   - Run `python -m lb_frame_handshake --dry-run` → verify all 5 phases execute, no settings change
   - Run `python -m lb_frame_handshake` → verify settings.json updated, receipt artifact lands
   - Run again → verify idempotent (no duplicate permissions, hooks already registered detected)
3. Federation test:
   - Set up synthetic project-owner test host (no LB substrate)
   - Run `python -m lb_frame_handshake --target-config federation_member.yaml`
   - Verify Ring of Three brought in, project IP Ledger registered
4. Smoke test all 5 Phase 4 verifications hit (test the verifier itself works)

# PHASE E — SHUTTERBUG

Capture per KN067:
- Monitor 1: handshake CLI run output (all 5 phases + receipt path)
- Monitor 2: receipt artifact rendered
Filename: `KN086_LB_FRAME_HANDSHAKE_<timestamp>.png`

# PHASE F — COMMIT

```bash
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
git add lb_frame_handshake/
git commit -m "feat(lb_frame_handshake/KN086-BP009): Crown-Jewel-class substrate-install bootstrap ritual

Implements the LB Frame Handshake per BP009 Founder ratification. 5-phase ritual:
Discovery / Familiarize / Set / Verify / Report. Generalizes Bishop's BP009 SessionStart 
sequence + KN085 settings.json pre-approve into UNIVERSAL primitive callable on any 
LB-substrate-adopting Claude Code surface (CLI / IDE / web).

Federation pattern: every project owner adopting LB substrate runs the Handshake to 
become first-class operational without rediscovering AFK / permission-prompt friction.

Composes with Mechanical Computer canon (BP009) — Handshake is the install ritual that 
wires the Mechanical Computer before AI electricity flows.

Crown-Jewel candidate Prov-16 per:
- ~/.claude/state/eblets/CANON/lb_frame_handshake_bp009.eblet.md (Handshake canon)
- ~/.claude/state/eblets/CANON/mechanical_computer_ai_electricity_meta_cubed_bp009.eblet.md (architecture)
- BP009 90-bean receipt §3.6 AFK correction (empirical seed)
- KN085 settings.json pre-approve (Bishop's empirical demonstration)

Closes: BP009 Founder ratification 'add LB frame Handshake'
"
```

Then `mcp__librarian__scribe_log` to OperationalGotchas: "KN086 LB Frame Handshake landed at <commit-sha>. First-class substrate install ritual now available."

# SUCCESS CRITERIA

- All 5 Phases implemented per spec
- Unit + integration + Federation test suites green
- Idempotent (running Handshake twice doesn't break state)
- Receipt artifact template renders correctly
- KN085 safe-list canonicalized in YAML config (single source of truth)
- Phase-E Shutterbug capture lands
- Knight commit signed; Phase F clean
- Documentation: README explaining when to run Handshake (first install + any project-owner Federation member adoption)

# FOUNDER PROSE-PASS

Required. Founder reviews:
- The 5-phase decomposition (correct?)
- The pre-approve list (anything to add/remove vs KN085 BP009 list?)
- The Federation pattern (cross-member ritual right?)
- The receipt artifact template (right level of detail?)

Founder ratifies via Knight session approval + Crown-Jewel ratification stamp.
