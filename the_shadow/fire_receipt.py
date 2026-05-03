"""
FireReceipt — KN-R3 / BP018
============================
Audit-trail dataclass returned by HandoffAutoFire.fire().
Records when, to whom, and which K-prompt was fired.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class FireReceipt:
    """Immutable record of a single auto-fire event."""

    entry_id: str               # Pod-Q LB-ODS-NNNN serial
    k_prompt_path: str          # absolute path to K-prompt file
    knight_session_target: str  # e.g. "knight-1", "cursor-session-A"
    shadow_id: str              # which Shadow fired
    fired_at: str               # ISO-8601 UTC timestamp
    paste_text: str             # the exact paste-text sent to Knight
    idempotency_key: str        # sha256(entry_id + knight_session_target) hex

    # Optional enrichment
    prepared_context_summary: str = ""
    prerequisites_verified: list[str] = field(default_factory=list)

    @classmethod
    def build(
        cls,
        entry_id: str,
        k_prompt_path: str,
        knight_session_target: str,
        shadow_id: str,
        paste_text: str,
        prepared_context_summary: str = "",
        prerequisites_verified: list[str] | None = None,
    ) -> "FireReceipt":
        import hashlib
        idem_key = hashlib.sha256(
            f"{entry_id}:{knight_session_target}".encode()
        ).hexdigest()
        return cls(
            entry_id=entry_id,
            k_prompt_path=k_prompt_path,
            knight_session_target=knight_session_target,
            shadow_id=shadow_id,
            fired_at=datetime.now(timezone.utc).isoformat(),
            paste_text=paste_text,
            idempotency_key=idem_key,
            prepared_context_summary=prepared_context_summary,
            prerequisites_verified=prerequisites_verified or [],
        )
