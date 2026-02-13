-- ============================================================================
-- Phase 3: Therapist Matching System - Database Migration (FIXED)
-- ============================================================================
-- Description: Creates tables for therapist profiles, bookings, and outcomes
-- Version: 1.0.1 (Simplified for initial deployment)
-- Date: 2026-02-04
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: therapists
-- Description: Stores therapist profiles and availability
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  
  -- Location
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Professional details
  years_experience INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  
  -- Session details
  session_types TEXT[] NOT NULL DEFAULT '{}', -- ['in-person', 'video', 'phone']
  rate DECIMAL(10, 2) NOT NULL,
  insurance_accepted TEXT[] DEFAULT '{}',
  
  -- Availability
  weekdays_available BOOLEAN DEFAULT true,
  weekends_available BOOLEAN DEFAULT false,
  evenings_available BOOLEAN DEFAULT false,
  next_available_date TIMESTAMP WITH TIME ZONE,
  
  -- Demographics (for matching)
  gender TEXT,
  age INTEGER,
  
  -- Metadata
  photo_url TEXT,
  discovery_network BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for therapist search performance
CREATE INDEX IF NOT EXISTS idx_therapists_specializations ON therapists USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_therapists_languages ON therapists USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_therapists_location ON therapists(city, province);
CREATE INDEX IF NOT EXISTS idx_therapists_rating ON therapists(rating DESC);
CREATE INDEX IF NOT EXISTS idx_therapists_active ON therapists(active) WHERE active = true;

-- ============================================================================
-- Table: therapist_bookings
-- Description: Tracks booking attempts and outcomes
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapist_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  
  -- Booking details
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_date TIMESTAMP WITH TIME ZONE,
  session_type TEXT NOT NULL, -- 'in-person', 'video', 'phone'
  
  -- Match information
  match_score DECIMAL(5, 2) NOT NULL, -- 0-100
  match_factors JSONB, -- Key matching factors at time of booking
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  booked BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_user ON therapist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON therapist_bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON therapist_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON therapist_bookings(booking_date DESC);

-- ============================================================================
-- Table: therapy_outcomes
-- Description: Tracks therapy session outcomes for collaborative filtering
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapy_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES therapist_bookings(id) ON DELETE SET NULL,
  
  -- Session details
  session_number INTEGER NOT NULL DEFAULT 1,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Outcome metrics
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  continued_therapy BOOLEAN DEFAULT true,
  outcome_improvement INTEGER CHECK (outcome_improvement >= -100 AND outcome_improvement <= 100),
  
  -- Feedback
  feedback_text TEXT,
  would_recommend BOOLEAN,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for outcome queries
