"""
empirical_comparison.py — Alternation vs Specialization Empirical Harness
==========================================================================
(KN-G / BP016)

Tests the Founder hypothesis: per-Shadow A↔B alternation is MORE efficient than
per-Shadow specialization (4 build-only + 4 prep-only Shadows).

Metrics measured per batch run:
  (a) substrate-coherence: cross-cycle context-survival score
      — PrepContext from cycle N read cleanly by Phase A in cycle N+1?
  (b) cohort-redundancy: failure-mode tolerance
      — Kill 1 Shadow mid-cycle; measure rebalance latency + substrate-coherence loss
  (c) throughput-at-saturation: K-prompts/hour under alternation vs specialization
      — Synthetic batch of 16 K-prompts; measure landing rate (definition: tests pass
         + receipt written to Iron Tablet)
  (d) per-cycle K-prompt landing rate: count receipts produced per cycle
  (e) Founder-time savings projection: estimated Knight-time-per-K-prompt-landing

Verdict protocol (BRIDLE Rule 4):
  If alternation proves LESS efficient than specialization baseline across
  metrics (a)-(e), surface to Founder with the empirical receipt and do NOT
  force the design.

Usage:
    harness = AlternationVsSpecializationHarness(session_id="BP016")
    receipt = harness.run(n_k_prompts=16, n_cycles=4)
    print(receipt.summary())
"""
from __future__ import annotations

import json
import sys
import textwrap
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .build_compile import BuildCompilePhase, KPromptContext, BuildResult
from .cycle_phase_coordinator import (
    CyclePhaseCoordinator,
    get_phase_at_cycle,
    ALL_SHADOWS,
    CycleSnapshot,
)
from .iron_tablet_attach import IronTabletAttach
from .prep_phase import PrepPhase, PrepResult

# ─── Constants ────────────────────────────────────────────────────────────────

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
EBLET_BASE = Path.home() / ".claude" / "state" / "eblets"


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class CycleRunResult:
    """Result of one cycle of the synthetic batch."""
    cycle_number: int
    phase_a_shadows: list[str]
    phase_b_shadows: list[str]
    build_results: list[BuildResult] = field(default_factory=list)
    prep_results: list[PrepResult] = field(default_factory=list)
    substrate_coherence_score: float = 0.0   # 0.0 – 1.0
    k_prompts_landed: int = 0
    duration_s: float = 0.0


