"""
Detachment Protocol — KN035 / A&A #2303 / Persistent-Bishop

State-delta merge logic for Knight session detach (D.4).

When a Knight session detaches from a beanpole:
  1. Knight emits a state delta (what changed during the session)
  2. Beanpole reconciles delta into next manifest snapshot via Chronos-signed merge
  3. Detachment receipt emitted + stored

State delta structure:
  {
    session_id: str,
    beanpole_id: str,
    detached_at: str,
    delta_canonical_context: dict | None   — updated canonical numbers if changed
    delta_recent_eblets: list[str] | None  — new eblets promoted during session
    delta_memory_md: str | None            — updated MEMORY.md excerpt if changed
    session_summary: str                   — brief summary of what was done
  }

Toolsmith log: TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from persistent_bishop.sandbox_state import (
    read_manifest, update_manifest, TOOLSMITH_LOG
)

_HERE = Path(__file__).parent
_RECEIPT_DIR = _HERE / "detachment_receipts"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(body: Dict[str, Any]) -> Dict[str, Any]:
    canonical = json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    ch_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {
        "chronicler_hash": ch_hash,
        "temporal_anchor": _iso_now(),
        "verify_method": "sha256(json.dumps(body_no_sig, sort_keys=True))",
        "toolsmith": TOOLSMITH_LOG,
    }


def detach(
    beanpole_id: str,
    session_id: str,
    delta_canonical_context: Optional[Dict[str, Any]] = None,
    delta_recent_eblets: Optional[List[str]] = None,
    delta_memory_md: Optional[str] = None,
    session_summary: str = "",
) -> Dict[str, Any]:
    """
    Detach a Knight session from a beanpole and reconcile state delta.

    Returns detachment_result dict with:
      - detachment_receipt: signed receipt
      - updated_manifest_hash: hash of post-merge manifest
      - error: str | None
    """
    result: Dict[str, Any] = {
        "beanpole_id": beanpole_id,
        "session_id": session_id,
        "success": False,
        "error": None,
    }

    # Verify beanpole exists
    current = read_manifest(beanpole_id)
    if current is None:
        result["error"] = f"No manifest for beanpole {beanpole_id!r}"
        return result

    # Build delta to merge
    manifest_delta: Dict[str, Any] = {}

    if delta_canonical_context:
        # Merge: newer snapshot overwrites existing
        existing_snap = current.get("canonical_context_snapshot", {})
        merged_snap = {**existing_snap, **delta_canonical_context}
        manifest_delta["canonical_context_snapshot"] = merged_snap

    if delta_recent_eblets:
        existing_eblets = current.get("recent_canon_eblets", [])
        merged_eblets = list(dict.fromkeys(existing_eblets + delta_recent_eblets))[-20:]
        manifest_delta["recent_canon_eblets"] = merged_eblets

    if delta_memory_md:
        manifest_delta["MEMORY_md_snapshot"] = delta_memory_md

    # Apply delta
    try:
        updated = update_manifest(
            beanpole_id=beanpole_id,
            delta=manifest_delta,
            session_id=session_id,
        )
    except Exception as exc:
        result["error"] = f"Manifest merge failed: {exc}"
        return result

    updated_hash = updated.get("chronos_signature", {}).get("chronicler_hash", "")

    # Build and sign detachment receipt
    receipt_body: Dict[str, Any] = {
        "receipt_type": "detachment_receipt",
        "beanpole_id": beanpole_id,
        "session_id": session_id,
        "detached_at": _iso_now(),
        "session_summary": session_summary,
        "delta_applied": {
            "canonical_context_updated": bool(delta_canonical_context),
            "eblets_added": len(delta_recent_eblets) if delta_recent_eblets else 0,
            "memory_md_updated": bool(delta_memory_md),
        },
        "updated_manifest_hash": updated_hash,
        "toolsmith": TOOLSMITH_LOG,
    }
    receipt = {**receipt_body, "chronos_signature": _chronos_sign(receipt_body)}

    # Store receipt
    _RECEIPT_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = f"{beanpole_id}_{session_id}".replace("/", "_").replace(":", "-")
    receipt_path = _RECEIPT_DIR / f"detach_{safe_id}.json"
    with open(receipt_path, "w", encoding="utf-8") as f:
        json.dump(receipt, f, indent=2, ensure_ascii=False)

    result["success"] = True
    result["detachment_receipt"] = receipt
    result["updated_manifest_hash"] = updated_hash
    result["receipt_path"] = str(receipt_path)
    return result
