# Phase 2 Testing Guide - Crisis Detection System

## 🎯 Testing Overview

This guide provides step-by-step instructions for testing the Crisis Detection Algorithm implementation in MindSync.

---

## ✅ Pre-Testing Checklist

### 1. Database Setup
- [ ] Run migration: `20260130_crisis_detection_system.sql`
- [ ] Verify tables created:
  - `crisis_detections`
  - `care_coordinator_alerts` (updated)
  - `emergency_contacts` (updated)
  - `notifications` (updated)

### 2. Application Running
- [ ] Dev server running: `npm run dev`
- [ ] No TypeScript errors
- [ ] Application accessible at `http://localhost:8080`

### 3. User Authentication
- [ ] Logged in as test user
- [ ] User has profile data
- [ ] User has some mood history

---

## 🧪 Test Scenarios

### **Test 1: Crisis Detection Monitor UI**

#### Steps:
1. Navigate to Dashboard
2. Click "Crisis Safety" card (red gradient card)
3. Verify Crisis Detection Monitor loads

#### Expected Results:
✅ **24/7 Crisis Resources Card** displays:
- SADAG: 0800 567 567
- Lifeline: 0861 322 322
- Suicide Crisis Line: 0800 567 567
- Discovery Health: 0860 999 911
- All phone numbers are clickable (tap to call)
- "24/7" badges visible
- Emergency services alert (112) shown

✅ **Safety Monitoring Status** shows:
- Green "Active" badge
- "How It Works" explanation
- Privacy information

✅ **Additional Support** buttons:
- Crisis Support Resources
- Find a Therapist
- Support Groups

---

### **Test 2: Low-Risk Detection**

#### Steps:
1. Go to Journal (Dashboard → Journal)
2. Write entry: "feeling a bit down today, not my best mood"
3. Save entry
4. Check Crisis Detection Monitor

#### Expected Results:
✅ Detection logged with:
- Level: LOW or NONE
- Confidence: 60-90%
- No alerts triggered
- Entry appears in "Recent Wellbeing Checks" (if LOW)

---

### **Test 3: Moderate-Risk Detection**

#### Steps:
1. Go to Journal
2. Write entry: "feeling really depressed and alone, everything feels overwhelming and I can't cope"
3. Save entry
4. Check Crisis Detection Monitor
5. Check notifications

#### Expected Results:
✅ Detection logged with:
- Level: MODERATE
- Confidence: 70%+
- Triggers: ["depressed", "alone", "overwhelming", "can't cope"]

✅ Notification created:
- Title: "💙 Check-In"
- Message: "We're here if you need support..."
- Priority: MEDIUM
- Action URL: /wellness

✅ Care coordinator alert created:
- Alert Type: MODERATE_CONCERN
- Status: PENDING
- Priority: NORMAL

---

### **Test 4: High-Risk Detection**

#### Steps:
1. Go to Journal
2. Write entry: "feeling hopeless, can't see a way out, everything is worthless and I'm a burden"
3. Save entry
4. Check Crisis Detection Monitor
5. Check notifications

#### Expected Results:
✅ Detection logged with:
- Level: HIGH
- Confidence: 85%+
- Triggers: ["hopeless", "can't see a way out", "worthless", "burden"]

✅ Notification created:
- Title: "⚠️ We're Concerned About You"
- Message: "Please consider reaching out..."
- Priority: HIGH
- Action URL: /crisis-support

✅ Care coordinator alert created:
- Alert Type: HIGH_RISK_CRISIS
- Status: PENDING
- Priority: URGENT

---

### **Test 5: Critical Crisis Detection** ⚠️

**⚠️ WARNING: DO NOT TEST IN PRODUCTION**

This test should ONLY be performed in a development/testing environment with test data.

#### Steps:
1. Go to Journal
2. Write entry: "I'm thinking about ending my life, I have a plan"
3. Save entry
4. Check Crisis Detection Monitor
5. Check notifications
6. Check care coordinator alerts

