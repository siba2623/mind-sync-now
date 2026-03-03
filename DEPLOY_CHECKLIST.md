# 🚀 Quick Deployment Checklist

Use this checklist to ensure a smooth deployment of MindSync.

---

## ✅ Pre-Deployment (Do This First)

### 1. Database Setup
- [ ] Supabase project created
- [ ] All migrations run (see list below)
- [ ] RLS policies enabled and tested
- [ ] Storage buckets created (mood-photos, voice-recordings)
- [ ] Test user account created and working

### 2. Environment Variables Ready
- [ ] `VITE_SUPABASE_URL` - Get from Supabase dashboard
- [ ] `VITE_SUPABASE_ANON_KEY` - Get from Supabase dashboard
- [ ] Optional: `VITE_GOOGLE_AI_API_KEY` (for AI features)
- [ ] Optional: `VITE_SPOTIFY_CLIENT_ID` (for music integration)

### 3. Code Ready
- [ ] All changes committed to Git
- [ ] Build works locally: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] No TypeScript errors
- [ ] All features tested locally

---

## 🎯 Deployment Steps (Choose One)

### Option A: Vercel (Recommended - 5 Minutes)

1. [ ] Push code to GitHub
   ```bash
   git push origin main
   ```

2. [ ] Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. [ ] Configure build settings (auto-detected):
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. [ ] Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. [ ] Click "Deploy"

6. [ ] Wait 2-3 minutes

7. [ ] Your app is live! 🎉

### Option B: Netlify (Alternative)

1. [ ] Push code to GitHub
   ```bash
   git push origin main
   ```

2. [ ] Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "Add new site"
   - Import from Git

3. [ ] Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. [ ] Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. [ ] Click "Deploy site"

6. [ ] Wait 2-3 minutes

7. [ ] Your app is live! 🎉

---

## 📋 Database Migrations (Run in Order)

Run these in Supabase SQL Editor:

1. [ ] `20260119_voice_photo_health_features.sql` - Core features
2. [ ] `20260121_emotion_tracking.sql` - Emotion tracking
3. [ ] `20260122_medications_table.sql` - Medication tracker
4. [ ] `20260129_risk_prediction_system.sql` - Risk prediction
5. [ ] `20260130_crisis_detection_system.sql` - Crisis detection
6. [ ] `20260204_phase3_SAFE_RUN.sql` - Phase 3 algorithms
7. [ ] `20260204_notification_preferences.sql` - Notifications
8. [ ] `20260206_mental_health_twin.sql` - Mental health twin
9. [ ] `20260210_peer_support_network_SAFE.sql` - Peer support
10. [ ] `20260210_gamification_system.sql` - Gamification
11. [ ] `20260211_subscription_system.sql` - Subscriptions

---

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] App loads without errors
- [ ] Homepage displays correctly
- [ ] Can navigate to all pages

### 2. Authentication
- [ ] Can create new account
- [ ] Receive confirmation email
- [ ] Can log in
- [ ] Can log out
- [ ] Password reset works

### 3. Core Features
- [ ] Dashboard loads
- [ ] Can log mood
- [ ] Can complete daily check-in
- [ ] Meditation timer works
- [ ] Breathing exercise works

### 4. Subscription Flow
- [ ] New users see onboarding
- [ ] Subscription selector displays
- [ ] Can select a plan
- [ ] Can skip to free tier
- [ ] Pricing page accessible

### 5. Mobile Responsive
- [ ] Test on mobile device
- [ ] Navigation works
- [ ] All features accessible
- [ ] No layout issues

---

## 🔒 Security Verification

- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] Environment variables not exposed in client
- [ ] Supabase RLS policies working
- [ ] API keys restricted to your domain
- [ ] No sensitive data in Git repository

---

## 🎨 Custom Domain (Optional)

### If you have a domain:

1. [ ] Add domain in Vercel/Netlify dashboard
2. [ ] Update DNS records:
   - **Vercel:** Add A record or CNAME
   - **Netlify:** Add CNAME record
3. [ ] Wait for DNS propagation (5-30 minutes)
4. [ ] SSL certificate auto-generated
5. [ ] Test your custom domain

---

## 📊 Monitoring Setup (Optional but Recommended)

### 1. Error Tracking
- [ ] Set up Sentry account
- [ ] Add Sentry DSN to environment variables
- [ ] Test error reporting

### 2. Analytics
- [ ] Add Google Analytics
- [ ] Or use Vercel Analytics (built-in)
- [ ] Test tracking

### 3. Uptime Monitoring
- [ ] Set up UptimeRobot (free)
- [ ] Add your deployment URL
- [ ] Configure alerts

---

## 🐛 Common Issues & Fixes

### Build Fails
```bash
# Clear and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### 404 on Page Refresh
✅ Already fixed with `vercel.json` and `netlify.toml`

### Environment Variables Not Working
- Ensure they start with `VITE_`
- Redeploy after adding variables
- Check spelling and values

### Supabase Connection Error
- Verify URL and key are correct
- Check RLS policies
- Test with Supabase dashboard

---

## 📱 Mobile App Deployment (Later)

When ready to deploy mobile apps:

### Android
- [ ] Build: `npm run mobile:build`
- [ ] Generate signed APK
- [ ] Upload to Google Play Console
- [ ] Submit for review

### iOS
- [ ] Build: `npm run mobile:build`
- [ ] Open in Xcode: `npx cap open ios`
- [ ] Archive and upload
- [ ] Submit to App Store Connect

---

## 💡 Quick Tips

1. **Start with Vercel** - Easiest and fastest
2. **Test locally first** - Run `npm run build && npm run preview`
3. **Use free tiers** - Perfect for MVP and testing
4. **Monitor costs** - Set up billing alerts
5. **Backup database** - Regular Supabase backups
6. **Version control** - Always commit before deploying

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ App loads at your deployment URL
- ✅ No console errors
- ✅ Users can sign up and log in
- ✅ All features work as expected
- ✅ Mobile responsive
- ✅ HTTPS enabled
- ✅ Fast load times (<3 seconds)

---

## 📞 Need Help?

If you encounter issues:

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review error logs in deployment platform
3. Check Supabase logs for database issues
4. Test locally to isolate the problem
5. Check environment variables are set correctly

---

## 🚀 Ready to Deploy?

**Fastest Path (5 minutes):**

1. Ensure all migrations are run in Supabase
2. Push to GitHub: `git push origin main`
3. Go to vercel.com → New Project
4. Import repository
5. Add environment variables
6. Deploy!

**Your app will be live at:** `your-project.vercel.app`

---

**Last Updated:** February 11, 2026  
**Status:** Ready for deployment! 🎉
