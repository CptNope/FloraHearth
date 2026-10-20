import { GardenLocation, UserPreferences, GardenSpace, GardenTask, PantryItem, JournalEntry, SoilTestRecord, HydroWaterRecord, ExpenseRecord, SeedPacket } from '../types/garden';
import { lookupLocation } from '../data/usClimates';
import { localDateStr } from './dates';

const STORAGE_KEYS = {
  LOCATION: 'florahearth_location_v1',
  PREFERENCES: 'florahearth_preferences_v1',
  SPACES: 'florahearth_spaces_v1',
  TASKS: 'florahearth_tasks_v1',
  PANTRY: 'florahearth_pantry_v1',
  JOURNAL: 'florahearth_journal_v1',
  SOIL_TESTS: 'florahearth_soil_v1',
  HYDRO_TESTS: 'florahearth_hydro_v1',
  EXPENSES: 'florahearth_expenses_v1',
  SEEDS: 'florahearth_seeds_v1',
  SETUP_DONE: 'florahearth_setup_done_v1',
};

export const DEFAULT_LOCATION: GardenLocation = lookupLocation('75201'); // Dallas, TX / South Central Zone 8a

export const DEFAULT_PREFERENCES: UserPreferences = {
  householdSize: 3,
  availableHoursPerWeek: 5,
  budgetLevel: 'moderate',
  goals: ['fresh-eating', 'preserving', 'reducing-grocery-bills'],
  favoriteCrops: ['tomato', 'sweet-pepper', 'basil', 'bush-beans', 'kale', 'strawberry'],
  unitSystem: 'us',
};

export const INITIAL_SAMPLE_SPACES: GardenSpace[] = [
  {
    id: 'bed-1',
    name: 'Backyard Raised Bed 1 (Kitchen Greens & Roots)',
    type: 'raised-bed',
    widthFt: 4,
    lengthFt: 8,
    sunlight: 'full-sun',
    soilType: 'raised-bed-mix',
    waterAccess: 'drip',
    gridCols: 8,
    gridRows: 4,
    cells: [
      { x: 0, y: 0, cropId: 'tomato', varietyName: 'Cherokee Purple', count: 1 },
      { x: 1, y: 0, cropId: 'basil', varietyName: 'Genovese', count: 2 },
      { x: 2, y: 0, cropId: 'sweet-pepper', varietyName: 'California Wonder', count: 1 },
      { x: 3, y: 0, cropId: 'marigold', varietyName: 'French Sparky Mix', count: 4 },
      { x: 4, y: 0, cropId: 'bush-beans', varietyName: 'Provider', count: 9 },
      { x: 5, y: 0, cropId: 'bush-beans', varietyName: 'Provider', count: 9 },
      { x: 6, y: 0, cropId: 'carrots', varietyName: 'Nantes Bolero', count: 16 },
      { x: 7, y: 0, cropId: 'kale', varietyName: 'Lacinato', count: 1 },
      { x: 0, y: 1, cropId: 'tomato', varietyName: 'Sun Gold', count: 1 },
      { x: 1, y: 1, cropId: 'sweet-alyssum', varietyName: 'Carpet of Snow', count: 4 },
      { x: 2, y: 1, cropId: 'lettuce', varietyName: 'Buttercrunch', count: 4 },
      { x: 3, y: 1, cropId: 'radish', varietyName: 'Cherry Belle', count: 16 },
    ],
    notes: '4x8 cedar raised bed installed with drip emitter tubing on timer.',
    seasonHistory: [
      {
        season: 'Summer 2025',
        year: 2025,
        crops: [
          { cropId: 'tomato', cropName: 'Cherokee Purple', family: 'Solanaceae' },
          { cropId: 'sweet-pepper', cropName: 'California Wonder', family: 'Solanaceae' }
        ]
      }
    ]
  },
  {
    id: 'bed-2',
    name: 'Sunny Patio Herb & Strawberry Containers',
    type: 'containers',
    widthFt: 3,
    lengthFt: 4,
    sunlight: 'full-sun',
    soilType: 'potting-soil',
    waterAccess: 'hose',
    gridCols: 4,
    gridRows: 3,
    cells: [
      { x: 0, y: 0, cropId: 'strawberry', varietyName: 'Albion', count: 1 },
      { x: 1, y: 0, cropId: 'strawberry', varietyName: 'Albion', count: 1 },
      { x: 2, y: 0, cropId: 'borage', varietyName: 'Common Starflower', count: 1 },
      { x: 3, y: 0, cropId: 'rosemary', varietyName: 'Tuscan Blue', count: 1 },
    ],
    notes: 'Terra cotta and fabric smart pots on back deck.'
  }
];