#### Expected Results:
✅ Detection logged with:
- Level: CRITICAL
- Confidence: 95%+
- Triggers: ["suicide", "ending my life", "plan"]

✅ Immediate notification:
- Title: "🚨 Immediate Support Available"
- Message: "We're here for you. Please reach out..."
- Priority: CRITICAL
- Action URL: /crisis-support

✅ Care coordinator alert:
- Alert Type: CRITICAL_CRISIS
- Status: PENDING
- Priority: IMMEDIATE

✅ Emergency contacts alerted (if configured)

✅ Crisis resources prominently displayed

---

### **Test 6: Behavioral Context Integration**

#### Steps:
1. Log several low moods (1-2 rating) over 3 days
2. Skip medication doses (if using medication tracker)
3. Write journal entry: "feeling down and tired"
4. Check detection result

#### Expected Results:
✅ Risk score elevated due to:
- Recent low mood trend (+30 points)
- Poor medication adherence (+20 points)
- Negative sentiment in text

✅ May trigger MODERATE or HIGH level despite mild text

---

### **Test 7: Sentiment Analysis**

#### Steps:
1. Write positive entry: "feeling grateful and hopeful today, things are improving"
2. Check detection
3. Write negative entry: "everything is terrible, awful, horrible, worst day ever"
4. Check detection

#### Expected Results:
✅ Positive entry:
- Sentiment score reduced (negative words)
- Lower risk level
- May show NONE level

✅ Negative entry:
- Sentiment score increased
- Higher risk level
- May trigger LOW or MODERATE

---

### **Test 8: Recent Detections History**

#### Steps:
1. Create multiple journal entries with varying risk levels
2. Navigate to Crisis Detection Monitor
3. Check "Recent Wellbeing Checks" section

#### Expected Results:
✅ Shows last 5 detections
✅ Color-coded by level:
- CRITICAL: Red
- HIGH: Orange
- MODERATE: Yellow
- LOW: Blue
- NONE: Green

✅ Each detection shows:
- Level badge with icon
- Confidence percentage
- Date
- Top 3 triggers (if any)

---

### **Test 9: Crisis Resources Accessibility**

#### Steps:
1. Navigate to Crisis Detection Monitor
2. Test each phone number link
3. Test each support button

#### Expected Results:
✅ Phone links open dialer (mobile) or show number (desktop)
✅ All hotlines displayed correctly
✅ Emergency services alert visible
✅ Support buttons navigate to correct pages

---

### **Test 10: Privacy & Data Storage**

#### Steps:
1. Create test detection
2. Check database directly (Supabase dashboard)
3. Verify data stored correctly

#### Expected Results:
✅ `crisis_detections` table contains:
- detection_id (UUID)
- user_id (correct user)
- text_analyzed (first 500 chars)
- crisis_level (correct level)
- confidence (0.00-1.00)
- triggers (array)
- recommended_action
- timestamp

✅ RLS policies enforced:
- User can only see own detections
- Care coordinators can see assigned alerts

---

## 🔍 Edge Cases to Test

### Edge Case 1: Empty Text
- Input: ""
- Expected: NONE level, no triggers

### Edge Case 2: Very Long Text
- Input: 1000+ word journal entry
- Expected: Processes in <200ms, analyzes correctly

### Edge Case 3: Mixed Sentiment
- Input: "feeling hopeful but also scared and anxious"
- Expected: Balanced scoring, considers both positive and negative

### Edge Case 4: Repeated Keywords
- Input: "suicide suicide suicide" (testing keyword spam)
- Expected: Still triggers CRITICAL (not inflated by repetition)

### Edge Case 5: No Recent Data
- New user with no mood history
- Expected: Detection works, behavioral context defaults to 0

---

## 📊 Performance Testing

### Metrics to Verify:
- [ ] Detection time: <200ms
- [ ] Database insert: <100ms
- [ ] UI render: <500ms
- [ ] No memory leaks after 100 detections
- [ ] Handles 1000+ word entries

