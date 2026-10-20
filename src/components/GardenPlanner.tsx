import React, { useState } from 'react';
import { DialogBehavior } from './DialogBehavior';
import { buildBedTasks, mergeBedTasks } from '../services/bedSchedule';
import { GardenSpace, GridCell, Crop, PlantFamily, GrowingMethod, SunlightLevel, GardenLocation, GardenTask, BedSeasonRecord } from '../types/garden';
import { CROPS_DATA, getCropById } from '../data/cropsData';
import { COMPANION_PAIRS } from '../data/companionData';
import {
  Plus,
  Trash2,
  Printer,
  AlertTriangle,
  Sparkles,
  Check,
  Info,
  ShieldAlert,
  Layers,
  Calendar,
  History,
  ArrowRight,
  RotateCcw,
  X
} from 'lucide-react';

interface GardenPlannerProps {
  spaces: GardenSpace[];
  onUpdateSpaces: (newSpaces: GardenSpace[]) => void;
  activeSpaceId?: string;
  location?: GardenLocation;
  tasks?: GardenTask[];
  onUpdateTasks?: (newTasks: GardenTask[]) => void;
  onNavigateToTab?: (tabId: string) => void;
}

export const GardenPlanner: React.FC<GardenPlannerProps> = ({
  spaces,
  onUpdateSpaces,
  location,
  tasks,
  onUpdateTasks,
  onNavigateToTab,
}) => {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(spaces[0]?.id || 'bed-1');
  const [selectedCropToPlace, setSelectedCropToPlace] = useState<Crop | null>(CROPS_DATA[0]);
  const [activeCellCoords, setActiveCellCoords] = useState<{ x: number; y: number } | null>(null);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('New Raised Bed');
  const [newSpaceType, setNewSpaceType] = useState<GrowingMethod>('raised-bed');
  const [newCols, setNewCols] = useState(4);
  const [newRows, setNewRows] = useState(4);

  // Season history & sync feedback state
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveSeasonName, setArchiveSeasonName] = useState(`${new Date().getMonth() >= 6 ? 'Summer' : 'Spring'} ${new Date().getFullYear()}`);
  const [archiveClearsBed, setArchiveClearsBed] = useState(true);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const currentSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];

  const handleCellClick = (x: number, y: number) => {
    if (!currentSpace) return;
    setActiveCellCoords({ x, y });

    // If a crop is selected for placement, place or replace it
    if (selectedCropToPlace) {
      const existingCellIdx = currentSpace.cells.findIndex(c => c.x === x && c.y === y);
      const updatedCells = [...currentSpace.cells];

      if (existingCellIdx >= 0) {
        // Toggle or replace
        if (updatedCells[existingCellIdx].cropId === selectedCropToPlace.id) {
          // Remove if clicking again with same crop
          updatedCells.splice(existingCellIdx, 1);
        } else {
          updatedCells[existingCellIdx] = {
            x,
            y,
            cropId: selectedCropToPlace.id,
            varietyName: selectedCropToPlace.varieties[0]?.name,
            count: selectedCropToPlace.sfgPerSquare,
          };
        }
      } else {
        updatedCells.push({
          x,
          y,
          cropId: selectedCropToPlace.id,
          varietyName: selectedCropToPlace.varieties[0]?.name,
          count: selectedCropToPlace.sfgPerSquare,
        });
      }

      const updatedSpace = { ...currentSpace, cells: updatedCells };
      onUpdateSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
    }
  };

  const handleClearCell = (x: number, y: number) => {
    if (!currentSpace) return;
    const updatedCells = currentSpace.cells.filter(c => !(c.x === x && c.y === y));
    const updatedSpace = { ...currentSpace, cells: updatedCells };
    onUpdateSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    const newSpace: GardenSpace = {
      id: `space-${Date.now()}`,
      name: newSpaceName,
      type: newSpaceType,
      widthFt: newCols,
      lengthFt: newRows,
      sunlight: 'full-sun',
      soilType: 'raised-bed-mix',
      waterAccess: 'drip',
      gridCols: Math.max(1, Math.min(12, newCols)),
      gridRows: Math.max(1, Math.min(12, newRows)),
      cells: [],
      seasonHistory: [],
    };
    onUpdateSpaces([...spaces, newSpace]);
    setSelectedSpaceId(newSpace.id);
    setIsCreatingSpace(false);
  };

  const handleDeleteSpace = (id: string) => {
    if (spaces.length <= 1) return;
    const filtered = spaces.filter(s => s.id !== id);
    onUpdateSpaces(filtered);
    setSelectedSpaceId(filtered[0]?.id || '');
  };

  // BED -> CALENDAR AUTOMATIC TASK GENERATION
  // Scheduling rules live in services/bedSchedule.ts (next plantable season,
  // harvest from planting date, fall crops, id-based de-duplication).
  const handleSyncBedTasksToCalendar = () => {
    if (!currentSpace || !onUpdateTasks || !location) return;

    const generated = buildBedTasks(currentSpace, location);
    if (generated.length === 0) {
      setSyncFeedback(`Add crops to ${currentSpace.name} first, then sync them to your calendar.`);
      return;
    }

    const { tasks: merged, added, updated } = mergeBedTasks(tasks || [], generated);
    if (added === 0 && updated === 0) {
      setSyncFeedback(`${currentSpace.name}'s planting and harvest tasks are already up to date on your calendar.`);
      return;
    }
    onUpdateTasks(merged);
    const parts = [
      added > 0 ? `added ${added} task${added === 1 ? '' : 's'}` : '',
      updated > 0 ? `updated ${updated}` : '',
    ].filter(Boolean).join(' and ');
    setSyncFeedback(`✓ ${parts.charAt(0).toUpperCase() + parts.slice(1)} for ${currentSpace.name} on your calendar.`);
  };

  // ARCHIVE SEASON LAYOUT TO ROTATION HISTORY
  const handleArchiveCurrentSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;

    const uniqueCropIds = Array.from(new Set(currentSpace.cells.map(c => c.cropId).filter(Boolean))) as string[];
    const pastCrops = uniqueCropIds.map(id => {
      const c = getCropById(id);
      return {
        cropId: id,
        cropName: c?.name.split('(')[0].trim() || id,
        family: (c?.family || 'Other') as PlantFamily,
      };
    });

    const newHistoryRecord: BedSeasonRecord = {
      season: archiveSeasonName.trim(),
      // Use the year in the season name ("Fall 2024"), else the current year
      year: Number(archiveSeasonName.match(/\b(19|20)\d{2}\b/)?.[0]) || new Date().getFullYear(),
      crops: pastCrops,
    };

    const updatedSpace: GardenSpace = {
      ...currentSpace,
      seasonHistory: [...(currentSpace.seasonHistory || []), newHistoryRecord],
      // Start the next season with an empty grid unless the user keeps the layout
      cells: archiveClearsBed ? currentSpace.cells.map(c => ({ x: c.x, y: c.y, cropId: null })) : currentSpace.cells,
    };

    onUpdateSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
    setIsArchiveModalOpen(false);
    setSyncFeedback(`✓ Saved current layout to rotation history for "${archiveSeasonName}".`);
  };

  // Conflict, companion, and multi-season rotation analysis
  const analyzeLayoutIssues = () => {
    if (!currentSpace) return { conflicts: [], companions: [], rotationWarnings: [], familySummary: {} as Record<string, number> };

    const conflicts: string[] = [];
    const companions: string[] = [];
    const rotationWarnings: string[] = [];
    const familyCount: Record<string, number> = {};

    currentSpace.cells.forEach(cell => {
      if (!cell.cropId) return;
      const crop = getCropById(cell.cropId);
      if (!crop) return;

      familyCount[crop.family] = (familyCount[crop.family] || 0) + 1;

      // Check 4 adjacent neighbors (up, down, left, right)
      const neighbors = [
        currentSpace.cells.find(c => c.x === cell.x + 1 && c.y === cell.y),
        currentSpace.cells.find(c => c.x === cell.x - 1 && c.y === cell.y),
        currentSpace.cells.find(c => c.x === cell.x && c.y === cell.y + 1),
        currentSpace.cells.find(c => c.x === cell.x && c.y === cell.y - 1),
      ].filter(Boolean) as GridCell[];

      neighbors.forEach(n => {
        if (!n.cropId) return;
        const neighborCrop = getCropById(n.cropId);
        if (!neighborCrop) return;

        // Check antagonistic
        const isConflict = COMPANION_PAIRS.find(
          p => (p.cropA === crop.id && p.cropB === neighborCrop.id && p.relationship === 'antagonistic') ||
               (p.cropB === crop.id && p.cropA === neighborCrop.id && p.relationship === 'antagonistic')
        );
        if (isConflict) {
          const msg = `${crop.name.split('(')[0]} adjacent to ${neighborCrop.name.split('(')[0]} (${isConflict.notes})`;
          if (!conflicts.includes(msg)) conflicts.push(msg);
        }

        // Check beneficial
        const isBeneficial = COMPANION_PAIRS.find(
          p => (p.cropA === crop.id && p.cropB === neighborCrop.id && p.relationship === 'beneficial') ||
               (p.cropB === crop.id && p.cropA === neighborCrop.id && p.relationship === 'beneficial')
        );
        if (isBeneficial) {
          const msg = `${crop.name.split('(')[0]} + ${neighborCrop.name.split('(')[0]} synergy (${isBeneficial.notes})`;
          if (!companions.includes(msg)) companions.push(msg);
        }
      });
    });

    // Multi-Season Crop Rotation Checks: a family should not return to the
    // same bed until its rotation interval has passed (3 yr for nightshades and
    // alliums, 2 yr for brassicas and cucurbits).
    if (currentSpace.seasonHistory && currentSpace.seasonHistory.length > 0) {
      const activeFamilies = Object.keys(familyCount) as PlantFamily[];
      const thisYear = new Date().getFullYear();
      const RULES: Partial<Record<PlantFamily, { years: number; label: string; why: string }>> = {
        Solanaceae: { years: 3, label: 'Solanaceae (nightshades)', why: 'soil-borne Fusarium, Verticillium and root-knot nematodes' },
        Alliaceae: { years: 3, label: 'Alliaceae (alliums)', why: 'persistent white rot sclerotia' },
        Brassicaceae: { years: 2, label: 'Brassicaceae (brassicas)', why: 'clubroot and cabbage root maggots' },
        Cucurbitaceae: { years: 2, label: 'Cucurbitaceae (cucurbits)', why: 'overwintering squash vine borers and bacterial wilt' },
      };
      // Most recent season each family grew here
      const lastGrown = new Map<PlantFamily, BedSeasonRecord>();
      currentSpace.seasonHistory.forEach(rec => rec.crops.forEach(c => {
        const prev = lastGrown.get(c.family);
        if (!prev || rec.year > prev.year) lastGrown.set(c.family, rec);
      }));
      lastGrown.forEach((rec, family) => {
        const rule = RULES[family];
        if (!rule || !activeFamilies.includes(family)) return;
        const yearsAgo = thisYear - rec.year;
        if (yearsAgo >= rule.years) return;
        const nextOk = rec.year + rule.years;
        rotationWarnings.push(
          `${rule.label} grew here in ${rec.season}. A ${rule.years}-year rotation is recommended to avoid ${rule.why}; this bed is clear for them from ${nextOk}.`
        );
      });
    }

    return { conflicts, companions, rotationWarnings, familySummary: familyCount };
  };

  const { conflicts, companions, rotationWarnings, familySummary } = analyzeLayoutIssues();

  return (
    <div className="space-y-6">
      {/* Top Header & Space Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223d2e]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] dark:text-[#e4efe7] font-serif-botanical">
            Interactive Garden Bed Designer
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Square Foot Gardening (SFG) grid, multi-season crop rotation history &amp; automatic calendar synchronization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bed -> Calendar Sync Button */}
          {onUpdateTasks && location && (
            <button
              type="button"
              onClick={handleSyncBedTasksToCalendar}
              title="Automatically generate seed starting, transplant, and harvest tasks from crops planted in this bed"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Sync Bed to Calendar</span>
            </button>
          )}

          {/* Archive Season Button */}
          <button
            type="button"
            onClick={() => setIsArchiveModalOpen(true)}
            title="Archive current bed layout to track multi-season crop rotation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 dark:bg-[#182c20] border border-stone-300 dark:border-[#223d2e] text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-200/80 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Archive Season</span>
          </button>

          {/* Printable Layout Trigger */}
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print garden bed layout"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#132219] border border-stone-300 dark:border-[#223d2e] text-stone-700 dark:text-stone-300 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingSpace(true)}
            aria-label="Add new garden bed space"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Garden Space</span>
          </button>
        </div>
      </div>

      {/* Sync / Archive Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToTab && syncFeedback.includes('calendar') && (
              <button
                type="button"
                onClick={() => onNavigateToTab('calendar')}
                className="font-bold underline text-emerald-800 dark:text-emerald-300"
              >
                View in Calendar →
              </button>
            )}
            <button
              type="button"
              onClick={() => setSyncFeedback(null)}
              className="p-1 text-emerald-700 hover:text-emerald-950"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Space Selector Tabs */}
      <div role="tablist" aria-label="Garden bed spaces" className="flex items-center gap-2 overflow-x-auto pb-1">
        {spaces.map(space => (
          <button
            key={space.id}
            type="button"
            role="tab"
            aria-selected={space.id === selectedSpaceId}
            onClick={() => {
              setSelectedSpaceId(space.id);
              setActiveCellCoords(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0 transition-colors flex items-center gap-2 ${
              space.id === selectedSpaceId
                ? 'bg-[#234730] text-white shadow-xs'
                : 'bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#182c20]'
            }`}
          >
            <span>{space.name}</span>
            <span className="text-[10px] opacity-75">
              ({space.gridCols}×{space.gridRows} ft)
            </span>
            {space.seasonHistory && space.seasonHistory.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title={`${space.seasonHistory.length} archived seasons`} />
            )}
          </button>
        ))}
      </div>

      {/* Main Designer Grid & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Grid Map (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-[#223d2e] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#183a24] dark:text-white font-serif-botanical">
                {currentSpace.name} Grid ({currentSpace.gridCols} × {currentSpace.gridRows} ft)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Click any square to plant selected crop. Click again to clear.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentSpace.seasonHistory && currentSpace.seasonHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-stone-100 dark:bg-[#182c20] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#223d2e] flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rotation History ({currentSpace.seasonHistory.length})</span>
                </button>
              )}

              {spaces.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSpace(currentSpace.id)}
                  aria-label="Delete this garden space"
                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Past Season Rotation History Drawer */}
          {isHistoryDrawerOpen && currentSpace.seasonHistory && (
            <div className="p-4 bg-stone-50 dark:bg-[#182c20] border border-stone-200 dark:border-[#223d2e] rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-stone-800 dark:text-white">
                <span className="flex items-center gap-1.5 font-serif-botanical">
                  <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  Past Crop Rotations in {currentSpace.name}
                </span>
                <button type="button" onClick={() => setIsHistoryDrawerOpen(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {currentSpace.seasonHistory.map((rec, idx) => (
                  <div key={idx} className="p-2.5 bg-white dark:bg-[#111f16] rounded-xl border border-stone-200/70 dark:border-[#223d2e] flex items-center justify-between">
                    <div>
                      <strong className="text-stone-900 dark:text-white block">{rec.season}</strong>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        {rec.crops.map(c => `${c.cropName} (${c.family})`).join(', ')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-[#182c20] text-stone-600 dark:text-stone-300">
                      {rec.crops.length} crops
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive CSS Grid */}
          <div className="overflow-x-auto pb-2">
            <div
              className="inline-grid gap-1.5 p-3 bg-stone-100 dark:bg-[#0c1610] rounded-2xl border border-stone-200 dark:border-[#223d2e] select-none"
              style={{
                gridTemplateColumns: `repeat(${currentSpace.gridCols}, minmax(4.5rem, 1fr))`,
              }}
            >
              {Array.from({ length: currentSpace.gridRows }).map((_, y) =>
                Array.from({ length: currentSpace.gridCols }).map((_, x) => {
                  const cell = currentSpace.cells.find(c => c.x === x && c.y === y);
                  const crop = cell?.cropId ? getCropById(cell.cropId) : null;
                  const isCellSelected = activeCellCoords?.x === x && activeCellCoords?.y === y;

                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      onClick={() => handleCellClick(x, y)}
                      className={`h-20 rounded-xl border flex flex-col items-center justify-center p-1 relative transition-all ${
                        isCellSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                          : crop
                          ? 'border-emerald-300 dark:border-emerald-800 bg-[#f7faf7] dark:bg-[#122419] hover:border-emerald-500'
                          : 'border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-[#15251c] hover:bg-stone-50 hover:border-stone-400'
                      }`}
                    >
                      {crop ? (
                        <>
                          <span className="text-2xl leading-none">{crop.iconEmoji}</span>
                          <span className="text-[10px] font-semibold text-stone-800 dark:text-stone-200 text-center leading-tight truncate w-full mt-1">
                            {cell?.varietyName || crop.name.split('(')[0]}
                          </span>
                          <span className="text-[9px] text-emerald-800 dark:text-emerald-400 font-mono">
                            ×{cell?.count || crop.sfgPerSquare}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-mono">
                          {x + 1},{y + 1}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Crop Palette & Multi-Season Rotation Warnings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Crop Selector Palette */}
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#183a24] dark:text-white">Select Crop to Place</h4>
              <span className="text-[10px] text-stone-500 font-mono">SFG Density</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {CROPS_DATA.map(crop => {
                const isSelected = selectedCropToPlace?.id === crop.id;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => setSelectedCropToPlace(crop)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-white font-semibold ring-1 ring-emerald-600'
                        : 'border-stone-200 dark:border-[#223d2e] bg-white dark:bg-[#15251c] text-stone-700 dark:text-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-xl shrink-0">{crop.iconEmoji}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs truncate">{crop.name.split('(')[0]}</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate font-mono">
                        {crop.sfgPerSquare} / sq ft
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCropToPlace && (
              <div className="bg-[#f3f7f4] dark:bg-[#182c20] border border-[#d6e4da] dark:border-[#223d2e] p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-950 dark:text-emerald-300">
                  <span>{selectedCropToPlace.name}</span>
                  <span className="font-mono">{selectedCropToPlace.sfgPerSquare}/sq ft</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">{selectedCropToPlace.soilPreferences}</p>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 pt-1">
                  <strong>Companions:</strong> {selectedCropToPlace.companions.slice(0, 4).join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Conflict, Companion & Rotation Warnings */}
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-[#183a24] dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Bed Ecology &amp; Multi-Season Rotation
            </h4>

            {/* Multi-Season Rotation Alerts */}
            {rotationWarnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Crop Rotation Alert
                </div>
                <ul className="text-[11px] text-amber-950 dark:text-amber-300 space-y-1 pl-4 list-disc">
                  {rotationWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                  Adjacent Antagonists Detected
                </div>
                <ul className="text-[11px] text-rose-900 dark:text-rose-200 space-y-1 pl-4 list-disc">
                  {conflicts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {companions.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  Beneficial Synergies Active
                </div>
                <ul className="text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1 pl-4 list-disc">
                  {companions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {conflicts.length === 0 && companions.length === 0 && rotationWarnings.length === 0 && (
              <p className="text-xs text-stone-500 italic">
                No ecological conflicts or rotation violations detected in this bed layout.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating New Space */}
      {isCreatingSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsCreatingSpace(false)} />
          <form
            onSubmit={handleCreateSpace}
            className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-[#183a24] dark:text-white font-serif-botanical">Add Garden Bed or Container Space</h3>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Space Name</label>
              <input aria-label="Space Name"
                type="text"
                value={newSpaceName}
                onChange={e => setNewSpaceName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                placeholder="e.g. South Fence Raised Bed"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Width (ft)</label>
                <input aria-label="Width (ft)"
                  type="number"
                  min="1"
                  max="12"
                  value={newCols}
                  onChange={e => setNewCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Length (ft)</label>
                <input aria-label="Length (ft)"
                  type="number"
                  min="1"
                  max="12"
                  value={newRows}
                  onChange={e => setNewRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Growing Method</label>
              <select aria-label="Growing Method"
                value={newSpaceType}
                onChange={e => setNewSpaceType(e.target.value as GrowingMethod)}
                className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
              >
                <option value="raised-bed">Raised Bed</option>
                <option value="in-ground">In-Ground Garden</option>
                <option value="containers">Container / Patio Garden</option>
                <option value="indoor">Indoor Grow Lights</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="hydroponics">Hydroponics</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
              <button
                type="button"
                onClick={() => setIsCreatingSpace(false)}
                className="px-3.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422]"
              >
                Create Bed
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal for Archiving Season Layout */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsArchiveModalOpen(false)} />
          <form
            onSubmit={handleArchiveCurrentSeason}
            className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-2">
              <h3 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Archive Season Layout
              </h3>
              <button type="button" onClick={() => setIsArchiveModalOpen(false)} aria-label="Close" className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1e3528]">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <p className="text-stone-600 dark:text-stone-300">
              Snapshot crops in <strong>{currentSpace.name}</strong> to history to empower the 3-year nightshade, brassica, and allium crop rotation monitor.
            </p>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Season Identifier</label>
              <input aria-label="Season Identifier"
                type="text"
                required
                value={archiveSeasonName}
                onChange={e => setArchiveSeasonName(e.target.value)}
                placeholder="e.g. Spring 2025, Fall 2024"
                className="w-full px-3 py-2 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs font-mono"
              />
              <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-300">Include the year: rotation advice counts years from it.</p>
            </div>

            <label className="flex items-start gap-2 text-stone-700 dark:text-stone-200">
              <input
                type="checkbox"
                checked={archiveClearsBed}
                onChange={e => setArchiveClearsBed(e.target.checked)}
                className="mt-0.5 accent-emerald-700"
              />
              <span>Clear the bed after saving, ready to plan the next season</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-3 py-1.5 text-stone-600 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#234730] text-white font-semibold rounded-xl"
              >
                Save Snapshot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
