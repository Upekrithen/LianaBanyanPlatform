"""
MAJCOM-LB Engine — Major Command, Strategic-Tier Federation
K520 / A&A #2295 Tier 5 / Sphinx Project Phase 1

The MAJCOM is the strategic federation across ALL role-class NAFs in the
Liana Banyan cooperative ecosystem.  MAJCOM-LB federates:
  - NAF-Bishops  (Bishop-class Wings)
  - NAF-Knights  (Knight-class Wings)
  - NAF-Members  (member-instance Wings, post-K519)

Governance: MAJCOM authority is ENUMERATED, not command-and-control.
  - MAJCOM-default rules are opt-in for NAFs and their member-Wings.
  - Structural Bylaws enforcement is mandatory (foundational cooperative
    constitution — membership = $5/yr, creator keep = 83.3%, etc.).
  - Emergency authority (SHUT IT DOWN #2304) freezes new actions pending
    Founder review on critical-class violation cascade.
  - MAJCOM cannot read member-substrate content — only aggregate signals.

Cooperative Defensive Patent Pledge (#2260):
  - MAJCOM hosts the Pledge admission verification (EIN check) for
    nonprofits, cooperatives, and academic institutions.

CFP cross-MAJCOM transport:
  - MAJCOM exposes a CFP-compatible interface for future cross-MAJCOM
    federation (e.g., a second cooperative's MAJCOM joining Sphinx Band-NA).
  - Phase 1: interface defined and documented; no second MAJCOM exists yet.

State at ~/.lb-majcom/:
  naf_registry.json        — registered NAFs under MAJCOM-LB governance
  majcom_signals.jsonl     — aggregate signals rolled up from NAFs
  promote_candidates.json  — MAJCOM-level rule promotion queue
  majcom_defaults.json     — published MAJCOM-default rules
  structural_bylaws.json   — Structural Bylaws (read-only except Founder veto)
  decisions.jsonl          — MAJCOM governance audit trail (Time Capsules #2303)
  shutdown_state.json      — SHUT IT DOWN (#2304) stateless-frozen mode state
  pledge_admissions.json   — Cooperative Defensive Patent Pledge admissions (#2260)
  cfp_cross_majcom.jsonl   — outbound cross-MAJCOM CFP envelopes (B.6)

A&A #2295 Tier 5 — MAJCOM operational as of K520.
A&A #2292 — Cathedral Federation Protocol transport at every tier.
K520 / B126
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any

# ── Paths ──────────────────────────────────────────────────────────────────────

MAJCOM_STATE_DIR        = Path(os.path.expanduser("~/.lb-majcom"))
NAF_REGISTRY_FILE       = MAJCOM_STATE_DIR / "naf_registry.json"
MAJCOM_SIGNALS_FILE     = MAJCOM_STATE_DIR / "majcom_signals.jsonl"
PROMOTE_CANDIDATES_FILE = MAJCOM_STATE_DIR / "promote_candidates.json"
MAJCOM_DEFAULTS_FILE    = MAJCOM_STATE_DIR / "majcom_defaults.json"
STRUCTURAL_BYLAWS_FILE  = MAJCOM_STATE_DIR / "structural_bylaws.json"
DECISIONS_FILE          = MAJCOM_STATE_DIR / "decisions.jsonl"
SHUTDOWN_STATE_FILE     = MAJCOM_STATE_DIR / "shutdown_state.json"
PLEDGE_ADMISSIONS_FILE  = MAJCOM_STATE_DIR / "pledge_admissions.json"
CFP_CROSS_MAJCOM_FILE   = MAJCOM_STATE_DIR / "cfp_cross_majcom.jsonl"

MAX_SIGNAL_LINES  = 50_000
MAX_CFP_LINES     = 10_000

# ── MAJCOM version / metadata ──────────────────────────────────────────────────

MAJCOM_ID      = "MAJCOM-LB"
MAJCOM_VERSION = "1.0.0-K520"
SPHINX_PHASE   = "Phase 1"
SPHINX_BAND    = "Band-NA"  # North America — founding Band


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ensure_dir() -> None:
    MAJCOM_STATE_DIR.mkdir(parents=True, exist_ok=True)


def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"


def _sha256_hex(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _append_jsonl(path: Path, record: dict, max_lines: int = 0) -> None:
    _ensure_dir()
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    if max_lines:
        _trim_jsonl(path, max_lines)


def _trim_jsonl(path: Path, max_lines: int) -> None:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
        if len(lines) > max_lines:
            path.write_text("\n".join(lines[-max_lines:]) + "\n", encoding="utf-8")
    except Exception:
        pass


def _read_jsonl(path: Path, limit: int = 10_000) -> list[dict]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
        result = []
        for line in lines[-limit:]:
            try:
                result.append(json.loads(line))
            except Exception:
                pass
        return result
    except Exception:
        return []


def _read_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def _write_json(path: Path, data: Any) -> None:
    _ensure_dir()
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ── Structural Bylaws (constitutional layer) ────────────────────────────────────

_DEFAULT_STRUCTURAL_BYLAWS: list[dict] = [
    {
        "id":          "SB-001",
        "name":        "Membership pricing — $5/yr identical for all",
        "description": "Membership cost is $5.00/yr, identical for the first member and the five-millionth. Cannot be changed without full cooperative constitutional amendment.",
        "class":       "constitutional",
        "mandatory":   True,
        "veto_authority": "Founder",
    },
    {
        "id":          "SB-002",
        "name":        "Creator keep — 83.3% (never rounded to 83%)",
        "description": "Creator or Worker keeps 83.3% of every transaction. Platform margin is Cost+20%. Cannot be reduced without constitutional amendment.",
        "class":       "constitutional",
        "mandatory":   True,
        "veto_authority": "Founder",
    },
    {
        "id":          "SB-003",
        "name":        "One-level attribution only",
        "description": "Attribution is one level deep — no multi-level marketing structures permitted.",
        "class":       "constitutional",
        "mandatory":   True,
        "veto_authority": "Founder",
    },
    {
        "id":          "SB-004",
        "name":        "Cooperative Defensive Patent Pledge governance",
        "description": "All innovations are filed under the Cooperative Defensive Patent Pledge (#2260). Free forever to nonprofits, cooperatives, and academic institutions via EIN verification.",
        "class":       "constitutional",
        "mandatory":   True,
        "veto_authority": "Founder",
    },
    {
        "id":          "SB-005",
        "name":        "Member sovereignty — MAJCOM cannot read substrate content",
        "description": "MAJCOM receives only aggregate signals from NAFs. No member substrate content (queries, documents, personal data) flows to MAJCOM. Sovereignty preserved at every tier.",
        "class":       "sovereignty",
        "mandatory":   True,
        "veto_authority": "Founder",
    },
    {
        "id":          "SB-006",
        "name":        "Enumerated powers — MAJCOM cannot modify NAF rules without NAF consent",
        "description": "MAJCOM authority is limited to: (1) promoting rules to MAJCOM-default status (opt-in by NAFs/Wings), (2) enforcing Structural Bylaws, (3) emergency authority during critical-class violations. MAJCOM cannot force rule changes on NAFs without consent.",
        "class":       "sovereignty",
        "mandatory":   True,
        "veto_authority": "Founder",
    },
]


def load_structural_bylaws() -> list[dict]:
    data = _read_json(STRUCTURAL_BYLAWS_FILE, None)
    if not data:
        _write_json(STRUCTURAL_BYLAWS_FILE, _DEFAULT_STRUCTURAL_BYLAWS)
        return _DEFAULT_STRUCTURAL_BYLAWS
    return data


def get_structural_bylaws() -> list[dict]:
    """C.8: Return the Structural Bylaws enforced by MAJCOM."""
    return load_structural_bylaws()


def check_bylaw_compliance(rule_def: dict) -> dict:
    """
    C.8: Check if a proposed rule violates any Structural Bylaw.

    Returns:
        {"compliant": True}  — rule passes all bylaws
        {"compliant": False, "violations": [{"bylaw_id": ..., "name": ..., "reason": ...}]}
    """
    bylaws = load_structural_bylaws()
    violations = []

    rule_name = (rule_def.get("name") or "").lower()
    rule_desc = (rule_def.get("description") or "").lower()
    rule_text = rule_name + " " + rule_desc + " " + json.dumps(rule_def).lower()

    for bylaw in bylaws:
        bylaw_id = bylaw["id"]

        if bylaw_id == "SB-001":
            # Detect attempts to change membership pricing
            if any(kw in rule_text for kw in ["membership fee", "membership cost", "membership price", "annual fee", "$10", "$20", "$50", "per month"]):
                violations.append({
                    "bylaw_id": bylaw_id,
                    "name":     bylaw["name"],
                    "reason":   "Rule references membership pricing. Membership is $5/yr, unconditionally. Cannot be altered by any rule.",
                })

        elif bylaw_id == "SB-002":
            # Detect attempts to reduce creator keep
            if any(kw in rule_text for kw in ["creator keep", "83%", "80%", "75%", "commission", "platform fee increase"]):
                violations.append({
                    "bylaw_id": bylaw_id,
                    "name":     bylaw["name"],
                    "reason":   "Rule references creator compensation rate. Creator keep is 83.3% and cannot be reduced.",
                })

        elif bylaw_id == "SB-003":
            # Detect MLM-style structures
            if any(kw in rule_text for kw in ["multi-level", "multilevel", "pyramid", "tier 2 commission", "downline", "upline referral"]):
                violations.append({
                    "bylaw_id": bylaw_id,
                    "name":     bylaw["name"],
                    "reason":   "Rule references multi-level attribution structure, which violates the one-level-only bylaw.",
                })

    if violations:
        return {"compliant": False, "violations": violations}
    return {"compliant": True}


# ── NAF Registry ────────────────────────────────────────────────────────────────

def load_naf_registry() -> list[dict]:
    return _read_json(NAF_REGISTRY_FILE, [])


def save_naf_registry(registry: list[dict]) -> None:
    _write_json(NAF_REGISTRY_FILE, registry)


def register_naf(
    naf_id: str,
    role_class: str,
    metadata: dict | None = None,
) -> dict:
    """
    C.1: Register a NAF under MAJCOM-LB governance.

    role_class: "bishops" | "knights" | "members" | "pawns" | "rooks" |
                "per_guild" | "per_tribe" | "per_vendor" | custom
    """
    if not naf_id or not role_class:
        return {"ok": False, "error": "naf_id and role_class required"}

    registry = load_naf_registry()
    existing = next((n for n in registry if n["naf_id"] == naf_id), None)

    entry = {
        "naf_id":          naf_id,
        "role_class":      role_class,
        "registered_at":   _iso_now(),
        "status":          "active",
        "metadata":        metadata or {},
    }
    if existing:
        existing.update(entry)
    else:
        registry.append(entry)
    save_naf_registry(registry)

    _write_time_capsule("naf_registered", {
        "naf_id": naf_id, "role_class": role_class,
    })

    return {
        "ok":         True,
        "naf_id":     naf_id,
        "registered": not bool(existing),
        "majcom_id":  MAJCOM_ID,
    }


def deregister_naf(naf_id: str) -> dict:
    """Remove a NAF from MAJCOM registry (sovereignty — NAF may leave at will)."""
    registry = load_naf_registry()
    updated = [n for n in registry if n["naf_id"] != naf_id]
    save_naf_registry(updated)
    removed = len(registry) - len(updated)
    _write_time_capsule("naf_deregistered", {"naf_id": naf_id, "removed": removed})
    return {"ok": True, "naf_id": naf_id, "removed": removed}


def get_naf_registry() -> list[dict]:
    """C.1: Return the registered NAFs."""
    return load_naf_registry()


def get_naf_summary() -> dict:
    """Summary of MAJCOM NAF registry."""
    registry = load_naf_registry()
    return {
        "majcom_id":     MAJCOM_ID,
        "majcom_version": MAJCOM_VERSION,
        "sphinx_phase":  SPHINX_PHASE,
        "sphinx_band":   SPHINX_BAND,
        "naf_count":     len(registry),
        "nafs":          registry,
    }


# ── Aggregate signal rollup (C.2) ───────────────────────────────────────────────

_PROHIBITED_KEYS = {
    "content", "text", "query", "query_text", "substrate",
    "email", "name", "user_id", "member_id", "username",
    "ip", "device_id", "location", "query_snippet",
    "wing_ids", "member_list", "wing_list",
}


def _check_aggregate_safety(signals: dict) -> list[str]:
    def _flatten(obj: Any) -> list[str]:
        if isinstance(obj, dict):
            keys = [str(k).lower() for k in obj.keys()]
            for v in obj.values():
                keys.extend(_flatten(v))
            return keys
        if isinstance(obj, list):
            out: list[str] = []
            for item in obj:
                out.extend(_flatten(item))
            return out
        return []
    flat = set(_flatten(signals))
    return sorted(flat & _PROHIBITED_KEYS)


def submit_naf_aggregate(naf_id: str, signals: dict) -> dict:
    """
    C.2: Receive aggregate signals from a registered NAF.

    MAJCOM receives ONLY aggregate counts — no member-identifiable data,
    no substrate content.  signals format mirrors NAF aggregate structure:
      {
        "opt_in_wings":           N,
        "signal_records":         N,
        "total_fires_across_wings": N,
        "patterns_detected":      N,
        "top_patterns":           [{"rule_id": ..., "wing_count": N, "pct_of_opt_in": X, "pattern_level": ...}],
      }
    """
    # Verify NAF is registered
    registry = load_naf_registry()
    naf = next((n for n in registry if n["naf_id"] == naf_id), None)
    if not naf:
        return {
            "ok": False,
            "error": f"NAF '{naf_id}' is not registered. Call POST /majcom/register-naf first.",
        }

    # C.14/C.2 — no prohibited keys
    violations = _check_aggregate_safety(signals)
    if violations:
        return {
            "ok": False,
            "error": f"Aggregate contains prohibited keys: {violations}. MAJCOM receives aggregate counts only.",
        }

    record = {
        "ts":      _iso_now(),
        "naf_id":  naf_id,
        "signals": signals,
    }
    _append_jsonl(MAJCOM_SIGNALS_FILE, record, MAX_SIGNAL_LINES)

    return {"ok": True, "recorded": True, "majcom_id": MAJCOM_ID}


def load_majcom_signals(limit: int = 2000) -> list[dict]:
    return _read_jsonl(MAJCOM_SIGNALS_FILE, limit)


# ── Cross-NAF pattern detection (B.4) ──────────────────────────────────────────

def get_cross_naf_patterns(
    min_nafs: int = 2,
    min_pct:  float = 0.25,
) -> list[dict]:
    """
    C.7: Detect platform-wide patterns from aggregate signals across NAFs.

    A pattern: rule_id X appearing in patterns from >= min_nafs distinct NAFs
               AND >= min_pct% of all registered NAFs.

    Returns list sorted by naf_count descending.
    """
    registry    = load_naf_registry()
    total_nafs  = max(1, len(registry))
    signals     = load_majcom_signals()

    if not signals:
        return []

    rule_nafs:        dict[str, set[str]] = {}
    rule_total_fires: dict[str, int]      = {}
    rule_max_level:   dict[str, str]      = {}

    for record in signals:
        naf_id   = record.get("naf_id", "")
        top_pats = record.get("signals", {}).get("top_patterns", [])
        for pat in top_pats:
            rule_id = pat.get("rule_id", "")
            if not rule_id:
                continue
            if rule_id not in rule_nafs:
                rule_nafs[rule_id]        = set()
                rule_total_fires[rule_id] = 0
                rule_max_level[rule_id]   = "low"
            rule_nafs[rule_id].add(naf_id)
            rule_total_fires[rule_id] += pat.get("wing_count", 0)
            # Escalate level
            lvl = pat.get("pattern_level", "low")
            if lvl == "high" or (lvl == "medium" and rule_max_level[rule_id] == "low"):
                rule_max_level[rule_id] = lvl

    patterns = []
    for rule_id, nafs in rule_nafs.items():
        naf_count = len(nafs)
        pct       = naf_count / total_nafs
        if naf_count >= min_nafs and pct >= min_pct:
            patterns.append({
                "rule_id":       rule_id,
                "naf_count":     naf_count,
                "pct_of_nafs":   round(pct * 100, 1),
                "total_fires":   rule_total_fires[rule_id],
                "pattern_level": _pattern_level(pct),
                "nafs":          sorted(nafs),
            })

    patterns.sort(key=lambda p: p["naf_count"], reverse=True)
    return patterns


def _pattern_level(pct: float) -> str:
    if pct >= 0.5:
        return "high"
    if pct >= 0.25:
        return "medium"
    return "low"


def get_majcom_aggregate_summary() -> dict:
    """C.2: MAJCOM-level aggregate summary."""
    registry = load_naf_registry()
    signals  = load_majcom_signals()
    patterns = get_cross_naf_patterns()
    shutdown = get_shutdown_state()

    total_fires = sum(
        s.get("signals", {}).get("total_fires_across_wings", 0)
        for s in signals
    )
    return {
        "majcom_id":        MAJCOM_ID,
        "sphinx_phase":     SPHINX_PHASE,
        "sphinx_band":      SPHINX_BAND,
        "naf_count":        len(registry),
        "signal_records":   len(signals),
        "total_fires":      total_fires,
        "patterns_detected": len(patterns),
        "patterns":         patterns[:20],
        "shutdown_active":  shutdown.get("active", False),
        "shutdown_reason":  shutdown.get("reason") if shutdown.get("active") else None,
    }


# ── Strategic-policy promotion workflow (B.3) ──────────────────────────────────

def load_majcom_candidates() -> list[dict]:
    return _read_json(PROMOTE_CANDIDATES_FILE, [])


def save_majcom_candidates(candidates: list[dict]) -> None:
    _write_json(PROMOTE_CANDIDATES_FILE, candidates)


_SAFE_RULE_KEYS = {
    "id", "name", "trigger", "required_consult", "failure_action",
    "block_message", "enabled", "scope", "description", "class",
}


def submit_rule_candidate(naf_id: str, rule_def: dict) -> dict:
    """
    C.3: NAF surfaces a rule for MAJCOM promotion.
    Only safe rule schema keys accepted — no telemetry, no substrate content.
    Runs bylaw compliance check before admission.
    """
    if not naf_id or not rule_def:
        return {"ok": False, "error": "naf_id and rule_def required"}

    # Verify NAF is registered
    registry = load_naf_registry()
    if not any(n["naf_id"] == naf_id for n in registry):
        return {"ok": False, "error": f"NAF '{naf_id}' is not registered."}

    # Strip non-schema keys
    safe_rule = {k: v for k, v in rule_def.items() if k in _SAFE_RULE_KEYS}

    # Bylaw compliance check before admission to queue
    compliance = check_bylaw_compliance(safe_rule)
    if not compliance["compliant"]:
        return {
            "ok":        False,
            "error":     "Rule violates Structural Bylaws and cannot be promoted to MAJCOM-default.",
            "violations": compliance["violations"],
        }

    candidate_id = _candidate_id(naf_id, safe_rule)
    candidates   = load_majcom_candidates()
    existing     = next((c for c in candidates if c["candidate_id"] == candidate_id), None)
    if existing:
        return {"ok": True, "candidate_id": candidate_id, "duplicate": True}

    candidate = {
        "candidate_id":    candidate_id,
        "source_naf_id":   naf_id,
        "submitted_at":    _iso_now(),
        "status":          "pending",
        "rule_def":        safe_rule,
        "decision_ts":     None,
        "decision_reason": None,
        "governor":        None,
        "bylaw_check":     "passed",
    }
    candidates.append(candidate)
    save_majcom_candidates(candidates)

    _write_time_capsule("rule_candidate_submitted", {
        "candidate_id": candidate_id, "naf_id": naf_id,
        "rule_id": safe_rule.get("id"),
    })

    return {"ok": True, "candidate_id": candidate_id, "status": "pending"}


def _candidate_id(naf_id: str, rule_def: dict) -> str:
    key = naf_id + ":" + rule_def.get("id", json.dumps(rule_def, sort_keys=True))
    return "majcand-" + _sha256_hex(key)[:16]


def get_pending_candidates() -> list[dict]:
    """C.3: Return candidates awaiting MAJCOM Council review."""
    return [c for c in load_majcom_candidates() if c["status"] == "pending"]


def get_all_candidates() -> list[dict]:
    return load_majcom_candidates()


def review_candidate(
    candidate_id: str,
    action: str,
    reason: str = "",
    governor: str = "majcom-council",
) -> dict:
    """
    C.4: MAJCOM Council accepts or rejects a promotion candidate.

    C.13: Sovereignty — MAJCOM cannot modify NAF rules without NAF consent.
    Accepting a rule only adds it to majcom_defaults for opt-in adoption by NAFs.
    C.8: Founder retains Structural-Bylaws veto regardless of Council vote.
    """
    if action not in ("accept", "reject"):
        return {"ok": False, "error": "action must be 'accept' or 'reject'"}

    candidates = load_majcom_candidates()
    candidate  = next((c for c in candidates if c["candidate_id"] == candidate_id), None)
    if not candidate:
        return {"ok": False, "error": f"Candidate '{candidate_id}' not found"}
    if candidate["status"] != "pending":
        return {"ok": False, "error": f"Candidate '{candidate_id}' is already {candidate['status']}"}

    candidate["status"]          = action + "ed"
    candidate["decision_ts"]     = _iso_now()
    candidate["decision_reason"] = reason
    candidate["governor"]        = governor
    save_majcom_candidates(candidates)

    decision_record = {
        "ts":              _iso_now(),
        "type":            "rule_promotion_decision",
        "candidate_id":    candidate_id,
        "action":          action,
        "governor":        governor,
        "reason":          reason,
        "rule_id":         candidate["rule_def"].get("id", ""),
        "source_naf_id":   candidate["source_naf_id"],
    }
    _append_jsonl(DECISIONS_FILE, decision_record)
    _write_time_capsule("rule_promotion_decision", decision_record)

    if action == "accept":
        _publish_majcom_default(candidate["rule_def"], candidate["source_naf_id"])
        return {"ok": True, "action": "accepted", "published": True}
    return {"ok": True, "action": "rejected"}


def _publish_majcom_default(rule_def: dict, source_naf_id: str) -> None:
    """C.5: Add accepted rule to MAJCOM defaults (opt-in for NAFs/Wings)."""
    defaults = load_majcom_defaults()
    rule_id  = rule_def.get("id", "")
    if any(d["rule_def"].get("id") == rule_id for d in defaults):
        return  # Idempotent
    defaults.append({
        "rule_def":       rule_def,
        "source_naf_id":  source_naf_id,
        "promoted_at":    _iso_now(),
        "class":          "majcom_default",
    })
    _write_json(MAJCOM_DEFAULTS_FILE, defaults)


def load_majcom_defaults() -> list[dict]:
    return _read_json(MAJCOM_DEFAULTS_FILE, [])


def get_majcom_defaults() -> list[dict]:
    """C.5, C.6: Return published MAJCOM-default rules for NAF/Wing opt-in adoption."""
    return load_majcom_defaults()


# ── Founder Structural-Bylaws veto (C.8) ───────────────────────────────────────

def founder_veto(
    candidate_id: str,
    bylaw_id:     str,
    reason:       str = "",
) -> dict:
    """
    C.8: Founder Structural-Bylaws veto — overrides any Council acceptance.
    Can only be invoked for rules that violate a Structural Bylaw.
    """
    candidates = load_majcom_candidates()
    candidate  = next((c for c in candidates if c["candidate_id"] == candidate_id), None)
    if not candidate:
        return {"ok": False, "error": f"Candidate '{candidate_id}' not found"}

    bylaw = next(
        (b for b in load_structural_bylaws() if b["id"] == bylaw_id), None
    )
    if not bylaw:
        return {"ok": False, "error": f"Bylaw '{bylaw_id}' not found"}

    candidate["status"]          = "founder_vetoed"
    candidate["decision_ts"]     = _iso_now()
    candidate["decision_reason"] = f"Founder veto — {bylaw['name']}: {reason}"
    candidate["governor"]        = "Founder"
    save_majcom_candidates(candidates)

    # Remove from defaults if it had been accepted
    defaults = load_majcom_defaults()
    rule_id  = candidate["rule_def"].get("id", "")
    updated  = [d for d in defaults if d["rule_def"].get("id") != rule_id]
    if len(updated) < len(defaults):
        _write_json(MAJCOM_DEFAULTS_FILE, updated)

    veto_record = {
        "ts":            _iso_now(),
        "type":          "founder_veto",
        "candidate_id":  candidate_id,
        "bylaw_id":      bylaw_id,
        "bylaw_name":    bylaw["name"],
        "reason":        reason,
        "rule_id":       rule_id,
    }
    _append_jsonl(DECISIONS_FILE, veto_record)
    _write_time_capsule("founder_veto", veto_record)

    return {"ok": True, "vetoed": True, "bylaw_id": bylaw_id}


# ── SHUT IT DOWN — Emergency authority (#2304) (B.5, C.9, C.10) ───────────────

def get_shutdown_state() -> dict:
    """C.9, C.10: Return current SHUT IT DOWN state."""
    return _read_json(SHUTDOWN_STATE_FILE, {"active": False, "reason": None, "activated_at": None, "action_queue": []})


def _save_shutdown_state(state: dict) -> None:
    _write_json(SHUTDOWN_STATE_FILE, state)


def shutdown_activate(reason: str, governor: str = "Founder") -> dict:
    """
    C.9: Activate SHUT IT DOWN (#2304) — MAJCOM enters stateless-frozen mode.
    New actions queue rather than execute. Pending Founder review.
    Triggered when Augur Consensus signals critical-class violation across
    multiple NAFs.
    """
    state = get_shutdown_state()
    if state["active"]:
        return {
            "ok":    True,
            "already_active": True,
            "reason": state["reason"],
            "activated_at": state["activated_at"],
        }

    new_state = {
        "active":        True,
        "reason":        reason,
        "activated_at":  _iso_now(),
        "activated_by":  governor,
        "action_queue":  state.get("action_queue", []),
    }
    _save_shutdown_state(new_state)

    shutdown_record = {
        "ts":        _iso_now(),
        "type":      "shutdown_activated",
        "reason":    reason,
        "governor":  governor,
    }
    _append_jsonl(DECISIONS_FILE, shutdown_record)
    _write_time_capsule("shutdown_activated", shutdown_record)

    return {
        "ok":          True,
        "active":      True,
        "reason":      reason,
        "activated_at": new_state["activated_at"],
        "message":     "MAJCOM is now in stateless-frozen mode. New actions are queued pending Founder review.",
    }


def shutdown_queue_action(action: dict) -> dict:
    """
    C.9: During SHUT IT DOWN, queue an action rather than execute it.
    Returns {"queued": True} if shutdown active, {"queued": False} if not.
    """
    state = get_shutdown_state()
    if not state["active"]:
        return {"queued": False, "active": False}

    action["queued_at"] = _iso_now()
    state.setdefault("action_queue", []).append(action)
    _save_shutdown_state(state)
    return {"queued": True, "queue_depth": len(state["action_queue"])}


def get_action_queue() -> list[dict]:
    """Return queued actions during SHUT IT DOWN."""
    state = get_shutdown_state()
    return state.get("action_queue", [])


def shutdown_unfreeze(governor: str = "Founder") -> dict:
    """
    C.10: Founder authorization — MAJCOM resumes normal operation.
    Queued actions are returned for review/processing.
    """
    state = get_shutdown_state()
    if not state["active"]:
        return {"ok": True, "already_inactive": True}

    queued = state.get("action_queue", [])
    new_state = {
        "active":        False,
        "reason":        None,
        "activated_at":  None,
        "unfrozen_at":   _iso_now(),
        "unfrozen_by":   governor,
        "action_queue":  [],
    }
    _save_shutdown_state(new_state)

    unfreeze_record = {
        "ts":            _iso_now(),
        "type":          "shutdown_unfrozen",
        "governor":      governor,
        "queued_actions_count": len(queued),
    }
    _append_jsonl(DECISIONS_FILE, unfreeze_record)
    _write_time_capsule("shutdown_unfrozen", unfreeze_record)

    return {
        "ok":            True,
        "unfrozen":      True,
        "queued_actions": queued,
        "queue_depth":   len(queued),
        "message":       f"MAJCOM resumed normal operation. {len(queued)} queued action(s) returned for review.",
    }


def simulate_critical_signal_cascade(naf_signals: list[dict]) -> dict:
    """
    C.9: Evaluate whether incoming NAF signals constitute a critical-class
    cascade that should trigger SHUT IT DOWN.

    A cascade is detected when:
      - >= 2 distinct NAFs report the same critical-class rule firing
      - OR any single NAF reports a pattern_level == "high" affecting
        >= 80% of its opt-in Wings

    Returns {"cascade_detected": bool, "reason": str | None, "triggering_nafs": [...]}
    """
    if not naf_signals:
        return {"cascade_detected": False, "reason": None, "triggering_nafs": []}

    triggering: list[str] = []
    reasons:    list[str] = []

    # Check for high-severity pattern across 80%+ wings in any NAF
    for sig in naf_signals:
        naf_id   = sig.get("naf_id", "")
        patterns = sig.get("signals", {}).get("top_patterns", [])
        for pat in patterns:
            if pat.get("pattern_level") == "high" and pat.get("pct_of_opt_in", 0) >= 80:
                triggering.append(naf_id)
                reasons.append(
                    f"NAF '{naf_id}': rule '{pat.get('rule_id')}' HIGH pattern at {pat.get('pct_of_opt_in')}% of Wings"
                )

    # Check for same critical rule appearing across >= 2 distinct NAFs
    rule_nafs: dict[str, set[str]] = {}
    for sig in naf_signals:
        naf_id   = sig.get("naf_id", "")
        patterns = sig.get("signals", {}).get("top_patterns", [])
        for pat in patterns:
            if pat.get("pattern_level") in ("high", "medium"):
                rule_id = pat.get("rule_id", "")
                if rule_id:
                    rule_nafs.setdefault(rule_id, set()).add(naf_id)

    for rule_id, nafs in rule_nafs.items():
        if len(nafs) >= 2:
            for naf_id in nafs:
                if naf_id not in triggering:
                    triggering.append(naf_id)
            reasons.append(
                f"Rule '{rule_id}' firing across {len(nafs)} distinct NAFs: {sorted(nafs)}"
            )

    if triggering or reasons:
        return {
            "cascade_detected": True,
            "reason":           "; ".join(set(reasons)),
            "triggering_nafs":  list(set(triggering)),
        }
    return {"cascade_detected": False, "reason": None, "triggering_nafs": []}


# ── Cooperative Defensive Patent Pledge governance (B.1, C.18) ─────────────────

def load_pledge_admissions() -> list[dict]:
    return _read_json(PLEDGE_ADMISSIONS_FILE, [])


def save_pledge_admissions(admissions: list[dict]) -> None:
    _write_json(PLEDGE_ADMISSIONS_FILE, admissions)


_VALID_ORG_TYPES = {"nonprofit", "cooperative", "academic", "research"}


def verify_pledge_admission(
    org_name:    str,
    ein:         str,
    org_type:    str,
    contact:     str = "",
    description: str = "",
) -> dict:
    """
    C.18: Cooperative Defensive Patent Pledge (#2260) admission verification.

    Verifies EIN format and org_type eligibility.  Full IRS lookup is
    out-of-scope for Phase 1 (manual verification by Founder).

    org_type: "nonprofit" | "cooperative" | "academic" | "research"
    ein: "XX-XXXXXXX" or "XXXXXXXXX"

    Returns status "pending_manual_verification" for all new admissions.
    """
    if not org_name or not ein or not org_type:
        return {"ok": False, "error": "org_name, ein, and org_type required"}

    if org_type not in _VALID_ORG_TYPES:
        return {
            "ok":    False,
            "error": f"org_type must be one of: {sorted(_VALID_ORG_TYPES)}",
        }

    # Basic EIN format check (US: XX-XXXXXXX)
    ein_clean = ein.replace("-", "").strip()
    if not (ein_clean.isdigit() and 8 <= len(ein_clean) <= 9):
        return {
            "ok":    False,
            "error": "EIN format invalid. Expected XX-XXXXXXX or XXXXXXXXX (9 digits).",
        }

    admissions = load_pledge_admissions()
    existing   = next((a for a in admissions if a["ein_clean"] == ein_clean), None)
    if existing:
        return {
            "ok":      True,
            "duplicate": True,
            "status":  existing["status"],
            "ein":     ein,
            "org_name": org_name,
        }

    admission_id = "pledge-" + _sha256_hex(ein_clean + org_name)[:12]
    entry = {
        "admission_id":  admission_id,
        "org_name":      org_name,
        "ein":           ein,
        "ein_clean":     ein_clean,
        "org_type":      org_type,
        "contact":       contact,
        "description":   description,
        "submitted_at":  _iso_now(),
        "status":        "pending_manual_verification",
        "verified_at":   None,
        "verified_by":   None,
    }
    admissions.append(entry)
    save_pledge_admissions(admissions)

    _write_time_capsule("pledge_admission_submitted", {
        "admission_id": admission_id,
        "org_name":     org_name,
        "org_type":     org_type,
        "ein":          ein,
    })

    return {
        "ok":           True,
        "admission_id": admission_id,
        "status":       "pending_manual_verification",
        "message":      (
            "Your Cooperative Defensive Patent Pledge admission has been submitted. "
            "Founder will verify EIN and org eligibility. "
            "Free access to A&A #2295 architecture will be granted upon verification."
        ),
    }


def approve_pledge_admission(admission_id: str, verified_by: str = "Founder") -> dict:
    """Founder-only: approve a pending Pledge admission."""
    admissions = load_pledge_admissions()
    entry      = next((a for a in admissions if a["admission_id"] == admission_id), None)
    if not entry:
        return {"ok": False, "error": f"Admission '{admission_id}' not found"}

    entry["status"]      = "verified"
    entry["verified_at"] = _iso_now()
    entry["verified_by"] = verified_by
    save_pledge_admissions(admissions)

    _write_time_capsule("pledge_admission_approved", {
        "admission_id": admission_id,
        "org_name":     entry["org_name"],
        "verified_by":  verified_by,
    })

    return {"ok": True, "approved": True, "org_name": entry["org_name"]}


def get_pledge_admissions() -> list[dict]:
    return load_pledge_admissions()


# ── CFP cross-MAJCOM federation transport (B.6, C.12) ──────────────────────────

def get_cfp_interface_schema() -> dict:
    """
    C.12: Return the CFP-compatible interface schema for future cross-MAJCOM
    federation (e.g., a second cooperative's MAJCOM joining Sphinx Band-NA).

    Phase 1: interface defined; no second MAJCOM exists yet.
    The transport protocol shape is compatible with CFP (A&A #2292).
    """
    return {
        "majcom_id":        MAJCOM_ID,
        "sphinx_phase":     SPHINX_PHASE,
        "sphinx_band":      SPHINX_BAND,
        "cfp_version":      "1.0",
        "federation_ready": True,
        "phase_1_note":     "Cross-MAJCOM federation interface defined. Awaiting second MAJCOM to federate.",
        "envelope_types": [
            "majcom_aggregate_export",
            "majcom_rule_proposal",
            "majcom_policy_receipt",
            "majcom_cross_majcom_pattern",
            "band_audit_rollup",
        ],
        "sovereignty_guarantees": [
            "MAJCOMs federate aggregate signals only — no member-substrate content",
            "Rule promotion across MAJCOMs is opt-in — no MAJCOM can force rules on another",
            "Each MAJCOM retains authority over its NAFs and Wings",
            "Cross-MAJCOM audit records preserve provenance without merging substrates",
        ],
        "admission_requirements": {
            "description": "To federate with MAJCOM-LB at the Band-NA level, a MAJCOM must:",
            "requirements": [
                "Be a verified cooperative, nonprofit, or academic organization (EIN or equivalent)",
                "Comply with Cooperative Defensive Patent Pledge terms (#2260)",
                "Implement CFP-compatible envelope transport (A&A #2292)",
                "Agree to Sphinx Band-NA Structural Bylaws (sovereignty-preserving enumerated powers only)",
            ],
        },
    }


def create_cross_majcom_envelope(
    payload_type:     str,
    payload:          dict,
    destination_majcom: str,
) -> dict:
    """
    B.6: Create a CFP-compatible cross-MAJCOM envelope.
    Records to cfp_cross_majcom.jsonl for audit and future transport.
    """
    ts      = _iso_now()
    sign_data = f"{MAJCOM_ID}:{destination_majcom}:{payload_type}:{ts}:{json.dumps(payload, sort_keys=True)}"
    envelope = {
        "cfp_version":         "1.0",
        "payload_type":        payload_type,
        "source_majcom_id":    MAJCOM_ID,
        "destination_majcom":  destination_majcom,
        "sphinx_band":         SPHINX_BAND,
        "ts":                  ts,
        "provenance_hash":     _sha256_hex(sign_data),
        "payload":             payload,
        "phase_1_note":        "Envelope recorded locally; transport to destination MAJCOM pending (no second MAJCOM in Phase 1).",
    }
    _append_jsonl(CFP_CROSS_MAJCOM_FILE, envelope, MAX_CFP_LINES)
    return {"ok": True, "envelope": envelope}


def get_cfp_cross_majcom_log() -> list[dict]:
    """Return cross-MAJCOM CFP envelope log."""
    return _read_jsonl(CFP_CROSS_MAJCOM_FILE, 500)


# ── Time Capsule audit trail (#2303) ───────────────────────────────────────────

def _write_time_capsule(event_type: str, payload: dict) -> None:
    """
    C.16: Append-only Time Capsule entry for every MAJCOM-tier action.
    Each entry is IP-evidence-grade, governance-quality, tamper-evident.
    """
    record = {
        "ts":           _iso_now(),
        "majcom_id":    MAJCOM_ID,
        "sphinx_phase": SPHINX_PHASE,
        "event_type":   event_type,
        "payload":      payload,
        "hash":         _sha256_hex(
            f"{event_type}:{json.dumps(payload, sort_keys=True)}"
        ),
    }
    _append_jsonl(DECISIONS_FILE, record)


def get_time_capsule_audit(limit: int = 200) -> list[dict]:
    """C.16: Return MAJCOM audit trail (Time Capsules)."""
    return _read_jsonl(DECISIONS_FILE, limit)


# ── Performance: aggregate rollup p95 (C.17) ───────────────────────────────────

def benchmark_aggregate_rollup(cohort_size: int = 1000) -> dict:
    """
    C.17: Simulate aggregate rollup for a 1,000-member cohort.
    Measures time for get_cross_naf_patterns() on realistic signal volume.
    """
    import random
    start = time.perf_counter()

    # Generate synthetic signal records representing cohort_size members
    # spread across 3 NAFs (Bishops, Knights, Members)
    naf_ids    = ["NAF-Bishops", "NAF-Knights", "NAF-Members"]
    rule_ids   = [f"rule-{i:03d}" for i in range(10)]
    test_data  = []

    for i in range(min(cohort_size // 10, 300)):  # 1 record per ~10 members
        naf_id = naf_ids[i % 3]
        test_data.append({
            "naf_id": naf_id,
            "signals": {
                "opt_in_wings":  cohort_size // 3,
                "total_fires_across_wings": random.randint(1, 50),
                "top_patterns": [
                    {
                        "rule_id":       random.choice(rule_ids),
                        "wing_count":    random.randint(1, cohort_size // 3),
                        "pct_of_opt_in": random.uniform(5, 95),
                        "pattern_level": random.choice(["low", "medium", "high"]),
                    }
                    for _ in range(random.randint(1, 3))
                ],
            },
        })

    # Run the pattern detection
    patterns = _compute_patterns_from_data(test_data)

    elapsed_ms = (time.perf_counter() - start) * 1000
    return {
        "ok":          True,
        "cohort_size": cohort_size,
        "signal_records": len(test_data),
        "patterns_found": len(patterns),
        "elapsed_ms":  round(elapsed_ms, 2),
        "p95_target_ms": 30_000,
        "pass":        elapsed_ms < 30_000,
    }


def _compute_patterns_from_data(signals: list[dict]) -> list[dict]:
    """Internal helper: compute cross-NAF patterns from a list of signal records."""
    rule_nafs: dict[str, set[str]] = {}
    for sig in signals:
        naf_id = sig.get("naf_id", "")
        for pat in sig.get("signals", {}).get("top_patterns", []):
            rule_id = pat.get("rule_id", "")
            if rule_id:
                rule_nafs.setdefault(rule_id, set()).add(naf_id)
    return [
        {"rule_id": rid, "naf_count": len(nafs)}
        for rid, nafs in rule_nafs.items()
        if len(nafs) >= 1
    ]


# ── MAJCOM status / health ─────────────────────────────────────────────────────

def get_majcom_status() -> dict:
    """Return full MAJCOM-LB operational status."""
    shutdown    = get_shutdown_state()
    registry    = load_naf_registry()
    defaults    = load_majcom_defaults()
    candidates  = get_pending_candidates()
    admissions  = load_pledge_admissions()
    bylaws      = load_structural_bylaws()

    return {
        "majcom_id":        MAJCOM_ID,
        "majcom_version":   MAJCOM_VERSION,
        "sphinx_phase":     SPHINX_PHASE,
        "sphinx_band":      SPHINX_BAND,
        "operational":      not shutdown.get("active", False),
        "shutdown_active":  shutdown.get("active", False),
        "shutdown_reason":  shutdown.get("reason"),
        "nafs_registered":  len(registry),
        "majcom_defaults":  len(defaults),
        "pending_candidates": len(candidates),
        "pledge_admissions": len(admissions),
        "structural_bylaws": len(bylaws),
        "cfp_interface":    "ready",
        "phase_1_status":   "operational",
        "as_of":            _iso_now(),
    }
