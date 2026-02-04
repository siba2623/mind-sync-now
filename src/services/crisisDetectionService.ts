/**
 * Crisis Detection Service
 * Real-time detection of mental health crisis indicators
 * 
 * Uses NLP + Rule-Based System for maximum safety
 * Zero false negatives acceptable - conservative approach
 */

import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export type CrisisLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

export interface CrisisDetectionResult {
  isCrisis: boolean;
  level: CrisisLevel;
  confidence: number;
  triggers: string[];
  recommendedAction: string;
  urgency: 'immediate' | 'urgent' | 'soon' | 'routine';
}

interface CrisisKeyword {
  word: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  weight: number;
}

class CrisisDetectionService {
  // Critical keywords that trigger immediate alerts
  private criticalKeywords: CrisisKeyword[] = [
    { word: 'suicide', severity: 'critical', weight: 100 },
    { word: 'kill myself', severity: 'critical', weight: 100 },
    { word: 'end my life', severity: 'critical', weight: 100 },
    { word: 'want to die', severity: 'critical', weight: 100 },
    { word: 'better off dead', severity: 'critical', weight: 100 },
    { word: 'no reason to live', severity: 'critical', weight: 95 },
    { word: 'suicide plan', severity: 'critical', weight: 100 },
    { word: 'overdose', severity: 'critical', weight: 90 },
    { word: 'hang myself', severity: 'critical', weight: 100 },
    { word: 'jump off', severity: 'critical', weight: 85 },
  ];

  // High-risk keywords
  private highRiskKeywords: CrisisKeyword[] = [
    { word: 'self harm', severity: 'high', weight: 80 },
    { word: 'cut myself', severity: 'high', weight: 80 },
    { word: 'hurt myself', severity: 'high', weight: 75 },
    { word: 'hopeless', severity: 'high', weight: 70 },
    { word: 'worthless', severity: 'high', weight: 70 },
    { word: 'burden', severity: 'high', weight: 65 },
    { word: 'give up', severity: 'high', weight: 60 },
    { word: 'can\'t go on', severity: 'high', weight: 70 },
    { word: 'no way out', severity: 'high', weight: 75 },
    { word: 'trapped', severity: 'high', weight: 65 },
  ];

  // Moderate risk keywords
  private moderateRiskKeywords: CrisisKeyword[] = [
    { word: 'depressed', severity: 'moderate', weight: 40 },
    { word: 'anxious', severity: 'moderate', weight: 35 },
    { word: 'scared', severity: 'moderate', weight: 35 },
    { word: 'alone', severity: 'moderate', weight: 40 },
    { word: 'isolated', severity: 'moderate', weight: 45 },
    { word: 'empty', severity: 'moderate', weight: 40 },
    { word: 'numb', severity: 'moderate', weight: 40 },
    { word: 'overwhelmed', severity: 'moderate', weight: 45 },
    { word: 'can\'t cope', severity: 'moderate', weight: 50 },
    { word: 'breaking down', severity: 'moderate', weight: 50 },
  ];

  /**
   * Analyze text for crisis indicators
   */
  async detectCrisis(
    text: string,
    userId: string,
    context?: {
      recentMood?: number;
      medicationAdherence?: number;
      recentBehavior?: any;
    }
  ): Promise<CrisisDetectionResult> {
    const normalizedText = text.toLowerCase();

    // 1. Keyword Detection
    const keywordScore = this.analyzeKeywords(normalizedText);

    // 2. Sentiment Analysis (simple rule-based)
    const sentimentScore = this.analyzeSentiment(normalizedText);

    // 3. Behavioral Context
    const behaviorScore = context ? this.analyzeBehavior(context) : 0;

    // 4. Calculate total risk score
    const totalScore = keywordScore.score + sentimentScore + behaviorScore;

    // 5. Determine crisis level
    const result = this.determineLevel(totalScore, keywordScore.triggers);

    // 6. Store detection result
    await this.storeDetection(userId, text, result);

    // 7. Trigger interventions if needed
    if (result.isCrisis) {
      await this.triggerInterventions(userId, result);
    }

    return result;
  }

