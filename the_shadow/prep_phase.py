"""
prep_phase.py — Shadow Phase B: Prep Capability (KN-G / BP016)
===============================================================
Phase B Shadows prepare context for the next cycle's Phase A Shadows.

Phase B responsibilities (per Founder hypothesis / BP016):
  1. Read prior transcript (most recent agent-transcript JSONL)
  2. Verify substrate state (Phase 7-bis equivalent: Iron Tablet + Pheromone healthy)
  3. Load Wrasse pre-injections relevant to next K-prompt
  4. Sample canon eblets relevant to next K-prompt
  5. Pre-cache Pheromone substrate hits for next K-prompt claims
  6. Output PrepContext stored in Iron Tablet for next A-phase Shadow

The PrepContext is a structured eblet written to the shared Iron Tablet.
The next cycle's Phase A Shadow reads it via BuildCompilePhase.load_prep_context().

Composes with:
  - KN090 Shadow promotion + lifecycle
  - KN091 In-concert protocol
  - Coal-Shovel-Tag BP015 (continuous prep-and-fire)
  - Wrasse Registry (pre-injection lookups)
  - Pheromone Substrate (hit pre-caching)
"""
from __future__ import annotations

import json
import re
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

LIBRARIAN_ROOT = WORKSPACE_ROOT / "librarian-mcp"
PHEROMONE_INDEX = LIBRARIAN_ROOT / "stitchpunks" / "pheromone_substrate" / "index.jsonl"
WRASSE_REGISTRY = LIBRARIAN_ROOT / "stitchpunks" / "wrasse" / "wrasse_registry.jsonl"
CANON_EBLET_ROOT = Path.home() / ".claude" / "state" / "eblets" / "CANON"
AGENT_TRANSCRIPTS = Path.home() / ".cursor" / "projects"


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class PrepContext:
    """
    Output of Phase B: context pre-packaged for the next A-phase Shadow.

    Serializes to an Iron Tablet eblet (markdown). Read by
    BuildCompilePhase.load_prep_context().
    """
    k_prompt_id: str
    session_id: str
    shadow_id: str
    cycle_number: int
    ts: str
    substrate_verified: bool = False
    substrate_notes: str = ""
    wrasse_pre_injections: list[str] = field(default_factory=list)
    canon_eblet_paths: list[str] = field(default_factory=list)
    pheromone_hits: list[str] = field(default_factory=list)
    prior_transcript_summary: str = ""
    notes: str = ""
    errors: list[str] = field(default_factory=list)

    def to_markdown(self) -> str:
        injections = "\n".join(f"  - `{w}`" for w in self.wrasse_pre_injections) or "  _none_"
        canon_paths = "\n".join(f"  - `{p}`" for p in self.canon_eblet_paths) or "  _none_"
        pheromone = "\n".join(f"  - {h}" for h in self.pheromone_hits) or "  _none_"
        errors = "\n".join(f"- {e}" for e in self.errors) or "_none_"
        return textwrap.dedent(f"""\
            # PrepContext — {self.k_prompt_id}

            - **k_prompt_id**: `{self.k_prompt_id}`
            - **session_id**: `{self.session_id}`
            - **shadow_id**: `{self.shadow_id}`
            - **cycle_number**: {self.cycle_number}
            - **ts**: `{self.ts}`
            - **substrate_verified**: {str(self.substrate_verified).lower()}

            ## Substrate State

            {self.substrate_notes or "_not checked_"}

            ## Wrasse Pre-injections

            {injections}

            ## Canon Eblet Paths

            {canon_paths}

            ## Pheromone Hits

            {pheromone}

            ## Prior Transcript Summary

            {self.prior_transcript_summary or "_no prior transcript_"}

            ## Notes

            {self.notes or "_none_"}

            ## Errors

            {errors}

            _KN-G · BP016 · Pod-G alternating-cylinder-fire · Phase B prep_
        """)


@dataclass
class PrepResult:
    shadow_id: str
    k_prompt_id: str
    cycle_number: int
    ts_start: str
    ts_end: str = ""
    prep_context: Optional[PrepContext] = None
    eblet_path: Optional[Path] = None
    errors: list[str] = field(default_factory=list)

    @property
    def success(self) -> bool:
        return self.prep_context is not None and not self.errors


# ─── Core prep class ──────────────────────────────────────────────────────────

