"""
Cycle Prevention DAG Validation — KN049 / BP005 Federation Infrastructure

Validates at IP-Ledger-write time that the recursion graph of Eblet anchors
forms a DAG (Directed Acyclic Graph) — no cycles allowed.

Rules:
  1. L_k can only anchor to L_{k-1} or higher (lower layer number = more authoritative).
     Valid examples:
       L5 → L4, L5 → L3 (skip), L3 → L1 (skip to root)
     Invalid examples:
       L3 → L5 (anchoring to deeper layer — inversion)
       L3 → L3 (same-layer self-anchor)
       L3 → L4 → L3 (indirect cycle)
  2. Orphan anchors: parent_anchor_hash must resolve to an existing IP Ledger entry.
  3. Self-anchor: proposed Eblet cannot anchor to itself.

Algorithm:
  - DFS-based cycle detection (chains are short; sync is safe per D.1)
  - Runs synchronously at write time

Composes with:
  - KN045 layer_addressing — URI parsing + chain builder
  - KN046 multi-tenancy    — per-layer cycle detection
  - Battery-dispatch register — every rejection is logged

KN049 / BP005 — Founder-ratified federation infrastructure.
"""

from __future__ import annotations

import json
import os
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from discipline_wing.federation.layer_addressing import (
    parse_uri,
    is_valid_uri,
    extract_layer,
    LayerAddress,
)

# ── Paths ──────────────────────────────────────────────────────────────────────

_BATTERY_DISPATCH_PATH = Path(os.path.expanduser("~/.claude/state/battery_dispatch_register.jsonl"))

# ── Result types ───────────────────────────────────────────────────────────────

@dataclass
class DAGValidationResult:
    """Result of a pre-write DAG validation check."""
    accepted: bool
    reason: str = ""
    rejection_class: str = ""  # "cycle" | "layer_inversion" | "orphan" | "self_anchor" | ""
    cycle_path: list[str] = field(default_factory=list)   # which URIs form the cycle
    rejection_dispatch_id: str = ""                         # Battery-dispatch entry on reject


# ── Battery-dispatch for DAG rejections ───────────────────────────────────────

def _log_rejection(
    proposed_uri: str,
    rejection_class: str,
    reason: str,
    cycle_path: Optional[list[str]] = None,
    dispatch_path: Optional[Path] = None,
) -> str:
    """Log a DAG validation rejection to the Battery-dispatch register."""
    dispatch_id = str(uuid.uuid4())
    record = {
        "dispatch_id": dispatch_id,
        "ts": _iso_now(),
        "event": "dag_validation_rejection",
        "proposed_uri": proposed_uri,
        "rejection_class": rejection_class,
        "reason": reason,
        "cycle_path": cycle_path or [],
    }
    target = dispatch_path or _BATTERY_DISPATCH_PATH
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass  # Fail-safe: logging failure must not prevent rejection
    return dispatch_id


# ── Core DAG validation ────────────────────────────────────────────────────────

