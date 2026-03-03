# 💳 MindSync Subscription & Payment System

## Overview

Complete subscription management system with tiered pricing optimized for maximum revenue.

**Created:** February 11, 2026  
**Status:** ✅ Ready for Implementation

---

## 💰 Pricing Strategy

### Tier Structure (Optimized for Revenue)

| Tier | Monthly | Annual | Annual Savings | Target Market |
|------|---------|--------|----------------|---------------|
| **Free** | R0 | R0 | - | Trial users, basic needs |
| **Standard** | R120 | R1,200 | R240 (17%) | Individual users |
| **Premium** | R200 | R2,000 | R400 (17%) | Power users, AI features |
| **Platinum** | R350 | R3,500 | R700 (17%) | Families, premium support |

### Price Ladder Analysis

- **Standard → Premium:** 67% increase (+R80)
  - Justification: AI Mental Health Twin, Predictive alerts, Crisis detection
  
- **Premium → Platinum:** 75% increase (+R150)
  - Justification: Family plan (5 members), Video therapy, 24/7 support, Dedicated manager

### Revenue Projections

**Scenario: 10,000 Users**

| Distribution | Users | Monthly Revenue | Annual Revenue |
|--------------|-------|-----------------|----------------|
| Free (40%) | 4,000 | R0 | R0 |
| Standard (35%) | 3,500 | R420,000 | R5,040,000 |
| Premium (20%) | 2,000 | R400,000 | R4,800,000 |
| Platinum (5%) | 500 | R175,000 | R2,100,000 |
| **Total** | **10,000** | **R995,000** | **R11,940,000** |

**Average Revenue Per User (ARPU):** R99.50/month

---

## 🎯 Feature Matrix

### Free Tier
- ✅ Mood tracking (3 per day)
- ✅ Basic journal (10 entries/month)
- ✅ Breathing exercises
- ✅ Community access
- ✅ Meditation (10 min/day)
- ❌ AI insights
- ❌ Advanced features

### Standard Tier (R120/month)
- ✅ **Everything in Free**
- ✅ Unlimited mood tracking
- ✅ Unlimited journal entries
- ✅ Meditation timer (60 min/day)
- ✅ Activity tracking
- ✅ Basic insights
- ✅ Email support
- ✅ Ad-free experience
- ❌ AI features
- ❌ Crisis detection

### Premium Tier (R200/month) ⭐ MOST POPULAR
- ✅ **Everything in Standard**
- ✅ AI Mental Health Twin
- ✅ Predictive wellness alerts
- ✅ Advanced mood patterns
- ✅ Medication tracking + reminders
- ✅ Crisis detection
- ✅ Therapist matching
- ✅ Priority support
- ✅ Export health data
- ✅ Wearable integration
- ✅ 50 AI insights/month
- ❌ Family features
- ❌ Video therapy

### Platinum Tier (R350/month) 👑
- ✅ **Everything in Premium**
- ✅ Unlimited AI insights
- ✅ Personal wellness coach
- ✅ Family wellness hub (5 members)
- ✅ Peer support network
- ✅ Video therapy (2 sessions/month)
- ✅ 24/7 crisis support
- ✅ Personalized treatment plans
- ✅ Health insurance integration
- ✅ Dedicated account manager
- ✅ Early access to new features

---

## 🗄️ Database Schema

### Tables Created

1. **subscription_plans** - Plan definitions
2. **user_subscriptions** - User subscription records
3. **payment_transactions** - Payment history
4. **payment_methods** - Stored payment methods
5. **subscription_usage** - Feature usage tracking
6. **promo_codes** - Promotional discounts

### Key Functions

- `check_feature_access(user_id, feature_key)` - Check if user has access
- `check_usage_limit(user_id, feature_key)` - Check usage limits
- `increment_usage(user_id, feature_key)` - Track feature usage
- `apply_promo_code(code, plan_name, amount)` - Apply discounts

---

## 🎁 Promotional Codes

### Pre-loaded Codes

| Code | Discount | Applicable Plans | Max Uses | Valid Until |
|------|----------|------------------|----------|-------------|
| **LAUNCH50** | 50% off first month | All paid | 1,000 | 30 days |
| **ANNUAL20** | 20% off annual | All paid | Unlimited | 1 year |
| **DISCOVERY25** | 25% off | All paid | Unlimited | No expiry |

### How to Create New Codes

```sql
INSERT INTO promo_codes (code, description, discount_type, discount_value, applicable_plans, max_uses, valid_until)
VALUES (
  'NEWYEAR2026',
  'New Year special',
  'percentage',
  30.00,
  ARRAY['standard', 'premium', 'platinum'],
  500,
  '2026-01-31'
);
```

---

## 💻 Implementation

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
mind-sync-now/supabase/migrations/20260211_subscription_system.sql
```

### 2. Add Route to App

```typescript
// In src/App.tsx
import Pricing from '@/pages/Pricing';

// Add route:
<Route path="/pricing" element={<Pricing />} />
```

### 3. Usage in Components

```typescript
import { subscriptionService } from '@/services/subscriptionService';

// Check if user has access to a feature
const hasAccess = await subscriptionService.checkFeatureAccess('ai_insights');

// Check usage limits
const canUse = await subscriptionService.checkUsageLimit('mood_logs_per_day');

// Increment usage
await subscriptionService.incrementUsage('mood_logs_per_day');

