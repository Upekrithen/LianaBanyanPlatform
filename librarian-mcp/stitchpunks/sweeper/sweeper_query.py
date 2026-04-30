"""
Sweeper Scribe — Python MCP Query Wrapper
KN016 / A&A #2328 candidate

Python-accessible interface to sweeperQuery, wrapping the digest log.
Used by tests_kn016.py and by direct MCP invocation.

Toolsmith log: TS-BISHOP-SWEEPER-SCAVENGER-KN016-BP002
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

_HERE = Path(__file__).parent
DIGEST_LOG_PATH = _HERE / "digest_log.jsonl"


def _load_latest_digest(log_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    path = log_path or DIGEST_LOG_PATH
    if not path.exists():
        return None
    lines = [l.strip() for l in path.read_text(encoding="utf-8").split("\n") if l.strip()]
    if not lines:
        return None
    try:
        return json.loads(lines[-1])
    except (json.JSONDecodeError, IndexError):
        return None


def _count_digests(log_path: Optional[Path] = None) -> int:
    path = log_path or DIGEST_LOG_PATH
    if not path.exists():
        return 0
    return len([l for l in path.read_text(encoding="utf-8").split("\n") if l.strip()])


def sweeperQuery(
    query_class: str = "all",
    log_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Query the sweeper digest log.

    query_class: "stale" | "orphaned" | "drift" | "all"
    Returns: { query_class, latest_digest, all_digests_count, formatted }
    """
    latest = _load_latest_digest(log_path)
    count = _count_digests(log_path)

    formatted = (
        "\n".join(latest["lines"]) if latest
        else "No sweep digest available — run sweeper scan first."
    )

    return {
        "query_class": query_class,
        "latest_digest": latest,
        "all_digests_count": count,
        "formatted": formatted,
    }