export const INITIAL_SAMPLE_TASKS: GardenTask[] = [
  {
    id: 'task-1',
    title: 'Seed starting: Tomatoes & Peppers indoors under grow light',
    type: 'seed-start',
    cropId: 'tomato',
    cropName: 'Tomato & Peppers',
    dueDate: '2026-03-01',
    completed: true,
    completedDate: '2026-03-01',
    notes: 'Sown in 72-cell trays with seedling heat mat set to 75°F.'
  },
  {
    id: 'task-2',
    title: 'Harden off tomato seedlings (gradual sun/wind exposure)',
    type: 'maintenance',
    cropId: 'tomato',
    cropName: 'Tomato',
    dueDate: '2026-04-10',
    completed: false,
    notes: '2 hours day 1 in dappled shade, increasing by 1 hour daily over 8 days.'
  },
  {
    id: 'task-3',
    title: 'Transplant tomatoes and basil into Raised Bed 1',
    type: 'transplant',
    cropId: 'tomato',
    cropName: 'Tomato',
    dueDate: '2026-04-18',
    completed: false,
    notes: 'Bury tomato stems deep up to the lowest set of true leaves.'
  },
  {
    id: 'task-4',
    title: 'Direct sow carrot and radish successions',
    type: 'direct-sow',
    cropId: 'carrots',
    cropName: 'Carrots & Radishes',
    dueDate: '2026-04-25',
    completed: false,
    notes: 'Keep seed furrow damp for 10-14 days with burlap or board until sprout.'
  },
  {
    id: 'task-5',
    title: 'Inspect brassicas for cabbage looper eggs & install insect netting',
    type: 'pest-check',
    cropId: 'kale',
    cropName: 'Kale & Broccoli',
    dueDate: '2026-05-02',
    completed: false,
    notes: 'Check leaf undersides for small bullet-shaped white eggs.'
  }
];

export const INITIAL_SAMPLE_PANTRY: PantryItem[] = [
  {
    id: 'pantry-1',
    cropName: 'Crushed San Marzano Tomatoes with Basil',
    preservationType: 'water-bath-canned',
    quantity: 12,
    unit: 'quart jars',
    datePrepared: '2026-08-20',
    bestByDate: '2027-08-20',
    storageLocation: 'Pantry Shelf',
    testedSourceReference: 'USDA Complete Guide Guide 3 (Acidified with 2 tbsp lemon juice/qt, processed 45 min)',
    notes: 'Rich tomato base for pasta and stews.'
  },
  {
    id: 'pantry-2',
    cropName: 'Lacto-Fermented Dill Pickles',
    preservationType: 'fermented',
    quantity: 4,
    unit: 'quart jars',
    datePrepared: '2026-07-15',
    bestByDate: '2027-01-15',
    storageLocation: 'Crisper',
    testedSourceReference: 'NCHFP Fermenting Guide (3.5% salt brine with grape leaves for crispness)',
    notes: 'Crunchy and tangy garlic dill pickles.'
  },
  {
    id: 'pantry-3',
    cropName: 'Blanched Provider Green Beans',
    preservationType: 'frozen',
    quantity: 8,
    unit: '1-lb bags',
    datePrepared: '2026-06-30',
    bestByDate: '2027-06-30',
    storageLocation: 'Freezer',
    testedSourceReference: 'NCHFP Freezing Guide (3-minute boil blanch + 3-minute ice plunge)',
    notes: 'Vibrant green, vacuum sealed in freezer bags.'
  },
  {
    id: 'pantry-4',
    cropName: 'Cured Music Hardneck Garlic',
    preservationType: 'cured-storage',
    quantity: 35,
    unit: 'whole bulbs',
    datePrepared: '2026-07-28',
    bestByDate: '2027-04-30',
    storageLocation: 'Cool Dark Closet',
    testedSourceReference: 'Dried 3 weeks on mesh racks with oscillating fan; necks trimmed 1 inch',
    notes: 'Stout, aromatic porcelain garlic.'
  }
];

