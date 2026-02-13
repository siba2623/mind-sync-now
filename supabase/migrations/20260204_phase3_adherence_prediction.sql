-- Phase 3: Medication Adherence Prediction System
-- Migration: 20260204_phase3_adherence_prediction.sql
-- Description: Creates tables for adherence predictions, medication logs, and related data

-- ============================================================================
-- 1. Adherence Predictions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS adherence_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL,
  prediction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  features JSONB NOT NULL, -- Stores extracted features as JSON
  factors JSONB NOT NULL, -- Stores risk factors as JSON array
  next_dose_time TIMESTAMPTZ NOT NULL,
  recommended_reminder_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_user_id ON adherence_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_medication_id ON adherence_predictions(medication_id);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_prediction_date ON adherence_predictions(prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_risk_level ON adherence_predictions(risk_level);

-- RLS Policies
ALTER TABLE adherence_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own adherence predictions"
  ON adherence_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adherence predictions"
  ON adherence_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adherence predictions"
  ON adherence_predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adherence predictions"
  ON adherence_predictions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. Medication Logs Table (Enhanced)
-- ============================================================================

-- Check if medication_logs table exists, if not create it
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  taken BOOLEAN NOT NULL DEFAULT false,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIMESTAMPTZ,
  side_effects TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_scheduled_time ON medication_logs(scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_taken ON medication_logs(taken);

-- RLS Policies
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medication logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs"
  ON medication_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs"
  ON medication_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Medications Table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[] NOT NULL DEFAULT ARRAY['08:00'],
  prescribed_by TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  refill_date DATE,
  pills_remaining INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(active);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date DESC);

-- RLS Policies
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Functions and Triggers
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

DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to calculate adherence rate for a user
CREATE OR REPLACE FUNCTION calculate_adherence_rate(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
  total_expected INTEGER;
  total_taken INTEGER;
  adherence_rate NUMERIC;
BEGIN
  -- Count expected doses (simplified: 1 dose per day per medication)
  SELECT COUNT(DISTINCT m.id) * p_days INTO total_expected
  FROM medications m
  WHERE m.user_id = p_user_id
    AND m.active = true
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE - p_days);

  -- Count taken doses
  SELECT COUNT(*) INTO total_taken
  FROM medication_logs ml
  WHERE ml.user_id = p_user_id
    AND ml.taken = true
    AND ml.scheduled_time >= NOW() - (p_days || ' days')::INTERVAL;

  -- Calculate rate
  IF total_expected > 0 THEN
    adherence_rate := (total_taken::NUMERIC / total_expected::NUMERIC) * 100;
  ELSE
    adherence_rate := 0;
  END IF;

  RETURN ROUND(adherence_rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current streak for a user
CREATE OR REPLACE FUNCTION calculate_adherence_streak(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_log BOOLEAN;
BEGIN
  -- Check each day going backwards
  FOR i IN 0..365 LOOP
    SELECT EXISTS(
      SELECT 1
      FROM medication_logs ml
      WHERE ml.user_id = p_user_id
        AND ml.taken = true
        AND DATE(ml.scheduled_time) = check_date
    ) INTO has_log;

    IF NOT has_log THEN
      EXIT;
    END IF;

    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Sample Data (for testing - remove in production)
-- ============================================================================

-- This section can be commented out in production
-- Uncomment for development/testing

/*
-- Insert sample medication for testing (requires a valid user_id)
-- Replace 'YOUR_USER_ID' with an actual user ID from auth.users

INSERT INTO medications (user_id, name, dosage, frequency, times, prescribed_by, start_date, notes)
VALUES 
  ('YOUR_USER_ID', 'Sertraline', '50mg', 'once daily', ARRAY['08:00'], 'Dr. Smith', CURRENT_DATE - 30, 'Take with food'),
  ('YOUR_USER_ID', 'Vitamin D', '1000 IU', 'once daily', ARRAY['08:00'], 'Dr. Smith', CURRENT_DATE - 30, 'Morning dose');

-- Insert sample logs for testing
INSERT INTO medication_logs (user_id, medication_id, scheduled_time, taken_at, taken)
SELECT 
  'YOUR_USER_ID',
  m.id,
  CURRENT_DATE - i + INTERVAL '8 hours',
  CASE WHEN random() > 0.2 THEN CURRENT_DATE - i + INTERVAL '8 hours' ELSE NULL END,
  random() > 0.2
FROM medications m
CROSS JOIN generate_series(0, 29) AS i
WHERE m.user_id = 'YOUR_USER_ID';
*/

-- ============================================================================
-- 7. Grants
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON adherence_predictions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medication_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medications TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION calculate_adherence_rate(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_adherence_streak(UUID) TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Add comment to track migration
COMMENT ON TABLE adherence_predictions IS 'Phase 3: Stores AI-powered medication adherence risk predictions';
COMMENT ON TABLE medication_logs IS 'Phase 3: Tracks medication taking events and adherence history';
COMMENT ON TABLE medications IS 'Phase 3: Stores user medication information and schedules';
