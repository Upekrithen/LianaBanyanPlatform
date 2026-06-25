#!/bin/sh
# run-and-sign.sh
# BP094 - LianaB MMLU-Pro harness runner and signer
# Runs validate-relay.mjs against the question bank, signs the result with Ring Bearer Ed25519 key.
# No em-dashes in comments.
#
# Usage:
#   LB_MODEL_ENDPOINT=http://localhost:11434 LB_MODEL_NAME=llama3.3:70b ./run-and-sign.sh
#
# Outputs:
#   output/result.json          - Full run result with per-question breakdown
#   output/result.json.sha256   - SHA-256 hex digest of result.json
#   output/result.json.sig      - Ed25519 signature (hex) of result.json bytes

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-$SCRIPT_DIR/output}"
QUESTION_BANK="${QUESTION_BANK:-$SCRIPT_DIR/smoke_2q_bp093.json}"
HARNESS_VERSION="mmlu-pro-bp094"

# Resolve Ring Bearer key path
if [ -n "$LB_RING_BEARER_KEY_PATH" ]; then
  KEY_PATH="$LB_RING_BEARER_KEY_PATH"
elif [ -f "$HOME/.lb/ring-bearer/ed25519.pem" ]; then
  KEY_PATH="$HOME/.lb/ring-bearer/ed25519.pem"
else
  echo "ERROR: Ring Bearer Ed25519 key not found."
  echo "Set LB_RING_BEARER_KEY_PATH or place key at ~/.lb/ring-bearer/ed25519.pem"
  exit 1
fi

if [ ! -f "$KEY_PATH" ]; then
  echo "ERROR: Key file not found at $KEY_PATH"
  exit 1
fi

# Require openssl for signing
if ! command -v openssl > /dev/null 2>&1; then
  echo "ERROR: openssl not found. Install openssl to run this harness."
  exit 1
fi

# Require node for validate-relay.mjs
if ! command -v node > /dev/null 2>&1; then
  echo "ERROR: node not found. Install Node.js 18+ to run this harness."
  exit 1
fi

VALIDATE_RELAY="$SCRIPT_DIR/validate-relay.mjs"
if [ ! -f "$VALIDATE_RELAY" ]; then
  echo "ERROR: validate-relay.mjs not found at $VALIDATE_RELAY"
  exit 1
fi

if [ ! -f "$QUESTION_BANK" ]; then
  echo "ERROR: Question bank not found at $QUESTION_BANK"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

START_EPOCH=$(date +%s)

echo "==> Running MMLU-Pro harness (harness_version=$HARNESS_VERSION)"
echo "    Question bank: $QUESTION_BANK"
echo "    Model endpoint: ${LB_MODEL_ENDPOINT:-http://localhost:11434}"
echo "    Model name: ${LB_MODEL_NAME:-llama3.3:70b}"
echo ""

# Run the harness - writes result JSON to stdout
node "$VALIDATE_RELAY" \
  --question-bank "$QUESTION_BANK" \
  --endpoint "${LB_MODEL_ENDPOINT:-http://localhost:11434}" \
  --model "${LB_MODEL_NAME:-llama3.3:70b}" \
  --harness-version "$HARNESS_VERSION" \
  --output "$OUTPUT_DIR/result.json"

END_EPOCH=$(date +%s)
WALL_CLOCK_SECONDS=$((END_EPOCH - START_EPOCH))

if [ ! -f "$OUTPUT_DIR/result.json" ]; then
  echo "ERROR: validate-relay.mjs did not produce output/result.json"
  exit 1
fi

# Compute SHA-256 of result.json
openssl dgst -sha256 -hex "$OUTPUT_DIR/result.json" | awk '{print $2}' > "$OUTPUT_DIR/result.json.sha256"
SHA256=$(cat "$OUTPUT_DIR/result.json.sha256")
echo "==> SHA-256: $SHA256"

# Sign the result.json bytes with Ring Bearer Ed25519 key
# openssl pkeyutl -sign with Ed25519 PEM private key, output DER, then hex-encode
openssl pkeyutl -sign \
  -inkey "$KEY_PATH" \
  -in "$OUTPUT_DIR/result.json" \
  -out "$OUTPUT_DIR/result.json.sig.der" 2>/dev/null

# Convert DER signature to hex
xxd -p "$OUTPUT_DIR/result.json.sig.der" | tr -d '\n' > "$OUTPUT_DIR/result.json.sig"
rm -f "$OUTPUT_DIR/result.json.sig.der"

SIG=$(cat "$OUTPUT_DIR/result.json.sig")
echo "==> Signature (Ed25519 hex): ${SIG:0:32}..."

# Parse result for summary printout
QUESTIONS_ATTEMPTED=$(node -e "const r = require('$OUTPUT_DIR/result.json'); console.log(r.questions_attempted || (r.questions || []).length || 0)" 2>/dev/null || echo "?")
QUESTIONS_CORRECT=$(node -e "const r = require('$OUTPUT_DIR/result.json'); console.log(r.questions_correct || 0)" 2>/dev/null || echo "?")
ACCURACY=$(node -e "const r = require('$OUTPUT_DIR/result.json'); console.log(r.accuracy || 0)" 2>/dev/null || echo "?")

echo ""
echo "===== HARNESS COMPLETE ====="
echo "  Questions attempted: $QUESTIONS_ATTEMPTED"
echo "  Questions correct:   $QUESTIONS_CORRECT"
echo "  Accuracy:            $ACCURACY%"
echo "  Wall-clock seconds:  $WALL_CLOCK_SECONDS"
echo ""
echo "  Output files:"
echo "    $OUTPUT_DIR/result.json"
echo "    $OUTPUT_DIR/result.json.sha256"
echo "    $OUTPUT_DIR/result.json.sig"
echo ""
echo "  Next step: submit to https://lianabanyan.com/proofs/submit"
