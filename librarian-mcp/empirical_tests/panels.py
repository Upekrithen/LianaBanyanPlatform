"""
K491 — Fixed Test-Query Panels (empirical honesty: panels frozen before testing).

All panels are defined here and imported by the per-prediction runners.
Panels must NOT be modified after the baseline run begins.

Panel design rationale per K491 prompt §Open questions:
  - 5–10 questions per prediction (N is small; document accordingly)
  - Effect size + direction reported; p-values flagged as underpowered at N=5–7
  - Grading: HOT = correct with specific data, HIT = partially correct, MISS = wrong/scope-boundary
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class TestQuery:
    """One question in a test panel."""
    qid: str              # e.g. "P1-Q1"
    question: str
    key_facts: list[str]  # facts that must appear for HOT grade
    hit_keywords: list[str]  # keywords for HIT grade (partial)
    domain_source: str    # which session's content this tests (e.g. "K490", "K475")
    in_current_eblets: bool  # True if answer is already in the 133-Eblet store


# ---------------------------------------------------------------------------
# Prediction 1: Sleep-Stage Consolidation
# Tests whether post-consolidation Seer performance improves on K490-specific content
# Panel: 7 questions (3 K490-specific [not yet indexed], 4 already-indexed)
# ---------------------------------------------------------------------------

PREDICTION_1_PANEL: list[TestQuery] = [
    TestQuery(
        qid="P1-Q1",
        question="What is the Keystone-Compounding Loop, and what architectural milestone does K490 claim to close?",
        key_facts=["keystone-compounding loop", "K490", "closes", "self-reinforcing", "loop"],
        hit_keywords=["keystone", "loop", "compounding", "reinforcing", "articulation"],
        domain_source="K490",
        in_current_eblets=False,
    ),
    TestQuery(
        qid="P1-Q2",
        question="What percentage of the K487 real-corpus bedrock tablets carry at least one Rhetorical Keystone anchor, and how does this compare to the K485 bishop-only measurement?",
        key_facts=["62.7", "43", "870,086", "545,595"],
        hit_keywords=["keystone", "anchor", "rate", "corpus", "tablets", "percent"],
        domain_source="K490",
        in_current_eblets=False,
    ),
    TestQuery(
        qid="P1-Q3",
        question="Which Rhetorical Keystone produced the most Stone Tablets, how many tablets did it produce, and why is this count misleading?",
        key_facts=["KEYSTONE-19", "166,554", "thematic", "all", "one", "voice"],
        hit_keywords=["keystone-19", "stone tablets", "epigraph", "thematic", "broad", "misleading"],
        domain_source="K490",
        in_current_eblets=False,
    ),
    TestQuery(
        qid="P1-Q4",
        question="What is the Cathedral Effect and what is the empirical HOT% for the Cranewell auto-only arm?",
        key_facts=["12%", "cathedral effect", "cranewell", "HOT"],
        hit_keywords=["cathedral", "effect", "HOT", "cranewell", "baseline"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P1-Q5",
        question="How many Miners does the Living Pyramid contain, and what does phylogenetic dual lineage mean?",
        key_facts=["12", "miners", "depths 0", "phylogenetic", "dual lineage"],
        hit_keywords=["12 miners", "pyramid", "phylogenetic", "lineage", "root", "daughter"],
        domain_source="K482",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P1-Q6",
        question="What is the Seer's RESOLVE mechanism and when does it trigger automatically?",
        key_facts=["RESOLVE:", "eblet_id", "LLM", "trigger"],
        hit_keywords=["RESOLVE", "trigger", "pointer", "resolution", "auto", "haiku"],
        domain_source="K489",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P1-Q7",
        question="What is the K485 compression ratio and what does it measure?",
        key_facts=["1.8x", "compression", "synapse", "eblet", "words"],
        hit_keywords=["compression", "ratio", "synapse", "eblet", "words", "1.8"],
        domain_source="K485",
        in_current_eblets=True,
    ),
]


# ---------------------------------------------------------------------------
# Prediction 2: Spaced-Repetition Reinforcement
# Tests whether repeated Eblet access reduces resolution latency
# Panel: 10 queries, all touching the Cathedral Effect / K475 Eblet cluster
# ---------------------------------------------------------------------------

PREDICTION_2_PANEL: list[TestQuery] = [
    TestQuery(
        qid="P2-Q1",
        question="What is the Cathedral Effect?",
        key_facts=["cathedral effect", "HOT"],
        hit_keywords=["cathedral", "effect", "HOT", "percentage"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q2",
        question="What empirical evidence supports the Cathedral Effect hypothesis?",
        key_facts=["12%", "cranewell", "12.6pp", "covenant"],
        hit_keywords=["empirical", "HOT", "cranewell", "covenant", "evidence"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q3",
        question="How does the Cathedral Effect compare across Cranewell and Covenant corpora?",
        key_facts=["cranewell", "covenant", "12pp", "12.6pp"],
        hit_keywords=["cranewell", "covenant", "HOT", "lift", "consistent"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q4",
        question="What is the HOT rate for the union strategy in the Cathedral Effect benchmark?",
        key_facts=["18.8%", "union", "HOT"],
        hit_keywords=["union", "18.8", "HOT", "strategy", "best"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q5",
        question="Is the Cathedral Effect training contamination or a genuine capability?",
        key_facts=["training contamination", "vendor-proven", "not"],
        hit_keywords=["contamination", "genuine", "vendor", "proven", "real"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q6",
        question="What is the ceiling for the Cathedral Effect in absolute percentage terms?",
        key_facts=["18pp", "infinite relative", "absolute"],
        hit_keywords=["ceiling", "18", "absolute", "infinite", "relative"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q7",
        question="What causes HIT-grade answers in the Cathedral Effect benchmark (partial credit)?",
        key_facts=["composition failures", "retrieved", "partial"],
        hit_keywords=["composition", "partial", "HIT", "retrieved", "failure"],
        domain_source="K477",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q8",
        question="Which EB Eblet ID is the primary source for the Cathedral Effect core finding?",
        key_facts=["EB-000006", "synapse_K475"],
        hit_keywords=["EB-000006", "K475", "cluster", "arm2"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q9",
        question="What is the K=10 retrieval rationale and why was it chosen over full-corpus injection?",
        key_facts=["k=10", "12,000", "truncation", "70%"],
        hit_keywords=["k=10", "truncation", "12000", "miss", "retrieval"],
        domain_source="K477",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P2-Q10",
        question="What vendor proved the Cathedral Effect and on which corpora?",
        key_facts=["perplexity", "cranewell", "covenant"],
        hit_keywords=["perplexity", "vendor", "cranewell", "covenant", "cross-universe"],
        domain_source="K475",
        in_current_eblets=True,
    ),
]


# ---------------------------------------------------------------------------
# Prediction 3: Forgetting Curve / Aging
# Tests whether cold Eblets (older created_at) are deprioritized in retrieval
# Panel: 5 queries targeting cold-region content (K475/K482 Eblets)
# ---------------------------------------------------------------------------

PREDICTION_3_PANEL: list[TestQuery] = [
    TestQuery(
        qid="P3-Q1",
        question="What is a networkidle blocker and how was it fixed in K475 Playwright automation?",
        key_facts=["networkidle", "WebSocket", "domcontentloaded", "500ms"],
        hit_keywords=["networkidle", "playwright", "websocket", "domcontentloaded", "streaming"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P3-Q2",
        question="What is the stagger-parallelized asyncio design for Perplexity automation?",
        key_facts=["15s stagger", "10 concurrent", "asyncio"],
        hit_keywords=["stagger", "parallel", "asyncio", "concurrent", "semaphore"],
        domain_source="K475",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P3-Q3",
        question="What is the TF-weighted keyword extraction algorithm used for Wells categorization?",
        key_facts=["TF", "log", "token_length", "stop-word"],
        hit_keywords=["TF", "weighted", "keyword", "wells", "stop-word", "extraction"],
        domain_source="K482",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P3-Q4",
        question="What is the deduplication guard for Miner daughter topic spawning?",
        key_facts=["_spawned_topics", "set", "dedup", "duplicate daughters"],
        hit_keywords=["dedup", "daughter", "spawned", "guard", "topic", "set"],
        domain_source="K482",
        in_current_eblets=True,
    ),
    TestQuery(
        qid="P3-Q5",
        question="What Eblets from the K475 session are most relevant to the Cathedral Effect empirical finding?",
        key_facts=["EB-000006", "EB-000009"],
        hit_keywords=["EB-000006", "EB-000009", "K475", "cluster", "cranewell"],
        domain_source="K475",
        in_current_eblets=True,
    ),
]

# Recency bin definitions for Prediction 3 analysis
# Based on created_at timestamps in eblets.jsonl
RECENCY_BINS = {
    "cold": ("EB-000001", "EB-000069"),    # K475–K483 batch (~01:05 UTC Apr 25)
    "medium": ("EB-000070", "EB-000120"),  # K484–K486 batch (~01:05–01:39 UTC Apr 25)
    "recent": ("EB-000121", "EB-000133"),  # K489 batch (~13:13 UTC Apr 25)
}


# ---------------------------------------------------------------------------
# Prediction 4: Selective Attention
# Tests whether context-primed queries concentrate Eblet-resolution on primed domain
# Panel: 5 query pairs (primed, unprimed) — same underlying knowledge target
# ---------------------------------------------------------------------------

@dataclass
class AttentionQueryPair:
    """Paired primed/unprimed queries for Prediction 4."""
    pair_id: str
    unprimed: TestQuery
    primed: TestQuery
    expected_concentrated_source: str  # synapse file we expect priming to concentrate on


PREDICTION_4_PAIRS: list[AttentionQueryPair] = [
    AttentionQueryPair(
        pair_id="P4-A",
        unprimed=TestQuery(
            qid="P4-A-U",
            question="What is the Cathedral Effect?",
            key_facts=["cathedral effect"],
            hit_keywords=["cathedral", "effect"],
            domain_source="K475",
            in_current_eblets=True,
        ),
        primed=TestQuery(
            qid="P4-A-P",
            question="In the context of the K475 Cranewell benchmark arm results specifically, what is the Cathedral Effect and what HOT percentage was achieved?",
            key_facts=["cathedral effect", "12%", "cranewell", "K475"],
            hit_keywords=["cathedral", "effect", "12", "cranewell", "K475"],
            domain_source="K475",
            in_current_eblets=True,
        ),
        expected_concentrated_source="synapse_K475.jsonl",
    ),
    AttentionQueryPair(
        pair_id="P4-B",
        unprimed=TestQuery(
            qid="P4-B-U",
            question="What is the Living Pyramid architecture?",
            key_facts=["pyramid"],
            hit_keywords=["pyramid", "miners", "structure"],
            domain_source="K482",
            in_current_eblets=True,
        ),
        primed=TestQuery(
            qid="P4-B-P",
            question="Focusing specifically on the K482 session's Miner tree structure discovery, describe the Living Pyramid shape and how many Miners were found at each depth level.",
            key_facts=["12 miners", "depths 0", "K482"],
            hit_keywords=["12", "miners", "depth", "K482", "tree"],
            domain_source="K482",
            in_current_eblets=True,
        ),
        expected_concentrated_source="synapse_K482.jsonl",
    ),
    AttentionQueryPair(
        pair_id="P4-C",
        unprimed=TestQuery(
            qid="P4-C-U",
            question="How does provenance tracking work?",
            key_facts=["provenance"],
            hit_keywords=["provenance", "chain", "tracking"],
            domain_source="K483",
            in_current_eblets=True,
        ),
        primed=TestQuery(
            qid="P4-C-P",
            question="In the K483 Sculptor architecture, how does the two-step provenance chain append mechanism work — specifically the curate mode vs sculpt mode distinction?",
            key_facts=["curate mode", "sculpt mode", "provenance chain", "K483"],
            hit_keywords=["curate", "sculpt", "provenance", "K483", "append"],
            domain_source="K483",
            in_current_eblets=True,
        ),
        expected_concentrated_source="synapse_K483.jsonl",
    ),
    AttentionQueryPair(
        pair_id="P4-D",
        unprimed=TestQuery(
            qid="P4-D-U",
            question="What are the compression characteristics of the Eblet store?",
            key_facts=["compression"],
            hit_keywords=["compression", "ratio", "eblet"],
            domain_source="K485",
            in_current_eblets=True,
        ),
        primed=TestQuery(
            qid="P4-D-P",
            question="In the K485 Phase C assessment specifically, what compression ratio was measured, what was the target, and what caused the underperformance?",
            key_facts=["1.8x", "5x target", "K485"],
            hit_keywords=["1.8x", "5x", "K485", "compression", "phase C"],
            domain_source="K485",
            in_current_eblets=True,
        ),
        expected_concentrated_source="synapse_K485.jsonl",
    ),
    AttentionQueryPair(
        pair_id="P4-E",
        unprimed=TestQuery(
            qid="P4-E-U",
            question="What is IP-as-filter?",
            key_facts=["IP", "filter"],
            hit_keywords=["IP", "filter", "property", "inclusion"],
            domain_source="K483",
            in_current_eblets=True,
        ),
        primed=TestQuery(
            qid="P4-E-P",
            question="Explain Keystone #28 (IP-as-filter) as empirically demonstrated in K483, including the specific tablet ID and the differential inclusion percentages across audiences.",
            key_facts=["Keystone-28", "89.3%", "77.7%", "LB-CAT.M-0001.b.c-T0073"],
            hit_keywords=["keystone-28", "89", "77", "filter", "differential", "tablet"],
            domain_source="K483",
            in_current_eblets=True,
        ),
        expected_concentrated_source="synapse_K483.jsonl",
    ),
]
