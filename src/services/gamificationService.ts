import { supabase } from '@/integrations/supabase/client';

export interface GamificationProfile {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  streak_freezes_available: number;
  total_badges_earned: number;
  total_challenges_completed: number;
  total_activities_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  points_reward: number;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  is_showcased: boolean;
  badge?: Badge;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'special';
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  badge_reward_id: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
  started_at: string;
  challenge?: Challenge;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  cost_points: number;
  icon: string | null;
  is_available: boolean;
  stock_quantity: number | null;
  created_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  purchased_at: string;
  is_active: boolean;
  reward?: Reward;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  points_change: number;
  transaction_type: 'earn' | 'spend' | 'bonus' | 'penalty';
  source: string;
  description: string | null;
  metadata: any;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  profile_id: string;
  weekly_points: number;
  current_level: number;
  current_streak: number;
  rank: number;
}

class GamificationService {
  // ============================================================================
  // GAMIFICATION PROFILE
  // ============================================================================

  async getGamificationProfile(): Promise<GamificationProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      return await this.initializeProfile();
    }

    if (error) throw error;
    return data;
  }

  async initializeProfile(): Promise<GamificationProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_gamification')
      .insert({
        user_id: user.id,
        total_points: 0,
        current_level: 1,
        points_to_next_level: 100,
        current_streak: 0,
        longest_streak: 0,
        streak_freezes_available: 0,
        total_badges_earned: 0,
        total_challenges_completed: 0,
        total_activities_completed: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // STREAK MANAGEMENT
  // ============================================================================

  async updateStreak(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('update_streak', {
      p_user_id: user.id,
    });

    if (error) throw error;
    return data;
  }

  async useStreakFreeze(): Promise<void> {
    const profile = await this.getGamificationProfile();
    if (!profile) throw new Error('Profile not found');

    if (profile.streak_freezes_available <= 0) {
      throw new Error('No streak freezes available');
    }

    const { error } = await supabase
      .from('user_gamification')
      .update({
        streak_freezes_available: profile.streak_freezes_available - 1,
        last_checkin_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', profile.user_id);

    if (error) throw error;
  }

  // ============================================================================
  // POINTS MANAGEMENT
  // ============================================================================

  async awardPoints(params: {
    points: number;
    source: string;
    description?: string;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('award_points', {
      p_user_id: user.id,
      p_points: params.points,
      p_source: params.source,
      p_description: params.description || null,
    });

    if (error) throw error;
  }

  async getPointsTransactions(limit: number = 50): Promise<PointsTransaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // BADGES
  // ============================================================================

  async getUserBadges(): Promise<UserBadge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async toggleBadgeShowcase(badgeId: string, showcase: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_badges')
      .update({ is_showcased: showcase })
      .eq('user_id', user.id)
      .eq('badge_id', badgeId);

    if (error) throw error;
  }

  async checkBadgeEligibility(category: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('check_badge_eligibility', {
      p_user_id: user.id,
      p_category: category,
    });

    if (error) throw error;
  }

  // ============================================================================
  // CHALLENGES
  // ============================================================================

  async getActiveChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('challenge_type', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUserChallenges(): Promise<UserChallenge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge:challenges(*)
      `)
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async startChallenge(challengeId: string): Promise<UserChallenge> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        current_progress: 0,
        is_completed: false,
      })
      .select(`
        *,
        challenge:challenges(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateChallengeProgress(
    challengeId: string,
    progress: number
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get challenge details
    const { data: userChallenge, error: fetchError } = await supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (fetchError) throw fetchError;

    const isCompleted = progress >= userChallenge.challenge.requirement_value;

    const { error } = await supabase
      .from('user_challenges')
      .update({
        current_progress: progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId);

    if (error) throw error;

    // Award points if completed
    if (isCompleted && !userChallenge.is_completed) {
      await this.awardPoints({
        points: userChallenge.challenge.points_reward,
        source: 'challenge_completed',
        description: `Completed: ${userChallenge.challenge.title}`,
      });

      // Update challenge count
      await supabase
        .from('user_gamification')
        .update({
          total_challenges_completed: supabase.sql`total_challenges_completed + 1`,
        })
        .eq('user_id', user.id);
    }
  }

  // ============================================================================
  // REWARDS SHOP
  // ============================================================================

  async getAvailableRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_available', true)
      .order('cost_points', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUserRewards(): Promise<UserReward[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_rewards')
      .select(`
        *,
        reward:rewards(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async purchaseReward(rewardId: string): Promise<UserReward> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single();

    if (rewardError) throw rewardError;

    // Check if user has enough points
    const profile = await this.getGamificationProfile();
    if (!profile) throw new Error('Profile not found');

    if (profile.total_points < reward.cost_points) {
      throw new Error('Insufficient points');
    }

    // Check stock
    if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
      throw new Error('Reward out of stock');
    }

    // Deduct points
    const { error: pointsError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: user.id,
        points_change: -reward.cost_points,
        transaction_type: 'spend',
        source: 'reward_purchase',
        description: `Purchased: ${reward.name}`,
      });

    if (pointsError) throw pointsError;

    // Update total points
    await supabase
      .from('user_gamification')
      .update({
        total_points: profile.total_points - reward.cost_points,
      })
      .eq('user_id', user.id);

    // Add reward to user
    const { data: userReward, error: purchaseError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
      })
      .select(`
        *,
        reward:rewards(*)
      `)
      .single();

    if (purchaseError) throw purchaseError;

    // Update stock if applicable
    if (reward.stock_quantity !== null) {
      await supabase
        .from('rewards')
        .update({
          stock_quantity: reward.stock_quantity - 1,
        })
        .eq('id', rewardId);
    }

    return userReward;
  }

  // ============================================================================
  // LEADERBOARD
  // ============================================================================

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_weekly')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async refreshLeaderboard(): Promise<void> {
    const { error } = await supabase.rpc('refresh_leaderboard_weekly');
    if (error) throw error;
  }

  async getMyLeaderboardRank(): Promise<LeaderboardEntry | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('leaderboard_weekly')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export const gamificationService = new GamificationService();
