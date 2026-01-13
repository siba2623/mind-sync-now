// Wearable Device Sync Service
// Supports: Garmin, Apple Watch, Fitbit, Samsung Health

interface WearableData {
  heartRate: number;
  hrv: number; // Heart Rate Variability
  stressLevel: number; // 0-100
  sleepScore: number;
  steps: number;
  activeMinutes: number;
  lastSynced: string;
}

interface WearableDevice {
  id: string;
  type: 'garmin' | 'apple_watch' | 'fitbit' | 'samsung';
  name: string;
  connected: boolean;
  lastSync: string | null;
}

interface StressReading {
  timestamp: string;
  level: number; // 0-100
  hrv: number;
  source: string;
}

class WearableSyncService {
  private connectedDevices: WearableDevice[] = [];

  // Get list of supported devices
  getSupportedDevices(): { type: string; name: string; icon: string }[] {
    return [
      { type: 'garmin', name: 'Garmin', icon: '⌚' },
      { type: 'apple_watch', name: 'Apple Watch', icon: '⌚' },
      { type: 'fitbit', name: 'Fitbit', icon: '⌚' },
      { type: 'samsung', name: 'Samsung Health', icon: '⌚' },
    ];
  }

  // Connect to a wearable device (OAuth flow simulation)
  async connectDevice(deviceType: string): Promise<WearableDevice> {
    // In production, this would initiate OAuth flow with the device's API
    console.log(`[Wearable] Initiating connection to ${deviceType}`);
    
    const device: WearableDevice = {
      id: `${deviceType}-${Date.now()}`,
      type: deviceType as WearableDevice['type'],
      name: this.getDeviceName(deviceType),
      connected: true,
      lastSync: new Date().toISOString(),
    };

    this.connectedDevices.push(device);
    return device;
  }

  // Disconnect device
  async disconnectDevice(deviceId: string): Promise<boolean> {
    this.connectedDevices = this.connectedDevices.filter(d => d.id !== deviceId);
    return true;
  }

  // Get connected devices
  getConnectedDevices(): WearableDevice[] {
    return this.connectedDevices;
  }

  // Fetch latest health data from connected devices
  async fetchHealthData(deviceId: string): Promise<WearableData> {
    // Mock data - in production, this would call the device's API
    return {
      heartRate: 68 + Math.floor(Math.random() * 20),
      hrv: 45 + Math.floor(Math.random() * 30),
      stressLevel: 25 + Math.floor(Math.random() * 40),
      sleepScore: 70 + Math.floor(Math.random() * 25),
      steps: 5000 + Math.floor(Math.random() * 8000),
      activeMinutes: 20 + Math.floor(Math.random() * 60),
      lastSynced: new Date().toISOString(),
    };
  }

  // Get stress readings over time
  async getStressHistory(deviceId: string, days: number = 7): Promise<StressReading[]> {
    const readings: StressReading[] = [];
    const now = new Date();

    for (let i = 0; i < days * 4; i++) { // 4 readings per day
      const timestamp = new Date(now.getTime() - i * 6 * 60 * 60 * 1000);
      readings.push({
        timestamp: timestamp.toISOString(),
        level: 20 + Math.floor(Math.random() * 60),
        hrv: 40 + Math.floor(Math.random() * 40),
        source: 'garmin',
      });
    }

    return readings.reverse();
  }

  // Calculate stress correlation with mood
  calculateStressMoodCorrelation(stressReadings: StressReading[], moodEntries: any[]): {
    correlation: number;
    insight: string;
  } {
    // Simplified correlation calculation
    const avgStress = stressReadings.reduce((sum, r) => sum + r.level, 0) / stressReadings.length;
    
    let insight = '';
    if (avgStress > 60) {
      insight = 'Your stress levels have been elevated. Consider more breathing exercises.';
    } else if (avgStress > 40) {
      insight = 'Moderate stress detected. Your meditation practice is helping!';
    } else {
      insight = 'Great job! Your stress levels are well managed.';
    }

    return {
      correlation: -0.65, // Negative correlation (higher stress = lower mood)
      insight,
    };
  }

  // Get HRV-based wellness score
  calculateWellnessScore(data: WearableData): {
    score: number;
    factors: { name: string; value: number; status: 'good' | 'moderate' | 'poor' }[];
  } {
    const factors = [
      {
        name: 'Heart Rate Variability',
        value: data.hrv,
        status: data.hrv > 50 ? 'good' : data.hrv > 30 ? 'moderate' : 'poor' as const,
      },
      {
        name: 'Stress Level',
        value: 100 - data.stressLevel,
        status: data.stressLevel < 30 ? 'good' : data.stressLevel < 60 ? 'moderate' : 'poor' as const,
      },
      {
        name: 'Sleep Quality',
        value: data.sleepScore,
        status: data.sleepScore > 80 ? 'good' : data.sleepScore > 60 ? 'moderate' : 'poor' as const,
      },
      {
        name: 'Activity',
        value: Math.min(100, (data.activeMinutes / 30) * 100),
        status: data.activeMinutes > 30 ? 'good' : data.activeMinutes > 15 ? 'moderate' : 'poor' as const,
      },
    ];

    const score = Math.round(factors.reduce((sum, f) => sum + f.value, 0) / factors.length);

    return { score, factors };
  }

  private getDeviceName(type: string): string {
    const names: Record<string, string> = {
      garmin: 'Garmin Watch',
      apple_watch: 'Apple Watch',
      fitbit: 'Fitbit',
      samsung: 'Samsung Galaxy Watch',
    };
    return names[type] || 'Unknown Device';
  }
}

export const wearableSync = new WearableSyncService();
export type { WearableData, WearableDevice, StressReading };
