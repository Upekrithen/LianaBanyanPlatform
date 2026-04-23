"""Tests for the TouchStone dispatch engine."""

import json
import sys
from pathlib import Path

TOUCHSTONE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = TOUCHSTONE_DIR.parents[1]
sys.path.insert(0, str(TOUCHSTONE_DIR))

from dispatch import load_manifest, dispatch_deliverable


def test_manifest_loads():
    manifest = load_manifest()
    assert "deliverables" in manifest


def test_dispatch_known_deliverable():
    # Pick a pending deliverable
    manifest = load_manifest()
    pending = [d for d in manifest["deliverables"] if d["status"] == "pending"]
    if not pending:
        print("  SKIP No pending deliverables to test dispatch")
        return
    d = pending[0]
    result = dispatch_deliverable(d["id"])
    assert result["dispatched"] is True
    assert result["owner"] == d["owner"]

    # Verify the task file was created
    task_path = REPO_ROOT / result["task_path"]
    assert task_path.exists()
    content = task_path.read_text(encoding="utf-8")
    assert d["id"] in content
    assert "TouchStone Task" in content

    # Clean up
    task_path.unlink()


def test_dispatch_nonexistent():
    result = dispatch_deliverable("nonexistent-id")
    assert result["dispatched"] is False
    assert "not found" in result["reason"]


if __name__ == "__main__":
    import traceback

    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    failed = 0

    for test_fn in tests:
        try:
            test_fn()
            print(f"  PASS {test_fn.__name__}")
            passed += 1
        except Exception:
            print(f"  FAIL {test_fn.__name__}")
            traceback.print_exc()
            failed += 1

    print(f"\n{passed} passed, {failed} failed, {passed + failed} total")
    sys.exit(1 if failed > 0 else 0)
