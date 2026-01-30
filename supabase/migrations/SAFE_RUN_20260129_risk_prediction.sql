-- SAFE VERSION: Risk Prediction System Migration
-- This version creates tables first, then handles policies
-- Run this in Supabase SQL Editor

-- Create tables FIRST (IF NOT EXISTS prevents errors)
CREATE TABLE IF NOT EXISTS risk_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
    risk_score DECIMAL(3,2) CHECK (risk_score BETWEEN 0.00 AND 1.00),
    contributing_factors JSONB,
    recommended_actions JSONB,
    reviewed_by_clinician BOOLEAN DEFAULT FALSE,
    clinician_id UUID REFERENCES auth.users(id),
    clinician_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    intervention_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_coordinator_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES risk_assessments(assessment_id),
    alert_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    details JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'escalated')),
    assigned_to VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_encrypted BYTEA NOT NULL,
    email_encrypted BYTEA,
    alert_enabled BOOLEAN DEFAULT TRUE,
    priority_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER,
    activities_completed INTEGER DEFAULT 0,
    features_used JSONB,
    device_type VARCHAR(50),
    app_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    taken_time TIMESTAMP WITH TIME ZONE,
    missed_reason VARCHAR(255),
    side_effects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discovery_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    discovery_member_number VARCHAR(50) UNIQUE NOT NULL,
    plan_type VARCHAR(50),
    vitality_status VARCHAR(20),
    counseling_sessions_remaining INTEGER DEFAULT 0,
    psychiatric_care_covered BOOLEAN DEFAULT FALSE,
    medication_coverage_percentage INTEGER DEFAULT 0,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vitality_points (
    points_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    points_earned INTEGER NOT NULL,
    activity_date DATE NOT NULL,
    description TEXT,
    synced_to_discovery BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intervention_outcomes (
    outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES risk_assessments(assessment_id),
    alert_id UUID REFERENCES care_coordinator_alerts(alert_id),
    intervention_type VARCHAR(100) NOT NULL,
    intervention_date TIMESTAMP WITH TIME ZONE NOT NULL,
    outcome VARCHAR(50) CHECK (outcome IN ('crisis_prevented', 'hospitalization_prevented', 'improved', 'stable', 'deteriorated', 'hospitalized')),
    cost_savings_estimate DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (IF NOT EXISTS not supported for indexes, so we use DO block)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_risk_assessments_user_id') THEN
        CREATE INDEX idx_risk_assessments_user_id ON risk_assessments(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_risk_assessments_timestamp') THEN
        CREATE INDEX idx_risk_assessments_timestamp ON risk_assessments(timestamp DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_risk_assessments_risk_level') THEN
        CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_care_coordinator_alerts_user_id') THEN
        CREATE INDEX idx_care_coordinator_alerts_user_id ON care_coordinator_alerts(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_care_coordinator_alerts_status') THEN
        CREATE INDEX idx_care_coordinator_alerts_status ON care_coordinator_alerts(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_emergency_contacts_user_id') THEN
        CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_user_id') THEN
        CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medication_logs_user_id') THEN
        CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_discovery_members_user_id') THEN
        CREATE INDEX idx_discovery_members_user_id ON discovery_members(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vitality_points_user_id') THEN
        CREATE INDEX idx_vitality_points_user_id ON vitality_points(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_intervention_outcomes_user_id') THEN
        CREATE INDEX idx_intervention_outcomes_user_id ON intervention_outcomes(user_id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_coordinator_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitality_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_outcomes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (NOW that tables exist)
DROP POLICY IF EXISTS "user_risk_assessments_policy" ON risk_assessments;
DROP POLICY IF EXISTS "user_emergency_contacts_policy" ON emergency_contacts;
DROP POLICY IF EXISTS "user_sessions_policy" ON user_sessions;
DROP POLICY IF EXISTS "user_medication_logs_policy" ON medication_logs;
DROP POLICY IF EXISTS "user_notifications_policy" ON notifications;
DROP POLICY IF EXISTS "user_discovery_members_policy" ON discovery_members;
DROP POLICY IF EXISTS "user_vitality_points_policy" ON vitality_points;
DROP POLICY IF EXISTS "care_coordinator_alerts_policy" ON care_coordinator_alerts;
DROP POLICY IF EXISTS "clinician_risk_assessments_policy" ON risk_assessments;

-- Create RLS policies (fresh, after dropping old ones)
CREATE POLICY "user_risk_assessments_policy" ON risk_assessments
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_emergency_contacts_policy" ON emergency_contacts
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_policy" ON user_sessions
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_medication_logs_policy" ON medication_logs
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_notifications_policy" ON notifications
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_discovery_members_policy" ON discovery_members
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "user_vitality_points_policy" ON vitality_points
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "care_coordinator_alerts_policy" ON care_coordinator_alerts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "clinician_risk_assessments_policy" ON risk_assessments
    FOR SELECT
    USING (auth.uid() = user_id OR clinician_id = auth.uid());

-- Create functions
CREATE OR REPLACE FUNCTION calculate_medication_adherence(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    total_doses INTEGER;
    taken_doses INTEGER;
    adherence_rate DECIMAL(3,2);
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE taken = TRUE)
    INTO total_doses, taken_doses
    FROM medication_logs
    WHERE user_id = p_user_id
    AND scheduled_time >= NOW() - (p_days || ' days')::INTERVAL;
    
    IF total_doses = 0 THEN
        RETURN 1.00;
    END IF;
    
    adherence_rate := taken_doses::DECIMAL / total_doses::DECIMAL;
    RETURN ROUND(adherence_rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION award_vitality_points(
    p_user_id UUID,
    p_activity_type VARCHAR(100),
    p_points INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    points_id UUID;
BEGIN
    INSERT INTO vitality_points (
        user_id,
        activity_type,
        points_earned,
        activity_date,
        description
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_points,
        CURRENT_DATE,
        p_description
    )
    RETURNING vitality_points.points_id INTO points_id;
    
    RETURN points_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Risk Prediction System migration completed successfully!';
END $$;
