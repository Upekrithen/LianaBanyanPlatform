"""
Tests — Wrasse Registry CANON Eblet Expansion (KN042 / BP005)
Tests: individual trigger fire, cross-trigger interactions, size-cap compliance,
EBLET_PATH trigger class, Augur Living Gate composition, schema validation.

Run: python -m pytest librarian-mcp/stitchpunks/wrasse/tests/test_wrasse_canon_eblet_expansion_KN042.py -v

KN042 lineage: KN036 → KN037 → KN038 (BP004 close) → KN042 = 61st consecutive clean.
"""

from __future__ import annotations

import json
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import pytest

# ── Import paths ────────────────────────────────────────────────────────────

_WRASSE_DIR = Path(__file__).parent.parent
_DISCIPLINE_DIR = _WRASSE_DIR.parent.parent.parent / "discipline_wing"
sys.path.insert(0, str(_WRASSE_DIR))
sys.path.insert(0, str(_DISCIPLINE_DIR.parent))

from wrasse_lookup import lookup_for_session, REGISTRY_PATH  # type: ignore
from wrasse_registry_writer import _classify_trigger, append_if_new  # type: ignore

# ── KN042 target IDs ────────────────────────────────────────────────────────

KN042_IDS = {"W-313", "W-314", "W-315", "W-316", "W-317", "W-318", "W-319", "W-320"}

# MAX_INJECTION_TOKENS from wrasse_inject (2000 per K544 cap spec)
MAX_INJECTION_TOKENS = 2000
# 1 token ≈ 4 chars (rough; used for size-cap compliance check only)
CHARS_PER_TOKEN = 4
MAX_RESOLUTION_CHARS = MAX_INJECTION_TOKENS * CHARS_PER_TOKEN  # 8000 chars absolute ceiling

# Per-entry spec: 200-400 tokens = 800-1600 chars guidance (soft target)
MIN_RESOLUTION_CHARS = 200
MAX_ENTRY_RESOLUTION_CHARS = 1600  # 400 tokens


# ── Helpers ─────────────────────────────────────────────────────────────────

def _load_kn042_entries() -> list[dict]:
    """Load W-313..W-320 from the live registry."""
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
            if obj.get("trigger_id", "") in KN042_IDS:
                entries.append(obj)
    return entries


def _fire(context_fragment: str) -> set[str]:
    """Return set of trigger_ids fired from context_fragment."""
    results = lookup_for_session(context_fragment, max_matches=50)
    return {r["trigger_id"] for r in results if r["trigger_id"] in KN042_IDS}


# ═══════════════════════════════════════════════════════════════════════════
# 1. Individual trigger tests — one per entry (8 tests)
# ═══════════════════════════════════════════════════════════════════════════

def test_W313_golden_eblet_fires():
    """W-313: 'golden eblet' fires on the primary trigger pattern."""
    hits = _fire("We are working on the golden eblet architecture.")
    assert "W-313" in hits, f"W-313 did not fire. All hits: {hits}"


def test_W313_ring_of_three_fires():
    """W-313 regex covers 'ring of three' alternative."""
    hits = _fire("The Ring of Three is the authority architecture.")
    assert "W-313" in hits


def test_W314_deck_card_medallion_fires():
    """W-314: 'deck card medallion' fires."""
    hits = _fire("Each Eblet is a deck card medallion with Emblem and QR code.")
    assert "W-314" in hits


def test_W315_multi_layer_authority_fires():
    """W-315: 'multi-layer authority' fires."""
    hits = _fire("The multi-layer authority pattern recurses from L1 to L_n.")
    assert "W-315" in hits


def test_W315_successive_layer_fires():
    """W-315 regex covers 'successive layer of authority' alternative."""
    hits = _fire("Each successive layer of authority gets its own Ring.")
    assert "W-315" in hits


def test_W316_social_authority_dag_fires():
    """W-316: 'social-authority DAG' fires."""
    hits = _fire("The social-authority DAG overlays Guilds and Tribes.")
    assert "W-316" in hits


def test_W316_pheromone_anchored_decision_fires():
    """W-316 regex covers 'pheromone-anchored decision' (singular) alternative."""
    # Regex requires singular 'decision' after 'pheromone-anchored'; use exact form.
    hits = _fire("The pheromone-anchored decision was recorded to the golden tablet.")
    assert "W-316" in hits


def test_W317_skipping_stones_fires():
    """W-317: 'skipping stones' fires."""
    hits = _fire("The Skipping Stones navigation pattern has three depth tiers.")
    assert "W-317" in hits


def test_W317_wading_fires():
    """W-317 regex covers 'wading' tier alternative."""
    hits = _fire("The wading tier is the More Details section.")
    assert "W-317" in hits


def test_W317_diving_in_fires():
    """W-317 regex covers 'diving in' tier alternative."""
    hits = _fire("Diving In is the In Depth / Pudding tier.")
    assert "W-317" in hits


