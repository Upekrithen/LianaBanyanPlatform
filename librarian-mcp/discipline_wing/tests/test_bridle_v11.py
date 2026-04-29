"""
Unit tests — BRIDLE v11 (K-Founder-Edict-Propagation/B133)

Scope D.1 from the K-Founder-Edict-Propagation prompt:
  - BRIDLE-Rule-11A loads correctly
  - BRIDLE-Rule-11B loads correctly
  - Version bump v10 -> v11 reflected in registry

Scope D.2 — Wrasse lookup verification:
  - "counsel review" -> matches WV-counsel entry; canonical_resolution returned
  - "prose-pass at fire-time" -> matches WV-prose-pass entry; resolution returned
  - "Edict" -> matches WV-Edict entry; resolution returned

Scope D.3 — Pawn dispatch context:
  - PawnHandoffs.jsonl contains cross-agent edict directive entry

Run: python -m pytest librarian-mcp/discipline_wing/tests/test_bridle_v11.py -v
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

_LIB = Path(__file__).parent.parent.parent  # librarian-mcp/

BRIDLE_JSON = _LIB / "discipline_wing" / "bridle_rules.json"
WRASSE_REGISTRY = _LIB / "stitchpunks" / "wrasse" / "wrasse_registry.jsonl"
PAWN_HANDOFFS = _LIB / "stitchpunks" / "pawn_cathedral" / "scribes" / "PawnHandoffs.jsonl"


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def bridle_data():
    assert BRIDLE_JSON.exists(), f"bridle_rules.json not found at {BRIDLE_JSON}"
    return json.loads(BRIDLE_JSON.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def wrasse_records():
    assert WRASSE_REGISTRY.exists(), f"wrasse_registry.jsonl not found"
    records = []
    for line in WRASSE_REGISTRY.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return records


@pytest.fixture(scope="module")
def pawn_handoff_records():
    assert PAWN_HANDOFFS.exists(), f"PawnHandoffs.jsonl not found at {PAWN_HANDOFFS}"
    records = []
    for line in PAWN_HANDOFFS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return records


# ─── Scope D.1: BRIDLE v11 rules + version ────────────────────────────────────

def test_bridle_version_is_11(bridle_data):
    assert bridle_data["bridle_version"] == 11, (
        f"Expected bridle_version=11, got {bridle_data['bridle_version']}"
    )


def test_bridle_ratified_b133(bridle_data):
    assert bridle_data["ratified_session"] == "B133"


def test_bridle_rule_11a_exists(bridle_data):
    rules_by_id = {r["rule_id"]: r for r in bridle_data["rules"]}
    assert "Rule-11A" in rules_by_id, "Rule-11A not found in bridle_rules.json"


def test_bridle_rule_11b_exists(bridle_data):
    rules_by_id = {r["rule_id"]: r for r in bridle_data["rules"]}
    assert "Rule-11B" in rules_by_id, "Rule-11B not found in bridle_rules.json"


def test_bridle_rule_11a_counsel_no_gate(bridle_data):
    rule = next(r for r in bridle_data["rules"] if r["rule_id"] == "Rule-11A")
    text_lower = rule["text"].lower()
    assert "counsel" in text_lower
    assert "gate" in text_lower or "never" in text_lower
    assert rule.get("founder_edict") is True
    assert rule.get("reference_memory_file") == "feedback_dont_gate_on_counsel.md"


def test_bridle_rule_11b_prose_pass(bridle_data):
    rule = next(r for r in bridle_data["rules"] if r["rule_id"] == "Rule-11B")
    text_lower = rule["text"].lower()
    assert "prose" in text_lower or "fire-time" in text_lower
    assert "publication" in text_lower
    assert rule.get("founder_edict") is True
    assert rule.get("reference_memory_file") == "feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md"


def test_bridle_version_history_includes_v11(bridle_data):
    versions = [v["version"] for v in bridle_data["version_history"]]
    assert "v11" in versions, f"v11 not in version history: {versions}"


def test_bridle_has_12_rules(bridle_data):
    """Rules 1-10 plus 11A + 11B = 12 total."""
    assert len(bridle_data["rules"]) == 12, (
        f"Expected 12 rules (1-10 + 11A + 11B), got {len(bridle_data['rules'])}"
    )


# ─── Scope D.2: Wrasse vocabulary lookup verification ─────────────────────────

def _match_wrasse(records: list[dict], query: str) -> list[dict]:
    """Simple substring match on trigger_pattern (case-insensitive)."""
    query_lower = query.lower()
    return [
        r for r in records
        if r.get("trigger_class") == "vocabulary"
        and r.get("trigger_pattern", "").lower() in query_lower
    ]


def test_wrasse_counsel_vocabulary_entry_exists(wrasse_records):
    matches = _match_wrasse(wrasse_records, "counsel review")
    assert matches, "No Wrasse vocabulary entry matched 'counsel review'"
    resolutions = [m["canonical_resolution"] for m in matches]
    assert any("Founder" in r or "gate" in r.lower() for r in resolutions), (
        f"Wrasse counsel resolution does not mention Founder or gate: {resolutions}"
    )


def test_wrasse_edict_vocabulary_entry_exists(wrasse_records):
    matches = _match_wrasse(wrasse_records, "Edict")
    assert matches, "No Wrasse vocabulary entry matched 'Edict'"
    resolutions = [m["canonical_resolution"] for m in matches]
    assert any("prose-pass" in r.lower() or "fire-time" in r.lower() for r in resolutions), (
        f"Wrasse Edict resolution does not mention prose-pass/fire-time: {resolutions}"
    )


def test_wrasse_prose_pass_vocabulary_entry_exists(wrasse_records):
    matches = _match_wrasse(wrasse_records, "prose-pass at fire-time")
    assert matches, "No Wrasse vocabulary entry matched 'prose-pass at fire-time'"


def test_wrasse_fire_time_vocabulary_entry_exists(wrasse_records):
    matches = _match_wrasse(wrasse_records, "fire-time")
    assert matches, "No Wrasse vocabulary entry matched 'fire-time'"


def test_wrasse_all_four_vocab_entries_have_founder_edict_flag(wrasse_records):
    edict_vocab = [r for r in wrasse_records if r.get("founder_edict") is True]
    assert len(edict_vocab) >= 4, (
        f"Expected at least 4 founder_edict=True vocabulary entries, got {len(edict_vocab)}"
    )


def test_wrasse_vocab_entries_have_source_session(wrasse_records):
    edict_vocab = [r for r in wrasse_records if r.get("founder_edict") is True]
    for entry in edict_vocab:
        assert "K-Founder-Edict-Propagation" in entry.get("source_session", ""), (
            f"Wrasse edict entry missing expected source_session: {entry.get('trigger_id')}"
        )


# ─── Scope D.3: Pawn dispatch context ─────────────────────────────────────────

def test_pawn_handoffs_contains_cross_agent_edict(pawn_handoff_records):
    edict_records = [
        r for r in pawn_handoff_records
        if r.get("directive_type") == "founder_edict_propagation"
        or "cross_agent_directive" in str(r.get("category", ""))
    ]
    assert edict_records, (
        "PawnHandoffs.jsonl does not contain a cross-agent edict directive entry."
    )


def test_pawn_edict_has_counsel_no_gate(pawn_handoff_records):
    edict_records = [
        r for r in pawn_handoff_records
        if r.get("directive_type") == "founder_edict_propagation"
    ]
    assert edict_records, "No founder_edict_propagation record in PawnHandoffs.jsonl"
    directives = edict_records[0].get("directives", {})
    assert "counsel_no_gate" in directives, (
        "Pawn edict directive missing counsel_no_gate sub-directive"
    )


def test_pawn_edict_has_founder_prose_pass(pawn_handoff_records):
    edict_records = [
        r for r in pawn_handoff_records
        if r.get("directive_type") == "founder_edict_propagation"
    ]
    directives = edict_records[0].get("directives", {})
    assert "founder_prose_pass_at_fire_time" in directives, (
        "Pawn edict directive missing founder_prose_pass_at_fire_time sub-directive"
    )


def test_pawn_edict_operator_mediated(pawn_handoff_records):
    edict_records = [
        r for r in pawn_handoff_records
        if r.get("directive_type") == "founder_edict_propagation"
    ]
    assert edict_records[0].get("operator_mediated_sig") is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
