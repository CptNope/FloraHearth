export interface CanningGuide {
  crop: string;
  foodType: 'high-acid' | 'low-acid';
  approvedMethod: 'Water-Bath or Atmospheric Steam' | 'Pressure Canner ONLY' | 'Both Approved Depending on Acidification';
  nchfpReference: string;
  jarSizes: string;
  baseProcessingTimeMin: number;
  basePressurePsi?: number; // for pressure canner at sea level
  acidificationRequired?: string;
  safetyWarnings: string;
  steps: string[];
}

export const SAFE_CANNING_GUIDES: CanningGuide[] = [
  {
    crop: 'Tomato (Crushed or Whole)',
    foodType: 'high-acid', // with mandatory acidification
    approvedMethod: 'Water-Bath or Atmospheric Steam',
    nchfpReference: 'USDA Complete Guide to Home Canning, Guide 3 (Rev. 2015)',
    jarSizes: 'Pints: 40 min | Quarts: 45 min',
    baseProcessingTimeMin: 40,
    acidificationRequired: 'MANDATORY: Add 2 tablespoons bottled lemon juice OR 1/2 teaspoon citric acid per quart jar (1 tbsp lemon juice per pint) directly into jars before filling. Natural tomato pH can exceed 4.6.',
    safetyWarnings: 'Modern tomato cultivars vary in natural acidity. Failure to acidify risks deadly Clostridium botulinum toxin formation.',
    steps: [
      'Wash firm ripe tomatoes; peel by dipping in boiling water 60 seconds then ice bath.',
      'Add required bottled lemon juice or citric acid to hot, clean canning jars.',
      'Pack hot crushed tomatoes leaving 1/2-inch headspace.',
      'Remove trapped air bubbles with a plastic wand; wipe rim with damp clean towel.',
      'Apply 2-piece lid; tighten band fingertip-tight.',
      'Process in rolling boiling water bath with 1-2 inches water covering tops for required elevation-adjusted duration.'
    ]
  },
  {
    crop: 'Snap Green Beans',
    foodType: 'low-acid',
    approvedMethod: 'Pressure Canner ONLY',
    nchfpReference: 'USDA Complete Guide to Home Canning, Guide 4 (Rev. 2015)',
    jarSizes: 'Pints: 20 min | Quarts: 25 min',
    baseProcessingTimeMin: 20,
    basePressurePsi: 11, // dial gauge sea level
    safetyWarnings: 'CRITICAL SAFETY: NEVER water-bath plain green beans. Low-acid food (pH ~5.5) allows Clostridium botulinum spores to germinate into lethal neurotoxin. Pressure canning reaching 240°F is required.',
    steps: [
      'Wash fresh tender pods; snap into 1-inch pieces.',
      'Hot pack (preferred for color): boil beans 5 minutes in fresh water.',
      'Fill hot jars leaving 1-inch headspace; cover with boiling cooking liquid.',
      'Debubble, wipe rims clean, tighten 2-piece lids fingertip-tight.',
      'Vent pressure canner with steam flowing freely for a full 10 minutes before placing weighted/dial gauge.',
      'Process at elevation-corrected PSI for the exact timed duration.'
    ]
  },
  {
    crop: 'Carrots (Sliced or Diced)',
    foodType: 'low-acid',
    approvedMethod: 'Pressure Canner ONLY',
    nchfpReference: 'USDA Complete Guide to Home Canning, Guide 4 (Rev. 2015)',
    jarSizes: 'Pints: 25 min | Quarts: 30 min',
    baseProcessingTimeMin: 25,
    basePressurePsi: 11,
    safetyWarnings: 'Low-acid food (pH 5.8-6.0). Must use a tested pressure canner. Never puree or make carrot baby food for home canning.',
    steps: [
      'Wash and thoroughly peel carrots (peeling reduces microbial load).',
      'Slice into 1/2-inch coins; boil in water 5 minutes.',
      'Pack into clean jars leaving 1-inch headspace; fill with boiling water.',
      'Vent canner for 10 minutes, then bring to target pressure and process.'
    ]
  },
  {
    crop: 'Pickled Cucumbers (Quick Brine Dill/Bread & Butter)',
    foodType: 'high-acid',
    approvedMethod: 'Water-Bath or Atmospheric Steam',
    nchfpReference: 'USDA Complete Guide to Home Canning, Guide 6 (Pickles)',
    jarSizes: 'Pints: 10 min | Quarts: 15 min',
    baseProcessingTimeMin: 10,
    acidificationRequired: 'Brine must contain vinegar with tested 5% acidity in at least a 1:1 ratio with water (e.g. equal parts 5% vinegar and water). Never dilute vinegar below recipe specifications.',
    safetyWarnings: 'Use only commercial 5% vinegar (white or cider). Never use homemade vinegar of unknown acidity for canning.',
    steps: [
      'Slice 1/16-inch off blossom ends (blossom end contains softening enzymes).',
      'Pack into jars with garlic, dill seed, and hot seasoned 1:1 vinegar brine.',
      'Leave 1/2-inch headspace; remove bubbles; wipe rim.',
      'Process in boiling water bath according to altitude table.'
    ]
  },
  {
    crop: 'Tomatillo Green Salsa (Salsa Verde)',
    foodType: 'high-acid',
    approvedMethod: 'Water-Bath or Atmospheric Steam',
    nchfpReference: 'USDA Complete Guide to Home Canning / PNW 395 Salsa Formulation',
    jarSizes: 'Pints: 15 min | Half-Pints: 15 min',
    baseProcessingTimeMin: 15,
    acidificationRequired: 'MANDATORY: Add 1 tablespoon bottled lemon or lime juice per pint (or 2 tbsp 5% vinegar) before ladle filling.',
    safetyWarnings: 'Do NOT increase the ratio of peppers, onions, or cilantro beyond tested USDA extension proportions. Doing so lowers overall acidity into the danger zone.',
    steps: [
      'Husk and wash tomatillos; coarsely chop with measured hot peppers, onions, garlic, and cumin.',
      'Simmer ingredients in large pot for 10-15 minutes until tender.',
      'Add required bottled lime juice or vinegar to hot jars.',
      'Fill jars with boiling salsa leaving 1/2-inch headspace; debubble and wipe rims clean.',
      'Process in boiling water bath for 15 minutes (plus altitude correction).'
    ]
  }
];

