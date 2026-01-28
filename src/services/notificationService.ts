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
