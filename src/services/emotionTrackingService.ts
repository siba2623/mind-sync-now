import { supabase } from '@/integrations/supabase/client';

export interface EmotionEntry {
  id?: string;
  user_id: string;
  emotion: string;
  category: string;
  intensity?: number;
  context?: string;
  created_at?: string;
}

export interface StrategyUsage {
  id?: string;
  user_id: string;
  strategy_id: number;
  strategy_name: string;
  category: string;
  helpful: boolean;
  emotion_context?: string;
  created_at?: string;
}

export const emotionTrackingService = {
  // Save emotion selection
  async saveEmotionEntry(entry: Omit<EmotionEntry, 'id' | 'created_at'>): Promise<EmotionEntry | null> {
    try {
      const { data, error } = await supabase
        .from('emotion_entries')
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error('Error saving emotion entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveEmotionEntry:', error);
      return null;
    }
  },

  // Save strategy usage
  async saveStrategyUsage(usage: Omit<StrategyUsage, 'id' | 'created_at'>): Promise<StrategyUsage | null> {
    try {
      const { data, error } = await supabase
        .from('strategy_usage')
        .insert([usage])
        .select()
        .single();

      if (error) {
        console.error('Error saving strategy usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveStrategyUsage:', error);
      return null;
    }
  },

  // Get user's emotion history
  async getEmotionHistory(userId: string, limit: number = 50): Promise<EmotionEntry[]> {
    try {
      const { data, error } = await supabase
        .from('emotion_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching emotion history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEmotionHistory:', error);
      return [];
    }
  },

  // Get user's strategy usage history
  async getStrategyHistory(userId: string, limit: number = 50): Promise<StrategyUsage[]> {
    try {
      const { data, error } = await supabase
        .from('strategy_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching strategy history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStrategyHistory:', error);
      return [];
    }
  },

  // Get emotion patterns (for analytics)
  async getEmotionPatterns(userId: string, days: number = 30) {
    try {
      const { data, error } = await supabase
        .from('emotion_entries')
        .select('emotion, category, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching emotion patterns:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEmotionPatterns:', error);
      return [];
    }
  },

  // Get most helpful strategies for user
  async getMostHelpfulStrategies(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('strategy_usage')
        .select('strategy_name, category, helpful')
        .eq('user_id', userId)
        .eq('helpful', true);

      if (error) {
        console.error('Error fetching helpful strategies:', error);
        return [];
      }

      // Count occurrences
      const strategyCounts = (data || []).reduce((acc: any, item) => {
        const key = `${item.strategy_name}-${item.category}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort
      return Object.entries(strategyCounts)
        .map(([key, count]) => {
          const [strategy_name, category] = key.split('-');
          return { strategy_name, category, usage_count: count };
        })
        .sort((a: any, b: any) => b.usage_count - a.usage_count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getMostHelpfulStrategies:', error);
      return [];
    }
  },

  // Get emotion-strategy correlations
  async getEmotionStrategyCorrelations(userId: string) {
    try {
      const emotions = await this.getEmotionHistory(userId, 100);
      const strategies = await this.getStrategyHistory(userId, 100);

      // Simple correlation: strategies used within 1 hour of emotion entries
      const correlations: any[] = [];

      emotions.forEach(emotion => {
        const emotionTime = new Date(emotion.created_at!).getTime();
        
        strategies.forEach(strategy => {
          const strategyTime = new Date(strategy.created_at!).getTime();
          const timeDiff = Math.abs(strategyTime - emotionTime);
          
          // Within 1 hour (3600000 ms)
          if (timeDiff <= 3600000) {
            correlations.push({
              emotion: emotion.emotion,
              emotion_category: emotion.category,
              strategy: strategy.strategy_name,
              strategy_category: strategy.category,
              helpful: strategy.helpful,
              time_diff_minutes: Math.round(timeDiff / 60000)
            });
          }
        });
      });

      return correlations;
    } catch (error) {
      console.error('Error in getEmotionStrategyCorrelations:', error);
      return [];
    }
  }
};