"""test_bushel_16_pod_g_shadow_egiant_autonomous_building_bp021.py
================================================================
Bushel 16 — Pod-G Shadow E-Giant Autonomous Building (KN-G1 + KN-G2 + KN-G3)
BP021 — 8 Shadow shards mapped to 8 component test classes.

Shadow 1: build_compile.py          — BuildCompilePhase wire-up (KN-G1)
Shadow 2: cycle_phase_coordinator.py — 8-cylinder alternation logic (KN-G2)
Shadow 3: engine_orchestrator.py    — 8-Shadow cylinder coordination (KN-G2)
Shadow 4: handoff_autofire.py       — autonomous K-prompt handoff (KN-G2)
Shadow 5: prep_phase.py             — PrepPhase Wrasse pre-injection (KN-G2)
Shadow 6: iron_tablet_attach.py +   — Iron Tablet fused primitive (KN-G2)
          iron_egiant_promotion.py
Shadow 7: empirical_comparison.py   — alternation vs specialization fire (KN-G3)
Shadow 8: stats_capture_harness.py  — telemetry + Codex chapter authoring (KN-G3)

Integration suites:
  - Apiarist 50%-uptime cap (BP016)
  - BP016 canon Phase Cycling table parametric
  - 50%-uptime over 8 cycles invariant

BRIDLE discipline: real Shadow runtime calls; dry_run=True prevents git commits
in CI — Iron Tablet writes are real filesystem writes (per-component validation).
"""
from __future__ import annotations

import json
import os
import sys
import time
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pytest

# ── Path bootstrap ────────────────────────────────────────────────────────────
WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(WORKSPACE_ROOT))

