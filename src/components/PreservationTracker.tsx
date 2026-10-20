import React, { useState } from 'react';
import { PantryItem, GardenLocation } from '../types/garden';
import { SAFE_CANNING_GUIDES, getAltitudeAdjustedCanningTime, getAltitudeAdjustedPressurePsi, getWeightedGaugePsi, FREEZING_BLANCH_GUIDES, FERMENTATION_GUIDES, CURING_GUIDES } from '../data/preservationData';
import { ShieldCheck, AlertTriangle, Scale, Thermometer, Clock, Plus, BookOpen, ExternalLink, Mountain } from 'lucide-react';
import { localDateStr } from '../services/dates';

interface PreservationTrackerProps {
  location: GardenLocation;
  pantryItems: PantryItem[];
  onAddPantryItem: (item: PantryItem) => void;
}

export const PreservationTracker: React.FC<PreservationTrackerProps> = ({
  location,
  pantryItems,
  onAddPantryItem,
}) => {
  const [elevation, setElevation] = useState<number>(location.elevationFt || 500);
  const [activeTab, setActiveTab] = useState<'canning' | 'freezing' | 'fermenting' | 'curing' | 'batches'>('canning');

  // Fermentation calculator state
  const [fermentWeightGrams, setFermentWeightGrams] = useState<number>(1000); // 1 kg cabbage
  const [targetSalinityPct, setTargetSalinityPct] = useState<number>(2.2);

  // New batch logging state
  const [batchCrop, setBatchCrop] = useState('');
  const [batchMethod, setBatchMethod] = useState<PantryItem['preservationType']>('water-bath-canned');
  const [batchQty, setBatchQty] = useState(6);
  const [batchUnit, setBatchUnit] = useState('quart jars');
  const [batchLocation, setBatchLocation] = useState<PantryItem['storageLocation']>('Pantry Shelf');
  const [batchNotes, setBatchNotes] = useState('');

  const calculatedSaltGrams = ((fermentWeightGrams * targetSalinityPct) / 100).toFixed(1);
  const calculatedSaltTbsp = (parseFloat(calculatedSaltGrams) / 17).toFixed(1); // approx 17g fine kosher salt per tbsp

  const handleLogBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCrop.trim()) return;

    const today = new Date();
    const bestBy = new Date(today);
    // Standard 1 year shelf life for home canned/frozen
    bestBy.setFullYear(bestBy.getFullYear() + 1);

    const newItem: PantryItem = {
      id: `batch-${Date.now()}`,
      cropName: batchCrop,
      preservationType: batchMethod,
      quantity: batchQty,
      unit: batchUnit,
      datePrepared: localDateStr(today),
      bestByDate: localDateStr(bestBy),
      storageLocation: batchLocation,
      notes: batchNotes,
      testedSourceReference: 'USDA Complete Guide / NCHFP Procedure',
    };

    onAddPantryItem(newItem);
    setBatchCrop('');
    setBatchNotes('');
    setActiveTab('batches');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Safe Home Food Preservation Center
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Authoritative procedures grounded in the USDA Complete Guide to Home Canning &amp; National Center for Home Food Preservation (NCHFP).
          </p>
        </div>

        {/* Altitude elevation selector */}
        <div className="bg-[#edf2ee] dark:bg-[#132218] border border-[#d6e2d8] dark:border-[rgba(16,185,129,0.3)] px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs">
          <Mountain className="w-4 h-4 text-emerald-700 dark:text-[#34d399] shrink-0" />
          <span className="text-[#3c5244] dark:text-[#cad9ce] font-medium">Your Elevation:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-[#183e25] dark:text-[#34d399]">
            <input aria-label="Your elevation in feet"
              type="number"
              value={elevation}
              onChange={e => setElevation(parseInt(e.target.value) || 0)}
              className="w-16 px-1.5 py-0.5 border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.12)] rounded-md bg-white dark:bg-[#0f1812] text-xs font-mono text-center text-[#122017] dark:text-[#f3f7f4]"
            />
            <span>ft</span>
          </div>
        </div>
      </div>

      {/* Strict Anti-Tampering Safety Banner */}
      <div className="bg-amber-500/10 dark:bg-amber-500/10 border-2 border-amber-500/35 dark:border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950 dark:text-amber-300">
            Strict Food Safety Protocol (Botulism Prevention)
          </p>
          <p className="leading-relaxed">
            Never guess canning processing times, alter vinegar acidity levels below 5%, or substitute untested thickeners. Low-acid vegetables (green beans, carrots, squash) <strong>MANDATE</strong> a calibrated pressure canner reaching 240°F to destroy deadly <em>Clostridium botulinum</em> bacterial spores. Water-bath canning is safe <strong>ONLY</strong> for high-acid foods (pH &lt; 4.6).
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)]">
        {[
          { id: 'canning', label: '🥫 Tested Canning & Altitude' },
          { id: 'fermenting', label: '🥬 Salt-Brine Fermentation Calculator' },
          { id: 'freezing', label: '❄️ Blanching & Freezing' },
          { id: 'curing', label: '🧅 Curing & Root Cellar' },
          { id: 'batches', label: `🏺 Preserved Pantry Log (${pantryItems.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shrink-0 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-xs'
                : 'bg-white dark:bg-[#131e17] border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] text-[#3c5244] dark:text-[#b6cfc0] hover:bg-[#edf2ee] dark:hover:bg-[#18271e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Tested Canning & Altitude Adjustment */}
      {activeTab === 'canning' && (
        <div className="space-y-5">
          <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs text-stone-700 flex items-center justify-between">
            <span>
              Canning at <strong>{elevation.toLocaleString()} ft</strong> elevation. Processing times and PSI requirements below have been automatically calibrated.
            </span>
            <span className="font-mono text-emerald-800 font-semibold">
              {elevation > 1000 ? `+${getAltitudeAdjustedCanningTime(0, elevation)} min water-bath correction applied` : 'Sea level baseline (<1,000 ft)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAFE_CANNING_GUIDES.map(guide => {
              // Water-bath: altitude adds time. Pressure canning: altitude raises the
              // pressure and the time stays the same (USDA Complete Guide).
              const adjustedPsi = guide.basePressurePsi
                ? getAltitudeAdjustedPressurePsi(guide.basePressurePsi, elevation)
                : null;
              const adjustedMinutes = adjustedPsi
                ? guide.baseProcessingTimeMin
                : getAltitudeAdjustedCanningTime(guide.baseProcessingTimeMin, elevation);
              const weightedGaugePsi = getWeightedGaugePsi(elevation);

              return (
                <div key={guide.crop} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#183a24]">{guide.crop}</h4>
                      <span className="text-[11px] text-stone-500">{guide.nchfpReference}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      guide.foodType === 'high-acid'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}>
                      {guide.approvedMethod}
                    </span>
                  </div>

                  {/* Calibration details */}
                  <div className="bg-[#f6f8f6] p-3 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-stone-700">Calibrated Processing Time:</span>
                      <span className="text-emerald-900 font-mono font-bold text-sm">
                        {adjustedMinutes} minutes
                      </span>
                    </div>
                    {adjustedPsi && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-stone-700">Required Pressure:</span>
                        <span className="text-rose-900 font-mono font-bold text-sm">
                          {adjustedPsi} PSI dial · {weightedGaugePsi} lb weighted
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-stone-500 pt-1">
                      Jar sizes: {guide.jarSizes}
                    </div>
                  </div>

                  {/* Critical Warning */}
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 text-[11px] leading-tight">
                    <strong>Safety Mandate:</strong> {guide.safetyWarnings}
                  </div>

                  {guide.acidificationRequired && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-[11px] leading-tight">
                      <strong>Acidification:</strong> {guide.acidificationRequired}
                    </div>
                  )}

                  {/* Steps */}
                  <div className="space-y-1">
                    <span className="font-bold text-stone-800 text-[11px]">Validated Procedure:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-stone-600 text-[11px]">
                      {guide.steps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Fermentation Calculator */}
      {activeTab === 'fermenting' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calculator Card */}
            <div className="md:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-800" />
                Lacto-Fermentation Salt Ratio Calculator
              </h3>
              <p className="text-stone-600">
                Lactic acid bacteria (LAB) require accurate salinity (2.0% - 2.5% for dry-salted cabbage; 3.5% - 5% for cucumber water brines) to suppress rot-causing molds.
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Vegetable Weight (grams)
                </label>
                <input aria-label="Vegetable Weight (grams)"
                  type="number"
                  min="100"
                  max="10000"
                  step="50"
                  value={fermentWeightGrams}
                  onChange={e => setFermentWeightGrams(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-stone-300 rounded-xl font-mono text-sm"
                />
                <span className="text-[10px] text-stone-400">
                  Tip: 1 average head of green cabbage is ~900-1,200 grams.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Target Salinity: {targetSalinityPct}%
                </label>
                <input aria-label="Target salinity (%)"
                  type="range"
                  min="1.8"
                  max="4.0"
                  step="0.1"
                  value={targetSalinityPct}
                  onChange={e => setTargetSalinityPct(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              {/* Result Box */}
              <div className="bg-[#f3f7f4] border-2 border-emerald-600/30 p-4 rounded-xl text-center space-y-1">
                <span className="text-stone-600 text-xs font-medium">Required Pure Kosher/Pickling Salt:</span>
                <div className="text-3xl font-extrabold text-[#183a24] font-mono">
                  {calculatedSaltGrams} g
                </div>
                <div className="text-xs text-stone-500">
                  Approx. <strong>{calculatedSaltTbsp} tablespoons</strong> (fine grain pickling salt)
                </div>
              </div>

              <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <strong>Salt Rule:</strong> Use non-iodized pure pickling or kosher salt without anti-caking agents. Table salt additives cloud brine and impede bacterial fermentation.
              </div>
            </div>

            {/* Guides */}
            <div className="md:col-span-7 space-y-4">
              {FERMENTATION_GUIDES.map(f => (
                <div key={f.item} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-[#183a24]">{f.item}</h4>
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-[11px]">
                    <div><strong>Salt Ratio:</strong> {f.saltConcentration}</div>
                    <div><strong>Temperature:</strong> {f.optimumTempF}</div>
                    <div><strong>Ferment Time:</strong> {f.durationDays}</div>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px] pt-1">
                    {f.criticalRules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Freezing & Blanching */}
      {activeTab === 'freezing' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical">
              NCHFP Boiling Water Blanching Timetable for Freezing
            </h3>
            <p className="text-stone-600 mt-0.5">
              Blanching stops enzymatic action that ruins color, texture, and vitamins during frozen storage. Plunge immediately into ice water for the exact same duration after boiling.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-700">
                  <th className="py-2.5 px-3">Crop Produce</th>
                  <th className="py-2.5 px-3">Blanch Method</th>
                  <th className="py-2.5 px-3">Boiling Minutes</th>
                  <th className="py-2.5 px-3">Ice Bath Minutes</th>
                  <th className="py-2.5 px-3">Prep &amp; Freezing Technique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                {FREEZING_BLANCH_GUIDES.map(b => (
                  <tr key={b.crop} className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-semibold text-stone-900">{b.crop}</td>
                    <td className="py-2 px-3">{b.blanchMethod}</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-700">{b.minutes} min</td>
                    <td className="py-2 px-3 font-mono font-bold text-sky-700">{b.coolDownMinutes} min</td>
                    <td className="py-2 px-3 text-[11px]">{b.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Curing & Storage */}
      {activeTab === 'curing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURING_GUIDES.map(c => (
            <div key={c.crop} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#183a24]">{c.crop} Curing Protocol</h4>

              <div className="bg-[#f6f8f6] p-3 rounded-xl border border-stone-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500">Curing Temp:</span>
                  <span className="font-semibold text-stone-800">{c.temperatureF}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Humidity:</span>
                  <span className="font-semibold text-stone-800">{c.humidityPct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Cure Duration:</span>
                  <span className="font-bold text-emerald-800">{c.durationDays} days</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-stone-800 block mb-0.5">Signs of Done:</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">{c.signsOfDone}</p>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="font-semibold text-stone-800 block mb-0.5">Cellar Storage:</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">{c.longTermStorageConditions}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Preserved Pantry Log & Quick Logger */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          {/* Quick Logger Form */}
          <form
            onSubmit={handleLogBatch}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs"
          >
            <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" />
              Log New Preserved Harvest Batch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Batch Description</label>
                <input aria-label="Batch Description"
                  type="text"
                  value={batchCrop}
                  onChange={e => setBatchCrop(e.target.value)}
                  placeholder="e.g. Acidified Marinara Sauce, Bread & Butter Pickles..."
                  className="w-full p-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Preservation Method</label>
                <select aria-label="Preservation Method"
                  value={batchMethod}
                  onChange={e => setBatchMethod(e.target.value as any)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                >
                  <option value="water-bath-canned">Water-Bath Canned</option>
                  <option value="pressure-canned">Pressure Canned</option>
                  <option value="frozen">Frozen (Blanched)</option>
                  <option value="fermented">Lacto-Fermented</option>
                  <option value="dehydrated">Dehydrated</option>
                  <option value="cured-storage">Cured Cold Storage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Quantity &amp; Unit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={batchQty}
                    onChange={e => setBatchQty(parseInt(e.target.value) || 1)}
                    className="w-16 p-2 border border-stone-300 rounded-xl font-mono text-center"
                  />
                  <input
                    type="text"
                    value={batchUnit}
                    onChange={e => setBatchUnit(e.target.value)}
                    className="flex-1 p-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Storage Location</label>
                <select aria-label="Storage Location"
                  value={batchLocation}
                  onChange={e => setBatchLocation(e.target.value as any)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                >
                  <option value="Pantry Shelf">Pantry Shelf (Dark &amp; Cool)</option>
                  <option value="Freezer">Deep Freezer</option>
                  <option value="Root Cellar">Root Cellar / Unheated Basement</option>
                  <option value="Crisper">Refrigerator Crisper</option>
                  <option value="Cool Dark Closet">Cool Dark Closet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Recipe / Batch Notes</label>
                <input aria-label="Recipe / Batch Notes"
                  type="text"
                  value={batchNotes}
                  onChange={e => setBatchNotes(e.target.value)}
                  placeholder="e.g. 2 tbsp lemon juice added; processed 45 min at 11 PSI"
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors"
              >
                Log Preserved Batch
              </button>
            </div>
          </form>

          {/* Existing Inventory Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pantryItems.map(item => (
              <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">{item.cropName}</h4>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-mono text-[10px] uppercase font-semibold">
                    {item.preservationType.replace('-', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-stone-600">
                  <span className="font-bold text-emerald-800 text-sm">{item.quantity} {item.unit}</span>
                  <span>·</span>
                  <span>Location: <strong>{item.storageLocation}</strong></span>
                </div>

                <div className="text-[11px] text-stone-500 flex justify-between pt-1 border-t border-stone-100">
                  <span>Prepared: {item.datePrepared}</span>
                  <span>Safe Until: <strong className="text-stone-800">{item.bestByDate}</strong></span>
                </div>

                {item.testedSourceReference && (
                  <p className="text-[10px] text-stone-400 italic">
                    Procedure: {item.testedSourceReference}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
