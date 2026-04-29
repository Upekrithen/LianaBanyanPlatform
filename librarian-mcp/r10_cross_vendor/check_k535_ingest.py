"""
check_k535_ingest.py — Verify K535 rich-fact ingest, find outliers
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp")
SCRIBE_PATH = REPO / "stitchpunks" / "scribes" / "scribe_R11.jsonl"

facts = []
with open(SCRIBE_PATH, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        rec = json.loads(line)
        fid = rec.get('fact_id', '')
        if re.match(r'^(CS|AM|EG|MJ|RC|HP)-\d{2}$', str(fid)):
            tok = len(rec.get('observation','').split())
            facts.append((fid, tok, rec.get('observation', '')))

facts.sort(key=lambda x: x[1], reverse=True)

print(f"Total R11 facts: {len(facts)}")
print(f"Top 10 by token count:")
for fid, tok, obs in facts[:10]:
    prefix = obs[:100].replace('\n', ' ')
    print(f"  {fid}: {tok} tokens | {prefix}...")

print(f"\nBottom 5 by token count:")
for fid, tok, obs in facts[-5:]:
    prefix = obs[:100].replace('\n', ' ')
    print(f"  {fid}: {tok} tokens | {prefix}...")

# Show HP facts specifically
print("\n--- HP facts token counts ---")
hp_facts = [(fid, tok, obs) for fid, tok, obs in facts if fid.startswith('HP')]
hp_facts.sort(key=lambda x: int(x[0].split('-')[1]))
for fid, tok, obs in hp_facts:
    print(f"  {fid}: {tok} tokens")
    if tok > 500:
        # Show what the observation looks like
        print(f"    First 300: {obs[:300].replace(chr(10), ' ')}")
        print(f"    Last 200: {obs[-200:].replace(chr(10), ' ')}")
