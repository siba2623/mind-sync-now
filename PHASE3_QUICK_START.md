# Phase 3 Quick Start Guide

## 🚀 Getting Started with Phase 3 Features

This guide helps you quickly test and use the new Phase 3 AI algorithms.

---

## Prerequisites

1. **Database Setup**
   ```bash
   # Execute migrations in Supabase SQL Editor
   # Run these files in order:
   1. supabase/migrations/20260204_phase3_adherence_prediction.sql
   2. supabase/migrations/20260204_phase3_therapist_matching.sql
   ```

2. **Dependencies Installed**
   ```bash
   cd mind-sync-now
   npm install
   ```

3. **Environment Variables**
   - Ensure `.env` has Supabase credentials
   - Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Running the App

```bash
# Development mode
npm run dev

# Run tests
npm test

# Run specific test suite
npm test adherencePrediction
npm test notificationTiming
npm test therapistMatching
```

---

## Testing Phase 3 Features

### 1. Medication Adherence Prediction

**Location:** Dashboard → Medication Tracker

**How to Test:**
1. Add a medication with schedule
2. Log some doses (taken/missed)
3. View risk indicators on medication cards:
   - 🟢 Low risk (green badge)
   - 🟡 Moderate risk (yellow badge)
   - 🔴 High risk (red badge)
4. Check AI insights showing risk factors
5. View 7-day forecast (click to expand)
6. Look for streak protection alerts

**Expected Behavior:**
- Risk badges appear on medication cards
- Percentage shows probability of missing next dose
- AI insights explain top 2 risk factors
- 7-day forecast shows daily predictions
- Streak alerts appear for high-risk medications

**Test Data:**
```typescript
// Add medication
{
  name: "Test Med",
  dosage: "10mg",
  frequency: "daily",
  time: "09:00"
}

// Log some doses
- Day 1: Taken ✓
- Day 2: Missed ✗
- Day 3: Taken ✓
- Day 4: Taken ✓
- Day 5: Missed ✗
```

---

### 2. Notification Timing Optimization

**Location:** Profile → Notification Analytics (new component)

**How to Test:**
1. Navigate to Profile page
2. View Notification Analytics section
3. Interact with notifications (open/dismiss)
4. Wait for system to learn patterns
5. Check "Your Best Times" section
6. View average response time
7. See AI learning progress

**Expected Behavior:**
- Analytics dashboard shows engagement metrics
- Best times ranked by engagement rate
- Response time calculated in minutes
- Learning progress indicator shows confidence
- Active hours displayed

**Test Engagement:**
```typescript
// Simulate engagement
1. Receive notification at 9:00 AM → Open immediately
2. Receive notification at 2:00 PM → Dismiss after 5 min
3. Receive notification at 8:00 PM → Open after 2 min
4. System learns: 9:00 AM and 8:00 PM are best times
```

---

### 3. Therapist Matching

**Location:** Therapists → Find Your Therapist

**How to Test:**
1. Navigate to Therapists page
2. Adjust filters:
   - Specialization (e.g., "Anxiety")
   - Language (e.g., "English")
   - Session Type (e.g., "Video")
   - Max Distance (e.g., "50 km")
3. View AI-matched results with scores
4. Click "Why This Match?" for explanation
5. View match breakdown by category
6. Check similar patient success rate
7. Click "Book Session" to test booking flow

**Expected Behavior:**
- Match scores (0-100%) displayed prominently
- Key matching factors highlighted
- Explanation dialog shows detailed breakdown
- Score breakdown by category (specialization, similar patients, etc.)
- Similar patient success rate shown
- Booking tracked in database

**Sample Filters:**
```typescript
{
  specializations: ["Anxiety", "Depression"],
  languages: ["English"],
  sessionType: "video",
  maxDistance: 50
}
```

---

## API Usage Examples

### Adherence Prediction

```typescript
import { predictAdherenceRisk } from '@/services/phase3/adherencePrediction';

// Predict risk for a medication
const prediction = await predictAdherenceRisk(
  'medication-id',
  'user-id'
);

console.log(prediction);
// {
//   medicationId: "...",
//   riskLevel: "moderate",
//   probability: 65,
//   confidence: 80,
//   factors: [
//     { factor: "Recent streak broken", impact: "negative", weight: 1.5 },
//     { factor: "Weekend day", impact: "negative", weight: 0.5 }
//   ]
// }
```

### Notification Timing

```typescript
import { calculateOptimalSendTime } from '@/services/phase3/notificationTiming';

// Calculate optimal time for notification
const optimalTime = await calculateOptimalSendTime(
  'mood_checkin',
  'user-id',
  'low'
);

console.log(optimalTime);
// {
//   recommendedTime: Date(2026-02-04T14:30:00),
//   confidence: 85,
//   reasoning: "Based on your engagement patterns, 2:30 PM has 85% engagement rate"
// }
```

### Therapist Matching

