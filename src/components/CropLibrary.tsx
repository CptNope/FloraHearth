import React, { useState, useEffect } from 'react';
import { Crop } from '../types/garden';
import { CROPS_DATA } from '../data/cropsData';
import { Search, Filter, ShieldAlert, Sparkles, Scale, X, Droplets, Sun, Ruler, Clock, Heart, AlertTriangle } from 'lucide-react';

interface CropLibraryProps {
  onSelectForPlanner?: (crop: Crop) => void;
}

export const CropLibrary: React.FC<CropLibraryProps> = ({ onSelectForPlanner }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [onlyContainerSafe, setOnlyContainerSafe] = useState(false);
  const [activeCropDetail, setActiveCropDetail] = useState<Crop | null>(null);
  const [compareList, setCompareList] = useState<Crop[]>([]);

  useEffect(() => {
    if (!activeCropDetail) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCropDetail(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCropDetail]);

  const filteredCrops = CROPS_DATA.filter(crop => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      crop.family.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || crop.difficulty === selectedDifficulty;
    const matchesContainer = !onlyContainerSafe || crop.containerSuitable;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesContainer;
  });

  const toggleCompare = (crop: Crop, e: React.MouseEvent) => {
    e.stopPropagation();
    const exists = compareList.find(c => c.id === crop.id);
    if (exists) {
      setCompareList(compareList.filter(c => c.id !== crop.id));
    } else {
      if (compareList.length >= 3) {
        setCompareList([...compareList.slice(1), crop]);
      } else {
        setCompareList([...compareList, crop]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Horticultural Crop Library &amp; Growing Guides
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Authoritative growing data, variety specifics, realistic yield benchmarks, and child &amp; pet hazard safety.
          </p>
        </div>

        {compareList.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
            <Scale className="w-4 h-4 text-emerald-800" />
            <span className="font-semibold text-emerald-950">
              Comparing {compareList.length}/3 crops
            </span>
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="text-stone-400 hover:text-stone-700 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crops, cultivars, or families (e.g. Cherokee Purple, Solanaceae, Lacinato)..."
              aria-label="Search crops, cultivars, or botanical families"
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Category Tabs */}
          <div role="tablist" aria-label="Crop categories" className="flex items-center gap-1 overflow-x-auto p-1 bg-[#edf2ee] dark:bg-[#111c15] border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] rounded-xl">
            {[
              { id: 'all', label: 'All Crops' },
              { id: 'vegetable', label: 'Vegetables' },
              { id: 'herb', label: 'Culinary Herbs' },
              { id: 'medicinal-herb', label: '🌿 Medicinal Herbs' },
              { id: 'fruit', label: 'Fruits' },
              { id: 'flower', label: 'Beneficial Flowers' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-2xs'
                    : 'text-[#3c5244] dark:text-[#b6cfc0] hover:text-[#122017] dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <label htmlFor="crop-difficulty-filter" className="text-[11px] font-medium text-stone-500">Difficulty:</label>
            <select
              id="crop-difficulty-filter"
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              aria-label="Filter crops by growing difficulty level"
              className="text-xs py-1 px-2 border border-stone-200 rounded-lg bg-stone-50"
            >
              <option value="all">Any Difficulty</option>
              <option value="Beginner Friendly">Beginner Friendly</option>
              <option value="Moderate">Moderate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyContainerSafe}
              onChange={e => setOnlyContainerSafe(e.target.checked)}
              aria-label="Filter only container and patio suitable crops"
              className="rounded-xs text-emerald-700 accent-emerald-700"
            />
            <span className="text-xs">Container &amp; Patio Suitable</span>
          </label>

          <span className="ml-auto text-[11px] text-stone-400">
            Showing {filteredCrops.length} of {CROPS_DATA.length} crops
          </span>
        </div>
      </div>

      {/* Side-by-Side Comparison Drawer (if activated) */}
      {compareList.length > 0 && (
        <div className="bg-[#f4f7f4] border-2 border-emerald-600/30 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#d4e2d6] pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-800" />
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical">Side-by-Side Crop Comparison</h3>
            </div>
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="text-xs text-stone-500 hover:text-stone-900 underline"
            >
              Clear comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareList.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.iconEmoji}</span>
                  <button
                    type="button"
                    onClick={() => setCompareList(compareList.filter(item => item.id !== c.id))}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{c.name}</h4>
                <div className="text-[11px] text-stone-500 italic">{c.scientificName} · {c.family}</div>

                <div className="border-t border-stone-100 pt-2 space-y-1.5 text-[11px]">
                  <div><strong>Maturity:</strong> {c.daysToMaturityRange[0]}-{c.daysToMaturityRange[1]} days</div>
                  <div><strong>SFG Density:</strong> {c.sfgPerSquare} / sq ft</div>
                  <div><strong>Soil pH:</strong> {c.soilPhMin} - {c.soilPhMax}</div>
                  <div><strong>Water Need:</strong> {c.waterNeeds}</div>
                  <div><strong>Yield:</strong> {c.realisticYield}</div>
                  <div><strong>Retail Value:</strong> ~${c.retailGroceryValuePerLb.toFixed(2)}/lb</div>
                  <div><strong>Container Safe:</strong> {c.containerSuitable ? `Yes (${c.containerMinGallons} gal)` : 'No'}</div>
                  <div className="pt-1">
                    <strong>Hazard:</strong>{' '}
                    <span className={c.childPetHazard.hasHazard ? 'text-amber-700 font-semibold' : 'text-emerald-700'}>
                      {c.childPetHazard.hasHazard ? c.childPetHazard.details : 'Completely safe for children and pets'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map(crop => {
          const isComparing = compareList.some(c => c.id === crop.id);

          return (
            <div
              key={crop.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveCropDetail(crop)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCropDetail(crop);
                }
              }}
              aria-label={`View complete growing guide for ${crop.name}, ${crop.difficulty}`}
              className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1.5 bg-[#f5f8f5] rounded-xl group-hover:scale-105 transition-transform" aria-hidden="true">
                      {crop.iconEmoji}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#183a24] group-hover:text-emerald-900 transition-colors">
                        {crop.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 italic">
                        {crop.family} · {crop.scientificName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleCompare(crop, e)}
                    aria-label={isComparing ? `Remove ${crop.name} from side-by-side comparison` : `Add ${crop.name} to side-by-side comparison`}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isComparing
                        ? 'bg-emerald-700 text-white'
                        : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                    }`}
                    title={isComparing ? 'Remove from compare' : 'Add to compare'}
                  >
                    <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Core Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs my-3 bg-[#faf9f5] p-2.5 rounded-xl border border-stone-200/50">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Days</span>
                    <span className="font-bold text-stone-800">
                      {crop.daysToMaturityRange[0]}-{crop.daysToMaturityRange[1]}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">SFG</span>
                    <span className="font-bold text-emerald-800">
                      {crop.sfgPerSquare}/sq ft
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Value</span>
                    <span className="font-bold text-stone-800">
                      ${crop.retailGroceryValuePerLb.toFixed(2)}/lb
                    </span>
                  </div>
                </div>

                {/* Varieties sample */}
                <div className="text-[11px] text-stone-600 line-clamp-2 mb-2">
                  <strong>Cultivars:</strong> {crop.varieties.map(v => v.name.split('(')[0].trim()).join(', ')}
                </div>

                {crop.category === 'medicinal-herb' && (
                  <div className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-1 rounded-lg mb-2 flex items-center gap-1.5 font-medium">
                    <span>🌿</span>
                    <span className="truncate">Medicinal: {crop.medicinalUses?.slice(0, 45)}...</span>
                  </div>
                )}

                {/* Child/Pet Toxicity warning badge */}
                {crop.childPetHazard.hasHazard && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 px-2 py-1 rounded-lg mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="truncate">Toxicity Caution: Foliage/leaves</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-medium text-stone-700">{crop.difficulty}</span>
                <span className="text-emerald-800 font-semibold group-hover:underline">
                  View Full Guide →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Crop Modal */}
      {activeCropDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-modal-detail-heading"
        >
          <div className="bg-[#fcfcf9] dark:bg-[#0e1912] border border-stone-300 dark:border-[#223d2e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#1c3a27] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-white/10 rounded-xl" aria-hidden="true">
                  {activeCropDetail.iconEmoji}
                </span>
                <div>
                  <h3 id="crop-modal-detail-heading" className="text-xl font-bold tracking-tight font-serif-botanical text-white">
                    {activeCropDetail.name}
                  </h3>
                  <p className="text-xs text-emerald-200/90 italic">
                    {activeCropDetail.scientificName} · Family: {activeCropDetail.family}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCropDetail(null)}
                aria-label={`Close ${activeCropDetail.name} details modal`}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-800 dark:text-[#d3e3d8]">
              {/* Variety breakdown */}
              <div>
                <h4 className="font-bold text-stone-900 dark:text-[#ecfdf5] text-sm mb-2">Proven Cultivars &amp; Varieties</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCropDetail.varieties.map(v => (
                    <div key={v.name} className="p-2.5 bg-white dark:bg-[#13241a] border border-stone-200 dark:border-[#223d2e] rounded-xl">
                      <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-[#ecfdf5]">
                        <span>{v.name}</span>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">{v.daysToMaturity}d</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-[#a0b4a7] mt-1">{v.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growing Requirements Specs */}
              <div>
                <h4 className="font-bold text-stone-900 dark:text-[#ecfdf5] text-sm mb-2">Planting &amp; Soil Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-[#f6f8f6] dark:bg-[#14231b] p-3 rounded-xl border border-stone-200 dark:border-[#223d2e]">
                  <div>
                    <span className="text-stone-600 dark:text-stone-400 block font-semibold text-[11px]">Planting Depth</span>
                    <span className="font-semibold text-stone-900 dark:text-white">{activeCropDetail.plantingDepthInches}</span>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400 block font-semibold text-[11px]">Spacing</span>
                    <span className="font-semibold text-stone-900 dark:text-white">{activeCropDetail.spacingInches}&quot; plant / {activeCropDetail.rowSpacingInches}&quot; row</span>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400 block font-semibold text-[11px]">SFG Density</span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">{activeCropDetail.sfgPerSquare} per sq ft</span>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400 block font-semibold text-[11px]">Sunlight</span>
                    <span className="font-semibold text-stone-900 dark:text-white capitalize">{activeCropDetail.sunlight.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400 block font-semibold text-[11px]">Soil pH Range</span>
                    <span className="font-semibold text-stone-900 dark:text-white">{activeCropDetail.soilPhMin} - {activeCropDetail.soilPhMax}</span>
                  </div>
                  <div>
                    <span className="text-stone-600 dark:text-stone-400 block font-semibold text-[11px]">Watering Needs</span>
                    <span className="font-semibold text-stone-900 dark:text-white capitalize">{activeCropDetail.waterNeeds}</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-700 dark:text-[#b4c7bb] mt-2">
                  <strong className="text-stone-900 dark:text-white">Soil &amp; Fertility:</strong> {activeCropDetail.soilPreferences}
                </p>
              </div>

              {/* Yields & Harvest Guidance */}
              <div className="bg-white dark:bg-[#13241a] p-3.5 rounded-xl border border-stone-200 dark:border-[#223d2e] space-y-1.5">
                <h4 className="font-bold text-stone-900 dark:text-[#ecfdf5]">Harvest &amp; Realistic Yields</h4>
                <p className="text-stone-800 dark:text-[#d3e3d8]"><strong className="text-stone-900 dark:text-white">Realistic Yield:</strong> {activeCropDetail.realisticYield}</p>
                <p className="text-stone-700 dark:text-[#b4c7bb] leading-relaxed">{activeCropDetail.harvestGuidance}</p>
                {activeCropDetail.curingGuidance && (
                  <p className="text-stone-700 dark:text-[#b4c7bb] pt-1 border-t border-stone-100 dark:border-[#223d2e]">
                    <strong className="text-stone-900 dark:text-white">Curing Protocol:</strong> {activeCropDetail.curingGuidance}
                  </p>
                )}
              </div>

              {/* Medicinal & Apothecary Guidance (if available) */}
              {activeCropDetail.medicinalUses && (
                <div className="bg-[#f0f7f4] dark:bg-[#12281e] border border-[#cbe1d6] dark:border-[#1d4633] p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                    <span className="text-base" aria-hidden="true">🌿</span>
                    <span>Herbal Apothecary &amp; Traditional Uses</span>
                  </div>
                  <p className="text-stone-800 dark:text-[#d0e1d5] text-[11px] leading-relaxed">
                    <strong className="text-stone-900 dark:text-white">Therapeutic Actions:</strong> {activeCropDetail.medicinalUses}
                  </p>
                  {activeCropDetail.medicinalPreparation && (
                    <p className="text-stone-700 dark:text-[#b0c4b6] text-[11px] pt-1 border-t border-[#cbe1d6]/80 dark:border-[#1d4633] leading-relaxed">
                      <strong className="text-stone-900 dark:text-white">Traditional Preparation:</strong> {activeCropDetail.medicinalPreparation}
                    </p>
                  )}
                </div>
              )}

              {/* Companions & Antagonists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Helpful Companions</span>
                  <p className="text-emerald-950 dark:text-emerald-200 font-medium">{activeCropDetail.companions.join(', ')}</p>
                  <p className="text-[11px] text-emerald-900/90 dark:text-emerald-300/90 pt-1">{activeCropDetail.companionNotes}</p>
                </div>

                <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 dark:text-rose-300 block">Antagonists / Incompatible</span>
                  <p className="text-rose-950 dark:text-rose-200 font-medium">
                    {activeCropDetail.antagonists.length > 0 ? activeCropDetail.antagonists.join(', ') : 'None documented'}
                  </p>
                </div>
              </div>

              {/* Child & Pet Safety Notice */}
              <div className={`p-3 rounded-xl border ${
                activeCropDetail.childPetHazard.hasHazard
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                  : 'bg-stone-50 dark:bg-[#14231b] border-stone-200 dark:border-[#223d2e] text-stone-800 dark:text-stone-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                  Child &amp; Pet Safety Profile: {activeCropDetail.childPetHazard.severity.toUpperCase()}
                </div>
                <p className="text-[11px] leading-relaxed">{activeCropDetail.childPetHazard.details}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 dark:bg-[#0a140e] border-t border-stone-200 dark:border-[#223d2e] px-6 py-3 flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                DLI target: {activeCropDetail.dliRecommendedMol}
              </span>
              <button
                type="button"
                onClick={() => setActiveCropDetail(null)}
                className="px-4 py-1.5 bg-[#234730] dark:bg-[#10b981] text-white dark:text-[#06150b] font-semibold rounded-xl hover:bg-[#1a3624] dark:hover:bg-[#34d399] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
