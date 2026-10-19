/**
 * FloraHearth Notification & Reminder Service
 * Handles PWA desktop/mobile notifications for:
 * 1. Tasks due today
 * 2. Frost and hard-freeze warnings for sensitive garden crops
 */

import { GardenTask } from '../types/garden';

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
}

export function getNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }
  return { supported: true, permission: Notification.permission };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return false;
  }
}

export function sendLocalNotification(title: string, body: string): boolean {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'florahearth-garden-alert',
    });
    return true;
  } catch (e) {
    console.warn('Could not trigger Notification API:', e);
    return false;
  }
}

export function checkAndTriggerDueReminders(
  tasks: GardenTask[],
  tonightMinTemp?: number,
  frostLevel?: string
): { tasksCount: number; frostWarningSent: boolean } {
  if (typeof window === 'undefined') return { tasksCount: 0, frostWarningSent: false };

  const todayStr = new Date().toISOString().split('T')[0];
  const lastDateKey = 'florahearth_last_notification_date';
  const lastNotifiedDate = localStorage.getItem(lastDateKey);

  // Avoid repetitive notifications on the same date unless triggered manually
  if (lastNotifiedDate === todayStr) {
    return { tasksCount: 0, frostWarningSent: false };
  }

  let tasksCount = 0;
  let frostWarningSent = false;

  const dueTasks = tasks.filter(t => !t.completed && t.dueDate === todayStr);
  if (dueTasks.length > 0) {
    sendLocalNotification(
      `FloraHearth: ${dueTasks.length} Garden Task${dueTasks.length > 1 ? 's' : ''} Due Today`,
      dueTasks.slice(0, 3).map(t => `• ${t.title}`).join('\n')
    );
    tasksCount = dueTasks.length;
  }

  if (tonightMinTemp !== undefined && (frostLevel === 'frost' || frostLevel === 'hard-freeze' || tonightMinTemp <= 32)) {
    sendLocalNotification(
      `❄️ Frost Shield Alert (${Math.round(tonightMinTemp)}°F Tonight)`,
      'Freeze temperatures forecast tonight! Cover tender tomatoes, peppers, and squash with frost cloth before sundown.'
    );
    frostWarningSent = true;
  }

  if (tasksCount > 0 || frostWarningSent) {
    localStorage.setItem(lastDateKey, todayStr);
  }

  return { tasksCount, frostWarningSent };
}
