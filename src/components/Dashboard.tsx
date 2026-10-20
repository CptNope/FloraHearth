import React, { useState, useEffect, useMemo } from 'react';
import { forecastSourceLabel } from './ForecastStatusNotice';
import { GardenLocation, GardenSpace, GardenTask, PantryItem } from '../types/garden';
import { CROPS_DATA } from '../data/cropsData';
import { getPlantingSuggestions } from '../services/bedSchedule';
import { localDateStr, formatShortDate } from '../services/dates';
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

  // What can actually be planted now, from each crop's timing and the user's frost dates
  // Memoized: recomputed only when the frost dates or the day change
  const todayKey = localDateStr();
  const plantNowSuggestions = useMemo(
    () => getPlantingSuggestions(CROPS_DATA, location, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.lastSpringFrost, location.firstFallFrost, todayKey]
  );
  const plantingNow = plantNowSuggestions.some(s => s.isNow);
  const stepVerb = { 'seed-start': 'Start indoors', transplant: 'Transplant', 'direct-sow': 'Sow or plant' } as const;
  const shortDate = formatShortDate;

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
              <h2 className="font-bold text-sm text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
                Live Weather &amp; Farmer&apos;s Almanac Guide
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                {location.city}, {location.state}
              </p>
              {/* Fixed one-line status (no banner insertion, so nothing shifts when the forecast arrives) */}
              <p
                role="status"
                className={`text-xs font-mono font-semibold ${
                  weatherData?.forecastStatus === 'estimate'
                    ? 'text-amber-800 dark:text-amber-300'
                    : weatherData?.forecastStatus === 'cached'
                    ? 'text-stone-700 dark:text-stone-200'
                    : 'text-emerald-800 dark:text-emerald-400'
                }`}
              >
                {forecastSourceLabel(weatherData)}
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
                  {weatherData ? `${weatherData.current.tempF}°F` : '--'}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {weatherData?.current.weatherDesc || 'Loading…'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                <span className="whitespace-nowrap">Soil: {weatherData ? `${Math.round(weatherData.indices.soilGermination.soilTempF)}°F` : '--'}</span>
                <span>·</span>
                <span
                  className={
                    !weatherData || weatherData.indices.frostWarning.level === 'unknown'
                      ? 'text-amber-800 dark:text-amber-300 font-bold'
                      : weatherData.indices.frostWarning.level !== 'none'
                      ? 'text-rose-700 dark:text-rose-400 font-bold'
                      : 'text-emerald-800 dark:text-emerald-400 font-bold'
                  }
                >
                  {weatherData ? weatherData.indices.frostWarning.badge : 'Checking frost outlook…'}
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
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-800 dark:text-emerald-400 font-bold">
                <span>{lunar.phase} ({lunar.illuminationPct}% illuminated)</span>
                <span>·</span>
                <span>Sign: {lunar.zodiacSign}</span>
              </div>
              <p className="font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                {lunar.actionTitle}: {lunar.lunarRuleSummary}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 italic font-serif-botanical">
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
                <h2 className="font-bold text-base text-[#183a24] font-serif-botanical">
                  {plantingNow ? 'What to Plant Now in Your Climate' : 'Coming Up Next in Your Climate'}
                </h2>
                <p className="text-xs text-stone-500">
                  {plantingNow
                    ? `Planting windows open today for your frost dates (${location.lastSpringFrost} / ${location.firstFallFrost}).`
                    : 'Nothing is in its planting window right now. These are the next windows to open.'}
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
              {plantNowSuggestions.map(({ crop, kind, window, isNow }) => (
                <button
                  type="button"
                  key={crop.id}
                  onClick={() => onNavigate('crops')}
                  aria-label={`${crop.name.split('(')[0].trim()}: ${stepVerb[kind]} ${isNow ? 'now, until' : 'from'} ${shortDate(isNow ? window.end : window.start)}. Open crop guides.`}
                  className="text-left p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-[#fafbf9] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-[#f4f7f4] rounded-xl group-hover:scale-105 transition-transform" aria-hidden="true">
                      {crop.iconEmoji}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-stone-900 group-hover:text-emerald-900">
                        {crop.name.split('(')[0]}
                      </h3>
                      <p className="text-xs text-stone-600">
                        {stepVerb[kind]} {isNow ? `now – ${shortDate(window.end)}` : `from ${shortDate(window.start)}`}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-emerald-800 group-hover:underline" aria-hidden="true">
                    View Guide
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Garden Spaces Preview */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-[#183a24] font-serif-botanical">
                  Active Beds &amp; Growing Spaces
                </h2>
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
                const planted = cells.filter(c => c.cropId);
                const plantedCount = planted.length;
                return (
                  <article
                    key={sp.id}
                    className="relative p-4 rounded-xl border border-stone-200 bg-[#faf9f5] hover:border-emerald-500 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-xs text-stone-900">
                        <button
                          type="button"
                          onClick={() => onNavigate('planner')}
                          aria-label={`${sp.name}: open in Bed Designer`}
                          className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none"
                        >
                          {sp.name}
                        </button>
                      </h3>
                      <span className="shrink-0 text-2xs font-mono font-semibold bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        {sp.gridCols || 4}×{sp.gridRows || 4} ft
                      </span>
                    </div>

                    <p className="text-xs text-stone-600">
                      {plantedCount} of {(sp.gridCols || 4) * (sp.gridRows || 4)} sq ft planted
                    </p>

                    <div className="flex items-center gap-1 text-base pt-1" aria-hidden="true">
                      {planted.slice(0, 6).map((c, i) => {
                        const crop = CROPS_DATA.find(cr => cr.id === c.cropId);
                        return crop ? (
                          <span key={i} title={crop.name}>{crop.iconEmoji}</span>
                        ) : null;
                      })}
                      {planted.length > 6 && (
                        <span className="text-2xs font-mono text-stone-600 pl-1">
                          +{planted.length - 6} more
                        </span>
                      )}
                    </div>
                  </article>
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
              <h2 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                Upcoming Action Tasks
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="text-xs text-emerald-800 font-semibold underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div key={task.id} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 break-words">{task.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-stone-500 font-mono">
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
              <h2 className="font-bold text-sm text-[#183a24] font-serif-botanical">
                Preserved Pantry Stores
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('preservation')}
                className="text-xs text-emerald-800 font-semibold underline"
              >
                Canning Center
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {pantryItems.slice(0, 3).map(p => (
                <div key={p.id} className="p-2.5 rounded-xl border border-stone-200 bg-[#fbfbfa] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900">{p.cropName}</h3>
                    <span className="text-2xs text-stone-500">
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
            <h3 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              Specialized Tools
            </h3>
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
