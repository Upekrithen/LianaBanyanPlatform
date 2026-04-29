#!/usr/bin/env bash
# =============================================================================
# Liana Banyan Platform — Post-Deploy Health Check
# Run from platform/: bash scripts/health-check.sh
# Exit 0 = all pass, Exit 1 = at least one failure
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$PLATFORM_DIR/src"

PASS=0
FAIL=0
TOTAL=0

check() {
  local label="$1"
  local result="$2"  # "pass" or "fail"
  local detail="${3:-}"
  TOTAL=$((TOTAL + 1))
  if [[ "$result" == "pass" ]]; then
    PASS=$((PASS + 1))
    echo "[PASS] $label"
  else
    FAIL=$((FAIL + 1))
    echo "[FAIL] $label"
    if [[ -n "$detail" ]]; then
      echo "       $detail"
    fi
  fi
}

echo "============================================"
echo " Liana Banyan Platform Health Check"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo " Source: $SRC_DIR"
echo "============================================"
echo ""

# ─── 1. STALE STATS CHECK ───────────────────────────────────────────────────

echo "--- Stale Stats Check ---"

# Thresholds tightened B134 2026-04-29 to canonical floor per canonical_values.yaml.
# Source: librarian-mcp/canonical_values.yaml — innovation_count: 2270 / crown_jewels: 228 / formal_claims_approximate: 2506 / production_systems: 36 / patent_provisionals_filed: 15

# 1a. "2,007" anywhere in src/ (canonical: 2,270)
hits=$(grep -rn '"2,007"\|2,007 \|2007 innovation' "$SRC_DIR" 2>/dev/null || true)
if [[ -z "$hits" ]]; then
  check "No stale '2,007' innovation count" "pass"
else
  check "No stale '2,007' innovation count" "fail" "Found in: $(echo "$hits" | head -3)"
fi

# 1b. "1,511" in src/ (canonical: 2,506)
hits=$(grep -rn '1,511\|1511 ' "$SRC_DIR" 2>/dev/null || true)
if [[ -z "$hits" ]]; then
  check "No stale '1,511' formal claims count" "pass"
else
  check "No stale '1,511' formal claims count" "fail" "Found in: $(echo "$hits" | head -3)"
fi

# 1c. stale provisional counts 10-14 (canonical: 15 — Prov 14 + 15 USPTO-filed 2026-04-29)
hits=$(grep -rnE '\b1[0-4] provisional\b|\b1[0-4] USPTO\b' "$SRC_DIR" 2>/dev/null || true)
if [[ -z "$hits" ]]; then
  check "No stale '10-14 provisional/USPTO' counts (canonical: 15)" "pass"
else
  check "No stale '10-14 provisional/USPTO' counts (canonical: 15)" "fail" "Found in: $(echo "$hits" | head -3)"
fi

# 1d. crownJewels total count less than 228 (canonical floor)
#     Only match the canonical/fallback definitions, not per-item crownJewel fields
hits=$(grep -rnoP '(?i)(crown.?jewel_count|crown.?jewels|CROWN_JEWELS)\s*[:=]\s*(\d+)' "$SRC_DIR" 2>/dev/null | grep -v 'crownJewel:' | grep -v 'is_crown_jewel' || true)
stale_cj=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  num=$(echo "$line" | grep -oP '\d+$')
  if [[ -n "$num" && "$num" -lt 228 && "$num" -gt 10 ]]; then
    stale_cj="$stale_cj$line"$'\n'
  fi
done <<< "$hits"
if [[ -z "$stale_cj" ]]; then
  check "Crown Jewels count >= 228 everywhere" "pass"
else
  check "Crown Jewels count >= 228 everywhere" "fail" "Stale values: $(echo "$stale_cj" | head -3)"
fi

# 1e. productionSystems values less than 36 (canonical)
hits=$(grep -rnoP '(?i)production.?systems?\s*[:=]\s*(\d+)' "$SRC_DIR" 2>/dev/null || true)
stale_ps=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  num=$(echo "$line" | grep -oP '\d+$')
  if [[ -n "$num" && "$num" -lt 36 ]]; then
    stale_ps="$stale_ps$line"$'\n'
  fi
done <<< "$hits"
if [[ -z "$stale_ps" ]]; then
  check "Production Systems count >= 36 everywhere" "pass"
else
  check "Production Systems count >= 36 everywhere" "fail" "Stale values: $(echo "$stale_ps" | head -3)"
