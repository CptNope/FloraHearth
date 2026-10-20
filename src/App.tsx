/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import {
  GardenLocation,
  UserPreferences,
  GardenSpace,
  GardenTask,
  PantryItem,
  JournalEntry,
  ExpenseRecord,
  SoilTestRecord,
  HydroWaterRecord,
  SeedPacket,
} from './types/garden';
import {
  getSavedLocation, saveLocation,
  getSavedPreferences, savePreferences,
  getSavedSpaces, saveSpaces,
  getSavedTasks, saveTasks,
  getSavedPantry, savePantry,
  getSavedJournal, saveJournal,
  getSavedExpenses, saveExpenses,
  getSavedSoilTests, saveSoilTests,
  getSavedHydroTests, saveHydroTests,
  getSavedSeeds, saveSeeds,
  isSetupComplete, setSetupComplete,
  STORAGE_ERROR_EVENT, StorageErrorKind, requestPersistentStorage, hasUserSavedData, requestOpenBackup
} from './services/storage';

import { getInitialTheme, applyTheme, AppTheme, APP_VERSION, executeHardCacheReset } from './services/pwaVersionService';
import { checkAndTriggerDueReminders, checkAndTriggerFrostAlert, getNotificationStatus } from './services/notificationService';
import { fetchWeatherAndAlmanac } from './services/weatherAlmanacService';
import { getTenderCropsByBed } from './services/frostTender';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { tabFromLocation, urlForTab, isKnownTab, titleForTab } from './services/tabRouting';

// Tabs and dialogs load on first use (precached by the service worker for offline use)
const GardenPlanner = lazy(() => import('./components/GardenPlanner').then(m => ({ default: m.GardenPlanner })));
const CropLibrary = lazy(() => import('./components/CropLibrary').then(m => ({ default: m.CropLibrary })));
const CalendarTasks = lazy(() => import('./components/CalendarTasks').then(m => ({ default: m.CalendarTasks })));
const CompanionEcology = lazy(() => import('./components/CompanionEcology').then(m => ({ default: m.CompanionEcology })));
const PreservationTracker = lazy(() => import('./components/PreservationTracker').then(m => ({ default: m.PreservationTracker })));
const PantryTracker = lazy(() => import('./components/PantryTracker').then(m => ({ default: m.PantryTracker })));
const PestSoilHealth = lazy(() => import('./components/PestSoilHealth').then(m => ({ default: m.PestSoilHealth })));
const HydroIndoorGuide = lazy(() => import('./components/HydroIndoorGuide').then(m => ({ default: m.HydroIndoorGuide })));
const JournalSavings = lazy(() => import('./components/JournalSavings').then(m => ({ default: m.JournalSavings })));
const WeatherAlmanac = lazy(() => import('./components/WeatherAlmanac').then(m => ({ default: m.WeatherAlmanac })));
const SetupModal = lazy(() => import('./components/SetupModal').then(m => ({ default: m.SetupModal })));
const TroubleshooterModal = lazy(() => import('./components/TroubleshooterModal').then(m => ({ default: m.TroubleshooterModal })));
const VersionCacheModal = lazy(() => import('./components/VersionCacheModal').then(m => ({ default: m.VersionCacheModal })));
import { RefreshCw, Sparkles, Layers, ShieldCheck, AlertTriangle, X } from 'lucide-react';

function TabLoading() {
  return (
    <div role="status" className="flex items-center justify-center min-h-[300px] text-xs text-stone-600 dark:text-stone-300 gap-2">
      <span className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-600 animate-spin" aria-hidden="true" />
      Loading…
    </div>
  );
}

