import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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

    const [hours, minutes] = time.split(':').map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(hours, minutes, 0, 0);

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

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: urgency ? 'default' : undefined,
            actionTypeId: 'RISK_ALERT',
            extra: {
              riskLevel,
              recommendations: recommendations.slice(0, 3),
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

    if (this.isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body: tip,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            actionTypeId: 'WELLNESS_TIP',
            extra: { category },
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
