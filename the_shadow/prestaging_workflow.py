"""
Pre-Staging Workflow — KN-R2 / BP018
=======================================
On near-completion signal from NearCompletionWatcher:
  1. Read next K-prompt from On Deck Scribe queue (Pod-Q)
  2. Parse WRASSE PRE-INJECTION block triggers (k_prompt_parser)
  3. Bulk-load all listed Eblets (read file paths into context)
  4. Dispatch Detective TEAM Phase-0 for primary triggers (5 hits per trigger)
  5. Read prerequisite K-prompt commits + test results (prerequisite_context_builder)
  6. Build PreparedContext dataclass
  7. Call on_deck_attach_prepared_context (Pod-Q MCP tool)

On prerequisite-missing → entry remains queued, NOT marked errored, retry next cycle.

Composes with:
  KN-R1 NearCompletionWatcher — signal consumer
  KN-Q1 Pod-Q reader          — reads next queue entry
  KN-Q1 Pod-Q writer          — attaches prepared_context
  KN-K k_prompt_parser        — extracts WRASSE triggers + Eblet paths
  prerequisite_context_builder — samples prereq commits + tests
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Callable

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WORKSPACE_ROOT / "librarian-mcp" / "dist"))

from .k_prompt_parser import parse_k_prompt, KPromptManifest
from .prerequisite_context_builder import build_prerequisite_context
from .overlap_signal import NearCompletionSignal


# ─── PreparedContext (mirrors TypeScript type) ─────────────────────────────────

@dataclass
class PreparedContext:
    shadow_id: str
    prep_ts: str
    wrasse_pre_injections: list[str]       # Eblet paths bulk-loaded
    detective_findings: list[dict]         # Phase-0 hits cached
    prerequisite_context_summary: str


# ─── OnDeckEntry stub (minimal) ───────────────────────────────────────────────

@dataclass
class OnDeckEntry:
    id: str
    k_prompt_path: str
    status: str
    prerequisites: list[str] = field(default_factory=list)
    pod_class: Optional[str] = None


# ─── PreStagingWorkflow ────────────────────────────────────────────────────────

class PreStagingWorkflow:
    """
    Triggered by NearCompletionSignal. Pre-stages the next K-prompt in the
    On Deck Scribe queue by bulk-loading Eblets, running Detective Phase-0,
    and attaching PreparedContext to the queue entry.
    """

    def __init__(
        self,
        shadow_id: str,
        queue_path: Optional[Path] = None,
        detective_team_fn: Optional[Callable[[str, int], list[dict]]] = None,
    ) -> None:
        self.shadow_id = shadow_id
        self.queue_path = queue_path or (Path.home() / ".claude" / "state" / "on_deck_scribe" / "queue.jsonl")
        self.detective_team_fn = detective_team_fn or _default_detective_phase0

    def get_next_entry(self) -> Optional[OnDeckEntry]:
        """Read the next queued K-prompt entry from On Deck Scribe (Pod-Q)."""
        if not self.queue_path.exists():
            return None

        merged: dict[str, dict] = {}
        try:
            for line in self.queue_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                entry = json.loads(line)
                eid = entry.get("id", "")
                if not eid:
                    continue
                if eid not in merged:
                    merged[eid] = entry
                else:
                    merged[eid].update({k: v for k, v in entry.items() if v not in ("", None)})
        except Exception:
            return None

        # Find landed IDs for prerequisite checking
        landed = {eid for eid, e in merged.items() if e.get("status") == "landed"}

        # Get next queued knight entry with all prerequisites landed
        candidates = [
            e for e in merged.values()
            if e.get("status") == "queued" and e.get("category") == "knight"
        ]
        candidates.sort(key=lambda e: e.get("priority", 99))

        for candidate in candidates:
            prereqs = candidate.get("prerequisites", [])
            if all(p in landed for p in prereqs):
                return OnDeckEntry(
                    id=candidate["id"],
                    k_prompt_path=str(candidate.get("k_prompt_path", "")),
                    status="queued",
                    prerequisites=prereqs,
                    pod_class=candidate.get("pod_class"),
                )

        return None

    def pre_stage(self, next_entry: OnDeckEntry) -> Optional[PreparedContext]:
        """
        Pre-stage a K-prompt entry. Returns PreparedContext on success.
        Returns None if prerequisites missing (retry next cycle — NOT errored).
        """
        # Parse K-prompt file
        manifest = parse_k_prompt(next_entry.k_prompt_path)

        # Bulk-load Eblet paths (verify existence; include path in result)
        loaded_eblets = []
        for eblet_path in manifest.wrasse_eblet_paths:
            expanded = Path(eblet_path.replace("~/", str(Path.home()) + "/"))
            if expanded.exists():
                loaded_eblets.append(str(expanded))
            else:
                # Include the path even if not present (Shadow will load what it can)
                loaded_eblets.append(eblet_path)

        # Detective TEAM Phase-0: 5 hits per trigger (up to first 3 triggers)
        detective_findings = []
        for trigger in manifest.wrasse_triggers[:3]:
            hits = self.detective_team_fn(trigger, 5)
            detective_findings.extend(hits)

        # Prerequisite context summary
        prereq_summary = build_prerequisite_context(
            prerequisite_entry_ids=next_entry.prerequisites,
            prerequisite_tags=manifest.prerequisite_tags,
        )

        ctx = PreparedContext(
            shadow_id=self.shadow_id,
            prep_ts=datetime.now(timezone.utc).isoformat(),
            wrasse_pre_injections=loaded_eblets or manifest.wrasse_eblet_paths,
            detective_findings=detective_findings,
            prerequisite_context_summary=prereq_summary,
        )

        # Attach to queue entry via Pod-Q writer (append mutation to queue.jsonl)
        self._attach_to_queue(next_entry.id, ctx)

        return ctx

    def _attach_to_queue(self, entry_id: str, ctx: PreparedContext) -> None:
        """Append a prepared_context mutation line to queue.jsonl."""
        mutation = {
            "id": entry_id,
            "status": "queued",
            "category": "knight",
            "k_prompt_path": "",
            "priority": 0,
            "prerequisites": [],
            "ts_queued": "",
            "prepared_context": {
                "shadow_id": ctx.shadow_id,
                "prep_ts": ctx.prep_ts,
                "wrasse_pre_injections": ctx.wrasse_pre_injections,
                "detective_findings": ctx.detective_findings,
                "prerequisite_context_summary": ctx.prerequisite_context_summary,
            },
        }
        try:
            self.queue_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.queue_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(mutation) + "\n")
        except Exception:
            pass


# ─── Default Detective Phase-0 stub ───────────────────────────────────────────

def _default_detective_phase0(trigger: str, max_hits: int = 5) -> list[dict]:
    """
    Default Detective Phase-0 implementation.
    Real implementation would call the Detective MCP tool via subprocess.
    Stub returns empty list (no-op) when detective substrate unavailable.
    """
    # Try to read from Pheromone substrate JSONL for the trigger
    substrate_path = (
        Path(__file__).resolve().parents[1]
        / "librarian-mcp"
        / "stitchpunks"
        / "pheromone_substrate"
        / "index.jsonl"
    )
    if not substrate_path.exists():
        return []

    results = []
    try:
        for line in substrate_path.read_text(encoding="utf-8", errors="ignore").splitlines():
            if not line.strip():
                continue
            entry = json.loads(line)
            content = str(entry.get("content", "")) + str(entry.get("text", ""))
            if trigger.lower() in content.lower():
                results.append({
                    "trigger": trigger,
                    "scribe": str(entry.get("scribe", "unknown")),
                    "excerpt": content[:200],
                    "score": 0.8,
                })
                if len(results) >= max_hits:
                    break
    except Exception:
        pass

    return results