  /**
   * Analyze keywords in text
   */
  private analyzeKeywords(text: string): { score: number; triggers: string[] } {
    let score = 0;
    const triggers: string[] = [];

    // Check critical keywords
    for (const keyword of this.criticalKeywords) {
      if (text.includes(keyword.word)) {
        score += keyword.weight;
        triggers.push(keyword.word);
      }
    }

    // Check high-risk keywords
    for (const keyword of this.highRiskKeywords) {
      if (text.includes(keyword.word)) {
        score += keyword.weight;
        triggers.push(keyword.word);
      }
    }

    // Check moderate-risk keywords
    for (const keyword of this.moderateRiskKeywords) {
      if (text.includes(keyword.word)) {
        score += keyword.weight;
        triggers.push(keyword.word);
      }
    }

    return { score, triggers };
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): number {
    // Negative sentiment indicators
    const negativeWords = [
      'hate', 'terrible', 'awful', 'horrible', 'worst', 'pain',
      'suffering', 'miserable', 'desperate', 'helpless', 'useless'
    ];

    // Positive sentiment indicators (reduce score)
    const positiveWords = [
      'hope', 'better', 'improving', 'grateful', 'thankful',
      'happy', 'good', 'great', 'wonderful', 'blessed'
    ];

    let score = 0;

    // Count negative words
    for (const word of negativeWords) {
      if (text.includes(word)) {
        score += 10;
      }
    }

    // Subtract for positive words
    for (const word of positiveWords) {
      if (text.includes(word)) {
        score -= 15;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Analyze behavioral context
   */
  private analyzeBehavior(context: {
    recentMood?: number;
    medicationAdherence?: number;
    recentBehavior?: any;
  }): number {
    let score = 0;

    // Very low mood
    if (context.recentMood && context.recentMood <= 2) {
      score += 30;
    }

    // Poor medication adherence
    if (context.medicationAdherence && context.medicationAdherence < 0.5) {
      score += 20;
    }

    // Sudden withdrawal (would need more data)
    if (context.recentBehavior?.suddenWithdrawal) {
      score += 25;
    }

    return score;
  }

  /**
   * Determine crisis level from score
   */
  private determineLevel(
    score: number,
    triggers: string[]
  ): CrisisDetectionResult {
    // Critical level - immediate action required
    if (score >= 100 || triggers.some(t => 
      ['suicide', 'kill myself', 'end my life', 'want to die'].includes(t)
    )) {
      return {
        isCrisis: true,
        level: 'critical',
        confidence: 0.95,
        triggers,
        recommendedAction: 'immediate_emergency_services',
        urgency: 'immediate'
      };
    }

    // High level - urgent intervention
    if (score >= 70) {
      return {
        isCrisis: true,
        level: 'high',
        confidence: 0.85,
        triggers,
        recommendedAction: 'crisis_counselor_contact',
        urgency: 'urgent'
      };
    }

    // Moderate level - prompt support
    if (score >= 40) {
      return {
        isCrisis: true,
        level: 'moderate',
        confidence: 0.70,
        triggers,
        recommendedAction: 'therapist_check_in',
        urgency: 'soon'
      };
    }

    // Low level - monitoring
    if (score >= 20) {
      return {
        isCrisis: false,
        level: 'low',
        confidence: 0.60,
        triggers,
        recommendedAction: 'wellness_check',
        urgency: 'routine'
      };
    }

    // No crisis detected
    return {
      isCrisis: false,
      level: 'none',
      confidence: 0.90,
      triggers: [],
      recommendedAction: 'continue_monitoring',
      urgency: 'routine'
    };
  }

  /**
   * Store detection result in database
   */
  private async storeDetection(
    userId: string,
    text: string,
    result: CrisisDetectionResult
  ): Promise<void> {
    try {
      await supabase.from('crisis_detections').insert({
        user_id: userId,
        text_analyzed: text.substring(0, 500), // Store first 500 chars
        crisis_level: result.level,
        confidence: result.confidence,
        triggers: result.triggers,
        recommended_action: result.recommendedAction,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing crisis detection:', error);
    }
  }

  /**
   * Trigger appropriate interventions
   */
  private async triggerInterventions(
    userId: string,
    result: CrisisDetectionResult
  ): Promise<void> {
    switch (result.level) {
      case 'critical':
        await this.handleCriticalCrisis(userId, result);
        break;
      case 'high':
        await this.handleHighRiskCrisis(userId, result);
        break;
      case 'moderate':
        await this.handleModerateCrisis(userId, result);
        break;
    }
  }

  /**
   * Handle critical crisis (immediate danger)
   */
  private async handleCriticalCrisis(
    userId: string,
    result: CrisisDetectionResult
  ): Promise<void> {
    // 1. Send immediate notification
    await notificationService.sendCrisisAlert();

    // 2. Alert emergency contacts
    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('alert_enabled', true);

    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        // Send SMS/email to emergency contact
        console.log('CRITICAL: Alerting emergency contact:', contact.name);
      }
    }

    // 3. Alert Discovery Health case manager
    await supabase.from('care_coordinator_alerts').insert({
      user_id: userId,
      alert_type: 'CRITICAL_CRISIS',
      crisis_level: result.level,
      details: result,
      status: 'pending',
      priority: 'immediate',
      created_at: new Date().toISOString()
    });

    // 4. Show crisis resources in-app
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'CRISIS_ALERT',
      title: '🚨 Immediate Support Available',
      message: 'We\'re here for you. Please reach out to crisis support immediately.',
      priority: 'critical',
      action_url: '/crisis-support',
      created_at: new Date().toISOString()
    });
  }

  /**
   * Handle high-risk crisis
   */
  private async handleHighRiskCrisis(
    userId: string,
    result: CrisisDetectionResult
  ): Promise<void> {
    // 1. Send urgent notification
    await notificationService.sendWellnessReminder(
      'We\'ve noticed you might be struggling. Please reach out to your support network.'
    );

    // 2. Alert case manager
    await supabase.from('care_coordinator_alerts').insert({
      user_id: userId,
      alert_type: 'HIGH_RISK_CRISIS',
      crisis_level: result.level,
      details: result,
      status: 'pending',
      priority: 'urgent',
      created_at: new Date().toISOString()
    });

    // 3. Suggest immediate actions
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'WELLBEING_URGENT',
      title: '⚠️ We\'re Concerned About You',
      message: 'Please consider reaching out to your therapist or crisis support.',
      priority: 'high',
      action_url: '/crisis-support',
      created_at: new Date().toISOString()
    });
  }

  /**
   * Handle moderate crisis
   */
  private async handleModerateCrisis(
    userId: string,
    result: CrisisDetectionResult
  ): Promise<void> {
    // 1. Send check-in notification
    await notificationService.sendWellnessReminder(
      'How are you feeling? Consider talking to someone you trust.'
    );

    // 2. Log for case manager review
    await supabase.from('care_coordinator_alerts').insert({
      user_id: userId,
      alert_type: 'MODERATE_CONCERN',
      crisis_level: result.level,
      details: result,
      status: 'pending',
      priority: 'normal',
      created_at: new Date().toISOString()
    });

    // 3. Suggest resources
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'WELLBEING_CHECK',
      title: '💙 Check-In',
      message: 'We\'re here if you need support. Explore our wellness resources.',
      priority: 'medium',
      action_url: '/wellness',
      created_at: new Date().toISOString()
    });
  }

  /**
   * Analyze journal entry for crisis indicators
   */
  async analyzeJournalEntry(userId: string, entryText: string): Promise<void> {
    const result = await this.detectCrisis(entryText, userId);
    
    if (result.isCrisis) {
      console.log('Crisis detected in journal entry:', result);
    }
  }

  /**
   * Analyze voice recording transcription
   */
  async analyzeVoiceTranscription(
    userId: string,
    transcription: string
  ): Promise<void> {
    const result = await this.detectCrisis(transcription, userId);
    
    if (result.isCrisis) {
      console.log('Crisis detected in voice recording:', result);
    }
  }

  /**
   * Get crisis resources
   */
  getCrisisResources(): Array<{
    name: string;
    phone: string;
    available: string;
    description: string;
  }> {
    return [
      {
        name: 'South African Depression and Anxiety Group (SADAG)',
        phone: '0800 567 567',
        available: '24/7',
        description: 'Free counseling and support'
      },
      {
        name: 'Lifeline South Africa',
        phone: '0861 322 322',
        available: '24/7',
        description: 'Crisis counseling'
      },
      {
        name: 'Suicide Crisis Line',
        phone: '0800 567 567',
        available: '24/7',
        description: 'Immediate suicide prevention support'
      },
      {
        name: 'Discovery Health Emergency',
        phone: '0860 999 911',
        available: '24/7',
        description: 'Medical emergency support'
      }
    ];
  }
}

export const crisisDetectionService = new CrisisDetectionService();
