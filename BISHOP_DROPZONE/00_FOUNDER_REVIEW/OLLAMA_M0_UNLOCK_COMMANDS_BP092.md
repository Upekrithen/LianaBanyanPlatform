# OLLAMA M0 UNLOCK — FOUNDER PASTE-READY COMMANDS
## BP092 · Bishop SEG · 2026-06-23

---

## ROOT-CAUSE DIAGNOSIS

### WHERE the 24h keep_alive originates — ALL four sites confirmed:

**Site 1 — index.ts line 5621 — PLOW COUNCIL loop (primary culprit)**
```
COUNCIL_MODELS = ['gemma4:12b', 'llama3.1:8b', 'mistral:7b']
```
Every Plow Loop iteration fires `keep_alive: '24h'` against all three council members simultaneously.
`gemma4:12b` is always first in the array. Each call resets its 24h clock.

**Site 2 — index.ts line 5671 — Baseline single-shot path**
```
const model = isTiebreaker ? tiebreakerModel : 'gemma4:12b';
body: JSON.stringify({ model, prompt, stream: false, keep_alive: '24h' })
```
Hardcoded `gemma4:12b` with `keep_alive: '24h'` on non-plow path.

**Site 3 — index.ts lines 5899-5902 — fleet_warmup MIC broadcast handler**
```
case 'fleet_warmup':
  const warmModel = (payload.payload_json?.model as string) || 'gemma4:12b';
  keep_alive: '24h'
```
Default falls back to `gemma4:12b` if payload doesn't specify model. Any fleet_warmup
broadcast without explicit model= locks gemma4 for 24h.

**Site 4 — dr_m_orchestrator/plow/domain_classifier.ts lines 16 + 85 + 135**
```
const CLASSIFIER_KEEP_ALIVE = '24h';
```
Domain classifier uses qwen2.5:0.5b (primary) / gemma2:2b (fallback) — NOT gemma4.
This is NOT the gemma4 locking source, but it locks smaller models for 24h too.
Low-priority fix.

### CONFIRMED: No pre-warm at startup
`ram_detector.ts` and `model_picker.ts` do NOT call Ollama at boot. They detect hardware
and read/write config. No `keep_alive` parameter in either file. The lock is runtime-only.

### enforcement_council.ts line 277 — `keepWarm()` is a STUB
Comment says "M4 wires ollama keep-alive on gemma4:12b" but the method body is EMPTY.
Not contributing to the lock.

---

## GADGET 3 — llama3.3:70b STATUS on M0

**CONFIRMED INSTALLED.** Live response from http://192.168.86.30:11434/api/tags:

```
llama3.3:70b                    ← CONFIRMED
llama3.3:70b-instruct-q4_K_M   ← ALSO PRESENT
gemma4:12b
qwen2.5:0.5b
gemma2:2b
qwen2.5:7b
mistral:7b
llama3.1:8b-instruct-q4_K_M
```

Both llama3.3:70b AND llama3.3:70b-instruct-q4_K_M are installed. No pull needed.

**Current /api/ps state at time of SEG:** `{"models":[]}` — Ollama is idle right now.
gemma4 will reload as soon as any Plow/council/fleet_warmup call fires.

---

## GADGET 4 — posse_decompose model targeting

`posse_decompose.ts` function signature:
```typescript
ollamaModel = 'llama3.3:70b'   // default parameter, line 40
```

posse_decompose does NOT hardcode gemma4. It defaults to `llama3.3:70b` and calls
Ollama direct with NO `keep_alive` parameter — it will inherit Ollama's service default
(currently unlimited / until evicted). This is correct behavior. No bug here.

The relay fallback path also targets llama3.3:70b via the ULTRA peer.

---

## ENVIRONMENT VARIABLES — M0 current state

No `OLLAMA_KEEP_ALIVE` or `OLLAMA_MAX_LOADED_MODELS` set at Machine or User scope.
Ollama is running with default behavior: models stay loaded indefinitely once warmed
(Ollama's built-in default is 5 minutes, BUT any explicit `keep_alive: '24h'` in a
request overrides the default for that model for 24 hours).

---

## PASTE-READY COMMANDS

### CMD 1 — Confirm llama3.3:70b installed (FREE, ~1s):
```powershell
curl.exe -s http://192.168.86.30:11434/api/tags | python3 -c "import sys,json; d=json.load(sys.stdin); [print(m['name']) for m in d.get('models',[])]"
```
Expected: `llama3.3:70b` appears in output. It does — already confirmed.

### CMD 2 — Show ALL installed models on M0 (FREE):
```powershell
curl.exe -s http://192.168.86.30:11434/api/tags
```

