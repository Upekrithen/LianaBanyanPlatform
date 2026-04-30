"""
CheckBook Orchestrator — KN031 / A&A #2304 / BP003

Session-scoped coordinator for Stenographer + Shutterbug + Accountant.
Integrates with KN023 Vine Transfer SessionStart hook.
Emits Chronos-signed CheckBook Receipt at session close.

Public API:
    from checkbook import CheckBookSession, arm_session, close_session
    from checkbook import load_receipt, verify_receipt, format_receipt_summary
"""

from .checkbook_orchestrator import (
    CheckBookSession,
    arm_session,
    get_active_session,
    close_session,
)
from .session_receipt_emitter import (
    load_receipt,
    list_receipts,
    verify_receipt,
    format_receipt_summary,
    prepare_federation_share,
)

__all__ = [
    "CheckBookSession",
    "arm_session",
    "get_active_session",
    "close_session",
    "load_receipt",
    "list_receipts",
    "verify_receipt",
    "format_receipt_summary",
    "prepare_federation_share",
]
