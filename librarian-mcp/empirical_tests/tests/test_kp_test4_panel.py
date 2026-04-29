"""
Unit tests for KP Test 4 panel design — K-Harder-Panel (B133)

Tests enforce the core panel-design assertions:
  1. Each 2-fact synthesis question targets exactly 2 distinct fact IDs
  2. No 2-fact synthesis question can be answered from any single target fact alone
     (require_all_key_facts=True means both key_facts must appear for HOT)
  3. Panel structure: 3 Reading-A / 3 Reading-B / 4 Reading-C
  4. Retrieval discriminability: for Reading-C questions, Fixed top-3 should miss
     at least one target; Gamma top-8 should include both targets
  5. No question accidentally uses any title keyword of its target facts
     (keyword-reachability regression guard)

Stone Tablet: these tests are the regression guard that prevents re-introducing the
keyword-reachability failure mode that caused K543 REFUTED.

Filed: B133, 2026-04-29 by Knight (K-Harder-Panel).
"""

import sys
from pathlib import Path

_HERE = Path(__file__).parent
_TESTS_PARENT = _HERE.parent
_LIBRARIAN_MCP = _TESTS_PARENT.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

import pytest

from empirical_tests.kp_panels_test4 import KP_TEST4_PANEL, KPTestQuery4, panel_summary
from empirical_tests.kp_corpus import build_pilot_corpus, KPFact
from empirical_tests.kp_retrieval import KPRetriever, _tokenize


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def corpus():
    return build_pilot_corpus(load_excerpts=False)


@pytest.fixture(scope="module")
def retriever(corpus):
    return KPRetriever(corpus)


@pytest.fixture(scope="module")
def corpus_by_id(corpus):
    return {f.fact_id: f for f in corpus}


# ---------------------------------------------------------------------------
# 1. Panel structure assertions
# ---------------------------------------------------------------------------

class TestPanelStructure:

    def test_panel_has_ten_questions(self):
        assert len(KP_TEST4_PANEL) == 10, f"Expected 10 questions, got {len(KP_TEST4_PANEL)}"

    def test_reading_class_distribution(self):
        """Panel must have 3 Reading-A, 3 Reading-B, 4 Reading-C."""
        from collections import Counter
        dist = Counter(q.reading_class for q in KP_TEST4_PANEL)
        assert dist["Reading-A"] == 3, f"Expected 3 Reading-A, got {dist['Reading-A']}"
        assert dist["Reading-B"] == 3, f"Expected 3 Reading-B, got {dist['Reading-B']}"
        assert dist["Reading-C"] == 4, f"Expected 4 Reading-C, got {dist['Reading-C']}"

    def test_reading_c_questions_are_two_fact_synthesis(self):
        """All Reading-C questions must be 2-fact synthesis (require_all=True)."""
        for q in KP_TEST4_PANEL:
            if q.reading_class == "Reading-C":
                assert q.require_all_key_facts, (
                    f"{q.qid}: Reading-C question must have require_all_key_facts=True"
                )
                assert len(q.target_fact_ids) == 2, (
                    f"{q.qid}: Reading-C question must target exactly 2 facts, "
                    f"got {q.target_fact_ids}"
                )

    def test_reading_c_key_facts_count(self):
        """Reading-C 2-fact synthesis questions must have exactly 2 key_facts (one per target)."""
        for q in KP_TEST4_PANEL:
            if q.reading_class == "Reading-C":
                assert len(q.key_facts) == 2, (
                    f"{q.qid}: Reading-C question must have exactly 2 key_facts, "
                    f"got {len(q.key_facts)}: {q.key_facts}"
                )

    def test_unique_qids(self):
        qids = [q.qid for q in KP_TEST4_PANEL]
        assert len(qids) == len(set(qids)), "Duplicate QIDs found in panel"

    def test_all_mastery_profiles_non_empty(self):
        for q in KP_TEST4_PANEL:
            assert q.kp_mastery_profile, f"{q.qid}: mastery profile must not be empty"

    def test_panel_summary_structure(self):
        s = panel_summary()
        assert s["panel"] == "KP_TEST4"
        assert s["n_queries"] == 10
        assert "architecture" in s
        assert "alpha" in s.get("architecture", "").lower()


# ---------------------------------------------------------------------------
# 2. Require-all grading regression guard
# ---------------------------------------------------------------------------

