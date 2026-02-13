import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bell, Clock, TrendingUp, Zap } from 'lucide-react';
import { getUserNotificationProfile } from '@/services/phase3/notificationTiming';
import { supabase } from '@/integrations/supabase/client';

export default function NotificationAnalytics() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userProfile = await getUserNotificationProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load notification profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Not enough data yet. Keep using the app to see your notification insights!
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestHours = Array.from(profile.engagementRateByHour.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification Insights</h2>
        <p className="text-muted-foreground">
          AI-powered analysis of your notification preferences
        </p>
      </div>

      {/* Best Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Best Times
          </CardTitle>
          <CardDescription>
            Times when you're most likely to engage with notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bestHours.map(([hour, rate], index) => (
            <div key={hour} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">
                    {hour}:00 - {hour + 1}:00
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(rate * 100)}% engagement
                </span>
              </div>
              <Progress value={rate * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Average Response Time
          </CardTitle>
          <CardDescription>
            How quickly you typically respond to notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {Math.round(profile.averageResponseTime)} min
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {profile.averageResponseTime < 15 
              ? 'You respond very quickly!' 
              : profile.averageResponseTime < 60
              ? 'You respond at a good pace'
              : 'You prefer to respond when you have time'}
          </p>
        </CardContent>
      </Card>

      {/* Preferred Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Types of notifications you engage with most
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.preferredTypes.map((type: string) => (
              <Badge key={type} variant="secondary">
                {type.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
          {profile.optOutTypes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Opted out:</p>
              <div className="flex flex-wrap gap-2">
                {profile.optOutTypes.map((type: string) => (
                  <Badge key={type} variant="outline">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Learning Progress
          </CardTitle>
          <CardDescription>
            The system is learning your preferences over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence Level</span>
              <span className="font-medium">
                {profile.engagementRateByHour.size > 10 ? 'High' : 'Building'}
              </span>
            </div>
            <Progress 
              value={Math.min(100, (profile.engagementRateByHour.size / 24) * 100)} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {profile.engagementRateByHour.size < 10 
                ? 'Keep using the app to improve timing accuracy'
                : 'We have enough data to optimize your notification timing'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Hours</CardTitle>
          <CardDescription>
            Times when you typically use the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profile.activeHours.map((range: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{range.start} - {range.end}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
