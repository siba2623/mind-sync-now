/**
 * Mood Pattern Analysis Service
 * Advanced time-series analysis for mood tracking
 * 
 * Detects patterns, cycles, triggers, and predicts future mood states
 */

import { supabase } from '@/integrations/supabase/client';

export interface MoodEntry {
  timestamp: string;
  moodScore: number; // 1-5
  stressLevel?: number; // 1-10
  anxietyLevel?: number; // 1-10
  energyLevel?: number; // 1-10
  context?: {
    weather?: string;
    social?: string;
    location?: string;
    activity?: string;
  };
}

export interface MoodPattern {
  type: 'cycle' | 'trend' | 'trigger' | 'anomaly';
  description: string;
  confidence: number;
  data: any;
}

export interface MoodCycle {
  period: number; // days
  amplitude: number; // 0-1
  phase: number; // 0-1
  confidence: number;
}

export interface MoodTrigger {
  trigger: string;
  correlation: number; // -1 to 1
  impact: 'positive' | 'negative';
  frequency: number;
}

export interface MoodPrediction {
  date: string;
  predictedMood: number;
  confidence: number;
  range: { min: number; max: number };
}

export interface MoodAnalysis {
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    slope: number;
    confidence: number;
  };
  cycles: MoodCycle[];
  triggers: MoodTrigger[];
  patterns: MoodPattern[];
  predictions: MoodPrediction[];
  insights: string[];
}

class MoodPatternAnalysisService {
  /**
   * Perform comprehensive mood analysis
   */
  async analyzeMoodPatterns(userId: string, days: number = 90): Promise<MoodAnalysis> {
    // Fetch mood data
    const moodData = await this.fetchMoodData(userId, days);

    if (moodData.length < 7) {
      return this.getDefaultAnalysis();
    }

    // Analyze different aspects
    const [trend, cycles, triggers, patterns, predictions] = await Promise.all([
      this.analyzeTrend(moodData),
      this.detectCycles(moodData),
      this.identifyTriggers(moodData),
      this.detectPatterns(moodData),
      this.predictFutureMood(moodData)
    ]);

    // Generate insights
    const insights = this.generateInsights(trend, cycles, triggers, patterns);

    return {
      trend,
      cycles,
      triggers,
      patterns,
      predictions,
      insights
    };
  }

  /**
   * Fetch mood data from database
   */
  private async fetchMoodData(userId: string, days: number): Promise<MoodEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (!data) return [];

