"""
Augur — Multi-Seer Coordination Layer.

K492 · B123 · Crown Jewel #2298 (Seer / Augur / Eblets — The Awareness Net)

Architecture (§4 of project_seer_augur_eblets_awareness_net.md):
  The Augur is the meta-coordination layer above multiple Seers.
  Each Seer operates over a distinct Pyramid sub-domain substrate.
  The Augur:
    1. Receives a query
    2. Scores each Seer's domain relevance against the query
    3. Routes to relevant Seers (typically 1-3; not always all)
    4. Collects SeerResults with full provenance chains
    5. Synthesizes a unified answer:
       - Preserves cross-Seer attribution per claim [Seer-A] / [Seer-B]
       - Surfaces conflicts honestly (doesn't paper over disagreements)
       - Reports scope-coverage (which Pyramids contributed; which didn't)
       - Returns honest-unknown when no Seer's substrate covers the query

Naming: Roman augurs interpreted omens across multiple sources (bird flight,
weather, entrails) to synthesize a singular augury. Architecturally: reads
outputs from multiple Seers, each over a distinct Pyramid substrate, and
synthesizes across Pyramid-boundaries.

REF Staff discipline: Augur reads Seer outputs; no Seer-substrate modification.
Conflict surfacing > conflict resolution (resolution is a Founder-level decision).

Usage:
  from augurs.augur import Augur
  from augurs.domain_filters import arch_empirics_filter, founder_voice_filter
  from seers.seer import Seer

  seer_a = Seer(api_client=client, seer_id="Seer-A", domain_filter=arch_empirics_filter,
                domain_name="arch_empirics")
  seer_b = Seer(api_client=client, seer_id="Seer-B", domain_filter=founder_voice_filter,
                domain_name="founder_voice")
  augur = Augur(seers=[seer_a, seer_b], api_client=client)
  result = augur.query("What's the empirical evidence for the Wheelbarrow Policy?")
  print(result.answer)
"""

from __future__ import annotations

import json
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from seers.seer import Seer, SeerResult

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Minimum domain-relevance score to route to a Seer (below = Seer excluded from routing)
ROUTING_THRESHOLD = 0.005

# LLM model for Augur synthesis (Haiku-class; cost-discipline)
DEFAULT_AUGUR_MODEL = "claude-haiku-4-5"

# Max tokens for synthesis call
SYNTHESIS_MAX_TOKENS = 1500

# Haiku pricing
_HAIKU_IN_PER_M = 0.80
_HAIKU_OUT_PER_M = 4.00


# ---------------------------------------------------------------------------
# AugurResult
# ---------------------------------------------------------------------------

@dataclass
class AugurResult:
    """
    Complete Augur response for a single cross-domain query.

    Fields:
      query               — the original user query
      answer              — synthesized unified answer with cross-Seer attribution
      seer_responses      — dict[seer_id -> SeerResult] for all routed Seers
      domain_scores       — dict[seer_id -> float] domain-relevance scores for ALL Seers
      seers_routed        — list[seer_id] of Seers that were queried (above threshold)
      seers_excluded      — list[seer_id] of Seers excluded (below routing threshold)
      scope_coverage      — dict[seer_id -> "contributed" | "scope-boundary" | "excluded"]
      conflicts_detected  — list[str] of detected conflicts between Seer answers
      cross_seer_attribution — raw LLM attribution text (from synthesis)
      honest_unknown      — True if no Seer covered the query
      model_used          — LLM model for synthesis
      tokens_in           — synthesis call input tokens
      tokens_out          — synthesis call output tokens
      cost_usd_est        — synthesis + Seer call costs combined
      elapsed_s           — total wall-clock time (including Seer queries)
      created_at          — ISO-8601 timestamp
    """
    query: str
    answer: str
    seer_responses: dict[str, SeerResult]
    domain_scores: dict[str, float]
    seers_routed: list[str]
    seers_excluded: list[str]
    scope_coverage: dict[str, str]
    conflicts_detected: list[str]
    cross_seer_attribution: str
    honest_unknown: bool
    model_used: str
    tokens_in: int
    tokens_out: int
    cost_usd_est: float
    elapsed_s: float
    created_at: str

    def to_dict(self) -> dict:
        return {
            "query": self.query,
            "answer": self.answer,
            "honest_unknown": self.honest_unknown,
            "model_used": self.model_used,
            "seers_routed": self.seers_routed,
            "seers_excluded": self.seers_excluded,
            "domain_scores": self.domain_scores,
            "scope_coverage": self.scope_coverage,
            "conflicts_detected": self.conflicts_detected,
            "seer_responses": {
                seer_id: {
                    "answer": r.answer,
                    "honest_unknown": r.honest_unknown,
                    "provenance_summary": r.provenance_summary,
                    "top_eblet_count": len(r.top_eblets),
                    "cost_usd_est": r.cost_usd_est,
                    "elapsed_s": r.elapsed_s,
                }
                for seer_id, r in self.seer_responses.items()
            },
            "tokens_in": self.tokens_in,
            "tokens_out": self.tokens_out,
            "cost_usd_est": self.cost_usd_est,
            "elapsed_s": self.elapsed_s,
            "created_at": self.created_at,
        }