### CMD 3 — Force-evict gemma4:12b NOW (FREE, ~2s):
```powershell
$body = '{"model":"gemma4:12b","prompt":"x","keep_alive":0,"stream":false}'
$body | Out-File -FilePath "$env:TEMP\ollama-evict.json" -Encoding ascii -NoNewline
curl.exe --max-time 30 http://192.168.86.30:11434/api/generate -d "@$env:TEMP\ollama-evict.json"
```
`keep_alive: 0` tells Ollama to unload immediately after the call. Model releases VRAM/RAM.

### CMD 4 — Force-load llama3.3:70b with explicit keep_alive (FREE, cold load ~5-15 min):
```powershell
$body = '{"model":"llama3.3:70b","prompt":"warm","stream":false,"keep_alive":"6h"}'
$body | Out-File -FilePath "$env:TEMP\ollama-warm.json" -Encoding ascii -NoNewline
curl.exe --max-time 1800 http://192.168.86.30:11434/api/generate -d "@$env:TEMP\ollama-warm.json"
```
6h keep_alive keeps llama3.3:70b hot. Reduces to 6h so it doesn't block forever.
Use `"keep_alive":"24h"` if you want full session parity with gemma4 behavior.

### CMD 5 — PERMANENT FIX — cap loaded models + shorten default keep_alive (run as Administrator):
```powershell
# Run PowerShell as Administrator, then:
[Environment]::SetEnvironmentVariable("OLLAMA_MAX_LOADED_MODELS", "1", "Machine")
[Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "30m", "Machine")
# Then restart Ollama:
Restart-Service Ollama -Force
```

**Effect of CMD 5:**
- `OLLAMA_MAX_LOADED_MODELS=1` → Ollama evicts whichever model is loaded when a NEW model
  is requested. llama3.3:70b load → gemma4 evicts automatically. No manual evict needed.
- `OLLAMA_KEEP_ALIVE=30m` → SERVICE-LEVEL default drops to 30 minutes. BUT: any explicit
  `keep_alive: '24h'` in a request OVERRIDES this. The Plow Loop and fleet_warmup calls
  in index.ts still send `keep_alive: '24h'` explicitly.

**IMPORTANT:** CMD 5 alone does NOT fully solve the problem. The explicit `keep_alive: '24h'`
strings in index.ts will override the Machine env var. See KNIGHT PATCH below.

---

## RECOMMENDED PERMANENT FIX — TWO-LAYER

**Layer 1 (immediate, no code change):** Run CMD 5 above. Sets max 1 loaded model so
llama3.3:70b automatically displaces gemma4 when requested.

**Layer 2 (Knight M25 code patch — recommended):**

Knight should patch `index.ts` at FOUR sites to replace `keep_alive: '24h'` with
`keep_alive: '2h'` or `keep_alive: '30m'` (matching Founder's intent that llama3.3:70b
should be available for ULTRA-class reasoning without gemma4 squatting):

1. Line 5621 — COUNCIL_MODELS Plow loop: change `'24h'` → `'30m'`
2. Line 5671 — Baseline single-shot: change `'24h'` → `'30m'`
3. Lines 5899-5913 — fleet_warmup: change `'24h'` → `'2h'` (warmup intent, but shorter)
4. domain_classifier.ts line 16 — `CLASSIFIER_KEEP_ALIVE = '24h'` → `'30m'`

**OPTIONAL: Override model for fleet_warmup default fallback (index.ts line 5883):**
```typescript
const warmModel = (payload.payload_json?.model as string) || 'llama3.3:70b';
```
Change default from `'gemma4:12b'` to `'llama3.3:70b'` so fleet_warmup without explicit
model= warms llama3.3:70b instead.

---

## POSSE_DECOMPOSE STATUS

No bug. `posse_decompose.ts` correctly targets `llama3.3:70b` (default parameter, line 40).
No `keep_alive` in its Ollama calls — uses Ollama service default. No patch needed.

---

## SUMMARY TABLE

| Source | File | Line | Model | keep_alive | Fix needed? |
|--------|------|------|-------|-----------|-------------|
| Plow council | index.ts | 5621 | gemma4:12b (in COUNCIL_MODELS[0]) | 24h | YES — shorten |
| Baseline path | index.ts | 5671 | gemma4:12b (hardcoded) | 24h | YES — shorten |
| fleet_warmup | index.ts | 5902 | gemma4:12b (default fallback) | 24h | YES — shorten + change default |
| Domain classifier | domain_classifier.ts | 16 | qwen2.5:0.5b / gemma2:2b | 24h | LOW priority |
| posse_decompose | posse_decompose.ts | 40 | llama3.3:70b | none (service default) | CLEAN — no fix |
| enforcement_council | enforcement_council.ts | 277 | gemma4:12b (comment only) | stub | STUB — not active |

---

BP092 · Bishop SEG · Sonnet 4.6 · §14 BLOOD empirical-only · §17 substrate-gadgets-first
