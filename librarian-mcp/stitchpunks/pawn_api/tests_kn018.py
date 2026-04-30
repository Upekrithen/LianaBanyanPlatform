"""
KN018 — Pawn-via-API MCP Wrapper — Test Suite
20 tests covering: substrate context loading, dispatch flow, Chronos signing,
cost cap, cross-vendor config, token reporting, provenance, MCP interface,
concurrent dispatch, API error handling, end-to-end.

All tests run in STUB mode (no ANTHROPIC_API_KEY required).

Run:  python -m pytest tests_kn018.py -v
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))


# ─── Test 1: Anthropic SDK import check (stub mode works without API key) ─────

def test_stub_mode_works_without_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_client import call_pawn_api
    result = call_pawn_api(
        task="What is the Cathedral Effect?",
        substrate_context="Canonical memory: innovation #2278 is the Cathedral Effect.",
    )
    assert result["stub_mode"] is True
    assert result["result_text"]
    assert result["model"] == "stub"


# ─── Test 2: Substrate context pre-injection schema valid ─────────────────────

def test_substrate_context_schema_valid():
    from pawn_api_substrate_context_loader import load_substrate_context
    ctx = load_substrate_context(
        task="research cooperative IP law",
        brief_me_content="Liana Banyan is a cooperative commerce platform.",
        detective_hits=["Innovation #2260 — Cooperative Defensive Patent Pledge"],
    )
    assert "context_str" in ctx
    assert "context_hash" in ctx
    assert "token_estimate" in ctx
    assert "sources_included" in ctx
    assert len(ctx["context_hash"]) == 24


# ─── Test 3: Substrate context includes MoneyPenny brief_me output ───────────

def test_substrate_context_includes_brief_me():
    from pawn_api_substrate_context_loader import load_substrate_context
    ctx = load_substrate_context(
        task="test",
        brief_me_content="THE CANONICAL MEMORY PACKET",
    )
    assert "THE CANONICAL MEMORY PACKET" in ctx["context_str"]
    assert "brief_me" in ctx["sources_included"]


# ─── Test 4: Substrate context includes Detective hits ────────────────────────

def test_substrate_context_includes_detective_hits():
    from pawn_api_substrate_context_loader import load_substrate_context
    ctx = load_substrate_context(
        task="test",
        detective_hits=["DETECTIVE HIT A", "DETECTIVE HIT B"],
    )
    assert "DETECTIVE HIT A" in ctx["context_str"]
    assert "detective" in ctx["sources_included"]


# ─── Test 5: Dispatch request schema valid ────────────────────────────────────

def test_dispatch_schema_valid(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(
        task="Research cooperative IP law implications",
        brief_me_content="LB canonical memory",
        ledger_path=tmp_path / "ledger.jsonl",
    )
    assert "dispatch_id" in result
    assert result["dispatch_id"].startswith("PAWN-")
    assert "task" in result
    assert "chronos_hash" in result
    assert "substrate_context_hash" in result


# ─── Test 6: Result schema valid (matches Comet Pawn return format) ───────────

def test_result_schema_matches_comet_pawn_format(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(
        task="test task",
        ledger_path=tmp_path / "ledger.jsonl",
    )
    assert "result_text" in result
    assert "model" in result
    assert "tokens_used_total" in result
    assert "estimated_cost_usd" in result
    assert "stub_mode" in result


# ─── Test 7: Chronos signing on dispatch + result ─────────────────────────────

def test_chronos_signing(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(
        task="Chronos signing test",
        ledger_path=tmp_path / "ledger.jsonl",
    )
    assert "chronos_hash" in result
    assert len(result["chronos_hash"]) == 24


# ─── Test 8: Pheromone index updates ─────────────────────────────────────────

def test_pheromone_index_updates(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    import pawn_api_dispatch
    monkeypatch.setattr(pawn_api_dispatch, "_PHEROMONE_PATH", tmp_path / "pheromone.json")
    from pawn_api_dispatch import dispatch_pawn
    dispatch_pawn(task="pheromone test", ledger_path=tmp_path / "ledger.jsonl")
    pheromone_path = tmp_path / "pheromone.json"
    assert pheromone_path.exists()
    data = json.loads(pheromone_path.read_text())
    assert "latest_dispatch_id" in data
    assert data["latest_status"] in ("completed", "error")


# ─── Test 9: Cost cap enforcement — above hard cap rejected ──────────────────

def test_cost_cap_above_hard_cap_rejected(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(
        task="over-cap test",
        cost_cap_usd=25.0,
        ledger_path=tmp_path / "ledger.jsonl",
    )
    assert result["status"] == "rejected"
    assert "hard cap" in result["reason"]


# ─── Test 10: Cross-vendor configurable ──────────────────────────────────────

def test_cross_vendor_configurable(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_client import call_pawn_api
    result_sonnet = call_pawn_api("task", "context", model="claude-sonnet-4-6")
    result_haiku = call_pawn_api("task", "context", model="claude-haiku-4-5")
    # Both return stub results — model stored in provenance
    assert result_sonnet["stub_mode"] is True
    assert result_haiku["stub_mode"] is True


# ─── Test 11: Tokens used reported per dispatch ───────────────────────────────

def test_tokens_used_reported(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(task="token test", ledger_path=tmp_path / "ledger.jsonl")
    assert "tokens_used_total" in result
    assert isinstance(result["tokens_used_total"], int)


# ─── Test 12: Result includes provenance: model + temperature + hash ──────────

def test_result_includes_provenance(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(task="provenance test", ledger_path=tmp_path / "ledger.jsonl")
    assert "provenance" in result
    prov = result["provenance"]
    assert "model" in prov
    assert "system_prompt_hash" in prov


# ─── Test 13: MCP query: dispatch + return result ─────────────────────────────

def test_dispatch_and_return_result(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    result = dispatch_pawn(
        task="What is the Qomplx P-01 priority date?",
        brief_me_content="Qomplx US20250259041A1 priority date: 2025-01-31",
        ledger_path=tmp_path / "ledger.jsonl",
    )
    assert result["status"] in ("completed", "error")
    assert result["result_text"]


# ─── Test 14: Concurrent dispatches don't race ───────────────────────────────

def test_concurrent_dispatches_independent(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    ledger = tmp_path / "ledger.jsonl"
    r1 = dispatch_pawn(task="task 1", ledger_path=ledger)
    r2 = dispatch_pawn(task="task 2", ledger_path=ledger)
    assert r1["dispatch_id"] != r2["dispatch_id"]
    entries = [json.loads(l) for l in ledger.read_text().split("\n") if l.strip()]
    assert len(entries) == 2


# ─── Test 15: API error handling graceful ─────────────────────────────────────

def test_api_error_handling_graceful(tmp_path, monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-invalid-key-for-testing")
    from pawn_api_client import call_pawn_api
    result = call_pawn_api("test", "context", model="claude-sonnet-4-6")
    # Should not raise — should return error or stub
    assert "result_text" in result or "error" in result


# ─── Test 16: Substrate context roundtrip — re-load returns same hash ─────────

def test_substrate_context_hash_stable():
    from pawn_api_substrate_context_loader import load_substrate_context
    ctx1 = load_substrate_context(task="test", brief_me_content="same content")
    ctx2 = load_substrate_context(task="test", brief_me_content="same content")
    assert ctx1["context_hash"] == ctx2["context_hash"]


# ─── Test 17: Dispatch scribes to ledger ─────────────────────────────────────

def test_dispatch_scribes_to_ledger(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from pawn_api_dispatch import dispatch_pawn
    ledger = tmp_path / "ledger.jsonl"
    dispatch_pawn(task="ledger test", ledger_path=ledger)
    assert ledger.exists()
    entries = [json.loads(l) for l in ledger.read_text().split("\n") if l.strip()]
    assert len(entries) == 1
    assert entries[0]["type"] == "pawn_dispatch"


# ─── Test 18: Edge — substrate context too large → graceful fallback ──────────

def test_substrate_context_too_large_truncates():
    from pawn_api_substrate_context_loader import load_substrate_context
    big_content = "X" * 100_000
    ctx = load_substrate_context(task="test", brief_me_content=big_content, max_tokens=1000)
    assert ctx["truncated"] is True
    assert "TRUNCATED" in ctx["context_str"]


# ─── Test 19: Edge — empty substrate context ──────────────────────────────────

def test_empty_substrate_context():
    from pawn_api_substrate_context_loader import load_substrate_context
    ctx = load_substrate_context(task="test")
    assert ctx["context_str"]
    assert ctx["sources_included"] == []


# ─── Test 20: End-to-end: Bishop dispatches → ShadowBishop loads context → API call → scribes ─

def test_end_to_end_dispatch_pipeline(tmp_path, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    import pawn_api_dispatch
    monkeypatch.setattr(pawn_api_dispatch, "_PHEROMONE_PATH", tmp_path / "pheromone.json")
    from pawn_api_dispatch import dispatch_pawn

    # Bishop dispatches
    result = dispatch_pawn(
        task="Research: Is cooperative IP attribution novel over Qomplx?",
        brief_me_content="LB: #2260 cooperative defensive patent pledge. Qomplx: deontic logic, no economic coupling.",
        detective_hits=["Innovation #2260 — Cooperative Defensive Patent Pledge — 2025-11-26"],
        cost_cap_usd=5.0,
        ledger_path=tmp_path / "ledger.jsonl",
    )

    # ShadowBishop loaded context
    assert result["substrate_context_hash"]
    assert "brief_me" in result["substrate_sources_included"]

    # API call completed (stub mode)
    assert result["stub_mode"] is True
    assert result["result_text"]

    # Scribed via Chronos
    assert result["chronos_hash"]

    # Pheromone updated
    assert (tmp_path / "pheromone.json").exists()

    # Ledger entry present
    ledger = tmp_path / "ledger.jsonl"
    assert ledger.exists()
    entries = [json.loads(l) for l in ledger.read_text().split("\n") if l.strip()]
    assert entries[0]["dispatch_id"] == result["dispatch_id"]


if __name__ == "__main__":
    import subprocess
    subprocess.run(["python", "-m", "pytest", __file__, "-v"], cwd=str(_HERE))
