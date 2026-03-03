-- ============================================================================
-- MINDSYNC SUBSCRIPTION & PAYMENT SYSTEM
-- ============================================================================
-- Created: February 11, 2026
-- Purpose: Implement tiered subscription system with payment processing
-- Pricing: Standard (R120), Premium (R200), Platinum (R350)
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2), -- Annual discount pricing
  currency TEXT DEFAULT 'ZAR',
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_annual, features, limits, sort_order) VALUES
(
  'free',
  'Free',
  'Basic mental wellness tracking',
  0.00,
  0.00,
  '["Mood tracking", "Basic journal", "Breathing exercises", "Community access"]'::jsonb,
  '{"mood_logs_per_day": 3, "journal_entries_per_month": 10, "meditation_minutes_per_day": 10}'::jsonb,
  1
),
(
  'standard',
  'Standard',
  'Essential wellness tools for daily mental health',
  120.00,
  1200.00, -- R100/month if paid annually (17% discount)
  '["Unlimited mood tracking", "Unlimited journal entries", "Meditation timer", "Breathing exercises", "Activity tracking", "Basic insights", "Email support", "Ad-free experience"]'::jsonb,
  '{"meditation_minutes_per_day": 60, "ai_insights_per_month": 10}'::jsonb,
  2
),
(
  'premium',
  'Premium',
  'Advanced features with AI-powered insights',
  200.00,
  2000.00, -- R167/month if paid annually (17% discount)
  '["Everything in Standard", "AI Mental Health Twin", "Predictive wellness alerts", "Advanced mood patterns", "Medication tracking with reminders", "Crisis detection", "Therapist matching", "Priority support", "Export health data", "Wearable integration"]'::jsonb,
  '{"meditation_minutes_per_day": null, "ai_insights_per_month": 50, "therapist_matches": 10}'::jsonb,
  3
),
(
  'platinum',
  'Platinum',
  'Complete mental wellness solution with premium support',
  350.00,
  3500.00, -- R292/month if paid annually (17% discount)
  '["Everything in Premium", "Unlimited AI insights", "Personal wellness coach", "Family wellness hub (up to 5 members)", "Peer support network", "Video therapy sessions (2 per month)", "24/7 crisis support", "Personalized treatment plans", "Health insurance integration", "Dedicated account manager", "Early access to new features"]'::jsonb,
  '{"meditation_minutes_per_day": null, "ai_insights_per_month": null, "therapist_matches": null, "family_members": 5, "video_sessions_per_month": 2}'::jsonb,
  4
);

-- ============================================================================
-- 2. USER SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, past_due, trialing
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, annual
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 3. PAYMENT TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT, -- card, eft, payfast, paypal
  payment_provider TEXT, -- payfast, stripe, paypal
  provider_transaction_id TEXT,
  provider_response JSONB,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PAYMENT METHODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- card, bank_account
  provider TEXT NOT NULL, -- payfast, stripe
  provider_method_id TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  bank_name TEXT,
  account_last4 TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. SUBSCRIPTION USAGE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key, period_start)
);

-- ============================================================================
-- 6. PROMOTIONAL CODES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL, -- percentage, fixed_amount
  discount_value DECIMAL(10,2) NOT NULL,
  applicable_plans TEXT[] DEFAULT ARRAY['standard', 'premium', 'platinum'],
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, applicable_plans, max_uses, valid_until) VALUES
('LAUNCH50', 'Launch special - 50% off first month', 'percentage', 50.00, ARRAY['standard', 'premium', 'platinum'], 1000, NOW() + INTERVAL '30 days'),
('ANNUAL20', '20% off annual subscriptions', 'percentage', 20.00, ARRAY['standard', 'premium', 'platinum'], NULL, NOW() + INTERVAL '1 year'),
('DISCOVERY25', 'Discovery Health members - 25% off', 'percentage', 25.00, ARRAY['standard', 'premium', 'platinum'], NULL, NULL);

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_subscription_usage_user_feature ON subscription_usage(user_id, feature_key);
CREATE INDEX idx_promo_codes_code ON promo_codes(code) WHERE is_active = true;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Subscription plans: Public read access
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- User subscriptions: Users can view their own
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Payment transactions: Users can view their own
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payment methods: Users can manage their own
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- Subscription usage: Users can view their own
CREATE POLICY "Users can view own usage"
  ON subscription_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Promo codes: Public read for active codes
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_plan_name TEXT;
  v_plan_features JSONB;
BEGIN
  -- Get user's current plan
  SELECT sp.name, sp.features
  INTO v_plan_name, v_plan_features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.current_period_end > NOW();
  
  -- If no active subscription, check free plan
  IF v_plan_name IS NULL THEN
    SELECT features INTO v_plan_features
    FROM subscription_plans
    WHERE name = 'free';
    
    RETURN v_plan_features ? p_feature_key;
  END IF;
  
  -- Check if feature is included in plan
  RETURN v_plan_features ? p_feature_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_current_usage INTEGER;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get user's plan limits
  SELECT 
    (sp.limits->>p_feature_key)::INTEGER,
    us.current_period_start,
    us.current_period_end
  INTO v_limit, v_period_start, v_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active';
  
  -- If no limit (NULL), unlimited access
  IF v_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Get current usage
  SELECT COALESCE(usage_count, 0)
  INTO v_current_usage
  FROM subscription_usage
  WHERE user_id = p_user_id
    AND feature_key = p_feature_key
    AND period_start = v_period_start;
  
  -- Check if under limit
  RETURN v_current_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature_key TEXT
) RETURNS VOID AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get current period
  SELECT current_period_start, current_period_end
  INTO v_period_start, v_period_end
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active';
  
  -- Insert or update usage
  INSERT INTO subscription_usage (user_id, feature_key, usage_count, period_start, period_end)
  VALUES (p_user_id, p_feature_key, 1, v_period_start, v_period_end)
  ON CONFLICT (user_id, feature_key, period_start)
  DO UPDATE SET 
    usage_count = subscription_usage.usage_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply promo code
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_code TEXT,
  p_plan_name TEXT,
  p_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_discount DECIMAL;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND p_plan_name = ANY(applicable_plans);
  
  IF NOT FOUND THEN
    RETURN p_amount;
  END IF;
  
  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount = p_amount * (v_promo.discount_value / 100);
  ELSE
    v_discount = v_promo.discount_value;
  END IF;
  
  -- Update promo code usage
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE id = v_promo.id;
  
  RETURN GREATEST(p_amount - v_discount, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE subscription_plans IS 'Subscription plan definitions with pricing and features';
COMMENT ON TABLE user_subscriptions IS 'User subscription records and billing cycles';
COMMENT ON TABLE payment_transactions IS 'Payment transaction history';
COMMENT ON TABLE payment_methods IS 'Stored payment methods for users';
COMMENT ON TABLE subscription_usage IS 'Track feature usage against plan limits';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes';