# ---------------------------------------------------------------------------
# Augur
# ---------------------------------------------------------------------------

class Augur:
    """
    The Augur: meta-coordination layer above multiple Seers.

    Instantiate with a list of Seer instances, each anchored to a distinct
    Pyramid sub-domain. The Augur routes queries, collects cross-Seer responses,
    and synthesizes a unified answer with cross-Pyramid attribution.

    Example:
        augur = Augur(seers=[seer_a, seer_b], api_client=client)
        result = augur.query("What's the Wheelbarrow Policy empirics + founder origin?")
        print(result.answer)
    """

    def __init__(
        self,
        seers: list[Seer],
        api_client: Optional[Any] = None,
        model: str = DEFAULT_AUGUR_MODEL,
        augur_id: str = "Augur-K492",
        routing_threshold: float = ROUTING_THRESHOLD,
    ) -> None:
        """
        Initialize the Augur.

        Args:
            seers: list of Seer instances (each with a distinct substrate slice)
            api_client: anthropic.Anthropic() instance for synthesis LLM calls
            model: LLM model for synthesis (Haiku-class default)
            augur_id: identifier for this Augur instance
            routing_threshold: min domain-relevance score to route to a Seer
        """
        self.seers = seers
        self.api_client = api_client
        self.model = model
        self.augur_id = augur_id
        self.routing_threshold = routing_threshold
        self._query_log: list[dict] = []

    # ------------------------------------------------------------------
    # Domain relevance scoring
    # ------------------------------------------------------------------

    def score_domain_relevance(self, seer: Seer, query: str) -> float:
        """
        Ask a Seer how relevant the query is to its substrate.
        Returns the top TF-IDF relevance score from the Seer's Eblet index.
        Score of 0.0 means no relevant Eblets found.
        """
        ranked = seer.rank_eblets(query)
        if not ranked:
            return 0.0
        return ranked[0][1]

    def route_query(self, query: str) -> tuple[list[Seer], dict[str, float]]:
        """
        Score all Seers' domain relevance and select those above threshold.

        Returns:
            (routed_seers, domain_scores)
            routed_seers: Seers with score >= routing_threshold
            domain_scores: dict[seer_id -> score] for ALL Seers
        """
        scores: dict[str, float] = {}
        for seer in self.seers:
            scores[seer.seer_id] = self.score_domain_relevance(seer, query)

        routed = [
            seer for seer in self.seers
            if scores[seer.seer_id] >= self.routing_threshold
        ]
        return routed, scores

    # ------------------------------------------------------------------
    # Synthesis prompt builder
    # ------------------------------------------------------------------

    def _build_synthesis_prompt(
        self,
        query: str,
        routed_responses: dict[str, SeerResult],
        domain_scores: dict[str, float],
    ) -> str:
        """Build the synthesis system prompt with all Seer responses as context."""
        seer_blocks = []
        for seer_id, result in routed_responses.items():
            score = domain_scores.get(seer_id, 0.0)
            seer_blocks.append(
                f"=== {seer_id} (domain_relevance={score:.4f}) ===\n"
                f"SCOPE STATUS: {'SCOPE-BOUNDARY (out-of-coverage)' if result.honest_unknown else 'WITHIN SCOPE'}\n"
                f"ANSWER:\n{result.answer}\n\n"
                f"PROVENANCE:\n{result.provenance_summary}\n"
            )

        seers_block = "\n---\n".join(seer_blocks)

        return (
            "You are the Augur — a meta-coordination layer above multiple Seers.\n"
            "Each Seer operates over a distinct Pyramid sub-domain substrate.\n"
            "You have received responses from multiple Seers for the same query.\n\n"
            "Your task:\n"
            "1. Synthesize a unified answer that draws from all in-scope Seer responses.\n"
            "2. Attribute EVERY claim to the Seer that provided it: use [Seer-A], [Seer-B], etc.\n"
            "3. If two Seers DISAGREE on a factual point, surface the disagreement explicitly.\n"
            "   DO NOT paper over conflicts — name both attributions and flag: CONFLICT DETECTED.\n"
            "4. Report scope-coverage at the end: which Seers contributed, which reported "
            "SCOPE-BOUNDARY (out-of-coverage).\n"
            "5. If ALL Seers reported SCOPE-BOUNDARY, return:\n"
            "   AUGUR-HONEST-UNKNOWN: <brief explanation of what substrates cover vs. query>\n"
            "   Do NOT synthesize from training data.\n"
            "6. Be dense and precise. Only claim what the Seers' substrates support.\n\n"
            "=== SEER RESPONSES ===\n\n"
            + seers_block
            + "\n=== END SEER RESPONSES ===\n\n"
            f"Original query: {query}"
        )

    # ------------------------------------------------------------------
    # Conflict detection
    # ------------------------------------------------------------------

    def _detect_conflicts(self, answer: str) -> list[str]:
        """
        Detect CONFLICT DETECTED markers in the synthesis output.
        Returns a list of conflict description strings.
        """
        conflicts: list[str] = []
        lines = answer.split("\n")
        for i, line in enumerate(lines):
            if "CONFLICT DETECTED" in line.upper():
                # Grab context around the conflict marker
                start = max(0, i - 1)
                end = min(len(lines), i + 3)
                conflict_ctx = " | ".join(l.strip() for l in lines[start:end] if l.strip())
                conflicts.append(conflict_ctx[:300])
        return conflicts

    # ------------------------------------------------------------------
    # Scope coverage reporter
    # ------------------------------------------------------------------

    def _build_scope_coverage(
        self,
        routed_responses: dict[str, SeerResult],
        excluded_seer_ids: list[str],
    ) -> dict[str, str]:
        """Build scope-coverage dict for all Seers."""
        coverage: dict[str, str] = {}
        for seer_id, result in routed_responses.items():
            coverage[seer_id] = "scope-boundary" if result.honest_unknown else "contributed"
        for seer_id in excluded_seer_ids:
            coverage[seer_id] = "excluded (below relevance threshold)"
        return coverage

    # ------------------------------------------------------------------
    # Core query method
    # ------------------------------------------------------------------

    def query(
        self,
        user_query: str,
        verbose_provenance: bool = False,
    ) -> AugurResult:
        """
        Issue a cross-domain query to the Augur.

        1. Score all Seers' domain relevance.
        2. Route to relevant Seers (score >= routing_threshold).
        3. Collect SeerResults from routed Seers.
        4. If no Seers routed: return honest-unknown without LLM call.
        5. If all routed Seers returned scope-boundary: return honest-unknown.
        6. Synthesize unified answer with LLM, attributing per-claim to Seer source.
        7. Detect conflicts and report scope-coverage.
        8. Return AugurResult.

        Args:
            user_query: the cross-domain query
            verbose_provenance: if True, include full provenance detail in Seer calls

        Returns:
            AugurResult with synthesized answer and full attribution/provenance.
        """
        wall_start = time.time()
        created_at = datetime.now(timezone.utc).isoformat()

        # Step 1-2: Route
        routed_seers, domain_scores = self.route_query(user_query)
        excluded_seer_ids = [
            s.seer_id for s in self.seers
            if s.seer_id not in [rs.seer_id for rs in routed_seers]
        ]

        # Step 3: Collect Seer responses
        routed_responses: dict[str, SeerResult] = {}
        seer_cost_total = 0.0

        for seer in routed_seers:
            seer_result = seer.query(user_query, verbose_provenance=verbose_provenance)
            routed_responses[seer.seer_id] = seer_result
            seer_cost_total += seer_result.cost_usd_est

        # Step 4: No Seers routed — honest-unknown
        if not routed_seers:
            answer = (
                "AUGUR-HONEST-UNKNOWN: No Seer substrate has sufficient relevance to "
                f"answer this query (all domain relevance scores below threshold "
                f"{self.routing_threshold}). Query: '{user_query[:200]}'"
            )
            scope_coverage = {s.seer_id: "excluded (below relevance threshold)" for s in self.seers}
            result = AugurResult(
                query=user_query,
                answer=answer,
                seer_responses={},
                domain_scores=domain_scores,
                seers_routed=[],
                seers_excluded=[s.seer_id for s in self.seers],
                scope_coverage=scope_coverage,
                conflicts_detected=[],
                cross_seer_attribution="",
                honest_unknown=True,
                model_used=self.model,
                tokens_in=0,
                tokens_out=0,
                cost_usd_est=round(seer_cost_total, 6),
                elapsed_s=round(time.time() - wall_start, 2),
                created_at=created_at,
            )
            self._query_log.append(result.to_dict())
            return result

        # Step 5: All routed Seers returned scope-boundary — honest-unknown
        all_scope_boundary = all(r.honest_unknown for r in routed_responses.values())
        if all_scope_boundary:
            seer_names = ", ".join(routed_responses.keys())
            answer = (
                f"AUGUR-HONEST-UNKNOWN: All routed Seers ({seer_names}) reported "
                "SCOPE-BOUNDARY for this query. Neither Pyramid sub-domain contains "
                f"sufficient Eblet coverage. Query: '{user_query[:200]}'"
            )
            scope_coverage = self._build_scope_coverage(routed_responses, excluded_seer_ids)
            result = AugurResult(
                query=user_query,
                answer=answer,
                seer_responses=routed_responses,
                domain_scores=domain_scores,
                seers_routed=[s.seer_id for s in routed_seers],
                seers_excluded=excluded_seer_ids,
                scope_coverage=scope_coverage,
                conflicts_detected=[],
                cross_seer_attribution="",
                honest_unknown=True,
                model_used=self.model,
                tokens_in=0,
                tokens_out=0,
                cost_usd_est=round(seer_cost_total, 6),
                elapsed_s=round(time.time() - wall_start, 2),
                created_at=created_at,
            )
            self._query_log.append(result.to_dict())
            return result

        # Step 6: Synthesize
        synth_tokens_in = 0
        synth_tokens_out = 0
        final_answer = ""

        if self.api_client is not None:
            system_prompt = self._build_synthesis_prompt(
                user_query, routed_responses, domain_scores
            )
            response = self.api_client.messages.create(
                model=self.model,
                max_tokens=SYNTHESIS_MAX_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_query}],
            )
            final_answer = response.content[0].text.strip()
            if hasattr(response, "usage") and response.usage:
                synth_tokens_in = response.usage.input_tokens
                synth_tokens_out = response.usage.output_tokens
        else:
            # No API client — assemble a plain-text summary without LLM synthesis
            parts = ["[Augur: no API client — raw Seer responses below]\n"]
            for seer_id, r in routed_responses.items():
                parts.append(f"\n--- {seer_id} ---\n{r.answer}")
            final_answer = "\n".join(parts)

        # Step 7: Detect conflicts and scope coverage
        conflicts = self._detect_conflicts(final_answer)
        scope_coverage = self._build_scope_coverage(routed_responses, excluded_seer_ids)
        honest_unknown = "AUGUR-HONEST-UNKNOWN" in final_answer

        synth_cost = (
            synth_tokens_in * _HAIKU_IN_PER_M + synth_tokens_out * _HAIKU_OUT_PER_M
        ) / 1_000_000
        total_cost = round(seer_cost_total + synth_cost, 6)

        result = AugurResult(
            query=user_query,
            answer=final_answer,
            seer_responses=routed_responses,
            domain_scores=domain_scores,
            seers_routed=[s.seer_id for s in routed_seers],
            seers_excluded=excluded_seer_ids,
            scope_coverage=scope_coverage,
            conflicts_detected=conflicts,
            cross_seer_attribution=final_answer,
            honest_unknown=honest_unknown,
            model_used=self.model,
            tokens_in=synth_tokens_in,
            tokens_out=synth_tokens_out,
            cost_usd_est=total_cost,
            elapsed_s=round(time.time() - wall_start, 2),
            created_at=created_at,
        )
        self._query_log.append(result.to_dict())
        return result

    # ------------------------------------------------------------------
    # Query log
    # ------------------------------------------------------------------

    def save_query_log(self, path: Optional[Path] = None) -> Path:
        """Save the session query log to a JSONL file."""
        if path is None:
            ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
            path = _HERE / f"query_log_{self.augur_id}_{ts}.jsonl"
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as fh:
            for entry in self._query_log:
                fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return path

    # ------------------------------------------------------------------
    # Repr
    # ------------------------------------------------------------------

    def __repr__(self) -> str:
        seer_summary = ", ".join(
            f"{s.seer_id}[{s.domain_name}:{s.eblet_count}eb]" for s in self.seers
        )
        return f"Augur(id={self.augur_id!r}, seers=[{seer_summary}], model={self.model!r})"