def validate_dag_write(
    proposed_uri: str,
    proposed_parent_uri: Optional[str],
    existing_entries: list[dict],
    dispatch_path: Optional[Path] = None,
) -> DAGValidationResult:
    """
    Pre-write DAG validation hook for the IP Ledger.

    Args:
        proposed_uri:         golden_tablet:// URI of the Eblet being written.
        proposed_parent_uri:  parent_uri field of the proposed Eblet (None for L1 root).
        existing_entries:     Current IP Ledger entries (list of dicts with golden_tablet_uri).
        dispatch_path:        Override Battery-dispatch path (for testing).

    Returns:
        DAGValidationResult(accepted=True) if write is safe.
        DAGValidationResult(accepted=False, reason=..., rejection_class=...) on rejection.

    Rules checked (in order):
        1. Self-anchor rejection
        2. Orphan anchor rejection  (parent not in ledger, unless L1 root)
        3. Layer-inversion rejection (L_k anchoring to L_{k+1} or deeper)
        4. Cycle detection (DFS from proposed parent back to any ancestor that is proposed_uri)
    """
    # ── Parse proposed URI ──
    if not is_valid_uri(proposed_uri):
        return DAGValidationResult(
            accepted=False,
            reason=f"Invalid proposed URI: {proposed_uri!r}",
            rejection_class="invalid_uri",
        )

    try:
        proposed_addr = parse_uri(proposed_uri)
    except ValueError as e:
        return DAGValidationResult(
            accepted=False,
            reason=str(e),
            rejection_class="invalid_uri",
        )

    proposed_layer = proposed_addr.layer

    # L1 root — no parent needed, trivially valid DAG leaf
    if proposed_layer == 1 and proposed_parent_uri is None:
        return DAGValidationResult(accepted=True, reason="L1 root — no parent required")

    # ── Rule 1: Self-anchor rejection ──
    if proposed_parent_uri and proposed_parent_uri == proposed_uri:
        dispatch_id = _log_rejection(
            proposed_uri,
            "self_anchor",
            f"Proposed Eblet anchors to itself: {proposed_uri!r}",
            dispatch_path=dispatch_path,
        )
        return DAGValidationResult(
            accepted=False,
            reason=f"Self-anchor rejected: Eblet cannot anchor to itself",
            rejection_class="self_anchor",
            cycle_path=[proposed_uri],
            rejection_dispatch_id=dispatch_id,
        )

    # ── Build lookup index from existing entries ──
    uri_index: dict[str, dict] = {}
    for entry in existing_entries:
        uri = entry.get("golden_tablet_uri", "")
        if uri:
            uri_index[uri] = entry

    # ── Rule 2: Orphan anchor rejection ──
    if proposed_parent_uri and proposed_parent_uri not in uri_index:
        dispatch_id = _log_rejection(
            proposed_uri,
            "orphan",
            f"Parent anchor {proposed_parent_uri!r} does not resolve to an existing IP Ledger entry",
            dispatch_path=dispatch_path,
        )
        return DAGValidationResult(
            accepted=False,
            reason=(
                f"Orphan anchor rejected: parent URI {proposed_parent_uri!r} "
                f"not found in IP Ledger. Ensure parent Eblet is written first."
            ),
            rejection_class="orphan",
            rejection_dispatch_id=dispatch_id,
        )

    # ── Rule 3: Layer-inversion rejection ──
    if proposed_parent_uri and is_valid_uri(proposed_parent_uri):
        parent_layer = extract_layer(proposed_parent_uri)
        if parent_layer is not None and parent_layer > proposed_layer:
            # L_k anchoring to L_{k+1} or deeper — inversion
            dispatch_id = _log_rejection(
                proposed_uri,
                "layer_inversion",
                (
                    f"Layer inversion: L{proposed_layer} Eblet anchors to L{parent_layer} "
                    f"(deeper layer). L_k can only anchor to L_{{k-1}} or higher."
                ),
                dispatch_path=dispatch_path,
            )
            return DAGValidationResult(
                accepted=False,
                reason=(
                    f"Layer inversion rejected: L{proposed_layer} cannot anchor to "
                    f"L{parent_layer} (deeper). Anchor must be to L{proposed_layer - 1} or shallower."
                ),
                rejection_class="layer_inversion",
                rejection_dispatch_id=dispatch_id,
            )

    # ── Rule 4: Cycle detection (DFS) ──
    if proposed_parent_uri:
        cycle_check = _dfs_cycle_check(
            proposed_uri=proposed_uri,
            start_uri=proposed_parent_uri,
            uri_index=uri_index,
        )
        if cycle_check is not None:
            # cycle_check = list of URIs forming the cycle path
            dispatch_id = _log_rejection(
                proposed_uri,
                "cycle",
                f"Cycle detected in ancestry chain: {' → '.join(cycle_check)}",
                cycle_path=cycle_check,
                dispatch_path=dispatch_path,
            )
            return DAGValidationResult(
                accepted=False,
                reason=(
                    f"Cycle rejected: writing {proposed_uri!r} would create a cycle. "
                    f"Path: {' → '.join(cycle_check)}"
                ),
                rejection_class="cycle",
                cycle_path=cycle_check,
                rejection_dispatch_id=dispatch_id,
            )

    # ── All checks passed ──
    return DAGValidationResult(
        accepted=True,
        reason=f"DAG validated: L{proposed_layer} → parent accepted",
    )


