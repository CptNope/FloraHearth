import React, { useState, useEffect } from 'react';
import { Crop, SeedPacket, GardenLocation } from '../types/garden';
import { CROPS_DATA, getCropById } from '../data/cropsData';
import {
  Search,
  Filter,
  ShieldAlert,
  Sparkles,
  Scale,
  X,
  Droplets,
  Sun,
  Ruler,
  Clock,
  Heart,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Package,
  Calendar,
  CheckCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface CropLibraryProps {
  onSelectForPlanner?: (crop: Crop) => void;
  seeds?: SeedPacket[];
  onAddSeed?: (seed: SeedPacket) => void;
  onUpdateSeed?: (seed: SeedPacket) => void;
  onDeleteSeed?: (id: string) => void;
  location?: GardenLocation;
}

export const CropLibrary: React.FC<CropLibraryProps> = ({
  onSelectForPlanner,
  seeds = [],
  onAddSeed,
  onUpdateSeed,
  onDeleteSeed,
  location,
}) => {
  const [activeTab, setActiveTab] = useState<'encyclopedia' | 'seeds'>('encyclopedia');

  // Encyclopedia states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [onlyContainerSafe, setOnlyContainerSafe] = useState(false);
  const [activeCropDetail, setActiveCropDetail] = useState<Crop | null>(null);
  const [compareList, setCompareList] = useState<Crop[]>([]);

  // Seed Stash states
  const [seedSearch, setSeedSearch] = useState('');
  const [filterPlantNowOnly, setFilterPlantNowOnly] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<SeedPacket | null>(null);

  // Form states for seed modal
  const [formCropId, setFormCropId] = useState('tomato');
  const [formVariety, setFormVariety] = useState('Cherokee Purple');
  const [formBrand, setFormBrand] = useState('Baker Creek Heirloom');
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formStatus, setFormStatus] = useState<SeedPacket['quantityStatus']>('full');
  const [formGermPct, setFormGermPct] = useState<number>(90);
  const [formNotes, setFormNotes] = useState('');

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

  // Seed Viability Calculation
  const currentYear = new Date().getFullYear();
  const getSeedViability = (cropId: string, yearBought: number) => {
    const crop = getCropById(cropId);
    const age = Math.max(0, currentYear - yearBought);

    // University Extension average seed storage lifespan
    let maxViableYears = 3;
    let fastLossFamily = false;

    if (crop?.family === 'Alliaceae') {
      maxViableYears = 1; // Onions, leeks lose vigor fast!
      fastLossFamily = true;
    } else if (crop?.id === 'parsnip') {
      maxViableYears = 1; // Parsnip seed notoriously expires after 1 season
      fastLossFamily = true;
    } else if (crop?.family === 'Solanaceae' || crop?.family === 'Cucurbitaceae' || crop?.family === 'Brassicaceae') {
      maxViableYears = 4; // Tomatoes, brassicas, squash keep 4-5 years
    } else if (crop?.id === 'sweet-corn' || crop?.id === 'spinach') {
      maxViableYears = 2;
    }

    if (age <= 1 && !fastLossFamily) {
      return { status: 'excellent', text: 'Fresh (High Germination)', badgeClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' };
    }
    if (age <= maxViableYears) {
      return { status: 'good', text: `${age} yr old (Good Germination)`, badgeClass: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' };
    }
    return {
      status: 'warning',
      text: `⚠️ ${age} yrs old (Low Viability: Damp paper towel test recommended!)`,
      badgeClass: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 font-semibold',
      needsWarning: true,
    };
  };

  // Check if a crop can be planted now (current season)
  const isPlantableNow = (cropId: string) => {
    const crop = getCropById(cropId);
    if (!crop || !location) return false;
    // Current month (1-12)
    const currentMonth = new Date().getMonth() + 1;
    // Fall planting in autumn (months 8-10) or spring planting in months 2-6
    if (crop.plantingTiming.fallPlantingWeeksBeforeFirstFrost && (currentMonth >= 8 && currentMonth <= 10)) {
      return true;
    }
    if (location.isMildWinter && crop.plantingTiming.overwinteringSafe && (currentMonth >= 9 || currentMonth <= 3)) {
      return true;
    }
    if (currentMonth >= 2 && currentMonth <= 6) {
      return true;
    }
    return false;
  };

  const openAddSeedModal = () => {
    setEditingSeed(null);
    setFormCropId('tomato');
    setFormVariety('Cherokee Purple');
    setFormBrand('Baker Creek');
    setFormYear(new Date().getFullYear());
    setFormStatus('full');
    setFormGermPct(90);
    setFormNotes('');
    setIsSeedModalOpen(true);
  };

  const openEditSeedModal = (seed: SeedPacket) => {
    setEditingSeed(seed);
    setFormCropId(seed.cropId);
    setFormVariety(seed.varietyName);
    setFormBrand(seed.brand || '');
    setFormYear(seed.yearBought);
    setFormStatus(seed.quantityStatus);
    setFormGermPct(seed.germinationRatePct || 85);
    setFormNotes(seed.notes || '');
    setIsSeedModalOpen(true);
  };

  const handleSaveSeed = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SeedPacket = {
      id: editingSeed ? editingSeed.id : `seed-${Date.now()}`,
      cropId: formCropId,
      varietyName: formVariety.trim(),
      brand: formBrand.trim(),
      yearBought: Number(formYear),
      quantityStatus: formStatus,
      germinationRatePct: Number(formGermPct),
      notes: formNotes.trim(),
    };

    if (editingSeed && onUpdateSeed) {
      onUpdateSeed(payload);
    } else if (onAddSeed) {
      onAddSeed(payload);
    }
    setIsSeedModalOpen(false);
  };

  // Filter seeds
  const displayedSeeds = seeds.filter(seed => {
    const crop = getCropById(seed.cropId);
    const matchesSearch =
      seed.varietyName.toLowerCase().includes(seedSearch.toLowerCase()) ||
      (crop && crop.name.toLowerCase().includes(seedSearch.toLowerCase())) ||
      (seed.brand && seed.brand.toLowerCase().includes(seedSearch.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterPlantNowOnly && !isPlantableNow(seed.cropId)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223d2e]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] dark:text-[#e4efe7] font-serif-botanical">
            Horticultural Crop Library &amp; Seed Stash
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Browse 70+ vegetable and herb guides, audit packet germination viability, and discover what you can plant right now with seeds you already own.
          </p>
        </div>

        <div role="tablist" aria-label="Crop library and seed inventory tabs" className="flex bg-stone-100 dark:bg-[#111c15] p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'encyclopedia'}
            onClick={() => setActiveTab('encyclopedia')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'encyclopedia' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Crop Guides (70+)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'seeds'}
            onClick={() => setActiveTab('seeds')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'seeds' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Seed Inventory ({seeds.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 2: Seed Inventory & Viability */}
      {activeTab === 'seeds' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={seedSearch}
                  onChange={e => setSeedSearch(e.target.value)}
                  placeholder="Search seed varieties or brands..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-stone-800 dark:text-white"
                />
              </div>

              {/* Plant Now Filter */}
              <button
                type="button"
                onClick={() => setFilterPlantNowOnly(!filterPlantNowOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filterPlantNowOnly
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-[#132219] text-stone-700 dark:text-stone-300 border-stone-300 dark:border-[#223d2e] hover:bg-stone-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>What Can I Plant This Week?</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openAddSeedModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422] transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Seed Packet</span>
            </button>
          </div>

          {/* Seed Packets Grid */}
          {displayedSeeds.length === 0 ? (
            <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-8 text-center text-stone-500 text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto text-stone-400" />
              <p>No seed packets found matching your filter.</p>
              {filterPlantNowOnly && (
                <button
                  type="button"
                  onClick={() => setFilterPlantNowOnly(false)}
                  className="text-xs text-emerald-800 dark:text-emerald-400 underline font-semibold"
                >
                  Clear &ldquo;Plant this week&rdquo; filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSeeds.map(seed => {
                const crop = getCropById(seed.cropId);
                const viability = getSeedViability(seed.cropId, seed.yearBought);
                const plantNow = isPlantableNow(seed.cropId);

                return (
                  <div
                    key={seed.id}
                    className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-4 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl shrink-0">{crop?.iconEmoji || '🌱'}</span>
                        <div>
                          <h4 className="font-bold text-stone-900 dark:text-white text-sm leading-tight">
                            {seed.varietyName}
                          </h4>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">
                            {crop?.name.split('(')[0]} · {seed.brand || 'Heirloom / Saved'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditSeedModal(seed)}
                          aria-label={`Edit ${seed.varietyName}`}
                          className="p-1 text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove "${seed.varietyName}" from seed stash?`)) {
                              onDeleteSeed?.(seed.id);
                            }
                          }}
                          aria-label={`Delete ${seed.varietyName}`}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Plant Now Badge */}
                    {plantNow && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>In Season: Plant Now This Week!</span>
                      </div>
                    )}

                    {/* Viability Warning Box */}
                    <div className={`p-2 rounded-xl border text-[11px] font-mono ${viability.badgeClass}`}>
                      {viability.text}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-[#223d2e]">
                      <span>Bought: <strong>{seed.yearBought}</strong></span>
                      <span className="capitalize">Remaining: <strong>{seed.quantityStatus.replace('-', ' ')}</strong></span>
                      {seed.germinationRatePct && <span>Germ: <strong>{seed.germinationRatePct}%</strong></span>}
                    </div>

                    {seed.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                        {seed.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Encyclopedia */}
      {activeTab === 'encyclopedia' && (
        <div className="space-y-6">
          {/* Controls: Search & Category Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search crops, botanical family (e.g. Solanaceae), or scientific name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search crops by common name, scientific name, or family"
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#132219] border border-stone-300 dark:border-[#223d2e] rounded-xl text-stone-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                aria-label="Filter crops by category"
                className="text-xs p-2 bg-white dark:bg-[#132219] border border-stone-300 dark:border-[#223d2e] rounded-xl text-stone-800 dark:text-stone-200"
              >
                <option value="all">All Categories</option>
                <option value="vegetable">Vegetables</option>
                <option value="herb">Culinary Herbs</option>
                <option value="medicinal-herb">Medicinal Apothecary Herbs</option>
                <option value="fruit">Fruits &amp; Berries</option>
                <option value="flower">Beneficial Flowers</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                aria-label="Filter crops by difficulty"
                className="text-xs p-2 bg-white dark:bg-[#132219] border border-stone-300 dark:border-[#223d2e] rounded-xl text-stone-800 dark:text-stone-200"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner Friendly">Beginner Friendly</option>
                <option value="Moderate">Moderate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCrops.map(crop => (
              <div
                key={crop.id}
                onClick={() => setActiveCropDetail(crop)}
                className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-4 shadow-xs hover:border-emerald-600 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl" role="img" aria-label={crop.name}>{crop.iconEmoji}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-100 dark:bg-[#182c20] text-stone-600 dark:text-stone-300">
                      {crop.family}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#183a24] dark:text-white leading-tight font-serif-botanical">
                      {crop.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 italic">{crop.scientificName}</p>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2">
                    {crop.harvestGuidance}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-[#223d2e] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-800 dark:text-emerald-400 font-semibold">
                    ${crop.retailGroceryValuePerLb.toFixed(2)}/lb
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {crop.daysToMaturityRange[0]}-{crop.daysToMaturityRange[1]} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Seed Modal */}
      {isSeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-md p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">
                {editingSeed ? 'Edit Seed Packet' : 'Add Seed Packet to Stash'}
              </h3>
              <button type="button" onClick={() => setIsSeedModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveSeed} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Crop Type</label>
                <select aria-label="Crop Type"
                  value={formCropId}
                  onChange={e => setFormCropId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs font-medium"
                >
                  {CROPS_DATA.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.iconEmoji} {c.name.split('(')[0]} ({c.family})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Variety Name</label>
                <input aria-label="Variety Name"
                  type="text"
                  required
                  value={formVariety}
                  onChange={e => setFormVariety(e.target.value)}
                  placeholder="e.g. Cherokee Purple, Nantes, Sun Gold F1"
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Seed House / Brand</label>
                  <input aria-label="Seed House / Brand"
                    type="text"
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    placeholder="e.g. Baker Creek, Johnny’s"
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Year Bought</label>
                  <input aria-label="Year Bought"
                    type="number"
                    min="2015"
                    max={currentYear + 1}
                    required
                    value={formYear}
                    onChange={e => setFormYear(parseInt(e.target.value) || currentYear)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Packet Status</label>
                  <select aria-label="Packet Status"
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="full">Full Packet</option>
                    <option value="half">Half Left</option>
                    <option value="few-left">Few Seeds Left</option>
                    <option value="empty">Empty (Need Reorder)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Germination %</label>
                  <input aria-label="Germination %"
                    type="number"
                    min="10"
                    max="100"
                    value={formGermPct}
                    onChange={e => setFormGermPct(parseInt(e.target.value) || 85)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Notes</label>
                <textarea aria-label="Notes"
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Sown indoors in 72-cell tray, rapid germination."
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
                <button
                  type="button"
                  onClick={() => setIsSeedModalOpen(false)}
                  className="px-3 py-1.5 text-stone-600 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#234730] text-white font-semibold rounded-xl"
                >
                  Save Packet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Crop Detail Modal */}
      {activeCropDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-lg p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{activeCropDetail.iconEmoji}</span>
                <div>
                  <h3 className="font-bold text-base text-[#183a24] dark:text-white font-serif-botanical">
                    {activeCropDetail.name}
                  </h3>
                  <span className="text-stone-400 italic text-[11px]">{activeCropDetail.scientificName} ({activeCropDetail.family})</span>
                </div>
              </div>
              <button type="button" onClick={() => setActiveCropDetail(null)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {activeCropDetail.harvestGuidance}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-stone-50 dark:bg-[#182c20] p-3 rounded-xl border border-stone-200 dark:border-[#223d2e] font-mono text-[11px]">
              <div>
                <span className="text-stone-400 block text-[10px]">SFG Density</span>
                <strong>{activeCropDetail.sfgPerSquare} / sq ft</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Depth</span>
                <strong>{activeCropDetail.plantingDepthInches}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Days to Harvest</span>
                <strong>{activeCropDetail.daysToMaturityRange[0]}-{activeCropDetail.daysToMaturityRange[1]}d</strong>
              </div>
            </div>

            <div className="space-y-1">
              <strong className="text-stone-800 dark:text-stone-200">Helpful Companions:</strong>
              <p className="text-emerald-800 dark:text-emerald-300">{activeCropDetail.companions.join(', ')}</p>
            </div>

            <div className="space-y-1">
              <strong className="text-stone-800 dark:text-stone-200">Antagonists:</strong>
              <p className="text-rose-700 dark:text-rose-300">
                {activeCropDetail.antagonists.length > 0 ? activeCropDetail.antagonists.join(', ') : 'None documented'}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200 dark:border-[#223d2e]">
              <button
                type="button"
                onClick={() => setActiveCropDetail(null)}
                className="px-4 py-1.5 bg-[#234730] text-white font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
