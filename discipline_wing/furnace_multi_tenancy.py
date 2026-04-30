"""
Furnace Multi-Tenancy — KN046 / BP005 Federation Infrastructure

Extends the Furnace Eblet-QR-Scan API (KN044) to support per-layer IP Ledger
lookup using the KN045 golden_tablet:// URI scheme.  Each Layer (L1–L_n) has
its own IP Ledger; Furnace serves all layers via a single canonical service.

Architecture:
  - Per-layer IP Ledger storage: single Ledger DB with `layer` partition column
    (DECISION: option (a) — one store, multi-tenant isolation via layer_id filter)
    Rationale: simplifies audit; one scan of all layers; layer column is indexed.
  - Per-layer rate-limit (Slow Blade extension): each layer has its own token
    bucket so one tenant's traffic cannot drain another's quota.
  - Per-layer Battery-dispatch register: scan logs partitioned by layer_id.
  - Cross-layer anchor verification: child-layer Eblet anchors to parent layer;
    Furnace walks chain via KN045 chain-builder; rejects orphan/tampered anchors.
  - Marked Exception L1: LB-source Eblets at L1 always return Canon/Lore/Rules.
  - Marked Exception L2+: each layer's own Marked Exception per its Part B config.

Storage:
  - Layer 1 (L1/LB Corp): inherits from KN044 → librarian-mcp/miners/ip_ledger.jsonl
  - Layer N (N≥2): ~/.claude/state/federation/ledgers/layer_N/ip_ledger.jsonl

Composes with:
  - KN044 furnace_eblet_qr_scan.scan_eblet() — extends with per-layer dispatch
  - KN045 layer_addressing.parse_uri()        — extracts layer from golden_tablet:// URI
  - KN049 dag_validation                      — cycles are rejected before lookup
  - #2260 Cooperative Defensive Patent Pledge — all outputs sovereignty-stripped

KN046 / BP005 — Founder-ratified federation infrastructure.
"""

from __future__ import annotations

import json
import os
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import discipline_wing.furnace_eblet_qr_scan as _furnace_kn044
from discipline_wing.federation.layer_addressing import (
    parse_uri,
    is_valid_uri,
    extract_layer,
    build_chain_from_ledger,
    ChainValidationResult,
)

# ── Paths ──────────────────────────────────────────────────────────────────────

_WORKSPACE = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
_L1_LEDGER_PATH = _WORKSPACE / "librarian-mcp" / "miners" / "ip_ledger.jsonl"
_FEDERATION_LEDGER_ROOT = Path(os.path.expanduser("~/.claude/state/federation/ledgers"))

# ── Per-layer configuration registry ──────────────────────────────────────────

@dataclass
class LayerConfig:
    """Runtime configuration for one federation layer."""
    layer_id: str          # e.g. "L1", "L2", "L3"
    layer_int: int         # e.g. 1, 2, 3
    ledger_path: Path      # IP Ledger path for this layer
    rate_capacity: int = 10
    rate_refill: float = 2.0
    marked_exception_rule: str = ""   # "Canon/Lore/Rules" for L1; Part-B path for L2+
    is_lb_root: bool = False          # True only for L1

    def __post_init__(self) -> None:
        if self.layer_int == 1:
            self.is_lb_root = True
            if not self.marked_exception_rule:
                self.marked_exception_rule = "Canon/Lore/Rules"


_LAYER_REGISTRY_LOCK = threading.Lock()
_LAYER_REGISTRY: dict[str, LayerConfig] = {}


def _default_l1_config() -> LayerConfig:
    return LayerConfig(
        layer_id="L1",
        layer_int=1,
        ledger_path=_L1_LEDGER_PATH,
        marked_exception_rule="Canon/Lore/Rules",
    )


