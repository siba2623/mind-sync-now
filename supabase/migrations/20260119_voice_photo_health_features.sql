-- Add voice recordings table
CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  transcription TEXT,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  emotion_detected TEXT,
  keywords TEXT[],
  support_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add photo mood captures table
CREATE TABLE IF NOT EXISTS photo_mood_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  mood_detected TEXT,
  facial_expression_analysis JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add health metrics table for Discovery Health integration
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  steps_count INTEGER,
  heart_rate_avg INTEGER,
  heart_rate_resting INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  weight_kg DECIMAL(5,2),
  bmi DECIMAL(4,2),
  calories_burned INTEGER,
  active_minutes INTEGER,
  vitality_points INTEGER, -- Discovery Vitality points
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add wellness program participation table
CREATE TABLE IF NOT EXISTS wellness_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL, -- 'fitness', 'nutrition', 'mental_health', 'preventive_care'
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  progress_percentage INTEGER DEFAULT 0,
  goals JSONB,
  achievements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add mental health assessments table
CREATE TABLE IF NOT EXISTS mental_health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'PHQ-9', 'GAD-7', 'PSS', 'custom'
  score INTEGER NOT NULL,
  severity_level TEXT, -- 'minimal', 'mild', 'moderate', 'severe'
  responses JSONB,
  recommendations TEXT[],
  requires_professional_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add support interventions table
CREATE TABLE IF NOT EXISTS support_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_source TEXT NOT NULL, -- 'voice_recording', 'assessment', 'mood_pattern', 'manual'
  trigger_id UUID,
  intervention_type TEXT NOT NULL, -- 'immediate_resources', 'counselor_referral', 'wellness_coach', 'crisis_line'
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'completed', 'declined'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX idx_voice_recordings_created_at ON voice_recordings(created_at DESC);
CREATE INDEX idx_voice_recordings_support_flag ON voice_recordings(support_flag) WHERE support_flag = TRUE;

CREATE INDEX idx_photo_mood_captures_user_id ON photo_mood_captures(user_id);
CREATE INDEX idx_photo_mood_captures_created_at ON photo_mood_captures(created_at DESC);

CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_date ON health_metrics(metric_date DESC);

CREATE INDEX idx_wellness_programs_user_id ON wellness_programs(user_id);
CREATE INDEX idx_wellness_programs_status ON wellness_programs(status);

CREATE INDEX idx_mental_health_assessments_user_id ON mental_health_assessments(user_id);
CREATE INDEX idx_mental_health_assessments_created_at ON mental_health_assessments(created_at DESC);

CREATE INDEX idx_support_interventions_user_id ON support_interventions(user_id);
CREATE INDEX idx_support_interventions_status ON support_interventions(status);

-- Enable Row Level Security
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_mood_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_interventions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own voice recordings"
  ON voice_recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice recordings"
  ON voice_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own photo captures"
  ON photo_mood_captures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photo captures"
  ON photo_mood_captures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own health metrics"
  ON health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own health metrics"
  ON health_metrics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own wellness programs"
  ON wellness_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wellness programs"
  ON wellness_programs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessments"
  ON mental_health_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON mental_health_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own support interventions"
  ON support_interventions FOR SELECT
  USING (auth.uid() = user_id);
