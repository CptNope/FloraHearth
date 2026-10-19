import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronRight, RefreshCw } from 'lucide-react';

interface TroubleshooterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SymptomType = 'blossom-drop' | 'yellow-leaves' | 'poor-germination' | 'wilting-plants' | 'low-yields';

export const TroubleshooterModal: React.FC<TroubleshooterModalProps> = ({ isOpen, onClose }) => {
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomType | null>(null);
  const [_q1Answer, setQ1Answer] = useState<string | null>(null);
  const [_q2Answer, setQ2Answer] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedSymptom(null);
    setQ1Answer(null);
    setQ2Answer(null);
  };

  const renderDiagnosis = () => {
    if (!selectedSymptom) return null;

    if (selectedSymptom === 'blossom-drop') {
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 space-y-2">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">Diagnosis: Blossom Drop Analysis</h4>
            <p className="leading-relaxed text-stone-800 dark:text-[#d5e4da]">
              When flowers abort without setting fruit, gardeners frequently blame pollinators, but horticultural research shows the top culprit is temperature stress.
            </p>
            <div className="space-y-1.5 pt-1 text-stone-800 dark:text-[#d5e4da]">
              <div>
                <strong className="text-stone-900 dark:text-white">Primary Cause: Heat-Induced Pollen Sterility:</strong> In tomatoes and peppers, sustained daytime temperatures above 90°F (32°C) or night temperatures above 75°F (24°C) render pollen sticky and non-viable within 48 hours. Flowers drop cleanly off the stem.
              </div>
              <div>
                <strong className="text-stone-900 dark:text-white">Alternative Possibility: Excess High Nitrogen Fertilizer:</strong> Overfeeding with synthetic high-N fertilizer stimulates lush deep green foliage while suppressing blossom retention.
              </div>
              <div>
                <strong className="text-stone-900 dark:text-white">Correction:</strong> Install 30% white shade cloth over midday hours; ensure deep morning soil moisture; switch to low-N, high-potassium organic feeding.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedSymptom === 'yellow-leaves') {
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 space-y-2">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">Diagnosis: Chlorosis / Leaf Yellowing</h4>
            <div className="space-y-1.5 text-stone-800 dark:text-[#d5e4da]">
              <div>
                <strong className="text-stone-900 dark:text-white">Location Check (Lower vs Upper Leaves):</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px]">
                  <li>
                    <strong className="text-stone-900 dark:text-white">Lower/Older Leaves Turning Uniform Pale Yellow:</strong> Nitrogen deficiency or natural shedding of shaded bottom leaves.
                  </li>
                  <li>
                    <strong className="text-stone-900 dark:text-white">New Young Leaves Yellowing Between Green Veins (Interveinal Chlorosis):</strong> Iron deficiency caused by soil pH &gt; 7.0 locking out trace minerals, or severe waterlogged roots suffocating oxygen uptake.
                  </li>
                  <li>
                    <strong className="text-stone-900 dark:text-white">Overwatering vs Under-watering:</strong> Squeeze a handful of soil 3 inches down. If soggy and cool, roots are drowning (hypoxia).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedSymptom === 'poor-germination') {
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 space-y-2">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">Diagnosis: Seed Germination Failure</h4>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-800 dark:text-[#d5e4da]">
              <li>
                <strong className="text-stone-900 dark:text-white">Cold Soil:</strong> Peppers and eggplants need 75-85°F soil temperatures to sprout. In cold 60°F soil, seeds rot before germinating. Use a seedling heat mat indoors.
              </li>
              <li>
                <strong className="text-stone-900 dark:text-white">Planted Too Deep:</strong> Small seeds (lettuce, carrots, alyssum) need light to sprout. They must be dusted with 1/8 inch soil or surface sown.
              </li>
              <li>
                <strong className="text-stone-900 dark:text-white">Surface Crusting:</strong> Heavy clay soil dries into an impenetrable brick. Keep carrot furrows covered with a wet board or light burlap until first green cotyledons emerge.
              </li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 space-y-2">
        <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">General Diagnostic Insight</h4>
        <p className="text-[11px] leading-relaxed text-stone-800 dark:text-[#d5e4da]">
          Plants exhibit wilting or stunted yields due to either root health (compaction, nematode feeding, or overwatering root rot) or pest vascular blockages (bacterial wilt from cucumber beetles or squash vine borer in the stem base). Inspect the lowest 2 inches of the stem right at soil level for frass or soft lesions.
        </p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="troubleshooter-modal-title"
    >
      <div className="bg-[#fcfcf9] dark:bg-[#0e1912] border border-stone-300 dark:border-[#223d2e] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1c3a27] dark:bg-[#14301f] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-emerald-300" aria-hidden="true" />
            <div>
              <h3 id="troubleshooter-modal-title" className="font-bold text-base font-serif-botanical text-white">Symptom Diagnostic Guide</h3>
              <p className="text-[11px] text-emerald-200/80">Follow-up inquiries before jumping to conclusions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close symptom diagnostic guide"
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {!selectedSymptom ? (
            <div>
              <label className="font-semibold text-stone-900 dark:text-white text-sm block mb-2">
                What symptom are your plants exhibiting?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'blossom-drop', label: '🌸 Flowers blooming but dropping off (no fruit set)', desc: 'Tomatoes, peppers, squash flowers shriveling and falling' },
                  { id: 'yellow-leaves', label: '🍂 Leaves turning pale yellow or mottled (chlorosis)', desc: 'Yellowing bottom leaves, yellow edges, or veins remaining green' },
                  { id: 'poor-germination', label: '🌱 Seeds sown but nothing sprouted after 2 weeks', desc: 'No seedlings emerging from ground or seed trays' },
                  { id: 'wilting-plants', label: '🥀 Plants wilting even though soil feels damp', desc: 'Midday droop that does not recover overnight' },
                  { id: 'low-yields', label: '📉 Stunted plant growth and low overall harvest yield', desc: 'Small fruits, woody roots, or lack of vigorous new stems' },
                ].map(sym => (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => setSelectedSymptom(sym.id as SymptomType)}
                    className="w-full text-left p-3 rounded-xl border border-stone-200 dark:border-[#223d2e] bg-white dark:bg-[#13241a] hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-[#1c3527] transition-all flex items-center justify-between group focus:ring-2 focus:ring-emerald-500"
                  >
                    <div>
                      <span className="font-bold text-stone-900 dark:text-[#ecfdf5] block group-hover:text-emerald-950 dark:group-hover:text-emerald-300">{sym.label}</span>
                      <span className="text-[11px] text-stone-600 dark:text-[#a0b4a7] block mt-0.5">{sym.desc}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-2">
                <span className="font-semibold text-stone-800 dark:text-[#d3e3d8]">Selected: {selectedSymptom.replace('-', ' ').toUpperCase()}</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold underline focus:ring-2 focus:ring-emerald-500"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" /> Start over
                </button>
              </div>

              {renderDiagnosis()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-[#0a140e] border-t border-stone-200 dark:border-[#223d2e] px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#234730] dark:bg-[#10b981] text-white dark:text-[#06150b] font-semibold rounded-xl hover:bg-[#1a3624] dark:hover:bg-[#34d399] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
