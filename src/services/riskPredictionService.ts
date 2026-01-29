/**
 * Risk Prediction Service
 * Predictive Hospitalization Prevention System
 * 
 * Uses machine learning to identify members at risk of mental health crisis
 * and triggers appropriate interventions.
 */

import { supabase } from '@/integrations/supabase/client';

export type RiskLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface RiskAssessment {
  riskLevel: RiskLevel;
  confidenceScore: number; // 0.0 to 1.0
  contributingFactors: string[];
  recommendedActions: string[];
  assessmentDate: string;
}

export interface RiskFactors {
  moodTrend: number; // -1 (declining) to 1 (improving)
  medicationAdherence: number; // 0.0 to 1.0
  sleepQuality: number; // 0.0 to 1.0
  appEngagement: number; // 0.0 to 1.0
  socialInteraction: number; // 0.0 to 1.0
  stressLevel: number; // 0.0 to 1.0
  anxietyLevel: number; // 0.0 to 1.0
  phq9Score?: number; // 0-27
  gad7Score?: number; // 0-21
}

class RiskPredictionService {
  /**
   * Calculate risk score for a user
   */
  async assessRisk(userId: string): Promise<RiskAssessment> {
    // Gather risk factors
    const factors = await this.gatherRiskFactors(userId);
    
    // Calculate risk score using weighted algorithm
    const riskScore = this.calculateRiskScore(factors);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);
    
    // Identify contributing factors
    const contributingFactors = this.identifyContributingFactors(factors);
    
    // Generate recommended actions
    const recommendedActions = this.generateRecommendations(riskLevel, factors);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(factors);
    
    const assessment: RiskAssessment = {
      riskLevel,
      confidenceScore,
      contributingFactors,
      recommendedActions,
      assessmentDate: new Date().toISOString()
    };
    
    // Store assessment in database
    await this.storeAssessment(userId, assessment);
    
    // Trigger interventions if needed
    if (riskLevel === 'ORANGE' || riskLevel === 'RED') {
      await this.triggerInterventions(userId, assessment);
    }
    
