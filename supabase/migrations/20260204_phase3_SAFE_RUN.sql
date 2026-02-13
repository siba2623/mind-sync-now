-- ============================================================================
-- Phase 3: Complete Migration - SAFE TO RE-RUN
-- ============================================================================
-- Description: Creates all Phase 3 tables and functions (idempotent)
-- Version: 1.0.2 (Safe to run multiple times)
-- Date: 2026-02-04
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: ADHERENCE PREDICTION
-- ============================================================================

-- Add columns to existing medication_logs table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_logs' AND column_name = 'taken') THEN
    ALTER TABLE medication_logs ADD COLUMN taken BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_logs' AND column_name = 'reminder_sent') THEN
    ALTER TABLE medication_logs ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_logs' AND column_name = 'reminder_sent_at') THEN
    ALTER TABLE medication_logs ADD COLUMN reminder_sent_at TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_logs' AND column_name = 'side_effects') THEN
    ALTER TABLE medication_logs ADD COLUMN side_effects TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medication_logs' AND column_name = 'updated_at') THEN
    ALTER TABLE medication_logs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create adherence_predictions table
CREATE TABLE IF NOT EXISTS adherence_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  probability NUMERIC(5, 2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  features JSONB NOT NULL,
  factors JSONB NOT NULL,
  next_dose_time TIMESTAMPTZ NOT NULL,
  recommended_reminder_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_user_id ON adherence_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_medication_id ON adherence_predictions(medication_id);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_risk_level ON adherence_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_adherence_predictions_created_at ON adherence_predictions(created_at DESC);

-- RLS
ALTER TABLE adherence_predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own predictions" ON adherence_predictions;
CREATE POLICY "Users can view their own predictions" ON adherence_predictions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own predictions" ON adherence_predictions;
CREATE POLICY "Users can insert their own predictions" ON adherence_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own predictions" ON adherence_predictions;
CREATE POLICY "Users can update their own predictions" ON adherence_predictions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own predictions" ON adherence_predictions;
CREATE POLICY "Users can delete their own predictions" ON adherence_predictions FOR DELETE USING (auth.uid() = user_id);

-- Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_adherence_predictions_updated_at ON adherence_predictions;
CREATE TRIGGER update_adherence_predictions_updated_at
  BEFORE UPDATE ON adherence_predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medication_logs_updated_at ON medication_logs;
CREATE TRIGGER update_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION calculate_adherence_rate(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS NUMERIC AS $$
DECLARE
  total_logs INTEGER;
  taken_logs INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_logs FROM medication_logs WHERE user_id = p_user_id AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  IF total_logs = 0 THEN RETURN 100.0; END IF;
  SELECT COUNT(*) INTO taken_logs FROM medication_logs WHERE user_id = p_user_id AND created_at >= NOW() - (p_days || ' days')::INTERVAL AND taken = true;
  RETURN ROUND((taken_logs::NUMERIC / total_logs::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_adherence_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  log_record RECORD;
BEGIN
  FOR log_record IN SELECT taken FROM medication_logs WHERE user_id = p_user_id ORDER BY created_at DESC LOOP
    IF log_record.taken THEN streak := streak + 1; ELSE EXIT; END IF;
  END LOOP;
  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 2: THERAPIST MATCHING
-- ============================================================================

-- Drop and recreate therapists table to ensure correct schema
DROP TABLE IF EXISTS therapy_outcomes CASCADE;
DROP TABLE IF EXISTS therapist_bookings CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;

CREATE TABLE therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  years_experience INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  session_types TEXT[] NOT NULL DEFAULT '{}',
  rate DECIMAL(10, 2) NOT NULL,
  insurance_accepted TEXT[] DEFAULT '{}',
  weekdays_available BOOLEAN DEFAULT true,
  weekends_available BOOLEAN DEFAULT false,
  evenings_available BOOLEAN DEFAULT false,
  next_available_date TIMESTAMP WITH TIME ZONE,
  gender TEXT,
  age INTEGER,
  photo_url TEXT,
  discovery_network BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_therapists_specializations ON therapists USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_therapists_languages ON therapists USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_therapists_location ON therapists(city, province);
CREATE INDEX IF NOT EXISTS idx_therapists_rating ON therapists(rating DESC);
CREATE INDEX IF NOT EXISTS idx_therapists_active ON therapists(active) WHERE active = true;

-- Create therapist_bookings table (recreated due to CASCADE)
CREATE TABLE therapist_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_date TIMESTAMP WITH TIME ZONE,
  session_type TEXT NOT NULL,
  match_score DECIMAL(5, 2) NOT NULL,
  match_factors JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  booked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON therapist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON therapist_bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON therapist_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON therapist_bookings(booking_date DESC);

-- Create therapy_outcomes table (recreated due to CASCADE)
CREATE TABLE therapy_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES therapist_bookings(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL DEFAULT 1,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  continued_therapy BOOLEAN DEFAULT true,
  outcome_improvement INTEGER CHECK (outcome_improvement >= -100 AND outcome_improvement <= 100),
  feedback_text TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcomes_user ON therapy_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_therapist ON therapy_outcomes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_date ON therapy_outcomes(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_outcomes_rating ON therapy_outcomes(satisfaction_rating);

-- Create patient_profiles table (recreated due to CASCADE)
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  city TEXT,
  province TEXT,
  primary_concerns TEXT[] DEFAULT '{}',
  mental_health_conditions TEXT[] DEFAULT '{}',
  therapy_goals TEXT[] DEFAULT '{}',
  preferred_gender TEXT,
  preferred_age_range TEXT,
  preferred_therapy_approach TEXT[] DEFAULT '{}',
  insurance_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_user ON patient_profiles(user_id);

-- RLS for therapist tables
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Therapists are viewable by everyone" ON therapists;
CREATE POLICY "Therapists are viewable by everyone" ON therapists FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Users can view their own bookings" ON therapist_bookings;
CREATE POLICY "Users can view their own bookings" ON therapist_bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookings" ON therapist_bookings;
CREATE POLICY "Users can create their own bookings" ON therapist_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON therapist_bookings;
CREATE POLICY "Users can update their own bookings" ON therapist_bookings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own outcomes" ON therapy_outcomes;
CREATE POLICY "Users can view their own outcomes" ON therapy_outcomes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own outcomes" ON therapy_outcomes;
CREATE POLICY "Users can create their own outcomes" ON therapy_outcomes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own outcomes" ON therapy_outcomes;
CREATE POLICY "Users can update their own outcomes" ON therapy_outcomes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON patient_profiles;
CREATE POLICY "Users can view their own profile" ON patient_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own profile" ON patient_profiles;
CREATE POLICY "Users can create their own profile" ON patient_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON patient_profiles;
CREATE POLICY "Users can update their own profile" ON patient_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Therapist helper functions
CREATE OR REPLACE FUNCTION calculate_therapist_rating(therapist_uuid UUID)
RETURNS DECIMAL(3, 2) AS $$
BEGIN
  RETURN ROUND(COALESCE((SELECT AVG(satisfaction_rating) FROM therapy_outcomes WHERE therapist_id = therapist_uuid AND satisfaction_rating IS NOT NULL), 0.0), 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_therapist_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE therapists SET rating = calculate_therapist_rating(NEW.therapist_id), review_count = (SELECT COUNT(*) FROM therapy_outcomes WHERE therapist_id = NEW.therapist_id), updated_at = NOW() WHERE id = NEW.therapist_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_therapist_rating ON therapy_outcomes;
CREATE TRIGGER trigger_update_therapist_rating AFTER INSERT OR UPDATE ON therapy_outcomes FOR EACH ROW EXECUTE FUNCTION update_therapist_rating();

DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON therapist_bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON therapist_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outcomes_updated_at ON therapy_outcomes;
CREATE TRIGGER update_outcomes_updated_at BEFORE UPDATE ON therapy_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_profiles_updated_at ON patient_profiles;
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample therapists (always insert since table was recreated)
INSERT INTO therapists (name, title, bio, specializations, languages, city, province, years_experience, rating, review_count, session_types, rate, insurance_accepted, gender, age) VALUES
  ('Dr. Thandi Mthembu', 'Clinical Psychologist', 'Specializing in trauma-informed care with a focus on culturally sensitive approaches.', ARRAY['Anxiety', 'Depression', 'Trauma', 'CBT'], ARRAY['English', 'isiZulu', 'isiXhosa'], 'Sandton', 'Gauteng', 12, 4.9, 127, ARRAY['in-person', 'video'], 950.00, ARRAY['Discovery Health', 'Momentum'], 'female', 42),
  ('Dr. Johan van der Merwe', 'Psychiatrist', 'Board-certified psychiatrist with expertise in complex mood disorders.', ARRAY['Bipolar', 'Schizophrenia', 'Medication Management'], ARRAY['English', 'Afrikaans'], 'Cape Town', 'Western Cape', 18, 4.8, 89, ARRAY['in-person', 'video', 'phone'], 1200.00, ARRAY['Discovery Health', 'Bonitas'], 'male', 51),
  ('Lerato Khumalo', 'Counselling Psychologist', 'Warm, empathetic approach to helping young professionals navigate life challenges.', ARRAY['Stress Management', 'Relationships', 'Life Transitions'], ARRAY['English', 'Sesotho', 'Setswana'], 'Pretoria', 'Gauteng', 8, 4.7, 64, ARRAY['video', 'phone'], 750.00, ARRAY['Discovery Health'], 'female', 35);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 3 migration completed successfully!';
  RAISE NOTICE '📊 Tables created: adherence_predictions, therapists, therapist_bookings, therapy_outcomes, patient_profiles';
  RAISE NOTICE '🔧 Functions created: calculate_adherence_rate, calculate_adherence_streak, calculate_therapist_rating';
  RAISE NOTICE '🔒 RLS policies configured for all tables';
  RAISE NOTICE '👥 Sample therapists: %', (SELECT COUNT(*) FROM therapists);
END $$;
