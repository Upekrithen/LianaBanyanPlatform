#!/bin/bash
# ═══════════════════════════════════════════════════════════
# STRIPE WEBHOOK LOCAL TEST
# ═══════════════════════════════════════════════════════════
#
# Prerequisites:
#   1. Run: stripe login
#   2. Ensure Supabase function is deployed
#
# This script forwards Stripe test events to your deployed
# Supabase edge function for webhook testing.
# ═══════════════════════════════════════════════════════════

SUPABASE_PROJECT="ruuxzilgmuwddcofqecc"
WEBHOOK_URL="https://${SUPABASE_PROJECT}.supabase.co/functions/v1/stripe-webhook"
CONNECT_WEBHOOK_URL="https://${SUPABASE_PROJECT}.supabase.co/functions/v1/connect-account-webhook"

echo "═══════════════════════════════════════════"
echo "Liana Banyan Stripe Webhook Test"
echo "═══════════════════════════════════════════"
echo ""
echo "Webhook URL: $WEBHOOK_URL"
echo "Connect URL: $CONNECT_WEBHOOK_URL"
echo ""

# Step 1: Start forwarding (runs in background)
echo "[1/4] Starting Stripe webhook forwarding..."
stripe listen --forward-to "$WEBHOOK_URL" &
LISTEN_PID=$!
sleep 3

echo ""
echo "[2/4] Testing checkout.session.completed (membership)..."
stripe trigger checkout.session.completed \
  --add checkout_session:metadata[payment_type]=lb_membership_stake \
  --add checkout_session:metadata[user_id]=test-user-001

echo ""
echo "[3/4] Testing checkout.session.completed (credit purchase)..."
stripe trigger checkout.session.completed \
  --add checkout_session:metadata[payment_type]=credit_purchase \
  --add checkout_session:metadata[user_id]=test-user-001 \
  --add checkout_session:metadata[credits]=100 \
  --add checkout_session:metadata[amount]=10 \
  --add checkout_session:metadata[package_size]=starter

echo ""
echo "[4/4] Testing Connect account webhook..."
stripe trigger account.updated

echo ""
echo "═══════════════════════════════════════════"
echo "Test complete. Check Supabase logs for results."
echo "Press Ctrl+C to stop listening."
echo "═══════════════════════════════════════════"

# Keep forwarding alive
wait $LISTEN_PID
