-- MindSync Database Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  therapist_name TEXT,
  therapist_contact TEXT,
  personal_goals TEXT,
  affirmations TEXT,
  crisis_plan TEXT,
  timezone TEXT DEFAULT 'UTC',
  theme_preference TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Mood entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_value INTEGER CHECK (mood_value >= 1 AND mood_value <= 5) NOT NULL,
  notes TEXT,
  emotion_tags TEXT[],
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood_at_time INTEGER CHECK (mood_at_time >= 1 AND mood_at_time <= 5),
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE DEFAULT CURRENT_DATE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_score INTEGER CHECK (energy_score >= 1 AND energy_score <= 10),
  stress_score INTEGER CHECK (stress_score >= 1 AND stress_score <= 10),
  sleep_score INTEGER CHECK (sleep_score >= 1 AND sleep_score <= 10),
  sleep_hours DECIMAL(3,1),
  social_score INTEGER CHECK (social_score >= 1 AND social_score <= 10),
  productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
  anxiety_triggers TEXT[],
  self_care_activities TEXT[],
  water_intake INTEGER,
  exercise_minutes INTEGER,
  medication_taken BOOLEAN,
  gratitude_note TEXT,
  challenges_note TEXT,
  goals_note TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- 5. Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  icon_name TEXT,
  color_gradient TEXT,
  best_for TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Activity completions table
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Breathing sessions table
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  cycles_completed INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Meditation sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meditation_type TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  ambient_sound TEXT,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view own mood_entries" ON mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood_entries" ON mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood_entries" ON mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood_entries" ON mood_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own journal_entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal_entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal_entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal_entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_checkins
CREATE POLICY "Users can view own daily_checkins" ON daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_checkins" ON daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_checkins" ON daily_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_checkins" ON daily_checkins FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_completions
CREATE POLICY "Users can view own activity_completions" ON activity_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity_completions" ON activity_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for breathing_sessions
CREATE POLICY "Users can view own breathing_sessions" ON breathing_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own breathing_sessions" ON breathing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meditation_sessions
CREATE POLICY "Users can view own meditation_sessions" ON meditation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meditation_sessions" ON meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activities are public read
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT TO public USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user ON breathing_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user ON meditation_sessions(user_id, created_at DESC);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample activities
INSERT INTO activities (title, description, duration, icon_name, color_gradient, best_for) VALUES
('Deep Breathing', 'Calm your nervous system with guided breathing', '5 min', 'Wind', 'from-blue-400 to-cyan-400', 'Anxiety, Stress'),
('Gratitude Journal', 'Write down 3 things you are grateful for', '5 min', 'BookOpen', 'from-green-400 to-emerald-400', 'Low Mood, Depression'),
('Body Scan', 'Progressive relaxation from head to toe', '10 min', 'User', 'from-purple-400 to-pink-400', 'Tension, Insomnia'),
('Mindful Walking', 'Take a short walk focusing on your senses', '15 min', 'Footprints', 'from-orange-400 to-amber-400', 'Restlessness, Overthinking'),
('Positive Affirmations', 'Repeat empowering statements', '3 min', 'Heart', 'from-pink-400 to-rose-400', 'Low Self-esteem, Anxiety')
ON CONFLICT DO NOTHING;
