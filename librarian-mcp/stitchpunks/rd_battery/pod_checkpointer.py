"""
Component 4 — Pod-Boundary Checkpointer
KN026 / #2299 / BP003

Full state snapshot at pod end; persists for cross-session resumption (δ-mode).
Checkpoint includes: context_pct, beans_landed_list, deferrals_list, cumulative_cost_pp.

Checkpoints written to:
  librarian-mcp/stitchpunks/rd_battery/checkpoints/<test_mode>/<session_id>/pod_<pod_id>.json

For δ (cross-session): checkpoint loaded by next SessionStart-hook, surfaced to Bishop.

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_CHECKPOINTS_DIR = Path(__file__).parent / "checkpoints"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _checkpoint_path(test_mode: str, session_id: str, pod_id: str) -> Path:
    d = _CHECKPOINTS_DIR / test_mode / session_id
    d.mkdir(parents=True, exist_ok=True)
    return d / f"pod_{pod_id}.json"


def save_pod_checkpoint(
    pod_id: str,
    context_pct: float,
    beans_landed: List[str],
    deferrals: List[str],
    cumulative_cost_pp: float,
    test_mode: str,
    session_id: str,
    extra: Optional[Dict[str, Any]] = None,
) -> Path:
    """
    Save a full pod-boundary checkpoint to disk.

    Returns the path where checkpoint was written.
    """
    checkpoint: Dict[str, Any] = {
        "pod_id": pod_id,
        "test_mode": test_mode,
        "session_id": session_id,
        "checkpoint_ts": _iso_now(),
        "context_pct_at_pod_end": context_pct,
        "beans_landed": beans_landed,
        "deferrals": deferrals,
        "cumulative_cost_pp": cumulative_cost_pp,
        "beans_landed_count": len(beans_landed),
        "deferrals_count": len(deferrals),
    }
    if extra:
        checkpoint.update(extra)

    path = _checkpoint_path(test_mode, session_id, pod_id)
    path.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def load_pod_checkpoint(
    pod_id: str,
    test_mode: str,
    session_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Load a pod-boundary checkpoint from disk.

    Returns the checkpoint dict, or None if not found.
    """
    path = _checkpoint_path(test_mode, session_id, pod_id)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def list_checkpoints(test_mode: str, session_id: str) -> List[str]:
    """
    List all pod checkpoint IDs for a given test_mode + session_id.

    Returns list of pod_id strings (from filenames).
    """
    d = _CHECKPOINTS_DIR / test_mode / session_id
    if not d.exists():
        return []
    return [
        p.stem.replace("pod_", "", 1)
        for p in sorted(d.glob("pod_*.json"))
    ]


def build_cross_session_summary(test_mode: str, session_id: str) -> Dict[str, Any]:
    """
    Build a cross-session summary from all available pod checkpoints.

    Used by δ-mode orchestrator to resume across SessionStart boundaries.
    """
    pod_ids = list_checkpoints(test_mode, session_id)
    checkpoints = []
    total_beans = 0
    total_deferrals = 0
    total_cost = 0.0
    latest_context_pct = 0.0

    for pid in pod_ids:
        cp = load_pod_checkpoint(pid, test_mode, session_id)
        if cp:
            checkpoints.append(cp)
            total_beans += cp.get("beans_landed_count", 0)
            total_deferrals += cp.get("deferrals_count", 0)
            total_cost += cp.get("cumulative_cost_pp", 0.0)
            latest_context_pct = max(
                latest_context_pct, cp.get("context_pct_at_pod_end", 0.0)
            )

    return {
        "test_mode": test_mode,
        "session_id": session_id,
        "pods_completed": len(pod_ids),
        "pod_ids": pod_ids,
        "total_beans_landed": total_beans,
        "total_deferrals": total_deferrals,
        "total_cost_pp": round(total_cost, 2),
        "latest_context_pct": latest_context_pct,
        "checkpoints": checkpoints,
    }