export default function App() {
  // Honor the documented PWA shortcuts and JAT-OS deep links (?tab=planner/crops/calendar);
  // every tab id is linkable. Unknown values fall back to the Dashboard.
  const [activeTab, setActiveTabState] = useState<string>(() => tabFromLocation());
  const focusHeadingOnChange = useRef(false);

  // Changing tabs: push a history entry (Back/Forward work, reload keeps the tab)
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const setActiveTab = useCallback((tab: string) => {
    if (!isKnownTab(tab) || tab === activeTabRef.current) return;
    focusHeadingOnChange.current = true;
    try { window.history.pushState({ tab }, '', urlForTab(tab)); } catch { /* sandboxed iframe */ }
    setActiveTabState(tab);
  }, []);

  useEffect(() => {
    const onPop = () => { focusHeadingOnChange.current = true; setActiveTabState(tabFromLocation()); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Each tab gets its own document title, and keyboard / screen-reader users
  // land on the new tab's heading instead of staying on the nav button.
  useEffect(() => {
    document.title = titleForTab(activeTab);
    if (!focusHeadingOnChange.current) return;
    focusHeadingOnChange.current = false;
    window.scrollTo({ top: 0 });
    let frames = 0;
    let raf = 0;
    const focusHeading = () => {
      // Tabs load lazily: wait (up to ~2s) for the tab's <h1> to render
      const h1 = document.querySelector<HTMLElement>('#main-content h1');
      if (h1) {
        if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      } else if (frames++ < 120) {
        raf = requestAnimationFrame(focusHeading);
      }
    };
    raf = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(raf);
  }, [activeTab]);
  const [location, setLocation] = useState<GardenLocation>(getSavedLocation);
  const [preferences, setPreferences] = useState<UserPreferences>(getSavedPreferences);
  const [spaces, setSpaces] = useState<GardenSpace[]>(getSavedSpaces);
  const [tasks, setTasks] = useState<GardenTask[]>(getSavedTasks);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(getSavedPantry);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(getSavedJournal);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(getSavedExpenses);
  const [soilTests, setSoilTests] = useState<SoilTestRecord[]>(getSavedSoilTests);
  const [hydroRecords, setHydroRecords] = useState<HydroWaterRecord[]>(getSavedHydroTests);
  const [seeds, setSeeds] = useState<SeedPacket[]>(getSavedSeeds);

  // Garden setup is NOT forced on initial load; sample garden is ready immediately
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isTroubleshooterOpen, setIsTroubleshooterOpen] = useState<boolean>(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);

  // Theme: Dark Mode is DEFAULT
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Apply current theme
    applyTheme(theme);

    // Listen for Service Worker updates
    const onUpdate = () => setSwUpdateAvailable(true);
    window.addEventListener('florahearth-sw-update-available', onUpdate);
    return () => window.removeEventListener('florahearth-sw-update-available', onUpdate);
  }, [theme]);

  // Failed saves (storage full or blocked) must be visible, not silent
  const [storageError, setStorageError] = useState<StorageErrorKind | null>(null);
  useEffect(() => {
    const onErr = (e: Event) => setStorageError((e as CustomEvent<{ kind: StorageErrorKind }>).detail.kind);
    window.addEventListener(STORAGE_ERROR_EVENT, onErr);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, onErr);
  }, []);

  // Installed apps hold a season of data: ask the browser not to evict it.
  // (In a browser tab this is offered from Journal & ROI > Sync & Backup,
  // because some browsers show a permission prompt.)
  useEffect(() => {
    const installed = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    if (installed && hasUserSavedData()) void requestPersistentStorage();
  }, []);

  // Local reminders for tasks due today (at most once per day)
  useEffect(() => {
    void checkAndTriggerDueReminders(tasks);
  }, [tasks]);

  // Frost-night alert when tender crops are planted (at most once per day).
  // Only runs when notifications are allowed; the weather service caches its
  // forecast, so this does not add a request on every launch.
  useEffect(() => {
    if (getNotificationStatus().permission !== 'granted') return;
    const tender = getTenderCropsByBed(spaces).flatMap(b => b.crops);
    if (tender.length === 0) return;
    let cancelled = false;
    fetchWeatherAndAlmanac(location)
      .then(data => {
        if (cancelled) return;
        const fw = data.indices.frostWarning;
        void checkAndTriggerFrostAlert(fw.level, fw.tonightMinTemp, Array.from(new Set(tender)), !data.isMockOrFallback);
      })
      .catch(() => { /* offline: nothing to alert on */ });
    return () => { cancelled = true; };
  }, [location, spaces]);

  const handleToggleTheme = () => {
    const nextTheme: AppTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const handleTriggerSwUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        await executeHardCacheReset({ preserveGardenData: true });
      }
    } else {
      window.location.reload();
    }
  };

  // Sync state changes with persistence
  const handleUpdateLocationAndPrefs = (loc: GardenLocation, pref: UserPreferences) => {
    setLocation(loc);
    setPreferences(pref);
    saveLocation(loc);
    savePreferences(pref);
    setSetupComplete(true);
  };

  const handleUpdateSpaces = (newSpaces: GardenSpace[]) => {
    setSpaces(newSpaces);
    saveSpaces(newSpaces);
  };

  const handleUpdateTasks = (newTasks: GardenTask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // Pantry handlers: Add, Edit, Delete, Use 1 Jar
  const handleAddPantryItem = (item: PantryItem) => {
    const updated = [item, ...pantryItems];
    setPantryItems(updated);
    savePantry(updated);
  };

  const handleUpdatePantryItem = (updatedItem: PantryItem) => {
    const updated = pantryItems.map(p => p.id === updatedItem.id ? updatedItem : p);
    setPantryItems(updated);
    savePantry(updated);
  };

  const handleDeletePantryItem = (id: string) => {
    const updated = pantryItems.filter(p => p.id !== id);
    setPantryItems(updated);
    savePantry(updated);
  };

  const handleUseOneJar = (id: string) => {
    const item = pantryItems.find(p => p.id === id);
    if (!item) return;
    if (item.quantity <= 1) {
      if (window.confirm(`You're using the last ${item.unit} of "${item.cropName}". Remove it from your pantry inventory?`)) {
        handleDeletePantryItem(id);
      }
    } else {
      handleUpdatePantryItem({ ...item, quantity: item.quantity - 1 });
    }
  };

  // Journal handlers: Add, Edit, Delete
  const handleAddJournalEntry = (entry: JournalEntry) => {
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    saveJournal(updated);
  };

  const handleUpdateJournalEntry = (updatedEntry: JournalEntry) => {
    const updated = journalEntries.map(j => j.id === updatedEntry.id ? updatedEntry : j);
    setJournalEntries(updated);
    saveJournal(updated);
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = journalEntries.filter(j => j.id !== id);
    setJournalEntries(updated);
    saveJournal(updated);
  };

  // Expense handlers: Add, Edit, Delete
  const handleAddExpense = (exp: ExpenseRecord) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleUpdateExpense = (updatedExp: ExpenseRecord) => {
    const updated = expenses.map(e => e.id === updatedExp.id ? updatedExp : e);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  // Soil test handlers: Add, Edit, Delete
  const handleAddSoilTest = (test: SoilTestRecord) => {
    const updated = [test, ...soilTests];
    setSoilTests(updated);
    saveSoilTests(updated);
  };

  const handleUpdateSoilTest = (updatedTest: SoilTestRecord) => {
    const updated = soilTests.map(s => s.id === updatedTest.id ? updatedTest : s);
    setSoilTests(updated);
    saveSoilTests(updated);
  };

  const handleDeleteSoilTest = (id: string) => {
    const updated = soilTests.filter(s => s.id !== id);
    setSoilTests(updated);
    saveSoilTests(updated);
  };

  // Hydroponic record handlers: Add, Edit, Delete
  const handleAddHydroRecord = (rec: HydroWaterRecord) => {
    const updated = [rec, ...hydroRecords];
    setHydroRecords(updated);
    saveHydroTests(updated);
  };

  const handleUpdateHydroRecord = (updatedRec: HydroWaterRecord) => {
    const updated = hydroRecords.map(h => h.id === updatedRec.id ? updatedRec : h);
    setHydroRecords(updated);
    saveHydroTests(updated);
  };

  const handleDeleteHydroRecord = (id: string) => {
    const updated = hydroRecords.filter(h => h.id !== id);
    setHydroRecords(updated);
    saveHydroTests(updated);
  };

  // Seed inventory handlers: Add, Edit, Delete
  const handleAddSeed = (seed: SeedPacket) => {
    const updated = [seed, ...seeds];
    setSeeds(updated);
    saveSeeds(updated);
  };

  const handleUpdateSeed = (updatedSeed: SeedPacket) => {
    const updated = seeds.map(s => s.id === updatedSeed.id ? updatedSeed : s);
    setSeeds(updated);
    saveSeeds(updated);
  };

  const handleDeleteSeed = (id: string) => {
    const updated = seeds.filter(s => s.id !== id);
    setSeeds(updated);
    saveSeeds(updated);
  };

  const handleReloadAllState = () => {
    setLocation(getSavedLocation());
    setPreferences(getSavedPreferences());
    setSpaces(getSavedSpaces());
    setTasks(getSavedTasks());
    setPantryItems(getSavedPantry());
    setJournalEntries(getSavedJournal());
    setExpenses(getSavedExpenses());
    setSoilTests(getSavedSoilTests());
    setHydroRecords(getSavedHydroTests());
    setSeeds(getSavedSeeds());
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#fbfbf9] text-[#242b26] dark:bg-[#0b1510] dark:text-[#ecfdf5] flex flex-col font-sans-botanical pb-20 lg:pb-12 transition-colors duration-200">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
      >
        Skip to main content
      </a>

      {/* PWA Update Banner */}
      {swUpdateAvailable && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-700 dark:bg-emerald-800 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-md z-50 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" aria-hidden="true" />
            <span>A new version of FloraHearth (v{APP_VERSION}) is available with updated features!</span>
          </div>
          <button
            type="button"
            onClick={handleTriggerSwUpdate}
            aria-label="Update to latest version now"
            className="px-3 py-1 bg-white text-emerald-950 font-bold rounded-lg hover:bg-emerald-100 transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Update Now</span>
          </button>
        </div>
      )}

      {storageError && (
        <div role="alert" className="bg-rose-700 text-white px-4 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Your last change wasn&apos;t saved on this device.</strong>{' '}
              {storageError === 'quota'
                ? 'Browser storage for FloraHearth is full.'
                : 'This browser is blocking storage (private browsing or site data turned off).'}{' '}
              It will be lost when you close the app. Download a backup now.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { requestOpenBackup(); setActiveTab('journal'); }}
              className="px-3 py-1 bg-white text-rose-900 font-bold rounded-lg hover:bg-rose-50"
            >
              Back up my data
            </button>
            <button type="button" onClick={() => setStorageError(null)} aria-label="Dismiss storage warning" className="p-1 rounded-lg hover:bg-white/15">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Nav */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        location={location}
        onOpenSetup={() => setIsSetupOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenVersionModal={() => setIsVersionModalOpen(true)}
        onOpenTroubleshooter={() => setIsTroubleshooterOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main id="main-content" tabIndex={-1} role="main" aria-label="Garden and pantry main content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8 outline-hidden">
        <Suspense fallback={<TabLoading />}>
        {activeTab === 'dashboard' && (
          <Dashboard
            location={location}
            spaces={spaces}
            tasks={tasks}
            pantryItems={pantryItems}
            onNavigate={setActiveTab}
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenTroubleshooter={() => setIsTroubleshooterOpen(true)}
          />
        )}

        {activeTab === 'weather-almanac' && (
          <WeatherAlmanac
            location={location}
            onUpdateLocation={(newLoc) => {
              setLocation(newLoc);
              saveLocation(newLoc);
            }}
            onOpenSetup={() => setIsSetupOpen(true)}
            spaces={spaces}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'planner' && (
          <GardenPlanner
            spaces={spaces}
            onUpdateSpaces={handleUpdateSpaces}
            location={location}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'crops' && (
          <CropLibrary
            onSelectForPlanner={() => setActiveTab('planner')}
            seeds={seeds}
            onAddSeed={handleAddSeed}
            onUpdateSeed={handleUpdateSeed}
            onDeleteSeed={handleDeleteSeed}
            location={location}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTasks
            location={location}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
          />
        )}

        {activeTab === 'companions' && (
          <CompanionEcology />
        )}

        {activeTab === 'preservation' && (
          <PreservationTracker
            location={location}
            pantryItems={pantryItems}
            onAddPantryItem={handleAddPantryItem}
          />
        )}

        {activeTab === 'pantry' && (
          <PantryTracker
            pantryItems={pantryItems}
            preferences={preferences}
            onAddPantryItem={handleAddPantryItem}
            onUpdatePantryItem={handleUpdatePantryItem}
            onDeletePantryItem={handleDeletePantryItem}
            onUseOneJar={handleUseOneJar}
          />
        )}

        {activeTab === 'soil' && (
          <PestSoilHealth
            soilTests={soilTests}
            onAddSoilTest={handleAddSoilTest}
            onUpdateSoilTest={handleUpdateSoilTest}
            onDeleteSoilTest={handleDeleteSoilTest}
          />
        )}

        {activeTab === 'hydro' && (
          <HydroIndoorGuide
            hydroRecords={hydroRecords}
            onAddHydroRecord={handleAddHydroRecord}
            onUpdateHydroRecord={handleUpdateHydroRecord}
            onDeleteHydroRecord={handleDeleteHydroRecord}
          />
        )}

        {activeTab === 'journal' && (
          <JournalSavings
            journalEntries={journalEntries}
            onAddJournalEntry={handleAddJournalEntry}
            onUpdateJournalEntry={handleUpdateJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onDataImportSuccess={handleReloadAllState}
            onAddPantryItem={handleAddPantryItem}
            onNavigateToTab={setActiveTab}
          />
        )}
        </Suspense>
      </main>

      {/* Footer with Version Control & Hard Cache Reset Link */}
      <footer className="mt-auto border-t border-stone-200 dark:border-[#243d2f] bg-white/60 dark:bg-[#122119]/60 py-6 px-4 sm:px-6 text-center text-xs text-stone-500 dark:text-stone-400 space-y-2 transition-colors">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-serif-botanical font-semibold text-stone-700 dark:text-stone-200">
            FloraHearth
          </span>
          <span>·</span>
          <span>Complete Lifecycle US Garden, Harvest &amp; Food Preservation Companion</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setIsVersionModalOpen(true)}
            className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#182b21] text-emerald-700 dark:text-emerald-400 border border-stone-200/80 dark:border-[#243d2f] hover:underline"
          >
            <Layers className="w-3 h-3" />
            <span>v{APP_VERSION} (PWA Cache Control)</span>
          </button>
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-400 max-w-2xl mx-auto">
          Built for offline PWA installation and GitHub Pages deployment. Data synthesized from USDA ARS, National Center for Home Food Preservation (NCHFP), and University Cooperative Extension Services.
        </p>
      </footer>

      {/* Setup Wizard Modal */}
      {isSetupOpen && <Suspense fallback={null}><SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentLocation={location}
        currentPreferences={preferences}
        onSave={handleUpdateLocationAndPrefs}
      /></Suspense>}

      {/* Diagnostic Troubleshooter Modal */}
      {isTroubleshooterOpen && <Suspense fallback={null}><TroubleshooterModal
        isOpen={isTroubleshooterOpen}
        onClose={() => setIsTroubleshooterOpen(false)}
      /></Suspense>}

      {/* PWA Version & Hard Cache Reset Modal */}
      {isVersionModalOpen && <Suspense fallback={null}><VersionCacheModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onReloadRequested={handleReloadAllState}
      /></Suspense>}
    </div>
    </ErrorBoundary>
  );
}
