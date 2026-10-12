import React, { useState } from 'react';
import { GardenLocation } from '../types/garden';
import { APP_VERSION, AppTheme } from '../services/pwaVersionService';
import {
  Sprout,
  LayoutGrid,
  BookOpen,
  Calendar,
  ShieldCheck,
  Utensils,
  TestTube2,
  Lightbulb,
  BookText,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  location: GardenLocation;
  onOpenSetup: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenVersionModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  location,
  onOpenSetup,
  theme,
  onToggleTheme,
  onOpenVersionModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sprout },
    { id: 'planner', label: 'Bed Designer', icon: LayoutGrid },
    { id: 'crops', label: 'Crop Guides', icon: BookOpen },
    { id: 'calendar', label: 'Calendar & Tasks', icon: Calendar },
    { id: 'companions', label: 'Companion Ecology', icon: Sprout },
    { id: 'preservation', label: 'Safe Preservation', icon: ShieldCheck },
    { id: 'pantry', label: 'Pantry & Yields', icon: Utensils },
    { id: 'soil', label: 'Soil & IPM', icon: TestTube2 },
    { id: 'hydro', label: 'Indoor & Hydro', icon: Lightbulb },
    { id: 'journal', label: 'Journal & ROI', icon: BookText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f5f7f5]/92 dark:bg-[#0f1712]/92 backdrop-blur-md border-b border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <span className="w-9 h-9 rounded-xl bg-[#183e25] dark:bg-[#10b981] border border-emerald-600/30 dark:border-emerald-400/40 flex items-center justify-center text-white dark:text-[#06150d] shadow-xs group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-emerald-300 dark:text-[#06150d]" />
              </span>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#122017] dark:text-[#f3f7f4] font-serif-botanical block leading-none">
                  FloraHearth
                </span>
                <span className="text-[10px] text-[#56705d] dark:text-[#7e9987] font-mono tracking-wider uppercase">
                  US Garden &amp; Pantry
                </span>
              </div>
            </button>

            {/* Quick Location Badge */}
            <button
              type="button"
              onClick={onOpenSetup}
              aria-label={`Current location: ${location.city}, ${location.state}, USDA Zone ${location.usdaZone}. Click to edit climate settings.`}
              className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-[#edf2ee] hover:bg-[#e2ece3] dark:bg-[#18271e] dark:hover:bg-[#1f3427] text-[#2d4334] dark:text-[#cad9ce] text-xs rounded-lg transition-colors border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] font-mono"
              title="Click to edit location and climate"
            >
              <span className="text-emerald-700 dark:text-[#34d399] font-bold">Zone {location.usdaZone}</span>
              <span className="text-stone-300 dark:text-stone-600">·</span>
              <span>{location.city}, {location.state}</span>
              <Settings className="w-3 h-3 text-[#7e9987] ml-0.5" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-xs'
                      : 'text-[#3c5244] dark:text-[#b6cfc0] hover:text-[#122017] dark:hover:text-white hover:bg-[#edf2ee] dark:hover:bg-[#18271e]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Theme Toggle & Version/Cache Button */}
          <div className="flex items-center gap-2">
            {/* Version & Cache Diagnostics Button */}
            <button
              type="button"
              onClick={onOpenVersionModal}
              aria-label={`Application version ${APP_VERSION}. Click to open storage diagnostics and cache control.`}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors bg-[#edf2ee] hover:bg-[#e2ece3] text-[#183e25] border-[#d6e2d8] dark:bg-[#18271e] dark:hover:bg-[#1f3427] dark:text-[#34d399] dark:border-[rgba(16,185,129,0.3)]"
              title="Version Control, Hard Cache Reset & Storage Diagnostics"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34d399]" aria-hidden="true" />
              <span>v{APP_VERSION}</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[#3c5244] dark:text-[#cad9ce] hover:text-[#122017] dark:hover:text-white hover:bg-[#edf2ee] dark:hover:bg-[#18271e] border border-transparent dark:border-[rgba(255,255,255,0.06)] transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Default)'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode (Default)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 hover:rotate-45 transition-transform" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-800 hover:-rotate-12 transition-transform" aria-hidden="true" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <div className="flex items-center gap-1.5 xl:hidden">
              <button
                type="button"
                onClick={onOpenSetup}
                aria-label={`Zone ${location.usdaZone} climate settings`}
                className="px-2 py-1 text-xs bg-[#edf2ee] dark:bg-[#18271e] text-[#2d4334] dark:text-[#cad9ce] rounded-lg border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] font-mono sm:inline-block hidden"
              >
                Zone {location.usdaZone}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation drawer menu' : 'Open navigation drawer menu'}
                className="p-2 text-[#3c5244] dark:text-[#cad9ce] hover:text-[#122017] dark:hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (expanded from hamburger) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-200 dark:border-[#243d2f] bg-white dark:bg-[#122119] px-4 py-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left flex items-center gap-2 font-medium transition-colors ${
                    isActive
                      ? 'bg-[#234730] dark:bg-emerald-600 text-white font-bold'
                      : 'bg-stone-50 dark:bg-[#182b21] text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1f372a]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-[#243d2f] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onOpenSetup();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-stone-600 dark:text-stone-300 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Location: {location.city}, {location.state} (Zone {location.usdaZone})</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#182b21] text-stone-700 dark:text-stone-200 flex items-center gap-1.5"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-emerald-700" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent Thumb Reach) */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#122119]/95 backdrop-blur-md border-t border-stone-200 dark:border-[#243d2f] flex items-center justify-around py-2 px-1 text-[10px]">
        {[
          { id: 'dashboard', label: 'Home', icon: Sprout },
          { id: 'planner', label: 'Planner', icon: LayoutGrid },
          { id: 'crops', label: 'Crops', icon: BookOpen },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'preservation', label: 'Preserve', icon: ShieldCheck },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#234730] dark:text-emerald-400 font-bold'
                  : 'text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
