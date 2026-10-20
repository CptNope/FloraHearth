import React, { useState, useEffect } from 'react';
import { CROPS_DATA } from '../data/cropsData';
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
  CloudSun,
  Layers,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Compass
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  location: GardenLocation;
  onOpenSetup: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenVersionModal: () => void;
  onOpenTroubleshooter?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  location,
  onOpenSetup,
  theme,
  onToggleTheme,
  onOpenVersionModal,
  onOpenTroubleshooter,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navCategories = [
    {
      title: 'Planning & Climate',
      items: [
        { id: 'dashboard', label: 'Dashboard', desc: 'Seasonal overview & today’s chores', icon: Sprout },
        { id: 'weather-almanac', label: 'Weather & Almanac', desc: 'Live Open-Meteo & Farmer’s Almanac', icon: CloudSun },
        { id: 'planner', label: 'Bed Designer', desc: 'Square foot & row companion layouts', icon: LayoutGrid },
        { id: 'crops', label: 'Crop Guides', desc: `${CROPS_DATA.length} vegetable, fruit & herb guides`, icon: BookOpen },
        { id: 'calendar', label: 'Calendar & Tasks', desc: 'Frost-timed sowing & harvest schedule', icon: Calendar },
      ],
    },
    {
      title: 'Health & Ecology',
      items: [
        { id: 'companions', label: 'Companion Ecology', desc: 'Beneficial guilds, pest deterrents & traps', icon: Sparkles },
        { id: 'soil', label: 'Soil & IPM', desc: 'Nutrient tests, pH balance & organic pest control', icon: TestTube2 },
      ],
    },
    {
      title: 'Harvest & Pantry',
      items: [
        { id: 'preservation', label: 'Safe Preservation', desc: 'USDA canning, dehydrating & altitude guide', icon: ShieldCheck },
        { id: 'pantry', label: 'Pantry & Yields', desc: 'Preserved stores, jar use & batch tracking', icon: Utensils },
        { id: 'journal', label: 'Journal & ROI', desc: 'Growth logs, harvest weight & savings calculator', icon: BookText },
      ],
    },
    {
      title: 'Specialized Systems',
      items: [
        { id: 'hydro', label: 'Indoor & Hydro', desc: 'Grow lights, Kratky & DWC indoor setups', icon: Lightbulb },
      ],
    },
  ];

  // Flattened items for the top horizontal bar
  const allNavItems = navCategories.flatMap(cat => cat.items);

  // Bottom navigation items on mobile screens
  const mobileBottomItems = [
    { id: 'dashboard', label: 'Home', icon: Sprout },
    { id: 'weather-almanac', label: 'Weather', icon: CloudSun },
    { id: 'planner', label: 'Beds', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'preservation', label: 'Preserve', icon: ShieldCheck },
  ];

  const isCurrentTabInBottomBar = mobileBottomItems.some(item => item.id === activeTab);

  // The bottom bar must live outside <header>: the header's backdrop-filter
  // makes it the containing block for fixed children, which pinned the
  // "bottom" bar to the top of the screen on phones.
  return (
    <>
    <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-[#f5f7f5]/95 dark:bg-[#0f1712]/95 backdrop-blur-md border-b border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main top bar */}
        <div className="flex flex-wrap items-center justify-between min-h-16 gap-x-2 gap-y-1 py-2">
          {/* Brand Logo & Name */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
              aria-label="FloraHearth home dashboard"
            >
              <span className="w-9 h-9 rounded-xl bg-[#183e25] dark:bg-[#10b981] border border-emerald-600/30 dark:border-emerald-400/40 flex items-center justify-center text-white dark:text-[#06150d] shadow-xs group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-emerald-300 dark:text-[#06150d]" aria-hidden="true" />
              </span>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#122017] dark:text-[#f3f7f4] font-serif-botanical block leading-none">
                  FloraHearth
                </span>
                <span className="max-[359px]:hidden text-[10px] text-[#56705d] dark:text-[#7e9987] font-mono tracking-wider uppercase">
                  US Garden &amp; Pantry
                </span>
              </div>
            </button>

            {/* Quick Location Badge */}
            <button
              type="button"
              onClick={onOpenSetup}
              aria-label={`Current location: ${location.city}, ${location.state}, USDA Zone ${location.usdaZone}. Click to edit climate settings.`}
              className="hidden sm:flex items-center gap-1.5 ml-1 px-2.5 py-1 bg-[#edf2ee] hover:bg-[#e2ece3] dark:bg-[#18271e] dark:hover:bg-[#1f3427] text-[#2d4334] dark:text-[#cad9ce] text-xs rounded-lg transition-colors border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] font-mono"
              title="Click to edit location and climate"
            >
              <span className="text-emerald-800 dark:text-[#34d399] font-bold">Zone {location.usdaZone}</span>
              <span className="text-stone-300 dark:text-stone-600" aria-hidden="true">·</span>
              <span className="break-words">{location.city}, {location.state}</span>
              <Settings className="w-3 h-3 text-[#7e9987] ml-0.5" aria-hidden="true" />
            </button>

            {/* Quick Weather & Almanac Link */}
            <button
              type="button"
              onClick={() => onSelectTab('weather-almanac')}
              aria-label="View live weather and Farmer's Almanac"
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors border font-mono ${
                activeTab === 'weather-almanac'
                  ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/25'
              }`}
              title="View live weather and Farmer's Almanac"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>Weather &amp; Almanac</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 ml-auto">
            {/* Plant Doctor / Troubleshooter trigger */}
            {onOpenTroubleshooter && (
              <button
                type="button"
                onClick={onOpenTroubleshooter}
                aria-label="Open plant doctor and diagnostic troubleshooter"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors bg-[#fef3c7]/60 hover:bg-[#fef3c7] text-[#92400e] border-[#fde68a] dark:bg-[#78350f]/20 dark:hover:bg-[#78350f]/35 dark:text-[#fde68a] dark:border-[#b45309]/40"
                title="Plant Doctor: Diagnostic Symptom Checker"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="hidden xl:inline">Plant Doctor</span>
              </button>
            )}

            {/* Version & Cache Diagnostics Button */}
            <button
              type="button"
              onClick={onOpenVersionModal}
              aria-label={`Application version ${APP_VERSION}. Click to open storage diagnostics and cache control.`}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors bg-[#edf2ee] hover:bg-[#e2ece3] text-[#183e25] border-[#d6e2d8] dark:bg-[#18271e] dark:hover:bg-[#1f3427] dark:text-[#34d399] dark:border-[rgba(16,185,129,0.3)]"
              title="Version Control, Hard Cache Reset & Storage Diagnostics"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34d399]" aria-hidden="true" />
              <span className="hidden sm:inline">v{APP_VERSION}</span>
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

            {/* All Views Menu Button (desktop; phones use the same button in the bottom bar) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close all views menu' : 'Open all views menu'}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                mobileMenuOpen
                  ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] border-transparent shadow-xs'
                  : 'bg-[#edf2ee] dark:bg-[#18271e] text-[#183e25] dark:text-[#34d399] border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] hover:bg-[#e2ece3] dark:hover:bg-[#1f3427]'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">All Views</span>
            </button>
          </div>
        </div>

        {/* Horizontal Nav Bar for Large/Medium Displays (scrollable, accessible, always available) */}
        <nav
          aria-label="Primary garden sections"
          className="hidden lg:flex items-center gap-1 py-1.5 border-t border-stone-200/60 dark:border-[rgba(255,255,255,0.05)] overflow-x-auto no-scrollbar text-xs font-semibold"
        >
          {allNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-xs'
                    : 'text-[#3c5244] dark:text-[#b6cfc0] hover:text-[#122017] dark:hover:text-white hover:bg-[#edf2ee] dark:hover:bg-[#18271e]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Full Categorized Drawer Menu (Accessible from Desktop All Views & Mobile) */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 dark:border-[#243d2f] bg-[#fcfcfb] dark:bg-[#0c1610] px-4 sm:px-6 pt-6 pb-24 lg:pb-6 shadow-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-[#243d2f] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-700 dark:text-[#34d399]" aria-hidden="true" />
                <h2 className="text-base font-bold text-[#122017] dark:text-white font-serif-botanical">
                  FloraHearth Directory &amp; Navigation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#182b21] transition-colors"
                aria-label="Close navigation directory"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Categorized Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {navCategories.map((cat) => (
                <div
                  key={cat.title}
                  className="bg-white dark:bg-[#122118] border border-stone-200/80 dark:border-[#203a2a] rounded-2xl p-4 space-y-2 shadow-xs"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-[#34d399] font-mono">
                    {cat.title}
                  </h3>
                  <div className="space-y-1">
                    {cat.items.map((item) => {
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
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                            isActive
                              ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-xs'
                              : 'text-stone-800 dark:text-stone-200 hover:bg-[#edf2ee] dark:hover:bg-[#182b21]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-white dark:text-[#06150d]' : 'text-emerald-700 dark:text-[#34d399]'}`} aria-hidden="true" />
                          <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                              <span>{item.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" aria-hidden="true" />
                            </div>
                            <p className={`text-[11px] break-words leading-normal mt-0.5 ${isActive ? 'text-emerald-100 dark:text-[#06150d]/80' : 'text-stone-500 dark:text-stone-400'}`}>
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Diagnostic Tools & Settings Strip inside Drawer */}
            <div className="pt-3 border-t border-stone-200/80 dark:border-[#243d2f] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Climate Setup */}
              <button
                type="button"
                onClick={() => {
                  onOpenSetup();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-3 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#182b21] dark:hover:bg-[#203a2c] rounded-xl text-left transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-700 dark:text-[#34d399] shrink-0" aria-hidden="true" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-stone-800 dark:text-white">Garden &amp; Zone Setup</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 break-words">Zone {location.usdaZone} · {location.city}, {location.state}</div>
                </div>
              </button>

              {/* Plant Doctor */}
              {onOpenTroubleshooter && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTroubleshooter();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-3 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 rounded-xl text-left transition-colors border border-amber-500/20"
                >
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-amber-950 dark:text-amber-200">Plant Doctor Troubleshooter</div>
                    <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80 break-words">Interactive heat stress &amp; yellow leaf diagnosis</div>
                  </div>
                </button>
              )}

              {/* Version & Storage */}
              <button
                type="button"
                onClick={() => {
                  onOpenVersionModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-3 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#182b21] dark:hover:bg-[#203a2c] rounded-xl text-left transition-colors"
              >
                <Layers className="w-4 h-4 text-emerald-700 dark:text-[#34d399] shrink-0" aria-hidden="true" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-stone-800 dark:text-white">PWA Storage &amp; Cache</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 break-words">Version {APP_VERSION} · Hard Cache Reset</div>
                </div>
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-2 p-3 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#182b21] dark:hover:bg-[#203a2c] rounded-xl text-left transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                )}
                <div>
                  <div className="text-xs font-semibold text-stone-800 dark:text-white">Display Theme</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Currently {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>

    {/* Mobile Persistent Bottom Bar (Always in reach of user's thumb) */}
    <nav
      aria-label="Mobile quick navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c1610]/95 backdrop-blur-md border-t border-stone-200 dark:border-[#243d2f] flex items-center justify-around pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] px-1 text-[10px] shadow-lg"
    >
      {mobileBottomItems.map(item => {
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
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
              isActive
                ? 'text-[#183e25] dark:text-[#34d399] font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* All Views Menu Button in Bottom Nav */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? 'Close all views menu' : 'Open all views menu'}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative ${
          mobileMenuOpen || !isCurrentTabInBottomBar
            ? 'text-[#183e25] dark:text-[#34d399] font-bold'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
        }`}
      >
        {mobileMenuOpen ? (
          <X className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Menu className="w-4 h-4" aria-hidden="true" />
        )}
        <span>{mobileMenuOpen ? 'Close' : 'All Views'}</span>
        {!isCurrentTabInBottomBar && (
          <span
            className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#34d399]"
            title="Active view in directory"
          />
        )}
      </button>
    </nav>
    </>
  );
};
