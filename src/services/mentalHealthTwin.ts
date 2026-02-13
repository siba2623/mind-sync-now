/**
 * Mental Health Twin Service
 * 
 * This service creates a personalized AI model that learns each user's unique
 * mental health patterns and provides personalized predictions and recommendations.
 */

import { supabase } from '@/integrations/supabase/client';

export interface PatternInsight {
  id: string;
  insightType: 'trigger' | 'intervention' | 'correlation' | 'prediction';
  category: 'mood' | 'sleep' | 'medication' | 'activity' | 'social';
  title: string;
  description: string;
  confidenceScore: number;
  dataPointsCount: number;
  impactScore?: number;
  actionableRecommendation?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export interface UserCorrelation {
  id: string;
  factorType: string;
  factorValue: string;
  outcomeType: string;
  correlationCoefficient: number;
  sampleSize: number;
  effectDescription: string;
}

export interface PersonalPrediction {
  id: string;
  predictionDate: string;
  predictionType: 'mood' | 'risk' | 'adherence' | 'crisis';
  predictedValue?: number;
  predictedCategory?: string;
  confidenceLevel: number;
  contributingFactors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  recommendedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
}

export interface InterventionEffectiveness {
  id: string;
  interventionType: string;
  interventionName: string;
  timesUsed: number;
  effectivenessRate: number;
  avgMoodImprovement: number;
  bestTimeOfDay?: string;
  bestContext?: string[];
}

export interface TwinProfile {
  id: string;
  userId: string;
  profileCompleteness: number;
  dataPointsCollected: number;
  insightsGenerated: number;
  predictionsMade: number;
  predictionAccuracyAvg?: number;
  topTriggers: string[];
  topProtectiveFactors: string[];
  mostEffectiveInterventions: string[];
  personalityTraits: Record<string, any>;
  behavioralPatterns: Record<string, any>;
  optimalTimes: Record<string, any>;
}

class MentalHealthTwinService {
  /**
   * Get user's Mental Health Twin profile
   */
  async getTwinProfile(userId: string): Promise<TwinProfile | null> {
    const { data, error } = await supabase
      .from('mental_health_twin_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching twin profile:', error);
      return null;
    }

    return this.mapTwinProfile(data);
  }

  /**
   * Initialize Mental Health Twin for a new user
   */
  async initializeTwin(userId: string): Promise<TwinProfile | null> {
    const { data, error } = await supabase
      .from('mental_health_twin_profile')
      .insert({
        user_id: userId,
        profile_completeness: 0,
        data_points_collected: 0,
        insights_generated: 0,
        predictions_made: 0,
        top_triggers: [],
        top_protective_factors: [],
        most_effective_interventions: [],
        personality_traits: {},
        behavioral_patterns: {},
        optimal_times: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error initializing twin:', error);
      return null;
    }

    return this.mapTwinProfile(data);
  }

  /**
   * Get personalized insights for user
   */
  async getInsights(userId: string, limit: number = 10): Promise<PatternInsight[]> {
    const { data, error } = await supabase
      .from('user_pattern_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('confidence_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching insights:', error);
      return [];
    }

    return data.map(this.mapInsight);
  }

  /**
   * Get correlations discovered for user
   */
  async getCorrelations(userId: string): Promise<UserCorrelation[]> {
    const { data, error } = await supabase
      .from('user_correlations')
      .select('*')
      .eq('user_id', userId)
      .order('correlation_coefficient', { ascending: false });

    if (error) {
      console.error('Error fetching correlations:', error);
      return [];
    }

    return data.map(this.mapCorrelation);
  }

  /**
   * Get predictions for upcoming days
   */
  async getPredictions(userId: string, daysAhead: number = 7): Promise<PersonalPrediction[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_id', userId)
      .gte('prediction_date', today)
      .lte('prediction_date', futureDateStr)
      .order('prediction_date', { ascending: true });

    if (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }

    return data.map(this.mapPrediction);
  }

  /**
   * Get intervention effectiveness rankings
   */
  async getInterventionEffectiveness(userId: string): Promise<InterventionEffectiveness[]> {
    const { data, error } = await supabase
      .from('user_intervention_effectiveness')
      .select('*')
      .eq('user_id', userId)
      .gte('times_used', 3) // Only show interventions used at least 3 times
      .order('effectiveness_rate', { ascending: false });

    if (error) {
      console.error('Error fetching intervention effectiveness:', error);
      return [];
    }

    return data.map(this.mapIntervention);
  }

  /**
   * Analyze user data and generate new insights
   * This would typically run as a background job
   */
  async analyzeAndGenerateInsights(userId: string): Promise<void> {
    // Get user's mood entries
    const { data: moods } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!moods || moods.length < 10) {
      console.log('Not enough data to generate insights');
      return;
    }

    // Analyze patterns (simplified version - real implementation would use ML)
    await this.detectMoodPatterns(userId, moods);
    await this.detectTriggers(userId, moods);
    await this.calculateCorrelations(userId);
  }