    return data.map(entry => ({
      timestamp: entry.timestamp,
      moodScore: entry.mood_score,
      stressLevel: entry.stress_level,
      anxietyLevel: entry.anxiety_level,
      energyLevel: entry.energy_level,
      context: entry.context
    }));
  }

  /**
   * Analyze mood trend using linear regression
   */
  private analyzeTrend(data: MoodEntry[]) {
    const values = data.map(e => e.moodScore);
    const slope = this.calculateLinearRegression(values);

    // Calculate confidence based on R-squared
    const confidence = this.calculateRSquared(values, slope);

    let direction: 'improving' | 'stable' | 'declining';
    if (slope > 0.05) direction = 'improving';
    else if (slope < -0.05) direction = 'declining';
    else direction = 'stable';

    return {
      direction,
      slope,
      confidence
    };
  }

  /**
   * Detect cyclical patterns using autocorrelation
   */
  private detectCycles(data: MoodEntry[]): MoodCycle[] {
    if (data.length < 14) return [];

    const values = data.map(e => e.moodScore);
    const cycles: MoodCycle[] = [];

    // Check for common cycle periods (7, 14, 28 days)
    const periodsToCheck = [7, 14, 28, 30];

    for (const period of periodsToCheck) {
      if (data.length < period * 2) continue;

      const autocorr = this.calculateAutocorrelation(values, period);
      
      if (autocorr > 0.3) { // Significant correlation
        const amplitude = this.calculateAmplitude(values, period);
        const phase = this.calculatePhase(values, period);

        cycles.push({
          period,
          amplitude,
          phase,
          confidence: autocorr
        });
      }
    }

    return cycles.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Identify mood triggers through correlation analysis
   */
  private identifyTriggers(data: MoodEntry[]): MoodTrigger[] {
    const triggers: MoodTrigger[] = [];

    // Analyze context correlations
    const contexts = ['weather', 'social', 'location', 'activity'];

    for (const contextType of contexts) {
      const contextValues = data
        .filter(e => e.context?.[contextType as keyof typeof e.context])
        .map(e => ({
          value: e.context![contextType as keyof typeof e.context],
          mood: e.moodScore
        }));

      if (contextValues.length < 5) continue;

      // Group by context value and calculate average mood
      const grouped = this.groupBy(contextValues, 'value');

      for (const [value, entries] of Object.entries(grouped)) {
        const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
        const overallAvg = data.reduce((sum, e) => sum + e.moodScore, 0) / data.length;
        
        const correlation = (avgMood - overallAvg) / 2; // Normalize to -1 to 1

        if (Math.abs(correlation) > 0.2) {
          triggers.push({
            trigger: `${contextType}: ${value}`,
            correlation,
            impact: correlation > 0 ? 'positive' : 'negative',
            frequency: entries.length / data.length
          });
        }
      }
    }

    // Analyze stress/anxiety correlations
    const stressCorr = this.calculateCorrelation(
      data.filter(e => e.stressLevel).map(e => e.stressLevel!),
      data.filter(e => e.stressLevel).map(e => e.moodScore)
    );

    if (Math.abs(stressCorr) > 0.3) {
      triggers.push({
        trigger: 'High stress levels',
        correlation: -Math.abs(stressCorr),
        impact: 'negative',
        frequency: data.filter(e => e.stressLevel && e.stressLevel > 7).length / data.length
      });
    }

    return triggers.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Detect specific patterns (anomalies, sudden changes)
   */
  private detectPatterns(data: MoodEntry[]): MoodPattern[] {
    const patterns: MoodPattern[] = [];

    // Detect sudden drops (potential crisis indicators)
    for (let i = 1; i < data.length; i++) {
      const change = data[i].moodScore - data[i - 1].moodScore;
      
      if (change <= -2) { // Drop of 2+ points
        patterns.push({
          type: 'anomaly',
          description: `Sudden mood drop on ${new Date(data[i].timestamp).toLocaleDateString()}`,
          confidence: 0.9,
          data: {
            date: data[i].timestamp,
            change,
            before: data[i - 1].moodScore,
            after: data[i].moodScore
          }
        });
      }
    }

    // Detect prolonged low periods
    let lowStreak = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].moodScore <= 2) {
        lowStreak++;
      } else {
        if (lowStreak >= 3) {
          patterns.push({
            type: 'trend',
            description: `Prolonged low mood period (${lowStreak} days)`,
            confidence: 0.85,
            data: {
              duration: lowStreak,
              endDate: data[i - 1].timestamp
            }
          });
        }
        lowStreak = 0;
      }
    }

    // Detect volatility (high variance)
    const variance = this.calculateVariance(data.map(e => e.moodScore));
    if (variance > 1.5) {
      patterns.push({
        type: 'trend',
        description: 'High mood volatility detected',
        confidence: 0.75,
        data: { variance }
      });
    }

    return patterns;
  }

  /**
   * Predict future mood using moving average and trend
   */
  private predictFutureMood(data: MoodEntry[]): MoodPrediction[] {
    if (data.length < 7) return [];

    const predictions: MoodPrediction[] = [];
    const values = data.map(e => e.moodScore);

    // Calculate trend
    const slope = this.calculateLinearRegression(values);
    
    // Calculate moving average
    const windowSize = Math.min(7, Math.floor(data.length / 3));
    const recentAvg = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;

    // Calculate standard deviation for confidence intervals
    const stdDev = Math.sqrt(this.calculateVariance(values));

    // Predict next 7 days
    for (let i = 1; i <= 7; i++) {
      const trendComponent = slope * i;
      const predicted = Math.max(1, Math.min(5, recentAvg + trendComponent));
      
      // Confidence decreases with prediction distance
      const confidence = Math.max(0.3, 0.9 - (i * 0.08));

      const date = new Date();
      date.setDate(date.getDate() + i);

      predictions.push({
        date: date.toISOString(),
        predictedMood: Math.round(predicted * 10) / 10,
        confidence,
        range: {
          min: Math.max(1, predicted - stdDev),
          max: Math.min(5, predicted + stdDev)
        }
      });
    }

    return predictions;
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(
    trend: any,
    cycles: MoodCycle[],
    triggers: MoodTrigger[],
    patterns: MoodPattern[]
  ): string[] {
    const insights: string[] = [];

    // Trend insights
    if (trend.direction === 'improving') {
      insights.push('Your mood has been improving over time. Keep up the great work!');
    } else if (trend.direction === 'declining') {
      insights.push('Your mood has been declining. Consider reaching out to your therapist.');
    }

    // Cycle insights
    if (cycles.length > 0) {
      const mainCycle = cycles[0];
      if (mainCycle.period === 7) {
        insights.push('You have a weekly mood pattern. Plan self-care activities for low days.');
      } else if (mainCycle.period === 28) {
        insights.push('You have a monthly mood cycle. Track hormonal or environmental factors.');
      }
    }

    // Trigger insights
    const positiveTriggers = triggers.filter(t => t.impact === 'positive').slice(0, 2);
    const negativeTriggers = triggers.filter(t => t.impact === 'negative').slice(0, 2);

    if (positiveTriggers.length > 0) {
      insights.push(`Positive factors: ${positiveTriggers.map(t => t.trigger).join(', ')}`);
    }

    if (negativeTriggers.length > 0) {
      insights.push(`Watch out for: ${negativeTriggers.map(t => t.trigger).join(', ')}`);
    }

    // Pattern insights
    const anomalies = patterns.filter(p => p.type === 'anomaly');
    if (anomalies.length > 2) {
      insights.push('You\'ve experienced several sudden mood changes. Discuss coping strategies with your therapist.');
    }

    return insights;
  }

  /**
   * Calculate linear regression slope
   */
  private calculateLinearRegression(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;

    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Calculate R-squared for regression confidence
   */
  private calculateRSquared(values: number[], slope: number): number {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    
    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
      const predicted = mean + slope * (i - n / 2);
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - mean, 2);
    }

    return 1 - (ssRes / ssTot);
  }

  /**
   * Calculate autocorrelation for a given lag
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length;
    if (n < lag + 1) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < n; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return numerator / denominator;
  }

  /**
   * Calculate amplitude of cyclical pattern
   */
  private calculateAmplitude(values: number[], period: number): number {
    const cycles = Math.floor(values.length / period);
    if (cycles < 2) return 0;

    let maxDiff = 0;

    for (let c = 0; c < cycles; c++) {
      const cycleValues = values.slice(c * period, (c + 1) * period);
      const max = Math.max(...cycleValues);
      const min = Math.min(...cycleValues);
      maxDiff = Math.max(maxDiff, max - min);
    }

    return maxDiff / 4; // Normalize to 0-1 range (assuming 1-5 scale)
  }

  /**
   * Calculate phase of cyclical pattern
   */
  private calculatePhase(values: number[], period: number): number {
    const lastCycle = values.slice(-period);
    const maxIndex = lastCycle.indexOf(Math.max(...lastCycle));
    return maxIndex / period;
  }

  /**
   * Calculate correlation between two arrays
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    return numerator / Math.sqrt(denomX * denomY);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Group array by key
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const group = String(item[key]);
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }

  /**
   * Get default analysis for insufficient data
   */
  private getDefaultAnalysis(): MoodAnalysis {
    return {
      trend: {
        direction: 'stable',
        slope: 0,
        confidence: 0
      },
      cycles: [],
      triggers: [],
      patterns: [],
      predictions: [],
      insights: ['Keep tracking your mood to unlock personalized insights!']
    };
  }
}

export const moodPatternAnalysisService = new MoodPatternAnalysisService();
