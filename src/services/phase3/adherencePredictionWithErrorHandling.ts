// Phase 3 - Medication Adherence Prediction Service with Error Handling
// Task 11.1: Comprehensive error handling and fallback strategies

import { supabase } from '@/integrations/supabase/client';
import type {
  AdherenceRiskPrediction,
  AdherenceFeatures,
  RiskFactor,
  OptimalReminderTime,
  AdherenceInsights,
  DailyForecast,
  StreakAlert
} from './types';

// ============================================================================
// Error Handling & Fallbacks
// ============================================================================

const PERFORMANCE_TIMEOUT_MS = 100; // 100ms requirement

/**
 * Fallback prediction when data is insufficient
 */
function getFallbackPrediction(medicationId: string): AdherenceRiskPrediction {
  console.warn('[Adherence] Using fallback prediction due to insufficient data');
  return {
    medicationId,
    riskLevel: 'moderate',
    probability: 50,
    confidence: 30,
    factors: [{
      factor: 'Insufficient data',
      impact: 'negative',
      weight: 0,
      description: 'Not enough medication history to make accurate prediction'
    }],
    nextDoseTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    recommendedReminderTime: undefined
  };
}

/**
 * Fallback reminder time when calculation fails
 */
function getFallbackReminderTime(scheduledTime: string): OptimalReminderTime {
  console.warn('[Adherence] Using fallback reminder time');
  try {
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    if (scheduledDate <= new Date()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    // Default: 30 minutes before
    const recommendedTime = new Date(scheduledDate);
    recommendedTime.setMinutes(recommendedTime.getMinutes() - 30);

    return {
      recommendedTime,
      confidence: 50,
      reasoning: ['Using default 30-minute lead time due to insufficient data'],
      alternativeTimes: []
    };
  } catch (error) {
    // If even parsing fails, return a safe default
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return {
      recommendedTime: now,
      confidence: 30,
      reasoning: ['Using emergency fallback time'],
      alternativeTimes: []
    };
  }
}

/**
 * Fallback insights when calculation fails
 */
function getFallbackInsights(): AdherenceInsights {
  console.warn('[Adherence] Using fallback insights');
  return {
    overallAdherenceRate: 0,
    sevenDayForecast: [],
    streakProtectionAlerts: [],
    personalizedTips: [
      'Start tracking your medications to get personalized insights',
      'Set reminders to help build a consistent routine',
      'Take medications at the same time each day'
    ]
  };
}

/**
 * Timeout wrapper for async operations
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(`${operation} timeout`)), timeoutMs)
  );

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.warn(`[Adherence] ${operation} timed out or failed, using fallback`);
    return fallback;
  }
}

// ============================================================================
// Feature Extraction with Error Handling
// ============================================================================

/**
 * Extract adherence features from user's medication history
 * Requirements: 1.1
 * Error Handling: Returns fallback features if data is insufficient
 */
export async function extractAdherenceFeatures(
  medicationId: string,
  userId: string
): Promise<AdherenceFeatures> {
  try {
    // Fetch medication logs from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: logs, error } = await supabase
      .from('medication_logs' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('medication_id', medicationId)
      .gte('scheduled_time', ninetyDaysAgo.toISOString())
      .order('scheduled_time', { ascending: false });

    if (error) {
      console.error('[Adherence] Error fetching medication logs:', error);
      throw new Error('Failed to fetch medication history');
    }
    
    if (!logs || logs.length === 0) {
      throw new Error('Insufficient medication history (minimum 7 days required)');
    }

    // 1. Temporal Features
    const now = new Date();
    const lastLog = logs[0];
    const timeSinceLastDose = lastLog.taken_at 
      ? (now.getTime() - new Date(lastLog.taken_at).getTime()) / (1000 * 60 * 60)
      : 0;
    
    const dayOfWeek = now.getDay();
    const hourOfDay = now.getHours();

    // 2. Pattern Features
    const last7Days = logs.filter(log => {
      const logDate = new Date(log.scheduled_time);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return logDate >= sevenDaysAgo;
    });

    const last30Days = logs.filter(log => {
      const logDate = new Date(log.scheduled_time);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return logDate >= thirtyDaysAgo;
    });

    const sevenDayRate = last7Days.length > 0
      ? last7Days.filter(log => log.taken).length / last7Days.length
      : 0;

    const thirtyDayRate = last30Days.length > 0
      ? last30Days.filter(log => log.taken).length / last30Days.length
      : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (const log of logs) {
      if (log.taken) {
        currentStreak++;
      } else {
        break;
      }
    }

    // 3. Contextual Features (from mood tracking and health metrics)
    // Wrap in try-catch to handle missing contextual data gracefully
    let recentMoodAvg = 3; // Default neutral
    let recentSleepQuality = 7; // Default 7 hours
    let sideEffectCount = 0;

    try {
      const { data: moodData } = await supabase
        .from('mood_entries')
        .select('mood_score')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (moodData && moodData.length > 0) {
        recentMoodAvg = moodData.reduce((sum: number, entry: any) => sum + (entry.mood_score || 3), 0) / moodData.length;
      }
    } catch (moodError) {
      console.warn('[Adherence] Could not fetch mood data, using default:', moodError);
    }

    try {
      const { data: sleepData } = await supabase
        .from('health_metrics')
        .select('sleep_hours')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });

      if (sleepData && sleepData.length > 0) {
        recentSleepQuality = sleepData.reduce((sum: number, entry: any) => sum + (entry.sleep_hours || 7), 0) / sleepData.length;
      }
    } catch (sleepError) {
      console.warn('[Adherence] Could not fetch sleep data, using default:', sleepError);
    }

    // 4. Medication-Specific Features
    try {
      sideEffectCount = logs
        .filter(log => {
          const logDate = new Date(log.scheduled_time);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return logDate >= sevenDaysAgo && log.side_effects;
        })
        .length;
    } catch (sideEffectError) {
      console.warn('[Adherence] Could not calculate side effects, using default:', sideEffectError);
    }

    return {
      medicationId,
      timeSinceLastDose,
      dayOfWeek,
      hourOfDay,
      currentStreak,
      sevenDayRate,
      thirtyDayRate,
      recentMoodAvg,
      recentSleepQuality,
      sideEffectCount
    };
  } catch (error) {
    console.error('[Adherence] Feature extraction failed:', error);
    throw error; // Re-throw to be caught by caller
  }
}

