"""
Component 1 — SessionStart Hook Chain Extension (KN023)

Chains onto the existing KN005 SessionStart-hook. Orchestrates all 11
auto-actions in defined order. Parallelizes where possible (Eblet promotion
+ Librarian rebuild run concurrently). Each action emits a receipt.

Fires AFTER KN005 TimeWave reset, BEFORE Bishop processes first user prompt.

Hardened: any individual component failure degrades gracefully — the hook
continues and reports partial results rather than blocking session start.
"""

from __future__ import annotations

import concurrent.futures
import time
from pathlib import Path
from typing import Optional


def run_vine_transfer(
    session_id: str,
    prior_session_id: str,
    eblet_root: Optional[Path] = None,
    memory_path: Optional[Path] = None,
    codecopy_dir: Optional[Path] = None,
    dry_run: bool = False,
    promote_commit: bool = False,
) -> dict:
    """
    Execute all 12 Vine Transfer auto-actions.

    Returns assembled Vine Landing Receipt dict.
    Guaranteed non-raising: every component failure is captured and reported.
    """
    t0 = time.monotonic()
    component_results = {}

    # ── Action 1: Codecopy auto-detect ────────────────────────────────────────
    try:
        from vine_transfer.codecopy_detector import get_codecopy_summary
        kwargs = {}
        if codecopy_dir:
            kwargs["directory"] = codecopy_dir
        component_results["codecopy"] = get_codecopy_summary(**kwargs)
    except Exception as e:
        component_results["codecopy"] = {
            "status": "error", "error": str(e),
            "ask_founder_prompt": "Codecopy detection failed — ask Founder for file number.",
        }

    # ── Actions 3 + 5: Eblet promotion + Librarian rebuild (parallel) ─────────
    def _promote():
        try:
            from vine_transfer.eblet_auto_promoter import promote_session_eblets, format_promotion_summary
            result = promote_session_eblets(
                prior_session_id,
                eblet_root=eblet_root,
                commit=promote_commit,
                dry_run=dry_run,
            )
            return format_promotion_summary(result)
        except Exception as e:
            return f"Eblet auto-promotion error: {e}"

    def _rebuild():
        try:
            from vine_transfer.librarian_auto_rebuilder import auto_rebuild_if_needed
            return auto_rebuild_if_needed()
        except Exception as e:
            return {"triggered": False, "error": str(e), "reason": str(e)}

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        fut_promote = executor.submit(_promote)
        fut_rebuild = executor.submit(_rebuild)
        component_results["eblet_promotion"] = fut_promote.result(timeout=90)
        component_results["librarian_rebuild"] = fut_rebuild.result(timeout=30)

    # ── Action 4: MEMORY.md auto-flip ─────────────────────────────────────────
    try:
        from vine_transfer.memory_md_auto_flipper import apply_flip
        kwargs = {}
        if memory_path:
            kwargs["memory_path"] = memory_path
        flip_result = apply_flip(
            session_id=session_id,
            prior_session_id=prior_session_id,
            dry_run=dry_run,
            **kwargs,
        )
        component_results["memory_flip"] = flip_result.get("diff_summary", "")
        if flip_result.get("confirmation_prompt"):
            component_results["memory_flip_confirm"] = flip_result["confirmation_prompt"]
    except Exception as e:
        component_results["memory_flip"] = f"MEMORY flip error: {e}"

    # ── Action 6: Queue surfacer ───────────────────────────────────────────────
    try:
        from vine_transfer.queue_surfacer import surface_queue
        component_results["queue"] = surface_queue(session_id=session_id)
    except Exception as e:
        component_results["queue"] = {
            "formatted_digest": f"Queue surface error: {e}",
            "total_pending": 0,
        }

    # ── Action 7: Knight queue auditor ────────────────────────────────────────
    try:
        from vine_transfer.knight_queue_auditor import audit_knight_queue
        component_results["knight_queue"] = audit_knight_queue()
    except Exception as e:
        component_results["knight_queue"] = {
            "formatted_summary": f"Knight queue audit error: {e}",
            "total_depth": 0,
        }

    # ── Action 8: Dispatch readiness auditor ──────────────────────────────────
    try:
        from vine_transfer.dispatch_auditor import audit_dispatches
        component_results["dispatches"] = audit_dispatches()
    except Exception as e:
        component_results["dispatches"] = {
            "formatted_summary": f"Dispatch audit error: {e}",
            "total_dispatches": 0,
        }

    # ── Action 9: Drift triage ────────────────────────────────────────────────
    try:
        from vine_transfer.drift_triage import triage_drift
        component_results["drift"] = triage_drift()
    except Exception as e:
        component_results["drift"] = {
            "formatted_summary": f"Drift triage error: {e}",
            "load_bearing": [], "deferrable": [],
        }

    # ── Action 10: Deadline checker ───────────────────────────────────────────
    try:
        from vine_transfer.deadline_checker import check_deadlines
        component_results["deadlines"] = check_deadlines()
    except Exception as e:
        component_results["deadlines"] = {
            "formatted_summary": f"Deadline check error: {e}",
            "count": 0,
        }

    # ── Action 11: Spec memo updater ──────────────────────────────────────────
    try:
        from vine_transfer.spec_memo_updater import append_candidates
        component_results["spec_memo"] = append_candidates(
            new_candidates=[], dry_run=True
        )
    except Exception as e:
        component_results["spec_memo"] = {"note": f"Spec memo check error: {e}"}

    # ── Action 13: CheckBook Session Arm (KN031) ──────────────────────────────
    # Non-breaking extension: fires CheckBook Orchestrator to arm Stenographer +
    # Shutterbug for the incoming session. Degrades gracefully on any error.
    try:
        import sys as _sys
        _checkbook_dir = __import__("pathlib").Path(__file__).parent.parent
        if str(_checkbook_dir) not in _sys.path:
            _sys.path.insert(0, str(_checkbook_dir))
        from checkbook.checkbook_orchestrator import arm_session as _cb_arm
        _cb_session = _cb_arm(
            session_id=session_id,
            pod_id="",
            bean_sequence=[],
            agent="Knight",
            enable_shutterbug=True,
        )
        component_results["checkbook_arm"] = {
            "status": "armed",
            "session_id": session_id,
        }
    except Exception as e:
        component_results["checkbook_arm"] = {
            "status": "error",
            "error": str(e),
        }

    # ── Action 12: Assemble Vine Landing Receipt ───────────────────────────────
    elapsed_ms = int((time.monotonic() - t0) * 1000)

    try:
        from vine_transfer.vine_landing_receipt import assemble_receipt, persist_receipt

        receipt = assemble_receipt(
            session_id=session_id,
            prior_session_id=prior_session_id,
            drift_summary=component_results.get("drift", {}).get(
                "formatted_summary", "Drift: unavailable"
            ),
            queue_summary=(
                component_results.get("queue", {}).get("formatted_digest", "")
                + "\n"
                + component_results.get("knight_queue", {}).get("formatted_summary", "")
            ),
            dispatch_summary=component_results.get("dispatches", {}).get(
                "formatted_summary", "Dispatches: unavailable"
            ),
            deadline_summary=component_results.get("deadlines", {}).get(
                "formatted_summary", "Deadlines: unavailable"
            ),
            eblet_promotion_summary=component_results.get(
                "eblet_promotion", "Eblet promotion: unavailable"
            ),
            codecopy_summary=component_results.get("codecopy", {}),
            memory_flip_summary=component_results.get("memory_flip", "unavailable"),
            librarian_rebuild_summary=component_results.get("librarian_rebuild", {}),
            spec_memo_summary=component_results.get("spec_memo"),
            extra_context=f"Auto-orchestration elapsed: {elapsed_ms}ms",
        )

        if not dry_run:
            paths = persist_receipt(receipt)
            receipt["receipt_path"] = paths["receipt_path"]
            receipt["chronicler_path"] = paths["chronicler_path"]

        receipt["component_results"] = component_results
        receipt["elapsed_ms"] = elapsed_ms
        return receipt

    except Exception as e:
        return {
            "receipt_text": f"[Vine Transfer] Receipt assembly error: {e}",
            "component_results": component_results,
            "elapsed_ms": elapsed_ms,
            "error": str(e),
        }
