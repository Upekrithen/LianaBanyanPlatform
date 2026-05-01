"""
Bishop Librarian Gate — KN095 / BP011
=======================================
PostBlockHook integration: routes Augur BLOCK verdicts through the
Bouncer → Scales → Judge trio before final disposition.

When Augur fires BLOCK on a write attempt:
  1. Bouncer checks safe-pattern registry (<10ms).
     → PASS_OVERRIDE: write proceeds, Augur block rejected with reason.
     → ROUTE_TO_SCALES: escalate.
  2. Scales evaluates criteria-weighted verdict.
     → PASS: write proceeds.
     → BLOCK: write rejected (Founder can appeal to Judge CLI).
     → JUDGE: escalate.
  3. Judge reads precedents, adjudicates.
     → PASS: write proceeds; new precedent recorded; Bouncer update queued.
     → BLOCK: write rejected; Founder can re-appeal.

This file is the wiring layer. Import and call `post_block_hook` from
whatever Augur Living Gate implementation fires BLOCK signals.

KN095 / BP011 — Founder-ratified 2026-05-01.
BRIDLE: Bouncer fail-closed; Judge cannot override Founder-direct rules.
"""

from __future__ import annotations

from enum import Enum
from pathlib import Path
from typing import Optional

from librarian_mcp.src.scribes.bouncer import bounce, BouncerVerdict
from librarian_mcp.src.scribes.scales import weigh, ScalesVerdict
from librarian_mcp.src.scribes.judge import adjudicate, JudgeVerdict


class GateDisposition(str, Enum):
    ALLOW = "ALLOW"       # Write proceeds (Bouncer or Scales or Judge passed)
    DENY = "DENY"         # Write rejected (Scales or Judge blocked)
    AUGUR_ORIGINAL = "AUGUR_ORIGINAL"  # Trio could not evaluate; original Augur block stands


class GateResult:
    def __init__(
        self,
        disposition: GateDisposition,
        resolved_by: str,
        reason: str,
        bouncer_case_id: Optional[str] = None,
        scales_case_id: Optional[str] = None,
        judge_case_id: Optional[str] = None,
    ):
        self.disposition = disposition
        self.resolved_by = resolved_by
        self.reason = reason
        self.bouncer_case_id = bouncer_case_id
        self.scales_case_id = scales_case_id
        self.judge_case_id = judge_case_id

    def allows_write(self) -> bool:
        return self.disposition == GateDisposition.ALLOW


def post_block_hook(
    content: str,
    eblet_path: str,
    scribe_id: str = "",
    bouncer_patterns_path: Optional[Path] = None,
    scales_criteria_path: Optional[Path] = None,
    judge_precedents_path: Optional[Path] = None,
) -> GateResult:
    """
    PostBlockHook: called after Augur emits a BLOCK verdict.

    Runs the Bouncer → Scales → Judge trio and returns a GateResult
    indicating whether the write should proceed or remain blocked.

    Args:
        content:       Full text of the blocked write attempt.
        eblet_path:    Destination path.
        scribe_id:     Writing organism ID (e.g., "Bishop", "R11_shadow_alpha").

    Returns:
        GateResult with `allows_write()` indicating final disposition.
    """
    # ── Step 1: Bouncer ──────────────────────────────────────────────────────
    bouncer_result = bounce(
        content=content,
        eblet_path=eblet_path,
        scribe_id=scribe_id,
        patterns_path=bouncer_patterns_path,
    )

    if bouncer_result.verdict == BouncerVerdict.PASS_OVERRIDE:
        return GateResult(
            disposition=GateDisposition.ALLOW,
            resolved_by="Bouncer",
            reason=(
                f"Bouncer safe-pattern '{bouncer_result.matched_pattern_id}' overrode Augur block. "
                f"{bouncer_result.rationale}"
            ),
            bouncer_case_id=bouncer_result.case_id,
        )

    # ── Step 2: Scales ───────────────────────────────────────────────────────
    scales_result = weigh(
        content=content,
        eblet_path=eblet_path,
        scribe_id=scribe_id,
        criteria_path=scales_criteria_path,
    )

    if scales_result.verdict == ScalesVerdict.PASS:
        return GateResult(
            disposition=GateDisposition.ALLOW,
            resolved_by="Scales",
            reason=f"Scales criteria-weighted score {scales_result.score:.3f} > 0.6. Write approved.",
            scales_case_id=scales_result.case_id,
        )

    if scales_result.verdict == ScalesVerdict.BLOCK:
        return GateResult(
            disposition=GateDisposition.DENY,
            resolved_by="Scales",
            reason=(
                f"Scales BLOCK: criteria-weighted score {scales_result.score:.3f} < 0.4. "
                "Augur original block confirmed. Founder can appeal to Judge CLI."
            ),
            scales_case_id=scales_result.case_id,
        )

    # ── Step 3: Judge (Scales escalated JUDGE) ───────────────────────────────
    judge_result = adjudicate(
        scales_case_id=scales_result.case_id,
        content=content,
        eblet_path=eblet_path,
        scribe_id=scribe_id,
        precedents_path=judge_precedents_path,
    )

    if judge_result.verdict == JudgeVerdict.PASS:
        return GateResult(
            disposition=GateDisposition.ALLOW,
            resolved_by="Judge",
            reason=f"Judge PASS: {judge_result.reasoning}",
            scales_case_id=scales_result.case_id,
            judge_case_id=judge_result.judge_case_id,
        )

    return GateResult(
        disposition=GateDisposition.DENY,
        resolved_by="Judge",
        reason=(
            f"Judge BLOCK: {judge_result.reasoning} "
            "Founder can re-appeal: python -m librarian_mcp.judge appeal "
            f"--case {scales_result.case_id}"
        ),
        scales_case_id=scales_result.case_id,
        judge_case_id=judge_result.judge_case_id,
    )
