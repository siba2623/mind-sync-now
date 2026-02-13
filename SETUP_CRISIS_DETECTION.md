# 🚨 Crisis Detection Setup - Quick Start

## Why You're Seeing This

The crisis detection feature is **built and ready**, but it needs a database table to store the results. This is a one-time setup that takes **2 minutes**.

---

## 🎯 What You Need to Do

### Option 1: Quick Setup (Recommended)

1. **Open Supabase**
   - Go to: https://supabase.com/dashboard
   - Login to your account
   - Select project: `fpzuagmsfvfwxyogckkp`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run the SQL**
   - Open file: `RUN_THIS_IN_SUPABASE.sql` (in this folder)
   - Copy ALL the code
   - Paste into Supabase SQL Editor
   - Click "Run" (or Ctrl+Enter)

4. **Done!**
   - You should see: "✅ Crisis Detection tables created successfully!"
   - Refresh your app
   - Test by writing a journal entry

---

## 📸 Visual Guide

```
Step 1: Supabase Dashboard
┌─────────────────────────────────────┐
│ Supabase Dashboard                  │
│                                     │
│ ┌─────────────┐                    │
│ │ Projects    │                    │
│ │ > fpzuagm...│ ← Select this     │
│ └─────────────┘                    │
└─────────────────────────────────────┘

Step 2: SQL Editor
┌─────────────────────────────────────┐
│ Left Sidebar                        │
│                                     │
│ □ Table Editor                      │
│ □ SQL Editor      ← Click here     │
│ □ Database                          │
└─────────────────────────────────────┘

Step 3: New Query
┌─────────────────────────────────────┐
│ SQL Editor                          │
│                                     │
│ [+ New Query]     ← Click here     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ -- Paste SQL here               ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
│ [Run ▶]           ← Click to run   │
└─────────────────────────────────────┘

Step 4: Success!
┌─────────────────────────────────────┐
│ Results                             │
│                                     │
│ ✅ Crisis Detection tables created │
│    successfully!                    │
│                                     │
│ You can now test the crisis         │
│ detection feature.                  │
└─────────────────────────────────────┘
```

---

## 🧪 Test It Works

After running the SQL:

1. **Go to your app**: http://localhost:8080
2. **Login** to your account
3. **Go to Journal**: Dashboard → Journal
4. **Write test entry**: "feeling really depressed and alone"
5. **Save** the entry
6. **Go to Crisis Safety**: Dashboard → Crisis Safety
7. **See the result**: Should appear in "Recent Wellbeing Checks"

---

## ✅ What You Should See

### Before Setup:
```
Crisis Detection & Safety
┌─────────────────────────────────────┐
│ 🛡️ 24/7 Crisis Support             │
│ [Crisis hotlines displayed]         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🛡️ Safety Monitoring                │
│ [Monitoring info]                   │
└─────────────────────────────────────┘

[No "Recent Wellbeing Checks" section]
```

### After Setup + Test Entry:
```
Crisis Detection & Safety
┌─────────────────────────────────────┐
│ 🛡️ 24/7 Crisis Support             │
│ [Crisis hotlines displayed]         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🛡️ Safety Monitoring                │
│ [Monitoring info]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Recent Wellbeing Checks             │
│                                     │
│ ⚠️ MODERATE Level                   │
│ Confidence: 70%                     │
│ Jan 30, 2026                        │
│ Factors: depressed, alone           │
└─────────────────────────────────────┘
```

---

## 🎉 Benefits After Setup

Once set up, you'll have:

- ✅ **Automatic crisis detection** on every journal entry
- ✅ **Real-time monitoring** of mental health indicators
- ✅ **Safety alerts** for high-risk situations
- ✅ **Historical tracking** of wellbeing checks
- ✅ **South African crisis resources** always available

---

## 🐛 Common Issues

### "No Recent Wellbeing Checks" after writing entry
**Cause**: Database table not created yet  
**Solution**: Run the SQL in Supabase (see above)

### "Error: relation does not exist"
**Cause**: Database table not created  
**Solution**: Run the SQL in Supabase

### SQL runs but still not working
**Solution**: 
1. Refresh your app (Ctrl+R)
2. Check browser console (F12) for errors
3. Try logging out and back in

---

## 📁 Files You Need

1. **RUN_THIS_IN_SUPABASE.sql** - The SQL code to run
2. **DATABASE_SETUP_INSTRUCTIONS.md** - Detailed instructions
3. **PHASE2_TESTING_GUIDE.md** - Full testing guide

---

## ⏱️ Time Required

- **Setup**: 2 minutes
- **Testing**: 3 minutes
- **Total**: 5 minutes

---

## 🚀 Ready to Start?

1. Open `RUN_THIS_IN_SUPABASE.sql`
2. Copy the code
3. Go to Supabase SQL Editor
4. Paste and run
5. Test in your app!

---

**Current Status**: ⏳ Database setup needed  
**Next Step**: Run SQL in Supabase  
**After Setup**: ✅ Crisis detection will work automatically

*Let's get this set up so you can test the amazing crisis detection feature!* 🛡️💙
