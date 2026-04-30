"""
Mercury Bank — Component 1: Approval Token
KN017 / Fire Control Write-Path Activation

Generates, signs, verifies, and revokes approval tokens for Mercury write actions.
Tokens are cryptographic-class: SHA-256 hash + timestamp + scope + expiration.

Token lifecycle:
  1. Knight emits action-request → approval token generated (pending)
  2. Founder fires approval → token consumed → write executes
  3. Alternatively: Founder revokes → token marked revoked → cannot replay

Stone Tablet Imperative: all token events appended to mercury_ledger.jsonl
Toolsmith log: TS-MERCURY-BANK-WRITE-PATH-KN017-BP002
"""

from __future__ import annotations

import hashlib
import json
import secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_TOKEN_STORE_PATH = _HERE / "approval_tokens.jsonl"

DEFAULT_EXPIRY_HOURS = 24


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _expiry_at(hours: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=hours)
    return exp.isoformat().replace("+00:00", "Z")


def _generate_token_id() -> str:
    return "MKT-" + secrets.token_hex(12)


def _sign_token(token_id: str, action: str, scope: str, ts: str) -> str:
    """SHA-256 signature over token_id + action + scope + timestamp."""
    payload = f"{token_id}:{action}:{scope}:{ts}"
    return hashlib.sha256(payload.encode()).hexdigest()[:32]


def generate_approval_token(
    action: str,
    scope: str,
    amount_cents: Optional[int] = None,
    expiry_hours: int = DEFAULT_EXPIRY_HOURS,
    store_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Generate a new approval token for a write action.
    Returns the token dict; appends to token store.

    action: "transfer" | "ach" | "wire" | "card_issuance"
    scope: description of the specific write (e.g., "transfer $500 to account X")
    """
    store = Path(store_path) if store_path else _TOKEN_STORE_PATH
    ts = _iso_now()
    token_id = _generate_token_id()
    signature = _sign_token(token_id, action, scope, ts)
    expires_at = _expiry_at(expiry_hours)

    token = {
        "token_id": token_id,
        "action": action,
        "scope": scope,
        "amount_cents": amount_cents,
        "status": "pending",
        "signature": signature,
        "created_at": ts,
        "expires_at": expires_at,
        "expiry_hours": expiry_hours,
    }

    _append_token(token, store)
    return token


def verify_approval_token(
    token_id: str,
    store_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Verify a token is: (1) present, (2) pending, (3) not expired, (4) signature valid.

    Returns { valid: bool, token: dict|None, reason: str }
    """
    store = Path(store_path) if store_path else _TOKEN_STORE_PATH
    token = _load_token(token_id, store)
    if token is None:
        return {"valid": False, "token": None, "reason": "token_not_found"}

    if token["status"] == "revoked":
        return {"valid": False, "token": token, "reason": "token_revoked"}

    if token["status"] == "consumed":
        return {"valid": False, "token": token, "reason": "token_already_consumed"}

    now = datetime.now(timezone.utc)
    expires = datetime.fromisoformat(token["expires_at"].replace("Z", "+00:00"))
    if now > expires:
        return {"valid": False, "token": token, "reason": "token_expired"}

    expected_sig = _sign_token(
        token["token_id"], token["action"], token["scope"], token["created_at"]
    )
    if token.get("signature") != expected_sig:
        return {"valid": False, "token": token, "reason": "signature_invalid"}

    return {"valid": True, "token": token, "reason": "ok"}


def consume_approval_token(
    token_id: str,
    store_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Mark a token as consumed (write executed). Idempotent — already-consumed tokens
    are not re-consumable.

    Returns { success: bool, token_id: str, reason: str }
    """
    store = Path(store_path) if store_path else _TOKEN_STORE_PATH
    verification = verify_approval_token(token_id, store)
    if not verification["valid"]:
        return {"success": False, "token_id": token_id, "reason": verification["reason"]}

    token = verification["token"]
    token["status"] = "consumed"
    token["consumed_at"] = _iso_now()
    _append_token(token, store)
    return {"success": True, "token_id": token_id, "reason": "consumed"}


def revoke_approval_token(
    token_id: str,
    store_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Revoke a pending token. Revoked tokens cannot be replayed.

    Returns { success: bool, token_id: str, reason: str }
    """
    store = Path(store_path) if store_path else _TOKEN_STORE_PATH
    token = _load_token(token_id, store)
    if token is None:
        return {"success": False, "token_id": token_id, "reason": "token_not_found"}
    if token["status"] in ("consumed", "revoked"):
        return {"success": False, "token_id": token_id, "reason": f"already_{token['status']}"}

    token["status"] = "revoked"
    token["revoked_at"] = _iso_now()
    _append_token(token, store)
    return {"success": True, "token_id": token_id, "reason": "revoked"}


def list_pending_tokens(store_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Return all pending (non-expired, non-consumed, non-revoked) tokens."""
    store = Path(store_path) if store_path else _TOKEN_STORE_PATH
    all_tokens = _load_all_tokens(store)
    now = datetime.now(timezone.utc)
    pending = []
    seen: Dict[str, Dict[str, Any]] = {}
    for t in all_tokens:
        seen[t["token_id"]] = t
    for t in seen.values():
        if t["status"] != "pending":
            continue
        expires = datetime.fromisoformat(t["expires_at"].replace("Z", "+00:00"))
        if now <= expires:
            pending.append(t)
    return pending


def _append_token(token: Dict[str, Any], store: Path) -> None:
    store.parent.mkdir(parents=True, exist_ok=True)
    with store.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(token) + "\n")


def _load_token(token_id: str, store: Path) -> Optional[Dict[str, Any]]:
    """Load the LAST record for a token_id (most recent state wins)."""
    if not store.exists():
        return None
    last = None
    for line in store.read_text(encoding="utf-8").split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            t = json.loads(line)
            if t.get("token_id") == token_id:
                last = t
        except json.JSONDecodeError:
            pass
    return last


def _load_all_tokens(store: Path) -> List[Dict[str, Any]]:
    if not store.exists():
        return []
    tokens = []
    for line in store.read_text(encoding="utf-8").split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            tokens.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return tokens
