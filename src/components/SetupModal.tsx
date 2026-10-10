import React, { useState } from 'react';
import { GardenLocation, UserPreferences, GrowingMethod, SunlightLevel, SoilType, WaterAccess } from '../types/garden';
import { lookupLocation, US_REGIONAL_CLIMATES } from '../data/usClimates';
import { CROPS_DATA } from '../data/cropsData';
import { MapPin, Sun, Calendar, Check, AlertCircle, Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GardenLocation;
  currentPreferences: UserPreferences;
  onSave: (loc: GardenLocation, pref: UserPreferences) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  currentPreferences,
  onSave,
}) => {
  const [step, setStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState(currentLocation.zipCode || currentLocation.city);
  const [location, setLocation] = useState<GardenLocation>(currentLocation);
  const [preferences, setPreferences] = useState<UserPreferences>(currentPreferences);

  // Garden plot defaults for initial creation
  const [gardenType, setGardenType] = useState<GrowingMethod>('raised-bed');
  const [sunlight, setSunlight] = useState<SunlightLevel>('full-sun');
  const [soilType, setSoilType] = useState<SoilType>('raised-bed-mix');
  const [waterAccess, setWaterAccess] = useState<WaterAccess>('drip');
  const [isManualFrost, setIsManualFrost] = useState(false);

  if (!isOpen) return null;

  const handleLocationSearch = () => {
    if (!searchQuery.trim()) return;
    const found = lookupLocation(searchQuery);
    setLocation(found);
  };

  const toggleGoal = (goal: UserPreferences['goals'][number]) => {
    const exists = preferences.goals.includes(goal);
    if (exists) {
      setPreferences({
        ...preferences,
        goals: preferences.goals.filter(g => g !== goal),
      });
    } else {
      setPreferences({
        ...preferences,
        goals: [...preferences.goals, goal],
      });
    }
  };

  const toggleFavoriteCrop = (cropId: string) => {
    const exists = preferences.favoriteCrops.includes(cropId);
    if (exists) {
      setPreferences({
        ...preferences,
        favoriteCrops: preferences.favoriteCrops.filter(c => c !== cropId),
      });
    } else {
      setPreferences({
        ...preferences,
        favoriteCrops: [...preferences.favoriteCrops, cropId],
      });
    }
  };

  const handleFinish = () => {
    onSave(location, preferences);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fcfcf9] border border-[#d6ddd6] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#1c3a27] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-serif-botanical">Personalized Garden Setup</h2>
              <p className="text-xs text-emerald-200/80">Step {step} of 3 · Tailor your climate, goals, and crops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-[#1c3a27]">1. Location & Climate Profile</h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Enter your US ZIP code or City/State. We compute your USDA Hardiness Zone, seasonal frost dates, and regional summer heat index.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter 5-digit ZIP (e.g. 75201, 98101, 33101) or City, ST"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  className="px-4 py-2 bg-[#2d5a3c] text-white text-sm font-medium rounded-xl hover:bg-[#234730] transition-colors"
                >
                  Lookup
                </button>
              </div>

              {/* Quick sample chips */}
              <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5">
                <span>Try quick regions:</span>
                {['Dallas (75201)', 'Seattle (98101)', 'Chicago (60601)', 'Miami (33101)', 'Denver (80202)'].map(ex => {
                  const zip = ex.match(/\d+/)?.[0] || '';
                  return (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setSearchQuery(zip);
                        const matched = lookupLocation(zip);
                        setLocation(matched);
                      }}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                    >
                      {ex}
                    </button>
                  );
                })}
              </div>

              {/* Climate Details Card */}
              <div className="bg-[#f3f7f4] border border-[#d6e4da] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#d6e4da] pb-2">
                  <div>
                    <h4 className="font-semibold text-sm text-[#183a24]">
                      {location.city}, {location.state} {location.zipCode ? `(${location.zipCode})` : ''}
                    </h4>
                    <p className="text-xs text-stone-600">{location.climateRegion}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-[#234730] text-emerald-100 font-mono text-xs font-semibold rounded-lg">
                      Zone {location.usdaZone}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200/60">
                    <span className="text-stone-500 block">Last Spring Frost</span>
                    <span className="font-semibold text-stone-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      {location.lastSpringFrost}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200/60">
                    <span className="text-stone-500 block">First Fall Frost</span>
                    <span className="font-semibold text-stone-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {location.firstFallFrost}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200/60">
                    <span className="text-stone-500 block">Growing Season</span>
                    <span className="font-semibold text-stone-800 block mt-0.5">
                      {location.growingSeasonDays} days
                    </span>
                  </div>
                </div>

                {/* Important Extension Notice */}
                <div className="flex gap-2 text-xs bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-lg text-amber-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                  <p>
                    <strong>Horticultural Science Note:</strong> USDA Hardiness Zones measure extreme winter minimums for perennial survival. Vegetable planting schedules rely strictly on local spring frost dates, soil temperatures, and summer heat duration.
                  </p>
                </div>

                {/* Manual frost date override toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsManualFrost(!isManualFrost)}
                    className="text-xs text-emerald-800 underline font-medium hover:text-emerald-950"
                  >
                    {isManualFrost ? 'Hide manual frost date overrides' : 'Adjust frost dates manually (microclimates)'}
                  </button>
                  {isManualFrost && (
                    <div className="grid grid-cols-2 gap-3 mt-2 bg-white p-3 rounded-lg border border-stone-200">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">Last Spring Frost (MM-DD)</label>
                        <input
                          type="text"
                          value={location.lastSpringFrost}
                          onChange={(e) => setLocation({ ...location, lastSpringFrost: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-stone-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">First Fall Frost (MM-DD)</label>
                        <input
                          type="text"
                          value={location.firstFallFrost}
                          onChange={(e) => setLocation({ ...location, firstFallFrost: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-stone-300 rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-[#1c3a27]">2. Garden Setup & Growing Method</h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Tell us about your physical space, sunlight exposure, and water access to filter compatible crops.
                </p>
              </div>

              {/* Growing Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Primary Growing Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'raised-bed', label: 'Raised Beds', desc: 'Cedar/stone boxes with enriched soil' },
                    { id: 'in-ground', label: 'In-Ground Garden', desc: 'Native garden soil or tilled beds' },
                    { id: 'containers', label: 'Patio Containers', desc: 'Fabric pots, 5-gal buckets, tubs' },
                    { id: 'indoor', label: 'Indoor Shelves / Tent', desc: 'Grow lights, controlled climate' },
                    { id: 'greenhouse', label: 'Greenhouse', desc: 'Season extension, unheated/heated' },
                    { id: 'hydroponics', label: 'Hydroponics', desc: 'Soil-less DWC, Kratky, or NFT' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setGardenType(m.id as GrowingMethod)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        gardenType === m.id
                          ? 'border-emerald-600 bg-emerald-50/70 text-[#183a24] ring-1 ring-emerald-600'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span className="font-semibold block">{m.label}</span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunlight & Water Access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Sunlight Availability</label>
                  <select
                    value={sunlight}
                    onChange={(e) => setSunlight(e.target.value as SunlightLevel)}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded-xl focus:border-emerald-600"
                  >
                    <option value="full-sun">Full Sun (6 to 8+ hours direct sun)</option>
                    <option value="partial-sun">Partial Sun (4 to 6 hours direct sun)</option>
                    <option value="partial-shade">Partial Shade (2 to 4 hours dappled sun)</option>
                    <option value="deep-shade">Deep Shade (&lt; 2 hours direct sun)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Watering Access</label>
                  <select
                    value={waterAccess}
                    onChange={(e) => setWaterAccess(e.target.value as WaterAccess)}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded-xl focus:border-emerald-600"
                  >
                    <option value="drip">Drip Irrigation on Automatic Timer</option>
                    <option value="hose">Hose &amp; Wand nearby</option>
                    <option value="hand-can">Hand Watering Can (carry water)</option>
                    <option value="rainwater-barrel">Rainwater Harvesting Barrel</option>
                  </select>
                </div>
              </div>

              {/* Household Size & Available Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Household Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={preferences.householdSize}
                      onChange={(e) => setPreferences({ ...preferences, householdSize: parseInt(e.target.value) })}
                      className="flex-1 accent-emerald-700"
                    />
                    <span className="text-xs font-bold text-[#183a24] w-12 text-center bg-stone-100 py-1 rounded-md">
                      {preferences.householdSize} {preferences.householdSize === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Weekly Gardening Time</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={preferences.availableHoursPerWeek}
                      onChange={(e) => setPreferences({ ...preferences, availableHoursPerWeek: parseInt(e.target.value) })}
                      className="flex-1 accent-emerald-700"
                    />
                    <span className="text-xs font-bold text-[#183a24] w-14 text-center bg-stone-100 py-1 rounded-md">
                      {preferences.availableHoursPerWeek} hrs/wk
                    </span>
                  </div>
                </div>
              </div>

              {/* Units */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Measurement System</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, unitSystem: 'us' })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      preferences.unitSystem === 'us'
                        ? 'bg-[#234730] text-white border-[#234730]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    US Customary (Inches, Feet, Lbs, °F)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, unitSystem: 'metric' })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      preferences.unitSystem === 'metric'
                        ? 'bg-[#234730] text-white border-[#234730]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Metric (cm, meters, kg, °C)
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-[#1c3a27]">3. Goals & Crop Recommendations</h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Select your primary objectives. We automatically recommend proven, high-performing crops tailored to your {location.climateRegion}.
                </p>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">Primary Garden Goals</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'fresh-eating', label: '🥗 Daily Fresh Kitchen Salads', desc: 'Continuous cut greens, snacking tomatoes, fresh herbs' },
                    { id: 'preserving', label: '🏺 Food Preservation & Pantry Storage', desc: 'Canning paste tomatoes, pickling, winter garlic & squash' },
                    { id: 'reducing-grocery-bills', label: '💰 Maximize Grocery Savings (High ROI)', desc: 'Focus on high markup crops (herbs, berries, greens)' },
                    { id: 'medicinal-apothecary', label: '🌿 Herbal Apothecary & Teas', desc: 'Cultivate medicinal herbs (Echinacea, Chamomile, Tulsi, Calendula) for home teas & salves' },
                    { id: 'family-learning', label: '👨‍👩‍👧 Family Learning & Pet-Safe', desc: 'Fast fun germination, non-toxic varieties, sensory discovery' },
                  ].map((g) => {
                    const active = preferences.goals.includes(g.id as any);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id as any)}
                        className={`text-left p-2.5 rounded-xl border transition-all ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/70 text-[#183a24] ring-1 ring-emerald-600'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{g.label}</span>
                          {active && <Check className="w-4 h-4 text-emerald-700" />}
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">{g.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Crops based on Location & Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-700">Recommended Crops for Zone {location.usdaZone}</label>
                  <span className="text-[11px] text-emerald-800">Tap to toggle your favorites</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {CROPS_DATA.map((crop) => {
                    const isSelected = preferences.favoriteCrops.includes(crop.id);
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => toggleFavoriteCrop(crop.id)}
                        className={`text-left p-2 rounded-xl border flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 text-[#183a24] font-medium'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xl shrink-0">{crop.iconEmoji}</span>
                        <div className="overflow-hidden">
                          <div className="text-xs truncate font-medium">{crop.name.split('(')[0]}</div>
                          <div className="text-[10px] text-stone-500 truncate">{crop.difficulty} · {crop.sfgPerSquare}/sq ft</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#234730] hover:bg-[#183422] rounded-xl transition-colors shadow-xs"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm"
            >
              Save &amp; Generate Calendar
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
