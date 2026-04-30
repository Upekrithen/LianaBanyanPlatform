"""
substrate_classifier.py — Substrate-Dependency Classifier MVP (#2289)
KN007 / BP002 / 2026-04-29

Transparent algorithmic Tier A/B/C classifier on the substrate-dependency-graph
for #2287 Partnership-Stake Downstream-IP-Reversion adjudication.

Tier A (Substrate-Dependent)  — 20% mandatory reversion
  Claim CANNOT reduce to practice without LB primitive node X present.
  Algorithm: removal-test — remove X from graph; claim fails substrate-validation → Tier A.

Tier B (Substrate-Augmenting)  — 20% reversion (→10% if augmentation contributed back)
  Claim improves specific LB primitive but operates through it.
  Algorithm: metric-delta-test — claim measured against threshold (5-10% improvement).

Tier C (Substrate-Orthogonal)  — 0% reversion; Partner retains full ownership
  Claim derives from pre-existing IP or unrelated R&D; substrate incidental.
  Algorithm: orthogonality-test — dependency subgraph empty or all edges orthogonal-to.

Founder direction: "transparent algorithmic classifier on substrate-dependency-graph.
  Most objective, easiest to make."

Transparency mechanisms:
  - Both sides see same algorithm output
  - Reasoning trace published for every classification
  - Dependency subgraph rendering (JSON)
  - Algorithm versioning + reproducibility

Stone Tablet: classifier adds new classification_records.jsonl; no destructive edits
  to existing registry.yaml or canonical_values.yaml.

Toolsmith log: TS-SUBSTRATE-DEPENDENCY-CLASSIFIER-KN007-BP002
"""

from __future__ import annotations

import json
import re
import time
import uuid
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ── Algorithm versioning ──────────────────────────────────────────────────────

CLASSIFIER_VERSION = "1.0.0"
GRAPH_VERSION = "1.0.0"

# ── Tier constants ────────────────────────────────────────────────────────────

TIER_A = "Tier_A"   # Substrate-Dependent: 20% mandatory reversion
TIER_B = "Tier_B"   # Substrate-Augmenting: 20% (→10% if contributed back)
TIER_C = "Tier_C"   # Substrate-Orthogonal: 0% reversion

TIER_REVERSION_RATES = {
    TIER_A: 0.20,
    TIER_B: 0.20,
    TIER_C: 0.00,
}

TIER_B_CONTRIBUTED_BACK_RATE = 0.10  # Reduced rate if augmentation contributed back
TIER_B_METRIC_THRESHOLD_LOW  = 0.05  # 5% delta → Tier B floor
TIER_B_METRIC_THRESHOLD_HIGH = 0.10  # 10% delta → Tier B ceiling

# ── Substrate-Dependency Graph ────────────────────────────────────────────────
# The canonical LB substrate primitive registry.
# Extracted from:
#   - librarian-mcp/stitchpunks/scribes/registry.yaml
#   - canonical_values.yaml
#   - SUBSTRATE_DEPENDENCY_CLASSIFIER_SCOPE_MEMO_B134.md
# Edge types:
#   "depends_on"     = claim cannot operate without this node (Tier A signal)
#   "augments"       = claim improves this node (Tier B signal)
#   "federates_with" = claim interoperates but is independent (may be Tier B/C)
#   "orthogonal_to"  = claim is independent; substrate is incidental (Tier C signal)