### Tools:
- Browser DevTools (Performance tab)
- Network tab (API calls)
- Console (timing logs)

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Simple NLP**: Uses keyword matching, not advanced NLP
2. **English Only**: Keywords are English-based
3. **Context Limited**: Doesn't understand sarcasm or metaphors
4. **No ML Model**: Rule-based system (Phase 3 will add ML)

### False Positives:
- Academic discussions about mental health
- Quoting others
- Song lyrics or poetry
- Hypothetical scenarios

### False Negatives:
- Coded language
- Euphemisms
- Non-English text
- Very subtle indicators

---

## ✅ Acceptance Criteria

### Must Pass:
- [ ] All CRITICAL keywords trigger immediate alert
- [ ] HIGH keywords trigger urgent alert
- [ ] MODERATE keywords trigger check-in
- [ ] Crisis resources always visible
- [ ] Phone numbers clickable
- [ ] Detection time <200ms
- [ ] No TypeScript errors
- [ ] RLS policies enforced
- [ ] Notifications created correctly
- [ ] Care coordinator alerts created

### Should Pass:
- [ ] Behavioral context integrated
- [ ] Sentiment analysis working
- [ ] Recent history displayed
- [ ] UI responsive on mobile
- [ ] Graceful error handling
- [ ] Privacy information clear

---

## 🚨 Safety Protocols

### During Testing:
1. **Use Test Accounts Only**: Never test with real crisis keywords on production
2. **Clear Test Data**: Delete test detections after testing
3. **Monitor Alerts**: Ensure test alerts don't reach real care coordinators
4. **Document Issues**: Log any false positives/negatives
5. **Clinical Review**: Have mental health professional review results

### If Real Crisis Detected:
1. **Do Not Ignore**: Even in testing, treat seriously
2. **Contact User**: Reach out if real user shows crisis signs
3. **Follow Protocol**: Use established crisis intervention procedures
4. **Document**: Log incident for review

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]
**Tester**: [Name]
**Environment**: Development
**Build**: [Version]

### Test Results:
- [ ] Test 1: Crisis Monitor UI - PASS/FAIL
- [ ] Test 2: Low-Risk Detection - PASS/FAIL
- [ ] Test 3: Moderate-Risk Detection - PASS/FAIL
- [ ] Test 4: High-Risk Detection - PASS/FAIL
- [ ] Test 5: Critical Detection - PASS/FAIL (DEV ONLY)
- [ ] Test 6: Behavioral Context - PASS/FAIL
- [ ] Test 7: Sentiment Analysis - PASS/FAIL
- [ ] Test 8: Recent History - PASS/FAIL
- [ ] Test 9: Crisis Resources - PASS/FAIL
- [ ] Test 10: Privacy & Data - PASS/FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Additional observations]

### Recommendation:
[ ] Ready for production
[ ] Needs fixes
[ ] Requires clinical review
```

---

## 🎓 Next Steps After Testing

### If Tests Pass:
1. **Clinical Validation**: Have mental health professionals review
2. **Pilot Study**: Test with small group of real users (IRB approved)
3. **Monitor Outcomes**: Track intervention effectiveness
4. **Iterate**: Refine thresholds based on data

### If Tests Fail:
1. **Document Issues**: Log all failures
2. **Fix Bugs**: Address critical issues first
3. **Retest**: Run full test suite again
4. **Review Design**: May need algorithm adjustments

---

## 📞 Support Contacts

### Technical Issues:
- Developer: [Your contact]
- Database: [DBA contact]

### Clinical Questions:
- Clinical Lead: [Clinician contact]
- Ethics Board: [IRB contact]

### Emergency:
- **112** - Emergency Services
- **0800 567 567** - SADAG Crisis Line

---

**Last Updated**: January 30, 2026  
**Version**: 2.0.0  
**Status**: Ready for Testing

*Test responsibly. Lives depend on it.* 🛡️💙
