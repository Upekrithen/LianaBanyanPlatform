"""
Component 12 — Vine Landing Receipt Assembler (KN023)

Assembles the 5-section structured digest from all 11 preceding auto-action
outputs. Persists to BISHOP_DROPZONE/03_BishopHandoffs/. Signs via Chronos.
Returns inline to Bishop context as first response.

5 sections:
  1. Drift — load-bearing vs deferrable
  2. Queue — Knight-fire-blockers + total depth
  3. Dispatches — paste-ready items by queue
  4. Deadlines — within-7-day window
  5. Paste-ready — actionable items + codecopy status
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

_RECEIPT_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/BISHOP_DROPZONE/03_BishopHandoffs"
)
_CHRONICLER_RECEIPT_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/stitchpunks/chronos/chronicler_receipts/vine_transfer"
)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]


def assemble_receipt(
    session_id: str,
    prior_session_id: str,
    drift_summary: str,
    queue_summary: str,
    dispatch_summary: str,
    deadline_summary: str,
    eblet_promotion_summary: str,
    codecopy_summary: dict,
    memory_flip_summary: str,
    librarian_rebuild_summary: dict,
    spec_memo_summary: Optional[dict] = None,
    extra_context: Optional[str] = None,
) -> dict:
    """
    Assemble the Vine Landing Receipt.

    Returns {receipt_text, receipt_path, chronos_hash, ts}
    """
    ts = _iso_now()

    _next_bp = codecopy_summary.get("next_bp_number")
    _next_bp_str = f" | Next BP: BP{_next_bp:03d}" if _next_bp else ""
    codecopy_status = (
        f"✓ Detected: {codecopy_summary.get('file_name')} "
        f"({codecopy_summary.get('chunk_count', 0)} chunks){_next_bp_str}"
        if codecopy_summary.get("status") == "found"
        else f"⚠ {codecopy_summary.get('ask_founder_prompt', 'Not found')}{_next_bp_str}"
    )

    librarian_status = (
        f"✓ Rebuild triggered (background)"
        if librarian_rebuild_summary.get("triggered")
        else f"— {librarian_rebuild_summary.get('reason', 'skipped')}"
    )

    spec_status = ""
    if spec_memo_summary:
        spec_status = (
            f"\n  Spec memo: {spec_memo_summary.get('note', 'no update')}"
        )

    receipt_text = f"""# Vine Landing Receipt — {session_id}
*Prior session: {prior_session_id} | Generated: {ts}*
*#2301 Vine Transfer Session-Handoff Automation (KN023/BP002)*

---

## Section 1 — Drift

{drift_summary}

---

## Section 2 — Queue

{queue_summary}

{eblet_promotion_summary}

---

## Section 3 — Dispatches

{dispatch_summary}

---

## Section 4 — Deadlines

{deadline_summary}

---

## Section 5 — Paste-Ready + Codecopy

**Codecopy auto-detection:** {codecopy_status}
**MEMORY.md flip:** {memory_flip_summary}
**Librarian rebuild:** {librarian_status}{spec_status}

{extra_context or ""}

---

*Vine Landing Receipt signed at {ts}*
*SHA-256 (content): {{HASH_PLACEHOLDER}}*
*Toolsmith: TS-VINE-TRANSFER-SESSION-HANDOFF-AUTOMATION-KN023-BP002*
"""

    content_hash = _content_hash(receipt_text)
    receipt_text = receipt_text.replace("{HASH_PLACEHOLDER}", content_hash)

    return {
        "receipt_text": receipt_text,
        "ts": ts,
        "content_hash": content_hash,
        "session_id": session_id,
        "prior_session_id": prior_session_id,
    }


def persist_receipt(
    receipt: dict,
    receipt_dir: Path = _RECEIPT_DIR,
    chronicler_dir: Path = _CHRONICLER_RECEIPT_DIR,
) -> dict:
    """
    Persist Vine Landing Receipt to BISHOP_DROPZONE and Chronos.

    Returns {receipt_path, chronicler_path}
    """
    receipt_dir.mkdir(parents=True, exist_ok=True)
    chronicler_dir.mkdir(parents=True, exist_ok=True)

    session_id = receipt["session_id"]
    ts_safe = receipt["ts"].replace(":", "-").replace("+", "_")[:19]
    receipt_name = f"VINE_LANDING_RECEIPT_{session_id}_{ts_safe}.md"
    receipt_path = receipt_dir / receipt_name

    receipt_path.write_text(receipt["receipt_text"], encoding="utf-8")

    # Chronos signing record
    signing_record = {
        "type": "vine_landing_receipt",
        "session_id": session_id,
        "prior_session_id": receipt["prior_session_id"],
        "ts": receipt["ts"],
        "content_hash": receipt["content_hash"],
        "receipt_path": str(receipt_path),
    }
    chronicler_path = chronicler_dir / f"vine_receipt_{session_id}_{ts_safe}.json"
    chronicler_path.write_text(json.dumps(signing_record, indent=2), encoding="utf-8")

    return {
        "receipt_path": str(receipt_path),
        "chronicler_path": str(chronicler_path),
    }
