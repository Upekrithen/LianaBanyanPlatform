#!/usr/bin/env python3
"""
bishop_catechist_scribe.py — KN036 Catechist Scribe MVP SessionStart hook.

#2313 Prov 16 candidate (Founder-ratified BP004 turn 9).
Greek κατηχητής = oral instructor / discipline-grader.

Fires at SessionStart AFTER Vine Transfer. Grades Bishop first-N actions
against 10 canonical discipline rules. Emits:
  - Grade JSON → ~/.claude/state/catechist/bishop_<session>_<id>_grade.json
  - Catechist Receipt section appended to Vine Landing Receipt
    (injected into additionalContext alongside the existing SessionStart context)

D.1: Hook order = Vine Transfer → Catechist Scribe → rest of session start context
D.12: Brick Wall — any failure logs to errors.log; never blocks SessionStart

Hook wiring: SessionStart chain in ~/.claude/settings.json (added KN036 Phase E).
This hook is a STANDALONE command; it reads stdin (Claude hook payload) and
writes a supplemental additionalContext to stdout.

Design: Catechist does NOT inject additionalContext itself — it writes the grade
JSON file and returns a plain-text receipt snippet (exit 0 stdout) that the
parent SessionStart hook (bishop_session_start.py) would ideally concatenate.

Since Claude Code runs each SessionStart hook independently and merges their
additionalContext outputs, this hook emits its OWN hookSpecificOutput so that
Claude Code will append the Catechist section directly to context.
"""

from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path

HOOKS_DIR = Path(__file__).parent
STATE_DIR = Path(r"C:\Users\Administrator\.claude\state\catechist")
ERRORS_LOG = STATE_DIR / "errors.log"
PROJECTS_DIR = Path(r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents")


def _log_error(msg: str) -> None:
    """D.12: Log error silently; never block SessionStart."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        with ERRORS_LOG.open("a", encoding="utf-8") as fh:
            from datetime import datetime, timezone
            ts = datetime.now(timezone.utc).isoformat()
            fh.write(f"[{ts}] {msg}\n")
    except Exception:
        pass


def _import_local(name: str):
    """Import a sibling hook module from ~/.claude/hooks/."""
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, HOOKS_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main() -> int:
    try:
        raw = sys.stdin.read()
        try:
            payload = json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError:
            payload = {}

        session_id = payload.get("session_id") or payload.get("sessionId") or "unknown"
        session_name = "BP004"  # Default; override via current_session_name.txt if present
        try:
            name_file = Path(r"C:\Users\Administrator\.claude\state\current_session_name.txt")
            if name_file.is_file():
                name = name_file.read_text(encoding="utf-8").strip()
                if name:
                    session_name = name
        except Exception:
            pass

        # ── Import local modules ─────────────────────────────────────────────
        try:
            reader_mod = _import_local("bishop_catechist_jsonl_reader")
            rules_mod = _import_local("bishop_catechist_rules")
            grader_mod = _import_local("bishop_catechist_grader")
            vine_mod = _import_local("bishop_catechist_vine_extender")
        except Exception as exc:
            _log_error(f"Module import failed: {exc}\n{traceback.format_exc()}")
            return 0  # D.12: degrade gracefully

        # ── Locate and read JSONL ────────────────────────────────────────────
        jsonl_path = reader_mod.find_session_jsonl(session_id if session_id != "unknown" else None)
        if jsonl_path is None:
            _log_error(f"No JSONL found for session_id={session_id}")
            return 0

        read_result = reader_mod.read_turns(jsonl_path)
        turns = read_result["turns"]
        insufficient_data = read_result["insufficient_data"]
        total_lines = read_result["total_lines_read"]

        # ── Evaluate rules ───────────────────────────────────────────────────
        rule_results: list[dict] = []
        if not insufficient_data:
            for rule_id, evaluator in rules_mod.RULES:
                try:
                    result = evaluator(turns)
                    result["rule_id"] = rule_id
                    rule_results.append(result)
                except Exception as exc:
                    rule_results.append({
                        "rule_id": rule_id,
                        "status": "WARN",
                        "evidence": f"Evaluator raised: {type(exc).__name__}: {exc}",
                    })
        else:
            for rule_id, _ in rules_mod.RULES:
                rule_results.append({
                    "rule_id": rule_id,
                    "status": "INSUFFICIENT_DATA",
                    "evidence": "Fewer than 3 turns available (D.8 guard).",
                })

        # ── Aggregate grade ──────────────────────────────────────────────────
        checked_at_turn = len(turns)
        grade_dict = grader_mod.aggregate(
            rule_results=rule_results,
            session_id=session_id,
            session_name=session_name,
            checked_at_turn=checked_at_turn,
            insufficient_data=insufficient_data,
            session_jsonl=str(jsonl_path),
            agent="bishop",
        )

        # ── Write grade JSON ─────────────────────────────────────────────────
        grade_path = grader_mod.write_grade(grade_dict, session_id, session_name)
        if grade_path:
            grade_dict["appended_to_vine_receipt"] = True

        # ── Build Vine Landing Receipt extension ─────────────────────────────
        receipt_section = vine_mod.build_receipt_section(grade_dict)

        # ── Emit additionalContext to Claude Code ────────────────────────────
        out = {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": receipt_section,
            }
        }
        print(json.dumps(out))
        return 0

    except Exception as exc:
        try:
            _log_error(f"Fatal: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        except Exception:
            pass
        return 0  # D.12: never block SessionStart


if __name__ == "__main__":
    sys.exit(main())