```typescript
import { findMatches } from '@/services/phase3/therapistMatching';

// Find matching therapists
const matches = await findMatches('user-id', {
  specializations: ['Anxiety'],
  languages: ['English'],
  sessionType: 'video',
  maxDistance: 50
});

console.log(matches[0]);
// {
//   therapist: { name: "Dr. Smith", ... },
//   matchScore: 87,
//   matchPercentage: 87,
//   keyMatchingFactors: [
//     "Specializes in anxiety treatment",
//     "85% success rate with similar patients",
//     "Speaks your preferred language"
//   ]
// }
```

---

## Troubleshooting

### Issue: No risk indicators showing

**Solution:**
1. Ensure medications table exists in database
2. Check that user has logged medication doses
3. Verify Supabase connection
4. Check browser console for errors

### Issue: Notification analytics empty

**Solution:**
1. Ensure notification_interactions table exists
2. User needs to interact with notifications first
3. System needs time to collect data (minimum 5 interactions)
4. Check that engagement tracking is enabled

### Issue: No therapist matches

**Solution:**
1. Ensure therapists table has sample data
2. Check that filters aren't too restrictive
3. Verify RLS policies allow reading therapists
4. Try relaxing filter criteria

### Issue: Tests failing with database errors

**Solution:**
1. Check Supabase credentials in `.env`
2. Ensure migrations have been executed
3. Verify RLS policies are set up correctly
4. Check network connection to Supabase

---

## Database Queries for Testing

### Check Adherence Predictions

```sql
-- View all predictions for a user
SELECT * FROM adherence_predictions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;

-- Check adherence rate
SELECT calculate_adherence_rate('your-user-id', 7);

-- Check current streak
SELECT calculate_adherence_streak('your-user-id');
```

### Check Notification Engagement

```sql
-- View engagement history
SELECT * FROM notification_interactions
WHERE user_id = 'your-user-id'
ORDER BY sent_at DESC;

-- Check engagement rate by hour
SELECT 
  EXTRACT(HOUR FROM sent_at) as hour,
  COUNT(*) as total,
  SUM(CASE WHEN action = 'opened' THEN 1 ELSE 0 END) as opened,
  ROUND(SUM(CASE WHEN action = 'opened' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as engagement_rate
FROM notification_interactions
WHERE user_id = 'your-user-id'
GROUP BY hour
ORDER BY hour;
```

### Check Therapist Matches

```sql
-- View all therapists
SELECT id, name, specializations, rating, review_count
FROM therapists
WHERE active = true;

-- View booking history
SELECT * FROM therapist_bookings
WHERE user_id = 'your-user-id'
ORDER BY booking_date DESC;

-- Check therapy outcomes
SELECT * FROM therapy_outcomes
WHERE user_id = 'your-user-id'
ORDER BY session_date DESC;
```

---

## Performance Benchmarks

### Expected Performance

| Operation | Target | Actual |
|-----------|--------|--------|
| Adherence Prediction | <100ms | ✅ <100ms |
| Notification Timing (algorithm) | <50ms | ✅ <50ms |
| Notification Timing (with DB) | N/A | ~900ms |
| Therapist Matching | <500ms | ✅ <500ms |
| Match Explanation | <200ms | ✅ <200ms |

### Monitoring Performance

```typescript
// Add performance monitoring
const start = performance.now();
const result = await predictAdherenceRisk(medicationId, userId);
const duration = performance.now() - start;
console.log(`Prediction took ${duration}ms`);
```

---

## Feature Flags (Optional)

If you want to enable/disable features:

```typescript
// In your config
const PHASE3_FEATURES = {
  adherencePrediction: true,
  notificationTiming: true,
  therapistMatching: true,
  notificationAnalytics: true
};

// Use in components
{PHASE3_FEATURES.adherencePrediction && (
  <AdherenceRiskIndicator />
)}
```

---

## Next Steps

1. **Execute Database Migrations** ← Start here!
2. **Test Each Feature** - Follow testing guides above
3. **Provide Feedback** - Report issues or suggestions
4. **Complete Remaining Tasks** - See PHASE3_FINAL_STATUS.md

---

## Support

**Documentation:**
- `PHASE3_FINAL_STATUS.md` - Overall status
- `PHASE3_COMPLETE_SUMMARY.md` - Technical details
- `PHASE3_UI_INTEGRATION_COMPLETE.md` - UI integration
- `.kiro/specs/phase3-algorithms/` - Requirements and design

**Test Files:**
- `src/services/phase3/__tests__/adherencePrediction.test.ts`
- `src/services/phase3/__tests__/notificationTiming.test.ts`
- `src/services/phase3/__tests__/therapistMatching.test.ts`

**Need Help?**
- Check browser console for errors
- Review test files for usage examples
- Verify database migrations executed
- Check Supabase logs for database errors

---

**Last Updated:** February 4, 2026  
**Version:** 1.0.0  
**Status:** Ready for Testing ✅
