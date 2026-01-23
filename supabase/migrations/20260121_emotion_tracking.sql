-- Emotion Tracking Tables for How We Feel Integration
-- Created: 2026-01-21

-- Table for emotion vocabulary entries
CREATE TABLE IF NOT EXISTS emotion_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    emotion TEXT NOT NULL,
    category TEXT NOT NULL, -- pleasant_high, pleasant_low, unpleasant_high, unpleasant_low
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10), -- 1-10 scale
    context TEXT, -- optional context about the emotion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for regulation strategy usage
CREATE TABLE IF NOT EXISTS strategy_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    strategy_id INTEGER NOT NULL, -- ID from the strategies object
    strategy_name TEXT NOT NULL,
    category TEXT NOT NULL, -- thinking, movement, mindfulness, social
    helpful BOOLEAN NOT NULL, -- whether user found it helpful
    emotion_context TEXT, -- what emotion they were feeling when they used it
    duration_minutes INTEGER, -- how long they spent on the strategy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emotion_entries_user_id ON emotion_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_entries_created_at ON emotion_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_emotion_entries_category ON emotion_entries(category);
CREATE INDEX IF NOT EXISTS idx_emotion_entries_emotion ON emotion_entries(emotion);

CREATE INDEX IF NOT EXISTS idx_strategy_usage_user_id ON strategy_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_usage_created_at ON strategy_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_strategy_usage_category ON strategy_usage(category);
CREATE INDEX IF NOT EXISTS idx_strategy_usage_helpful ON strategy_usage(helpful);
CREATE INDEX IF NOT EXISTS idx_strategy_usage_strategy_id ON strategy_usage(strategy_id);

-- Row Level Security (RLS)
ALTER TABLE emotion_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view their own emotion entries" ON emotion_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotion entries" ON emotion_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emotion entries" ON emotion_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotion entries" ON emotion_entries
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own strategy usage" ON strategy_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategy usage" ON strategy_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategy usage" ON strategy_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategy usage" ON strategy_usage
    FOR DELETE USING (auth.uid() = user_id);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_emotion_entries_updated_at 
    BEFORE UPDATE ON emotion_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_usage_updated_at 
    BEFORE UPDATE ON strategy_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing (optional)
-- INSERT INTO emotion_entries (user_id, emotion, category, intensity, context) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'Anxious', 'unpleasant_high', 7, 'Work presentation tomorrow'),
-- ('00000000-0000-0000-0000-000000000000', 'Calm', 'pleasant_low', 8, 'After meditation session'),
-- ('00000000-0000-0000-0000-000000000000', 'Excited', 'pleasant_high', 9, 'Got promoted at work');

-- INSERT INTO strategy_usage (user_id, strategy_id, strategy_name, category, helpful, emotion_context) VALUES
-- ('00000000-0000-0000-0000-000000000000', 7, 'Box Breathing', 'mindfulness', true, 'Anxious'),
-- ('00000000-0000-0000-0000-000000000000', 1, 'Reframe Your Thoughts', 'thinking', true, 'Worried'),
-- ('00000000-0000-0000-0000-000000000000', 5, 'Emotional Release Shake', 'movement', false, 'Frustrated');

COMMENT ON TABLE emotion_entries IS 'Stores user emotion vocabulary selections based on Yale research';
COMMENT ON TABLE strategy_usage IS 'Tracks usage and effectiveness of regulation strategies';

COMMENT ON COLUMN emotion_entries.category IS 'Emotion quadrant: pleasant_high, pleasant_low, unpleasant_high, unpleasant_low';
COMMENT ON COLUMN emotion_entries.intensity IS 'Emotion intensity on 1-10 scale';
COMMENT ON COLUMN strategy_usage.strategy_id IS 'References strategy ID from RegulationStrategies component';
COMMENT ON COLUMN strategy_usage.helpful IS 'User feedback on strategy effectiveness';
COMMENT ON COLUMN strategy_usage.duration_minutes IS 'Time spent on strategy (for analytics)';