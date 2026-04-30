#!/usr/bin/env python3
"""
tests_kn045.py — KN045 Layer Addressing Scheme

8 tests (minimum per KN045 Phase D):
  T01 uri_parses_valid_format
  T02 uri_rejects_invalid_format
  T03 chain_walk_to_l1_root
  T04 hash_of_parent_pointer_validates
  T05 hash_of_parent_pointer_rejects_tampered
  T06 fragment_anchor_handled
  T07 forward_compat_new_tablet_class
  T08 multi_tenant_isolation_prep
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

from discipline_wing.federation.layer_addressing import (
    parse_uri,
    is_valid_uri,
    compute_parent_anchor_hash,
    verify_parent_anchor_hash,
    validate_hash_chain,
    build_chain_from_ledger,
    different_entities_same_layer,
    extract_layer,
    LayerAddress,
    persist_spec,
)


# ── T01 — uri_parses_valid_format ─────────────────────────────────────────────

def test_uri_parses_valid_format() -> None:
    """Valid golden_tablet:// URIs parse to correct LayerAddress fields."""
    cases = [
        (
            "golden_tablet://Layer_1/Entity_LBCorp/Canon",
            LayerAddress(layer=1, entity_id="LBCorp", tablet_class="Canon"),
        ),
        (
            "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
            LayerAddress(layer=2, entity_id="Upekrithen", tablet_class="Platform_Rules"),
        ),
        (
            "golden_tablet://Layer_3/Entity_proj-abc123/Project_Rules",
            LayerAddress(layer=3, entity_id="proj-abc123", tablet_class="Project_Rules"),
        ),
    ]
    for uri, expected in cases:
        addr = parse_uri(uri)
        assert addr.layer == expected.layer, (
            f"T01 FAILED [{uri!r}]: layer expected {expected.layer}, got {addr.layer}"
        )
        assert addr.entity_id == expected.entity_id, (
            f"T01 FAILED [{uri!r}]: entity_id expected {expected.entity_id!r}, got {addr.entity_id!r}"
        )
        assert addr.tablet_class == expected.tablet_class, (
            f"T01 FAILED [{uri!r}]: tablet_class expected {expected.tablet_class!r}, got {addr.tablet_class!r}"
        )
        # Roundtrip: to_uri() must produce the original URI (without anchor)
        regenerated = addr.to_uri()
        assert regenerated == uri, (
            f"T01 FAILED: roundtrip mismatch — original={uri!r}, regenerated={regenerated!r}"
        )

    print(f"T01 PASS — {len(cases)} valid URIs parsed + roundtrip verified")


# ── T02 — uri_rejects_invalid_format ─────────────────────────────────────────

def test_uri_rejects_invalid_format() -> None:
    """Invalid URIs raise ValueError from parse_uri; is_valid_uri returns False."""
    invalid_cases = [
        "http://Layer_1/Entity_LBCorp/Canon",          # wrong scheme
        "golden_tablet://layer_1/Entity_X/Canon",       # lowercase 'layer'
        "golden_tablet://Layer_0/Entity_X/Canon",       # layer=0 (must be ≥1)
        "golden_tablet://Layer_/Entity_X/Canon",        # missing layer int
        "golden_tablet://Layer_1/X/Canon",              # missing 'Entity_' prefix
        "golden_tablet://Layer_1/Entity_/Canon",        # empty entity_id
        "golden_tablet://Layer_1/Entity_X/",            # empty tablet_class
        "not-a-uri-at-all",
        "",
    ]
    for bad_uri in invalid_cases:
        assert not is_valid_uri(bad_uri), (
            f"T02 FAILED: is_valid_uri should return False for {bad_uri!r}"
        )
        try:
            parse_uri(bad_uri)
            assert False, f"T02 FAILED: parse_uri should raise ValueError for {bad_uri!r}"
        except ValueError:
            pass  # Expected

    print(f"T02 PASS — {len(invalid_cases)} invalid URIs correctly rejected")


# ── T03 — chain_walk_to_l1_root ───────────────────────────────────────────────

