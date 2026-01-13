// Discovery Vitality API Integration Service
// Note: This is a mock implementation. Replace with actual Vitality API endpoints when available.

const VITALITY_API_BASE = import.meta.env.VITE_VITALITY_API_URL || 'https://api.discovery.co.za/vitality/v1';
const VITALITY_API_KEY = import.meta.env.VITE_VITALITY_API_KEY || '';

interface VitalityMember {
  memberId: string;
  membershipNumber: string;
  tier: 'Blue' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  points: number;
  pointsToNextTier: number;
  healthGoals: string[];
}

interface VitalityActivity {
  activityId: string;
  activityType: string;
  points: number;
  timestamp: string;
  source: string;
}

interface VitalityReward {
  rewardId: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  partnerName: string;
}

class VitalityApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = VITALITY_API_KEY;
    this.baseUrl = VITALITY_API_BASE;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Vitality-Partner-Id': 'mindsync-app',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Vitality API error: ${response.status}`);
    }

    return response.json();
  }

  // Get member's Vitality status
  async getMemberStatus(memberId: string): Promise<VitalityMember> {
    // Mock implementation - replace with actual API call
    return {
      memberId,
      membershipNumber: 'VIT-' + memberId.slice(0, 8).toUpperCase(),
      tier: 'Silver',
      points: 2450,
      pointsToNextTier: 1050,
      healthGoals: ['Mental Wellness', 'Stress Management', 'Sleep Quality'],
    };
  }

  // Submit mental wellness activity for points
  async submitActivity(memberId: string, activity: {
    type: 'mood_log' | 'journal' | 'meditation' | 'breathing' | 'assessment' | 'checkin';
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<{ pointsAwarded: number; newTotal: number }> {
    const pointsMap = {
      mood_log: 5,
      journal: 15,
      meditation: 20,
      breathing: 10,
      assessment: 100,
      checkin: 10,
    };

    // Mock implementation
    const pointsAwarded = pointsMap[activity.type] || 5;
    
    console.log(`[Vitality API] Submitting activity: ${activity.type} for member ${memberId}`);
    
    return {
      pointsAwarded,
      newTotal: 2450 + pointsAwarded,
    };
  }

  // Get available rewards
  async getRewards(): Promise<VitalityReward[]> {
    return [
      {
        rewardId: 'rew-001',
        name: 'Headspace Premium - 1 Month',
        description: 'Free month of Headspace meditation app',
        pointsCost: 500,
        category: 'Mental Wellness',
        partnerName: 'Headspace',
      },
      {
        rewardId: 'rew-002',
        name: 'Therapy Session Discount',
        description: '50% off your next therapy session',
        pointsCost: 1000,
        category: 'Mental Health',
        partnerName: 'Discovery Health',
      },
      {
        rewardId: 'rew-003',
        name: 'Wellness Retreat Voucher',
        description: 'R500 off at partner wellness retreats',
        pointsCost: 2000,
        category: 'Experiences',
        partnerName: 'Vitality Travel',
      },
    ];
  }

  // Link Vitality membership
  async linkMembership(userId: string, membershipNumber: string): Promise<{ success: boolean; memberId: string }> {
    console.log(`[Vitality API] Linking membership ${membershipNumber} to user ${userId}`);
    return {
      success: true,
      memberId: 'vit-' + Date.now(),
    };
  }

  // Sync points from MindSync to Vitality
  async syncPoints(memberId: string, activities: VitalityActivity[]): Promise<{ synced: number; totalPoints: number }> {
    console.log(`[Vitality API] Syncing ${activities.length} activities for member ${memberId}`);
    const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
    return {
      synced: activities.length,
      totalPoints,
    };
  }
}

export const vitalityApi = new VitalityApiService();
export type { VitalityMember, VitalityActivity, VitalityReward };
