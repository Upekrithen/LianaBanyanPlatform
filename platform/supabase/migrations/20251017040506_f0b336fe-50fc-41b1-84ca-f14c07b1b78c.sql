-- Add dormant capacity feature for 50K tier production waves
-- Unlocks 2 days of reserve capacity that LB usually never needs

-- Add dormant capacity columns to production_waves
ALTER TABLE production_waves
ADD COLUMN IF NOT EXISTS has_dormant_capacity BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dormant_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dormant_activated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dormant_activated_at TIMESTAMPTZ;

COMMENT ON COLUMN production_waves.has_dormant_capacity IS 'Whether this wave has dormant capacity (unlocked at 50K tier)';
COMMENT ON COLUMN production_waves.dormant_days IS 'Number of dormant reserve days available (typically 2)';
COMMENT ON COLUMN production_waves.dormant_activated IS 'Whether dormant capacity has been activated';
COMMENT ON COLUMN production_waves.dormant_activated_at IS 'When dormant capacity was activated';

-- Create function to check and unlock dormant capacity at 50K threshold
CREATE OR REPLACE FUNCTION check_dormant_capacity_unlock()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- If wave reaches 50,000 units allocated and doesn't have dormant capacity yet
  IF NEW.units_allocated >= 50000 AND (OLD.has_dormant_capacity = false OR OLD.has_dormant_capacity IS NULL) THEN
    NEW.has_dormant_capacity = true;
    NEW.dormant_days = 2;

    -- Log the unlock event
    INSERT INTO system_notifications (
      notification_type,
      title,
      message,
      metadata
    ) VALUES (
      'dormant_capacity_unlocked',
      'Dormant Capacity Unlocked',
      'Wave ' || NEW.wave_name || ' has reached 50K units - 2 days of reserve capacity now available',
      jsonb_build_object(
        'wave_id', NEW.id,
        'wave_name', NEW.wave_name,
        'units_allocated', NEW.units_allocated,
        'dormant_days', 2
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to check dormant capacity unlock
DROP TRIGGER IF EXISTS trigger_check_dormant_capacity ON production_waves;
CREATE TRIGGER trigger_check_dormant_capacity
  BEFORE UPDATE OF units_allocated ON production_waves
  FOR EACH ROW
  EXECUTE FUNCTION check_dormant_capacity_unlock();

-- Create system_notifications table if it doesn't exist (for logging dormant capacity events)
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Admin can view all system notifications
CREATE POLICY "Admins can view system notifications"
  ON system_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_notifications_type ON system_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created ON system_notifications(created_at DESC);