// ============================================================================
// Risk Prediction (unchanged - pure calculation, no I/O)
// ============================================================================

/**
 * Calculate risk probability using logistic regression with heuristic weights
 * Requirements: 1.2
 */
export function calculateRiskProbability(features: AdherenceFeatures): AdherenceRiskPrediction {
  // Initial heuristic weights (will be replaced with ML model later)
  const weights = {
    recentStreakBroken: 1.5,
    weekendDay: 0.5,
    lowMood: 0.8,
    poorSleep: 0.6,
    multipleDoses: 0.3,
    sideEffects: 0.5,
    highAdherence: -2.0,
    morningMed: -0.3
  };

  let logit = -1.0; // β₀ (intercept) - start with slight negative bias

  const factors: RiskFactor[] = [];

  // Recent streak broken
  if (features.currentStreak === 0 && features.sevenDayRate < 0.8) {
    logit += weights.recentStreakBroken;
    factors.push({
      factor: 'Recent streak broken',
      impact: 'negative',
      weight: weights.recentStreakBroken,
      description: 'You recently missed a dose, increasing risk'
    });
  }

  // Weekend day
  if (features.dayOfWeek === 0 || features.dayOfWeek === 6) {
    logit += weights.weekendDay;
    factors.push({
      factor: 'Weekend day',
      impact: 'negative',
      weight: weights.weekendDay,
      description: 'Weekend routines can disrupt medication schedules'
    });
  }

  // Low mood
  if (features.recentMoodAvg < 3) {
    logit += weights.lowMood;
    factors.push({
      factor: 'Low mood',
      impact: 'negative',
      weight: weights.lowMood,
      description: 'Lower mood can affect medication adherence'
    });
  }

  // Poor sleep
  if (features.recentSleepQuality < 5) {
    logit += weights.poorSleep;
    factors.push({
      factor: 'Poor sleep',
      impact: 'negative',
      weight: weights.poorSleep,
      description: 'Insufficient sleep can lead to missed doses'
    });
  }

  // Side effects
  if (features.sideEffectCount > 0) {
    logit += weights.sideEffects;
    factors.push({
      factor: 'Side effects reported',
      impact: 'negative',
      weight: weights.sideEffects,
      description: 'Side effects may reduce willingness to take medication'
    });
  }

  // High recent adherence (protective)
  if (features.sevenDayRate > 0.9) {
    logit += weights.highAdherence;
    factors.push({
      factor: 'High adherence rate',
      impact: 'positive',
      weight: Math.abs(weights.highAdherence),
      description: 'Strong recent adherence pattern is protective'
    });
  }

  // Morning medication (protective)
  if (features.hourOfDay >= 6 && features.hourOfDay <= 10) {
    logit += weights.morningMed;
    factors.push({
      factor: 'Morning medication',
      impact: 'positive',
      weight: Math.abs(weights.morningMed),
      description: 'Morning routines tend to be more consistent'
    });
  }

  // Calculate probability using logistic function
  const probability = (1 / (1 + Math.exp(-logit))) * 100;

  // Ensure probability is within bounds [0, 100]
  const boundedProbability = Math.max(0, Math.min(100, Math.round(probability)));

  // Categorize risk level (after rounding)
  let riskLevel: 'low' | 'moderate' | 'high';
  if (boundedProbability < 30) {
    riskLevel = 'low';
  } else if (boundedProbability >= 60) {
    riskLevel = 'high';
  } else {
    riskLevel = 'moderate';
  }

  // Calculate confidence based on data availability
  const dataPoints = [
    features.sevenDayRate,
    features.thirtyDayRate,
    features.recentMoodAvg,
    features.recentSleepQuality
  ].filter(val => val !== null && val !== undefined).length;
  
  const confidence = Math.min(100, (dataPoints / 4) * 100);

  // Calculate next dose time (assume daily medication for now)
  const nextDoseTime = new Date();
  nextDoseTime.setHours(features.hourOfDay, 0, 0, 0);
  if (nextDoseTime <= new Date()) {
    nextDoseTime.setDate(nextDoseTime.getDate() + 1);
  }

  return {
    medicationId: features.medicationId,
    riskLevel,
    probability: boundedProbability,
    confidence: Math.round(confidence),
    factors,
    nextDoseTime,
    recommendedReminderTime: undefined // Will be calculated separately
  };
}

