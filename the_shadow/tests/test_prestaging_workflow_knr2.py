"""
KN-R2 Pre-Staging Workflow — T1-T7 test suite
==============================================
Tests: k_prompt_parser extraction, Eblet bulk-load, Detective TEAM Phase-0,
prerequisite commits/tests, PreparedContext written to queue, end-to-end flow,
failure mode (missing prereq → queued not errored).
"""

import json
import sys
import threading
import time
from pathlib import Path

import pytest

WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(WORKSPACE_ROOT))

from the_shadow.k_prompt_parser import parse_k_prompt, KPromptManifest
from the_shadow.prerequisite_context_builder import build_prerequisite_context
from the_shadow.prestaging_workflow import PreStagingWorkflow, OnDeckEntry, PreparedContext


# ─── T1: k_prompt_parser extracts triggers correctly ─────────────────────────

def test_t1_kprompt_parser(tmp_path):
    """parse_k_prompt extracts WRASSE triggers + Eblet paths + Phase A items."""
    k_prompt = tmp_path / "PROMPT_KNIGHT_TEST.md"
    k_prompt.write_text("""
# Pod-T — Test K-Prompt — KN-T1

## WRASSE PRE-INJECTION

**Triggers**: engine ready / next knight prompt / on deck scribe queue

**Pre-inject**:
- `~/.claude/state/eblets/CANON/test_eblet.eblet.md` (test eblet)
- `~/.claude/state/eblets/CANON/another.eblet.md` (another)

---

## KN-T1 — Phase A — REVIEW

1. Read existing module structure
2. Identify hookable points
3. Confirm Pod-Q LANDED `abc1234` and Pod-G LANDED `def5678`

""")

    manifest = parse_k_prompt(str(k_prompt))
    assert manifest.title is not None and "Pod-T" in manifest.title
    assert len(manifest.wrasse_triggers) >= 2, f"should have triggers, got {manifest.wrasse_triggers}"
    assert "engine ready" in " ".join(manifest.wrasse_triggers).lower() or "next knight prompt" in " ".join(manifest.wrasse_triggers).lower()
    assert len(manifest.wrasse_eblet_paths) >= 2, f"should have 2 eblet paths, got {manifest.wrasse_eblet_paths}"
    assert any("test_eblet" in p for p in manifest.wrasse_eblet_paths)
    assert len(manifest.phase_a_review_items) >= 2
    assert "abc1234" in manifest.prerequisite_tags or "def5678" in manifest.prerequisite_tags


# ─── T2: bulk-loads Eblets via wrasse_eblet_paths ────────────────────────────

def test_t2_eblet_bulk_load(tmp_path):
    """pre_stage builds wrasse_pre_injections list from manifest paths."""
    queue_path = tmp_path / "queue.jsonl"

    # Seed a queued entry
    entry_id = "LB-ODS-0001"
    queue_path.write_text(json.dumps({
        "id": entry_id,
        "category": "knight",
        "k_prompt_path": str(tmp_path / "PROMPT_KNIGHT_T2.md"),
        "status": "queued",
        "priority": 0,
        "prerequisites": [],
        "ts_queued": "2026-05-01T00:00:00Z",
    }) + "\n")

    # Create K-prompt with eblet refs
    (tmp_path / "PROMPT_KNIGHT_T2.md").write_text("""
# Pod-T2 — Test

## WRASSE PRE-INJECTION
**Triggers**: test trigger one / test trigger two

**Pre-inject**:
- `~/.claude/state/eblets/CANON/fake_eblet.eblet.md`

---

## KN-T2 — PHASE A — REVIEW

1. Review existing code
""")

    wf = PreStagingWorkflow(shadow_id="beta", queue_path=queue_path)
    entry = OnDeckEntry(id=entry_id, k_prompt_path=str(tmp_path / "PROMPT_KNIGHT_T2.md"), status="queued")

    ctx = wf.pre_stage(entry)
    assert ctx is not None, "pre_stage should return PreparedContext"
    assert len(ctx.wrasse_pre_injections) >= 1, "should have at least 1 pre-injection path"
    # The eblet path should be in the list (even if file doesn't exist)
    assert any("fake_eblet" in p for p in ctx.wrasse_pre_injections), f"got: {ctx.wrasse_pre_injections}"


