"""
Wing Host — Helm PWA Wing Engine (K518 / A&A #2295 Tier 3)

Python port of the LB Frame extension's discipline_engine.js evaluate() function.
Runs inside the Helm PWA daemon, evaluating member-installed Augur rules against
queries BEFORE they are submitted to vendor APIs.

Rule storage: ~/.lb-helm/wing_state/rules.json
Telemetry:    ~/.lb-helm/wing_state/telemetry.jsonl

Rules are synced from the Frame extension via the /wing/rules REST endpoint
(GET to read, POST to write). Cross-device wings are independent; no conflict.

Architecture (K518 / B126):
  - Member installs Frame extension → rules stored in chrome.storage.local
  - Member also runs Helm PWA → rules synced to ~/.lb-helm/wing_state/rules.json
  - Helm daemon evaluates rules via this module before /pawn or /enrich calls
  - Telemetry is append-only local JSON Lines — never transmitted without consent

Fail-safe: any internal error → allow (never block legitimate Helm queries).
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any

# ── Storage paths ──────────────────────────────────────────────────────────────

WING_STATE_DIR  = Path(os.path.expanduser("~/.lb-helm/wing_state"))
RULES_FILE      = WING_STATE_DIR / "rules.json"
TELEMETRY_FILE  = WING_STATE_DIR / "telemetry.jsonl"
CONSULT_FILE    = WING_STATE_DIR / "consult_state.json"
WING_PREFS_FILE = WING_STATE_DIR / "wing_prefs.json"

MAX_TELEMETRY_LINES = 1000

# ── Five starter Augurs (mirrored from discipline_engine.js) ──────────────────

STARTER_RULES: list[dict] = [
    {
        "id": "starter-cite-source",
        "name": "Warn before unverified factual claims",
        "trigger": {"type": "ai_query_keywords", "patterns": [
            "research shows", "studies show", "data shows", "statistics",
            "proven", "scientifically",
        ]},
        "required_consult": {"source": "cathedral", "domain": None, "freshness_seconds": 3600},
        "failure_action": "warn",
        "block_message": "Heads up: no substrate consulted recently for factual claims. Consider verifying first.",
        "enabled": True,
        "scope": "personal",
    },
    {
        "id": "starter-no-medical",
        "name": "Block medical advice without substrate",
        "trigger": {"type": "ai_query_keywords", "patterns": [
            "diagnosis", "treatment", "medication", "symptoms",
            "medical advice", "should I take", "is it safe to",
        ]},
        "required_consult": {"source": "member_substrate", "domain": "health", "freshness_seconds": 86400},
        "failure_action": "block",
        "block_message": "Medical advice requires your health substrate to be consulted first.",
        "enabled": True,
        "scope": "personal",
    },
    {
        "id": "starter-financial-gate",
        "name": "Warn on financial/investment queries",
        "trigger": {"type": "ai_query_keywords", "patterns": [
            "invest", "stocks", "crypto", "financial advice",
            "portfolio", "returns", "yield", "hedge fund",
        ]},
        "required_consult": {"source": "member_substrate", "domain": "finance", "freshness_seconds": 86400},
        "failure_action": "warn",
        "block_message": "Financial queries benefit from consulting your finance substrate first.",
        "enabled": True,
        "scope": "personal",
    },
    {
        "id": "starter-projects-enrich",
        "name": "Auto-enrich queries about my projects",
        "trigger": {"type": "ai_query_keywords", "patterns": [
            "my project", "my platform", "our system", "our product",
            "my app", "my startup", "my business",
        ]},
        "required_consult": {"source": "cathedral", "domain": None, "freshness_seconds": 600},
        "failure_action": "enrich",
        "block_message": "",
        "enabled": True,
        "scope": "personal",
    },
    {
        "id": "starter-lb-facts",
        "name": "Enrich Liana Banyan platform queries with cathedral",
        "trigger": {"type": "ai_query_keywords", "patterns": [
            "liana banyan", "83.3%", "creator percentage",
            "$5 membership", "romulator", "cathedral effect",
            "marks joules credits",
        ]},
        "required_consult": {"source": "cathedral", "domain": None, "freshness_seconds": 7200},
        "failure_action": "enrich",
        "block_message": "",
        "enabled": True,
        "scope": "personal",
    },
]


# ── Storage helpers ────────────────────────────────────────────────────────────

def _ensure_dir() -> None:
    WING_STATE_DIR.mkdir(parents=True, exist_ok=True)


def load_rules() -> list[dict]:
    try:
        text = RULES_FILE.read_text(encoding="utf-8")
        return json.loads(text)
    except FileNotFoundError:
        return []
    except Exception:
        return []


def save_rules(rules: list[dict]) -> None:
    _ensure_dir()
    RULES_FILE.write_text(json.dumps(rules, indent=2, ensure_ascii=False), encoding="utf-8")


def load_prefs() -> dict:
    try:
        return json.loads(WING_PREFS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {"wing_enabled": True}


def save_prefs(prefs: dict) -> None:
    _ensure_dir()
    WING_PREFS_FILE.write_text(json.dumps(prefs, indent=2), encoding="utf-8")


def load_consult_state() -> dict:
    try:
        return json.loads(CONSULT_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_consult_state(state: dict) -> None:
    _ensure_dir()
    CONSULT_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


# ── Consult freshness ──────────────────────────────────────────────────────────

def _is_consult_fresh(required_consult: dict) -> bool:
    source = required_consult.get("source", "cathedral")
    domain = required_consult.get("domain")
    freshness = required_consult.get("freshness_seconds", 3600)
    key = f"{source}:{domain}" if domain else source
    state = load_consult_state()
    last_ts = state.get(key, 0)
    stale_sec = (time.time() - last_ts)
    return stale_sec <= freshness


def mark_consulted(source: str = "cathedral", domain: str | None = None) -> None:
    key = f"{source}:{domain}" if domain else source
    state = load_consult_state()
    state[key] = time.time()
    save_consult_state(state)


# ── Rule trigger evaluation ────────────────────────────────────────────────────

def _rule_triggered(rule: dict, query_text: str) -> bool:
    patterns = rule.get("trigger", {}).get("patterns", [])
    lower = query_text.lower()
    return any(p.lower() in lower for p in patterns)


# ── Telemetry ──────────────────────────────────────────────────────────────────

def _append_telemetry(record: dict) -> None:
    try:
        _ensure_dir()
        with open(TELEMETRY_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
        # Trim to MAX_TELEMETRY_LINES
        _trim_telemetry()
    except Exception:
        pass  # Telemetry failure must never break the Wing


def _trim_telemetry() -> None:
    try:
        lines = TELEMETRY_FILE.read_text(encoding="utf-8").splitlines()
        if len(lines) > MAX_TELEMETRY_LINES:
            keep = lines[-MAX_TELEMETRY_LINES:]
            TELEMETRY_FILE.write_text("\n".join(keep) + "\n", encoding="utf-8")
    except Exception:
        pass


def load_telemetry(limit: int = 100) -> list[dict]:
    try:
        lines = TELEMETRY_FILE.read_text(encoding="utf-8").splitlines()
        records = []
        for line in reversed(lines[-limit:]):
            try:
                records.append(json.loads(line))
            except Exception:
                pass
        return records
    except Exception:
        return []


# ── Wing evaluation entry point ────────────────────────────────────────────────

def evaluate(query_text: str) -> dict:
    """
    Evaluate all active Wing rules against a query.

    Priority: block > warn > enrich > allow
    Fail-safe: any internal error → allow.

    Returns:
        {
          "action": "allow" | "warn" | "block" | "enrich",
          "rule": {...} | None,
          "message": str,
          "trace": [...],
          "wing_disabled": bool,
          "elapsed_ms": int,
        }
    """
    t0 = time.monotonic()

    try:
        prefs = load_prefs()
        if not prefs.get("wing_enabled", True):
            return {
                "action": "allow",
                "rule": None,
                "message": "",
                "trace": [],
                "wing_disabled": True,
                "elapsed_ms": 0,
            }

        rules = load_rules()
        active = [r for r in rules if r.get("enabled", True)]

        if not active:
            return {
                "action": "allow",
                "rule": None,
                "message": "No active Wing rules.",
                "trace": [],
                "wing_disabled": False,
                "elapsed_ms": int((time.monotonic() - t0) * 1000),
            }

        trace = []
        block_rule = None
        warn_rule = None
        enrich_rule = None

        for rule in active:
            triggered = _rule_triggered(rule, query_text)
            if not triggered:
                trace.append({"rule_id": rule.get("id"), "triggered": False, "action": "skip"})
                continue

            fresh = _is_consult_fresh(rule.get("required_consult", {}))
            effective = "allow" if fresh else rule.get("failure_action", "warn")

            trace.append({
                "rule_id": rule.get("id"),
                "rule_name": rule.get("name"),
                "triggered": True,
                "consult_fresh": fresh,
                "action": effective,
            })

            _append_telemetry({
                "ts": _iso_now(),
                "rule_id": rule.get("id"),
                "rule_name": rule.get("name"),
                "action": effective,
                "query_snippet": query_text[:80],
            })

            if effective == "block" and not block_rule:
                block_rule = rule
            if effective == "warn" and not warn_rule:
                warn_rule = rule
            if effective == "enrich" and not enrich_rule:
                enrich_rule = rule

        elapsed = int((time.monotonic() - t0) * 1000)

        if block_rule:
            return {
                "action": "block",
                "rule": block_rule,
                "message": block_rule.get("block_message") or f"Blocked by Wing rule: \"{block_rule.get('name')}\"",
                "trace": trace,
                "wing_disabled": False,
                "elapsed_ms": elapsed,
            }
        if warn_rule:
            return {
                "action": "warn",
                "rule": warn_rule,
                "message": warn_rule.get("block_message") or f"Wing rule \"{warn_rule.get('name')}\" recommends consulting your substrate first.",
                "trace": trace,
                "wing_disabled": False,
                "elapsed_ms": elapsed,
            }
        if enrich_rule:
            return {
                "action": "enrich",
                "rule": enrich_rule,
                "message": "",
                "trace": trace,
                "wing_disabled": False,
                "elapsed_ms": elapsed,
            }

        return {
            "action": "allow",
            "rule": None,
            "message": "",
            "trace": trace,
            "wing_disabled": False,
            "elapsed_ms": elapsed,
        }

    except Exception as exc:
        return {
            "action": "allow",
            "rule": None,
            "message": "",
            "trace": [{"error": str(exc)}],
            "wing_disabled": False,
            "elapsed_ms": int((time.monotonic() - t0) * 1000),
            "engine_error": str(exc),
        }


# ── Export / import ────────────────────────────────────────────────────────────

def export_wing() -> dict:
    """Export all rules + recent telemetry as a portable dict."""
    rules = load_rules()
    telemetry = load_telemetry(limit=MAX_TELEMETRY_LINES)
    prefs = load_prefs()
    return {
        "lb_wing_export": True,
        "version": "1.0",
        "exported_at": _iso_now(),
        "source": "helm_pwa",
        "prefs": prefs,
        "rules": rules,
        "telemetry": telemetry,
    }


def import_wing(data: dict) -> dict:
    """Import rules from a portable export dict. Merges (upsert by rule id)."""
    if not isinstance(data, dict) or not data.get("lb_wing_export"):
        return {"ok": False, "error": "Not a valid Wing export file."}

    incoming_rules = data.get("rules", [])
    if not isinstance(incoming_rules, list):
        return {"ok": False, "error": "Invalid rules format."}

    existing = load_rules()
    existing_by_id = {r.get("id"): r for r in existing}

    imported_count = 0
    for rule in incoming_rules:
        rid = rule.get("id")
        if rid:
            existing_by_id[rid] = rule
            imported_count += 1

    save_rules(list(existing_by_id.values()))
    return {"ok": True, "imported_count": imported_count}


def install_starter_augurs(starter_ids: list[str] | None = None) -> dict:
    """Install starter Augurs by id. If starter_ids is None, installs all 5."""
    existing = load_rules()
    existing_ids = {r.get("id") for r in existing}

    to_install = STARTER_RULES if starter_ids is None else [
        s for s in STARTER_RULES if s["id"] in starter_ids
    ]

    added = 0
    for rule in to_install:
        if rule["id"] not in existing_ids:
            existing.append({**rule, "created_at": _iso_now()})
            added += 1

    save_rules(existing)
    return {"ok": True, "added": added, "already_installed": len(to_install) - added}


def get_dashboard() -> dict:
    """Summary stats for the Wing dashboard UI."""
    rules = load_rules()
    prefs = load_prefs()
    telemetry = load_telemetry(limit=MAX_TELEMETRY_LINES)

    total_fires = sum(1 for t in telemetry if t.get("action") in ("block", "warn", "enrich"))
    recent = [t for t in telemetry[:50]]  # most recent 50

    per_rule: dict[str, int] = {}
    for t in telemetry:
        rid = t.get("rule_id", "unknown")
        per_rule[rid] = per_rule.get(rid, 0) + 1

    return {
        "wing_enabled": prefs.get("wing_enabled", True),
        "rules_count": len(rules),
        "active_rules_count": sum(1 for r in rules if r.get("enabled", True)),
        "total_fires": total_fires,
        "per_rule_fires": per_rule,
        "recent_events": recent,
        "source": "helm_pwa",
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"