SUBSTRATE_GRAPH: Dict[str, Dict] = {
    # Cathedral primitives
    "cathedral_effect":          {"id": "cathedral_effect",          "aa": "#2278", "aliases": ["Cathedral Effect", "Cathedral routing", "cathedral-effect", "CE"], "category": "cathedral"},
    "vendor_neutral_bridge":     {"id": "vendor_neutral_bridge",     "aa": "#2275", "aliases": ["Vendor-Neutral Bridge", "VNB", "vendor neutral"], "category": "cathedral"},
    "cathedral_federation":      {"id": "cathedral_federation",      "aa": "#2292", "aliases": ["Cathedral Federation Protocol", "CFP", "cathedral federation"], "category": "cathedral"},
    "sphinx_federation":         {"id": "sphinx_federation",         "aa": "#2295", "aliases": ["Sphinx Federation", "Sphinx", "#2295"], "category": "cathedral"},
    # Substrate primitives
    "wrasse_scribe":             {"id": "wrasse_scribe",             "aa": "K540/K544", "aliases": ["Wrasse", "Wrasse Scribe", "wrasse scribe", "WRASSE"], "category": "substrate"},
    "detective_live_update":     {"id": "detective_live_update",     "aa": "K550", "aliases": ["Detective", "live-update", "Detective live-update"], "category": "substrate"},
    "pheromone_substrate":       {"id": "pheromone_substrate",       "aa": "K523", "aliases": ["Pheromone Substrate", "pheromone", "stigmergy"], "category": "substrate"},
    "stone_tablet_imperative":   {"id": "stone_tablet_imperative",   "aa": "B117", "aliases": ["Stone Tablet", "append-only", "Stone Tablet Imperative"], "category": "substrate"},
    # Discipline primitives
    "pre_staging_architecture":  {"id": "pre_staging_architecture",  "aa": None, "aliases": ["Pre-Staging Architecture", "pre-staging", "PSA"], "category": "discipline"},
    "stay_warm":                 {"id": "stay_warm",                 "aa": None, "aliases": ["Stay-Warm", "stay warm", "warm substrate"], "category": "discipline"},
    "bundling_prompts":          {"id": "bundling_prompts",          "aa": None, "aliases": ["Bundling Prompts Advantage", "bundling prompts", "BPA"], "category": "discipline"},
    "three_fates_routing":       {"id": "three_fates_routing",       "aa": None, "aliases": ["Three Fates", "Clotho", "Lachesis", "Atropos", "Three Fates Routing"], "category": "discipline"},
    # Method primitives
    "registry_keyword_extension":{"id": "registry_keyword_extension","aa": "K547", "aliases": ["Registry-Keyword-Extension", "RKE", "K547", "alias-aware retrieval"], "category": "method"},
    "phase_f_substrate_instrument":{"id": "phase_f_substrate_instrument","aa": "K551", "aliases": ["Phase F Substrate Instrument", "Phase F", "K551"], "category": "method"},
    "romulator":                 {"id": "romulator",                 "aa": None, "aliases": ["Romulator", "ROM-first", "R9-ROM"], "category": "method"},
    # IP primitives
    "pledge_2260":               {"id": "pledge_2260",               "aa": "#2260", "aliases": ["#2260", "Pledge", "Cooperative Defensive Patent Pledge"], "category": "ip"},
    "partnership_stake_2286":    {"id": "partnership_stake_2286",    "aa": "#2286", "aliases": ["#2286", "Partnership Stake", "Collaboration Partnership Stake"], "category": "ip"},
    "ip_reversion_2287":         {"id": "ip_reversion_2287",         "aa": "#2287", "aliases": ["#2287", "IP Reversion", "Downstream IP Reversion", "reversion clause"], "category": "ip"},
    # Brand primitives
    "pied_piper_of_dragons":     {"id": "pied_piper_of_dragons",     "aa": None, "aliases": ["Pied Piper of Dragons", "Pied Piper"], "category": "brand"},
    "marks_currency":            {"id": "marks_currency",            "aa": None, "aliases": ["Marks", "Marks currency", "backed Marks", "effort-differential"], "category": "brand"},
}

# Build alias lookup: any alias string → node id
_ALIAS_LOOKUP: Dict[str, str] = {}
for _node_id, _node in SUBSTRATE_GRAPH.items():
    for _alias in _node["aliases"]:
        _ALIAS_LOOKUP[_alias.lower()] = _node_id


# ── Data types ────────────────────────────────────────────────────────────────

@dataclass
class DependencyEdge:
    from_node: str       # node id in SUBSTRATE_GRAPH
    to_node: str         # "claim" or node_id
    edge_type: str       # depends_on | augments | federates_with | orthogonal_to
    evidence: str        # quote from claim text that produced this edge
    confidence: float    # 0.0–1.0


@dataclass
class ClassificationResult:
    classification_id: str
    claim_id: str
    tier: str                     # TIER_A | TIER_B | TIER_C
    reversion_rate: float
    contributed_back: bool        # Tier B: augmentation contributed back → 10% rate
    nodes_detected: List[str]     # substrate node ids detected in claim
    dependency_edges: List[DependencyEdge]
    tier_a_evidence: List[str]    # removal-test evidence
    tier_b_metrics: dict          # metric-delta evidence {metric: delta_pct}
    tier_c_rationale: str
    reasoning_trace: List[str]    # full algorithmic walkthrough
    classifier_version: str
    graph_version: str
    elapsed_ms: int
    timestamp: str


# ── Tokenization + alias-match engine ─────────────────────────────────────────

