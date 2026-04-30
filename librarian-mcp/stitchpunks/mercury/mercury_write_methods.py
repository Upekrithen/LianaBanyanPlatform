"""
Mercury Bank — Component 2: Write Methods with Fire-Control Gate
KN017 / Fire Control Write-Path Activation

Write actions: transfer / ACH / wire / card-issuance.
Each requires a valid approval token before executing.

All write executions are scribed via Chronos-pattern action receipts.
Toolsmith log: TS-MERCURY-BANK-WRITE-PATH-KN017-BP002
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from mercury_approval_token import verify_approval_token, consume_approval_token

_HERE = Path(__file__).parent
_LEDGER_PATH = _HERE / "mercury_ledger.jsonl"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(record: Dict[str, Any]) -> str:
    payload = json.dumps(record, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:24]


def _append_ledger(record: Dict[str, Any], ledger_path: Optional[Path] = None) -> None:
    path = ledger_path or _LEDGER_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


def _execute_write(
    action: str,
    params: Dict[str, Any],
    token_id: str,
    store_path: Optional[Path] = None,
    ledger_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Gate: verify token → consume → stub-execute → scribe receipt.
    """
    verification = verify_approval_token(token_id, store_path=store_path)
    if not verification["valid"]:
        return {
            "success": False,
            "action": action,
            "reason": verification["reason"],
            "token_id": token_id,
        }

    consumed = consume_approval_token(token_id, store_path=store_path)
    if not consumed["success"]:
        return {
            "success": False,
            "action": action,
            "reason": consumed["reason"],
            "token_id": token_id,
        }

    executed_at = _iso_now()
    receipt = {
        "type": "write_receipt",
        "action": action,
        "params": params,
        "token_id": token_id,
        "executed_at": executed_at,
        "status": "stub_executed",
        "note": "MVP stub — Mercury API not yet provisioned; write would execute in production",
    }
    receipt["chronos_hash"] = _chronos_sign(receipt)
    _append_ledger(receipt, ledger_path)

    return {
        "success": True,
        "action": action,
        "token_id": token_id,
        "executed_at": executed_at,
        "chronos_hash": receipt["chronos_hash"],
        "receipt": receipt,
    }


def execute_transfer(
    from_account_id: str,
    to_account_id: str,
    amount_cents: int,
    note: str,
    token_id: str,
    store_path: Optional[Path] = None,
    ledger_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Execute an internal transfer with Fire Control gate."""
    return _execute_write(
        action="transfer",
        params={
            "from_account_id": from_account_id,
            "to_account_id": to_account_id,
            "amount_cents": amount_cents,
            "note": note,
        },
        token_id=token_id,
        store_path=store_path,
        ledger_path=ledger_path,
    )


def execute_ach(
    account_id: str,
    amount_cents: int,
    direction: str,
    counterparty_routing_number: str,
    counterparty_account_number: str,
    note: str,
    token_id: str,
    store_path: Optional[Path] = None,
    ledger_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Execute an ACH payment with Fire Control gate."""
    return _execute_write(
        action="ach",
        params={
            "account_id": account_id,
            "amount_cents": amount_cents,
            "direction": direction,
            "counterparty_routing_number": counterparty_routing_number,
            "counterparty_account_number": counterparty_account_number,
            "note": note,
        },
        token_id=token_id,
        store_path=store_path,
        ledger_path=ledger_path,
    )


def execute_wire(
    account_id: str,
    amount_cents: int,
    beneficiary_name: str,
    beneficiary_routing_number: str,
    beneficiary_account_number: str,
    memo: str,
    token_id: str,
    store_path: Optional[Path] = None,
    ledger_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Execute a wire transfer with Fire Control gate."""
    return _execute_write(
        action="wire",
        params={
            "account_id": account_id,
            "amount_cents": amount_cents,
            "beneficiary_name": beneficiary_name,
            "beneficiary_routing_number": beneficiary_routing_number,
            "beneficiary_account_number": beneficiary_account_number,
            "memo": memo,
        },
        token_id=token_id,
        store_path=store_path,
        ledger_path=ledger_path,
    )


def execute_card_issuance(
    account_id: str,
    cardholder_name: str,
    card_type: str,
    spending_limit_cents: int,
    token_id: str,
    store_path: Optional[Path] = None,
    ledger_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Execute card issuance with Fire Control gate."""
    return _execute_write(
        action="card_issuance",
        params={
            "account_id": account_id,
            "cardholder_name": cardholder_name,
            "card_type": card_type,
            "spending_limit_cents": spending_limit_cents,
        },
        token_id=token_id,
        store_path=store_path,
        ledger_path=ledger_path,
    )
