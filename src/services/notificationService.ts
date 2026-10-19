/**
 * FloraHearth Notification & Reminder Service
 * Local notifications for:
 * 1. Tasks due today
 * 2. Frost and hard-freeze nights when frost-tender crops are planted
 *
 * Notes:
 * - Android Chrome does not allow `new Notification()` from a page; it must
 *   go through the service worker registration, so that path is tried first.
 * - On iOS, notifications only work once the app is installed to the Home Screen.
 * - These fire when the app is opened; there is no server push.
 */

import { GardenTask } from '../types/garden';
import { localDateStr } from './dates';

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
}

const TASKS_NOTIFIED_KEY = 'florahearth_last_task_notification_date';
const FROST_NOTIFIED_KEY = 'florahearth_last_frost_notification_date';

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

/** Icon resolved against the page so it works under the /FloraHearth/ base path. */
function iconUrl(): string {
  try {
    return new URL('pwa-192x192.png', document.baseURI).href;
  } catch {
    return 'pwa-192x192.png';
  }
}

/**
 * Show a notification. Returns true only if one was actually shown, so the UI
 * never claims reminders work when the browser refused them.
 */
export async function sendLocalNotification(title: string, body: string, tag = 'florahearth-garden-alert'): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  const options: NotificationOptions = { body, icon: iconUrl(), badge: iconUrl(), tag };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, options);
        return true;
      }
    }
  } catch (e) {
    console.warn('Service worker notification failed, trying the page API:', e);
  }

  try {
    new Notification(title, options);
    return true;
  } catch (e) {
    console.warn('Could not show a notification:', e);
    return false;
  }
}

/** Once per day: notify about unfinished tasks due today. */
export async function checkAndTriggerDueReminders(tasks: GardenTask[]): Promise<number> {
  if (typeof window === 'undefined' || getNotificationStatus().permission !== 'granted') return 0;

  const todayStr = localDateStr();
  if (localStorage.getItem(TASKS_NOTIFIED_KEY) === todayStr) return 0;

  const dueTasks = tasks.filter(t => !t.completed && t.dueDate === todayStr);
  if (dueTasks.length === 0) return 0;

  const shown = await sendLocalNotification(
    `${dueTasks.length} garden task${dueTasks.length > 1 ? 's' : ''} due today`,
    dueTasks.slice(0, 3).map(t => `• ${t.title}`).join('\n') + (dueTasks.length > 3 ? `\n+${dueTasks.length - 3} more` : ''),
    'florahearth-tasks'
  );
  if (shown) localStorage.setItem(TASKS_NOTIFIED_KEY, todayStr);
  return shown ? dueTasks.length : 0;
}

/**
 * Once per day: warn about a frost night, but only when frost-tender crops are
 * actually planted outdoors and the forecast is real (not offline fallback data).
 */
export async function checkAndTriggerFrostAlert(
  frostLevel: 'none' | 'watch' | 'frost' | 'hard-freeze',
  tonightMinTemp: number,
  tenderCrops: string[],
  isRealForecast: boolean
): Promise<boolean> {
  if (typeof window === 'undefined' || getNotificationStatus().permission !== 'granted') return false;
  if (!isRealForecast || tenderCrops.length === 0) return false;
  if (frostLevel !== 'frost' && frostLevel !== 'hard-freeze') return false;

  const todayStr = localDateStr();
  if (localStorage.getItem(FROST_NOTIFIED_KEY) === todayStr) return false;

  const cropList = tenderCrops.slice(0, 4).join(', ') + (tenderCrops.length > 4 ? ' and more' : '');
  const shown = await sendLocalNotification(
    `${frostLevel === 'hard-freeze' ? 'Hard freeze' : 'Frost'} tonight: low of ${Math.round(tonightMinTemp)}°F`,
    `Cover ${cropList} before sundown.`,
    'florahearth-frost'
  );
  if (shown) localStorage.setItem(FROST_NOTIFIED_KEY, todayStr);
  return shown;
}
