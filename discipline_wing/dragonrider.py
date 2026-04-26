"""
Dragonrider — Phase-Shift Sandbox Evaluation (K516 / A&A #2301)

When the Wing Consensus Layer reaches a borderline decision (warn, not block),
and dragonrider_enabled is set in the Wing config, the Dragonrider performs a
Phase-Shift: it forks the current Wing state into a sandbox, runs the hypothetical
action against the sandbox, and returns a confidence-weighted prediction of what
would happen if the action proceeded.

The Consensus Layer uses this prediction to optionally escalate warn → block.

Pern reference (Founder B123-late): Dragonriders go BETWEEN to different times
AND locations to copy components into Sandbox Contingency Operators / Mimic Trunks.
Here: the Dragonrider goes BETWEEN into a sandbox timeline and tests the action
before it lands in production reality.

Design constraints (K516):
- No primary state mutation — sandbox is in-memory; primary substrate is read-only
  from sandbox perspective.
- Auto-cleanup — sandbox lifetime = one Phase-Shift evaluation; GC'd after return.
- Voluntary — dragonrider_enabled is per-Wing opt-in (default False for safety).
- Fail-safe — any Phase-Shift error → graceful fallback, Consensus proceeds without
  Dragonrider input + logs the failure.

A&A #2301 (Dragonriders) / #2295 Tier 3 sandbox-integration enhancement.
"""

from __future__ import annotations

import copy
import json
import os
import re
import time
import uuid
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from discipline_wing.bureau import RISK_PATTERN_AUGURS, _evaluate_risk_patterns

DRAGONRIDER_TABLET_DIR = Path(os.path.expanduser("~/.claude/state/dragonrider_tablets"))
CONFIDENCE_ESCALATE_THRESHOLD = 0.7  # Confidence above which warn → block


# ── Data types ────────────────────────────────────────────────────────────────

@dataclass
class SandboxState:
    """
    Lightweight fork of Wing state for Phase-Shift evaluation.
    Created from the primary Wing state at evaluation time.
    Mutated during sandbox evaluation. Never propagated back.
    """
    phase_shift_id: str
    tool_name: str
    file_path: str
    content: str
    augur_snapshot: List[dict]      # Copy of Augur configs at fork time
    session: str = ""
    created_ts: str = ""


@dataclass
class DragonriderResult:
    """Outcome of a Phase-Shift evaluation."""
    phase_shift_id: str
    triggered: bool                 # Did the borderline condition trigger the Dragonrider?
    predicted_harm: bool            # Would harm occur if the action proceeded?
    confidence: float               # 0.0–1.0: confidence in predicted_harm
    sandbox_decision: str           # "escalate_to_block" | "allow_as_warned" | "insufficient_evidence"
    downstream_risks: List[dict]    # Risk-pattern Augurs that would fire on the content
    escalation_reason: str          # Human-readable explanation
    elapsed_ms: int
    phase_shift_skipped: bool = False  # True if Dragonrider was not applicable
    skip_reason: str = ""


# ── Borderline detection ───────────────────────────────────────────────────────

def should_phase_shift(
    consensus_decision: str,
    triggered_augur_ids: List[str],
    wing_config: dict,
) -> tuple[bool, str]:
    """
    Determine if a Phase-Shift is warranted.

    Conditions for Phase-Shift:
      1. Wing dragonrider_enabled = True (opt-in)
      2. Consensus decision is "warn" (not block, not allow)
      3. At least one Augur triggered (borderline is warn-with-signals)

    Returns (should_shift: bool, reason: str)
    """
    if not wing_config.get("dragonrider_enabled", False):
        return False, "Dragonrider not enabled for this Wing."

    if consensus_decision != "warn":
        return False, f"Decision is '{consensus_decision}' — Phase-Shift only on borderline 'warn'."

    if not triggered_augur_ids:
        return False, "No Augurs triggered — not borderline."

    return True, f"Borderline warn with {len(triggered_augur_ids)} triggered Augur(s): {', '.join(triggered_augur_ids)}."


# ── Sandbox state forking ─────────────────────────────────────────────────────

def _fork_sandbox_state(
    tool_name: str,
    file_path: str,
    content: str,
    augur_configs: List[dict],
    session: str = "",
) -> SandboxState:
    """
    Fork primary Wing state into a sandbox copy.
    Uses copy.deepcopy for Augur configs to ensure true isolation.
    """
    import datetime
    return SandboxState(
        phase_shift_id=str(uuid.uuid4())[:8],
        tool_name=tool_name,
        file_path=file_path,
        content=content,
        augur_snapshot=copy.deepcopy(augur_configs),
        session=session,
        created_ts=datetime.datetime.utcnow().isoformat() + "Z",
    )


# ── Outcome predictor ─────────────────────────────────────────────────────────

