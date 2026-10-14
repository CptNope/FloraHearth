/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GardenLocation, UserPreferences, GardenSpace, GardenTask, PantryItem, JournalEntry, ExpenseRecord, SoilTestRecord } from './types/garden';
import {
  getSavedLocation, saveLocation,
  getSavedPreferences, savePreferences,
  getSavedSpaces, saveSpaces,
  getSavedTasks, saveTasks,
  getSavedPantry, savePantry,
  getSavedJournal, saveJournal,
  getSavedExpenses, saveExpenses,
  getSavedSoilTests, saveSoilTests,
  isSetupComplete, setSetupComplete
} from './services/storage';

import { getInitialTheme, applyTheme, AppTheme, APP_VERSION, executeHardCacheReset } from './services/pwaVersionService';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { GardenPlanner } from './components/GardenPlanner';
import { CropLibrary } from './components/CropLibrary';
import { CalendarTasks } from './components/CalendarTasks';
import { CompanionEcology } from './components/CompanionEcology';
import { PreservationTracker } from './components/PreservationTracker';
import { PantryTracker } from './components/PantryTracker';
import { PestSoilHealth } from './components/PestSoilHealth';
import { HydroIndoorGuide } from './components/HydroIndoorGuide';
import { JournalSavings } from './components/JournalSavings';
import { SetupModal } from './components/SetupModal';
import { TroubleshooterModal } from './components/TroubleshooterModal';
import { VersionCacheModal } from './components/VersionCacheModal';
import { WeatherAlmanac } from './components/WeatherAlmanac';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RefreshCw, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [location, setLocation] = useState<GardenLocation>(getSavedLocation);
  const [preferences, setPreferences] = useState<UserPreferences>(getSavedPreferences);
  const [spaces, setSpaces] = useState<GardenSpace[]>(getSavedSpaces);
  const [tasks, setTasks] = useState<GardenTask[]>(getSavedTasks);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(getSavedPantry);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(getSavedJournal);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(getSavedExpenses);
  const [soilTests, setSoilTests] = useState<SoilTestRecord[]>(getSavedSoilTests);

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

  const handleAddPantryItem = (item: PantryItem) => {
    const updated = [item, ...pantryItems];
    setPantryItems(updated);
    savePantry(updated);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    saveJournal(updated);
  };

  const handleAddExpense = (exp: ExpenseRecord) => {
    const updated = [exp, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleAddSoilTest = (test: SoilTestRecord) => {
    const updated = [test, ...soilTests];
    setSoilTests(updated);
    saveSoilTests(updated);
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
          className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-md z-50 animate-fadeIn"
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
      <main id="main-content" tabIndex={-1} role="main" aria-label="Garden and pantry main content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8 outline-hidden">
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
          />
        )}

        {activeTab === 'planner' && (
          <GardenPlanner
            spaces={spaces}
            onUpdateSpaces={handleUpdateSpaces}
          />
        )}

        {activeTab === 'crops' && (
          <CropLibrary
            onSelectForPlanner={() => setActiveTab('planner')}
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
          />
        )}

        {activeTab === 'soil' && (
          <PestSoilHealth
            soilTests={soilTests}
            onAddSoilTest={handleAddSoilTest}
          />
        )}

        {activeTab === 'hydro' && (
          <HydroIndoorGuide />
        )}

        {activeTab === 'journal' && (
          <JournalSavings
            journalEntries={journalEntries}
            onAddJournalEntry={handleAddJournalEntry}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDataImportSuccess={handleReloadAllState}
          />
        )}
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
            className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#182b21] text-emerald-700 dark:text-emerald-400 border border-stone-200/80 dark:border-[#243d2f] hover:underline"
          >
            <Layers className="w-3 h-3" />
            <span>v{APP_VERSION} (PWA Cache Control)</span>
          </button>
        </div>
        <p className="text-[11px] text-stone-400 dark:text-stone-400 max-w-2xl mx-auto">
          Built for offline PWA installation and GitHub Pages deployment. Data synthesized from USDA ARS, National Center for Home Food Preservation (NCHFP), and University Cooperative Extension Services.
        </p>
      </footer>

      {/* Setup Wizard Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentLocation={location}
        currentPreferences={preferences}
        onSave={handleUpdateLocationAndPrefs}
      />

      {/* Diagnostic Troubleshooter Modal */}
      <TroubleshooterModal
        isOpen={isTroubleshooterOpen}
        onClose={() => setIsTroubleshooterOpen(false)}
      />

      {/* PWA Version & Hard Cache Reset Modal */}
      <VersionCacheModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onReloadRequested={handleReloadAllState}
      />
    </div>
    </ErrorBoundary>
  );
}
