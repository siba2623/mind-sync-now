-- Gamification & Rewards System Database Schema
-- Migration: 20260210_gamification_system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER GAMIFICATION PROFILE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Points & Level
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  points_to_next_level INTEGER DEFAULT 100,
  
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  streak_freezes_available INTEGER DEFAULT 0,
  
  -- Stats
  total_badges_earned INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  total_activities_completed INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_user_gamification_level ON user_gamification(current_level DESC);
CREATE INDEX idx_user_gamification_points ON user_gamification(total_points DESC);
CREATE INDEX idx_user_gamification_streak ON user_gamification(current_streak DESC);

-- ============================================================================
-- BADGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- wellness, meditation, mood, activity, peer, medication, journal, breathing
  tier TEXT NOT NULL, -- bronze, silver, gold, platinum, diamond
  icon TEXT NOT NULL, -- emoji or icon name
  points_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL, -- streak, count, milestone
  requirement_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_tier ON badges(tier);

-- ============================================================================
-- USER BADGES (Earned)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_showcased BOOLEAN DEFAULT false,
  
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX idx_user_badges_showcased ON user_badges(is_showcased) WHERE is_showcased = true;

-- ============================================================================
-- CHALLENGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- daily, weekly, special
  category TEXT NOT NULL, -- mood, meditation, activity, journal, breathing, social
  
  -- Requirements
  requirement_type TEXT NOT NULL, -- count, duration, streak
  requirement_value INTEGER NOT NULL,
  
  -- Rewards
  points_reward INTEGER NOT NULL,
  badge_reward_id UUID REFERENCES badges(id),
  
  -- Timing
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_challenges_type ON challenges(challenge_type);
CREATE INDEX idx_challenges_active ON challenges(is_active) WHERE is_active = true;
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);

-- ============================================================================
-- USER CHALLENGES (Progress)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Progress
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_completed ON user_challenges(is_completed);
CREATE INDEX idx_user_challenges_active ON user_challenges(user_id, is_completed) WHERE is_completed = false;

-- ============================================================================
-- REWARDS SHOP
-- ============================================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- theme, avatar, feature, charity, premium
  cost_points INTEGER NOT NULL,
  icon TEXT,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER, -- NULL = unlimited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rewards_category ON rewards(category);
CREATE INDEX idx_rewards_available ON rewards(is_available) WHERE is_available = true;

-- ============================================================================
-- USER REWARDS (Purchased)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_active ON user_rewards(is_active) WHERE is_active = true;

-- ============================================================================
-- POINTS TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL, -- positive for earn, negative for spend
  transaction_type TEXT NOT NULL, -- earn, spend, bonus, penalty
  source TEXT NOT NULL, -- checkin, mood, meditation, activity, challenge, reward, etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX idx_points_transactions_type ON points_transactions(transaction_type);

-- ============================================================================
-- LEADERBOARDS (Materialized View)
-- ============================================================================
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT 
  ug.user_id,
  p.id as profile_id,
  COALESCE(SUM(pt.points_change), 0) as weekly_points,
  ug.current_level,
  ug.current_streak,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pt.points_change), 0) DESC) as rank
FROM user_gamification ug
JOIN profiles p ON ug.user_id = p.id
LEFT JOIN points_transactions pt ON ug.user_id = pt.user_id 
  AND pt.created_at >= NOW() - INTERVAL '7 days'
  AND pt.points_change > 0
