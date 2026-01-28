-- Enhanced Features Migration
-- Social Support, Therapist Matching, Notifications

-- Therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  experience INTEGER NOT NULL,
  availability TEXT[] NOT NULL,
  session_types TEXT[] NOT NULL,
  rate INTEGER NOT NULL,
  discovery_network BOOLEAN DEFAULT false,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Therapist bookings
CREATE TABLE IF NOT EXISTS therapist_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id BIGINT REFERENCES therapists(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('in-person', 'video', 'phone')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support groups
CREATE TABLE IF NOT EXISTS support_groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  moderator_id UUID REFERENCES auth.users(id),
  moderator_name TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES support_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES support_groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Post replies
CREATE TABLE IF NOT EXISTS post_replies (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accountability buddies
CREATE TABLE IF NOT EXISTS buddy_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, buddy_id)
);

-- Buddy check-ins
CREATE TABLE IF NOT EXISTS buddy_checkins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  medication_reminders BOOLEAN DEFAULT true,
  daily_checkin BOOLEAN DEFAULT true,
  crisis_alerts BOOLEAN DEFAULT true,
  wellness_tips BOOLEAN DEFAULT true,
  community_updates BOOLEAN DEFAULT true,
  therapist_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (language, theme, etc.)
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'zu', 'xh', 'af', 'st')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapist_bookings_user ON therapist_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_therapist_bookings_therapist ON therapist_bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_bookings_date ON therapist_bookings(session_date);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group ON community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled ON scheduled_notifications(scheduled_at);

-- Row Level Security (RLS)
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Therapists: Public read, admin write
CREATE POLICY "Therapists are viewable by everyone" ON therapists FOR SELECT USING (true);

-- Therapist bookings: Users can view and create their own
CREATE POLICY "Users can view their own bookings" ON therapist_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON therapist_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON therapist_bookings FOR UPDATE USING (auth.uid() = user_id);

-- Support groups: Public read
CREATE POLICY "Support groups are viewable by everyone" ON support_groups FOR SELECT USING (is_active = true);

-- Group memberships: Users manage their own
CREATE POLICY "Users can view group memberships" ON group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_memberships FOR DELETE USING (auth.uid() = user_id);

-- Community posts: Members can view, create in their groups
CREATE POLICY "Users can view posts in their groups" ON community_posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_memberships 
    WHERE group_memberships.group_id = community_posts.group_id 
    AND group_memberships.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create posts in their groups" ON community_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM group_memberships 
    WHERE group_memberships.group_id = community_posts.group_id 
    AND group_memberships.user_id = auth.uid()
  )
);

-- Post likes: Users manage their own
CREATE POLICY "Users can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post replies: Users can view and create
CREATE POLICY "Users can view replies" ON post_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON post_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Buddy requests: Users manage their own
CREATE POLICY "Users can view their buddy requests" ON buddy_requests FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = buddy_id
);
CREATE POLICY "Users can create buddy requests" ON buddy_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update buddy requests" ON buddy_requests FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = buddy_id
);

-- Buddy check-ins: Users manage their own
CREATE POLICY "Users can view their buddy checkins" ON buddy_checkins FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = buddy_id
);
CREATE POLICY "Users can create buddy checkins" ON buddy_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification preferences: Users manage their own
CREATE POLICY "Users can view their notification preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notification preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify their notification preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Scheduled notifications: Users view their own
CREATE POLICY "Users can view their scheduled notifications" ON scheduled_notifications FOR SELECT USING (auth.uid() = user_id);

-- User preferences: Users manage their own
CREATE POLICY "Users can view their preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample therapists
INSERT INTO therapists (name, title, specializations, languages, location, rating, reviews, experience, availability, session_types, rate, discovery_network, bio) VALUES
('Dr. Thandi Mthembu', 'Clinical Psychologist', ARRAY['Anxiety', 'Depression', 'Trauma', 'CBT'], ARRAY['English', 'isiZulu', 'isiXhosa'], 'Sandton, Johannesburg', 4.9, 127, 12, ARRAY['Mon', 'Wed', 'Fri'], ARRAY['in-person', 'video'], 950, true, 'Specializing in trauma-informed care with a focus on culturally sensitive approaches.'),
('Dr. Johan van der Merwe', 'Psychiatrist', ARRAY['Bipolar', 'Schizophrenia', 'Medication Management'], ARRAY['English', 'Afrikaans'], 'Cape Town CBD', 4.8, 89, 18, ARRAY['Tue', 'Thu'], ARRAY['in-person', 'video', 'phone'], 1200, true, 'Board-certified psychiatrist with expertise in complex mood disorders.'),
('Lerato Khumalo', 'Counselling Psychologist', ARRAY['Stress Management', 'Relationships', 'Life Transitions'], ARRAY['English', 'Sesotho', 'Setswana'], 'Pretoria East', 4.7, 64, 8, ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ARRAY['video', 'phone'], 750, true, 'Warm, empathetic approach to helping young professionals navigate life challenges.');

-- Insert sample support groups
INSERT INTO support_groups (name, description, category, moderator_name, member_count) VALUES
('Anxiety Warriors', 'A safe space for those managing anxiety. Share coping strategies and support each other.', 'Anxiety', 'Dr. Thandi Mthembu', 1247),
('Depression Support Circle', 'Connect with others who understand. Moderated by licensed therapists.', 'Depression', 'Dr. Johan van der Merwe', 892),
('Young Professionals Wellness', 'Navigate work stress, burnout, and career challenges together.', 'Stress', 'Lerato Khumalo', 2134),
('PTSD Recovery', 'Trauma-informed peer support with professional guidance.', 'Trauma', 'Dr. Thandi Mthembu', 456);
