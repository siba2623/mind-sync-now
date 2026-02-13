-- ============================================
-- MENTAL HEALTH TWIN MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Mental Health Twin: Personal Pattern Learning System
-- This migration creates tables for storing personalized insights and predictions

-- User pattern insights (what we've learned about each user)
CREATE TABLE IF NOT EXISTS user_pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'trigger', 'intervention', 'correlation', 'prediction'
  category TEXT NOT NULL, -- 'mood', 'sleep', 'medication', 'activity', 'social'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_points_count INTEGER NOT NULL DEFAULT 0,
  impact_score DECIMAL(3,2), -- How much this affects the user (-1 to 1)
  actionable_recommendation TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ
);

-- Personal correlations (X affects Y for this user)
CREATE TABLE IF NOT EXISTS user_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_type TEXT NOT NULL, -- 'sleep', 'exercise', 'medication', 'weather', 'social'
  factor_value TEXT NOT NULL,
  outcome_type TEXT NOT NULL, -- 'mood', 'anxiety', 'energy', 'focus'
  correlation_coefficient DECIMAL(4,3) NOT NULL, -- -1 to 1
  sample_size INTEGER NOT NULL,
  statistical_significance DECIMAL(4,3), -- p-value
  effect_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal predictions (what might happen)
CREATE TABLE IF NOT EXISTS user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  prediction_type TEXT NOT NULL, -- 'mood', 'risk', 'adherence', 'crisis'
  predicted_value DECIMAL(5,2),
  predicted_category TEXT,
  confidence_level DECIMAL(3,2) NOT NULL,
  contributing_factors JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  actual_value DECIMAL(5,2), -- Filled in after the date passes
  actual_category TEXT,
  prediction_accuracy DECIMAL(3,2), -- How accurate was this prediction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

-- Personal intervention effectiveness (what works for this user)
CREATE TABLE IF NOT EXISTS user_intervention_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL, -- 'breathing', 'meditation', 'exercise', 'social', 'medication'
  intervention_name TEXT NOT NULL,
  times_used INTEGER DEFAULT 0,
  times_effective INTEGER DEFAULT 0,
  effectiveness_rate DECIMAL(3,2), -- 0 to 1
  avg_mood_improvement DECIMAL(4,2),
  avg_time_to_effect INTEGER, -- minutes
  best_time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
  best_context TEXT[], -- ['stressed', 'anxious', 'sad']
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal risk factors (what increases risk for this user)
CREATE TABLE IF NOT EXISTS user_risk_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_factor_type TEXT NOT NULL, -- 'behavioral', 'environmental', 'social', 'biological'
  factor_name TEXT NOT NULL,
  risk_weight DECIMAL(3,2) NOT NULL, -- 0 to 1 (how much this increases risk)
  occurrences_detected INTEGER DEFAULT 0,
  times_led_to_crisis INTEGER DEFAULT 0,
  early_warning_hours INTEGER, -- How many hours before crisis this appears
  mitigation_strategy TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mental Health Twin profile (summary of what we know)
