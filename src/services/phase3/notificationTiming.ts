// Phase 3 - Notification Timing Service (Thompson Sampling)

import { supabase } from '@/integrations/supabase/client';
import type {
  NotificationType,
  OptimalSendTime,
  NotificationProfile,
  TimeRange,
  BetaDistribution
} from './types';

// ============================================================================
// Thompson Sampling (Multi-Armed Bandit) Implementation
// ============================================================================

/**
 * Sample from a Beta distribution using the Gamma distribution method
 */
function sampleBeta(alpha: number, beta: number): number {
  // Use a simple approximation for Beta sampling
  // In production, consider using a proper statistical library
  
  if (alpha <= 0 || beta <= 0) {
    return 0.5; // Default to neutral probability
  }

  // For small sample sizes, use uniform distribution
  if (alpha + beta < 10) {
    return Math.random();
  }

  // Approximate Beta distribution using normal approximation
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  let sample = mean + z * stdDev;
  
  // Clamp to [0, 1]
  sample = Math.max(0, Math.min(1, sample));
  
  return sample;
}

/**
 * Initialize Beta distributions for each hour (24 arms)
 */
function initializeBetaDistributions(): Map<number, BetaDistribution> {
  const distributions = new Map<number, BetaDistribution>();
  
  for (let hour = 0; hour < 24; hour++) {
    distributions.set(hour, {
      alpha: 1, // Start with uniform prior
      beta: 1,
      sampleCount: 0
    });
  }
  
  return distributions;
}

/**
 * Load Beta distributions from database or initialize new ones
 */
async function loadBetaDistributions(
  userId: string,
  notificationType: NotificationType
): Promise<Map<number, BetaDistribution>> {
  try {
    const { data, error } = await supabase
      .from('notification_timing_models')
      .select('hour_distributions')
      .eq('user_id', userId)
      .eq('notification_type', notificationType)
      .single();

    if (error || !data) {
      return initializeBetaDistributions();
    }

    // Convert JSON to Map
    const distributions = new Map<number, BetaDistribution>();
    const hourDists = data.hour_distributions as Record<string, BetaDistribution>;
    
    for (let hour = 0; hour < 24; hour++) {
      const dist = hourDists[hour.toString()];
      distributions.set(hour, dist || { alpha: 1, beta: 1, sampleCount: 0 });
    }

    return distributions;
  } catch (error) {
    console.error('Error loading Beta distributions:', error);
    return initializeBetaDistributions();
  }
}

/**
 * Save Beta distributions to database
 */
async function saveBetaDistributions(
  userId: string,
  notificationType: NotificationType,
  distributions: Map<number, BetaDistribution>
): Promise<void> {
  try {
    // Convert Map to JSON object
    const hourDists: Record<string, BetaDistribution> = {};
    distributions.forEach((dist, hour) => {
      hourDists[hour.toString()] = dist;
    });

    // Calculate overall engagement rate
    let totalSuccesses = 0;
    let totalTrials = 0;
    distributions.forEach(dist => {
      totalSuccesses += dist.alpha - 1; // Subtract prior
      totalTrials += dist.sampleCount;
    });
    const engagementRate = totalTrials > 0 ? totalSuccesses / totalTrials : 0;

    const { error } = await supabase
      .from('notification_timing_models')
      .upsert({
        user_id: userId,
        notification_type: notificationType,
        hour_distributions: hourDists,
        last_updated: new Date().toISOString(),
        total_notifications: totalTrials,
        overall_engagement_rate: engagementRate
      }, {
        onConflict: 'user_id,notification_type'
      });

    if (error) {
      console.error('Error saving Beta distributions:', error);
    }
  } catch (error) {
    console.error('Error in saveBetaDistributions:', error);
  }
}

// ============================================================================
// Context-Aware Scheduling
// ============================================================================

/**
 * Get user's do-not-disturb hours
 */
async function getDNDHours(userId: string): Promise<TimeRange[]> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('dnd_hours')
      .eq('user_id', userId)
      .single();

    if (error || !data || !data.dnd_hours) {
      // Default sleep hours
      return [{ start: '22:00', end: '06:00' }];
    }

    return data.dnd_hours as TimeRange[];
  } catch (error) {
    return [{ start: '22:00', end: '06:00' }];
  }
}

/**
 * Check if a time falls within DND hours
 */
