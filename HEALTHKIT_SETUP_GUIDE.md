# HealthKit Integration - Step-by-Step Setup Guide
## Complete Implementation for Apple Watch Data

---

## 📋 Prerequisites

- Mac computer with Xcode installed
- Apple Developer account (free or paid)
- Physical iOS device with Apple Watch paired (HealthKit doesn't work in simulator)
- MindSync app already set up with Capacitor

---

## 🚀 Step 1: Install HealthKit Plugin

Open your terminal in the `mind-sync-now` directory:

```bash
# Install the HealthKit plugin
npm install @perfood/capacitor-healthkit

# Sync with iOS project
npx cap sync ios
```

**Expected output:**
```
✔ Copying web assets from dist to ios/App/App/public in 123ms
✔ Creating capacitor.config.json in ios/App/App in 2ms
✔ copy ios in 234ms
✔ Updating iOS plugins in 45ms
```

---

## 🔧 Step 2: Configure iOS Permissions

### 2.1 Open Info.plist

Navigate to: `mind-sync-now/ios/App/App/Info.plist`

### 2.2 Add HealthKit Permissions

Add these lines before the closing `</dict>` tag:

```xml
<!-- HealthKit Usage Descriptions -->
<key>NSHealthShareUsageDescription</key>
<string>MindSync needs access to your health data to track sleep, activity, and heart rate for personalized mental wellness insights and early crisis detection.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>MindSync will write wellness data and achievements to your Health app.</string>

<!-- Background Modes (for continuous sync) -->
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>processing</string>
</array>
```

**What this does:** Tells iOS why your app needs health data access. Users will see this message when granting permissions.

---

## 🎯 Step 3: Enable HealthKit in Xcode

### 3.1 Open Xcode Project

```bash
# Open the iOS project in Xcode
open ios/App/App.xcworkspace
```

**Important:** Open `.xcworkspace`, NOT `.xcodeproj`!

### 3.2 Add HealthKit Capability

1. In Xcode, select your app target (usually "App")
2. Click the "Signing & Capabilities" tab
3. Click "+ Capability" button (top left)
4. Search for "HealthKit"
5. Double-click "HealthKit" to add it

**You should see:**
- ✅ HealthKit capability added
- ✅ Clinical Health Records (optional, can leave unchecked)

### 3.3 Configure Signing

1. Still in "Signing & Capabilities"
2. Under "Signing", select your Team
3. Xcode will automatically create a provisioning profile

**If you don't have a team:**
- Use your Apple ID (free)
- Click "Add Account" → Sign in with Apple ID
- Select your personal team

---

## 💻 Step 4: Create HealthKit Service

Create the file: `mind-sync-now/src/services/healthKitService.ts`

I'll create this file for you with complete implementation:


---

## ✅ Step 5: Install the Package

```bash
cd mind-sync-now
npm install @perfood/capacitor-healthkit
```

---

## 🗄️ Step 6: Create Database Tables

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Create wearable_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create wearable_sleep_data table
CREATE TABLE IF NOT EXISTS wearable_sleep_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  sleep_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  deep_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  sleep_quality_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sleep_date, start_time)
);

-- Create wearable_heart_rate_data table
CREATE TABLE IF NOT EXISTS wearable_heart_rate_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  heart_rate_bpm INTEGER NOT NULL,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recorded_at)
);

-- Create wearable_hrv_data table
CREATE TABLE IF NOT EXISTS wearable_hrv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  hrv_ms INTEGER NOT NULL,
  rmssd DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recorded_at)
);

-- Create wearable_activity_data table
CREATE TABLE IF NOT EXISTS wearable_activity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  activity_date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  distance_km DECIMAL(6,2) DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  floors_climbed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_sleep_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_hrv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_activity_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own wearable connections"
  ON wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable connections"
  ON wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable connections"
  ON wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep data"
  ON wearable_sleep_data FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own heart rate data"
  ON wearable_heart_rate_data FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own HRV data"
  ON wearable_hrv_data FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity data"
  ON wearable_activity_data FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🧪 Step 7: Test the Integration

### 7.1 Update WearableSync Component

The existing `WearableSync.tsx` component needs to use the new service. Here's how to test it:

```typescript
// In your component
import { healthKitService } from '@/services/healthKitService';

// Request authorization
const handleConnect = async () => {
  const granted = await healthKitService.requestAuthorization();
  if (granted) {
    console.log('HealthKit connected!');
    // Sync data
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await healthKitService.syncAllData(user.id);
    }
  }
};
```

