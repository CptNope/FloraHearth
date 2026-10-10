import React, { useState } from 'react';
import { GardenSpace, GridCell, Crop, PlantFamily, GrowingMethod, SunlightLevel } from '../types/garden';
import { CROPS_DATA, getCropById } from '../data/cropsData';
import { COMPANION_PAIRS } from '../data/companionData';
import { Plus, Trash2, Printer, AlertTriangle, Sparkles, Check, Info, ShieldAlert, Layers } from 'lucide-react';

interface GardenPlannerProps {
  spaces: GardenSpace[];
  onUpdateSpaces: (newSpaces: GardenSpace[]) => void;
  activeSpaceId?: string;
}

export const GardenPlanner: React.FC<GardenPlannerProps> = ({
  spaces,
  onUpdateSpaces,
}) => {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(spaces[0]?.id || 'bed-1');
  const [selectedCropToPlace, setSelectedCropToPlace] = useState<Crop | null>(CROPS_DATA[0]);
  const [activeCellCoords, setActiveCellCoords] = useState<{ x: number; y: number } | null>(null);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('New Raised Bed');
  const [newSpaceType, setNewSpaceType] = useState<GrowingMethod>('raised-bed');
  const [newCols, setNewCols] = useState(4);
  const [newRows, setNewRows] = useState(4);

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

  // Conflict and companion analysis for the active space
  const analyzeLayoutIssues = () => {
    if (!currentSpace) return { conflicts: [], companions: [], familySummary: {} as Record<string, number> };

    const conflicts: string[] = [];
    const companions: string[] = [];
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

    return { conflicts, companions, familySummary: familyCount };
  };

  const { conflicts, companions, familySummary } = analyzeLayoutIssues();

  return (
    <div className="space-y-6">
      {/* Top Header & Space Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Interactive Garden Bed Designer
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Square Foot Gardening (SFG) grid &amp; companion ecology planner with crop-family rotation checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Printable Layout Trigger */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
            title="Print garden bed layout"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            Print Plan
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingSpace(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Garden Space
          </button>
        </div>
      </div>

      {/* Space Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {spaces.map(space => (
          <button
            key={space.id}
            type="button"
            onClick={() => {
              setSelectedSpaceId(space.id);
              setActiveCellCoords(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0 transition-colors flex items-center gap-2 ${
              space.id === selectedSpaceId
                ? 'bg-[#234730] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span>{space.name}</span>
            <span className="text-[10px] opacity-75">
              ({space.gridCols}×{space.gridRows} ft)
            </span>
          </button>
        ))}
      </div>

      {/* Main Designer Grid & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Bed Layout Viewport */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs printable-area">
            {/* Bed Meta Banner */}
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#183a24]">{currentSpace?.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                  <span>Type: {currentSpace?.type.replace('-', ' ')}</span>
                  <span>·</span>
                  <span>Dimensions: {currentSpace?.gridCols} × {currentSpace?.gridRows} sq ft</span>
                  <span>·</span>
                  <span>Water: {currentSpace?.waterAccess}</span>
                </div>
              </div>

              {spaces.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSpace(currentSpace.id)}
                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                  title="Delete this bed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Visual Compass Orientation Helper */}
            <div className="text-[11px] text-stone-400 text-center font-mono mb-2">
              ▲ NORTH (Place tall trellises &amp; tomatoes here to prevent shading low crops)
            </div>

            {/* Grid Map */}
            <div
              className="grid gap-2 select-none overflow-x-auto p-3 bg-[#ecf3ee] dark:bg-[#0c1610] border-2 border-[#c2d6c6] dark:border-[#1f3627] rounded-2xl shadow-inner transition-colors"
              style={{
                gridTemplateColumns: `repeat(${currentSpace?.gridCols || 4}, minmax(72px, 1fr))`,
              }}
            >
              {Array.from({ length: currentSpace?.gridRows || 4 }).map((_, rIdx) =>
                Array.from({ length: currentSpace?.gridCols || 4 }).map((_, cIdx) => {
                  const cell = currentSpace?.cells.find(c => c.x === cIdx && c.y === rIdx);
                  const crop = cell?.cropId ? getCropById(cell.cropId) : null;
                  const isCellActive = activeCellCoords?.x === cIdx && activeCellCoords?.y === rIdx;

                  return (
                    <button
                      key={`${cIdx}-${rIdx}`}
                      type="button"
                      onClick={() => handleCellClick(cIdx, rIdx)}
                      className={`h-24 sm:h-28 rounded-xl p-1.5 flex flex-col items-center justify-between border-2 transition-all text-center relative ${
                        isCellActive
                          ? 'ring-2 ring-emerald-500 border-emerald-500 bg-white dark:bg-[#1c3225] shadow-md'
                          : crop
                          ? 'bg-white dark:bg-[#15241b] border-emerald-400/60 dark:border-emerald-500/40 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-400'
                          : 'bg-[#f4f8f5] dark:bg-[#101b14] border-dashed border-[#c2d6c6] dark:border-[rgba(255,255,255,0.12)] hover:bg-[#e7f0e9] dark:hover:bg-[#16241c] hover:border-emerald-400'
                      }`}
                    >
                      {/* Grid Coordinate indicator */}
                      <span className="text-[9px] font-mono text-[#56705d] dark:text-[#7e9987] self-start">
                        {cIdx + 1},{rIdx + 1}
                      </span>

                      {crop ? (
                        <>
                          <span className="text-2xl drop-shadow-xs">{crop.iconEmoji}</span>
                          <div className="w-full truncate">
                            <p className="text-[11px] font-bold text-[#122017] dark:text-[#f3f7f4] truncate leading-tight">
                              {crop.name.split('(')[0]}
                            </p>
                            <span className="text-[9px] text-emerald-700 dark:text-[#34d399] font-semibold block">
                              {cell?.count || crop.sfgPerSquare} per sq ft
                            </span>
                          </div>

                          {/* Family Badge Indicator */}
                          <span className="text-[8px] px-1 bg-stone-100 dark:bg-[#18281f] text-stone-600 dark:text-[#7e9987] rounded-sm font-mono truncate max-w-full">
                            {crop.family}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-[#56705d] dark:text-[#7e9987] opacity-60 self-center my-auto font-medium">
                          + Plant
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Grid Footnote */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 mt-3 pt-2 border-t border-stone-100">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400" />
                1 grid cell = 1 square foot (12&quot; × 12&quot;). Click any cell to place or toggle selected crop.
              </span>
              {activeCellCoords && (
                <button
                  type="button"
                  onClick={() => handleClearCell(activeCellCoords.x, activeCellCoords.y)}
                  className="text-rose-700 hover:text-rose-900 font-medium text-xs"
                >
                  Clear selected cell ({activeCellCoords.x + 1},{activeCellCoords.y + 1})
                </button>
              )}
            </div>
          </div>

          {/* Plant Family Crop-Rotation Tracker */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <h4 className="font-semibold text-xs text-[#183a24] flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              Bed Ecology &amp; Crop Rotation Monitor (Botanical Families)
            </h4>
            <p className="text-[11px] text-stone-600 mb-3">
              To prevent soil-borne pathogens (like Fusarium wilt in Solanaceae or clubroot in Brassicaceae) and nutrient depletion, rotate botanical families to different beds every 3 seasons.
            </p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(familySummary).length > 0 ? (
                Object.entries(familySummary).map(([family, count]) => (
                  <div key={family} className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs flex items-center gap-1.5">
                    <span className="font-semibold text-stone-800">{family}</span>
                    <span className="text-stone-500 font-mono">({count} sq ft)</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-stone-400 italic">No crops placed in this bed yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Crop Placement Palette & Ecology Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Crop Selector Palette */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#183a24]">Select Crop to Place</h4>
              <span className="text-[10px] text-stone-500">Square Foot Density</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {CROPS_DATA.map(crop => {
                const isSelected = selectedCropToPlace?.id === crop.id;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => setSelectedCropToPlace(crop)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-xl shrink-0">{crop.iconEmoji}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs truncate">{crop.name.split('(')[0]}</div>
                      <div className="text-[10px] text-stone-500 truncate font-mono">
                        {crop.sfgPerSquare} / sq ft
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCropToPlace && (
              <div className="bg-[#f3f7f4] border border-[#d6e4da] p-3 rounded-xl text-xs space-y-1 mt-2">
                <div className="flex items-center justify-between font-semibold text-emerald-950">
                  <span>{selectedCropToPlace.name}</span>
                  <span className="font-mono">{selectedCropToPlace.sfgPerSquare}/sq ft</span>
                </div>
                <p className="text-[11px] text-stone-600">{selectedCropToPlace.soilPreferences}</p>
                <div className="text-[10px] text-stone-500 pt-1">
                  <strong>Companions:</strong> {selectedCropToPlace.companions.slice(0, 4).join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Conflict & Synergy Live Warnings */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-[#183a24] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Live Bed Ecology Analysis
            </h4>

            {conflicts.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                  Adjacent Antagonists Detected
                </div>
                <ul className="text-[11px] text-rose-900 space-y-1 pl-4 list-disc">
                  {conflicts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {companions.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  Beneficial Synergies Active
                </div>
                <ul className="text-[11px] text-emerald-900 space-y-1 pl-4 list-disc">
                  {companions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {conflicts.length === 0 && companions.length === 0 && (
              <p className="text-xs text-stone-500 italic">
                Place crops into adjacent squares to detect companion synergies and avoid antagonistic plantings.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating New Space */}
      {isCreatingSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateSpace}
            className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-[#183a24] font-serif-botanical">Add Garden Bed or Container Space</h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Space Name</label>
              <input
                type="text"
                value={newSpaceName}
                onChange={e => setNewSpaceName(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 rounded-xl"
                placeholder="e.g. South Fence Raised Bed"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Width (ft)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newCols}
                  onChange={e => setNewCols(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2 border border-stone-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Length (ft)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newRows}
                  onChange={e => setNewRows(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2 border border-stone-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Growing Method</label>
              <select
                value={newSpaceType}
                onChange={e => setNewSpaceType(e.target.value as GrowingMethod)}
                className="w-full text-xs p-2 border border-stone-300 rounded-xl"
              >
                <option value="raised-bed">Raised Bed</option>
                <option value="in-ground">In-Ground Garden</option>
                <option value="containers">Container / Patio Garden</option>
                <option value="indoor">Indoor Grow Lights</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="hydroponics">Hydroponics</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingSpace(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422]"
              >
                Create Bed
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
