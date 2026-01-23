# Discovery Health Integration Features

## Overview
MindSync now includes comprehensive Discovery Health integration with advanced mood tracking capabilities including voice and photo capture, health metrics tracking, and wellness program management.

## New Features

### 1. Voice Mood Capture
**Location:** `/health-hub` → Voice Capture tab

**Features:**
- Record voice messages about how you're feeling
- AI-powered sentiment analysis using Google Gemini
- Automatic emotion detection (anxious, sad, happy, stressed, calm)
- Keyword extraction for mental health insights
- Automatic support flag for users who may need professional help
- Secure storage of voice recordings

**How it works:**
1. Click "Start Recording" and speak about your feelings
2. AI analyzes your voice tone, pace, and word choice
3. System detects emotional patterns and stress indicators
4. If support is needed, automatic intervention is triggered
5. All recordings are encrypted and private

**Database Table:** `voice_recordings`

### 2. Photo Mood Capture
**Location:** `/health-hub` → Photo Capture tab

**Features:**
- Take selfies to capture visual mood state
- AI facial expression analysis using Google Gemini Vision
- Emotion breakdown (happy, sad, anxious, neutral, stressed)
- Confidence scoring for analysis accuracy
- Support recommendations when needed
- Secure photo storage

**How it works:**
1. Click "Capture Photo" to take a selfie
2. AI analyzes facial expressions and body language
3. System provides mood detection with confidence score
4. Track visual mood patterns over time
5. Photos stored securely and never shared

**Database Table:** `photo_mood_captures`

### 3. Discovery Health Dashboard
**Location:** `/health-hub` → Discovery Health tab

**Features:**
- **Vitality Points Tracking:** Weekly points accumulation
- **Health Metrics:** Steps, heart rate, active minutes, BMI
- **Wellness Programs:** Enroll in fitness, nutrition, mental health, and preventive care programs
- **Progress Tracking:** Monitor program completion and achievements
- **Integration Ready:** Designed for Discovery Vitality API integration

**Available Programs:**
1. **Fitness Challenge** - 10,000 steps daily goal
2. **Mental Wellness Program** - Daily mood tracking and mindfulness
3. **Preventive Health Screening** - Annual health checks
4. **Nutrition Coaching** - Personalized meal plans

**Database Tables:** 
- `health_metrics`
- `wellness_programs`
- `mental_health_assessments`
- `support_interventions`

## Database Schema

### New Tables Created:
1. **voice_recordings** - Stores voice mood captures with AI analysis
2. **photo_mood_captures** - Stores photo mood captures with facial analysis
3. **health_metrics** - Daily health data (steps, heart rate, etc.)
4. **wellness_programs** - User enrollment in wellness programs
5. **mental_health_assessments** - Standardized mental health assessments (PHQ-9, GAD-7)
6. **support_interventions** - Automatic support triggers and referrals

### Storage Bucket:
- **mood-captures** - Stores voice recordings and photos securely

## Setup Instructions

### 1. Run Database Migrations
```bash
# Apply the new schema
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20260119_voice_photo_health_features.sql

# Set up storage bucket
psql -h your-supabase-host -U postgres -d postgres -f supabase/storage-setup.sql
```

### 2. Configure Environment Variables
Ensure your `.env` file has:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 3. Create Storage Bucket in Supabase
1. Go to Supabase Dashboard → Storage
2. Create bucket named `mood-captures`
3. Set to public access
4. Apply the storage policies from `storage-setup.sql`

## Discovery Health Integration Benefits

### For Users:
- **Holistic Health View:** Mental and physical health in one place
- **Vitality Points:** Earn rewards for healthy behaviors
- **Personalized Programs:** Tailored wellness journeys
- **Early Intervention:** AI-powered support detection
- **Privacy First:** All data encrypted and secure

### For Discovery Health:
- **Member Engagement:** Increased app usage and program participation
- **Preventive Care:** Early detection of mental health concerns
- **Data Insights:** Rich behavioral and health data
- **Cost Reduction:** Proactive mental health support reduces claims
- **Competitive Advantage:** Innovative mental wellness features

## AI-Powered Support Detection

The system automatically flags users who may need support based on:
- Voice sentiment analysis (negative scores)
- Emotional keywords (self-harm, severe depression, crisis)
- Photo analysis (distressed facial expressions)
- Mood pattern deterioration
- Assessment scores (severe levels)

When flagged, the system:
1. Creates a support intervention record
2. Notifies wellness coaches/counselors
3. Provides immediate resources to the user
4. Tracks intervention status and outcomes

## Privacy & Security

- All voice recordings and photos are encrypted
- Row-level security policies enforce data isolation
- Users can only access their own data
- Support interventions are HIPAA-compliant
- No data sharing without explicit consent

## Future Enhancements

1. **Wearable Integration:** Sync with Fitbit, Apple Watch, Garmin
2. **Real-time Vitality API:** Live sync with Discovery Health systems
3. **Telehealth Integration:** Video consultations with wellness coaches
4. **Family Accounts:** Track family member wellness
5. **Corporate Wellness:** Enterprise features for employers
6. **Advanced Analytics:** Predictive mental health modeling

## API Endpoints

### Voice Recording
```typescript
POST /voice-recordings
GET /voice-recordings/:userId
GET /voice-recordings/:id
```

### Photo Mood
```typescript
POST /photo-mood-captures
GET /photo-mood-captures/:userId
GET /photo-mood-captures/:id
```

### Health Metrics
```typescript
POST /health-metrics
GET /health-metrics/:userId
PUT /health-metrics/:id
```

### Wellness Programs
```typescript
POST /wellness-programs
GET /wellness-programs/:userId
PUT /wellness-programs/:id/progress
```

## Testing

### Test Voice Recording:
1. Navigate to `/health-hub`
2. Click "Voice Capture" tab
3. Grant microphone permissions
4. Record a test message
5. Verify AI analysis results

### Test Photo Capture:
1. Navigate to `/health-hub`
2. Click "Photo Capture" tab
3. Grant camera permissions
4. Take a test photo
5. Verify facial analysis results

### Test Discovery Dashboard:
1. Navigate to `/health-hub`
2. Click "Discovery Health" tab
3. View health metrics
4. Enroll in a wellness program
5. Verify Vitality points calculation

## Support

For technical issues or questions:
- Email: support@mindsync.app
- Documentation: https://docs.mindsync.app
- Discovery Health Partnership: partnerships@mindsync.app

## License

Proprietary - MindSync © 2026
