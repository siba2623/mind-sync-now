-- ============================================================================
-- Phase 3: Medication Adherence Prediction - Database Migration (FIXED)
-- ============================================================================
-- Description: Creates tables and functions for adherence prediction system
-- Version: 1.0.1 (Fixed for existing medication_logs table)
-- Date: 2026-02-04
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Update existing medication_logs table with new columns
-- ============================================================================

-- Add 'taken' column if it doesn't exist (for tracking missed doses)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medication_logs' AND column_name = 'taken'
  ) THEN
    ALTER TABLE medication_logs ADD COLUMN taken BOOLEAN NOT NULL DEFAULT true;
    COMMENT ON COLUMN medication_logs.taken IS 'Whether the medication was actually taken (true) or missed (false)';
  END IF;
END $$;

-- Add 'reminder_sent' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medication_logs' AND column_name = 'reminder_sent'
  ) THEN
    ALTER TABLE medication_logs ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add 'reminder_sent_at' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medication_logs' AND column_name = 'reminder_sent_at'
  ) THEN
    ALTER TABLE medication_logs ADD COLUMN reminder_sent_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add 'side_effects' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medication_logs' AND column_name = 'side_effects'
  ) THEN
    ALTER TABLE medication_logs ADD COLUMN side_effects TEXT;
  END IF;
END $$;

-- Add 'updated_at' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medication_logs' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE medication_logs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- 2. Table: adherence_predictions
-- Description: Stores AI-generated adherence risk predictions
-- ============================================================================

CREATE TABLE IF NOT EXISTS adherence_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  
  -- Prediction results
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  probability NUMERIC(5, 2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  
  -- Prediction details
  features JSONB NOT NULL,
  factors JSONB NOT NULL,
  next_dose_time TIMESTAMPTZ NOT NULL,
  recommended_reminder_time TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_user_id ON adherence_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_medication_id ON adherence_predictions(medication_id);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_risk_level ON adherence_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_created_at ON adherence_predictions(created_at DESC);

-- RLS Policies
ALTER TABLE adherence_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own predictions"
  ON adherence_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON adherence_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
  ON adherence_predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
  ON adherence_predictions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Helper Functions
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_adherence_predictions_updated_at ON adherence_predictions;
CREATE TRIGGER update_adherence_predictions_updated_at
  BEFORE UPDATE ON adherence_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medication_logs_updated_at ON medication_logs;
CREATE TRIGGER update_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate adherence rate for a user
CREATE OR REPLACE FUNCTION calculate_adherence_rate(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS NUMERIC AS $$
DECLARE
  total_logs INTEGER;
  taken_logs INTEGER;
  adherence_rate NUMERIC;
BEGIN
  -- Count total medication logs in the period
  SELECT COUNT(*) INTO total_logs
  FROM medication_logs ml
  WHERE ml.user_id = p_user_id
    AND ml.created_at >= NOW() - (p_days || ' days')::INTERVAL;

  IF total_logs = 0 THEN
    RETURN 100.0; -- No data means 100% adherence (benefit of doubt)
  END IF;

  -- Count logs where medication was taken
  SELECT COUNT(*) INTO taken_logs
  FROM medication_logs ml
  WHERE ml.user_id = p_user_id
    AND ml.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND ml.taken = true;

  adherence_rate := (taken_logs::NUMERIC / total_logs::NUMERIC) * 100;
  RETURN ROUND(adherence_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current adherence streak
CREATE OR REPLACE FUNCTION calculate_adherence_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  log_record RECORD;
BEGIN
  -- Get medication logs ordered by created_at (most recent first)
  FOR log_record IN
    SELECT taken, created_at
    FROM medication_logs
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
  LOOP
    IF log_record.taken THEN
      streak := streak + 1;
    ELSE
      -- Streak broken
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Comments
-- ============================================================================

COMMENT ON TABLE adherence_predictions IS 'Stores AI-generated medication adherence risk predictions';
COMMENT ON COLUMN adherence_predictions.risk_level IS 'Predicted risk level: low, moderate, or high';
COMMENT ON COLUMN adherence_predictions.probability IS 'Probability of missing next dose (0-100)';
COMMENT ON COLUMN adherence_predictions.confidence IS 'Confidence in prediction (0-100)';
COMMENT ON COLUMN adherence_predictions.features IS 'JSON object containing extracted features used for prediction';
COMMENT ON COLUMN adherence_predictions.factors IS 'JSON array of risk factors contributing to prediction';

COMMENT ON FUNCTION calculate_adherence_rate IS 'Calculates adherence rate percentage for a user over specified days';
COMMENT ON FUNCTION calculate_adherence_streak IS 'Calculates current consecutive adherence streak for a user';

-- ============================================================================
-- 5. Sample Data (for testing - comment out for production)
-- ============================================================================

-- Note: Sample data commented out - uncomment for testing
/*
-- Insert sample prediction
INSERT INTO adherence_predictions (user_id, medication_id, risk_level, probability, confidence, features, factors, next_dose_time)
SELECT 
  auth.uid(),
  (SELECT id FROM medications WHERE user_id = auth.uid() LIMIT 1),
  'moderate',
  65.5,
  80.0,
  '{"dayOfWeek": 5, "hourOfDay": 9, "currentStreak": 3}'::jsonb,
  '[{"factor": "Weekend day", "impact": "negative", "weight": 0.5}]'::jsonb,
  NOW() + INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM medications WHERE user_id = auth.uid());
*/

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'adherence_predictions') THEN
    RAISE EXCEPTION 'adherence_predictions table was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medication_logs') THEN
    RAISE EXCEPTION 'medication_logs table does not exist';
  END IF;
  
  RAISE NOTICE 'Phase 3 Adherence Prediction migration completed successfully!';
END $$;