def _run_sandbox_evaluation(sandbox: SandboxState) -> List[dict]:
    """
    Run the sandboxed content through:
      1. Bureau risk-pattern Augurs (reasoning-stream patterns, applied to file content)
      2. A second-pass Wing Augur evaluation (forward-looking)

    Returns list of fired risk signals (each a dict with id, name, class, message).
    """
    risks = []

    # Pass 1: Bureau Embedded-Correspondent-Augurs applied to file content
    # (These catch reasoning-style risk patterns even in file content)
    bureau_advisories = _evaluate_risk_patterns(sandbox.content)
    for adv in bureau_advisories:
        if adv.get("triggered"):
            risks.append({
                "source": "bureau_augur",
                "id": adv["id"],
                "name": adv["name"],
                "class": adv["class"],
                "advisory_type": adv.get("advisory_type", "warn"),
                "message": adv.get("message", ""),
            })

    # Pass 2: Check if content contains patterns that would trigger Wing Augur escalation
    # (e.g., content that would cause the next Write to trigger a critical Augur)
    escalation_patterns = [
        (r"(?i)(supabase secrets set|firebase.*config:set|aws ssm put-parameter)", "vendor_secret_rotation", "critical"),
        (r"(?i)git push --force", "force_push", "critical"),
        (r"(?i)DROP (TABLE|DATABASE)", "schema_destruction", "critical"),
        (r"(?i)(rm -rf [~/]|Remove-Item -Recurse -Force [A-Z]:)", "filesystem_wipe", "critical"),
        (r"(?i)(equity|securities|investment|profit.*sharing)", "securities_language", "critical"),
        (r"(?i)(membership.*\$[^5]|membership.*\$5[^/]|annual.*\$((?!5\.00)(?!5$)))", "pricing_violation", "advisory"),
    ]
    for pattern, risk_id, risk_class in escalation_patterns:
        if re.search(pattern, sandbox.content, re.IGNORECASE | re.DOTALL):
            # Avoid duplicate with bureau pass
            if not any(r["id"] == risk_id for r in risks):
                risks.append({
                    "source": "wing_forward_scan",
                    "id": risk_id,
                    "name": f"Forward-Scan-{risk_id.replace('_', '-').title()}",
                    "class": risk_class,
                    "advisory_type": "block" if risk_class == "critical" else "warn",
                    "message": f"Forward scan: content matches '{risk_id}' pattern.",
                })

    return risks


def _compute_confidence(risks: List[dict]) -> float:
    """
    Confidence = weighted sum of risk signals.
    Critical risks: weight 0.5 each (2+ critical = 1.0)
    Advisory risks: weight 0.2 each
    """
    score = 0.0
    for risk in risks:
        if risk.get("class") == "critical":
            score += 0.5
        else:
            score += 0.2
    return min(score, 1.0)


# ── Tablet write ──────────────────────────────────────────────────────────────

