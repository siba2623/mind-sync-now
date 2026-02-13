# Mental Health Twin - Setup Guide

## 🚀 Quick Setup (5 minutes)

The Mental Health Twin feature requires database tables to be created in Supabase.

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your MindSync project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Migration
1. Click **"New Query"** button
2. Open the file: `RUN_MENTAL_HEALTH_TWIN_MIGRATION.sql` (in your project root)
3. Copy ALL the SQL code from that file
4. Paste it into the Supabase SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see a success message:
```
Mental Health Twin tables created successfully!
Tables: user_pattern_insights, user_correlations, user_predictions, 
user_intervention_effectiveness, user_risk_factors, mental_health_twin_profile
```

### Step 4: Refresh Your App
1. Go back to your MindSync app
2. Refresh the page (F5 or Ctrl+R)
3. Click on "Your Twin" in the dashboard
4. You should now see the Mental Health Twin interface!

---

## ✅ What Gets Created

The migration creates 6 new tables:

1. **user_pattern_insights** - Stores personalized insights discovered for each user
2. **user_correlations** - Stores statistical correlations found in user data
3. **user_predictions** - Stores future predictions made for each user
4. **user_intervention_effectiveness** - Tracks what coping strategies work best
5. **user_risk_factors** - Identifies personal risk factors
6. **mental_health_twin_profile** - Summary profile of the Mental Health Twin

All tables include:
- ✅ Row Level Security (users can only see their own data)
- ✅ Automatic indexes for performance
- ✅ Proper foreign key relationships
- ✅ Automatic triggers for profile updates

---

## 🔍 Troubleshooting

### Error: "relation does not exist"
**Solution:** The tables haven't been created yet. Run the migration SQL.

### Error: "permission denied"
**Solution:** Make sure you're logged into Supabase with the correct project.

### Error: "duplicate key value"
**Solution:** The tables already exist. You can skip this step.

### Still seeing "Unable to load"?
1. Check browser console for errors (F12 → Console tab)
2. Verify you're logged into the app
3. Try logging out and back in
4. Clear browser cache and refresh

---

## 📊 How to Use After Setup

### For New Users (0-10 data points)
- You'll see: "Keep tracking to unlock insights!"
- Action: Log your mood daily for 10 days
- The Twin needs data to learn your patterns

### After 10+ Data Points
- Click "Analyze My Patterns" button
- System will generate first insights
- Check back weekly for new discoveries

### After 30+ Days
- Profile will be 100% complete
- Multiple insights with high confidence
- Accurate predictions for upcoming days
- Personalized intervention rankings

---

## 🎯 What to Expect

### Week 1-2: Data Collection
- Twin profile: 0-30% complete
- No insights yet
- Focus on consistent tracking

### Week 3-4: First Insights
- Twin profile: 30-60% complete
- 2-5 insights generated
- Basic patterns detected

### Month 2+: Full Intelligence
- Twin profile: 60-100% complete
- 10+ insights with high confidence
- Accurate predictions
- Personalized recommendations

---

## 💡 Tips for Best Results

1. **Track Consistently** - Daily mood logs are key
2. **Be Honest** - Accurate data = accurate insights
3. **Try Different Strategies** - The Twin learns what works for YOU
4. **Check Weekly** - New insights appear as patterns emerge
5. **Follow Recommendations** - Test the suggestions and see results

---

## 🆘 Need Help?

If you're still having issues:
1. Check the browser console for specific errors
2. Verify all 6 tables were created in Supabase
3. Make sure RLS policies are enabled
4. Try the "Analyze My Patterns" button manually

---

**That's it! Your Mental Health Twin is now ready to learn your unique patterns and provide personalized insights.** 🧠✨
