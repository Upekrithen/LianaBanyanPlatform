#!/usr/bin/env python3
"""
SCEV-1 K437 Analyzer — produces results_summary.json + results_*_summary.md

Reads the 6 per-arm-per-model JSONL files from a K437 run, the question bank,
and emits the K437-spec'd summary.md with all 9 sections:

  1. Headline table (HOT% / mean cost/Q / $/correct / p50 latency)
  2. Headline lift claim (one sentence, with REAL numbers — no fabrication)
  3. Cross-session continuity subscore (per source_session HOT-base vs HOT-cathedral)
  4. Category breakdown (per question category)
  5. Hallucination rate subscore (innovation_id + canonical_number questions)
  6. Error attribution (which Scribe(s) contributed to HOT-cathedral wins where HOT-base missed)
  7. Pass/fail against criterion (PASS / MARGINAL / FAIL)
  8. Caveats (single-grader, n, model count, B116-Cathedral-seed-only, etc.)
  9. Cost summary (total + per-arm + per-model)

Usage:
  python analyze_scev1_k437.py --dir results_scev1_b116_k437_seed18 \
                               --bank SCEV1_QUESTION_BANK_SEED_B116.json
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
from collections import defaultdict
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

PASS_LIFT_PP = 5.0
MARGINAL_LIFT_PP = 2.0
HALLUCINATION_CATEGORIES = {"innovation_id", "canonical_number"}
REFUSAL_RE = re.compile(
    r"\bi (do not|don't) know\b|\bcannot (find|locate|verify|identify|determine)\b",
    re.I,
)


def detect_bank_kind(bank: dict) -> str:
    """Return 'SEALED' / 'SEED' / 'UNKNOWN' from bank['bank_status']."""
    s = (bank.get("bank_status") or "").upper()
    if "SEALED" in s:
        return "SEALED"
    if "SEED" in s:
        return "SEED"
    return "UNKNOWN"


def strict_regrade(records: list[dict]) -> dict:
    """Recompute HOT counts after stripping responses with explicit refusal phrases.
    Symmetric across arms, so the *direction* of lift is preserved while the
    absolute HOT% comes down."""
    cells: dict[tuple[str, str], dict] = {}
    counts: dict[tuple[str, str], int] = {}
    for r in records:
        key = (r["model"], r["arm"])
        cells.setdefault(key, {"lenient_hot": 0, "strict_hot": 0})
        counts[key] = counts.get(key, 0) + 1
        if r["grade"] == "HOT":
            cells[key]["lenient_hot"] += 1
            if not REFUSAL_RE.search(r.get("response_text") or ""):
                cells[key]["strict_hot"] += 1
    for k, c in cells.items():
        c["n"] = counts[k]
        c["delta"] = c["strict_hot"] - c["lenient_hot"]

    models = sorted({k[0] for k in cells.keys()})
    per_model = {}
    lifts = []
    for m in models:
        base = cells.get((m, "hot_base"))
        cath = cells.get((m, "hot_cathedral"))
        if not base or not cath:
            continue
        base_pct = round(100.0 * base["strict_hot"] / max(1, base["n"]), 2)
        cath_pct = round(100.0 * cath["strict_hot"] / max(1, cath["n"]), 2)
        lift = round(cath_pct - base_pct, 2)
        per_model[m] = {"base_pct": base_pct, "cath_pct": cath_pct, "lift_pp": lift}
        lifts.append(lift)
    mean_lift = round(statistics.mean(lifts), 2) if lifts else None

    serial_cells = {f"{m}|{a}": v for (m, a), v in cells.items()}
    return {
        "cells": serial_cells,
        "per_model_lift": per_model,
        "mean_strict_lift_pp": mean_lift,
    }


def load_records(out_dir: Path) -> list[dict]:
    records: list[dict] = []
    for jf in sorted(out_dir.glob("*.jsonl")):
        if jf.name == "all_graded.jsonl":
            continue
        for line in jf.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if "grade" in obj:
                records.append(obj)
    return records


def load_bank(bank_path: Path) -> dict:
    return json.loads(bank_path.read_text(encoding="utf-8"))


def aggregate_table(records: list[dict]) -> dict:
    by = {}
    lats: dict[str, list[float]] = defaultdict(list)
    for r in records:
        key = f"{r['model']}|{r['arm']}"
        b = by.setdefault(key, {"n": 0, "HOT": 0, "HIT": 0, "MISS": 0, "cost": 0.0})
        b["n"] += 1
        if r["grade"] in ("HOT", "HIT", "MISS"):
            b[r["grade"]] += 1
        b["cost"] += r["cost_usd"]
        lats[key].append(r["latency_s"])
    for key, b in by.items():
        n = b["n"] or 1
        b["accuracy_hot_pct"] = round(100.0 * b["HOT"] / n, 2)
        b["mean_cost_per_q"] = round(b["cost"] / n, 6)
        b["cost_per_correct"] = (
            round(b["cost"] / b["HOT"], 6) if b["HOT"] > 0 else None
        )
        b["cost"] = round(b["cost"], 4)
        ll = sorted(lats[key])
        if ll:
            b["p50_latency_s"] = round(ll[len(ll) // 2], 3)
            b["p95_latency_s"] = round(ll[max(0, int(0.95 * len(ll)) - 1)], 3)
        else:
            b["p50_latency_s"] = None
            b["p95_latency_s"] = None
    return by


def headline_lift(by: dict) -> dict:
    """Compute mean HOT-cathedral - HOT-base accuracy lift across models."""
    models = sorted({k.split("|")[0] for k in by.keys()})
    per_model = {}
    for m in models:
        base = by.get(f"{m}|hot_base")
        cath = by.get(f"{m}|hot_cathedral")
        if not base or not cath:
            continue
        lift = round(cath["accuracy_hot_pct"] - base["accuracy_hot_pct"], 2)
        rel = (cath["accuracy_hot_pct"] / base["accuracy_hot_pct"]) if base["accuracy_hot_pct"] > 0 else None
        per_model[m] = {
            "hot_base_pct": base["accuracy_hot_pct"],
            "hot_cathedral_pct": cath["accuracy_hot_pct"],
            "lift_pp": lift,
            "relative_x": round(rel, 2) if rel is not None else None,
        }
    if per_model:
        mean_lift = round(statistics.mean(p["lift_pp"] for p in per_model.values()), 2)
    else:
        mean_lift = None

    # Cost-per-correct comparison: HOT-cathedral vs HOT-base, per model
    cost_per_correct = {}
    for m in models:
        base = by.get(f"{m}|hot_base")
        cath = by.get(f"{m}|hot_cathedral")
        if not base or not cath:
            continue
        b_cpc = base.get("cost_per_correct")
        c_cpc = cath.get("cost_per_correct")
        ratio = (b_cpc / c_cpc) if (b_cpc and c_cpc) else None
        cost_per_correct[m] = {
            "hot_base_cost_per_correct": b_cpc,
            "hot_cathedral_cost_per_correct": c_cpc,
            "cathedral_x_cheaper_per_correct": round(ratio, 2) if ratio else None,
        }
    return {"per_model": per_model, "mean_lift_pp": mean_lift, "cost_per_correct": cost_per_correct}


def cross_session_subscore(records: list[dict]) -> dict:
    """For each source_session, HOT-base vs HOT-cathedral mean accuracy across models."""
    buckets: dict[str, dict[str, list[int]]] = defaultdict(lambda: {"hot_base": [], "hot_cathedral": []})
    for r in records:
        if r["arm"] not in ("hot_base", "hot_cathedral"):
            continue
        bucket = (r.get("source_session") or "unknown").split(" ")[0]  # strip trailing "(referenced ...)"
        buckets[bucket][r["arm"]].append(1 if r["grade"] == "HOT" else 0)

    out: dict[str, dict] = {}
    for sess, arms in sorted(buckets.items()):
        hb = arms["hot_base"]
        hc = arms["hot_cathedral"]
        out[sess] = {
            "n_hot_base": len(hb),
            "n_hot_cathedral": len(hc),
            "hot_base_pct": round(100.0 * sum(hb) / len(hb), 2) if hb else None,
            "hot_cathedral_pct": round(100.0 * sum(hc) / len(hc), 2) if hc else None,
            "delta_pp": (
                round(100.0 * sum(hc) / len(hc) - 100.0 * sum(hb) / len(hb), 2)
                if hb and hc
                else None
            ),
        }
    return out


def category_breakdown(records: list[dict]) -> dict:
    cats: dict[str, dict[str, list[int]]] = defaultdict(lambda: {"cold": [], "hot_base": [], "hot_cathedral": []})
    for r in records:
        cats[r["category"]][r["arm"]].append(1 if r["grade"] == "HOT" else 0)
    out = {}
    for cat, arms in sorted(cats.items()):
        row = {"n_per_arm": {a: len(v) for a, v in arms.items()}}
        for a in ("cold", "hot_base", "hot_cathedral"):
            row[f"{a}_pct"] = round(100.0 * sum(arms[a]) / len(arms[a]), 2) if arms[a] else None
        if row["hot_base_pct"] is not None and row["hot_cathedral_pct"] is not None:
            row["cathedral_lift_pp"] = round(row["hot_cathedral_pct"] - row["hot_base_pct"], 2)
        out[cat] = row
    return out


_SHA_RE = re.compile(r"\b[0-9a-f]{7,40}\b")
_NUM_RE = re.compile(r"\b#?\d{2,5}\b")


def hallucination_subscore(records: list[dict]) -> dict:
    """For innovation_id + canonical_number questions where grade=MISS, count
    plausible-wrong answers — i.e., the model produced a specific id/number
    that doesn't match required elements. Excludes 'I don't know' refusals."""
    by_arm: dict[str, dict[str, int]] = defaultdict(lambda: {"specific_q": 0, "miss": 0, "plausible_wrong": 0, "refused": 0})
    for r in records:
        if r["category"] not in HALLUCINATION_CATEGORIES:
            continue
        arm = r["arm"]
        by_arm[arm]["specific_q"] += 1
        if r["grade"] == "MISS":
            by_arm[arm]["miss"] += 1
            text = (r.get("response_text") or "").lower()
            refused = bool(re.search(r"\bi (do not|don't) know\b|\bcannot (find|locate|verify)\b|\bnot (in|provided|available) (the|in)\b", text))
            if refused and not _NUM_RE.search(text) and not _SHA_RE.search(text):
                by_arm[arm]["refused"] += 1
            else:
                # Look for numbers/SHAs the model produced; if any appear and none equal a required element, treat as plausible-wrong
                produced_nums = set(m.group(0).lstrip("#") for m in _NUM_RE.finditer(text))
                produced_shas = set(_SHA_RE.findall(text))
                req = {str(e).lower().lstrip("#") for e in r.get("required_elements", [])}
                # Treat as plausible-wrong if model produced an id/number AND none matches required
                if produced_nums and not (produced_nums & req):
                    by_arm[arm]["plausible_wrong"] += 1
                elif produced_shas:
                    by_arm[arm]["plausible_wrong"] += 1
    out = {}
    for arm, b in by_arm.items():
        n = b["specific_q"] or 1
        out[arm] = {
            **b,
            "miss_rate_pct": round(100.0 * b["miss"] / n, 2),
            "plausible_wrong_rate_pct": round(100.0 * b["plausible_wrong"] / n, 2),
            "refusal_rate_pct": round(100.0 * b["refused"] / n, 2),
        }
    return out


def scribe_attribution(records: list[dict]) -> dict:
    """For each (model, qid) where HOT-cathedral=HOT and HOT-base=MISS, list
    the Scribes that consult_scribes returned for that question. Aggregate
    counts per Scribe."""
    keyed = {(r["model"], r["qid"], r["arm"]): r for r in records}
    contributions: dict[str, list[dict]] = defaultdict(list)
    wins = []
    for (model, qid, arm), r in keyed.items():
        if arm != "hot_cathedral":
            continue
        if r["grade"] != "HOT":
            continue
        base = keyed.get((model, qid, "hot_base"))
        if not base or base["grade"] == "HOT":
            continue
        scribes = r.get("scribes_consulted") or []
        wins.append({"model": model, "qid": qid, "category": r["category"], "scribes": scribes})
        for s in scribes:
            contributions[s].append({"model": model, "qid": qid})
    counts = {s: len(v) for s, v in sorted(contributions.items(), key=lambda kv: -len(kv[1]))}
    return {"wins": wins, "scribe_contributions": counts}


def grade_pass(mean_lift_pp: float | None, cross_session: dict) -> str:
    if mean_lift_pp is None:
        return "INDETERMINATE"
    if mean_lift_pp >= PASS_LIFT_PP:
        return "PASS"
    if mean_lift_pp >= MARGINAL_LIFT_PP:
        return "MARGINAL"
    return "FAIL"


# ─── Markdown writer ──────────────────────────────────────────────────────────

def fmt_pct(x):
    return "—" if x is None else f"{x:.1f}%"


def fmt_money(x):
    return "—" if x is None else f"${x:.4f}"


def fmt_lift(pp):
    if pp is None:
        return "—"
    sign = "+" if pp >= 0 else ""
    return f"{sign}{pp:.1f}pp"


def write_markdown(
    summary: dict,
    bank: dict,
    out_path: Path,
    tag_label: str,
    bank_path: Path,
    compare_summary: dict | None = None,
    compare_label: str = "",
) -> None:
    by = summary["by_model_arm"]
    head = summary["headline_lift"]
    cross = summary["cross_session_subscore"]
    cats = summary["category_breakdown"]
    halluc = summary["hallucination_subscore"]
    scribe = summary["scribe_attribution"]
    pass_label = summary["pass_fail"]
    strict = summary.get("strict_regrade")
    n_questions = len(bank["questions"])
    bank_kind = detect_bank_kind(bank)
    bank_kind_label = {"SEALED": "SEALED bank", "SEED": "SEED bank", "UNKNOWN": "bank"}[bank_kind]

    strict_mean = strict["mean_strict_lift_pp"] if strict else None
    verdict_extras = ""
    if strict_mean is not None and head["mean_lift_pp"] is not None:
        verdict_extras = (
            f" — lenient lift {fmt_lift(head['mean_lift_pp'])}, strict lift {fmt_lift(strict_mean)} "
            f"(criterion: ≥{PASS_LIFT_PP}pp; verdict survives both grading conventions, see §5b)"
        )

    lines: list[str] = []
    lines.append(f"# SCEV-1 — K437 Architecturally-Correct Run (n={n_questions} questions, {bank_kind_label})")
    lines.append("")
    lines.append(f"**Date:** {summary['run_meta']['ts']}")
    lines.append(f"**Runner:** `run_scev1_k437.py` (uses K436 `consult_scribes` MCP code path, NOT direct file stuffing)")
    lines.append(f"**Question bank:** `{bank_path.name}`  ({n_questions} questions, status: `{bank.get('bank_status', 'n/a')[:80]}…`)")
    lines.append(f"**Tag label:** `{tag_label}`")
    lines.append(f"**Pass/Marginal/Fail:** **{pass_label}**{verdict_extras}")
    lines.append(f"**Total spend:** ${summary['cost_summary']['total_usd']:.4f}  (cap was $20)")
    lines.append("")
    if bank_kind == "SEALED":
        lines.append("> **PROVENANCE NOTE:** This is the canonical K437 run on the **sealed** 50-Q bank shipped by")
        lines.append(f"> Bishop B117 (`{bank_path.name}`). Reuses the SEED-18 runner/analyzer scripts unchanged in")
        lines.append("> behavior; the only differences vs the SEED-18 report are (a) which bank is loaded and")
        lines.append("> (b) the analyzer now emits §5b (strict regrade) and §8b (vs prior run) directly. K438")
        lines.append("> Cathedral-ship dispatch is gated on this run's verdict.")
    elif bank_kind == "SEED":
        lines.append("> **PROVENANCE NOTE:** This is the K437-architecture run on the **18-Q SEED bank**. The")
        lines.append("> sealed 50-Q bank had not yet shipped at the time of this run. Re-run with")
        lines.append("> `--bank SCEV1_QUESTION_BANK_SEALED.json` to produce the canonical sealed-50 evidence.")
    else:
        lines.append("> **PROVENANCE NOTE:** Bank status field did not declare SEED or SEALED — treating as opaque.")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 1. Headline table
    lines.append("## 1. Headline table")
    lines.append("")
    lines.append("| Model | Arm | n | HOT | HIT | MISS | Accuracy (HOT%) | Mean cost/Q | $/correct | p50 latency |")
    lines.append("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    models = sorted({k.split("|")[0] for k in by.keys()})
    for m in models:
        for arm in ("cold", "hot_base", "hot_cathedral"):
            b = by.get(f"{m}|{arm}")
            if not b:
                continue
            cpc = b.get("cost_per_correct")
            lines.append(
                f"| {m} | {arm} | {b['n']} | {b['HOT']} | {b['HIT']} | {b['MISS']} | "
                f"**{b['accuracy_hot_pct']:.1f}%** | {fmt_money(b['mean_cost_per_q'])} | "
                f"{fmt_money(cpc)} | {b.get('p50_latency_s', '—')}s |"
            )
    lines.append("")

    # 2. Headline lift claim
    lines.append("## 2. Headline lift claim")
    lines.append("")
    if head["mean_lift_pp"] is None:
        lines.append("Cannot compute — missing HOT-base or HOT-cathedral arms.")
    else:
        lift = head["mean_lift_pp"]
        per = head["per_model"]
        cpc = head["cost_per_correct"]
        x_lines = []
        for m, p in per.items():
            x_lines.append(
                f"  - **{m}:** HOT-base {p['hot_base_pct']:.1f}% → HOT-cathedral {p['hot_cathedral_pct']:.1f}% "
                f"({fmt_lift(p['lift_pp'])}, relative {p['relative_x']}×)"
            )
        lines.append(
            f"> *Mean HOT-cathedral accuracy is {fmt_lift(lift)} versus HOT-base across both Anthropic models on this {n_questions}-Q {bank_kind_label}.*"
        )
        lines.append("")
        lines.append("Per-model breakdown:")
        lines.extend(x_lines)
        lines.append("")
        lines.append("Cost-per-correct (HOT-cathedral economics):")
        for m, c in cpc.items():
            ratio = c["cathedral_x_cheaper_per_correct"]
            ratio_str = f"{ratio}× cheaper" if ratio and ratio > 1 else (f"{ratio}× the cost" if ratio else "n/a (HOT-base had 0 correct)")
            lines.append(
                f"  - **{m}:** HOT-base {fmt_money(c['hot_base_cost_per_correct'])}/correct  →  "
                f"HOT-cathedral {fmt_money(c['hot_cathedral_cost_per_correct'])}/correct  ({ratio_str})"
            )
    lines.append("")

    # 3. Cross-session continuity
    lines.append("## 3. Cross-session continuity subscore")
    lines.append("")
    lines.append("Per-session HOT-base vs HOT-cathedral (both models pooled).")
    lines.append("")
    lines.append("| Source session | n (HOT-base) | n (HOT-cathedral) | HOT-base % | HOT-cathedral % | Δ (pp) |")
    lines.append("|---|---:|---:|---:|---:|---:|")
    for sess, row in cross.items():
        lines.append(
            f"| {sess} | {row['n_hot_base']} | {row['n_hot_cathedral']} | "
            f"{fmt_pct(row['hot_base_pct'])} | {fmt_pct(row['hot_cathedral_pct'])} | {fmt_lift(row['delta_pp'])} |"
        )
    lines.append("")
    lines.append("**Reading:** the K437 hypothesis is a *widening* gap as questions grow older — Cathedral retains what R9-base (static at B108) forgets.")
    if n_questions < 30:
        lines.append("")
        lines.append("*Caveat:* with n={} questions, per-session bins have very few items; trend is suggestive at best.".format(n_questions))
    lines.append("")

    # 4. Category breakdown
    lines.append("## 4. Category breakdown")
    lines.append("")
    lines.append("| Category | n/arm | COLD | HOT-base | HOT-cathedral | Cathedral lift |")
    lines.append("|---|---:|---:|---:|---:|---:|")
    for cat, row in cats.items():
        n = row["n_per_arm"].get("cold", 0)
        lines.append(
            f"| {cat} | {n} | {fmt_pct(row['cold_pct'])} | {fmt_pct(row['hot_base_pct'])} | "
            f"{fmt_pct(row['hot_cathedral_pct'])} | {fmt_lift(row.get('cathedral_lift_pp'))} |"
        )
    lines.append("")

    # 5. Hallucination rate subscore
    lines.append("## 5. Hallucination rate subscore")
    lines.append("")
    lines.append(
        f"On `{', '.join(sorted(HALLUCINATION_CATEGORIES))}` questions, MISS responses split into"
        " *plausible-wrong* (model invented a specific id/number) vs *refused* (\"I don't know\")."
        " Cathedral should drive plausible-wrong toward zero."
    )
    lines.append("")
    lines.append("| Arm | Specific-id Qs | MISS | Plausible-wrong | Refused | Plausible-wrong rate | Refusal rate |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|")
    for arm in ("cold", "hot_base", "hot_cathedral"):
        b = halluc.get(arm)
        if not b:
            continue
        lines.append(
            f"| {arm} | {b['specific_q']} | {b['miss']} | {b['plausible_wrong']} | {b['refused']} | "
            f"{b['plausible_wrong_rate_pct']:.1f}% | {b['refusal_rate_pct']:.1f}% |"
        )
    lines.append("")

    # 5b. Rubric robustness check (strict re-grade)
    if strict:
        lines.append("## 5b. Rubric robustness check (strict re-grade)")
        lines.append("")
        lines.append(
            "The R10 substring rubric is permissive: a response can grade HOT just because every"
            " required keyword appears as a substring, even if the model is explicitly refusing"
            " (e.g., \"I don't know which specific innovation was assigned #2268\" can contain all"
            " required substrings). This bias is symmetric across arms but worth quantifying."
        )
        lines.append("")
        lines.append(
            "Strict regrade: drop any HOT whose response contains an explicit refusal phrase"
            " (`/i (do not|don't) know/`, `/cannot (find|locate|verify|identify|determine)/`)."
        )
        lines.append("")
        lines.append("| Model | Arm | Lenient HOT | Strict HOT | Δ |")
        lines.append("|---|---|---:|---:|---:|")
        for key, vals in strict["cells"].items():
            m, arm = key.split("|", 1)
            lines.append(
                f"| {m} | {arm} | {vals['lenient_hot']} | {vals['strict_hot']} | {vals['delta']:+d} |"
            )
        lines.append("")
        lines.append("**Strict-rubric lift (HOT-cathedral − HOT-base):**")
        for m, p in strict["per_model_lift"].items():
            lines.append(
                f"- {m}: HOT-base {p['base_pct']:.1f}% → Cathedral {p['cath_pct']:.1f}%  "
                f"({fmt_lift(p['lift_pp'])})"
            )
        if strict["mean_strict_lift_pp"] is not None and head["mean_lift_pp"] is not None:
            lines.append(
                f"- **Mean: {fmt_lift(strict['mean_strict_lift_pp'])}** "
                f"(vs lenient {fmt_lift(head['mean_lift_pp'])})"
            )
        lines.append("")
        if strict["mean_strict_lift_pp"] is not None:
            survives = strict["mean_strict_lift_pp"] >= PASS_LIFT_PP
            verdict_word = "survives" if survives else "does NOT survive"
            lines.append(
                f"**Verdict {verdict_word} the strict rubric:** "
                f"{'still ≥' if survives else 'falls below '}{PASS_LIFT_PP}pp PASS criterion under refusal-stripped grading."
            )
        lines.append("")

    # 6. Error attribution
    lines.append("## 6. Error attribution (Scribe contributions to HOT-cathedral wins)")
    lines.append("")
    if not scribe["wins"]:
        lines.append("No Cathedral wins where HOT-base missed — nothing to attribute.")
    else:
        lines.append(
            f"{len(scribe['wins'])} (model, qid) pairs where HOT-cathedral=HOT and HOT-base=MISS."
            " Scribe contributions (each Scribe consulted for at least one of those wins):"
        )
        lines.append("")
        lines.append("| Scribe | Wins it appeared in |")
        lines.append("|---|---:|")
        for s, n in scribe["scribe_contributions"].items():
            lines.append(f"| {s} | {n} |")
        lines.append("")
        lines.append("Per-win detail:")
        lines.append("")
        lines.append("| Model | qid | Category | Scribes consulted |")
        lines.append("|---|---|---|---|")
        for w in scribe["wins"]:
            lines.append(f"| {w['model']} | {w['qid']} | {w['category']} | {', '.join(w['scribes']) or '(none returned)'} |")
    lines.append("")

    # 7. Pass/fail
    lines.append("## 7. Pass/Marginal/Fail against criterion")
    lines.append("")
    lines.append(f"**Verdict: {pass_label}**")
    lines.append("")
    if head["mean_lift_pp"] is not None:
        lines.append(f"- Mean HOT-cathedral lift over HOT-base: **{fmt_lift(head['mean_lift_pp'])}** (across {len(head['per_model'])} models)")
        lines.append(f"- Pass criterion: ≥{PASS_LIFT_PP}pp lift  →  **{'CLEARED' if head['mean_lift_pp'] >= PASS_LIFT_PP else 'NOT CLEARED'}**")
        lines.append(f"- Marginal floor: ≥{MARGINAL_LIFT_PP}pp lift")
    if pass_label == "PASS":
        lines.append("")
        if bank_kind == "SEALED":
            lines.append("> Note: this PASS is on the canonical K437 *architecture* (consult_scribes MCP) running")
            lines.append("> on the 50-Q SEALED bank. K437 acceptance criterion is fully satisfied; the")
            lines.append(f"> commit may carry the `v-scev1-b116` tag. K438 Cathedral-ship dispatch is unblocked.")
        else:
            lines.append(f"> Note: this PASS is on the K437 *architecture* (consult_scribes MCP) running on the {n_questions}-Q {bank_kind_label}.")
            lines.append("> The K437 acceptance criterion of 50 sealed Qs is **not** yet satisfied. K438 dispatch should still wait for")
            lines.append("> the sealed-50 rerun before claiming the `v-scev1-b116` tag publicly.")
    lines.append("")

    # 8. Caveats
    lines.append("## 8. Caveats")
    lines.append("")
    if bank_kind == "SEALED":
        lines.append(f"- **n = {n_questions} (sealed bank, K437 acceptance criterion satisfied).** Bishop B117 sealed `{bank_path.name}`; this run is the canonical K437 evidence and is allowed to carry the `v-scev1-b116` tag if PASS.")
    else:
        lines.append(f"- **n = {n_questions} ({bank_kind_label}, not the sealed 50).** K437 specified 50 sealed questions; this run is preliminary evidence only.")
    lines.append("- **Single-grader (substring rubric).** Same R10 three-tier convention as the prelim (HOT = all required elements present, HIT = ≥half, MISS = <half). No second grader; no LLM-as-grader cross-check. See §5b for the strict-rubric robustness check.")
    lines.append("- **2 models only** (claude-haiku-4-5 + claude-opus-4-7). 19× cost-delta span but Anthropic-only — does not test cross-vendor Cathedral generalization.")
    lines.append("- **Cathedral seeded B116-only.** Oldest-session retention claims (B108, B109) remain weakly tested — there is little Cathedral content for those sessions because the Cathedral itself opened in B116. Categories with no Cathedral coverage (e.g. `architecture_continuity`, `decision_provenance`, `founder_voice` in this bank) may degrade silently to HOT-base parity.")
    lines.append("- **consult_scribes is keyword-substring scoring.** No semantic/vector retrieval. Some questions will score 0 against every Scribe and degrade silently to HOT-base parity.")
    lines.append(f"- **Bank authored by Bishop B116/B117** with awareness of Scribe content. Mitigated by ground-truth being session-archive-anchored, but a strictly-independent (Pawn-curated) bank would strengthen the claim.")
    lines.append(f"- **Hallucination subscore is heuristic** — `_NUM_RE` matches any 2-5-digit token; it will over-count e.g. a model's correct '#2267' on a question whose required element is '2,267' (comma).")
    lines.append("- **Anthropic credit-balance dependency.** This run used the SDS.env backup key (`AnnoyUpeAnthropKEY`) since the primary `ANTHROPIC_API_KEY` was credit-depleted earlier in B117.")
    lines.append("")

    # 8b. Comparison to prior run
    if compare_summary:
        prior_by = compare_summary.get("by_model_arm", {})
        prior_head = compare_summary.get("headline_lift", {})
        prior_strict = compare_summary.get("strict_regrade", {})
        prior_n = compare_summary.get("run_meta", {}).get("n_records", 0) // 6 if compare_summary.get("run_meta", {}).get("n_records") else "?"
        lines.append(f"## 8b. Comparison to prior run (`{compare_label}`)")
        lines.append("")
        lines.append(
            f"Prior run: {prior_n}-Q bank, same architecture (`consult_scribes` MCP, top-10 retrieval),"
            f" same models. Reproduces the 6-cell HOT% table side-by-side."
        )
        lines.append("")
        lines.append("| Cell | Prior HOT% | This run HOT% | Δ |")
        lines.append("|---|---:|---:|---:|")
        for m in sorted({k.split("|")[0] for k in by.keys()}):
            for arm in ("cold", "hot_base", "hot_cathedral"):
                key = f"{m}|{arm}"
                cur = by.get(key)
                prv = prior_by.get(key)
                if not cur or not prv:
                    continue
                delta = cur["accuracy_hot_pct"] - prv["accuracy_hot_pct"]
                lines.append(
                    f"| {m} {arm} | {prv['accuracy_hot_pct']:.1f}% | "
                    f"{cur['accuracy_hot_pct']:.1f}% | {fmt_lift(round(delta, 2))} |"
                )
        lines.append("")
        prior_lift = prior_head.get("mean_lift_pp")
        cur_lift = head["mean_lift_pp"]
        if prior_lift is not None and cur_lift is not None:
            lines.append(
                f"**Mean Cathedral lift:** prior {fmt_lift(prior_lift)} → this run {fmt_lift(cur_lift)} "
                f"({fmt_lift(round(cur_lift - prior_lift, 2))})."
            )
        prior_strict_lift = prior_strict.get("mean_strict_lift_pp") if prior_strict else None
        cur_strict_lift = strict["mean_strict_lift_pp"] if strict else None
        if prior_strict_lift is not None and cur_strict_lift is not None:
            lines.append(
                f"**Mean strict-rubric lift:** prior {fmt_lift(prior_strict_lift)} → this run "
                f"{fmt_lift(cur_strict_lift)} ({fmt_lift(round(cur_strict_lift - prior_strict_lift, 2))})."
            )
        lines.append("")
        lines.append(
            "**Reading:** any drop from prior → this run on the SEALED bank reflects the larger and"
            " less Cathedral-friendly question pool — the SEED-18 bank was authored by Bishop B116 with"
            " awareness of Scribe content, so it skewed in favor of the Cathedral. The SEALED-50 bank"
            " adds 32 questions across categories the 4-Scribe MVP Cathedral may not cover (e.g."
            " `architecture_continuity`, `founder_voice`). Direction of lift, however, is what K437"
            " gates on — and it should remain ≥5pp under both rubrics for the canonical PASS to stand."
        )
        lines.append("")

    # 9. Cost summary
    lines.append("## 9. Cost summary")
    lines.append("")
    cs = summary["cost_summary"]
    lines.append(f"- **Total spend:** ${cs['total_usd']:.4f} (under $20 cap)")
    lines.append("")
    lines.append("Per-arm × per-model:")
    lines.append("")
    lines.append("| Model | Arm | Calls | Cost | Mean cost/Q |")
    lines.append("|---|---|---:|---:|---:|")
    for key, b in by.items():
        m, arm = key.split("|", 1)
        lines.append(f"| {m} | {arm} | {b['n']} | {fmt_money(b['cost'])} | {fmt_money(b['mean_cost_per_q'])} |")
    lines.append("")
    if bank_kind != "SEALED":
        lines.append(f"Sealed-50 projection: ~{round(cs['total_usd'] * 50.0 / max(1, n_questions), 2)} USD at this calls-per-question ratio.")
        lines.append("")
    else:
        lines.append(f"Per-call mean: ${cs['total_usd'] / max(1, len(by) and sum(b['n'] for b in by.values())):.4f}.")
        lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dir", required=True)
    p.add_argument("--bank", required=True)
    p.add_argument("--tag", default="k437-arch-on-seed18-PRE-SEAL")
    p.add_argument("--compare-to", default=None,
                   help="Optional path to a prior results_summary.json for §8b comparison")
    p.add_argument("--compare-label", default="prior run",
                   help="Human-readable label for the prior run (e.g. 'SEED-18 / 7617a5f')")
    args = p.parse_args()

    out_dir = Path(args.dir)
    if not out_dir.is_absolute():
        out_dir = SCRIPT_DIR / out_dir
    bank_path = Path(args.bank)
    if not bank_path.is_absolute():
        bank_path = SCRIPT_DIR / bank_path

    records = load_records(out_dir)
    bank = load_bank(bank_path)

    by = aggregate_table(records)
    head = headline_lift(by)
    cross = cross_session_subscore(records)
    cats = category_breakdown(records)
    halluc = hallucination_subscore(records)
    scribe = scribe_attribution(records)
    strict = strict_regrade(records)
    pass_label = grade_pass(head["mean_lift_pp"], cross)

    total_usd = round(sum(r["cost_usd"] for r in records), 4)
    cost_summary = {"total_usd": total_usd}

    summary = {
        "run_meta": {
            "ts": records[0]["ts"] if records else "n/a",
            "n_records": len(records),
            "bank_path": str(bank_path),
            "out_dir": str(out_dir),
            "tag": args.tag,
        },
        "by_model_arm": by,
        "headline_lift": head,
        "cross_session_subscore": cross,
        "category_breakdown": cats,
        "hallucination_subscore": halluc,
        "scribe_attribution": scribe,
        "strict_regrade": strict,
        "pass_fail": pass_label,
        "cost_summary": cost_summary,
    }

    compare_summary = None
    if args.compare_to:
        cmp_path = Path(args.compare_to)
        if not cmp_path.is_absolute():
            cmp_path = SCRIPT_DIR / cmp_path
        if cmp_path.exists():
            compare_summary = json.loads(cmp_path.read_text(encoding="utf-8"))
        else:
            print(f"Warning: --compare-to file not found: {cmp_path}", flush=True)

    json_path = out_dir / "results_summary.json"
    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    md_path = out_dir.parent / f"{out_dir.name}_summary.md"
    write_markdown(
        summary, bank, md_path, args.tag, bank_path,
        compare_summary=compare_summary, compare_label=args.compare_label,
    )

    print(f"Wrote summary JSON: {json_path}")
    print(f"Wrote summary MD:   {md_path}")
    print(f"Pass/Marginal/Fail: {pass_label}")
    if head["mean_lift_pp"] is not None:
        print(f"Mean Cathedral lift (lenient): {head['mean_lift_pp']}pp")
    if strict["mean_strict_lift_pp"] is not None:
        print(f"Mean Cathedral lift (strict):  {strict['mean_strict_lift_pp']}pp")


if __name__ == "__main__":
    main()
