# 🗄️ Database Setup Instructions

## ⚠️ IMPORTANT: Run This First!

The crisis detection feature requires a database table that needs to be created. Follow these steps:

---

## 📋 Steps to Set Up Database

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **fpzuagmsfvfwxyogckkp**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **"New Query"** button
2. Open the file: `RUN_THIS_IN_SUPABASE.sql`
3. Copy ALL the SQL code from that file
4. Paste it into the Supabase SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Success
You should see a success message:
```
✅ Crisis Detection tables created successfully!
You can now test the crisis detection feature.
```

---

## 🔍 What This Creates

### Tables:
- **crisis_detections** - Stores all crisis detection results

### Indexes:
- Fast lookups by user_id
- Fast sorting by timestamp
- Fast filtering by crisis_level

### Security:
- Row Level Security (RLS) enabled
- Users can only see their own detections

### Functions:
- `get_recent_crisis_detections()` - Get last N detections
- `has_recent_critical_crisis()` - Check for recent crises
- `trigger_crisis_alert()` - Auto-create alerts

---

## ✅ After Running Migration

### Test the Feature:
1. Go to your app at `http://localhost:8080`
2. Navigate to Dashboard → Journal
3. Write: "feeling really depressed and alone"
4. Save the entry
5. Go to Dashboard → Crisis Safety
6. You should now see the detection in "Recent Wellbeing Checks"!

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solution**: The table is already created. You're good to go!

### Error: "permission denied"
**Solution**: Make sure you're logged into the correct Supabase project

### Error: "syntax error"
**Solution**: Make sure you copied the ENTIRE SQL file, including all comments

### Still Not Working?
1. Check browser console for errors (F12)
2. Verify you're logged into the app
3. Try refreshing the page
4. Check Supabase logs in the dashboard

---

## 📞 Need Help?

### Check These Files:
- `RUN_THIS_IN_SUPABASE.sql` - The SQL to run
- `PHASE2_TESTING_GUIDE.md` - Full testing instructions
- `QUICK_TEST_INSTRUCTIONS.md` - Quick 5-minute test

### Supabase Dashboard:
- Project: fpzuagmsfvfwxyogckkp
- URL: https://fpzuagmsfvfwxyogckkp.supabase.co

---

**Status**: ⏳ Waiting for database setup  
**Next Step**: Run the SQL in Supabase  
**Time Required**: 2 minutes

*Once the database is set up, crisis detection will work automatically!* 🛡️
