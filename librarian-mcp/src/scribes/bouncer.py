"""
Bouncer Scribe — KN095 / BP011
================================
First-line, low-cost, fast-pass override for Augur Living Gate false-positives.

Architecture:
  Bouncer fires AFTER an Augur BLOCK verdict, BEFORE Scales engages.
  Decision time target: <10ms.
  Bouncer is FAIL-CLOSED: unknown patterns route to Scales, never auto-pass.

Verdicts:
  PASS_OVERRIDE — safe-pattern matched; Augur block overridden; write proceeds.
  ROUTE_TO_SCALES — no pattern matched; escalate to Scales weigher.

Logging: all verdicts logged to scribe-id "Bouncer" via Pheromone-Anchored
Decisions (KN050 schema) stored in ~/.claude/state/federation/ substrate.

BRIDLE discipline: trust-but-verify each pattern; Bouncer cannot block,
cannot decide ambiguous cases, cannot override Founder-direct rules.

KN095 / BP011 — Founder-ratified 2026-05-01.
"""

from __future__ import annotations

import json
import os
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional

import yaml

# ── Paths ──────────────────────────────────────────────────────────────────

_SCRIPT_DIR = Path(__file__).parent
_SAFE_PATTERNS_PATH = _SCRIPT_DIR / "bouncer_safe_patterns_v1.yaml"
_BOUNCER_LOG_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/bouncer_verdicts.jsonl"
))


# ── Verdict types ──────────────────────────────────────────────────────────

class BouncerVerdict(str, Enum):
    PASS_OVERRIDE = "PASS_OVERRIDE"       # Augur block rejected; write proceeds
    ROUTE_TO_SCALES = "ROUTE_TO_SCALES"  # No safe-pattern matched; escalate


@dataclass
class BouncerResult:
    verdict: BouncerVerdict
    matched_pattern_id: Optional[str] = None
    rationale: str = ""
    case_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    decided_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ── Registry loading ───────────────────────────────────────────────────────

def _load_safe_patterns(path: Optional[Path] = None) -> list[dict]:
    """Load and return the list of safe patterns from YAML registry."""
    p = path or _SAFE_PATTERNS_PATH
    if not p.exists():
        return []
    with open(p, encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    return data.get("safe_patterns", [])


# ── Pattern matchers ───────────────────────────────────────────────────────

def _match_regex(content: str, pattern_str: str) -> bool:
    try:
        return bool(re.search(pattern_str, content, re.IGNORECASE | re.DOTALL))
    except re.error:
        return False


def _match_quotation_framing(content: str, markers: list[str]) -> bool:
    return any(marker.lower() in content.lower() for marker in markers)


def _match_scribe_id_prefix(scribe_id: str, prefixes: list[str]) -> bool:
    return any(scribe_id.startswith(p) for p in prefixes)


def _match_file_class(eblet_path: str, additional_condition: str) -> bool:
    """
    additional_condition is of the form "file_class:<prefix>".
    Returns True if eblet_path contains the prefix.
    """
    if not additional_condition.startswith("file_class:"):
        return True  # No additional constraint; pass through.
    class_prefix = additional_condition.removeprefix("file_class:").strip()
    return class_prefix.lower() in eblet_path.lower()


def _check_pattern(
    pattern: dict,
    content: str,
    eblet_path: str,
    scribe_id: str,
) -> bool:
    """Return True if this safe pattern matches the write attempt."""
    pattern_type = pattern.get("type", "")

    if pattern_type == "regex":
        regex_str = pattern.get("pattern", "")
        return _match_regex(content, regex_str)

    elif pattern_type == "quotation_framing":
        markers = pattern.get("match_markers", [])
        return _match_quotation_framing(content, markers)

    elif pattern_type == "scribe_id_prefix":
        prefixes = pattern.get("scribe_id_prefixes", [])
        if not _match_scribe_id_prefix(scribe_id, prefixes):
            return False
        additional = pattern.get("additional_condition", "")
        if additional:
            return _match_file_class(eblet_path, additional)
        return True

    elif pattern_type == "file_class":
        prefixes = pattern.get("match_prefixes", [])
        return any(p.lower() in eblet_path.lower() for p in prefixes)

    return False


# ── Logging ────────────────────────────────────────────────────────────────

def _log_verdict(result: BouncerResult, eblet_path: str, log_path: Optional[Path] = None) -> None:
    """Append Bouncer verdict to JSONL log (Pheromone-Anchored Decision substrate)."""
    path = log_path or _BOUNCER_LOG_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "case_id": result.case_id,
        "scribe_id": "Bouncer",
        "eblet_path": eblet_path,
        "verdict": result.verdict.value,
        "matched_pattern_id": result.matched_pattern_id,
        "rationale": result.rationale,
        "decided_at": result.decided_at,
    }
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


# ── Public API ─────────────────────────────────────────────────────────────

def bounce(
    content: str,
    eblet_path: str,
    scribe_id: str = "",
    patterns_path: Optional[Path] = None,
    log_path: Optional[Path] = None,
) -> BouncerResult:
    """
    Evaluate a blocked write attempt against the safe-pattern registry.

    Args:
        content:     Full text content of the write attempt.
        eblet_path:  Destination path of the write.
        scribe_id:   ID of the writing organism (e.g., "Bishop", "R11_shadow_alpha").
        patterns_path: Override path for safe patterns YAML (default: bundled v1).
        log_path:    Override path for verdict log.

    Returns:
        BouncerResult with verdict PASS_OVERRIDE or ROUTE_TO_SCALES.
    """
    patterns = _load_safe_patterns(patterns_path)

    for pattern in patterns:
        if _check_pattern(pattern, content, eblet_path, scribe_id):
            result = BouncerResult(
                verdict=BouncerVerdict.PASS_OVERRIDE,
                matched_pattern_id=pattern.get("id", "unknown"),
                rationale=(
                    f"Safe-pattern '{pattern.get('id')}' matched. "
                    f"{pattern.get('description', '')} "
                    f"Rationale: {pattern.get('rationale', '')}"
                ),
            )
            _log_verdict(result, eblet_path, log_path)
            return result

    # No pattern matched — fail-closed: route to Scales.
    result = BouncerResult(
        verdict=BouncerVerdict.ROUTE_TO_SCALES,
        rationale="No safe-pattern matched. Routing to Scales for criteria-weighted evaluation.",
    )
    _log_verdict(result, eblet_path, log_path)
    return result
