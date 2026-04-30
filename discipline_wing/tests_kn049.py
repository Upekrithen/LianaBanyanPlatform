#!/usr/bin/env python3
"""
tests_kn049.py — KN049 Cycle Prevention DAG Validation

8 tests (minimum per KN049 Phase D):
  T01 valid_dag_acceptance
  T02 simple_cycle_rejection
  T03 indirect_cycle_rejection
  T04 layer_inversion_rejection
  T05 valid_skip_layer_acceptance
  T06 orphan_anchor_rejection
  T07 self_anchor_rejection
  T08 audit_log_on_rejection
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

_HERE = os.path.dirname(__file__)
_REPO = os.path.abspath(os.path.join(_HERE, ".."))
if _REPO not in sys.path:
    sys.path.insert(0, _REPO)

from discipline_wing.federation.dag_validation import (
    validate_dag_write,
    validate_batch,
    ip_ledger_write_gate,
    DAGValidationResult,
)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _entry(uri: str, parent_uri: Optional[str] = None) -> dict:
    """Create a minimal IP Ledger-style entry with golden_tablet_uri."""
    return {
        "event_type": "mine_tablet",
        "golden_tablet_uri": uri,
        "parent_uri": parent_uri,
        "current_hash": "a" * 64,
    }


def _make_ledger(tmpdir: str, entries: list[dict]) -> Path:
    path = Path(tmpdir) / "ip_ledger.jsonl"
    with open(path, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e) + "\n")
    return path


# ── T01 — valid_dag_acceptance ────────────────────────────────────────────────

def test_valid_dag_acceptance() -> None:
    """
    Well-formed chain L5→L4→L3→L2→L1 is accepted.
    Each layer anchors to the next-shallower layer.
    """
    uris = [
        "golden_tablet://Layer_1/Entity_LBCorp/Canon",
        "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
        "golden_tablet://Layer_3/Entity_proj-a/Project_Rules",
        "golden_tablet://Layer_4/Entity_subproj-a/Project_Rules",
        "golden_tablet://Layer_5/Entity_helm-a/Canon",
    ]

    # Build existing entries (L1 through L4)
    existing = []
    for i in range(4):
        existing.append(_entry(uris[i], parent_uri=uris[i - 1] if i > 0 else None))

    # Proposed: L5 anchoring to L4
    result = validate_dag_write(
        proposed_uri=uris[4],
        proposed_parent_uri=uris[3],
        existing_entries=existing,
    )

    assert result.accepted, f"T01 FAILED: valid L5→L4 chain rejected: {result.reason}"
    print(f"T01 PASS — valid L5-L4-L3-L2-L1 chain accepted")


# ── T02 — simple_cycle_rejection ──────────────────────────────────────────────

def test_simple_cycle_rejection() -> None:
    """L3 anchors to L3 itself — direct self-cycle REJECTED."""
    l3_uri = "golden_tablet://Layer_3/Entity_proj-self/Project_Rules"
    l1_uri = "golden_tablet://Layer_1/Entity_LBCorp/Canon"
    l2_uri = "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules"

    # Existing: L1 and L2 are valid, plus an L3 entry that claims to anchor to itself
    existing = [
        _entry(l1_uri, None),
        _entry(l2_uri, l1_uri),
        # L3 already in ledger (somehow — we're checking if a NEW write creates cycle)
        # Here we simulate: proposed L3 anchors to L3 (same URI)
    ]

    result = validate_dag_write(
        proposed_uri=l3_uri,
        proposed_parent_uri=l3_uri,  # anchors to itself
        existing_entries=existing,
    )

    assert not result.accepted, "T02 FAILED: self-anchor cycle should be rejected"
    assert result.rejection_class in ("self_anchor", "cycle"), (
        f"T02 FAILED: rejection_class expected 'self_anchor' or 'cycle', got {result.rejection_class!r}"
    )
    print(f"T02 PASS — simple self-cycle rejected: rejection_class={result.rejection_class!r}")


# ── T03 — indirect_cycle_rejection ────────────────────────────────────────────

def test_indirect_cycle_rejection() -> None:
    """
    Indirect cycle: existing L4→L3 in ledger, proposed L3 anchors to L4.
    This creates L3→L4→L3 cycle — REJECTED.
    """
    l3_uri = "golden_tablet://Layer_3/Entity_proj-b/Project_Rules"
    l4_uri = "golden_tablet://Layer_4/Entity_subproj-b/Project_Rules"

    # Existing: L4 anchors to L3 (already written)
    existing = [
        _entry(l3_uri, parent_uri=None),  # L3 root (no parent — OK as placeholder)
        _entry(l4_uri, parent_uri=l3_uri),  # L4 → L3 (valid existing)
    ]

    # Proposed: rewrite L3 to anchor to L4 → creates cycle L3→L4→L3
    result = validate_dag_write(
        proposed_uri=l3_uri,
        proposed_parent_uri=l4_uri,
        existing_entries=existing,
    )

    # Should be rejected: either cycle detection or layer_inversion (L3→L4 is inversion)
    assert not result.accepted, (
        f"T03 FAILED: indirect cycle L3→L4→L3 should be rejected; "
        f"got accepted=True reason={result.reason!r}"
    )
    assert result.rejection_class in ("cycle", "layer_inversion", "self_anchor"), (
        f"T03 FAILED: unexpected rejection_class: {result.rejection_class!r}"
    )
    print(f"T03 PASS — indirect cycle/inversion L3-L4-L3 rejected: {result.rejection_class!r}")


# ── T04 — layer_inversion_rejection ──────────────────────────────────────────

def test_layer_inversion_rejection() -> None:
    """L_k anchors to L_{k+1} (deeper layer) — REJECTED (layer inversion)."""
    l2_uri = "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules"
    l3_uri = "golden_tablet://Layer_3/Entity_proj-c/Project_Rules"
    l4_uri = "golden_tablet://Layer_4/Entity_subproj-c/Project_Rules"

    existing = [
        _entry(l2_uri, None),
        _entry(l3_uri, l2_uri),
        _entry(l4_uri, l3_uri),
    ]

    # Proposed: L2 anchors to L4 (2→4 = inversion)
    result = validate_dag_write(
        proposed_uri=l2_uri,
        proposed_parent_uri=l4_uri,
        existing_entries=existing,
    )

    # Either layer_inversion or cycle (L2→L4→L3→L2 could be a cycle)
    assert not result.accepted, (
        f"T04 FAILED: L2→L4 inversion should be rejected; got reason={result.reason!r}"
    )
    # Layer inversion fires before cycle check
    assert result.rejection_class in ("layer_inversion", "cycle", "self_anchor"), (
        f"T04 FAILED: unexpected rejection_class: {result.rejection_class!r}"
    )
    print(f"T04 PASS — layer inversion L2-to-L4 rejected: {result.rejection_class!r}")


# ── T05 — valid_skip_layer_acceptance ─────────────────────────────────────────

def test_valid_skip_layer_acceptance() -> None:
    """
    L5 anchors directly to L3 (skipping L4) — ACCEPTED.
    Skip-layer is valid (L5→L3 satisfies L_k→L_{k-1+} rule where parent < k).
    """
    l1_uri = "golden_tablet://Layer_1/Entity_LBCorp/Canon"
    l2_uri = "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules"
    l3_uri = "golden_tablet://Layer_3/Entity_proj-d/Project_Rules"
    l5_uri = "golden_tablet://Layer_5/Entity_helm-d/Canon"

    existing = [
        _entry(l1_uri, None),
        _entry(l2_uri, l1_uri),
        _entry(l3_uri, l2_uri),
    ]

    # Proposed: L5 skips L4 and anchors directly to L3
    result = validate_dag_write(
        proposed_uri=l5_uri,
        proposed_parent_uri=l3_uri,
        existing_entries=existing,
    )

    assert result.accepted, (
        f"T05 FAILED: valid skip L5→L3 (no L4 in chain) should be accepted; "
        f"got reason={result.reason!r}, rejection_class={result.rejection_class!r}"
    )
    print(f"T05 PASS — valid skip-layer L5-to-L3 accepted (no L4 required)")


# ── T06 — orphan_anchor_rejection ────────────────────────────────────────────

def test_orphan_anchor_rejection() -> None:
    """
    parent_anchor_hash doesn't resolve to any existing IP Ledger entry — REJECTED.
    """
    l3_uri = "golden_tablet://Layer_3/Entity_proj-e/Project_Rules"
    nonexistent_parent = "golden_tablet://Layer_2/Entity_ghost/Platform_Rules"

    # Existing: no entries contain the parent URI
    existing = [
        _entry("golden_tablet://Layer_1/Entity_LBCorp/Canon", None),
        _entry("golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules", "golden_tablet://Layer_1/Entity_LBCorp/Canon"),
    ]
    # Note: nonexistent_parent is NOT in existing

    result = validate_dag_write(
        proposed_uri=l3_uri,
        proposed_parent_uri=nonexistent_parent,
        existing_entries=existing,
    )

    assert not result.accepted, f"T06 FAILED: orphan anchor should be rejected"
    assert result.rejection_class == "orphan", (
        f"T06 FAILED: rejection_class should be 'orphan', got {result.rejection_class!r}"
    )
    print(f"T06 PASS — orphan anchor rejected: {result.reason[:60]}...")


# ── T07 — self_anchor_rejection ───────────────────────────────────────────────

def test_self_anchor_rejection() -> None:
    """Proposed Eblet anchors to itself — REJECTED."""
    self_uri = "golden_tablet://Layer_3/Entity_proj-f/Project_Rules"
    existing = [
        _entry("golden_tablet://Layer_1/Entity_LBCorp/Canon", None),
        _entry("golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules", "golden_tablet://Layer_1/Entity_LBCorp/Canon"),
    ]

    result = validate_dag_write(
        proposed_uri=self_uri,
        proposed_parent_uri=self_uri,  # self-anchor
        existing_entries=existing,
    )

    assert not result.accepted, "T07 FAILED: self-anchor should be rejected"
    assert result.rejection_class == "self_anchor", (
        f"T07 FAILED: rejection_class should be 'self_anchor', got {result.rejection_class!r}"
    )
    print(f"T07 PASS — self-anchor rejected: {result.reason}")


# ── T08 — audit_log_on_rejection ──────────────────────────────────────────────

def test_audit_log_on_rejection() -> None:
    """Every rejection is logged to the Battery-dispatch register with event=dag_validation_rejection."""
    l3_uri = "golden_tablet://Layer_3/Entity_proj-g/Project_Rules"
    existing = [
        _entry("golden_tablet://Layer_1/Entity_LBCorp/Canon", None),
        _entry("golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules", "golden_tablet://Layer_1/Entity_LBCorp/Canon"),
    ]

    with tempfile.TemporaryDirectory() as tmpdir:
        dispatch_path = Path(tmpdir) / "battery_dispatch.jsonl"

        # Self-anchor rejection
        r1 = validate_dag_write(
            proposed_uri=l3_uri,
            proposed_parent_uri=l3_uri,
            existing_entries=existing,
            dispatch_path=dispatch_path,
        )
        # Orphan rejection
        r2 = validate_dag_write(
            proposed_uri=l3_uri,
            proposed_parent_uri="golden_tablet://Layer_2/Entity_ghost/Platform_Rules",
            existing_entries=existing,
            dispatch_path=dispatch_path,
        )
        # Layer inversion rejection
        r3 = validate_dag_write(
            proposed_uri="golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
            proposed_parent_uri="golden_tablet://Layer_4/Entity_subproj/Project_Rules",
            existing_entries=existing,
            dispatch_path=dispatch_path,
        )

        assert dispatch_path.exists(), "T08 FAILED: Battery-dispatch file not created"
        records = [json.loads(l) for l in dispatch_path.read_text().strip().splitlines()]

    assert all(not r.accepted for r in [r1, r2, r3]), (
        "T08 FAILED: all 3 validations should be rejected"
    )
    rejection_events = [r for r in records if r.get("event") == "dag_validation_rejection"]
    assert len(rejection_events) >= 3, (
        f"T08 FAILED: expected ≥3 rejection log entries, got {len(rejection_events)}"
    )
    # Each rejection should carry the proposed_uri and rejection_class
    for ev in rejection_events:
        assert "proposed_uri" in ev, "T08 FAILED: missing proposed_uri in log entry"
        assert "rejection_class" in ev, "T08 FAILED: missing rejection_class in log entry"

    print(
        f"T08 PASS — {len(rejection_events)} rejection entries logged in Battery-dispatch register"
    )


# ── Type alias to avoid 'Optional not defined' at top of test file ────────────

from typing import Optional  # noqa: E402 (after imports resolved)


# ── Runner ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    failures: list[str] = []
    tests = [
        test_valid_dag_acceptance,
        test_simple_cycle_rejection,
        test_indirect_cycle_rejection,
        test_layer_inversion_rejection,
        test_valid_skip_layer_acceptance,
        test_orphan_anchor_rejection,
        test_self_anchor_rejection,
        test_audit_log_on_rejection,
    ]
    for t in tests:
        try:
            t()
        except AssertionError as e:
            print(f"FAIL [{t.__name__}]: {e}", file=sys.stderr)
            failures.append(t.__name__)
        except Exception as e:
            import traceback
            print(f"ERROR [{t.__name__}]: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            failures.append(t.__name__)

    if failures:
        print(f"\n{len(failures)}/{len(tests)} tests FAILED: {failures}", file=sys.stderr)
        sys.exit(1)
    else:
        print(f"\nAll {len(tests)} KN049 tests PASSED")
        sys.exit(0)
