-- Fix search_path for surge pricing functions
CREATE OR REPLACE FUNCTION check_wave_surge_pricing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION trigger_check_surge_pricing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM check_wave_surge_pricing();
  RETURN NEW;
END;
$$;
