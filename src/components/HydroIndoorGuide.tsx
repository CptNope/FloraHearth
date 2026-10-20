import React, { useState } from 'react';
import { DialogBehavior } from './DialogBehavior';
import { HydroWaterRecord } from '../types/garden';
import { HYDROPONIC_SPECS } from '../data/ipmSoilData';
import { Lightbulb, Waves, Fish, Thermometer, ShieldAlert, Plus, Edit2, Trash2, X, Check, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { localDateStr } from '../services/dates';

interface HydroIndoorGuideProps {
  hydroRecords: HydroWaterRecord[];
  onAddHydroRecord: (record: HydroWaterRecord) => void;
  onUpdateHydroRecord: (record: HydroWaterRecord) => void;
  onDeleteHydroRecord: (id: string) => void;
}

const SYSTEM_LABELS: Record<HydroWaterRecord['systemType'], string> = {
  kratky: 'Kratky',
  dwc: 'DWC',
  nft: 'NFT',
  drip: 'Drip',
  aquaponics: 'Aquaponics',
};

export const HydroIndoorGuide: React.FC<HydroIndoorGuideProps> = ({
  hydroRecords,
  onAddHydroRecord,
  onUpdateHydroRecord,
  onDeleteHydroRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'lighting' | 'hydro' | 'aquaponics' | 'logs'>('logs');

  // Grow light DLI calculator state
  const [ppfdValue, setPpfdValue] = useState<number>(350); // umol/m2/s
  const [hoursOn, setHoursOn] = useState<number>(14); // 14 hours per day

  // Daily Light Integral formula: PPFD * hours * 3600 / 1,000,000
  const calculatedDli = ((ppfdValue * hoursOn * 3600) / 1000000).toFixed(1);

  // Hydro Reading Log modal & edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HydroWaterRecord | null>(null);

  // Form fields
  const [formDate, setFormDate] = useState(localDateStr());
  const [formSystem, setFormSystem] = useState<HydroWaterRecord['systemType']>('kratky');
  const [formPh, setFormPh] = useState<number>(6.0);
  const [formEc, setFormEc] = useState<number>(950);
  const [formTemp, setFormTemp] = useState<number>(68);
  const [formAmmonia, setFormAmmonia] = useState<string>('0');
  const [formNitrite, setFormNitrite] = useState<string>('0');
  const [formNitrate, setFormNitrate] = useState<string>('30');

  // Trend chart shows one system at a time (defaults to the most recently logged one)
  const chartSystems = Array.from(new Set([...hydroRecords].sort((a, b) => b.date.localeCompare(a.date)).map(r => r.systemType)));
  const [chartSystemChoice, setChartSystemChoice] = useState<HydroWaterRecord['systemType'] | null>(null);
  const chartSystem = chartSystemChoice && chartSystems.includes(chartSystemChoice) ? chartSystemChoice : chartSystems[0];
  const chartRecords = hydroRecords.filter(r => r.systemType === chartSystem);
  const [formNotes, setFormNotes] = useState<string>('');

  const openAddModal = () => {
    setEditingRecord(null);
    setFormDate(localDateStr());
    setFormSystem('kratky');
    setFormPh(6.0);
    setFormEc(950);
    setFormTemp(68);
    setFormAmmonia('0');
    setFormNitrite('0');
    setFormNitrate('30');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: HydroWaterRecord) => {
    setEditingRecord(rec);
    setFormDate(rec.date);
    setFormSystem(rec.systemType);
    setFormPh(rec.ph);
    setFormEc(rec.ecPpm);
    setFormTemp(rec.waterTempF);
    setFormAmmonia(rec.ammoniaPpm !== undefined ? String(rec.ammoniaPpm) : '0');
    setFormNitrite(rec.nitritePpm !== undefined ? String(rec.nitritePpm) : '0');
    setFormNitrate(rec.nitratePpm !== undefined ? String(rec.nitratePpm) : '30');
    setFormNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const recordPayload: HydroWaterRecord = {
      id: editingRecord ? editingRecord.id : `hydro-${Date.now()}`,
      date: formDate,
      systemType: formSystem,
      ph: Number(formPh),
      ecPpm: Number(formEc),
      waterTempF: Number(formTemp),
      // Nitrogen-cycle readings only apply to aquaponics (fish) systems
      ammoniaPpm: formSystem === 'aquaponics' && formAmmonia !== '' ? Number(formAmmonia) : undefined,
      nitritePpm: formSystem === 'aquaponics' && formNitrite !== '' ? Number(formNitrite) : undefined,
      nitratePpm: formSystem === 'aquaponics' && formNitrate !== '' ? Number(formNitrate) : undefined,
      notes: formNotes.trim(),
    };

    if (editingRecord) {
      onUpdateHydroRecord(recordPayload);
    } else {
      onAddHydroRecord(recordPayload);
    }
    setIsModalOpen(false);
  };

  // Compute status helpers
  const getPhStatus = (ph: number) => {
    if (ph >= 5.5 && ph <= 6.5) return { label: 'Optimal (5.5-6.5)', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    if (ph < 5.5) return { label: 'Acidic (<5.5: lockout of Ca/Mg)', color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    return { label: 'Alkaline (>6.5: iron chlorosis)', color: 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
  };

  const getTempStatus = (tempF: number) => {
    if (tempF >= 65 && tempF <= 72) return { label: 'Ideal (65-72°F)', color: 'text-emerald-700 dark:text-emerald-400' };
    if (tempF > 74) return { label: 'Danger (>74°F: Pythium root rot risk)', color: 'text-rose-700 dark:text-rose-400 font-bold' };
    return { label: 'Cool (<65°F: slow uptake)', color: 'text-amber-700 dark:text-amber-400' };
  };

  const latestRecord = hydroRecords.length > 0 ? hydroRecords[hydroRecords.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223d2e]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#183a24] dark:text-[#e4efe7] font-serif-botanical">
            Indoor Grow Lights, Hydroponics &amp; Water Logs
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Log reservoir pH/EC/PPM, calculate Daily Light Integrals (DLI), and manage aquaponic nitrogen cycling.
          </p>
        </div>

        <div role="tablist" aria-label="Indoor growing guides" className="flex flex-wrap bg-stone-100 dark:bg-[#111c15] p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Water Logs ({hydroRecords.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lighting'}
            onClick={() => setActiveTab('lighting')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'lighting' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>DLI Light Calculator</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'hydro'}
            onClick={() => setActiveTab('hydro')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'hydro' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-blue-500" />
            <span>Systems &amp; EC Ranges</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'aquaponics'}
            onClick={() => setActiveTab('aquaponics')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'aquaponics' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Fish className="w-3.5 h-3.5 text-emerald-500" />
            <span>Aquaponics Biofilter</span>
          </button>
        </div>
      </div>

      {/* TAB 0: Water Reading Log & Trends */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#132219] p-4 rounded-2xl border border-stone-200 dark:border-[#223d2e] shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Latest pH Reading</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#183a24] dark:text-white font-mono">
                  {latestRecord ? latestRecord.ph.toFixed(1) : '6.0'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${latestRecord ? getPhStatus(latestRecord.ph).color : ''}`}>
                  {latestRecord ? getPhStatus(latestRecord.ph).label.split('(')[0] : 'Optimal'}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Target range: 5.5 – 6.5</p>
            </div>

            <div className="bg-white dark:bg-[#132219] p-4 rounded-2xl border border-stone-200 dark:border-[#223d2e] shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Nutrient EC / Concentration</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#183a24] dark:text-white font-mono">
                  {latestRecord ? `${latestRecord.ecPpm} PPM` : '950 PPM'}
                </span>
                <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
                  (~{latestRecord ? (latestRecord.ecPpm / 500).toFixed(1) : '1.9'} mS/cm)
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Greens: 600-1000 | Fruiting: 1200-1800</p>
            </div>

            <div className="bg-white dark:bg-[#132219] p-4 rounded-2xl border border-stone-200 dark:border-[#223d2e] shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Water Temp &amp; Dissolved O2</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#183a24] dark:text-white font-mono">
                  {latestRecord ? `${latestRecord.waterTempF}°F` : '68°F'}
                </span>
                <span className={`text-[10px] font-semibold ${latestRecord ? getTempStatus(latestRecord.waterTempF).color : ''}`}>
                  {latestRecord ? getTempStatus(latestRecord.waterTempF).label : 'Ideal'}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Keep under 74°F to stop Pythium rot</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Hydroponic &amp; Reservoir Reading History
            </h2>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Water Reading</span>
            </button>
          </div>

          {/* pH & EC Visual Trend Chart */}
          {hydroRecords.length > 0 && (
            <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Reservoir Trends ({chartRecords.length} {SYSTEM_LABELS[chartSystem] || chartSystem} reading{chartRecords.length === 1 ? '' : 's'})
                </span>
                {chartSystems.length > 1 && (
                  <select
                    aria-label="System to chart"
                    value={chartSystem}
                    onChange={e => setChartSystemChoice(e.target.value as HydroWaterRecord['systemType'])}
                    className="text-xs px-2 py-1 border border-stone-300 dark:border-[#223d2e] rounded-lg bg-white dark:bg-[#182c20]"
                  >
                    {chartSystems.map(sys => <option key={sys} value={sys}>{SYSTEM_LABELS[sys] || sys}</option>)}
                  </select>
                )}
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-stone-600 dark:text-stone-300">pH Level (5.5-6.5 Ideal)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                    <span className="text-stone-600 dark:text-stone-300">EC Nutrient (PPM)</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto" tabIndex={0} role="region" aria-label="pH and EC trend chart (scrolls sideways)">
                <div className="min-w-[500px] h-44 relative bg-stone-50 dark:bg-[#0e1a12] rounded-xl p-3 border border-stone-100 dark:border-[#1a3324]">
                  {(() => {
                    // One system at a time: different systems run different pH/EC targets
                    const sorted = [...chartRecords].sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
                    const width = 500;
                    const height = 140;
                    const padding = { top: 20, right: 40, bottom: 25, left: 40 };
                    const chartW = width - padding.left - padding.right;
                    const chartH = height - padding.top - padding.bottom;

                    // pH scale: 4.5 to 8.5
                    const minPh = 4.5;
                    const maxPh = 8.5;
                    const getYForPh = (ph: number) => padding.top + chartH - ((ph - minPh) / (maxPh - minPh)) * chartH;

                    // PPM scale: 400 to 2000
                    const minPpm = 400;
                    const maxPpm = 2000;
                    const getYForPpm = (ppm: number) => padding.top + chartH - ((Math.min(maxPpm, Math.max(minPpm, ppm)) - minPpm) / (maxPpm - minPpm)) * chartH;

                    const getX = (idx: number) => {
                      if (sorted.length === 1) return padding.left + chartW / 2;
                      return padding.left + (idx / (sorted.length - 1)) * chartW;
                    };

                    const optimalPhTop = getYForPh(6.5);
                    const optimalPhBottom = getYForPh(5.5);

                    const phPoints = sorted.map((r, i) => `${getX(i)},${getYForPh(r.ph)}`).join(' ');
                    const ppmPoints = sorted.map((r, i) => `${getX(i)},${getYForPpm(r.ecPpm)}`).join(' ');

                    return (
                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
                        {/* Shaded Optimal pH Band (5.5 - 6.5) */}
                        <rect
                          x={padding.left}
                          y={optimalPhTop}
                          width={chartW}
                          height={optimalPhBottom - optimalPhTop}
                          fill="#10b981"
                          fillOpacity="0.12"
                          rx="4"
                        />
                        <line
                          x1={padding.left}
                          y1={optimalPhTop}
                          x2={padding.left + chartW}
                          y2={optimalPhTop}
                          stroke="#10b981"
                          strokeDasharray="3 3"
                          strokeOpacity="0.4"
                        />
                        <line
                          x1={padding.left}
                          y1={optimalPhBottom}
                          x2={padding.left + chartW}
                          y2={optimalPhBottom}
                          stroke="#10b981"
                          strokeDasharray="3 3"
                          strokeOpacity="0.4"
                        />
                        <text
                          x={padding.left + 6}
                          y={optimalPhTop + 11}
                          fontSize="9"
                          fill="#059669"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          Target pH (5.5 – 6.5)
                        </text>

                        {/* Y-axis labels for pH (Left) */}
                        <text x={padding.left - 6} y={getYForPh(7.0) + 3} fontSize="9" textAnchor="end" fill="#6b7280" fontFamily="monospace">7.0</text>
                        <text x={padding.left - 6} y={getYForPh(6.0) + 3} fontSize="9" textAnchor="end" fill="#059669" fontFamily="monospace" fontWeight="bold">6.0</text>
                        <text x={padding.left - 6} y={getYForPh(5.0) + 3} fontSize="9" textAnchor="end" fill="#6b7280" fontFamily="monospace">5.0</text>

                        {/* Y-axis labels for PPM (Right) */}
                        <text x={padding.left + chartW + 6} y={getYForPpm(1600) + 3} fontSize="9" textAnchor="start" fill="#d97706" fontFamily="monospace">1600p</text>
                        <text x={padding.left + chartW + 6} y={getYForPpm(1000) + 3} fontSize="9" textAnchor="start" fill="#d97706" fontFamily="monospace">1000p</text>
                        <text x={padding.left + chartW + 6} y={getYForPpm(600) + 3} fontSize="9" textAnchor="start" fill="#d97706" fontFamily="monospace">600p</text>

                        {/* Polylines if >= 2 points */}
                        {sorted.length > 1 && (
                          <>
                            <polyline
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="4 2"
                              points={ppmPoints}
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={phPoints}
                            />
                          </>
                        )}

                        {/* Data Points */}
                        {sorted.map((r, i) => {
                          const x = getX(i);
                          const yPh = getYForPh(r.ph);
                          const yPpm = getYForPpm(r.ecPpm);
                          return (
                            <g key={r.id}>
                              {/* PPM Diamond */}
                              <rect
                                x={x - 3.5}
                                y={yPpm - 3.5}
                                width="7"
                                height="7"
                                fill="#f59e0b"
                                stroke="#ffffff"
                                strokeWidth="1"
                                rx="1"
                              />
                              {/* pH Circle */}
                              <circle
                                cx={x}
                                cy={yPh}
                                r="4.5"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="1.5"
                              />
                              {/* Value text above pH point */}
                              <text
                                x={x}
                                y={yPh - 7}
                                fontSize="9"
                                textAnchor="middle"
                                fill="#10b981"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {r.ph.toFixed(1)}
                              </text>
                              {/* Date label at bottom */}
                              <text
                                x={x}
                                y={height - 5}
                                fontSize="9"
                                textAnchor="middle"
                                fill="#6b7280"
                                fontFamily="monospace"
                              >
                                {r.date.slice(5)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Readings Table / Cards */}
          {hydroRecords.length === 0 ? (
            <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-8 text-center text-stone-500 space-y-2">
              <Waves className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs">No hydro water records logged yet.</p>
              <button
                type="button"
                onClick={openAddModal}
                className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold underline"
              >
                Log your first reservoir reading
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-[#182c20] text-stone-600 dark:text-stone-300 uppercase text-[10px] font-mono border-b border-stone-200 dark:border-[#223d2e]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">System</th>
                      <th className="py-3 px-4">pH</th>
                      <th className="py-3 px-4">EC / PPM</th>
                      <th className="py-3 px-4">Water Temp</th>
                      <th className="py-3 px-4">Nitrogen (NH3/NO2/NO3)</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-[#223d2e] text-stone-700 dark:text-stone-200">
                    {hydroRecords.slice().reverse().map(rec => {
                      const phStatus = getPhStatus(rec.ph);
                      const tempStatus = getTempStatus(rec.waterTempF);
                      return (
                        <tr key={rec.id} className="hover:bg-stone-50/70 dark:hover:bg-[#182c20]/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold">{rec.date}</td>
                          <td className="py-3 px-4">
                            <span className="uppercase text-[10px] px-2 py-0.5 rounded-md font-mono bg-stone-100 dark:bg-[#182c20] text-stone-700 dark:text-stone-300">
                              {rec.systemType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-md border font-mono font-bold text-[11px] ${phStatus.color}`}>
                              {rec.ph.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {rec.ecPpm} PPM
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className={tempStatus.color}>
                              {rec.waterTempF}°F
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                            {rec.ammoniaPpm !== undefined ? `${rec.ammoniaPpm} / ${rec.nitritePpm || 0} / ${rec.nitratePpm || 0}` : '—'}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-[11px] text-stone-500 dark:text-stone-400">
                            {rec.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(rec)}
                                aria-label="Edit hydro water reading"
                                className="p-1 text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Delete this water reading?')) {
                                    onDeleteHydroRecord(rec.id);
                                  }
                                }}
                                aria-label="Delete hydro water reading"
                                className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Lighting DLI Calculator */}
      {activeTab === 'lighting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
              <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden="true" />
                Daily Light Integral (DLI) Calculator
              </h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Plants respond to total photons received per 24 hours (DLI in mol/m²/day), not just instantaneous wattage.
              </p>

              <div>
                <label htmlFor="ppfd-slider" className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                  PPFD at Canopy Height: <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">{ppfdValue} µmol/m²/s</span>
                </label>
                <input
                  id="ppfd-slider"
                  type="range"
                  min="100"
                  max="1000"
                  step="25"
                  value={ppfdValue}
                  onChange={e => setPpfdValue(parseInt(e.target.value))}
                  aria-label="PPFD at canopy height"
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>100 (Seedlings)</span>
                  <span>400 (Greens/Herbs)</span>
                  <span>800+ (Tomatoes)</span>
                </div>
              </div>

              <div>
                <label htmlFor="hours-slider" className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                  Daily Photoperiod: <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">{hoursOn} hours / day</span>
                </label>
                <input
                  id="hours-slider"
                  type="range"
                  min="8"
                  max="20"
                  step="1"
                  value={hoursOn}
                  onChange={e => setHoursOn(parseInt(e.target.value))}
                  aria-label="Photoperiod in hours per day"
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="bg-[#f2f7f3] dark:bg-[#182c20] p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-[11px] text-stone-600 dark:text-stone-400 block uppercase font-mono">Delivered Daily Light Integral</span>
                <div className="text-3xl font-extrabold text-[#183a24] dark:text-[#34d399] font-mono">
                  {calculatedDli} <span className="text-sm font-normal text-stone-500">mol/m²/day</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">
                Target DLI Requirements by Crop
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'Microgreens & Seedlings', dli: '6 - 10 mol', desc: 'Low light requirements; prevent leggy stretching.' },
                  { name: 'Lettuce, Spinach & Asian Greens', dli: '12 - 16 mol', desc: '14-16 mol produces rapid vegetative growth without tipburn.' },
                  { name: 'Culinary Herbs (Basil, Cilantro, Parsley)', dli: '14 - 18 mol', desc: 'Higher light builds essential oils and fragrant terpenes.' },
                  { name: 'Fruiting Strawberries', dli: '16 - 22 mol', desc: 'Required for continuous flowering and fruit sugar Brix levels.' },
                  { name: 'Dwarf Indeterminate Tomatoes & Peppers', dli: '22 - 30+ mol', desc: 'High photon requirements. Supplemental CO2 recommended above 25 DLI.' },
                ].map(item => (
                  <div key={item.name} className="p-3 bg-stone-50 dark:bg-[#182c20] rounded-xl flex items-center justify-between gap-4 border border-stone-200/60 dark:border-[#223d2e]">
                    <div>
                      <strong className="text-stone-900 dark:text-stone-100 block">{item.name}</strong>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">{item.desc}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-white dark:bg-[#111e16] border border-stone-200 dark:border-[#223d2e] rounded-lg font-mono font-bold text-emerald-800 dark:text-emerald-400 whitespace-nowrap text-xs">
                      {item.dli}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hydro Systems & Nutrient Ranges */}
      {activeTab === 'hydro' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HYDROPONIC_SPECS.map(spec => (
              <div key={spec.systemType} className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-4 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">{spec.systemType}</h3>
                  <span className="px-2 py-0.5 bg-stone-100 dark:bg-[#182c20] text-stone-700 dark:text-stone-300 rounded font-mono text-[10px]">
                    {spec.bestCrops[0]}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] bg-stone-50 dark:bg-[#182c20] p-2.5 rounded-xl border border-stone-200/60 dark:border-[#223d2e]">
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">Target pH:</span>
                    <strong className="text-emerald-800 dark:text-emerald-400">{spec.targetPh}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">Target EC:</span>
                    <strong className="text-emerald-800 dark:text-emerald-400">{spec.targetEcMs}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">Water Temp:</span>
                    <strong className="text-stone-800 dark:text-stone-200">{spec.waterTempF}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-[#223d2e]">
                  {spec.prosAndCons}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Aquaponics */}
      {activeTab === 'aquaponics' && (
        <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-start gap-3">
            <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-300">
              <Fish className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-base text-[#183a24] dark:text-white font-serif-botanical">
                Aquaponics Nitrogen Cycle &amp; Biological Equilibrium
              </h2>
              <p className="text-stone-600 dark:text-stone-300 mt-0.5">
                Combines aquaculture (fish) and hydroponics (plants) via a 2-stage biological bacterial biofilter.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-1">
              <span className="font-mono font-bold text-rose-900 dark:text-rose-300 text-xs">1. Fish Waste (Ammonia)</span>
              <p className="text-[11px] text-rose-950 dark:text-rose-200">
                Total ammonia nitrogen (NH3 / NH4+). Toxic to fish at levels above 0.5 ppm.
              </p>
            </div>
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-1">
              <span className="font-mono font-bold text-amber-900 dark:text-amber-300 text-xs">2. Nitrosomonas Bacteria</span>
              <p className="text-[11px] text-amber-950 dark:text-amber-200">
                Converts ammonia into Nitrite (NO2-). Toxic to fish above 0.25 ppm.
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-1">
              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300 text-xs">3. Nitrobacter Bacteria</span>
              <p className="text-[11px] text-emerald-950 dark:text-emerald-200">
                Converts nitrite into Nitrate (NO3-). Completely harmless to fish and primary plant food!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Log / Edit Water Reading Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">
                {editingRecord ? 'Edit Hydro Water Reading' : 'Log Reservoir Water Reading'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Date</label>
                  <input aria-label="Date"
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">System Type</label>
                  <select aria-label="System Type"
                    value={formSystem}
                    onChange={e => setFormSystem(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="kratky">Kratky (Passive)</option>
                    <option value="dwc">DWC (Deep Water Culture)</option>
                    <option value="nft">NFT (Nutrient Film)</option>
                    <option value="drip">Hydro Drip</option>
                    <option value="aquaponics">Aquaponics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">pH Level</label>
                  <input aria-label="pH Level"
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="9.0"
                    required
                    value={formPh}
                    onChange={e => setFormPh(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">EC (PPM)</label>
                  <input aria-label="EC (PPM)"
                    type="number"
                    step="25"
                    min="100"
                    max="3000"
                    required
                    value={formEc}
                    onChange={e => setFormEc(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Temp (°F)</label>
                  <input aria-label="Temp (°F)"
                    type="number"
                    step="1"
                    min="45"
                    max="95"
                    required
                    value={formTemp}
                    onChange={e => setFormTemp(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {formSystem === 'aquaponics' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 dark:bg-[#182c20] rounded-xl border border-stone-200 dark:border-[#223d2e]">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Ammonia PPM</label>
                    <input aria-label="Ammonia PPM"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formAmmonia}
                      onChange={e => setFormAmmonia(e.target.value)}
                      className="w-full px-2 py-1 border border-stone-300 dark:border-[#223d2e] rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nitrite PPM</label>
                    <input aria-label="Nitrite PPM"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formNitrite}
                      onChange={e => setFormNitrite(e.target.value)}
                      className="w-full px-2 py-1 border border-stone-300 dark:border-[#223d2e] rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Nitrate PPM</label>
                    <input aria-label="Nitrate PPM"
                      type="number"
                      step="1"
                      min="0"
                      value={formNitrate}
                      onChange={e => setFormNitrate(e.target.value)}
                      className="w-full px-2 py-1 border border-stone-300 dark:border-[#223d2e] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Notes / Adjustments</label>
                <textarea aria-label="Notes / Adjustments"
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Added 5ml pH Down, topped up reservoir with RO water"
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#182c20] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422]"
                >
                  {editingRecord ? 'Save Changes' : 'Log Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