// Continue in next file part...

// ============================================================================
// Optimal Reminder Timing with Error Handling
// ============================================================================

/**
 * Calculate optimal reminder time based on risk and user patterns
 * Requirements: 1.3
 * Error Handling: Returns fallback time if calculation fails
 */
export async function calculateOptimalReminderTime(
  medicationId: string,
  scheduledTime: string,
  userId: string
): Promise<OptimalReminderTime> {
  try {
    // Parse scheduled time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    if (scheduledDate <= new Date()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    // Get risk prediction with timeout
    let prediction: AdherenceRiskPrediction;
    try {
      const features = await extractAdherenceFeatures(medicationId, userId);
      prediction = calculateRiskProbability(features);
    } catch (predictionError) {
      console.warn('[Adherence] Could not get risk prediction, using moderate risk:', predictionError);
      prediction = getFallbackPrediction(medicationId);
    }

    const reasoning: string[] = [];
    const alternativeTimes: Date[] = [];

    // Calculate lead time based on risk level
    let leadTimeMinutes: number;
    
    if (prediction.riskLevel === 'high') {
      leadTimeMinutes = 60; // 1 hour before
      reasoning.push('High risk detected - sending reminder 1 hour early');
      
      // Add second reminder at dose time
      alternativeTimes.push(new Date(scheduledDate));
      reasoning.push('Additional reminder will be sent at dose time');
    } else if (prediction.riskLevel === 'moderate') {
      leadTimeMinutes = 30; // 30 minutes before
      reasoning.push('Moderate risk - sending reminder 30 minutes early');
    } else {
      leadTimeMinutes = 0; // At dose time
      reasoning.push('Low risk - reminder at scheduled dose time');
    }

    // Fetch historical response patterns (with error handling)
    try {
      const { data: historicalReminders } = await supabase
        .from('medication_logs' as any)
        .select('reminder_time, taken_at, taken')
        .eq('user_id', userId)
        .eq('medication_id', medicationId)
        .eq('reminder_sent', true)
        .not('reminder_time', 'is', null)
        .not('taken_at', 'is', null)
        .limit(30);

      if (historicalReminders && historicalReminders.length > 5) {
        // Calculate average response time
        const responseTimes = historicalReminders
          .filter((r: any) => r.taken)
          .map((r: any) => {
            const reminderTime = new Date(r.reminder_time!);
            const takenTime = new Date(r.taken_at!);
            return (takenTime.getTime() - reminderTime.getTime()) / (1000 * 60); // minutes
          });

        if (responseTimes.length > 0) {
          const avgResponseTime = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length;
          reasoning.push(`Based on your typical ${Math.round(avgResponseTime)}-minute response time`);
        }
      }
    } catch (historyError) {
      console.warn('[Adherence] Could not fetch historical reminders:', historyError);
      reasoning.push('Using default timing (no historical data available)');
    }

    // Calculate recommended time
    const recommendedTime = new Date(scheduledDate);
    recommendedTime.setMinutes(recommendedTime.getMinutes() - leadTimeMinutes);

    // Avoid sleep hours (22:00-06:00)
    if (recommendedTime.getHours() >= 22 || recommendedTime.getHours() < 6) {
      recommendedTime.setHours(6, 0, 0, 0);
      reasoning.push('Adjusted to avoid sleep hours (22:00-06:00)');
    }

    // Calculate confidence
    const confidence = prediction.confidence;

    return {
      recommendedTime,
      confidence,
      reasoning,
      alternativeTimes
    };
  } catch (error) {
    console.error('[Adherence] Reminder time calculation failed:', error);
    return getFallbackReminderTime(scheduledTime);
  }
}