def test_chain_walk_to_l1_root() -> None:
    """
    build_chain_from_ledger walks from leaf (L5) through L4→L3→L2→L1.
    Chain should contain 5 entries; last entry is L1.
    """
    # Build a synthetic ledger with parent_uri pointers
    uris = [
        "golden_tablet://Layer_1/Entity_LBCorp/Canon",
        "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
        "golden_tablet://Layer_3/Entity_proj-abc/Project_Rules",
        "golden_tablet://Layer_4/Entity_subproj-001/Project_Rules",
        "golden_tablet://Layer_5/Entity_helm-uuid/Canon",
    ]
    ledger_entries = []
    for i, uri in enumerate(uris):
        entry = {
            "event_type": "mine_tablet",
            "tablet_id": f"T{i:04d}",
            "golden_tablet_uri": uri,
            "current_hash": "a" * 64,
            "parent_uri": uris[i - 1] if i > 0 else None,
        }
        ledger_entries.append(entry)

    result = build_chain_from_ledger(uris[-1], ledger_entries)

    assert result.valid, f"T03 FAILED: chain_walk returned invalid: {result.reason}"
    assert len(result.chain) == 5, (
        f"T03 FAILED: expected 5-entry chain (L5→L4→L3→L2→L1), got {len(result.chain)}"
    )
    assert result.chain[0].layer == 5, f"T03 FAILED: chain[0] should be L5, got L{result.chain[0].layer}"
    assert result.chain[-1].layer == 1, f"T03 FAILED: chain[-1] should be L1, got L{result.chain[-1].layer}"

    print(f"T03 PASS — L5-to-L1 chain walked successfully ({len(result.chain)} hops)")


# ── T04 — hash_of_parent_pointer_validates ────────────────────────────────────

def test_hash_of_parent_pointer_validates() -> None:
    """
    validate_hash_chain accepts a correct hash-of-parent chain (L3→L2→L1).
    """
    contents = ["l1-content", "l2-content", "l3-content"]
    uris = [
        "golden_tablet://Layer_1/Entity_LBCorp/Canon",
        "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
        "golden_tablet://Layer_3/Entity_proj-x/Project_Rules",
    ]

    # Build chain entries — each L_k stores hash of L_{k-1}
    chain_entries = []
    for i, (content, uri) in enumerate(zip(contents, uris)):
        entry = {"uri": uri, "content": content, "parent_anchor_hash": None, "parent_uri": None}
        if i > 0:
            parent_content = contents[i - 1]
            parent_uri = uris[i - 1]
            entry["parent_anchor_hash"] = compute_parent_anchor_hash(parent_content, parent_uri)
            entry["parent_uri"] = parent_uri
        chain_entries.append(entry)

    result = validate_hash_chain(chain_entries)

    assert result.valid, f"T04 FAILED: valid chain rejected: {result.reason}"
    assert len(result.chain) == 3, f"T04 FAILED: expected 3 chain entries, got {len(result.chain)}"

    print(f"T04 PASS — hash-of-parent chain (L1-L2-L3) validates correctly")


# ── T05 — hash_of_parent_pointer_rejects_tampered ────────────────────────────

def test_hash_of_parent_pointer_rejects_tampered() -> None:
    """
    validate_hash_chain rejects a chain where a parent_anchor_hash has been tampered with.
    """
    contents = ["l1-content", "l2-content", "l3-content"]
    uris = [
        "golden_tablet://Layer_1/Entity_LBCorp/Canon",
        "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
        "golden_tablet://Layer_3/Entity_proj-x/Project_Rules",
    ]

    chain_entries = []
    for i, (content, uri) in enumerate(zip(contents, uris)):
        entry = {"uri": uri, "content": content, "parent_anchor_hash": None, "parent_uri": None}
        if i > 0:
            parent_content = contents[i - 1]
            parent_uri = uris[i - 1]
            entry["parent_anchor_hash"] = compute_parent_anchor_hash(parent_content, parent_uri)
            entry["parent_uri"] = parent_uri
        chain_entries.append(entry)

    # Tamper: corrupt the parent_anchor_hash at index 2 (L3)
    chain_entries[2]["parent_anchor_hash"] = "deadbeef" * 8

    result = validate_hash_chain(chain_entries)

    assert not result.valid, "T05 FAILED: tampered chain should be invalid"
    assert "mismatch" in result.reason.lower() or "tamper" in result.reason.lower(), (
        f"T05 FAILED: reason should mention mismatch/tamper, got: {result.reason!r}"
    )

    print(f"T05 PASS — tampered hash-of-parent correctly rejected: {result.reason[:60]}...")


