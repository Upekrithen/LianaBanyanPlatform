"""
debug_rc_hp_observations.py — K535 diagnostic: examine what haiku SEES for RC/HP
Dumps the current rich-fact observations for RC-01..05 and HP-01..05
to understand why RC/HP regressed despite rich-fact ingestion.
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp")
SCRIBE_PATH = REPO / "stitchpunks" / "scribes" / "scribe_R11.jsonl"

facts = {}
with open(SCRIBE_PATH, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        rec = json.loads(line)
        fid = rec.get('fact_id', '')
        if fid:
            facts[fid] = rec

print("=" * 70)
print("K535 Diagnostic: Full RC and HP Observations")
print("=" * 70)

for cat in ['RC', 'HP']:
    print(f"\n{'='*70}")
    print(f"CATEGORY: {cat}")
    print(f"{'='*70}")

    for i in range(1, 8):
        fid = f"{cat}-{str(i).zfill(2)}"
        if fid not in facts:
            print(f"\n{fid}: NOT FOUND")
            continue
        obs = facts[fid].get('observation', '')
        print(f"\n{'─'*60}")
        print(f"{fid} ({len(obs.split())} tokens):")
        print(obs)
