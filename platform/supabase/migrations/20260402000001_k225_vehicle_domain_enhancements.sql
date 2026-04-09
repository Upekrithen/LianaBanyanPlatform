-- K225: Vehicle domain enhancements
-- Adds insurance tracking to local_wheels_fleet
-- Adds CHECK constraint for Lemon Lot $15/day minimum (idempotent; coerces legacy rows)

ALTER TABLE local_wheels_fleet
  ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
  ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_expiry DATE;

UPDATE lemon_lot_vehicles SET daily_rate = 15 WHERE daily_rate IS NOT NULL AND daily_rate < 15;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lemon_lot_daily_rate_min'
  ) THEN
    ALTER TABLE lemon_lot_vehicles
      ADD CONSTRAINT lemon_lot_daily_rate_min CHECK (daily_rate >= 15);
  END IF;
END $$;

ALTER TABLE rideshare_routes
  ADD COLUMN IF NOT EXISTS platform_fee_percentage NUMERIC(5,2) DEFAULT 20.0;
