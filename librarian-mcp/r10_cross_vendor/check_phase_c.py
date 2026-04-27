import json
from pathlib import Path

for f in sorted(Path("results_r11v2_K528").glob("lb_cathedral*.jsonl")):
    recs = [json.loads(l) for l in f.read_text("utf-8").splitlines() if l.strip()]
    graded = [r for r in recs if "grade" in r]
    hot = sum(1 for r in graded if r.get("grade") == "HOT")
    pct = f"{100*hot/len(graded):.1f}%" if graded else "N/A"
    total_cost = sum(r.get("cost_usd", 0) for r in graded)
    print(f"{f.name}: {len(graded)}/200 graded, {hot} HOT ({pct}), ${total_cost:.3f}")
