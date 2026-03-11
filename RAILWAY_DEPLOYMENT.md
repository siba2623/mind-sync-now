# 🚂 Deploy MindSync to Railway

Complete guide to deploying your app to Railway.app

---

## ✅ Pre-Deployment Security Check

Before deploying, ensure NO API keys are exposed:

### 1. Verify .env is NOT in Git

```bash
cd mind-sync-now
git ls-files | findstr .env
```

Should only show:
- `.env.example` ✅
- `server/.env.example` ✅

Should NOT show:
- `.env` ❌

### 2. Check .gitignore

Your `.gitignore` already includes:
```
.env
.env.local
.env.*.local
```

✅ This is correct!

### 3. Verify No Hardcoded Keys

I've already checked - no API keys are hardcoded in your source code. ✅

---

## 🚀 Deploy to Railway

### Step 1: Sign Up for Railway

1. Go to: https://railway.app
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: **mind-sync-now**
4. Railway will auto-detect it's a Vite project

### Step 3: Configure Build Settings

Railway should auto-detect these, but verify:

```
Build Command: npm run build
Start Command: npm run preview
Install Command: npm install
```

If not auto-detected, add them manually in Settings → Build.

### Step 4: Add Environment Variables

In Railway dashboard:

1. Click your project
2. Go to **Variables** tab
3. Click "New Variable"
4. Add these THREE variables:

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://fpzuagmsfvfwxyogckkp.supabase.co
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: [Your Supabase anon key]
```

**Variable 3:**
```
Name: VITE_GOOGLE_AI_API_KEY
Value: [Your Google AI key]
```

### Step 5: Deploy!

1. Click "Deploy"
2. Wait 3-5 minutes for build
3. Railway will give you a URL like: `mindsync.up.railway.app`

---

## 🔧 Railway Configuration File (Optional)

Create `railway.json` for custom configuration:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📋 Environment Variables Checklist

Make sure you have these in Railway:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_GOOGLE_AI_API_KEY`

---

## 🌐 Custom Domain (Optional)

### Add Your Domain:

1. In Railway dashboard → Settings
2. Click "Domains"
3. Click "Custom Domain"
4. Enter your domain (e.g., `mindsync.co.za`)
5. Add the CNAME record to your DNS:
   ```
   CNAME: your-domain.com → your-project.up.railway.app
   ```
6. Wait for DNS propagation (5-30 minutes)
7. SSL certificate is automatic!

---

## 💰 Railway Pricing

### Free Tier (Hobby Plan):
- $5 free credit per month
- Good for development/testing
- Sleeps after 30 minutes of inactivity

### Pro Plan ($20/month):
- $20 credit included
- No sleeping
- Better performance
- Custom domains

---

## 🔒 Security Best Practices

### 1. Never Commit .env Files

✅ Already configured in `.gitignore`

### 2. Use Environment Variables

✅ All keys are in Railway variables, not in code

### 3. Rotate Keys Regularly

- Regenerate Google API key every 3-6 months
- Update in Railway variables

### 4. Monitor Usage

- Check Railway dashboard for usage
- Set up billing alerts
- Monitor Google Cloud Console for API usage

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check build logs in Railway dashboard
# Common issues:
- Missing dependencies → Check package.json
- Build command wrong → Verify in Settings
- Node version mismatch → Add .nvmrc file
```

### App Shows Blank Screen

1. Check environment variables are set
2. Verify Supabase project is active (not paused)
3. Check browser console for errors
4. Verify build completed successfully

### Environment Variables Not Working

1. Make sure they start with `VITE_`
2. Redeploy after adding variables
3. Check spelling and values
4. Clear browser cache

---

## 📊 Post-Deployment Checklist

After deployment:

- [ ] App loads at Railway URL
- [ ] Can create an account
- [ ] Can log in
- [ ] All features work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled (automatic)

---

## 🚀 Deployment Workflow

### For Future Updates:

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push origin main

# 3. Railway auto-deploys!
# Check deployment status in Railway dashboard
```

Railway automatically deploys when you push to your main branch!

---

## 🔄 Rollback (If Needed)

If a deployment breaks something:

1. Go to Railway dashboard
2. Click "Deployments"
3. Find the last working deployment
4. Click "Redeploy"

---

## 📈 Monitoring

### Railway Dashboard:
- View deployment logs
- Monitor resource usage
- Check build times
- See error logs

### Set Up Alerts:
1. Railway → Settings → Notifications
2. Add your email
3. Get notified of:
   - Failed deployments
   - High resource usage
   - Billing alerts

---

## 🎯 Quick Commands

```bash
# Check what's tracked by Git
git ls-files

# Verify .env is ignored
git check-ignore .env

# Check current branch
git branch

# Push to deploy
git push origin main

# View deployment logs (in Railway dashboard)
```

---

## ✅ Security Verification

Before deploying, I've verified:

✅ `.env` file is NOT tracked by Git  
✅ `.gitignore` properly configured  
✅ No API keys hardcoded in source code  
✅ All keys will be in Railway environment variables  
✅ Documentation files cleaned of sensitive data  

**You're safe to deploy!** 🎉

---

## 🚂 Deploy Now!

1. Go to https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select **mind-sync-now**
5. Add environment variables
6. Deploy!

Your app will be live in 5 minutes at: `your-project.up.railway.app`

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Ready to deploy?** Your code is secure and ready to go! 🚀
