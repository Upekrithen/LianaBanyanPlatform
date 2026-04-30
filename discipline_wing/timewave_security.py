"""
TimeWave Security Runtime (K517 / A&A #2302)
KN005/BP002: session-boundary reset + content-class hash partitioning + critical-Augur-only counter.

Captures unauthorized state mutations as security events; detects repeated-rejection
patterns; exposes pattern signals to the Wing Consensus Layer as a synthetic Augur.

Design:
- Append-only event log at ~/.claude/state/timewave_security/security_events.jsonl
- Session state at ~/.claude/state/timewave_security/session_state.json (mutable; written on session-start)
- Pattern hash: hash(content_class | trigger_category | file_ext) — KN005: content_class partitioned
- Threshold: PATTERN_MATCH_THRESHOLD rejections with same hash → pattern_detected = True
- Session-boundary reset: only events from the CURRENT session count toward threshold
- Critical-Augur-only increment: only writes rejected by a CRITICAL Augur increment the counter
- Weight bump: injected as synthetic AugurResult before Consensus arbitration
- Wing opt-in: timewave_security_enabled (default True for defense-in-depth)

KN005 root-cause fix (BP002):
  - Hash 4f68e52be5c79221 accumulated 47+ rejections across BP001→BP002, blocking legitimate writes.
  - Root causes: (1) no session-boundary reset, (2) no content-class partitioning, (3) all blocks
    incremented regardless of whether a critical Augur caused the rejection.
  - All three fixed here.

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
SESSION_STATE_FILE  = SECURITY_EVENTS_DIR / "session_state.json"

PATTERN_MATCH_THRESHOLD = 12  # K527: bumped 3→12 (B128 open followup). Single-session legitimate
                               # substrate work routinely produces 3-5 Augur false-positive trips;
                               # old threshold of 3 punished Bishop for working WITH the substrate.
                               # 12 is high enough to not fire on normal workflows, low enough to
                               # catch genuine catastrophic-loop scenarios (TS-094 empirical anchor).
                               # KN005: threshold applies WITHIN-SESSION only (cross-session counters reset).
WEIGHT_PER_REJECTION = 0.5    # Confidence weight per repeated rejection (capped 1.0)
PATTERN_RECENCY_WINDOW_SECONDS = 3600  # B128 fallback: only events within last hour count when
                                        # no session state is available. KN005 primary reset is
                                        # session-boundary; recency window is defense-in-depth.

# KN005: Content-class rules for per-class hash partitioning.
# Order matters: first match wins.
_CONTENT_CLASS_RULES = [
    (r"(?i)PROMPT_KNIGHT_",         "knight-prompt"),
    (r"(?i)PROMPT_PAWN_",           "pawn-prompt"),
    (r"(?i)PROMPT_BISHOP_",         "bishop-prompt"),
    (r"(?i)PROMPT_ROOK_",           "rook-prompt"),
    (r"(?i)LETTER_DRAFT_",          "letter-draft"),
    (r"(?i)MILESTONE_",             "milestone"),
    (r"(?i)PAPER_",                 "paper"),
    (r"(?i)INNOVATION_",            "innovation"),
    (r"(?i)feedback_",              "feedback"),
    (r"(?i)stitchpunks/",           "stitchpunks"),
    (r"(?i)project_",               "project-canon"),
    (r"(?i)\.eblet\.md$",           "eblet"),
    (r"(?i)CONTEXT_MANAGEMENT/",    "context-management"),
    (r"(?i)BISHOP_DROPZONE/",       "bishop-dropzone"),
    (r"(?i)KNIGHT_DROPZONE/",       "knight-dropzone"),
    (r"(?i)/letters/",              "letters"),
    (r"(?i)platform/src/",          "platform-src"),
    (r"(?i)platform/supabase/",     "platform-db"),
    (r"(?i)discipline_wing/",       "discipline-wing"),
]

# KN005: Allowlisted content classes — immune to cross-session TimeWave accumulation.
# These classes are inherently session-scoped; prior-session counts never carry forward.
ALLOWLISTED_CLASSES = frozenset({
    "knight-prompt",
    "pawn-prompt",
    "bishop-prompt",
    "rook-prompt",
    "letter-draft",
    "milestone",
    "paper",
    "innovation",
    "feedback",
})

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


# ── Content-class derivation (KN005) ──────────────────────────────────────────

def _derive_content_class(file_path: str) -> str:
    """
    Derive a content class from the file path for hash partitioning.
    Prevents different content classes from sharing a TimeWave hash bucket.
    E.g., PROMPT_KNIGHT_* rejections don't poison LETTER_DRAFT_* buckets.
    """
    normalized = file_path.replace("\\", "/")
    for pattern, cls in _CONTENT_CLASS_RULES:
        if re.search(pattern, normalized):
            return cls
    return "general"


# ── Session state (KN005) ──────────────────────────────────────────────────────

def reset_session_counters(session_id: str) -> None:
    """
    Write a session-start marker so that match_security_pattern only counts
    events from this session going forward.  Called by the SessionStart hook
    (or any session-boundary trigger).

    Historical events are preserved in the append-only log; they simply don't
    count toward the threshold after this reset.
    """
    state = {
        "current_session_id": session_id,
        "session_start_ts":   _iso_now(),
        "reset_ts_epoch":     time.time(),
    }
    try:
        SECURITY_EVENTS_DIR.mkdir(parents=True, exist_ok=True)
        with open(SESSION_STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f)
    except Exception:
        pass  # Fail-safe


def _get_session_state() -> dict:
    """
    Read the current session state.  Returns safe defaults if file is absent
    or unreadable.
    """
    try:
        if SESSION_STATE_FILE.exists():
            return json.loads(SESSION_STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {"current_session_id": "", "session_start_ts": "", "reset_ts_epoch": 0.0}


# ── Pattern fingerprint ────────────────────────────────────────────────────────

def _compute_pattern_hash(content: str, file_path: str) -> str:
    """
    KN005: Stable pattern hash partitioned by content_class + trigger_category + file_ext.

    content_class prevents different document types from sharing a hash bucket.
    trigger_category groups "same class of threat".
    file_ext adds a secondary discriminant.
    """
    ext = Path(file_path).suffix.lower() or ".unknown"
    content_class = _derive_content_class(file_path)
    category = "generic_rejection"
    for cat_name, pattern in TRIGGER_CATEGORIES:
        if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
            category = cat_name
            break
    raw = f"{content_class}|{category}|{ext}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


# ── Event record ───────────────────────────────────────────────────────────────

def record_event(
    content: str,
    file_path: str,
    triggered_augur_ids: List[str],
    consensus_decision: str,
    source: str = "wing_block",          # "wing_block" | "dragonrider_reject"
    session: str = "",
    enabled: bool = True,
    is_critical_augur_rejection: bool = True,  # KN005 D.3: only critical-Augur blocks increment
) -> str:
    """
    Record a rejected action as a TimeWave Security event (append-only).
    Returns event_id (str) or "" on failure.

    KN005 D.3: is_critical_augur_rejection=False skips recording entirely.
    Advisory Augur warnings and non-Augur rejections do NOT increment the counter;
    only writes rejected by a CRITICAL Augur contribute to pattern accumulation.
    This is the D.3 root-cause fix: prior implementation incremented on ALL rejections,
    causing clean content that hit path errors to accumulate false rejection records.

    Append-only guarantee: only ever opens the file in "a" mode.
    No existing record is ever overwritten or deleted via this API.
    """
    if not enabled:
        return ""
    if not is_critical_augur_rejection:
        return ""  # KN005: only critical-Augur blocks count toward TimeWave

    event_id = str(uuid.uuid4())[:8]
    pattern_hash = _compute_pattern_hash(content, file_path)
    content_class = _derive_content_class(file_path)

    record = {
        "ts": _iso_now(),
        "event_id": event_id,
        "source": source,
        "file_path": file_path,
        "file_ext": Path(file_path).suffix.lower(),
        "content_class": content_class,
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

    KN005 session-boundary reset: only events from the CURRENT session (after the last
    reset_session_counters() call) count toward the threshold.  Cross-session
    accumulation is the root cause of the BP001→BP002 carryover bug.

    KN005 content-class partitioning: the pattern hash includes content class, so
    PROMPT_KNIGHT_* rejections never pollute LETTER_DRAFT_* buckets.

    KN005 allowlisted classes: allowlisted content classes (knight-prompt, letter-draft,
    milestone, etc.) are fully immune from cross-session accumulation.

    Fallback: if no session state exists, falls back to B128 1-hour recency window.

    Returns:
        pattern_detected:      True if prior_rejection_count >= PATTERN_MATCH_THRESHOLD
        pattern_hash:          stable fingerprint for this action class
        content_class:         derived content class for this file path
        prior_rejection_count: how many prior rejections share this pattern_hash
        weight_bump:           confidence weight (0.0–1.0) to inject as Augur signal
        threshold:             PATTERN_MATCH_THRESHOLD value
        session_filtered:      True if session-boundary filtering was applied
    """
    import datetime

    pattern_hash = _compute_pattern_hash(content, file_path)
    content_class = _derive_content_class(file_path)

    base: Dict[str, Any] = {
        "pattern_detected": False,
        "pattern_hash": pattern_hash,
        "content_class": content_class,
        "prior_rejection_count": 0,
        "weight_bump": 0.0,
        "threshold": PATTERN_MATCH_THRESHOLD,
        "session_filtered": False,
    }

    # KN005: allowlisted content classes are completely immune from cross-session accumulation.
    # They still check within-session counts (session_filtered=True applies), but if there's no
    # session state, they get zero count — not the 1-hour fallback.
    is_allowlisted = content_class in ALLOWLISTED_CLASSES

    if not SECURITY_EVENTS_LOG.exists():
        return base

    # KN005 primary reset: session-boundary filter
    session_state = _get_session_state()
    reset_epoch = session_state.get("reset_ts_epoch", 0.0)
    current_session_id = session_state.get("current_session_id", "")
    session_filtered = False

    # Determine effective cutoff timestamp
    if reset_epoch > 0:
        # Primary: only count events after the session reset (KN005 D.1)
        try:
            cutoff_iso = datetime.datetime.utcfromtimestamp(reset_epoch).isoformat() + "Z"
            session_filtered = True
        except Exception:
            cutoff_iso = ""
    elif not is_allowlisted:
        # Fallback: B128 1-hour recency window (only for non-allowlisted classes)
        try:
            cutoff_dt = datetime.datetime.utcnow() - datetime.timedelta(seconds=PATTERN_RECENCY_WINDOW_SECONDS)
            cutoff_iso = cutoff_dt.isoformat() + "Z"
        except Exception:
            cutoff_iso = ""
    else:
        # Allowlisted class with no session state → count is 0 (immune)
        base["session_filtered"] = True
        return base

    count = 0
    try:
        text = SECURITY_EVENTS_LOG.read_text(encoding="utf-8")
        lines = text.strip().split("\n")
        for line in lines[-scan_limit:]:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if rec.get("pattern_hash") != pattern_hash:
                    continue
                # Session-boundary filter: only count events after the reset cutoff
                rec_ts = rec.get("ts", "")
                if cutoff_iso and rec_ts and rec_ts < cutoff_iso:
                    continue
                # Additional guard: if we have a current_session_id AND a session on the record,
                # only count if they match (extra protection for within-session isolation)
                rec_session = rec.get("session", "")
                if current_session_id and rec_session and rec_session != current_session_id:
                    continue
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
        "content_class": content_class,
        "prior_rejection_count": count,
        "weight_bump": weight,
        "threshold": PATTERN_MATCH_THRESHOLD,
        "session_filtered": session_filtered,
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