def tokenize_claim(claim_text: str) -> List[str]:
    """
    Tokenize claim + specification text into n-grams (1..4) for alias matching.
    Produces lowercase n-grams for alias lookup (leverages K547 pattern).
    """
    words = re.findall(r"[a-zA-Z0-9#_'.-]+", claim_text)
    tokens = []
    for n in (1, 2, 3, 4):
        for i in range(len(words) - n + 1):
            gram = " ".join(words[i:i+n]).lower()
            tokens.append(gram)
    return tokens


def detect_substrate_nodes(claim_text: str, spec_text: str = "") -> List[Tuple[str, str]]:
    """
    Detect LB substrate primitives referenced (explicitly or via alias) in claim text.
    Returns list of (node_id, matched_alias) tuples — deduplicated by node_id.
    Uses K547-style alias-aware retrieval.
    """
    full_text = f"{claim_text}\n{spec_text}"
    tokens = tokenize_claim(full_text)

    detected: Dict[str, str] = {}  # node_id -> matched_alias
    for token in tokens:
        if token in _ALIAS_LOOKUP:
            node_id = _ALIAS_LOOKUP[token]
            if node_id not in detected:
                detected[node_id] = token

    return list(detected.items())


# ── Tier A: Removal-test ──────────────────────────────────────────────────────

def _removal_test(
    claim_text: str,
    spec_text: str,
    detected_nodes: List[Tuple[str, str]],
) -> Tuple[bool, List[str], List[DependencyEdge]]:
    """
    Removal-test: for each detected substrate node X,
    simulate removing X from substrate-dependency-graph.
    If claim would fail Section 112 enablement or become inoperative → Tier A evidence.

    Heuristics for v1:
    - Strong-dependency phrases: "requires", "depends on", "built on", "enabled by",
      "cannot operate without", "relies on", "powered by", "via the", "using the"
    - Explicit node reference in claim body (not just spec) = strong signal
    - Node in claim's "wherein" clause = depends_on
    """
    STRONG_DEPENDENCY_PATTERNS = [
        r"(?i)\brequires?\b",
        r"(?i)\bdepend(?:s|ing)?\s+on\b",
        r"(?i)\bbuilt\s+on\b",
        r"(?i)\benabled\s+by\b",
        r"(?i)\bcannot\s+operate\s+without\b",
        r"(?i)\brel(?:ies|ying)\s+on\b",
        r"(?i)\bpowered\s+by\b",
        r"(?i)\bwherein\b",
        r"(?i)\bcomprising\b.*\bsystem\b",
    ]

    tier_a_evidence: List[str] = []
    edges: List[DependencyEdge] = []

    for node_id, matched_alias in detected_nodes:
        node = SUBSTRATE_GRAPH.get(node_id, {})

        # Check if strong-dependency phrase appears near the alias match
        for pattern in STRONG_DEPENDENCY_PATTERNS:
            # Search within 200 chars window of alias mention
            alias_match = re.search(re.escape(matched_alias), claim_text, re.IGNORECASE)
            if alias_match:
                start = max(0, alias_match.start() - 100)
                end = min(len(claim_text), alias_match.end() + 100)
                window = claim_text[start:end]
                if re.search(pattern, window):
                    evidence = f"Node '{node_id}' (alias: '{matched_alias}') — dependency phrase matched in window: '{window[:80].strip()}'..."
                    tier_a_evidence.append(evidence)
                    edges.append(DependencyEdge(
                        from_node="claim",
                        to_node=node_id,
                        edge_type="depends_on",
                        evidence=evidence[:160],
                        confidence=0.75,
                    ))
                    break  # one edge per node; don't double-count

        # Claims that declare the node as load-bearing in spec also trigger
        spec_alias_match = re.search(re.escape(matched_alias), spec_text, re.IGNORECASE) if spec_text else None
        if spec_alias_match:
            # Check if the node appears in a "load-bearing" context in spec
            start = max(0, spec_alias_match.start() - 50)
            end = min(len(spec_text), spec_alias_match.end() + 100)
            window = spec_text[start:end]
            for pattern in STRONG_DEPENDENCY_PATTERNS[:4]:  # only strongest patterns for spec
                if re.search(pattern, window):
                    evidence = f"Node '{node_id}' referenced as load-bearing in specification: '{window[:80].strip()}'..."
                    if evidence not in tier_a_evidence:
                        tier_a_evidence.append(evidence)
                    break

    has_tier_a_signal = len(tier_a_evidence) > 0
    return has_tier_a_signal, tier_a_evidence, edges


