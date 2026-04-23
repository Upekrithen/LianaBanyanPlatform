-- K186: Add Stripe columns for dollar-currency recurring subscriptions
-- Channels need product/price IDs; subscriptions need Stripe customer/subscription IDs

ALTER TABLE subscription_channels ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE subscription_channels ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE subscription_channels ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'marks';

ALTER TABLE channel_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE channel_subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE channel_subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_channel_subs_stripe_sub_id
  ON channel_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sub_channels_stripe_product
  ON subscription_channels(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
