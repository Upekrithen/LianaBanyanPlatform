"""
HandoffAutoFire — KN-R3 / BP018
=================================
Coal-Shovel-Tag final swing: Shadow hands prepared K-prompt to Knight.

On Pod-Q queue entry having prepared_context populated AND all prerequisites
landed: compose BP017-format paste-text and fire to Knight session.

Idempotency: repeated .fire() calls for the same (entry_id, session_target)
return the same FireReceipt without double-mutating the queue.
"""

from __future__ import annotations

import hashlib
import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from the_shadow.fire_receipt import FireReceipt
from the_shadow.knight_fire_composer import compose_paste_text, validate_paste_text


# ─── In-process idempotency registry ────────────────────────────────────────

_receipt_lock = threading.Lock()
_fired_receipts: dict[str, FireReceipt] = {}  # idem_key → FireReceipt


def _idem_key(entry_id: str, knight_session_target: str) -> str:
    return hashlib.sha256(
        f"{entry_id}:{knight_session_target}".encode()
    ).hexdigest()


# ─── On Deck client protocol (duck-typed) ───────────────────────────────────

class OnDeckClientProtocol:
    """Minimal interface HandoffAutoFire needs from a Pod-Q client."""

    def get_entry(self, entry_id: str) -> Optional[dict]:
        raise NotImplementedError

    def get_queue(self) -> list[dict]:
        raise NotImplementedError

    def mark_in_flight(self, entry_id: str) -> None:
        raise NotImplementedError


# ─── FireError ───────────────────────────────────────────────────────────────

class FireError(Exception):
    """Raised when auto-fire preconditions are not met."""


# ─── HandoffAutoFire ─────────────────────────────────────────────────────────

class HandoffAutoFire:
    """
    Shadow → Knight hand-off auto-fire.

    Usage:
        autofire = HandoffAutoFire(shadow_id="shadow-3", on_deck_client=client)
        receipt = autofire.fire(ready_entry, knight_session_target="knight-1")
    """

    def __init__(
        self,
        shadow_id: str,
        on_deck_client: OnDeckClientProtocol,
        bishop_parallel_note: str = "Stalk 2 + Stalk 3 K-prompt drafting",
    ):
        self.shadow_id = shadow_id
        self.on_deck = on_deck_client
        self.bishop_parallel_note = bishop_parallel_note

    def fire(
        self,
        ready_entry: dict,
        knight_session_target: str,
    ) -> FireReceipt:
        """
        Fire next K-prompt to Knight.

        Preconditions (raises FireError if not met):
          1. ready_entry["prepared_context"] must be populated
          2. all ready_entry["prerequisites"] must be landed in the queue

        Idempotency: returns same FireReceipt if already fired for this
        (entry_id, knight_session_target) pair.
        """
        entry_id = ready_entry.get("id", "")
        idem = _idem_key(entry_id, knight_session_target)

        with _receipt_lock:
            if idem in _fired_receipts:
                return _fired_receipts[idem]

        # ── Precondition 1: prepared_context must be present ──────────────
        prepared_ctx = ready_entry.get("prepared_context")
        if not prepared_ctx:
            raise FireError(
                f"Entry {entry_id} has no prepared_context — cannot auto-fire."
            )

        # ── Precondition 2: all prerequisites must be landed ──────────────
        prerequisites = ready_entry.get("prerequisites", [])
        verified: list[str] = []
        if prerequisites:
            queue = self.on_deck.get_queue()
            queue_by_id = {e["id"]: e for e in queue}
            for prereq_id in prerequisites:
                prereq = queue_by_id.get(prereq_id)
                if prereq is None or prereq.get("status") != "landed":
                    raise FireError(
                        f"Prerequisite {prereq_id} not yet landed — cannot auto-fire {entry_id}."
                    )
                verified.append(prereq_id)

        # ── Compose BP017 paste-text ───────────────────────────────────────
        k_prompt_path = ready_entry.get("k_prompt_path", "")
        paste_text = compose_paste_text(
            k_prompt_path=k_prompt_path,
            bishop_parallel_note=self.bishop_parallel_note,
        )

        violations = validate_paste_text(paste_text)
        if violations:
            raise FireError(f"Paste-text violates BP017: {violations}")

        # ── Mark in-flight in Pod-Q queue ─────────────────────────────────
        self.on_deck.mark_in_flight(entry_id)

        # ── Build receipt ──────────────────────────────────────────────────
        ctx_summary = ""
        if isinstance(prepared_ctx, dict):
            ctx_summary = prepared_ctx.get("summary", "") or str(prepared_ctx)[:120]

        receipt = FireReceipt.build(
            entry_id=entry_id,
            k_prompt_path=k_prompt_path,
            knight_session_target=knight_session_target,
            shadow_id=self.shadow_id,
            paste_text=paste_text,
            prepared_context_summary=ctx_summary,
            prerequisites_verified=verified,
        )

        with _receipt_lock:
            _fired_receipts[idem] = receipt

        return receipt

    def reset_idempotency(self) -> None:
        """Clear in-process cache (for testing only)."""
        with _receipt_lock:
            _fired_receipts.clear()


# ─── Concurrent multi-session fire ───────────────────────────────────────────

def fire_parallel(
    autofire: HandoffAutoFire,
    entries_and_targets: list[tuple[dict, str]],
) -> list[FireReceipt | Exception]:
    """
    Fire multiple (entry, knight_session_target) pairs concurrently.
    Returns list aligned with input; element is FireReceipt or Exception.
    Supports 5-Knight parallel directive.
    """
    results: list[FireReceipt | Exception | None] = [None] * len(entries_and_targets)
    threads: list[threading.Thread] = []

    def _fire(idx: int, entry: dict, target: str) -> None:
        try:
            results[idx] = autofire.fire(entry, target)
        except Exception as exc:
            results[idx] = exc

    for i, (entry, target) in enumerate(entries_and_targets):
        t = threading.Thread(target=_fire, args=(i, entry, target), daemon=True)
        threads.append(t)

    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=10)

    return results  # type: ignore[return-value]