CREATE TABLE IF NOT EXISTS mental_health_twin_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_completeness DECIMAL(3,2) DEFAULT 0, -- 0 to 1
  data_points_collected INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  predictions_made INTEGER DEFAULT 0,
  prediction_accuracy_avg DECIMAL(3,2),
  top_triggers TEXT[],
  top_protective_factors TEXT[],
  most_effective_interventions TEXT[],
  personality_traits JSONB DEFAULT '{}',
  behavioral_patterns JSONB DEFAULT '{}',
  optimal_times JSONB DEFAULT '{}', -- Best times for activities
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pattern_insights_user ON user_pattern_insights(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_type ON user_pattern_insights(insight_type, category);
CREATE INDEX IF NOT EXISTS idx_correlations_user ON user_correlations(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_date ON user_predictions(user_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON user_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_intervention_effectiveness_user ON user_intervention_effectiveness(user_id);
CREATE INDEX IF NOT EXISTS idx_intervention_effectiveness_rate ON user_intervention_effectiveness(effectiveness_rate DESC);
CREATE INDEX IF NOT EXISTS idx_risk_factors_user ON user_risk_factors(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_twin_profile_user ON mental_health_twin_profile(user_id);

-- Row Level Security
ALTER TABLE user_pattern_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intervention_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_twin_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own pattern insights" ON user_pattern_insights;
DROP POLICY IF EXISTS "Users can view own correlations" ON user_correlations;
DROP POLICY IF EXISTS "Users can view own predictions" ON user_predictions;
DROP POLICY IF EXISTS "Users can view own intervention effectiveness" ON user_intervention_effectiveness;
DROP POLICY IF EXISTS "Users can view own risk factors" ON user_risk_factors;
DROP POLICY IF EXISTS "Users can view own twin profile" ON mental_health_twin_profile;
DROP POLICY IF EXISTS "Service role can manage pattern insights" ON user_pattern_insights;
DROP POLICY IF EXISTS "Service role can manage correlations" ON user_correlations;
DROP POLICY IF EXISTS "Service role can manage predictions" ON user_predictions;
DROP POLICY IF EXISTS "Service role can manage intervention effectiveness" ON user_intervention_effectiveness;
DROP POLICY IF EXISTS "Service role can manage risk factors" ON user_risk_factors;
DROP POLICY IF EXISTS "Service role can manage twin profile" ON mental_health_twin_profile;

-- Policies: Users can only see their own data
CREATE POLICY "Users can view own pattern insights"
  ON user_pattern_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own correlations"
  ON user_correlations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own predictions"
  ON user_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intervention effectiveness"
  ON user_intervention_effectiveness FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own risk factors"
  ON user_risk_factors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own twin profile"
  ON mental_health_twin_profile FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update (for ML processing)
CREATE POLICY "Service role can manage pattern insights"
  ON user_pattern_insights FOR ALL
  USING (true);

CREATE POLICY "Service role can manage correlations"
  ON user_correlations FOR ALL
  USING (true);

CREATE POLICY "Service role can manage predictions"
  ON user_predictions FOR ALL
  USING (true);

CREATE POLICY "Service role can manage intervention effectiveness"
  ON user_intervention_effectiveness FOR ALL
  USING (true);

CREATE POLICY "Service role can manage risk factors"
  ON user_risk_factors FOR ALL
  USING (true);

CREATE POLICY "Service role can manage twin profile"
  ON mental_health_twin_profile FOR ALL
  USING (true);

-- Function to update twin profile completeness
CREATE OR REPLACE FUNCTION update_twin_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO mental_health_twin_profile (user_id, profile_completeness, data_points_collected, insights_generated, predictions_made, prediction_accuracy_avg, updated_at)
  VALUES (
    NEW.user_id,
    LEAST(1.0, (SELECT COUNT(*) FROM mood_entries WHERE user_id = NEW.user_id)::DECIMAL / 30),
    (SELECT COUNT(*) FROM mood_entries WHERE user_id = NEW.user_id) + (SELECT COUNT(*) FROM health_metrics WHERE user_id = NEW.user_id),
    (SELECT COUNT(*) FROM user_pattern_insights WHERE user_id = NEW.user_id AND is_active = true),
    (SELECT COUNT(*) FROM user_predictions WHERE user_id = NEW.user_id),
    (SELECT AVG(prediction_accuracy) FROM user_predictions WHERE user_id = NEW.user_id AND prediction_accuracy IS NOT NULL),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    data_points_collected = (
      SELECT COUNT(*) FROM mood_entries WHERE user_id = NEW.user_id
    ) + (
      SELECT COUNT(*) FROM health_metrics WHERE user_id = NEW.user_id
    ),
    insights_generated = (
      SELECT COUNT(*) FROM user_pattern_insights WHERE user_id = NEW.user_id AND is_active = true
    ),
    predictions_made = (
      SELECT COUNT(*) FROM user_predictions WHERE user_id = NEW.user_id
    ),
    prediction_accuracy_avg = (
      SELECT AVG(prediction_accuracy) 
      FROM user_predictions 
      WHERE user_id = NEW.user_id AND prediction_accuracy IS NOT NULL
    ),
    profile_completeness = LEAST(1.0, (
      SELECT COUNT(*) FROM mood_entries WHERE user_id = NEW.user_id
    )::DECIMAL / 30),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_twin_profile_on_insight ON user_pattern_insights;

-- Trigger to auto-update profile
CREATE TRIGGER update_twin_profile_on_insight
  AFTER INSERT ON user_pattern_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_twin_profile_completeness();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Mental Health Twin tables created successfully!';
  RAISE NOTICE 'Tables: user_pattern_insights, user_correlations, user_predictions, user_intervention_effectiveness, user_risk_factors, mental_health_twin_profile';
END $$;