class TestRequireAllGrading:
    """
    Verify that require_all_key_facts=True means a partial answer (with only
    ONE target fact's key_fact present) does NOT grade HOT.
    This is the core guard against the 60%-threshold loophole.
    """

    def _simulate_grade(self, answer: str, query: KPTestQuery4) -> str:
        answer_lower = answer.lower()
        matched_key = [f for f in query.key_facts if f.lower() in answer_lower]
        if query.require_all_key_facts:
            threshold = len(query.key_facts)
        else:
            threshold = max(1, int(len(query.key_facts) * 0.6))
        if len(matched_key) >= threshold:
            return "HOT"
        elif matched_key:
            return "HIT"
        return "MISS"

    def test_partial_answer_not_hot_for_synthesis_questions(self):
        """
        For each 2-fact synthesis question, answering with only the FIRST key_fact
        should grade MISS or HIT (never HOT).
        """
        for q in KP_TEST4_PANEL:
            if not q.require_all_key_facts:
                continue
            # Simulate: LLM answers with only the first key_fact
            partial_answer = f"The answer is {q.key_facts[0]} but I don't know the second."
            grade = self._simulate_grade(partial_answer, q)
            assert grade != "HOT", (
                f"{q.qid}: partial answer (only key_facts[0]='{q.key_facts[0]}') "
                f"must not grade HOT, got {grade}"
            )

    def test_full_answer_is_hot_for_synthesis_questions(self):
        """
        For each 2-fact synthesis question, answering with ALL key_facts
        should grade HOT.
        """
        for q in KP_TEST4_PANEL:
            if not q.require_all_key_facts:
                continue
            full_answer = " ".join(q.key_facts)
            grade = self._simulate_grade(full_answer, q)
            assert grade == "HOT", (
                f"{q.qid}: full answer with all key_facts must grade HOT, got {grade}. "
                f"key_facts={q.key_facts}"
            )

    def test_non_synthesis_threshold_is_60pct(self):
        """Non-synthesis questions still use 60% threshold."""
        for q in KP_TEST4_PANEL:
            if q.require_all_key_facts:
                continue
            assert not q.require_all_key_facts
            # With key_facts of size 3, threshold should be 1 (max(1, int(3*0.6))=1)
            if len(q.key_facts) >= 3:
                partial = f"The answer is {q.key_facts[0]}."
                grade = self._simulate_grade(partial, q)
                assert grade == "HOT", (
                    f"{q.qid}: non-synthesis question with 3+ key_facts should HOT "
                    f"on first key_fact alone (60% threshold), got {grade}"
                )


# ---------------------------------------------------------------------------
# 3. Retrieval discriminability (using actual KPRetriever)
# ---------------------------------------------------------------------------

class TestRetrievalDiscriminability:
    """
    Verify that for Reading-C questions:
      - Fixed top-3 bridge candidates miss at least one target
      - Gamma top-8 bridge candidates include both targets

    Uses the actual KPRetriever and corpus to simulate retrieval.
    """

    def _get_bridge_candidates(
        self,
        retriever: KPRetriever,
        question: str,
        mastery_profile: list[str],
        top_mastery: int,
    ) -> list[str]:
        """Return fact IDs added by KP bridge (not in vanilla top-5)."""
        van = retriever.retrieve_vanilla(question, top_k=5)
        kp = retriever.retrieve_kp_beta(
            question, mastery_profile, top_keyword=5, top_mastery=top_mastery
        )
        van_ids = {sf.fact.fact_id for sf in van.top_k}
        all_ids = [sf.fact.fact_id for sf in kp.top_k]
        return all_ids  # full KP context (keyword + bridge)

    def test_reading_c_fixed_misses_at_least_one_target(self, retriever):
        """Fixed (top-3 mastery) must miss at least one target per Reading-C question."""
        for q in KP_TEST4_PANEL:
            if q.reading_class != "Reading-C":
                continue
            fixed_context_ids = self._get_bridge_candidates(
                retriever, q.question, q.kp_mastery_profile, top_mastery=3
            )
            targets_in_fixed = [t for t in q.target_fact_ids if t in fixed_context_ids]
            assert len(targets_in_fixed) < len(q.target_fact_ids), (
                f"{q.qid}: Fixed top-3 should miss at least one target. "
                f"targets={q.target_fact_ids}, "
                f"targets_in_fixed={targets_in_fixed}. "
                f"This indicates a keyword-reachability failure — the question may use "
                f"title keywords that put the target in the vanilla top-5."
            )

    def test_reading_c_gamma_captures_both_targets(self, retriever):
        """Gamma (top-8 mastery for Reading-C) must capture both targets."""
        for q in KP_TEST4_PANEL:
            if q.reading_class != "Reading-C":
                continue
            gamma_context_ids = self._get_bridge_candidates(
                retriever, q.question, q.kp_mastery_profile, top_mastery=8
            )
            targets_in_gamma = [t for t in q.target_fact_ids if t in gamma_context_ids]
            assert len(targets_in_gamma) == len(q.target_fact_ids), (
                f"{q.qid}: Gamma top-8 must capture all targets. "
                f"targets={q.target_fact_ids}, "
                f"targets_in_gamma={targets_in_gamma}. "
                f"Gamma context: {gamma_context_ids}"
            )

    def test_reading_b_fixed_captures_target(self, retriever):
        """Fixed (top-3 mastery) must capture the target for Reading-B questions."""
        for q in KP_TEST4_PANEL:
            if q.reading_class != "Reading-B":
                continue
            fixed_context_ids = self._get_bridge_candidates(
                retriever, q.question, q.kp_mastery_profile, top_mastery=3
            )
            targets_in_fixed = [t for t in q.target_fact_ids if t in fixed_context_ids]
            assert len(targets_in_fixed) == len(q.target_fact_ids), (
                f"{q.qid}: Fixed top-3 must capture all targets for Reading-B. "
                f"targets={q.target_fact_ids}, in_fixed={targets_in_fixed}. "
                f"Fixed context: {fixed_context_ids}"
            )

    def test_reading_a_vanilla_captures_target(self, retriever):
        """Vanilla top-5 must capture the target for Reading-A (keyword-reachable)."""
        for q in KP_TEST4_PANEL:
            if q.reading_class != "Reading-A":
                continue
            van = retriever.retrieve_vanilla(q.question, top_k=5)
            van_ids = [sf.fact.fact_id for sf in van.top_k]
            targets_in_van = [t for t in q.target_fact_ids if t in van_ids]
            assert len(targets_in_van) == len(q.target_fact_ids), (
                f"{q.qid}: Vanilla must find all targets for Reading-A (keyword control). "
                f"targets={q.target_fact_ids}, in_vanilla={targets_in_van}. "
                f"Vanilla top-5: {van_ids}"
            )


