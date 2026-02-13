-- Real-Time Peer Support Network Database Schema
-- Migration: 20260210_peer_support_network

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PEER SUPPORT PROFILES
-- ============================================================================
CREATE TABLE peer_support_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 30),
  avatar_color TEXT NOT NULL DEFAULT '#6366f1',
  bio TEXT CHECK (char_length(bio) <= 200),
  conditions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  reputation_score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id),
  CONSTRAINT valid_avatar_color CHECK (avatar_color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_peer_profiles_user_id ON peer_support_profiles(user_id);
CREATE INDEX idx_peer_profiles_active ON peer_support_profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_peer_profiles_conditions ON peer_support_profiles USING GIN(conditions);

-- ============================================================================
-- SUPPORT GROUPS
-- ============================================================================
CREATE TABLE support_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  category TEXT NOT NULL, -- depression, anxiety, bipolar, ptsd, general, etc.
  group_type TEXT NOT NULL DEFAULT 'condition', -- condition, topic, general
  max_members INTEGER DEFAULT 50 CHECK (max_members > 0 AND max_members <= 100),
  is_moderated BOOLEAN DEFAULT true,
  moderator_ids UUID[] DEFAULT '{}',
  guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_groups_category ON support_groups(category);
CREATE INDEX idx_support_groups_active ON support_groups(is_active) WHERE is_active = true;
CREATE INDEX idx_support_groups_last_activity ON support_groups(last_activity DESC);

-- ============================================================================
-- GROUP MEMBERSHIPS
-- ============================================================================
CREATE TABLE group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  peer_profile_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT false,
  
  UNIQUE(group_id, peer_profile_id)
);

CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_profile ON group_memberships(peer_profile_id);
CREATE INDEX idx_group_memberships_role ON group_memberships(role);

-- ============================================================================
-- CHAT MESSAGES
-- ============================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES support_groups(id) ON DELETE CASCADE,
  buddy_pair_id UUID, -- Will reference buddy_pairs table
  sender_profile_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  message_type TEXT NOT NULL DEFAULT 'text', -- text, voice, system
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT message_belongs_to_group_or_buddy CHECK (
    (group_id IS NOT NULL AND buddy_pair_id IS NULL) OR
    (group_id IS NULL AND buddy_pair_id IS NOT NULL)
  )
);

CREATE INDEX idx_chat_messages_group ON chat_messages(group_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_messages_buddy ON chat_messages(buddy_pair_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_profile_id);
CREATE INDEX idx_chat_messages_flagged ON chat_messages(is_flagged) WHERE is_flagged = true;

-- ============================================================================
-- BUDDY PAIRS
-- ============================================================================
CREATE TABLE buddy_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_1_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  profile_2_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, ended
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  ended_at TIMESTAMP WITH TIME ZONE,
  match_score INTEGER DEFAULT 0,
  
  CONSTRAINT different_profiles CHECK (profile_1_id != profile_2_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'ended'))
);

CREATE INDEX idx_buddy_pairs_profile1 ON buddy_pairs(profile_1_id);
CREATE INDEX idx_buddy_pairs_profile2 ON buddy_pairs(profile_2_id);
CREATE INDEX idx_buddy_pairs_status ON buddy_pairs(status);

-- ============================================================================
-- MODERATION LOGS
-- ============================================================================
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  reported_by_profile_id UUID REFERENCES peer_support_profiles(id) ON DELETE SET NULL,
  moderator_id UUID REFERENCES peer_support_profiles(id) ON DELETE SET NULL,
  action_taken TEXT NOT NULL, -- warning, timeout, ban, none, deleted
  reason TEXT NOT NULL,
  ai_confidence FLOAT CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_moderation_logs_message ON moderation_logs(message_id);
CREATE INDEX idx_moderation_logs_created ON moderation_logs(created_at DESC);
CREATE INDEX idx_moderation_logs_unresolved ON moderation_logs(resolved_at) WHERE resolved_at IS NULL;

-- ============================================================================
-- USER REPORTS
-- ============================================================================
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_profile_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  reported_profile_id UUID NOT NULL REFERENCES peer_support_profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT CHECK (char_length(description) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT cannot_report_self CHECK (reporter_profile_id != reported_profile_id)
);

CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_profile_id);
CREATE INDEX idx_user_reports_reported ON user_reports(reported_profile_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_pending ON user_reports(created_at DESC) WHERE status = 'pending';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Peer Support Profiles
ALTER TABLE peer_support_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active peer profiles"
  ON peer_support_profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own peer profile"
  ON peer_support_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own peer profile"
  ON peer_support_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Support Groups
ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active support groups"
  ON support_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage support groups"
  ON support_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE user_id = auth.uid() AND reputation_score >= 100
    )
  );

