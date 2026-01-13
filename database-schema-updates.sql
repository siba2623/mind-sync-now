-- Additional tables for wellness features
-- Run these in your Supabase SQL editor

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_score INTEGER CHECK (energy_score >= 1 AND energy_score <= 10),
  stress_score INTEGER CHECK (stress_score >= 1 AND stress_score <= 10),
  sleep_score INTEGER CHECK (sleep_score >= 1 AND sleep_score <= 10),
  social_score INTEGER CHECK (social_score >= 1 AND social_score <= 10),
  productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
  gratitude_note TEXT,
  challenges_note TEXT,
  goals_note TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breathing sessions table
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  cycles_completed INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meditation sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meditation_type TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  ambient_sound TEXT,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit tracking table
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'wellness', 'fitness', 'mindfulness', 'productivity'
  target_frequency INTEGER DEFAULT 1, -- times per day
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'target',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Wellness goals table
CREATE TABLE IF NOT EXISTS wellness_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'mental_health', 'physical_health', 'relationships', 'personal_growth'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  unit TEXT, -- 'days', 'times', 'minutes', etc.
  target_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sleep tracking table
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIME,
  wake_time TIME,
  sleep_duration_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sleep_date)
);

-- Crisis resources table (static data)
CREATE TABLE IF NOT EXISTS crisis_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  phone_number TEXT,
  website_url TEXT,
  description TEXT,
  category TEXT NOT NULL, -- 'suicide_prevention', 'crisis_text', 'mental_health', 'domestic_violence'
  is_24_7 BOOLEAN DEFAULT FALSE,
  languages TEXT[], -- array of language codes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  tags TEXT[],
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own daily_checkins" ON daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_checkins" ON daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_checkins" ON daily_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_checkins" ON daily_checkins FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own breathing_sessions" ON breathing_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own breathing_sessions" ON breathing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own meditation_sessions" ON meditation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meditation_sessions" ON meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit_completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit_completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit_completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wellness_goals" ON wellness_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellness_goals" ON wellness_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wellness_goals" ON wellness_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wellness_goals" ON wellness_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep_entries" ON sleep_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_entries" ON sleep_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_entries" ON sleep_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_entries" ON sleep_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal_entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal_entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal_entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal_entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Crisis resources are public (no RLS needed)
CREATE POLICY "Anyone can view crisis_resources" ON crisis_resources FOR SELECT TO public USING (true);

-- Insert some sample crisis resources
INSERT INTO crisis_resources (country_code, organization_name, phone_number, website_url, description, category, is_24_7, languages) VALUES
('US', 'National Suicide Prevention Lifeline', '988', 'https://suicidepreventionlifeline.org', 'Free and confidential emotional support', 'suicide_prevention', true, ARRAY['en', 'es']),
('US', 'Crisis Text Line', 'Text HOME to 741741', 'https://crisistextline.org', 'Free crisis support via text message', 'crisis_text', true, ARRAY['en', 'es']),
('US', 'NAMI National Helpline', '1-800-950-NAMI', 'https://nami.org', 'Mental health information and support', 'mental_health', false, ARRAY['en']),
('UK', 'Samaritans', '116 123', 'https://samaritans.org', 'Free emotional support for anyone in distress', 'suicide_prevention', true, ARRAY['en']),
('CA', 'Talk Suicide Canada', '1-833-456-4566', 'https://talksuicide.ca', '24/7 suicide prevention service', 'suicide_prevention', true, ARRAY['en', 'fr']),
('AU', 'Lifeline', '13 11 14', 'https://lifeline.org.au', '24-hour crisis support and suicide prevention', 'suicide_prevention', true, ARRAY['en']);

-- Create indexes for better performance
CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, created_at DESC);
CREATE INDEX idx_breathing_sessions_user_date ON breathing_sessions(user_id, created_at DESC);
CREATE INDEX idx_meditation_sessions_user_date ON meditation_sessions(user_id, created_at DESC);
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, completed_at DESC);
CREATE INDEX idx_wellness_goals_user_status ON wellness_goals(user_id, status);
CREATE INDEX idx_sleep_entries_user_date ON sleep_entries(user_id, sleep_date DESC);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_crisis_resources_country ON crisis_resources(country_code, category);