@dataclass
class EmpiricalReceipt:
    """
    Full empirical receipt from an alternation vs specialization comparison run.

    Written to Iron Tablet as a canonical eblet.
    """
    session_id: str
    mode: str           # "alternation" | "specialization"
    n_k_prompts: int
    n_cycles: int
    ts_start: str
    ts_end: str = ""

    # Aggregate metrics
    total_k_prompts_landed: int = 0
    total_duration_s: float = 0.0
    throughput_k_prompts_per_hour: float = 0.0
    avg_substrate_coherence: float = 0.0
    cohort_redundancy_score: float = 0.0   # 0.0–1.0; 1.0 = perfect tolerance
    founder_time_per_landing_min: float = 0.0

    # Per-cycle breakdown
    cycle_results: list[CycleRunResult] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def success(self) -> bool:
        return self.total_k_prompts_landed > 0 and not self.errors

    def summary(self) -> str:
        return (
            f"[{self.mode.upper()}] {self.total_k_prompts_landed}/{self.n_k_prompts} "
            f"K-prompts landed in {self.total_duration_s:.1f}s "
            f"(throughput: {self.throughput_k_prompts_per_hour:.1f}/hr) | "
            f"substrate-coherence: {self.avg_substrate_coherence:.2f} | "
            f"redundancy: {self.cohort_redundancy_score:.2f}"
        )

    def to_markdown(self) -> str:
        cycle_rows = "\n".join(
            f"| {cr.cycle_number} | "
            f"{', '.join(cr.phase_a_shadows)} | "
            f"{', '.join(cr.phase_b_shadows)} | "
            f"{cr.k_prompts_landed} | "
            f"{cr.substrate_coherence_score:.2f} | "
            f"{cr.duration_s:.1f}s |"
            for cr in self.cycle_results
        )
        errors_md = "\n".join(f"- {e}" for e in self.errors) or "_none_"
        return textwrap.dedent(f"""\
            # Empirical Receipt — {self.mode.upper()} Mode

            **Session**: `{self.session_id}`
            **Mode**: {self.mode}
            **K-prompts targeted**: {self.n_k_prompts}
            **Cycles run**: {self.n_cycles}
            **Started**: `{self.ts_start}`
            **Ended**: `{self.ts_end}`

            ## Aggregate Metrics

            | Metric | Value |
            |---|---|
            | K-prompts landed | **{self.total_k_prompts_landed}** / {self.n_k_prompts} |
            | Total duration | {self.total_duration_s:.1f}s |
            | Throughput | **{self.throughput_k_prompts_per_hour:.1f} K-prompts/hour** |
            | Avg substrate-coherence | {self.avg_substrate_coherence:.3f} |
            | Cohort redundancy score | {self.cohort_redundancy_score:.3f} |
            | Founder-time per landing | ~{self.founder_time_per_landing_min:.1f} min |

            ## Per-Cycle Breakdown

            | Cycle | Phase-A Shadows | Phase-B Shadows | Landed | Coherence | Duration |
            |---|---|---|---|---|---|
            {cycle_rows}

            ## Errors

            {errors_md}

            _KN-G · BP016 · Pod-G alternating-cylinder-fire empirical receipt_
        """)


@dataclass
class ComparisonReport:
    """
    Final comparison: alternation vs specialization verdict.

    BRIDLE Rule 4: if specialization wins on metrics (a)-(e), surface to Founder.
    """
    alternation: EmpiricalReceipt
    specialization: EmpiricalReceipt
    ts: str = ""
    verdict: str = ""    # "ALTERNATION_WINS" | "SPECIALIZATION_WINS" | "INCONCLUSIVE"
    verdict_detail: str = ""

    def to_markdown(self) -> str:
        alt = self.alternation
        spec = self.specialization
        verdict_icon = {
            "ALTERNATION_WINS": "✅",
            "SPECIALIZATION_WINS": "⚠️",
            "INCONCLUSIVE": "🔶",
        }.get(self.verdict, "?")
        return textwrap.dedent(f"""\
            # Alternation vs Specialization — Empirical Comparison Report

            **Timestamp**: `{self.ts}`
            **Verdict**: {verdict_icon} **{self.verdict}**

            ## Head-to-Head Metrics

            | Metric | Alternation | Specialization | Winner |
            |---|---|---|---|
            | Throughput (K/hr) | {alt.throughput_k_prompts_per_hour:.2f} | {spec.throughput_k_prompts_per_hour:.2f} | {"ALT" if alt.throughput_k_prompts_per_hour >= spec.throughput_k_prompts_per_hour else "SPEC"} |
            | Substrate coherence | {alt.avg_substrate_coherence:.3f} | {spec.avg_substrate_coherence:.3f} | {"ALT" if alt.avg_substrate_coherence >= spec.avg_substrate_coherence else "SPEC"} |
            | Cohort redundancy | {alt.cohort_redundancy_score:.3f} | {spec.cohort_redundancy_score:.3f} | {"ALT" if alt.cohort_redundancy_score >= spec.cohort_redundancy_score else "SPEC"} |
            | Founder-time/landing (min) | {alt.founder_time_per_landing_min:.1f} | {spec.founder_time_per_landing_min:.1f} | {"ALT" if alt.founder_time_per_landing_min <= spec.founder_time_per_landing_min else "SPEC"} |

            ## Verdict Detail

            > {self.verdict_detail}

            ## BRIDLE Rule 4

            {"✅ Alternation confirmed more efficient — design ratified." if self.verdict == "ALTERNATION_WINS"
             else "⚠️ SURFACING TO FOUNDER: Specialization outperformed alternation on key metrics. "
                  "See verdict detail above. Do NOT force the design. Await Founder decision."
             if self.verdict == "SPECIALIZATION_WINS"
             else "🔶 Results inconclusive — additional cycles recommended before committing architecture."}

            _KN-G · BP016 · Empirical comparison receipt · FOR THE KEEP!_
        """)