# ── Tier B: Metric-delta-test ─────────────────────────────────────────────────

def _metric_delta_test(
    claim_text: str,
    spec_text: str,
    detected_nodes: List[Tuple[str, str]],
) -> Tuple[bool, dict, List[DependencyEdge]]:
    """
    Metric-delta-test: claim improves a substrate primitive by ≥ threshold.
    Metrics: HOT% / cost-per-correct-answer / latency / coverage.

    V1 heuristics:
    - Claim text contains improvement language near a detected node alias
    - Explicit percentage or quantitative improvement claim near node reference
    - "improves", "enhances", "extends", "augments", "increases", "reduces latency"
    """
    AUGMENTATION_PATTERNS = [
        r"(?i)\bimprove[sd]?\b",
        r"(?i)\benhance[sd]?\b",
        r"(?i)\bextend[sd]?\b",
        r"(?i)\baugment[sd]?\b",
        r"(?i)\bincreases?\s+(?:accuracy|coverage|HOT|score|throughput)\b",
        r"(?i)\breduces?\s+(?:latency|cost|error|hallucination)\b",
        r"(?i)\b\d+(?:\.\d+)?%\s+(?:improvement|reduction|increase|gain)\b",
        r"(?i)\bbetter\s+(?:than|performance)\b",
        r"(?i)\boutperforms?\b",
    ]

    metrics: Dict[str, float] = {}
    edges: List[DependencyEdge] = []

    for node_id, matched_alias in detected_nodes:
        alias_match = re.search(re.escape(matched_alias), claim_text, re.IGNORECASE)
        if not alias_match:
            continue

        start = max(0, alias_match.start() - 100)
        end = min(len(claim_text), alias_match.end() + 200)
        window = claim_text[start:end]

        for pattern in AUGMENTATION_PATTERNS:
            aug_match = re.search(pattern, window)
            if aug_match:
                # Try to extract numeric delta
                pct_match = re.search(r"(\d+(?:\.\d+)?)\s*%", window)
                if pct_match:
                    delta = float(pct_match.group(1)) / 100.0
                else:
                    delta = 0.075  # assume mid-range if no explicit %

                metric_key = f"{node_id}_improvement"
                metrics[metric_key] = delta

                edges.append(DependencyEdge(
                    from_node="claim",
                    to_node=node_id,
                    edge_type="augments",
                    evidence=f"Augmentation phrase '{aug_match.group(0)}' near '{matched_alias}' in claim.",
                    confidence=0.65,
                ))
                break

    # Tier B fires if any metric delta is in threshold range [5%, ∞)
    # (less than 5% → Tier C orthogonal signal; 5%+ → Tier B)
    has_tier_b_signal = any(v >= TIER_B_METRIC_THRESHOLD_LOW for v in metrics.values())
    return has_tier_b_signal, metrics, edges


# ── Tier C: Orthogonality-test ────────────────────────────────────────────────

def _orthogonality_test(
    detected_nodes: List[Tuple[str, str]],
    tier_a_edges: List[DependencyEdge],
    tier_b_edges: List[DependencyEdge],
) -> Tuple[bool, str]:
    """
    Orthogonality-test: claim is Tier C if:
    - No substrate node detected in claim (dependency subgraph empty), OR
    - All detected-node edges are orthogonal_to (no depends_on / augments edges)

    Tier C applies when substrate is incidental, not load-bearing.
    """
    if not detected_nodes:
        return True, "No substrate nodes detected in claim text or specification. Dependency subgraph empty → Tier C (Substrate-Orthogonal)."

    if not tier_a_edges and not tier_b_edges:
        nodes_mentioned = [alias for _, alias in detected_nodes]
        return True, (
            f"Substrate nodes detected ({', '.join(nodes_mentioned[:3])}) "
            f"but no depends_on or augments edges found. "
            f"References appear incidental — substrate is wallpaper, not foundation → Tier C."
        )

    return False, ""


# ── Main classifier ───────────────────────────────────────────────────────────

