export type SunlightLevel = 'full-sun' | 'partial-sun' | 'partial-shade' | 'deep-shade';
export type GrowingMethod = 'in-ground' | 'raised-bed' | 'containers' | 'indoor' | 'greenhouse' | 'hydroponics' | 'aquaponics';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced';
export type SoilType = 'loamy' | 'sandy-loam' | 'clay' | 'raised-bed-mix' | 'potting-soil' | 'hydroponic-media';
export type WaterAccess = 'drip' | 'hose' | 'hand-can' | 'rainwater-barrel' | 'automated';

export interface GardenLocation {
  zipCode: string;
  city: string;
  state: string;
  usdaZone: string;
  lastSpringFrost: string; // MM-DD
  firstFallFrost: string;  // MM-DD
  growingSeasonDays: number;
  climateRegion: string;
  heatLevel: 'moderate' | 'high' | 'extreme';
  humidityLevel: 'low' | 'moderate' | 'high';
  elevationFt: number;
  isMildWinter: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UserPreferences {
  householdSize: number;
  availableHoursPerWeek: number;
  budgetLevel: 'budget' | 'moderate' | 'investor';
  goals: ('fresh-eating' | 'preserving' | 'reducing-grocery-bills' | 'family-learning' | 'organic-homestead' | 'medicinal-apothecary')[];
  favoriteCrops: string[];
  unitSystem: 'us' | 'metric';
}

export interface GridCell {
  x: number;
  y: number;
  cropId: string | null;
  varietyName?: string;
  plantedDate?: string;
  count?: number; // e.g. for SFG
}

export interface BedSeasonRecord {
  season: string; // e.g. "Spring 2025", "Fall 2025"
  year: number;
  crops: { cropId: string; cropName: string; family: PlantFamily }[];
}

export interface GardenSpace {
  id: string;
  name: string;
  type: GrowingMethod;
  widthFt: number;
  lengthFt: number;
  sunlight: SunlightLevel;
  soilType: SoilType;
  waterAccess: WaterAccess;
  gridCols: number; // width in feet (or square feet)
  gridRows: number; // length in feet
  cells: GridCell[];
  notes?: string;
  seasonHistory?: BedSeasonRecord[];
}

export type PlantFamily =
  | 'Solanaceae' // Nightshades (tomato, pepper, eggplant, potato)
  | 'Brassicaceae' // Brassicas (broccoli, cabbage, kale, radish)
  | 'Cucurbitaceae' // Cucurbits (squash, cucumber, melon, pumpkin)
  | 'Fabaceae' // Legumes (beans, peas)
  | 'Alliaceae' // Alliums (onion, garlic, leek)
  | 'Apiaceae' // Umbellifers (carrot, parsnip, celery, dill, cilantro)
  | 'Asteraceae' // Composites (lettuce, sunflower, marigold)
  | 'Amaranthaceae' // Beets, chard, spinach
  | 'Lamiaceae' // Mints, basil, rosemary, thyme
  | 'Rosaceae' // Strawberry, raspberry
  | 'Other';

export interface CropVariety {
  name: string;
  daysToMaturity: number;
  notes: string;
  yieldRating: 'moderate' | 'high' | 'prolific';
}

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  category: 'vegetable' | 'herb' | 'medicinal-herb' | 'fruit' | 'flower';
  family: PlantFamily;
  varieties: CropVariety[];
  plantingDepthInches: string;
  spacingInches: number;
  rowSpacingInches: number;
  sfgPerSquare: number; // Square foot density: 1, 4, 9, 16, or 0.5 (takes 2 squares)
  sunlight: SunlightLevel;
  waterNeeds: 'low' | 'moderate' | 'high';
  soilPhMin: number;
  soilPhMax: number;
  soilPreferences: string;
  daysToMaturityRange: [number, number];
  difficulty: 'Beginner Friendly' | 'Moderate' | 'Advanced';
  containerSuitable: boolean;
  containerMinGallons?: number;
  realisticYield: string;
  retailGroceryValuePerLb: number; // USD per pound estimated
  childPetHazard: {
    hasHazard: boolean;
    severity: 'safe' | 'caution' | 'toxic';
    details: string;
  };
  medicinalUses?: string;
  medicinalPreparation?: string;
  plantingTiming: {
    indoorStartWeeksBeforeLastFrost?: number | [number, number];
    transplantWeeksAfterLastFrost?: number | [number, number];
    directSowWeeksBeforeLastFrost?: number | [number, number];
    directSowWeeksAfterLastFrost?: number | [number, number];
    fallPlantingWeeksBeforeFirstFrost?: number | [number, number];
    overwinteringSafe: boolean;
  };
  companions: string[];
  antagonists: string[];
  companionNotes: string;
  harvestGuidance: string;
  curingGuidance?: string;
  /**
   * water-bath-canning: tested high-acid process (fruit; tomatoes with added acid)
   * pickling: safe canned ONLY as a tested pickle/relish/salsa recipe (USDA Guide 6)
   * pressure-canning: a tested USDA pressure process exists for this crop
   */
  preservationMethods: ('freezing' | 'dehydration' | 'water-bath-canning' | 'pickling' | 'pressure-canning' | 'fermentation' | 'cold-storage')[];
  pestVulnerabilities: string[];
  pollinationType: 'self' | 'insect' | 'wind';
  iconEmoji: string;
  hydroponicSuitability: 'excellent' | 'moderate' | 'difficult';
  dliRecommendedMol: string; // Daily Light Integral in mol/m²/day
}

