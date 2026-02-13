import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';

export const LevelProgress = () => {
  const [level, setLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsToNext, setPointsToNext] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevelData();
  }, []);

  const loadLevelData = async () => {
    try {
      const profile = await gamificationService.getGamificationProfile();
      if (profile) {
        setLevel(profile.current_level);
        setTotalPoints(profile.total_points);
        setPointsToNext(profile.points_to_next_level);
      }
    } catch (error) {
      console.error('Error loading level:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelTier = () => {
    if (level >= 76) return { name: 'Master', color: 'from-purple-500 to-pink-500', emoji: '👑' };
    if (level >= 51) return { name: 'Expert', color: 'from-orange-500 to-red-500', emoji: '⭐' };
    if (level >= 26) return { name: 'Advanced', color: 'from-yellow-500 to-orange-500', emoji: '🔥' };
    if (level >= 11) return { name: 'Intermediate', color: 'from-blue-500 to-cyan-500', emoji: '💪' };
    return { name: 'Beginner', color: 'from-green-500 to-emerald-500', emoji: '🌱' };
  };

  const getCurrentLevelPoints = () => {
    return Math.pow(level - 1, 2) * 100;
  };

  const getNextLevelPoints = () => {
    return Math.pow(level, 2) * 100;
  };

  const getProgressPercentage = () => {
    const currentLevelPoints = getCurrentLevelPoints();
    const nextLevelPoints = getNextLevelPoints();
    const pointsInLevel = totalPoints - currentLevelPoints;
    const pointsNeeded = nextLevelPoints - currentLevelPoints;
    return (pointsInLevel / pointsNeeded) * 100;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = getLevelTier();

  return (
    <Card className={`border-2 bg-gradient-to-br ${tier.color} bg-opacity-10`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{tier.emoji}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">Level {level}</h3>
                <Badge variant="secondary" className="text-xs">
                  {tier.name}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {totalPoints.toLocaleString()} total points
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {pointsToNext.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">to next level</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="relative">
            <Progress value={getProgressPercentage()} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow-md">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
          </div>
        </div>

        {/* Level Milestones */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[
            { level: 10, name: 'Beginner', emoji: '🌱' },
            { level: 25, name: 'Intermediate', emoji: '💪' },
            { level: 50, name: 'Advanced', emoji: '🔥' },
            { level: 75, name: 'Expert', emoji: '⭐' },
            { level: 100, name: 'Master', emoji: '👑' },
          ].map(milestone => (
            <div
              key={milestone.level}
              className={`text-center p-2 rounded-lg ${
                level >= milestone.level
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-gray-100 dark:bg-gray-800 opacity-50'
              }`}
            >
              <div className="text-2xl mb-1">{milestone.emoji}</div>
              <div className="text-xs font-medium">{milestone.level}</div>
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            {level < 10 && "You're just getting started! Keep going! 🚀"}
            {level >= 10 && level < 25 && "Great progress! You're building momentum! 💪"}
            {level >= 25 && level < 50 && "You're doing amazing! Keep it up! 🌟"}
            {level >= 50 && level < 75 && "Incredible dedication! You're an expert! ⭐"}
            {level >= 75 && "You're a wellness master! Legendary! 👑"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