class PrepPhase:
    """
    Phase B: Shadow E-Giant operates in prep mode.

    Reads prior transcripts; verifies substrate state; loads Wrasse pre-injections;
    samples canon; prepares next-K-prompt-context stored in Iron Tablet for the next
    cycle's Phase A Shadow.

    All reads are filesystem-based (no LLM calls). The PrepContext is a structured
    document that encapsulates the "warm context" the Phase A Shadow will need.
    """

    # Shadows that form Phase-B group in even cycles (complements BuildCompilePhase)
    EVEN_CYCLE_B_SHADOWS = frozenset({"beta", "delta", "zeta", "theta"})

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

    # ── Phase B sub-operations ─────────────────────────────────────────────────

    def _verify_substrate(self) -> tuple[bool, str]:
        """
        Phase 7-bis equivalent: verify Iron Tablet ledger + Pheromone index are healthy.

        Returns (ok, notes).
        """
        notes: list[str] = []
        ok = True

        # Check Pheromone index exists and has recent entries
        if PHEROMONE_INDEX.exists():
            try:
                lines = [
                    l.strip() for l in PHEROMONE_INDEX.read_text(encoding="utf-8").splitlines()
                    if l.strip()
                ]
                notes.append(f"Pheromone index: {len(lines)} entries")
            except OSError as exc:
                ok = False
                notes.append(f"Pheromone index read error: {exc}")
        else:
            notes.append("Pheromone index: not found (substrate may be cold)")

        # Check Wrasse registry exists
        if WRASSE_REGISTRY.exists():
            notes.append(f"Wrasse registry: FOUND ({WRASSE_REGISTRY.stat().st_size}b)")
        else:
            notes.append("Wrasse registry: not found")

        # Check librarian-mcp canonical_values.yaml
        canon_yaml = LIBRARIAN_ROOT / "canonical_values.yaml"
        if canon_yaml.exists():
            notes.append("canonical_values.yaml: FOUND")
        else:
            ok = False
            notes.append("canonical_values.yaml: MISSING")

        return ok, "; ".join(notes)

    def _load_wrasse_pre_injections(self, k_prompt_id: str) -> list[str]:
        """
        Query Wrasse Registry for pre-injections relevant to this K-prompt.

        Returns list of trigger_pattern strings (Wrasse entry keys) that are
        relevant, as a lightweight pre-cache for the Phase A Shadow.
        """
        if not WRASSE_REGISTRY.exists():
            return []

        relevant: list[str] = []
        search_terms = {k_prompt_id.lower(), "shadow", "egiant", "cylinder", "alternating"}

        try:
            for line in WRASSE_REGISTRY.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    pattern = str(obj.get("trigger_pattern", "")).lower()
                    resolution = str(obj.get("canonical_resolution", "")).lower()
                    combined = pattern + " " + resolution
                    if any(term in combined for term in search_terms):
                        tid = obj.get("trigger_id", "")
                        if tid and tid not in relevant:
                            relevant.append(tid)
                except json.JSONDecodeError:
                    continue
        except OSError:
            pass

        return relevant[:20]  # cap at 20 to avoid bloat

    def _sample_canon_eblets(self, k_prompt_id: str) -> list[str]:
        """
        Enumerate Canon eblets related to this K-prompt / shadow / bp016 context.

        Returns list of relative paths (str) to relevant .eblet.md files.
        """
        if not CANON_EBLET_ROOT.exists():
            return []

        relevant: list[str] = []
        search_terms = {
            "shadow", "egiant", "bp011", "bp015", "bp016",
            "cylinder", "alternating", "iron", "concert",
        }

        try:
            for eblet_file in CANON_EBLET_ROOT.glob("*.eblet.md"):
                name_lower = eblet_file.name.lower()
                if any(term in name_lower for term in search_terms):
                    relevant.append(str(eblet_file))
        except OSError:
            pass

        return relevant[:15]  # cap at 15

    def _read_prior_transcript_summary(self) -> str:
        """
        Read the most recent agent transcript and return a brief summary line.

        Agent transcripts live in ~/.cursor/projects/<project>/agent-transcripts/*.jsonl
        We find the most recently modified and extract the last assistant message title.
        """
        try:
            project_dir = (
                Path.home()
                / ".cursor"
                / "projects"
                / "c-Users-Administrator-Documents-LianaBanyanPlatform"
                / "agent-transcripts"
            )
            if not project_dir.exists():
                return "agent-transcripts directory not found"

            jsonl_files = sorted(
                project_dir.glob("*.jsonl"),
                key=lambda f: f.stat().st_mtime,
                reverse=True,
            )
            if not jsonl_files:
                return "no agent transcripts found"

            most_recent = jsonl_files[0]
            # Read last few lines for a lightweight summary
            lines = most_recent.read_text(encoding="utf-8", errors="replace").splitlines()
            # Grab last 5 lines, extract text excerpts
            excerpt_parts = []
            for line in lines[-5:]:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    role = obj.get("role", "")
                    content = obj.get("content", "")
                    if isinstance(content, str) and content:
                        excerpt_parts.append(f"[{role}] {content[:80]}")
                    elif isinstance(content, list):
                        for item in content:
                            if isinstance(item, dict) and item.get("type") == "text":
                                excerpt_parts.append(f"[{role}] {item.get('text', '')[:80]}")
                                break
                except (json.JSONDecodeError, TypeError):
                    continue

            summary = f"Most recent: {most_recent.name}\n" + "\n".join(excerpt_parts[-3:])
            return summary[:400]
        except Exception as exc:
            return f"transcript read error: {exc}"

    def _load_pheromone_hits(self, k_prompt_id: str) -> list[str]:
        """
        Pre-cache Pheromone substrate hits for claims likely relevant to this K-prompt.

        Returns list of '<scribe_id>: <topics_excerpt>' strings.
        """
        if not PHEROMONE_INDEX.exists():
            return []

        search_terms = {
            k_prompt_id.lower(), "shadow", "egiant",
            "cylinder", "alternating", "iron_egiant",
        }
        hits: list[str] = []

        try:
            for line in PHEROMONE_INDEX.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    topics = obj.get("topics", [])
                    topics_lower = " ".join(str(t) for t in topics).lower()
                    if any(term in topics_lower for term in search_terms):
                        scribe = obj.get("scribe", "?")
                        ts = obj.get("ts", "")[:16]
                        topic_str = ", ".join(str(t) for t in topics[:5])
                        hits.append(f"{scribe} @{ts}: {topic_str}")
                except json.JSONDecodeError:
                    continue
        except OSError:
            pass

        return hits[:10]  # cap at 10

    # ── Main prep entry ────────────────────────────────────────────────────────

    def prep_next_cycle(
        self,
        next_k_prompt_id: str,
        session_id: str,
        cycle_number: int = 0,
    ) -> PrepResult:
        """
        Prepare context for the next K-prompt cycle.

        Writes a PrepContext eblet to the shared Iron Tablet. The next cycle's
        Phase A Shadow reads it via BuildCompilePhase.load_prep_context().

        Args:
            next_k_prompt_id: e.g. "K461" — the K-prompt the next A-phase will execute
            session_id:       e.g. "BP016"
            cycle_number:     Current alternation cycle number

        Returns:
            PrepResult with PrepContext and the eblet path it was stored at.
        """
        ts_start = datetime.now(timezone.utc).isoformat()
        result = PrepResult(
            shadow_id=self.shadow_id,
            k_prompt_id=next_k_prompt_id,
            cycle_number=cycle_number,
            ts_start=ts_start,
        )

        sys.stderr.write(
            f"[{self.shadow_id}][Phase-B] prep_next_cycle start: "
            f"{next_k_prompt_id} cycle={cycle_number}\n"
        )

        errors: list[str] = []

        # 1. Read prior transcript
        prior_summary = self._read_prior_transcript_summary()

        # 2. Verify substrate state
        substrate_ok, substrate_notes = self._verify_substrate()
        if not substrate_ok:
            errors.append(f"Substrate check failed: {substrate_notes}")

        # 3. Load Wrasse pre-injections
        wrasse_injections = self._load_wrasse_pre_injections(next_k_prompt_id)

        # 4. Sample canon eblets
        canon_paths = self._sample_canon_eblets(next_k_prompt_id)

        # 5. Pre-cache Pheromone hits
        pheromone_hits = self._load_pheromone_hits(next_k_prompt_id)

        # 6. Assemble PrepContext
        ctx = PrepContext(
            k_prompt_id=next_k_prompt_id,
            session_id=session_id,
            shadow_id=self.shadow_id,
            cycle_number=cycle_number,
            ts=ts_start,
            substrate_verified=substrate_ok,
            substrate_notes=substrate_notes,
            wrasse_pre_injections=wrasse_injections,
            canon_eblet_paths=canon_paths,
            pheromone_hits=pheromone_hits,
            prior_transcript_summary=prior_summary,
            notes=f"Prepared by Shadow {self.shadow_id} · cycle {cycle_number}",
            errors=errors,
        )
        result.prep_context = ctx

        # 7. Write PrepContext to Iron Tablet
        if not self.dry_run:
            session_dir = EBLET_BASE / session_id
            session_dir.mkdir(parents=True, exist_ok=True)
            eblet_path = session_dir / (
                f"prep_context_{self.shadow_id}_{next_k_prompt_id}_cycle{cycle_number}.eblet.md"
            )
            self.iron_tablet.write(
                eblet_path,
                ctx.to_markdown(),
                decision_id=f"prep_{next_k_prompt_id}_{cycle_number}",
                scope=WriteAuthority.CANONICAL_EBLET,
            )
            result.eblet_path = eblet_path
            sys.stderr.write(f"[{self.shadow_id}][Phase-B] PrepContext → {eblet_path}\n")

        result.ts_end = datetime.now(timezone.utc).isoformat()
        result.errors = errors

        sys.stderr.write(
            f"[{self.shadow_id}][Phase-B] done: substrate_ok={substrate_ok} "
            f"wrasse={len(wrasse_injections)} canon={len(canon_paths)} "
            f"pheromone={len(pheromone_hits)}\n"
        )
        return result
