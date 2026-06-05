#!/usr/bin/env python3
"""BP074 full 20-question Bank-B mesh regression -- emit to M2, fetch via M1 federation."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from run_mesh_test import BANK_B_QUESTIONS, _http_request, substrate_emit, substrate_fetch_from_peer
import json, time

M2_HOST = '192.168.86.30'
M2_SUBSTRATE = 11480
M2_FEDERATION = 11481
M1_SUBSTRATE_HOST = '127.0.0.1'
M1_SUBSTRATE = 11480

print(f'BP074 Mesh Regression -- 20-question Bank-B -- v0.1.25')
print(f'M2: {M2_HOST}:{M2_FEDERATION} (federation) / {M2_SUBSTRATE} (substrate)')
print(f'M1 local substrate: {M1_SUBSTRATE_HOST}:{M1_SUBSTRATE}')
print()

# Verify M2 substrate health
resp = _http_request(M2_HOST, M2_SUBSTRATE, 'GET', '/health', timeout=5.0)
if resp['status'] == 200:
    h = json.loads(resp['body'])
    print(f'M2 health: version={h.get("version")} index_size={h.get("index_size")}')
else:
    print(f'M2 health FAILED: {resp["status"]} -- aborting')
    sys.exit(1)

# Verify M1 local substrate health
resp2 = _http_request(M1_SUBSTRATE_HOST, M1_SUBSTRATE, 'GET', '/health', timeout=5.0)
if resp2['status'] == 200:
    h2 = json.loads(resp2['body'])
    print(f'M1 health: version={h2.get("version")} index_size={h2.get("index_size")}')
else:
    print(f'M1 local substrate FAILED: {resp2["status"]} -- aborting')
    sys.exit(1)

print()
print('Phase 1: Emitting 20 Bank-B questions to M2...')
sids = {}
emitted = 0
for q in BANK_B_QUESTIONS:
    q_id = q['id']
    pearls = q.get('pearls') or [q.get('canonical_answer', '')]
    faces = {'0': q.get('question', '')[:200], '1': q_id, '2': 'B'}
    sid = substrate_emit(M2_HOST, M2_SUBSTRATE, pearls, {}, faces)
    if sid:
        sids[q_id] = sid
        emitted += 1
        print(f'  Emitted {q_id} -> SID {sid}')
    else:
        print(f'  FAILED to emit {q_id}')

print(f'\nEmitted: {emitted}/20')
print()

print('Phase 2: M1 fetching all 20 from M2 via federation (TCP {M2_HOST}:{M2_FEDERATION})...')
hash_verified_count = 0
results = []
for q in BANK_B_QUESTIONS:
    q_id = q['id']
    sid = sids.get(q_id)
    if not sid:
        results.append({'q_id': q_id, 'ok': False, 'hash_verified': False, 'reason': 'no SID'})
        continue
    fetch = substrate_fetch_from_peer(M1_SUBSTRATE_HOST, M1_SUBSTRATE, M2_HOST, M2_FEDERATION, sid, timeout=15.0)
    hv = fetch.get('hash_verified', False)
    ok = fetch.get('ok', False)
    if hv:
        hash_verified_count += 1
    results.append({'q_id': q_id, 'sid': sid, 'ok': ok, 'hash_verified': hv, 'latency_ms': fetch.get('_latency_ms')})
    status = 'HV_PASS' if hv else 'FAIL'
    lat = f"{fetch.get('_latency_ms', 0):.0f}ms"
    print(f'  {q_id}: {status} | hash_verified={hv} | {lat}')

print()
print(f'RESULT: {hash_verified_count}/20 hash-verified')
print(f'Probe pearl SID (from earlier probe): 9617f325f839d12a35ab34a5a547e96a')
print(f'M2 IP: {M2_HOST} (was 192.168.86.45 at BP067)')
