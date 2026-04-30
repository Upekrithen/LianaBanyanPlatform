"""
Furnace Eblet-QR-Scan API — KN044 / BP005 Federation Infrastructure

POST /furnace/scan/eblet  (function-level API, not HTTP-bound)

Accepts Eblet-QR-scan requests, verifies against IP Ledger anchor, returns
canonical-resolution + Battery-dispatch register entry.

Composes with:
  - Furnace-every-click R2 closure (B119) — every scan is logged
  - Slow Blade V2 rate-limit — token-bucket per scanner client_id
  - Ring of Three Golden Eblets federation canon — Marked Exception enforcement
  - Battery-dispatch register — append-only scan audit trail
  - KN045 (layer addressing) — eblet_id will accept golden_tablet:// URIs when KN045 lands
  - KN046 (multi-tenancy)   — lookup becomes per-layer when KN046 lands

Marked Exception (Federation canon): LB-source Eblets (layer=1) ALWAYS return
Canon/Lore/Rules canonical path regardless of scanner_metadata routing hints.

IP Ledger: librarian-mcp/miners/ip_ledger.jsonl (flat JSONL, hash-chained).
Battery-dispatch register: ~/.claude/state/battery_dispatch_register.jsonl

KN044 / BP005 — Founder-ratified federation infrastructure.
"""

from __future__ import annotations

import hashlib
import json
import os
import threading
import time
import uuid
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Optional

# ── Paths ──────────────────────────────────────────────────────────────────────

_WORKSPACE = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
IP_LEDGER_PATH = _WORKSPACE / "librarian-mcp" / "miners" / "ip_ledger.jsonl"
BATTERY_DISPATCH_PATH = Path(os.path.expanduser("~/.claude/state/battery_dispatch_register.jsonl"))

# Canonical resolution base for LB-source (Layer 1) Marked Exception
LB_CANON_LORE_RULES_BASE = "golden_tablet://Layer_1/Entity_LBCorp/Canon"

# Soft-deflect URL for QR verification failures (Furnace-every-click R2 closure)
SOFT_DEFLECT_BASE = "https://lianabanyan.com/furnace/verify?deflect=true"

# ── Slow Blade rate-limit (Dune reference) ─────────────────────────────────────

_SLOW_BLADE_LOCK = threading.Lock()
_SLOW_BLADE_BUCKETS: dict[str, dict] = {}

# Defaults: 10 req/second burst, refill 2 req/second (bot deterrent)
_SLOW_BLADE_CAPACITY = 10
_SLOW_BLADE_REFILL_RATE = 2.0   # tokens/second

# Per-layer overrides (layer_id → rate override) — set by KN046 multi-tenancy
_layer_rate_overrides: dict[str, dict] = {}


def _slow_blade_check(client_id: str, layer_id: str = "L1") -> bool:
    """
    Token-bucket rate-limit check for Slow Blade V2.

    Returns True if the request is allowed; False if rate-limited (bot-class traffic).
    Per-layer buckets: KN046 multi-tenancy wires per-layer overrides via
    set_layer_rate_override(); default LB-Corp L1 limits applied when no override.
    """
    bucket_key = f"{layer_id}:{client_id}"
    now = time.monotonic()
    override = _layer_rate_overrides.get(layer_id, {})
    capacity = override.get("capacity", _SLOW_BLADE_CAPACITY)
    refill_rate = override.get("refill_rate", _SLOW_BLADE_REFILL_RATE)

    with _SLOW_BLADE_LOCK:
        bucket = _SLOW_BLADE_BUCKETS.get(bucket_key)
        if bucket is None:
            bucket = {"tokens": float(capacity), "last_refill": now}
            _SLOW_BLADE_BUCKETS[bucket_key] = bucket

        elapsed = now - bucket["last_refill"]
        refilled = min(capacity, bucket["tokens"] + elapsed * refill_rate)
        bucket["tokens"] = refilled
        bucket["last_refill"] = now

        if bucket["tokens"] >= 1.0:
            bucket["tokens"] -= 1.0
            return True
        return False


def set_layer_rate_override(layer_id: str, capacity: int, refill_rate: float) -> None:
    """
    Register a per-layer rate-limit override for Slow Blade.
    Called by KN046 multi-tenancy layer configuration.
    """
    _layer_rate_overrides[layer_id] = {"capacity": capacity, "refill_rate": refill_rate}


# ── Battery-dispatch register ──────────────────────────────────────────────────

