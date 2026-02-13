-- Add notification_preferences column to profiles table
-- This migration is idempotent (safe to re-run)

-- Add notification_preferences column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN notification_preferences JSONB DEFAULT '{
      "enabled": true,
      "dndStart": 22,
      "dndEnd": 6,
      "maxPerDay": 5,
      "types": {
        "medication_reminder": true,
        "mood_checkin": true,
        "wellness_tip": true,
        "risk_alert": true,
        "adherence_streak": true,
        "therapist_message": true
      }
    }'::jsonb;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences including DND hours, frequency limits, and notification type opt-ins';