export const INITIAL_SAMPLE_JOURNAL: JournalEntry[] = [
  {
    id: 'journal-1',
    date: '2026-10-01',
    title: 'Fall Bed Refresh & Garlic Bed Preparation',
    category: 'planting',
    content: 'Broadforked Bed 1 and dressed with 2 inches of composted leaf mold. Planted 24 cloves of Music hardneck garlic 2 inches deep, spaced 6 inches apart. Mulched with 3 inches of clean straw for winter protection.',
    tags: ['garlic', 'soil-building', 'fall-prep']
  },
  {
    id: 'journal-2',
    date: '2026-09-15',
    title: 'Late Summer Tomato Harvest Tally',
    category: 'harvest',
    content: 'Massive harvest day! Picked 28 lbs of Roma paste tomatoes and 6 lbs of Sun Gold cherry tomatoes. Canned 7 quarts of marinara sauce following USDA acidification guidelines.',
    cropId: 'tomato',
    cropName: 'Roma & Sun Gold Tomatoes',
    yieldLbs: 34,
    tags: ['harvest', 'canning', 'tomatoes']
  },
  {
    id: 'journal-3',
    date: '2026-09-22',
    title: 'Provider Bush Green Bean Flush',
    category: 'harvest',
    content: 'Crisp green bean picking before dinner. Blanched and vacuum sealed 8 quart bags for the freezer pantry.',
    cropId: 'bush-beans',
    cropName: 'Provider Bush Beans',
    yieldLbs: 12,
    tags: ['harvest', 'freezing', 'beans']
  }
];

export const INITIAL_SAMPLE_EXPENSES: ExpenseRecord[] = [
  { id: 'exp-1', date: '2026-02-15', category: 'seeds', itemDescription: 'Organic Heirloom Seeds (Baker Creek & Johnny’s)', cost: 38.50 },
  { id: 'exp-2', date: '2026-03-02', category: 'soil-amendments', itemDescription: 'Local organic compost (4 bags) & worm castings', cost: 42.00 },
  { id: 'exp-3', date: '2026-03-20', category: 'equipment', itemDescription: 'Drip irrigation drip tape and timer', cost: 49.99 },
  { id: 'exp-4', date: '2026-04-10', category: 'pest-control', itemDescription: 'Bt spray & 0.8mm insect netting hoop cover', cost: 24.50 },
];

export const INITIAL_SAMPLE_SOIL: SoilTestRecord[] = [
  {
    id: 'soil-1',
    date: '2026-03-10',
    locationName: 'Raised Bed 1',
    ph: 6.6,
    nitrogen: 'optimal',
    phosphorus: 'optimal',
    potassium: 'low',
    organicMatterPct: 6.8,
    notes: 'Cooperative Extension Lab test. pH is in prime range for nightshades and brassicas.',
    recommendedAction: 'Top dress with kelp meal or sulfate of potash to bring potassium into optimal balance without raising pH.'
  }
];

export const INITIAL_SAMPLE_HYDRO: HydroWaterRecord[] = [
  {
    id: 'hydro-1',
    date: '2026-10-15',
    systemType: 'kratky',
    ph: 6.2,
    ecPpm: 850,
    waterTempF: 68,
    ammoniaPpm: 0,
    nitritePpm: 0,
    nitratePpm: 35,
    notes: 'Lettuce and basil Kratky buckets. Vibrant root development, clear nutrient solution.'
  },
  {
    id: 'hydro-2',
    date: '2026-10-18',
    systemType: 'dwc',
    ph: 5.9,
    ecPpm: 1250,
    waterTempF: 70,
    ammoniaPpm: 0,
    nitritePpm: 0,
    nitratePpm: 50,
    notes: 'DWC tomato bucket with air stone bubbling. Transitioned to flowering formula.'
  }
];

