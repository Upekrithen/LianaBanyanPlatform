"""
build_compile.py — Shadow Phase A: Build/Compile Capability (KN-G / BP016)
===========================================================================
Extends Shadow E-Giant from watcher-class to build/compile-class.

Phase A Shadows:
  - Load next K-prompt context (PrepContext from Iron Tablet, output of Phase B)
  - Execute Phases A-E of the K-prompt (REVIEW → DESIGN → IMPLEMENT → VERIFY → COMMIT)
  - Run tests (subprocess)
  - Commit + tag artifact

Composes with:
  - KN090 Shadow promotion (watcher-class extended herein)
  - KN091 In-concert protocol (CyclePhaseCoordinator delegates Phase A work)
  - Iron Tablet (shared substrate for PrepContext hand-off from Phase B → Phase A)
  - Coal-Shovel-Tag BP015: continuous prep-and-fire

BRIDLE v11:
  - Build/compile-class requires elevated authority; does NOT use cathedral-export
  - Test authority granted per cycle (subprocess only; no unasked scope)
  - git-commit + git-push authority: YES (per Founder ratification of KN-G Pod-G)

Crown-Jewel-class velocity-amplification primitive (BP016 Founder direct).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import textwrap
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .iron_tablet_attach import IronTabletAttach, WriteAuthority

# ─── Constants ────────────────────────────────────────────────────────────────

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
EBLET_BASE = Path.home() / ".claude" / "state" / "eblets"

PHASES = ["REVIEW", "DESIGN", "IMPLEMENT", "VERIFY", "COMMIT"]


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class KPromptContext:
    """Minimal context needed to execute a K-prompt in build/compile mode."""
    k_prompt_id: str           # e.g. "K461"
    prompt_file: Path          # absolute path to .md prompt
    session_id: str            # e.g. "BP016"
    prep_context_eblet: Optional[Path] = None   # PrepContext written by Phase B Shadow
    estimated_minutes: int = 45


@dataclass
class PhaseExecutionResult:
    phase: str        # REVIEW | DESIGN | IMPLEMENT | VERIFY | COMMIT
    status: str       # "pass" | "skip" | "fail" | "partial"
    notes: str = ""
    duration_s: float = 0.0


@dataclass
class BuildResult:
    k_prompt_id: str
    shadow_id: str
    cycle_number: int
    ts_start: str
    ts_end: str = ""
    phases: list[PhaseExecutionResult] = field(default_factory=list)
    commit_sha: str = ""
    tag: str = ""
    tests_passed: bool = False
    test_summary: str = ""
    errors: list[str] = field(default_factory=list)

    @property
    def success(self) -> bool:
        return (
            not self.errors
            and self.tests_passed
            and all(p.status in ("pass", "skip") for p in self.phases)
        )

    def to_markdown(self) -> str:
        phase_rows = "\n".join(
            f"| {p.phase} | {p.status.upper()} | {p.notes} | {p.duration_s:.1f}s |"
            for p in self.phases
        )
        return textwrap.dedent(f"""\
            # Build/Compile Receipt — {self.k_prompt_id}

            **Shadow**: `{self.shadow_id}`
            **Cycle**: {self.cycle_number}
            **Started**: `{self.ts_start}`
            **Ended**: `{self.ts_end}`
            **Success**: {self.success}

            ## Phase Execution

            | Phase | Status | Notes | Duration |
            |---|---|---|---|
            {phase_rows}

            ## Commit

            - **SHA**: `{self.commit_sha or "—"}`
            - **Tag**: `{self.tag or "—"}`
            - **Tests**: {"PASS" if self.tests_passed else "FAIL"} — {self.test_summary}

            ## Errors

            {("_none_" if not self.errors else chr(10).join(f"- {e}" for e in self.errors))}

            _KN-G · BP016 · Pod-G alternating-cylinder-fire_
        """)


# ─── Core build/compile class ──────────────────────────────────────────────────

class BuildCompilePhase:
    """
    Phase A: Shadow E-Giant operates in build/compile mode.

    Loads the PrepContext (written by the prior Phase B Shadow) from the Iron Tablet,
    then executes the K-prompt's REVIEW → DESIGN → IMPLEMENT → VERIFY → COMMIT
    cycle within the Shadow's session context.

    This class is SIMULATION-CAPABLE: when run without a real Cursor IDE process
    the individual phase methods execute structural checks (file existence, test
    subprocess) rather than live IDE operations. The interface is identical so
    a future live-Cursor integration can swap the phase implementations.

    Elevated write-authority tier: 'build_compile_class' (KN-G extension).
    Tests are executed via subprocess (pytest). Git commit + tag are issued via
    subprocess, scoped to WORKSPACE_ROOT.
    """

    # Shadows that form the Phase-A group in even cycles (see CyclePhaseCoordinator)
    EVEN_CYCLE_A_SHADOWS = frozenset({"alpha", "gamma", "epsilon", "eta"})

    def __init__(
        self,
        shadow_id: str,
        iron_tablet_session: IronTabletAttach,
        workspace_root: Optional[Path] = None,
        dry_run: bool = False,
    ):
        self.shadow_id = shadow_id
        self.iron_tablet = iron_tablet_session
        self.workspace_root = workspace_root or WORKSPACE_ROOT
        self.dry_run = dry_run

    # ── Prep context loading ───────────────────────────────────────────────────

    def load_prep_context(self, prep_context_eblet: Path) -> dict:
        """
        Read the PrepContext written by a Phase B Shadow from the Iron Tablet.

        Returns a dict with keys: k_prompt_id, wrasse_pre_injections,
        canon_eblet_paths, pheromone_hits, substrate_verified, notes.
        """
        result = self.iron_tablet.read(prep_context_eblet)
        if result is None:
            return {"error": f"PrepContext not found: {prep_context_eblet}"}
        content = result.content
        # Minimal structured extraction — PrepContext is markdown
        ctx: dict = {"raw": content}
        for line in content.splitlines():
            if line.startswith("- **k_prompt_id**:"):
                ctx["k_prompt_id"] = line.split(":", 1)[-1].strip().strip("`")
            elif line.startswith("- **substrate_verified**:"):
                ctx["substrate_verified"] = "true" in line.lower()
            elif line.startswith("- **wrasse_pre_injections**:"):
                ctx["wrasse_pre_injections"] = line.split(":", 1)[-1].strip()
        return ctx

    # ── Phase execution ────────────────────────────────────────────────────────

    def _phase_review(self, k_prompt: KPromptContext) -> PhaseExecutionResult:
        """REVIEW: verify prompt file readable; load prep-context."""
        import time
        t0 = time.monotonic()
        notes = ""
        status = "pass"
        if not k_prompt.prompt_file.exists():
            status = "fail"
            notes = f"Prompt file missing: {k_prompt.prompt_file}"
        else:
            size = k_prompt.prompt_file.stat().st_size
            notes = f"Prompt file: {k_prompt.prompt_file.name} ({size}b)"
            if k_prompt.prep_context_eblet and k_prompt.prep_context_eblet.exists():
                ctx = self.load_prep_context(k_prompt.prep_context_eblet)
                if "error" in ctx:
                    notes += f"; PrepContext WARN: {ctx['error']}"
                else:
                    notes += "; PrepContext loaded"
        return PhaseExecutionResult("REVIEW", status, notes, time.monotonic() - t0)

    def _phase_design(self, k_prompt: KPromptContext) -> PhaseExecutionResult:
        """
        DESIGN: structural review of workspace for affected files.

        In live mode this is the Shadow reading the K-prompt + proposing edits.
        In simulation mode we verify that the workspace root is clean (no unresolved
        merge conflicts) and return 'pass'.
        """
        import time
        t0 = time.monotonic()
        if self.dry_run:
            return PhaseExecutionResult("DESIGN", "skip", "dry_run=True", time.monotonic() - t0)

        try:
            result = subprocess.run(
                ["git", "diff", "--check"],
                capture_output=True, text=True, cwd=str(self.workspace_root), timeout=15,
            )
            if result.returncode == 0:
                return PhaseExecutionResult("DESIGN", "pass", "workspace clean", time.monotonic() - t0)
            return PhaseExecutionResult("DESIGN", "warn", f"git diff --check: {result.stdout.strip()[:120]}", time.monotonic() - t0)
        except Exception as exc:
            return PhaseExecutionResult("DESIGN", "partial", f"git check skipped: {exc}", time.monotonic() - t0)

    def _phase_implement(self, k_prompt: KPromptContext) -> PhaseExecutionResult:
        """
        IMPLEMENT: placeholder for live IDE code-edit operations.

        In simulation mode: log the K-prompt ID and return 'skip'.
        Live integration: Shadow drives Cursor via Cursor SDK or subprocess.
        """
        import time
        t0 = time.monotonic()
        notes = f"K-prompt {k_prompt.k_prompt_id} — simulation mode (live IDE not wired)"
        return PhaseExecutionResult("IMPLEMENT", "skip", notes, time.monotonic() - t0)

    def _phase_verify(self, k_prompt: KPromptContext) -> tuple[PhaseExecutionResult, bool, str]:
        """VERIFY: run pytest from workspace root; return (result, tests_passed, summary)."""
        import time
        t0 = time.monotonic()
        if self.dry_run:
            return (
                PhaseExecutionResult("VERIFY", "skip", "dry_run=True", time.monotonic() - t0),
                True,
                "dry_run — tests not run",
            )

        try:
            proc = subprocess.run(
                [
                    sys.executable, "-m", "pytest",
                    "the_shadow/tests/",
                    "-x", "--tb=short", "-q",
                    f"--rootdir={self.workspace_root}",
                ],
                capture_output=True, text=True,
                cwd=str(self.workspace_root),
                timeout=120,
            )
            summary = (proc.stdout + proc.stderr)[-400:].strip()
            passed = proc.returncode == 0
            status = "pass" if passed else "fail"
            return (
                PhaseExecutionResult("VERIFY", status, summary[:120], time.monotonic() - t0),
                passed,
                summary,
            )
        except subprocess.TimeoutExpired:
            return (
                PhaseExecutionResult("VERIFY", "fail", "pytest timeout", time.monotonic() - t0),
                False,
                "TIMEOUT",
            )
        except Exception as exc:
            return (
                PhaseExecutionResult("VERIFY", "partial", f"pytest error: {exc}", time.monotonic() - t0),
                False,
                str(exc),
            )

    def _phase_commit(
        self, k_prompt: KPromptContext, tests_passed: bool
    ) -> tuple[PhaseExecutionResult, str, str]:
        """
        COMMIT: git add + commit + tag the build artifact.

        Returns (result, commit_sha, tag).
        Only commits if tests passed and not dry_run.
        """
        import time
        t0 = time.monotonic()
        if self.dry_run:
            return (
                PhaseExecutionResult("COMMIT", "skip", "dry_run=True", time.monotonic() - t0),
                "",
                "",
            )
        if not tests_passed:
            return (
                PhaseExecutionResult("COMMIT", "skip", "tests failed; no commit", time.monotonic() - t0),
                "",
                "",
            )

        tag = f"v-shadow-build-{k_prompt.k_prompt_id.lower()}-{self.shadow_id}"
        commit_msg = (
            f"feat(the_shadow): Phase A build/compile — {k_prompt.k_prompt_id}\n\n"
            f"Shadow: {self.shadow_id} · Cycle: alternating-cylinder-fire · BP016 KN-G"
        )
        try:
            # Stage tracked modifications
            subprocess.run(
                ["git", "add", "--update"],
                cwd=str(self.workspace_root), check=True, capture_output=True, timeout=15,
            )
            commit_proc = subprocess.run(
                ["git", "commit", "-m", commit_msg],
                capture_output=True, text=True,
                cwd=str(self.workspace_root), timeout=30,
            )
            if commit_proc.returncode != 0:
                out = (commit_proc.stdout + commit_proc.stderr)[:200]
                return (
                    PhaseExecutionResult("COMMIT", "fail", f"commit failed: {out}", time.monotonic() - t0),
                    "",
                    "",
                )
            sha_proc = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True,
                cwd=str(self.workspace_root), timeout=10,
            )
            sha = sha_proc.stdout.strip()
            # Tag
            subprocess.run(
                ["git", "tag", f"{tag}-{sha}"],
                capture_output=True, cwd=str(self.workspace_root), timeout=10,
            )
            return (
                PhaseExecutionResult("COMMIT", "pass", f"SHA={sha} TAG={tag}-{sha}", time.monotonic() - t0),
                sha,
                f"{tag}-{sha}",
            )
        except Exception as exc:
            return (
                PhaseExecutionResult("COMMIT", "fail", str(exc), time.monotonic() - t0),
                "",
                "",
            )

    # ── Main execution entry ───────────────────────────────────────────────────

    def execute_k_prompt(
        self, k_prompt: KPromptContext, cycle_number: int = 0
    ) -> BuildResult:
        """
        Execute a K-prompt through all 5 build/compile phases.

        Args:
            k_prompt:     Minimal context for this K-prompt execution.
            cycle_number: Current alternation cycle number (for receipt labeling).

        Returns:
            BuildResult with full phase log, commit SHA, tag, and test summary.
        """
        ts_start = datetime.now(timezone.utc).isoformat()
        result = BuildResult(
            k_prompt_id=k_prompt.k_prompt_id,
            shadow_id=self.shadow_id,
            cycle_number=cycle_number,
            ts_start=ts_start,
        )

        sys.stderr.write(
            f"[{self.shadow_id}][Phase-A] execute_k_prompt start: "
            f"{k_prompt.k_prompt_id} cycle={cycle_number}\n"
        )

        # REVIEW
        phase_review = self._phase_review(k_prompt)
        result.phases.append(phase_review)
        if phase_review.status == "fail":
            result.errors.append(f"REVIEW failed: {phase_review.notes}")
            result.ts_end = datetime.now(timezone.utc).isoformat()
            return result

        # DESIGN
        phase_design = self._phase_design(k_prompt)
        result.phases.append(phase_design)

        # IMPLEMENT
        phase_impl = self._phase_implement(k_prompt)
        result.phases.append(phase_impl)

        # VERIFY
        phase_verify, tests_passed, test_summary = self._phase_verify(k_prompt)
        result.phases.append(phase_verify)
        result.tests_passed = tests_passed
        result.test_summary = test_summary

        # COMMIT
        phase_commit, sha, tag = self._phase_commit(k_prompt, tests_passed)
        result.phases.append(phase_commit)
        result.commit_sha = sha
        result.tag = tag

        result.ts_end = datetime.now(timezone.utc).isoformat()

        # Write receipt to Iron Tablet
        if not self.dry_run:
            session_dir = EBLET_BASE / k_prompt.session_id
            session_dir.mkdir(parents=True, exist_ok=True)
            receipt_path = session_dir / (
                f"build_receipt_{self.shadow_id}_{k_prompt.k_prompt_id}_cycle{cycle_number}.eblet.md"
            )
            self.iron_tablet.write(
                receipt_path,
                result.to_markdown(),
                decision_id=f"build_{k_prompt.k_prompt_id}_{cycle_number}",
                scope=WriteAuthority.CANONICAL_EBLET,
            )
            sys.stderr.write(f"[{self.shadow_id}][Phase-A] receipt → {receipt_path}\n")

        sys.stderr.write(
            f"[{self.shadow_id}][Phase-A] done: success={result.success} "
            f"sha={result.commit_sha or '—'}\n"
        )
        return result
