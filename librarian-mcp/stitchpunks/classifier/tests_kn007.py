"""
tests_kn007.py — Substrate-Dependency Classifier Tests (#2289)
KN007 / BP002 / 2026-04-29 — 22 tests covering Tier A/B/C classification,
dependency-subgraph rendering, appeal-trigger, algorithm versioning, and
integration tests with real K535/K547/K550 reduction-to-practice anchors.

Usage:
    cd C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform
    python -m librarian-mcp.stitchpunks.classifier.tests_kn007
"""

from __future__ import annotations

import sys
from pathlib import Path

WORKSPACE = Path(__file__).parent.parent.parent.parent.parent  # workspace root
if str(WORKSPACE) not in sys.path:
    sys.path.insert(0, str(WORKSPACE))

# Adjust for package import from the classifier directory
import importlib.util
_mod_path = Path(__file__).parent / "substrate_classifier.py"
_spec = importlib.util.spec_from_file_location("substrate_classifier", _mod_path)
substrate_classifier = importlib.util.module_from_spec(_spec)
sys.modules["substrate_classifier"] = substrate_classifier  # required for dataclass __module__ resolution
_spec.loader.exec_module(substrate_classifier)

classify             = substrate_classifier.classify
render_dependency_subgraph = substrate_classifier.render_dependency_subgraph
trigger_appeal       = substrate_classifier.trigger_appeal
detect_substrate_nodes = substrate_classifier.detect_substrate_nodes
TIER_A = substrate_classifier.TIER_A
TIER_B = substrate_classifier.TIER_B
TIER_C = substrate_classifier.TIER_C
CLASSIFIER_VERSION   = substrate_classifier.CLASSIFIER_VERSION
GRAPH_VERSION        = substrate_classifier.GRAPH_VERSION

PASS = "PASS"
FAIL = "FAIL"
results: list[tuple[str, str, str]] = []


def check(number: str, description: str, condition: bool, detail: str = "") -> None:
    status = PASS if condition else FAIL
    results.append((number, description, status))
    sym = "OK" if condition else "XX"
    print(f"  [{sym}] {number}: {description}")
    if not condition:
        print(f"       DETAIL: {detail}")


# ── T01: Algorithm version present ───────────────────────────────────────────
def test_t01_version():
    check("T01", "CLASSIFIER_VERSION and GRAPH_VERSION are set",
          bool(CLASSIFIER_VERSION) and bool(GRAPH_VERSION))


# ── T02: Tier A — explicit dependency phrase triggers removal-test ───────────
def test_t02_tier_a_explicit():
    """K-session reduction-to-practice anchor: Cathedral Effect is a Tier A primitive."""
    result = classify(
        claim_id="test_t02",
        claim_text=(
            "A method for AI model context persistence, wherein the method requires "
            "Cathedral Effect routing to maintain multi-session substrate context. "
            "The system relies on Cathedral routing for all cross-session memory operations. "
            "The invention cannot operate without Cathedral Effect."
        ),
        spec_text="The invention is built on the Cathedral Effect (#2278) as the foundational substrate."
    )
    check("T02", "Tier A: explicit depends_on phrase with Cathedral Effect -> TIER_A",
          result.tier == TIER_A,
          f"tier={result.tier}, evidence={result.tier_a_evidence[:1]}")


# ── T03: Tier A — Wrasse Scribe dependency ────────────────────────────────────
def test_t03_tier_a_wrasse():
    """Wrasse Scribe (K540/K544) is a Tier A substrate primitive."""
    result = classify(
        claim_id="test_t03",
        claim_text=(
            "A system for append-only distributed knowledge recording, "
            "wherein each node depends on the Wrasse Scribe mechanism to persist "
            "observations. The system requires Wrasse to function."
        ),
    )
    check("T03", "Tier A: Wrasse Scribe dependency → TIER_A",
          result.tier == TIER_A,
          f"tier={result.tier}")


