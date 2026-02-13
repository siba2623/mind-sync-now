# Wearable Integration Guide for MindSync
## Complete Implementation for Smartwatch Data Tracking

---

## 🎯 Overview

This guide covers integrating major wearable platforms to track:
- **Sleep data** (duration, quality, stages, HRV)
- **Activity data** (steps, exercise, calories)
- **Heart rate** (resting, active, variability)
- **Stress levels** (from HRV analysis)
- **Blood oxygen** (SpO2)
- **Body temperature** (for some devices)

---

## 📱 Supported Platforms

### 1. **Apple Watch** (via HealthKit)
- Market share: ~30% globally, 50%+ in premium segment
- Best integration: iOS native
- Data quality: Excellent

### 2. **Fitbit** (via Fitbit Web API)
- Market share: ~20% globally
- Integration: OAuth 2.0 API
- Data quality: Very good

### 3. **Garmin** (via Garmin Health API)
- Market share: ~15% (fitness enthusiasts)
- Integration: OAuth 2.0 API
- Data quality: Excellent (especially for athletes)

### 4. **Samsung Galaxy Watch** (via Samsung Health)
- Market share: ~10% (Android users)
- Integration: Samsung Health SDK
- Data quality: Good

### 5. **Google Fit** (aggregator)
- Aggregates data from multiple sources
- Integration: Google Fit API
- Data quality: Varies by source

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Smartwatch     │
│  (Apple Watch,  │
│   Fitbit, etc)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Native APIs    │
│  (HealthKit,    │
│   Fitbit API)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Capacitor      │
│  Plugins        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MindSync App   │
│  (React/TS)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase DB    │
│  (PostgreSQL)   │
└─────────────────┘
```

---

## 🔧 Implementation: Apple Watch (HealthKit)

### Step 1: Install Capacitor HealthKit Plugin

```bash
npm install @perfood/capacitor-healthkit
npx cap sync
```

### Step 2: Configure iOS Permissions

Edit `ios/App/App/Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>MindSync needs access to your health data to track sleep, activity, and heart rate for mental wellness insights.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>MindSync will write wellness data to your Health app.</string>
```

### Step 3: Enable HealthKit Capability

In Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "HealthKit"

### Step 4: Create HealthKit Service

```typescript
// src/services/healthKit.ts
import { HealthKit, QueryOutput } from '@perfood/capacitor-healthkit';

export interface HealthKitData {
  sleep: SleepData[];
  heartRate: HeartRateData[];
  steps: number;
  activeEnergy: number;
  hrv: number;
}

export interface SleepData {
  startDate: Date;
  endDate: Date;
  value: number; // hours
  source: string;
}

export interface HeartRateData {
  date: Date;
  value: number; // bpm
  context: 'resting' | 'active' | 'recovery';
}

class HealthKitService {
  /**
   * Request permissions for HealthKit data
   */
  async requestAuthorization(): Promise<boolean> {
    try {
      const result = await HealthKit.requestAuthorization({
        read: [
          'steps',
          'distance',
          'activeEnergyBurned',
          'heartRate',
          'restingHeartRate',
          'heartRateVariability',
          'sleepAnalysis',
          'oxygenSaturation',
          'bodyTemperature'
        ],
        write: []
      });
      
      return result.granted;
    } catch (error) {
      console.error('HealthKit authorization error:', error);
      return false;
    }
  }