export function getAltitudeAdjustedCanningTime(baseTimeMin: number, elevationFt: number): number {
  if (elevationFt <= 1000) return baseTimeMin;
  if (elevationFt <= 3000) return baseTimeMin + 5;
  if (elevationFt <= 6000) return baseTimeMin + 10;
  return baseTimeMin + 15;
}

export function getAltitudeAdjustedPressurePsi(dialBasePsi: number, elevationFt: number): number {
  if (elevationFt <= 2000) return dialBasePsi;
  if (elevationFt <= 4000) return dialBasePsi + 1;
  if (elevationFt <= 6000) return dialBasePsi + 2;
  if (elevationFt <= 8000) return dialBasePsi + 3;
  return dialBasePsi + 4;
}

export interface FreezingBlanchGuide {
  crop: string;
  blanchMethod: 'Water Boil' | 'Steam' | 'No Blanch Required';
  minutes: number;
  coolDownMinutes: number;
  notes: string;
}

export const FREEZING_BLANCH_GUIDES: FreezingBlanchGuide[] = [
  { crop: 'Broccoli florets', blanchMethod: 'Water Boil', minutes: 3, coolDownMinutes: 3, notes: 'Stops enzymatic browning and sulfur odor development' },
  { crop: 'Bush green beans', blanchMethod: 'Water Boil', minutes: 3, coolDownMinutes: 3, notes: 'Preserves crisp green color and texture' },
  { crop: 'Spinach & greens', blanchMethod: 'Water Boil', minutes: 2, coolDownMinutes: 2, notes: 'Squeeze out excess liquid thoroughly after ice bath' },
  { crop: 'Sweet peppers', blanchMethod: 'No Blanch Required', minutes: 0, coolDownMinutes: 0, notes: 'Slice raw and freeze on flat sheet tray before bagging' },
  { crop: 'Berries (Strawberries/Blueberries)', blanchMethod: 'No Blanch Required', minutes: 0, coolDownMinutes: 0, notes: 'Freeze individually in single layer on parchment sheet before transferring to airtight freezer bag' }
];

