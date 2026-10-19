import { Crop, GardenLocation, GardenSpace, GardenTask } from '../types/garden';
import { getCropById } from '../data/cropsData';
import { addDays, localDateStr, parseLocalDate } from './dates';

/**
 * Builds the seed-start / plant / harvest schedule for the crops in a bed,
 * anchored to the user's frost dates.
 *
 * Rules:
 * - Each crop gets the NEXT season it can still be planted in: this spring,
 *   this fall, next spring or next fall (whichever planting window has not
 *   closed yet). Crops with fall timing only, like garlic, get a fall plan.
 * - Harvest is counted from the planting date, not from the frost date.
 * - A cell with a recorded plantedDate is already in the ground: only its
 *   harvest is scheduled.
 * - Task ids are deterministic per bed, crop, season and step, so re-syncing
 *   updates dates instead of adding duplicates.
 */

type Weeks = number | [number, number] | undefined;
type Season = 'spring' | 'fall';

interface Window {
  start: Date;
  end: Date;
}

export interface PlannedStep {
  kind: 'seed-start' | 'transplant' | 'direct-sow' | 'harvest';
  window: Window;
  note: string;
}

export interface CropPlan {
  season: Season;
  year: number;
  steps: PlannedStep[];
}

const range = (w: Weeks): [number, number] | null => {
  if (w === undefined || w === null) return null;
  return Array.isArray(w) ? [Math.min(w[0], w[1]), Math.max(w[0], w[1])] : [w, w];
};

const frostDate = (mmdd: string, year: number, fallback: string): Date => {
  const [m, d] = (mmdd || fallback).split('-').map(Number);
  return new Date(year, (m || 1) - 1, d || 1);
};

/** Window that runs `weeks` BEFORE an anchor date, e.g. [6, 8] weeks before frost. */
const beforeWindow = (anchor: Date, w: [number, number]): Window => ({
  start: addDays(anchor, -w[1] * 7),
  end: addDays(anchor, -w[0] * 7),
});

/** Window that runs `weeks` AFTER an anchor date (negative values are before). */
const afterWindow = (anchor: Date, w: [number, number]): Window => ({
  start: addDays(anchor, w[0] * 7),
  end: addDays(anchor, w[1] * 7),
});

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const windowText = (w: Window) =>
  localDateStr(w.start) === localDateStr(w.end) ? fmt(w.start) : `${fmt(w.start)} – ${fmt(w.end)}`;

const harvestStep = (crop: Crop, plant: Window): PlannedStep => {
  const [minDays, maxDays] = crop.daysToMaturityRange;
  const window = { start: addDays(plant.start, minDays), end: addDays(plant.end, maxDays) };
  return {
    kind: 'harvest',
    window,
    note: `Harvest window ${windowText(window)} (${minDays}–${maxDays} days from planting). ${crop.harvestGuidance}`,
  };
};

function springPlan(crop: Crop, location: GardenLocation, year: number): CropPlan | null {
  const t = crop.plantingTiming;
  const frost = frostDate(location.lastSpringFrost, year, '04-15');
  const indoor = range(t.indoorStartWeeksBeforeLastFrost);
  const transplant = range(t.transplantWeeksAfterLastFrost);
  const sowBefore = range(t.directSowWeeksBeforeLastFrost);
  const sowAfter = range(t.directSowWeeksAfterLastFrost);

  const steps: PlannedStep[] = [];
  let plant: Window | null = null;

  if (transplant) {
    plant = afterWindow(frost, transplant);
    if (indoor) {
      const w = beforeWindow(frost, indoor);
      steps.push({ kind: 'seed-start', window: w, note: `Start seeds indoors ${windowText(w)}, ${indoor[0]}–${indoor[1]} weeks before your last spring frost (${location.lastSpringFrost}).` });
    }
    steps.push({ kind: 'transplant', window: plant, note: `Set out transplants ${windowText(plant)}. Harden off for 7–10 days first. ${crop.sfgPerSquare} per square foot.` });
  } else if (sowBefore || sowAfter) {
    plant = {
      start: sowBefore ? addDays(frost, -sowBefore[1] * 7) : addDays(frost, sowAfter![0] * 7),
      end: sowAfter ? addDays(frost, sowAfter[1] * 7) : addDays(frost, -sowBefore![0] * 7),
    };
    if (indoor) {
      const w = beforeWindow(frost, indoor);
      steps.push({ kind: 'seed-start', window: w, note: `Optional head start: sow indoors ${windowText(w)} and plant out during the sowing window.` });
    }
    steps.push({ kind: 'direct-sow', window: plant, note: `Direct sow ${windowText(plant)}, ${crop.plantingDepthInches} deep.` });
  }

  if (!plant) return null;
  steps.push(harvestStep(crop, plant));
  return { season: 'spring', year, steps };
}

