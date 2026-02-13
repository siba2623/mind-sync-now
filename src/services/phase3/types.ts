// Phase 3 Algorithms - Shared Types and Interfaces

// ============================================================================
// Medication Adherence Prediction Types
// ============================================================================

export interface AdherencePredictionService {
  predictAdherenceRisk(
    medicationId: string,
    userId: string
  ): Promise<AdherenceRiskPrediction>;
  
  calculateOptimalReminderTime(
    medicationId: string,
    scheduledTime: string,
    userId: string
  ): Promise<OptimalReminderTime>;
  
  getAdherenceInsights(
    userId: string
  ): Promise<AdherenceInsights>;
  
  recordAdherenceEvent(
    medicationId: string,
    userId: string,
    taken: boolean,
    timestamp: Date
  ): Promise<void>;
}

export interface AdherenceRiskPrediction {
  medicationId: string;
  riskLevel: 'low' | 'moderate' | 'high';
  probability: number; // 0-100
  confidence: number; // 0-100
  factors: RiskFactor[];
  nextDoseTime: Date;
  recommendedReminderTime?: Date;
}

export interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative';
  weight: number;
  description: string;
}

export interface OptimalReminderTime {
  recommendedTime: Date;
  confidence: number;
  reasoning: string[];
  alternativeTimes: Date[];
}

export interface AdherenceInsights {
  overallAdherenceRate: number;
  sevenDayForecast: DailyForecast[];
  streakProtectionAlerts: StreakAlert[];
  personalizedTips: string[];
}

export interface DailyForecast {
  date: Date;
  predictedAdherence: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface StreakAlert {
  medicationId: string;
  currentStreak: number;
  riskOfBreaking: number;
  protectionStrategy: string;
}

export interface AdherenceFeatures {
  medicationId: string;
  timeSinceLastDose: number;
  dayOfWeek: number;
  hourOfDay: number;
  currentStreak: number;
  sevenDayRate: number;
  thirtyDayRate: number;
  recentMoodAvg: number;
  recentSleepQuality: number;
  sideEffectCount: number;
}

// ============================================================================
// Notification Timing Types
// ============================================================================

export interface NotificationTimingService {
  calculateOptimalSendTime(
    notificationType: NotificationType,
    userId: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<OptimalSendTime>;
  
  recordEngagement(
    notificationId: string,
    userId: string,
    action: 'opened' | 'dismissed' | 'ignored',
    timestamp: Date
  ): Promise<void>;
  
  getUserNotificationProfile(
    userId: string
  ): Promise<NotificationProfile>;
  
  updateTimingModel(
    userId: string
  ): Promise<void>;
}

export type NotificationType = 
  | 'medication_reminder'
  | 'mood_checkin'
  | 'wellness_tip'
  | 'risk_alert'
  | 'adherence_streak'
  | 'therapist_message';

export interface OptimalSendTime {
  recommendedTime: Date;
  confidence: number; // 0-100
  reasoning: string;
  fallbackTime?: Date;
}

export interface NotificationProfile {
  activeHours: TimeRange[];
  doNotDisturbHours: TimeRange[];
  engagementRateByHour: Map<number, number>; // hour -> rate
  preferredTypes: NotificationType[];
  optOutTypes: NotificationType[];
  averageResponseTime: number; // minutes
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;
}

export interface BetaDistribution {
  alpha: number; // successes
  beta: number;  // failures
  sampleCount: number;
}

// ============================================================================
// Therapist Matching Types
// ============================================================================

export interface TherapistMatchingService {
  findMatches(
    userId: string,
    searchCriteria: TherapistSearchCriteria
  ): Promise<TherapistMatch[]>;
  
  getMatchExplanation(
    userId: string,
    therapistId: string
  ): Promise<MatchExplanation>;
  
  recordBooking(
    userId: string,
    therapistId: string,
    booked: boolean
  ): Promise<void>;
  
  updateMatchModel(
    userId: string,
    therapistId: string,
    outcome: TherapyOutcome
  ): Promise<void>;
}

export interface TherapistSearchCriteria {
  // Hard constraints (must match)
  insurance?: string;
  maxDistance?: number; // km
  languages?: string[];
  availability?: 'weekday' | 'weekend' | 'evening' | 'any';
  
  // Soft preferences (scored)
  specializations?: string[];
  genderPreference?: 'male' | 'female' | 'non-binary' | 'no-preference';
  ageRangePreference?: 'younger' | 'similar' | 'older' | 'no-preference';
  therapyApproach?: string[]; // CBT, DBT, psychodynamic, etc.
  sessionType?: 'in-person' | 'video' | 'phone' | 'any';
}

export interface TherapistMatch {
  therapist: TherapistProfile;
  matchScore: number; // 0-100
  matchPercentage: number; // 0-100 (user-friendly)
  keyMatchingFactors: string[];
  availableSlots: TimeSlot[];
  estimatedWaitTime: string;
}

export interface TherapistProfile {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  languages: string[];
  location: Location;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  rate: number;
  insurance: string[];
  bio: string;
  photo?: string;
  availability: Availability;
  gender?: string;
  age?: number;
}

export interface Location {
  city: string;
  province: string;
  coordinates?: { lat: number; lng: number };
}

export interface Availability {
  weekdays: boolean;
  weekends: boolean;
  evenings: boolean;
  nextAvailable: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  type: 'in-person' | 'video' | 'phone';
}

export interface MatchExplanation {
  overallScore: number;
  breakdown: ScoreBreakdown[];
  strengths: string[];
  considerations: string[];
  similarPatientSuccess: number; // 0-100
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface TherapyOutcome {
  sessionCount: number;
  continuedTherapy: boolean;
  satisfactionRating: number; // 1-5
  outcomeImprovement: number; // -100 to +100
}

export interface Demographics {
  age: number;
  gender: string;
  location: string;
}

export interface UserProfile {
  id: string;
  demographics: Demographics;
  needs: string[];
  conditions: string[];
  age: number;
}
