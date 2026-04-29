import sys, json
sys.stdout.reconfigure(encoding='utf-8')

SCRIBE = r'C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\stitchpunks\scribes\scribe_R11.jsonl'

with open(SCRIBE) as f:
    rows = [json.loads(l) for l in f if l.strip()]

rows_with_facts = [r for r in rows if r.get('fact_id')]

total_chars = sum(len(r.get('observation', '')) for r in rows_with_facts)
print(f"Total facts: {len(rows_with_facts)}")
print(f"Total observation chars: {total_chars}")
print(f"Rough token estimate: {total_chars // 4}")
print()

# Print each fact with index, fact_id, and observation char count
cumulative = 0
for i, r in enumerate(rows_with_facts):
    fid = r['fact_id']
    obs = r.get('observation', '')
    obs_chars = len(obs)
    cumulative += obs_chars
    print(f"{i:3d} {fid:8s}  obs_chars={obs_chars:5d}  cumulative={cumulative:6d} (~{cumulative//4} tokens)")
