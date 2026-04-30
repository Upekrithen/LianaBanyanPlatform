#!/usr/bin/env python3
"""
bishop_catechist_rules.py — KN036/KN041 Catechist Scribe 10-rule evaluator bank.

Each rule evaluator accepts a turns list (list of dicts with 'role'/'content')
and returns {"status": "PASS|WARN|FAIL|INSUFFICIENT_DATA", "evidence": "<str>"}.

Rules from project_2313_catechist_scribe_canon.md (Founder-ratified BP004 turn 9):
 1. First tool call = mcp__librarian__brief_me
 2. Second action = ask Founder for codecopy number
 3. Drift / staleness surfaced before queue work
 4. WRASSE PRE-INJECTION block absorbed
 5. Augur consult fresh within 10 min before write-class actions
 6. No --no-verify invoked
 7. Tag-on-close convention v-<descriptive>-K<INTEGER>
 8. No counsel-gate language inserted
 9. No prose-pass-timing pressure
10. Empirically-valid praise only

D.2: First N turns to read = 10 (override via CATECHIST_TURNS env var)
D.8: Empty/sparse guard — if < 3 turns, emit INSUFFICIENT_DATA
"""

from __future__ import annotations

import re
from typing import Any

INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


def _text_of(content: Any) -> str:
    """Flatten content block(s) to plain text."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                btype = block.get("type", "")
                if btype == "text":
                    parts.append(block.get("text", ""))
                elif btype == "thinking":
                    parts.append(block.get("thinking", "") or block.get("text", ""))
                elif btype == "tool_use":
                    parts.append(f"__tool_use:{block.get('name', '')}__")
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts)
    return ""


def _tool_calls_in(turns: list[dict]) -> list[str]:
    """Return list of tool names (in order) from all assistant turns."""
    names: list[str] = []
    for t in turns:
        if t.get("role") != "assistant":
            continue
        content = t.get("content", [])
        if not isinstance(content, list):
            continue
        for block in content:
            if isinstance(block, dict) and block.get("type") == "tool_use":
                names.append(block.get("name", ""))
    return names


def _tool_calls_with_args_in(turns: list[dict]) -> list[tuple[str, dict]]:
    """Return list of (tool_name, input_dict) tuples from all assistant turns."""
    calls: list[tuple[str, dict]] = []
    for t in turns:
        if t.get("role") != "assistant":
            continue
        content = t.get("content", [])
        if not isinstance(content, list):
            continue
        for block in content:
            if isinstance(block, dict) and block.get("type") == "tool_use":
                calls.append((block.get("name", ""), block.get("input", {})))
    return calls


# KN041: ToolSearch loading brief_me schema is a deferred-tool meta-load operation.
# Regex matches the Claude CC deferred-tool selector pattern for brief_me.
_BRIEFME_TOOLSEARCH_RE = re.compile(r"select:mcp__librarian__brief_me", re.IGNORECASE)
_TOOLSEARCH_NAMES = frozenset({"ToolSearch", "tool_search", "mcp__tool_search"})


def _is_briefme_toolsearch(name: str, args: dict) -> bool:
    """Return True if this tool call is a ToolSearch loading the brief_me schema."""
    if name not in _TOOLSEARCH_NAMES and not name.lower().endswith("toolsearch"):
        return False
    for v in args.values():
        if isinstance(v, str) and _BRIEFME_TOOLSEARCH_RE.search(v):
            return True
    return False


def _all_text(turns: list[dict]) -> str:
    """Concatenate all text from all turns for pattern-search rules."""
    return "\n".join(_text_of(t.get("content", "")) for t in turns)


# ─── Rule 1 ───────────────────────────────────────────────────────────────────

def rule_01_brief_me_first(turns: list[dict]) -> dict:
    """First tool call must be mcp__librarian__brief_me.

    KN041 whitelist: ToolSearch("select:mcp__librarian__brief_me*") as deferred-tool
    meta-load also satisfies R01 when immediately followed by brief_me itself.
    Bishop CC harness reality — brief_me is deferred; ToolSearch loads the schema first.
    """
    calls = _tool_calls_with_args_in(turns)
    if not calls:
        return {"status": "WARN", "evidence": "No tool calls detected in first-N turns — cannot confirm brief_me-first discipline."}

    first_name, first_args = calls[0]

    # Standard pass: direct brief_me first
    if "brief_me" in first_name or first_name == "mcp__librarian__brief_me":
        return {"status": "PASS", "evidence": f"First tool call: {first_name}"}

    # KN041 whitelist: ToolSearch loading brief_me schema (deferred-tool harness pattern),
    # immediately followed by brief_me as the second tool call.
    if _is_briefme_toolsearch(first_name, first_args):
        if len(calls) >= 2:
            second_name, _ = calls[1]
            if "brief_me" in second_name:
                return {
                    "status": "PASS",
                    "evidence": (
                        f"First tool was ToolSearch loading brief_me schema (deferred-tool harness pattern); "
                        f"brief_me followed in second tool call: {second_name}"
                    ),
                }
        return {
            "status": "FAIL",
            "evidence": (
                f"First tool was ToolSearch loading brief_me schema, but second call was not "
                f"brief_me. ToolSearch meta-load whitelist requires brief_me as immediate follow-up."
            ),
        }

    return {"status": "FAIL", "evidence": f"First tool call was '{first_name}', not mcp__librarian__brief_me."}


# ─── Rule 2 ───────────────────────────────────────────────────────────────────

_CODECOPY_PATTERNS = [
    re.compile(r"\bcodecopy\b", re.IGNORECASE),
    re.compile(r"codecopy number", re.IGNORECASE),
    re.compile(r"BishopClaudeCode", re.IGNORECASE),
    re.compile(r"prior session.*transcript", re.IGNORECASE),
    re.compile(r"transcript.*prior session", re.IGNORECASE),
]

def rule_02_codecopy_ask_second(turns: list[dict]) -> dict:
    """Second action (first 5 user turns) must ask Founder for codecopy number."""
    # Look at the first 5 assistant turns for codecopy mention
    assistant_turns = [t for t in turns if t.get("role") == "assistant"][:5]
    full = "\n".join(_text_of(t.get("content", "")) for t in assistant_turns)
    for pat in _CODECOPY_PATTERNS:
        if pat.search(full):
            return {"status": "PASS", "evidence": "Codecopy / prior-session-transcript ask detected in first 5 assistant turns."}
    # D.10: WARN if no codecopy in first 5 user turns; FAIL only if Founder explicitly said "no codecopy"
    user_turns = [t for t in turns if t.get("role") == "user"][:5]
    user_text = "\n".join(_text_of(t.get("content", "")) for t in user_turns)
    if re.search(r"no\s+codecopy|skip.*codecopy|don.t.*codecopy", user_text, re.IGNORECASE):
        return {"status": "PASS", "evidence": "Founder explicitly opted out of codecopy — rule satisfied by explicit skip."}
    return {"status": "WARN", "evidence": "No codecopy ask detected in first 5 assistant turns. May have been skipped."}


# ─── Rule 3 ───────────────────────────────────────────────────────────────────

_DRIFT_PATTERNS = [
    re.compile(r"\bdrift\b", re.IGNORECASE),
    re.compile(r"staleness", re.IGNORECASE),
    re.compile(r"stale\b", re.IGNORECASE),
    re.compile(r"disagreement", re.IGNORECASE),
    re.compile(r"out of sync", re.IGNORECASE),
    re.compile(r"surface.*findings", re.IGNORECASE),
]

def rule_03_drift_surfaced(turns: list[dict]) -> dict:
    """Drift/staleness must be surfaced before queue work begins."""
    full = _all_text(turns)
    for pat in _DRIFT_PATTERNS:
        if pat.search(full):
            return {"status": "PASS", "evidence": "Drift or staleness surfacing detected in session turns."}
    return {"status": "WARN", "evidence": "No explicit drift/staleness surface detected. May have been clean — cannot confirm."}


# ─── Rule 4 ───────────────────────────────────────────────────────────────────

_WRASSE_PATTERNS = [
    re.compile(r"WRASSE PRE-INJECTION", re.IGNORECASE),
    re.compile(r"wrasse.*absorbed", re.IGNORECASE),
    re.compile(r"wrasse.*prelude", re.IGNORECASE),
    re.compile(r"pre-injection.*absorbed", re.IGNORECASE),
]

def rule_04_wrasse_absorbed(turns: list[dict]) -> dict:
    """WRASSE PRE-INJECTION block must be absorbed (acknowledged)."""
    full = _all_text(turns)
    for pat in _WRASSE_PATTERNS:
        if pat.search(full):
            return {"status": "PASS", "evidence": "WRASSE PRE-INJECTION pattern detected in session text."}
    return {"status": "WARN", "evidence": "WRASSE PRE-INJECTION acknowledgment not detected. May not have fired this session."}


# ─── Rule 5 ───────────────────────────────────────────────────────────────────

_AUGUR_PATTERNS = [
    re.compile(r"augur", re.IGNORECASE),
    re.compile(r"librarian.*consult", re.IGNORECASE),
    re.compile(r"brief_me", re.IGNORECASE),
]

def rule_05_augur_fresh(turns: list[dict]) -> dict:
    """
    Augur consult must be fresh before write-class actions.

    KN038 Augur Living Gate (#2314): freshness is now substrate-event-driven,
    not clock-driven. The Living Gate (augur_living_gate.is_gate_open()) is the
    enforcement point at write-time in engine.py. This rule confirms that at
    least one Augur/brief_me call appears in the session turns — the precision
    of the freshness check (whether a re-consult was truly needed) is handled
    by the Living Gate against Pheromone substrate write events.
    """
    tool_calls = _tool_calls_in(turns)
    augur_calls = [tc for tc in tool_calls if "brief_me" in tc or "augur" in tc.lower()]
    if augur_calls:
        return {"status": "PASS", "evidence": f"Augur/brief_me calls detected: {augur_calls[:3]}"}
    full = _all_text(turns)
    for pat in _AUGUR_PATTERNS:
        if pat.search(full):
            return {"status": "WARN", "evidence": "Augur mentioned but no tool call detected. Living Gate enforces at write-time (KN038)."}
    return {"status": "WARN", "evidence": "No Augur/brief_me activity detected in first-N turns."}


# ─── Rule 6 ───────────────────────────────────────────────────────────────────

_NO_VERIFY_PATTERN = re.compile(r"--no-verify", re.IGNORECASE)
_GIT_PUSH_FORCE_PATTERN = re.compile(r"git push.*--force|git push.*-f\b", re.IGNORECASE)

def rule_06_no_verify_absent(turns: list[dict]) -> dict:
    """BRIDLE v11: --no-verify must never appear."""
    full = _all_text(turns)
    if _NO_VERIFY_PATTERN.search(full):
        return {"status": "FAIL", "evidence": "--no-verify detected in session text. BRIDLE v11 hard violation."}
    return {"status": "PASS", "evidence": "No --no-verify usage detected in first-N turns."}


# ─── Rule 7 ───────────────────────────────────────────────────────────────────

_TAG_PATTERN = re.compile(r"\bv-[a-z][a-z0-9\-]+-[Kk][Nn]?\d+\b")

def rule_07_tag_convention(turns: list[dict]) -> dict:
    """Tag-on-close must match v-<descriptive>-K<INTEGER> convention."""
    full = _all_text(turns)
    matches = _TAG_PATTERN.findall(full)
    if matches:
        return {"status": "PASS", "evidence": f"Valid tag-on-close convention found: {matches[:3]}"}
    # Tags appear at Phase E / end-of-session — WARN if not visible yet in first-N
    return {"status": "WARN", "evidence": "Tag-on-close pattern not yet visible in first-N turns. Expected at Phase E."}


# ─── Rule 8 ───────────────────────────────────────────────────────────────────

_COUNSEL_GATE_PATTERNS = [
    re.compile(r"wait for.*counsel", re.IGNORECASE),
    re.compile(r"counsel.*before.*proceed", re.IGNORECASE),
    re.compile(r"need.*counsel.*approval", re.IGNORECASE),
    re.compile(r"hold.*for.*counsel", re.IGNORECASE),
    re.compile(r"pending.*counsel", re.IGNORECASE),
]

def rule_08_no_counsel_gate(turns: list[dict]) -> dict:
    """No counsel-gate language (gating actions on counsel approval) per feedback_dont_gate_on_counsel.md."""
    full = _all_text(turns)
    for pat in _COUNSEL_GATE_PATTERNS:
        if pat.search(full):
            return {"status": "FAIL", "evidence": "Counsel-gate language detected. Violates feedback_dont_gate_on_counsel.md."}
    return {"status": "PASS", "evidence": "No counsel-gate language detected."}


# ─── Rule 9 ───────────────────────────────────────────────────────────────────

_PROSE_TIMING_PATTERNS = [
    re.compile(r"prose pass.*before.*fire", re.IGNORECASE),
    re.compile(r"draft.*before.*founder.*approval", re.IGNORECASE),
    re.compile(r"pre-draft.*prose", re.IGNORECASE),
    re.compile(r"prose.*ready.*before.*ratif", re.IGNORECASE),
    re.compile(r"prepare.*prose.*before.*launch", re.IGNORECASE),
]

def rule_09_no_prose_timing_pressure(turns: list[dict]) -> dict:
    """No prose-pass-timing pressure per feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md."""
    full = _all_text(turns)
    for pat in _PROSE_TIMING_PATTERNS:
        if pat.search(full):
            return {"status": "FAIL", "evidence": "Prose-pass-timing pressure detected. Violates no-pre-drafting rule."}
    return {"status": "PASS", "evidence": "No prose-pass-timing pressure detected."}


# ─── Rule 10 ──────────────────────────────────────────────────────────────────

_HOLLOW_PRAISE_PATTERNS = [
    re.compile(r"\bbrilliant\b.*\!", re.IGNORECASE),
    re.compile(r"\bincredible\b.*\!", re.IGNORECASE),
    re.compile(r"\bamazing\b.*\!", re.IGNORECASE),
    re.compile(r"\bgolden\b.*\!", re.IGNORECASE),
    re.compile(r"\bperfect\b.*\!", re.IGNORECASE),
    re.compile(r"\boutstanding\b.*\!", re.IGNORECASE),
    re.compile(r"\bexcellent\b.*\!", re.IGNORECASE),
    re.compile(r"(?:I love|love it|great idea).*\!", re.IGNORECASE),
]

def rule_10_empirical_praise_only(turns: list[dict]) -> dict:
    """Praise must be empirically valid; hollow/hyperbolic praise violates feedback_empirically_valid_praise_only.md."""
    assistant_text = "\n".join(
        _text_of(t.get("content", "")) for t in turns if t.get("role") == "assistant"
    )
    violations = []
    for pat in _HOLLOW_PRAISE_PATTERNS:
        matches = pat.findall(assistant_text)
        if matches:
            violations.extend(matches[:2])
    if violations:
        return {"status": "WARN", "evidence": f"Potentially hollow praise patterns detected: {violations[:3]}. Review for empirical grounding."}
    return {"status": "PASS", "evidence": "No hollow/hyperbolic praise patterns detected in assistant turns."}


# ─── Dispatch table ────────────────────────────────────────────────────────────

RULES: list[tuple[str, Any]] = [
    ("R01_brief_me_first", rule_01_brief_me_first),
    ("R02_codecopy_ask_second", rule_02_codecopy_ask_second),
    ("R03_drift_surfaced", rule_03_drift_surfaced),
    ("R04_wrasse_absorbed", rule_04_wrasse_absorbed),
    ("R05_augur_fresh", rule_05_augur_fresh),
    ("R06_no_verify_absent", rule_06_no_verify_absent),
    ("R07_tag_convention", rule_07_tag_convention),
    ("R08_no_counsel_gate", rule_08_no_counsel_gate),
    ("R09_no_prose_timing_pressure", rule_09_no_prose_timing_pressure),
    ("R10_empirical_praise_only", rule_10_empirical_praise_only),
]
