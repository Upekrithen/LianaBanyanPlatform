"""
Angel of Death — Bury Mode (K517 / A&A #2305)

Terry Gilliam's Baron Munchausen (1988) reference: the Angel of Death arrives at the
right moment, is constrained (acts only under sanction), and cuts off cleanly.

Bury Mode (Founder B123-late Rick & Morty refinement): when the Wing rejects a
Dragonrider Phase-Shift snapshot, the Angel *buries* it in Catacombs rather than
destroying it — preserving forensic recoverability while removing from active substrate.

Design:
- Bury path: ~/.claude/state/catacombs/buried/<session>/<burial_id>.json
- Append-only burial audit log: ~/.claude/state/catacombs/burial_audit.jsonl
- Sanction-required: bury() only called under explicit Wing sanction (block decision)
- Forensic-recoverable: rehydrate() retrieves with full audit trail
- Non-autonomous: Angel never initiates; only acts when called by the Wing engine

Catacombs topology (B121):
    Cathedral (above) → active Scribes
    Catacombs (below) → dormant/buried; forensic-recoverable; never active spontaneously

A&A #2305 (Angel of Death) / Catacombs (#2258 extension).
"""

from __future__ import annotations

import json
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

CATACOMBS_BURIED_DIR = Path(os.path.expanduser("~/.claude/state/catacombs/buried"))
BURIAL_AUDIT_LOG     = Path(os.path.expanduser("~/.claude/state/catacombs/burial_audit.jsonl"))


# ── Bury ───────────────────────────────────────────────────────────────────────

