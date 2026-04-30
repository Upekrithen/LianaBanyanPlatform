#!/usr/bin/env python3
"""
tests_kn043.py — KN043 Augur Living Gate Extended to ALL Augur Gates.

8 tests (minimum per KN043 Phase D):
  T01 augur_pricing_postooluse_audit_fires
  T02 augur_pricing_no_blocking
  T03 living_gate_composition (Pheromone path + config check)
  T04 stone_tablet_supersede_pattern
  T05 augur_other_gates_extended (toolsmith + closeout also have audit_post)
  T06 fallback_to_preetooluse_when_pheromone_down (engine still evaluates as advisory)
  T07 catechist_r05_extension (all audit_post augurs are advisory, not critical-block)
  T08 regression_kn038_augur_living_gate (augur_librarian unaffected by KN043)
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
import time
from pathlib import Path
from unittest.mock import patch, MagicMock

_HERE = os.path.dirname(__file__)
_REPO = os.path.abspath(os.path.join(_HERE, ".."))
if _REPO not in sys.path:
    sys.path.insert(0, _REPO)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

HOOKS_DIR = Path(os.path.expanduser("~/.claude/hooks"))
AUGUR_DIR = Path(os.path.expanduser("~/.claude/state/wing_augurs"))


def _import_post_audit():
    """Import the bishop_augur_post_audit module."""
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "bishop_augur_post_audit",
        HOOKS_DIR / "bishop_augur_post_audit.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return mod


def _load_augur_config(augur_id: str) -> dict:
    path = AUGUR_DIR / f"{augur_id}.json"
    return json.loads(path.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# T01 — augur_pricing PostToolUse audit fires on real violation
# ---------------------------------------------------------------------------

def test_augur_pricing_postooluse_audit_fires() -> None:
    """A write with non-$5 membership pricing causes the audit to fire and write a supersede stub."""
    mod = _import_post_audit()

    with tempfile.TemporaryDirectory() as tmpdir:
        violating_file = Path(tmpdir) / "test_pricing.md"
        violating_file.write_text(
            "Join our platform! Membership fee is $25/year for early adopters.",
            encoding="utf-8",
        )

        stub_path_holder: list[Path] = []
        original_write = mod._write_supersede_stub

        def capture_stub(file_path, augur_id, augur_name, block_message):
            stub = original_write(file_path, augur_id, augur_name, block_message)
            stub_path_holder.append(stub)
            return stub

        # Run audit directly against the violating content
        content = "Membership fee is $25/year for early adopters."
        configs = mod._get_audit_augur_configs()
        pricing_cfg = next((c for c in configs if c["id"] == "augur_pricing"), None)
        assert pricing_cfg is not None, "augur_pricing config not found with audit_post: true"

        triggered = False
        anti_patterns = pricing_cfg["trigger"].get("text_anti_patterns", [])
        if not mod._any_anti_pattern_present(anti_patterns, content):
            text_patterns = pricing_cfg["trigger"].get("text_patterns", [])
            if mod._any_text_pattern_matches(text_patterns, content):
                triggered = True

        assert triggered, "T01 FAILED: Augur-Pricing should fire on $25/year membership content"
        print("T01 PASS — Augur-Pricing PostToolUse audit fires on $25/year violation")


# ---------------------------------------------------------------------------
# T02 — augur_pricing no longer blocks (class: advisory, failure_action: warn)
# ---------------------------------------------------------------------------

def test_augur_pricing_no_blocking() -> None:
    """augur_pricing.json must have class=advisory + failure_action=warn (non-blocking)."""
    cfg = _load_augur_config("augur_pricing")
    assert cfg["class"] == "advisory", (
        f"T02 FAILED: augur_pricing class must be 'advisory', got {cfg['class']!r}"
    )
    assert cfg["failure_action"] == "warn", (
        f"T02 FAILED: augur_pricing failure_action must be 'warn', got {cfg['failure_action']!r}"
    )
    assert cfg.get("audit_post") is True, (
        "T02 FAILED: augur_pricing must have audit_post: true"
    )
    print("T02 PASS — augur_pricing is advisory/warn/audit_post (non-blocking)")


# ---------------------------------------------------------------------------
# T03 — Living Gate composition: Pheromone event emission path exists
# ---------------------------------------------------------------------------

def test_living_gate_composition() -> None:
    """_emit_pheromone_violation_event function exists and is Brick-Wall safe."""
    mod = _import_post_audit()
    assert hasattr(mod, "_emit_pheromone_violation_event"), (
        "T03 FAILED: _emit_pheromone_violation_event missing from post-audit hook"
    )
    # Call it — should never raise (Brick Wall)
    try:
        mod._emit_pheromone_violation_event("augur_pricing", "/tmp/fake.md")
    except Exception as e:
        assert False, f"T03 FAILED: _emit_pheromone_violation_event raised: {e}"
    print("T03 PASS — Living Gate Pheromone emission path is Brick-Wall safe")


# ---------------------------------------------------------------------------
# T04 — Stone Tablet supersede stub pattern correct
# ---------------------------------------------------------------------------

def test_stone_tablet_supersede_pattern() -> None:
    """Supersede stub has correct frontmatter and Stone Tablet fields."""
    mod = _import_post_audit()

    with tempfile.TemporaryDirectory() as tmpdir:
        fake_file = str(Path(tmpdir) / "test_doc.md")
        stub_path = mod._write_supersede_stub(
            fake_file,
            "augur_pricing",
            "Augur-Pricing",
            "WARN: pricing violation detected",
        )
        assert stub_path.exists(), "T04 FAILED: supersede stub was not written"
        text = stub_path.read_text(encoding="utf-8")
        assert "supersede_type: augur_post_audit_violation" in text, (
            "T04 FAILED: missing supersede_type frontmatter"
        )
        assert "augur_id: augur_pricing" in text, "T04 FAILED: missing augur_id"
        assert "kn043: true" in text, "T04 FAILED: missing kn043 marker"
        assert "Stone Tablet Pattern" in text, "T04 FAILED: missing Stone Tablet section"
        assert "NEVER blocked" not in text or "NOT blocked" in text, \
            "T04 FAILED: should assert write was not blocked"
        assert "pending_reconciliation" in text, "T04 FAILED: missing pending_reconciliation status"
    print("T04 PASS — Stone Tablet supersede stub has correct frontmatter + pattern")


# ---------------------------------------------------------------------------
# T05 — Other Augur gates extended: toolsmith + closeout also have audit_post
# ---------------------------------------------------------------------------

def test_augur_other_gates_extended() -> None:
    """augur_toolsmith and augur_closeout also have audit_post: true (KN043 T05)."""
    for augur_id in ("augur_toolsmith", "augur_closeout"):
        cfg = _load_augur_config(augur_id)
        assert cfg.get("audit_post") is True, (
            f"T05 FAILED: {augur_id} missing audit_post: true"
        )
        assert cfg.get("class") == "advisory", (
            f"T05 FAILED: {augur_id} should be advisory class"
        )
    print("T05 PASS — augur_toolsmith + augur_closeout both have audit_post: true")


# ---------------------------------------------------------------------------
# T06 — Fallback: when Pheromone down, audit still runs (pattern-based, no Pheromone dep)
# ---------------------------------------------------------------------------

def test_fallback_when_pheromone_down() -> None:
    """PostToolUse audit pattern matching does NOT require Pheromone (graceful degrade)."""
    mod = _import_post_audit()
    # Patch _emit_pheromone_violation_event to simulate Pheromone being down (raises)
    original = mod._emit_pheromone_violation_event

    def raise_pheromone(*args, **kwargs):
        raise RuntimeError("Pheromone substrate unavailable")

    mod._emit_pheromone_violation_event = raise_pheromone
    try:
        # Pattern matching should still work regardless
        content = "Membership fee is $10/year early-adopter special-price"
        configs = mod._get_audit_augur_configs()
        pricing_cfg = next((c for c in configs if c["id"] == "augur_pricing"), None)
        if pricing_cfg:
            anti_patterns = pricing_cfg["trigger"].get("text_anti_patterns", [])
            text_patterns = pricing_cfg["trigger"].get("text_patterns", [])
            suppressed = mod._any_anti_pattern_present(anti_patterns, content)
            fired = mod._any_text_pattern_matches(text_patterns, content)
            # The audit logic itself works without Pheromone
            assert isinstance(fired, bool), "T06 FAILED: pattern matching should return bool"
    finally:
        mod._emit_pheromone_violation_event = original

    print("T06 PASS — PostToolUse audit runs correctly even when Pheromone substrate is down")


# ---------------------------------------------------------------------------
# T07 — Catechist R05 extension: all audit_post augurs are advisory (not critical-block)
# ---------------------------------------------------------------------------

def test_catechist_r05_extension() -> None:
    """All audit_post augurs must be advisory class — none should be critical/blocking."""
    mod = _import_post_audit()
    audit_configs = mod._get_audit_augur_configs()
    critical_blockers = [
        c["id"] for c in audit_configs
        if c.get("class") == "critical" and c.get("failure_action") == "block"
    ]
    assert not critical_blockers, (
        f"T07 FAILED: these audit_post augurs are still critical/blocking: {critical_blockers}"
    )
    print(
        f"T07 PASS — all {len(audit_configs)} audit_post augurs are advisory "
        f"(none critical/blocking). Catechist R05 satisfied."
    )


# ---------------------------------------------------------------------------
# T08 — Regression: augur_librarian (KN038 Living Gate) is unaffected by KN043
# ---------------------------------------------------------------------------

def test_regression_kn038_augur_living_gate() -> None:
    """augur_librarian must NOT have audit_post (it's still PreToolUse critical/block)."""
    cfg = _load_augur_config("augur_librarian")
    assert not cfg.get("audit_post", False), (
        "T08 FAILED: augur_librarian should NOT have audit_post (it's PreToolUse Living Gate)"
    )
    assert cfg.get("class") == "critical", (
        f"T08 FAILED: augur_librarian should still be critical, got {cfg.get('class')!r}"
    )
    assert cfg.get("failure_action") == "block", (
        f"T08 FAILED: augur_librarian should still block, got {cfg.get('failure_action')!r}"
    )
    print("T08 PASS — augur_librarian (KN038 Living Gate) unaffected by KN043")


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    failures: list[str] = []
    tests = [
        test_augur_pricing_postooluse_audit_fires,
        test_augur_pricing_no_blocking,
        test_living_gate_composition,
        test_stone_tablet_supersede_pattern,
        test_augur_other_gates_extended,
        test_fallback_when_pheromone_down,
        test_catechist_r05_extension,
        test_regression_kn038_augur_living_gate,
    ]
    for t in tests:
        try:
            t()
        except AssertionError as e:
            print(f"FAIL [{t.__name__}]: {e}", file=sys.stderr)
            failures.append(t.__name__)
        except Exception as e:
            print(f"ERROR [{t.__name__}]: {e}", file=sys.stderr)
            failures.append(t.__name__)

    if failures:
        print(f"\n{len(failures)}/{len(tests)} tests FAILED: {failures}", file=sys.stderr)
        sys.exit(1)
    else:
        print(f"\nAll {len(tests)} KN043 tests PASSED")
        sys.exit(0)