def register_layer(
    layer_id: str,
    layer_int: int,
    ledger_path: Optional[Path] = None,
    rate_capacity: int = 10,
    rate_refill: float = 2.0,
    marked_exception_rule: str = "",
) -> LayerConfig:
    """
    Register a federation layer in the multi-tenant registry.
    Idempotent: re-registering with same layer_id updates the config.
    Called at layer-bootstrap time (or on-demand for new layers — D.3).
    """
    if ledger_path is None:
        if layer_int == 1:
            ledger_path = _L1_LEDGER_PATH
        else:
            ledger_path = _FEDERATION_LEDGER_ROOT / f"layer_{layer_int}" / "ip_ledger.jsonl"
            ledger_path.parent.mkdir(parents=True, exist_ok=True)

    cfg = LayerConfig(
        layer_id=layer_id,
        layer_int=layer_int,
        ledger_path=ledger_path,
        rate_capacity=rate_capacity,
        rate_refill=rate_refill,
        marked_exception_rule=marked_exception_rule,
    )
    with _LAYER_REGISTRY_LOCK:
        _LAYER_REGISTRY[layer_id] = cfg

    # Wire Slow Blade rate-limit for this layer (KN044 composition)
    _furnace_kn044.set_layer_rate_override(layer_id, rate_capacity, rate_refill)

    return cfg


def get_layer_config(layer_id: str) -> LayerConfig:
    """Return registered LayerConfig or auto-initialize with defaults."""
    with _LAYER_REGISTRY_LOCK:
        cfg = _LAYER_REGISTRY.get(layer_id)
    if cfg is None:
        # Auto-init: derive layer_int from layer_id (e.g. "L3" → 3)
        try:
            lint = int(layer_id.lstrip("Ll"))
        except (ValueError, AttributeError):
            lint = 1  # Fallback to L1
        if lint == 1:
            cfg = _default_l1_config()
        else:
            cfg = register_layer(layer_id, lint)
    return cfg


def _resolve_layer_id(eblet_id_or_uri: str) -> str:
    """
    Resolve layer_id from an eblet identifier.
    If it's a golden_tablet:// URI (KN045), extract layer.
    Otherwise default to "L1" (backwards-compat with KN044 raw tablet_ids).
    """
    if is_valid_uri(eblet_id_or_uri):
        layer_int = extract_layer(eblet_id_or_uri)
        if layer_int is not None:
            return f"L{layer_int}"
    return "L1"


# ── Cross-layer anchor verification ───────────────────────────────────────────

def verify_cross_layer_anchor(
    child_uri: str,
    ledger_entries: list[dict],
) -> ChainValidationResult:
    """
    Verify cross-layer anchor chain: walk the chain from child_uri to L1 root,
    confirming each parent_anchor resolves to a valid existing ledger entry.

    Rejects:
      - Orphan anchors (parent_uri not found in any known ledger)
      - Tampered hash-of-parent-pointer (KN045 chain validation)
      - Cycles (KN049 pre-condition: DAG must be cycle-free before reaching here)
    """
    return build_chain_from_ledger(child_uri, ledger_entries)


def load_all_layers_ledger(layer_ids: Optional[list[str]] = None) -> list[dict]:
    """
    Load IP Ledger entries across multiple layers for cross-layer anchor verification.
    When layer_ids is None, loads all registered layers.
    """
    target_ids = layer_ids or list(_LAYER_REGISTRY.keys()) or ["L1"]
    all_entries: list[dict] = []
    for lid in target_ids:
        cfg = get_layer_config(lid)
        entries = _furnace_kn044.load_ip_ledger(cfg.ledger_path)
        for entry in entries:
            if "layer_id" not in entry:
                entry = dict(entry)
                entry["layer_id"] = lid
            all_entries.append(entry)
    return all_entries


# ── Multi-tenant scan API ──────────────────────────────────────────────────────

