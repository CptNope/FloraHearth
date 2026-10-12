import React, { useState } from 'react';
import { JournalEntry, ExpenseRecord } from '../types/garden';
import { exportAllDataJson, importAllDataJson } from '../services/storage';
import { BookOpen, DollarSign, Download, Upload, Plus, Sparkles, TrendingUp, Tag, Calendar } from 'lucide-react';

interface JournalSavingsProps {
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
  expenses: ExpenseRecord[];
  onAddExpense: (expense: ExpenseRecord) => void;
  onDataImportSuccess: () => void;
}

export const JournalSavings: React.FC<JournalSavingsProps> = ({
  journalEntries,
  onAddJournalEntry,
  expenses,
  onAddExpense,
  onDataImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'finances' | 'backup'>('journal');

  // New Journal Entry state
  const [entryTitle, setEntryTitle] = useState('');
  const [entryCategory, setEntryCategory] = useState<JournalEntry['category']>('note');
  const [entryContent, setEntryContent] = useState('');
  const [entryYield, setEntryYield] = useState<number>(0);
  const [entryTags, setEntryTags] = useState('');

  // New Expense state
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('seeds');
  const [expCost, setExpCost] = useState<number>(15.00);

  // Import JSON feedback state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Compute Financial Metrics
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.cost, 0);
  const totalHarvestLbs = journalEntries.reduce((acc, curr) => acc + (curr.yieldLbs || 0), 0);
  // Average grocery retail value benchmark: ~$3.80/lb for organic fresh produce & herbs
  const estimatedHarvestValue = totalHarvestLbs * 3.80;
  const netSavings = estimatedHarvestValue - totalSpent;

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim()) return;

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: entryTitle,
      category: entryCategory,
      content: entryContent,
      yieldLbs: entryYield > 0 ? entryYield : undefined,
      tags: entryTags ? entryTags.split(',').map(t => t.trim()) : undefined,
    };

    onAddJournalEntry(newEntry);
    setEntryTitle('');
    setEntryContent('');
    setEntryYield(0);
    setEntryTags('');
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemDescription: expDesc,
      category: expCategory,
      cost: expCost,
    };

    onAddExpense(newExp);
    setExpDesc('');
    setExpCost(15.00);
  };

  const handleExportJson = () => {
    const jsonStr = exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `florahearth-garden-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllDataJson(content);
      if (success) {
        setImportStatus('Backup successfully restored! Refreshing data...');
        setTimeout(() => {
          onDataImportSuccess();
          setImportStatus(null);
        }, 1200);
      } else {
        setImportStatus('Failed to parse backup file. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Garden Journal, Financial ROI &amp; Backup
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Maintain daily observation logs, track supply expenditures versus grocery harvest savings, and export complete records.
          </p>
        </div>

        <div role="tablist" aria-label="Journal and finance sections" className="flex bg-stone-100 dark:bg-[#111c15] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'journal'}
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'journal' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            📓 Garden Logbook ({journalEntries.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'finances'}
            onClick={() => setActiveTab('finances')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'finances' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            💵 Costs &amp; Grocery ROI
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'backup'}
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'backup' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            💾 Data Sovereignty &amp; JSON
          </button>
        </div>
      </div>

      {/* TAB 1: Garden Journal */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* New Entry Form */}
            <form
              onSubmit={handleSaveJournal}
              className="md:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs"
            >
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-800" aria-hidden="true" />
                Add New Garden Log Entry
              </h3>

              <div>
                <label htmlFor="journal-entry-title" className="block font-semibold text-stone-700 mb-1">Title</label>
                <input
                  id="journal-entry-title"
                  type="text"
                  value={entryTitle}
                  onChange={e => setEntryTitle(e.target.value)}
                  placeholder="e.g. First Sungold harvest & squash blossom check"
                  className="w-full p-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="journal-entry-category" className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    id="journal-entry-category"
                    value={entryCategory}
                    onChange={e => setEntryCategory(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  >
                    <option value="note">General Note</option>
                    <option value="planting">Planting / Sowing</option>
                    <option value="harvest">Harvest Weigh-In</option>
                    <option value="pest">Pest / Disease (IPM)</option>
                    <option value="soil-test">Soil &amp; Fertilizer</option>
                    <option value="compost">Compost Pile</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="journal-entry-yield" className="block font-semibold text-stone-700 mb-1">Harvest (lbs)</label>
                  <input
                    id="journal-entry-yield"
                    type="number"
                    min="0"
                    step="0.5"
                    value={entryYield}
                    onChange={e => setEntryYield(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="journal-entry-content" className="block font-semibold text-stone-700 mb-1">Observations &amp; Notes</label>
                <textarea
                  id="journal-entry-content"
                  rows={4}
                  value={entryContent}
                  onChange={e => setEntryContent(e.target.value)}
                  placeholder="Record weather, germination rates, pest encounters, soil conditions, or flavor notes..."
                  className="w-full p-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label htmlFor="journal-entry-tags" className="block font-semibold text-stone-700 mb-1">Tags (comma separated)</label>
                <input
                  id="journal-entry-tags"
                  type="text"
                  value={entryTags}
                  onChange={e => setEntryTags(e.target.value)}
                  placeholder="e.g. tomatoes, drip, pest-free"
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors"
              >
                Save Journal Entry
              </button>
            </form>

            {/* Existing Entries Stream */}
            <div className="md:col-span-7 space-y-4">
              {journalEntries.map(entry => (
                <div key={entry.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#183a24]">{entry.title}</h4>
                      <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px] mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{entry.date}</span>
                        <span>·</span>
                        <span className="capitalize">{entry.category}</span>
                      </div>
                    </div>

                    {entry.yieldLbs && entry.yieldLbs > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold font-mono rounded-lg">
                        +{entry.yieldLbs} lbs harvested
                      </span>
                    )}
                  </div>

                  <p className="text-stone-700 leading-relaxed whitespace-pre-line text-[11px]">
                    {entry.content}
                  </p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                      {entry.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-stone-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Costs & Grocery ROI */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-stone-500 block font-medium">Total Garden Investment</span>
              <div className="text-2xl font-extrabold text-stone-900 font-mono mt-1">
                ${totalSpent.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-400">Seeds, soil, drip hardware</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-stone-500 block font-medium">Estimated Grocery Value</span>
              <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
                ${estimatedHarvestValue.toFixed(2)}
              </div>
              <span className="text-[11px] text-stone-400">
                {totalHarvestLbs.toFixed(1)} lbs @ ~$3.80/lb organic benchmark
              </span>
            </div>

            <div className={`border rounded-2xl p-4 shadow-xs ${
              netSavings >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-xs text-stone-600 block font-medium">Net Value Generated</span>
              <div className={`text-2xl font-extrabold font-mono mt-1 ${
                netSavings >= 0 ? 'text-emerald-900' : 'text-stone-700'
              }`}>
                {netSavings >= 0 ? `+$${netSavings.toFixed(2)}` : `-$${Math.abs(netSavings).toFixed(2)}`}
              </div>
              <span className="text-[11px] text-stone-500">
                {netSavings >= 0 ? 'Garden has paid for itself!' : 'Approaching harvest break-even'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Add Expense Form */}
            <form
              onSubmit={handleSaveExpense}
              className="md:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs"
            >
              <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-800" />
                Record Garden Expense
              </h3>

              <div>
                <label htmlFor="exp-desc-input" className="block font-semibold text-stone-700 mb-1">Item Description</label>
                <input
                  id="exp-desc-input"
                  type="text"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="e.g. Cedar 2x6 boards, Johnny's Seed order, Bt spray..."
                  className="w-full p-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="exp-cat-select" className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    id="exp-cat-select"
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  >
                    <option value="seeds">Seeds &amp; Starts</option>
                    <option value="soil-amendments">Soil &amp; Compost</option>
                    <option value="equipment">Tools &amp; Hardware</option>
                    <option value="containers">Pots &amp; Trays</option>
                    <option value="water-utility">Water / Drip Tape</option>
                    <option value="pest-control">Netting &amp; Organic IPM</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="exp-cost-input" className="block font-semibold text-stone-700 mb-1">Amount ($ USD)</label>
                  <input
                    id="exp-cost-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expCost}
                    onChange={e => setExpCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors"
              >
                Log Expense
              </button>
            </form>

            {/* Expense History Table */}
            <div className="md:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-sm text-[#183a24]">Expense Records</h4>
              <div className="divide-y divide-stone-100">
                {expenses.map(exp => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-stone-800 block">{exp.itemDescription}</strong>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {exp.date} · {exp.category.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      ${exp.cost.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Data Sovereignty & JSON Backup */}
      {activeTab === 'backup' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs max-w-xl mx-auto space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-base text-[#183a24] font-serif-botanical">
              Full Data Sovereignty &amp; Offline Portability
            </h3>
            <p className="text-stone-600 mt-1 leading-relaxed">
              All your garden beds, crop plans, soil test results, journal entries, and pantry batches are saved locally in your browser. You can export complete machine-readable JSON backups anytime or restore from a previous file.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors shadow-xs text-xs"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Complete Garden Backup (.JSON)
            </button>

            <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-stone-50 transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                aria-label="Upload JSON backup file to restore records"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-1.5 text-stone-600">
                <Upload className="w-5 h-5 text-stone-400" aria-hidden="true" />
                <span className="font-semibold text-xs">Restore Data from JSON File</span>
                <span className="text-[11px] text-stone-400">Click or drag a .json backup here</span>
              </div>
            </div>

            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl font-medium text-center">
                {importStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
