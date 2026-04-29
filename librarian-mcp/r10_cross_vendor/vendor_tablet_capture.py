"""
Vendor Tablet Capture — Stone Tablet provenance layer for all vendor API calls.

K-Vendor-Layer-Tablet-Capture / B132

Captures full vendor request/response BEFORE any internal summarization or
discard, so Stone Tablet provenance survives vendor rotation/deprecation.

Storage: librarian-mcp/stitchpunks/data/vendor_tablets/<vendor>/<YYYY-MM-DD>.jsonl
One JSONL line per call, append-only (never delete).

Redaction policy (denylist):
  - Authorization headers: SDK injects these internally; they never appear in
    the request dict we capture — no redaction needed at our layer.
  - member PII: LB internal calls use canonical test facts, not member data.
    Capture in full.
  - Keep: model, usage, content, latency, outcome.

Capture mode: synchronous write via atomic append (lock-free on most OS).
Each line is small (~500B–2KB); fsync per line for crash safety.
Failures are swallowed silently (write-and-continue) — vendor call is primary.

Architecture Decision (Phase B):
  Option β selected: single middleware in each language.
  All adapters call capture_vendor_call() after SDK response.
  No monkey-patching, no per-adapter duplication.

Filed: B132, 2026-04-29
"""

from __future__ import annotations

import json
import os
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator, Optional

_HERE = Path(__file__).parent.parent  # librarian-mcp root
_TABLETS_ROOT = _HERE / "stitchpunks" / "data" / "vendor_tablets"

SCHEMA_VERSION = 1

# Denylist: fields to strip from request / response dicts before capture.
# SDK-injected auth headers never reach our layer — only content-level PII guard.
_REQUEST_DENYLIST: set[str] = {"api_key", "authorization", "x-api-key", "token"}
_RESPONSE_DENYLIST: set[str] = set()  # nothing to redact in vendor responses


def _redact(obj: Any, denylist: set[str]) -> Any:
    """Recursively strip denylist keys from nested dicts."""
    if isinstance(obj, dict):
        return {k: _redact(v, denylist) for k, v in obj.items()
                if k.lower() not in denylist}
    if isinstance(obj, list):
        return [_redact(item, denylist) for item in obj]
    return obj


def _tablet_path(vendor: str) -> Path:
    """Return today's JSONL path for the given vendor, creating dirs as needed."""
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    vendor_dir = _TABLETS_ROOT / vendor.lower()
    vendor_dir.mkdir(parents=True, exist_ok=True)
    return vendor_dir / f"{date_str}.jsonl"


def _current_session_id() -> str:
    """Best-effort session ID from environment — never echoes API keys."""
    for var in ("KNIGHT_SESSION_ID", "BISHOP_SESSION_ID", "SESSION_ID"):
        sid = os.environ.get(var, "").strip()
        if sid:
            return sid
    return "unknown"


@dataclass
class _CaptureContext:
    """Mutable capture bag passed to the caller inside `capture_vendor_call`."""
    vendor: str
    model: str
    endpoint: str
    session_id: str
    call_sign: str
    _t_start: float = field(default=0.0, repr=False)
    _request: Optional[dict] = field(default=None, repr=False)
    _response: Optional[dict] = field(default=None, repr=False)
    _usage: Optional[dict] = field(default=None, repr=False)
    _outcome: str = "success"
    _error_class: Optional[str] = None

    def record(
        self,
        request: Optional[dict] = None,
        response: Optional[dict] = None,
        usage: Optional[dict] = None,
    ) -> None:
        """Record the request/response payload after the SDK call completes."""
        self._request = request
        self._response = response
        self._usage = usage

    def fail(self, error_class: str) -> None:
        """Mark this capture as errored."""
        self._outcome = "error"
        self._error_class = error_class


@contextmanager
def capture_vendor_call(
    vendor: str,
    model: str,
    endpoint: str,
    session_id: Optional[str] = None,
) -> Iterator[_CaptureContext]:
    """
    Context manager wrapping a vendor SDK call.

    Usage:
        with capture_vendor_call("anthropic", "claude-haiku-4-5", "messages.create") as cap:
            response = sdk.call(...)
            cap.record(
                request={"messages": [...], "model": model, "max_tokens": 2048},
                response={"content": [...], "usage": {...}},
                usage={"input_tokens": N, "output_tokens": M},
            )

    On context exit, writes one JSONL line to vendor_tablets/<vendor>/<date>.jsonl.
    Failures in the write are silently swallowed — the vendor call is primary.
    """
    import time

    sid = session_id or _current_session_id()
    call_sign = f"vendor-call-{uuid.uuid4().hex[:12]}"
    ctx = _CaptureContext(
        vendor=vendor,
        model=model,
        endpoint=endpoint,
        session_id=sid,
        call_sign=call_sign,
        _t_start=time.perf_counter(),
    )

    try:
        yield ctx
    except Exception as exc:
        ctx.fail(type(exc).__name__)
        raise
    finally:
        import time as _time
        elapsed_ms = round((_time.perf_counter() - ctx._t_start) * 1000, 1)
        _flush_tablet(ctx, elapsed_ms)


def _flush_tablet(ctx: _CaptureContext, elapsed_ms: float) -> None:
    """Write one JSONL line to the tablet file. Silently swallows I/O errors."""
    try:
        request_clean = _redact(ctx._request or {}, _REQUEST_DENYLIST)
        response_clean = _redact(ctx._response or {}, _RESPONSE_DENYLIST)

        record: dict = {
            "call_sign": ctx.call_sign,
            "ts": datetime.now(timezone.utc).isoformat(),
            "session_id": ctx.session_id,
            "vendor": ctx.vendor,
            "model": ctx.model,
            "endpoint": ctx.endpoint,
            "request": request_clean,
            "response": response_clean,
            "usage": ctx._usage or {},
            "elapsed_ms": elapsed_ms,
            "outcome": ctx._outcome,
            "error_class": ctx._error_class,
            "schema_version": SCHEMA_VERSION,
        }

        tablet_path = _tablet_path(ctx.vendor)
        line = json.dumps(record, ensure_ascii=False, default=str)
        with tablet_path.open("a", encoding="utf-8") as fh:
            fh.write(line + "\n")
            fh.flush()
            os.fsync(fh.fileno())

    except Exception:
        pass  # capture is non-blocking; never fail the caller


def vendor_tablet_query(
    vendor: Optional[str] = None,
    model: Optional[str] = None,
    since_ts: Optional[str] = None,
    call_sign: Optional[str] = None,
    limit: int = 50,
) -> list[dict]:
    """
    Query vendor tablets.  Returns matching JSONL records.

    Args:
        vendor:    filter by vendor name (case-insensitive)
        model:     filter by model name substring
        since_ts:  ISO-8601 cutoff; only records at or after this ts
        call_sign: filter by exact call_sign
        limit:     max records to return (most recent first)
    """
    if not _TABLETS_ROOT.exists():
        return []

    results: list[dict] = []

    # Collect all .jsonl files, newest first
    jsonl_files: list[Path] = sorted(
        _TABLETS_ROOT.rglob("*.jsonl"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    for path in jsonl_files:
        if vendor and path.parent.name.lower() != vendor.lower():
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except Exception:
            continue
        for line in reversed(lines):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except Exception:
                continue
            if vendor and rec.get("vendor", "").lower() != vendor.lower():
                continue
            if model and model.lower() not in rec.get("model", "").lower():
                continue
            if call_sign and rec.get("call_sign") != call_sign:
                continue
            if since_ts and rec.get("ts", "") < since_ts:
                continue
            results.append(rec)
            if len(results) >= limit:
                return results

    return results