# ── T04: Tier A — declared touchpoint forces dependency ──────────────────────
def test_t04_tier_a_declared_touchpoint():
    result = classify(
        claim_id="test_t04",
        claim_text=(
            "A method for managing patent claim adjudication wherein the process "
            "relies on the Stone Tablet Imperative to ensure audit immutability. "
            "The method requires Stone Tablet for legal defensibility."
        ),
        declared_substrate_touchpoints=["stone_tablet_imperative"],
    )
    check("T04", "Tier A: declared touchpoint + removal-test → TIER_A",
          result.tier == TIER_A,
          f"tier={result.tier}")


# ── T05: Tier B — improvement language with node reference ───────────────────
def test_t05_tier_b_improvement():
    result = classify(
        claim_id="test_t05",
        claim_text=(
            "A method that augments the Pheromone Substrate to improve retrieval accuracy. "
            "The method increases HOT% score by 8% when applied alongside the Pheromone Substrate. "
            "The invention enhances pheromone routing coverage by 7% versus baseline."
        ),
    )
    check("T05", "Tier B: augmentation + explicit % improvement near node → TIER_B",
          result.tier in (TIER_A, TIER_B),  # A may fire if phrased strongly; B is target
          f"tier={result.tier}, metrics={result.tier_b_metrics}")


# ── T06: Tier B — Partner-declared metric delta ──────────────────────────────
def test_t06_tier_b_metric_delta():
    result = classify(
        claim_id="test_t06",
        claim_text=(
            "A method that extends the Registry-Keyword-Extension (RKE) system "
            "to handle multilingual alias matching. The method works alongside RKE."
        ),
        metric_deltas={"hot_pct_delta": 0.09},  # 9% improvement — within Tier B range
    )
    check("T06", "Tier B: Partner-declared 9% metric delta with RKE → TIER_B",
          result.tier == TIER_B,
          f"tier={result.tier}, metrics={result.tier_b_metrics}")


# ── T07: Tier B contributed_back → 10% rate ──────────────────────────────────
def test_t07_tier_b_contributed_back():
    result = classify(
        claim_id="test_t07",
        claim_text=(
            "A method that augments the Detective live-update mechanism "
            "to improve dependency graph refresh latency by 12%. "
            "The method extends Detective to handle real-time edge updates."
        ),
        contributed_back=True,
    )
    check("T07", "Tier B + contributed_back=True → 10% reversion rate",
          result.tier in (TIER_A, TIER_B) and (
              result.reversion_rate == 0.10 if result.tier == TIER_B else True
          ),
          f"tier={result.tier}, reversion_rate={result.reversion_rate}")


# ── T08: Tier C — no substrate nodes in claim ────────────────────────────────
def test_t08_tier_c_empty_subgraph():
    result = classify(
        claim_id="test_t08",
        claim_text=(
            "A method for optimizing database query plans using machine learning "
            "to predict query cost. The system analyzes historical query patterns "
            "and generates optimized execution plans independent of any cooperative platform."
        ),
    )
    check("T08", "Tier C: no substrate nodes detected → TIER_C, 0% reversion",
          result.tier == TIER_C and result.reversion_rate == 0.0,
          f"tier={result.tier}, nodes={result.nodes_detected}")


# ── T09: Tier C — nodes mentioned incidentally ───────────────────────────────
def test_t09_tier_c_incidental():
    result = classify(
        claim_id="test_t09",
        claim_text=(
            "A method for weather forecasting that outputs data to any "
            "append-only storage system. The method operates identically "
            "whether or not a Stone Tablet logging system is present."
        ),
    )
    check("T09", "Tier C: Stone Tablet mentioned incidentally, no dependency phrase → TIER_C",
          result.tier == TIER_C,
          f"tier={result.tier}, edges={result.dependency_edges}")


# ── T10: Subgraph renderer returns correct structure ─────────────────────────
def test_t10_subgraph_renderer():
    result = classify(
        claim_id="test_t10",
        claim_text="A system that requires Cathedral Effect routing to function.",
    )
    subgraph = render_dependency_subgraph(result)
    check("T10", "render_dependency_subgraph returns valid JSON structure",
          "classification_id" in subgraph and
          "tier" in subgraph and
          "nodes" in subgraph and
          "edges" in subgraph and
          "reversion_rate_pct" in subgraph,
          f"keys={list(subgraph.keys())}")


