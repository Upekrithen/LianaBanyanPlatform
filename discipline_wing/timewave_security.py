"""
TimeWave Security Runtime (K517 / A&A #2302)

Captures unauthorized state mutations as security events; detects repeated-rejection
patterns; exposes pattern signals to the Wing Consensus Layer as a synthetic Augur.

Design:
- Append-only event log at ~/.claude/state/timewave_security/security_events.jsonl
- Pattern hash: stable fingerprint grouping "same class of action on same file type"
- Threshold: PATTERN_MATCH_THRESHOLD rejections with same hash → pattern_detected = True
- Weight bump: injected as synthetic AugurResult before Consensus arbitration
- Wing opt-in: timewave_security_enabled (default True for defense-in-depth)

Fail-safe: any internal error → skip silently; Wing continues without TimeWave input.

A&A #2302 (TimeWave Security) / #2295 Tier 3 security enhancement.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

SECURITY_EVENTS_DIR = Path(os.path.expanduser("~/.claude/state/timewave_security"))
SECURITY_EVENTS_LOG = SECURITY_EVENTS_DIR / "security_events.jsonl"

PATTERN_MATCH_THRESHOLD = 3   # N+ rejections → pattern detected → inject block signal
WEIGHT_PER_REJECTION = 0.5    # Confidence weight per repeated rejection (capped 1.0)

# Trigger categories for stable pattern classification
TRIGGER_CATEGORIES = [
    ("vendor_secret_rotation",
     r"(?i)(supabase secrets set|firebase.*config:set|aws ssm put-parameter"
     r"|secrets\.set|ANTHROPIC_API_KEY\s*=)"),
    ("force_push",
     r"(?i)git push.*(--force|-f\b)"),
    ("schema_destruction",
     r"(?i)\bDROP\s+(TABLE|DATABASE|SCHEMA)\b"),
    ("filesystem_wipe",
     r"(?i)(rm -rf [~/]|Remove-Item -Recurse -Force [A-Z]:)"),
    ("securities_language",
     r"(?i)\b(equity|securities|investment.*returns|profit.sharing)\b"),
    ("pricing_violation",
     r"(?i)membership.*\$(?!5\.00)(?!5 /)"),
    ("credential_expose",
     r"(?i)(password|secret|token|api.key)\s*[=:]\s*['\"][^'\"]{12,}"),
]


# ── Pattern fingerprint ────────────────────────────────────────────────────────

def _compute_pattern_hash(content: str, file_path: str) -> str:
    """
    Stable pattern hash grouping "same class of action on same file type."
    Combines first matching trigger category with file extension.
    """
    ext = Path(file_path).suffix.lower() or ".unknown"
    category = "generic_rejection"
    for cat_name, pattern in TRIGGER_CATEGORIES:
        if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
            category = cat_name
            break
    raw = f"{category}|{ext}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


# ── Event record ───────────────────────────────────────────────────────────────

def record_event(
    content: str,
    file_path: str,
    triggered_augur_ids: List[str],
    consensus_decision: str,
    source: str = "wing_block",   # "wing_block" | "dragonrider_reject"
    session: str = "",
    enabled: bool = True,
) -> str:
    """
    Record a rejected action as a TimeWave Security event (append-only).
    Returns event_id (str) or "" on failure.

    Append-only guarantee: only ever opens the file in "a" mode.
    No existing record is ever overwritten or deleted via this API.
    """
    if not enabled:
        return ""

    event_id = str(uuid.uuid4())[:8]
    pattern_hash = _compute_pattern_hash(content, file_path)

    record = {
        "ts": _iso_now(),
        "event_id": event_id,
        "source": source,
        "file_path": file_path,
        "file_ext": Path(file_path).suffix.lower(),
        "pattern_hash": pattern_hash,
        "triggered_augur_ids": triggered_augur_ids,
        "consensus_decision": consensus_decision,
        "session": session,
    }

    try:
        SECURITY_EVENTS_DIR.mkdir(parents=True, exist_ok=True)
        with open(SECURITY_EVENTS_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass  # Never break the Wing on log write failure

    return event_id


# ── Pattern match ──────────────────────────────────────────────────────────────

def match_security_pattern(
    content: str,
    file_path: str,
    scan_limit: int = 10_000,
) -> Dict[str, Any]:
    """
    Check if this action matches the pattern of N+ prior rejections.

    Returns:
        pattern_detected:     True if prior_rejection_count >= PATTERN_MATCH_THRESHOLD
        pattern_hash:         stable fingerprint for this action class
        prior_rejection_count: how many prior rejections share this pattern_hash
        weight_bump:          confidence weight (0.0–1.0) to inject as Augur signal
        threshold:            PATTERN_MATCH_THRESHOLD value
    """
    pattern_hash = _compute_pattern_hash(content, file_path)

    base = {
        "pattern_detected": False,
        "pattern_hash": pattern_hash,
        "prior_rejection_count": 0,
        "weight_bump": 0.0,
        "threshold": PATTERN_MATCH_THRESHOLD,
    }

    if not SECURITY_EVENTS_LOG.exists():
        return base

    count = 0
    try:
        text = SECURITY_EVENTS_LOG.read_text(encoding="utf-8")
        lines = text.strip().split("\n")
        # Scan the most recent scan_limit lines for performance
        for line in lines[-scan_limit:]:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if rec.get("pattern_hash") == pattern_hash:
                    count += 1
            except Exception:
                pass
    except Exception:
        return base

    detected = count >= PATTERN_MATCH_THRESHOLD
    weight = min(count * WEIGHT_PER_REJECTION / PATTERN_MATCH_THRESHOLD, 1.0) if detected else 0.0

    return {
        "pattern_detected": detected,
        "pattern_hash": pattern_hash,
        "prior_rejection_count": count,
        "weight_bump": weight,
        "threshold": PATTERN_MATCH_THRESHOLD,
    }


# ── Query interface ────────────────────────────────────────────────────────────

def query_events(
    since_ts: Optional[str] = None,
    source: Optional[str] = None,
    pattern_hash: Optional[str] = None,
    limit: int = 50,
) -> Dict[str, Any]:
    """
    Query TimeWave Security events with filter support.
    All results come from the append-only event log; no mutations performed here.
    """
    import datetime
    empty = {
        "events": [],
        "total": 0,
        "query_ts": datetime.datetime.utcnow().isoformat() + "Z",
    }

    if not SECURITY_EVENTS_LOG.exists():
        return empty

    all_events: List[dict] = []
    try:
        for line in SECURITY_EVENTS_LOG.read_text(encoding="utf-8").strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if since_ts and rec.get("ts", "") < since_ts:
                    continue
                if source and rec.get("source") != source:
                    continue
                if pattern_hash and rec.get("pattern_hash") != pattern_hash:
                    continue
                all_events.append(rec)
            except Exception:
                pass
    except Exception:
        return empty

    all_events.sort(key=lambda r: r.get("ts", ""), reverse=True)
    pattern_counts: Dict[str, int] = {}
    for ev in all_events:
        ph = ev.get("pattern_hash", "")
        pattern_counts[ph] = pattern_counts.get(ph, 0) + 1

    return {
        "query_ts": datetime.datetime.utcnow().isoformat() + "Z",
        "total": len(all_events),
        "returned": min(len(all_events), limit),
        "distinct_patterns": len(pattern_counts),
        "events": all_events[:limit],
    }


def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"