### 7.2 Build and Run on Device

```bash
# Build the app
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 7.3 Run on Physical Device

1. Connect your iPhone (with Apple Watch paired)
2. In Xcode, select your device from the device dropdown
3. Click the Play button (▶️) to build and run
4. App will install on your phone

### 7.4 Test the Flow

1. Open MindSync app on your iPhone
2. Go to Dashboard → Wearables section
3. Click "Connect Apple Watch"
4. iOS will show permission dialog
5. Grant access to health data
6. App will sync data automatically

---

## 🔍 Step 8: Verify Data is Syncing

### Check in Supabase

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Check these tables:
   - `wearable_connections` - Should have a row with provider='apple_health'
   - `wearable_sleep_data` - Should have sleep records
   - `wearable_heart_rate_data` - Should have heart rate data
   - `wearable_activity_data` - Should have today's steps

### Check in App Console

Open Safari on Mac → Develop → [Your iPhone] → [MindSync]

You should see console logs:
```
HealthKit authorization granted
Starting HealthKit sync...
HealthKit sync completed successfully
```

---

## 🐛 Troubleshooting

### Issue: "HealthKit not available"

**Solution:**
- HealthKit only works on physical devices, not simulator
- Make sure you're running on actual iPhone
- Ensure iPhone has iOS 13+ and Apple Watch is paired

### Issue: "Authorization denied"

**Solution:**
- User denied permissions
- Go to iPhone Settings → Privacy → Health → MindSync
- Enable all permissions

### Issue: "No data syncing"

**Solution:**
- Check if Apple Watch has recorded data
- Open Health app on iPhone to verify data exists
- Try syncing manually: `healthKitService.syncAllData(userId)`

### Issue: "Build fails in Xcode"

**Solution:**
- Make sure you opened `.xcworkspace` not `.xcodeproj`
- Clean build folder: Product → Clean Build Folder
- Delete `ios/App/Pods` and run `npx cap sync ios` again

### Issue: "Signing error"

**Solution:**
- Select your Apple ID team in Signing & Capabilities
- Change Bundle Identifier to something unique
- Free Apple ID can only run on your own devices

---

## 📊 Step 9: View Synced Data in App

The data is now in your database! You can display it in your app:

```typescript
// Get today's sleep data
const { data: sleepData } = await supabase
  .from('wearable_sleep_data')
  .select('*')
  .eq('user_id', userId)
  .eq('sleep_date', new Date().toISOString().split('T')[0])
  .single();

console.log('Sleep duration:', sleepData?.duration_hours, 'hours');

// Get today's steps
const { data: activityData } = await supabase
  .from('wearable_activity_data')
  .select('*')
  .eq('user_id', userId)
  .eq('activity_date', new Date().toISOString().split('T')[0])
  .single();

console.log('Steps today:', activityData?.steps);
```

---

## 🔄 Step 10: Set Up Automatic Sync

Add this to your app to sync data every 15 minutes:

```typescript
// In your main App component or Dashboard
useEffect(() => {
  const syncInterval = setInterval(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && healthKitService.isAvailable()) {
      await healthKitService.syncAllData(user.id);
    }
  }, 15 * 60 * 1000); // 15 minutes

  return () => clearInterval(syncInterval);
}, []);
```

---

## ✅ Success Checklist

- [ ] HealthKit plugin installed
- [ ] Info.plist updated with permissions
- [ ] HealthKit capability added in Xcode
- [ ] Database tables created
- [ ] healthKitService.ts file created
- [ ] App builds successfully
- [ ] Tested on physical iPhone with Apple Watch
- [ ] Authorization granted
- [ ] Data syncing to database
- [ ] Can view data in Supabase

---

## 🎯 Next Steps

1. **Add UI to display health data** - Show sleep, steps, heart rate in dashboard
2. **Implement Mental Health Twin integration** - Use sleep/HRV for predictions
3. **Add bipolar disorder monitoring** - Track sleep reduction for mania detection
4. **Set up alerts** - Notify when sleep drops below threshold
5. **Add data visualization** - Charts showing trends over time

---

## 📚 Additional Resources

- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Capacitor HealthKit Plugin](https://github.com/perfood/capacitor-healthkit)
- [Apple Health Data Types](https://developer.apple.com/documentation/healthkit/data_types)

---

**You're now ready to track Apple Watch data in MindSync!** 🎉⌚

The health data will power your Mental Health Twin predictions and bipolar disorder monitoring features.
