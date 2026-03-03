# 🔧 Fix Vercel Blank Screen - Environment Variables Missing

## The Problem

Your app is deployed but showing a blank screen with this error:
```
Uncaught Error: supabaseUrl is required.
```

This means the environment variables aren't set in Vercel.

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your **mind-sync-now** project (or mind-sync-now2)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add these two variables:

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
```
(Paste your actual Supabase URL)

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Paste your actual anon key - the long string from Supabase)

**Important:** 
- Make sure the names are EXACTLY: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- They must start with `VITE_` (all caps)
- No quotes around the values
- Select "Production", "Preview", and "Development" for both
- Click "Save" after each one

### Step 3: Redeploy

After adding the variables:

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

OR simply push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Step 4: Test

1. Open your Vercel URL: `https://mind-sync-now2.vercel.app`
2. The app should now load properly!
3. Try creating an account to test

---

## 🎯 Visual Guide

### Where to Find Supabase Credentials:

```
Supabase Dashboard
└── Your Project
    └── Settings (⚙️)
        └── API
            ├── Project URL: https://xxxxx.supabase.co  ← Copy this
            └── Project API keys
                └── anon public: eyJhbGci...  ← Copy this
```

### Where to Add in Vercel:

```
Vercel Dashboard
└── Your Project (mind-sync-now)
    └── Settings
        └── Environment Variables
            └── Add New
                ├── Name: VITE_SUPABASE_URL
                ├── Value: [paste URL]
                └── Environments: ✓ Production ✓ Preview ✓ Development
```

---

## 🐛 Still Not Working?

### Check These Common Issues:

1. **Variable Names Must Be Exact**
   - ✅ Correct: `VITE_SUPABASE_URL`
   - ❌ Wrong: `SUPABASE_URL`, `Vite_Supabase_Url`, `VITE_SUPABASE_URL_`

2. **No Spaces or Quotes**
   - ✅ Correct: `https://abc123.supabase.co`
   - ❌ Wrong: `"https://abc123.supabase.co"` or ` https://abc123.supabase.co `

3. **Must Redeploy After Adding Variables**
   - Environment variables only take effect after redeployment
   - Either redeploy manually or push a new commit

4. **Check Supabase Project is Active**
   - Make sure your Supabase project isn't paused
   - Free tier projects pause after 1 week of inactivity

---

## 📸 Screenshot Guide

### Step 1: Supabase API Settings
![Supabase API](https://supabase.com/docs/img/api-settings.png)

Look for:
- **Project URL** section
- **Project API keys** section
- Copy the **anon** **public** key (NOT the service_role key!)

### Step 2: Vercel Environment Variables
In Vercel:
1. Project → Settings → Environment Variables
2. Click "Add New"
3. Enter name and value
4. Select all environments
5. Click "Save"

---

## ✅ Verification Checklist

After adding variables and redeploying:

- [ ] No console errors about "supabaseUrl is required"
- [ ] App loads and shows homepage
- [ ] Can navigate to /auth page
- [ ] Can see login/signup form
- [ ] No blank screen

---

## 🎉 Success!

Once you add the environment variables and redeploy, your app will work perfectly!

Your live URL: https://mind-sync-now2.vercel.app

---

## 💡 Pro Tips

### For Future Deployments:

1. **Always add environment variables BEFORE deploying**
2. **Use .env.example as a reference** (already in your project)
3. **Never commit .env files to Git** (already in .gitignore)
4. **Test locally first** with your own .env file

### Local Development:

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run:
```bash
npm run dev
```

---

## 📞 Need More Help?

If you're still having issues:

1. **Check Vercel build logs:**
   - Deployments tab → Click on deployment → View build logs
   - Look for any errors

2. **Check browser console:**
   - Open your deployed site
   - Press F12 → Console tab
   - Look for error messages

3. **Verify Supabase connection:**
   - Try accessing your Supabase dashboard
   - Make sure the project is active
   - Check if you can see your tables

---

## 🚀 Quick Command Reference

```bash
# Test build locally
npm run build
npm run preview

# Trigger Vercel redeploy
git commit --allow-empty -m "Redeploy"
git push origin main

# Check environment variables are loaded (in browser console)
console.log(import.meta.env.VITE_SUPABASE_URL)
```

---

**Next Steps After Fix:**

1. ✅ Add environment variables to Vercel
2. ✅ Redeploy
3. ✅ Test the app
4. ✅ Create a test account
5. ✅ Share your live URL!

**Your app will be live at:** https://mind-sync-now2.vercel.app

Good luck! 🎉
