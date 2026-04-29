"""
Tests for vendor_tablet_capture.py

K-Vendor-Layer-Tablet-Capture / B132

Tests:
  1. Redaction logic (denylist works, allowlist preserved)
  2. capture_vendor_call writes a valid JSONL line
  3. vendor_tablet_query retrieves written records
  4. Error path: capture records outcome=error on exception
  5. Crash safety: tablet is written even when cap.record() not called
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

# Ensure librarian-mcp is on sys.path
_HERE = Path(__file__).parent
_LIB = _HERE.parent.parent
sys.path.insert(0, str(_LIB))

from r10_cross_vendor.vendor_tablet_capture import (
    _redact,
    _REQUEST_DENYLIST,
    _TABLETS_ROOT,
    capture_vendor_call,
    vendor_tablet_query,
    SCHEMA_VERSION,
)


# ─── Redaction tests ─────────────────────────────────────────────────────────

def test_redact_strips_denylist_key():
    obj = {"model": "claude-haiku-4-5", "api_key": "sk-REDACTED", "messages": []}
    result = _redact(obj, {"api_key"})
    assert "api_key" not in result
    assert result["model"] == "claude-haiku-4-5"


def test_redact_nested():
    obj = {"outer": {"authorization": "Bearer TOKEN", "content": "hello"}}
    result = _redact(obj, {"authorization"})
    assert "authorization" not in result["outer"]
    assert result["outer"]["content"] == "hello"


def test_redact_list():
    obj = [{"api_key": "secret", "text": "ok"}]
    result = _redact(obj, {"api_key"})
    assert result[0].get("api_key") is None
    assert result[0]["text"] == "ok"


def test_redact_preserves_non_denylist():
    obj = {"model": "gpt-4o", "messages": [{"role": "user", "content": "hello"}]}
    result = _redact(obj, {"api_key"})
    assert result == obj


def test_request_denylist_covers_auth_fields():
    for field in ("api_key", "authorization", "x-api-key", "token"):
        assert field in _REQUEST_DENYLIST


# ─── capture_vendor_call integration ─────────────────────────────────────────

def test_capture_writes_jsonl_line(tmp_path):
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        with capture_vendor_call("anthropic", "claude-haiku-4-5", "messages.create") as cap:
            cap.record(
                request={"model": "claude-haiku-4-5", "messages": [{"role": "user", "content": "hi"}]},
                response={"content": [{"text": "hello"}]},
                usage={"input_tokens": 10, "output_tokens": 5, "cost_usd_industry_term_membership_orthogonal": 0.000012},
            )

    # Verify file created and line is valid JSONL
    tablets = list(tmp_path.rglob("*.jsonl"))
    assert len(tablets) == 1

    lines = tablets[0].read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 1

    rec = json.loads(lines[0])
    assert rec["vendor"] == "anthropic"
    assert rec["model"] == "claude-haiku-4-5"
    assert rec["endpoint"] == "messages.create"
    assert rec["outcome"] == "success"
    assert rec["error_class"] is None
    assert rec["schema_version"] == SCHEMA_VERSION
    assert "call_sign" in rec
    assert rec["call_sign"].startswith("vendor-call-")
    assert "ts" in rec
    assert rec["usage"]["input_tokens"] == 10


def test_capture_records_error_outcome(tmp_path):
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        with pytest.raises(ValueError):
            with capture_vendor_call("openai", "gpt-4o", "chat.completions.create") as cap:
                raise ValueError("test error")

    tablets = list(tmp_path.rglob("*.jsonl"))
    assert len(tablets) == 1
    rec = json.loads(tablets[0].read_text(encoding="utf-8").strip())
    assert rec["outcome"] == "error"
    assert rec["error_class"] == "ValueError"


def test_capture_writes_even_without_record_call(tmp_path):
    """Tablet should be written even if cap.record() is never called."""
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        with capture_vendor_call("google", "gemini-2.5-flash", "models.generate_content") as _cap:
            pass  # no cap.record()

    tablets = list(tmp_path.rglob("*.jsonl"))
    assert len(tablets) == 1
    rec = json.loads(tablets[0].read_text(encoding="utf-8").strip())
    assert rec["vendor"] == "google"
    assert rec["request"] == {}
    assert rec["response"] == {}


# ─── vendor_tablet_query ─────────────────────────────────────────────────────

def test_query_retrieves_written_records(tmp_path):
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        with capture_vendor_call("perplexity", "sonar-pro", "chat.completions.create") as cap:
            cap.record(
                request={"model": "sonar-pro", "messages": []},
                response={"choices": [{"message": {"content": "answer"}}]},
                usage={"input_tokens": 20, "output_tokens": 8, "cost_usd_industry_term_membership_orthogonal": 0.000068},
            )

        with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
            results = vendor_tablet_query(vendor="perplexity", limit=10)

    assert len(results) == 1
    assert results[0]["vendor"] == "perplexity"
    assert results[0]["model"] == "sonar-pro"


def test_query_filters_by_vendor(tmp_path):
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        with capture_vendor_call("anthropic", "claude-haiku-4-5", "messages.create") as cap:
            cap.record(request={}, response={}, usage={})
        with capture_vendor_call("openai", "gpt-4o", "chat.completions.create") as cap:
            cap.record(request={}, response={}, usage={})

        results_anthropic = vendor_tablet_query(vendor="anthropic", limit=10)
        results_openai = vendor_tablet_query(vendor="openai", limit=10)
        results_all = vendor_tablet_query(limit=10)

    assert all(r["vendor"] == "anthropic" for r in results_anthropic)
    assert all(r["vendor"] == "openai" for r in results_openai)
    assert len(results_all) == 2


def test_query_filters_by_call_sign(tmp_path):
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        target_sign = None
        with capture_vendor_call("anthropic", "claude-haiku-4-5", "messages.create") as cap:
            cap.record(request={"marker": "first"}, response={}, usage={})
        with capture_vendor_call("anthropic", "claude-haiku-4-5", "messages.create") as cap2:
            cap2.record(request={"marker": "second"}, response={}, usage={})
            target_sign = cap2.call_sign

        results = vendor_tablet_query(vendor="anthropic", call_sign=target_sign, limit=10)

    assert len(results) == 1
    assert results[0]["call_sign"] == target_sign


def test_query_returns_empty_when_no_tablets(tmp_path):
    with patch("r10_cross_vendor.vendor_tablet_capture._TABLETS_ROOT", tmp_path):
        results = vendor_tablet_query(vendor="groq", limit=10)
    assert results == []
