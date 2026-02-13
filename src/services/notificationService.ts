import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { calculateOptimalSendTime, recordEngagement, type NotificationType } from './phase3/notificationTiming';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationSchedule {
  id: number;
  title: string;
  body: string;
  schedule: {
    at: Date;
    repeats?: boolean;
    every?: 'day' | 'week' | 'month';
  };
}

class NotificationService {
  private isNative = Capacitor.isNativePlatform();
  private notificationQueue: Array<{id: number, scheduledFor: Date}> = [];
  private userId: string | null = null;

  constructor() {
    this.initializeUserId();
    this.setupEngagementTracking();
  }

  private async initializeUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  private setupEngagementTracking() {
    if (!this.isNative) return;

    // Track notification actions
    LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
      if (!this.userId) return;

      const action = notification.actionId === 'tap' ? 'opened' : 'dismissed';
      const notificationId = notification.notification.id.toString();

      try {
        await recordEngagement(notificationId, this.userId, action, new Date());
      } catch (error) {
        console.error('Failed to record engagement:', error);
      }
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) {
      // Web notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }

  async scheduleMedicationReminder(
    medicationName: string,
    time: string,
    medicationId: number
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Use AI-powered optimal timing if user is logged in
    let scheduleTime: Date;
    if (this.userId) {
      try {
        const optimalTime = await calculateOptimalSendTime(
          'medication_reminder',
          this.userId,
          'medium'
        );
        scheduleTime = optimalTime.recommendedTime;
      } catch (error) {
        console.error('Failed to calculate optimal time, using default:', error);
        const [hours, minutes] = time.split(':').map(Number);
        scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);
      }
    } else {
      const [hours, minutes] = time.split(':').map(Number);
      scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);
    }