// Get current subscription
const subscription = await subscriptionService.getCurrentSubscription();
```

---

## 🔐 Feature Gating Examples

### Mood Logging with Limits

```typescript
const handleLogMood = async () => {
  // Check if user can log mood
  const canLog = await subscriptionService.checkUsageLimit('mood_logs_per_day');
  
  if (!canLog) {
    toast({
      title: 'Limit Reached',
      description: 'Upgrade to Standard for unlimited mood logging',
      action: <Button onClick={() => navigate('/pricing')}>Upgrade</Button>
    });
    return;
  }
  
  // Log mood
  await logMood();
  
  // Increment usage
  await subscriptionService.incrementUsage('mood_logs_per_day');
};
```

### AI Features

```typescript
const handleAIInsight = async () => {
  // Check if user has access to AI features
  const hasAccess = await subscriptionService.checkFeatureAccess('AI Mental Health Twin');
  
  if (!hasAccess) {
    toast({
      title: 'Premium Feature',
      description: 'Upgrade to Premium for AI-powered insights',
      action: <Button onClick={() => navigate('/pricing')}>Upgrade</Button>
    });
    return;
  }
  
  // Generate AI insight
  await generateInsight();
};
```

---

## 💳 Payment Integration

### Supported Providers

1. **PayFast** (South African)
   - Credit/Debit cards
   - EFT
   - Instant EFT

2. **Stripe** (International)
   - Credit/Debit cards
   - Apple Pay
   - Google Pay

3. **PayPal** (Alternative)

### Payment Flow

1. User selects plan on `/pricing`
2. Redirects to `/checkout?plan=premium&cycle=monthly`
3. User enters payment details
4. Payment processed through provider
5. Subscription activated
6. Confirmation email sent

---

## 📊 Analytics & Metrics

### Key Metrics to Track

1. **Conversion Rate**
   - Free → Paid conversion
   - Trial → Paid conversion
   - Plan upgrade rate

2. **Revenue Metrics**
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - ARPU (Average Revenue Per User)
   - LTV (Lifetime Value)

3. **Churn Metrics**
   - Monthly churn rate
   - Reasons for cancellation
   - Reactivation rate

4. **Feature Usage**
   - Most used features per tier
   - Feature adoption rate
   - Usage limits hit frequency

---

## 🎯 Upsell Strategies

### In-App Prompts

1. **Usage Limit Reached**
   - Show upgrade prompt when limits hit
   - Highlight benefits of next tier

2. **Feature Discovery**
   - Show locked features with "Upgrade" badge
   - Offer trial of premium features

3. **Milestone Celebrations**
   - "You've logged 100 moods! Unlock unlimited with Standard"
   - "Ready for AI insights? Upgrade to Premium"

4. **Seasonal Promotions**
   - Mental Health Awareness Month discounts
   - New Year wellness goals promotion
   - Back-to-school student discounts

---

## 🔄 Subscription Lifecycle

### States

- **trialing** - In free trial period
- **active** - Subscription active and paid
- **past_due** - Payment failed, grace period
- **cancelled** - Cancelled, access until period end
- **expired** - Subscription ended

### Automated Actions

1. **7 days before renewal**
   - Send reminder email
   - Confirm payment method

2. **Payment failure**
   - Retry payment (3 attempts)
   - Send notification
   - Mark as past_due

3. **Cancellation**
   - Send confirmation
   - Offer retention discount
   - Schedule access removal

4. **Reactivation**
   - Welcome back email
   - Restore full access
   - Apply any promotions

---

## 🚀 Next Steps

### Phase 1: Core Implementation (Week 1)
- [x] Database migration
- [x] Subscription service
- [x] Pricing page
- [ ] Checkout flow
- [ ] Payment provider integration

### Phase 2: Feature Gating (Week 2)
- [ ] Add subscription checks to all features
- [ ] Implement usage tracking
- [ ] Create upgrade prompts
- [ ] Test all tiers

### Phase 3: Optimization (Week 3)
- [ ] A/B test pricing
- [ ] Optimize conversion funnels
- [ ] Implement retention strategies
- [ ] Add analytics dashboard

### Phase 4: Scale (Week 4)
- [ ] Corporate/Enterprise tier
- [ ] Bulk licensing
- [ ] API access tier
- [ ] White-label options

---

## 📈 Revenue Optimization Tips

1. **Annual Billing Incentive**
   - 17% discount encourages annual commitment
   - Improves cash flow
   - Reduces churn

2. **Price Anchoring**
   - Platinum tier makes Premium look affordable
   - Most users choose middle option (Premium)

3. **Feature Bundling**
   - Group related features in tiers
   - Create clear value propositions

4. **Psychological Pricing**
   - R120, R200, R350 (round numbers, easy to remember)
   - Clear value steps between tiers

5. **Freemium Model**
   - Free tier drives adoption
   - Limited features encourage upgrades
   - 5-10% conversion rate expected

---

## 🎉 Success Metrics

### Target Goals (Year 1)

- **10,000 total users**
- **25% paid conversion rate** (2,500 paid users)
- **R2.5M MRR** (Monthly Recurring Revenue)
- **R30M ARR** (Annual Recurring Revenue)
- **<5% monthly churn**
- **R1,200 LTV** (Lifetime Value per user)

### Break-Even Analysis

**Monthly Costs:**
- Infrastructure: R50,000
- Support: R100,000
- Development: R150,000
- Marketing: R200,000
- **Total:** R500,000/month

**Break-Even:** 503 paid users (mix of tiers)  
**Current Projection:** 2,500 paid users = **5x break-even** 🎯

---

## 📞 Support

For subscription issues:
- Email: billing@mindsync.app
- Phone: +27 (0)11 123 4567
- Live chat: Available for Premium/Platinum

---

**Status:** ✅ Ready for Implementation  
**Next Action:** Run database migration and test pricing page  
**Timeline:** Launch subscriptions within 1 week