def classify(
    claim_id: str,
    claim_text: str,
    spec_text: str = "",
    declared_substrate_touchpoints: Optional[List[str]] = None,
    metric_deltas: Optional[Dict[str, float]] = None,
    contributed_back: bool = False,
) -> ClassificationResult:
    """
    Classify a prospective claim into Tier A, B, or C.

    Parameters:
      claim_id:   Partner-assigned identifier for the claim (provisional / pre-USPTO)
      claim_text: USPTO Section 112 form claim language
      spec_text:  Full specification body (optional; strengthens detection)
      declared_substrate_touchpoints: Partner-declared substrate node IDs (optional;
                  supplements algorithmic detection for transparency)
      metric_deltas: Partner-declared improvement metrics {metric_name: delta_pct}
                  (optional; supplements algorithmic detection for Tier B)
      contributed_back: True if Partner has contributed augmentation back to LB
                  substrate (triggers Tier B reduced 10% rate)

    Returns ClassificationResult with full reasoning trace.
    """
    t0 = time.monotonic()
    import datetime
    classification_id = str(uuid.uuid4())[:12]
    trace: List[str] = []

    trace.append(f"[CLASSIFIER v{CLASSIFIER_VERSION} / GRAPH v{GRAPH_VERSION}]")
    trace.append(f"Claim ID: {claim_id}")
    trace.append(f"Spec provided: {'yes' if spec_text else 'no'}")
    trace.append(f"Contributed-back: {contributed_back}")

    # Phase 1: Tokenize + alias-match
    detected_raw = detect_substrate_nodes(claim_text, spec_text)
    # Merge Partner-declared touchpoints
    if declared_substrate_touchpoints:
        declared_ids = set(declared_substrate_touchpoints)
        declared_raw = [(nid, nid) for nid in declared_ids if nid in SUBSTRATE_GRAPH and nid not in dict(detected_raw)]
        detected_raw = detected_raw + declared_raw

    detected = detected_raw
    detected_ids = [nid for nid, _ in detected]

    trace.append(f"Phase 1 — Substrate node detection: {len(detected)} node(s) found: {detected_ids}")

    # Phase 2: Removal-test (Tier A)
    tier_a_signal, tier_a_evidence, tier_a_edges = _removal_test(claim_text, spec_text, detected)
    trace.append(f"Phase 2 — Removal-test (Tier A): signal={'YES' if tier_a_signal else 'NO'}, evidence count={len(tier_a_evidence)}")
    for ev in tier_a_evidence:
        trace.append(f"  Tier A evidence: {ev[:120]}")

    # Phase 3: Metric-delta-test (Tier B)
    tier_b_signal_algo, metrics_algo, tier_b_edges = _metric_delta_test(claim_text, spec_text, detected)
    # Merge Partner-declared metrics
    if metric_deltas:
        for k, v in metric_deltas.items():
            metrics_algo[f"partner_declared_{k}"] = v
    tier_b_signal = tier_b_signal_algo or any(
        v >= TIER_B_METRIC_THRESHOLD_LOW for v in (metric_deltas or {}).values()
    )
    trace.append(f"Phase 3 — Metric-delta-test (Tier B): signal={'YES' if tier_b_signal else 'NO'}, metrics={metrics_algo}")

    # Phase 4: Orthogonality-test (Tier C)
    all_edges = tier_a_edges + tier_b_edges
    tier_c_signal, tier_c_rationale = _orthogonality_test(detected, tier_a_edges, tier_b_edges)
    trace.append(f"Phase 4 — Orthogonality-test (Tier C): signal={'YES' if tier_c_signal else 'NO'}")
    if tier_c_rationale:
        trace.append(f"  Tier C rationale: {tier_c_rationale[:120]}")

    # Phase 5: Classification decision (priority: A > B > C)
    if tier_a_signal:
        tier = TIER_A
        reversion_rate = TIER_REVERSION_RATES[TIER_A]
        trace.append("Phase 5 — Classification: TIER A (Substrate-Dependent). Removal-test triggered. Mandatory 20% reversion.")
    elif tier_b_signal:
        tier = TIER_B
        if contributed_back:
            reversion_rate = TIER_B_CONTRIBUTED_BACK_RATE
            trace.append("Phase 5 — Classification: TIER B (Substrate-Augmenting). Metric-delta-test triggered. Contributed-back reduction: 10% reversion.")
        else:
            reversion_rate = TIER_REVERSION_RATES[TIER_B]
            trace.append("Phase 5 — Classification: TIER B (Substrate-Augmenting). Metric-delta-test triggered. 20% reversion (10% if augmentation contributed back to LB).")
    else:
        tier = TIER_C
        reversion_rate = TIER_REVERSION_RATES[TIER_C]
        trace.append("Phase 5 — Classification: TIER C (Substrate-Orthogonal). No removal or metric-delta signal. 0% reversion; Partner retains full ownership.")

    elapsed = int((time.monotonic() - t0) * 1000)

    return ClassificationResult(
        classification_id=classification_id,
        claim_id=claim_id,
        tier=tier,
        reversion_rate=reversion_rate,
        contributed_back=contributed_back,
        nodes_detected=detected_ids,
        dependency_edges=all_edges,
        tier_a_evidence=tier_a_evidence,
        tier_b_metrics=metrics_algo,
        tier_c_rationale=tier_c_rationale,
        reasoning_trace=trace,
        classifier_version=CLASSIFIER_VERSION,
        graph_version=GRAPH_VERSION,
        elapsed_ms=elapsed,
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
    )


