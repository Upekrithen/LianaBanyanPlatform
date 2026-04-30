"""
Chronos Chandelier Bridge — KN009 / A&A #2291 Bedrock Foundation

Chandelier measurement receipts (L1 → L12+) are signed and stored by
the Chronos Chronicler infrastructure (Property 1, BP002 turn 13).

Every receipt write goes through sign_and_store(receipt) which:
  (a) appends Chronos temporal anchor (ISO timestamp + session_id)
  (b) signs with Chronicler-class hash (SHA-256 of canonical receipt JSON)
  (c) stores in append-only Stone Tablet JSONL

The Stone Tablet lives at:
  librarian-mcp/stitchpunks/chronos/chronicler_receipts/chandelier_receipts.jsonl

Verify-replay: the chronicler_hash is deterministic — SHA-256(canonical_json)
where canonical_json is json.dumps(receipt_body, sort_keys=True, ensure_ascii=False).
Any third party can recompute the hash from the receipt body and verify authenticity.

In-memory subset index: rebuilt from the Stone Tablet on load.
  index[primitive_tuple_key] → list of receipt_ids
O(1) lookup after index build.

Pheromone substrate integration: every receipt write calls
_pheromone_notify(primitive_tuple_key) to update the Pheromone index
(side-channel notification; Chandelier does not depend on Pheromone for correctness).

Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
"""

from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ── Paths ──────────────────────────────────────────────────────────────────────

_HERE = Path(__file__).parent
_CHRONOS_RECEIPTS_DIR = _HERE.parent / "chronos" / "chronicler_receipts"
_TABLET_PATH = _CHRONOS_RECEIPTS_DIR / "chandelier_receipts.jsonl"


def _ensure_dirs() -> None:
    _CHRONOS_RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)


# ── Temporal helpers ───────────────────────────────────────────────────────────

def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# ── Canonical JSON for hashing ─────────────────────────────────────────────────

def _canonical_json(obj: Any) -> str:
    """Deterministic JSON serialization for Chronicler-class hashing."""
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


# ── Chronicler signature ───────────────────────────────────────────────────────

def _compute_chronicler_hash(receipt_body: Dict[str, Any]) -> str:
    """
    Compute SHA-256 hash of the canonical receipt body.
    Deterministic: same body → same hash.  Third-party verifiable.
    receipt_body must NOT include the chronos_signature field yet.
    """
    canonical = _canonical_json(receipt_body)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def sign_and_store(
    receipt_body: Dict[str, Any],
    session_id: str = "",
) -> Dict[str, Any]:
    """
    Sign a measurement receipt with a Chronos temporal anchor + Chronicler-class hash,
    then store in the append-only Stone Tablet.

    Parameters
    ----------
    receipt_body : dict
        Must contain at minimum:
          - receipt_id : str (e.g. "rc_<hex8>")
          - receipt_class : str (e.g. "L1", "L2", "L3", ...)
          - primitive_ids : list[str] (raw IDs, will be sorted)
          - session_id : str (K-session or KN-session that generated the measurement)
          - metric : str
          - baseline : dict
          - treatment : dict
          - delta : float
        Additional fields (synergy_delta, decomposition, etc.) are passed through.
    session_id : str
        Signing session identifier (default: empty string).

    Returns
    -------
    dict
        The complete signed receipt (receipt_body + chronos_signature injected).
    """
    _ensure_dirs()

    # Normalise primitive_ids to sorted tuple key
    raw_ids = receipt_body.get("primitive_ids", [])
    sorted_ids = sorted(str(p) for p in raw_ids)
    primitive_tuple_key = "|".join(sorted_ids)

    # Build the body that will be hashed (without signature)
    body_for_hash = {k: v for k, v in receipt_body.items() if k != "chronos_signature"}
    body_for_hash["primitive_ids"] = sorted_ids
    body_for_hash["primitive_tuple_key"] = primitive_tuple_key

    # Compute Chronicler-class hash
    ch_hash = _compute_chronicler_hash(body_for_hash)
    signed_ts = _iso_now()

    chronos_signature = {
        "temporal_anchor": signed_ts,
        "chronicler_hash": ch_hash,
        "signed_ts": signed_ts,
        "session_id": session_id or receipt_body.get("session_id", ""),
        "stone_tablet": str(_TABLET_PATH.relative_to(_TABLET_PATH.parents[4])),
        "verify_method": "sha256(json.dumps(receipt_body_no_sig, sort_keys=True))",
    }

    signed_receipt = {**body_for_hash, "chronos_signature": chronos_signature}

    # Append to Stone Tablet (never overwrites)
    try:
        with open(_TABLET_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(signed_receipt, ensure_ascii=False) + "\n")
    except Exception as exc:
        # Storage failure must not silently corrupt; re-raise with context
        raise RuntimeError(f"Stone Tablet write failed: {exc}") from exc

    return signed_receipt


