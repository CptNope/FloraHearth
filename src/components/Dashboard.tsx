import React, { useState, useEffect } from 'react';
import { GardenLocation, GardenSpace, GardenTask, PantryItem } from '../types/garden';
import { CROPS_DATA } from '../data/cropsData';
import {
  Sun,
  Moon,
  CloudSun,
  Calendar,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Thermometer,
  Droplets,
  MapPin,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  getLunarPlantingInfo,
  fetchWeatherAndAlmanac,
  getLoreOfTheDay,
} from '../services/weatherAlmanacService';
import { WeatherAlmanacData, LunarPlantingInfo } from '../types/weatherAlmanac';

interface DashboardProps {
  location: GardenLocation;
  spaces: GardenSpace[];
  tasks: GardenTask[];
  pantryItems: PantryItem[];
  onNavigate: (tabId: string) => void;
  onOpenSetup: () => void;
  onOpenTroubleshooter: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  location,
  spaces,
  tasks,
  pantryItems,
  onNavigate,
  onOpenSetup,
  onOpenTroubleshooter,
}) => {
  // Current month & day
  const today = new Date();
  const currentMonthNum = today.getMonth() + 1;
  const lunar = getLunarPlantingInfo(today);
  const todayLore = getLoreOfTheDay(today);

  const [weatherData, setWeatherData] = useState<WeatherAlmanacData | null>(null);

  useEffect(() => {
    let active = true;
    fetchWeatherAndAlmanac(location, false).then((res) => {
      if (active) setWeatherData(res);
    });
    return () => {
      active = false;
    };
  }, [location.city, location.state, location.zipCode, location.latitude, location.longitude]);

  // Determine what to plant now:
  // In spring (Feb-May): cool season direct seeds & warm season indoor starts
  // In summer (Jun-Aug): warm transplants, succession beans/squash, fall brassica seeds
  // In fall (Sep-Nov): garlic, radishes, spinach, overwinter greens
  const plantNowSuggestions = CROPS_DATA.slice(0, 4);

  const pendingTasks = (tasks || []).filter(t => !t.completed).slice(0, 4);

  // Total plants placed across all beds
  const safeSpaces = spaces || [];
  const totalPlacedCells = safeSpaces.reduce((acc, s) => acc + (s.cells || []).filter(c => c.cropId).length, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Climate Location Card */}
      <div className="bg-gradient-to-r from-[#132d1d] via-[#1a3a26] to-[#234c32] dark:from-[#0e2115] dark:via-[#132c1d] dark:to-[#1a3826] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-600/30 dark:border-emerald-500/25 relative overflow-hidden">
        {/* Subtle background motif */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 select-none pointer-events-none text-9xl">
          🌿
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-300 dark:text-emerald-400 font-mono text-xs">
            <MapPin className="w-4 h-4" />
            <span>
              {location.city}, {location.state} · USDA Hardiness Zone {location.usdaZone}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif-botanical leading-tight text-white">
            Nurture Your Harvest Cycle: Plan, Grow, Preserve.
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 dark:text-emerald-200/85 leading-relaxed">
            Personalized for your {location.climateRegion}. Last Spring Frost is ~<strong>{location.lastSpringFrost}</strong> and First Fall Frost is ~<strong>{location.firstFallFrost}</strong> ({location.growingSeasonDays} frost-free growing days).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenSetup}
              className="px-4 py-2 bg-white text-[#132d1d] dark:bg-[#10b981] dark:text-[#05140b] font-bold text-xs rounded-xl hover:bg-emerald-50 dark:hover:bg-[#34d399] transition-colors shadow-xs"
            >
              Adjust Location &amp; Goals
            </button>
            <button
              type="button"
              onClick={onOpenTroubleshooter}
              className="px-4 py-2 bg-white/15 dark:bg-white/10 text-white hover:bg-white/25 dark:hover:bg-white/15 border border-white/20 dark:border-white/15 font-semibold text-xs rounded-xl transition-colors"
            >
              Plant Symptom Diagnostic
            </button>
          </div>
        </div>
      </div>

      {/* Live Weather & Farmer's Almanac Snapshot */}
      <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 rounded-xl">
              <CloudSun className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
                Live Weather &amp; Farmer&apos;s Almanac Guide
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {location.city}, {location.state} · Synchronized with Open-Meteo &amp; Lunar Calendar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('weather-almanac')}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>Full Weather &amp; Almanac Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Current Weather Snapshot (5 cols) */}
          <div className="md:col-span-5 flex items-center gap-4 p-3.5 bg-stone-50 dark:bg-[#172d1f] rounded-2xl border border-stone-200/80 dark:border-white/5">
            <span className="text-4xl select-none" role="img" aria-label="weather">
              {weatherData?.current.weatherIcon || '⛅'}
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#112217] dark:text-[#f0fdf4] font-serif-botanical">
                  {weatherData?.current.tempF ?? 68}°F
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {weatherData?.current.weatherDesc || 'Partly Sunny & Mild'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                <span>Soil: {weatherData?.indices.soilGermination.soilTempF ?? 62}°F</span>
                <span>·</span>
                <span
                  className={
                    weatherData?.indices.frostWarning.level !== 'none'
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-emerald-700 dark:text-emerald-400 font-bold'
                  }
                >
                  {weatherData?.indices.frostWarning.badge || 'No Frost Expected'}
                </span>
              </div>
            </div>
          </div>

          {/* Farmer's Almanac Lunar Rule Snapshot (7 cols) */}
          <div className="md:col-span-7 flex items-center gap-3.5 p-3.5 bg-emerald-950/5 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20">
            <span className="text-3xl select-none shrink-0" role="img" aria-label="moon">
              {lunar.phaseEmoji}
            </span>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 dark:text-emerald-400 font-bold">
                <span>{lunar.phase} ({lunar.illuminationPct}% illuminated)</span>
                <span>·</span>
                <span>Sign: {lunar.zodiacSign}</span>
              </div>
              <p className="font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                {lunar.actionTitle}: {lunar.lunarRuleSummary}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                Almanac lore: &ldquo;{todayLore.saying}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Advisory & Weather Alerts Strip */}
      <div className="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl shrink-0">
            <Thermometer className="w-4 h-4" />
          </span>
          <div>
            <strong className="font-bold text-amber-950 dark:text-amber-300 block">
              Seasonal Climate Advisory for Zone {location.usdaZone}:
            </strong>
            <span className="text-amber-900/90 dark:text-amber-200/90">
              {location.isMildWinter
                ? 'Mild winter climate: prime time for cool-season brassicas, greens, and root crops while northern gardens are dormant!'
                : 'Autumn season active: ideal timing to plant overwintering garlic cloves and establish cold-frame greens.'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('calendar')}
          className="text-xs font-semibold text-amber-900 dark:text-amber-300 underline shrink-0 hover:text-amber-950 dark:hover:text-amber-100"
        >
          View Full Timeline →
        </button>
      </div>

      {/* Main Grid: What to Plant Now + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: What to plant now & Beds Overview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* What to Plant Now */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#183a24] font-serif-botanical">
                  What to Plant Now in Your Climate
                </h3>
                <p className="text-xs text-stone-500">
                  Top performing crops tailored to your frost window and season length.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('crops')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                Browse All ({CROPS_DATA.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plantNowSuggestions.map(crop => (
                <div
                  key={crop.id}
                  onClick={() => onNavigate('crops')}
                  className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-[#fafbf9] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-[#f4f7f4] rounded-xl group-hover:scale-105 transition-transform">
                      {crop.iconEmoji}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 group-hover:text-emerald-900">
                        {crop.name.split('(')[0]}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {crop.sfgPerSquare}/sq ft · {crop.daysToMaturityRange[0]}-{crop.daysToMaturityRange[1]}d
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-800 group-hover:underline">
                    View Guide
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Garden Spaces Preview */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#183a24] font-serif-botanical">
                  Active Beds &amp; Growing Spaces
                </h3>
                <p className="text-xs text-stone-500">
                  {spaces.length} active spaces · {totalPlacedCells} planted square feet
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                Open Bed Designer <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safeSpaces.map(sp => {
                const cells = sp.cells || [];
                const plantedCount = cells.filter(c => c.cropId).length;
                return (
                  <div
                    key={sp.id}
                    onClick={() => onNavigate('planner')}
                    className="p-4 rounded-xl border border-stone-200 bg-[#faf9f5] hover:border-emerald-500 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-stone-900">{sp.name}</h4>
                      <span className="text-[10px] font-mono font-semibold bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        {sp.gridCols || 4}×{sp.gridRows || 4} ft
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-1">
                      {plantedCount} of {(sp.gridCols || 4) * (sp.gridRows || 4)} sq ft planted
                    </p>

                    <div className="flex items-center gap-1 text-base pt-1">
                      {cells.slice(0, 6).map((c, i) => {
                        const crop = CROPS_DATA.find(cr => cr.id === c.cropId);
                        return crop ? (
                          <span key={i} title={crop.name}>{crop.iconEmoji}</span>
                        ) : null;
                      })}
                      {cells.length > 6 && (
                        <span className="text-[10px] font-mono text-stone-400 pl-1">
                          +{cells.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Tasks & Preservation Highlights (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Tasks */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                Upcoming Action Tasks
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="text-[11px] text-emerald-800 font-semibold underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div key={task.id} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>Due: {task.dueDate}</span>
                    <span className="capitalize">{task.type.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pantry & Harvest Highlights */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical">
                Preserved Pantry Stores
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('preservation')}
                className="text-[11px] text-emerald-800 font-semibold underline"
              >
                Canning Center
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {pantryItems.slice(0, 3).map(p => (
                <div key={p.id} className="p-2.5 rounded-xl border border-stone-200 bg-[#fbfbfa] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-stone-900">{p.cropName}</h5>
                    <span className="text-[10px] text-stone-500">
                      {p.storageLocation} · Use by {p.bestByDate}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800 font-mono">
                    {p.quantity} {(p.unit || 'units').split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Helper Tools */}
          <div className="p-4 bg-[#f3f7f4] border border-[#d6e4da] rounded-2xl text-xs space-y-2.5">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              Specialized Tools
            </h4>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onNavigate('companions')}
                className="w-full text-left p-2 bg-white rounded-lg border border-stone-200 hover:border-emerald-600 font-medium text-stone-700 flex justify-between"
              >
                <span>🤝 Companion Planting Matrix</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('hydro')}
                className="w-full text-left p-2 bg-white rounded-lg border border-stone-200 hover:border-emerald-600 font-medium text-stone-700 flex justify-between"
              >
                <span>💡 Grow Light DLI &amp; Hydroponics</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('soil')}
                className="w-full text-left p-2 bg-white rounded-lg border border-stone-200 hover:border-emerald-600 font-medium text-stone-700 flex justify-between"
              >
                <span>🔬 Soil Testing &amp; Composting</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