# ── Dependency subgraph renderer (JSON) ──────────────────────────────────────

def render_dependency_subgraph(result: ClassificationResult) -> dict:
    """
    Render the dependency subgraph as a JSON-serializable dict.
    Includes: nodes (detected substrate primitives) + edges (dependency relationships).
    Both sides see the same output for transparency.
    """
    nodes = []
    for node_id in result.nodes_detected:
        node = SUBSTRATE_GRAPH.get(node_id, {})
        nodes.append({
            "id": node_id,
            "category": node.get("category", "unknown"),
            "aa": node.get("aa"),
            "aliases": node.get("aliases", [])[:3],  # top 3 aliases for readability
        })

    edges = [
        {
            "from": e.from_node,
            "to": e.to_node,
            "type": e.edge_type,
            "confidence": e.confidence,
            "evidence_preview": e.evidence[:80],
        }
        for e in result.dependency_edges
    ]

    return {
        "classification_id": result.classification_id,
        "claim_id": result.claim_id,
        "tier": result.tier,
        "reversion_rate_pct": int(result.reversion_rate * 100),
        "nodes": nodes,
        "edges": edges,
        "graph_version": result.graph_version,
        "classifier_version": result.classifier_version,
    }


# ── Appeal-trigger interface (Three Fates handoff stub) ──────────────────────

CLASSIFICATION_LOG_PATH = Path(__file__).parent / "classification_records.jsonl"


def trigger_appeal(
    classification_id: str,
    partner_id: str,
    appeal_reason: str,
) -> dict:
    """
    Stub: Partner contests a classification → manual review handoff to Three Fates.
    V1: records appeal in classification_records.jsonl; human reviewer takes over.
    V2: full algorithmic appeal with reviewer-identified edge cases fed back to graph.
    Stone Tablet: append-only.
    """
    import datetime
    record = {
        "type": "appeal",
        "classification_id": classification_id,
        "partner_id": partner_id,
        "appeal_reason": appeal_reason,
        "status": "pending_three_fates_review",
        "ts": datetime.datetime.utcnow().isoformat() + "Z",
        "classifier_version": CLASSIFIER_VERSION,
        "graph_version": GRAPH_VERSION,
    }
    try:
        with open(CLASSIFICATION_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass

    return {
        "appeal_filed": True,
        "classification_id": classification_id,
        "status": "pending_three_fates_review",
        "message": (
            "Appeal filed. Three Fates manual review initiated. "
            "Reviewer will start from the algorithmic reasoning trace. "
            "If specific edge case found, it will be fed back into classifier v-next."
        ),
    }


def record_classification(result: ClassificationResult) -> None:
    """
    Append-only record of every classification to classification_records.jsonl.
    Stone Tablet Imperative.
    """
    record = {
        "type": "classification",
        **asdict(result),
        "dependency_edges": [
            {"from": e.from_node, "to": e.to_node, "type": e.edge_type,
             "confidence": e.confidence, "evidence": e.evidence[:120]}
            for e in result.dependency_edges
        ],
    }
    try:
        with open(CLASSIFICATION_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass


# ── CLI entry point ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    data = json.load(sys.stdin)
    result = classify(
        claim_id=data.get("claim_id", "stdin"),
        claim_text=data.get("claim_text", ""),
        spec_text=data.get("spec_text", ""),
        declared_substrate_touchpoints=data.get("declared_touchpoints"),
        metric_deltas=data.get("metric_deltas"),
        contributed_back=data.get("contributed_back", False),
    )
    record_classification(result)
    output = {
        "classification_id": result.classification_id,
        "claim_id": result.claim_id,
        "tier": result.tier,
        "reversion_rate_pct": int(result.reversion_rate * 100),
        "nodes_detected": result.nodes_detected,
        "reasoning_trace": result.reasoning_trace,
        "elapsed_ms": result.elapsed_ms,
        "subgraph": render_dependency_subgraph(result),
    }
    print(json.dumps(output, indent=2))