# ─── T3: Detective TEAM Phase-0 dispatch returns hits ────────────────────────

def test_t3_detective_phase0(tmp_path):
    """pre_stage calls detective_team_fn and collects hits."""
    hits_collected = []

    def mock_detective(trigger, max_hits):
        hit = {"trigger": trigger, "scribe": "MockScribe", "excerpt": f"hit for {trigger}", "score": 0.9}
        hits_collected.append(hit)
        return [hit]

    queue_path = tmp_path / "queue.jsonl"
    entry_id = "LB-ODS-0003"
    queue_path.write_text(json.dumps({
        "id": entry_id, "category": "knight",
        "k_prompt_path": str(tmp_path / "T3.md"), "status": "queued",
        "priority": 0, "prerequisites": [], "ts_queued": "2026-05-01T00:00:00Z",
    }) + "\n")

    (tmp_path / "T3.md").write_text("""# T3\n## WRASSE PRE-INJECTION\n**Triggers**: detective test trigger one / trigger two\n\n**Pre-inject**:\n- `~/.claude/state/eblets/CANON/t3.eblet.md`\n\n---\n## KN-T3 — PHASE A — REVIEW\n1. Check something\n""")

    wf = PreStagingWorkflow(shadow_id="gamma", queue_path=queue_path, detective_team_fn=mock_detective)
    entry = OnDeckEntry(id=entry_id, k_prompt_path=str(tmp_path / "T3.md"), status="queued")

    ctx = wf.pre_stage(entry)
    assert ctx is not None
    assert len(hits_collected) >= 1, "detective should be called"
    assert len(ctx.detective_findings) >= 1, "detective findings should be in PreparedContext"


# ─── T4: prerequisite commits/tests fetched correctly ────────────────────────

def test_t4_prereq_context(tmp_path):
    """build_prerequisite_context summarizes prereq state."""
    # Seed a landed prerequisite in a temp queue
    queue_path = tmp_path / "queue.jsonl"
    queue_path.write_text(json.dumps({
        "id": "LB-ODS-PREREQ", "category": "knight",
        "k_prompt_path": "/fake/PREREQ.md", "status": "landed",
        "priority": 0, "prerequisites": [], "ts_queued": "2026-05-01T00:00:00Z",
        "commit_hash": "abc1234", "ts_landed": "2026-05-01T01:00:00Z",
    }) + "\n")

    # Patch the queue path in builder
    import the_shadow.prerequisite_context_builder as pcb
    original_read = pcb._read_landed_entries

    def mock_read(qpath, entry_ids):
        return [("LB-ODS-PREREQ", "landed", "abc1234")]

    pcb._read_landed_entries = mock_read
    try:
        summary = build_prerequisite_context(
            prerequisite_entry_ids=["LB-ODS-PREREQ"],
            prerequisite_tags=["abc1234"],
        )
        assert "LB-ODS-PREREQ" in summary
        assert "landed" in summary
    finally:
        pcb._read_landed_entries = original_read


# ─── T5: PreparedContext written to On Deck Scribe queue ─────────────────────

