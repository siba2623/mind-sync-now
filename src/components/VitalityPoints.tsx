import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target, Heart, Brain, Wind, BookOpen, Calendar, Award } from 'lucide-react';

interface PointsActivity {
  id: string;
  name: string;
  points: number;
  icon: React.ReactNode;
  description: string;
  frequency: string;
}

interface UserPoints {
  total: number;
  thisWeek: number;
  thisMonth: number;
  level: string;
  nextLevelPoints: number;
}

const VITALITY_ACTIVITIES: PointsActivity[] = [
  { id: 'daily_checkin', name: 'Daily Check-in', points: 10, icon: <Calendar className="w-5 h-5" />, description: 'Complete your daily wellness check-in', frequency: 'Daily' },
  { id: 'mood_log', name: 'Log Mood', points: 5, icon: <Heart className="w-5 h-5" />, description: 'Track your emotional state', frequency: 'Up to 3x daily' },
  { id: 'journal_entry', name: 'Journal Entry', points: 15, icon: <BookOpen className="w-5 h-5" />, description: 'Write a reflective journal entry', frequency: 'Daily' },
  { id: 'breathing_exercise', name: 'Breathing Exercise', points: 10, icon: <Wind className="w-5 h-5" />, description: 'Complete a breathing session', frequency: 'Unlimited' },
  { id: 'meditation', name: 'Meditation', points: 20, icon: <Brain className="w-5 h-5" />, description: 'Complete a meditation session', frequency: 'Daily' },
  { id: 'weekly_streak', name: '7-Day Streak', points: 50, icon: <Zap className="w-5 h-5" />, description: 'Check in for 7 consecutive days', frequency: 'Weekly bonus' },
  { id: 'assessment', name: 'Wellness Assessment', points: 100, icon: <Target className="w-5 h-5" />, description: 'Complete PHQ-9 or GAD-7 screening', frequency: 'Monthly' },
];

const LEVELS = [
  { name: 'Bronze', minPoints: 0, color: 'bg-amber-600' },
  { name: 'Silver', minPoints: 500, color: 'bg-gray-400' },
  { name: 'Gold', minPoints: 1500, color: 'bg-yellow-500' },
  { name: 'Platinum', minPoints: 3500, color: 'bg-purple-500' },
  { name: 'Diamond', minPoints: 7500, color: 'bg-cyan-400' },
];

const VitalityPoints = () => {
  const [userPoints, setUserPoints] = useState<UserPoints>({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    level: 'Bronze',
    nextLevelPoints: 500,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate points from various activities
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get activity counts
      const [moodData, journalData, checkinData, breathingData, meditationData] = await Promise.all([
        supabase.from('mood_entries').select('created_at').eq('user_id', user.id),
        supabase.from('journal_entries').select('created_at').eq('user_id', user.id),
        supabase.from('daily_checkins').select('created_at').eq('user_id', user.id),
        supabase.from('breathing_sessions').select('created_at').eq('user_id', user.id),
        supabase.from('meditation_sessions').select('created_at').eq('user_id', user.id),
      ]);

      // Calculate total points
      const moodPoints = (moodData.data?.length || 0) * 5;
      const journalPoints = (journalData.data?.length || 0) * 15;
      const checkinPoints = (checkinData.data?.length || 0) * 10;
      const breathingPoints = (breathingData.data?.length || 0) * 10;
      const meditationPoints = (meditationData.data?.length || 0) * 20;
      
      const totalPoints = moodPoints + journalPoints + checkinPoints + breathingPoints + meditationPoints;

      // Calculate weekly points
      const weeklyMoods = moodData.data?.filter(m => new Date(m.created_at) >= weekAgo).length || 0;
      const weeklyJournals = journalData.data?.filter(j => new Date(j.created_at) >= weekAgo).length || 0;
      const weeklyCheckins = checkinData.data?.filter(c => new Date(c.created_at) >= weekAgo).length || 0;
      const weeklyBreathing = breathingData.data?.filter(b => new Date(b.created_at) >= weekAgo).length || 0;
      const weeklyMeditation = meditationData.data?.filter(m => new Date(m.created_at) >= weekAgo).length || 0;
      
      const weeklyPoints = (weeklyMoods * 5) + (weeklyJournals * 15) + (weeklyCheckins * 10) + (weeklyBreathing * 10) + (weeklyMeditation * 20);

      // Determine level
      const currentLevel = LEVELS.slice().reverse().find(l => totalPoints >= l.minPoints) || LEVELS[0];
      const nextLevel = LEVELS.find(l => l.minPoints > totalPoints);

      setUserPoints({
        total: totalPoints,
        thisWeek: weeklyPoints,
        thisMonth: totalPoints, // Simplified for now
        level: currentLevel.name,
        nextLevelPoints: nextLevel?.minPoints || totalPoints,
      });

      // Build recent activities list
      const activities: any[] = [];
      moodData.data?.slice(-3).forEach(m => activities.push({ type: 'mood', date: m.created_at, points: 5 }));
      journalData.data?.slice(-3).forEach(j => activities.push({ type: 'journal', date: j.created_at, points: 15 }));
      checkinData.data?.slice(-3).forEach(c => activities.push({ type: 'checkin', date: c.created_at, points: 10 }));
      
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = LEVELS.find(l => l.name === userPoints.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minPoints > userPoints.total);
  const progressToNext = nextLevel 
    ? ((userPoints.total - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Vitality Points
            </CardTitle>
            <Badge className={`${currentLevel.color} text-white`}>
              {userPoints.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{userPoints.total.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mb-4">
            {nextLevel ? `${nextLevel.minPoints - userPoints.total} points to ${nextLevel.name}` : 'Maximum level reached!'}
          </p>
          <Progress value={progressToNext} className="h-2 mb-4" />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{userPoints.thisWeek}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{userPoints.thisMonth}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Earn Points
          </CardTitle>
          <CardDescription>Complete activities to earn Vitality points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {VITALITY_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{activity.name}</div>
                  <div className="text-xs text-muted-foreground">{activity.description}</div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="font-bold">+{activity.points}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{activity.frequency}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Vitality Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {LEVELS.map((level, index) => (
              <div key={level.name} className="text-center">
                <div className={`w-10 h-10 rounded-full ${level.color} mx-auto mb-1 flex items-center justify-center ${userPoints.total >= level.minPoints ? 'opacity-100' : 'opacity-30'}`}>
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className={`text-xs font-medium ${userPoints.total >= level.minPoints ? '' : 'text-muted-foreground'}`}>
                  {level.name}
                </div>
                <div className="text-xs text-muted-foreground">{level.minPoints}+</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VitalityPoints;
