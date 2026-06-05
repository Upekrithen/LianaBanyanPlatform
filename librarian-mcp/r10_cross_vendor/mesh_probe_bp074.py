#!/usr/bin/env python3
"""BP074 live mesh regression probe -- emit to M2, fetch via M1 federation."""
import socket, json, time

def http_req(host, port, method, path, body=None, timeout=10.0):
    s = socket.socket()
    s.settimeout(timeout)
    try:
        s.connect((host, port))
        hdr = f'{method} {path} HTTP/1.0\r\nHost: {host}\r\n'
        if body:
            hdr += f'Content-Type: application/json\r\nContent-Length: {len(body.encode())}\r\n'
        hdr += '\r\n'
        s.sendall(hdr.encode() + (body.encode() if body else b''))
        data = b''
        while True:
            chunk = s.recv(65536)
            if not chunk:
                break
            data += chunk
    finally:
        s.close()
    raw = data.decode('utf-8', errors='replace')
    if '\r\n\r\n' in raw:
        _, body_part = raw.split('\r\n\r\n', 1)
    else:
        body_part = raw
    lines = raw.split('\r\n')
    parts = lines[0].split(' ', 2) if lines else []
    status = int(parts[1]) if len(parts) >= 2 and parts[1].isdigit() else 0
    return status, body_part

# Step 1: Emit test pearl to M2 substrate
print('Step 1: Emitting test pearl to M2 (192.168.86.30:11480)...')
payload = json.dumps({
    'pearls': ['mesh_regression_BP074_v0125', '20240604_knight_probe'],
    'bindings': {'scope': 'BP074_regression'},
    'faces': {}
})
status, body = http_req('192.168.86.30', 11480, 'POST', '/dag/emit', payload)
print(f'  Emit status: {status}')
print(f'  Body: {body[:300]}')

if status == 200:
    data = json.loads(body)
    sid = data.get('sid') or data.get('dag_id')
    print(f'  SID on M2: {sid}')

    time.sleep(0.5)
    print('Step 2: M1 fetching from M2 via federation port 11481...')
    fetch_payload = json.dumps({'address': '192.168.86.30', 'port': 11481, 'dag_id': sid})
    s2, b2 = http_req('127.0.0.1', 11480, 'POST', '/dag/fetch_from_peer', fetch_payload, timeout=15.0)
    print(f'  Fetch status: {s2}')
    print(f'  Fetch body: {b2[:500]}')
    if s2 == 200:
        r = json.loads(b2)
        print(f'  ok: {r.get("ok")}')
        print(f'  hash_verified: {r.get("hash_verified")}')
        if r.get('hash_verified'):
            print('PROBE RESULT: hash_verified=True -- MESH LINK LIVE')
        else:
            print('PROBE RESULT: hash_verified=False or missing')
    else:
        print(f'PROBE RESULT: fetch failed with status {s2}')
else:
    print(f'PROBE RESULT: M2 emit failed with status {status}')