def scan_eblet_multi_tenant(
    eblet_id: str,
    expected_anchor_hash: str,
    scanner_metadata: Optional[dict] = None,
    explicit_layer_id: Optional[str] = None,
) -> dict:
    """
    Multi-tenant Furnace Eblet-QR-Scan.

    Extends KN044 scan_eblet() with per-layer dispatch:
      1. Resolve layer from eblet_id (URI or explicit_layer_id override)
      2. Use layer's own IP Ledger for lookup
      3. Apply per-layer Marked Exception rule
      4. Log to Battery-dispatch register with layer partition

    Backwards-compat: raw tablet_ids (non-URI) default to L1 lookup (T10).

    Args:
        eblet_id:          Eblet identifier or golden_tablet:// URI (KN045).
        expected_anchor_hash: SHA-256 hash from QR code payload.
        scanner_metadata:  Optional scanner context (ignored for Marked Exception layers).
        explicit_layer_id: Override layer resolution (e.g. "L3" even for raw tablet_id).
    """
    if scanner_metadata is None:
        scanner_metadata = {}

    # Resolve layer
    layer_id = explicit_layer_id or _resolve_layer_id(eblet_id)
    cfg = get_layer_config(layer_id)

    # Delegate to KN044 with per-layer ledger path + layer_id for Slow Blade bucket
    return _furnace_kn044.scan_eblet(
        eblet_id=eblet_id,
        expected_anchor_hash=expected_anchor_hash,
        scanner_metadata=scanner_metadata,
        ledger_path=cfg.ledger_path,
        layer_id=layer_id,
    )


def scan_eblet_with_chain_verification(
    eblet_id: str,
    expected_anchor_hash: str,
    scanner_metadata: Optional[dict] = None,
    explicit_layer_id: Optional[str] = None,
) -> dict:
    """
    Full multi-tenant scan with cross-layer chain verification.

    In addition to standard per-layer scan (scan_eblet_multi_tenant), this variant:
      - Loads all registered layers' ledger entries
      - Walks the parent-anchor chain from this Eblet to L1 root
      - Rejects if chain is broken or tampered

    Returns the standard scan result with an additional `chain_verification` field:
        {verified: bool, ..., chain_verification: {valid: bool, chain_length: int, reason: str}}
    """
    # First do the standard scan
    result = scan_eblet_multi_tenant(
        eblet_id=eblet_id,
        expected_anchor_hash=expected_anchor_hash,
        scanner_metadata=scanner_metadata,
        explicit_layer_id=explicit_layer_id,
    )

    # Cross-layer chain verification (only if scan succeeded)
    if result.get("verified") and is_valid_uri(eblet_id):
        all_entries = load_all_layers_ledger()
        chain_result = verify_cross_layer_anchor(eblet_id, all_entries)
        result["chain_verification"] = {
            "valid": chain_result.valid,
            "chain_length": len(chain_result.chain),
            "reason": chain_result.reason,
            "layers_in_chain": [addr.layer for addr in chain_result.chain],
        }
    else:
        result["chain_verification"] = {
            "valid": False if result.get("verified") else None,
            "chain_length": 0,
            "reason": "chain_verification_skipped" if not is_valid_uri(eblet_id) else "scan_failed",
        }

    return result


# ── Layer addition (D.3 — no breaking change) ─────────────────────────────────

def add_layer(
    layer_int: int,
    entity_id: str = "",
    rate_capacity: int = 10,
    rate_refill: float = 2.0,
    marked_exception_rule: str = "",
) -> LayerConfig:
    """
    Add a new layer to the federation at runtime.
    Existing layers are unaffected (D.3 — layer_addition_no_breaking).
    """
    layer_id = f"L{layer_int}"
    return register_layer(
        layer_id=layer_id,
        layer_int=layer_int,
        rate_capacity=rate_capacity,
        rate_refill=rate_refill,
        marked_exception_rule=marked_exception_rule,
    )


# ── Audit: per-tenant Battery-dispatch summary ────────────────────────────────

def get_battery_dispatch_for_layer(layer_id: str) -> list[dict]:
    """
    Read Battery-dispatch register entries for a specific layer.
    Implements per-tenant audit log partitioning (T05 — battery_dispatch_per_tenant).
    """
    dispatch_path = _furnace_kn044.BATTERY_DISPATCH_PATH
    if not dispatch_path.exists():
        return []
    entries = []
    with open(dispatch_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                if record.get("layer_id") == layer_id:
                    entries.append(record)
            except json.JSONDecodeError:
                pass
    return entries


# ── Bootstrap L1 at import time ───────────────────────────────────────────────

# Auto-register L1 (LB Corp root) when this module is imported.
# This ensures the default layer is always available for backwards-compat (T10).
register_layer("L1", 1, _L1_LEDGER_PATH, marked_exception_rule="Canon/Lore/Rules")
