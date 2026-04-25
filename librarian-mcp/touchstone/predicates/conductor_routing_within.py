"""
Predicate: conductor_routing_within
====================================
Asserts that the most recent conductor_route call (as recorded in
scribe_Conductor.jsonl) completed within a given latency budget.

K446a · Phase 2.3 · Innovation #2277

Args:
    max_latency_ms (int): Maximum allowed routing latency in milliseconds.
                          Routing decisions are expected to complete in < 50ms
                          for deterministic heuristic mode (no API call).

How it works:
    The conductor_route MCP tool records a trace to scribe_Conductor.jsonl
    on every call. Each trace contains a `ts` field (ISO-8601 UTC) but NOT
    a latency field (routing decisions are synchronous and sub-millisecond
    in heuristic mode). To measure latency, callers must pass `observed_latency_ms`
    as an arg (measured at the call site) OR use a two-call delta on `ts` fields.

    If `observed_latency_ms` is provided:
        PASS iff observed_latency_ms <= max_latency_ms.

    If `observed_latency_ms` is NOT provided:
        Read the last entry in scribe_Conductor.jsonl. Compute dt between
        that entry's `ts` and the previous entry's `ts`. Use dt as a proxy
        for single-call latency. This is approximate but useful for CI
        regression detection.

Returns:
    { passed, observed, message }
"""

import json
import math
from pathlib import Path

_SCRIBE_PATH = (
    Path(__file__).parent.parent.parent /
    "stitchpunks" / "scribes" / "scribe_Conductor.jsonl"
)


def _read_last_two_entries(path: Path) -> tuple[dict | None, dict | None]:
    """Read the last two JSONL entries from scribe_Conductor.jsonl."""
    if not path.exists():
        return None, None
    lines: list[str] = []
    try:
        with path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    lines.append(line)
    except OSError:
        return None, None

    if not lines:
        return None, None
    last = None
    second_last = None
    try:
        last = json.loads(lines[-1])
    except json.JSONDecodeError:
        pass
    if len(lines) >= 2:
        try:
            second_last = json.loads(lines[-2])
        except json.JSONDecodeError:
            pass
    return last, second_last


def _parse_ts_ms(ts_str: str | None) -> float | None:
    """Parse ISO-8601 UTC timestamp to milliseconds since epoch."""
    if not ts_str:
        return None
    try:
        from datetime import datetime, timezone
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        return dt.timestamp() * 1000.0
    except (ValueError, AttributeError):
        return None


def check(args: dict) -> dict:
    max_latency_ms = args.get("max_latency_ms")
    if max_latency_ms is None:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required arg: max_latency_ms",
        }

    try:
        max_latency_ms = int(max_latency_ms)
    except (TypeError, ValueError):
        return {
            "passed": False,
            "observed": None,
            "message": f"Invalid max_latency_ms: {max_latency_ms!r} (must be integer)",
        }

    # Case 1: caller provides explicit observed latency
    observed_latency_ms = args.get("observed_latency_ms")
    if observed_latency_ms is not None:
        try:
            observed_ms = float(observed_latency_ms)
        except (TypeError, ValueError):
            return {
                "passed": False,
                "observed": None,
                "message": f"Invalid observed_latency_ms: {observed_latency_ms!r}",
            }
        passed = observed_ms <= max_latency_ms
        return {
            "passed": passed,
            "observed": round(observed_ms, 1),
            "message": (
                f"Conductor routing completed in {round(observed_ms, 1)}ms "
                f"({'within' if passed else 'EXCEEDS'} {max_latency_ms}ms budget)"
            ),
        }

    # Case 2: approximate latency from scribe_Conductor.jsonl timestamp delta
    last, second_last = _read_last_two_entries(_scribe_PATH)

    if last is None:
        return {
            "passed": False,
            "observed": None,
            "message": (
                "scribe_Conductor.jsonl has no entries — conductor_route has not been called yet. "
                "Invoke conductor_route at least once before running this predicate."
            ),
        }

    if second_last is None:
        return {
            "passed": False,
            "observed": None,
            "message": (
                "scribe_Conductor.jsonl has only one entry — need at least two entries "
                "for timestamp-delta latency estimation. Provide observed_latency_ms explicitly "
                "for single-call assertions."
            ),
        }

    ts_last = _parse_ts_ms(last.get("ts"))
    ts_prev = _parse_ts_ms(second_last.get("ts"))

    if ts_last is None or ts_prev is None:
        return {
            "passed": False,
            "observed": None,
            "message": "Could not parse ts timestamps from scribe_Conductor.jsonl entries.",
        }

    delta_ms = ts_last - ts_prev
    if delta_ms < 0:
        return {
            "passed": False,
            "observed": round(delta_ms, 1),
            "message": f"Timestamps out of order in scribe_Conductor.jsonl (delta={delta_ms:.1f}ms).",
        }

    passed = delta_ms <= max_latency_ms
    return {
        "passed": passed,
        "observed": round(delta_ms, 1),
        "message": (
            f"Conductor routing timestamp delta: {round(delta_ms, 1)}ms "
            f"({'within' if passed else 'EXCEEDS'} {max_latency_ms}ms budget). "
            "Note: timestamp-delta is an approximation; use observed_latency_ms for precise measurement."
        ),
    }


# Fix path variable name (typo guard)
_scribe_PATH = _SCRIBE_PATH