export const INITIAL_SAMPLE_SEEDS: SeedPacket[] = [
  { id: 'seed-1', cropId: 'tomato', varietyName: 'Cherokee Purple', brand: 'Baker Creek Heirloom', yearBought: 2025, quantityStatus: 'full', germinationRatePct: 95 },
  { id: 'seed-2', cropId: 'tomato', varietyName: 'Sun Gold F1', brand: 'Johnny’s Selected Seeds', yearBought: 2024, quantityStatus: 'half', germinationRatePct: 90 },
  { id: 'seed-3', cropId: 'basil', varietyName: 'Genovese', brand: 'High Mowing Organic', yearBought: 2025, quantityStatus: 'full', germinationRatePct: 92 },
  { id: 'seed-4', cropId: 'bush-beans', varietyName: 'Provider', brand: 'Botanical Interests', yearBought: 2025, quantityStatus: 'half', germinationRatePct: 88 },
  { id: 'seed-5', cropId: 'onion', varietyName: 'Yellow Sweet Spanish', brand: 'Southern Exposure', yearBought: 2024, quantityStatus: 'few-left', germinationRatePct: 65, notes: 'Onion seeds lose viability fast past 1 year. Recommend damp paper towel test.' },
  { id: 'seed-6', cropId: 'kale', varietyName: 'Lacinato Dinosaur', brand: 'Seed Savers Exchange', yearBought: 2023, quantityStatus: 'half', germinationRatePct: 85 },
  { id: 'seed-7', cropId: 'parsnip', varietyName: 'Hollow Crown', brand: 'Territorial Seed', yearBought: 2024, quantityStatus: 'half', germinationRatePct: 45, notes: 'Parsnip seed drops dramatically in germination past year 1.' }
];

// Helper functions for reading and writing to localStorage safely
export const STORAGE_ERROR_EVENT = 'florahearth-storage-error';
export const OPEN_BACKUP_EVENT = 'florahearth-open-backup';

// Lets the storage-error banner open Journal > Sync & Backup whether or not
// the Journal tab is mounted yet.
let pendingOpenBackup = false;
export function requestOpenBackup(): void {
  pendingOpenBackup = true;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_BACKUP_EVENT));
}
export function consumeOpenBackupRequest(): boolean {
  const v = pendingOpenBackup;
  pendingOpenBackup = false;
  return v;
}
export type StorageErrorKind = 'quota' | 'blocked';

const WEATHER_CACHE_KEY = 'florahearth_weather_cache';

function isQuotaError(e: unknown): boolean {
  const err = e as { name?: string; code?: number };
  return err?.name === 'QuotaExceededError' || err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err?.code === 22 || err?.code === 1014;
}

/**
 * Write to localStorage. Returns false if the value could not be saved, and
 * tells the app so it can warn the user instead of failing silently.
 * On a full store, the disposable weather cache is dropped and the write retried.
 */
function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (isQuotaError(e) && key !== WEATHER_CACHE_KEY) {
      try {
        window.localStorage.removeItem(WEATHER_CACHE_KEY);
        window.localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        e = e2;
      }
    }
    console.warn(`Failed to write to localStorage for key: ${key}`, e);
    const kind: StorageErrorKind = isQuotaError(e) ? 'quota' : 'blocked';
    window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: { key, kind } }));
    return false;
  }
}

/**
 * Ask the browser not to evict FloraHearth's data under storage pressure.
 * Chromium decides silently; some browsers show a prompt, so only call this
 * from a user action or an installed app.
 */