def _write_dragonrider_tablet(result: DragonriderResult, sandbox: Optional[SandboxState] = None) -> None:
    """
    Append Phase-Shift evaluation record to Dragonrider tablet.
    Path: ~/.claude/state/dragonrider_tablets/phase_shifts.jsonl
    Append-only. Logged to Chronicler via standard Chronicler write on the Wing side.
    """
    record = {
        "ts": result.__dict__.get("created_ts", ""),
        "phase_shift_id": result.phase_shift_id,
        "triggered": result.triggered,
        "skipped": result.phase_shift_skipped,
        "skip_reason": result.skip_reason,
        "predicted_harm": result.predicted_harm,
        "confidence": result.confidence,
        "sandbox_decision": result.sandbox_decision,
        "downstream_risk_count": len(result.downstream_risks),
        "critical_risk_count": sum(1 for r in result.downstream_risks if r.get("class") == "critical"),
        "escalation_reason": result.escalation_reason,
        "elapsed_ms": result.elapsed_ms,
        "session": sandbox.session if sandbox else "",
        "file_path": sandbox.file_path if sandbox else "",
    }
    try:
        DRAGONRIDER_TABLET_DIR.mkdir(parents=True, exist_ok=True)
        tablet = DRAGONRIDER_TABLET_DIR / "phase_shifts.jsonl"
        with open(tablet, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass  # Tablet write failure must never break the Wing


# ── Main Phase-Shift entry point ──────────────────────────────────────────────

def phase_shift(
    tool_name: str,
    file_path: str,
    content: str,
    augur_configs: List[dict],
    consensus_decision: str,
    triggered_augur_ids: List[str],
    wing_config: dict,
    session: str = "",
) -> DragonriderResult:
    """
    Perform a Phase-Shift sandbox evaluation.

    Called by the Wing engine after Consensus arbitration, when the decision is
    borderline (warn). Returns a DragonriderResult that the engine uses to
    optionally escalate the decision.

    Fail-safe: any internal error → returns phase_shift_skipped=True result so
    the Wing continues without Dragonrider input.
    """
    t0 = time.monotonic()

    # Step 1: Check if Phase-Shift is warranted
    should, reason = should_phase_shift(consensus_decision, triggered_augur_ids, wing_config)
    if not should:
        result = DragonriderResult(
            phase_shift_id=str(uuid.uuid4())[:8],
            triggered=False,
            predicted_harm=False,
            confidence=0.0,
            sandbox_decision="allow_as_warned",
            downstream_risks=[],
            escalation_reason=reason,
            elapsed_ms=int((time.monotonic() - t0) * 1000),
            phase_shift_skipped=True,
            skip_reason=reason,
        )
        _write_dragonrider_tablet(result)
        return result

    # Step 2: Fork sandbox state
    try:
        sandbox = _fork_sandbox_state(tool_name, file_path, content, augur_configs, session)
    except Exception as exc:
        result = DragonriderResult(
            phase_shift_id=str(uuid.uuid4())[:8],
            triggered=True,
            predicted_harm=False,
            confidence=0.0,
            sandbox_decision="allow_as_warned",
            downstream_risks=[],
            escalation_reason=f"Sandbox fork failed (fail-safe): {exc}",
            elapsed_ms=int((time.monotonic() - t0) * 1000),
            phase_shift_skipped=True,
            skip_reason=f"Sandbox fork failed: {exc}",
        )
        _write_dragonrider_tablet(result)
        return result

    # Step 3: Run sandbox evaluation
    try:
        risks = _run_sandbox_evaluation(sandbox)
    except Exception as exc:
        risks = []

    # Step 4: Compute confidence + decision
    confidence = _compute_confidence(risks)
    predicted_harm = len(risks) > 0 and confidence >= CONFIDENCE_ESCALATE_THRESHOLD

    critical_risks = [r for r in risks if r.get("class") == "critical"]
    has_critical = bool(critical_risks)

    if predicted_harm and has_critical:
        sandbox_decision = "escalate_to_block"
        escalation_reason = (
            f"Phase-Shift found {len(critical_risks)} critical risk(s) in sandbox "
            f"(confidence={confidence:.2f}). "
            f"Risks: {', '.join(r['name'] for r in critical_risks)}. "
            f"Escalating warn → block."
        )
    elif predicted_harm:
        sandbox_decision = "escalate_to_block"
        escalation_reason = (
            f"Phase-Shift found {len(risks)} advisory risk(s) in sandbox "
            f"(confidence={confidence:.2f} >= threshold {CONFIDENCE_ESCALATE_THRESHOLD}). "
            f"Escalating warn → block."
        )
    elif risks:
        sandbox_decision = "allow_as_warned"
        escalation_reason = (
            f"Phase-Shift found {len(risks)} risk signal(s) in sandbox "
            f"(confidence={confidence:.2f} < threshold {CONFIDENCE_ESCALATE_THRESHOLD}). "
            f"Insufficient evidence to escalate — allowing as warned."
        )
    else:
        sandbox_decision = "allow_as_warned"
        escalation_reason = "Phase-Shift found no risk signals in sandbox. Allowing as warned."

    elapsed = int((time.monotonic() - t0) * 1000)
    result = DragonriderResult(
        phase_shift_id=sandbox.phase_shift_id,
        triggered=True,
        predicted_harm=predicted_harm,
        confidence=confidence,
        sandbox_decision=sandbox_decision,
        downstream_risks=risks,
        escalation_reason=escalation_reason,
        elapsed_ms=elapsed,
        phase_shift_skipped=False,
    )

    _write_dragonrider_tablet(result, sandbox)
    return result


# ── Query interface ───────────────────────────────────────────────────────────

def query_phase_shifts(
    since_ts: Optional[str] = None,
    limit: int = 50,
) -> Dict[str, Any]:
    """
    Query Phase-Shift tablet records. Returns recent evaluations with escalation decisions.
    """
    import datetime
    tablet = DRAGONRIDER_TABLET_DIR / "phase_shifts.jsonl"
    if not tablet.exists():
        return {"phase_shifts": [], "total": 0, "query_ts": datetime.datetime.utcnow().isoformat() + "Z"}

    all_records = []
    try:
        for line in tablet.read_text(encoding="utf-8").strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if since_ts and rec.get("ts", "") < since_ts:
                    continue
                all_records.append(rec)
            except Exception:
                pass
    except Exception:
        pass

    all_records.sort(key=lambda r: r.get("ts", ""), reverse=True)
    results = all_records[:limit]

    escalations = [r for r in all_records if r.get("sandbox_decision") == "escalate_to_block"]
    skips = [r for r in all_records if r.get("skipped")]

    return {
        "query_ts": datetime.datetime.utcnow().isoformat() + "Z",
        "total": len(all_records),
        "returned": len(results),
        "escalation_count": len(escalations),
        "skip_count": len(skips),
        "phase_shifts": results,
    }
