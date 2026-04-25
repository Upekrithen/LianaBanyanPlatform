"""
K491 — Empirical Test Harness

Shared infrastructure for all four predictions:
  - InstrumentedSeer: wraps Seer with access-frequency + latency tracking
  - grade_result(): HOT / HIT / MISS grading against a TestQuery
  - save_results(): JSONL recording in empirical_tests/results/
  - load_api_client(): secure key loading from SDS.env (no echo)
  - Recency classification for Prediction 3
  - Source-concentration metrics for Prediction 4

REF Staff discipline: harness is observational only. No substrate modification.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# --- Path setup ---------------------------------------------------------------
_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from seers.seer import Seer, SeerResult
from eblets.eblet import Eblet, EbletStore, EBLET_STORE_PATH
from empirical_tests.panels import TestQuery, RECENCY_BINS

RESULTS_DIR = _HERE / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# SDS.env path (not read directly into output)
_SDS_ENV_PATH = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/Asteroid-ProofVault/LockBox/SDS.env")


# ---------------------------------------------------------------------------
# Secure API key loading
# ---------------------------------------------------------------------------

def load_api_client(verbose: bool = True) -> Optional[Any]:
    """
    Load Anthropic API key from environment or SDS.env.
    Never echoes raw key value per AGENTS.md.
    Returns anthropic.Anthropic() instance or None.
    """
    # Already in environment?
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key and _SDS_ENV_PATH.exists():
        with _SDS_ENV_PATH.open("r", encoding="utf-8") as fh:
            for line in fh:
                m = re.match(r"^ANTHROPIC_API_KEY=(.+)$", line.strip())
                if m:
                    key = m.group(1).strip()
                    os.environ["ANTHROPIC_API_KEY"] = key
                    break

    if not key:
        if verbose:
            print("[harness] WARNING: ANTHROPIC_API_KEY not found — dry-run mode", flush=True)
        return None

    if verbose:
        print(f"[harness] ANTHROPIC_API_KEY: {'set' if key else 'missing'} (length={len(key)})", flush=True)

    try:
        import anthropic
        return anthropic.Anthropic(api_key=key)
    except ImportError:
        print("[harness] ERROR: anthropic package not installed. Run: pip install anthropic", flush=True)
        return None


# ---------------------------------------------------------------------------
# Grading
# ---------------------------------------------------------------------------

GRADE_HOT = "HOT"
GRADE_HIT = "HIT"
GRADE_MISS = "MISS"


def grade_result(result: SeerResult, query: TestQuery) -> dict:
    """
    Grade a SeerResult against a TestQuery.

    HOT: answer contains all key_facts (case-insensitive substring match) AND is not honest_unknown
    HIT: answer contains at least 1 key_fact OR has hit_keywords, AND is not honest_unknown
    MISS: none of the above, OR honest_unknown (scope-boundary)

    Returns grade_dict with: grade, matched_key_facts, matched_hit_keywords, honest_unknown
    """
    answer_lower = result.answer.lower()

    if result.honest_unknown:
        matched_key = []
        matched_hit = []
        grade = GRADE_MISS
        return {
            "grade": grade,
            "matched_key_facts": matched_key,
            "matched_hit_keywords": matched_hit,
            "honest_unknown": True,
            "reasoning": "SCOPE-BOUNDARY triggered",
        }

    matched_key = [
        f for f in query.key_facts
        if f.lower() in answer_lower
    ]
    matched_hit = [
        k for k in query.hit_keywords
        if k.lower() in answer_lower
    ]

    if len(matched_key) >= max(1, len(query.key_facts) * 0.6):
        grade = GRADE_HOT
    elif matched_hit:
        grade = GRADE_HIT
    else:
        grade = GRADE_MISS

    return {
        "grade": grade,
        "matched_key_facts": matched_key,
        "matched_hit_keywords": matched_hit,
        "honest_unknown": False,
        "reasoning": f"key_facts {len(matched_key)}/{len(query.key_facts)} matched",
    }


def compute_hot_rate(grades: list[dict]) -> float:
    """Fraction of HOT grades in a grade list."""
    if not grades:
        return 0.0
    return sum(1 for g in grades if g["grade"] == GRADE_HOT) / len(grades)


def compute_provenance_completeness(result: SeerResult) -> float:
    """
    Fraction of top Eblets with non-empty provenance chains.
    0.0 (no chains) to 1.0 (all have chains).
    """
    if not result.top_eblets:
        return 0.0
    with_chain = sum(
        1 for eb, _ in result.top_eblets if len(eb.provenance_chain) > 1
    )
    return with_chain / len(result.top_eblets)


# ---------------------------------------------------------------------------
# Recency classification (Prediction 3)
# ---------------------------------------------------------------------------

def classify_eblet_recency(eblet: Eblet) -> str:
    """
    Classify an Eblet into cold / medium / recent based on eblet_id range.
    Uses RECENCY_BINS from panels.py.
    """
    def _id_num(eid: str) -> int:
        m = re.search(r"(\d+)$", eid)
        return int(m.group(1)) if m else 0

    n = _id_num(eblet.eblet_id)
    cold_lo, cold_hi = _id_num(RECENCY_BINS["cold"][0]), _id_num(RECENCY_BINS["cold"][1])
    med_lo, med_hi = _id_num(RECENCY_BINS["medium"][0]), _id_num(RECENCY_BINS["medium"][1])
    rec_lo, rec_hi = _id_num(RECENCY_BINS["recent"][0]), _id_num(RECENCY_BINS["recent"][1])

    if cold_lo <= n <= cold_hi:
        return "cold"
    elif med_lo <= n <= med_hi:
        return "medium"
    elif rec_lo <= n <= rec_hi:
        return "recent"
    return "unknown"


def recency_distribution(top_eblets: list[tuple[Eblet, float]]) -> dict[str, int]:
    """Count of each recency bin in the top-K Eblets."""
    dist: dict[str, int] = Counter(classify_eblet_recency(eb) for eb, _ in top_eblets)
    return dict(dist)


# ---------------------------------------------------------------------------
# Source concentration (Prediction 4)
# ---------------------------------------------------------------------------

def source_concentration(top_eblets: list[tuple[Eblet, float]]) -> dict[str, int]:
    """
    Count how many of the top-K Eblets come from each synapse source file.
    Returns {synapse_filename: count}.
    """
    counts: dict[str, int] = Counter()
    for eb, _ in top_eblets:
        # synapse_pointer = "synapse_K475.jsonl#cluster_xxx"
        source = eb.synapse_pointer.split("#")[0]
        counts[source] += 1
    return dict(counts)


def concentration_entropy(concentration: dict[str, int]) -> float:
    """
    Normalized Shannon entropy of the source-concentration distribution.
    Low entropy = concentrated (prediction holds);
    high entropy = spread (prediction fails).
    0.0 = all from one source; 1.0 = perfectly uniform.
    """
    import math
    total = sum(concentration.values())
    if total == 0 or len(concentration) <= 1:
        return 0.0
    probs = [v / total for v in concentration.values()]
    raw_entropy = -sum(p * math.log(p) for p in probs if p > 0)
    max_entropy = math.log(len(concentration))
    return round(raw_entropy / max_entropy, 4) if max_entropy > 0 else 0.0


# ---------------------------------------------------------------------------
# Instrumented Seer (access-frequency + latency tracking)
# ---------------------------------------------------------------------------

class InstrumentedSeer(Seer):
    """
    Seer subclass that instruments access-frequency and latency tracking.

    New attributes:
      access_counts: {eblet_id: int}  — number of times each Eblet appeared in top_k
      latency_by_access: {eblet_id: [elapsed_s, ...]}  — per-access latencies
      query_sequence: list[dict]  — ordered record of all queries issued
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.access_counts: dict[str, int] = defaultdict(int)
        self.latency_by_access: dict[str, list[float]] = defaultdict(list)
        self.query_sequence: list[dict] = []

    def query(self, user_query: str, **kwargs) -> SeerResult:
        result = super().query(user_query, **kwargs)

        # Record per-Eblet access
        for eb, score in result.top_eblets:
            self.access_counts[eb.eblet_id] += 1
            self.latency_by_access[eb.eblet_id].append(result.elapsed_s)

        # Record query sequence entry
        self.query_sequence.append({
            "query": user_query,
            "elapsed_s": result.elapsed_s,
            "top_eblet_ids": [eb.eblet_id for eb, _ in result.top_eblets],
            "top_eblet_scores": [round(sc, 6) for _, sc in result.top_eblets],
            "honest_unknown": result.honest_unknown,
            "cost_usd_est": result.cost_usd_est,
        })

        return result

    def access_frequency_report(self) -> list[dict]:
        """
        Return per-Eblet access statistics sorted by access count (descending).
        Each entry: {eblet_id, access_count, mean_latency_s, first_latency_s, last_latency_s}
        """
        report = []
        for eid, count in sorted(self.access_counts.items(), key=lambda x: -x[1]):
            lats = self.latency_by_access[eid]
            report.append({
                "eblet_id": eid,
                "access_count": count,
                "mean_latency_s": round(sum(lats) / len(lats), 3) if lats else 0.0,
                "first_latency_s": round(lats[0], 3) if lats else 0.0,
                "last_latency_s": round(lats[-1], 3) if lats else 0.0,
                "latency_delta_s": round(lats[-1] - lats[0], 3) if len(lats) >= 2 else 0.0,
            })
        return report


