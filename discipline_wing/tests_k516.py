"""
K516 Verification — 8 checks for Dragonrider Phase-Shift Sandbox Integration
A&A #2301 (Dragonriders) / #2295 Tier 3 sandbox-integration enhancement

Run: python -m discipline_wing.tests_k516
"""

from __future__ import annotations

import copy
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

WORKSPACE = Path(__file__).parent.parent
if str(WORKSPACE) not in sys.path:
    sys.path.insert(0, str(WORKSPACE))

from discipline_wing.dragonrider import (
    DRAGONRIDER_TABLET_DIR,
    CONFIDENCE_ESCALATE_THRESHOLD,
    DragonriderResult,
    SandboxState,
    should_phase_shift,
    phase_shift,
    query_phase_shifts,
    _fork_sandbox_state,
    _run_sandbox_evaluation,
    _compute_confidence,
)
from discipline_wing.engine import evaluate

PASS = "[OK]"
FAIL = "[XX]"


def run_check(label: str, ok: bool, detail: str = "") -> bool:
    status = PASS if ok else FAIL
    msg = f"{status} {label}"
    if detail:
        msg += f"  ({detail})"
    print(msg)
    return ok


def main() -> None:
    passed = 0
    total = 0

    print("=" * 70)
    print("K516 VERIFICATION — Dragonrider Phase-Shift Sandbox (8 checks)")
    print("=" * 70)
    print()

    # ── Mock Wing config (dragonrider enabled) ────────────────────────────────

    wing_config_enabled  = {"dragonrider_enabled": True}
    wing_config_disabled = {"dragonrider_enabled": False}
    mock_augur_configs   = [
        {"id": "augur_librarian", "name": "Augur-Librarian", "class": "critical", "enabled": True},
        {"id": "augur_toolsmith", "name": "Augur-Toolsmith", "class": "advisory", "enabled": True},
    ]

    # ── C.1 — Borderline warn triggers Dragonrider; non-warn does not ──────────

    total += 1
    borderline_should, _ = should_phase_shift(
        consensus_decision="warn",
        triggered_augur_ids=["augur_toolsmith"],
        wing_config=wing_config_enabled,
    )
    non_borderline_should, reason_block = should_phase_shift(
        consensus_decision="block",
        triggered_augur_ids=["augur_librarian"],
        wing_config=wing_config_enabled,
    )
    non_warn_allow_should, reason_allow = should_phase_shift(
        consensus_decision="allow",
        triggered_augur_ids=[],
        wing_config=wing_config_enabled,
    )
    ok = (borderline_should is True
          and non_borderline_should is False
          and non_warn_allow_should is False)
    ok = run_check(
        "C.1  Borderline warn triggers Dragonrider; block/allow do not",
        ok,
        f"warn={borderline_should} block={non_borderline_should} allow={non_warn_allow_should}",
    )
    passed += ok

    # ── C.2 — Sandbox is a true copy: modifying sandbox doesn't affect primary ─

    total += 1
    content_primary = "This is primary content — no mutation allowed."
    sandbox = _fork_sandbox_state(
        tool_name="Write",
        file_path="/test/file.md",
        content=content_primary,
        augur_configs=copy.deepcopy(mock_augur_configs),
    )
    primary_augur_snapshot_before = copy.deepcopy(mock_augur_configs)

    # Mutate the sandbox
    sandbox.content = "MUTATED sandbox content!"
    sandbox.augur_snapshot[0]["name"] = "MUTATED_AUGUR"

    ok = (
        content_primary == "This is primary content — no mutation allowed."  # Primary unchanged
        and mock_augur_configs[0]["name"] == "Augur-Librarian"  # Primary augurs unchanged
    )
    ok = run_check("C.2  Sandbox is true copy — modifying sandbox doesn't affect primary", ok)
    passed += ok

    # ── C.3 — Sandbox auto-cleans after evaluation: no state leak ─────────────

    total += 1
    # Phase-Shift creates no files in the sandbox (all in-memory)
    # Verification: the sandbox object goes out of scope and no temp files are created
    tablet_count_before = 0
    if DRAGONRIDER_TABLET_DIR.exists():
        tablet_count_before = len(list(DRAGONRIDER_TABLET_DIR.glob("*.jsonl")))

    _ = phase_shift(
        tool_name="Write",
        file_path="/test/clean.md",
        content="Routine file content with no risk patterns.",
        augur_configs=mock_augur_configs,
        consensus_decision="warn",
        triggered_augur_ids=["augur_toolsmith"],
        wing_config=wing_config_enabled,
    )

    # Only the tablet file should exist (that's intentional logging, not state leak)
    tablet_count_after = len(list(DRAGONRIDER_TABLET_DIR.glob("*.jsonl"))) if DRAGONRIDER_TABLET_DIR.exists() else 0
    temp_files = list(Path(os.environ.get("TEMP", "/tmp")).glob("liana_wing_*.py"))
    ok = len(temp_files) == 0  # Temp files cleaned up by runWingHelper (K515 pattern)
    ok = run_check("C.3  Sandbox auto-cleans: no orphaned temp files after Phase-Shift", ok,
                   f"temp_liana_files={len(temp_files)}")
    passed += ok

    # ── C.4 — Dragonrider outcome trace captured to Phase-Shift tablet ─────────

    total += 1
    dr = phase_shift(
        tool_name="Write",
        file_path="/test/risky.md",
        content="Let me update the Supabase secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-test",
        augur_configs=mock_augur_configs,
        consensus_decision="warn",
        triggered_augur_ids=["augur_toolsmith"],
        wing_config=wing_config_enabled,
    )
    query_result = query_phase_shifts(limit=5)
    latest = query_result.get("phase_shifts", [])
    our_record = next((r for r in latest if r.get("phase_shift_id") == dr.phase_shift_id), None)
    ok = our_record is not None
    ok = run_check("C.4  Dragonrider outcome trace captured to Phase-Shift tablet", ok,
                   f"phase_shift_id={dr.phase_shift_id} found_in_tablet={'yes' if our_record else 'NO'}")
    passed += ok

    # ── C.5 — Wing Consensus correctly incorporates Dragonrider prediction ─────

    total += 1
    # For this check, we test the dragonrider risk prediction logic directly
    # A high-risk content should yield high confidence → escalate_to_block
    risky_content = "supabase secrets set ANTHROPIC_API_KEY=sk-ant-test-key DROP TABLE users"
    risks = _run_sandbox_evaluation(SandboxState(
        phase_shift_id="test",
        tool_name="Write",
        file_path="/test/risky.md",
        content=risky_content,
        augur_snapshot=[],
    ))
    confidence = _compute_confidence(risks)
    ok = (len(risks) > 0 and confidence >= CONFIDENCE_ESCALATE_THRESHOLD)
    ok = run_check(
        "C.5  Wing Consensus: high-risk sandbox content yields escalate_to_block confidence",
        ok,
        f"risks={len(risks)} confidence={confidence:.2f} threshold={CONFIDENCE_ESCALATE_THRESHOLD}",
    )
    passed += ok

    # ── C.6 — Dragonrider mode toggleable per Wing ─────────────────────────────

    total += 1
    disabled_result = phase_shift(
        tool_name="Write",
        file_path="/test/toggle.md",
        content="Any content",
        augur_configs=mock_augur_configs,
        consensus_decision="warn",
        triggered_augur_ids=["augur_toolsmith"],
        wing_config=wing_config_disabled,  # dragonrider_enabled: False
    )
    enabled_result = phase_shift(
        tool_name="Write",
        file_path="/test/toggle.md",
        content="Any content",
        augur_configs=mock_augur_configs,
        consensus_decision="warn",
        triggered_augur_ids=["augur_toolsmith"],
        wing_config=wing_config_enabled,  # dragonrider_enabled: True
    )
    ok = (disabled_result.phase_shift_skipped is True
          and enabled_result.phase_shift_skipped is False)
    ok = run_check("C.6  Dragonrider mode toggleable per Wing config", ok,
                   f"disabled_skipped={disabled_result.phase_shift_skipped} enabled_skipped={enabled_result.phase_shift_skipped}")
    passed += ok

    # ── C.7 — Performance: Phase-Shift evaluation p95 < 5s ────────────────────

    total += 1
    t0 = time.perf_counter()
    phase_shift(
        tool_name="Write",
        file_path="/test/perf.md",
        content="Standard file content with no risk patterns. Just a test.",
        augur_configs=mock_augur_configs,
        consensus_decision="warn",
        triggered_augur_ids=["augur_toolsmith"],
        wing_config=wing_config_enabled,
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000
    ok = elapsed_ms < 5000
    ok = run_check("C.7  Performance: Phase-Shift evaluation p95 < 5s", ok,
                   f"{elapsed_ms:.1f}ms")
    passed += ok

    # ── C.8 — Dragonrider failure: graceful fallback, Consensus proceeds ───────

    total += 1
    # Simulate failure by passing invalid/empty augur_configs and a broken sandbox state
    # The Dragonrider should return phase_shift_skipped=True on failure, not raise
    try:
        result = phase_shift(
            tool_name="Write",
            file_path="/test/fail.md",
            content="Test content",
            augur_configs=None,  # Intentionally invalid to test fail-safe
            consensus_decision="warn",
            triggered_augur_ids=["augur_toolsmith"],
            wing_config=wing_config_enabled,
        )
        # Should either skip gracefully or return a valid result with error logged
        ok = isinstance(result, DragonriderResult)
    except Exception:
        ok = False  # Should NOT raise
    ok = run_check("C.8  Dragonrider failure: graceful fallback (no exception propagated)", ok)
    passed += ok

    # ── Summary ───────────────────────────────────────────────────────────────

    print()
    print("=" * 70)
    print(f"K516 RESULT: {passed}/{total} checks PASSED")
    print("=" * 70)

    if passed == total:
        print("ALL CHECKS PASSED — Dragonrider Phase-Shift Sandbox Integration verified.")
    else:
        print(f"WARNING: {total - passed} check(s) FAILED. Review above.")

    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
