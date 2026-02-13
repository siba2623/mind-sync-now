import { supabase } from '@/integrations/supabase/client';
import { crisisDetectionService } from './crisisDetectionService';

export interface ModerationResult {
  isSafe: boolean;
  confidence: number;
  flags: string[];
  suggestedAction: 'allow' | 'flag' | 'block' | 'escalate';
  reason?: string;
}

export interface UserReport {
  id: string;
  reporter_profile_id: string;
  reported_profile_id: string;
  message_id?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  reviewed_at?: string;
}

// Crisis keywords that trigger immediate intervention
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'not worth living', 'want to die',
  'self harm', 'cutting', 'overdose', 'goodbye forever', 'better off dead',
  'no reason to live', 'ending my life', 'take my life', 'hurt myself'
];

// Harmful content patterns
const HARMFUL_PATTERNS = [
  'violence', 'threat', 'harassment', 'bullying', 'abuse',
  'hate speech', 'discrimination', 'spam', 'scam', 'inappropriate'
];

// Medical advice patterns (not allowed)
const MEDICAL_ADVICE_PATTERNS = [
  'you should take', 'stop taking', 'increase dose', 'decrease dose',
  'don\'t need medication', 'medication is bad', 'try this instead of'
];

class ModerationService {
  
  // ============================================================================
  // CONTENT MODERATION
  // ============================================================================

  async moderateContent(content: string): Promise<ModerationResult> {
    const lowerContent = content.toLowerCase();
    const flags: string[] = [];
    let confidence = 0;
    let suggestedAction: 'allow' | 'flag' | 'block' | 'escalate' = 'allow';

    // Check for crisis keywords (highest priority)
    const crisisMatches = CRISIS_KEYWORDS.filter(keyword => 
      lowerContent.includes(keyword)
    );
    
    if (crisisMatches.length > 0) {
      flags.push('crisis', 'suicide_risk');
      confidence = 0.95;
      suggestedAction = 'escalate';
      
      // Trigger crisis detection system
      await this.handleCrisisContent(content);
      
      return {
        isSafe: false,
        confidence,
        flags,
        suggestedAction,
        reason: 'Crisis language detected. User needs immediate support.'
      };
    }

    // Check for harmful content
    const harmfulMatches = HARMFUL_PATTERNS.filter(pattern =>
      lowerContent.includes(pattern)
    );
    
    if (harmfulMatches.length > 0) {
      flags.push(...harmfulMatches);
      confidence = 0.7;
      suggestedAction = 'flag';
    }

    // Check for medical advice (not allowed)
    const medicalMatches = MEDICAL_ADVICE_PATTERNS.filter(pattern =>
      lowerContent.includes(pattern)
    );
    
    if (medicalMatches.length > 0) {
      flags.push('medical_advice');
      confidence = Math.max(confidence, 0.6);
      suggestedAction = suggestedAction === 'allow' ? 'flag' : suggestedAction;
    }

    // Check for excessive caps (shouting)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 20) {
      flags.push('excessive_caps');
      confidence = Math.max(confidence, 0.4);
    }

    // Check for spam patterns (repeated characters)
    if (/(.)\1{5,}/.test(content)) {
      flags.push('spam');
      confidence = Math.max(confidence, 0.5);
      suggestedAction = suggestedAction === 'allow' ? 'flag' : suggestedAction;
    }

    const isSafe = flags.length === 0 || (flags.length === 1 && flags[0] === 'excessive_caps');