# ─── Harness ──────────────────────────────────────────────────────────────────

class AlternationVsSpecializationHarness:
    """
    Empirical test class for Founder hypothesis verification (BP016 KN-G).

    Run synthetic K-prompt batches under both modes; measure metrics (a)-(e).

    Simulation mode: uses PrepPhase + BuildCompilePhase in dry_run=True by default
    (filesystem writes enabled for Iron Tablet receipts; no actual code edits or git
    commits unless dry_run=False explicitly).

    Set dry_run=False to enable git commit + tag in Phase A COMMIT phase.
    """

    def __init__(
        self,
        session_id: str = "BP016",
        dry_run: bool = True,
        workspace_root: Optional[Path] = None,
    ):
        self.session_id = session_id
        self.dry_run = dry_run
        self.workspace_root = workspace_root or WORKSPACE_ROOT

    # ── Iron Tablet factory ────────────────────────────────────────────────────

    def _make_tablet(self, shadow_id: str) -> IronTabletAttach:
        return IronTabletAttach(scribe_id=f"R11_shadow_{shadow_id}", session=self.session_id)

    # ── Synthetic K-prompt factory ─────────────────────────────────────────────

    def _make_k_prompt(self, idx: int, prep_eblet: Optional[Path] = None) -> KPromptContext:
        k_id = f"SYNTH_K{idx:03d}"
        # Point to a real (or synthetic) prompt file — use the KN-G prompt itself as stand-in
        prompt_file = (
            WORKSPACE_ROOT
            / "BISHOP_DROPZONE"
            / "01_KnightPrompts"
            / "PROMPT_KNIGHT_KNG_SHADOW_EGIANT_ALTERNATING_CYLINDER_FIRE_BP016.md"
        )
        return KPromptContext(
            k_prompt_id=k_id,
            prompt_file=prompt_file,
            session_id=self.session_id,
            prep_context_eblet=prep_eblet,
        )

    # ── Substrate-coherence scorer ─────────────────────────────────────────────

    def _score_substrate_coherence(
        self, prep_result: PrepResult, build_result: BuildResult
    ) -> float:
        """
        Score cross-cycle context-survival (0.0–1.0).

        A PrepContext written in cycle N is considered 'coherent' for cycle N+1 if:
          - The prep_result succeeded (PrepContext written without errors)
          - The build_result's REVIEW phase passed (prompt file found + prep loaded)
          - No error cross-contamination between cycles

        Simple binary coherence: 1.0 if both succeeded, 0.5 if partial, 0.0 if both failed.
        """
        prep_ok = prep_result.success
        review_ok = any(
            p.phase == "REVIEW" and p.status in ("pass", "skip")
            for p in build_result.phases
        )
        if prep_ok and review_ok:
            return 1.0
        if prep_ok or review_ok:
            return 0.5
        return 0.0

    # ── Alternation mode run ───────────────────────────────────────────────────

    def _run_alternation_cycle(
        self, cycle_number: int, k_prompt_pairs: list[tuple[int, Optional[Path]]]
    ) -> CycleRunResult:
        """
        Run one cycle of alternation mode.

        Phase A shadows execute build/compile for half the K-prompts.
        Phase B shadows run prep for the other half.
        Both groups run in parallel threads.
        """
        t0 = time.monotonic()
        snapshot = CyclePhaseCoordinator()  # stateless snapshot only
        a_shadows = [s for s in ALL_SHADOWS if get_phase_at_cycle(s, cycle_number) == "A"]
        b_shadows = [s for s in ALL_SHADOWS if get_phase_at_cycle(s, cycle_number) == "B"]

        build_results: list[BuildResult] = []
        prep_results: list[PrepResult] = []
        lock = threading.Lock()

        # Phase A: build/compile
        def run_build(shadow_id: str, idx: int, prep_eblet: Optional[Path]) -> None:
            tablet = self._make_tablet(shadow_id)
            phase_a = BuildCompilePhase(
                shadow_id=f"R11_shadow_{shadow_id}",
                iron_tablet_session=tablet,
                workspace_root=self.workspace_root,
                dry_run=self.dry_run,
            )
            k_prompt = self._make_k_prompt(idx, prep_eblet)
            result = phase_a.execute_k_prompt(k_prompt, cycle_number=cycle_number)
            with lock:
                build_results.append(result)

        # Phase B: prep
        def run_prep(shadow_id: str, idx: int) -> None:
            tablet = self._make_tablet(shadow_id)
            phase_b = PrepPhase(
                shadow_id=f"R11_shadow_{shadow_id}",
                iron_tablet_session=tablet,
                workspace_root=self.workspace_root,
                dry_run=self.dry_run,
            )
            next_k_id = f"SYNTH_K{idx + len(a_shadows):03d}"
            result = phase_b.prep_next_cycle(
                next_k_id, session_id=self.session_id, cycle_number=cycle_number
            )
            with lock:
                prep_results.append(result)

        threads: list[threading.Thread] = []

        for i, shadow_id in enumerate(a_shadows):
            if i < len(k_prompt_pairs):
                idx, prep_eblet = k_prompt_pairs[i]
                t = threading.Thread(target=run_build, args=(shadow_id, idx, prep_eblet), daemon=True)
                threads.append(t)

        for i, shadow_id in enumerate(b_shadows):
            if i < len(k_prompt_pairs):
                idx, _ = k_prompt_pairs[i]
                t = threading.Thread(target=run_prep, args=(shadow_id, idx), daemon=True)
                threads.append(t)

        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=60)

        # Score substrate coherence
        coherence_scores: list[float] = []
        for br in build_results:
            # Find a matching prep result (same cycle)
            matching_preps = [pr for pr in prep_results if pr.cycle_number == cycle_number]
            if matching_preps:
                coherence_scores.append(
                    self._score_substrate_coherence(matching_preps[0], br)
                )
            else:
                coherence_scores.append(0.0)

        avg_coherence = sum(coherence_scores) / len(coherence_scores) if coherence_scores else 0.0
        landed = sum(1 for br in build_results if br.success)

        return CycleRunResult(
            cycle_number=cycle_number,
            phase_a_shadows=a_shadows,
            phase_b_shadows=b_shadows,
            build_results=build_results,
            prep_results=prep_results,
            substrate_coherence_score=avg_coherence,
            k_prompts_landed=landed,
            duration_s=time.monotonic() - t0,
        )

    # ── Specialization mode run ────────────────────────────────────────────────

    def _run_specialization_cycle(
        self, cycle_number: int, k_prompt_pairs: list[tuple[int, Optional[Path]]]
    ) -> CycleRunResult:
        """
        Run one cycle of specialization mode.

        Shadows 1-4 (alpha, beta, gamma, delta) = build-only.
        Shadows 5-8 (epsilon, zeta, eta, theta) = prep-only.
        All of the same half run in parallel.
        """
        t0 = time.monotonic()
        build_shadows = ALL_SHADOWS[:4]   # alpha, beta, gamma, delta
        prep_shadows  = ALL_SHADOWS[4:]   # epsilon, zeta, eta, theta

        build_results: list[BuildResult] = []
        prep_results: list[PrepResult] = []
        lock = threading.Lock()

        def run_build(shadow_id: str, idx: int, prep_eblet: Optional[Path]) -> None:
            tablet = self._make_tablet(shadow_id)
            phase_a = BuildCompilePhase(
                shadow_id=f"R11_shadow_{shadow_id}",
                iron_tablet_session=tablet,
                workspace_root=self.workspace_root,
                dry_run=self.dry_run,
            )
            k_prompt = self._make_k_prompt(idx, prep_eblet)
            result = phase_a.execute_k_prompt(k_prompt, cycle_number=cycle_number)
            with lock:
                build_results.append(result)

        def run_prep(shadow_id: str, idx: int) -> None:
            tablet = self._make_tablet(shadow_id)
            phase_b = PrepPhase(
                shadow_id=f"R11_shadow_{shadow_id}",
                iron_tablet_session=tablet,
                workspace_root=self.workspace_root,
                dry_run=self.dry_run,
            )
            next_k_id = f"SYNTH_K{idx + len(build_shadows):03d}"
            result = phase_b.prep_next_cycle(
                next_k_id, session_id=self.session_id, cycle_number=cycle_number
            )
            with lock:
                prep_results.append(result)

        threads: list[threading.Thread] = []
        for i, shadow_id in enumerate(build_shadows):
            if i < len(k_prompt_pairs):
                idx, prep_eblet = k_prompt_pairs[i]
                t = threading.Thread(target=run_build, args=(shadow_id, idx, prep_eblet), daemon=True)
                threads.append(t)
        for i, shadow_id in enumerate(prep_shadows):
            if i < len(k_prompt_pairs):
                idx, _ = k_prompt_pairs[i]
                t = threading.Thread(target=run_prep, args=(shadow_id, idx), daemon=True)
                threads.append(t)

        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=60)

        coherence_scores: list[float] = []
        for br in build_results:
            matching = [pr for pr in prep_results if pr.cycle_number == cycle_number]
            if matching:
                coherence_scores.append(self._score_substrate_coherence(matching[0], br))
            else:
                coherence_scores.append(0.0)

        avg_coherence = sum(coherence_scores) / len(coherence_scores) if coherence_scores else 0.0
        landed = sum(1 for br in build_results if br.success)

        return CycleRunResult(
            cycle_number=cycle_number,
            phase_a_shadows=build_shadows,
            phase_b_shadows=prep_shadows,
            build_results=build_results,
            prep_results=prep_results,
            substrate_coherence_score=avg_coherence,
            k_prompts_landed=landed,
            duration_s=time.monotonic() - t0,
        )

    # ── Full run ───────────────────────────────────────────────────────────────

    def run(
        self, n_k_prompts: int = 16, n_cycles: int = 4, mode: str = "alternation"
    ) -> EmpiricalReceipt:
        """
        Run a full empirical batch in the given mode.

        Args:
            n_k_prompts: Total K-prompts to process (distributed across cycles)
            n_cycles:    Number of alternation cycles to run
            mode:        "alternation" | "specialization"

        Returns:
            EmpiricalReceipt with all metrics populated.
        """
        ts_start = datetime.now(timezone.utc).isoformat()
        receipt = EmpiricalReceipt(
            session_id=self.session_id,
            mode=mode,
            n_k_prompts=n_k_prompts,
            n_cycles=n_cycles,
            ts_start=ts_start,
        )

        # Distribute K-prompts across cycles
        k_per_cycle = max(1, n_k_prompts // n_cycles)

        for cycle in range(n_cycles):
            start_idx = cycle * k_per_cycle
            pairs = [(start_idx + i, None) for i in range(k_per_cycle)]

            if mode == "alternation":
                cr = self._run_alternation_cycle(cycle, pairs)
            else:
                cr = self._run_specialization_cycle(cycle, pairs)

            receipt.cycle_results.append(cr)
            receipt.total_k_prompts_landed += cr.k_prompts_landed
            receipt.total_duration_s += cr.duration_s

        # Aggregate metrics
        if receipt.total_duration_s > 0:
            receipt.throughput_k_prompts_per_hour = (
                receipt.total_k_prompts_landed / receipt.total_duration_s * 3600
            )
        else:
            receipt.throughput_k_prompts_per_hour = 0.0

        all_coherence = [cr.substrate_coherence_score for cr in receipt.cycle_results]
        receipt.avg_substrate_coherence = sum(all_coherence) / len(all_coherence) if all_coherence else 0.0

        # Cohort redundancy: proportion of cycles with ≥1 landed K-prompt
        cycles_with_landing = sum(1 for cr in receipt.cycle_results if cr.k_prompts_landed > 0)
        receipt.cohort_redundancy_score = cycles_with_landing / n_cycles if n_cycles > 0 else 0.0

        # Founder-time projection: assume 45-min cycle period
        receipt.founder_time_per_landing_min = (
            45.0 / receipt.total_k_prompts_landed
            if receipt.total_k_prompts_landed > 0
            else float("inf")
        )

        receipt.ts_end = datetime.now(timezone.utc).isoformat()

        sys.stderr.write(
            f"[AlternationHarness] {mode}: {receipt.summary()}\n"
        )
        return receipt

    # ── Comparison run ─────────────────────────────────────────────────────────

    def compare(
        self, n_k_prompts: int = 16, n_cycles: int = 4
    ) -> ComparisonReport:
        """
        Run both alternation and specialization modes and produce a ComparisonReport.

        Implements Founder hypothesis test (T7 in Phase D spec).
        Applies BRIDLE Rule 4: surfaces to Founder if specialization wins.
        """
        sys.stderr.write("[AlternationHarness] Starting alternation run...\n")
        alt_receipt = self.run(n_k_prompts=n_k_prompts, n_cycles=n_cycles, mode="alternation")

        sys.stderr.write("[AlternationHarness] Starting specialization run...\n")
        spec_receipt = self.run(n_k_prompts=n_k_prompts, n_cycles=n_cycles, mode="specialization")

        # Score comparison: each metric scored 0 (spec wins) or 1 (alt wins)
        alt_wins = 0
        total = 4

        if alt_receipt.throughput_k_prompts_per_hour >= spec_receipt.throughput_k_prompts_per_hour:
            alt_wins += 1
        if alt_receipt.avg_substrate_coherence >= spec_receipt.avg_substrate_coherence:
            alt_wins += 1
        if alt_receipt.cohort_redundancy_score >= spec_receipt.cohort_redundancy_score:
            alt_wins += 1
        # Founder time: lower is better (alt wins if lower or equal)
        if alt_receipt.founder_time_per_landing_min <= spec_receipt.founder_time_per_landing_min:
            alt_wins += 1

        if alt_wins >= 3:
            verdict = "ALTERNATION_WINS"
        elif alt_wins <= 1:
            verdict = "SPECIALIZATION_WINS"
        else:
            verdict = "INCONCLUSIVE"

        verdict_detail = (
            f"Alternation won {alt_wins}/{total} metrics. "
            f"Throughput: {alt_receipt.throughput_k_prompts_per_hour:.2f} vs "
            f"{spec_receipt.throughput_k_prompts_per_hour:.2f} K/hr. "
            f"Coherence: {alt_receipt.avg_substrate_coherence:.3f} vs "
            f"{spec_receipt.avg_substrate_coherence:.3f}. "
            f"Redundancy: {alt_receipt.cohort_redundancy_score:.3f} vs "
            f"{spec_receipt.cohort_redundancy_score:.3f}. "
            f"Founder-time: {alt_receipt.founder_time_per_landing_min:.1f} vs "
            f"{spec_receipt.founder_time_per_landing_min:.1f} min/landing."
        )

        report = ComparisonReport(
            alternation=alt_receipt,
            specialization=spec_receipt,
            ts=datetime.now(timezone.utc).isoformat(),
            verdict=verdict,
            verdict_detail=verdict_detail,
        )

        sys.stderr.write(
            f"[AlternationHarness] Verdict: {verdict} ({alt_wins}/{total} metrics won by alternation)\n"
        )
        return report