# ---------------------------------------------------------------------------
# Result recording
# ---------------------------------------------------------------------------

def save_jsonl(records: list[dict], filename: str) -> Path:
    """Save a list of dicts to a JSONL file in RESULTS_DIR."""
    path = RESULTS_DIR / filename
    with path.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"[harness] Saved {len(records)} records -> {path}", flush=True)
    return path


def run_panel(
    seer: InstrumentedSeer,
    panel: list[TestQuery],
    label: str,
    verbose: bool = True,
) -> list[dict]:
    """
    Run a test panel, grade each result, return list of result dicts.

    Each dict: qid, question, grade, grade_detail, seer_answer, elapsed_s,
               top_eblet_ids, top_eblet_scores, provenance_completeness,
               cost_usd_est, source_concentration, honest_unknown, run_at
    """
    records = []
    for q in panel:
        if verbose:
            print(f"\n[{label}] {q.qid}: {q.question[:80]}...", flush=True)

        result = seer.query(q.question, verbose_provenance=False)
        grade_detail = grade_result(result, q)
        conc = source_concentration(result.top_eblets)
        prov_complete = compute_provenance_completeness(result)
        rec_dist = recency_distribution(result.top_eblets)

        if verbose:
            print(
                f"  grade={grade_detail['grade']} | "
                f"elapsed={result.elapsed_s:.2f}s | "
                f"cost=${result.cost_usd_est:.5f} | "
                f"honest_unknown={result.honest_unknown}",
                flush=True,
            )
            print(f"  top_eblets: {[eb.eblet_id for eb, _ in result.top_eblets[:3]]}", flush=True)

        records.append({
            "qid": q.qid,
            "question": q.question,
            "label": label,
            "domain_source": q.domain_source,
            "in_current_eblets": q.in_current_eblets,
            "grade": grade_detail["grade"],
            "grade_detail": grade_detail,
            "seer_answer": result.answer[:800],
            "elapsed_s": result.elapsed_s,
            "top_eblet_ids": [eb.eblet_id for eb, _ in result.top_eblets],
            "top_eblet_scores": [round(sc, 6) for _, sc in result.top_eblets],
            "provenance_completeness": prov_complete,
            "source_concentration": conc,
            "recency_distribution": rec_dist,
            "honest_unknown": result.honest_unknown,
            "cost_usd_est": result.cost_usd_est,
            "tokens_in": result.tokens_in,
            "tokens_out": result.tokens_out,
            "run_at": datetime.now(timezone.utc).isoformat(),
        })

    return records