    return {
      isSafe,
      confidence: confidence || 1.0,
      flags,
      suggestedAction,
      reason: flags.length > 0 ? `Detected: ${flags.join(', ')}` : undefined
    };
  }

  private async handleCrisisContent(content: string): Promise<void> {
    try {
      // Log crisis detection
      console.warn('[CRISIS DETECTED] Peer support message flagged:', content.substring(0, 50));
      
      // This would integrate with your existing crisis detection system
      // For now, we'll just log it
      // In production, this should:
      // 1. Alert moderators immediately
      // 2. Show crisis resources to the sender
      // 3. Notify emergency contacts if configured
      // 4. Create a high-priority support ticket
    } catch (error) {
      console.error('Error handling crisis content:', error);
    }
  }

  async flagMessage(messageId: string, reason: string, aiConfidence?: number): Promise<void> {
    const { error } = await supabase
      .from('peer_chat_messages')
      .update({
        is_flagged: true,
        flagged_reason: reason
      })
      .eq('id', messageId);

    if (error) throw error;

    // Create moderation log
    await this.createModerationLog({
      message_id: messageId,
      action_taken: 'flagged',
      reason,
      ai_confidence: aiConfidence
    });
  }

  // ============================================================================
  // USER REPORTS
  // ============================================================================

  async reportUser(params: {
    reported_profile_id: string;
    message_id?: string;
    reason: string;
    description?: string;
  }): Promise<UserReport> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get reporter's peer profile
    const { data: profile } = await supabase
      .from('peer_support_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('Peer profile not found');

    const { data, error } = await supabase
      .from('peer_user_reports')
      .insert({
        reporter_profile_id: profile.id,
        reported_profile_id: params.reported_profile_id,
        message_id: params.message_id,
        reason: params.reason,
        description: params.description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // If message is reported, flag it
    if (params.message_id) {
      await this.flagMessage(params.message_id, params.reason);
    }

    return data;
  }

  async getPendingReports(): Promise<UserReport[]> {
    const { data, error } = await supabase
      .from('peer_user_reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async resolveReport(reportId: string, action: string): Promise<void> {
    const { error } = await supabase
      .from('peer_user_reports')
      .update({
        status: 'resolved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) throw error;
  }

  // ============================================================================
  // REPUTATION SYSTEM
  // ============================================================================

  async updateReputation(profileId: string, change: number, reason: string): Promise<void> {
    // Get current reputation
    const { data: profile } = await supabase
      .from('peer_support_profiles')
      .select('reputation_score')
      .eq('id', profileId)
      .single();

    if (!profile) throw new Error('Profile not found');

    const newScore = Math.max(0, profile.reputation_score + change);

    const { error } = await supabase
      .from('peer_support_profiles')
      .update({ reputation_score: newScore })
      .eq('id', profileId);

    if (error) throw error;

    console.log(`Reputation updated for ${profileId}: ${change} (${reason})`);
  }

  async awardReputationForMessage(profileId: string): Promise<void> {
    await this.updateReputation(profileId, 1, 'Sent helpful message');
  }

  async penalizeForViolation(profileId: string, severity: 'minor' | 'major' | 'severe'): Promise<void> {
    const penalties = {
      minor: -5,
      major: -20,
      severe: -50
    };
    
    await this.updateReputation(profileId, penalties[severity], `${severity} violation`);
  }

  // ============================================================================
  // MODERATION LOGS
  // ============================================================================

  async createModerationLog(params: {
    message_id?: string;
    reported_by_profile_id?: string;
    moderator_id?: string;
    action_taken: string;
    reason: string;
    ai_confidence?: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('peer_moderation_logs')
      .insert({
        ...params,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getModerationLogs(limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('peer_moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // MODERATION ACTIONS
  // ============================================================================

  async timeoutUser(profileId: string, durationMinutes: number, reason: string): Promise<void> {
    // In a real implementation, this would set a timeout flag
    // For now, we'll just log it and update reputation
    await this.penalizeForViolation(profileId, 'major');
    
    await this.createModerationLog({
      action_taken: 'timeout',
      reason: `${durationMinutes} minute timeout: ${reason}`
    });

    console.log(`User ${profileId} timed out for ${durationMinutes} minutes: ${reason}`);
  }

  async banUser(profileId: string, reason: string, permanent = false): Promise<void> {
    const { error } = await supabase
      .from('peer_support_profiles')
      .update({ is_active: false })
      .eq('id', profileId);

    if (error) throw error;

    await this.penalizeForViolation(profileId, 'severe');
    
    await this.createModerationLog({
      action_taken: permanent ? 'permanent_ban' : 'ban',
      reason
    });

    console.log(`User ${profileId} banned: ${reason}`);
  }

  async warnUser(profileId: string, reason: string): Promise<void> {
    await this.penalizeForViolation(profileId, 'minor');
    
    await this.createModerationLog({
      action_taken: 'warning',
      reason
    });

    console.log(`User ${profileId} warned: ${reason}`);
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  private messageTimestamps: Map<string, number[]> = new Map();

  async checkRateLimit(profileId: string): Promise<{ allowed: boolean; reason?: string }> {
    const now = Date.now();
    const timestamps = this.messageTimestamps.get(profileId) || [];
    
    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter(ts => now - ts < 60000);
    
    // Check if user has sent more than 10 messages in the last minute
    if (recentTimestamps.length >= 10) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Please slow down.'
      };
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    this.messageTimestamps.set(profileId, recentTimestamps);
    
    return { allowed: true };
  }

  // ============================================================================
  // CONTENT SANITIZATION
  // ============================================================================

  sanitizeContent(content: string): string {
    // Remove excessive whitespace
    let sanitized = content.trim().replace(/\s+/g, ' ');
    
    // Remove potential XSS attempts
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    
    // Limit length
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }
    
    return sanitized;
  }
}

export const moderationService = new ModerationService();
