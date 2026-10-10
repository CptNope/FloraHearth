import React, { useState } from 'react';
import { GardenLocation } from '../types/garden';
import { Sprout, LayoutGrid, BookOpen, Calendar, ShieldCheck, Utensils, TestTube2, Lightbulb, BookText, Settings, Menu, X } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  location: GardenLocation;
  onOpenSetup: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  location,
  onOpenSetup,
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
    <header className="sticky top-0 z-40 bg-[#fcfcf9]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <span className="w-9 h-9 rounded-xl bg-[#234730] flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </span>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#183a24] font-serif-botanical block leading-none">
                  FloraHearth
                </span>
                <span className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">
                  US Garden &amp; Pantry
                </span>
              </div>
            </button>

            {/* Quick Location Badge */}
            <button
              type="button"
              onClick={onOpenSetup}
              className="hidden md:flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs rounded-lg transition-colors border border-stone-200/60 font-mono"
              title="Click to edit location and climate"
            >
              <span className="text-emerald-700 font-bold">Zone {location.usdaZone}</span>
              <span>·</span>
              <span className="text-stone-600">{location.city}, {location.state}</span>
              <Settings className="w-3 h-3 text-stone-400 ml-0.5" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#234730] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenSetup}
              className="px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded-lg border border-stone-200 font-mono"
            >
              Zone {location.usdaZone}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (expanded from hamburger) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 shadow-lg">
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
                  className={`p-2.5 rounded-xl text-left flex items-center gap-2 font-medium ${
                    isActive
                      ? 'bg-[#234730] text-white font-bold'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent Thumb Reach) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-around py-2 px-1 text-[10px]">
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
                isActive ? 'text-[#234730] font-bold' : 'text-stone-400 hover:text-stone-700'
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