def summarize_panel(records: list[dict], label: str) -> dict:
    """Compute summary statistics for a panel run."""
    grades = [r["grade_detail"] for r in records]
    hot_rate = compute_hot_rate(grades)
    hit_rate = sum(1 for r in records if r["grade"] in (GRADE_HOT, "HIT")) / max(1, len(records))
    miss_rate = sum(1 for r in records if r["grade"] == GRADE_MISS) / max(1, len(records))
    mean_prov = sum(r["provenance_completeness"] for r in records) / max(1, len(records))
    mean_latency = sum(r["elapsed_s"] for r in records) / max(1, len(records))
    total_cost = sum(r["cost_usd_est"] for r in records)
    n = len(records)

    summary = {
        "label": label,
        "n": n,
        "HOT": sum(1 for r in records if r["grade"] == GRADE_HOT),
        "HIT": sum(1 for r in records if r["grade"] == "HIT"),
        "MISS": sum(1 for r in records if r["grade"] == GRADE_MISS),
        "hot_rate": round(hot_rate, 4),
        "hit_or_hot_rate": round(hit_rate, 4),
        "miss_rate": round(miss_rate, 4),
        "mean_provenance_completeness": round(mean_prov, 4),
        "mean_latency_s": round(mean_latency, 3),
        "total_cost_usd": round(total_cost, 6),
        "note_underpowered": f"N={n} — confidence intervals are wide; report effect size + direction only",
    }
    return summary