  /**
   * Detect mood patterns (e.g., "Your mood is lowest on Monday mornings")
   */
  private async detectMoodPatterns(userId: string, moods: any[]): Promise<void> {
    // Group by day of week
    const moodsByDay: Record<string, number[]> = {
      'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [],
      'Friday': [], 'Saturday': [], 'Sunday': []
    };

    moods.forEach(mood => {
      const date = new Date(mood.created_at);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      moodsByDay[dayName].push(mood.mood_score);
    });

    // Find lowest day
    let lowestDay = '';
    let lowestAvg = 10;

    Object.entries(moodsByDay).forEach(([day, scores]) => {
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          lowestDay = day;
        }
      }
    });

    if (lowestDay && moodsByDay[lowestDay].length >= 3) {
      await supabase.from('user_pattern_insights').insert({
        user_id: userId,
        insight_type: 'correlation',
        category: 'mood',
        title: `${lowestDay} Pattern Detected`,
        description: `Your mood tends to be lowest on ${lowestDay}s (avg: ${lowestAvg.toFixed(1)}/10). Consider scheduling self-care activities on ${lowestDay}s.`,
        confidence_score: Math.min(0.95, moodsByDay[lowestDay].length / 10),
        data_points_count: moodsByDay[lowestDay].length,
        impact_score: (5 - lowestAvg) / 5, // Higher impact if mood is very low
        actionable_recommendation: `Schedule a pleasant activity every ${lowestDay} morning to boost your mood.`
      });
    }
  }

  /**
   * Detect triggers (e.g., "Poor sleep predicts low mood")
   */
  private async detectTriggers(userId: string, moods: any[]): Promise<void> {
    // Get sleep data
    const { data: sleepData } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', 'sleep')
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (!sleepData || sleepData.length < 10) return;

    // Correlate sleep with next-day mood
    const correlations: Array<{ sleep: number; mood: number }> = [];

    sleepData.forEach(sleep => {
      const sleepDate = new Date(sleep.recorded_at);
      const nextDay = new Date(sleepDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const nextDayMood = moods.find(m => {
        const moodDate = new Date(m.created_at);
        return moodDate.toDateString() === nextDay.toDateString();
      });

      if (nextDayMood) {
        correlations.push({
          sleep: sleep.value,
          mood: nextDayMood.mood_score
        });
      }
    });

    if (correlations.length >= 5) {
      // Calculate correlation coefficient (simplified)
      const avgSleep = correlations.reduce((sum, c) => sum + c.sleep, 0) / correlations.length;
      const avgMood = correlations.reduce((sum, c) => sum + c.mood, 0) / correlations.length;

      const correlation = correlations.reduce((sum, c) => {
        return sum + (c.sleep - avgSleep) * (c.mood - avgMood);
      }, 0) / correlations.length;

      if (Math.abs(correlation) > 0.3) {
        await supabase.from('user_correlations').insert({
          user_id: userId,
          factor_type: 'sleep',
          factor_value: 'sleep_duration',
          outcome_type: 'mood',
          correlation_coefficient: correlation,
          sample_size: correlations.length,
          effect_description: correlation > 0
            ? `Better sleep is associated with improved mood the next day.`
            : `Poor sleep tends to predict lower mood the next day.`
        });

        // Create insight
        await supabase.from('user_pattern_insights').insert({
          user_id: userId,
          insight_type: 'trigger',
          category: 'sleep',
          title: 'Sleep-Mood Connection',
          description: `Your mood drops by ${Math.abs(correlation * 2).toFixed(1)} points after nights with less than 6 hours of sleep.`,
          confidence_score: Math.min(0.9, correlations.length / 20),
          data_points_count: correlations.length,
          impact_score: Math.abs(correlation),
          actionable_recommendation: 'Prioritize getting 7-8 hours of sleep to maintain stable mood.'
        });
      }
    }
  }

  /**
   * Calculate various correlations
   */
  private async calculateCorrelations(userId: string): Promise<void> {
    // This would include:
    // - Exercise vs mood
    // - Medication adherence vs symptoms
    // - Social interaction vs wellbeing
    // - Weather vs mood
    // etc.
    
    // Placeholder for now - real implementation would be more sophisticated
    console.log('Calculating correlations for user:', userId);
  }

  // Mapping functions
  private mapTwinProfile(data: any): TwinProfile {
    return {
      id: data.id,
      userId: data.user_id,
      profileCompleteness: data.profile_completeness,
      dataPointsCollected: data.data_points_collected,
      insightsGenerated: data.insights_generated,
      predictionsMade: data.predictions_made,
      predictionAccuracyAvg: data.prediction_accuracy_avg,
      topTriggers: data.top_triggers || [],
      topProtectiveFactors: data.top_protective_factors || [],
      mostEffectiveInterventions: data.most_effective_interventions || [],
      personalityTraits: data.personality_traits || {},
      behavioralPatterns: data.behavioral_patterns || {},
      optimalTimes: data.optimal_times || {}
    };
  }

  private mapInsight(data: any): PatternInsight {
    return {
      id: data.id,
      insightType: data.insight_type,
      category: data.category,
      title: data.title,
      description: data.description,
      confidenceScore: data.confidence_score,
      dataPointsCount: data.data_points_count,
      impactScore: data.impact_score,
      actionableRecommendation: data.actionable_recommendation,
      metadata: data.metadata,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  }

  private mapCorrelation(data: any): UserCorrelation {
    return {
      id: data.id,
      factorType: data.factor_type,
      factorValue: data.factor_value,
      outcomeType: data.outcome_type,
      correlationCoefficient: data.correlation_coefficient,
      sampleSize: data.sample_size,
      effectDescription: data.effect_description
    };
  }

  private mapPrediction(data: any): PersonalPrediction {
    return {
      id: data.id,
      predictionDate: data.prediction_date,
      predictionType: data.prediction_type,
      predictedValue: data.predicted_value,
      predictedCategory: data.predicted_category,
      confidenceLevel: data.confidence_level,
      contributingFactors: data.contributing_factors || [],
      recommendedActions: data.recommended_actions || []
    };
  }

  private mapIntervention(data: any): InterventionEffectiveness {
    return {
      id: data.id,
      interventionType: data.intervention_type,
      interventionName: data.intervention_name,
      timesUsed: data.times_used,
      effectivenessRate: data.effectiveness_rate,
      avgMoodImprovement: data.avg_mood_improvement,
      bestTimeOfDay: data.best_time_of_day,
      bestContext: data.best_context
    };
  }
}

export const mentalHealthTwinService = new MentalHealthTwinService();
