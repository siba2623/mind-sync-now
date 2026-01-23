# Quick Start Guide - Discovery Health Features

## 🚀 Getting Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20260119_voice_photo_health_features.sql`
4. Click **Run**
5. Copy and paste the contents of `supabase/storage-setup.sql`
6. Click **Run**

### Step 2: Storage Bucket (1 minute)

1. Go to **Storage** in Supabase dashboard
2. Click **Create Bucket**
3. Name it: `mood-captures`
4. Set **Public bucket**: ON
5. Click **Create**

### Step 3: Test the Features (2 minutes)

1. Open the app at `http://localhost:8080`
2. Log in or create an account
3. Click the **Health Hub** card on the dashboard
4. Try each tab:
   - **Discovery Health**: View metrics and enroll in programs
   - **Voice Capture**: Record a test message
   - **Photo Capture**: Take a test selfie

## 📱 Accessing Health Hub

### From Dashboard:
- Look for the red **Health Hub** card (first in Quick Actions)
- Click to navigate

### From Mobile Navigation:
- Tap the **Heart** icon at the bottom
- Opens Health Hub directly

### Direct URL:
- Navigate to `/health-hub`

## 🎤 Testing Voice Capture

1. Go to Health Hub → Voice Capture tab
2. Click **Start Recording**
3. Grant microphone permissions if prompted
4. Speak for 10-30 seconds about how you're feeling
5. Click **Stop Recording**
6. Wait for AI analysis (5-10 seconds)
7. View results: mood detected, sentiment score, recommendations

**Example script:**
> "I'm feeling a bit stressed today because of work deadlines. I didn't sleep well last night and I'm worried about the presentation tomorrow."

## 📸 Testing Photo Capture

1. Go to Health Hub → Photo Capture tab
2. Click **Capture Photo**
3. Grant camera permissions if prompted
4. Select a photo or take a selfie
5. Wait for AI analysis (5-10 seconds)
6. View results: mood detected, confidence score, insights

**Tips:**
- Use good lighting
- Face the camera directly
- Show your natural expression

## 🏥 Testing Discovery Health

1. Go to Health Hub → Discovery Health tab
2. View your current Vitality points (starts at 0)
3. Click **Available Programs** tab
4. Click **Enroll Now** on any program
5. Switch back to **My Programs** tab
6. See your enrolled program with 0% progress

## 🔍 Verifying Data Storage

### Check Voice Recordings:
1. Go to Supabase Dashboard → Table Editor
2. Select `voice_recordings` table
3. See your test recording with AI analysis

### Check Photo Captures:
1. Go to Supabase Dashboard → Table Editor
2. Select `photo_mood_captures` table
3. See your test photo with facial analysis

### Check Storage:
1. Go to Supabase Dashboard → Storage
2. Open `mood-captures` bucket
3. See folders: `voice-recordings` and `photo-moods`
4. View uploaded files

## 🎯 Key Features to Demonstrate

### For Discovery Health:

1. **Vitality Points System**
   - Shows weekly point accumulation
   - Calculates based on health metrics
   - Displays Gold status

2. **Health Metrics Dashboard**
   - Steps count
   - Heart rate
   - Active minutes
   - Vitality status

3. **Wellness Programs**
   - Fitness Challenge
   - Mental Wellness Program
   - Preventive Health Screening
   - Nutrition Coaching

4. **Progress Tracking**
   - Visual progress bars
   - Program status badges
   - Achievement tracking

### For Mental Health:

1. **Voice Mood Analysis**
   - Sentiment scoring (-1.0 to 1.0)
   - Emotion detection
   - Keyword extraction
   - Support flagging

2. **Photo Mood Analysis**
   - Facial expression analysis
   - Emotion breakdown
   - Confidence scoring
   - Support recommendations

3. **Automatic Interventions**
   - Triggers when support needed
   - Creates intervention records
   - Notifies wellness team

## 🐛 Troubleshooting

### Voice Recording Not Working:
- Check microphone permissions in browser
- Try a different browser (Chrome recommended)
- Check if microphone is working in other apps

### Photo Capture Not Working:
- Check camera permissions in browser
- Try a different browser
- On mobile, ensure camera access is granted

### AI Analysis Failing:
- Check `.env` file has valid `VITE_GEMINI_API_KEY`
- Verify API key has quota remaining
- Check browser console for errors

### Data Not Saving:
- Verify Supabase connection in `.env`
- Check if migrations ran successfully
- Verify user is authenticated
- Check browser console for errors

## 📊 Demo Script for Discovery Health

**Opening:**
> "Let me show you MindSync's comprehensive health integration designed for Discovery Health members."

**Health Hub Overview:**
> "From the dashboard, members can access the Health Hub - a unified interface for mental and physical wellness."

**Discovery Health Tab:**
> "Here members see their Vitality points, health metrics, and can enroll in wellness programs. The system tracks steps, heart rate, and active minutes, automatically calculating Vitality points."

**Voice Capture:**
> "Members can record voice messages about their feelings. Our AI analyzes tone, pace, and content to detect emotional states and automatically flag users who may need support."

**Photo Capture:**
> "Members can take selfies to track visual mood patterns. AI analyzes facial expressions to detect emotions and provide insights over time."

**Support System:**
> "When the system detects someone needs help - through voice analysis, photo analysis, or mood patterns - it automatically creates support interventions and connects them with resources."

**Closing:**
> "This integration provides Discovery Health with early intervention capabilities, increased member engagement, and rich behavioral data - all while maintaining privacy and security."

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Health Hub card appears on dashboard
- ✅ Voice recording saves and shows analysis
- ✅ Photo capture saves and shows analysis
- ✅ Programs can be enrolled in
- ✅ Data appears in Supabase tables
- ✅ Files appear in storage bucket
- ✅ No console errors

## 📞 Need Help?

- Check `DISCOVERY_HEALTH_FEATURES.md` for detailed documentation
- Review `IMPLEMENTATION_COMPLETE.md` for technical details
- Check browser console for error messages
- Verify all environment variables are set
- Ensure database migrations completed successfully

---

**Ready to impress Discovery Health!** 🚀