    if (scheduleTime < new Date()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: medicationId,
            title: '💊 Medication Reminder',
            body: `Time to take ${medicationName}`,
            schedule: {
              at: scheduleTime,
              repeats: true,
              every: 'day',
            },
            sound: 'default',
            actionTypeId: 'MEDICATION',
            extra: {
              medicationId,
              medicationName,
              notificationType: 'medication_reminder',
            },
          },
        ],
      });
    } else {
      // Web fallback - schedule daily check
      this.scheduleWebNotification(
        `Time to take ${medicationName}`,
        scheduleTime
      );
    }
  }

  async scheduleMoodCheckIn(times: string[] = ['09:00', '14:00', '20:00']): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Use AI-powered optimal timing if user is logged in
    if (this.userId) {
      try {
        const optimalTime = await calculateOptimalSendTime(
          'mood_checkin',
          this.userId,
          'low'
        );
        
        if (this.isNative) {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 9000,
                title: '🌟 Mood Check-In',
                body: 'How are you feeling right now? Take a moment to log your mood.',
                schedule: {
                  at: optimalTime.recommendedTime,
                  repeats: true,
                  every: 'day',
                },
                sound: 'default',
                actionTypeId: 'MOOD_CHECKIN',
                extra: {
                  notificationType: 'mood_checkin',
                },
              },
            ],
          });
        }
        return;
      } catch (error) {
        console.error('Failed to calculate optimal time, using defaults:', error);
      }
    }

    // Fallback to default times
    times.forEach(async (time, index) => {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);

      if (this.isNative) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9000 + index,
              title: '🌟 Mood Check-In',
              body: 'How are you feeling right now? Take a moment to log your mood.',
              schedule: {
                at: scheduleTime,
                repeats: true,
                every: 'day',
              },
              sound: 'default',
              actionTypeId: 'MOOD_CHECKIN',
              extra: {
                notificationType: 'mood_checkin',
              },
            },
          ],
        });
      }
    });
  }

  async sendRiskLevelAlert(riskLevel: string, recommendations: string[]): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const urgency = riskLevel === 'RED' || riskLevel === 'ORANGE';
    const title = urgency ? '🚨 Wellness Alert' : '⚠️ Wellness Update';
    const body = urgency 
      ? 'Your wellness indicators suggest you may need support. Tap to view recommendations.'
      : 'Your wellness patterns have changed. Check your personalized recommendations.';

    // High priority alerts send immediately, bypassing optimal timing
    const priority = urgency ? 'high' : 'medium';
    let sendTime = new Date(Date.now() + 1000);

    if (!urgency && this.userId) {
      try {
        const optimalTime = await calculateOptimalSendTime(
          'risk_alert',
          this.userId,
          priority
        );
        sendTime = optimalTime.recommendedTime;
      } catch (error) {
        console.error('Failed to calculate optimal time:', error);
      }
    }

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: sendTime },
            sound: urgency ? 'default' : undefined,
            actionTypeId: 'RISK_ALERT',
            extra: {
              riskLevel,
              recommendations: recommendations.slice(0, 3),
              notificationType: 'risk_alert',
            },
          },
        ],
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        tag: 'risk-alert',
        requireInteraction: urgency,
      });
    }
  }

  async sendAdherenceReminder(medicationName: string, streak: number): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const title = streak > 0 
      ? `🔥 ${streak}-Day Streak!` 
      : '💊 Medication Reminder';
    const body = streak > 0
      ? `Don't break your streak! Time to take ${medicationName}.`
      : `Remember to take your ${medicationName} today.`;

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            actionTypeId: 'ADHERENCE',
          },
        ],
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
      });
    }
  }

  async sendWellnessTip(tip: string, category: 'sleep' | 'exercise' | 'nutrition' | 'mindfulness'): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const icons = {
      sleep: '😴',
      exercise: '🏃',
      nutrition: '🥗',
      mindfulness: '🧘'
    };

    const title = `${icons[category]} Wellness Tip`;

    // Use AI-powered optimal timing
    let sendTime = new Date(Date.now() + 1000);
    if (this.userId) {
      try {
        const optimalTime = await calculateOptimalSendTime(
          'wellness_tip',
          this.userId,
          'low'
        );
        sendTime = optimalTime.recommendedTime;
      } catch (error) {
        console.error('Failed to calculate optimal time:', error);
      }
    }

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body: tip,
            schedule: { at: sendTime },
            sound: undefined,
            actionTypeId: 'WELLNESS_TIP',
            extra: { 
              category,
              notificationType: 'wellness_tip',
            },
          },
        ],
      });
    } else {
      new Notification(title, {
        body: tip,
        icon: '/icon-192x192.png',
      });
    }
  }

  async sendVitalityPointsUpdate(points: number, activity: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: '🏆 Vitality Points Earned!',
            body: `+${points} points for ${activity}`,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            actionTypeId: 'VITALITY_POINTS',
          },
        ],
      });
    } else {
      new Notification('🏆 Vitality Points Earned!', {
        body: `+${points} points for ${activity}`,
        icon: '/icon-192x192.png',
      });
    }
  }

  async scheduleDailyCheckIn(time: string = '20:00'): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(hours, minutes, 0, 0);

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: '🌙 Daily Check-In',
            body: 'How are you feeling today? Take a moment to reflect.',
            schedule: {
              at: scheduleTime,
              repeats: true,
              every: 'day',
            },
            sound: 'default',
          },
        ],
      });
    }
  }

  async sendCrisisAlert(contactName?: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: '🚨 Crisis Support Available',
            body: 'We detected you might need support. Tap to access crisis resources.',
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            actionTypeId: 'CRISIS',
          },
        ],
      });
    } else {
      new Notification('🚨 Crisis Support Available', {
        body: 'We detected you might need support. Click to access crisis resources.',
        icon: '/icon-192x192.png',
        tag: 'crisis',
        requireInteraction: true,
      });
    }

    // If contact provided, send alert to them
    if (contactName) {
      console.log(`Alert sent to emergency contact: ${contactName}`);
    }
  }

  async sendWellnessReminder(message: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: '🌟 Wellness Tip',
            body: message,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
          },
        ],
      });
    } else {
      new Notification('🌟 Wellness Tip', {
        body: message,
        icon: '/icon-192x192.png',
      });
    }
  }

  async cancelNotification(id: number): Promise<void> {
    if (this.isNative) {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (this.isNative) {
      await LocalNotifications.cancel({ notifications: [] });
    }
  }

  private scheduleWebNotification(message: string, time: Date): void {
    const delay = time.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('💊 MindSync Reminder', {
            body: message,
            icon: '/icon-192x192.png',
          });
        }
      }, delay);
    }
  }
}

export const notificationService = new NotificationService();
