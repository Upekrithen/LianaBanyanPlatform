import urllib.request, json, time, sys

model = sys.argv[1] if len(sys.argv) > 1 else "gemma2:2b"
q = sys.argv[2] if len(sys.argv) > 2 else "What is 2+2? One number."

print(f"Testing {model}...", flush=True)
payload = {'model': model, 'messages': [{'role': 'user', 'content': q}],
           'stream': False, 'options': {'num_predict': 30}}
t0 = time.time()
req = urllib.request.Request('http://127.0.0.1:11434/api/chat',
                              data=json.dumps(payload).encode(),
                              headers={'Content-Type': 'application/json'}, method='POST')
try:
    resp = urllib.request.urlopen(req, timeout=300)
    body = json.loads(resp.read())
    elapsed = round(time.time() - t0, 1)
    text = body.get('message', {}).get('content', '')[:60]
    print(f"OK in {elapsed}s: {text!r}", flush=True)
except Exception as exc:
    print(f"ERR after {round(time.time()-t0,1)}s: {exc}", flush=True)
