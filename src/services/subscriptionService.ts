import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  currency: string;
  features: string[];
  limits: Record<string, number | null>;
  is_active: boolean;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  billing_cycle: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  payment_method_id: string | null;
  plan?: SubscriptionPlan;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_provider: string;
  provider_transaction_id: string | null;
  description: string;
  processed_at: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  applicable_plans: string[];
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

class SubscriptionService {
  // ============================================================================
  // SUBSCRIPTION PLANS
  // ============================================================================

  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  async getPlanByName(name: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // ============================================================================
  // USER SUBSCRIPTION
  // ============================================================================

  async getCurrentSubscription(): Promise<UserSubscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createSubscription(params: {
    planId: string;
    billingCycle: 'monthly' | 'annual';
    paymentMethodId?: string;
    promoCode?: string;
  }): Promise<UserSubscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate period end based on billing cycle
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    if (params.billingCycle === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: params.planId,
        billing_cycle: params.billingCycle,
        status: 'active',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_method_id: params.paymentMethodId || null,
      })
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubscription(params: {
    planId?: string;
    billingCycle?: 'monthly' | 'annual';
    cancelAtPeriodEnd?: boolean;
  }): Promise<UserSubscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updates: any = {};
    if (params.planId) updates.plan_id = params.planId;
    if (params.billingCycle) updates.billing_cycle = params.billingCycle;
    if (params.cancelAtPeriodEnd !== undefined) {
      updates.cancel_at_period_end = params.cancelAtPeriodEnd;
      if (params.cancelAtPeriodEnd) {
        updates.cancelled_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('user_id', user.id)
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async cancelSubscription(): Promise<void> {
    await this.updateSubscription({ cancelAtPeriodEnd: true });
  }

  async reactivateSubscription(): Promise<void> {
    await this.updateSubscription({ cancelAtPeriodEnd: false });
  }

  // ============================================================================
  // FEATURE ACCESS
  // ============================================================================

  async checkFeatureAccess(featureKey: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('check_feature_access', {
      p_user_id: user.id,
      p_feature_key: featureKey,
    });

    if (error) throw error;
    return data;
  }

  async checkUsageLimit(featureKey: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: user.id,
      p_feature_key: featureKey,
    });

    if (error) throw error;
    return data;
  }

  async incrementUsage(featureKey: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_feature_key: featureKey,
    });

    if (error) throw error;
  }

  // ============================================================================
  // PAYMENTS
  // ============================================================================

  async createPayment(params: {
    amount: number;
    paymentMethod: string;
    paymentProvider: string;
    description: string;
    subscriptionId?: string;
  }): Promise<PaymentTransaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        subscription_id: params.subscriptionId || null,
        amount: params.amount,
        currency: 'ZAR',
        status: 'pending',
        payment_method: params.paymentMethod,
        payment_provider: params.paymentProvider,
        description: params.description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentHistory(limit: number = 50): Promise<PaymentTransaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // PROMO CODES
  // ============================================================================

  async validatePromoCode(code: string, planName: string): Promise<PromoCode | null> {
    const { data, error} = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Check if code is valid for this plan
    if (!data.applicable_plans.includes(planName)) {
      return null;
    }

    // Check if code is still valid
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return null;
    }

    // Check if max uses reached
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return null;
    }

    return data;
  }

  async applyPromoCode(code: string, planName: string, amount: number): Promise<number> {
    const { data, error } = await supabase.rpc('apply_promo_code', {
      p_code: code.toUpperCase(),
      p_plan_name: planName,
      p_amount: amount,
    });

    if (error) throw error;
    return data;
  }

  calculateDiscount(promo: PromoCode, amount: number): number {
    if (promo.discount_type === 'percentage') {
      return amount * (promo.discount_value / 100);
    }
    return promo.discount_value;
  }
}

export const subscriptionService = new SubscriptionService();