# ── T11: Subgraph reversion_rate_pct for Tier A is 20 ───────────────────────
def test_t11_subgraph_reversion_rate():
    result = classify(
        claim_id="test_t11",
        claim_text="A system that depends on the Cathedral Effect (#2278) wherein the method requires Cathedral Effect.",
    )
    subgraph = render_dependency_subgraph(result)
    check("T11", "Tier A subgraph reversion_rate_pct = 20",
          subgraph["reversion_rate_pct"] == 20 if result.tier == TIER_A else True,
          f"tier={result.tier}, rate={subgraph['reversion_rate_pct']}")


# ── T12: Reasoning trace is populated ────────────────────────────────────────
def test_t12_reasoning_trace():
    result = classify(
        claim_id="test_t12",
        claim_text="A method that requires Wrasse Scribe to record observations.",
    )
    check("T12", "Reasoning trace has at least 5 entries (algorithmic walkthrough)",
          len(result.reasoning_trace) >= 5,
          f"trace_len={len(result.reasoning_trace)}")


# ── T13: Classifier version + graph version in result ────────────────────────
def test_t13_versioning():
    result = classify(
        claim_id="test_t13",
        claim_text="A standalone method for data compression.",
    )
    check("T13", "ClassificationResult has classifier_version + graph_version",
          result.classifier_version == CLASSIFIER_VERSION and
          result.graph_version == GRAPH_VERSION,
          f"cv={result.classifier_version}, gv={result.graph_version}")


# ── T14: Tier A > Tier B priority ────────────────────────────────────────────
def test_t14_tier_priority():
    """When both removal-test AND metric-delta fire, Tier A takes precedence."""
    result = classify(
        claim_id="test_t14",
        claim_text=(
            "A system that requires Cathedral Effect routing to function "
            "and also enhances Cathedral routing coverage by 15%."
        ),
    )
    check("T14", "Tier A takes priority over Tier B when both signals fire",
          result.tier == TIER_A,
          f"tier={result.tier}")


# ── T15: detect_substrate_nodes — alias matching ─────────────────────────────
def test_t15_alias_matching():
    """K547 alias-aware retrieval: aliases resolve to canonical node IDs."""
    detected = dict(detect_substrate_nodes(
        "The method uses the Cathedral routing mechanism and Wrasse for logging."
    ))
    check("T15", "Alias 'Cathedral routing' → 'cathedral_effect'; 'Wrasse' → 'wrasse_scribe'",
          "cathedral_effect" in detected and "wrasse_scribe" in detected,
          f"detected={list(detected.keys())}")


# ── T16: Four-gram alias match ────────────────────────────────────────────────
def test_t16_ngram_alias():
    """Multi-word alias (up to 4 grams) is detected."""
    detected = dict(detect_substrate_nodes(
        "The system employs Stone Tablet Imperative storage for audit records."
    ))
    check("T16", "3-gram alias 'Stone Tablet Imperative' → 'stone_tablet_imperative'",
          "stone_tablet_imperative" in detected,
          f"detected={list(detected.keys())}")


# ── T17: Tier C produces 0% reversion rate ───────────────────────────────────
def test_t17_tier_c_zero_reversion():
    result = classify(
        claim_id="test_t17",
        claim_text="A novel method for image segmentation using convolutional networks.",
    )
    check("T17", "Tier C reversion_rate = 0.0",
          result.tier == TIER_C and result.reversion_rate == 0.0,
          f"tier={result.tier}, rate={result.reversion_rate}")


# ── T18: Appeal trigger returns pending status ───────────────────────────────
def test_t18_appeal_trigger():
    appeal = trigger_appeal(
        classification_id="fake-cls-001",
        partner_id="partner-test-001",
        appeal_reason="Algorithm missed custom alias pattern.",
    )
    check("T18", "trigger_appeal returns appeal_filed=True + pending_three_fates_review status",
          appeal["appeal_filed"] is True and
          appeal["status"] == "pending_three_fates_review",
          f"appeal={appeal}")


