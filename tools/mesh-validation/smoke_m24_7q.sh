#!/usr/bin/env bash
# BP092 M24 Block 5 -- 7Q smoke sweep with all power wired
# One question per difficulty tier: math (HARD), chemistry (HARD), engineering (HARD),
# biology (MEDIUM), law (MEDIUM), history (SHORT), other (SHORT)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.."

echo "=== M24 SMOKE · 7Q · ALL POWER WIRED ==="
node tools/mesh-validation/validate-relay.mjs \
  --questions=7 \
  --mode=smoke \
  --routing=tier-aware \
  --andon-escalate=star-chamber \
  --plow=mesh-12-blade \
  --tier2-flagship=true \
  --andon-threshold=15 \
  --timeout=300 \
  --session=M24_SMOKE_7Q_$(date +%Y%m%dT%H%M%S)

echo "=== SMOKE COMPLETE -- check receipt for posse + tier2 fields ==="