export interface FermentationGuide {
  item: string;
  saltConcentration: string;
  optimumTempF: string;
  durationDays: string;
  criticalRules: string[];
}

export const FERMENTATION_GUIDES: FermentationGuide[] = [
  {
    item: 'Sauerkraut & Fermented Slaws',
    saltConcentration: '2.0% to 2.5% kosher/canning salt by total cabbage weight (approx 1 tbsp salt per 1.5 lbs shredded cabbage)',
    optimumTempF: '65°F to 72°F',
    durationDays: '14 to 28 days',
    criticalRules: [
      'Submerge all vegetables completely under brine using a glass fermentation weight to prevent aerobic mold.',
      'Use airlock lid or burp daily during vigorous initial fermentation (first 5 days).',
      'Skim any white yeast (Kahm yeast) if it appears; discard if fuzzy colored mold develops.'
    ]
  },
  {
    item: 'Sour Pickles (Lacto-fermented Cucumbers)',
    saltConcentration: '3.5% to 5.0% brine (approx 3 tablespoons pickling salt per 1 quart of unchlorinated water)',
    optimumTempF: '68°F to 74°F',
    durationDays: '7 to 14 days',
    criticalRules: [
      'Add a tannin source (grape leaf, oak leaf, or black tea bag) to prevent blossom enzymes from making pickles mushy.',
      'Use filtered or distilled non-chlorinated water so municipal chlorine does not kill lactic acid bacteria.',
      'Refrigerate once desired sourness is reached to slow fermentation.'
    ]
  },
  {
    item: 'Fermented Daikon Radish Cubes (Kkakdugi)',
    saltConcentration: '2.5% kosher salt by weight (approx 1.5 tbsp coarse salt per 2 lbs cubed radish)',
    optimumTempF: '65°F to 70°F',
    durationDays: '3 to 7 days',
    criticalRules: [
      'Cube daikon into 3/4-inch squares and toss with salt, garlic, ginger, scallions, and Korean chili flakes (gochugaru).',
      'Pack tightly into a glass jar until naturally extracted brine completely covers the radish cubes.',
      'Ferment at room temperature 3-4 days until tangy and bubbling, then move to refrigerator where it stays crunchy for months.'
    ]
  }
];

export interface CuringGuide {
  crop: string;
  temperatureF: string;
  humidityPct: string;
  durationDays: number;
  signsOfDone: string;
  longTermStorageConditions: string;
}

export const CURING_GUIDES: CuringGuide[] = [
  {
    crop: 'Garlic',
    temperatureF: '75°F - 80°F',
    humidityPct: '60% - 70% with active cross-breeze',
    durationDays: 21,
    signsOfDone: 'Roots are brittle; all outer bulb wrapper leaves are paper-dry; stem center is firm with zero moisture when snipped.',
    longTermStorageConditions: 'Cool, dark pantry at 55°F - 60°F with 50% humidity. NEVER refrigerate raw whole bulbs (cold triggers sprouting).'
  },
  {
    crop: 'Storage Onions',
    temperatureF: '75°F - 80°F',
    humidityPct: '50% - 60%',
    durationDays: 21,
    signsOfDone: 'Necks are tightly closed and completely dry; outer layers crackle like parchment.',
    longTermStorageConditions: 'Mesh hanging bags at 35°F - 40°F in dry root cellar or unheated basement.'
  },
  {
    crop: 'Winter Squash & Pumpkins',
    temperatureF: '80°F - 85°F',
    humidityPct: '80%',
    durationDays: 10,
    signsOfDone: 'Rind resists fingernail puncture; small harvest abrasions have healed and corked over.',
    longTermStorageConditions: 'Cool dry shelf at 50°F - 55°F with 60% humidity. Lasts 3-6 months.'
  }
];
