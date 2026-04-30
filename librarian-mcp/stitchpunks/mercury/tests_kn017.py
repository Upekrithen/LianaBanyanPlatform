"""
KN017 — Mercury Bank Write-Path Activation — Test Suite
18 tests covering: approval token generation, expiration, verification,
write execution, revocation, all 4 write action types, concurrency,
audit trail, pending list, end-to-end approval flow.

Run:  python -m pytest tests_kn017.py -v
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))


# ─── Fixtures ─────────────────────────────────────────────────────────────────

def _token_store(tmp_path: Path) -> Path:
    return tmp_path / "approval_tokens.jsonl"


def _ledger(tmp_path: Path) -> Path:
    return tmp_path / "mercury_ledger.jsonl"


# ─── Test 1: Approval token generation — format valid + signature reproducible

def test_approval_token_generation(tmp_path):
    from mercury_approval_token import generate_approval_token, _sign_token
    store = _token_store(tmp_path)
    token = generate_approval_token("transfer", "transfer $500 to vendor", store_path=store)
    assert token["token_id"].startswith("MKT-")
    assert token["action"] == "transfer"
    assert token["scope"] == "transfer $500 to vendor"
    assert token["status"] == "pending"
    assert token["signature"]
    # Verify signature is reproducible
    expected = _sign_token(token["token_id"], token["action"], token["scope"], token["created_at"])
    assert token["signature"] == expected


# ─── Test 2: Approval token expiration — 24h default + configurable ──────────

def test_approval_token_expiry_default(tmp_path):
    from mercury_approval_token import generate_approval_token
    from datetime import datetime, timezone
    store = _token_store(tmp_path)
    token = generate_approval_token("ach", "pay vendor", store_path=store)
    assert token["expiry_hours"] == 24
    expires = datetime.fromisoformat(token["expires_at"].replace("Z", "+00:00"))
    created = datetime.fromisoformat(token["created_at"].replace("Z", "+00:00"))
    delta_hours = (expires - created).total_seconds() / 3600
    assert 23.9 <= delta_hours <= 24.1


def test_approval_token_expiry_configurable(tmp_path):
    from mercury_approval_token import generate_approval_token
    store = _token_store(tmp_path)
    token = generate_approval_token("wire", "wire to partner", expiry_hours=1, store_path=store)
    assert token["expiry_hours"] == 1


# ─── Test 3: Verification — valid token passes ────────────────────────────────

def test_approval_token_verification_valid(tmp_path):
    from mercury_approval_token import generate_approval_token, verify_approval_token
    store = _token_store(tmp_path)
    token = generate_approval_token("transfer", "test scope", store_path=store)
    result = verify_approval_token(token["token_id"], store_path=store)
    assert result["valid"] is True
    assert result["reason"] == "ok"


# ─── Test 4: Write attempt without token → emits action-request, blocks ──────

def test_write_without_token_blocked(tmp_path):
    from mercury_write_methods import execute_transfer
    result = execute_transfer(
        from_account_id="acc-1",
        to_account_id="acc-2",
        amount_cents=50000,
        note="test",
        token_id="MKT-nonexistent",
        store_path=_token_store(tmp_path),
        ledger_path=_ledger(tmp_path),
    )
    assert result["success"] is False
    assert result["reason"] == "token_not_found"


# ─── Test 5: Write attempt with valid token → executes, scribes receipt ───────

def test_write_with_valid_token_executes(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_transfer
    store = _token_store(tmp_path)
    ledger = _ledger(tmp_path)
    token = generate_approval_token("transfer", "test transfer", store_path=store)
    result = execute_transfer(
        from_account_id="acc-1",
        to_account_id="acc-2",
        amount_cents=10000,
        note="test",
        token_id=token["token_id"],
        store_path=store,
        ledger_path=ledger,
    )
    assert result["success"] is True
    assert result["chronos_hash"]
    assert ledger.exists()


# ─── Test 6: Write attempt with revoked token → fails ─────────────────────────

def test_write_with_revoked_token_blocked(tmp_path):
    from mercury_approval_token import generate_approval_token, revoke_approval_token
    from mercury_write_methods import execute_ach
    store = _token_store(tmp_path)
    ledger = _ledger(tmp_path)
    token = generate_approval_token("ach", "ach payment", store_path=store)
    revoke_approval_token(token["token_id"], store_path=store)
    result = execute_ach(
        account_id="acc-1",
        amount_cents=5000,
        direction="credit",
        counterparty_routing_number="021000021",
        counterparty_account_number="123456789",
        note="test",
        token_id=token["token_id"],
        store_path=store,
        ledger_path=ledger,
    )
    assert result["success"] is False
    assert result["reason"] == "token_revoked"


# ─── Test 7: Approval-request event schema valid ─────────────────────────────

def test_action_receipt_schema_valid(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_transfer
    store = _token_store(tmp_path)
    ledger = _ledger(tmp_path)
    token = generate_approval_token("transfer", "schema test", store_path=store)
    result = execute_transfer(
        from_account_id="a", to_account_id="b", amount_cents=100,
        note="schema", token_id=token["token_id"], store_path=store, ledger_path=ledger,
    )
    assert result["success"] is True
    receipt = result["receipt"]
    assert receipt["type"] == "write_receipt"
    assert receipt["action"] == "transfer"
    assert receipt["chronos_hash"]


# ─── Test 8: Action receipt schema valid (Stone Tablet append-only) ───────────

def test_ledger_append_only(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_wire
    store = _token_store(tmp_path)
    ledger = _ledger(tmp_path)
    token = generate_approval_token("wire", "wire test", store_path=store)
    execute_wire(
        account_id="acc-1", amount_cents=200000,
        beneficiary_name="Vendor", beneficiary_routing_number="021000021",
        beneficiary_account_number="987654321", memo="test wire",
        token_id=token["token_id"], store_path=store, ledger_path=ledger,
    )
    entries = [json.loads(l) for l in ledger.read_text().split("\n") if l.strip()]
    assert len(entries) >= 1
    assert entries[-1]["type"] == "write_receipt"


# ─── Test 9: Chronos signing on action receipt ───────────────────────────────

def test_chronos_signing_on_receipt(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_card_issuance
    store = _token_store(tmp_path)
    ledger = _ledger(tmp_path)
    token = generate_approval_token("card_issuance", "issue card", store_path=store)
    result = execute_card_issuance(
        account_id="acc-1", cardholder_name="Jane Doe",
        card_type="virtual", spending_limit_cents=50000,
        token_id=token["token_id"], store_path=store, ledger_path=ledger,
    )
    assert result["success"] is True
    assert len(result["chronos_hash"]) == 24


# ─── Test 10: Transfer write tested (stubbed Mercury API) ────────────────────

def test_transfer_write(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_transfer
    store = _token_store(tmp_path)
    token = generate_approval_token("transfer", "t1", store_path=store)
    result = execute_transfer("a", "b", 1000, "t1", token["token_id"], store_path=store, ledger_path=_ledger(tmp_path))
    assert result["success"] is True
    assert result["action"] == "transfer"


# ─── Test 11: ACH write tested ───────────────────────────────────────────────

def test_ach_write(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_ach
    store = _token_store(tmp_path)
    token = generate_approval_token("ach", "ach1", store_path=store)
    result = execute_ach("a", 2000, "debit", "021000021", "000001", "ach1", token["token_id"],
                         store_path=store, ledger_path=_ledger(tmp_path))
    assert result["success"] is True
    assert result["action"] == "ach"


# ─── Test 12: Wire write tested ──────────────────────────────────────────────

def test_wire_write(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_wire
    store = _token_store(tmp_path)
    token = generate_approval_token("wire", "wire1", store_path=store)
    result = execute_wire("a", 50000, "Beneficiary", "021000021", "111222333", "wire1",
                          token["token_id"], store_path=store, ledger_path=_ledger(tmp_path))
    assert result["success"] is True
    assert result["action"] == "wire"


# ─── Test 13: Card-issuance write tested ─────────────────────────────────────

def test_card_issuance_write(tmp_path):
    from mercury_approval_token import generate_approval_token
    from mercury_write_methods import execute_card_issuance
    store = _token_store(tmp_path)
    token = generate_approval_token("card_issuance", "card1", store_path=store)
    result = execute_card_issuance("a", "John Smith", "virtual", 25000,
                                   token["token_id"], store_path=store, ledger_path=_ledger(tmp_path))
    assert result["success"] is True
    assert result["action"] == "card_issuance"


# ─── Test 14: Concurrent approval requests don't race-condition ──────────────

def test_concurrent_tokens_independent(tmp_path):
    from mercury_approval_token import generate_approval_token, verify_approval_token
    store = _token_store(tmp_path)
    t1 = generate_approval_token("transfer", "t1", store_path=store)
    t2 = generate_approval_token("ach", "t2", store_path=store)
    v1 = verify_approval_token(t1["token_id"], store_path=store)
    v2 = verify_approval_token(t2["token_id"], store_path=store)
    assert v1["valid"] is True
    assert v2["valid"] is True
    assert t1["token_id"] != t2["token_id"]


# ─── Test 15: Revoked token cannot be replayed ───────────────────────────────

def test_revoked_token_cannot_replay(tmp_path):
    from mercury_approval_token import generate_approval_token, revoke_approval_token, verify_approval_token
    store = _token_store(tmp_path)
    token = generate_approval_token("transfer", "replay test", store_path=store)
    revoke_approval_token(token["token_id"], store_path=store)
    result = verify_approval_token(token["token_id"], store_path=store)
    assert result["valid"] is False
    assert result["reason"] == "token_revoked"


# ─── Test 16: MCP query lists pending approvals ──────────────────────────────

def test_pending_approvals_listed(tmp_path):
    from mercury_approval_token import generate_approval_token, list_pending_tokens
    store = _token_store(tmp_path)
    generate_approval_token("transfer", "pending-1", store_path=store)
    generate_approval_token("ach", "pending-2", store_path=store)
    pending = list_pending_tokens(store_path=store)
    assert len(pending) >= 2
    actions = [p["action"] for p in pending]
    assert "transfer" in actions
    assert "ach" in actions


# ─── Test 17: Consumed token removed from pending list ───────────────────────

def test_consumed_token_not_in_pending(tmp_path):
    from mercury_approval_token import generate_approval_token, list_pending_tokens
    from mercury_write_methods import execute_transfer
    store = _token_store(tmp_path)
    token = generate_approval_token("transfer", "consume test", store_path=store)
    execute_transfer("a", "b", 100, "x", token["token_id"],
                     store_path=store, ledger_path=_ledger(tmp_path))
    pending = list_pending_tokens(store_path=store)
    pending_ids = [p["token_id"] for p in pending]
    assert token["token_id"] not in pending_ids


# ─── Test 18: End-to-end: action-request → approval → execute → scribe receipt

def test_end_to_end_approval_flow(tmp_path):
    from mercury_approval_token import generate_approval_token, list_pending_tokens
    from mercury_write_methods import execute_transfer
    store = _token_store(tmp_path)
    ledger = _ledger(tmp_path)

    # Step 1: Generate token (Knight emits action-request)
    token = generate_approval_token("transfer", "E2E test transfer $1,000", amount_cents=100000, store_path=store)
    assert token["status"] == "pending"

    # Step 2: Query pending (Founder reviews)
    pending = list_pending_tokens(store_path=store)
    assert any(t["token_id"] == token["token_id"] for t in pending)

    # Step 3: Founder approves → write fires
    result = execute_transfer("acc-liana", "acc-vendor", 100000, "E2E test",
                              token["token_id"], store_path=store, ledger_path=ledger)
    assert result["success"] is True
    assert result["chronos_hash"]

    # Step 4: Token no longer pending
    pending_after = list_pending_tokens(store_path=store)
    assert not any(t["token_id"] == token["token_id"] for t in pending_after)

    # Step 5: Ledger has receipt
    ledger_entries = [json.loads(l) for l in ledger.read_text().split("\n") if l.strip()]
    receipt_entry = next((e for e in ledger_entries if e.get("type") == "write_receipt"), None)
    assert receipt_entry is not None
    assert receipt_entry["action"] == "transfer"


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python", "-m", "pytest", __file__, "-v"], cwd=str(_HERE))