def test_W318_aviator_symphony_fires():
    """W-318: 'aviator symphony' fires."""
    hits = _fire("AI Tuning: the aviator symphony — feels the machine.")
    assert "W-318" in hits


def test_W318_ai_tuning_fires():
    """W-318 regex covers 'AI tuning' alternative."""
    hits = _fire("AI tuning is the compounding discipline behind the substrate.")
    assert "W-318" in hits


def test_W318_extension_of_self_fires():
    """W-318 regex covers 'extension of self' alternative."""
    hits = _fire("The AI becomes an extension of self, a capability granted.")
    assert "W-318" in hits


def test_W319_hugo_parallel_double_fires():
    """W-319: 'hugo parallel double' fires."""
    hits = _fire("Hugo parallel double runs until the Launch Moment.")
    assert "W-319" in hits


def test_W319_supabase_authority_fires():
    """W-319 regex covers 'supabase authority' alternative."""
    hits = _fire("Supabase authority is the source of truth for Cephas content.")
    assert "W-319" in hits


def test_W320_eblet_path_fires():
    """W-320: 'state/eblets/CANON' fires."""
    hits = _fire("The canon eblets live at state/eblets/CANON directory.")
    assert "W-320" in hits


# ═══════════════════════════════════════════════════════════════════════════
# 2. Cross-trigger interaction tests
# ═══════════════════════════════════════════════════════════════════════════

def test_cross_golden_and_deck_card():
    """W-313 and W-314 both fire when context mentions both primitives."""
    ctx = "The golden eblet IS a deck card medallion."
    hits = _fire(ctx)
    assert "W-313" in hits, "W-313 did not fire"
    assert "W-314" in hits, "W-314 did not fire"


def test_cross_social_dag_and_skipping_stones():
    """W-316 and W-317 both fire on social + navigation context."""
    ctx = "Guild decisions via social-authority DAG; papers use skipping stones navigation."
    hits = _fire(ctx)
    assert "W-316" in hits
    assert "W-317" in hits


def test_cross_multi_layer_and_pheromone():
    """W-315 and W-316 both fire when multi-layer + pheromone terms appear."""
    # W-316 regex matches singular 'pheromone-anchored decision'; use exact form.
    ctx = "Multi-layer authority recursion at L3 uses a pheromone-anchored decision pattern."
    hits = _fire(ctx)
    assert "W-315" in hits
    assert "W-316" in hits


def test_full_bp005_context_fires_all_8():
    """Full BP005 context fires all 8 new KN042 entries (empirical receipt)."""
    ctx = (
        "Ring of Three golden eblet. Deck card medallion Emblem QR. "
        "Multi-layer authority recursive Ring. Social-authority DAG pheromone-anchored decision. "
        "Skipping stones wading diving in pudding tier. "
        "Aviator symphony AI tuning extension of self. "
        "Hugo parallel double supabase authority Launch Moment. "
        "state/eblets/CANON GOLDEN eblet_path."
    )
    hits = _fire(ctx)
    missing = KN042_IDS - hits
    assert len(missing) == 0, f"These KN042 entries did NOT fire: {missing}"


# ═══════════════════════════════════════════════════════════════════════════
# 3. Size-cap compliance tests (K544 MAX_INJECTION_TOKENS = 2000)
# ═══════════════════════════════════════════════════════════════════════════

@pytest.fixture(scope="module")
def kn042_entries():
    return _load_kn042_entries()


def test_all_8_entries_present_in_registry(kn042_entries):
    """Exactly 8 KN042 entries found in live registry."""
    found_ids = {e["trigger_id"] for e in kn042_entries}
    assert found_ids == KN042_IDS, f"Missing: {KN042_IDS - found_ids} | Extra: {found_ids - KN042_IDS}"


def test_resolution_not_empty(kn042_entries):
    """Each entry has non-empty canonical_resolution."""
    for e in kn042_entries:
        assert len(e["canonical_resolution"]) > 0, f"{e['trigger_id']} has empty resolution"


def test_resolution_minimum_length(kn042_entries):
    """Each resolution is at least 200 chars (≈50 tokens — non-trivial content)."""
    for e in kn042_entries:
        assert len(e["canonical_resolution"]) >= MIN_RESOLUTION_CHARS, (
            f"{e['trigger_id']} resolution too short: {len(e['canonical_resolution'])} chars"
        )


def test_resolution_within_single_entry_cap(kn042_entries):
    """Each resolution fits within 400-token guidance (1600 chars soft target)."""
    for e in kn042_entries:
        assert len(e["canonical_resolution"]) <= MAX_ENTRY_RESOLUTION_CHARS, (
            f"{e['trigger_id']} resolution exceeds 400-token soft target: "
            f"{len(e['canonical_resolution'])} chars > {MAX_ENTRY_RESOLUTION_CHARS}"
        )


