import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Snowflake, Trophy } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';
import { useToast } from '@/hooks/use-toast';

export const StreakWidget = () => {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [freezesAvailable, setFreezesAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const profile = await gamificationService.getGamificationProfile();
      if (profile) {
        setStreak(profile.current_streak);
        setLongestStreak(profile.longest_streak);
        setFreezesAvailable(profile.streak_freezes_available);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseFreeze = async () => {
    try {
      await gamificationService.useStreakFreeze();
      setFreezesAvailable(prev => prev - 1);
      toast({
        title: '❄️ Streak Freeze Used',
        description: 'Your streak is protected for today!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to use streak freeze',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStreakColor = () => {
    if (streak >= 100) return 'from-purple-500 to-pink-500';
    if (streak >= 30) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getStreakEmoji = () => {
    if (streak >= 100) return '🔥🔥🔥';
    if (streak >= 30) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '✨';
  };

  return (
    <Card className={`border-2 bg-gradient-to-br ${getStreakColor()} bg-opacity-10`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-4xl">{getStreakEmoji()}</div>
            <div>
              <h3 className="text-2xl font-bold">{streak} Days</h3>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
          </div>
          
          {longestStreak > streak && (
            <Badge variant="secondary" className="gap-1">
              <Trophy className="w-3 h-3" />
              Best: {longestStreak}
            </Badge>
          )}
        </div>

        {/* Streak Milestones */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next milestone</span>
            <span className="font-medium">
              {streak < 7 ? '7 days' : streak < 30 ? '30 days' : streak < 100 ? '100 days' : '365 days'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getStreakColor()} transition-all duration-500`}
              style={{
                width: `${
                  streak < 7
                    ? (streak / 7) * 100
                    : streak < 30
                    ? ((streak - 7) / 23) * 100
                    : streak < 100
                    ? ((streak - 30) / 70) * 100
                    : ((streak - 100) / 265) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Streak Freezes */}
        {freezesAvailable > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                {freezesAvailable} Streak {freezesAvailable === 1 ? 'Freeze' : 'Freezes'}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={handleUseFreeze}>
              Use
            </Button>
          </div>
        )}

        {/* Motivational Message */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {streak === 0 && "Start your wellness journey today!"}
            {streak > 0 && streak < 7 && "Keep going! You're building a habit 💪"}
            {streak >= 7 && streak < 30 && "Amazing! You're on fire! 🔥"}
            {streak >= 30 && streak < 100 && "Incredible dedication! 🌟"}
            {streak >= 100 && "You're a wellness legend! 👑"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
