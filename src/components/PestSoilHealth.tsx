import React, { useState } from 'react';
import { DialogBehavior } from './DialogBehavior';
import { SoilTestRecord } from '../types/garden';
import { IPM_GUIDES, COMPOST_METHODS } from '../data/ipmSoilData';
import { ECOLOGICAL_INSECTS } from '../data/companionData';
import { Bug, Sparkles, ShieldAlert, TestTube2, AlertCircle, Plus, CheckCircle, Scale, Thermometer, Edit2, Trash2, X } from 'lucide-react';
import { localDateStr } from '../services/dates';

interface PestSoilHealthProps {
  soilTests: SoilTestRecord[];
  onAddSoilTest: (test: SoilTestRecord) => void;
  onUpdateSoilTest?: (test: SoilTestRecord) => void;
  onDeleteSoilTest?: (id: string) => void;
}

export const PestSoilHealth: React.FC<PestSoilHealthProps> = ({
  soilTests,
  onAddSoilTest,
  onUpdateSoilTest,
  onDeleteSoilTest,
}) => {
  const [activeTab, setActiveTab] = useState<'ipm' | 'soil' | 'compost' | 'beneficials'>('ipm');

  // Soil test form state
  const [testBedName, setTestBedName] = useState('Raised Bed 1');
  const [testPh, setTestPh] = useState<number>(6.5);
  const [testN, setTestN] = useState<SoilTestRecord['nitrogen']>('optimal');
  const [testP, setTestP] = useState<SoilTestRecord['phosphorus']>('optimal');
  const [testK, setTestK] = useState<SoilTestRecord['potassium']>('optimal');
  const [testOm, setTestOm] = useState<number>(5.5);
  const [testNotes, setTestNotes] = useState('');

  // Edit soil test state
  const [editingSoilTest, setEditingSoilTest] = useState<SoilTestRecord | null>(null);
  const [isEditSoilOpen, setIsEditSoilOpen] = useState(false);

  // Compost calculator state (Browns vs Greens Volume)
  const [brownParts, setBrownParts] = useState<number>(3); // e.g. 3 parts dry leaves
  const [greenParts, setGreenParts] = useState<number>(1); // e.g. 1 part kitchen scraps

  const handleSaveSoilTest = (e: React.FormEvent) => {
    e.preventDefault();

    let recommendation = 'Soil pH and macronutrients are well balanced for general garden production.';
    if (testPh < 6.0) {
      recommendation = 'Soil is moderately acidic. Incorporate agricultural limestone (calcium carbonate) or dolomitic lime at label rates. Avoid adding sulfur or peat moss.';
    } else if (testPh > 7.3) {
      recommendation = 'Soil is alkaline. Incorporate elemental sulfur or composted pine needles to gently lower pH. Avoid adding wood ash or lime.';
    }

    if (testK === 'low' || testK === 'deficient') {
      recommendation += ' Potassium is low; top-dress with organic kelp meal, greensand, or sulfate of potash.';
    }
    if (testN === 'low' || testN === 'deficient') {
      recommendation += ' Nitrogen is low; incorporate blood meal, feather meal, or well-cured compost.';
    }

    const newRecord: SoilTestRecord = {
      id: `soil-${Date.now()}`,
      date: localDateStr(),
      locationName: testBedName,
      ph: testPh,
      nitrogen: testN,
      phosphorus: testP,
      potassium: testK,
      organicMatterPct: testOm,
      notes: testNotes,
      recommendedAction: recommendation,
    };

    onAddSoilTest(newRecord);
    setTestNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Natural Pest Management, Soil Health &amp; Composting
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Science-grounded Integrated Pest Management (IPM), soil chemistry interpretation, and biological soil building.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ipm')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'ipm' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Pest &amp; Disease (IPM)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('beneficials')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'beneficials' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Beneficial Insects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('soil')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'soil' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Soil Test &amp; pH Lab ({soilTests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compost')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'compost' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Composting &amp; C:N Tool
          </button>
        </div>
      </div>

      {/* TAB 1: IPM Guides */}
      {activeTab === 'ipm' && (
        <div className="space-y-5">
          {/* IPM Philosophy Banner */}
          <div className="bg-[#f4f7f4] border border-[#d4e2d6] p-4 rounded-2xl flex items-start gap-3 text-xs text-stone-700">
            <Sparkles className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#183a24] block">
                The Integrated Pest Management (IPM) Hierarchy:
              </span>
              <p className="leading-relaxed">
                <strong>1. Cultural &amp; Sanitation</strong> (crop rotation, proper spacing, clean beds) →{' '}
                <strong>2. Physical Barriers</strong> (floating insect netting, UV hand-removal) →{' '}
                <strong>3. Biological Conservation</strong> (feeding hoverflies and braconid wasps) →{' '}
                <strong>4. Targeted Biological Controls</strong> (Bt, beneficial nematodes, insecticidal soaps only when thresholds are breached). Avoid indiscriminately spraying broad-spectrum pesticides that kill native pollinators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IPM_GUIDES.map(guide => (
              <div key={guide.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-sm text-[#183a24]">{guide.name}</h2>
                    <span className="text-[11px] text-stone-500">
                      Affects: {guide.cropsAffected.join(', ')}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold ${
                    guide.type === 'pest' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {guide.type}
                  </span>
                </div>

                <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-[11px]">
                  <strong>Identification Clues:</strong>
                  <p className="text-stone-600">{guide.identificationClues}</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <strong>Action Threshold:</strong>
                  <p className="text-stone-700">{guide.actionThreshold}</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <strong className="text-emerald-900">Physical Barrier &amp; Prevention:</strong>
                  <p className="text-stone-600">{guide.physicalBarriers}</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <strong className="text-indigo-900">Biological / Organic Intervention:</strong>
                  <p className="text-stone-600">{guide.biologicalOrganicRemedy}</p>
                </div>

                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-[10px] leading-tight flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Pollinator Warning:</strong> {guide.pollinatorWarning}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Beneficial Insects */}
      {activeTab === 'beneficials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECOLOGICAL_INSECTS.map(ins => (
            <div key={ins.name} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-[#183a24]">{ins.name}</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-semibold rounded-md text-[10px] capitalize">
                  {ins.type.replace('-', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <strong className="text-stone-800">Target Pests Controlled:</strong>
                <p className="text-stone-600">{ins.targetPests.join(', ')}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <strong className="text-emerald-900">Preferred Nectar &amp; Habitat Flowers:</strong>
                <p className="text-stone-700">{ins.preferredFlowers.join(', ')}</p>
              </div>

              <div className="p-2.5 bg-[#f6f8f6] border border-stone-200 rounded-xl text-stone-600 text-[11px] leading-relaxed">
                <strong>Ecology Note:</strong> {ins.habitatTips}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Soil Testing & Amendment Lab */}
      {activeTab === 'soil' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Record Soil Test Form */}
            <form
              onSubmit={handleSaveSoilTest}
              className="md:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs"
            >
              <h2 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-emerald-800" />
                Record Soil Test Results
              </h2>
              <p className="text-stone-600">
                Log soil chemistry from your state university cooperative extension lab to receive precise, science-based amendment advice.
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Location / Bed Name</label>
                <input aria-label="Location / Bed Name"
                  type="text"
                  value={testBedName}
                  onChange={e => setTestBedName(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Soil pH: <span className="font-mono text-emerald-800 font-bold">{testPh}</span>
                  </label>
                  <input aria-label="Soil pH"
                    type="range"
                    min="5.0"
                    max="8.5"
                    step="0.1"
                    value={testPh}
                    onChange={e => setTestPh(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>5.0 (Acid)</span>
                    <span>6.5 (Ideal)</span>
                    <span>8.5 (Alkaline)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Organic Matter %</label>
                  <input aria-label="Organic Matter %"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={testOm}
                    onChange={e => setTestOm(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* N-P-K */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nitrogen (N)</label>
                  <select aria-label="Nitrogen (N)"
                    value={testN}
                    onChange={e => setTestN(e.target.value as any)}
                    className="w-full p-1.5 border border-stone-300 rounded-xl"
                  >
                    <option value="deficient">Deficient</option>
                    <option value="low">Low</option>
                    <option value="optimal">Optimal</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phosphorus (P)</label>
                  <select aria-label="Phosphorus (P)"
                    value={testP}
                    onChange={e => setTestP(e.target.value as any)}
                    className="w-full p-1.5 border border-stone-300 rounded-xl"
                  >
                    <option value="deficient">Deficient</option>
                    <option value="low">Low</option>
                    <option value="optimal">Optimal</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Potassium (K)</label>
                  <select aria-label="Potassium (K)"
                    value={testK}
                    onChange={e => setTestK(e.target.value as any)}
                    className="w-full p-1.5 border border-stone-300 rounded-xl"
                  >
                    <option value="deficient">Deficient</option>
                    <option value="low">Low</option>
                    <option value="optimal">Optimal</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Lab Notes</label>
                <input aria-label="Lab Notes"
                  type="text"
                  value={testNotes}
                  onChange={e => setTestNotes(e.target.value)}
                  placeholder="e.g. Sample collected from 6 inches depth..."
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors"
              >
                Save &amp; Generate Amendment Protocol
              </button>
            </form>

            {/* Test History & Recommendations */}
            <div className="md:col-span-7 space-y-4">
              {soilTests.map(test => (
                <div key={test.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#183a24]">{test.locationName}</h3>
                      <span className="text-[11px] text-stone-500 font-mono">Date: {test.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-stone-100 font-mono font-bold text-stone-800 rounded-lg text-xs">
                        pH {test.ph}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSoilTest(test);
                          setIsEditSoilOpen(true);
                        }}
                        aria-label={`Edit soil test for ${test.locationName}`}
                        className="p-1 text-stone-400 hover:text-emerald-700 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete soil test for "${test.locationName}"?`)) {
                            onDeleteSoilTest?.(test.id);
                          }
                        }}
                        aria-label={`Delete soil test for ${test.locationName}`}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-[#faf9f5] p-2.5 rounded-xl border border-stone-200 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Nitrogen</span>
                      <strong className="text-stone-800 capitalize">{test.nitrogen}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Phosphorus</span>
                      <strong className="text-stone-800 capitalize">{test.phosphorus}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Potassium</span>
                      <strong className="text-stone-800 capitalize">{test.potassium}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Organic Matter</span>
                      <strong className="text-emerald-800">{test.organicMatterPct}%</strong>
                    </div>
                  </div>

                  {test.recommendedAction && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 text-[11px] leading-relaxed">
                      <strong>Extension Recommendation:</strong> {test.recommendedAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Soil Test Modal */}
      {isEditSoilOpen && editingSoilTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsEditSoilOpen(false)} />
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-md p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">Edit Soil Test Record</h2>
              <button type="button" onClick={() => setIsEditSoilOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateSoilTest?.(editingSoilTest);
                setIsEditSoilOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Bed / Location Name</label>
                <input aria-label="Bed / Location Name"
                  type="text"
                  required
                  value={editingSoilTest.locationName}
                  onChange={e => setEditingSoilTest({ ...editingSoilTest, locationName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Soil pH: <span className="font-mono font-bold text-emerald-800">{editingSoilTest.ph}</span>
                  </label>
                  <input aria-label="Soil pH"
                    type="range"
                    min="5.0"
                    max="8.5"
                    step="0.1"
                    value={editingSoilTest.ph}
                    onChange={e => setEditingSoilTest({ ...editingSoilTest, ph: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Organic Matter %</label>
                  <input aria-label="Organic Matter %"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={editingSoilTest.organicMatterPct || 5}
                    onChange={e => setEditingSoilTest({ ...editingSoilTest, organicMatterPct: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nitrogen (N)</label>
                  <select aria-label="Nitrogen (N)"
                    value={editingSoilTest.nitrogen}
                    onChange={e => setEditingSoilTest({ ...editingSoilTest, nitrogen: e.target.value as any })}
                    className="w-full p-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="deficient">Deficient</option>
                    <option value="low">Low</option>
                    <option value="optimal">Optimal</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Phosphorus (P)</label>
                  <select aria-label="Phosphorus (P)"
                    value={editingSoilTest.phosphorus}
                    onChange={e => setEditingSoilTest({ ...editingSoilTest, phosphorus: e.target.value as any })}
                    className="w-full p-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="deficient">Deficient</option>
                    <option value="low">Low</option>
                    <option value="optimal">Optimal</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Potassium (K)</label>
                  <select aria-label="Potassium (K)"
                    value={editingSoilTest.potassium}
                    onChange={e => setEditingSoilTest({ ...editingSoilTest, potassium: e.target.value as any })}
                    className="w-full p-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="deficient">Deficient</option>
                    <option value="low">Low</option>
                    <option value="optimal">Optimal</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Notes / Lab Advice</label>
                <textarea aria-label="Notes / Lab Advice"
                  rows={2}
                  value={editingSoilTest.notes}
                  onChange={e => setEditingSoilTest({ ...editingSoilTest, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
                <button
                  type="button"
                  onClick={() => setIsEditSoilOpen(false)}
                  className="px-3 py-1.5 text-stone-600 dark:text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#234730] text-white font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Composting Methods & C:N Balance */}
      {activeTab === 'compost' && (
        <div className="space-y-6">
          {/* C:N Ratio Visual Tool */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
            <h2 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-800" />
              Compost Carbon-to-Nitrogen (C:N) Volume Balancer
            </h2>
            <p className="text-stone-600">
              Thermophilic microbes thrive at an optimum C:N ratio of <strong>30:1</strong>. In garden volume practice, this equates to roughly <strong>2 to 3 buckets of brown carbon materials</strong> for every <strong>1 bucket of green nitrogen kitchen scraps</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-amber-900 mb-1">
                  Brown Carbon Volume (Dry Leaves, Straw, Cardboard): {brownParts} parts
                </label>
                <input aria-label="Brown Carbon Volume (Dry Leaves, Straw, Cardboard) (parts)"
                  type="range"
                  min="1"
                  max="6"
                  value={brownParts}
                  onChange={e => setBrownParts(parseInt(e.target.value) || 1)}
                  className="w-full accent-amber-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 mb-1">
                  Green Nitrogen Volume (Kitchen Scraps, Grass, Coffee): {greenParts} parts
                </label>
                <input aria-label="Green Nitrogen Volume (Kitchen Scraps, Grass, Coffee) (parts)"
                  type="range"
                  min="1"
                  max="4"
                  value={greenParts}
                  onChange={e => setGreenParts(parseInt(e.target.value) || 1)}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            {/* Live Diagnosis */}
            <div className="p-3 rounded-xl border text-xs">
              {brownParts / greenParts >= 2 && brownParts / greenParts <= 3.5 ? (
                <div className="text-emerald-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Optimal 30:1 C:N Ratio!</strong> Pile has plenty of porous carbon for airflow and sufficient nitrogen to fuel thermophilic bacterial heat.
                  </span>
                </div>
              ) : brownParts / greenParts < 2 ? (
                <div className="text-rose-900 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>
                    <strong>Too Much Nitrogen / Moisture:</strong> Risks anaerobic putrefaction, slimy matting, and ammonia odor. Add dry shredded leaves or cardboard immediately.
                  </span>
                </div>
              ) : (
                <div className="text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Too Much Carbon:</strong> Pile will decompose very slowly and fail to heat up. Add fresh green lawn clippings, coffee grounds, or water.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Methods Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPOST_METHODS.map(m => (
              <div key={m.method} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#183a24]">{m.method} Composting</h3>

                <div className="space-y-1 text-[11px]">
                  <strong className="text-stone-700">Inputs:</strong>
                  <p className="text-stone-600">
                    <strong>Greens:</strong> {m.greenInputs.join(', ')}
                  </p>
                  <p className="text-stone-600">
                    <strong>Browns:</strong> {m.brownInputs.join(', ')}
                  </p>
                </div>

                <div className="bg-[#faf9f5] p-2.5 rounded-xl border border-stone-200 text-[11px] space-y-1">
                  <div><strong>Target Temp:</strong> {m.temperatureRange}</div>
                  <div><strong>Turn Schedule:</strong> {m.turnSchedule}</div>
                  <div><strong>Cure Time:</strong> {m.cureTime}</div>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-1 text-[11px] text-stone-600">
                  <strong className="text-stone-800">Safety &amp; Sanitation:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {m.safetyRules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
