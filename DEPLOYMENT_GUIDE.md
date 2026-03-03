# 🚀 MindSync Deployment Guide

Complete guide to deploying your MindSync app to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Supabase project set up and configured
- [ ] All database migrations run in Supabase
- [ ] Environment variables configured
- [ ] App tested locally and working
- [ ] Git repository up to date
- [ ] Domain name (optional, but recommended)

---

## 🎯 Recommended Deployment Options

### Option 1: Vercel (Recommended - Easiest)
**Best for:** Quick deployment, automatic CI/CD, free tier available

### Option 2: Netlify
**Best for:** Alternative to Vercel, similar features

### Option 3: AWS Amplify
**Best for:** AWS ecosystem integration

### Option 4: Self-Hosted (VPS)
**Best for:** Full control, custom requirements

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ Free tier with generous limits
- ✅ Automatic deployments from Git
- ✅ Built-in CI/CD
- ✅ Global CDN
- ✅ Perfect for React/Vite apps
- ✅ Easy environment variable management
- ✅ Custom domain support

### Step-by-Step Deployment:

#### 1. Prepare Your Repository

```bash
# Make sure everything is committed
cd mind-sync-now
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/GitLab/Bitbucket
3. Click "Add New Project"

#### 3. Import Your Repository

1. Select your MindSync repository
2. Vercel will auto-detect it's a Vite project
3. Configure build settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 4. Add Environment Variables

In Vercel dashboard, add these environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
- Go to your Supabase project dashboard
- Settings → API
- Copy "Project URL" and "anon public" key

#### 5. Deploy!

Click "Deploy" and wait 2-3 minutes. Vercel will:
- Install dependencies
- Build your app
- Deploy to global CDN
- Give you a URL like: `mindsync.vercel.app`

#### 6. Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `mindsync.co.za`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## 🌐 Option 2: Deploy to Netlify

### Step-by-Step:

#### 1. Sign Up for Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"

#### 2. Configure Build Settings

```
Build command: npm run build
Publish directory: dist
```

#### 3. Add Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 4. Create netlify.toml (Optional but Recommended)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 5. Deploy

Click "Deploy site" and wait for build to complete.

---

## ☁️ Option 3: Deploy to AWS Amplify

### Step-by-Step:

#### 1. Install AWS Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 2. Initialize Amplify

```bash
cd mind-sync-now
amplify init
```

#### 3. Add Hosting

```bash
amplify add hosting
# Choose: Hosting with Amplify Console
# Choose: Continuous deployment
```

#### 4. Configure Build Settings

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### 5. Deploy

```bash
amplify publish
```

---

## 🖥️ Option 4: Self-Hosted (VPS)

### Requirements:
- Ubuntu/Debian VPS (DigitalOcean, Linode, etc.)
- Node.js 18+
- Nginx
- SSL certificate (Let's Encrypt)

### Step-by-Step:

#### 1. Set Up VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### 2. Clone and Build

```bash
# Clone your repository
cd /var/www
git clone https://github.com/yourusername/mind-sync-now.git
cd mind-sync-now

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Build the app
npm run build
```

#### 3. Configure Nginx

```bash
nano /etc/nginx/sites-available/mindsync
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/mind-sync-now/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/mindsync /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 4. Set Up SSL

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 5. Set Up Auto-Deployment (Optional)

Create a deploy script:

```bash
nano /var/www/mind-sync-now/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/mind-sync-now
git pull origin main
npm install
npm run build
systemctl restart nginx
```

Make it executable:

```bash
chmod +x deploy.sh
```

---

## 🔧 Environment Variables Setup

### Required Variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Google AI (for AI features)
VITE_GOOGLE_AI_API_KEY=your-google-ai-key

# Optional: Spotify Integration
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### Where to Add Them:

**Vercel/Netlify:**
- Dashboard → Settings → Environment Variables

**Self-Hosted:**
- Create `.env` file in project root
- Or set in Nginx configuration

---

## 📱 Mobile App Deployment

### Android (Google Play Store)

#### 1. Build Android App

```bash
cd mind-sync-now
npm run mobile:build
```

#### 2. Generate Signed APK

```bash
cd android
./gradlew assembleRelease
```

#### 3. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload APK from `android/app/build/outputs/apk/release/`
4. Fill in store listing details
5. Submit for review

### iOS (Apple App Store)

#### 1. Build iOS App

```bash
cd mind-sync-now
npm run mobile:build
npx cap open ios
```

#### 2. Configure in Xcode

1. Open project in Xcode
2. Set signing team
3. Configure app icons and splash screens
4. Archive the app

#### 3. Upload to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Upload build via Xcode
4. Fill in app information
5. Submit for review

---

## 🗄️ Database Setup (Supabase)

### 1. Run All Migrations

In Supabase SQL Editor, run these migrations in order:

```sql
-- 1. Core features
supabase/migrations/20260119_voice_photo_health_features.sql

-- 2. Emotion tracking
supabase/migrations/20260121_emotion_tracking.sql

-- 3. Medications
supabase/migrations/20260122_medications_table.sql

-- 4. Risk prediction
supabase/migrations/20260129_risk_prediction_system.sql

-- 5. Crisis detection
supabase/migrations/20260130_crisis_detection_system.sql

-- 6. Phase 3 algorithms
supabase/migrations/20260204_phase3_SAFE_RUN.sql

-- 7. Notification preferences
supabase/migrations/20260204_notification_preferences.sql

-- 8. Mental health twin
supabase/migrations/20260206_mental_health_twin.sql

-- 9. Peer support network
supabase/migrations/20260210_peer_support_network_SAFE.sql

-- 10. Gamification system
supabase/migrations/20260210_gamification_system.sql

-- 11. Subscription system
supabase/migrations/20260211_subscription_system.sql
```

### 2. Configure Row Level Security (RLS)

All migrations include RLS policies, but verify:

1. Go to Supabase → Authentication → Policies
2. Ensure all tables have appropriate policies
3. Test with a test user account

### 3. Set Up Storage Buckets

For photo/voice features:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('mood-photos', 'mood-photos', false),
  ('voice-recordings', 'voice-recordings', false);

-- Set up storage policies
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mood-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'mood-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔒 Security Checklist

Before going live:

- [ ] All environment variables are secure (not in Git)
- [ ] Supabase RLS policies are enabled
- [ ] API keys are restricted (Supabase, Google AI, etc.)
- [ ] HTTPS/SSL is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is set up (Supabase has built-in)
- [ ] Error logging is configured
- [ ] Backup strategy is in place

---

## 📊 Post-Deployment Setup

### 1. Configure Domain

**For Vercel/Netlify:**
- Add custom domain in dashboard
- Update DNS records (A/CNAME)
- Wait for SSL certificate

**For Self-Hosted:**
- Point domain to server IP
- Configure Nginx
- Set up SSL with Certbot

### 2. Set Up Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **Google Analytics** - User analytics
- **Supabase Dashboard** - Database monitoring
- **Vercel Analytics** - Performance monitoring (if using Vercel)

### 3. Configure Email (Supabase)

1. Go to Supabase → Authentication → Email Templates
2. Customize confirmation and reset password emails
3. Set up custom SMTP (optional):
   - Settings → Auth → SMTP Settings
   - Add your email provider details

### 4. Test Everything

- [ ] User signup/login
- [ ] Password reset
- [ ] All features work
- [ ] Mobile responsive
- [ ] Performance is good
- [ ] No console errors

---

## 🚦 Deployment Workflow

### Recommended Git Workflow:

```bash
# Development
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request
# After review, merge to main

# Main branch auto-deploys to production (Vercel/Netlify)
```

### Manual Deployment:

```bash
# Build locally
npm run build

# Test build
npm run preview

# Deploy (if using self-hosted)
./deploy.sh
```

---

## 📈 Performance Optimization

### 1. Build Optimization

Already configured in `vite.config.ts`:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

### 2. Image Optimization

```bash
# Install image optimization
npm install vite-plugin-imagemin -D
```

### 3. Lazy Loading

Components are already lazy-loaded where appropriate.

### 4. CDN Configuration

Vercel/Netlify automatically use CDN. For self-hosted:
- Use Cloudflare (free tier)
- Configure caching headers in Nginx

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Ensure they start with `VITE_`
- Restart dev server after adding
- Check they're added in deployment platform

### 404 on Refresh

Add redirect rules:

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - Create `_redirects` in `public/`:
```
/*    /index.html   200
```

### Supabase Connection Issues

- Check SUPABASE_URL and ANON_KEY are correct
- Verify RLS policies allow access
- Check network/CORS settings

---

## 💰 Cost Estimates

### Free Tier (Good for MVP/Testing):
- **Vercel:** Free (100GB bandwidth/month)
- **Netlify:** Free (100GB bandwidth/month)
- **Supabase:** Free (500MB database, 1GB file storage)
- **Total:** R0/month

### Production (10,000 users):
- **Vercel Pro:** $20/month (~R380)
- **Supabase Pro:** $25/month (~R475)
- **Domain:** $12/year (~R230/year)
- **Total:** ~R855/month + R230/year

### Enterprise (100,000+ users):
- **Vercel Enterprise:** Custom pricing
- **Supabase Team:** $599/month
- **AWS/Custom:** Variable
- **CDN:** Cloudflare Pro $20/month

---

## 📞 Support & Resources

### Documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)

### Community:
- Vercel Discord
- Supabase Discord
- Stack Overflow

---

## ✅ Quick Start (Vercel - 5 Minutes)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com and sign in with GitHub

# 3. Click "New Project" → Import your repo

# 4. Add environment variables:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# 5. Click "Deploy"

# Done! Your app is live at mindsync.vercel.app
```

---

**Ready to deploy?** Start with Vercel for the easiest experience, then scale as needed!

**Questions?** Check the troubleshooting section or reach out for support.

🚀 **Happy Deploying!**
