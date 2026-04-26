"""
NAF Engine — Numbered Air Force, Voluntary Cross-Wing Federation
K519 / A&A #2295 Tier 4

NAF is the governance tier above member Wings (Tier 3).  It receives opt-in
aggregate signals from member Wings, detects cross-Wing patterns, and manages
the rule-promotion workflow.

Sovereignty principle — VOLUNTARY at every tier:
  - Member opt-in flag controls whether aggregates flow to NAF (C.1)
  - NAF-default rules require member's explicit one-click opt-in to install (C.8)
  - NAF cannot modify a member's existing rules (C.11)
  - Aggregates contain NO substrate content, NO member-identifiable data (C.2, C.3)

State at ~/.lb-naf/:
  member_registry.json    — registered opt-in Wings
  aggregate_signals.jsonl — received aggregate records
  promote_candidates.json — rule promotion queue (pending / accepted / rejected)
  naf_defaults.json       — published NAF-default rules
  decisions.jsonl         — governance decision audit trail (C.14)

A&A #2295 Tier 4 — NAF operational.
A&A #2292 — Cathedral Federation Protocol transport.
K519 / B126
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any

# ── Paths ──────────────────────────────────────────────────────────────────────

NAF_STATE_DIR           = Path(os.path.expanduser("~/.lb-naf"))
MEMBER_REGISTRY_FILE    = NAF_STATE_DIR / "member_registry.json"
AGGREGATE_SIGNALS_FILE  = NAF_STATE_DIR / "aggregate_signals.jsonl"
PROMOTE_CANDIDATES_FILE = NAF_STATE_DIR / "promote_candidates.json"
NAF_DEFAULTS_FILE       = NAF_STATE_DIR / "naf_defaults.json"
DECISIONS_FILE          = NAF_STATE_DIR / "decisions.jsonl"

MAX_AGGREGATE_LINES = 10_000
MIN_PATTERN_WINGS   = 2      # minimum Wings that must share a pattern (C.12)
MIN_PATTERN_PCT     = 0.10   # minimum 10% of opt-in Wings (C.12)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ensure_dir() -> None:
    NAF_STATE_DIR.mkdir(parents=True, exist_ok=True)


def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"


# ── Member registry ────────────────────────────────────────────────────────────

def load_registry() -> list[dict]:
    try:
        return json.loads(MEMBER_REGISTRY_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_registry(registry: list[dict]) -> None:
    _ensure_dir()
    MEMBER_REGISTRY_FILE.write_text(
        json.dumps(registry, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def register_wing(wing_id: str, metadata: dict | None = None) -> dict:
    """Register a member Wing as opt-in to NAF federation (C.1)."""
    if not wing_id or not isinstance(wing_id, str):
        return {"ok": False, "error": "wing_id required"}
    registry = load_registry()
    existing = next((w for w in registry if w["wing_id"] == wing_id), None)
    entry = {
        "wing_id": wing_id,
        "registered_at": _iso_now(),
        "opt_in": True,
        "metadata": metadata or {},
    }
    if existing:
        existing.update(entry)
    else:
        registry.append(entry)
    save_registry(registry)
    return {"ok": True, "wing_id": wing_id, "registered": not bool(existing)}


def opt_out_wing(wing_id: str) -> dict:
    """Remove a member Wing from NAF federation (C.1 sovereignty)."""
    registry = load_registry()
    updated = [w for w in registry if w["wing_id"] != wing_id]
    save_registry(updated)
    return {"ok": True, "wing_id": wing_id, "removed": len(registry) - len(updated)}


def get_members() -> list[dict]:
    """Return the registered opt-in member Wings."""
    return load_registry()


# ── Prohibited-key validation ──────────────────────────────────────────────────

_PROHIBITED_KEYS = {
    "content", "text", "query", "query_text", "substrate",
    "email", "name", "user_id", "member_id", "username",
    "ip", "device_id", "location", "query_snippet",
}


def _flatten_keys(obj: Any) -> list[str]:
    """Recursively collect all keys from nested dicts/lists."""
    if isinstance(obj, dict):
        keys = [str(k).lower() for k in obj.keys()]
        for v in obj.values():
            keys.extend(_flatten_keys(v))
        return keys
    if isinstance(obj, list):
        result: list[str] = []
        for item in obj:
            result.extend(_flatten_keys(item))
        return result
    return []


def _check_aggregate_safety(signals: dict) -> list[str]:
    """Return list of prohibited key violations found in signals (C.2, C.3)."""
    flat = set(_flatten_keys(signals))
    return sorted(flat & _PROHIBITED_KEYS)


# ── Aggregate signal collection ────────────────────────────────────────────────

def submit_aggregate(wing_id: str, signals: dict) -> dict:
    """
    Receive aggregate signals from an opt-in member Wing.

    signals format:
      {
        "per_rule_fires": {"rule_id": count, ...},
        "total_fires": N,
        "block_count": N,
        "warn_count": N,
        "enrich_count": N,
        "active_rule_count": N,
      }

    C.1: wing_id must be registered (opt-in).
    C.2: aggregates must contain no substrate content keys.
    C.3: aggregates must contain no member-identifiable fields.
    """
    # C.1 — verify wing is registered
    registry = load_registry()
    wing = next((w for w in registry if w["wing_id"] == wing_id), None)
    if not wing:
        return {
            "ok": False,
            "error": (
                f"Wing '{wing_id}' is not registered. "
                "Call POST /naf/register first."
            ),
        }

    # C.2 + C.3 — verify no prohibited keys
    violations = _check_aggregate_safety(signals)
    if violations:
        return {
            "ok": False,
            "error": (
                f"Aggregate contains prohibited keys: {violations}. "
                "NAF receives aggregate fire counts only — no content, no IDs."
            ),
        }

    record = {"ts": _iso_now(), "wing_id": wing_id, "signals": signals}
    try:
        _ensure_dir()
        with open(AGGREGATE_SIGNALS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
        _trim_aggregate()
    except Exception as exc:
        return {"ok": False, "error": str(exc)}

    return {"ok": True, "recorded": True}


def _trim_aggregate() -> None:
    try:
        lines = AGGREGATE_SIGNALS_FILE.read_text(encoding="utf-8").splitlines()
        if len(lines) > MAX_AGGREGATE_LINES:
            keep = lines[-MAX_AGGREGATE_LINES:]
            AGGREGATE_SIGNALS_FILE.write_text(
                "\n".join(keep) + "\n", encoding="utf-8"
            )
    except Exception:
        pass


def load_aggregate_signals(limit: int = 1000) -> list[dict]:
    try:
        lines = AGGREGATE_SIGNALS_FILE.read_text(encoding="utf-8").splitlines()
        result = []
        for line in lines[-limit:]:
            try:
                result.append(json.loads(line))
            except Exception:
                pass
        return result
    except Exception:
        return []


# ── Cross-Wing pattern detection ───────────────────────────────────────────────

def get_patterns(
    min_wings: int | None = None,
    min_pct: float | None = None,
) -> list[dict]:
    """
    C.4, C.12: Detect cross-Wing patterns from aggregate signals.

    A pattern: rule_id X fired in >= min_wings distinct Wings
               AND >= min_pct% of all opt-in Wings.

    Returns list sorted by wing_count descending:
      [{rule_id, wing_count, pct_of_opt_in, total_fires, pattern_level}, ...]
    """
    min_wings = min_wings if min_wings is not None else MIN_PATTERN_WINGS
    min_pct   = min_pct   if min_pct   is not None else MIN_PATTERN_PCT

    registry    = load_registry()
    total_opt_in = max(1, len(registry))
    signals      = load_aggregate_signals()

    if not signals:
        return []

    rule_wings:       dict[str, set[str]] = {}
    rule_total_fires: dict[str, int]      = {}

    for record in signals:
        wing_id   = record.get("wing_id", "")
        per_rule  = record.get("signals", {}).get("per_rule_fires", {})
        for rule_id, count in per_rule.items():
            if rule_id not in rule_wings:
                rule_wings[rule_id]       = set()
                rule_total_fires[rule_id] = 0
            rule_wings[rule_id].add(wing_id)
            rule_total_fires[rule_id] += count

    patterns = []
    for rule_id, wings in rule_wings.items():
        wing_count = len(wings)
        pct        = wing_count / total_opt_in
        if wing_count >= min_wings and pct >= min_pct:
            patterns.append({
                "rule_id":       rule_id,
                "wing_count":    wing_count,
                "pct_of_opt_in": round(pct * 100, 1),
                "total_fires":   rule_total_fires[rule_id],
                "pattern_level": _pattern_level(pct),
            })

    patterns.sort(key=lambda p: p["wing_count"], reverse=True)
    return patterns


def _pattern_level(pct: float) -> str:
    if pct >= 0.5:
        return "high"
    if pct >= 0.25:
        return "medium"
    return "low"


def get_aggregate_summary() -> dict:
    """Summary for NAF governance UI (C.4)."""
    registry = load_registry()
    signals  = load_aggregate_signals()
    patterns = get_patterns()

    total_fires = sum(
        s.get("signals", {}).get("total_fires", 0) for s in signals
    )
    return {
        "opt_in_wings":           len(registry),
        "signal_records":         len(signals),
        "total_fires_across_wings": total_fires,
        "patterns_detected":      len(patterns),
        "patterns":               patterns[:20],
    }


# ── Rule promotion workflow ────────────────────────────────────────────────────

def load_candidates() -> list[dict]:
    try:
        return json.loads(PROMOTE_CANDIDATES_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_candidates(candidates: list[dict]) -> None:
    _ensure_dir()
    PROMOTE_CANDIDATES_FILE.write_text(
        json.dumps(candidates, indent=2, ensure_ascii=False), encoding="utf-8"
    )


_SAFE_RULE_KEYS = {
    "id", "name", "trigger", "required_consult", "failure_action",
    "block_message", "enabled", "scope", "description", "class",
}


def submit_rule_candidate(wing_id: str, rule_def: dict) -> dict:
    """
    C.5: Member submits a rule definition for NAF promotion.
    Only safe rule schema keys are accepted — no telemetry, no substrate content.
    C.11: NAF review does not alter the source Wing's rule.
    """
    if not wing_id or not rule_def:
        return {"ok": False, "error": "wing_id and rule_def required"}

    # Strip any non-schema keys (content, telemetry, etc.)
    safe_rule = {k: v for k, v in rule_def.items() if k in _SAFE_RULE_KEYS}

    candidate_id = _candidate_id(wing_id, safe_rule)
    candidates   = load_candidates()
    existing     = next(
        (c for c in candidates if c["candidate_id"] == candidate_id), None
    )
    if existing:
        return {"ok": True, "candidate_id": candidate_id, "duplicate": True}

    candidate = {
        "candidate_id":   candidate_id,
        "source_wing_id": wing_id,
        "submitted_at":   _iso_now(),
        "status":         "pending",
        "rule_def":       safe_rule,
        "decision_ts":    None,
        "decision_reason": None,
        "governor":       None,
    }
    candidates.append(candidate)
    save_candidates(candidates)
    return {"ok": True, "candidate_id": candidate_id, "status": "pending"}


def _candidate_id(wing_id: str, rule_def: dict) -> str:
    """Deterministic candidate ID: SHA256 of wing_id + rule_id."""
    key = wing_id + ":" + rule_def.get("id", json.dumps(rule_def, sort_keys=True))
    return "cand-" + hashlib.sha256(key.encode()).hexdigest()[:16]


def get_pending_candidates() -> list[dict]:
    """C.6: Return candidates awaiting governance review."""
    return [c for c in load_candidates() if c["status"] == "pending"]


def get_all_candidates() -> list[dict]:
    """Return all candidates (pending + decided) for audit purposes."""
    return load_candidates()


def review_candidate(
    candidate_id: str,
    action: str,
    reason: str = "",
    governor: str = "naf-governor",
) -> dict:
    """
    C.6: Governor accepts or rejects a promote candidate.

    action: "accept" | "reject"

    C.11 sovereignty guarantee: accepting a rule only adds it to naf_defaults
    for opt-in adoption — no member Wing's existing rules are touched.
    C.13: Rejection reason is recorded in the audit trail.
    C.14: Every decision is traceable to source Wing via decisions.jsonl.
    """
    if action not in ("accept", "reject"):
        return {"ok": False, "error": "action must be 'accept' or 'reject'"}

    candidates = load_candidates()
    candidate  = next(
        (c for c in candidates if c["candidate_id"] == candidate_id), None
    )
    if not candidate:
        return {"ok": False, "error": f"Candidate '{candidate_id}' not found"}
    if candidate["status"] != "pending":
        return {
            "ok": False,
            "error": f"Candidate '{candidate_id}' is already {candidate['status']}",
        }

    candidate["status"]          = action + "ed"
    candidate["decision_ts"]     = _iso_now()
    candidate["decision_reason"] = reason
    candidate["governor"]        = governor
    save_candidates(candidates)

    # C.14 — provenance audit trail
    decision_record = {
        "ts":             _iso_now(),
        "candidate_id":   candidate_id,
        "action":         action,
        "governor":       governor,
        "reason":         reason,
        "rule_id":        candidate["rule_def"].get("id", ""),
        "source_wing_id": candidate["source_wing_id"],
    }
    try:
        _ensure_dir()
        with open(DECISIONS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(decision_record, ensure_ascii=False) + "\n")
    except Exception:
        pass

    if action == "accept":
        _publish_naf_default(candidate["rule_def"], candidate["source_wing_id"])
        return {"ok": True, "action": "accepted", "published": True}
    return {"ok": True, "action": "rejected"}


def _publish_naf_default(rule_def: dict, source_wing_id: str) -> None:
    """Add an accepted rule to the NAF defaults list (C.7)."""
    defaults = load_naf_defaults()
    rule_id  = rule_def.get("id", "")
    if any(d["rule_def"].get("id") == rule_id for d in defaults):
        return  # Already published — idempotent
    defaults.append({
        "rule_def":       rule_def,
        "source_wing_id": source_wing_id,
        "promoted_at":    _iso_now(),
    })
    _save_naf_defaults(defaults)


def load_naf_defaults() -> list[dict]:
    """C.7, C.8: Return published NAF-default rules."""
    try:
        return json.loads(NAF_DEFAULTS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_naf_defaults(defaults: list[dict]) -> None:
    _ensure_dir()
    NAF_DEFAULTS_FILE.write_text(
        json.dumps(defaults, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def get_naf_defaults() -> list[dict]:
    """C.7, C.8: Return published NAF-default rules for member opt-in adoption."""
    return load_naf_defaults()


# ── C.13 Conflict resolution ───────────────────────────────────────────────────

def load_decisions() -> list[dict]:
    """Load governance decision audit trail (C.14)."""
    try:
        lines = DECISIONS_FILE.read_text(encoding="utf-8").splitlines()
        result = []
        for line in lines:
            try:
                result.append(json.loads(line))
            except Exception:
                pass
        return result
    except Exception:
        return []