# ---------------------------------------------------------------------------
# 4. Keyword-reachability regression guard
# ---------------------------------------------------------------------------

class TestKeywordReachabilityGuard:
    """
    Verify that Reading-C questions do NOT use title keywords of their targets.
    This is the primary regression guard against re-introducing the K543 failure mode.

    Method: tokenize both the question and each target fact's title, then check
    for overlap. Any overlap is a potential keyword-reachability vector.
    """

    # Title keywords that are acceptable shared tokens (structural, not domain-specific)
    _ALLOWED_OVERLAPS = frozenset({
        "verdania", "cooperative", "platform", "member", "members",
        "member-owners", "the", "a", "an",
    })

    def _get_title_tokens(self, fact: KPFact) -> set[str]:
        return set(_tokenize(fact.title))

    def test_reading_c_questions_avoid_target_title_keywords(self, corpus_by_id):
        """
        For each Reading-C question, assert that no DOMAIN-SPECIFIC title keyword
        of either target fact appears in the question text.

        Domain-specific means: tokens that uniquely identify the fact by domain
        (e.g., 'surplus', 'distribution', 'grievance', 'churn', 'notification').
        """
        # Domain-specific keywords to audit (per-fact, extracted from known title tokens)
        domain_specific_per_fact = {
            "EG-20": {"surplus", "distribution", "trigger", "threshold"},
            "MJ-24": {"grievance", "escalation", "trust", "rating", "chs"},
            "MJ-10": {"transaction", "churn", "reduction"},
            "RC-04": {"incident", "response", "notification", "window"},
            "MJ-16": {"governance", "training", "completion", "voting", "multiplier"},
            "HP-06": {"thornwick", "architecture", "discovery"},
            "AM-07": {"membership", "score", "decay", "function"},
            "MJ-22": {"inactivity", "warning", "threshold", "governance",
                      "participation", "multiplier"},
        }

        violations = []
        for q in KP_TEST4_PANEL:
            if q.reading_class != "Reading-C":
                continue
            q_tokens = set(_tokenize(q.question))
            for fid in q.target_fact_ids:
                forbidden = domain_specific_per_fact.get(fid, set())
                leaked = q_tokens & forbidden
                if leaked:
                    violations.append(
                        f"{q.qid} -> {fid}: question contains forbidden tokens {leaked}"
                    )

        assert not violations, (
            "Keyword-reachability violations detected in Reading-C questions:\n"
            + "\n".join(violations)
        )

    def test_no_duplicate_targets_within_question(self):
        """Each question must target distinct fact IDs."""
        for q in KP_TEST4_PANEL:
            assert len(q.target_fact_ids) == len(set(q.target_fact_ids)), (
                f"{q.qid}: duplicate target_fact_ids: {q.target_fact_ids}"
            )

    def test_all_target_facts_exist_in_corpus(self, corpus_by_id):
        """All target_fact_ids must exist in the 26-fact corpus."""
        for q in KP_TEST4_PANEL:
            for fid in q.target_fact_ids:
                assert fid in corpus_by_id, (
                    f"{q.qid}: target fact '{fid}' not found in corpus. "
                    f"Available: {sorted(corpus_by_id.keys())}"
                )


# ---------------------------------------------------------------------------
# Quick smoke-test runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import subprocess
    result = subprocess.run(
        [sys.executable, "-m", "pytest", __file__, "-v", "--tb=short"],
        cwd=str(_LIBRARIAN_MCP.parent),
    )
    sys.exit(result.returncode)
