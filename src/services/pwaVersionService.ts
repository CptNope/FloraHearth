/**
 * FloraHearth PWA Version Control, Hard Cache Reset & Theme Management Service
 */

export const APP_VERSION = '2.5.0';
export const BUILD_DATE = '2026-10-14';
export const APP_VERSION_STORAGE_KEY = 'florahearth_version';
export const THEME_STORAGE_KEY = 'florahearth_theme';

export type AppTheme = 'dark' | 'light';

// ==========================================
// 1. THEME MANAGEMENT (Dark mode default)
// ==========================================

export function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    // Dark mode is explicitly the default unless user chose 'light'
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const metaTheme = document.getElementById('theme-color-meta');

  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    if (metaTheme) metaTheme.setAttribute('content', '#0b1510');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    if (metaTheme) metaTheme.setAttribute('content', '#234730');
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('Unable to persist theme to localStorage', err);
  }
}

// ==========================================
// 2. CACHE STATS & STORAGE DETAILS
// ==========================================

export interface CacheStorageStats {
  cachesCount: number;
  cacheNames: string[];
  estimatedMb: number;
  localStorageKeysCount: number;
  localStorageKb: number;
  serviceWorkerActive: boolean;
  serviceWorkerScope?: string;
  appVersion: string;
}

export async function getStorageMetrics(): Promise<CacheStorageStats> {
  const result: CacheStorageStats = {
    cachesCount: 0,
    cacheNames: [],
    estimatedMb: 0,
    localStorageKeysCount: 0,
    localStorageKb: 0,
    serviceWorkerActive: false,
    appVersion: APP_VERSION,
  };

  // 1. Cache Storage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys();
      result.cachesCount = keys.length;
      result.cacheNames = keys;
    } catch (e) {
      console.warn('Error reading caches.keys()', e);
    }
  }

  // 2. Storage estimate
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        result.estimatedMb = parseFloat((estimate.usage / (1024 * 1024)).toFixed(2));
      }
    } catch (e) {
      console.warn('Error reading storage.estimate()', e);
    }
  }

  // 3. LocalStorage stats
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      result.localStorageKeysCount = localStorage.length;
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          totalBytes += k.length + (localStorage.getItem(k)?.length || 0);
        }
      }
      result.localStorageKb = parseFloat((totalBytes / 1024).toFixed(1));
    } catch (e) {
      console.warn('Error reading localStorage stats', e);
    }
  }

  // 4. Service Worker Registration
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.active) {
        result.serviceWorkerActive = true;
        result.serviceWorkerScope = reg.scope;
      }
    } catch (e) {
      console.warn('Error checking SW registration', e);
    }
  }

  return result;
}

// ==========================================
// 3. HARD CACHE RESET & REFRESH
// ==========================================

export interface HardResetOptions {
  preserveGardenData: boolean; // if true, keeps gardens, journal, etc.
}

export async function executeHardCacheReset(options: HardResetOptions = { preserveGardenData: true }): Promise<void> {
  console.log('[FloraHearth] Executing Hard Cache Reset...');

  // 1. Back up data if preserving
  let backupData: Record<string, string> = {};
  if (options.preserveGardenData && typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('florahearth_')) {
          backupData[key] = localStorage.getItem(key) || '';
        }
      }
    } catch (e) {
      console.warn('Error backing up storage before reset', e);
    }
  }

  // 2. Purge all CacheStorage caches
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          console.log(`[Hard Reset] Deleting cache: ${name}`);
          return caches.delete(name);
        })
      );
    } catch (e) {
      console.warn('Error deleting caches', e);
    }
  }

  // 3. Unregister all service workers
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((reg) => {
          console.log(`[Hard Reset] Unregistering service worker scope: ${reg.scope}`);
          return reg.unregister();
        })
      );
    } catch (e) {
      console.warn('Error unregistering service workers', e);
    }
  }

  // 4. Clear Session Storage
  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn('Error clearing sessionStorage', e);
  }

  // 5. Restore or clear localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (!options.preserveGardenData) {
        localStorage.clear();
      } else {
        localStorage.clear();
        Object.entries(backupData).forEach(([k, v]) => {
          localStorage.setItem(k, v);
        });
      }
      // Set updated version token
      localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
    } catch (e) {
      console.warn('Error resetting localStorage', e);
    }
  }

  // 6. Force reload from server, bypassing browser cache
  setTimeout(() => {
    // Add cache-busting query parameter to force fresh load from server
    const url = new URL(window.location.href);
    url.searchParams.set('v_reset', Date.now().toString());
    window.location.replace(url.toString());
  }, 300);
}

// ==========================================
// 4. PWA INSTALL & ENVIRONMENT CHECKS
// ==========================================

let deferredInstallPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-installable-changed', { detail: { installable: true } }));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installable-changed', { detail: { installable: false } }));
    console.log('[FloraHearth] App successfully installed as PWA');
  });
}

export function isAppInstallable(): boolean {
  return !!deferredInstallPrompt;
}

export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;
  try {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return outcome === 'accepted';
  } catch (err) {
    console.warn('Error showing PWA install prompt', err);
    return false;
  }
}

export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}
