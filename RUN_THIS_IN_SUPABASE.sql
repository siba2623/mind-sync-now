-- ⚠️ IMPORTANT: Run this SQL in your Supabase SQL Editor
-- This creates the crisis_detections table needed for Phase 2

-- Crisis detections table
CREATE TABLE IF NOT EXISTS crisis_detections (
    detection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text_analyzed TEXT NOT NULL,
    crisis_level VARCHAR(20) NOT NULL CHECK (crisis_level IN ('none', 'low', 'moderate', 'high', 'critical')),
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0.00 AND 1.00),
    triggers TEXT[],
    recommended_action VARCHAR(100) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    intervention_triggered BOOLEAN DEFAULT FALSE,
    intervention_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crisis_detections_user_id ON crisis_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_detections_detected_at ON crisis_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_detections_crisis_level ON crisis_detections(crisis_level);
CREATE INDEX IF NOT EXISTS idx_crisis_detections_user_detected_at ON crisis_detections(user_id, detected_at DESC);

-- Enable row-level security
ALTER TABLE crisis_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own crisis detections
DROP POLICY IF EXISTS user_crisis_detections_policy ON crisis_detections;
CREATE POLICY user_crisis_detections_policy ON crisis_detections
    FOR ALL
    USING (auth.uid() = user_id);

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
    detected_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cd.detection_id,
        cd.crisis_level,
        cd.confidence,
        cd.triggers,
        cd.detected_at
    FROM crisis_detections cd
    WHERE cd.user_id = p_user_id
    ORDER BY cd.detected_at DESC
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
    AND detected_at >= NOW() - (p_hours || ' hours')::INTERVAL;
    
    RETURN crisis_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create care coordinator alert on critical crisis
CREATE OR REPLACE FUNCTION trigger_crisis_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger for high and critical crises
    IF NEW.crisis_level IN ('critical', 'high') THEN
        -- Check if care_coordinator_alerts table exists
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'care_coordinator_alerts') THEN
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
        END IF;
        
        -- Mark intervention as triggered
        NEW.intervention_triggered := TRUE;
        NEW.intervention_type := 'care_coordinator_alert';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS crisis_detection_alert_trigger ON crisis_detections;
CREATE TRIGGER crisis_detection_alert_trigger
    BEFORE INSERT ON crisis_detections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_crisis_alert();

-- Comments for documentation
COMMENT ON TABLE crisis_detections IS 'Stores real-time crisis detection results for mental health monitoring';
COMMENT ON COLUMN crisis_detections.crisis_level IS 'Severity level: none, low, moderate, high, critical';
COMMENT ON COLUMN crisis_detections.confidence IS 'Confidence score of the detection (0.00 to 1.00)';
COMMENT ON COLUMN crisis_detections.triggers IS 'Array of keywords or factors that triggered the detection';
COMMENT ON COLUMN crisis_detections.recommended_action IS 'Recommended intervention action';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Crisis Detection tables created successfully!';
    RAISE NOTICE 'You can now test the crisis detection feature.';
END $$;
