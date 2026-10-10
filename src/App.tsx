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

  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(!isSetupComplete());
  const [isTroubleshooterOpen, setIsTroubleshooterOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#fbfbf9] text-[#242b26] flex flex-col font-sans-botanical pb-20 lg:pb-12">
      {/* Top Header & Nav */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        location={location}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white/60 py-6 px-4 sm:px-6 text-center text-xs text-stone-500 space-y-1">
        <p className="font-serif-botanical font-medium text-stone-700">
          FloraHearth · Complete Lifecycle US Garden &amp; Food Preservation Companion
        </p>
        <p className="text-[11px] text-stone-400">
          Data synthesized from USDA Agricultural Research Service, National Center for Home Food Preservation (NCHFP), and University Cooperative Extension Services.
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
    </div>
  );
}