  /**
   * Get sleep data for date range
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<SleepData[]> {
    try {
      const result: QueryOutput = await HealthKit.queryHKitSampleType({
        sampleName: 'sleepAnalysis',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return result.resultData.map(sample => ({
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
        value: (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime()) / (1000 * 60 * 60), // hours
        source: sample.sourceName
      }));
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      return [];
    }
  }

  /**
   * Get heart rate data
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HeartRateData[]> {
    try {
      const result: QueryOutput = await HealthKit.queryHKitSampleType({
        sampleName: 'heartRate',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return result.resultData.map(sample => ({
        date: new Date(sample.startDate),
        value: sample.value,
        context: this.determineHeartRateContext(sample.value)
      }));
    } catch (error) {
      console.error('Error fetching heart rate:', error);
      return [];
    }
  }

  /**
   * Get Heart Rate Variability (HRV) - critical for stress/mental health
   */
  async getHRVData(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result: QueryOutput = await HealthKit.queryHKitSampleType({
        sampleName: 'heartRateVariability',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 100
      });

      if (result.resultData.length === 0) return 0;

      // Calculate average HRV
      const avgHRV = result.resultData.reduce((sum, sample) => sum + sample.value, 0) / result.resultData.length;
      return avgHRV;
    } catch (error) {
      console.error('Error fetching HRV:', error);
      return 0;
    }
  }

  /**
   * Get steps for today
   */
  async getStepsToday(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();

      const result: QueryOutput = await HealthKit.queryHKitSampleType({
        sampleName: 'steps',
        startDate: today.toISOString(),
        endDate: now.toISOString(),
        limit: 1000
      });

      return result.resultData.reduce((sum, sample) => sum + sample.value, 0);
    } catch (error) {
      console.error('Error fetching steps:', error);
      return 0;
    }
  }

  /**
   * Sync all health data to database
   */
  async syncHealthData(userId: string): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    try {
      // Get all data
      const [sleep, heartRate, steps, hrv] = await Promise.all([
        this.getSleepData(startDate, endDate),
        this.getHeartRateData(startDate, endDate),
        this.getStepsToday(),
        this.getHRVData(startDate, endDate)
      ]);

      // Store in database (implement this based on your schema)
      await this.storeHealthData(userId, { sleep, heartRate, steps, hrv });
    } catch (error) {
      console.error('Error syncing health data:', error);
    }
  }

  private determineHeartRateContext(hr: number): 'resting' | 'active' | 'recovery' {
    if (hr < 70) return 'resting';
    if (hr > 100) return 'active';
    return 'recovery';
  }

  private async storeHealthData(userId: string, data: any): Promise<void> {
    // Implement database storage
    console.log('Storing health data for user:', userId, data);
  }
}

export const healthKitService = new HealthKitService();
```

---

## 🔧 Implementation: Fitbit API

### Step 1: Register Fitbit App

1. Go to https://dev.fitbit.com/apps
2. Register new app
3. Get Client ID and Client Secret
4. Set OAuth 2.0 redirect URI: `mindsync://fitbit/callback`

### Step 2: Install Dependencies

```bash
npm install @capacitor/browser
```

### Step 3: Create Fitbit Service

```typescript
// src/services/fitbit.ts
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

const FITBIT_CLIENT_ID = 'YOUR_FITBIT_CLIENT_ID';
const FITBIT_REDIRECT_URI = 'mindsync://fitbit/callback';

class FitbitService {
  /**
   * Initiate OAuth flow
   */
  async authorize(): Promise<string | null> {
    const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${FITBIT_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(FITBIT_REDIRECT_URI)}&` +
      `scope=activity heartrate sleep profile&` +
      `expires_in=604800`; // 7 days

    try {
      await Browser.open({ url: authUrl });
      
      // Listen for callback (implement deep linking)
      // Return authorization code
      return null; // Implement callback handling
    } catch (error) {
      console.error('Fitbit authorization error:', error);
      return null;
    }
  }

  /**
   * Exchange code for access token
   */
  async getAccessToken(code: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${FITBIT_CLIENT_ID}:YOUR_CLIENT_SECRET`)}`
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: FITBIT_REDIRECT_URI
        })
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Fitbit token:', error);
      return null;
    }
  }

  /**
   * Get sleep data from Fitbit
   */
  async getSleepData(accessToken: string, date: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Error fetching Fitbit sleep data:', error);
      return null;
    }
  }

  /**
   * Get heart rate data
   */
  async getHeartRateData(accessToken: string, date: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Error fetching Fitbit heart rate:', error);
      return null;
    }
  }

  /**
   * Get activity data
   */
  async getActivityData(accessToken: string, date: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.fitbit.com/1/user/-/activities/date/${date}.json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Error fetching Fitbit activity:', error);
      return null;
    }
  }
}

export const fitbitService = new FitbitService();
```

---

## 📊 Database Schema for Wearable Data

```sql
-- Wearable connections table
CREATE TABLE wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'apple_health', 'fitbit', 'garmin', 'samsung'
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep data from wearables
CREATE TABLE wearable_sleep_data (
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
  sleep_quality_score INTEGER, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heart rate data
CREATE TABLE wearable_heart_rate_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  heart_rate_bpm INTEGER NOT NULL,
  context TEXT, -- 'resting', 'active', 'recovery'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HRV data (critical for stress/mental health)
CREATE TABLE wearable_hrv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  hrv_ms INTEGER NOT NULL, -- milliseconds
  rmssd DECIMAL(6,2), -- Root Mean Square of Successive Differences
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity data
CREATE TABLE wearable_activity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id),
  activity_date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  distance_km DECIMAL(6,2) DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  floors_climbed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wearable_sleep_user_date ON wearable_sleep_data(user_id, sleep_date);
