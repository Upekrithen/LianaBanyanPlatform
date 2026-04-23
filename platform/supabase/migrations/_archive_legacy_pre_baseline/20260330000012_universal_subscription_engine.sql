-- Universal Subscription Engine (Innovation #2102)
-- Any member can create a subscription channel accepting all 4 currencies.
-- This is the backbone for Pearl Diver, Home Teacher, and all future recurring roles.

-- Subscription channels: what a creator offers
CREATE TABLE IF NOT EXISTS subscription_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price > 0),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('weekly', 'monthly', 'per_session')),
  max_subscribers INTEGER,
  current_subscribers INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('teaching', 'deals', 'photography', 'cooking', 'fitness', 'music', 'crafts', 'general')),
  cue_card_role TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Channel subscriptions: who subscribes to what
-- (named channel_subscriptions to avoid collision with existing member_subscriptions)
CREATE TABLE IF NOT EXISTS channel_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES auth.users(id) NOT NULL,
  channel_id UUID REFERENCES subscription_channels(id) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'marks'
    CHECK (currency IN ('marks', 'credits', 'joules', 'dollars')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_billing_at TIMESTAMPTZ,
  last_billed_at TIMESTAMPTZ,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscriber_id, channel_id)
);

-- Billing history
CREATE TABLE IF NOT EXISTS subscription_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES channel_subscriptions(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL
    CHECK (currency IN ('marks', 'credits', 'joules', 'dollars')),
  creator_amount NUMERIC NOT NULL,
  platform_amount NUMERIC NOT NULL,
  stripe_fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed', 'refunded')),
  billed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_subscription_channels_creator ON subscription_channels(creator_id);
CREATE INDEX idx_subscription_channels_category ON subscription_channels(category) WHERE active = true;
CREATE INDEX idx_channel_subscriptions_subscriber ON channel_subscriptions(subscriber_id);
CREATE INDEX idx_channel_subscriptions_channel ON channel_subscriptions(channel_id);
CREATE INDEX idx_channel_subscriptions_next_billing ON channel_subscriptions(next_billing_at) WHERE status = 'active';
CREATE INDEX idx_subscription_billing_subscription ON subscription_billing(subscription_id);

-- RLS
ALTER TABLE subscription_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_billing ENABLE ROW LEVEL SECURITY;

-- Channels: anyone can read active channels; creators manage their own
CREATE POLICY "Anyone can view active channels"
  ON subscription_channels FOR SELECT
  USING (active = true);

CREATE POLICY "Creators manage own channels"
  ON subscription_channels FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Subscriptions: subscribers see their own; creators see subscribers to their channels
CREATE POLICY "Subscribers see own subscriptions"
  ON channel_subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id);

CREATE POLICY "Creators see channel subscribers"
  ON channel_subscriptions FOR SELECT
  USING (
    channel_id IN (
      SELECT id FROM subscription_channels WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "Subscribers manage own subscriptions"
  ON channel_subscriptions FOR ALL
  USING (auth.uid() = subscriber_id)
  WITH CHECK (auth.uid() = subscriber_id);

-- Billing: visible to both subscriber and channel creator
CREATE POLICY "Billing visible to subscriber"
  ON subscription_billing FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM channel_subscriptions WHERE subscriber_id = auth.uid()
    )
  );

CREATE POLICY "Billing visible to creator"
  ON subscription_billing FOR SELECT
  USING (
    subscription_id IN (
      SELECT cs.id FROM channel_subscriptions cs
      JOIN subscription_channels sc ON sc.id = cs.channel_id
      WHERE sc.creator_id = auth.uid()
    )
  );

-- Trigger: update current_subscribers count on subscription changes
CREATE OR REPLACE FUNCTION update_channel_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE subscription_channels
    SET current_subscribers = current_subscribers + 1, updated_at = now()
    WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE subscription_channels
      SET current_subscribers = GREATEST(0, current_subscribers - 1), updated_at = now()
      WHERE id = NEW.channel_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE subscription_channels
      SET current_subscribers = current_subscribers + 1, updated_at = now()
      WHERE id = NEW.channel_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE subscription_channels
    SET current_subscribers = GREATEST(0, current_subscribers - 1), updated_at = now()
    WHERE id = OLD.channel_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_channel_subscriber_count
  AFTER INSERT OR UPDATE OF status OR DELETE
  ON channel_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_subscriber_count();

-- Trigger: auto-set next_billing_at on insert based on billing_cycle
CREATE OR REPLACE FUNCTION set_initial_billing_date()
RETURNS TRIGGER AS $$
DECLARE
  cycle TEXT;
BEGIN
  SELECT billing_cycle INTO cycle
  FROM subscription_channels WHERE id = NEW.channel_id;

  NEW.next_billing_at := CASE cycle
    WHEN 'weekly' THEN now() + INTERVAL '7 days'
    WHEN 'monthly' THEN now() + INTERVAL '1 month'
    WHEN 'per_session' THEN NULL
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_set_initial_billing
  BEFORE INSERT ON channel_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_billing_date();

-- Update canonical stats
INSERT INTO platform_canonical (key, value)
VALUES ('innovation_count', 2106)
ON CONFLICT (key) DO UPDATE SET value = 2106;

INSERT INTO platform_canonical (key, value)
VALUES ('knight_sessions', 182)
ON CONFLICT (key) DO UPDATE SET value = 182;
