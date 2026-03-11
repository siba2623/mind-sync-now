# 🚨 URGENT: Security Fix - Exposed API Key

## ⚠️ CRITICAL ISSUE

Your Google API key was accidentally committed to GitHub and is now public. Google has detected this and sent you a warning. You need to act immediately.

**Exposed Key:** `AIzaSyAvLl1gma01XQAyzJrUAVnUZsJIqZee-LA`  
**Location:** GitHub commit history (`.env` file)  
**Risk Level:** HIGH - Anyone can use your API key and rack up charges

---

## 🔥 IMMEDIATE ACTIONS (Do This NOW - 10 Minutes)

### Step 1: Regenerate Your Google API Key (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your project: **mind sync** (gen-lang-client-0357348476)
3. Click on the exposed API key: `AIzaSyAvLl1gma01XQAyzJrUAVnUZsJIqZee-LA`
4. Click **"Regenerate Key"** button
5. Copy the NEW key (save it somewhere safe)
6. The old key will be immediately disabled

### Step 2: Add API Key Restrictions (3 minutes)

While you're in the Google Cloud Console:

1. Click **"Edit API key"** (the one you just regenerated)
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add your domains:
     ```
     https://mind-sync-now2.vercel.app/*
     https://*.vercel.app/*
     http://localhost:8080/*
     ```
3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose only the APIs you're using:
     - ✓ Generative Language API
     - (Uncheck everything else)
4. Click **"Save"**

### Step 3: Remove Key from Git History (5 minutes)

The key is still in your Git history. We need to remove it completely:

```bash
cd mind-sync-now

# Install BFG Repo Cleaner (if not already installed)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Or use git-filter-repo (recommended)
# Install: pip install git-filter-repo

# Remove the .env file from all history
git filter-repo --path .env --invert-paths --force

# Force push to GitHub (this rewrites history)
git push origin --force --all
```

**⚠️ WARNING:** This rewrites Git history. Anyone who has cloned your repo will need to re-clone it.

### Step 4: Update Your Local Environment

1. Create a new `.env` file (it was deleted):

```bash
cd mind-sync-now
```

Create `.env` with your NEW key:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GOOGLE_AI_API_KEY=YOUR_NEW_REGENERATED_KEY_HERE
```

2. Verify `.env` is in `.gitignore`:

```bash
# Check if .env is ignored
git check-ignore .env
# Should output: .env
```

### Step 5: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your project: **mind-sync-now2**
3. Settings → Environment Variables
4. Find `VITE_GOOGLE_AI_API_KEY`
5. Click **"Edit"**
6. Replace with your NEW regenerated key
7. Click **"Save"**
8. Redeploy your app

---

## 🛡️ Alternative: Simpler Approach (If Above is Too Complex)

If the Git history cleanup is too complicated, do this instead:

### Quick Fix (5 minutes):

1. **Regenerate the key** (Step 1 above) ✅
2. **Add restrictions** (Step 2 above) ✅
3. **Update Vercel** with new key ✅
4. **Update local .env** with new key ✅
5. **Monitor usage** in Google Cloud Console

The old key is now disabled, so even though it's in Git history, it can't be used.

---

## 📊 Check for Unauthorized Usage

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project: **mind sync**
3. Check the **"Metrics"** tab
4. Look for:
   - Unusual traffic spikes
   - Requests from unknown IPs
   - High API usage you didn't make

If you see suspicious activity:
- Check your billing: https://console.cloud.google.com/billing
- Set up billing alerts
- Consider creating a new Google Cloud project

---

## 🔒 Prevent This in the Future

### 1. Never Commit .env Files

Your `.gitignore` already has this (good!):
```
.env
.env.local
.env.*.local
```

### 2. Use Environment Variables Properly

**✅ CORRECT:**
- Store keys in `.env` file (local development)
- Add to Vercel/Netlify dashboard (production)
- Never commit `.env` to Git

**❌ WRONG:**
- Hardcoding keys in source code
- Committing `.env` files
- Sharing keys in chat/email

### 3. Use Git Hooks (Optional)

Install a pre-commit hook to prevent committing secrets:

```bash
npm install --save-dev @commitlint/cli husky
npx husky install
npx husky add .husky/pre-commit "npx --no-install commitlint --edit"
```

### 4. Scan for Secrets

Use tools like:
- **git-secrets**: https://github.com/awslabs/git-secrets
- **truffleHog**: https://github.com/trufflesecurity/trufflehog
- **GitHub Secret Scanning**: Enable in repo settings

---

## ✅ Verification Checklist

After completing the fix:

- [ ] Old API key regenerated (disabled)
- [ ] New API key has restrictions (HTTP referrers + API restrictions)
- [ ] `.env` file removed from Git history (or old key is disabled)
- [ ] New key added to local `.env` file
- [ ] New key added to Vercel environment variables
- [ ] Vercel app redeployed with new key
- [ ] Tested app - AI features still work
- [ ] No unauthorized usage in Google Cloud Console
- [ ] Billing alerts set up in Google Cloud

---

## 🎯 Quick Command Reference

```bash
# Check if .env is in Git
git ls-files | grep .env

# Check if .env is ignored
git check-ignore .env

# Remove .env from Git (if accidentally added)
git rm --cached .env
git commit -m "Remove .env from Git"
git push

# Check Git history for secrets
git log --all --full-history --source -- .env
```

---

## 💰 Cost Protection

Set up billing alerts to prevent surprise charges:

1. Go to: https://console.cloud.google.com/billing
2. Click **"Budgets & alerts"**
3. Create a budget:
   - Amount: $10/month (or your preference)
   - Alert at: 50%, 90%, 100%
4. Add your email for notifications

---

## 📞 If You Need Help

### Google Cloud Support:
- Free tier: Community support only
- Paid: https://cloud.google.com/support

### Check API Usage:
- Dashboard: https://console.cloud.google.com/apis/dashboard
- Quotas: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### Report Abuse:
If you see unauthorized usage:
- Report: https://support.google.com/cloud/contact/cloud_platform_report

---

## 🚀 After the Fix

Once you've secured your API key:

1. ✅ Your app will continue working with the new key
2. ✅ Old key is disabled - no one can use it
3. ✅ Restrictions prevent abuse
4. ✅ Billing alerts protect you from surprise charges

---

## 📝 Summary

**What happened:**
- Your `.env` file with Google API key was committed to GitHub
- Google detected it and sent you a warning
- The key is now public and could be abused

**What to do:**
1. Regenerate the key immediately
2. Add restrictions (HTTP referrers + API limits)
3. Update Vercel with new key
4. Remove from Git history (optional but recommended)
5. Monitor usage and set billing alerts

**Time required:** 10-15 minutes  
**Difficulty:** Medium  
**Cost:** Free (if done quickly)

---

**IMPORTANT:** Do this NOW before someone uses your key and racks up charges on your Google Cloud account!

**Status:** 🔴 URGENT - Action Required Immediately
