#!/usr/bin/env python3
"""
bishop_catechist_vine_extender.py — KN036 Catechist Scribe Vine Landing Receipt extender.

D.6: Appends a "## Section 6 — Catechist Discipline Grade" Markdown block
to the Vine Landing Receipt text returned by the SessionStart hook.

Does NOT write to disk — returns a string snippet for the hook to append
to the additionalContext payload. Brick Wall: never raises; returns "" on any error.
"""

from __future__ import annotations

GRADE_EMOJI = {"PASS": "[PASS]", "WARN": "[WARN]", "FAIL": "[FAIL]", "INSUFFICIENT_DATA": "[INFO]"}
STATUS_EMOJI = {"PASS": "[PASS]", "WARN": "[WARN]", "FAIL": "[FAIL]", "INSUFFICIENT_DATA": "[INFO]"}


def build_receipt_section(grade_dict: dict) -> str:
    """
    Build the Catechist section to append to the Vine Landing Receipt.

    D.6: Format = "## Section 6 — Catechist Discipline Grade"
    """
    try:
        grade = grade_dict.get("grade", "UNKNOWN")
        session_name = grade_dict.get("session_name", "?")
        session_id = grade_dict.get("session_id", "?")[:12]
        passed = grade_dict.get("passed", 0)
        warned = grade_dict.get("warned", 0)
        failed = grade_dict.get("failed", 0)
        total = grade_dict.get("rules_evaluated", 0)
        sig = grade_dict.get("chronos_signature", "?")
        emoji = GRADE_EMOJI.get(grade, "❓")

        lines = [
            "",
            "## Section 6 — Catechist Discipline Grade",
            "",
            f"**Session:** {session_name} ({session_id}…)",
            f"**Grade:** {emoji} **{grade}** ({passed} PASS / {warned} WARN / {failed} FAIL / {total} rules)",
            f"**Chronos:** `{sig}`",
            "",
        ]

        details = grade_dict.get("details", [])
        if details:
            lines.append("| Rule | Status | Evidence |")
            lines.append("|---|---|---|")
            for d in details:
                rule_id = d.get("rule_id", d.get("rule", "?"))
                status = d.get("status", "?")
                evidence = d.get("evidence", "").replace("|", "\\|")[:120]
                semoji = STATUS_EMOJI.get(status, "❓")
                lines.append(f"| {rule_id} | {semoji} {status} | {evidence} |")
            lines.append("")

        if grade == "INSUFFICIENT_DATA":
            lines.append("> [INFO] Fewer than 3 turns available -- Catechist grade deferred (D.8 guard).")
            lines.append("")

        lines.append(
            f"*Catechist fired at SessionStart per #2313 / KN036 / LIGHTHOUSE 8/2.*"
        )

        return "\n".join(lines)
    except Exception:
        return ""
