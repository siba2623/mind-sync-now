/**
 * HealthKit Service for Apple Watch Integration
 * Tracks sleep, heart rate, HRV, steps, and activity data
 */

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Type definitions (since @perfood/capacitor-healthkit types might not be perfect)
interface HealthKitPlugin {
  requestAuthorization(options: { read: string[]; write: string[] }): Promise<{ granted: boolean }>;
  queryHKitSampleType(options: {
    sampleName: string;
    startDate: string;
    endDate: string;
    limit: number;
  }): Promise<QueryOutput>;
  isAvailable(): Promise<{ available: boolean }>;
}

interface QueryOutput {
  resultData: Array<{
    startDate: string;
    endDate: string;
    value: number;
    sourceName: string;
    uuid: string;
  }>;
}

interface SleepData {
  startDate: Date;
  endDate: Date;
  durationHours: number;
  source: string;
}

interface HeartRateData {
  timestamp: Date;
  bpm: number;
  context: 'resting' | 'active' | 'recovery';
}

interface HRVData {
  timestamp: Date;
  value: number; // milliseconds
}

interface ActivityData {
  date: Date;
  steps: number;
  distance: number;
  activeEnergy: number;
}

class HealthKitService {
  private healthKit: HealthKitPlugin | null = null;
  private isInitialized = false;

  constructor() {
    // Only initialize on iOS
    if (Capacitor.getPlatform() === 'ios') {
      this.initializeHealthKit();
    }
  }

  /**
   * Initialize HealthKit plugin
   */
  private async initializeHealthKit(): Promise<void> {
    try {
      // Dynamically import the plugin
      const { HealthKit } = await import('@perfood/capacitor-healthkit');
      this.healthKit = HealthKit as unknown as HealthKitPlugin;
      
      // Check if HealthKit is available
      const { available } = await this.healthKit.isAvailable();
      this.isInitialized = available;
      
      if (!available) {
        console.warn('HealthKit is not available on this device');
      }
    } catch (error) {
      console.error('Failed to initialize HealthKit:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if HealthKit is available
   */
  isAvailable(): boolean {
    return this.isInitialized && Capacitor.getPlatform() === 'ios';
  }

  /**
   * Request authorization to access HealthKit data
   */
  async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable() || !this.healthKit) {
      console.warn('HealthKit not available');
      return false;
    }

    try {
      const result = await this.healthKit.requestAuthorization({
        read: [
          'steps',
          'distanceWalkingRunning',
          'activeEnergyBurned',
          'heartRate',
          'restingHeartRate',
          'heartRateVariability',
          'sleepAnalysis',
          'oxygenSaturation',
          'bodyTemperature',
          'respiratoryRate'
        ],
        write: [] // We don't write data, only read
      });

      if (result.granted) {
        console.log('HealthKit authorization granted');
        
        // Store connection in database
        await this.saveConnection();
      }

      return result.granted;
    } catch (error) {
      console.error('HealthKit authorization error:', error);
      return false;
    }
  }

  /**
   * Save HealthKit connection to database
   */
  private async saveConnection(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('wearable_connections')
        .upsert({
          user_id: user.id,
          provider: 'apple_health',
          is_active: true,
          last_sync_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,provider'
        });
    } catch (error) {
      console.error('Error saving HealthKit connection:', error);
    }
  }

  /**
   * Get sleep data for date range
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<SleepData[]> {
    if (!this.isAvailable() || !this.healthKit) {
      return [];
    }

    try {
      const result = await this.healthKit.queryHKitSampleType({
        sampleName: 'sleepAnalysis',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return result.resultData.map(sample => {
        const start = new Date(sample.startDate);
        const end = new Date(sample.endDate);
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        return {
          startDate: start,
          endDate: end,
          durationHours: Math.round(durationHours * 100) / 100,
          source: sample.sourceName
        };
      });
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      return [];
    }
  }

  /**
   * Get heart rate data
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HeartRateData[]> {
    if (!this.isAvailable() || !this.healthKit) {
      return [];
    }

    try {
      const result = await this.healthKit.queryHKitSampleType({
        sampleName: 'heartRate',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return result.resultData.map(sample => ({
        timestamp: new Date(sample.startDate),
        bpm: Math.round(sample.value),
        context: this.categorizeHeartRate(sample.value)
      }));
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      return [];
    }
  }

  /**
   * Get Heart Rate Variability (HRV) data
   * Critical for stress and mental health monitoring
   */
  async getHRVData(startDate: Date, endDate: Date): Promise<HRVData[]> {
    if (!this.isAvailable() || !this.healthKit) {
      return [];
    }

    try {
      const result = await this.healthKit.queryHKitSampleType({
        sampleName: 'heartRateVariability',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 100
      });

      return result.resultData.map(sample => ({
        timestamp: new Date(sample.startDate),
        value: Math.round(sample.value)
      }));
    } catch (error) {
      console.error('Error fetching HRV data:', error);
      return [];
    }
  }

  /**
   * Get steps for date range
   */
  async getSteps(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isAvailable() || !this.healthKit) {
      return 0;
    }

