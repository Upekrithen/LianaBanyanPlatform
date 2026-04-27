import json
from pathlib import Path

out_dir = Path("results_r11v2_K528")

for f in sorted(out_dir.glob("*.jsonl")):
    lines = [l for l in f.read_text("utf-8").splitlines() if l.strip()]
    recs = []
    for l in lines:
        try:
            recs.append(json.loads(l))
        except Exception:
            pass

    graded = [r for r in recs if "grade" in r]
    errored = [r for r in recs if "error" in r]
    hot = sum(1 for r in graded if r.get("grade") == "HOT")
    hit = sum(1 for r in graded if r.get("grade") == "HIT")
    miss = sum(1 for r in graded if r.get("grade") == "MISS")
    total_cost = sum(r.get("cost_usd", 0) for r in graded)
    pct = f"{100*hot/len(graded):.1f}%" if graded else "N/A"
    status = "COMPLETE" if len(graded) >= 200 else f"partial {len(graded)}/200"
    print(f"{f.stem:<40} {status:<20} HOT={pct:<8} cost=${total_cost:.3f}  errs={len(errored)}")
