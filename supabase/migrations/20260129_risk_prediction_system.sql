-- Risk Prediction System Migration
-- Predictive Hospitalization Prevention for Discovery Health Integration

-- Risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
    risk_score DECIMAL(3,2) CHECK (risk_score BETWEEN 0.00 AND 1.00),
    contributing_factors JSONB,
    recommended_actions JSONB,
    reviewed_by_clinician BOOLEAN DEFAULT FALSE,
    clinician_id UUID REFERENCES users(user_id),
    clinician_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    intervention_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Care coordinator alerts table
CREATE TABLE IF NOT EXISTS care_coordinator_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_encrypted BYTEA NOT NULL,
    email_encrypted BYTEA,
    alert_enabled BOOLEAN DEFAULT TRUE,
    priority_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for engagement tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER, -- in seconds
    activities_completed INTEGER DEFAULT 0,
    features_used JSONB,
    device_type VARCHAR(50),
    app_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication logs table (for adherence tracking)
CREATE TABLE IF NOT EXISTS medication_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(medication_id),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    taken_time TIMESTAMP WITH TIME ZONE,
    missed_reason VARCHAR(255),
    side_effects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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

-- Discovery Health integration table
CREATE TABLE IF NOT EXISTS discovery_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
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

-- Vitality points table
CREATE TABLE IF NOT EXISTS vitality_points (
    points_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    points_earned INTEGER NOT NULL,
    activity_date DATE NOT NULL,
    description TEXT,
    synced_to_discovery BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intervention outcomes table (for ROI tracking)
CREATE TABLE IF NOT EXISTS intervention_outcomes (
    outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES risk_assessments(assessment_id),
    alert_id UUID REFERENCES care_coordinator_alerts(alert_id),
    intervention_type VARCHAR(100) NOT NULL,
    intervention_date TIMESTAMP WITH TIME ZONE NOT NULL,
    outcome VARCHAR(50) CHECK (outcome IN ('crisis_prevented', 'hospitalization_prevented', 'improved', 'stable', 'deteriorated', 'hospitalized')),
    cost_savings_estimate DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX idx_risk_assessments_timestamp ON risk_assessments(timestamp DESC);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);

CREATE INDEX idx_care_coordinator_alerts_user_id ON care_coordinator_alerts(user_id);
CREATE INDEX idx_care_coordinator_alerts_status ON care_coordinator_alerts(status);
CREATE INDEX idx_care_coordinator_alerts_created_at ON care_coordinator_alerts(created_at DESC);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start DESC);

CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_scheduled_time ON medication_logs(scheduled_time DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_discovery_members_user_id ON discovery_members(user_id);
CREATE INDEX idx_discovery_members_number ON discovery_members(discovery_member_number);

CREATE INDEX idx_vitality_points_user_id ON vitality_points(user_id);
CREATE INDEX idx_vitality_points_date ON vitality_points(activity_date DESC);

CREATE INDEX idx_intervention_outcomes_user_id ON intervention_outcomes(user_id);
CREATE INDEX idx_intervention_outcomes_date ON intervention_outcomes(intervention_date DESC);

-- Enable row-level security
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_coordinator_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitality_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY user_risk_assessments_policy ON risk_assessments
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_emergency_contacts_policy ON emergency_contacts
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_medication_logs_policy ON medication_logs
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_notifications_policy ON notifications
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_discovery_members_policy ON discovery_members
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_vitality_points_policy ON vitality_points
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Care coordinators can see alerts assigned to them
CREATE POLICY care_coordinator_alerts_policy ON care_coordinator_alerts
    FOR SELECT
    USING (
        user_id = current_setting('app.current_user_id')::UUID
        OR assigned_to = current_setting('app.current_user_email')::TEXT
    );

-- Clinicians can see assessments they've reviewed
CREATE POLICY clinician_risk_assessments_policy ON risk_assessments
    FOR SELECT
    USING (
        user_id = current_setting('app.current_user_id')::UUID
        OR clinician_id = current_setting('app.current_user_id')::UUID
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_care_coordinator_alerts_updated_at
    BEFORE UPDATE ON care_coordinator_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovery_members_updated_at
    BEFORE UPDATE ON discovery_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate adherence rate
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
        RETURN 1.00; -- Assume adherent if no data
    END IF;
    
    adherence_rate := taken_doses::DECIMAL / total_doses::DECIMAL;
    RETURN ROUND(adherence_rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award Vitality points
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

-- View for care coordinator dashboard
CREATE OR REPLACE VIEW care_coordinator_dashboard AS
SELECT 
    u.user_id,
    u.email_encrypted,
    dm.discovery_member_number,
    ra.risk_level,
    ra.confidence_score,
    ra.timestamp AS last_assessment,
    cca.status AS alert_status,
    cca.created_at AS alert_created,
    cca.assigned_to
FROM users u
LEFT JOIN discovery_members dm ON u.user_id = dm.user_id
LEFT JOIN LATERAL (
    SELECT * FROM risk_assessments
    WHERE user_id = u.user_id
    ORDER BY timestamp DESC
    LIMIT 1
) ra ON TRUE
LEFT JOIN LATERAL (
    SELECT * FROM care_coordinator_alerts
    WHERE user_id = u.user_id
    AND status IN ('pending', 'acknowledged', 'in_progress')
    ORDER BY created_at DESC
    LIMIT 1
) cca ON TRUE
WHERE ra.risk_level IN ('ORANGE', 'RED')
ORDER BY ra.risk_level DESC, ra.timestamp DESC;

-- Comments for documentation
COMMENT ON TABLE risk_assessments IS 'Stores predictive risk assessments for hospitalization prevention';
COMMENT ON TABLE care_coordinator_alerts IS 'Alerts for Discovery Health case managers';
COMMENT ON TABLE discovery_members IS 'Discovery Health member information and benefits';
COMMENT ON TABLE vitality_points IS 'Vitality points earned for mental wellness activities';
COMMENT ON TABLE intervention_outcomes IS 'Tracks outcomes and ROI of interventions';