fi

# 1f. innovationCount total fallbacks less than 2270 (canonical floor)
#     Only match canonical/fallback totals, not per-bucket innovationsCount
hits=$(grep -rnoP '(?i)(innovation_count|innovationCount|INNOVATIONS)\s*[:=]\s*["\x27]?(\d+)' "$SRC_DIR" 2>/dev/null | grep -v 'innovationsCount' || true)
stale_ic=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  num=$(echo "$line" | grep -oP '\d+$')
  if [[ -n "$num" && "$num" -lt 2270 && "$num" -gt 1000 ]]; then
    stale_ic="$stale_ic$line"$'\n'
  fi
done <<< "$hits"
if [[ -z "$stale_ic" ]]; then
  check "Innovation count fallbacks >= 2270 everywhere" "pass"
else
  check "Innovation count fallbacks >= 2270 everywhere" "fail" "Stale values: $(echo "$stale_ic" | head -3)"
fi

# 1g. formal claims count >= 2506 (canonical floor)
hits=$(grep -rnoP '(?i)(patent_claims|formal_claims|formalClaims)\s*[:=]\s*["\x27]?(\d+)' "$SRC_DIR" 2>/dev/null || true)
stale_pc=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  num=$(echo "$line" | grep -oP '\d+$')
  if [[ -n "$num" && "$num" -lt 2506 && "$num" -gt 100 ]]; then
    stale_pc="$stale_pc$line"$'\n'
  fi
done <<< "$hits"
if [[ -z "$stale_pc" ]]; then
  check "Formal claims count >= 2506 everywhere" "pass"
else
  check "Formal claims count >= 2506 everywhere" "fail" "Stale values: $(echo "$stale_pc" | head -3)"
fi

echo ""

# ─── 2. CRITICAL ROUTE CHECK ────────────────────────────────────────────────

echo "--- Critical Route Check ---"

CRITICAL_FILES=(
  "src/pages/Index.tsx"
  "src/pages/Auth.tsx"
  "src/pages/Dashboard.tsx"
  "src/pages/RedCarpet.tsx"
  "src/pages/CueCardCreator.tsx"
  "src/pages/GuidedTourPage.tsx"
  "src/pages/HelmContentCenter.tsx"
  "src/pages/PublicationsIndex.tsx"
)

for relpath in "${CRITICAL_FILES[@]}"; do
  fullpath="$PLATFORM_DIR/$relpath"
  if [[ -f "$fullpath" && -s "$fullpath" ]]; then
    check "$relpath exists and non-empty" "pass"
  elif [[ -f "$fullpath" ]]; then
    check "$relpath exists and non-empty" "fail" "File exists but is EMPTY"
  else
    check "$relpath exists and non-empty" "fail" "FILE NOT FOUND"
  fi
done

echo ""

# ─── 3. IMPORT CHECK ────────────────────────────────────────────────────────

echo "--- Import Check ---"

cue_card_file="$PLATFORM_DIR/src/pages/CueCardCreator.tsx"
if [[ -f "$cue_card_file" ]]; then
  if grep -q 'useSendEmail' "$cue_card_file" 2>/dev/null; then
    check "CueCardCreator imports useSendEmail" "pass"
  else
    check "CueCardCreator imports useSendEmail" "fail" "useSendEmail not found in CueCardCreator.tsx"
  fi
else
  check "CueCardCreator imports useSendEmail" "fail" "CueCardCreator.tsx not found"
fi

echo ""

# ─── 4. ENTITY CHECK ────────────────────────────────────────────────────────

echo "--- Entity Check ---"

hits=$(grep -rn 'Liana Banyan LLC' "$SRC_DIR" 2>/dev/null || true)
if [[ -z "$hits" ]]; then
  check "No 'Liana Banyan LLC' (should be Corporation)" "pass"
else
  check "No 'Liana Banyan LLC' (should be Corporation)" "fail" "Found in: $(echo "$hits" | head -5)"
fi

echo ""

# ─── SUMMARY ─────────────────────────────────────────────────────────────────

echo "============================================"
echo " RESULTS: $PASS/$TOTAL checks passed"
if [[ $FAIL -gt 0 ]]; then
  echo " $FAIL FAILURE(S) DETECTED"
  echo "============================================"
  exit 1
else
  echo " ALL CLEAR"
  echo "============================================"
  exit 0
fi
