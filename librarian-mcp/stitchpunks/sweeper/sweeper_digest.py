"""
Sweeper Scribe — Component 3: Digest Producer
KN016 / A&A #2328 candidate

Produces the 5-line digest emitted at every Bishop session-start
via brief_me hook. Signs digest with Chronos pattern (timestamp + hash).

Digest format:
  Line 1: SWEEPER DIGEST — <timestamp>
  Line 2: Stale: <N> | Orphaned: <N> | Drift: <N> | Total: <N>
  Lines 3-5: Top-3 items by severity (class | path/id | severity | days/reason)

Toolsmith log: TS-BISHOP-SWEEPER-SCAVENGER-KN016-BP002
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from sweeper_classify import top_n

_HERE = Path(__file__).parent
_DIGEST_LOG_PATH = _HERE / "digest_log.jsonl"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(content: str) -> str:
    """Minimal Chronos-pattern hash: SHA-256 of content + timestamp."""
    ts = _iso_now()
    return hashlib.sha256(f"{ts}:{content}".encode()).hexdigest()[:16]


def produce_digest(scan_result: Dict[str, Any], top: int = 3) -> Dict[str, Any]:
    """
    Produce a 5-line digest from a scan result.
    Returns dict with: lines (list of strings), chronos_hash, timestamp.
    """
    items = scan_result.get("items", [])
    top_items = top_n(items, n=top)

    stale_count = scan_result.get("stale_count", 0)
    orphaned_count = scan_result.get("orphaned_count", 0)
    drift_count = scan_result.get("drift_count", 0)
    total_count = scan_result.get("total_items", 0)

    ts = _iso_now()
    lines = [
        f"SWEEPER DIGEST — {ts}",
        f"Stale: {stale_count} | Orphaned: {orphaned_count} | Drift: {drift_count} | Total: {total_count}",
    ]

    if not top_items:
        lines.append("  No items flagged — substrate clean.")
        lines.append("  Green-keeping complete.")
        lines.append("  Proceed with session.")
    else:
        for item in top_items:
            cls = item.get("class", "?")
            sev = item.get("severity", "?")
            if cls == "stale":
                path_short = Path(item.get("path", "?")).name
                days = item.get("days_since_modified", "?")
                lines.append(f"  [{sev.upper()}] stale: {path_short} ({days}d since edit)")
            elif cls == "orphaned":
                cid = item.get("canonical_id", "?")
                missing = item.get("missing_paths", [])
                lines.append(f"  [{sev.upper()}] orphaned: {cid} — missing: {missing[:1]}")
            elif cls == "drift":
                key = item.get("key", "?")
                lines.append(f"  [{sev.upper()}] drift: key={key}")
            else:
                lines.append(f"  [{sev.upper()}] {cls}: {item}")

        while len(lines) < 5:
            lines.append("")

    content_str = "\n".join(lines)
    chronos_hash = _chronos_sign(content_str)

    digest = {
        "lines": lines[:5],
        "chronos_hash": chronos_hash,
        "timestamp": ts,
        "total_items": total_count,
    }

    _append_to_log(digest)
    return digest


def format_digest(digest: Dict[str, Any]) -> str:
    """Return the digest as a printable string."""
    return "\n".join(digest["lines"])


def _append_to_log(digest: Dict[str, Any]) -> None:
    """Append digest to the Stone Tablet-style digest log."""
    try:
        with _DIGEST_LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(digest) + "\n")
    except OSError:
        pass
