"""
Knowledge Pump Empirical Test — Two-Arm Retrieval Engine (Phase B, K538)

Implements the mastery-aware retrieval comparison:

  Arm A (vanilla):  score = keyword_overlap(query, fact)
  Arm B (kp_on):    score = keyword_overlap(query, fact) + bridge_bonus(mastery, fact)

bridge_bonus: for each domain in the member's mastery_profile that appears in
              fact.domain_bridges, add BRIDGE_WEIGHT to the fact score.

Both arms return the same top-K facts sorted by their respective scores.
The delta in retrieval ranking drives the per-dollar-correctness difference.

Scoring rationale:
  keyword_overlap — TF-inspired: count of distinct lowercased query tokens
                    (excluding stop words) found in fact title + observation_excerpt.
                    Normalized to [0, 1] by dividing by total query token count.

  bridge_bonus    — additive per-domain match: BRIDGE_WEIGHT × |mastery ∩ bridges|.
                    Default BRIDGE_WEIGHT = 0.5 (calibrated so a 2-domain mastery
                    match moves a fact by ~1 full keyword-overlap unit — enough to
                    change the top-5 retrieval set without overwhelming lexical signal).

  Both scores are combined additively; no normalization after combination
  (preserves interpretability: a bridge bonus of 1.0 = ~2 extra keyword matches).

Stone Tablet Imperative: all retrieval decisions are recorded with full score
breakdown (keyword score + bridge bonus per fact) in the harness result payload.

Filed: B132, 2026-04-28 by Knight (K538).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional

from empirical_tests.kp_corpus import KPFact

# Additive weight per mastery-domain bridge match (KP arm only)
BRIDGE_WEIGHT: float = 0.5

# Top-K retrieval count (parallels AM-03 canonical default)
DEFAULT_TOP_K: int = 5

# Stop words excluded from keyword overlap (standard English functional words)
_STOP_WORDS: frozenset[str] = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "shall",
    "should", "may", "might", "can", "could", "of", "in", "on", "at",
    "to", "for", "with", "by", "from", "and", "or", "but", "not", "this",
    "that", "it", "its", "as", "if", "when", "what", "which", "who", "how",
    "all", "any", "each", "more", "than", "their", "they", "them", "we",
    "our", "us", "i", "my", "me", "you", "your",
})


def _tokenize(text: str) -> list[str]:
    """Lowercase, split on non-alphanumeric boundaries, remove stop words."""
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [t for t in tokens if t not in _STOP_WORDS and len(t) >= 2]


def keyword_overlap_score(query: str, fact: KPFact) -> float:
    """
    Normalized keyword overlap between query tokens and fact content.

    Returns fraction of distinct query tokens found in fact title + excerpt.
    Range: [0.0, 1.0].
    """
    query_tokens = set(_tokenize(query))
    if not query_tokens:
        return 0.0
    fact_text = (fact.title + " " + fact.observation_excerpt).lower()
    matched = sum(1 for t in query_tokens if t in fact_text)
    return matched / len(query_tokens)


def bridge_bonus(mastery_profile: list[str], fact: KPFact) -> float:
    """
    Additive bonus for each mastery domain that bridges to this fact.

    Returns BRIDGE_WEIGHT × |mastery_profile ∩ fact.domain_bridges|.
    """
    overlap = set(mastery_profile) & set(fact.domain_bridges)
    return BRIDGE_WEIGHT * len(overlap)


@dataclass
class ScoredFact:
    """One scored retrieval result with full score breakdown."""
    fact: KPFact
    keyword_score: float
    bridge_score: float          # 0.0 for vanilla arm
    total_score: float
    arm: str                     # "vanilla" or "kp_on"
    mastery_profile: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {
            "fact_id": self.fact.fact_id,
            "title": self.fact.title,
            "category": self.fact.category,
            "key_number": self.fact.key_number,
            "domain_bridges": self.fact.domain_bridges,
            "keyword_score": round(self.keyword_score, 4),
            "bridge_score": round(self.bridge_score, 4),
            "total_score": round(self.total_score, 4),
            "arm": self.arm,
            "mastery_profile": self.mastery_profile,
        }


@dataclass
class RetrievalResult:
    """Complete retrieval result for one arm."""
    arm: str
    query: str
    mastery_profile: list[str]
    top_k: list[ScoredFact]
    context_text: str           # formatted facts for LLM prompt injection

    def context_for_llm(self, include_bridge_rationale: bool = False) -> str:
        """
        Format the top-K facts as a context block for LLM prompt injection.

        KP arm can optionally include bridge_rationale to prime the LLM with
        mastery-domain analogies — the core Knowledge Pump mechanism.
        """
        lines = []
        for i, sf in enumerate(self.top_k, 1):
            lines.append(f"[{i}] {sf.fact.fact_id}: {sf.fact.title}")
            lines.append(f"    Key fact: {sf.fact.key_number} — {sf.fact.key_phrase}")
            if sf.fact.observation_excerpt:
                excerpt = sf.fact.observation_excerpt[:400].replace("\n", " ")
                lines.append(f"    {excerpt}")
            if include_bridge_rationale and sf.arm == "kp_on":
                for domain in sf.mastery_profile:
                    rationale = sf.fact.bridge_rationale.get(domain)
                    if rationale:
                        lines.append(f"    [{domain.upper()} bridge] {rationale}")
            lines.append("")
        return "\n".join(lines)


class KPRetriever:
    """
    Two-arm retrieval engine: vanilla and KP-on.

    Usage:
        retriever = KPRetriever(corpus)
        vanilla = retriever.retrieve_vanilla(query, top_k=5)
        kp_on   = retriever.retrieve_kp(query, mastery_profile=["chess", "military"], top_k=5)
    """

    def __init__(self, corpus: list[KPFact]):
        self.corpus = corpus

    def _score_all(
        self,
        query: str,
        mastery_profile: list[str],
        arm: str,
    ) -> list[ScoredFact]:
        """Score all corpus facts for the given query and arm."""
        scored = []
        for fact in self.corpus:
            kw = keyword_overlap_score(query, fact)
            bb = bridge_bonus(mastery_profile, fact) if arm == "kp_on" else 0.0
            scored.append(ScoredFact(
                fact=fact,
                keyword_score=kw,
                bridge_score=bb,
                total_score=kw + bb,
                arm=arm,
                mastery_profile=list(mastery_profile),
            ))
        return sorted(scored, key=lambda s: -s.total_score)

    def retrieve_vanilla(self, query: str, top_k: int = DEFAULT_TOP_K) -> RetrievalResult:
        """Retrieve top-K facts with no mastery weighting (Arm A)."""
        scored = self._score_all(query, [], "vanilla")
        top = scored[:top_k]
        result = RetrievalResult(
            arm="vanilla",
            query=query,
            mastery_profile=[],
            top_k=top,
            context_text="",
        )
        result.context_text = result.context_for_llm(include_bridge_rationale=False)
        return result

    def retrieve_kp(
        self,
        query: str,
        mastery_profile: list[str],
        top_k: int = DEFAULT_TOP_K,
        include_bridge_rationale: bool = True,
    ) -> RetrievalResult:
        """
        Retrieve top-K facts with mastery-bridge weighting (Arm B, KP-on).

        include_bridge_rationale: if True, the context block injected into the
        LLM prompt includes the mastery-domain analogies — this is the KP mechanism:
        "doing what you already do" (applying existing mastery) while the substrate
        pumps cross-domain insights into the retrieval context.
        """
        scored = self._score_all(query, mastery_profile, "kp_on")
        top = scored[:top_k]
        result = RetrievalResult(
            arm="kp_on",
            query=query,
            mastery_profile=list(mastery_profile),
            top_k=top,
            context_text="",
        )
        result.context_text = result.context_for_llm(
            include_bridge_rationale=include_bridge_rationale
        )
        return result

    def retrieval_diff(
        self,
        vanilla: RetrievalResult,
        kp_on: RetrievalResult,
    ) -> dict:
        """
        Compute the retrieval-set difference between the two arms.
        Returns a summary dict for Stone Tablet recording.
        """
        vanilla_ids = [sf.fact.fact_id for sf in vanilla.top_k]
        kp_ids = [sf.fact.fact_id for sf in kp_on.top_k]
        added = [fid for fid in kp_ids if fid not in vanilla_ids]
        removed = [fid for fid in vanilla_ids if fid not in kp_ids]
        rank_changes = {}
        for sf in kp_on.top_k:
            fid = sf.fact.fact_id
            if fid in vanilla_ids:
                vanilla_rank = vanilla_ids.index(fid)
                kp_rank = kp_ids.index(fid)
                if vanilla_rank != kp_rank:
                    rank_changes[fid] = {"vanilla_rank": vanilla_rank, "kp_rank": kp_rank}
        return {
            "vanilla_top_k": vanilla_ids,
            "kp_top_k": kp_ids,
            "added_by_kp": added,
            "removed_by_kp": removed,
            "rank_changes": rank_changes,
            "retrieval_sets_identical": vanilla_ids == kp_ids,
        }


if __name__ == "__main__":
    from empirical_tests.kp_corpus import build_pilot_corpus
    corpus = build_pilot_corpus()
    retriever = KPRetriever(corpus)

    query = "What is the quorum required for federated consensus decisions?"
    mastery = ["chess", "military"]

    vanilla_r = retriever.retrieve_vanilla(query, top_k=5)
    kp_r = retriever.retrieve_kp(query, mastery, top_k=5)

    print("=== VANILLA ARM ===")
    for sf in vanilla_r.top_k:
        print(f"  {sf.fact.fact_id} | kw={sf.keyword_score:.3f} | total={sf.total_score:.3f} | {sf.fact.title}")

    print("\n=== KP ARM (chess + military) ===")
    for sf in kp_r.top_k:
        print(f"  {sf.fact.fact_id} | kw={sf.keyword_score:.3f} | bridge={sf.bridge_score:.3f} | total={sf.total_score:.3f} | {sf.fact.title}")

    diff = retriever.retrieval_diff(vanilla_r, kp_r)
    print(f"\nDiff: added={diff['added_by_kp']}, removed={diff['removed_by_kp']}")
    print(f"Sets identical: {diff['retrieval_sets_identical']}")