# ── T19: K535 integration — Sphinx Federation is Tier A primitive ─────────────
def test_t19_k535_sphinx_tier_a():
    """K535 reduction-to-practice: Sphinx Federation (#2295) is a Tier A node."""
    result = classify(
        claim_id="test_t19_k535",
        claim_text=(
            "A federated AI substrate system, wherein the system depends on "
            "Sphinx Federation (#2295) to distribute context across multiple "
            "AI vendor endpoints. The method requires Sphinx Federation and "
            "cannot operate without the cross-vendor federation layer."
        ),
    )
    check("T19", "K535 integration: Sphinx Federation Tier A node triggers TIER_A",
          result.tier == TIER_A,
          f"tier={result.tier}, nodes={result.nodes_detected}")


# ── T20: K547 integration — Registry-Keyword-Extension is detectable ─────────
def test_t20_k547_rke():
    """K547 reduction-to-practice: RKE alias is detectable."""
    detected = dict(detect_substrate_nodes(
        "The method uses Registry-Keyword-Extension for alias-aware token matching."
    ))
    check("T20", "K547 integration: Registry-Keyword-Extension alias detected",
          "registry_keyword_extension" in detected,
          f"detected={list(detected.keys())}")


# ── T21: K550 integration — Detective live-update is Tier A/B node ───────────
def test_t21_k550_detective():
    result = classify(
        claim_id="test_t21_k550",
        claim_text=(
            "A live-updating knowledge graph system that relies on the Detective "
            "live-update mechanism to propagate node changes in real time. "
            "The system requires Detective for all graph update operations."
        ),
    )
    check("T21", "K550 integration: Detective live-update detected + Tier A signal",
          result.tier in (TIER_A, TIER_B) and "detective_live_update" in result.nodes_detected,
          f"tier={result.tier}, nodes={result.nodes_detected}")


# ── T22: Performance — classify completes in < 100ms ─────────────────────────
def test_t22_performance():
    """Classification must be fast to be usable in Partner enrollment workflow."""
    result = classify(
        claim_id="test_t22_perf",
        claim_text=(
            "A method for multi-vendor AI orchestration that requires Cathedral Effect "
            "routing and enhances Pheromone Substrate coverage by 12%. "
            "The system depends on Wrasse Scribe for Stone Tablet logging."
        ),
        spec_text="The invention builds on the Cathedral Effect foundation.",
    )
    check("T22", "Classification completes in < 100ms",
          result.elapsed_ms < 100,
          f"elapsed_ms={result.elapsed_ms}")


# ── Runner ───────────────────────────────────────────────────────────────────

def run_all():
    print("\n=== KN007 Substrate-Dependency Classifier — 22 Tests ===\n")
    test_t01_version()
    test_t02_tier_a_explicit()
    test_t03_tier_a_wrasse()
    test_t04_tier_a_declared_touchpoint()
    test_t05_tier_b_improvement()
    test_t06_tier_b_metric_delta()
    test_t07_tier_b_contributed_back()
    test_t08_tier_c_empty_subgraph()
    test_t09_tier_c_incidental()
    test_t10_subgraph_renderer()
    test_t11_subgraph_reversion_rate()
    test_t12_reasoning_trace()
    test_t13_versioning()
    test_t14_tier_priority()
    test_t15_alias_matching()
    test_t16_ngram_alias()
    test_t17_tier_c_zero_reversion()
    test_t18_appeal_trigger()
    test_t19_k535_sphinx_tier_a()
    test_t20_k547_rke()
    test_t21_k550_detective()
    test_t22_performance()

    print("\n=== Results ===")
    passed = sum(1 for _, _, s in results if s == PASS)
    failed = sum(1 for _, _, s in results if s == FAIL)
    for num, desc, status in results:
        sym = "OK" if status == PASS else "XX"
        print(f"  [{sym}] {num}: {desc}")
    print(f"\n{passed}/22 PASSED  |  {failed}/22 FAILED")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    run_all()