CREATE INDEX IF NOT EXISTS idx_outcomes_user ON therapy_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_therapist ON therapy_outcomes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_date ON therapy_outcomes(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_outcomes_rating ON therapy_outcomes(satisfaction_rating);

-- ============================================================================
-- Table: patient_profiles
-- Description: Stores patient demographics and needs for matching
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Demographics
  age INTEGER,
  gender TEXT,
  city TEXT,
  province TEXT,
  
  -- Needs and conditions
  primary_concerns TEXT[] DEFAULT '{}',
  mental_health_conditions TEXT[] DEFAULT '{}',
  therapy_goals TEXT[] DEFAULT '{}',
  
  -- Preferences
  preferred_gender TEXT, -- 'male', 'female', 'non-binary', 'no-preference'
  preferred_age_range TEXT, -- 'younger', 'similar', 'older', 'no-preference'
  preferred_therapy_approach TEXT[] DEFAULT '{}',
  
  -- Insurance
  insurance_provider TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for patient profile queries
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user ON patient_profiles(user_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Therapists: Public read access (anyone can view therapists)
CREATE POLICY "Therapists are viewable by everyone"
  ON therapists FOR SELECT
  USING (active = true);

-- Therapist Bookings: Users can only see their own bookings
CREATE POLICY "Users can view their own bookings"
  ON therapist_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON therapist_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON therapist_bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Therapy Outcomes: Users can only see their own outcomes
CREATE POLICY "Users can view their own outcomes"
  ON therapy_outcomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outcomes"
  ON therapy_outcomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outcomes"
  ON therapy_outcomes FOR UPDATE
  USING (auth.uid() = user_id);

-- Patient Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view their own profile"
  ON patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON patient_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function: Calculate therapist average rating
CREATE OR REPLACE FUNCTION calculate_therapist_rating(therapist_uuid UUID)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
BEGIN
  SELECT COALESCE(AVG(satisfaction_rating), 0.0)
  INTO avg_rating
  FROM therapy_outcomes
  WHERE therapist_id = therapist_uuid
    AND satisfaction_rating IS NOT NULL;
  
  RETURN ROUND(avg_rating, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate therapist success rate
CREATE OR REPLACE FUNCTION calculate_therapist_success_rate(therapist_uuid UUID)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  success_rate DECIMAL(5, 2);
  total_outcomes INTEGER;
  positive_outcomes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_outcomes
  FROM therapy_outcomes
  WHERE therapist_id = therapist_uuid;
  
  IF total_outcomes = 0 THEN
    RETURN 0.0;
  END IF;
  
  SELECT COUNT(*) INTO positive_outcomes
  FROM therapy_outcomes
  WHERE therapist_id = therapist_uuid
    AND (satisfaction_rating >= 4 OR outcome_improvement > 0);
  
  success_rate := (positive_outcomes::DECIMAL / total_outcomes::DECIMAL) * 100;
  RETURN ROUND(success_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Function to update updated_at timestamp (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update therapist rating when outcome is added/updated
CREATE OR REPLACE FUNCTION update_therapist_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE therapists
  SET 
    rating = calculate_therapist_rating(NEW.therapist_id),
    review_count = (
      SELECT COUNT(*) 
      FROM therapy_outcomes 
      WHERE therapist_id = NEW.therapist_id
    ),
    updated_at = NOW()
  WHERE id = NEW.therapist_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_therapist_rating ON therapy_outcomes;
CREATE TRIGGER trigger_update_therapist_rating
  AFTER INSERT OR UPDATE ON therapy_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_rating();

-- Trigger: Update updated_at timestamp
DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON therapist_bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON therapist_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outcomes_updated_at ON therapy_outcomes;
CREATE TRIGGER update_outcomes_updated_at
  BEFORE UPDATE ON therapy_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_profiles_updated_at ON patient_profiles;
CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data (for testing)
-- ============================================================================

-- Insert sample therapists
INSERT INTO therapists (name, title, bio, specializations, languages, city, province, years_experience, rating, review_count, session_types, rate, insurance_accepted, gender, age) VALUES
('Dr. Thandi Mthembu', 'Clinical Psychologist', 'Specializing in trauma-informed care with a focus on culturally sensitive approaches.', 
 ARRAY['Anxiety', 'Depression', 'Trauma', 'CBT'], ARRAY['English', 'isiZulu', 'isiXhosa'], 
 'Sandton', 'Gauteng', 12, 4.9, 127, ARRAY['in-person', 'video'], 950.00, ARRAY['Discovery Health', 'Momentum'], 'female', 42),

('Dr. Johan van der Merwe', 'Psychiatrist', 'Board-certified psychiatrist with expertise in complex mood disorders.', 
 ARRAY['Bipolar', 'Schizophrenia', 'Medication Management'], ARRAY['English', 'Afrikaans'], 
 'Cape Town', 'Western Cape', 18, 4.8, 89, ARRAY['in-person', 'video', 'phone'], 1200.00, ARRAY['Discovery Health', 'Bonitas'], 'male', 51),

('Lerato Khumalo', 'Counselling Psychologist', 'Warm, empathetic approach to helping young professionals navigate life challenges.', 
 ARRAY['Stress Management', 'Relationships', 'Life Transitions'], ARRAY['English', 'Sesotho', 'Setswana'], 
 'Pretoria', 'Gauteng', 8, 4.7, 64, ARRAY['video', 'phone'], 750.00, ARRAY['Discovery Health'], 'female', 35)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE therapists IS 'Stores therapist profiles and availability information';
COMMENT ON TABLE therapist_bookings IS 'Tracks booking attempts and match scores';
COMMENT ON TABLE therapy_outcomes IS 'Records therapy session outcomes for collaborative filtering';
COMMENT ON TABLE patient_profiles IS 'Stores patient demographics and preferences for matching';

COMMENT ON FUNCTION calculate_therapist_rating IS 'Calculates average satisfaction rating for a therapist';
COMMENT ON FUNCTION calculate_therapist_success_rate IS 'Calculates percentage of positive outcomes for a therapist';

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 3 Therapist Matching migration completed successfully!';
  RAISE NOTICE 'Created tables: therapists, therapist_bookings, therapy_outcomes, patient_profiles';
  RAISE NOTICE 'Sample therapists added: 3';
END $$;
