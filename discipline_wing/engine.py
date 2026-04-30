"""
Wing Engine — Bishop Discipline Wing (K514 / A&A #2295 Tier 3)
K514.5 patch: diff-only scan support via per-Augur scan_scope field.

Entry point: evaluate(tool_call) -> EvaluationResult

Loads Augur configs from ~/.claude/state/wing_augurs/*.json
On every PreToolUse Write/Edit, evaluates all enabled Augurs in parallel.
Aggregates signals via Consensus Layer.
Appends append-only telemetry to ~/.claude/state/wing_telemetry.jsonl.

Fail-safe: any internal error -> allow (never block legitimate work due to engine bugs).

Scan scope (K514.5):
  - Augur JSON field: scan_scope: "diff_only" | "full" (default: "full")
  - "diff_only": for StrReplace/Edit, scan new_string only (the actual change).
                 For Write, scan full content (the entire file IS the new content).
  - "full":      scan full content surface for all tool types (pre-K514.5 behavior).
  Rationale: scanning unchanged text in a file caused false positives when pre-existing
  content (e.g. "investors" in a boilerplate section) triggered Augurs on unrelated edits.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from discipline_wing.consensus import AugurResult, ConsensusDecision, ConsensusLayer
from discipline_wing.chronicler import write_chronicler
from discipline_wing.dragonrider import phase_shift, DragonriderResult
from discipline_wing import timewave_security, angel_of_death

# ── Paths ──────────────────────────────────────────────────────────────────────

WING_CONFIG_PATH    = Path(os.path.expanduser("~/.claude/state/bishop_wing_augurs.json"))
AUGUR_DIR           = Path(os.path.expanduser("~/.claude/state/wing_augurs"))
TELEMETRY_PATH      = Path(os.path.expanduser("~/.claude/state/wing_telemetry.jsonl"))
LIBRARIAN_TS_FILE   = Path(os.path.expanduser("~/.claude/state/bishop_last_librarian_consult.ts"))
SUBSTRATE_CACHE     = Path(os.path.expanduser("~/.lb-session/substrate_cache.json"))


def _read_current_session_id() -> str:
    """
    KN005: Read the current session ID from the substrate cache or env.
    Used to tag TimeWave Security events for session-boundary filtering.
    Returns "" if not available (safe default — event still recorded, just not session-tagged).
    """
    # Prefer env var (cheapest, no I/O)
    session_id = os.environ.get("LB_SESSION_ID", "").strip()
    if session_id:
        return session_id
    # Fallback: substrate cache (written by brief_me)
    try:
        if SUBSTRATE_CACHE.exists():
            data = json.loads(SUBSTRATE_CACHE.read_text(encoding="utf-8-sig"))
            return str(data.get("session_id", "") or "")
    except Exception:
        pass
    return ""

# ── Data types ─────────────────────────────────────────────────────────────────

@dataclass
class ToolCall:
    tool_name: str          # "Write" | "Edit"
    file_path: str          # normalized forward-slash path
    content: str            # full content being written/changed
    diff_text: str = ""     # K514.5: changed/added text only (new_string for StrReplace; same as content for Write)


@dataclass
class EvaluationResult:
    decision: str           # "block" | "warn" | "enrich" | "allow"
    message: str
    triggered_augurs: List[str]
    trace: List[dict]       # per-Augur diagnostic trace
    elapsed_ms: int
    consensus_reason: str
    dragonrider: Optional[dict] = None        # Phase-Shift result if triggered (K516)
    timewave_security: Optional[dict] = None  # TimeWave Security signal if pattern detected (K517)
    angel_of_death: Optional[dict] = None     # Bury record if Dragonrider rejected (K517)


# ── Augur config loading ───────────────────────────────────────────────────────

def _load_wing_config() -> dict:
    try:
        return json.loads(WING_CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {
            "augur_ids": [],
            "consensus_rules": {
                "advisory_any_action": "warn",
                "no_signal_action": "allow",
            },
        }


def _load_augur_configs(wing_config: dict) -> List[dict]:
    """Load all enabled augur JSON configs from the augur_dir."""
    configs = []
    augur_dir = AUGUR_DIR
    for augur_id in wing_config.get("augur_ids", []):
        path = augur_dir / f"{augur_id}.json"
        try:
            cfg = json.loads(path.read_text(encoding="utf-8"))
            if cfg.get("enabled", True):
                configs.append(cfg)
        except Exception:
            pass  # Missing augur config → skip (don't break the wing)
    return configs


# ── Augur evaluation ───────────────────────────────────────────────────────────

def _text_to_check(tool_call: ToolCall, scan_scope: str = "full") -> str:
    """
    Return the text surface to run patterns against.
    K514.5: scan_scope="diff_only" uses diff_text (new_string for StrReplace, full content for Write).
    scan_scope="full" (default) uses full content surface — pre-K514.5 behavior.
    """
    if scan_scope == "diff_only" and tool_call.diff_text:
        return tool_call.diff_text
    return tool_call.content


def _path_matches(patterns: List[str], file_path: str) -> bool:
    """True if any pattern matches the file path."""
    if not patterns:
        return False
    normalized = file_path.replace("\\", "/")
    return any(re.search(p, normalized) for p in patterns)


def _text_matches(patterns: List[str], text: str) -> bool:
    """True if any pattern matches the text."""
    if not patterns:
        return False
    return any(re.search(p, text, re.IGNORECASE | re.DOTALL) for p in patterns)


def _check_required_consult(augur_cfg: dict, tool_call: ToolCall) -> bool:
    """
    Returns True if the required consult condition is SATISFIED (no signal needed).
    Returns False if the condition is NOT satisfied (Augur should fire).
    """
    consult = augur_cfg.get("required_consult", {})
    consult_type = consult.get("type", "none")

    if consult_type == "none":
        return False  # No consult check — Augur fires based on trigger alone

    if consult_type == "state_file":
        state_path = Path(os.path.expanduser(consult.get("path", "")))
        freshness = consult.get("freshness_seconds", 600)
        try:
            last_ts = int(state_path.read_text(encoding="utf-8").strip())
            return (time.time() - last_ts) < freshness  # True = fresh = allow
        except Exception:
            return False  # Can't read state → treat as stale → fire

    if consult_type == "text_contains":
        pattern = consult.get("pattern", "")
        if not pattern:
            return True
        return bool(re.search(pattern, tool_call.content, re.IGNORECASE | re.DOTALL))

    return True  # Unknown consult type → don't block


def _evaluate_single_augur(augur_cfg: dict, tool_call: ToolCall) -> AugurResult:
    """Evaluate one Augur against the tool call. Returns AugurResult."""
    t0 = time.monotonic()
    augur_id = augur_cfg.get("id", "unknown")
    augur_name = augur_cfg.get("name", augur_id)
    augur_class = augur_cfg.get("class", "advisory")
    failure_action = augur_cfg.get("failure_action", "warn")
    block_message = augur_cfg.get("block_message", "")

    scan_scope = augur_cfg.get("scan_scope", "full")  # K514.5: diff_only | full
    trigger = augur_cfg.get("trigger", {})
    tool_types = trigger.get("tool_types", ["Write", "Edit"])
    file_patterns = trigger.get("file_path_patterns", [])
    text_patterns = trigger.get("text_patterns", [])
    text_anti_patterns = trigger.get("text_anti_patterns", [])
    require_anti_absent = trigger.get("require_anti_pattern_absent", False)
    exclusion_file_patterns = trigger.get("exclusion_path_patterns", [])

    def _elapsed():
        return int((time.monotonic() - t0) * 1000)

    def _no_signal(reason: str) -> AugurResult:
        return AugurResult(
            augur_id=augur_id, augur_name=augur_name, augur_class=augur_class,
            triggered=False, signal=None, reason=reason, failure_action=failure_action,
            elapsed_ms=_elapsed(),
        )

    def _signal(reason: str) -> AugurResult:
        return AugurResult(
            augur_id=augur_id, augur_name=augur_name, augur_class=augur_class,
            triggered=True, signal=failure_action, reason=reason,
            failure_action=failure_action, elapsed_ms=_elapsed(),
        )

    # Tool type filter
    if tool_call.tool_name not in tool_types:
        return _no_signal(f"Tool {tool_call.tool_name!r} not in trigger scope.")

    # Exclusion path filter (paths that bypass this augur entirely)
    if exclusion_file_patterns and _path_matches(exclusion_file_patterns, tool_call.file_path):
        return _no_signal("Path excluded from this Augur's scope.")

    text = _text_to_check(tool_call, scan_scope)

    # Determine if the trigger pattern matches
    path_match = bool(file_patterns) and _path_matches(file_patterns, tool_call.file_path)

    # K514.5: negation_context_enabled → per-match context analysis instead of document-level match
    negation_context_enabled = augur_cfg.get("negation_context_enabled", False)
    if negation_context_enabled and bool(text_patterns):
        try:
            from discipline_wing.augur_securities_negation import has_non_exempt_match as _negation_scan
            _negation_markers = augur_cfg.get("negation_markers", [])
            _negation_window  = augur_cfg.get("negation_window_tokens", 5)
            _quotation_cfg    = augur_cfg.get("quotation_context", {})
            _has_non_exempt, _exemption_log = _negation_scan(
                text_patterns, text,
                negation_markers=_negation_markers or None,
                quotation_config=_quotation_cfg,
                negation_window=_negation_window,
            )
            text_match = _has_non_exempt
        except Exception:
            # Fail-safe: if negation module fails, fall back to raw pattern match
            text_match = _text_matches(text_patterns, text)
    else:
        text_match = bool(text_patterns) and _text_matches(text_patterns, text)

    # Trigger logic:
    # - Both path AND text patterns specified → AND (path is scope, text is trigger)
    # - Only path patterns → path match sufficient
    # - Only text patterns → text match sufficient
    if file_patterns and text_patterns:
        trigger_matched = path_match and text_match
    elif file_patterns:
        trigger_matched = path_match
    else:
        trigger_matched = text_match

    if not trigger_matched:
        return _no_signal("No trigger pattern matched.")

    # Anti-pattern check: if anti-patterns are present and required to be absent,
    # check if any anti-pattern IS present. If so, the safety condition IS met → no signal.
    if require_anti_absent and text_anti_patterns:
        anti_found = _text_matches(text_anti_patterns, text)
        if anti_found:
            return _no_signal("Anti-pattern (safety condition) satisfied — no signal.")

    # Check required consult condition
    consult_satisfied = _check_required_consult(augur_cfg, tool_call)
    if consult_satisfied:
        return _no_signal("Required consult condition satisfied.")

    # All checks passed → this Augur fires
    return _signal(block_message)


# ── Wing evaluation entry point ────────────────────────────────────────────────

def evaluate(tool_call_data: Dict[str, Any]) -> EvaluationResult:
    """
    Main entry point called by the bishop hook.

    tool_call_data: {
        "tool_name": "Write" | "Edit",
        "tool_input": {
            "file_path": "...",
            "content": "..."         # Write
            "new_string": "..."      # Edit (merged with old_string for analysis)
        }
    }

    Returns EvaluationResult with decision + per-Augur trace.
    """
    t_start = time.monotonic()

    try:
        tool_name = tool_call_data.get("tool_name", "")
        tool_input = tool_call_data.get("tool_input", {})
        file_path = tool_input.get("file_path", "")

        # Normalize content surface
        # K514.5: also extract diff_text (the changed/added portion only) for scan_scope="diff_only" Augurs.
        if tool_name == "Write":
            content = tool_input.get("content", tool_input.get("contents", ""))
            diff_text = content  # Write replaces entire file — full content IS the diff
        else:  # Edit / StrReplace
            new_string = tool_input.get("new_string", "")
            content = new_string + "\n" + tool_input.get("content", "")
            diff_text = new_string  # Only the replacement text is the actual change

        tc = ToolCall(tool_name=tool_name, file_path=file_path, content=content, diff_text=diff_text)

        wing_config = _load_wing_config()
        augur_configs = _load_augur_configs(wing_config)

        if not augur_configs:
            result = EvaluationResult(
                decision="allow", message="", triggered_augurs=[],
                trace=[], elapsed_ms=0, consensus_reason="No Augurs loaded.",
            )
            _write_telemetry(tc, result)
            return result

        # Parallel evaluation
        augur_results: List[AugurResult] = []
        with ThreadPoolExecutor(max_workers=min(len(augur_configs), 5)) as pool:
            futures = {
                pool.submit(_evaluate_single_augur, cfg, tc): cfg.get("id")
                for cfg in augur_configs
            }
            for future in as_completed(futures):
                try:
                    augur_results.append(future.result(timeout=3))
                except Exception as exc:
                    augur_results.append(AugurResult(
                        augur_id=futures[future] or "unknown",
                        augur_name=futures[future] or "unknown",
                        augur_class="advisory",
                        triggered=False,
                        signal=None,
                        reason=f"Augur evaluation error: {exc}",
                        failure_action="warn",
                        elapsed_ms=0,
                    ))

        # TimeWave Security — pattern match BEFORE consensus (K517)
        # If action matches N+ prior rejections, inject synthetic critical Augur result
        tw_enabled = wing_config.get("timewave_security_enabled", True)

        # KN001 Eblet bypass — scratch tablets are not canonical state; TimeWave doesn't apply
        if tw_enabled:
            try:
                from discipline_wing.eblet_router import is_eblet_path as _is_eblet_path
                if _is_eblet_path(tc.file_path):
                    tw_enabled = False
            except Exception:
                pass  # Fail-safe: import error → proceed with TimeWave enabled

        tw_match: Optional[dict] = None
        if tw_enabled:
            try:
                tw_match = timewave_security.match_security_pattern(
                    content=tc.content,
                    file_path=tc.file_path,
                )
                if tw_match.get("pattern_detected"):
                    # Inject synthetic Augur — Consensus will treat as critical block
                    augur_results.append(AugurResult(
                        augur_id="tw-security-pattern-match",
                        augur_name="TimeWave Security (Repeated-Rejection Pattern)",
                        augur_class="critical",
                        triggered=True,
                        signal="block",
                        reason=(
                            f"TimeWave Security: {tw_match['prior_rejection_count']} prior "
                            f"rejections matched pattern_hash={tw_match['pattern_hash']} "
                            f"(threshold={tw_match['threshold']}). "
                            f"Repeated-rejection class detected — escalating to block."
                        ),
                        failure_action="block",
                        elapsed_ms=0,
                    ))
            except Exception:
                tw_match = None  # Fail-safe: TimeWave failure never breaks the Wing

        # Consensus arbitration
        consensus_rules = wing_config.get("consensus_rules", {})
        layer = ConsensusLayer(consensus_rules)
        decision: ConsensusDecision = layer.arbitrate(augur_results)

        # Dragonrider Phase-Shift — optional sandbox evaluation on borderline decisions (K516)
        dr_result: Optional[DragonriderResult] = None
        if decision.decision == "warn" and wing_config.get("dragonrider_enabled", False):
            try:
                dr_result = phase_shift(
                    tool_name=tc.tool_name,
                    file_path=tc.file_path,
                    content=tc.content,
                    augur_configs=augur_configs,
                    consensus_decision=decision.decision,
                    triggered_augur_ids=decision.triggered_augurs,
                    wing_config=wing_config,
                )
                if dr_result.sandbox_decision == "escalate_to_block":
                    decision = ConsensusDecision(
                        decision="block",
                        message=(
                            f"[Dragonrider Phase-Shift: {dr_result.phase_shift_id}] "
                            f"{dr_result.escalation_reason}\n"
                            f"Original warn: {decision.message}"
                        ),
                        triggered_augurs=decision.triggered_augurs,
                        all_results=decision.all_results,
                        consensus_reason=(
                            f"Dragonrider escalated warn→block "
                            f"(confidence={dr_result.confidence:.2f}): "
                            f"{dr_result.escalation_reason}"
                        ),
                    )
            except Exception:
                dr_result = None  # Dragonrider failure → proceed without (fail-safe)

        # TimeWave Security — record rejected action as security event (K517)
        # KN005: only records when a real critical Augur (not the synthetic TW augur itself)
        # caused the block.  Advisory Augur warnings and non-Augur rejections do NOT increment.
        tw_event_id: Optional[str] = None
        aod_burial_id: Optional[str] = None
        if tw_enabled and decision.decision == "block":
            try:
                source = "dragonrider_reject" if (
                    dr_result and dr_result.sandbox_decision == "escalate_to_block"
                ) else "wing_block"
                # KN005 D.3: check if a real critical Augur (not synthetic TW augur) caused the block
                is_critical_augur_rejection = any(
                    r.augur_class == "critical"
                    and r.triggered
                    and r.augur_id != "tw-security-pattern-match"
                    for r in augur_results
                )
                current_session = _read_current_session_id()
                tw_event_id = timewave_security.record_event(
                    content=tc.content,
                    file_path=tc.file_path,
                    triggered_augur_ids=decision.triggered_augurs,
                    consensus_decision=decision.decision,
                    source=source,
                    session=current_session,
                    enabled=True,
                    is_critical_augur_rejection=is_critical_augur_rejection,
                )
            except Exception:
                pass  # Fail-safe

        # Angel of Death Bury — relocate rejected Dragonrider snapshot to Catacombs (K517)
        # Only fires when Dragonrider was triggered AND escalated (has forensic value)
        if (dr_result and dr_result.triggered
                and dr_result.sandbox_decision == "escalate_to_block"
                and wing_config.get("dragonrider_enabled", False)):
            try:
                snapshot_data = {
                    "phase_shift_id": dr_result.phase_shift_id,
                    "tool_name": tc.tool_name,
                    "file_path": tc.file_path,
                    "triggered_augur_ids": decision.triggered_augurs,
                    "downstream_risks": dr_result.downstream_risks,
                    "confidence": dr_result.confidence,
                    "escalation_reason": dr_result.escalation_reason,
                    "elapsed_ms": dr_result.elapsed_ms,
                }
                aod_burial_id = angel_of_death.bury(
                    snapshot_data=snapshot_data,
                    bury_reason=f"Dragonrider Phase-Shift escalated warn→block "
                                f"(confidence={dr_result.confidence:.2f}). "
                                f"File: {tc.file_path}",
                    source="dragonrider_rejected",
                )
            except Exception:
                pass  # Fail-safe: Bury failure never breaks the Wing

        # Chronicler UpTick — per-Augur tablet entry for every evaluation (K515)
        for r in augur_results:
            write_chronicler(
                augur_id=r.augur_id,
                augur_name=r.augur_name,
                triggered=r.triggered,
                signal=r.signal,
                failure_action=r.failure_action,
                consensus_decision=decision.decision,
                file_path=tc.file_path,
                tool_name=tc.tool_name,
                elapsed_ms=r.elapsed_ms,
                reason=r.reason,
            )

        elapsed = int((time.monotonic() - t_start) * 1000)

        result = EvaluationResult(
            decision=decision.decision,
            message=decision.message,
            triggered_augurs=decision.triggered_augurs,
            trace=[
                {
                    "augur_id": r.augur_id,
                    "augur_name": r.augur_name,
                    "augur_class": r.augur_class,
                    "triggered": r.triggered,
                    "signal": r.signal,
                    "reason": r.reason,
                    "elapsed_ms": r.elapsed_ms,
                }
                for r in augur_results
            ],
            elapsed_ms=elapsed,
            consensus_reason=decision.consensus_reason,
            dragonrider={
                "phase_shift_id": dr_result.phase_shift_id,
                "triggered": dr_result.triggered,
                "predicted_harm": dr_result.predicted_harm,
                "confidence": dr_result.confidence,
                "sandbox_decision": dr_result.sandbox_decision,
                "escalation_reason": dr_result.escalation_reason,
                "elapsed_ms": dr_result.elapsed_ms,
                "skipped": dr_result.phase_shift_skipped,
            } if dr_result else None,
            timewave_security={
                "pattern_detected": tw_match.get("pattern_detected", False),
                "pattern_hash": tw_match.get("pattern_hash", ""),
                "content_class": tw_match.get("content_class", ""),
                "prior_rejection_count": tw_match.get("prior_rejection_count", 0),
                "weight_bump": tw_match.get("weight_bump", 0.0),
                "session_filtered": tw_match.get("session_filtered", False),
                "event_id": tw_event_id,
            } if tw_match else None,
            angel_of_death={
                "burial_id": aod_burial_id,
                "buried": bool(aod_burial_id),
                "bury_reason": f"Dragonrider Phase-Shift escalated warn→block" if aod_burial_id else "",
            } if aod_burial_id else None,
        )

        _write_telemetry(tc, result)
        return result

    except Exception as exc:
        # Fail-safe: any engine error → allow (don't block legitimate work)
        elapsed = int((time.monotonic() - t_start) * 1000)
        result = EvaluationResult(
            decision="allow",
            message="",
            triggered_augurs=[],
            trace=[{"error": str(exc)}],
            elapsed_ms=elapsed,
            consensus_reason=f"Engine error (fail-safe allow): {exc}",
        )
        _write_telemetry_raw(tool_call_data, result)
        return result


# ── Telemetry ──────────────────────────────────────────────────────────────────

def _write_telemetry(tc: ToolCall, result: EvaluationResult) -> None:
    """Append evaluation record to wing_telemetry.jsonl (append-only)."""
    record = {
        "ts": _iso_now(),
        "tool_call": {
            "tool": tc.tool_name,
            "file_path": tc.file_path,
        },
        "augur_results": result.trace,
        "triggered_augurs": result.triggered_augurs,
        "consensus_decision": result.decision,
        "consensus_reason": result.consensus_reason,
        "elapsed_ms": result.elapsed_ms,
    }
    _append_telemetry(record)


def _write_telemetry_raw(tool_call_data: dict, result: EvaluationResult) -> None:
    record = {
        "ts": _iso_now(),
        "tool_call": tool_call_data,
        "augur_results": result.trace,
        "triggered_augurs": result.triggered_augurs,
        "consensus_decision": result.decision,
        "consensus_reason": result.consensus_reason,
        "elapsed_ms": result.elapsed_ms,
    }
    _append_telemetry(record)


def _append_telemetry(record: dict) -> None:
    try:
        TELEMETRY_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TELEMETRY_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass  # Telemetry failure must never break the hook


def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"


# ── Standalone CLI (for testing) ───────────────────────────────────────────────

if __name__ == "__main__":
    import sys as _sys
    data = json.load(_sys.stdin)
    result = evaluate(data)
    out = {
        "decision": result.decision,
        "message": result.message,
        "triggered_augurs": result.triggered_augurs,
        "consensus_reason": result.consensus_reason,
        "elapsed_ms": result.elapsed_ms,
        "trace": result.trace,
    }
    print(json.dumps(out, indent=2))
    _sys.exit(2 if result.decision == "block" else 0)
