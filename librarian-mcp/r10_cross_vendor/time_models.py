import urllib.request, json, time

models = ['llama3.1:8b-instruct-q4_K_M', 'qwen2.5:7b', 'mistral:7b']
for model in models:
    t0 = time.time()
    try:
        payload = {'model': model, 'messages': [{'role': 'user', 'content': 'What is 2+2? One number only.'}],
                   'stream': False, 'options': {'num_predict': 20}}
        req = urllib.request.Request(
            'http://127.0.0.1:11434/api/chat',
            data=json.dumps(payload).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        resp = urllib.request.urlopen(req, timeout=120)
        body = json.loads(resp.read())
        elapsed = round(time.time() - t0, 1)
        text = body.get('message', {}).get('content', '')[:40]
        print(f"OK  {model}: {elapsed}s -- {text!r}")
    except Exception as exc:
        elapsed = round(time.time() - t0, 1)
        print(f"ERR {model}: {elapsed}s -- {exc}")
