import React, { useState } from 'react';
import { COMPANION_PAIRS, ECOLOGICAL_INSECTS } from '../data/companionData';
import { CROPS_DATA } from '../data/cropsData';
import { Sparkles, Search, ShieldCheck, AlertTriangle, Bug, Flower2, Info, BookOpen } from 'lucide-react';

export const CompanionEcology: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterEvidence, setFilterEvidence] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'matrix' | 'insects' | 'pollination'>('matrix');

  const filteredPairs = COMPANION_PAIRS.filter(pair => {
    const cropAName = CROPS_DATA.find(c => c.id === pair.cropA)?.name || pair.cropA;
    const cropBName = CROPS_DATA.find(c => c.id === pair.cropB)?.name || pair.cropB;
    const matchesSearch =
      cropAName.toLowerCase().includes(search.toLowerCase()) ||
      cropBName.toLowerCase().includes(search.toLowerCase()) ||
      pair.notes.toLowerCase().includes(search.toLowerCase());

    const matchesEvidence =
      filterEvidence === 'all' ||
      (filterEvidence === 'peer-reviewed' && pair.scientificEvidence.includes('High')) ||
      (filterEvidence === 'extension' && pair.scientificEvidence.includes('Moderate')) ||
      (filterEvidence === 'traditional' && pair.scientificEvidence.includes('Traditional'));

    const matchesType = filterType === 'all' || pair.relationship === filterType;

    return matchesSearch && matchesEvidence && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Companion Planting &amp; Garden Ecology
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Separating peer-reviewed agricultural science (spatial shading, nitrogen fixation, braconid wasp reservoirs) from traditional folklore.
          </p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'matrix' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            🤝 Companion Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insects')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'insects' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            🐝 Beneficial Insects &amp; Flowers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pollination')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'pollination' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            🌸 Pollination &amp; Fruit Set
          </button>
        </div>
      </div>

      {activeTab === 'matrix' && (
        <div className="space-y-5">
          {/* Scientific Disclaimer Banner */}
          <div className="bg-[#f4f7f4] border border-[#d6e4da] p-4 rounded-2xl flex items-start gap-3 text-xs text-stone-700">
            <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#183a24] block">
                Evidence-Based Horticultural Distinction:
              </span>
              <p className="leading-relaxed">
                We clearly tag every relationship with its scientific evidence rating. Real companion effects operate through <strong>canopy shading</strong> (peppers shading lettuce), <strong>physical trellising</strong> (corn supporting pole beans), <strong>Rhizobium nitrogen fixation</strong>, or <strong>predator hoverfly nectar sources</strong>. We explicitly debunk folklore myths (such as claims that planting a single marigold will permanently repel all garden pests).
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search companion crops (e.g. Tomato, Basil, Beans, Garlic)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="text-xs p-2 border border-stone-200 rounded-xl bg-stone-50"
                >
                  <option value="all">All Combinations</option>
                  <option value="beneficial">Beneficial Synergies Only</option>
                  <option value="antagonistic">Antagonistic Conflicts Only</option>
                </select>

                <select
                  value={filterEvidence}
                  onChange={e => setFilterEvidence(e.target.value)}
                  className="text-xs p-2 border border-stone-200 rounded-xl bg-stone-50"
                >
                  <option value="all">All Evidence Levels</option>
                  <option value="peer-reviewed">High (Peer-Reviewed)</option>
                  <option value="extension">Moderate (Extension)</option>
                  <option value="traditional">Traditional Folklore</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPairs.map((pair, idx) => {
              const cropA = CROPS_DATA.find(c => c.id === pair.cropA);
              const cropB = CROPS_DATA.find(c => c.id === pair.cropB);

              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl p-5 shadow-xs space-y-3 text-xs ${
                    pair.relationship === 'beneficial' ? 'border-emerald-200/80' : 'border-rose-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cropA?.iconEmoji || '🌱'}</span>
                      <span className="font-bold text-stone-900">{cropA?.name.split('(')[0] || pair.cropA}</span>
                      <span className="text-stone-400 font-bold">
                        {pair.relationship === 'beneficial' ? '+' : '≠'}
                      </span>
                      <span className="text-2xl">{cropB?.iconEmoji || '🌱'}</span>
                      <span className="font-bold text-stone-900">{cropB?.name.split('(')[0] || pair.cropB}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                        pair.relationship === 'beneficial'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {pair.relationship}
                    </span>
                  </div>

                  <div className="bg-[#faf9f5] p-3 rounded-xl border border-stone-200/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Ecological Mechanism:</span>
                      <span className="font-semibold text-stone-800 capitalize">
                        {pair.mechanism.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Evidence Rigor:</span>
                      <span className="font-mono text-emerald-800 font-semibold">{pair.scientificEvidence}</span>
                    </div>
                  </div>

                  <p className="text-stone-600 leading-relaxed text-[11px] pt-1">
                    {pair.notes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'insects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECOLOGICAL_INSECTS.map(ins => (
            <div key={ins.name} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#183a24]">{ins.name}</h4>
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

      {activeTab === 'pollination' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-base text-[#183a24] font-serif-botanical">
              Crop Pollination Biology &amp; Hand Pollination Guide
            </h3>
            <p className="text-stone-600 mt-0.5">
              Distinguishing true pollination failure from heat-induced pollen sterility, and knowing when protective row netting must be opened.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900">1. Self-Pollinating Crops</h4>
              <p className="text-[11px] text-stone-600">
                <strong>Tomatoes, Peppers, Beans, Peas.</strong> Each blossom contains both male (anthers) and female (pistil) parts. Wind vibration or bumblebee sonic buzzing is sufficient to set fruit. Protective insect netting does NOT prevent pollination.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900">2. Insect-Dependent Crops</h4>
              <p className="text-[11px] text-stone-600">
                <strong>Cucumbers, Squash, Melons, Pumpkins.</strong> Produce separate male and female flowers. Bees must transfer sticky pollen from male blooms to the female bloom (identified by the miniature baby fruit at the base). <strong>Row covers MUST be removed once female blossoms open!</strong>
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900">3. Hand Pollination Technique</h4>
              <p className="text-[11px] text-stone-600">
                For squash in screened greenhouses or low-pollinator areas: In early morning, pick an open male flower, peel off petals to expose the pollen-dusted anther, and gently swab it inside the center stigma of open female blossoms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