function fallPlan(crop: Crop, location: GardenLocation, year: number): CropPlan | null {
  const fall = range(crop.plantingTiming.fallPlantingWeeksBeforeFirstFrost);
  if (!fall) return null;
  const frost = frostDate(location.firstFallFrost, year, '10-15');
  const plant = beforeWindow(frost, fall);
  const overwinter = crop.plantingTiming.overwinteringSafe ? ' Overwinters in the bed.' : '';
  return {
    season: 'fall',
    year,
    steps: [
      { kind: 'direct-sow', window: plant, note: `Plant for a fall crop ${windowText(plant)}, ${fall[0]}–${fall[1]} weeks before your first fall frost (${location.firstFallFrost}).${overwinter}` },
      harvestStep(crop, plant),
    ],
  };
}

/** The next plan whose planting window has not closed yet. */
export function planCrop(crop: Crop, location: GardenLocation, today: Date = new Date()): CropPlan | null {
  const todayStart = parseLocalDate(localDateStr(today));
  const y = todayStart.getFullYear();
  const candidates = [springPlan(crop, location, y), fallPlan(crop, location, y), springPlan(crop, location, y + 1), fallPlan(crop, location, y + 1)]
    .filter((p): p is CropPlan => p !== null)
    .map(p => ({ p, plantStep: p.steps.find(s => s.kind === 'transplant' || s.kind === 'direct-sow')! }))
    .filter(({ plantStep }) => plantStep.window.end >= todayStart)
    .sort((a, b) => a.plantStep.window.start.getTime() - b.plantStep.window.start.getTime());
  return candidates[0]?.p ?? null;
}

/** Harvest-only plan for a crop already in the ground. */
export function planPlantedCrop(crop: Crop, plantedDate: string, today: Date = new Date()): CropPlan | null {
  const planted = parseLocalDate(plantedDate);
  const step = harvestStep(crop, { start: planted, end: planted });
  if (step.window.end < parseLocalDate(localDateStr(today))) return null;
  return { season: planted.getMonth() >= 6 ? 'fall' : 'spring', year: planted.getFullYear(), steps: [step] };
}

const TITLES: Record<PlannedStep['kind'], (crop: string, bed: string, season: string) => string> = {
  'seed-start': (c, b, s) => `Start ${c} seeds indoors for ${b} (${s})`,
  'transplant': (c, b, s) => `Transplant ${c} into ${b} (${s})`,
  'direct-sow': (c, b, s) => `Plant ${c} in ${b} (${s})`,
  'harvest': (c, b, s) => `Harvest ${c} from ${b} (${s})`,
};

const TASK_TYPE: Record<PlannedStep['kind'], GardenTask['type']> = {
  'seed-start': 'seed-start',
  'transplant': 'transplant',
  'direct-sow': 'direct-sow',
  'harvest': 'harvest',
};

/** All tasks for one bed. Due dates never fall before today. */
export function buildBedTasks(space: GardenSpace, location: GardenLocation, today: Date = new Date()): GardenTask[] {
  const todayStr = localDateStr(today);
  const cropIds = Array.from(new Set(space.cells.map(c => c.cropId).filter((id): id is string => !!id)));
  const tasks: GardenTask[] = [];

  cropIds.forEach(cropId => {
    const crop = getCropById(cropId);
    if (!crop) return;
    const name = crop.name.split('(')[0].trim();

    const plantedCell = space.cells.find(c => c.cropId === cropId && c.plantedDate);
    const plan = plantedCell?.plantedDate ? planPlantedCrop(crop, plantedCell.plantedDate, today) : planCrop(crop, location, today);
    if (!plan) return;

    const seasonLabel = `${plan.season === 'spring' ? 'Spring' : 'Fall'} ${plan.year}`;
    plan.steps.forEach(step => {
      // A step whose whole window is already over is skipped (e.g. the seed
      // start date passed but transplants can still go in).
      if (localDateStr(step.window.end) < todayStr) return;
      const startStr = localDateStr(step.window.start);
      tasks.push({
        id: `bed-${space.id}-${crop.id}-${plan.season}${plan.year}-${step.kind}`,
        title: TITLES[step.kind](name, space.name, seasonLabel),
        type: TASK_TYPE[step.kind],
        cropId: crop.id,
        cropName: name,
        dueDate: startStr < todayStr ? todayStr : startStr,
        completed: false,
        notes: step.note,
      });
    });
  });

  return tasks;
}

/**
 * Merge generated tasks into the existing list by id: new ids are added,
 * unfinished matching tasks get refreshed dates and notes, completed tasks
 * are left alone.
 */
export function mergeBedTasks(existing: GardenTask[], generated: GardenTask[]): { tasks: GardenTask[]; added: number; updated: number } {
  const byId = new Map(generated.map(t => [t.id, t]));
  let updated = 0;
  const merged = existing.map(t => {
    const g = byId.get(t.id);
    if (!g) return t;
    byId.delete(t.id);
    if (t.completed || (t.dueDate === g.dueDate && t.notes === g.notes && t.title === g.title)) return t;
    updated++;
    return { ...t, title: g.title, dueDate: g.dueDate, notes: g.notes };
  });
  const added = Array.from(byId.values());
  return { tasks: [...merged, ...added], added: added.length, updated };
}