GROUP BY ug.user_id, p.id, ug.current_level, ug.current_streak
ORDER BY weekly_points DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_leaderboard_weekly_user ON leaderboard_weekly(user_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_leaderboard_weekly()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- User Gamification Policies
CREATE POLICY "Users can view their own gamification data"
  ON user_gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification data"
  ON user_gamification FOR UPDATE
  USING (auth.uid() = user_id);

-- User Badges Policies
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view showcased badges of others"
  ON user_badges FOR SELECT
  USING (is_showcased = true);

-- User Challenges Policies
CREATE POLICY "Users can view their own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- User Rewards Policies
CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Points Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON points_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Public read for badges, challenges, rewards
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
  ON badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view available rewards"
  ON rewards FOR SELECT
  USING (is_available = true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Insert transaction
  INSERT INTO points_transactions (user_id, points_change, transaction_type, source, description)
  VALUES (p_user_id, p_points, 'earn', p_source, p_description);
  
  -- Update user gamification
  UPDATE user_gamification
  SET 
    total_points = total_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING total_points INTO v_new_total;
  
  -- Calculate new level (100 points per level, exponential growth)
  v_new_level := FLOOR(SQRT(v_new_total / 100)) + 1;
  
  -- Update level if changed
  UPDATE user_gamification
  SET 
    current_level = v_new_level,
    points_to_next_level = (POWER(v_new_level, 2) * 100) - v_new_total
  WHERE user_id = p_user_id AND current_level != v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_checkin DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT last_checkin_date, current_streak
  INTO v_last_checkin, v_current_streak
  FROM user_gamification
  WHERE user_id = p_user_id;
  
  -- Check if already checked in today
  IF v_last_checkin = CURRENT_DATE THEN
    RETURN v_current_streak;
  END IF;
  
  -- Check if streak continues (yesterday) or breaks
  IF v_last_checkin = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Update gamification
  UPDATE user_gamification
  SET 
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_checkin_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Award streak milestone points
  IF v_new_streak = 7 THEN
    PERFORM award_points(p_user_id, 50, 'streak_milestone', '7-day streak!');
  ELSIF v_new_streak = 30 THEN
    PERFORM award_points(p_user_id, 200, 'streak_milestone', '30-day streak!');
  ELSIF v_new_streak = 100 THEN
    PERFORM award_points(p_user_id, 1000, 'streak_milestone', '100-day streak!');
  ELSIF v_new_streak = 365 THEN
    PERFORM award_points(p_user_id, 5000, 'streak_milestone', '365-day streak!');
  END IF;
  
  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_badge_eligibility(p_user_id UUID, p_category TEXT)
RETURNS void AS $$
DECLARE
  v_badge RECORD;
  v_count INTEGER;
BEGIN
  FOR v_badge IN 
    SELECT * FROM badges 
    WHERE category = p_category 
    AND is_active = true
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
  LOOP
    -- Check if user meets requirements
    CASE v_badge.requirement_type
      WHEN 'streak' THEN
        SELECT current_streak INTO v_count FROM user_gamification WHERE user_id = p_user_id;
      WHEN 'count' THEN
        -- This would check specific activity counts based on category
        v_count := 0; -- Placeholder
      ELSE
        v_count := 0;
    END CASE;
    
    -- Award badge if eligible
    IF v_count >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      
      -- Award points
      PERFORM award_points(p_user_id, v_badge.points_reward, 'badge_earned', 'Earned: ' || v_badge.name);
      
      -- Update badge count
      UPDATE user_gamification
      SET total_badges_earned = total_badges_earned + 1
      WHERE user_id = p_user_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default badges
INSERT INTO badges (name, description, category, tier, icon, points_reward, requirement_type, requirement_value) VALUES
  -- Streak badges
  ('Week Warrior', 'Maintain a 7-day streak', 'wellness', 'bronze', '🔥', 50, 'streak', 7),
  ('Month Master', 'Maintain a 30-day streak', 'wellness', 'silver', '🔥', 200, 'streak', 30),
  ('Century Champion', 'Maintain a 100-day streak', 'wellness', 'gold', '🔥', 1000, 'streak', 100),
  ('Year Legend', 'Maintain a 365-day streak', 'wellness', 'diamond', '🔥', 5000, 'streak', 365),
  
  -- Meditation badges
  ('Meditation Novice', 'Complete 10 meditation sessions', 'meditation', 'bronze', '🧘', 30, 'count', 10),
  ('Meditation Adept', 'Complete 50 meditation sessions', 'meditation', 'silver', '🧘', 150, 'count', 50),
  ('Meditation Master', 'Complete 200 meditation sessions', 'meditation', 'gold', '🧘', 500, 'count', 200),
  
  -- Mood tracking badges
  ('Mood Tracker', 'Log mood 30 times', 'mood', 'bronze', '😊', 25, 'count', 30),
  ('Emotion Expert', 'Log mood 100 times', 'mood', 'silver', '😊', 100, 'count', 100),
  ('Feeling Master', 'Log mood 365 times', 'mood', 'gold', '😊', 400, 'count', 365);

-- Insert default challenges
INSERT INTO challenges (title, description, challenge_type, category, requirement_type, requirement_value, points_reward, is_active) VALUES
  -- Daily challenges
  ('Daily Mood Check', 'Log your mood 3 times today', 'daily', 'mood', 'count', 3, 20, true),
  ('Meditation Monday', 'Meditate for 10 minutes', 'daily', 'meditation', 'duration', 10, 30, true),
  ('Activity Day', 'Complete 2 wellness activities', 'daily', 'activity', 'count', 2, 25, true),
  ('Journal Journey', 'Write a journal entry', 'daily', 'journal', 'count', 1, 15, true),
  ('Breathing Break', 'Do 3 breathing exercises', 'daily', 'breathing', 'count', 3, 20, true),
  
  -- Weekly challenges
  ('Weekly Warrior', 'Maintain your streak for 7 days', 'weekly', 'wellness', 'streak', 7, 100, true),
  ('Meditation Week', 'Meditate 5 times this week', 'weekly', 'meditation', 'count', 5, 150, true),
  ('Activity Champion', 'Complete 10 activities this week', 'weekly', 'activity', 'count', 10, 200, true);

-- Insert default rewards
INSERT INTO rewards (name, description, category, cost_points, icon, is_available) VALUES
  ('Streak Freeze', 'Save your streak for one missed day', 'feature', 200, '❄️', true),
  ('Ocean Theme', 'Unlock calming ocean theme', 'theme', 500, '🌊', true),
  ('Forest Theme', 'Unlock peaceful forest theme', 'theme', 500, '🌲', true),
  ('Sunset Theme', 'Unlock beautiful sunset theme', 'theme', 500, '🌅', true),
  ('Custom Avatar', 'Unlock unique profile avatar', 'avatar', 300, '🎭', true),
  ('Badge Showcase', 'Display 5 more badges on profile', 'feature', 100, '🏆', true),
  ('Ad-Free Month', 'Remove ads for 30 days', 'premium', 800, '🚫', true),
  ('Priority Support', 'Jump the support queue', 'premium', 1000, '⚡', true),
  ('Charity Donation', 'We donate $5 to mental health charity', 'charity', 500, '❤️', true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Gamification system created successfully!';
  RAISE NOTICE 'Created 10 default badges';
  RAISE NOTICE 'Created 8 default challenges';
  RAISE NOTICE 'Created 9 default rewards';
END $$;