-- Group Memberships
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships of groups they're in"
  ON group_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = peer_profile_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM group_memberships gm
      JOIN peer_support_profiles psp ON gm.peer_profile_id = psp.id
      WHERE gm.group_id = group_memberships.group_id AND psp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups"
  ON group_memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = peer_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave groups"
  ON group_memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = peer_profile_id AND user_id = auth.uid()
    )
  );

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their groups"
  ON chat_messages FOR SELECT
  USING (
    deleted_at IS NULL AND (
      EXISTS (
        SELECT 1 FROM group_memberships gm
        JOIN peer_support_profiles psp ON gm.peer_profile_id = psp.id
        WHERE gm.group_id = chat_messages.group_id AND psp.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM buddy_pairs bp
        JOIN peer_support_profiles psp1 ON bp.profile_1_id = psp1.id
        JOIN peer_support_profiles psp2 ON bp.profile_2_id = psp2.id
        WHERE bp.id = chat_messages.buddy_pair_id 
        AND (psp1.user_id = auth.uid() OR psp2.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can send messages to their groups"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = sender_profile_id AND user_id = auth.uid()
    )
    AND (
      EXISTS (
        SELECT 1 FROM group_memberships gm
        WHERE gm.group_id = chat_messages.group_id AND gm.peer_profile_id = sender_profile_id
      )
      OR
      EXISTS (
        SELECT 1 FROM buddy_pairs bp
        WHERE bp.id = chat_messages.buddy_pair_id 
        AND (bp.profile_1_id = sender_profile_id OR bp.profile_2_id = sender_profile_id)
        AND bp.status = 'active'
      )
    )
  );

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = sender_profile_id AND user_id = auth.uid()
    )
  );

-- Buddy Pairs
ALTER TABLE buddy_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own buddy pairs"
  ON buddy_pairs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE (id = profile_1_id OR id = profile_2_id) AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create buddy pairs"
  ON buddy_pairs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = profile_1_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their buddy pairs"
  ON buddy_pairs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE (id = profile_1_id OR id = profile_2_id) AND user_id = auth.uid()
    )
  );

-- User Reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = reporter_profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own reports"
  ON user_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles
      WHERE id = reporter_profile_id AND user_id = auth.uid()
    )
  );

-- Moderation Logs (moderators only)
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view moderation logs"
  ON moderation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peer_support_profiles psp
      JOIN group_memberships gm ON psp.id = gm.peer_profile_id
      WHERE psp.user_id = auth.uid() AND gm.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can create moderation logs"
  ON moderation_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM peer_support_profiles psp
      JOIN group_memberships gm ON psp.id = gm.peer_profile_id
      WHERE psp.user_id = auth.uid() AND gm.role IN ('moderator', 'admin')
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get group member count
CREATE OR REPLACE FUNCTION get_group_member_count(group_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM group_memberships
  WHERE group_id = group_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to update last activity on message insert
CREATE OR REPLACE FUNCTION update_group_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_id IS NOT NULL THEN
    UPDATE support_groups
    SET last_activity = NEW.created_at
    WHERE id = NEW.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_activity
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_group_last_activity();

-- Function to update peer profile last_active
CREATE OR REPLACE FUNCTION update_peer_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE peer_support_profiles
  SET last_active = NOW()
  WHERE id = NEW.sender_profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_peer_active
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_peer_last_active();

-- Function to prevent joining full groups
CREATE OR REPLACE FUNCTION check_group_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_members INTEGER;
  max_capacity INTEGER;
BEGIN
  SELECT COUNT(*), sg.max_members
  INTO current_members, max_capacity
  FROM group_memberships gm
  JOIN support_groups sg ON gm.group_id = sg.id
  WHERE gm.group_id = NEW.group_id
  GROUP BY sg.max_members;
  
  IF current_members >= max_capacity THEN
    RAISE EXCEPTION 'Group is at maximum capacity';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_group_capacity
  BEFORE INSERT ON group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION check_group_capacity();

-- ============================================================================
-- SEED DATA (Default Support Groups)
-- ============================================================================

INSERT INTO support_groups (name, description, category, group_type, guidelines) VALUES
  ('Depression Support Circle', 'A safe space for those experiencing depression to share and support each other', 'depression', 'condition', 'Be kind, listen actively, no medical advice, respect privacy'),
  ('Anxiety Warriors', 'Connect with others managing anxiety and panic', 'anxiety', 'condition', 'Share coping strategies, be supportive, no judgment'),
  ('Bipolar Balance', 'Support for those living with bipolar disorder', 'bipolar', 'condition', 'Respect mood variations, share experiences, professional care is essential'),
  ('PTSD Recovery', 'Healing together from trauma', 'ptsd', 'condition', 'Trigger warnings required, gentle support, respect boundaries'),
  ('Medication Side Effects', 'Discuss experiences with psychiatric medications', 'medication', 'topic', 'Share experiences only, not medical advice, consult your doctor'),
  ('Work & Mental Health', 'Balancing career and mental wellness', 'work', 'topic', 'Professional boundaries, no employer names, supportive advice'),
  ('New to Therapy', 'For those starting their therapy journey', 'therapy', 'topic', 'Encourage professional help, share experiences, respect privacy'),
  ('General Wellness', 'Open discussion for all mental health topics', 'general', 'general', 'Be respectful, supportive, and kind to all members');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Peer Support Network schema created successfully!';
  RAISE NOTICE 'Created 8 default support groups';
  RAISE NOTICE 'Run this migration in Supabase SQL Editor';
END $$;
