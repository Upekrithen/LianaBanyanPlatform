"""
Session Receipt Emitter — KN031 Component 2

Utilities for loading, formatting, and sharing CheckBook Receipts.
Supports: loading from Stone Tablet, pretty-print, and optional
Federation anonymous share.

Toolsmith log: TS-CHECKBOOK-ORCHESTRATOR-KN031-BP003
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_RECEIPTS_DIR = _HERE / "receipts"


def load_receipt(session_id: str) -> Optional[Dict[str, Any]]:
    """Load a persisted CheckBook Receipt for a session."""
    safe = session_id.replace("/", "_").replace("\\", "_").replace(":", "-")
    receipt_path = _RECEIPTS_DIR / f"{safe}_receipt.json"
    if not receipt_path.exists():
        return None
    try:
        return json.loads(receipt_path.read_text(encoding="utf-8"))
    except Exception:
        return None


def list_receipts() -> List[str]:
    """List session IDs with persisted receipts."""
    if not _RECEIPTS_DIR.exists():
        return []
    sessions = []
    for p in sorted(_RECEIPTS_DIR.iterdir()):
        if p.suffix == ".json" and p.stem.endswith("_receipt"):
            sessions.append(p.stem[: -len("_receipt")])
    return sessions


def verify_receipt(receipt: Dict[str, Any]) -> bool:
    """
    Verify Chronos signature of a CheckBook Receipt.
    Returns True if signature is valid.
    """
    try:
        sig = receipt.get("chronos_signature", {})
        expected_hash = sig.get("chronicler_hash")
        if not expected_hash:
            return False
        # Re-compute hash over body without signature
        body = {k: v for k, v in receipt.items() if k not in ("chronos_signature", "receipt_path")}
        canonical = json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        actual_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        return actual_hash == expected_hash
    except Exception:
        return False


def format_receipt_summary(receipt: Dict[str, Any]) -> str:
    """Format a compact human-readable summary of a CheckBook Receipt."""
    session_id = receipt.get("session_id", "unknown")
    pod_id = receipt.get("pod_id", "")
    summary = receipt.get("pod_summary", {})
    completed = receipt.get("beans_completed", [])
    deferred = receipt.get("beans_deferred", [])

    lines = [
        f"+== CheckBook Receipt ==================================================",
        f"|  Session: {session_id}",
        f"|  Pod:     {pod_id}",
        f"|  Completed ({len(completed)}): {', '.join(completed) or 'none'}",
        f"|  Deferred  ({len(deferred)}): {', '.join(deferred) or 'none'}",
        f"|  Scenario: {summary.get('scenario_verdict', '?')}",
        f"|  Predicted: {summary.get('total_predicted_pp', '?')}pp",
        f"|  Measured:  {summary.get('total_measured_pp') or '?'}pp",
        f"|  Mean/bean: {summary.get('mean_pp_per_bean') or '?'}pp",
        f"|  ctx open->close: {receipt.get('context_pct_open', '?')}% -> {receipt.get('context_pct_close', '?')}%",
        f"|  Sig verified: {verify_receipt(receipt)}",
        f"+======================================================================",
    ]
    return "\n".join(lines)


def prepare_federation_share(receipt: Dict[str, Any], participant_id: str = "anonymous") -> Dict[str, Any]:
    """
    Prepare an anonymized receipt for optional Federation share.
    Strips session_id → replaces with participant_id.
    Preserves all empirical measurements.
    """
    summary = receipt.get("pod_summary", {})
    return {
        "share_type": "checkbook_federation_share",
        "participant_id": participant_id,
        "pod_id": receipt.get("pod_id", ""),
        "agent": receipt.get("agent", ""),
        "bean_sequence_length": len(receipt.get("bean_sequence", [])),
        "beans_completed": len(receipt.get("beans_completed", [])),
        "beans_deferred": len(receipt.get("beans_deferred", [])),
        "total_measured_pp": summary.get("total_measured_pp"),
        "total_predicted_pp": summary.get("total_predicted_pp"),
        "mean_pp_per_bean": summary.get("mean_pp_per_bean"),
        "scenario_verdict": summary.get("scenario_verdict"),
        "total_liner_notes": summary.get("total_liner_notes", 0),
        "total_brainscans": summary.get("total_brainscans", 0),
        "total_screenshots": summary.get("total_screenshots", 0),
        "generated_at": receipt.get("generated_at"),
        "chronos_signature": receipt.get("chronos_signature"),
        "lineage": ["#2304-CheckBook", "#2299-R&D-Battery"],
    }
