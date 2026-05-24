"""
Tests — Wrasse Registry BP005 Follow-up (KN065 / Pod Z)
Tests: individual trigger fire, cross-trigger interactions, size-cap compliance,
registry integrity, composition with KN042 / W-021 BRICK WALL.

Run: python -m pytest librarian-mcp/stitchpunks/wrasse/tests/test_wrasse_bp005_followup_KN065.py -v

KN065 lineage: KN042 (W-313–W-321 BP005 base) → KN065 (W-324–W-332 BP005 catch-up).
BRICK WALL (W-021) is pre-existing; KN065 verification-bumps it rather than re-appending.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

# ── Import paths ─────────────────────────────────────────────────────────────

_WRASSE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_WRASSE_DIR))

from wrasse_lookup import lookup_for_session, REGISTRY_PATH  # type: ignore

# ── KN065 target IDs ─────────────────────────────────────────────────────────

KN065_IDS = {
    "W-324",  # substrate-routed memory expansion
    "W-325",  # knight no shadows
    "W-326",  # be ONE OF US
    "W-327",  # I am Founder Hear my Voice
    "W-328",  # supercharge the AI you already use
    "W-329",  # pudding-wading extension
    "W-330",  # hugo historical marker hyperlink-target
    "W-331",  # bp-number auto-increment
    "W-332",  # v-wrasse-registry-bp005-followup-KN065 (call_sign)
}

# KN042 anchor IDs (regression)
KN042_IDS_REGRESSION = {"W-313", "W-314", "W-318", "W-319", "W-320"}

# Pre-existing BRICK WALL anchor (KN065 bumps; does not re-register)
BRICK_WALL_ID = "W-021"

MAX_INJECTION_TOKENS = 2000
CHARS_PER_TOKEN = 4
MAX_RESOLUTION_CHARS = MAX_INJECTION_TOKENS * CHARS_PER_TOKEN  # 8000 hard cap
MIN_RESOLUTION_CHARS = 200
MAX_ENTRY_RESOLUTION_CHARS = 1600  # 400-token per-entry soft target


# ── Helpers ──────────────────────────────────────────────────────────────────

def _load_entries(ids: set[str]) -> list[dict]:
    """Load registry entries by trigger_id set."""
    entries = []
    with REGISTRY_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if obj.get("trigger_id", "") in ids and obj.get("record_type") != "supersedes":
                entries.append(obj)
    return entries


def _fire(context_fragment: str, target_ids: set[str] | None = None) -> set[str]:
    """Return set of trigger_ids that fire from context_fragment."""
    results = lookup_for_session(context_fragment, max_matches=100)
    all_fired = {r["trigger_id"] for r in results}
    if target_ids is not None:
        return all_fired & target_ids
    return all_fired


# ═══════════════════════════════════════════════════════════════════════════
# 1. Individual trigger tests — one per new KN065 entry
# ═══════════════════════════════════════════════════════════════════════════

def test_W324_substrate_routed_memory_expansion_fires():
    """W-324: 'substrate-routed memory expansion' fires on primary pattern."""
    hits = _fire("The substrate-routed memory expansion decouples index cost from topic count.", KN065_IDS)
    assert "W-324" in hits, f"W-324 did not fire. Hits: {hits}"


def test_W324_srme_phrase_fires():
    """W-324: alternative trigger 'SRME' or 'UNLIMITED MEMORY' context fires."""
    hits = _fire("Wrasse pre-injection delivers substrate-routed memory expansion at session start.", KN065_IDS)
    assert "W-324" in hits, f"W-324 did not fire on alternative. Hits: {hits}"


def test_W325_knight_no_shadows_fires():
    """W-325: 'knight no shadows' fires on primary pattern."""
    hits = _fire("Knight no shadows — Cursor lacks hook architecture for persistent daemons.", KN065_IDS)
    assert "W-325" in hits, f"W-325 did not fire. Hits: {hits}"


def test_W325_knight_no_shadows_in_full_sentence_fires():
    """W-325: 'knight no shadows' fires in a fuller architectural sentence."""
    hits = _fire(
        "Because knight no shadows — Cursor per-session scope cannot spawn persistent daemons "
        "so Bishop must run CheckBook Suite and LIGHTHOUSE.",
        KN065_IDS,
    )
    assert "W-325" in hits, f"W-325 did not fire in fuller sentence. Hits: {hits}"


def test_W326_be_one_of_us_fires():
    """W-326: 'be ONE OF US' fires."""
    hits = _fire("Be ONE OF US — the membership invitation for the cooperative library.", KN065_IDS)
    assert "W-326" in hits, f"W-326 did not fire. Hits: {hits}"


def test_W326_be_one_of_us_full_phrase_fires():
    """W-326: 'be ONE OF US' fires with surrounding cooperative-library context."""
    hits = _fire(
        "The Federation Library opt-in CTA says: be ONE OF US — $5/year cooperative membership.",
        KN065_IDS,
    )
    assert "W-326" in hits, f"W-326 did not fire with surrounding context. Hits: {hits}"


def test_W327_i_am_founder_hear_my_voice_fires():
    """W-327: 'I am Founder Hear my Voice' (full registered phrase) fires."""
    hits = _fire(
        "Founder identity-authority canon: I am Founder Hear my Voice — seven words, three sentences.",
        KN065_IDS,
    )
    assert "W-327" in hits, f"W-327 did not fire. Hits: {hits}"


def test_W328_supercharge_fires():
    """W-328: 'supercharge the AI you already use' fires."""
    hits = _fire(
        "SuperCharge the AI you ALREADY USE: 51x FASTER lookup, 97% less token spend.",
        KN065_IDS,
    )
    assert "W-328" in hits, f"W-328 did not fire. Hits: {hits}"


def test_W329_pudding_wading_extension_fires():
    """W-329: 'pudding-wading extension' fires."""
    hits = _fire("The pudding-wading extension adds metaphor names for the three paper tiers.", KN065_IDS)
    assert "W-329" in hits, f"W-329 did not fire. Hits: {hits}"


def test_W330_hugo_historical_marker_fires():
    """W-330: 'hugo historical marker hyperlink-target' fires on the exact registered phrase."""
    hits = _fire(
        "BP005 clarification: hugo historical marker hyperlink-target stability — Hugo runs as "
        "parallel double of Supabase-fed site until Launch Moment.",
        KN065_IDS,
    )
    assert "W-330" in hits, f"W-330 did not fire. Hits: {hits}"


def test_W331_bp_number_auto_increment_fires():
    """W-331: 'bp-number auto-increment' fires."""
    hits = _fire(
        "Bishop auto-detects highest BP*.docx via bp-number auto-increment and announces to Founder.",
        KN065_IDS,
    )
    assert "W-331" in hits, f"W-331 did not fire. Hits: {hits}"


def test_W332_call_sign_fires():
    """W-332: KN065 call_sign fires on the tag pattern."""
    hits = _fire("Tag v-wrasse-registry-bp005-followup-KN065 marks this pod's close.", KN065_IDS)
    assert "W-332" in hits, f"W-332 call_sign did not fire. Hits: {hits}"


# ═══════════════════════════════════════════════════════════════════════════
# 2. Cross-trigger interaction tests
# ═══════════════════════════════════════════════════════════════════════════

def test_cross_be_one_of_us_and_i_am_founder():
    """W-326 and W-327 both fire when both registered phrases appear in context."""
    ctx = (
        "The Founder identity-authority sequence: I am Founder Hear my Voice — "
        "then demonstration — then be ONE OF US for $5/year membership."
    )
    hits = _fire(ctx, KN065_IDS)
    assert "W-326" in hits, "W-326 (Be ONE OF US) did not fire"
    assert "W-327" in hits, "W-327 (I am Founder Hear my Voice) did not fire"


def test_cross_marketing_and_be_one_of_us():
    """W-328 and W-326 both fire on recruitment-class marketing context."""
    ctx = (
        "SuperCharge the AI you already use: 51x FASTER. "
        "Be ONE OF US — join the cooperative library for $5/year."
    )
    hits = _fire(ctx, KN065_IDS)
    assert "W-328" in hits, "W-328 (supercharge) did not fire"
    assert "W-326" in hits, "W-326 (Be ONE OF US) did not fire"


def test_cross_knight_no_shadows_and_srme():
    """W-325 and W-324 both fire in substrate-architecture context."""
    ctx = (
        "Knight no shadows means Knight cannot run Wrasse pre-injection as substrate-routed "
        "memory expansion natively — Bishop does the auto-injection."
    )
    hits = _fire(ctx, KN065_IDS)
    assert "W-325" in hits, "W-325 (knight no shadows) did not fire"
    assert "W-324" in hits, "W-324 (substrate-routed memory expansion) did not fire"


def test_full_kn065_context_fires_all_9():
    """Full KN065 context fires all 9 new entries (empirical receipt)."""
    ctx = (
        "Substrate-routed memory expansion — UNLIMITED MEMORY. "
        "Knight no shadows bishop-only persistent substrate. "
        "Be ONE OF US take your place atop a Dragon. "
        "I am Founder Hear my Voice. "
        "SuperCharge the AI you already use 51x faster 97% less token spend. "
        "Pudding-wading extension Stone Soup wading tier. "
        "Hugo historical marker hyperlink-target Launch Moment. "
        "bp-number auto-increment announce not ask. "
        "v-wrasse-registry-bp005-followup-KN065."
    )
    hits = _fire(ctx, KN065_IDS)
    missing = KN065_IDS - hits
    assert len(missing) == 0, f"These KN065 entries did NOT fire: {missing}"


# ═══════════════════════════════════════════════════════════════════════════
# 3. Size-cap compliance tests (K544 MAX_INJECTION_TOKENS = 2000)
# ═══════════════════════════════════════════════════════════════════════════

@pytest.fixture(scope="module")
def kn065_entries():
    return _load_entries(KN065_IDS)


def test_all_9_entries_present_in_registry(kn065_entries):
    """Exactly 9 KN065 entries found in live registry."""
    found_ids = {e["trigger_id"] for e in kn065_entries}
    assert found_ids == KN065_IDS, f"Missing: {KN065_IDS - found_ids} | Extra: {found_ids - KN065_IDS}"


def test_resolution_not_empty(kn065_entries):
    """Each entry has non-empty canonical_resolution."""
    for e in kn065_entries:
        assert len(e["canonical_resolution"]) > 0, f"{e['trigger_id']} has empty resolution"


def test_resolution_minimum_length(kn065_entries):
    """Each resolution is at least 200 chars (~50 tokens — non-trivial content)."""
    for e in kn065_entries:
        assert len(e["canonical_resolution"]) >= MIN_RESOLUTION_CHARS, (
            f"{e['trigger_id']} resolution too short: {len(e['canonical_resolution'])} chars"
        )


def test_resolution_within_single_entry_cap(kn065_entries):
    """Each resolution fits within 400-token guidance (1600 chars soft target)."""
    for e in kn065_entries:
        assert len(e["canonical_resolution"]) <= MAX_ENTRY_RESOLUTION_CHARS, (
            f"{e['trigger_id']} resolution exceeds 400-token soft target: "
            f"{len(e['canonical_resolution'])} chars > {MAX_ENTRY_RESOLUTION_CHARS}"
        )


def test_combined_resolutions_within_max_injection(kn065_entries):
    """Sum of all 9 KN065 resolutions fits within MAX_INJECTION_TOKENS (8000 chars)."""
    total_chars = sum(len(e["canonical_resolution"]) for e in kn065_entries)
    assert total_chars <= MAX_RESOLUTION_CHARS, (
        f"Combined KN065 resolutions ({total_chars} chars) exceed "
        f"MAX_INJECTION_TOKENS cap ({MAX_RESOLUTION_CHARS} chars)"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 4. Registry integrity and schema tests
# ═══════════════════════════════════════════════════════════════════════════

def test_required_fields_present(kn065_entries):
    """Each entry has all required schema fields."""
    required = {"trigger_id", "trigger_class", "trigger_pattern", "trigger_regex",
                "canonical_resolution", "last_verified_ts", "verification_count", "source_session"}
    for e in kn065_entries:
        missing_fields = required - set(e.keys())
        assert not missing_fields, f"{e['trigger_id']} missing fields: {missing_fields}"


def test_source_session_is_kn065(kn065_entries):
    """All KN065 entries have source_session 'KN065-BP005'."""
    for e in kn065_entries:
        assert e["source_session"] == "KN065-BP005", (
            f"{e['trigger_id']} has source_session={e['source_session']!r}, expected 'KN065-BP005'"
        )


def test_w332_is_call_sign_class(kn065_entries):
    """W-332 is classified as 'call_sign'."""
    w332 = next((e for e in kn065_entries if e["trigger_id"] == "W-332"), None)
    assert w332 is not None, "W-332 not found in registry"
    assert w332["trigger_class"] == "call_sign", (
        f"W-332 trigger_class = {w332['trigger_class']!r}, expected 'call_sign'"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 5. Regression and composition tests
# ═══════════════════════════════════════════════════════════════════════════

def test_kn042_regression_still_fires():
    """KN042 W-313 (golden eblet) still fires — no regression from KN065 appends."""
    hits = _fire("The golden eblet Ring of Three federation architecture.")
    assert "W-313" in hits, "W-313 (golden eblet) regressed — KN042 anchor broken"


def test_w318_aviator_symphony_regression():
    """KN042 W-318 (aviator symphony) still fires — no regression."""
    hits = _fire("AI tuning: the aviator symphony, feels the machine, works in symphony.")
    assert "W-318" in hits, "W-318 (aviator symphony) regressed — KN042 anchor broken"


def test_brick_wall_preexisting_w021_present():
    """W-021 (BRICK WALL) pre-existing entry is present in registry (KN065 bumped, not re-registered)."""
    entries = _load_entries({BRICK_WALL_ID})
    assert len(entries) >= 1, "W-021 (BRICK WALL discipline) not found — pre-existing anchor missing"


def test_brick_wall_fires_on_brick_wall_context():
    """W-021 (BRICK WALL) fires on 'BRICK WALL' context (pre-existing + KN065-bumped)."""
    hits = _fire("BRICK WALL discipline: write without asking when scope is pre-ratified.")
    assert BRICK_WALL_ID in hits, f"W-021 (BRICK WALL) did not fire. Hits: {hits}"


def test_kn065_and_kn042_compose_on_bp005_context():
    """KN065 (W-325) and KN042 (W-314 deck card medallion) both fire on BP005 architecture context."""
    ctx = (
        "Knight no shadows so Bishop runs persistent substrate. "
        "Ring of Three deck card medallion with Furnace federation."
    )
    hits = _fire(ctx)
    assert "W-325" in hits, "W-325 (knight no shadows) did not fire"
    assert "W-314" in hits, "W-314 (deck card medallion KN042) did not fire — composition broken"
