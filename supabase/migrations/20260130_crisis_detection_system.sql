-- Crisis Detection System Migration
-- Real-time mental health crisis monitoring and intervention

-- Crisis detections table
CREATE TABLE IF NOT EXISTS crisis_detections (
    detection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text_analyzed TEXT NOT NULL,
    crisis_level VARCHAR(20) NOT NULL CHECK (crisis_level IN ('none', 'low', 'moderate', 'high', 'critical')),
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0.00 AND 1.00),
    triggers TEXT[],
    recommended_action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    intervention_triggered BOOLEAN DEFAULT FALSE,
    intervention_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_crisis_detections_user_id ON crisis_detections(user_id);
CREATE INDEX idx_crisis_detections_timestamp ON crisis_detections(timestamp DESC);
CREATE INDEX idx_crisis_detections_crisis_level ON crisis_detections(crisis_level);
CREATE INDEX idx_crisis_detections_user_timestamp ON crisis_detections(user_id, timestamp DESC);

-- Enable row-level security
ALTER TABLE crisis_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own crisis detections
CREATE POLICY user_crisis_detections_policy ON crisis_detections
    FOR ALL
    USING (auth.uid() = user_id);

-- Clinicians and care coordinators can see crisis detections for their patients
-- (This would need additional role-based logic in production)
CREATE POLICY clinician_crisis_detections_policy ON crisis_detections
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM care_coordinator_alerts
            WHERE care_coordinator_alerts.user_id = crisis_detections.user_id
            AND care_coordinator_alerts.assigned_to = auth.email()
        )
    );

-- Function to get recent crisis detections for a user
CREATE OR REPLACE FUNCTION get_recent_crisis_detections(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    detection_id UUID,
    crisis_level VARCHAR(20),
    confidence DECIMAL(3,2),
    triggers TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.detection_id,
        cd.crisis_level,
        cd.confidence,
        cd.triggers,
        cd.timestamp
    FROM crisis_detections cd
    WHERE cd.user_id = p_user_id
    ORDER BY cd.timestamp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has recent critical crisis
CREATE OR REPLACE FUNCTION has_recent_critical_crisis(
    p_user_id UUID,
    p_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
DECLARE
    crisis_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO crisis_count
    FROM crisis_detections
    WHERE user_id = p_user_id
    AND crisis_level IN ('critical', 'high')
    AND timestamp >= NOW() - (p_hours || ' hours')::INTERVAL;
    
    RETURN crisis_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create care coordinator alert on critical crisis
CREATE OR REPLACE FUNCTION trigger_crisis_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger for high and critical crises
    IF NEW.crisis_level IN ('critical', 'high') THEN
        INSERT INTO care_coordinator_alerts (
            user_id,
            alert_type,
            risk_level,
            details,
            status,
            priority,
            created_at
        ) VALUES (
            NEW.user_id,
            CASE 
                WHEN NEW.crisis_level = 'critical' THEN 'CRITICAL_CRISIS'
                WHEN NEW.crisis_level = 'high' THEN 'HIGH_RISK_CRISIS'
            END,
            UPPER(NEW.crisis_level),
            jsonb_build_object(
                'detection_id', NEW.detection_id,
                'confidence', NEW.confidence,
                'triggers', NEW.triggers,
                'recommended_action', NEW.recommended_action
            ),
            'pending',
            CASE 
                WHEN NEW.crisis_level = 'critical' THEN 'immediate'
                WHEN NEW.crisis_level = 'high' THEN 'urgent'
            END,
            NOW()
        );
        
        -- Mark intervention as triggered
        NEW.intervention_triggered := TRUE;
        NEW.intervention_type := 'care_coordinator_alert';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crisis_detection_alert_trigger
    BEFORE INSERT ON crisis_detections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_crisis_alert();

-- View for crisis monitoring dashboard
CREATE OR REPLACE VIEW crisis_monitoring_dashboard AS
SELECT 
    cd.user_id,
    cd.crisis_level,
    cd.confidence,
    cd.timestamp AS last_detection,
    cd.triggers,
    cca.status AS alert_status,
    cca.assigned_to,
    cca.created_at AS alert_created,
    COUNT(*) OVER (PARTITION BY cd.user_id) AS total_detections,
    COUNT(*) FILTER (WHERE cd.crisis_level IN ('critical', 'high')) OVER (PARTITION BY cd.user_id) AS high_risk_count
FROM crisis_detections cd
LEFT JOIN care_coordinator_alerts cca ON cd.user_id = cca.user_id 
    AND cca.alert_type IN ('CRITICAL_CRISIS', 'HIGH_RISK_CRISIS')
    AND cca.created_at >= cd.timestamp - INTERVAL '1 hour'
WHERE cd.timestamp >= NOW() - INTERVAL '30 days'
ORDER BY cd.timestamp DESC;

-- Comments for documentation
COMMENT ON TABLE crisis_detections IS 'Stores real-time crisis detection results for mental health monitoring';
COMMENT ON COLUMN crisis_detections.crisis_level IS 'Severity level: none, low, moderate, high, critical';
COMMENT ON COLUMN crisis_detections.confidence IS 'Confidence score of the detection (0.00 to 1.00)';
COMMENT ON COLUMN crisis_detections.triggers IS 'Array of keywords or factors that triggered the detection';
COMMENT ON COLUMN crisis_detections.recommended_action IS 'Recommended intervention action';
COMMENT ON FUNCTION has_recent_critical_crisis IS 'Checks if user has had a critical or high crisis in the last N hours';
COMMENT ON FUNCTION get_recent_crisis_detections IS 'Returns recent crisis detections for a user';