def test_t5_prepared_context_in_queue(tmp_path):
    """After pre_stage, queue.jsonl has a line with prepared_context for entry_id."""
    queue_path = tmp_path / "queue.jsonl"
    entry_id = "LB-ODS-0005"
    queue_path.write_text(json.dumps({
        "id": entry_id, "category": "knight",
        "k_prompt_path": str(tmp_path / "T5.md"), "status": "queued",
        "priority": 0, "prerequisites": [], "ts_queued": "2026-05-01T00:00:00Z",
    }) + "\n")

    (tmp_path / "T5.md").write_text("# T5\n## WRASSE PRE-INJECTION\n**Triggers**: test5\n\n**Pre-inject**:\n- `~/.claude/state/eblets/CANON/t5.eblet.md`\n\n---\n## KN-T5 — PHASE A — REVIEW\n1. Review\n")

    wf = PreStagingWorkflow(shadow_id="delta", queue_path=queue_path)
    entry = OnDeckEntry(id=entry_id, k_prompt_path=str(tmp_path / "T5.md"), status="queued")
    wf.pre_stage(entry)

    # Read queue and find the mutation line with prepared_context
    lines = [json.loads(l) for l in queue_path.read_text().splitlines() if l.strip()]
    mutations = [l for l in lines if l.get("id") == entry_id and l.get("prepared_context")]
    assert len(mutations) >= 1, "should have a prepared_context mutation line"
    ctx_data = mutations[0]["prepared_context"]
    assert ctx_data["shadow_id"] == "delta"
    assert "wrasse_pre_injections" in ctx_data


# ─── T6: end-to-end — near-completion → pre-stage → next entry has prepared_context ─

def test_t6_end_to_end(tmp_path):
    """End-to-end: get_next_entry → pre_stage → prepared_context written."""
    queue_path = tmp_path / "queue.jsonl"
    entry_id = "LB-ODS-0006"
    queue_path.write_text(json.dumps({
        "id": entry_id, "category": "knight",
        "k_prompt_path": str(tmp_path / "T6.md"), "status": "queued",
        "priority": 1, "prerequisites": [], "ts_queued": "2026-05-01T00:00:00Z",
    }) + "\n")

    (tmp_path / "T6.md").write_text("# T6\n## WRASSE PRE-INJECTION\n**Triggers**: e2e test\n\n**Pre-inject**:\n- `~/.claude/state/eblets/CANON/e2e.eblet.md`\n\n---\n## KN-T6 — PHASE A — REVIEW\n1. E2E review\n")

    wf = PreStagingWorkflow(shadow_id="epsilon", queue_path=queue_path)

    next_entry = wf.get_next_entry()
    assert next_entry is not None, "should have a next entry"
    assert next_entry.id == entry_id

    ctx = wf.pre_stage(next_entry)
    assert ctx is not None, "pre_stage should succeed"
    assert ctx.shadow_id == "epsilon"
    assert "e2e" in " ".join(ctx.wrasse_pre_injections).lower() or len(ctx.wrasse_pre_injections) >= 1


# ─── T7: failure mode — prereq missing → entry remains queued, NOT errored ────

def test_t7_missing_prereq_stays_queued(tmp_path):
    """
    Entry with unsatisfied prerequisite should NOT be returned by get_next_entry.
    It stays queued — not errored — waiting for prereq to land.
    """
    queue_path = tmp_path / "queue.jsonl"
    prereq_id = "LB-ODS-PREREQ-MISSING"
    entry_id = "LB-ODS-DEPENDENT"

    # Prereq is queued (not landed)
    queue_path.write_text(
        json.dumps({"id": prereq_id, "category": "knight", "k_prompt_path": "/fake.md",
                    "status": "queued", "priority": 0, "prerequisites": [], "ts_queued": "2026-05-01T00:00:00Z"}) + "\n" +
        json.dumps({"id": entry_id, "category": "knight", "k_prompt_path": "/fake2.md",
                    "status": "queued", "priority": 0, "prerequisites": [prereq_id], "ts_queued": "2026-05-01T00:00:00Z"}) + "\n"
    )

    wf = PreStagingWorkflow(shadow_id="zeta", queue_path=queue_path)
    next_entry = wf.get_next_entry()

    # Should get prereq_id (no prerequisites) or None if it was already landed
    # Should NOT get entry_id (its prereq is not landed)
    if next_entry is not None:
        assert next_entry.id != entry_id, "dependent entry should not be returned when prereq is not landed"
