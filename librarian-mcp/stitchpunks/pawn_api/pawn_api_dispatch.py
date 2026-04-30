"""
Pawn-via-API — Component 3: Dispatch Orchestrator
KN018 / ShadowBishop Cylinder 7

Accepts dispatch request from Bishop/ShadowBishop, builds substrate context,
calls Pawn API, scribes result via Chronos, returns structured dispatch result.

Dispatch flow:
  Bishop emits request → ShadowBishop loads substrate context →
  Pawn-API call → result scribed via Chronos → Bishop synthesizes

Toolsmith log: TS-PAWN-VIA-API-MCP-WRAPPER-KN018-BP002
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from pawn_api_substrate_context_loader import load_substrate_context
from pawn_api_client import call_pawn_api

_HERE = Path(__file__).parent
_DISPATCH_LEDGER_PATH = _HERE / "dispatch_ledger.jsonl"

_PHEROMONE_PATH = _HERE / "pawn_api_pheromone.json"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(record: Dict[str, Any]) -> str:
    payload = json.dumps(record, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:24]


def _append_ledger(record: Dict[str, Any], ledger_path: Optional[Path] = None) -> None:
    path = ledger_path or _DISPATCH_LEDGER_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


def _update_pheromone(dispatch_id: str, task: str, status: str) -> None:
    pheromone = {}
    if _PHEROMONE_PATH.exists():
        try:
            pheromone = json.loads(_PHEROMONE_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    pheromone["latest_dispatch_id"] = dispatch_id
    pheromone["latest_task"] = task[:80]
    pheromone["latest_status"] = status
    pheromone["updated_at"] = _iso_now()
    tmp = _PHEROMONE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(pheromone, indent=2), encoding="utf-8")
    import os
    os.replace(str(tmp), str(_PHEROMONE_PATH))


def dispatch_pawn(
    task: str,
    brief_me_content: Optional[str] = None,
    detective_hits: Optional[List[str]] = None,
    memory_files: Optional[List[Path]] = None,
    model: Optional[str] = None,
    cost_cap_usd: float = 5.0,
    ledger_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Dispatch a Pawn research task via Anthropic API.

    Returns:
    {
      dispatch_id, task, substrate_context_hash, result_text,
      model, tokens_used_total, estimated_cost_usd, stub_mode,
      chronos_hash, dispatched_at, status
    }
    """
    dispatched_at = _iso_now()
    dispatch_id = "PAWN-" + hashlib.sha256(f"{dispatched_at}:{task}".encode()).hexdigest()[:12]

    # Step 1: Load substrate context
    ctx = load_substrate_context(
        task=task,
        brief_me_content=brief_me_content,
        detective_hits=detective_hits,
        memory_files=memory_files,
    )

    # Step 2: Enforce cost cap (stub check — real check after call)
    if cost_cap_usd > 20.0:
        return {
            "dispatch_id": dispatch_id,
            "task": task,
            "status": "rejected",
            "reason": f"cost_cap ${cost_cap_usd} exceeds hard cap $20",
        }

    # Step 3: Call Pawn API
    api_result = call_pawn_api(
        task=task,
        substrate_context=ctx["context_str"],
        model=model,
        cost_cap_usd=cost_cap_usd,
    )

    # Step 4: Post-call cost cap check
    if api_result.get("estimated_cost_usd", 0.0) > cost_cap_usd:
        # Still scribe the result but flag as over-cap
        api_result["over_cap"] = True

    # Step 5: Build scribe record
    record = {
        "type": "pawn_dispatch",
        "dispatch_id": dispatch_id,
        "task": task,
        "substrate_context_hash": ctx["context_hash"],
        "substrate_sources_included": ctx["sources_included"],
        "substrate_truncated": ctx["truncated"],
        "model": api_result.get("model", "unknown"),
        "tokens_used_total": api_result.get("tokens_used_total", 0),
        "estimated_cost_usd": api_result.get("estimated_cost_usd", 0.0),
        "stub_mode": api_result.get("stub_mode", False),
        "system_prompt_hash": api_result.get("system_prompt_hash", ""),
        "result_text_preview": api_result.get("result_text", "")[:200],
        "dispatched_at": dispatched_at,
        "completed_at": _iso_now(),
        "status": "error" if "error" in api_result else "completed",
    }
    record["chronos_hash"] = _chronos_sign(record)
    _append_ledger(record, ledger_path)
    _update_pheromone(dispatch_id, task, record["status"])

    return {
        **record,
        "result_text": api_result.get("result_text", ""),
        "provenance": api_result.get("provenance", {}),
        "substrate_context_char_count": len(ctx["context_str"]),
    }
