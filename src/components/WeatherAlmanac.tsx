import React, { useState, useEffect } from 'react';
import { GardenLocation, GardenSpace, GardenTask } from '../types/garden';
import { getCropById } from '../data/cropsData';
import {
  WeatherAlmanacData,
  WeatherLoreItem,
} from '../types/weatherAlmanac';
import {
  fetchWeatherAndAlmanac,
  FARMERS_ALMANAC_LORE,
} from '../services/weatherAlmanacService';
import {
  Sun,
  Moon,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  Calendar,
  Sparkles,
  RefreshCw,
  MapPin,
  Compass,
  Sprout,
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen,
  Search,
  Crosshair,
  SlidersHorizontal,
  Bell,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WeatherAlmanacProps {
  location: GardenLocation;
  onUpdateLocation?: (newLocation: GardenLocation) => void;
  onOpenSetup?: () => void;
  spaces?: GardenSpace[];
  tasks?: GardenTask[];
  onUpdateTasks?: (newTasks: GardenTask[]) => void;
  onNavigate?: (tab: string) => void;
}

export const WeatherAlmanac: React.FC<WeatherAlmanacProps> = ({
  location,
  onUpdateLocation,
  onOpenSetup,
  spaces = [],
  tasks = [],
  onUpdateTasks,
  onNavigate,
}) => {
  const [data, setData] = useState<WeatherAlmanacData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & custom location state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLoreCategory, setActiveLoreCategory] = useState<string>('All');
  const [bestDayFilter, setBestDayFilter] = useState<string>('all');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [frostTaskFeedback, setFrostTaskFeedback] = useState<string | null>(null);

  // Identify frost-tender crops planted in user's garden beds
  const frostTenderFamilies = ['Solanaceae', 'Cucurbitaceae', 'Lamiaceae'];
  const frostTenderCropsInBeds: { spaceId: string; bedName: string; crops: string[] }[] = [];

  (spaces || []).forEach(sp => {
    const cropsInBed: string[] = [];
    (sp.cells || []).forEach(c => {
      if (c.cropId) {
        const crop = getCropById(c.cropId);
        if (crop && (frostTenderFamilies.includes(crop.family) || ['bush-beans', 'pole-beans', 'basil', 'cucumber', 'squash', 'tomato', 'sweet-pepper'].includes(crop.id))) {
          const cleanName = crop.name.split('(')[0].trim();
          if (!cropsInBed.includes(cleanName)) cropsInBed.push(cleanName);
        }
      }
    });
    if (cropsInBed.length > 0) {
      frostTenderCropsInBeds.push({ spaceId: sp.id, bedName: sp.name, crops: cropsInBed });
    }
  });

  const handleAddFrostProtectionTask = (bedName: string, cropsList: string[]) => {
    if (!onUpdateTasks) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const taskTitle = `Cover ${cropsList.join(' & ')} in ${bedName}`;

    if ((tasks || []).some(t => t.title.includes(bedName) && t.title.toLowerCase().includes('cover') && t.dueDate === todayStr)) {
      setFrostTaskFeedback(`Freeze cover task for ${bedName} is already on your calendar today.`);
      return;
    }

    const newTask: GardenTask = {
      id: `task-frost-${Date.now()}`,
      title: `Frost Shield: ${taskTitle} before nightfall`,
      type: 'maintenance',
      dueDate: todayStr,
      completed: false,
      notes: `Forecast low of ${Math.round(data?.indices?.frostWarning?.tonightMinTemp || 32)}°F. Cover beds with floating row fabric, burlap, or frost blankets to trap radiant ground heat.`
    };

    onUpdateTasks([newTask, ...(tasks || [])]);
    setFrostTaskFeedback(`✓ Added cover task for ${cropsList.join(', ')} in ${bedName} to your calendar!`);
  };

  // Load weather and almanac data
  const loadData = async (force = false, customLoc?: GardenLocation) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const targetLoc = customLoc || location;
      const res = await fetchWeatherAndAlmanac(targetLoc, force);
      setData(res);
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setErrorMsg('Unable to retrieve live weather data. Showing seasonal almanac averages.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, [location.city, location.state, location.zipCode, location.latitude, location.longitude]);

  // Handle browser GPS detection
  const handleUseGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const updatedLoc: GardenLocation = {
          ...location,
          latitude,
          longitude,
          city: 'Your GPS Coordinates',
        };
        if (onUpdateLocation) {
          onUpdateLocation(updatedLoc);
        }
        await loadData(true, updatedLoc);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setGpsLoading(false);
        alert('Could not access current location. Please check your browser permissions.');
      },
      { timeout: 10000 }
    );
  };

  // Handle direct location search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setRefreshing(true);
      // Query Open-Meteo geocoding directly
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        searchQuery.trim()
      )}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          const top = json.results[0];
          const newLoc: GardenLocation = {
            ...location,
            city: top.name,
            state: top.admin1 || location.state,
            zipCode: searchQuery.trim(),
            latitude: top.latitude,
            longitude: top.longitude,
          };
          if (onUpdateLocation) {
            onUpdateLocation(newLoc);
          }
          await loadData(true, newLoc);
          setSearchQuery('');
          return;
        }
      }
      alert(`Could not find coordinates for "${searchQuery}". Try a US ZIP code or major city.`);
    } catch {
      alert('Location search failed. Please verify your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-100 font-serif-botanical">
            Consulting Meteorological Station &amp; Lunar Almanac...
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Fetching hyper-local Open-Meteo weather data and astronomical lunar phases for {location.city}, {location.state}.
          </p>
        </div>
      </div>
    );
  }

  const cur = data?.current;
  const lunar = data?.lunar;
  const indices = data?.indices;
  const daily = data?.daily || [];
  const hourly = data?.hourly || [];
  const bestDays = data?.bestDays || [];
  const todayLore = data?.dailyLore || FARMERS_ALMANAC_LORE[0];

  // Filtered Best Days
  const filteredBestDays = bestDays.filter((d) => {
    if (bestDayFilter === 'all') return true;
    if (bestDayFilter === 'above-ground') return d.bestFor.includes('above-ground-crops');
    if (bestDayFilter === 'root-crops') return d.bestFor.includes('root-crops');
    if (bestDayFilter === 'weeding') return d.bestFor.includes('weeding');
    if (bestDayFilter === 'harvest') return d.bestFor.includes('harvest-storage');
    return true;
  });

  // Filtered Lore
  const filteredLore =
    activeLoreCategory === 'All'
      ? FARMERS_ALMANAC_LORE
      : FARMERS_ALMANAC_LORE.filter((l) => l.category === activeLoreCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. STATION HEADER & LOCATION CONTROLS */}
      <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{data?.locationName || `${location.city}, ${location.state}`}</span>
              <span className="text-stone-300 dark:text-stone-600">·</span>
              <span className="font-bold">Zone {location.usdaZone}</span>
              <span className="text-stone-300 dark:text-stone-600">·</span>
              <span>Elev. {Math.round((data?.elevationMeters || 100) * 3.28)} ft</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
              Weather Station &amp; Farmer&apos;s Almanac
            </h1>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live Open-Meteo agricultural conditions synchronized with traditional 18th-century lunar gardening rules.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ZIP or City, State"
                  className="w-36 sm:w-44 px-3 py-1.5 text-xs bg-stone-50 dark:bg-[#182c1f] border border-stone-300 dark:border-[rgba(255,255,255,0.12)] rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={refreshing}
                title="Search weather for location"
                className="p-2 bg-emerald-800 text-white hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-colors shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading || refreshing}
              title="Use current GPS location"
              className="px-3 py-1.5 text-xs font-semibold bg-[#edf4ee] dark:bg-[#193222] text-emerald-900 dark:text-emerald-200 hover:bg-[#e1ece2] dark:hover:bg-[#20402b] rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5 transition-colors"
            >
              <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Use GPS</span>
            </button>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh live weather feed"
              className="px-3 py-1.5 text-xs font-semibold bg-[#edf4ee] dark:bg-[#193222] text-emerald-900 dark:text-emerald-200 hover:bg-[#e1ece2] dark:hover:bg-[#20402b] rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. THE OLD FARMER'S ALMANAC LUNAR PLANTING SANCTUARY (HERO CARD) */}
      {lunar && (
        <div className="bg-gradient-to-br from-[#12271a] via-[#1a3826] to-[#244b34] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-600/30 dark:border-emerald-500/20 relative overflow-hidden">
          {/* Subtle lunar graphic background */}
          <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none pointer-events-none flex items-center justify-center pr-8 text-9xl">
            {lunar.phaseEmoji}
          </div>

          <div className="relative z-10 space-y-6 max-w-4xl">
            {/* Header kicker */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl sm:text-4xl">{lunar.phaseEmoji}</span>
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                    <span className="uppercase tracking-wider font-bold">The Old Farmer&apos;s Almanac</span>
                    <span>·</span>
                    <span>Lunar Gardening Guide</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-botanical text-white">
                    {lunar.phase} · {lunar.illuminationPct}% Illuminated
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                <div>
                  <span className="text-stone-300">Moon Age:</span>{' '}
                  <strong className="text-emerald-300">{lunar.moonAgeDays} days</strong>
                </div>
                <span className="text-white/20">|</span>
                <div>
                  <span className="text-stone-300">Full Moon in:</span>{' '}
                  <strong className="text-emerald-300">{lunar.nextFullMoonDays}d</strong>
                </div>
              </div>
            </div>

            {/* Astrological Sign & Golden Rule Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Moon Sign */}
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-mono block">
                  Astrological Moon Sign
                </span>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Sign: {lunar.zodiacSign}</span>
                  <span className="text-xs font-normal text-emerald-200">({lunar.element})</span>
                </div>
                <p className="text-xs text-stone-200 leading-snug">
                  Fertility Grade:{' '}
                  <strong className={lunar.fertility.includes('Very') ? 'text-emerald-300' : 'text-amber-300'}>
                    {lunar.fertility}
                  </strong>
                </p>
              </div>

              {/* Almanac Directive */}
              <div className="md:col-span-2 bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-mono block">
                  Today&apos;s Almanac Rule: {lunar.phaseQuarter}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-serif-botanical">
                  {lunar.actionTitle}
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {lunar.lunarRuleSummary}
                </p>
              </div>
            </div>

            {/* Practical Today Planting Advice Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Favorable to Plant Today</span>
                </div>
                <ul className="text-xs text-stone-200 space-y-1">
                  {lunar.recommendedCrops.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/30 rounded-2xl p-4 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Postpone or Avoid Today</span>
                </div>
                <ul className="text-xs text-stone-200 space-y-1">
                  {lunar.avoidCrops.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-sky-950/30 rounded-2xl p-4 border border-sky-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                  <Sprout className="w-4 h-4 text-sky-400" />
                  <span>Almanac Farm Chore</span>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed">
                  {lunar.almanacChoreToday}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CURRENT METEOROLOGICAL CONDITIONS & AGRO GAUGES */}
      {cur && indices && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Weather Metric Box (4 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#112217] rounded-3xl p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs flex flex-col justify-between space-y-6 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 tracking-wider uppercase">
                  Current Observations
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  Updated {cur.updatedAt}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-6xl select-none" role="img" aria-label={cur.weatherDesc}>
                  {cur.weatherIcon}
                </span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-[#112217] dark:text-[#f0fdf4] tracking-tight font-serif-botanical">
                      {cur.tempF}°
                    </span>
                    <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                      Feels {cur.feelsLikeF}°F
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#1b3d26] dark:text-[#86efac]">
                    {cur.weatherDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-stone-500 dark:text-stone-400">
                <span>Today: Low {cur.tempMinToday}°F</span>
                <span>·</span>
                <span>High {cur.tempMaxToday}°F</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100 dark:border-[rgba(255,255,255,0.06)] text-xs">
              <div className="p-2.5 bg-stone-50 dark:bg-[#172d1f] rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Humidity</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                  {cur.humidityPct}%
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 dark:bg-[#172d1f] rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <Wind className="w-3.5 h-3.5 text-teal-500" />
                  <span>Wind</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                  {cur.windSpeedMph} mph {cur.windDirectionText}
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 dark:bg-[#172d1f] rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>UV Index</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                  {cur.uvIndex} (Max {daily[0]?.uvIndexMax || 6})
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 dark:bg-[#172d1f] rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Barometer</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                  {cur.surfacePressureInHg} inHg
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 dark:bg-[#172d1f] rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Dew Point</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                  {cur.dewPointF}°F
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 dark:bg-[#172d1f] rounded-xl space-y-0.5">
                <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                  <span>GDD Base 50</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                  +{indices.growingDegreeDaysBase50}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Agricultural Diagnostic Gauges (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Soil Temperature & Germination */}
            <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl">
                    <Thermometer className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      0-10cm Soil Temperature
                    </h4>
                    <span className="text-[11px] text-stone-500 font-mono">Seed Germination Ready</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#112217] dark:text-[#ecfdf5] font-mono">
                    {indices.soilGermination.soilTempF}°F
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {indices.soilGermination.summary}
              </p>

              <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-bold">
                  Sow Directly in Beds Now:
                </span>
                <p className="text-xs text-stone-700 dark:text-stone-200 font-medium">
                  {indices.soilGermination.suitableCrops.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>

            {/* 2. Frost Warning & Freeze Protection */}
            <div
              className={`rounded-3xl p-5 border shadow-xs space-y-3 transition-colors ${
                indices.frostWarning.level === 'hard-freeze' || indices.frostWarning.level === 'frost'
                  ? 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-800/40'
                  : indices.frostWarning.level === 'watch'
                  ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-800/40'
                  : 'bg-white dark:bg-[#112217] border-stone-200 dark:border-[rgba(255,255,255,0.08)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-2 rounded-xl ${
                      indices.frostWarning.level === 'none'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Frost &amp; Freeze Shield
                    </h4>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Tonight: {Math.round(indices.frostWarning.tonightMinTemp)}°F Low
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                    indices.frostWarning.level === 'hard-freeze' || indices.frostWarning.level === 'frost'
                      ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700'
                      : indices.frostWarning.level === 'watch'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700'
                  }`}
                >
                  {indices.frostWarning.badge}
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {indices.frostWarning.details}
              </p>

              <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 dark:text-rose-400 block font-bold">
                  Recommended Action:
                </span>
                <p className="text-xs text-stone-700 dark:text-stone-200 font-medium">
                  {indices.frostWarning.actionAdvice}
                </p>

                {/* Weather -> Task Automation: Bed-specific frost cover buttons */}
                {frostTenderCropsInBeds.length > 0 ? (
                  <div className="pt-2 border-t border-rose-200/50 dark:border-rose-900/40 space-y-2">
                    <span className="text-[11px] font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Tender Crops Planted in Your Beds:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {frostTenderCropsInBeds.map(b => (
                        <div key={b.spaceId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white/80 dark:bg-black/20 rounded-xl border border-rose-200 dark:border-rose-800/40 text-xs">
                          <div>
                            <strong className="text-stone-900 dark:text-white font-semibold">{b.bedName}:</strong>{' '}
                            <span className="text-stone-600 dark:text-stone-300">{b.crops.join(', ')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddFrostProtectionTask(b.bedName, b.crops)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold text-[11px] transition-colors shrink-0 shadow-xs"
                          >
                            <Bell className="w-3 h-3" />
                            <span>Add Cover Task for Tonight</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleAddFrostProtectionTask('Outdoor Garden Beds', ['Frost-Tender Plants'])}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold text-[11px] transition-colors shadow-xs"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Add &ldquo;Cover Garden Beds Before Freeze&rdquo; Task</span>
                    </button>
                  </div>
                )}

                {/* Feedback message */}
                {frostTaskFeedback && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
                    <span className="font-semibold">{frostTaskFeedback}</span>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('calendar')}
                        className="text-[11px] text-emerald-800 dark:text-emerald-300 underline font-bold flex items-center gap-1 shrink-0"
                      >
                        <span>View Calendar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Spraying Window (Neem & Organic Teas) */}
            <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl">
                    <Wind className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Spraying &amp; Foliar Feed
                    </h4>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Wind {indices.sprayingWindow.windMph} mph · Rain {indices.sprayingWindow.rainRiskPct}%
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                    indices.sprayingWindow.status === 'ideal'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700'
                      : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700'
                  }`}
                >
                  {indices.sprayingWindow.badge}
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {indices.sprayingWindow.reason}
              </p>
            </div>

            {/* 4. Bed Workability & Soil Moisture */}
            <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl">
                    <Droplets className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Bed Moisture &amp; Workability
                    </h4>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Moisture: {cur.soilMoisturePct}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700">
                  {indices.tillingAndMowing.badge}
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {indices.tillingAndMowing.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. 24-HOUR HOURLY AGRICULTURAL STRIP */}
      {hourly.length > 0 && (
        <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
                24-Hour Garden Forecast Trend
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Track temperature drops, rain probability, and soil conditions across day and night.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400 hidden sm:inline">
              Hourly Resolution
            </span>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex items-center gap-2.5 min-w-[760px]">
              {hourly.slice(0, 16).map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 p-3 bg-stone-50 dark:bg-[#172d1f] rounded-2xl border border-stone-200/80 dark:border-white/5 text-center space-y-1.5 shrink-0 min-w-[70px]"
                >
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block font-medium">
                    {h.displayTime}
                  </span>
                  <span className="text-2xl select-none block" role="img" aria-label={h.weatherDesc}>
                    {h.weatherIcon}
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block font-mono">
                    {h.tempF}°
                  </span>
                  {h.popPct > 15 ? (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block font-mono">
                      💧 {h.popPct}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-mono">
                      Soil {Math.round(h.soilTempF)}°
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. 7-DAY EXTENDED AGRICULTURAL & LUNAR FORECAST */}
      {daily.length > 0 && (
        <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
                7-Day Agricultural &amp; Lunar Almanac Forecast
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Combined meteorological forecasts with daily moon phases and frost alert flags.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Patchy Frost
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Hard Freeze
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {daily.map((d, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  d.frostRisk === 'hard-freeze' || d.frostRisk === 'frost'
                    ? 'bg-rose-500/5 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-800/40'
                    : d.frostRisk === 'watch'
                    ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-800/40'
                    : 'bg-[#fafbf9] dark:bg-[#152a1d] border-stone-200/90 dark:border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      {d.dayName}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {d.formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between my-2">
                    <span className="text-3xl select-none" role="img" aria-label={d.weatherDesc}>
                      {d.icon}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-sm text-stone-900 dark:text-stone-100 font-mono">
                        {d.tempMaxF}° / {d.tempMinF}°
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {d.popPct > 20 ? `💧 ${d.popPct}%` : 'Dry'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                    {d.weatherDesc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-stone-400">Moon:</span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <span>{d.moonIcon}</span>
                      <span>{d.lunarPhase.split(' ')[0]}</span>
                    </span>
                  </div>

                  {d.frostRisk !== 'none' && (
                    <div className="text-[10px] font-bold font-mono text-rose-700 dark:text-rose-400">
                      ⚠️ {d.frostRiskLabel} ({d.tempMinF}°F)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FARMER'S ALMANAC 30-DAY BEST DAYS CALENDAR */}
      <div className="bg-white dark:bg-[#112217] rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
              Farmer&apos;s Almanac 30-Day Planting &amp; Chore Calendar
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Calculate optimal days according to the Moon&apos;s phase and the fertile astrological zodiac sign.
            </p>
          </div>

          {/* Activity Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-[#182c1f] rounded-2xl">
            <button
              type="button"
              onClick={() => setBestDayFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                bestDayFilter === 'all'
                  ? 'bg-white text-emerald-950 dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              All Days
            </button>
            <button
              type="button"
              onClick={() => setBestDayFilter('above-ground')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                bestDayFilter === 'above-ground'
                  ? 'bg-white text-emerald-950 dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              🌱 Above-Ground Crops
            </button>
            <button
              type="button"
              onClick={() => setBestDayFilter('root-crops')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                bestDayFilter === 'root-crops'
                  ? 'bg-white text-emerald-950 dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              🥕 Root Crops &amp; Bulbs
            </button>
            <button
              type="button"
              onClick={() => setBestDayFilter('weeding')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                bestDayFilter === 'weeding'
                  ? 'bg-white text-emerald-950 dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              ✂️ Weed &amp; Cultivate
            </button>
            <button
              type="button"
              onClick={() => setBestDayFilter('harvest')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                bestDayFilter === 'harvest'
                  ? 'bg-white text-emerald-950 dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              🌾 Harvest for Storage
            </button>
          </div>
        </div>

        {/* Best Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {filteredBestDays.slice(0, 18).map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-xs space-y-1.5 transition-all ${
                item.rating === 'exceptional'
                  ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/30 dark:border-emerald-700/50'
                  : item.rating === 'favorable'
                  ? 'bg-stone-50 dark:bg-[#162b1e] border-stone-200 dark:border-white/5'
                  : 'bg-stone-50/50 dark:bg-[#122218] border-stone-200/60 dark:border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {item.dayOfWeek}, {item.formattedDate}
                </span>
                <span className="text-base select-none">{item.moonEmoji}</span>
              </div>

              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                {item.sign} ({item.element})
              </div>

              <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 line-clamp-2">
                {item.bestFor.map((b) => b.replace(/-/g, ' ')).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. AUTHENTIC FARMER'S ALMANAC WEATHER LORE & FOLK WISDOM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Lore of the Day (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1a3826] to-[#122619] text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-600/30 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <BookOpen className="w-4 h-4" />
            <span>Almanac Weather Lore of the Day</span>
          </div>

          <blockquote className="text-lg sm:text-xl font-bold font-serif-botanical leading-snug italic text-white">
            &ldquo;{todayLore.saying}&rdquo;
          </blockquote>

          <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-emerald-100/90 leading-relaxed">
            <strong className="text-white block font-mono text-[11px] uppercase tracking-wider">
              The Science Behind It:
            </strong>
            <p>{todayLore.scienceExplanation}</p>
          </div>

          <div className="text-[11px] font-mono text-emerald-300/80 pt-1">
            {todayLore.traditionNote} · {todayLore.historicalContext}
          </div>
        </div>

        {/* Folklore Archive & Categories (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#112217] rounded-3xl p-6 border border-stone-200 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#112217] dark:text-[#ecfdf5] font-serif-botanical">
                Folk Meteorology &amp; Agrarian Wisdom
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Centuries of time-tested proverbs tested against modern atmospheric physics.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
              {['All', 'Clouds & Sky', 'Wind & Air', 'Animals & Nature', 'Plants & Trees', 'Frost & Winter'].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveLoreCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      activeLoreCategory === cat
                        ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Lore cards list */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredLore.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-stone-50 dark:bg-[#172d1f] rounded-2xl border border-stone-200/80 dark:border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 font-serif-botanical">
                    &ldquo;{item.saying}&rdquo;
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-md">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {item.scienceExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
