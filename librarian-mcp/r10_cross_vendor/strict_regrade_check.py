"""Sanity-check: does dropping HOT records that contain explicit refusal
phrases ('I don't know', 'I cannot find') change the PASS verdict?
Symmetric across HOT-base and HOT-cathedral, so lift should remain meaningful.
"""
import json
import re
from pathlib import Path

DIR = Path(__file__).resolve().parent / "results_scev1_b116_k437_seed18"
files = [
    "claude-haiku-4-5-20251001_hot_base.jsonl",
    "claude-haiku-4-5-20251001_hot_cathedral.jsonl",
    "claude-opus-4-7_hot_base.jsonl",
    "claude-opus-4-7_hot_cathedral.jsonl",
]
refusal_re = re.compile(r"\bi (do not|don't) know\b|\bcannot (find|locate|verify|identify|determine)\b", re.I)


def load(p):
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip() and '"grade"' in l]


print(f"{'model':42} {'arm':15}  HOT  HIT  MISS  | strict_HOT  delta")
strict_table = {}
for fn in files:
    recs = load(DIR / fn)
    model = recs[0]["model"]; arm = recs[0]["arm"]
    h = sum(1 for r in recs if r["grade"] == "HOT")
    hi = sum(1 for r in recs if r["grade"] == "HIT")
    m = sum(1 for r in recs if r["grade"] == "MISS")
    sh = sum(1 for r in recs if r["grade"] == "HOT" and not refusal_re.search(r.get("response_text") or ""))
    strict_table[(model, arm)] = sh
    n = len(recs)
    print(f"{model:42} {arm:15}  {h:3}  {hi:3}  {m:4}  | {sh:9}    {sh-h:+d}    (strict HOT% = {100*sh/n:.1f}%)")

print()
print("Strict-rubric lift (HOT-cathedral - HOT-base):")
for model in {k[0] for k in strict_table}:
    base = strict_table[(model, "hot_base")]
    cath = strict_table[(model, "hot_cathedral")]
    base_pct = 100 * base / 18
    cath_pct = 100 * cath / 18
    print(f"  {model}: HOT-base {base_pct:.1f}% -> Cathedral {cath_pct:.1f}%  ({cath_pct-base_pct:+.1f}pp)")
