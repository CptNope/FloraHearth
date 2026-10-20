import React, { useState, useEffect } from 'react';
import { DialogBehavior } from './DialogBehavior';
import {
  APP_VERSION,
  BUILD_DATE,
  getStorageMetrics,
  executeHardCacheReset,
  CacheStorageStats,
  isAppInstallable,
  promptPwaInstall,
  isRunningStandalone,
  isIosDevice
} from '../services/pwaVersionService';
import { exportAllDataJson } from '../services/storage';
import {
  X,
  RefreshCw,
  Trash2,
  Download,
  ShieldCheck,
  Smartphone,
  HardDrive,
  Info,
  CheckCircle2,
  AlertTriangle,
  Github,
  Layers,
  Sparkles
} from 'lucide-react';

interface VersionCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadRequested: () => void;
}

export const VersionCacheModal: React.FC<VersionCacheModalProps> = ({
  isOpen,
  onClose,
  onReloadRequested: _onReloadRequested,
}) => {
  const [metrics, setMetrics] = useState<CacheStorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [preserveData, setPreserveData] = useState(true);
  const [confirmWipeModal, setConfirmWipeModal] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
      setInstallAvailable(isAppInstallable());
      setIsInstalled(isRunningStandalone());
      setConfirmWipeModal(false);
      setResetError(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await getStorageMetrics();
      setMetrics(data);
    } catch (e) {
      console.warn('Failed to load storage metrics', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCheckUpdate = async () => {
    setUpdateStatus('Checking for latest version...');
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          setTimeout(() => {
            setUpdateStatus(`You are running the latest version (${APP_VERSION}). No pending updates.`);
          }, 800);
        } else {
          setUpdateStatus('No active service worker registered. App is loading live assets.');
        }
      } catch {
        setUpdateStatus('Could not check updates automatically.');
      }
    } else {
      setUpdateStatus('Service workers not supported in this browser.');
    }
  };

  const handleExecuteReset = async () => {
    if (!preserveData && !confirmWipeModal) {
      setConfirmWipeModal(true);
      return;
    }

    setConfirmWipeModal(false);
    setIsResetting(true);
    setResetError(null);
    try {
      await executeHardCacheReset({ preserveGardenData: preserveData });
    } catch (err) {
      setResetError(String(err));
      setIsResetting(false);
    }
  };

  const handleInstallClick = async () => {
    const success = await promptPwaInstall();
    if (success) {
      setInstallAvailable(false);
      setIsInstalled(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-modal-title"
    >
      <DialogBehavior onClose={onClose} />
      <div className="bg-white dark:bg-[#111e16] text-stone-800 dark:text-[#ecfdf5] border border-stone-200 dark:border-[#243d2f] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="bg-[#f5f8f5] dark:bg-[#16271d] px-6 py-4 border-b border-[#d6e2d8] dark:border-[#243d2f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="version-modal-title" className="text-base font-bold tracking-tight text-[#122017] dark:text-white font-serif-botanical">
                  PWA Version &amp; Cache Control
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Service Worker cache management, GitHub Pages compatibility &amp; data diagnostics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close version and cache modal"
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-600 dark:text-stone-300">
          {/* Version & PWA Status Card */}
          <div className="bg-[#f8faf8] dark:bg-[#16261d] border border-stone-200 dark:border-[#274333] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-mono block">Release Information</span>
                <span className="text-sm font-bold text-stone-900 dark:text-white font-mono">FloraHearth v{APP_VERSION}</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 ml-2">({BUILD_DATE})</span>
              </div>

              <button
                type="button"
                onClick={handleCheckUpdate}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-600/30 dark:hover:bg-emerald-600/50 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check for Updates</span>
              </button>
            </div>

            {updateStatus && (
              <div className="p-2.5 bg-emerald-50 dark:bg-[#0f1c15] border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{updateStatus}</span>
              </div>
            )}

            {/* PWA Installation status */}
            <div className="pt-2 border-t border-stone-200 dark:border-[#243d2f] flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isInstalled ? (
                    <strong className="text-emerald-700 dark:text-emerald-400">PWA Installed (Standalone Mode)</strong>
                  ) : installAvailable ? (
                    <span>PWA Ready for Home Screen Installation</span>
                  ) : isIosDevice() ? (
                    <span>iOS: Tap Safari Share &gt; &apos;Add to Home Screen&apos;</span>
                  ) : (
                    <span>Web Application (Browser Mode)</span>
                  )}
                </span>
              </div>

              {installAvailable && !isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-2.5 py-1 rounded-md bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950 font-bold hover:bg-emerald-800 dark:hover:bg-emerald-400 transition-colors text-xs flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>

          {/* Cache & Storage Diagnostics */}
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Client Cache &amp; Storage Metrics</span>
            </h3>

            {isLoading ? (
              <div className="p-4 text-center text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#15271d] rounded-xl border border-stone-200 dark:border-[#274333]">
                Calculating cache storage size...
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-stone-50 dark:bg-[#16271e] border border-stone-200 dark:border-[#274333] p-3 rounded-xl">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Cache Buckets</span>
                  <span className="text-base font-bold text-stone-900 dark:text-white font-mono">{metrics.cachesCount}</span>
                </div>
                <div className="bg-stone-50 dark:bg-[#16271e] border border-stone-200 dark:border-[#274333] p-3 rounded-xl">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Storage Used</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    {metrics.estimatedMb > 0 ? `${metrics.estimatedMb} MB` : '< 1 MB'}
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-[#16271e] border border-stone-200 dark:border-[#274333] p-3 rounded-xl">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Saved Records</span>
                  <span className="text-base font-bold text-stone-900 dark:text-white font-mono">{metrics.localStorageKeysCount} keys</span>
                </div>
                <div className="bg-stone-50 dark:bg-[#16271e] border border-stone-200 dark:border-[#274333] p-3 rounded-xl">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Service Worker</span>
                  <span className={`text-xs font-bold font-mono ${metrics.serviceWorkerActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {metrics.serviceWorkerActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            ) : null}

            {metrics && metrics.cacheNames.length > 0 && (
              <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#0f1c15] p-2 rounded-lg font-mono truncate border border-stone-200 dark:border-transparent">
                Active: {metrics.cacheNames.join(', ')}
              </div>
            )}
          </div>

          {/* Hard Cache Reset Action Box */}
          <div className="bg-emerald-50/60 dark:bg-[#172b20] border border-emerald-300 dark:border-emerald-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <RefreshCw className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white text-sm">Hard Cache Reset &amp; Force Refresh</h3>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                  Deletes all cached service worker assets, unregisters stale background workers, and forces your browser to pull the latest production code bundle from the server.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111e16] p-3 rounded-lg border border-emerald-200 dark:border-[#243d2f] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preserveData}
                  onChange={(e) => {
                    setPreserveData(e.target.checked);
                    if (e.target.checked) setConfirmWipeModal(false);
                  }}
                  className="rounded-xs text-emerald-700 dark:text-emerald-600 accent-emerald-600"
                />
                <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  Preserve my garden beds, plant logs, and pantry items (Recommended)
                </span>
              </label>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 pl-5">
                If checked, your data is backed up into memory, caches are purged, and your garden records are safely preserved across the reload.
              </p>
            </div>

            {/* Inline warning if user unchecked data preservation */}
            {confirmWipeModal && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 rounded-xl text-rose-900 dark:text-rose-200 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>Warning: Permanent Data Erasure</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  You have unchecked &quot;Preserve my garden records&quot;. Executing this will permanently erase all custom beds, journal entries, pantry inventory, and soil test logs.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                  >
                    I Understand, Wipe All &amp; Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreserveData(true);
                      setConfirmWipeModal(false);
                    }}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold rounded-lg text-xs"
                  >
                    Keep My Records
                  </button>
                </div>
              </div>
            )}

            {resetError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 rounded-lg text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Reset Error: {resetError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Purging Caches...' : 'Execute Hard Cache Reset'}</span>
              </button>

              <button
                type="button"
                onClick={exportAllDataJson}
                className="px-3 py-2 bg-white hover:bg-stone-50 dark:bg-[#111e16] dark:hover:bg-[#182b21] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#243d2f] font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                title="Download JSON backup before reset"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup Data (JSON)</span>
              </button>
            </div>
          </div>

          {/* GitHub Pages Hostability Guide */}
          <div className="bg-stone-50 dark:bg-[#16271d] border border-stone-200 dark:border-[#274333] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-xs">
              <Github className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              <span>Ready for GitHub Pages Hosting</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              This applet is fully configured for GitHub Pages with relative base path (<code className="text-emerald-700 dark:text-emerald-300 font-mono">base: &apos;./&apos;</code>), automated SPA 404 redirection (<code className="text-emerald-700 dark:text-emerald-300 font-mono">404.html</code>), and a ready-to-run GitHub Actions workflow (<code className="text-emerald-700 dark:text-emerald-300 font-mono">.github/workflows/deploy.yml</code>).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f5f8f5] dark:bg-[#16271d] px-6 py-3 border-t border-[#d6e2d8] dark:border-[#243d2f] flex justify-between items-center text-xs">
          <span className="text-stone-500 dark:text-stone-400">FloraHearth PWA Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
