import json
from pathlib import Path

f = Path("results_r11v2_K528/perplexity_spaces.jsonl")
lines = [l for l in f.read_text(encoding="utf-8").splitlines() if l.strip()]
records = [json.loads(l) for l in lines]
graded = [r for r in records if "error" not in r]
errored = [r for r in records if "error" in r]
print(f"Total lines: {len(lines)}")
print(f"Graded: {len(graded)}")
print(f"Errored: {len(errored)}")
if graded:
    print(f"Last graded qid: {graded[-1]['qid']}")
if errored:
    print(f"Error sample: {errored[0]['error'][:200]}")
