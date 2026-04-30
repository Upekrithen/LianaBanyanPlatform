#!/usr/bin/env python3
"""
bishop_catechist_grader.py — KN036 Catechist Scribe grade aggregator.

D.3 aggregation logic:
  ALL_PASS (no WARN, no FAIL)         → grade = "PASS"
  ANY_WARN, NO_FAIL                   → grade = "WARN"
  ANY_FAIL (regardless of WARN)       → grade = "FAIL"
  INSUFFICIENT_DATA (< 3 turns)       → grade = "INSUFFICIENT_DATA"

D.11: Chronos signature appended to grade JSON via HMAC-SHA256 of
      (session_id + checked_at_turn + grade) with a local-only nonce.
      chronos_test_signer.py from KN026 not found; inline equivalent used.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from pathlib import Path
from typing import Any, Optional


STATE_DIR = Path(r"C:\Users\Administrator\.claude\state\catechist")
CHRONOS_NONCE_FILE = STATE_DIR / "chronos_nonce.bin"


def _get_or_create_nonce() -> bytes:
    """Return a persistent local HMAC nonce (not a secret — just for reproducibility)."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        if CHRONOS_NONCE_FILE.is_file():
            return CHRONOS_NONCE_FILE.read_bytes()
        # Generate once per machine and persist
        import os
        nonce = os.urandom(32)
        CHRONOS_NONCE_FILE.write_bytes(nonce)
        return nonce
    except Exception:
        return b"catechist-fallback-nonce-KN036"


def chronos_sign(session_id: str, grade: str, checked_at_turn: int) -> str:
    """
    D.11: Produce a Chronos signature.

    HMAC-SHA256 over "<session_id>:<grade>:<checked_at_turn>:<unix_ts_rounded_to_hour>".
    Rounded timestamp means the signature is stable within a session hour.
    """
    ts_hour = int(time.time()) // 3600
    payload = f"{session_id}:{grade}:{checked_at_turn}:{ts_hour}".encode()
    key = _get_or_create_nonce()
    sig = hmac.new(key, payload, hashlib.sha256).hexdigest()
    return f"catechist-v1:{sig[:24]}"


def aggregate(
    rule_results: list[dict],
    session_id: str,
    session_name: str,
    checked_at_turn: int,
    insufficient_data: bool,
    session_jsonl: str,
    agent: str = "bishop",
) -> dict:
    """
    Aggregate individual rule results into the canonical grade JSON (canon schema).

    Returns the grade dict ready for JSON serialisation.
    """
    if insufficient_data:
        grade = "INSUFFICIENT_DATA"
    else:
        statuses = [r.get("status", "WARN") for r in rule_results]
        if any(s == "FAIL" for s in statuses):
            grade = "FAIL"
        elif any(s == "WARN" for s in statuses):
            grade = "WARN"
        else:
            grade = "PASS"

    passed = sum(1 for r in rule_results if r.get("status") == "PASS")
    warned = sum(1 for r in rule_results if r.get("status") == "WARN")
    failed = sum(1 for r in rule_results if r.get("status") == "FAIL")

    chronos_sig = chronos_sign(session_id, grade, checked_at_turn)

    return {
        "session_id": session_id,
        "agent": agent,
        "session_name": session_name,
        "checked_at_turn": checked_at_turn,
        "rules_evaluated": len(rule_results),
        "passed": passed,
        "warned": warned,
        "failed": failed,
        "grade": grade,
        "insufficient_data": insufficient_data,
        "details": rule_results,
        "appended_to_vine_receipt": False,  # updated by vine_extender
        "chronos_signed": True,
        "chronos_signature": chronos_sig,
        "session_jsonl": session_jsonl,
    }


def write_grade(grade_dict: dict, session_id: str, session_name: str) -> Optional[Path]:
    """Write grade JSON to canonical path. D.4 path convention."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = session_name.replace(" ", "_")
        safe_id = session_id[:16] if session_id else "unknown"
        filename = f"bishop_{safe_name}_{safe_id}_grade.json"
        out_path = STATE_DIR / filename
        with out_path.open("w", encoding="utf-8") as fh:
            json.dump(grade_dict, fh, indent=2)
        return out_path
    except Exception:
        return None
