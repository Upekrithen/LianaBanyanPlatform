-- Add surge pricing fields to production_waves
ALTER TABLE production_waves 
ADD COLUMN IF NOT EXISTS surge_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS surge_threshold numeric DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS surge_multiplier numeric DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS surge_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS demand_score numeric DEFAULT 0;

-- Create function to check and activate surge pricing based on demand
CREATE OR REPLACE FUNCTION check_wave_surge_pricing()
RETURNS void AS $$
BEGIN
  -- Update surge_active status for waves where surge is enabled and threshold is met
  UPDATE production_waves
  SET surge_active = true
  WHERE surge_enabled = true
    AND wave_number <= 3
    AND (units_allocated::numeric / NULLIF(total_wave_capacity, 0)) >= surge_threshold
    AND surge_active = false;
  
  -- Deactivate surge if capacity drops below threshold (e.g., cancellations)
  UPDATE production_waves
  SET surge_active = false
  WHERE surge_enabled = true
    AND (units_allocated::numeric / NULLIF(total_wave_capacity, 0)) < (surge_threshold - 0.05)
    AND surge_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check surge pricing on allocation changes
CREATE OR REPLACE FUNCTION trigger_check_surge_pricing()
RETURNS trigger AS $$
BEGIN
  PERFORM check_wave_surge_pricing();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_surge_on_allocation ON production_waves;
CREATE TRIGGER check_surge_on_allocation
  AFTER UPDATE OF units_allocated ON production_waves
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_surge_pricing();

COMMENT ON COLUMN production_waves.surge_enabled IS 'Whether surge pricing can be activated for this wave';
COMMENT ON COLUMN production_waves.surge_threshold IS 'Capacity percentage (0-1) that triggers surge pricing';
COMMENT ON COLUMN production_waves.surge_multiplier IS 'Additional multiplier applied during surge (e.g., 1.5 = 50% increase)';
COMMENT ON COLUMN production_waves.surge_active IS 'Current surge pricing status';
COMMENT ON COLUMN production_waves.demand_score IS 'Calculated demand metric for analytics';