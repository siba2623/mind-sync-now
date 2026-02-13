import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Bell, Moon, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPreferences {
  enabled: boolean;
  dndStart: number; // Hour (0-23)
  dndEnd: number; // Hour (0-23)
  maxPerDay: number;
  types: {
    medication_reminder: boolean;
    mood_checkin: boolean;
    wellness_tip: boolean;
    risk_alert: boolean;
    adherence_streak: boolean;
    therapist_message: boolean;
  };
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    dndStart: 22,
    dndEnd: 6,
    maxPerDay: 5,
    types: {
      medication_reminder: true,
      mood_checkin: true,
      wellness_tip: true,
      risk_alert: true,
      adherence_streak: true,
      therapist_message: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from profiles table
      const { data } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (data?.notification_preferences) {
        setPreferences({ ...preferences, ...data.notification_preferences });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Preferences saved', {
        description: 'Your notification settings have been updated.',
      });
    } catch (error: any) {
      toast.error('Failed to save', {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const notificationTypeLabels = {
    medication_reminder: 'Medication Reminders',
    mood_checkin: 'Mood Check-ins',
    wellness_tip: 'Wellness Tips',
    risk_alert: 'Risk Alerts',
    adherence_streak: 'Streak Notifications',
    therapist_message: 'Therapist Messages',
  };

  if (loading) {
    return <div className="text-center py-4">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive reminders and updates
              </p>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Do Not Disturb Hours
          </CardTitle>
          <CardDescription>
            Set quiet hours when you don't want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Start Time</Label>
                <span className="text-sm font-medium">
                  {formatHour(preferences.dndStart)}
                </span>
              </div>
              <Slider
                value={[preferences.dndStart]}
                onValueChange={([value]) =>
                  setPreferences({ ...preferences, dndStart: value })
                }
                min={0}
                max={23}
                step={1}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>End Time</Label>
                <span className="text-sm font-medium">
                  {formatHour(preferences.dndEnd)}
                </span>
              </div>
              <Slider
                value={[preferences.dndEnd]}
                onValueChange={([value]) =>
                  setPreferences({ ...preferences, dndEnd: value })
                }
                min={0}
                max={23}
                step={1}
                disabled={!preferences.enabled}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              No notifications will be sent between {formatHour(preferences.dndStart)} and{' '}
              {formatHour(preferences.dndEnd)} (except high-priority alerts)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            Limit how many notifications you receive per day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Maximum per day</Label>
              <span className="text-sm font-medium">
                {preferences.maxPerDay} notifications
              </span>
            </div>
            <Slider
              value={[preferences.maxPerDay]}
              onValueChange={([value]) =>
                setPreferences({ ...preferences, maxPerDay: value })
              }
              min={1}
              max={20}
              step={1}
              disabled={!preferences.enabled}
            />
            <p className="text-xs text-muted-foreground">
              AI will prioritize the most important notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notificationTypeLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">
                  {key === 'risk_alert' && 'Important wellness alerts (always enabled)'}
                  {key === 'medication_reminder' && 'Reminders to take your medications'}
                  {key === 'mood_checkin' && 'Prompts to log your mood'}
                  {key === 'wellness_tip' && 'Daily wellness tips and insights'}
                  {key === 'adherence_streak' && 'Celebrate your medication streaks'}
                  {key === 'therapist_message' && 'Messages from your therapist'}
                </p>
              </div>
              <Switch
                checked={preferences.types[key as keyof typeof preferences.types]}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    types: { ...preferences.types, [key]: checked },
                  })
                }
                disabled={!preferences.enabled || key === 'risk_alert'}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={savePreferences}
        disabled={saving || !preferences.enabled}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Changes take effect immediately. The AI will learn your preferences over time.
      </p>
    </div>
  );
}
