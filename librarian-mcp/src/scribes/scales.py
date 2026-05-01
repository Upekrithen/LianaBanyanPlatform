"""
Scales Scribe — KN095 / BP011
================================
Criteria-weighted judging scribe. Decides if an Augur block is a REAL problem.

Architecture:
  Scales fires when Bouncer routes ROUTE_TO_SCALES.
  Evaluates write attempt against the criteria set in scales_criteria_v1.yaml.
  Produces weighted verdict using per-criterion pro-pass / pro-block signals.

Verdicts:
  PASS   — weighted score > 0.6; write proceeds; criteria+weights logged.
  BLOCK  — weighted score < 0.4; write rejected; Founder can appeal to Judge.
  JUDGE  — 0.4 ≤ score ≤ 0.6; escalate to Judge appellate.

Mandatory escalation: SAA Howey-test posture pro-block OR Crown Letter context
with ambiguity → always escalate to Judge regardless of score.

Logging: full criteria-weights verdict logged as Pheromone-Anchored Decision
(KN050) to scribe-id "Scales". Every verdict is auditable.

BRIDLE discipline: Scales cannot override Founder-direct rules. Every verdict
carries a full reasoning trail. Founder can appeal any BLOCK to Judge.

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
_CRITERIA_PATH = _SCRIPT_DIR / "scales_criteria_v1.yaml"
_SCALES_LOG_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/scales_verdicts.jsonl"
))


# ── Verdict types ──────────────────────────────────────────────────────────

class ScalesVerdict(str, Enum):
    PASS = "PASS"    # Score > 0.6; write proceeds
    BLOCK = "BLOCK"  # Score < 0.4; write rejected
    JUDGE = "JUDGE"  # 0.4 ≤ score ≤ 0.6; escalate to Judge


@dataclass
class CriterionEvaluation:
    criterion_id: str
    label: str
    weight_numeric: float
    signal: float          # -1.0 (pro-block) to +1.0 (pro-pass)
    reasoning: str


@dataclass
class ScalesResult:
    verdict: ScalesVerdict
    score: float
    criterion_evaluations: list[CriterionEvaluation] = field(default_factory=list)
    mandatory_escalation_reason: Optional[str] = None
    case_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    decided_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ── Config loading ─────────────────────────────────────────────────────────

def _load_criteria(path: Optional[Path] = None) -> dict:
    p = path or _CRITERIA_PATH
    if not p.exists():
        return {}
    with open(p, encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


# ── Criterion evaluators ───────────────────────────────────────────────────

def _evaluate_criterion(
    criterion: dict,
    content: str,
    eblet_path: str,
    scribe_id: str,
) -> CriterionEvaluation:
    """
    Evaluate a single criterion against the write attempt.
    Returns a signal in [-1.0, +1.0]:
      +1.0 = clearly pro-pass
      -1.0 = clearly pro-block
       0.0 = neutral / uncertain
    """
    cid = criterion.get("id", "unknown")
    label = criterion.get("label", "")
    weight = float(criterion.get("weight_numeric", 1.0))
    pro_pass = criterion.get("pro_pass", [])
    pro_block = criterion.get("pro_block", [])

    content_lower = content.lower()
    path_lower = eblet_path.lower()
    scribe_lower = scribe_id.lower()
    combined = content_lower + " " + path_lower + " " + scribe_lower

    # Score each pro-pass and pro-block signal by presence in combined context.
    pass_hits = sum(1 for p in pro_pass if p.lower() in combined)
    block_hits = sum(1 for b in pro_block if b.lower() in combined)

    if pass_hits > 0 and block_hits == 0:
        signal = 1.0
        reasoning = f"Pro-pass signals ({pass_hits}): {[p for p in pro_pass if p.lower() in combined]}"
    elif block_hits > 0 and pass_hits == 0:
        signal = -1.0
        reasoning = f"Pro-block signals ({block_hits}): {[b for b in pro_block if b.lower() in combined]}"
    elif pass_hits > 0 and block_hits > 0:
        # Conflicting signals — net positive if more pass, negative if more block.
        signal = (pass_hits - block_hits) / max(pass_hits + block_hits, 1)
        reasoning = f"Conflicting signals: {pass_hits} pro-pass / {block_hits} pro-block → net {signal:.2f}"
    else:
        signal = 0.0
        reasoning = "No explicit signals detected — neutral"

    return CriterionEvaluation(
        criterion_id=cid,
        label=label,
        weight_numeric=weight,
        signal=signal,
        reasoning=reasoning,
    )


# ── Mandatory escalation check ─────────────────────────────────────────────

def _check_mandatory_escalation(
    evaluations: list[CriterionEvaluation],
    criteria_config: dict,
    eblet_path: str,
) -> Optional[str]:
    """Return escalation reason string if mandatory Judge escalation is triggered."""
    mandatory = criteria_config.get("mandatory_judge_escalation", [])

    for trigger in mandatory:
        tl = trigger.lower()

        # SAA Howey-test posture criterion scores pro-block
        if "saa howey-test posture" in tl:
            howey_eval = next(
                (e for e in evaluations if e.criterion_id == "saa_howey_posture"), None
            )
            if howey_eval and howey_eval.signal < 0:
                return f"Mandatory escalation: SAA Howey-test posture criterion is pro-block (signal={howey_eval.signal:.2f})"

        # Crown Letter primary text AND any ambiguity
        if "crown letter primary text" in tl:
            if "crown-letters" in eblet_path.lower() or "crown_letter" in eblet_path.lower():
                ambiguous = [e for e in evaluations if -0.3 <= e.signal <= 0.3]
                if ambiguous:
                    return (
                        f"Mandatory escalation: Crown Letter context with ambiguous criteria: "
                        f"{[e.criterion_id for e in ambiguous]}"
                    )

    return None


# ── Logging ────────────────────────────────────────────────────────────────

def _log_verdict(
    result: ScalesResult,
    eblet_path: str,
    log_path: Optional[Path] = None,
) -> None:
    path = log_path or _SCALES_LOG_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "case_id": result.case_id,
        "scribe_id": "Scales",
        "eblet_path": eblet_path,
        "verdict": result.verdict.value,
        "score": result.score,
        "mandatory_escalation_reason": result.mandatory_escalation_reason,
        "criteria": [
            {
                "criterion_id": e.criterion_id,
                "label": e.label,
                "weight_numeric": e.weight_numeric,
                "signal": e.signal,
                "reasoning": e.reasoning,
            }
            for e in result.criterion_evaluations
        ],
        "decided_at": result.decided_at,
    }
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


# ── Public API ─────────────────────────────────────────────────────────────

def weigh(
    content: str,
    eblet_path: str,
    scribe_id: str = "",
    criteria_path: Optional[Path] = None,
    log_path: Optional[Path] = None,
) -> ScalesResult:
    """
    Evaluate a write attempt against the criteria set and return a weighted verdict.

    Args:
        content:       Full text of the write attempt.
        eblet_path:    Destination path of the write.
        scribe_id:     Writing organism ID.
        criteria_path: Override path for criteria YAML (default: bundled v1).
        log_path:      Override path for verdict log.

    Returns:
        ScalesResult with verdict PASS, BLOCK, or JUDGE.
    """
    criteria_config = _load_criteria(criteria_path)
    criteria_list = criteria_config.get("criteria", [])
    thresholds = criteria_config.get("verdict_thresholds", {})
    pass_above = float(thresholds.get("pass_above", 0.6))
    block_below = float(thresholds.get("block_below", 0.4))

    evaluations = [
        _evaluate_criterion(c, content, eblet_path, scribe_id)
        for c in criteria_list
    ]

    # Weighted average: signal ∈ [-1, 1] → normalize to [0, 1].
    total_weight = sum(e.weight_numeric for e in evaluations)
    if total_weight == 0:
        raw_score = 0.5
    else:
        weighted_sum = sum(e.signal * e.weight_numeric for e in evaluations)
        raw_score = (weighted_sum / total_weight + 1.0) / 2.0  # map [-1,1] → [0,1]

    score = max(0.0, min(1.0, raw_score))

    # Mandatory escalation check (overrides score-based verdict).
    mandatory_reason = _check_mandatory_escalation(evaluations, criteria_config, eblet_path)
    if mandatory_reason:
        result = ScalesResult(
            verdict=ScalesVerdict.JUDGE,
            score=score,
            criterion_evaluations=evaluations,
            mandatory_escalation_reason=mandatory_reason,
        )
        _log_verdict(result, eblet_path, log_path)
        return result

    if score > pass_above:
        verdict = ScalesVerdict.PASS
    elif score < block_below:
        verdict = ScalesVerdict.BLOCK
    else:
        verdict = ScalesVerdict.JUDGE

    result = ScalesResult(
        verdict=verdict,
        score=score,
        criterion_evaluations=evaluations,
    )
    _log_verdict(result, eblet_path, log_path)
    return result