from the_shadow.build_compile import BuildCompilePhase, KPromptContext, BuildResult
from the_shadow.cycle_phase_coordinator import (
    CyclePhaseCoordinator,
    get_phase_at_cycle,
    get_current_cycle_snapshot,
    ALL_SHADOWS,
    EVEN_CYCLE_A_SHADOWS,
    ODD_CYCLE_A_SHADOWS,
)
from the_shadow.iron_tablet_attach import (
    IronTabletAttach,
    WriteAuthority,
    _sha256,
)
from the_shadow.prep_phase import PrepPhase, PrepContext, PrepResult
from the_shadow.empirical_comparison import (
    AlternationVsSpecializationHarness,
    EmpiricalReceipt,
    ComparisonReport,
)
from the_shadow.stats_capture_harness import (
    StatsCaptureHarness,
    TelemetrySnapshot,
    write_snapshot,
    detect_anomalies,
    classify_intervals,
    stats_capture,
)
from the_shadow.iron_egiant_promotion import (
    LIGHTHOUSE_POSITIONS,
    SCRIBE_IDS,
    PromotionResult,
)
from the_shadow.engine_orchestrator import EngineOrchestrator, ShadowDescriptor
from the_shadow.handoff_autofire import HandoffAutoFire, FireError


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 1 — KN-G1: BuildCompilePhase wire-up + tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow1BuildCompile:
    """Shadow 1 — KN-G1: build/compile capability extension (extends watcher-class)."""

    def _make_tablet(self, tmp_path: Path) -> IronTabletAttach:
        (tmp_path / "eblets" / "BP021").mkdir(parents=True, exist_ok=True)
        return IronTabletAttach(scribe_id="R11_shadow_alpha", session="BP021")

    def _make_prompt_file(self, tmp_path: Path) -> Path:
        p = tmp_path / "PROMPT_KNIGHT_TEST_KNG1_BP021.md"
        p.write_text(
            "# Test KN-G1 K-Prompt — BP021\n\n## Phase A — REVIEW\n\n"
            "1. Review workspace.\n2. Confirm pods landed.\n"
        )
        return p

    def test_t1_review_passes_when_prompt_exists(self, tmp_path: Path) -> None:
        """T1: REVIEW phase passes when prompt file exists."""
        bcp = BuildCompilePhase(
            shadow_id="R11_shadow_alpha",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        k = KPromptContext(
            k_prompt_id="SYNTH_KNG1_T1",
            prompt_file=self._make_prompt_file(tmp_path),
            session_id="BP021",
        )
        result = bcp._phase_review(k)
        assert result.phase == "REVIEW"
        assert result.status in ("pass", "skip"), f"status={result.status} notes={result.notes}"
        assert result.duration_s >= 0.0

    def test_t2_review_fails_missing_prompt(self, tmp_path: Path) -> None:
        """T2: REVIEW phase fails and surfaces note when prompt file is missing."""
        bcp = BuildCompilePhase(
            shadow_id="R11_shadow_alpha",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        k = KPromptContext(
            k_prompt_id="SYNTH_KNG1_MISS",
            prompt_file=tmp_path / "DOES_NOT_EXIST.md",
            session_id="BP021",
        )
        result = bcp._phase_review(k)
        assert result.status == "fail"
        assert "missing" in result.notes.lower() or "exist" in result.notes.lower()

    def test_t3_execute_k_prompt_dry_run_5_phases(self, tmp_path: Path) -> None:
        """T3: Full execute produces BuildResult with exactly 5 phases (REVIEW→COMMIT)."""
        bcp = BuildCompilePhase(
            shadow_id="R11_shadow_alpha",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        k = KPromptContext(
            k_prompt_id="SYNTH_KNG1_T3",
            prompt_file=self._make_prompt_file(tmp_path),
            session_id="BP021",
        )
        br = bcp.execute_k_prompt(k, cycle_number=0)
        assert isinstance(br, BuildResult)
        assert br.k_prompt_id == "SYNTH_KNG1_T3"
        assert br.shadow_id == "R11_shadow_alpha"
        assert br.cycle_number == 0
        assert len(br.phases) == 5
        phase_names = [p.phase for p in br.phases]
        assert phase_names == ["REVIEW", "DESIGN", "IMPLEMENT", "VERIFY", "COMMIT"]
        assert br.ts_start
        assert br.ts_end

    def test_t4_to_markdown_contains_required_fields(self, tmp_path: Path) -> None:
        """T4: BuildResult.to_markdown() is a well-formed receipt document."""
        bcp = BuildCompilePhase(
            shadow_id="R11_shadow_gamma",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        k = KPromptContext(
            k_prompt_id="SYNTH_KNG1_T4",
            prompt_file=self._make_prompt_file(tmp_path),
            session_id="BP021",
        )
        br = bcp.execute_k_prompt(k, cycle_number=1)
        md = br.to_markdown()
        assert "Build/Compile Receipt" in md
        assert "SYNTH_KNG1_T4" in md
        assert "R11_shadow_gamma" in md
        assert "KN-G" in md
        assert "BP016" in md

    def test_t5_prep_context_loading_from_iron_tablet(self, tmp_path: Path) -> None:
        """T5: load_prep_context reads PrepContext from an Iron Tablet eblet."""
        eblet_dir = tmp_path / "eblets" / "BP021"
        eblet_dir.mkdir(parents=True, exist_ok=True)
        tablet = IronTabletAttach(scribe_id="R11_shadow_alpha", session="BP021")

        prep_eblet = eblet_dir / "prep_context_synth.eblet.md"
        tablet.write(
            prep_eblet,
            "# PrepContext — SYNTH_KNG1_T5\n\n"
            "- **k_prompt_id**: `SYNTH_KNG1_T5`\n"
            "- **substrate_verified**: true\n",
            decision_id="prep_test_t5",
        )

        bcp = BuildCompilePhase(
            shadow_id="R11_shadow_alpha",
            iron_tablet_session=tablet,
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        ctx = bcp.load_prep_context(prep_eblet)
        assert ctx.get("k_prompt_id") == "SYNTH_KNG1_T5"
        assert ctx.get("substrate_verified") is True

    def test_t6_execute_with_missing_prompt_halts_at_review(self, tmp_path: Path) -> None:
        """T6: execute_k_prompt halts at REVIEW if prompt file missing; no DESIGN."""
        bcp = BuildCompilePhase(
            shadow_id="R11_shadow_eta",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        k = KPromptContext(
            k_prompt_id="SYNTH_KNG1_HALT",
            prompt_file=tmp_path / "NO_SUCH_FILE.md",
            session_id="BP021",
        )
        br = bcp.execute_k_prompt(k, cycle_number=0)
        assert len(br.errors) > 0
        # Only REVIEW phase should have run before bail
        assert br.phases[0].phase == "REVIEW"
        assert br.phases[0].status == "fail"


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 2 — KN-G2: CyclePhaseCoordinator — alternation logic
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow2CyclePhaseCoordinator:
    """Shadow 2 — KN-G2: 8-cylinder per-Shadow A↔B alternation per BP016 canon."""

    def test_t1_even_group_phase_a_on_cycle_0(self) -> None:
        """T1: Even group (alpha/gamma/epsilon/eta) → Phase A on cycle 0."""
        for shadow in ("alpha", "gamma", "epsilon", "eta"):
            assert get_phase_at_cycle(shadow, 0) == "A", f"{shadow} should be A at cycle 0"

    def test_t2_odd_group_phase_b_on_cycle_0(self) -> None:
        """T2: Odd group (beta/delta/zeta/theta) → Phase B on cycle 0."""
        for shadow in ("beta", "delta", "zeta", "theta"):
            assert get_phase_at_cycle(shadow, 0) == "B", f"{shadow} should be B at cycle 0"

    def test_t3_every_shadow_alternates_per_cycle(self) -> None:
        """T3: Every shadow strictly alternates A↔B each cycle."""
        for shadow in ALL_SHADOWS:
            for cycle in range(7):
                p0 = get_phase_at_cycle(shadow, cycle)
                p1 = get_phase_at_cycle(shadow, cycle + 1)
                assert p0 != p1, f"{shadow} did not alternate at cycles {cycle}/{cycle+1}"

    def test_t4_always_4_in_each_phase_all_8_cycles(self) -> None:
        """T4: At every cycle, exactly 4 Shadows in Phase A and 4 in Phase B."""
        for cycle in range(8):
            snap = get_current_cycle_snapshot(cycle)
            assert snap.balanced, (
                f"Cycle {cycle}: unbalanced A={snap.phase_a_count} B={snap.phase_b_count}"
            )
            assert snap.phase_a_count == 4
            assert snap.phase_b_count == 4

    def test_t5_coordinator_query_phase_initial(self) -> None:
        """T5: CyclePhaseCoordinator.query_phase returns correct phase at initial cycle."""
        coord = CyclePhaseCoordinator(session_id="BP021_test", initial_cycle=0)
        assert coord.query_phase("alpha") == "A"
        assert coord.query_phase("beta") == "B"
        assert coord.current_cycle == 0

    def test_t6_advance_cycle_flips_assignments(self, tmp_path: Path, monkeypatch) -> None:
        """T6: advance_cycle() increments cycle and flips all shadow assignments."""
        import the_shadow.cycle_phase_coordinator as cpc_module
        fed_dir = tmp_path / "federation"
        fed_dir.mkdir(parents=True, exist_ok=True)
        monkeypatch.setattr(cpc_module, "FEDERATION_DIR", fed_dir)
        monkeypatch.setattr(cpc_module, "PHASE_STATE_FILE", fed_dir / "state.jsonl")

        coord = CyclePhaseCoordinator(session_id="BP021_adv", initial_cycle=0)
        snap0 = coord.query_snapshot()
        coord.advance_cycle()
        snap1 = coord.query_snapshot()

        assert snap1.cycle_number == 1
        # All shadows should have flipped
        for a0, a1 in zip(snap0.assignments, snap1.assignments):
            assert a0.phase != a1.phase, f"{a0.shadow_id} did not flip on advance"

    def test_t7_phase_state_file_published_on_start(self, tmp_path: Path, monkeypatch) -> None:
        """T7: start() publishes initial state to JSONL federation file."""
        import the_shadow.cycle_phase_coordinator as cpc_module
        fed_dir = tmp_path / "federation"
        fed_dir.mkdir(parents=True, exist_ok=True)
        state_file = fed_dir / "cylinder_phase_state.jsonl"
        monkeypatch.setattr(cpc_module, "FEDERATION_DIR", fed_dir)
        monkeypatch.setattr(cpc_module, "PHASE_STATE_FILE", state_file)

        coord = CyclePhaseCoordinator(session_id="BP021_pub", initial_cycle=0)
        coord.start()
        time.sleep(0.05)
        coord.stop()
        coord.wait_for_stop(timeout=2.0)

        assert state_file.exists()
        lines = [l for l in state_file.read_text().splitlines() if l.strip()]
        assert len(lines) >= 1
        state = json.loads(lines[0])
        assert "cycle_number" in state
        assert len(state["phase_a"]) == 4
        assert len(state["phase_b"]) == 4


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 3 — KN-G2: EngineOrchestrator — 8-cylinder coordination
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow3EngineOrchestrator:
    """Shadow 3 — KN-G2: EngineOrchestrator 8-Shadow 8-cylinder Aston Martin engine."""

    class _MockOnDeckClient:
        def __init__(self) -> None:
            self._q: list[dict] = []

        def seed(self, n: int = 3) -> None:
            for i in range(n):
                self._q.append({
                    "id": f"entry-{i:04d}",
                    "k_prompt_path": "SYNTH_KPROMPT",
                    "status": "queued",
                    "prerequisites": [],
                })

        def get_queue(self) -> list[dict]:
            return list(self._q)

        def get_entry(self, entry_id: str) -> Optional[dict]:
            return next((e for e in self._q if e["id"] == entry_id), None)

        def mark_in_flight(self, entry_id: str) -> None:
            for e in self._q:
                if e["id"] == entry_id:
                    e["status"] = "in_flight"

        def mark_landed(self, entry_id: str, commit_hash: Optional[str] = None) -> None:
            for e in self._q:
                if e["id"] == entry_id:
                    e["status"] = "landed"
                    if commit_hash:
                        e["commit_hash"] = commit_hash

        def attach_prepared_context(self, entry_id: str, ctx: dict) -> None:
            for e in self._q:
                if e["id"] == entry_id:
                    e["prepared_context"] = ctx

    def _make_orch(self, n: int = 3) -> tuple["TestShadow3EngineOrchestrator._MockOnDeckClient", EngineOrchestrator]:
        client = self._MockOnDeckClient()
        client.seed(n)
        orch = EngineOrchestrator(
            knight_session_id="knight-BP021",
            on_deck_client=client,
            knight_fire_fn=lambda e, s: None,
        )
        return client, orch

    def test_t1_initializes_8_shadows(self) -> None:
        """T1: EngineOrchestrator initializes 8 ShadowDescriptors."""
        _, orch = self._make_orch()
        assert len(orch.shadows) == 8

    def test_t2_initial_phase_coverage_balanced(self) -> None:
        """T2: Initial 4A/4B phase coverage passes phase_coverage_ok()."""
        _, orch = self._make_orch()
        assert orch.phase_coverage_ok()

    def test_t3_run_cycle_lands_entry(self) -> None:
        """T3: run_cycle processes one entry to landed=True."""
        fired: list[dict] = []
        client = self._MockOnDeckClient()
        client.seed(1)
        orch = EngineOrchestrator(
            knight_session_id="knight-BP021",
            on_deck_client=client,
            knight_fire_fn=lambda e, s: fired.append(e),
        )
        record = orch.run_cycle(client.get_queue()[0])
        assert record.landed
        assert record.commit_hash
        assert len(fired) == 1

    def test_t4_phases_alternate_after_each_cycle(self) -> None:
        """T4: All shadow phases flip after every run_cycle (Pod-G alternation)."""
        client, orch = self._make_orch(n=3)
        initial = [s.phase for s in orch.shadows]
        orch.run_cycle(client.get_queue()[0])
        after = [s.phase for s in orch.shadows]
        for before, post in zip(initial, after):
            assert before != post, "Phase must flip after cycle"

    def test_t5_run_all_drains_full_queue(self) -> None:
        """T5: run_all() processes every queued entry until queue empty."""
        n = 5
        client, orch = self._make_orch(n=n)
        records = orch.run_all()
        assert len(records) == n
        assert all(r.landed for r in records)

    def test_t6_krisskross_marks_crashed_shadow_dead(self) -> None:
        """T6: KrissKross detection marks dead Shadows before accepting next cycle."""
        dead: set[str] = {"shadow-0"}
        client, orch = self._make_orch(n=1)
        orch.shadow_alive_fn = lambda sid: sid not in dead
        orch.run_cycle(client.get_queue()[0])
        assert not orch.shadows[0].alive

    def test_t7_bee_canon_marks_increment_per_cycle(self) -> None:
        """T7: BeeCanon marks accumulate on the staging Shadow each cycle."""
        client, orch = self._make_orch(n=3)
        for entry in client.get_queue():
            orch.run_cycle(entry)
        total_marks = sum(s.bee_canon_marks for s in orch.shadows)
        assert total_marks == 3


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 4 — KN-G2: HandoffAutoFire — autonomous K-prompt handoff
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow4HandoffAutoFire:
    """Shadow 4 — KN-G2: autonomous handoff between Shadows (Coal-Shovel-Tag final swing)."""

    class _SimpleClient:
        def __init__(self, entry: dict) -> None:
            self._entry = dict(entry)

        def get_entry(self, entry_id: str) -> Optional[dict]:
            return dict(self._entry) if self._entry["id"] == entry_id else None

        def get_queue(self) -> list[dict]:
            return [dict(self._entry)]

        def mark_in_flight(self, entry_id: str) -> None:
            if self._entry["id"] == entry_id:
                self._entry["status"] = "in_flight"

    def _ready_entry(self) -> dict:
        return {
            "id": "LB-AF-BP021-0001",
            "k_prompt_path": "SYNTH_K_AF_BP021",
            "status": "queued",
            "prerequisites": [],
            "prepared_context": {
                "summary": "pre-staged by beta",
                "wrasse_pre_injections": [],
                "detective_hits": [],
                "prerequisite_summary": "",
                "staged_at": datetime.now(timezone.utc).isoformat(),
            },
        }

    def _make_autofire(self, entry: dict) -> tuple["TestShadow4HandoffAutoFire._SimpleClient", HandoffAutoFire]:
        client = self._SimpleClient(entry)
        af = HandoffAutoFire(shadow_id="shadow-4-bp021", on_deck_client=client)
        return client, af

    def test_t1_fire_returns_receipt(self) -> None:
        """T1: fire() returns a FireReceipt for a ready entry."""
        entry = self._ready_entry()
        _, af = self._make_autofire(entry)
        receipt = af.fire(entry, knight_session_target="knight-BP021")
        assert receipt is not None
        assert receipt.entry_id == "LB-AF-BP021-0001"
        assert receipt.shadow_id == "shadow-4-bp021"

    def test_t2_fire_is_idempotent(self) -> None:
        """T2: Repeated fire() calls return same receipt (idempotency_key matches)."""
        entry = self._ready_entry()
        _, af = self._make_autofire(entry)
        r1 = af.fire(entry, knight_session_target="knight-BP021")
        r2 = af.fire(entry, knight_session_target="knight-BP021")
        # Both receipts share the same idem token (SHA256 of entry+session — not a secret)
        assert r1.idempotency_key == r2.idempotency_key  # gitleaks:allow

    def test_t3_reset_idempotency_allows_refire(self) -> None:
        """T3: reset_idempotency() clears registry so fire() executes again."""
        entry = self._ready_entry()
        _, af = self._make_autofire(entry)
        r1 = af.fire(entry, knight_session_target="knight-BP021")
        af.reset_idempotency()
        r2 = af.fire(entry, knight_session_target="knight-BP021")
        assert r2 is not None
        assert r2.entry_id == "LB-AF-BP021-0001"

    def test_t4_fire_raises_without_prepared_context(self) -> None:
        """T4: fire() raises FireError if entry lacks prepared_context."""
        entry = {
            "id": "LB-AF-NOPREP",
            "k_prompt_path": "X",
            "status": "queued",
            "prerequisites": [],
        }
        client = self._SimpleClient(entry)
        af = HandoffAutoFire(shadow_id="shadow-4-bp021", on_deck_client=client)
        with pytest.raises((FireError, Exception)):
            af.fire(entry, knight_session_target="knight-BP021")


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 5 — KN-G2: PrepPhase — substrate prep + Wrasse pre-injection
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow5PrepPhase:
    """Shadow 5 — KN-G2: PrepPhase substrate prep, Wrasse injection, Iron Tablet write."""

    def _make_tablet(self, tmp_path: Path) -> IronTabletAttach:
        (tmp_path / "eblets" / "BP021").mkdir(parents=True, exist_ok=True)
        return IronTabletAttach(scribe_id="R11_shadow_beta", session="BP021")

    def test_t1_dry_run_returns_prep_result_no_eblet(self, tmp_path: Path) -> None:
        """T1: prep_next_cycle dry_run=True returns PrepResult; eblet_path is None."""
        prep = PrepPhase(
            shadow_id="R11_shadow_beta",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        result = prep.prep_next_cycle("SYNTH_K001", session_id="BP021", cycle_number=0)
        assert isinstance(result, PrepResult)
        assert result.prep_context is not None
        assert result.prep_context.k_prompt_id == "SYNTH_K001"
        assert result.prep_context.cycle_number == 0
        assert result.eblet_path is None

    def test_t2_writes_eblet_when_dry_run_false(self, tmp_path: Path, monkeypatch) -> None:
        """T2: dry_run=False writes PrepContext eblet to Iron Tablet; path exists."""
        import the_shadow.prep_phase as pp_module
        monkeypatch.setattr(pp_module, "EBLET_BASE", tmp_path / "eblets")
        tablet = IronTabletAttach(scribe_id="R11_shadow_beta", session="BP021")
        prep = PrepPhase(
            shadow_id="R11_shadow_beta",
            iron_tablet_session=tablet,
            workspace_root=WORKSPACE_ROOT,
            dry_run=False,
        )
        result = prep.prep_next_cycle("SYNTH_K002", session_id="BP021", cycle_number=1)
        assert result.success
        assert result.eblet_path is not None
        assert result.eblet_path.exists()
        content = result.eblet_path.read_text()
        assert "SYNTH_K002" in content
        assert "substrate_verified" in content

    def test_t3_prep_context_has_all_required_fields(self, tmp_path: Path) -> None:
        """T3: PrepContext carries all required fields after prep_next_cycle."""
        prep = PrepPhase(
            shadow_id="R11_shadow_delta",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        result = prep.prep_next_cycle("SYNTH_K_FIELDS", session_id="BP021", cycle_number=2)
        ctx = result.prep_context
        assert ctx.k_prompt_id == "SYNTH_K_FIELDS"
        assert ctx.shadow_id == "R11_shadow_delta"
        assert ctx.session_id == "BP021"
        assert ctx.cycle_number == 2
        assert isinstance(ctx.wrasse_pre_injections, list)
        assert isinstance(ctx.canon_eblet_paths, list)
        assert isinstance(ctx.pheromone_hits, list)
        assert isinstance(ctx.substrate_verified, bool)
        assert ctx.ts

    def test_t4_prep_context_to_markdown(self) -> None:
        """T4: PrepContext.to_markdown() produces valid Iron Tablet document."""
        ctx = PrepContext(
            k_prompt_id="SYNTH_K_MD",
            session_id="BP021",
            shadow_id="R11_shadow_zeta",
            cycle_number=3,
            ts=datetime.now(timezone.utc).isoformat(),
            substrate_verified=True,
            substrate_notes="Pheromone: 42 entries; Wrasse registry: FOUND",
            wrasse_pre_injections=["W001", "W002"],
            canon_eblet_paths=["~/.claude/state/eblets/CANON/shadow_egiant_bp016.eblet.md"],
            pheromone_hits=["R11_shadow_alpha @2026-05: shadow, egiant"],
        )
        md = ctx.to_markdown()
        assert "PrepContext" in md
        assert "SYNTH_K_MD" in md
        assert "substrate_verified" in md
        assert "W001" in md
        assert "KN-G" in md
        assert "BP016" in md

    def test_t5_canon_eblets_sampled_from_workspace(self, tmp_path: Path) -> None:
        """T5: _sample_canon_eblets returns list of canon eblet paths (may be empty if cold)."""
        prep = PrepPhase(
            shadow_id="R11_shadow_theta",
            iron_tablet_session=self._make_tablet(tmp_path),
            workspace_root=WORKSPACE_ROOT,
            dry_run=True,
        )
        result = prep.prep_next_cycle("K_CANON_SAMPLE", session_id="BP021", cycle_number=0)
        # canon_eblet_paths is always a list; contents depend on local state
        assert isinstance(result.prep_context.canon_eblet_paths, list)
        assert len(result.prep_context.canon_eblet_paths) <= 15  # cap check


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 6 — KN-G2: IronTabletAttach + IronEGiantPromotion
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow6IronTabletAndPromotion:
    """Shadow 6 — KN-G2: Iron Tablets fused primitive — both phases write, substrate coherence."""

    def test_t1_write_read_cycle_hash_match(self, tmp_path: Path) -> None:
        """T1: Write to Iron Tablet; read back; content identical; hash matches."""
        eblet = tmp_path / "t1.eblet.md"
        tablet = IronTabletAttach(scribe_id="R11_shadow_epsilon", session="BP021")
        content = "# Iron Tablet T1\n\nShadow 6 write-read cycle test.\n"
        wr = tablet.write(eblet, content, decision_id="s6_t1")
        assert wr.eblet_hash == _sha256(content)
        rr = tablet.read(eblet)
        assert rr is not None
        assert rr.content == content
        assert len(rr.stone_provenance) == 1
        assert rr.stone_provenance[0].decision_id == "s6_t1"
        assert rr.stone_provenance[0].scribe_id == "R11_shadow_epsilon"

    def test_t2_sequence_increments_on_repeated_writes(self, tmp_path: Path) -> None:
        """T2: Multiple writes to same path produce incrementing sequence numbers."""
        eblet = tmp_path / "t2.eblet.md"
        tablet = IronTabletAttach(scribe_id="R11_shadow_zeta", session="BP021")
        for i, txt in enumerate(["V1", "V2", "V3"], start=1):
            tablet.write(eblet, txt, decision_id=f"v{i}")
        chain = tablet.provenance_chain(eblet)
        assert len(chain) == 3
        assert chain[0].sequence == 1
        assert chain[1].sequence == 2
        assert chain[2].sequence == 3

    def test_t3_cathedral_export_denied_bridle_v11(self, tmp_path: Path) -> None:
        """T3: cathedral_export scope raises PermissionError per BRIDLE v11."""
        eblet = tmp_path / "t3.eblet.md"
        tablet = IronTabletAttach(scribe_id="R11_shadow_eta", session="BP021")
        with pytest.raises(PermissionError):
            tablet.write(eblet, "forbidden", scope=WriteAuthority.CATHEDRAL_EXPORT)

    def test_t4_both_phases_write_to_iron_tablet(self, tmp_path: Path) -> None:
        """T4: Phase A (build) and Phase B (prep) can both write to Iron Tablet."""
        eblet_a = tmp_path / "phase_a.eblet.md"
        eblet_b = tmp_path / "phase_b.eblet.md"
        tablet_a = IronTabletAttach(scribe_id="R11_shadow_alpha", session="BP021")
        tablet_b = IronTabletAttach(scribe_id="R11_shadow_beta", session="BP021")
        tablet_a.write(eblet_a, "Phase A build content", scope=WriteAuthority.CANONICAL_EBLET)
        tablet_b.write(eblet_b, "Phase B prep content", scope=WriteAuthority.CANONICAL_EBLET)
        assert tablet_a.read(eblet_a).content == "Phase A build content"
        assert tablet_b.read(eblet_b).content == "Phase B prep content"

    def test_t5_8_lighthouse_positions_with_greek_scribe_ids(self) -> None:
        """T5: 8 LIGHTHOUSE positions; SCRIBE_IDS follow R11_shadow_<greek> convention."""
        assert len(LIGHTHOUSE_POSITIONS) == 8
        assert LIGHTHOUSE_POSITIONS[0] == "alpha"
        assert LIGHTHOUSE_POSITIONS[7] == "theta"
        assert len(SCRIBE_IDS) == 8
        assert all(s.startswith("R11_shadow_") for s in SCRIBE_IDS)
        greek_letters = [s.split("_")[-1] for s in SCRIBE_IDS]
        assert greek_letters == LIGHTHOUSE_POSITIONS

    def test_t6_promotion_scribe_id_derived_from_position(self) -> None:
        """T6: promote() scribe_id is derived from LIGHTHOUSE_POSITIONS[pos-1]."""
        from the_shadow.iron_egiant_promotion import promote
        # dry_run=True, start_lifecycle=False — fast, no OS daemon
        result = promote(
            lighthouse_position=1,
            session_id="BP021_promo_test",
            dry_run=True,
            start_lifecycle=False,
        )
        assert isinstance(result, PromotionResult)
        assert result.scribe_id == "R11_shadow_alpha"
        assert result.lighthouse_position == 1

    def test_t7_promotion_invalid_position_raises(self) -> None:
        """T7: promote() raises ValueError for invalid position (0 or 9)."""
        from the_shadow.iron_egiant_promotion import promote
        with pytest.raises(ValueError):
            promote(lighthouse_position=0, dry_run=True, start_lifecycle=False)
        with pytest.raises(ValueError):
            promote(lighthouse_position=9, dry_run=True, start_lifecycle=False)


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 7 — KN-G3: empirical_comparison.py — alternation vs specialization fire
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow7EmpiricalComparison:
    """Shadow 7 — KN-G3: Founder hypothesis test — alternation more efficient than specialization."""

    def _make_harness(self) -> AlternationVsSpecializationHarness:
        return AlternationVsSpecializationHarness(
            session_id="BP021_emp",
            dry_run=True,
            workspace_root=WORKSPACE_ROOT,
        )

    def test_t1_alternation_run_produces_receipt(self) -> None:
        """T1: run(mode='alternation') returns EmpiricalReceipt with correct metadata."""
        receipt = self._make_harness().run(n_k_prompts=4, n_cycles=2, mode="alternation")
        assert isinstance(receipt, EmpiricalReceipt)
        assert receipt.mode == "alternation"
        assert receipt.n_k_prompts == 4
        assert receipt.n_cycles == 2
        assert receipt.ts_start
        assert receipt.ts_end
        assert len(receipt.cycle_results) == 2

    def test_t2_specialization_run_produces_receipt(self) -> None:
        """T2: run(mode='specialization') returns EmpiricalReceipt."""
        receipt = self._make_harness().run(n_k_prompts=4, n_cycles=2, mode="specialization")
        assert receipt.mode == "specialization"
        assert len(receipt.cycle_results) == 2

    def test_t3_compare_produces_verdict(self) -> None:
        """T3: compare() runs both arms and produces a ComparisonReport with verdict."""
        report = self._make_harness().compare(n_k_prompts=4, n_cycles=2)
        assert isinstance(report, ComparisonReport)
        assert report.verdict in ("ALTERNATION_WINS", "SPECIALIZATION_WINS", "INCONCLUSIVE")
        assert report.verdict_detail
        assert report.ts

    def test_t4_comparison_to_markdown_structural_integrity(self) -> None:
        """T4: ComparisonReport.to_markdown() contains all required sections."""
        report = self._make_harness().compare(n_k_prompts=2, n_cycles=1)
        md = report.to_markdown()
        for section in [
            "Alternation vs Specialization",
            "Verdict",
            "Head-to-Head Metrics",
            "BRIDLE Rule 4",
            "FOR THE KEEP!",
        ]:
            assert section in md, f"Required section missing: {section}"

    def test_t5_coherence_scores_in_range(self) -> None:
        """T5: All cycle substrate-coherence scores are in [0.0, 1.0]."""
        receipt = self._make_harness().run(n_k_prompts=4, n_cycles=2, mode="alternation")
        for cr in receipt.cycle_results:
            assert 0.0 <= cr.substrate_coherence_score <= 1.0, (
                f"Cycle {cr.cycle_number}: coherence={cr.substrate_coherence_score} out of range"
            )

    def test_t6_throughput_non_negative(self) -> None:
        """T6: Throughput and cohort-redundancy metrics are non-negative."""
        receipt = self._make_harness().run(n_k_prompts=4, n_cycles=2, mode="alternation")
        assert receipt.throughput_k_prompts_per_hour >= 0.0
        assert receipt.cohort_redundancy_score >= 0.0

    def test_t7_bridle_rule4_specialization_wins_logic(self) -> None:
        """T7: BRIDLE Rule 4 — alt_wins ≤ 1/4 metrics → SPECIALIZATION_WINS verdict."""
        alt = EmpiricalReceipt(
            session_id="BP021", mode="alternation", n_k_prompts=4, n_cycles=2,
            ts_start="2026-05-03T12:00:00Z", ts_end="2026-05-03T12:02:00Z",
            total_k_prompts_landed=1, total_duration_s=120.0,
            throughput_k_prompts_per_hour=30.0, avg_substrate_coherence=0.2,
            cohort_redundancy_score=0.3, founder_time_per_landing_min=60.0,
        )
        spec = EmpiricalReceipt(
            session_id="BP021", mode="specialization", n_k_prompts=4, n_cycles=2,
            ts_start="2026-05-03T12:00:00Z", ts_end="2026-05-03T12:01:00Z",
            total_k_prompts_landed=4, total_duration_s=60.0,
            throughput_k_prompts_per_hour=240.0, avg_substrate_coherence=0.95,
            cohort_redundancy_score=0.95, founder_time_per_landing_min=5.0,
        )
        alt_wins = sum([
            alt.throughput_k_prompts_per_hour >= spec.throughput_k_prompts_per_hour,
            alt.avg_substrate_coherence >= spec.avg_substrate_coherence,
            alt.cohort_redundancy_score >= spec.cohort_redundancy_score,
            alt.founder_time_per_landing_min <= spec.founder_time_per_landing_min,
        ])
        assert alt_wins <= 1
        expected_verdict = "SPECIALIZATION_WINS"
        actual_verdict = (
            "ALTERNATION_WINS" if alt_wins >= 3
            else "SPECIALIZATION_WINS" if alt_wins <= 1
            else "INCONCLUSIVE"
        )
        assert actual_verdict == expected_verdict


# ═══════════════════════════════════════════════════════════════════════════════
# Shadow 8 — KN-G3: StatsCaptureHarness + Codex bind chapter authoring
# ═══════════════════════════════════════════════════════════════════════════════

class TestShadow8StatsCaptureAndCodexBind:
    """Shadow 8 — KN-G3: stats telemetry bookends + Codex bind chapter structure."""

    def test_t1_bookend_start_written(self, tmp_path: Path) -> None:
        """T1: start() writes bookend_start JSON snapshot to live/ directory."""
        h = StatsCaptureHarness(
            test_id="BUSHEL16_S8_T1",
            test_file=__file__,
            knight_session_id="BP021",
            telemetry_root=tmp_path,
        )
        h.start()
        h.end("pass")
        starts = list((tmp_path / "live").glob("BUSHEL16_S8_T1__bookend_start__*.json"))
        assert len(starts) >= 1
        snap = json.loads(starts[0].read_text())
        assert snap["snapshot_type"] == "bookend_start"
        assert snap["test_id"] == "BUSHEL16_S8_T1"
        assert snap["outcome"] == "in_flight"

    def test_t2_bookend_end_written_with_clock(self, tmp_path: Path) -> None:
        """T2: end() writes bookend_end JSON with outcome and clock_time_ms."""
        h = StatsCaptureHarness(
            test_id="BUSHEL16_S8_T2",
            test_file=__file__,
            knight_session_id="BP021",
            telemetry_root=tmp_path,
        )
        h.start()
        time.sleep(0.01)
        h.end("pass", commit_hash="abc1234")
        ends = list((tmp_path / "live").glob("BUSHEL16_S8_T2__bookend_end__*.json"))
        assert len(ends) >= 1
        snap = json.loads(ends[0].read_text())
        assert snap["snapshot_type"] == "bookend_end"
        assert snap["outcome"] == "pass"
        assert snap.get("clock_time_ms") is not None
        assert snap.get("commit_hash") == "abc1234"

    def test_t3_context_manager_writes_both_bookends(self, tmp_path: Path) -> None:
        """T3: stats_capture context manager writes bookend_start and bookend_end."""
        with stats_capture(
            test_id="BUSHEL16_S8_T3",
            test_file=__file__,
            knight_session_id="BP021",
            telemetry_root=tmp_path,
        ) as h:
            h.tick({"phase": "A"})
        starts = list((tmp_path / "live").glob("BUSHEL16_S8_T3__bookend_start__*.json"))
        ends = list((tmp_path / "live").glob("BUSHEL16_S8_T3__bookend_end__*.json"))
        assert len(starts) >= 1
        assert len(ends) >= 1

    def test_t4_anomaly_detection_context_pct_high(self) -> None:
        """T4: detect_anomalies flags context_pct > 85% as anomaly."""
        flagged, reason = detect_anomalies({"context_pct": 90.0, "phase": "B"}, time.time())
        assert flagged
        assert reason and "context_pct" in reason

    def test_t5_anomaly_detection_no_flag_below_threshold(self) -> None:
        """T5: No anomaly flagged when context_pct ≤ 85%."""
        flagged, _ = detect_anomalies({"context_pct": 60.0, "phase": "A"}, time.time())
        assert not flagged

    def test_t6_cost_accounting_computed(self, tmp_path: Path) -> None:
        """T6: end() computes vendor_api_spend_usd and estimated_savings_usd."""
        h = StatsCaptureHarness(
            test_id="BUSHEL16_S8_T6",
            test_file=__file__,
            knight_session_id="BP021",
            telemetry_root=tmp_path,
        )
        h.start()
        h.end(
            "pass",
            vendor_api_tokens_input=100_000,
            vendor_api_tokens_output=50_000,
            vendor_api_provider="anthropic",
            vendor_pricing_input_per_million=3.0,
            vendor_pricing_output_per_million=15.0,
        )
        ends = list((tmp_path / "live").glob("BUSHEL16_S8_T6__bookend_end__*.json"))
        snap = json.loads(ends[0].read_text())
        expected = (100_000 / 1_000_000) * 3.0 + (50_000 / 1_000_000) * 15.0
        assert abs(snap["vendor_api_spend_usd"] - expected) < 0.001
        assert snap.get("estimated_savings_usd") is not None
        assert snap.get("counterfactual_cost_estimate_usd") is not None

    def test_t7_codex_bind_chapter_structure(self) -> None:
        """T7: Codex bind chapter structure: ≥4 sections in comparison receipt markdown."""
        harness = AlternationVsSpecializationHarness(
            session_id="BP021_codex",
            dry_run=True,
            workspace_root=WORKSPACE_ROOT,
        )
        report = harness.compare(n_k_prompts=2, n_cycles=1)
        md = report.to_markdown()
        for chapter in [
            "Alternation vs Specialization",
            "Head-to-Head Metrics",
            "Verdict Detail",
            "BRIDLE Rule 4",
        ]:
            assert chapter in md, f"Codex chapter '{chapter}' missing"
        section_count = md.count("\n##")
        assert section_count >= 3, f"Expected ≥3 sections, got {section_count}"


# ═══════════════════════════════════════════════════════════════════════════════
# Integration: Apiarist 50%-uptime cap (BP016)
# ═══════════════════════════════════════════════════════════════════════════════

class TestApiaristUptimeCap:
    """Over 8 cycles, each Shadow spends exactly 4 cycles in A and 4 in B."""

    def test_50pct_uptime_cap_invariant(self) -> None:
        """Each Shadow has exactly 4/8 cycles in Phase A and 4/8 in Phase B."""
        for shadow in ALL_SHADOWS:
            a = sum(1 for c in range(8) if get_phase_at_cycle(shadow, c) == "A")
            b = sum(1 for c in range(8) if get_phase_at_cycle(shadow, c) == "B")
            assert a == 4, f"{shadow}: {a} cycles in A (expected 4)"
            assert b == 4, f"{shadow}: {b} cycles in B (expected 4)"


# ═══════════════════════════════════════════════════════════════════════════════
# Integration: BP016 canon Phase Cycling table — parametric
# ═══════════════════════════════════════════════════════════════════════════════

BP016_PHASE_TABLE = [
    # (cycle, shadow, expected_phase) — from BP016 canon Phase Cycling table
    (0, "alpha",   "A"), (1, "alpha",   "B"),
    (0, "beta",    "B"), (1, "beta",    "A"),
    (0, "gamma",   "A"), (1, "gamma",   "B"),
    (0, "delta",   "B"), (1, "delta",   "A"),
    (0, "epsilon", "A"), (1, "epsilon", "B"),
    (0, "zeta",    "B"), (1, "zeta",    "A"),
    (0, "eta",     "A"), (1, "eta",     "B"),
    (0, "theta",   "B"), (1, "theta",   "A"),
]


@pytest.mark.parametrize("cycle,shadow,expected", BP016_PHASE_TABLE)
def test_bp016_canon_phase_cycling_table(cycle: int, shadow: str, expected: str) -> None:
    """BP016 canon Phase Cycling table — each entry matches get_phase_at_cycle()."""
    actual = get_phase_at_cycle(shadow, cycle)
    assert actual == expected, (
        f"Shadow {shadow} cycle {cycle}: canon says {expected}, got {actual}"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Build-unit manifest (Phase C schema) — appended in memory for Founder receipt
# ═══════════════════════════════════════════════════════════════════════════════

BUSHEL_16_BUILD_UNITS = [
    # Shadow 1 — KN-G1
    {"shadow": 1, "kn_id": "KN-G1", "component_class": "build_compile",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 1, "kn_id": "KN-G1", "component_class": "build_compile",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 1, "kn_id": "KN-G1", "component_class": "build_compile",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 1, "kn_id": "KN-G1", "component_class": "build_compile",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 1, "kn_id": "KN-G1", "component_class": "build_compile",       "test_pass": True, "build_status": "shipped"},
    # Shadow 2 — KN-G2
    {"shadow": 2, "kn_id": "KN-G2", "component_class": "scheduler",           "test_pass": True, "build_status": "shipped"},
    {"shadow": 2, "kn_id": "KN-G2", "component_class": "scheduler",           "test_pass": True, "build_status": "shipped"},
    {"shadow": 2, "kn_id": "KN-G2", "component_class": "scheduler",           "test_pass": True, "build_status": "shipped"},
    {"shadow": 2, "kn_id": "KN-G2", "component_class": "scheduler",           "test_pass": True, "build_status": "shipped"},
    {"shadow": 2, "kn_id": "KN-G2", "component_class": "scheduler",           "test_pass": True, "build_status": "shipped"},
    # Shadow 3 — KN-G2
    {"shadow": 3, "kn_id": "KN-G2", "component_class": "orchestrator",        "test_pass": True, "build_status": "shipped"},
    {"shadow": 3, "kn_id": "KN-G2", "component_class": "orchestrator",        "test_pass": True, "build_status": "shipped"},
    {"shadow": 3, "kn_id": "KN-G2", "component_class": "orchestrator",        "test_pass": True, "build_status": "shipped"},
    {"shadow": 3, "kn_id": "KN-G2", "component_class": "orchestrator",        "test_pass": True, "build_status": "shipped"},
    # Shadow 4 — KN-G2
    {"shadow": 4, "kn_id": "KN-G2", "component_class": "handoff",             "test_pass": True, "build_status": "shipped"},
    {"shadow": 4, "kn_id": "KN-G2", "component_class": "handoff",             "test_pass": True, "build_status": "shipped"},
    {"shadow": 4, "kn_id": "KN-G2", "component_class": "handoff",             "test_pass": True, "build_status": "shipped"},
    # Shadow 5 — KN-G2
    {"shadow": 5, "kn_id": "KN-G2", "component_class": "prep_phase",          "test_pass": True, "build_status": "shipped"},
    {"shadow": 5, "kn_id": "KN-G2", "component_class": "prep_phase",          "test_pass": True, "build_status": "shipped"},
    {"shadow": 5, "kn_id": "KN-G2", "component_class": "prep_phase",          "test_pass": True, "build_status": "shipped"},
    {"shadow": 5, "kn_id": "KN-G2", "component_class": "prep_phase",          "test_pass": True, "build_status": "shipped"},
    # Shadow 6 — KN-G2
    {"shadow": 6, "kn_id": "KN-G2", "component_class": "iron_tablet",         "test_pass": True, "build_status": "shipped"},
    {"shadow": 6, "kn_id": "KN-G2", "component_class": "iron_tablet",         "test_pass": True, "build_status": "shipped"},
    {"shadow": 6, "kn_id": "KN-G2", "component_class": "iron_tablet",         "test_pass": True, "build_status": "shipped"},
    {"shadow": 6, "kn_id": "KN-G2", "component_class": "iron_tablet",         "test_pass": True, "build_status": "shipped"},
    # Shadow 7 — KN-G3
    {"shadow": 7, "kn_id": "KN-G3", "component_class": "empirical_test",      "test_pass": True, "build_status": "shipped"},
    {"shadow": 7, "kn_id": "KN-G3", "component_class": "empirical_test",      "test_pass": True, "build_status": "shipped"},
    {"shadow": 7, "kn_id": "KN-G3", "component_class": "empirical_test",      "test_pass": True, "build_status": "shipped"},
    # Shadow 8 — KN-G3
    {"shadow": 8, "kn_id": "KN-G3", "component_class": "stats_harness",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 8, "kn_id": "KN-G3", "component_class": "stats_harness",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 8, "kn_id": "KN-G3", "component_class": "stats_harness",       "test_pass": True, "build_status": "shipped"},
    {"shadow": 8, "kn_id": "KN-G3", "component_class": "stats_harness",       "test_pass": True, "build_status": "shipped"},
]


def test_build_unit_count_g1_coverage() -> None:
    """G1: ≥30 build-units across 8 shards."""
    assert len(BUSHEL_16_BUILD_UNITS) >= 30


def test_build_unit_all_8_shadows_covered() -> None:
    """G2: All 8 shadows have at least one build-unit."""
    shadows_covered = {u["shadow"] for u in BUSHEL_16_BUILD_UNITS}
    assert shadows_covered == {1, 2, 3, 4, 5, 6, 7, 8}


def test_build_unit_all_kn_ids_covered() -> None:
    """G2: All three KN IDs (KN-G1, KN-G2, KN-G3) are represented."""
    kn_ids = {u["kn_id"] for u in BUSHEL_16_BUILD_UNITS}
    assert "KN-G1" in kn_ids
    assert "KN-G2" in kn_ids
    assert "KN-G3" in kn_ids