export interface PantryItem {
  id: string;
  cropName: string;
  preservationType: 'fresh' | 'frozen' | 'water-bath-canned' | 'pressure-canned' | 'dehydrated' | 'fermented' | 'cured-storage';
  quantity: number;
  unit: string;
  datePrepared: string;
  bestByDate: string;
  storageLocation: 'Pantry Shelf' | 'Freezer' | 'Root Cellar' | 'Crisper' | 'Cool Dark Closet';
  testedSourceReference?: string;
  notes?: string;
}

export interface GardenTask {
  id: string;
  title: string;
  type: 'seed-start' | 'transplant' | 'direct-sow' | 'maintenance' | 'harvest' | 'preserve' | 'pest-check';
  cropId?: string;
  cropName?: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  category: 'note' | 'planting' | 'harvest' | 'pest' | 'soil-test' | 'compost';
  content: string;
  cropId?: string;
  cropName?: string;
  yieldLbs?: number;
  cost?: number;
  tags?: string[];
  photoId?: string;
}

export interface SeedPacket {
  id: string;
  cropId: string;
  varietyName: string;
  brand?: string;
  yearBought: number;
  quantityStatus: 'full' | 'half' | 'few-left' | 'empty';
  germinationRatePct?: number;
  notes?: string;
}

export interface SoilTestRecord {
  id: string;
  date: string;
  locationName: string;
  ph: number;
  nitrogen: 'deficient' | 'low' | 'optimal' | 'excessive';
  phosphorus: 'deficient' | 'low' | 'optimal' | 'excessive';
  potassium: 'deficient' | 'low' | 'optimal' | 'excessive';
  organicMatterPct?: number;
  notes: string;
  recommendedAction?: string;
}

export interface HydroWaterRecord {
  id: string;
  date: string;
  systemType: 'dwc' | 'nft' | 'kratky' | 'drip' | 'aquaponics';
  ph: number;
  ecPpm: number;
  waterTempF: number;
  ammoniaPpm?: number;
  nitritePpm?: number;
  nitratePpm?: number;
  notes: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'seeds' | 'soil-amendments' | 'equipment' | 'water-utility' | 'pest-control' | 'containers';
  itemDescription: string;
  cost: number;
}