    return assessment;
  }

  /**
   * Gather risk factors from various data sources
   */
  private async gatherRiskFactors(userId: string): Promise<RiskFactors> {
    const [moodData, medicationData, sleepData, engagementData, assessmentData] = 
      await Promise.all([
        this.getMoodTrend(userId),
        this.getMedicationAdherence(userId),
        this.getSleepQuality(userId),
        this.getAppEngagement(userId),
        this.getLatestAssessments(userId)
      ]);

    return {
      moodTrend: moodData.trend,
      medicationAdherence: medicationData.adherenceRate,
      sleepQuality: sleepData.quality,
      appEngagement: engagementData.engagementScore,
      socialInteraction: moodData.socialScore,
      stressLevel: moodData.avgStress,
      anxietyLevel: moodData.avgAnxiety,
      phq9Score: assessmentData.phq9,
      gad7Score: assessmentData.gad7
    };
  }

  /**
   * Calculate mood trend over last 14 days
   */
  private async getMoodTrend(userId: string) {
    const { data: entries } = await supabase
      .from('mood_entries')
      .select('mood_score, stress_level, anxiety_level, context')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (!entries || entries.length === 0) {
      return { trend: 0, avgStress: 0.5, avgAnxiety: 0.5, socialScore: 0.5 };
    }

    // Calculate linear regression slope for mood trend
    const moodScores = entries.map(e => e.mood_score);
    const trend = this.calculateTrend(moodScores);

    // Calculate averages
    const avgStress = entries.reduce((sum, e) => sum + (e.stress_level || 5), 0) / entries.length / 10;
    const avgAnxiety = entries.reduce((sum, e) => sum + (e.anxiety_level || 5), 0) / entries.length / 10;

    // Calculate social interaction score
    const socialEntries = entries.filter(e => e.context?.social === 'with_others');
    const socialScore = socialEntries.length / entries.length;

    return { trend, avgStress, avgAnxiety, socialScore };
  }

  /**
   * Calculate medication adherence rate
   */
  private async getMedicationAdherence(userId: string) {
    const { data: logs } = await supabase
      .from('medication_logs')
      .select('taken, scheduled_time')
      .eq('user_id', userId)
      .gte('scheduled_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!logs || logs.length === 0) {
      return { adherenceRate: 1.0 }; // Assume adherent if no data
    }

    const takenCount = logs.filter(log => log.taken).length;
    const adherenceRate = takenCount / logs.length;

    return { adherenceRate };
  }

  /**
   * Calculate sleep quality score
   */
  private async getSleepQuality(userId: string) {
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('sleep_hours, sleep_quality')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!metrics || metrics.length === 0) {
      return { quality: 0.7 }; // Neutral assumption
    }

    const avgSleepHours = metrics.reduce((sum, m) => sum + (m.sleep_hours || 7), 0) / metrics.length;
    const avgQuality = metrics.reduce((sum, m) => sum + (m.sleep_quality || 7), 0) / metrics.length / 10;

    // Optimal sleep is 7-9 hours
    const hoursScore = avgSleepHours >= 7 && avgSleepHours <= 9 ? 1.0 : 
                       avgSleepHours >= 6 && avgSleepHours <= 10 ? 0.7 : 0.4;

    const quality = (hoursScore + avgQuality) / 2;

    return { quality };
  }

  /**
   * Calculate app engagement score
   */
  private async getAppEngagement(userId: string) {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('session_duration, activities_completed')
      .eq('user_id', userId)
      .gte('session_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!sessions || sessions.length === 0) {
      return { engagementScore: 0.3 }; // Low engagement if no recent activity
    }

    // Score based on frequency and depth of engagement
    const sessionCount = sessions.length;
    const avgActivities = sessions.reduce((sum, s) => sum + (s.activities_completed || 0), 0) / sessionCount;

    const frequencyScore = Math.min(sessionCount / 7, 1.0); // Ideal: daily usage
    const depthScore = Math.min(avgActivities / 3, 1.0); // Ideal: 3+ activities per session

    const engagementScore = (frequencyScore + depthScore) / 2;

    return { engagementScore };
  }

  /**
   * Get latest PHQ-9 and GAD-7 scores
   */
  private async getLatestAssessments(userId: string) {
    const { data: assessment } = await supabase
      .from('mental_health_assessments')
      .select('assessment_type, score')
      .eq('user_id', userId)
      .in('assessment_type', ['PHQ-9', 'GAD-7'])
      .order('completed_at', { ascending: false })
      .limit(2);

    const phq9 = assessment?.find(a => a.assessment_type === 'PHQ-9')?.score;
    const gad7 = assessment?.find(a => a.assessment_type === 'GAD-7')?.score;

    return { phq9, gad7 };
  }

  /**
   * Calculate overall risk score (0.0 to 1.0)
   */
  private calculateRiskScore(factors: RiskFactors): number {
    // Weighted scoring algorithm
    const weights = {
      moodTrend: 0.20,
      medicationAdherence: 0.15,
      sleepQuality: 0.10,
      appEngagement: 0.10,
      socialInteraction: 0.10,
      stressLevel: 0.10,
      anxietyLevel: 0.10,
      phq9Score: 0.10,
      gad7Score: 0.05
    };

    let score = 0;

    // Mood trend (declining = higher risk)
    score += weights.moodTrend * (1 - (factors.moodTrend + 1) / 2);

    // Medication adherence (low = higher risk)
    score += weights.medicationAdherence * (1 - factors.medicationAdherence);

    // Sleep quality (poor = higher risk)
    score += weights.sleepQuality * (1 - factors.sleepQuality);

    // App engagement (low = higher risk)
    score += weights.appEngagement * (1 - factors.appEngagement);

    // Social interaction (low = higher risk)
    score += weights.socialInteraction * (1 - factors.socialInteraction);

    // Stress and anxiety (high = higher risk)
    score += weights.stressLevel * factors.stressLevel;
    score += weights.anxietyLevel * factors.anxietyLevel;

    // PHQ-9 score (0-27, higher = more depressed)
    if (factors.phq9Score !== undefined) {
      score += weights.phq9Score * (factors.phq9Score / 27);
    }

    // GAD-7 score (0-21, higher = more anxious)
    if (factors.gad7Score !== undefined) {
      score += weights.gad7Score * (factors.gad7Score / 21);
    }

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 0.75) return 'RED';
    if (score >= 0.50) return 'ORANGE';
    if (score >= 0.25) return 'YELLOW';
    return 'GREEN';
  }

  /**
   * Identify specific contributing factors
   */
  private identifyContributingFactors(factors: RiskFactors): string[] {
    const contributors: string[] = [];

    if (factors.moodTrend < -0.3) {
      contributors.push('Declining mood trend over past 2 weeks');
    }

    if (factors.medicationAdherence < 0.7) {
      contributors.push('Low medication adherence');
    }

    if (factors.sleepQuality < 0.5) {
      contributors.push('Poor sleep quality');
    }

    if (factors.appEngagement < 0.3) {
      contributors.push('Decreased app engagement (withdrawal pattern)');
    }

    if (factors.socialInteraction < 0.3) {
      contributors.push('Reduced social interaction');
    }

    if (factors.stressLevel > 0.7) {
      contributors.push('High stress levels');
    }

    if (factors.phq9Score && factors.phq9Score >= 15) {
      contributors.push('Moderately severe to severe depression (PHQ-9)');
    }

    if (factors.gad7Score && factors.gad7Score >= 15) {
      contributors.push('Severe anxiety (GAD-7)');
    }

    return contributors;
  }

  /**
   * Generate recommended actions based on risk level
   */
  private generateRecommendations(riskLevel: RiskLevel, factors: RiskFactors): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'RED':
        recommendations.push('Immediate clinical review required');
        recommendations.push('Contact crisis support services');
        recommendations.push('Alert care coordinator');
        recommendations.push('Consider hospitalization assessment');
        break;

      case 'ORANGE':
        recommendations.push('Schedule urgent therapist consultation');
        recommendations.push('Increase monitoring frequency');
        recommendations.push('Review medication regimen');
        recommendations.push('Activate support network');
        break;

      case 'YELLOW':
        recommendations.push('Schedule check-in with therapist');
        recommendations.push('Increase self-care activities');
        recommendations.push('Review coping strategies');
        if (factors.medicationAdherence < 0.8) {
          recommendations.push('Address medication adherence barriers');
        }
        break;

      case 'GREEN':
        recommendations.push('Continue current treatment plan');
        recommendations.push('Maintain healthy habits');
        break;
    }

    return recommendations;
  }

  /**
   * Calculate confidence score based on data availability
   */
  private calculateConfidence(factors: RiskFactors): number {
    let dataPoints = 0;
    let totalPoints = 9;

    if (factors.moodTrend !== 0) dataPoints++;
    if (factors.medicationAdherence !== 1.0) dataPoints++;
    if (factors.sleepQuality !== 0.7) dataPoints++;
    if (factors.appEngagement !== 0.3) dataPoints++;
    if (factors.socialInteraction !== 0.5) dataPoints++;
    if (factors.stressLevel !== 0.5) dataPoints++;
    if (factors.anxietyLevel !== 0.5) dataPoints++;
    if (factors.phq9Score !== undefined) dataPoints++;
    if (factors.gad7Score !== undefined) dataPoints++;

    return dataPoints / totalPoints;
  }

  /**
   * Store risk assessment in database
   */
  private async storeAssessment(userId: string, assessment: RiskAssessment): Promise<void> {
    await supabase.from('risk_assessments').insert({
      user_id: userId,
      risk_level: assessment.riskLevel,
      confidence_score: assessment.confidenceScore,
      contributing_factors: assessment.contributingFactors,
      recommended_actions: assessment.recommendedActions,
      timestamp: assessment.assessmentDate
    });
  }

  /**
   * Trigger interventions for high-risk users
   */
  private async triggerInterventions(userId: string, assessment: RiskAssessment): Promise<void> {
    // Alert care coordinator
    await this.alertCareCoordinator(userId, assessment);

    // Send in-app notification
    await this.sendInAppNotification(userId, assessment);

    // If RED level, also alert emergency contacts (with consent)
    if (assessment.riskLevel === 'RED') {
      await this.alertEmergencyContacts(userId, assessment);
    }
  }

  /**
   * Alert Discovery Health case manager
   */
  private async alertCareCoordinator(userId: string, assessment: RiskAssessment): Promise<void> {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('email_encrypted, discovery_member_number')
      .eq('user_id', userId)
      .single();

    if (!user) return;

    // Send alert to Discovery case management system
    // This would integrate with Discovery's API
    console.log('Alerting Discovery case manager:', {
      memberNumber: user.discovery_member_number,
      riskLevel: assessment.riskLevel,
      factors: assessment.contributingFactors
    });

    // Store alert in database
    await supabase.from('care_coordinator_alerts').insert({
      user_id: userId,
      alert_type: 'HIGH_RISK',
      risk_level: assessment.riskLevel,
      details: assessment,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  }

  /**
   * Send in-app notification to user
   */
  private async sendInAppNotification(userId: string, assessment: RiskAssessment): Promise<void> {
    const message = assessment.riskLevel === 'RED'
      ? 'We\'re concerned about your wellbeing. Please reach out to our crisis support team.'
      : 'We\'ve noticed some changes in your wellbeing. Let\'s check in with your therapist.';

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'WELLBEING_CHECK',
      title: 'Wellbeing Check-In',
      message,
      priority: assessment.riskLevel === 'RED' ? 'high' : 'medium',
      created_at: new Date().toISOString()
    });
  }

  /**
   * Alert emergency contacts (with user consent)
   */
  private async alertEmergencyContacts(userId: string, assessment: RiskAssessment): Promise<void> {
    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('alert_enabled', true);

    if (!contacts || contacts.length === 0) return;

    // Send SMS/email to emergency contacts
    for (const contact of contacts) {
      console.log('Alerting emergency contact:', contact.name);
      // Implement SMS/email sending logic
    }
  }

  /**
   * Calculate linear regression trend
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Normalize slope to -1 to 1 range
    return Math.max(-1, Math.min(1, slope));
  }
}

export const riskPredictionService = new RiskPredictionService();