def bury(
    snapshot_data: Dict[str, Any],
    bury_reason: str,
    session: str = "",
    source: str = "dragonrider_rejected",
    additional_metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Bury mode: relocate rejected snapshot to Catacombs.

    Writes to: ~/.claude/state/catacombs/buried/<session>/<burial_id>.json
    Forensic-recoverable; never destroys content.
    Sanction-required: only called when Wing explicitly sanctions (block decision).

    Returns: burial_id (str, 8-char UUID prefix) or "" on failure.
    """
    import datetime
    burial_id = str(uuid.uuid4())[:8]
    bury_ts = datetime.datetime.utcnow().isoformat() + "Z"

    burial_record = {
        "burial_id": burial_id,
        "bury_ts": bury_ts,
        "bury_reason": bury_reason,
        "source": source,
        "session": session or "no-session",
        "snapshot_data": snapshot_data,
        "additional_metadata": additional_metadata or {},
        "burial_status": "buried",
        "rehydrate_history": [],
    }

    try:
        session_dir = CATACOMBS_BURIED_DIR / (session or "no-session")
        session_dir.mkdir(parents=True, exist_ok=True)
        burial_path = session_dir / f"{burial_id}.json"
        burial_path.write_text(json.dumps(burial_record, indent=2), encoding="utf-8")

        # Append-only audit log entry
        BURIAL_AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(BURIAL_AUDIT_LOG, "a", encoding="utf-8") as f:
            audit_entry = {
                "ts": bury_ts,
                "event": "bury",
                "burial_id": burial_id,
                "bury_reason": bury_reason,
                "source": source,
                "session": session or "no-session",
            }
            f.write(json.dumps(audit_entry) + "\n")

    except Exception:
        return ""  # Fail-safe: Bury failure never breaks the Wing

    return burial_id


# ── Query ──────────────────────────────────────────────────────────────────────

def query_buried(
    session: Optional[str] = None,
    bury_reason: Optional[str] = None,
    since_date: Optional[str] = None,
    limit: int = 50,
) -> Dict[str, Any]:
    """
    Query buried entries with filter support (by session, by reason, by date range).

    Returns a list of burial summary entries (no snapshot_data — use rehydrate for that).
    """
    import datetime
    empty = {
        "buried": [],
        "total": 0,
        "query_ts": datetime.datetime.utcnow().isoformat() + "Z",
    }

    if not CATACOMBS_BURIED_DIR.exists():
        return empty

    entries: List[dict] = []
    try:
        for session_dir in sorted(CATACOMBS_BURIED_DIR.iterdir()):
            if not session_dir.is_dir():
                continue
            if session and session_dir.name != session:
                continue
            for burial_file in sorted(session_dir.glob("*.json")):
                try:
                    rec = json.loads(burial_file.read_text(encoding="utf-8"))
                    if bury_reason and rec.get("bury_reason") != bury_reason:
                        continue
                    if since_date and rec.get("bury_ts", "") < since_date:
                        continue
                    entries.append({
                        "burial_id":      rec.get("burial_id"),
                        "bury_ts":        rec.get("bury_ts"),
                        "bury_reason":    rec.get("bury_reason"),
                        "source":         rec.get("source"),
                        "session":        rec.get("session"),
                        "burial_status":  rec.get("burial_status", "buried"),
                        "rehydrate_count": len(rec.get("rehydrate_history", [])),
                        "has_snapshot":   bool(rec.get("snapshot_data")),
                    })
                except Exception:
                    pass
    except Exception:
        return empty

    entries.sort(key=lambda r: r.get("bury_ts", ""), reverse=True)
    return {
        "query_ts": datetime.datetime.utcnow().isoformat() + "Z",
        "total": len(entries),
        "returned": min(len(entries), limit),
        "buried": entries[:limit],
    }


# ── Rehydrate (manual governance path) ────────────────────────────────────────

def rehydrate(
    burial_id: str,
    rehydrate_reason: str,
    operator: str = "manual_operator",
) -> Dict[str, Any]:
    """
    Manual rehydrate path. Returns buried snapshot + full audit trail.

    Adds rehydrate record to the burial file for audit traceability.
    Does NOT remove from Catacombs — original burial entry remains intact.
    Sanction-required: only Founder/governance should call this.

    Returns: {"success": True, "snapshot_data": ..., ...} or {"success": False, "error": ...}
    """
    import datetime
    rehydrate_ts = datetime.datetime.utcnow().isoformat() + "Z"

    if not CATACOMBS_BURIED_DIR.exists():
        return {"success": False, "error": "Catacombs directory does not exist."}

    # Find the burial file by ID
    burial_file = None
    try:
        for session_dir in CATACOMBS_BURIED_DIR.iterdir():
            if not session_dir.is_dir():
                continue
            candidate = session_dir / f"{burial_id}.json"
            if candidate.exists():
                burial_file = candidate
                break
    except Exception as exc:
        return {"success": False, "error": f"Catacombs traversal error: {exc}"}

    if burial_file is None:
        return {"success": False, "error": f"Burial ID '{burial_id}' not found in Catacombs."}

    try:
        rec = json.loads(burial_file.read_text(encoding="utf-8"))
    except Exception as exc:
        return {"success": False, "error": f"Failed to read burial file: {exc}"}

    # Append rehydrate entry to audit trail (non-destructive)
    rehydrate_entry = {
        "rehydrate_ts": rehydrate_ts,
        "rehydrate_reason": rehydrate_reason,
        "operator": operator,
    }
    rec.setdefault("rehydrate_history", []).append(rehydrate_entry)
    rec["burial_status"] = "rehydrated"

    try:
        burial_file.write_text(json.dumps(rec, indent=2), encoding="utf-8")

        # Append to audit log
        with open(BURIAL_AUDIT_LOG, "a", encoding="utf-8") as f:
            audit_entry = {
                "ts": rehydrate_ts,
                "event": "rehydrate",
                "burial_id": burial_id,
                "rehydrate_reason": rehydrate_reason,
                "operator": operator,
            }
            f.write(json.dumps(audit_entry) + "\n")

    except Exception as exc:
        return {"success": False, "error": f"Failed to write rehydrate record: {exc}"}

    return {
        "success": True,
        "burial_id": burial_id,
        "rehydrate_ts": rehydrate_ts,
        "snapshot_data": rec.get("snapshot_data", {}),
        "bury_reason": rec.get("bury_reason"),
        "source": rec.get("source"),
        "session": rec.get("session"),
        "rehydrate_history": rec.get("rehydrate_history", []),
        "additional_metadata": rec.get("additional_metadata", {}),
    }
