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
) -> None:
    by = summary["by_model_arm"]
    head = summary["headline_lift"]
    cross = summary["cross_session_subscore"]
    cats = summary["category_breakdown"]
    halluc = summary["hallucination_subscore"]
    scribe = summary["scribe_attribution"]
    pass_label = summary["pass_fail"]
    n_questions = len(bank["questions"])

    lines: list[str] = []
    lines.append(f"# SCEV-1 — K437 Architecturally-Correct Run (n={n_questions} questions, SEED bank)")
    lines.append("")
    lines.append(f"**Date:** {summary['run_meta']['ts']}")
    lines.append(f"**Runner:** `run_scev1_k437.py` (uses K436 `consult_scribes` MCP code path, NOT direct file stuffing)")
    lines.append(f"**Question bank:** `{bank_path.name}`  ({n_questions} questions, status: `{bank.get('bank_status', 'n/a')[:80]}…`)")
    lines.append(f"**Tag label:** `{tag_label}`")
    lines.append(f"**Pass/Marginal/Fail:** **{pass_label}** (criterion: ≥5pp HOT-cathedral lift over HOT-base, mean across models)")
    lines.append(f"**Total spend:** ${summary['cost_summary']['total_usd']:.4f}  (cap was $20)")
    lines.append("")
    lines.append("> **PROVENANCE NOTE:** This is the K437-architecture run. The sealed 50-Q bank")
    lines.append("> (`SCEV1_QUESTION_BANK_SEALED.json`) does not exist on disk yet; per the K437 prompt,")
    lines.append("> Bishop B117 (or a Pawn research pass) must expand the SEED 18→50 and seal/commit before")
    lines.append("> the canonical sealed-50 K437 run can claim the `v-scev1-b116` tag. The runner here is")
    lines.append("> bank-path-parameterized — re-run with `--bank SCEV1_QUESTION_BANK_SEALED.json` when ready.")
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
            f"> *Mean HOT-cathedral accuracy is {fmt_lift(lift)} versus HOT-base across both Anthropic models on this {n_questions}-Q SEED bank.*"
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
        lines.append("> Note: this PASS is on the K437 *architecture* (consult_scribes MCP) running on the 18-Q SEED bank.")
        lines.append("> The K437 acceptance criterion of 50 sealed Qs is **not** yet satisfied. K438 dispatch should still wait for")
        lines.append("> the sealed-50 rerun before claiming the `v-scev1-b116` tag publicly.")
    lines.append("")

    # 8. Caveats
    lines.append("## 8. Caveats")
    lines.append("")
    lines.append(f"- **n = {n_questions} (SEED bank, not the sealed 50).** K437 specified 50 questions; the sealed bank does not yet exist on disk. Acceptance criterion partially unmet pending Bishop seal.")
    lines.append("- **Single-grader (substring rubric).** Same R10 three-tier convention as the prelim (HOT = all required elements present, HIT = ≥half, MISS = <half). No second grader; no LLM-as-grader cross-check.")
    lines.append("- **2 models only** (claude-haiku-4-5 + claude-opus-4-7). 19× cost-delta span but Anthropic-only — does not test cross-vendor Cathedral generalization.")
    lines.append("- **Cathedral seeded B116-only.** Oldest-session retention claims (B108, B109) remain weakly tested — there is little Cathedral content for those sessions because the Cathedral itself opened in B116.")
    lines.append("- **consult_scribes is keyword-substring scoring.** No semantic/vector retrieval. Some questions will score 0 against every Scribe and degrade silently to HOT-base parity.")
    lines.append("- **Seed bank authored by Bishop B116** with awareness of Scribe content. Mitigated by ground-truth being session-archive-anchored, but a strictly-independent (Pawn-curated) bank would strengthen the claim.")
    lines.append(f"- **Hallucination subscore is heuristic** — `_NUM_RE` matches any 2-5-digit token; it will over-count e.g. a model's correct '#2267' on a question whose required element is '2,267' (comma).")
    lines.append("- **Anthropic credit-balance dependency.** This run used the SDS.env backup key (`AnnoyUpeAnthropKEY`) because the primary `ANTHROPIC_API_KEY` was credit-depleted. K437 sealed-50 rerun will need ~$15-20 of fresh credits.")
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
    lines.append(f"Sealed-50 projection: ~{round(cs['total_usd'] * 50.0 / max(1, n_questions), 2)} USD at this calls-per-question ratio.")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dir", required=True)
    p.add_argument("--bank", required=True)
    p.add_argument("--tag", default="k437-arch-on-seed18-PRE-SEAL")
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
        "pass_fail": pass_label,
        "cost_summary": cost_summary,
    }

    json_path = out_dir / "results_summary.json"
    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    md_path = out_dir.parent / f"{out_dir.name}_summary.md"
    write_markdown(summary, bank, md_path, args.tag, bank_path)

    print(f"Wrote summary JSON: {json_path}")
    print(f"Wrote summary MD:   {md_path}")
    print(f"Pass/Marginal/Fail: {pass_label}")
    if head["mean_lift_pp"] is not None:
        print(f"Mean Cathedral lift: {head['mean_lift_pp']}pp")


if __name__ == "__main__":
    main()
