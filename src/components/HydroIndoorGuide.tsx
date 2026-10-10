import React, { useState } from 'react';
import { HYDROPONIC_SPECS } from '../data/ipmSoilData';
import { Lightbulb, Waves, Fish, Thermometer, ShieldAlert, Zap, Sparkles } from 'lucide-react';

export const HydroIndoorGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lighting' | 'hydro' | 'aquaponics'>('lighting');

  // Grow light DLI calculator state
  const [ppfdValue, setPpfdValue] = useState<number>(350); // umol/m2/s
  const [hoursOn, setHoursOn] = useState<number>(14); // 14 hours per day

  // Daily Light Integral formula: PPFD * hours * 3600 / 1,000,000
  const calculatedDli = ((ppfdValue * hoursOn * 3600) / 1000000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Indoor Grow Lights, Hydroponics &amp; Aquaponics
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Calculate exact PPFD Daily Light Integrals (DLI), water nutrient EC/pH management, and biological aquaponic nitrogen cycling.
          </p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('lighting')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'lighting' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            💡 Grow Light DLI Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hydro')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'hydro' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            💧 Hydroponic Systems &amp; EC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aquaponics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'aquaponics' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            🐟 Aquaponics &amp; Nitrogen Cycle
          </button>
        </div>
      </div>

      {/* TAB 1: Lighting DLI Calculator */}
      {activeTab === 'lighting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calculator Card */}
            <div className="md:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Daily Light Integral (DLI) Calculator
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Plants respond to total photons received per 24 hours (DLI in mol/m²/day), not just instantaneous wattage.
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  PPFD at Canopy Height: <span className="font-mono text-emerald-800 font-bold">{ppfdValue} µmol/m²/s</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="25"
                  value={ppfdValue}
                  onChange={e => setPpfdValue(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>100 (Seedlings)</span>
                  <span>400 (Greens/Herbs)</span>
                  <span>800+ (Fruiting Tomatoes)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photoperiod: <span className="font-mono text-emerald-800 font-bold">{hoursOn} hours/day</span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="1"
                  value={hoursOn}
                  onChange={e => setHoursOn(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* DLI Output */}
              <div className="bg-[#faf8f2] border-2 border-amber-300 p-4 rounded-xl text-center space-y-1">
                <span className="text-stone-600 text-xs font-medium">Delivered Daily Light Integral:</span>
                <div className="text-3xl font-extrabold text-amber-950 font-mono">
                  {calculatedDli} mol/m²/day
                </div>
                <div className="text-xs text-stone-600">
                  {parseFloat(calculatedDli) < 12 && '🌱 Good for low-light microgreens & seed sprouting'}
                  {parseFloat(calculatedDli) >= 12 && parseFloat(calculatedDli) < 18 && '🥗 Optimal target for lettuce, basil, kale & culinary herbs'}
                  {parseFloat(calculatedDli) >= 18 && parseFloat(calculatedDli) < 25 && '🍓 Strong target for strawberries & dwarf peppers'}
                  {parseFloat(calculatedDli) >= 25 && '🍅 High-energy target required for heavy fruiting indeterminate tomatoes'}
                </div>
              </div>
            </div>

            {/* Target DLI Chart */}
            <div className="md:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#183a24]">Target DLI Benchmarks for Indoor Crops</h4>
              <div className="space-y-2">
                {[
                  { crop: 'Lettuce & Leafy Greens', target: '12 - 16 mol/m²/day', hours: '14 - 16 hrs', ppfd: '250 - 300 µmol/m²/s' },
                  { crop: 'Sweet Basil & Kitchen Herbs', target: '14 - 18 mol/m²/day', hours: '14 - 16 hrs', ppfd: '300 - 350 µmol/m²/s' },
                  { crop: 'Day-Neutral Strawberries', target: '18 - 22 mol/m²/day', hours: '12 - 14 hrs', ppfd: '400 - 500 µmol/m²/s' },
                  { crop: 'Fruiting Tomatoes & Peppers', target: '22 - 30 mol/m²/day', hours: '14 - 16 hrs', ppfd: '500 - 700 µmol/m²/s' },
                ].map(item => (
                  <div key={item.crop} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center justify-between">
                    <div>
                      <strong className="text-stone-900 block">{item.crop}</strong>
                      <span className="text-[11px] text-stone-500">PPFD Range: {item.ppfd} ({item.hours})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      {item.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hydroponics Specs */}
      {activeTab === 'hydro' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HYDROPONIC_SPECS.map(spec => (
              <div key={spec.systemType} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-700" />
                  <h4 className="font-bold text-sm text-[#183a24]">{spec.systemType}</h4>
                </div>

                <div className="space-y-1 bg-[#f4f8fa] p-3 rounded-xl border border-sky-100 text-[11px]">
                  <div><strong>Ideal Crops:</strong> {spec.bestCrops.join(', ')}</div>
                  <div><strong>pH Window:</strong> <span className="font-mono text-emerald-800 font-bold">{spec.targetPh}</span></div>
                  <div><strong>EC / PPM:</strong> <span className="font-mono text-sky-900 font-bold">{spec.targetEcMs}</span></div>
                  <div><strong>Water Temp:</strong> <span className="font-mono text-indigo-900 font-bold">{spec.waterTempF}</span></div>
                </div>

                <div className="text-[11px] text-stone-600">
                  <strong>Monitoring:</strong> {spec.monitoringRoutine}
                </div>

                <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  {spec.prosAndCons}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Aquaponics & Nitrogen Cycle */}
      {activeTab === 'aquaponics' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-start gap-3">
            <span className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800">
              <Fish className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#183a24] font-serif-botanical">
                Aquaponics Nitrogen Cycle &amp; Biological Equilibrium
              </h3>
              <p className="text-stone-600 mt-0.5">
                Combines aquaculture (raising aquatic fish) and hydroponics (soil-less plant production) via a 2-stage beneficial bacterial biofilter.
              </p>
            </div>
          </div>

          {/* Biological Cycle Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="font-mono font-bold text-rose-900 text-xs">1. Fish Waste (Ammonia)</span>
              <p className="text-[11px] text-rose-950">
                Fish excrete total ammonia nitrogen (NH3 / NH4+). Lethal to fish at levels above 0.5 ppm.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-mono font-bold text-amber-900 text-xs">2. Nitrosomonas Bacteria</span>
              <p className="text-[11px] text-amber-950">
                Converts toxic ammonia into Nitrite (NO2-). Still highly toxic to fish at &gt;0.25 ppm.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-mono font-bold text-emerald-900 text-xs">3. Nitrobacter Bacteria</span>
              <p className="text-[11px] text-emerald-950">
                Converts nitrite into Nitrate (NO3-). Completely harmless to fish and primary plant food!
              </p>
            </div>
          </div>

          {/* Critical Caution for Fish Safety */}
          <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-950 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>ZERO Pesticide Policy in Aquaponics:</strong>
              <p className="leading-relaxed text-[11px]">
                NEVER use terrestrial chemical sprays, copper fungicides, neem oil drenches, or synthetic garden fertilizers in or around an aquaponic system. Even trace droplet drift will instantly kill your fish and collapse the biological filter. Use only physical netting and biological beneficial predators.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