# ── T06 — fragment_anchor_handled ─────────────────────────────────────────────

def test_fragment_anchor_handled() -> None:
    """URIs with #anchor fragment parse correctly and roundtrip."""
    uri = "golden_tablet://Layer_3/Entity_proj-x/Project_Rules#section-4"
    addr = parse_uri(uri)

    assert addr.anchor == "section-4", (
        f"T06 FAILED: anchor expected 'section-4', got {addr.anchor!r}"
    )
    assert addr.layer == 3, f"T06 FAILED: layer expected 3, got {addr.layer}"
    assert addr.tablet_class == "Project_Rules", (
        f"T06 FAILED: tablet_class expected 'Project_Rules', got {addr.tablet_class!r}"
    )
    # Roundtrip preserves anchor
    regenerated = addr.to_uri()
    assert regenerated == uri, (
        f"T06 FAILED: roundtrip with anchor failed: {regenerated!r} != {uri!r}"
    )

    print(f"T06 PASS — fragment anchor parsed and roundtripped: {addr.anchor!r}")


# ── T07 — forward_compat_new_tablet_class ────────────────────────────────────

def test_forward_compat_new_tablet_class() -> None:
    """Unknown tablet_class values (future extensions) are accepted by the parser (D.1)."""
    future_classes = ["Member_Charter", "SubProject_Rules", "HelmRules", "CustomClass"]
    for cls in future_classes:
        uri = f"golden_tablet://Layer_3/Entity_x/{cls}"
        assert is_valid_uri(uri), (
            f"T07 FAILED: future tablet_class {cls!r} should be accepted"
        )
        addr = parse_uri(uri)
        assert addr.tablet_class == cls, (
            f"T07 FAILED: tablet_class mismatch for {cls!r}: got {addr.tablet_class!r}"
        )

    print(f"T07 PASS — {len(future_classes)} future tablet_class values accepted (forward-compat)")


# ── T08 — multi_tenant_isolation_prep ────────────────────────────────────────

def test_multi_tenant_isolation_prep() -> None:
    """
    different_entities_same_layer() ensures two L3 entities are isolated.
    extract_layer() correctly identifies layer for tenant-dispatch routing.
    """
    uri_a = "golden_tablet://Layer_3/Entity_proj-alpha/Project_Rules"
    uri_b = "golden_tablet://Layer_3/Entity_proj-beta/Project_Rules"
    uri_c = "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules"

    # Same layer, different entities → isolated
    assert different_entities_same_layer(uri_a, uri_b) is True, (
        "T08 FAILED: same-layer different-entity check failed"
    )
    # Different layers → not same-layer isolated
    assert different_entities_same_layer(uri_a, uri_c) is False, (
        "T08 FAILED: cross-layer check should return False"
    )

    # Layer extraction
    assert extract_layer(uri_a) == 3, f"T08 FAILED: extract_layer for L3 URI"
    assert extract_layer(uri_c) == 2, f"T08 FAILED: extract_layer for L2 URI"
    assert extract_layer("not-a-uri") is None, "T08 FAILED: invalid URI should return None"

    # Spec persistence smoke-test
    with tempfile.TemporaryDirectory() as tmpdir:
        spec_path = Path(tmpdir) / "layer_addressing_scheme.md"
        persisted = persist_spec(spec_path)
        assert persisted.exists(), "T08 FAILED: spec file not written"
        content = persisted.read_text(encoding="utf-8")
        assert "golden_tablet://" in content, "T08 FAILED: spec missing URI examples"
        assert "SHA-256" in content, "T08 FAILED: spec missing algorithm note"

    print("T08 PASS — multi-tenant isolation prep: layer isolation + entity separation verified")


# ── Runner ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    failures: list[str] = []
    tests = [
        test_uri_parses_valid_format,
        test_uri_rejects_invalid_format,
        test_chain_walk_to_l1_root,
        test_hash_of_parent_pointer_validates,
        test_hash_of_parent_pointer_rejects_tampered,
        test_fragment_anchor_handled,
        test_forward_compat_new_tablet_class,
        test_multi_tenant_isolation_prep,
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
        print(f"\nAll {len(tests)} KN045 tests PASSED")
        sys.exit(0)
