-- Add queue notification preference to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS queue_position_notifications boolean DEFAULT true;

-- Add comment
COMMENT ON COLUMN user_preferences.queue_position_notifications IS 'User wants notifications when their backed products move in the production queue';