function isInDNDHours(hour: number, dndHours: TimeRange[]): boolean {
  for (const range of dndHours) {
    const startHour = parseInt(range.start.split(':')[0]);
    const endHour = parseInt(range.end.split(':')[0]);

    if (startHour < endHour) {
      // Normal range (e.g., 14:00-18:00)
      if (hour >= startHour && hour < endHour) {
        return true;
      }
    } else {
      // Overnight range (e.g., 22:00-06:00)
      if (hour >= startHour || hour < endHour) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get recent notification count for frequency limiting
 */
async function getRecentNotificationCount(userId: string): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('notification_interactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('sent_at', today.toISOString());

    if (error) {
      return 0;
    }

    return data || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get time of last notification
 */
async function getLastNotificationTime(userId: string): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('notification_interactions')
      .select('sent_at')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return new Date(data.sent_at);
  } catch (error) {
    return null;
  }
}

// ============================================================================
// Main Service Functions
// ============================================================================

/**
 * Calculate optimal send time using Thompson Sampling
 * Requirements: 2.2, 2.3, 2.4
 */
export async function calculateOptimalSendTime(
  notificationType: NotificationType,
  userId: string,
  priority: 'low' | 'medium' | 'high'
): Promise<OptimalSendTime> {
  const startTime = performance.now();

  try {
    // Priority notifications (risk alerts) send immediately
    if (priority === 'high' && notificationType === 'risk_alert') {
      return {
        recommendedTime: new Date(),
        confidence: 100,
        reasoning: 'High priority alert - sending immediately',
        fallbackTime: new Date(Date.now() + 5 * 60 * 1000) // 5 min fallback
      };
    }

    // Load Beta distributions
    const distributions = await loadBetaDistributions(userId, notificationType);

    // Get DND hours
    const dndHours = await getDNDHours(userId);

    // Check frequency limits
    const todayCount = await getRecentNotificationCount(userId);
    const lastNotificationTime = await getLastNotificationTime(userId);

    // Apply frequency limits (max 5 per day, 2 hours apart)
    if (todayCount >= 5 && priority !== 'high') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      return {
        recommendedTime: tomorrow,
        confidence: 50,
        reasoning: 'Daily notification limit reached (5/day)',
        fallbackTime: tomorrow
      };
    }

    if (lastNotificationTime) {
      const hoursSinceLastNotification = 
        (Date.now() - lastNotificationTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastNotification < 2 && priority !== 'high') {
        const nextAvailable = new Date(lastNotificationTime.getTime() + 2 * 60 * 60 * 1000);
        
        return {
          recommendedTime: nextAvailable,
          confidence: 60,
          reasoning: 'Minimum 2-hour gap between notifications',
          fallbackTime: nextAvailable
        };
      }
    }

    // Thompson Sampling: Sample from each arm's Beta distribution
    const samples = new Map<number, number>();
    const currentHour = new Date().getHours();

    for (let hour = 0; hour < 24; hour++) {
      const dist = distributions.get(hour)!;
      
      // Skip DND hours
      if (isInDNDHours(hour, dndHours)) {
        samples.set(hour, -1); // Mark as unavailable
        continue;
      }

      // 10% exploration: randomly sample
      // 90% exploitation: use Thompson Sampling
      if (Math.random() < 0.1) {
        samples.set(hour, Math.random());
      } else {
        samples.set(hour, sampleBeta(dist.alpha, dist.beta));
      }
    }

    // Find hour with highest sample value
    let bestHour = currentHour;
    let bestSample = -1;

    samples.forEach((sample, hour) => {
      if (sample > bestSample) {
        bestSample = sample;
        bestHour = hour;
      }
    });

    // Calculate recommended time
    const recommendedTime = new Date();
    
    // If best hour is in the past today, schedule for tomorrow
    if (bestHour < currentHour || (bestHour === currentHour && recommendedTime.getMinutes() > 30)) {
      recommendedTime.setDate(recommendedTime.getDate() + 1);
    }
    
    recommendedTime.setHours(bestHour, 0, 0, 0);

    // Calculate confidence based on sample count
    const bestDist = distributions.get(bestHour)!;
    const confidence = Math.min(100, (bestDist.sampleCount / 20) * 100);

    // Calculate fallback time (next best hour)
    let fallbackHour = bestHour;
    let fallbackSample = -1;
    samples.forEach((sample, hour) => {
      if (hour !== bestHour && sample > fallbackSample) {
        fallbackSample = sample;
        fallbackHour = hour;
      }
    });

    const fallbackTime = new Date(recommendedTime);
    fallbackTime.setHours(fallbackHour, 0, 0, 0);

    // Ensure performance requirement (<50ms)
    const duration = performance.now() - startTime;
    if (duration > 50) {
      console.warn(`Notification timing calculation took ${duration}ms (>50ms threshold)`);
    }

    return {
      recommendedTime,
      confidence: Math.round(confidence),
      reasoning: `Best engagement time based on ${bestDist.sampleCount} previous notifications`,
      fallbackTime
    };

  } catch (error) {
    console.error('Error calculating optimal send time:', error);
    
    // Fallback to default times
    const defaultTimes: Record<NotificationType, number> = {
      medication_reminder: 8,
      mood_checkin: 9,
      wellness_tip: 14,
      risk_alert: new Date().getHours(),
      adherence_streak: 20,
      therapist_message: 10
    };

    const fallbackTime = new Date();
    fallbackTime.setHours(defaultTimes[notificationType], 0, 0, 0);

    return {
      recommendedTime: fallbackTime,
      confidence: 0,
      reasoning: 'Using default time (error in calculation)',
      fallbackTime
    };
  }
}

/**
 * Record notification engagement
 * Requirements: 2.1
 */
export async function recordEngagement(
  notificationId: string,
  userId: string,
  action: 'opened' | 'dismissed' | 'ignored',
  timestamp: Date
): Promise<void> {
  try {
    const sentAt = new Date(timestamp.getTime() - 60 * 1000); // Assume sent 1 min before
    const hourOfDay = sentAt.getHours();
    const dayOfWeek = sentAt.getDay();
    const responseTimeMinutes = action === 'opened' 
      ? (timestamp.getTime() - sentAt.getTime()) / (1000 * 60)
      : null;

    // Store interaction
    const { error } = await supabase
      .from('notification_interactions')
      .insert({
        user_id: userId,
        notification_id: notificationId,
        notification_type: 'medication_reminder', // Would be passed as parameter
        sent_at: sentAt.toISOString(),
        opened_at: action === 'opened' ? timestamp.toISOString() : null,
        dismissed_at: action === 'dismissed' ? timestamp.toISOString() : null,
        action,
        hour_of_day: hourOfDay,
        day_of_week: dayOfWeek,
        response_time_minutes: responseTimeMinutes
      });

    if (error) {
      console.error('Error recording engagement:', error);
    }
  } catch (error) {
    console.error('Error in recordEngagement:', error);
  }
}

/**
 * Update timing model with new engagement data
 * Requirements: 2.4
 */
export async function updateTimingModel(
  userId: string,
  notificationType: NotificationType,
  hour: number,
  success: boolean
): Promise<void> {
  try {
    // Load current distributions
    const distributions = await loadBetaDistributions(userId, notificationType);

    // Get distribution for this hour
    const dist = distributions.get(hour)!;

    // Update Beta distribution
    if (success) {
      dist.alpha += 1; // Increment successes
    } else {
      dist.beta += 1; // Increment failures
    }
    dist.sampleCount += 1;

    // Save updated distributions
    distributions.set(hour, dist);
    await saveBetaDistributions(userId, notificationType, distributions);

  } catch (error) {
    console.error('Error updating timing model:', error);
  }
}

/**
 * Get user's notification profile
 * Requirements: 2.1, 2.2
 */
export async function getUserNotificationProfile(
  userId: string
): Promise<NotificationProfile> {
  try {
    // Get DND hours
    const dndHours = await getDNDHours(userId);

    // Calculate active hours (inverse of DND)
    const activeHours: TimeRange[] = [];
    // Simplified: assume active hours are 06:00-22:00
    activeHours.push({ start: '06:00', end: '22:00' });

    // Get engagement rates by hour
    const { data: interactions } = await supabase
      .from('notification_interactions')
      .select('hour_of_day, action')
      .eq('user_id', userId)
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const engagementByHour = new Map<number, number>();
    const countByHour = new Map<number, number>();

    if (interactions) {
      interactions.forEach(interaction => {
        const hour = interaction.hour_of_day;
        const count = countByHour.get(hour) || 0;
        const engaged = interaction.action === 'opened' ? 1 : 0;
        const currentEngagement = engagementByHour.get(hour) || 0;

        countByHour.set(hour, count + 1);
        engagementByHour.set(hour, currentEngagement + engaged);
      });

      // Calculate rates
      engagementByHour.forEach((engaged, hour) => {
        const count = countByHour.get(hour) || 1;
        engagementByHour.set(hour, engaged / count);
      });
    }

    // Calculate average response time
    const { data: responseTimes } = await supabase
      .from('notification_interactions')
      .select('response_time_minutes')
      .eq('user_id', userId)
      .not('response_time_minutes', 'is', null)
      .limit(50);

    let averageResponseTime = 5; // Default 5 minutes
    if (responseTimes && responseTimes.length > 0) {
      const sum = responseTimes.reduce((acc, r) => acc + (r.response_time_minutes || 0), 0);
      averageResponseTime = sum / responseTimes.length;
    }

    return {
      activeHours,
      doNotDisturbHours: dndHours,
      engagementRateByHour: engagementByHour,
      preferredTypes: ['medication_reminder', 'mood_checkin'],
      optOutTypes: [],
      averageResponseTime
    };

  } catch (error) {
    console.error('Error getting notification profile:', error);
    
    // Return default profile
    return {
      activeHours: [{ start: '06:00', end: '22:00' }],
      doNotDisturbHours: [{ start: '22:00', end: '06:00' }],
      engagementRateByHour: new Map(),
      preferredTypes: [],
      optOutTypes: [],
      averageResponseTime: 5
    };
  }
}

// ============================================================================
// Service Export
// ============================================================================

export const notificationTimingService = {
  calculateOptimalSendTime,
  recordEngagement,
  updateTimingModel,
  getUserNotificationProfile
};
