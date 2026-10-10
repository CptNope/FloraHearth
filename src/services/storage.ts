import { GardenLocation, UserPreferences, GardenSpace, GardenTask, PantryItem, JournalEntry, SoilTestRecord, HydroWaterRecord, ExpenseRecord } from '../types/garden';
import { lookupLocation } from '../data/usClimates';

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
    notes: '4x8 cedar raised bed installed with drip emitter tubing on timer.'
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
    title: 'Late Summer Tomato & Pepper Harvest Tally',
    category: 'harvest',
    content: 'Massive harvest day! Picked 28 lbs of Roma paste tomatoes, 6 lbs of Sun Gold cherry tomatoes, and 14 bell peppers. Canned 7 quarts of marinara sauce following USDA acidification guidelines.',
    yieldLbs: 34,
    tags: ['harvest', 'canning', 'tomatoes']
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

// Helper functions for reading and writing to localStorage
export function getSavedLocation(): GardenLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved location', e);
  }
  return DEFAULT_LOCATION;
}

export function saveLocation(loc: GardenLocation): void {
  localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
}

export function getSavedPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(pref: UserPreferences): void {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(pref));
}

export function getSavedSpaces(): GardenSpace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPACES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse spaces', e);
  }
  return INITIAL_SAMPLE_SPACES;
}

export function saveSpaces(spaces: GardenSpace[]): void {
  localStorage.setItem(STORAGE_KEYS.SPACES, JSON.stringify(spaces));
}

export function getSavedTasks(): GardenTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse tasks', e);
  }
  return INITIAL_SAMPLE_TASKS;
}

export function saveTasks(tasks: GardenTask[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getSavedPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PANTRY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse pantry', e);
  }
  return INITIAL_SAMPLE_PANTRY;
}

export function savePantry(items: PantryItem[]): void {
  localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
}

export function getSavedJournal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse journal', e);
  }
  return INITIAL_SAMPLE_JOURNAL;
}

export function saveJournal(entries: JournalEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export function getSavedExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse expenses', e);
  }
  return INITIAL_SAMPLE_EXPENSES;
}

export function saveExpenses(records: ExpenseRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(records));
}

export function getSavedSoilTests(): SoilTestRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOIL_TESTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse soil tests', e);
  }
  return INITIAL_SAMPLE_SOIL;
}

export function saveSoilTests(records: SoilTestRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.SOIL_TESTS, JSON.stringify(records));
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
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(bundle, null, 2);
}

export function importAllDataJson(jsonString: string): boolean {
  try {
    const bundle = JSON.parse(jsonString);
    if (bundle.location) saveLocation(bundle.location);
    if (bundle.preferences) savePreferences(bundle.preferences);
    if (bundle.spaces) saveSpaces(bundle.spaces);
    if (bundle.tasks) saveTasks(bundle.tasks);
    if (bundle.pantry) savePantry(bundle.pantry);
    if (bundle.journal) saveJournal(bundle.journal);
    if (bundle.expenses) saveExpenses(bundle.expenses);
    if (bundle.soilTests) saveSoilTests(bundle.soilTests);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

export function isSetupComplete(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SETUP_DONE) === 'true';
}

export function setSetupComplete(val: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SETUP_DONE, val ? 'true' : 'false');
}
