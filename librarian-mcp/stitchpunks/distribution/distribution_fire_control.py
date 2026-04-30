"""
distribution_fire_control.py — KN020/BP002

Fire-control gate for all distribution channel publish actions.
Mirrors mercury_approval_token.py pattern (KN017) for cross-stitchpunk consistency.
PUBLICATION GATE HARD: every publish requires Founder-signed approval token.
"""

from __future__ import annotations
import hashlib
import hmac
import json
import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

_TOKEN_STORE_PATH = Path(__file__).parent / "distribution_token_store.jsonl"
_TOKEN_SECRET = os.environ.get("DISTRIBUTION_FIRE_CONTROL_SECRET", "distribution-gate-dev-secret-KN020")
_TOKEN_TTL_SECONDS = 3600


class FireControlError(Exception):
    pass


def _sign(payload: str) -> str:
    mac = hmac.new(_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256)
    return mac.hexdigest()


def generate_approval_token(
    channel: str,
    action: str = "publish",
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate a one-time Founder approval token for a distribution action."""
    token_id = str(uuid.uuid4())
    issued_at = time.time()
    payload = {
        "token_id": token_id,
        "channel": channel,
        "action": action,
        "issued_at": issued_at,
        "expires_at": issued_at + _TOKEN_TTL_SECONDS,
        "metadata": metadata or {},
        "consumed": False,
    }
    payload["signature"] = _sign(json.dumps({k: v for k, v in payload.items() if k != "signature"}, sort_keys=True))

    with _TOKEN_STORE_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload) + "\n")

    return token_id


def verify_and_consume_token(
    token_id: str,
    channel: str,
    action: str = "publish",
) -> Dict[str, Any]:
    """Verify a token and mark it consumed (one-time use)."""
    if not _TOKEN_STORE_PATH.exists():
        raise FireControlError("No token store found — no tokens have been issued")

    lines = _TOKEN_STORE_PATH.read_text(encoding="utf-8").splitlines()
    tokens = []
    target_token = None
    target_idx = None

    for i, line in enumerate(lines):
        try:
            tok = json.loads(line)
        except json.JSONDecodeError:
            continue
        tokens.append(tok)
        if tok.get("token_id") == token_id:
            target_token = tok
            target_idx = i

    if target_token is None:
        raise FireControlError(f"Token {token_id!r} not found")
    if target_token.get("consumed"):
        raise FireControlError(f"Token {token_id!r} already consumed (replay attack prevented)")
    if target_token.get("channel") != channel:
        raise FireControlError(f"Token channel mismatch: expected {channel!r}")
    if target_token.get("action") != action:
        raise FireControlError(f"Token action mismatch: expected {action!r}")
    if time.time() > target_token.get("expires_at", 0):
        raise FireControlError(f"Token {token_id!r} has expired")

    # Verify signature
    check_payload = {k: v for k, v in target_token.items() if k not in ("signature", "consumed")}
    check_payload["consumed"] = False
    expected_sig = _sign(json.dumps(check_payload, sort_keys=True))
    if not hmac.compare_digest(expected_sig, target_token.get("signature", "")):
        raise FireControlError("Token signature invalid — possible tampering")

    # Mark consumed
    tokens[target_idx]["consumed"] = True
    with _TOKEN_STORE_PATH.open("w", encoding="utf-8") as f:
        for tok in tokens:
            f.write(json.dumps(tok) + "\n")

    return target_token


class FireControlGate:
    """Convenience wrapper used by channel adapters."""

    def __init__(self, channel: str, action: str = "publish"):
        self._channel = channel
        self._action = action

    def verify(self, approval_token: str) -> Dict[str, Any]:
        """Raise FireControlError if token is invalid/expired/consumed."""
        return verify_and_consume_token(approval_token, self._channel, self._action)
