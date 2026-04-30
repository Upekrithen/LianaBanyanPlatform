"""
Attachment Protocol — KN035 / A&A #2303 / Persistent-Bishop

Knight-session-side attachment client (D.3).

When a Knight session attaches to a beanpole:
  1. Reads manifest.json from sandbox_state/<beanpole_id>/
  2. Pulls canonical_context_snapshot + MEMORY_md_snapshot + recent_canon_eblets
  3. Pre-injects context via Wrasse-style injection
  4. Emits Chronos-signed attachment receipt

Attachment receipt:
  {
    receipt_type: "attachment_receipt",
    beanpole_id: str,
    session_id: str,
    attached_at: str,
    context_preinjection_summary: str,
    manifest_hash_at_attach: str,
    vendor: str,
    chronos_signature: dict,
  }

Toolsmith log: TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

_HERE = Path(__file__).parent
_STITCHPUNKS = _HERE.parent
if str(_STITCHPUNKS) not in sys.path:
    sys.path.insert(0, str(_STITCHPUNKS))

from persistent_bishop.sandbox_state import (
    read_manifest, update_manifest, _verify_chronos_sig, TOOLSMITH_LOG
)

_RECEIPT_DIR = _HERE / "attachment_receipts"


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


def attach(
    beanpole_id: str,
    session_id: str,
    vendor: str = "claude_cli",
) -> Dict[str, Any]:
    """
    Attach a Knight session to a beanpole.

    1. Loads manifest
    2. Extracts context pre-injection payload
    3. Updates manifest (records session as attached)
    4. Emits + stores attachment receipt

    Returns attachment_result dict with:
      - attachment_receipt: signed receipt
      - context_preinjection: dict with canonical snapshot + eblets
      - error: str | None
    """
    result: Dict[str, Any] = {
        "beanpole_id": beanpole_id,
        "session_id": session_id,
        "vendor": vendor,
        "success": False,
        "error": None,
    }

    # Load manifest
    manifest = read_manifest(beanpole_id)
    if manifest is None:
        result["error"] = f"No manifest found for beanpole {beanpole_id!r}"
        return result

    # Verify manifest integrity
    if not _verify_chronos_sig(manifest):
        result["error"] = f"Manifest signature verification FAILED for beanpole {beanpole_id!r}"
        return result

    # Extract manifest hash for receipt
    sig = manifest.get("chronos_signature", {})
    manifest_hash_at_attach = sig.get("chronicler_hash", "")

    # Build context pre-injection payload
    canonical_snapshot = manifest.get("canonical_context_snapshot", {})
    memory_md = manifest.get("MEMORY_md_snapshot", "")
    recent_eblets = manifest.get("recent_canon_eblets", [])

    context_preinjection = {
        "canonical_context_snapshot": canonical_snapshot,
        "memory_md_summary": memory_md[:500] if memory_md else "",
        "recent_canon_eblets": recent_eblets,
        "beanpole_id": beanpole_id,
        "owner_session": manifest.get("owner_session", ""),
        "opened_at": manifest.get("opened_at", ""),
    }

    preinjection_summary = (
        f"Attached to beanpole {beanpole_id} "
        f"(owner: {manifest.get('owner_session', '?')}, "
        f"opened: {manifest.get('opened_at', '?')[:10]}). "
        f"{len(recent_eblets)} recent eblets available."
    )

    # Update manifest: record this session as attached
    try:
        update_manifest(
            beanpole_id=beanpole_id,
            delta={"attached_sessions": [session_id]},
            session_id=session_id,
        )
    except Exception as exc:
        result["error"] = f"Manifest update failed: {exc}"
        return result

    # Build and sign attachment receipt
    receipt_body: Dict[str, Any] = {
        "receipt_type": "attachment_receipt",
        "beanpole_id": beanpole_id,
        "session_id": session_id,
        "attached_at": _iso_now(),
        "context_preinjection_summary": preinjection_summary,
        "manifest_hash_at_attach": manifest_hash_at_attach,
        "vendor": vendor,
        "toolsmith": TOOLSMITH_LOG,
    }
    receipt = {**receipt_body, "chronos_signature": _chronos_sign(receipt_body)}

    # Store receipt
    _RECEIPT_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = f"{beanpole_id}_{session_id}".replace("/", "_").replace(":", "-")
    receipt_path = _RECEIPT_DIR / f"attach_{safe_id}.json"
    with open(receipt_path, "w", encoding="utf-8") as f:
        json.dump(receipt, f, indent=2, ensure_ascii=False)

    result["success"] = True
    result["attachment_receipt"] = receipt
    result["context_preinjection"] = context_preinjection
    result["receipt_path"] = str(receipt_path)
    return result
