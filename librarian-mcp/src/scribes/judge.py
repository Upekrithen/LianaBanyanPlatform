"""
Judge Scribe — KN095 / BP011
==============================
Appellate authority for Augur-block disputes escalated by Scales.

Architecture:
  Judge fires when Scales emits JUDGE verdict, OR when Founder invokes the
  appeal CLI for a Scales BLOCK.

Verdicts:
  PASS — write proceeds; new precedent recorded; Bouncer safe-pattern-registry
         update queued for Founder ratification.
  BLOCK — write rejected; Founder can re-appeal via CLI.

Precedent: every Judge decision is appended to judge_precedents_v1.yaml.
Bouncer safe-pattern updates are logged as pending (Founder ratifies).

Appeal CLI:
  python -m librarian_mcp.judge appeal --case <case-id>

BRIDLE discipline:
  Judge can override Scales/Bouncer, but NOT Founder-direct rules and NOT
  Stone Tablet append-only authority. Every decision carries a full reasoning
  trail. Founder veto is always preserved.

KN095 / BP011 — Founder-ratified 2026-05-01.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional

import yaml

# ── Paths ──────────────────────────────────────────────────────────────────

_SCRIPT_DIR = Path(__file__).parent
_PRECEDENTS_PATH = _SCRIPT_DIR / "judge_precedents_v1.yaml"
_SCALES_LOG_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/scales_verdicts.jsonl"
))
_JUDGE_LOG_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/judge_verdicts.jsonl"
))
_BOUNCER_UPDATE_QUEUE_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/bouncer_update_queue.jsonl"
))


# ── Verdict types ──────────────────────────────────────────────────────────

class JudgeVerdict(str, Enum):
    PASS = "PASS"    # Write proceeds; new precedent; Bouncer update queued
    BLOCK = "BLOCK"  # Write rejected; Founder can re-appeal


@dataclass
class JudgeResult:
    verdict: JudgeVerdict
    case_id: str
    scales_case_id: Optional[str]
    reasoning: str
    new_precedent: Optional[str] = None
    bouncer_update_queued: bool = False
    judge_case_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    decided_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ── Precedent loading ──────────────────────────────────────────────────────

def _load_precedents(path: Optional[Path] = None) -> list[dict]:
    p = path or _PRECEDENTS_PATH
    if not p.exists():
        return []
    with open(p, encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    return data.get("precedents", [])


def _append_precedent(
    new_entry: dict,
    path: Optional[Path] = None,
) -> None:
    """Append a new precedent entry to the YAML precedents file."""
    p = path or _PRECEDENTS_PATH
    if not p.exists():
        p.write_text("precedents:\n", encoding="utf-8")

    with open(p, encoding="utf-8") as fh:
        content = fh.read()

    # Append after the last precedent entry.
    new_yaml_block = "\n"
    for key, val in new_entry.items():
        if isinstance(val, str) and "\n" in val:
            new_yaml_block += f'  - {key}: >\n      {val.strip()}\n'
        elif isinstance(val, list):
            new_yaml_block += f"  - {key}:\n"
            for item in val:
                new_yaml_block += f"      - {item}\n"
        elif isinstance(val, bool):
            new_yaml_block += f"  - {key}: {str(val).lower()}\n"
        else:
            new_yaml_block += f"  - {key}: {repr(val)}\n"

    # Simple approach: append as YAML comment-separated block.
    entry_yaml = "\n  # Judge decision " + new_entry.get("judge_case_id", "") + "\n"
    for key, val in new_entry.items():
        if isinstance(val, str) and len(val) > 80:
            entry_yaml += f"  - {key}: >\n      {val.strip()}\n"
        else:
            safe_val = json.dumps(val)
            entry_yaml += f"    {key}: {safe_val}\n"

    # Inject before the registry_version line.
    if "registry_version:" in content:
        content = content.replace(
            "registry_version:",
            entry_yaml + "\nregistry_version:"
        )
    else:
        content += entry_yaml

    with open(p, "w", encoding="utf-8") as fh:
        fh.write(content)


# ── Scales case lookup ─────────────────────────────────────────────────────

def _load_scales_case(case_id: str, log_path: Optional[Path] = None) -> Optional[dict]:
    """Load a specific Scales verdict from the JSONL log by case_id."""
    path = log_path or _SCALES_LOG_PATH
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                if record.get("case_id") == case_id:
                    return record
            except json.JSONDecodeError:
                continue
    return None


# ── Bouncer update queue ───────────────────────────────────────────────────

def _queue_bouncer_update(
    judge_case_id: str,
    description: str,
    suggested_pattern: dict,
    log_path: Optional[Path] = None,
) -> None:
    """Queue a Bouncer safe-pattern-registry update for Founder ratification."""
    path = log_path or _BOUNCER_UPDATE_QUEUE_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "queue_id": str(uuid.uuid4()),
        "judge_case_id": judge_case_id,
        "description": description,
        "suggested_pattern": suggested_pattern,
        "status": "pending_founder_ratification",
        "queued_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


# ── Logging ────────────────────────────────────────────────────────────────

def _log_judge_verdict(result: JudgeResult, eblet_path: str, log_path: Optional[Path] = None) -> None:
    path = log_path or _JUDGE_LOG_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "judge_case_id": result.judge_case_id,
        "scales_case_id": result.scales_case_id,
        "eblet_path": eblet_path,
        "verdict": result.verdict.value,
        "reasoning": result.reasoning,
        "new_precedent": result.new_precedent,
        "bouncer_update_queued": result.bouncer_update_queued,
        "decided_at": result.decided_at,
    }
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


# ── Core judging logic ─────────────────────────────────────────────────────

def _find_matching_precedent(
    precedents: list[dict],
    content: str,
    eblet_path: str,
) -> Optional[dict]:
    """Return the first precedent whose affected_files or description matches."""
    path_lower = eblet_path.lower()
    for p in precedents:
        # Check affected_files overlap.
        affected = p.get("affected_files", [])
        for af in affected:
            if af.lower() in path_lower or path_lower in af.lower():
                return p
        # Check description keyword overlap.
        desc = p.get("description", "").lower()
        if desc and any(word in content.lower() for word in desc.split() if len(word) > 5):
            return p
    return None


def _derive_verdict_from_scales(scales_record: dict) -> JudgeVerdict:
    """
    When resolving a Scales JUDGE escalation, derive the Judge's verdict
    from the Scales score and criteria signals.
    """
    score = scales_record.get("score", 0.5)
    # Judge is more permissive than Scales in the ambiguous band.
    # Score 0.5-0.6 → usually PASS; 0.4-0.5 → usually BLOCK unless precedent.
    if score >= 0.5:
        return JudgeVerdict.PASS
    return JudgeVerdict.BLOCK


# ── Public API ─────────────────────────────────────────────────────────────

def adjudicate(
    scales_case_id: str,
    content: str,
    eblet_path: str,
    scribe_id: str = "",
    precedents_path: Optional[Path] = None,
    scales_log_path: Optional[Path] = None,
    judge_log_path: Optional[Path] = None,
    bouncer_queue_path: Optional[Path] = None,
) -> JudgeResult:
    """
    Adjudicate a Scales JUDGE escalation.

    Reads the Scales verdict, applies precedent lookup, and emits a final
    PASS or BLOCK decision. New precedents are recorded; PASS decisions
    queue a Bouncer safe-pattern-registry update for Founder ratification.

    Args:
        scales_case_id: case_id from the Scales JUDGE verdict to resolve.
        content:        Full text of the write attempt.
        eblet_path:     Destination path of the write.
        scribe_id:      Writing organism ID.
    """
    precedents = _load_precedents(precedents_path)
    scales_record = _load_scales_case(scales_case_id, scales_log_path)

    matching_precedent = _find_matching_precedent(precedents, content, eblet_path)

    if matching_precedent:
        prior_verdict = matching_precedent.get("judge_verdict", "")
        if "PASS" in prior_verdict.upper():
            verdict = JudgeVerdict.PASS
            reasoning = (
                f"Precedent match: case '{matching_precedent.get('case_id')}' — "
                f"{matching_precedent.get('new_precedent', '')}. "
                f"Prior Judge verdict: PASS."
            )
        else:
            verdict = JudgeVerdict.BLOCK
            reasoning = (
                f"Precedent match: case '{matching_precedent.get('case_id')}' — "
                f"prior Judge verdict was BLOCK or ambiguous."
            )
    elif scales_record:
        verdict = _derive_verdict_from_scales(scales_record)
        mandatory = scales_record.get("mandatory_escalation_reason", "")
        if mandatory:
            verdict = JudgeVerdict.BLOCK
            reasoning = (
                f"Mandatory escalation reason: {mandatory}. "
                "Judge conservatively BLOCKS without precedent. Founder can appeal."
            )
        else:
            reasoning = (
                f"No precedent found. Derived from Scales score {scales_record.get('score', 0.5):.2f}. "
                f"Judge verdict: {verdict.value}."
            )
    else:
        verdict = JudgeVerdict.BLOCK
        reasoning = "Scales record not found; conservative BLOCK pending Founder review."

    new_precedent = None
    bouncer_queued = False

    if verdict == JudgeVerdict.PASS:
        new_precedent = (
            f"Write to '{eblet_path}' by organism '{scribe_id}' was PASS-adjudicated "
            f"by Judge (Scales case {scales_case_id}). Context established as acceptable."
        )
        suggested_pattern = {
            "id": f"judge_derived_{str(uuid.uuid4())[:8]}",
            "type": "file_class",
            "description": f"Judge-derived safe context for {eblet_path}",
            "match_prefixes": [eblet_path],
            "rationale": new_precedent,
        }
        _queue_bouncer_update(
            judge_case_id=str(uuid.uuid4()),
            description=f"Judge PASS for {eblet_path} — suggest Bouncer registry update",
            suggested_pattern=suggested_pattern,
            log_path=bouncer_queue_path,
        )
        bouncer_queued = True

        _append_precedent(
            {
                "case_id": str(uuid.uuid4()),
                "date": datetime.now(timezone.utc).date().isoformat(),
                "session": "JUDGE_AUTO",
                "description": f"Auto-recorded Judge PASS: {eblet_path}",
                "scales_case_id": scales_case_id,
                "judge_verdict": "PASS",
                "new_precedent": new_precedent,
                "pending_bouncer_update": True,
                "ratifying_authority": "Judge",
            },
            path=precedents_path,
        )

    result = JudgeResult(
        verdict=verdict,
        case_id=scales_case_id,
        scales_case_id=scales_case_id,
        reasoning=reasoning,
        new_precedent=new_precedent,
        bouncer_update_queued=bouncer_queued,
    )
    _log_judge_verdict(result, eblet_path, judge_log_path)
    return result


# ── Appeal CLI ────────────────────────────────────────────────────────────

def _appeal_cli() -> None:
    """
    Founder appeal CLI.
    Usage: python -m librarian_mcp.judge appeal --case <case-id>
    """
    parser = argparse.ArgumentParser(
        prog="librarian_mcp.judge",
        description="Judge Scribe — Founder appeal CLI (KN095/BP011)",
    )
    sub = parser.add_subparsers(dest="command")
    appeal_cmd = sub.add_parser("appeal", help="Appeal a Scales BLOCK decision")
    appeal_cmd.add_argument("--case", required=True, help="Scales or Judge case-id to appeal")
    appeal_cmd.add_argument("--content", default="", help="Write content (if re-evaluating)")
    appeal_cmd.add_argument("--path", default="", help="Eblet path of the write attempt")
    appeal_cmd.add_argument("--scribe", default="Founder", help="Appealing organism")

    args = parser.parse_args()

    if args.command == "appeal":
        print(f"[Judge] Re-adjudicating case {args.case}...")
        result = adjudicate(
            scales_case_id=args.case,
            content=args.content,
            eblet_path=args.path,
            scribe_id=args.scribe,
        )
        print(f"[Judge] Verdict: {result.verdict.value}")
        print(f"[Judge] Reasoning: {result.reasoning}")
        if result.new_precedent:
            print(f"[Judge] New precedent recorded: {result.new_precedent}")
        if result.bouncer_update_queued:
            print("[Judge] Bouncer safe-pattern-registry update queued for Founder ratification.")
        sys.exit(0 if result.verdict == JudgeVerdict.PASS else 1)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    _appeal_cli()
