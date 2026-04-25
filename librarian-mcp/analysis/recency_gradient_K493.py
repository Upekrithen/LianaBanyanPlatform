"""
recency_gradient_K493.py — Recency-Anchor Gradient Analysis

K493 · B123 · Phase B empirical analysis.

Purpose:
  Quantitatively characterize the emergent recency-anchor gradient surfaced in K491.
  Recent Rhetorical Keystones (#28 IP-as-filter, #29 Shape-it-or-Someone-Else) were found
  to be MORE anchored in current AI reasoning than older keystones (#1, #2) even though
  no explicit decay mechanism exists in TF-IDF retrieval.

Analysis plan:
  1. Per-keystone TF-IDF retrieval proxy: rank_eblets() against keystone phrase+keywords
  2. Keystone age in session units (B-number as ordinal: higher B = more recent)
  3. Decay-curve shape: linear / logarithmic / exponential fit; report R²
  4. Per-Eblet age vs access frequency (currently zero; access_log started K493)
  5. Architectural mechanism: substrate-construction-order hypothesis

Outputs:
  - Printed tables (captured in REPORT)
  - analysis/gradient_data_K493.json (raw per-keystone data for persistence)

No LLM calls — pure TF-IDF math. Budget: $0.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

# --- Path setup ---------------------------------------------------------------
_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP))

from eblets.eblet import EbletStore, EBLET_STORE_PATH
from seers.seer import TFIDFIndex, _tokenize

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

KEYSTONES_REGISTRY = _LIBRARIAN_MCP / "miners" / "stone_tablets" / "keystones_registry.json"

# B-session to approximate date mapping (best-effort; used for age-in-days calculation)
# Based on session history: B103 ≈ Jan 2026, B110 ≈ Feb 2026, B119 ≈ Mar 2026,
# B120-B123 ≈ Apr 2026
SESSION_DATE_MAP: dict[str, str] = {
    "B103": "2026-01-15",
    "B110": "2026-02-10",
    "B111": "2026-02-20",
    "B112": "2026-02-28",
    "B113": "2026-03-05",
    "B115": "2026-03-15",
    "B116": "2026-03-20",
    "B117": "2026-03-25",
    "B118": "2026-04-01",
    "B119": "2026-04-05",
    "B120": "2026-04-10",
    "B121": "2026-04-15",
    "B122": "2026-04-18",
    "B123": "2026-04-22",
}
ANALYSIS_DATE = "2026-04-25"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def session_to_ordinal(session_label: str) -> int:
    """Convert B-session label to ordinal integer (higher = more recent)."""
    match = None
    for i, ch in enumerate(session_label):
        if ch.isdigit():
            match = i
            break
    if match is None:
        return 0
    return int(session_label[match:])


def session_to_age_days(session_label: str) -> float:
    """
    Approximate keystone age in days from registration to ANALYSIS_DATE.
    Older keystones have larger age_days.
    """
    date_str = SESSION_DATE_MAP.get(session_label)
    if date_str is None:
        # Estimate: assume linear spacing for unknown sessions
        ordinal = session_to_ordinal(session_label)
        # B103 = 2026-01-15, B123 = 2026-04-22 → ~97 days for 20 sessions → ~4.85 days/session
        b103_ordinal = 103
        b103_days = (
            datetime.fromisoformat(ANALYSIS_DATE) - datetime.fromisoformat("2026-01-15")
        ).days
        b123_ordinal = 123
        b123_days = (
            datetime.fromisoformat(ANALYSIS_DATE) - datetime.fromisoformat("2026-04-22")
        ).days
        slope = (b103_days - b123_days) / (b123_ordinal - b103_ordinal)
        estimated_days = b123_days + (b123_ordinal - ordinal) * slope
        return max(0.0, estimated_days)
    registered = datetime.fromisoformat(date_str)
    analysis = datetime.fromisoformat(ANALYSIS_DATE)
    return (analysis - registered).days


def eblet_age_days(eblet) -> float:
    """Age of an Eblet in days from created_at to ANALYSIS_DATE."""
    try:
        created = datetime.fromisoformat(eblet.created_at.replace("Z", "+00:00"))
        analysis = datetime.fromisoformat(ANALYSIS_DATE).replace(tzinfo=timezone.utc)
        return max(0.0, (analysis - created).days)
    except Exception:
        return 0.0


# ---------------------------------------------------------------------------
# Curve fitting (no scipy dependency — pure math)
# ---------------------------------------------------------------------------

def fit_linear(x: list[float], y: list[float]) -> dict:
    """
    Fit y = a*x + b via least squares.
    Returns {a, b, r_squared}.
    """
    n = len(x)
    if n < 2:
        return {"a": 0.0, "b": 0.0, "r_squared": 0.0, "model": "linear"}
    sx = sum(x); sy = sum(y)
    sxy = sum(xi * yi for xi, yi in zip(x, y))
    sxx = sum(xi * xi for xi in x)
    denom = n * sxx - sx * sx
    if abs(denom) < 1e-12:
        return {"a": 0.0, "b": sy / n, "r_squared": 0.0, "model": "linear"}
    a = (n * sxy - sx * sy) / denom
    b = (sy - a * sx) / n
    y_pred = [a * xi + b for xi in x]
    ss_res = sum((yi - yp) ** 2 for yi, yp in zip(y, y_pred))
    y_mean = sy / n
    ss_tot = sum((yi - y_mean) ** 2 for yi in y)
    r2 = 1.0 - ss_res / ss_tot if abs(ss_tot) > 1e-12 else 0.0
    return {"a": round(a, 6), "b": round(b, 6), "r_squared": round(r2, 4), "model": "linear"}


def fit_log(x: list[float], y: list[float]) -> dict:
    """
    Fit y = a*ln(x+1) + b via linear regression on transformed x.
    Returns {a, b, r_squared}.
    """
    x_t = [math.log(xi + 1) for xi in x]
    result = fit_linear(x_t, y)
    result["model"] = "logarithmic"
    return result


def fit_exp(x: list[float], y: list[float]) -> dict:
    """
    Fit y = b*exp(-a*x) by taking ln(y) ≈ ln(b) - a*x.
    Only works if all y > 0. Returns {a, b, r_squared}.
    """
    y_safe = [yi for yi in y if yi > 0]
    x_safe = [xi for xi, yi in zip(x, y) if yi > 0]
    if len(y_safe) < 2:
        return {"a": 0.0, "b": 0.0, "r_squared": 0.0, "model": "exponential", "note": "insufficient positive y values"}
    y_t = [math.log(yi) for yi in y_safe]
    lin = fit_linear(x_safe, y_t)
    a = -lin["a"]
    b = math.exp(lin["b"])
    y_pred = [b * math.exp(-a * xi) for xi in x]
    y_all = y
    y_mean = sum(y_all) / len(y_all)
    ss_res = sum((yi - yp) ** 2 for yi, yp in zip(y_all, y_pred))
    ss_tot = sum((yi - y_mean) ** 2 for yi in y_all)
    r2 = 1.0 - ss_res / ss_tot if abs(ss_tot) > 1e-12 else 0.0
    return {"a": round(a, 6), "b": round(b, 6), "r_squared": round(r2, 4), "model": "exponential"}


def best_fit(x: list[float], y: list[float]) -> dict:
    """Return the best-fitting curve (highest R²) among linear, log, exponential."""
    candidates = [fit_linear(x, y), fit_log(x, y), fit_exp(x, y)]
    return max(candidates, key=lambda c: c.get("r_squared", 0.0))


# ---------------------------------------------------------------------------
# Main analysis
# ---------------------------------------------------------------------------

def run_analysis() -> dict:
    # --- Load Eblets ---
    store = EbletStore(EBLET_STORE_PATH)
    eblets = store.load_all()
    access_stats = store.get_access_stats()
    print(f"[K493] Loaded {len(eblets)} Eblets, {len(access_stats)} with access history")

    # --- Build TF-IDF index ---
    index = TFIDFIndex()
    index.build(eblets)
    eblet_map = {eb.eblet_id: eb for eb in eblets}
    print(f"[K493] TF-IDF index built over {len(eblets)} Eblets")

    # --- Load keystones ---
    with KEYSTONES_REGISTRY.open("r", encoding="utf-8") as fh:
        registry = json.load(fh)
    keystones = registry["keystones"]
    print(f"[K493] Loaded {len(keystones)} Rhetorical Keystones from registry")

    # --- Per-keystone analysis ---
    keystone_results = []

    for ks in keystones:
        ks_id = ks["id"]
        ks_num = ks["number"]
        ks_phrase = ks["phrase"]
        ks_keywords = ks.get("thematic_keywords", [])
        ratified_session = ks.get("ratified_session", "B103")
        ks_ordinal = session_to_ordinal(ratified_session)
        age_days = session_to_age_days(ratified_session)

        # TF-IDF retrieval proxy: query = phrase + keywords
        query = ks_phrase + " " + " ".join(ks_keywords)
        scores = index.score(query)

        # Sort by score, take top-8 (DEFAULT_TOP_K)
        ranked = sorted(scores.items(), key=lambda kv: -kv[1])
        top8 = ranked[:8]
        top_score = top8[0][1] if top8 else 0.0
        mean_top8 = sum(s for _, s in top8) / max(1, len(top8))

        # How many Eblets score above threshold?
        MIN_THRESHOLD = 0.005
        above_threshold = sum(1 for _, s in scores.items() if s >= MIN_THRESHOLD)

        # Eblets explicitly carrying this keystone in keystone_anchors
        ks_anchor_label = ks_id  # e.g. "KEYSTONE-28"
        direct_anchors = [eb for eb in eblets if ks_anchor_label in eb.keystone_anchors]

        # Age of most-relevant Eblet (substrate construction order proxy)
        top_eblet_age = 0.0
        if top8:
            top_eblet_id = top8[0][0]
            top_eblet = eblet_map.get(top_eblet_id)
            if top_eblet:
                top_eblet_age = eblet_age_days(top_eblet)

        keystone_results.append({
            "keystone_id": ks_id,
            "number": ks_num,
            "phrase": ks_phrase[:60] + "…" if len(ks_phrase) > 60 else ks_phrase,
            "ratified_session": ratified_session,
            "session_ordinal": ks_ordinal,
            "age_days": round(age_days, 1),
            "top_tfidf_score": round(top_score, 5),
            "mean_top8_score": round(mean_top8, 5),
            "eblets_above_threshold": above_threshold,
            "direct_anchor_count": len(direct_anchors),
            "top_eblet_age_days": round(top_eblet_age, 1),
        })

    # Sort by number for display
    keystone_results.sort(key=lambda r: r["number"])

    # --- Per-Eblet age vs access stats ---
    eblet_age_access = []
    for eb in eblets:
        age = eblet_age_days(eb)
        acc = access_stats.get(eb.eblet_id, {}).get("access_count", 0)
        eblet_age_access.append({
            "eblet_id": eb.eblet_id,
            "age_days": round(age, 1),
            "access_count": acc,
            "keystone_anchors": eb.keystone_anchors,
            "created_at": eb.created_at,
        })

    # --- Decay-curve fitting: age_days vs top_tfidf_score ---
    x_age = [r["age_days"] for r in keystone_results]
    y_score = [r["top_tfidf_score"] for r in keystone_results]

    linear_fit = fit_linear(x_age, y_score)
    log_fit = fit_log(x_age, y_score)
    exp_fit = fit_exp(x_age, y_score)
    best = best_fit(x_age, y_score)

    # Also fit recency direction: is score POSITIVELY correlated with youth?
    # Recency = -age_days (more recent = smaller age_days = should have higher score if hypothesis holds)
    # But actually: HIGHER age_days = OLDER = LOWER score if recency-gradient hypothesis holds
    # So we expect NEGATIVE slope in linear fit (score decreases as age_days increases).
    gradient_direction = "recency-favoring" if linear_fit["a"] < 0 else "age-favoring"
    gradient_strength = abs(linear_fit["a"])

    # Gaps: keystones where emergent bias fails (high age + very low score)
    RECENCY_GAP_SCORE_THRESHOLD = 0.01
    gaps = [
        r for r in keystone_results
        if r["age_days"] > 60 and r["top_tfidf_score"] < RECENCY_GAP_SCORE_THRESHOLD
    ]

    # Per-Eblet age distribution
    age_buckets = defaultdict(list)
    for r in eblet_age_access:
        bucket = int(r["age_days"] // 10) * 10  # 0, 10, 20, ...
        age_buckets[bucket].append(r)

    age_distribution = {
        f"{b}-{b+9}d": len(items)
        for b, items in sorted(age_buckets.items())
    }

    # Summary statistics
    summary = {
        "analysis_date": ANALYSIS_DATE,
        "total_eblets": len(eblets),
        "total_keystones": len(keystones),
        "keystones_with_zero_direct_anchors": sum(1 for r in keystone_results if r["direct_anchor_count"] == 0),
        "keystones_with_score_above_threshold": sum(1 for r in keystone_results if r["top_tfidf_score"] >= RECENCY_GAP_SCORE_THRESHOLD),
        "max_tfidf_score": round(max(r["top_tfidf_score"] for r in keystone_results), 5),
        "min_tfidf_score": round(min(r["top_tfidf_score"] for r in keystone_results), 5),
        "mean_tfidf_score": round(sum(r["top_tfidf_score"] for r in keystone_results) / len(keystone_results), 5),
        "gradient_direction": gradient_direction,
        "gradient_slope": linear_fit["a"],
        "gradient_r_squared": linear_fit["r_squared"],
        "gaps_identified": len(gaps),
        "gap_keystones": [r["keystone_id"] for r in gaps],
        "eblets_with_access_history": len(access_stats),
        "eblet_age_distribution": age_distribution,
    }

    result = {
        "summary": summary,
        "keystone_analysis": keystone_results,
        "curve_fits": {
            "linear": linear_fit,
            "logarithmic": log_fit,
            "exponential": exp_fit,
            "best_fit": best,
        },
        "gaps": [
            {"keystone_id": r["keystone_id"], "age_days": r["age_days"],
             "top_tfidf_score": r["top_tfidf_score"], "phrase": r["phrase"]}
            for r in gaps
        ],
        "eblet_age_access": eblet_age_access,
    }

    return result


def print_report(data: dict) -> None:
    """Print a human-readable analysis report."""
    s = data["summary"]
    print("\n" + "=" * 72)
    print("K493 RECENCY-ANCHOR GRADIENT ANALYSIS")
    print(f"Analysis date: {s['analysis_date']}")
    print("=" * 72)
    print(f"\nEblet store: {s['total_eblets']} Eblets · {s['total_keystones']} Keystones")
    print(f"Access history: {s['eblets_with_access_history']} Eblets have been resolved (access log started K493)")

    print("\n--- PER-KEYSTONE RETRIEVAL PROXY ---")
    print(f"{'#':>3}  {'Session':>7}  {'Age(d)':>6}  {'TopScore':>8}  {'AbvThresh':>9}  {'DirAnchor':>9}  Phrase")
    print("-" * 80)
    for r in data["keystone_analysis"]:
        print(
            f"{r['number']:>3}  {r['ratified_session']:>7}  {r['age_days']:>6.0f}  "
            f"{r['top_tfidf_score']:>8.5f}  {r['eblets_above_threshold']:>9}  "
            f"{r['direct_anchor_count']:>9}  {r['phrase'][:40]}"
        )

    print("\n--- DECAY CURVE FITS (age_days → top_tfidf_score) ---")
    fits = data["curve_fits"]
    for model_name in ("linear", "logarithmic", "exponential"):
        fit = fits[model_name]
        print(f"  {model_name:>12}: R²={fit.get('r_squared', 0):.4f}  a={fit.get('a', 0):.6f}  b={fit.get('b', 0):.6f}")
    best = fits["best_fit"]
    print(f"\n  Best fit: {best['model']} (R²={best.get('r_squared', 0):.4f})")

    print(f"\n--- GRADIENT CHARACTERIZATION ---")
    print(f"  Direction: {s['gradient_direction']}")
    print(f"  Linear slope: {s['gradient_slope']:.6f} (score per day of age)")
    print(f"  Linear R²: {s['gradient_r_squared']:.4f}")
    if s["gradient_direction"] == "recency-favoring":
        print(f"  ✓ Recency-anchor gradient CONFIRMED: older keystones have lower TF-IDF retrieval proxy scores.")
    else:
        print(f"  ✗ Recency-anchor gradient NOT confirmed: score is not negatively correlated with age.")

    print(f"\n--- GAPS (high age + low score) ---")
    if data["gaps"]:
        for g in data["gaps"]:
            print(f"  {g['keystone_id']}: age={g['age_days']:.0f}d  score={g['top_tfidf_score']:.5f}  '{g['phrase'][:50]}'")
    else:
        print("  No gaps identified — all keystones have at least some retrieval signal.")

    print(f"\n--- EBLET AGE DISTRIBUTION ---")
    for bucket, count in s["eblet_age_distribution"].items():
        bar = "█" * min(40, count)
        print(f"  {bucket:>8}: {count:>3}  {bar}")

    print("\n--- KEYSTONES WITH ZERO DIRECT ANCHORS ---")
    print(f"  {s['keystones_with_zero_direct_anchors']} of {s['total_keystones']} keystones have no Eblets "
          f"with direct keystone_anchor match (expected — KEYSTONE_PATTERNS only covers a few)")
    print(f"  Keystones with score ≥ 0.01: {s['keystones_with_score_above_threshold']}/{s['total_keystones']}")
    print(f"  Score range: {s['min_tfidf_score']:.5f} – {s['max_tfidf_score']:.5f} (mean {s['mean_tfidf_score']:.5f})")

    print("\n" + "=" * 72)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    data = run_analysis()

    # Print human-readable report
    print_report(data)

    # Save raw data
    output_path = _HERE / "gradient_data_K493.json"
    with output_path.open("w", encoding="utf-8") as fh:
        # Exclude large eblet_age_access for the saved JSON (too big)
        compact = {k: v for k, v in data.items() if k != "eblet_age_access"}
        compact["eblet_count"] = len(data["eblet_age_access"])
        json.dump(compact, fh, indent=2, ensure_ascii=False)
    print(f"\n[K493] Raw data saved to {output_path}")