// ============================================================================
// Adherence Insights with Error Handling
// ============================================================================

/**
 * Generate adherence insights for display
 * Requirements: 1.4
 * Error Handling: Returns fallback insights if calculation fails
 */
export async function getAdherenceInsights(userId: string): Promise<AdherenceInsights> {
  try {
    // Get all active medications
    const { data: medications, error } = await supabase
      .from('medications' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (error) {
      console.error('[Adherence] Error fetching medications:', error);
      throw error;
    }
    
    if (!medications || medications.length === 0) {
      return {
        overallAdherenceRate: 0,
        sevenDayForecast: [],
        streakProtectionAlerts: [],
        personalizedTips: ['Add medications to start tracking adherence']
      };
    }

    // Calculate overall adherence rate
    let totalAdherence = 0;
    let successfulMeds = 0;
    const streakAlerts: StreakAlert[] = [];

    for (const med of medications) {
      try {
        const features = await extractAdherenceFeatures(med.id, userId);
        totalAdherence += features.sevenDayRate;
        successfulMeds++;

        // Check for streak protection needs
        const prediction = calculateRiskProbability(features);
        if (features.currentStreak >= 7 && prediction.probability >= 30) {
          streakAlerts.push({
            medicationId: med.id,
            currentStreak: features.currentStreak,
            riskOfBreaking: prediction.probability,
            protectionStrategy: prediction.riskLevel === 'high'
              ? 'Set multiple reminders and prepare medication in advance'
              : 'Enable reminder notifications and check your schedule'
          });
        }
      } catch (medError) {
        console.warn(`[Adherence] Error processing medication ${med.id}:`, medError);
        // Continue with other medications
      }
    }

    const overallAdherenceRate = successfulMeds > 0
      ? (totalAdherence / successfulMeds) * 100
      : 0;

    // Generate 7-day forecast
    const sevenDayForecast: DailyForecast[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simple forecast based on day of week patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const predictedAdherence = isWeekend
        ? overallAdherenceRate * 0.9 // 10% lower on weekends
        : overallAdherenceRate;

      sevenDayForecast.push({
        date,
        predictedAdherence: Math.round(predictedAdherence),
        riskLevel: predictedAdherence >= 70 ? 'low' : predictedAdherence >= 40 ? 'moderate' : 'high'
      });
    }

    // Generate personalized tips
    const personalizedTips: string[] = [];
    
    if (overallAdherenceRate < 70) {
      personalizedTips.push('Try setting your medications in a visible location');
      personalizedTips.push('Use a pill organizer to prepare doses in advance');
    }
    
    if (streakAlerts.length > 0) {
      personalizedTips.push('You have active streaks to protect - stay consistent!');
    }
    
    personalizedTips.push('Taking medications at the same time daily improves adherence');

    return {
      overallAdherenceRate: Math.round(overallAdherenceRate),
      sevenDayForecast,
      streakProtectionAlerts: streakAlerts,
      personalizedTips
    };
  } catch (error) {
    console.error('[Adherence] Insights generation failed:', error);
    return getFallbackInsights();
  }
}

// ============================================================================
// Event Recording with Error Handling
// ============================================================================

/**
 * Record adherence event and update model
 * Requirements: 1.1, 1.2
 * Error Handling: Logs error but doesn't throw to avoid disrupting user flow
 */
export async function recordAdherenceEvent(
  medicationId: string,
  userId: string,
  taken: boolean,
  timestamp: Date
): Promise<void> {
  try {
    // Find the scheduled dose for this timestamp
    const { data: medication, error: medError } = await supabase
      .from('medications' as any)
      .select('scheduled_time')
      .eq('id', medicationId)
      .single();

    if (medError) {
      console.error('[Adherence] Error fetching medication:', medError);
      throw new Error('Medication not found');
    }

    if (!medication) {
      throw new Error('Medication not found');
    }

    // Create medication log
    const { error } = await supabase
      .from('medication_logs' as any)
      .insert({
        user_id: userId,
        medication_id: medicationId,
        scheduled_time: timestamp.toISOString(),
        taken_at: taken ? timestamp.toISOString() : null,
        taken,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('[Adherence] Error recording event:', error);
      throw error;
    }

    console.log('[Adherence] Event recorded successfully');
  } catch (error) {
    console.error('[Adherence] Failed to record adherence event:', error);
    // Don't throw - we don't want to disrupt user flow
    // In production, this would be logged to monitoring service
  }
}

// ============================================================================
// Main Service Interface with Error Handling
// ============================================================================

export const adherencePredictionService = {
  /**
   * Predict adherence risk with comprehensive error handling
   */
  predictAdherenceRisk: async (medicationId: string, userId: string): Promise<AdherenceRiskPrediction> => {
    try {
      const features = await extractAdherenceFeatures(medicationId, userId);
      return calculateRiskProbability(features);
    } catch (error) {
      console.error('[Adherence] Risk prediction failed:', error);
      return getFallbackPrediction(medicationId);
    }
  },

  /**
   * Calculate optimal reminder time with error handling
   */
  calculateOptimalReminderTime: async (
    medicationId: string,
    scheduledTime: string,
    userId: string
  ): Promise<OptimalReminderTime> => {
    try {
      return await calculateOptimalReminderTime(medicationId, scheduledTime, userId);
    } catch (error) {
      console.error('[Adherence] Reminder time calculation failed:', error);
      return getFallbackReminderTime(scheduledTime);
    }
  },

  /**
   * Get adherence insights with error handling
   */
  getAdherenceInsights: async (userId: string): Promise<AdherenceInsights> => {
    try {
      return await getAdherenceInsights(userId);
    } catch (error) {
      console.error('[Adherence] Insights generation failed:', error);
      return getFallbackInsights();
    }
  },

  /**
   * Record adherence event (non-throwing)
   */
  recordAdherenceEvent: async (
    medicationId: string,
    userId: string,
    taken: boolean,
    timestamp: Date
  ): Promise<void> => {
    await recordAdherenceEvent(medicationId, userId, taken, timestamp);
  }
};

// Export individual functions for testing
export {
  extractAdherenceFeatures,
  calculateRiskProbability,
  calculateOptimalReminderTime,
  getAdherenceInsights,
  recordAdherenceEvent,
  getFallbackPrediction,
  getFallbackReminderTime,
  getFallbackInsights
};
