# ROUND-UP SMOKE RE-FIRE · BP092 · Full 5-peer fleet · Public Alpha
# Paste each section in order. Native PowerShell (Start Menu → Windows PowerShell, NOT Cursor).

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Pre-warm M0 llama3.3:70b
#           Founder waits 5-15 min for first JSON response on cold load.
#           Do NOT proceed to STEP 2 until this returns.
# ─────────────────────────────────────────────────────────────────────────────
$body = '{"model":"llama3.3:70b","prompt":"hi","stream":false,"keep_alive":"30m"}'
$body | Out-File -FilePath "$env:TEMP\ollama-warm.json" -Encoding ascii -NoNewline
curl.exe --max-time 900 http://192.168.86.30:11434/api/generate -d "@$env:TEMP\ollama-warm.json"

# When STEP 1 returns a JSON response, M0 has llama3.3:70b hot for 30 min.
# Verify model is loaded before continuing:
curl.exe -s http://192.168.86.30:11434/api/ps

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — Fire Round-Up smoke
#           3 Qs against V060 receipt · ~3-10 min with hot 70B
#           (5-15 sec decompose + ~15-30 sec swarm per peer + aggregation)
# ─────────────────────────────────────────────────────────────────────────────
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
node round_up_sweep.mjs --receipt="C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\VALIDATION_RUN_RECEIPT_RELAY_2026-06-22T12-45-51.json" --tier-config="ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" --timeout=180 --max-misses=3 --session="ROUNDUP_FULL_FLEET_WARM_3Q" --tier2-budget=0

# Expected output: per-Q decompose + swarm lines, then a summary receipt JSON.
# Total ~5-10 min for 3 Qs.

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Self-check (optional; Bishop will gadget automatically)
#           Paste to confirm rows landed in DB:
# ─────────────────────────────────────────────────────────────────────────────
# (Bishop gadgets posse_sub_claims + posse_swarm_runs + receipt JSON as Founder runs.)
# Founder can also check the receipt JSON written to:
#   C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\
#   (look for ROUNDUP_FULL_FLEET_WARM_3Q_*.json)