def test_combined_resolutions_within_max_injection(kn042_entries):
    """Sum of all 8 KN042 resolutions fits within MAX_INJECTION_TOKENS total (2000 tokens = 8000 chars)."""
    total_chars = sum(len(e["canonical_resolution"]) for e in kn042_entries)
    assert total_chars <= MAX_RESOLUTION_CHARS, (
        f"Combined KN042 resolutions ({total_chars} chars) exceed "
        f"MAX_INJECTION_TOKENS cap ({MAX_RESOLUTION_CHARS} chars)"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 4. EBLET_PATH trigger class tests
# ═══════════════════════════════════════════════════════════════════════════

def test_schema_includes_eblet_path():
    """schema.json enum includes 'eblet_path' after KN042 update."""
    schema_path = _WRASSE_DIR / "schema.json"
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    trigger_class_enum = schema["properties"]["trigger_class"]["enum"]
    assert "eblet_path" in trigger_class_enum, (
        f"'eblet_path' not found in schema.json trigger_class enum: {trigger_class_enum}"
    )


def test_classifier_auto_detects_eblet_path():
    """_classify_trigger returns 'eblet_path' for state/eblets/ paths."""
    assert _classify_trigger("state/eblets/CANON") == "eblet_path"
    assert _classify_trigger("~/.claude/state/eblets/BP005/foo.eblet.md") == "eblet_path"
    assert _classify_trigger("anything.eblet.md") == "eblet_path"


def test_classifier_file_path_still_works():
    """_classify_trigger still returns 'file_path' for non-eblet paths."""
    assert _classify_trigger("librarian-mcp/stitchpunks/wrasse/wrasse_registry.jsonl") == "file_path"
    assert _classify_trigger("platform/src/App.tsx") == "file_path"


def test_W320_has_eblet_path_class(kn042_entries):
    """W-320 is classified as 'eblet_path' in the live registry."""
    w320 = next((e for e in kn042_entries if e["trigger_id"] == "W-320"), None)
    assert w320 is not None, "W-320 not found in registry"
    assert w320["trigger_class"] == "eblet_path", (
        f"W-320 trigger_class = {w320['trigger_class']!r}, expected 'eblet_path'"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 5. Augur Living Gate composition test
# ═══════════════════════════════════════════════════════════════════════════

def test_augur_living_gate_module_importable():
    """augur_living_gate.py is importable from discipline_wing (composition check)."""
    try:
        import importlib
        spec = importlib.util.spec_from_file_location(
            "augur_living_gate",
            _DISCIPLINE_DIR / "augur_living_gate.py",
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert hasattr(module, "is_gate_open"), "is_gate_open not found in augur_living_gate"
        assert hasattr(module, "HARD_CEILING_SECONDS"), "HARD_CEILING_SECONDS not found"
    except Exception as exc:
        pytest.fail(f"augur_living_gate import failed: {exc}")


def test_augur_living_gate_w267_resolution_present():
    """W-267 Augur Living Gate entry is in the Wrasse registry (pre-existing, confirms composition)."""
    results = lookup_for_session("augur_living_gate", max_matches=50)
    found = [r for r in results if r["trigger_id"] == "W-267"]
    assert len(found) == 1, (
        "W-267 (augur_living_gate) not found in registry — composition anchor missing"
    )


def test_wrasse_and_augur_both_fire_on_kn042_context():
    """W-313 (golden eblet) AND W-267 (augur_living_gate) both fire on a session that uses both."""
    ctx = (
        "KN042 session: golden eblet Ring of Three expansion. "
        "Augur Living Gate freshness check: augur_living_gate is_gate_open confirms re-consult needed."
    )
    results = lookup_for_session(ctx, max_matches=50)
    ids_fired = {r["trigger_id"] for r in results}
    assert "W-313" in ids_fired, "W-313 (golden eblet) did not fire"
    assert "W-267" in ids_fired, "W-267 (augur_living_gate) did not fire — composition broken"


# ═══════════════════════════════════════════════════════════════════════════
# 6. Writer integration — eblet_path class appends correctly
# ═══════════════════════════════════════════════════════════════════════════

def test_append_eblet_path_entry_to_temp_registry(tmp_path):
    """append_if_new auto-classifies eblet_path and writes a valid entry."""
    tmp_reg = tmp_path / "wrasse_registry_test.jsonl"
    result = append_if_new(
        trigger_pattern="state/eblets/TEST/some_path.eblet.md",
        trigger_class=None,  # Let classifier infer
        canonical_resolution="Test CANON eblet at state/eblets/TEST/. KN042 eblet_path class seed.",
        source_session="KN042-test",
        path=tmp_reg,
    )
    assert result["action"] == "appended"
    assert result["trigger_id"].startswith("W-")

    # Verify classification
    with tmp_reg.open(encoding="utf-8") as fh:
        entries = [json.loads(line) for line in fh if line.strip()]
    assert len(entries) == 1
    assert entries[0]["trigger_class"] == "eblet_path"