    try {
      const result = await this.healthKit.queryHKitSampleType({
        sampleName: 'steps',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return result.resultData.reduce((total, sample) => total + sample.value, 0);
    } catch (error) {
      console.error('Error fetching steps:', error);
      return 0;
    }
  }

  /**
   * Get activity data (steps, distance, calories)
   */
  async getActivityData(date: Date): Promise<ActivityData> {
    if (!this.isAvailable() || !this.healthKit) {
      return { date, steps: 0, distance: 0, activeEnergy: 0 };
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const [steps, distance, energy] = await Promise.all([
        this.getSteps(startOfDay, endOfDay),
        this.getDistance(startOfDay, endOfDay),
        this.getActiveEnergy(startOfDay, endOfDay)
      ]);

      return {
        date,
        steps: Math.round(steps),
        distance: Math.round(distance * 100) / 100,
        activeEnergy: Math.round(energy)
      };
    } catch (error) {
      console.error('Error fetching activity data:', error);
      return { date, steps: 0, distance: 0, activeEnergy: 0 };
    }
  }

  /**
   * Get distance walked/run
   */
  private async getDistance(startDate: Date, endDate: Date): Promise<number> {
    if (!this.healthKit) return 0;

    try {
      const result = await this.healthKit.queryHKitSampleType({
        sampleName: 'distanceWalkingRunning',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      // Distance is in meters, convert to km
      const totalMeters = result.resultData.reduce((total, sample) => total + sample.value, 0);
      return totalMeters / 1000;
    } catch (error) {
      console.error('Error fetching distance:', error);
      return 0;
    }
  }

  /**
   * Get active energy burned
   */
  private async getActiveEnergy(startDate: Date, endDate: Date): Promise<number> {
    if (!this.healthKit) return 0;

    try {
      const result = await this.healthKit.queryHKitSampleType({
        sampleName: 'activeEnergyBurned',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return result.resultData.reduce((total, sample) => total + sample.value, 0);
    } catch (error) {
      console.error('Error fetching active energy:', error);
      return 0;
    }
  }

  /**
   * Sync all health data to database
   */
  async syncAllData(userId: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('HealthKit not available, skipping sync');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    try {
      console.log('Starting HealthKit sync...');

      // Fetch all data in parallel
      const [sleepData, heartRateData, hrvData, activityData] = await Promise.all([
        this.getSleepData(startDate, endDate),
        this.getHeartRateData(startDate, endDate),
        this.getHRVData(startDate, endDate),
        this.getActivityData(new Date()) // Today's activity
      ]);

      // Store in database
      await Promise.all([
        this.storeSleepData(userId, sleepData),
        this.storeHeartRateData(userId, heartRateData),
        this.storeHRVData(userId, hrvData),
        this.storeActivityData(userId, activityData)
      ]);

      // Update last sync time
      await this.updateLastSync(userId);

      console.log('HealthKit sync completed successfully');
    } catch (error) {
      console.error('Error syncing HealthKit data:', error);
      throw error;
    }
  }

  /**
   * Store sleep data in database
   */
  private async storeSleepData(userId: string, sleepData: SleepData[]): Promise<void> {
    if (sleepData.length === 0) return;

    try {
      const records = sleepData.map(sleep => ({
        user_id: userId,
        sleep_date: sleep.startDate.toISOString().split('T')[0],
        start_time: sleep.startDate.toISOString(),
        end_time: sleep.endDate.toISOString(),
        duration_hours: sleep.durationHours,
        sleep_quality_score: null, // Can be calculated later
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('wearable_sleep_data')
        .upsert(records, {
          onConflict: 'user_id,sleep_date,start_time'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing sleep data:', error);
    }
  }

  /**
   * Store heart rate data in database
   */
  private async storeHeartRateData(userId: string, heartRateData: HeartRateData[]): Promise<void> {
    if (heartRateData.length === 0) return;

    try {
      const records = heartRateData.map(hr => ({
        user_id: userId,
        recorded_at: hr.timestamp.toISOString(),
        heart_rate_bpm: hr.bpm,
        context: hr.context,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('wearable_heart_rate_data')
        .upsert(records, {
          onConflict: 'user_id,recorded_at'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing heart rate data:', error);
    }
  }

  /**
   * Store HRV data in database
   */
  private async storeHRVData(userId: string, hrvData: HRVData[]): Promise<void> {
    if (hrvData.length === 0) return;

    try {
      const records = hrvData.map(hrv => ({
        user_id: userId,
        recorded_at: hrv.timestamp.toISOString(),
        hrv_ms: hrv.value,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('wearable_hrv_data')
        .upsert(records, {
          onConflict: 'user_id,recorded_at'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing HRV data:', error);
    }
  }

  /**
   * Store activity data in database
   */
  private async storeActivityData(userId: string, activityData: ActivityData): Promise<void> {
    try {
      const { error } = await supabase
        .from('wearable_activity_data')
        .upsert({
          user_id: userId,
          activity_date: activityData.date.toISOString().split('T')[0],
          steps: activityData.steps,
          distance_km: activityData.distance,
          calories_burned: activityData.activeEnergy,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,activity_date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing activity data:', error);
    }
  }

  /**
   * Update last sync timestamp
   */
  private async updateLastSync(userId: string): Promise<void> {
    try {
      await supabase
        .from('wearable_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', 'apple_health');
    } catch (error) {
      console.error('Error updating last sync:', error);
    }
  }

  /**
   * Categorize heart rate into context
   */
  private categorizeHeartRate(bpm: number): 'resting' | 'active' | 'recovery' {
    if (bpm < 70) return 'resting';
    if (bpm > 100) return 'active';
    return 'recovery';
  }
}

// Export singleton instance
export const healthKitService = new HealthKitService();