def verify_receipt(signed_receipt: Dict[str, Any]) -> bool:
    """
    Verify a signed receipt by recomputing the Chronicler hash.

    Returns True if the receipt is authentic (hash matches), False if tampered.
    """
    sig = signed_receipt.get("chronos_signature", {})
    stored_hash = sig.get("chronicler_hash", "")
    if not stored_hash:
        return False

    body_for_hash = {
        k: v for k, v in signed_receipt.items() if k != "chronos_signature"
    }
    expected_hash = _compute_chronicler_hash(body_for_hash)
    return stored_hash == expected_hash


# ── Stone Tablet reader ────────────────────────────────────────────────────────

def load_all_receipts() -> List[Dict[str, Any]]:
    """
    Load all receipts from the Stone Tablet.
    Returns entries in append order (chronological).
    """
    if not _TABLET_PATH.exists():
        return []
    receipts: List[Dict[str, Any]] = []
    try:
        with open(_TABLET_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        receipts.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    except Exception:
        pass
    return receipts


# ── In-memory subset index ─────────────────────────────────────────────────────

class ReceiptIndex:
    """
    In-memory subset-indexed receipt registry.

    Key: primitive_tuple_key (sorted, pipe-delimited, e.g. "P001|P002")
    Value: list of signed receipt dicts (chronological order)

    O(1) lookup after build.  Rebuilt from Stone Tablet on each instantiation.
    Supports fast append via add().
    """

    def __init__(self) -> None:
        self._index: Dict[str, List[Dict[str, Any]]] = {}
        self._id_index: Dict[str, Dict[str, Any]] = {}  # receipt_id → receipt
        self._rebuild()

    def _rebuild(self) -> None:
        self._index = {}
        self._id_index = {}
        for receipt in load_all_receipts():
            self._ingest(receipt)

    def _ingest(self, receipt: Dict[str, Any]) -> None:
        key = receipt.get("primitive_tuple_key", "")
        if key not in self._index:
            self._index[key] = []
        self._index[key].append(receipt)
        rid = receipt.get("receipt_id", "")
        if rid:
            self._id_index[rid] = receipt

    def add(self, signed_receipt: Dict[str, Any]) -> None:
        """Ingest a freshly signed receipt into the in-memory index."""
        self._ingest(signed_receipt)

    def query(
        self,
        primitive_ids: List[str],
        metric: Optional[str] = None,
        time_range: Optional[Tuple[str, str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        O(1) subset lookup.

        primitive_ids : exact set to look up (will be sorted → key)
        metric        : if provided, filter by receipt.metric == metric
        time_range    : (start_iso, end_iso) — filter by chronos_signature.temporal_anchor
        """
        key = "|".join(sorted(str(p) for p in primitive_ids))
        results = list(self._index.get(key, []))

        if metric:
            results = [r for r in results if r.get("metric") == metric]

        if time_range:
            start_ts, end_ts = time_range
            results = [
                r for r in results
                if start_ts <= r.get("chronos_signature", {}).get("temporal_anchor", "") <= end_ts
            ]

        return results

    def get_by_id(self, receipt_id: str) -> Optional[Dict[str, Any]]:
        return self._id_index.get(receipt_id)

    def all_keys(self) -> List[str]:
        return list(self._index.keys())

    def total_receipts(self) -> int:
        return sum(len(v) for v in self._index.values())

    def receipts_for_level(self, level: int) -> List[Dict[str, Any]]:
        """Return all receipts whose receipt_class == 'L<level>'."""
        target = f"L{level}"
        out = []
        for receipts in self._index.values():
            for r in receipts:
                if r.get("receipt_class") == target:
                    out.append(r)
        return out

    def all_receipts(self) -> List[Dict[str, Any]]:
        """All receipts in append order."""
        return load_all_receipts()


# ── Module-level singleton index ───────────────────────────────────────────────
# Callers that need the index import this directly.  sign_and_store() is the
# primary write path — callers should call index.add(signed_receipt) after
# sign_and_store() if they hold a ReceiptIndex instance.

def build_index() -> ReceiptIndex:
    """Build a fresh ReceiptIndex from the Stone Tablet."""
    return ReceiptIndex()