def _write_battery_dispatch(entry: dict) -> str:
    """
    Append a scan entry to the Battery-dispatch register.
    Returns the dispatch_id. Never raises (Furnace-every-click R2 closure must be robust).
    Partitioned by layer_id when multi-tenancy is active (KN046 composes here).
    """
    dispatch_id = str(uuid.uuid4())
    record = {
        "dispatch_id": dispatch_id,
        "ts": _iso_now(),
        **entry,
    }
    try:
        BATTERY_DISPATCH_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(BATTERY_DISPATCH_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass  # Fail-safe: dispatch failure must never prevent scan response
    return dispatch_id


# ── IP Ledger lookup ───────────────────────────────────────────────────────────

def load_ip_ledger(ledger_path: Optional[Path] = None) -> list[dict]:
    """
    Load the IP Ledger from disk. Returns list of JSONL entries.
    Gracefully returns empty list if ledger is unavailable.
    """
    path = ledger_path or IP_LEDGER_PATH
    try:
        entries = []
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
        return entries
    except FileNotFoundError:
        return []
    except Exception:
        return []


def lookup_eblet_in_ledger(
    eblet_id: str,
    ledger: list[dict],
) -> Optional[dict]:
    """
    Find the most recent IP Ledger entry for the given eblet_id.
    Matches on tablet_id (exact) or source_file path suffix.
    Returns the entry dict, or None if not found.
    """
    # Exact tablet_id match first (fastest path)
    for entry in reversed(ledger):
        if entry.get("tablet_id") == eblet_id:
            return entry

    # Fallback: source_file suffix match (for file-path-style eblet_ids)
    normalized = eblet_id.replace("\\", "/")
    for entry in reversed(ledger):
        src = entry.get("source_file", "").replace("\\", "/")
        if src.endswith(normalized):
            return entry

    return None


def _verify_anchor_hash(entry: dict, expected_hash: str) -> bool:
    """
    Compare expected_anchor_hash from QR code against IP Ledger current_hash.
    SHA-256 hex strings must match exactly.
    """
    ledger_hash = entry.get("current_hash", "")
    return bool(ledger_hash and ledger_hash == expected_hash)


# ── Marked Exception enforcement ───────────────────────────────────────────────

def _is_lb_source_eblet(entry: dict) -> bool:
    """
    Detect LB-source Eblet (Layer 1 / LB Corp).
    Heuristic: tablet_id starts with "LB-" or layer field = 1.
    KN046 multi-tenancy adds explicit layer field; KN044 uses tablet_id prefix.
    """
    tablet_id = entry.get("tablet_id", "") or ""
    if tablet_id.startswith("LB-"):
        return True
    layer = entry.get("layer", None)
    if layer is not None:
        return int(layer) == 1
    return False


def _build_canonical_resolution(entry: dict, is_lb_source: bool) -> str:
    """
    Build canonical_resolution path.
    LB-source: always Canon/Lore/Rules (Marked Exception).
    Other: derive from tablet_id + tablet_class field if present.
    """
    if is_lb_source:
        tablet_id = entry.get("tablet_id", "unknown")
        return f"{LB_CANON_LORE_RULES_BASE}#{tablet_id}"

    tablet_id = entry.get("tablet_id", "unknown")
    tablet_class = entry.get("tablet_class", "Canon")
    layer = entry.get("layer", "1")
    entity = entry.get("entity_id", "LBCorp")
    return f"golden_tablet://Layer_{layer}/Entity_{entity}/{tablet_class}#{tablet_id}"


# ── Scan response dataclasses ──────────────────────────────────────────────────

@dataclass
class ScanSuccess:
    """Successful Eblet-QR-scan verification result."""
    verified: bool = True
    canonical_resolution: str = ""
    anchor_path: str = ""
    battery_dispatch_id: str = ""
    ledger_hash: str = ""
    marked_exception_applied: bool = False


@dataclass
class ScanFailure:
    """Failed Eblet-QR-scan verification result."""
    verified: bool = False
    reason: str = ""
    soft_deflect_url: str = ""
    battery_dispatch_id: str = ""


@dataclass
class ScanRequest:
    """Input structure for scan_eblet(). Post KN045: eblet_id accepts golden_tablet:// URIs."""
    eblet_id: str
    expected_anchor_hash: str
    scanner_metadata: dict = field(default_factory=dict)


# ── Main scan entry point ──────────────────────────────────────────────────────

def scan_eblet(
    eblet_id: str,
    expected_anchor_hash: str,
    scanner_metadata: Optional[dict] = None,
    ledger_path: Optional[Path] = None,
    layer_id: str = "L1",
) -> dict:
    """
    Furnace Eblet-QR-Scan API  —  POST /furnace/scan/eblet

    Args:
        eblet_id:             Eblet identifier (tablet_id, source path, or
                              golden_tablet:// URI after KN045 lands).
        expected_anchor_hash: SHA-256 hash from the QR code payload.
        scanner_metadata:     Optional dict from scanning device (ignored for
                              LB-source Eblets per Marked Exception D.3).
        ledger_path:          Override IP Ledger path (for KN046 per-layer ledgers).
        layer_id:             Layer identifier for Slow Blade bucket isolation.

    Returns:
        On success: {verified: True, canonical_resolution, anchor_path,
                     battery_dispatch_id, ledger_hash, marked_exception_applied}
        On failure: {verified: False, reason, soft_deflect_url,
                     battery_dispatch_id}
    """
    if scanner_metadata is None:
        scanner_metadata = {}

    client_id = scanner_metadata.get("client_id", "anonymous")

    # ── Slow Blade rate-limit (bots cannot drown the endpoint) ──
    if not _slow_blade_check(client_id, layer_id):
        dispatch_id = _write_battery_dispatch({
            "event": "rate_limited",
            "eblet_id": eblet_id,
            "client_id": client_id,
            "layer_id": layer_id,
        })
        return asdict(ScanFailure(
            reason="rate_limited",
            soft_deflect_url=f"{SOFT_DEFLECT_BASE}&reason=rate_limited",
            battery_dispatch_id=dispatch_id,
        ))

    # ── Load IP Ledger ──
    ledger_unavailable = False
    try:
        ledger = load_ip_ledger(ledger_path)
    except Exception:
        ledger = []
        ledger_unavailable = True

    if ledger_unavailable or (not ledger):
        dispatch_id = _write_battery_dispatch({
            "event": "ledger_unavailable",
            "eblet_id": eblet_id,
            "client_id": client_id,
            "layer_id": layer_id,
        })
        return asdict(ScanFailure(
            reason="ip_ledger_unavailable",
            soft_deflect_url=f"{SOFT_DEFLECT_BASE}&reason=ledger_unavailable",
            battery_dispatch_id=dispatch_id,
        ))

    # ── Lookup Eblet in IP Ledger ──
    entry = lookup_eblet_in_ledger(eblet_id, ledger)
    if entry is None:
        dispatch_id = _write_battery_dispatch({
            "event": "not_found",
            "eblet_id": eblet_id,
            "client_id": client_id,
            "layer_id": layer_id,
        })
        return asdict(ScanFailure(
            reason="eblet_not_found_in_ip_ledger",
            soft_deflect_url=f"{SOFT_DEFLECT_BASE}&reason=not_found&id={eblet_id}",
            battery_dispatch_id=dispatch_id,
        ))

    # ── Verify anchor hash ──
    hash_match = _verify_anchor_hash(entry, expected_anchor_hash)
    if not hash_match:
        dispatch_id = _write_battery_dispatch({
            "event": "hash_mismatch",
            "eblet_id": eblet_id,
            "ledger_hash": entry.get("current_hash", ""),
            "expected_hash": expected_anchor_hash,
            "client_id": client_id,
            "layer_id": layer_id,
        })
        return asdict(ScanFailure(
            reason="anchor_hash_mismatch",
            soft_deflect_url=(
                f"{SOFT_DEFLECT_BASE}"
                f"&reason=hash_mismatch"
                f"&mark_compensation=true"  # Furnace-every-click: Mark compensation offered
            ),
            battery_dispatch_id=dispatch_id,
        ))

    # ── Marked Exception enforcement ──
    is_lb_source = _is_lb_source_eblet(entry)
    canonical_resolution = _build_canonical_resolution(entry, is_lb_source)

    # D.3: scanner_metadata routing hints are IGNORED for LB-source Eblets
    # (Marked Exception: always returns Canon/Lore/Rules path)
    anchor_path = entry.get("source_file", "")

    dispatch_id = _write_battery_dispatch({
        "event": "scan_verified",
        "eblet_id": eblet_id,
        "tablet_id": entry.get("tablet_id", ""),
        "ledger_hash": entry.get("current_hash", ""),
        "canonical_resolution": canonical_resolution,
        "marked_exception_applied": is_lb_source,
        "client_id": client_id,
        "layer_id": layer_id,
    })

    return asdict(ScanSuccess(
        canonical_resolution=canonical_resolution,
        anchor_path=anchor_path,
        battery_dispatch_id=dispatch_id,
        ledger_hash=entry.get("current_hash", ""),
        marked_exception_applied=is_lb_source,
    ))


# ── Furnace-every-click R2 closure: batch scan (badge/stamp paths) ─────────────

def scan_eblet_batch(
    requests: list[dict],
    ledger_path: Optional[Path] = None,
    layer_id: str = "L1",
) -> list[dict]:
    """
    Batch Eblet-QR-scan for multi-badge scenarios.
    Each dict must contain: eblet_id, expected_anchor_hash, scanner_metadata (opt).
    R2 closure: every scan in the batch is logged; partial failures don't abort the batch.
    """
    results = []
    for req in requests:
        result = scan_eblet(
            eblet_id=req.get("eblet_id", ""),
            expected_anchor_hash=req.get("expected_anchor_hash", ""),
            scanner_metadata=req.get("scanner_metadata"),
            ledger_path=ledger_path,
            layer_id=layer_id,
        )
        results.append(result)
    return results


# ── CLI convenience ────────────────────────────────────────────────────────────

def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"


if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="Furnace Eblet-QR-Scan API (KN044)")
    parser.add_argument("eblet_id", help="Eblet ID or tablet_id to verify")
    parser.add_argument("expected_hash", help="Expected anchor hash from QR code (SHA-256 hex)")
    parser.add_argument("--client-id", default="cli", help="Scanner client ID")
    args = parser.parse_args()

    result = scan_eblet(
        eblet_id=args.eblet_id,
        expected_anchor_hash=args.expected_hash,
        scanner_metadata={"client_id": args.client_id},
    )
    print(json.dumps(result, indent=2))
    sys.exit(0 if result.get("verified") else 1)
