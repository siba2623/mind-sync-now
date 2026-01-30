/**
 * Vitality Points Widget
 * Displays Discovery Health Vitality points earned through mental wellness activities
 * Gamification to increase engagement
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Award, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VitalityStats {
  totalPoints: number;
  todayPoints: number;
  weekPoints: number;
  monthPoints: number;
  currentStatus: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  nextStatus: string;
  pointsToNext: number;
  recentActivities: Array<{
    activity: string;
    points: number;
    date: string;
  }>;
}

export const VitalityPointsWidget = () => {
  const [stats, setStats] = useState<VitalityStats>({
    totalPoints: 0,
    todayPoints: 0,
    weekPoints: 0,
    monthPoints: 0,
    currentStatus: 'Bronze',
    nextStatus: 'Silver',
    pointsToNext: 500,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVitalityStats();
  }, []);

  const loadVitalityStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get vitality points from database
      const { data: points } = await supabase
        .from('vitality_points')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (points) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const totalPoints = points.reduce((sum, p) => sum + p.points_earned, 0);
        const todayPoints = points
          .filter(p => p.activity_date === today)
          .reduce((sum, p) => sum + p.points_earned, 0);
        const weekPoints = points
          .filter(p => p.activity_date >= weekAgo)
          .reduce((sum, p) => sum + p.points_earned, 0);
        const monthPoints = points
          .filter(p => p.activity_date >= monthAgo)
          .reduce((sum, p) => sum + p.points_earned, 0);

        // Determine status based on total points
        let currentStatus: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
        let nextStatus = 'Silver';
        let pointsToNext = 500;

        if (totalPoints >= 2000) {
          currentStatus = 'Diamond';
          nextStatus = 'Diamond';
          pointsToNext = 0;
        } else if (totalPoints >= 1000) {
          currentStatus = 'Gold';
          nextStatus = 'Diamond';
          pointsToNext = 2000 - totalPoints;
        } else if (totalPoints >= 500) {
          currentStatus = 'Silver';
          nextStatus = 'Gold';
          pointsToNext = 1000 - totalPoints;
        } else {
          currentStatus = 'Bronze';
          nextStatus = 'Silver';
          pointsToNext = 500 - totalPoints;
        }

        // Get recent activities
        const recentActivities = points.slice(0, 5).map(p => ({
          activity: p.activity_type,
          points: p.points_earned,
          date: new Date(p.activity_date).toLocaleDateString()
        }));

        setStats({
          totalPoints,
          todayPoints,
          weekPoints,
          monthPoints,
          currentStatus,
          nextStatus,
          pointsToNext,
          recentActivities
        });
      }
    } catch (error) {
      console.error('Error loading vitality stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diamond': return 'bg-gradient-to-r from-blue-400 to-purple-500';
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Silver': return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 'Bronze': return 'bg-gradient-to-r from-orange-700 to-orange-900';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = () => {
    const statusPoints = {
      Bronze: 0,
      Silver: 500,
      Gold: 1000,
      Diamond: 2000
    };
    const currentThreshold = statusPoints[stats.currentStatus];
    const nextThreshold = stats.nextStatus === 'Diamond' ? 2000 : statusPoints[stats.nextStatus as keyof typeof statusPoints];
    const progress = ((stats.totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Vitality Points</CardTitle>
          </div>
          <Badge className={getStatusColor(stats.currentStatus)}>
            {stats.currentStatus}
          </Badge>
        </div>
        <CardDescription>
          Discovery Health mental wellness rewards
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Points Display */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-primary">
            {stats.totalPoints.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Points Earned
          </div>
        </div>

        {/* Progress to Next Status */}
        {stats.pointsToNext > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {stats.nextStatus}</span>
              <span className="font-medium">{stats.pointsToNext} points to go</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>
        )}

        {/* Points Breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{stats.todayPoints}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">{stats.weekPoints}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">{stats.monthPoints}</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
        </div>

        {/* Recent Activities */}
        {stats.recentActivities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Recent Activities</h4>
            </div>
            <div className="space-y-2">
              {stats.recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span>{activity.activity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">+{activity.points}</span>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Earn Points */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">Earn More Points</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
              <div className="font-bold text-green-700 dark:text-green-400">+10 points</div>
              <div className="text-muted-foreground">Daily mood check-in</div>
            </div>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
              <div className="font-bold text-blue-700 dark:text-blue-400">+50 points</div>
              <div className="text-muted-foreground">Complete CBT module</div>
            </div>
            <div className="p-2 rounded bg-purple-50 dark:bg-purple-900/20">
              <div className="font-bold text-purple-700 dark:text-purple-400">+100 points</div>
              <div className="text-muted-foreground">7-day meditation streak</div>
            </div>
            <div className="p-2 rounded bg-orange-50 dark:bg-orange-900/20">
              <div className="font-bold text-orange-700 dark:text-orange-400">+150 points</div>
              <div className="text-muted-foreground">Therapy session</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" variant="default">
          <Sparkles className="w-4 h-4 mr-2" />
          View All Activities
        </Button>

        {/* Discovery Integration Note */}
        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          Points sync automatically with your Discovery Vitality account
        </div>
      </CardContent>
    </Card>
  );
};
