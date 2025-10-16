import { supabase } from '../integrations/supabase/client';

export const achievements = {
  '7_day_streak': {
    name: 'Consistency Champion',
    icon: '🏆',
    description: 'Maintained a 7-day check-in streak',
    condition: (user: any) => user.streak >= 7
  },
  'mood_improver': {
    name: 'Positive Trend',
    icon: '📈',
    description: 'Showed consistent mood improvement over time',
    condition: (user: any) => calculateTrend(user.moodData) > 0.5
  },
  'mindfulness_master': {
    name: 'Mindfulness Master',
    icon: '🧘',
    description: 'Completed 10 mindfulness activities',
    condition: (user: any) => user.mindfulnessActivities >= 10
  }
};

export const calculateTrend = (moodData: number[]): number => {
  if (!moodData || moodData.length < 2) return 0;

  let sum = 0;
  for (let i = 1; i < moodData.length; i++) {
    sum += moodData[i] - moodData[i - 1];
  }

  return sum / (moodData.length - 1);
};

export const checkAchievements = async (userId: string) => {
  try {
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const unlockedAchievements = Object.entries(achievements)
      .filter(([_, achievement]) => achievement.condition(userData))
      .map(([id, achievement]) => ({
        id,
        ...achievement
      }));

    return unlockedAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};