# 🚀 Quick Test Instructions - Phase 2 Crisis Detection

## ⚡ 5-Minute Quick Test

Your application is **running and ready** at `http://localhost:8080`

---

## 🎯 Test in 3 Steps

### Step 1: View Crisis Detection Monitor (1 min)
1. Open browser to `http://localhost:8080`
2. Login to your account
3. Click **"Crisis Safety"** card (red gradient with AlertTriangle icon)
4. ✅ Verify you see:
   - 24/7 Crisis hotlines (4 numbers)
   - Safety Monitoring status (green "Active" badge)
   - Additional support buttons

### Step 2: Test Low-Risk Detection (2 min)
1. Click **"← Back to Dashboard"**
2. Click **"Journal"** card
3. Write: `"feeling a bit down today, not my best mood"`
4. Click **"Save Entry"**
5. Go back to **Crisis Safety**
6. ✅ Verify: Detection may appear in "Recent Wellbeing Checks" (LOW or NONE level)

### Step 3: Test Moderate-Risk Detection (2 min)
1. Go to **Journal** again
2. Write: `"feeling really depressed and alone, everything feels overwhelming"`
3. Click **"Save Entry"**
4. Go back to **Crisis Safety**
5. ✅ Verify: 
   - New detection in "Recent Wellbeing Checks"
   - Level: MODERATE (yellow)
   - Confidence: ~70%
   - Triggers shown: ["depressed", "alone", "overwhelming"]

---

## ✅ Success Indicators

### You'll Know It's Working When:
- ✅ Crisis hotlines are displayed and clickable
- ✅ Journal entries trigger detections
- ✅ Detections appear in Recent Wellbeing Checks
- ✅ Color-coded by risk level (green/blue/yellow/orange/red)
- ✅ Confidence scores shown
- ✅ No errors in browser console

---

## 🎨 What You Should See

### Crisis Detection Monitor:
```
┌─────────────────────────────────────────┐
│ 🛡️ 24/7 Crisis Support                 │
│ Immediate help is always available      │
│                                         │
│ ┌─────────────┐  ┌─────────────┐      │
│ │ SADAG       │  │ Lifeline    │      │
│ │ 0800 567 567│  │ 0861 322 322│      │
│ │ 24/7        │  │ 24/7        │      │
│ └─────────────┘  └─────────────┘      │
│                                         │
│ ⚠️ If in immediate danger: Call 112    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🛡️ Safety Monitoring        [Active ✓] │
│ We monitor your wellbeing...            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Recent Wellbeing Checks                 │
│                                         │
│ [MODERATE] Confidence: 70%              │
│ Jan 30, 2026                            │
│ Factors: depressed, alone, overwhelming │
└─────────────────────────────────────────┘
```

---

## ⚠️ Important Testing Notes

### DO:
- ✅ Test with various journal entries
- ✅ Check different risk levels
- ✅ Verify crisis resources are visible
- ✅ Test on mobile (responsive design)

### DON'T:
- ❌ Test critical keywords in production
- ❌ Use real crisis situations for testing
- ❌ Share test data publicly
- ❌ Ignore real crisis indicators

---

## 🐛 Troubleshooting

### Issue: Crisis Detection Monitor not showing
**Solution**: 
- Refresh page
- Check browser console for errors
- Verify you're logged in

### Issue: Detections not appearing
**Solution**:
- Wait 2-3 seconds after saving journal entry
- Refresh Crisis Detection Monitor page
- Check browser console for errors

### Issue: Phone numbers not clickable
**Solution**:
- This is expected on desktop
- Test on mobile device for tap-to-call

---

## 📊 Expected Performance

- **Detection Time**: <200ms
- **Page Load**: <1 second
- **No Errors**: Console should be clean
- **Responsive**: Works on mobile and desktop

---

## 🎓 Full Testing

For comprehensive testing, see:
- **`PHASE2_TESTING_GUIDE.md`** - 10 detailed test scenarios
- **`PHASE2_READY_FOR_TESTING.md`** - Complete overview

---

## 📞 Crisis Resources (Always Available)

- **112** - Emergency Services
- **0800 567 567** - SADAG Crisis Line
- **0861 322 322** - Lifeline South Africa
- **0860 999 911** - Discovery Health Emergency

---

**Status**: ✅ Ready to Test  
**Time Required**: 5 minutes  
**Difficulty**: Easy

*Happy Testing!* 🎉