CREATE INDEX idx_wearable_hr_user_time ON wearable_heart_rate_data(user_id, recorded_at);
CREATE INDEX idx_wearable_hrv_user_time ON wearable_hrv_data(user_id, recorded_at);
CREATE INDEX idx_wearable_activity_user_date ON wearable_activity_data(user_id, activity_date);

-- RLS Policies
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_sleep_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_heart_rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_hrv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_activity_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable connections"
  ON wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep data"
  ON wearable_sleep_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own heart rate data"
  ON wearable_heart_rate_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own HRV data"
  ON wearable_hrv_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity data"
  ON wearable_activity_data FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔄 Background Sync Strategy

### Option 1: Periodic Sync (Recommended)

```typescript
// src/services/wearableSync.ts
class WearableSyncService {
  private syncInterval: number = 15 * 60 * 1000; // 15 minutes

  async startBackgroundSync(userId: string): Promise<void> {
    // Initial sync
    await this.syncAllWearables(userId);

    // Set up periodic sync
    setInterval(async () => {
      await this.syncAllWearables(userId);
    }, this.syncInterval);
  }

  async syncAllWearables(userId: string): Promise<void> {
    // Get user's connected wearables
    const connections = await this.getActiveConnections(userId);

    for (const connection of connections) {
      try {
        switch (connection.provider) {
          case 'apple_health':
            await healthKitService.syncHealthData(userId);
            break;
          case 'fitbit':
            await this.syncFitbit(userId, connection);
            break;
          // Add other providers
        }

        // Update last sync time
        await this.updateLastSync(connection.id);
      } catch (error) {
        console.error(`Error syncing ${connection.provider}:`, error);
      }
    }
  }

  private async getActiveConnections(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('wearable_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    return data || [];
  }

  private async updateLastSync(connectionId: string): Promise<void> {
    await supabase
      .from('wearable_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connectionId);
  }

  private async syncFitbit(userId: string, connection: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const [sleep, heartRate, activity] = await Promise.all([
      fitbitService.getSleepData(connection.access_token, today),
      fitbitService.getHeartRateData(connection.access_token, today),
      fitbitService.getActivityData(connection.access_token, today)
    ]);

    // Store in database
    await this.storeFitbitData(userId, connection.id, { sleep, heartRate, activity });
  }

  private async storeFitbitData(userId: string, connectionId: string, data: any): Promise<void> {
    // Implement database storage
    console.log('Storing Fitbit data:', data);
  }
}

export const wearableSyncService = new WearableSyncService();
```

---

## 🎨 UI Component for Wearable Connection

Update the existing `WearableSync.tsx` component to include proper connection flow and data display.

---

## 📱 Mobile-Specific Considerations

### iOS (Capacitor)
- HealthKit is native and works seamlessly
- Background sync requires Background Modes capability
- Data syncs automatically when app is in background

### Android (Capacitor)
- Google Fit API for aggregated data
- Samsung Health SDK for Galaxy Watch
- Requires Google Play Services

---

## 🔐 Security & Privacy

### Best Practices:
1. **Encrypt tokens** - Store access tokens encrypted in database
2. **Minimal permissions** - Only request data you actually use
3. **User control** - Allow users to disconnect anytime
4. **Transparent** - Show what data is being collected
5. **POPIA/HIPAA compliant** - Health data is sensitive

---

## 📊 Data Analysis for Mental Health

### Key Metrics to Track:

**Sleep:**
- Duration (hours)
- Quality score
- Deep sleep % (most restorative)
- Sleep consistency (same bedtime)

**Heart Rate Variability (HRV):**
- Higher HRV = better stress resilience
- Lower HRV = stress, fatigue, illness
- Track trends over time

**Activity:**
- Steps (baseline vs. current)
- Exercise minutes
- Sedentary time

**Correlations:**
- Sleep duration → Next day mood
- HRV → Stress levels
- Activity → Energy levels

---

## 🚀 Next Steps

1. **Install Capacitor plugins**
2. **Set up OAuth for Fitbit/Garmin**
3. **Run database migration**
4. **Test on physical devices** (wearables don't work in simulators)
5. **Implement background sync**
6. **Add data visualization**

---

This integration will power the Mental Health Twin's predictive capabilities and provide critical data for bipolar disorder monitoring! 🧠⌚