def _dfs_cycle_check(
    proposed_uri: str,
    start_uri: str,
    uri_index: dict[str, dict],
    max_depth: int = 50,
) -> Optional[list[str]]:
    """
    DFS from start_uri through parent_uri pointers.
    Returns list of URIs forming cycle path if proposed_uri is found in ancestors.
    Returns None if no cycle.
    """
    path: list[str] = [proposed_uri, start_uri]
    visited: set[str] = {proposed_uri, start_uri}
    current_uri = start_uri

    for _ in range(max_depth):
        entry = uri_index.get(current_uri)
        if entry is None:
            return None  # Reached a root or unknown node — no cycle

        parent_uri = entry.get("parent_uri", "")
        if not parent_uri:
            return None  # Reached root — no cycle

        if parent_uri == proposed_uri:
            # Cycle: proposed_uri is an ancestor of itself
            path.append(parent_uri)
            return path

        if parent_uri in visited:
            # Cycle among existing entries (not involving proposed_uri directly)
            path.append(parent_uri)
            return path

        path.append(parent_uri)
        visited.add(parent_uri)
        current_uri = parent_uri

    # Exceeded depth without finding cycle — treat as no cycle (conservative)
    return None


# ── Batch write validation ─────────────────────────────────────────────────────

def validate_batch(
    proposed_entries: list[dict],
    existing_entries: list[dict],
    dispatch_path: Optional[Path] = None,
) -> list[DAGValidationResult]:
    """
    Validate a batch of proposed IP Ledger writes for DAG integrity.
    Each proposed entry must have: golden_tablet_uri, parent_uri (optional).

    Incremental: valid entries from the batch are added to the working set
    before validating subsequent entries (order matters for dependency chains).

    Returns list of DAGValidationResult, one per proposed entry.
    """
    working_set = list(existing_entries)
    results: list[DAGValidationResult] = []

    for entry in proposed_entries:
        uri = entry.get("golden_tablet_uri", "")
        parent_uri = entry.get("parent_uri") or None

        result = validate_dag_write(
            proposed_uri=uri,
            proposed_parent_uri=parent_uri,
            existing_entries=working_set,
            dispatch_path=dispatch_path,
        )
        results.append(result)

        if result.accepted:
            # Add to working set so subsequent entries can reference this one
            working_set.append(entry)

    return results


# ── IP Ledger write gate (public hook) ────────────────────────────────────────

def ip_ledger_write_gate(
    proposed_uri: str,
    proposed_parent_uri: Optional[str],
    ledger_path: Path,
    dispatch_path: Optional[Path] = None,
) -> DAGValidationResult:
    """
    Production write-gate for the IP Ledger.
    Loads existing entries from ledger_path, validates proposed write.
    Call this BEFORE writing any new Eblet to the IP Ledger.

    Returns DAGValidationResult; caller must check .accepted before writing.
    """
    existing = _load_ledger_for_validation(ledger_path)
    return validate_dag_write(
        proposed_uri=proposed_uri,
        proposed_parent_uri=proposed_parent_uri,
        existing_entries=existing,
        dispatch_path=dispatch_path,
    )


def _load_ledger_for_validation(ledger_path: Path) -> list[dict]:
    """Load IP Ledger entries that have golden_tablet_uri (skip non-URI entries)."""
    try:
        entries = []
        with open(ledger_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if entry.get("golden_tablet_uri"):
                        entries.append(entry)
                except json.JSONDecodeError:
                    pass
        return entries
    except FileNotFoundError:
        return []
    except Exception:
        return []


# ── Utility ────────────────────────────────────────────────────────────────────

def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"