export async function requestPersistentStorage(): Promise<'persisted' | 'denied' | 'unsupported'> {
  try {
    if (!navigator.storage?.persist) return 'unsupported';
    if (await navigator.storage.persisted()) return 'persisted';
    return (await navigator.storage.persist()) ? 'persisted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function getPersistenceStatus(): Promise<'persisted' | 'not-persisted' | 'unsupported'> {
  try {
    if (!navigator.storage?.persisted) return 'unsupported';
    return (await navigator.storage.persisted()) ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  } catch (e) {
    console.warn(`Failed to read from localStorage for key: ${key}`, e);
    return null;
  }
}

/**
 * True once the user has saved anything on this device (setup, a bed, a task,
 * a journal entry...). Getters fall back to the sample garden until then, so
 * this is how we tell "real data" apart from the demo set.
 */
export function hasUserSavedData(): boolean {
  if (isSetupComplete()) return true;
  return Object.entries(STORAGE_KEYS).some(
    ([name, key]) => name !== 'SETUP_DONE' && safeGetItem(key) !== null
  );
}

/**
 * Sample fallback for collections added after launch (seeds, hydro readings).
 * Someone upgrading with an existing garden should start with an empty list,
 * not see demo packets mixed into their real inventory.
 */
function sampleFallbackForNewKey<T>(samples: T[]): T[] {
  return hasUserSavedData() ? [] : samples;
}

export function getSavedLocation(): GardenLocation {
  try {
    const raw = safeGetItem(STORAGE_KEYS.LOCATION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_LOCATION,
          ...parsed,
          city: parsed.city || DEFAULT_LOCATION.city,
          state: parsed.state || DEFAULT_LOCATION.state,
          usdaZone: parsed.usdaZone || DEFAULT_LOCATION.usdaZone,
          lastSpringFrost: parsed.lastSpringFrost || DEFAULT_LOCATION.lastSpringFrost,
          firstFallFrost: parsed.firstFallFrost || DEFAULT_LOCATION.firstFallFrost,
          growingSeasonDays: Number(parsed.growingSeasonDays) || DEFAULT_LOCATION.growingSeasonDays,
          climateRegion: parsed.climateRegion || DEFAULT_LOCATION.climateRegion,
          isMildWinter: typeof parsed.isMildWinter === 'boolean' ? parsed.isMildWinter : DEFAULT_LOCATION.isMildWinter,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved location', e);
  }
  return DEFAULT_LOCATION;
}

export function saveLocation(loc: GardenLocation): void {
  safeSetItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
}

export function getSavedPreferences(): UserPreferences {
  try {
    const raw = safeGetItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          goals: Array.isArray(parsed.goals) ? parsed.goals : DEFAULT_PREFERENCES.goals,
          favoriteCrops: Array.isArray(parsed.favoriteCrops) ? parsed.favoriteCrops : DEFAULT_PREFERENCES.favoriteCrops,
          householdSize: Number(parsed.householdSize) || DEFAULT_PREFERENCES.householdSize,
          availableHoursPerWeek: Number(parsed.availableHoursPerWeek) || DEFAULT_PREFERENCES.availableHoursPerWeek,
          unitSystem: parsed.unitSystem === 'metric' ? 'metric' : 'us',
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(pref: UserPreferences): void {
  safeSetItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(pref));
}

export function getSavedSpaces(): GardenSpace[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.SPACES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((sp, idx) => ({
          ...sp,
          id: sp.id || `space-${idx}`,
          name: sp.name || `Garden Bed ${idx + 1}`,
          type: sp.type || 'raised-bed',
          widthFt: Number(sp.widthFt) || 4,
          lengthFt: Number(sp.lengthFt) || 8,
          gridCols: Number(sp.gridCols) || 8,
          gridRows: Number(sp.gridRows) || 4,
          cells: Array.isArray(sp.cells) ? sp.cells : [],
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse spaces', e);
  }
  return INITIAL_SAMPLE_SPACES;
}

export function saveSpaces(spaces: GardenSpace[]): void {
  safeSetItem(STORAGE_KEYS.SPACES, JSON.stringify(spaces));
}

export function getSavedTasks(): GardenTask[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.TASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t, idx) => ({
          ...t,
          id: t.id || `task-${idx}`,
          title: t.title || 'Garden Task',
          type: t.type || 'maintenance',
          dueDate: t.dueDate || localDateStr(),
          completed: Boolean(t.completed),
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse tasks', e);
  }
  return INITIAL_SAMPLE_TASKS;
}

export function saveTasks(tasks: GardenTask[]): void {
  safeSetItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getSavedPantry(): PantryItem[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.PANTRY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, idx) => ({
          ...p,
          id: p.id || `pantry-${idx}`,
          cropName: p.cropName || 'Preserved Crop',
          quantity: Number(p.quantity) || 1,
          unit: p.unit || 'units',
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse pantry', e);
  }
  return INITIAL_SAMPLE_PANTRY;
}

export function savePantry(items: PantryItem[]): void {
  safeSetItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
}

export function getSavedJournal(): JournalEntry[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.JOURNAL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse journal', e);
  }
  return INITIAL_SAMPLE_JOURNAL;
}

export function saveJournal(entries: JournalEntry[]): void {
  safeSetItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export function getSavedExpenses(): ExpenseRecord[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.EXPENSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse expenses', e);
  }
  return INITIAL_SAMPLE_EXPENSES;
}

export function saveExpenses(records: ExpenseRecord[]): void {
  safeSetItem(STORAGE_KEYS.EXPENSES, JSON.stringify(records));
}

export function getSavedSoilTests(): SoilTestRecord[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.SOIL_TESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse soil tests', e);
  }
  return INITIAL_SAMPLE_SOIL;
}

export function saveSoilTests(records: SoilTestRecord[]): void {
  safeSetItem(STORAGE_KEYS.SOIL_TESTS, JSON.stringify(records));
}

export function getSavedHydroTests(): HydroWaterRecord[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.HYDRO_TESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse hydro tests', e);
  }
  return sampleFallbackForNewKey(INITIAL_SAMPLE_HYDRO);
}

export function saveHydroTests(records: HydroWaterRecord[]): void {
  safeSetItem(STORAGE_KEYS.HYDRO_TESTS, JSON.stringify(records));
}

export function getSavedSeeds(): SeedPacket[] {
  try {
    const raw = safeGetItem(STORAGE_KEYS.SEEDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse seeds', e);
  }
  return sampleFallbackForNewKey(INITIAL_SAMPLE_SEEDS);
}

export function saveSeeds(seeds: SeedPacket[]): void {
  safeSetItem(STORAGE_KEYS.SEEDS, JSON.stringify(seeds));
}

export function exportAllDataJson(): string {
  const bundle = {
    location: getSavedLocation(),
    preferences: getSavedPreferences(),
    spaces: getSavedSpaces(),
    tasks: getSavedTasks(),
    pantry: getSavedPantry(),
    journal: getSavedJournal(),
    expenses: getSavedExpenses(),
    soilTests: getSavedSoilTests(),
    hydroTests: getSavedHydroTests(),
    seeds: getSavedSeeds(),
    exportedAt: new Date().toISOString(),
    version: '2.0'
  };
  return JSON.stringify(bundle, null, 2);
}

const BUNDLE_COLLECTION_KEYS = ['spaces', 'tasks', 'pantry', 'journal', 'expenses', 'soilTests', 'hydroTests', 'seeds'] as const;

/**
 * Check that a parsed object looks like a FloraHearth backup before anything
 * is written. Returns an error message, or null when it is valid.
 */
export function validateBackupBundle(bundle: unknown): string | null {
  if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
    return 'The file is not a FloraHearth backup.';
  }
  const b = bundle as Record<string, unknown>;
  const hasKnownKey = ['location', 'preferences', ...BUNDLE_COLLECTION_KEYS].some(k => k in b);
  if (!hasKnownKey) return 'The file does not contain any FloraHearth garden data.';
  for (const k of BUNDLE_COLLECTION_KEYS) {
    if (k in b && !Array.isArray(b[k])) return `The backup's "${k}" section is damaged.`;
  }
  if ('location' in b && (typeof b.location !== 'object' || b.location === null)) {
    return 'The backup\'s location section is damaged.';
  }
  return null;
}

/** The exportedAt timestamp of a backup string, or null if it has none. */
export function getBundleExportedAt(jsonString: string): string | null {
  try {
    const b = JSON.parse(jsonString);
    return typeof b?.exportedAt === 'string' ? b.exportedAt : null;
  } catch {
    return null;
  }
}

export function importAllDataJson(jsonString: string): boolean {
  try {
    const bundle = JSON.parse(jsonString);
    if (validateBackupBundle(bundle) !== null) return false;
    if (bundle.location) saveLocation(bundle.location);
    if (bundle.preferences) savePreferences(bundle.preferences);
    if (bundle.spaces) saveSpaces(bundle.spaces);
    if (bundle.tasks) saveTasks(bundle.tasks);
    if (bundle.pantry) savePantry(bundle.pantry);
    if (bundle.journal) saveJournal(bundle.journal);
    if (bundle.expenses) saveExpenses(bundle.expenses);
    if (bundle.soilTests) saveSoilTests(bundle.soilTests);
    // Backups from before v2.0 have no seeds/hydro: start those empty rather
    // than leaving the demo samples in place.
    saveHydroTests(Array.isArray(bundle.hydroTests) ? bundle.hydroTests : []);
    saveSeeds(Array.isArray(bundle.seeds) ? bundle.seeds : []);
    setSetupComplete(true);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

export function isSetupComplete(): boolean {
  try {
    return safeGetItem(STORAGE_KEYS.SETUP_DONE) === 'true';
  } catch (_) {
    return false;
  }
}

export function setSetupComplete(val: boolean): void {
  safeSetItem(STORAGE_KEYS.SETUP_DONE, val ? 'true' : 'false');
}
