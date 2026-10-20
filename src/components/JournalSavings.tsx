import React, { useState, useEffect } from 'react';
import { DialogBehavior } from './DialogBehavior';
import { JournalEntry, ExpenseRecord, PantryItem } from '../types/garden';
import { CROPS_DATA, getCropById } from '../data/cropsData';
import { exportAllDataJson, importAllDataJson, hasUserSavedData, validateBackupBundle, getBundleExportedAt } from '../services/storage';
import { saveJournalPhoto, getJournalPhoto, deleteJournalPhoto } from '../services/imageStorage';
import { PANTRY_DEFAULTS, CropPreservationMethod, getQuickPreserveMethods, getCanningMethods } from '../services/preservationMapping';
import { localDateStr } from '../services/dates';
import {
  BookOpen,
  DollarSign,
  Download,
  Upload,
  Plus,
  Sparkles,
  TrendingUp,
  Tag,
  Calendar,
  Edit2,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
  Check,
  ShieldCheck,
  Server,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface JournalSavingsProps {
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
  onUpdateJournalEntry?: (entry: JournalEntry) => void;
  onDeleteJournalEntry?: (id: string) => void;
  expenses: ExpenseRecord[];
  onAddExpense: (expense: ExpenseRecord) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (id: string) => void;
  onDataImportSuccess: () => void;
  onAddPantryItem?: (item: PantryItem) => void;
  onNavigateToTab?: (tabId: string) => void;
}

export const JournalSavings: React.FC<JournalSavingsProps> = ({
  journalEntries,
  onAddJournalEntry,
  onUpdateJournalEntry,
  onDeleteJournalEntry,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDataImportSuccess,
  onAddPantryItem,
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'finances' | 'photos' | 'backup'>('journal');

  // New Journal Entry state
  const [entryTitle, setEntryTitle] = useState('');
  const [entryCategory, setEntryCategory] = useState<JournalEntry['category']>('note');
  const [entryContent, setEntryContent] = useState('');
  const [entryYield, setEntryYield] = useState<number>(0);
  const [entryCropId, setEntryCropId] = useState<string>('tomato');
  const [entryTags, setEntryTags] = useState('');
  const [entryPhotoFile, setEntryPhotoFile] = useState<File | null>(null);
  const [entryPhotoPreview, setEntryPhotoPreview] = useState<string | null>(null);

  // Edit Journal Entry state
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [isEditJournalOpen, setIsEditJournalOpen] = useState(false);

  // New & Edit Expense state
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('seeds');
  const [expCost, setExpCost] = useState<number>(15.00);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);

  // "Preserve This Harvest?" modal prompt after harvest entry
  const [preservePromptHarvest, setPreservePromptHarvest] = useState<{ cropName: string; cropId?: string; yieldLbs: number } | null>(null);

  // Photo viewer modal state
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  // Loaded photos cache from IndexedDB: Map of entryId -> dataUrl
  const [photosMap, setPhotosMap] = useState<Record<string, string>>({});

  // Cloudflare Worker Sync state
  const [cfWorkerUrl, setCfWorkerUrl] = useState(() => localStorage.getItem('florahearth_cf_worker_url') || '');
  const [cfWorkerToken, setCfWorkerToken] = useState(() => localStorage.getItem('florahearth_cf_worker_token') || '');
  const [cfSyncStatus, setCfSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load photos from IndexedDB for entries that have a photoId
  useEffect(() => {
    let isMounted = true;
    async function loadPhotos() {
      const map: Record<string, string> = {};
      for (const entry of journalEntries) {
        if (entry.photoId) {
          const url = await getJournalPhoto(entry.photoId);
          if (url && isMounted) {
            map[entry.id] = url;
          }
        }
      }
      if (isMounted) setPhotosMap(map);
    }
    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [journalEntries]);

  // Compute Financial Metrics with Per-Crop Granularity
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.cost, 0);

  // Group harvests by crop to compute realistic ROI
  const cropHarvestMap: Record<string, { cropName: string; lbs: number; pricePerLb: number; totalValue: number }> = {};

  let totalHarvestLbs = 0;
  let totalRealisticGroceryValue = 0;

  journalEntries.forEach(entry => {
    if (entry.yieldLbs && entry.yieldLbs > 0) {
      totalHarvestLbs += entry.yieldLbs;
      const crop = entry.cropId ? getCropById(entry.cropId) : null;
      const cropName = crop?.name.split('(')[0] || entry.cropName || 'Mixed Garden Produce';
      const pricePerLb = crop?.retailGroceryValuePerLb || 3.80;
      const val = entry.yieldLbs * pricePerLb;

      totalRealisticGroceryValue += val;

      const key = entry.cropId || cropName;
      if (!cropHarvestMap[key]) {
        cropHarvestMap[key] = {
          cropName,
          lbs: 0,
          pricePerLb,
          totalValue: 0,
        };
      }
      cropHarvestMap[key].lbs += entry.yieldLbs;
      cropHarvestMap[key].totalValue += val;
    }
  });

  const netSavings = totalRealisticGroceryValue - totalSpent;

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEntryPhotoFile(file);
      const reader = new FileReader();
      reader.onload = ev => {
        setEntryPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim()) return;

    let photoId: string | undefined = undefined;
    if (entryPhotoPreview) {
      photoId = `photo-${Date.now()}`;
      try {
        await saveJournalPhoto(photoId, entryPhotoPreview);
      } catch (err) {
        console.warn('Failed to save photo to IndexedDB', err);
      }
    }

    const selectedCrop = entryCategory === 'harvest' ? getCropById(entryCropId) : undefined;

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: localDateStr(),
      title: entryTitle.trim(),
      category: entryCategory,
      content: entryContent.trim(),
      cropId: entryCategory === 'harvest' ? entryCropId : undefined,
      cropName: selectedCrop ? selectedCrop.name.split('(')[0] : undefined,
      yieldLbs: entryCategory === 'harvest' && entryYield > 0 ? entryYield : undefined,
      tags: entryTags ? entryTags.split(',').map(t => t.trim()) : undefined,
      photoId,
    };

    onAddJournalEntry(newEntry);

    // If it's a harvest with yield, offer the preservation shortcut
    if (entryCategory === 'harvest' && entryYield > 0) {
      setPreservePromptHarvest({
        cropName: selectedCrop ? selectedCrop.name.split('(')[0] : 'Fresh Produce',
        cropId: entryCropId,
        yieldLbs: entryYield,
      });
    }

    // Reset Form
    setEntryTitle('');
    setEntryContent('');
    setEntryYield(0);
    setEntryTags('');
    setEntryPhotoFile(null);
    setEntryPhotoPreview(null);
  };

  const openEditJournalModal = (entry: JournalEntry) => {
    setEditingJournal(entry);
    setIsEditJournalOpen(true);
  };

  const handleUpdateJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJournal || !onUpdateJournalEntry) return;
    onUpdateJournalEntry(editingJournal);
    setIsEditJournalOpen(false);
  };

  const handleDeleteJournal = async (id: string, photoId?: string) => {
    if (confirm('Delete this journal record?')) {
      if (photoId) {
        await deleteJournalPhoto(photoId);
      }
      onDeleteJournalEntry?.(id);
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: localDateStr(),
      itemDescription: expDesc.trim(),
      category: expCategory,
      cost: expCost,
    };

    onAddExpense(newExp);
    setExpDesc('');
    setExpCost(15.00);
  };

  const openEditExpenseModal = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setIsEditExpenseOpen(true);
  };

  const handleUpdateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !onUpdateExpense) return;
    onUpdateExpense(editingExpense);
    setIsEditExpenseOpen(false);
  };

  const handleExportJson = () => {
    const jsonStr = exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `florahearth-garden-backup-${localDateStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      e.target.value = ''; // allow choosing the same file again
      if (hasUserSavedData() && !confirm(`Replace ALL garden data on this device with "${file.name}"?`)) {
        setCfSyncStatus('Restore cancelled. Nothing on this device was changed.');
        return;
      }
      const success = importAllDataJson(content);
      if (success) {
        setCfSyncStatus('JSON backup successfully restored into FloraHearth!');
        onDataImportSuccess();
      } else {
        setCfSyncStatus('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Remote sync safety:
  // - never push the built-in sample garden over a real backup,
  // - check the remote copy's timestamp before overwriting it,
  // - confirm before a pull replaces everything on this device.
  const LAST_SYNC_KEY = 'florahearth_cf_last_synced_export';

  const authHeaders = (): Record<string, string> =>
    cfWorkerToken ? { Authorization: `Bearer ${cfWorkerToken}` } : {};

  const fetchRemoteBackup = async (): Promise<{ text: string; exportedAt: string | null } | null> => {
    const res = await fetch(cfWorkerUrl, { method: 'GET', headers: authHeaders(), cache: 'no-store' });
    if (res.status === 404) return null; // nothing stored yet
    if (!res.ok) throw new Error(`Worker returned ${res.status}`);
    const text = await res.text();
    if (!text.trim()) return null;
    return { text, exportedAt: getBundleExportedAt(text) };
  };

  const formatStamp = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : 'an unknown time');

  // Push to Cloudflare Worker + D1
  const handlePushToCloudflare = async () => {
    if (!cfWorkerUrl.trim()) {
      alert('Please enter your Cloudflare Worker URL.');
      return;
    }
    if (!hasUserSavedData()) {
      setCfSyncStatus('Nothing to push yet: this device is still showing the sample garden. Pull your backup first, or add your own garden data.');
      return;
    }
    setIsSyncing(true);
    setCfSyncStatus('Checking the copy stored in your Worker...');
    try {
      localStorage.setItem('florahearth_cf_worker_url', cfWorkerUrl);
      localStorage.setItem('florahearth_cf_worker_token', cfWorkerToken);

      const remote = await fetchRemoteBackup();
      const lastSynced = localStorage.getItem(LAST_SYNC_KEY);
      if (remote && remote.exportedAt && remote.exportedAt !== lastSynced) {
        const ok = confirm(
          `The copy in your Worker was saved from another device at ${formatStamp(remote.exportedAt)}, after this device last synced.\n\nPushing will replace it with this device's data. Continue?`
        );
        if (!ok) {
          setCfSyncStatus('Push cancelled. Pull first to get the newer copy.');
          return;
        }
      }

      setCfSyncStatus('Sending your garden data to your Worker...');
      const jsonStr = exportAllDataJson();
      const res = await fetch(cfWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: jsonStr,
      });

      if (res.ok) {
        const stamp = getBundleExportedAt(jsonStr);
        if (stamp) localStorage.setItem(LAST_SYNC_KEY, stamp);
        setCfSyncStatus(`Pushed to your Worker at ${new Date().toLocaleTimeString()}.`);
      } else {
        setCfSyncStatus(`Your Worker responded with status ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setCfSyncStatus(`Sync error: ${err.message || 'Unable to reach worker URL'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull from Cloudflare Worker + D1
  const handlePullFromCloudflare = async () => {
    if (!cfWorkerUrl.trim()) {
      alert('Please enter your Cloudflare Worker URL.');
      return;
    }
    setIsSyncing(true);
    setCfSyncStatus('Pulling backup from your Worker...');
    try {
      localStorage.setItem('florahearth_cf_worker_url', cfWorkerUrl);
      localStorage.setItem('florahearth_cf_worker_token', cfWorkerToken);

      const remote = await fetchRemoteBackup();
      if (!remote) {
        setCfSyncStatus('Your Worker has no backup stored yet. Push from the device that has your garden data.');
        return;
      }

      let parsed: unknown;
      try { parsed = JSON.parse(remote.text); } catch { parsed = null; }
      const problem = validateBackupBundle(parsed);
      if (problem) {
        setCfSyncStatus(`Pull stopped: ${problem} Nothing on this device was changed.`);
        return;
      }

      if (hasUserSavedData()) {
        const ok = confirm(
          `Replace ALL garden data on this device with the backup saved at ${formatStamp(remote.exportedAt)}?\n\nAnything on this device that is not in that backup will be lost. Use "Download JSON backup" first if you are unsure.`
        );
        if (!ok) {
          setCfSyncStatus('Pull cancelled. Nothing on this device was changed.');
          return;
        }
      }

      if (importAllDataJson(remote.text)) {
        if (remote.exportedAt) localStorage.setItem(LAST_SYNC_KEY, remote.exportedAt);
        setCfSyncStatus('Backup pulled and restored.');
        onDataImportSuccess();
      } else {
        setCfSyncStatus('Pull stopped: the backup could not be read. Nothing on this device was changed.');
      }
    } catch (err: any) {
      setCfSyncStatus(`Sync error: ${err.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create pantry item from harvest quick prompt.
  // Only non-canning methods are offered here; canning goes through the
  // Safe Preservation tab, which carries the tested, altitude-adjusted process.
  const handleQuickPreserveHarvest = (method: CropPreservationMethod) => {
    if (!preservePromptHarvest || !onAddPantryItem) return;
    const d = PANTRY_DEFAULTS[method];
    const today = new Date();
    const bestBy = new Date(today);
    bestBy.setMonth(bestBy.getMonth() + d.shelfLifeMonths);

    const pantryPayload: PantryItem = {
      id: `pantry-${Date.now()}`,
      cropName: preservePromptHarvest.cropName,
      preservationType: d.preservationType,
      quantity: Math.max(1, Math.round(preservePromptHarvest.yieldLbs / d.lbsPerUnit)),
      unit: d.unit,
      datePrepared: localDateStr(today),
      bestByDate: localDateStr(bestBy),
      storageLocation: d.storageLocation,
      notes: `From ${preservePromptHarvest.yieldLbs} lbs garden harvest.`,
    };

    onAddPantryItem(pantryPayload);
    setPreservePromptHarvest(null);
    if (onNavigateToTab) onNavigateToTab('pantry');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223d2e]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] dark:text-[#e4efe7] font-serif-botanical">
            Garden Journal, Per-Crop ROI &amp; Cloud Sync
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Log crop harvests, calculate real grocery savings per variety, attach plant photos (IndexedDB), and backup data safely.
          </p>
        </div>

        <div role="tablist" aria-label="Journal & financial tabs" className="flex bg-stone-100 dark:bg-[#111c15] p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'journal'}
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'journal' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Logs &amp; Photos ({journalEntries.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'finances'}
            onClick={() => setActiveTab('finances')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'finances' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Per-Crop ROI</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'backup'}
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'backup' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-stone-500" />
            <span>Sync &amp; Backup</span>
          </button>
        </div>
      </div>

      {/* Preserve Harvest Shortcut Banner Prompt */}
      {preservePromptHarvest && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <strong className="text-amber-950 dark:text-amber-200 font-bold block text-sm">
                Preserve This {preservePromptHarvest.yieldLbs} lbs {preservePromptHarvest.cropName} Harvest?
              </strong>
              <span className="text-amber-950 dark:text-amber-100">
                {(() => {
                  const crop = preservePromptHarvest.cropId ? getCropById(preservePromptHarvest.cropId) : null;
                  const canning = getCanningMethods(crop);
                  if (canning.includes('pressure-canning')) {
                    return `Log a frozen, dried or stored batch now. This is a low-acid crop: canning it plain requires a pressure canner, never a water bath${canning.includes('pickling') ? ' (tested pickle recipes are the exception)' : ''}.`;
                  }
                  if (canning.includes('pickling') && !canning.includes('water-bath-canning')) {
                    return 'Log a frozen, dried or stored batch now. This crop can only be water-bath canned as a tested pickle or relish recipe, not plain.';
                  }
                  if (canning.length > 0) {
                    return 'Log a frozen, dried or stored batch now, or follow a tested canning procedure first.';
                  }
                  return 'Log a preserved batch straight to your pantry inventory. There is no tested home-canning process for this crop.';
                })()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setPreservePromptHarvest(null)}
              className="px-3 py-1.5 text-stone-700 dark:text-stone-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-xl font-medium"
            >
              Skip
            </button>
            {(() => {
              const crop = preservePromptHarvest.cropId ? getCropById(preservePromptHarvest.cropId) : null;
              const quick = getQuickPreserveMethods(crop);
              const canning = getCanningMethods(crop);
              return (
                <>
                  {quick.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handleQuickPreserveHarvest(method)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors shadow-xs"
                    >
                      <span>{PANTRY_DEFAULTS[method].label}</span>
                    </button>
                  ))}
                  {canning.length > 0 && onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => { setPreservePromptHarvest(null); onNavigateToTab('preservation'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#132219] border border-[#234730] dark:border-emerald-500 text-[#183422] dark:text-emerald-200 font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                    >
                      <span>{canning.includes('pressure-canning') ? 'Pressure-canning guide' : canning.includes('water-bath-canning') ? 'Canning guide' : 'Tested pickle recipes'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 1: Journal & Photos */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: New Entry Form */}
          <div className="lg:col-span-5 bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-4 text-xs h-fit">
            <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              New Garden Journal Entry
            </h3>

            <form onSubmit={handleSaveJournal} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Title</label>
                <input aria-label="Title"
                  type="text"
                  required
                  value={entryTitle}
                  onChange={e => setEntryTitle(e.target.value)}
                  placeholder="e.g. Cherokee Purple Harvest & Pruning"
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Category</label>
                  <select aria-label="Category"
                    value={entryCategory}
                    onChange={e => setEntryCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="harvest">🥦 Harvest &amp; Yield</option>
                    <option value="planting">🌱 Planting / Sowing</option>
                    <option value="note">📝 General Observation</option>
                    <option value="pest">🐛 Pest / IPM Check</option>
                    <option value="soil-test">🧪 Soil &amp; Amendment</option>
                    <option value="compost">🍂 Compost Pile Turn</option>
                  </select>
                </div>

                {entryCategory === 'harvest' && (
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Crop Harvested</label>
                    <select aria-label="Crop Harvested"
                      value={entryCropId}
                      onChange={e => setEntryCropId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs font-medium"
                    >
                      {CROPS_DATA.map(crop => (
                        <option key={crop.id} value={crop.id}>
                          {crop.iconEmoji} {crop.name.split('(')[0]} (${crop.retailGroceryValuePerLb.toFixed(2)}/lb)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {entryCategory === 'harvest' && (
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Harvest Weight (lbs)
                  </label>
                  <input aria-label="Harvest Weight (lbs)"
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={entryYield || ''}
                    onChange={e => setEntryYield(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8.5"
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Observations &amp; Notes</label>
                <textarea aria-label="Observations & Notes"
                  rows={3}
                  required
                  value={entryContent}
                  onChange={e => setEntryContent(e.target.value)}
                  placeholder="Record growth vigor, weather impact, flavor, or pest pressures..."
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Tags (comma separated)</label>
                <input aria-label="Tags (comma separated)"
                  type="text"
                  value={entryTags}
                  onChange={e => setEntryTags(e.target.value)}
                  placeholder="e.g. heirloom, raised-bed-1, sweet"
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              {/* Photo Upload (IndexedDB) */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Attach Plant Photo (Stored in IndexedDB)</span>
                  </span>
                  {entryPhotoPreview && (
                    <button
                      type="button"
                      onClick={() => { setEntryPhotoFile(null); setEntryPhotoPreview(null); }}
                      className="text-[10px] text-rose-600 underline"
                    >
                      Remove
                    </button>
                  )}
                </label>
                <input aria-label="Attach plant photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-[#182c20] file:text-emerald-800 dark:file:text-emerald-300 hover:file:bg-emerald-100"
                />
                {entryPhotoPreview && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-stone-200 dark:border-[#223d2e] h-28 bg-stone-100 dark:bg-[#182c20]">
                    <img src={entryPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors shadow-xs"
              >
                Save Journal Entry
              </button>
            </form>
          </div>

          {/* Right: Entries Timeline */}
          <div className="lg:col-span-7 space-y-4">
            {journalEntries.length === 0 ? (
              <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-8 text-center text-stone-500 text-xs">
                No journal entries yet. Log your first harvest or garden observation!
              </div>
            ) : (
              journalEntries.map(entry => {
                const photoUrl = photosMap[entry.id];
                return (
                  <div key={entry.id} className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-500 dark:text-stone-400 text-[11px] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {entry.date}
                          </span>
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold bg-stone-100 dark:bg-[#182c20] text-stone-700 dark:text-stone-300">
                            {entry.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#183a24] dark:text-white mt-1">
                          {entry.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditJournalModal(entry)}
                          aria-label={`Edit ${entry.title}`}
                          className="p-1 text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJournal(entry.id, entry.photoId)}
                          aria-label={`Delete ${entry.title}`}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {/* Harvest Metrics Pill */}
                    {entry.yieldLbs !== undefined && entry.yieldLbs > 0 && (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-300">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>🥦 Harvest:</span>
                          <span className="font-mono font-bold text-sm">{entry.yieldLbs} lbs</span>
                          {entry.cropName && <span>({entry.cropName})</span>}
                        </div>
                        <span className="font-mono text-[11px] font-bold">
                          ~${((entry.yieldLbs) * (entry.cropId ? (getCropById(entry.cropId)?.retailGroceryValuePerLb || 3.80) : 3.80)).toFixed(2)} retail value
                        </span>
                      </div>
                    )}

                    {/* Photo Thumbnail */}
                    {photoUrl && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setViewingPhotoUrl(photoUrl)}
                          className="relative group rounded-xl overflow-hidden border border-stone-200 dark:border-[#223d2e] max-h-48 block"
                        >
                          <img src={photoUrl} alt="Plant photo" className="w-full h-44 object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white rounded-md text-[10px] font-mono flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Click to enlarge</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <Tag className="w-3 h-3 text-stone-400" />
                        {entry.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#182c20] text-stone-600 dark:text-stone-300 text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Per-Crop ROI & Financial Analysis */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#132219] p-4 rounded-2xl border border-stone-200 dark:border-[#223d2e] shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Total Garden Expenses</span>
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 font-mono mt-1">
                ${totalSpent.toFixed(2)}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Seeds, soil amendments, compost &amp; equipment</p>
            </div>

            <div className="bg-white dark:bg-[#132219] p-4 rounded-2xl border border-stone-200 dark:border-[#223d2e] shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Harvest Retail Grocery Value</span>
              <div className="text-2xl font-extrabold text-[#183a24] dark:text-[#34d399] font-mono mt-1">
                ${totalRealisticGroceryValue.toFixed(2)}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">{totalHarvestLbs.toFixed(1)} lbs harvested across all crops</p>
            </div>

            <div className="bg-white dark:bg-[#132219] p-4 rounded-2xl border border-stone-200 dark:border-[#223d2e] shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">Net Household ROI</span>
              <div className={`text-2xl font-extrabold font-mono mt-1 ${netSavings >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700'}`}>
                {netSavings >= 0 ? `+$${netSavings.toFixed(2)}` : `-$${Math.abs(netSavings).toFixed(2)}`}
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {netSavings >= 0 ? 'Garden has paid for itself!' : 'Yields will amortize setup costs over subsequent seasons.'}
              </p>
            </div>
          </div>

          {/* Per-Crop Payoff Breakdown */}
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              Which Crops Actually Pay Off? (Per-Crop Financial Breakdown)
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              High-markup crops (fresh culinary herbs at $14.99/lb, heirloom slicing tomatoes at $4.50/lb, and berries at $7.99/lb) yield the fastest return on investment compared to standard root crops.
            </p>

            {Object.keys(cropHarvestMap).length === 0 ? (
              <p className="text-stone-400 italic">No crop harvests logged yet. Log harvest weights to see per-crop financial returns.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 dark:bg-[#182c20] text-stone-600 dark:text-stone-300 text-[10px] uppercase font-mono border-b border-stone-200 dark:border-[#223d2e]">
                    <tr>
                      <th className="py-2.5 px-3">Crop Name</th>
                      <th className="py-2.5 px-3">Harvested (lbs)</th>
                      <th className="py-2.5 px-3">USDA Retail Benchmark</th>
                      <th className="py-2.5 px-3">Estimated Value</th>
                      <th className="py-2.5 px-3 text-right">% of Total Harvest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-[#223d2e]">
                    {Object.values(cropHarvestMap)
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .map(row => {
                        const pct = totalRealisticGroceryValue > 0 ? ((row.totalValue / totalRealisticGroceryValue) * 100).toFixed(0) : '0';
                        return (
                          <tr key={row.cropName} className="hover:bg-stone-50/70 dark:hover:bg-[#182c20]/50">
                            <td className="py-2.5 px-3 font-semibold text-stone-800 dark:text-white">{row.cropName}</td>
                            <td className="py-2.5 px-3 font-mono">{row.lbs.toFixed(1)} lbs</td>
                            <td className="py-2.5 px-3 font-mono text-stone-600 dark:text-stone-400">${row.pricePerLb.toFixed(2)}/lb</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">${row.totalValue.toFixed(2)}</td>
                            <td className="py-2.5 px-3 font-mono text-right font-semibold">{pct}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expenses Log & Add Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#183a24] dark:text-white">Log Garden Expense</h4>
              <form onSubmit={handleSaveExpense} className="space-y-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Item Description</label>
                  <input aria-label="Item Description"
                    type="text"
                    required
                    value={expDesc}
                    onChange={e => setExpDesc(e.target.value)}
                    placeholder="e.g. 5 bags organic compost"
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Category</label>
                    <select aria-label="Category"
                      value={expCategory}
                      onChange={e => setExpCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                    >
                      <option value="seeds">Seeds &amp; Starts</option>
                      <option value="soil-amendments">Soil &amp; Compost</option>
                      <option value="equipment">Tools &amp; Irrigation</option>
                      <option value="pest-control">Netting &amp; Organic IPM</option>
                      <option value="water-utility">Water Utility</option>
                      <option value="containers">Pots &amp; Lumber</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Cost ($ USD)</label>
                    <input aria-label="Cost ($ USD)"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={expCost}
                      onChange={e => setExpCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors"
                >
                  Add Expense
                </button>
              </form>
            </div>

            <div className="md:col-span-7 bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#183a24] dark:text-white">Expense History ({expenses.length})</h4>
              <div className="divide-y divide-stone-100 dark:divide-[#223d2e] max-h-72 overflow-y-auto">
                {expenses.map(exp => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <strong className="text-stone-800 dark:text-stone-200 block">{exp.itemDescription}</strong>
                      <span className="text-[10px] text-stone-400 font-mono">{exp.date} · {exp.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 dark:text-white">${exp.cost.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => openEditExpenseModal(exp)}
                        aria-label={`Edit ${exp.itemDescription}`}
                        className="p-1 text-stone-400 hover:text-emerald-700 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.itemDescription}"?`)) {
                            onDeleteExpense?.(exp.id);
                          }
                        }}
                        aria-label={`Delete ${exp.itemDescription}`}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sync & Backup (JSON + Cloudflare Worker + D1) */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* JSON Export/Import */}
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-base text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              Local JSON Export &amp; Restore
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              Download a complete JSON snapshot of your beds, planting schedule, pantry jars, soil tests, hydro readings, and expenses. Safari and mobile browsers can clear localStorage on storage cleanup; keeping a backup file safeguards your season of data.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-2 px-4 py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Complete Garden Backup (.json)</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#182c20] text-stone-800 dark:text-stone-200 font-semibold rounded-xl cursor-pointer transition-colors border border-stone-300 dark:border-[#223d2e]">
                <Upload className="w-4 h-4" />
                <span>Restore Backup File</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>

          {/* Cloudflare Worker + D1 Sync */}
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-base text-[#183a24] dark:text-white font-serif-botanical">
                  Cloudflare Worker + D1 Remote Sync (Optional)
                </h3>
                <p className="text-stone-600 dark:text-stone-300 mt-0.5">
                  Sync your garden data across devices through your own Cloudflare Worker, which stores one backup in Cloudflare D1. A ready-to-deploy Worker is in the repo under <code>worker/</code>. Data travels as plain JSON over HTTPS, so keep the sync token secret. Journal photos stay on each device and are not synced.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cloudflare Worker Endpoint URL
                </label>
                <input aria-label="Cloudflare Worker Endpoint URL"
                  type="url"
                  value={cfWorkerUrl}
                  onChange={e => setCfWorkerUrl(e.target.value)}
                  placeholder="https://florahearth-sync.<your-subdomain>.workers.dev"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Bearer Secret / Sync Token (Optional)
                </label>
                <input aria-label="Bearer Secret / Sync Token (Optional)"
                  type="password"
                  value={cfWorkerToken}
                  onChange={e => setCfWorkerToken(e.target.value)}
                  placeholder="Your private auth secret"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handlePushToCloudflare}
                  className="flex items-center gap-2 px-4 py-2 bg-[#234730] text-white font-semibold rounded-xl hover:bg-[#183422] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Push Current Garden to Cloud</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handlePullFromCloudflare}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200/80 dark:bg-[#182c20] text-stone-800 dark:text-stone-200 font-semibold rounded-xl border border-stone-300 dark:border-[#223d2e] transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pull &amp; Restore from Cloud</span>
                </button>
              </div>

              {cfSyncStatus && (
                <div className="p-3 bg-stone-50 dark:bg-[#182c20] rounded-xl border border-stone-200 dark:border-[#223d2e] text-[11px] font-mono text-stone-700 dark:text-stone-300">
                  {cfSyncStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Modal */}
      {viewingPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setViewingPhotoUrl(null)} label="Garden photo" />
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setViewingPhotoUrl(null)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={viewingPhotoUrl} alt="Plant journal full" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}

      {/* Edit Journal Entry Modal */}
      {isEditJournalOpen && editingJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsEditJournalOpen(false)} />
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-md p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">Edit Journal Entry</h3>
              <button type="button" onClick={() => setIsEditJournalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateJournalSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Title</label>
                <input aria-label="Title"
                  type="text"
                  required
                  value={editingJournal.title}
                  onChange={e => setEditingJournal({ ...editingJournal, title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Content</label>
                <textarea aria-label="Content"
                  rows={4}
                  required
                  value={editingJournal.content}
                  onChange={e => setEditingJournal({ ...editingJournal, content: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              {editingJournal.yieldLbs !== undefined && (
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Harvest Weight (lbs)</label>
                  <input aria-label="Harvest Weight (lbs)"
                    type="number"
                    step="0.1"
                    min="0"
                    value={editingJournal.yieldLbs}
                    onChange={e => setEditingJournal({ ...editingJournal, yieldLbs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
                <button
                  type="button"
                  onClick={() => setIsEditJournalOpen(false)}
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

      {/* Edit Expense Modal */}
      {isEditExpenseOpen && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsEditExpenseOpen(false)} />
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-sm p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">Edit Expense</h3>
              <button type="button" onClick={() => setIsEditExpenseOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpenseSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Description</label>
                <input aria-label="Description"
                  type="text"
                  required
                  value={editingExpense.itemDescription}
                  onChange={e => setEditingExpense({ ...editingExpense, itemDescription: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Cost ($)</label>
                <input aria-label="Cost ($)"
                  type="number"
                  step="0.01"
                  required
                  value={editingExpense.cost}
                  onChange={e => setEditingExpense({ ...editingExpense, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
                <button
                  type="button"
                  onClick={() => setIsEditExpenseOpen(false)}
                  className="px-3 py-1.5 text-stone-600 dark:text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#234730] text-white font-semibold rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
