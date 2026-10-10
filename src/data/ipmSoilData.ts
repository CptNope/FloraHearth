export interface PestDiseaseGuide {
  id: string;
  name: string;
  type: 'pest' | 'disease';
  cropsAffected: string[];
  identificationClues: string;
  actionThreshold: string;
  preventionCulture: string;
  physicalBarriers: string;
  biologicalOrganicRemedy: string;
  pollinatorWarning: string;
}

export const IPM_GUIDES: PestDiseaseGuide[] = [
  {
    id: 'hornworm',
    name: 'Tomato Hornworm (Manduca quinquemaculata)',
    type: 'pest',
    cropsAffected: ['Tomato', 'Pepper', 'Eggplant'],
    identificationClues: 'Massive green caterpillar with white diagonal stripes, a red or black rear horn, and large dark barrel-shaped droppings (frass) on upper foliage.',
    actionThreshold: '1 hornworm per plant warrants immediate hand picking.',
    preventionCulture: 'Till or broadfork soil in early spring to expose overwintering pupae to birds; plant dill and borage nearby.',
    physicalBarriers: 'Hand-picking with a UV blacklight flashlight at dusk (they fluoresce brilliant neon green!).',
    biologicalOrganicRemedy: 'Bacillus thuringiensis (Bt kurstaki) for small caterpillars. If covered in white rice-like braconid wasp cocoons, LEAVE IT ALONE to hatch beneficial wasps.',
    pollinatorWarning: 'Bt only affects caterpillars that ingest treated leaves, but avoid spraying open blossoms.'
  },
  {
    id: 'cabbage-looper',
    name: 'Cabbage Looper & Imported Cabbageworm',
    type: 'pest',
    cropsAffected: ['Broccoli', 'Kale', 'Cabbage', 'Radish'],
    identificationClues: 'Small velvety green caterpillars inching along leaf undersides; irregular holes chewed through brassica leaves; small white butterflies fluttering over beds.',
    actionThreshold: 'More than 2-3 caterpillars per head or noticeable skeletonizing of leaves.',
    preventionCulture: 'Intercrop with sweet alyssum and dill to attract parasitic wasps and predatory hoverflies.',
    physicalBarriers: 'Erect floating insect netting (0.8mm mesh) immediately over plants at transplanting to exclude adult egg-laying butterflies completely.',
    biologicalOrganicRemedy: 'Targeted spray of Bacillus thuringiensis (Bt) or Spinosad in evening hours.',
    pollinatorWarning: 'Never spray Spinosad while bees are foraging; apply strictly at dusk so residue dries overnight.'
  },
  {
    id: 'squash-bug',
    name: 'Squash Bug (Anasa tristis)',
    type: 'pest',
    cropsAffected: ['Zucchini', 'Pumpkin', 'Winter Squash', 'Cucumber'],
    identificationClues: 'Clusters of copper-bronze oval eggs laid in neat V-patterns under leaf veins; gray-brown shield-shaped adults giving off distinct sulfur odor when crushed.',
    actionThreshold: 'Eggs spotted or multiple nymphs visible on crown stems.',
    preventionCulture: 'Keep bed clean of leaf litter where adults overwinter; rotate cucurbit beds annually.',
    physicalBarriers: 'Lay wooden boards near plant base overnight; flip boards in early morning to collect and drop sheltering adults into soapy water.',
    biologicalOrganicRemedy: 'Scrape egg clusters off leaves with duct tape or a knife into soapy water; spray young nymphs with insecticidal soap (ineffective on tough adults).',
    pollinatorWarning: 'Squash blossoms are heavily visited by bumblebees; only treat base stems and leaf undersides.'
  },
  {
    id: 'early-blight',
    name: 'Early Blight (Alternaria solani)',
    type: 'disease',
    cropsAffected: ['Tomato', 'Potato'],
    identificationClues: 'Concentric "target board" dark brown rings on oldest lower leaves, surrounded by yellow chlorotic halos, gradually marching up the plant.',
    actionThreshold: 'Any lower leaf infection warrants prompt removal before rain splashes spores higher.',
    preventionCulture: 'Prune lowest 12-18 inches of foliage once plant is established; mulch bed with straw to prevent soil-splash onto leaves; water strictly at soil level.',
    physicalBarriers: 'Thick 3-inch straw or leaf mulch barrier between soil and lower leaves.',
    biologicalOrganicRemedy: 'Prune infected lower foliage with clean shears sanitized in alcohol; apply bio-fungicide (Bacillus subtilis or copper octanoate) as preventive barrier.',
    pollinatorWarning: 'Copper fungicides can be toxic to aquatic life; never allow runoff into garden ponds or storm drains.'
  },
  {
    id: 'blossom-end-rot',
    name: 'Blossom End Rot (Physiological Disorder)',
    type: 'disease',
    cropsAffected: ['Tomato', 'Sweet Bell Pepper', 'Zucchini'],
    identificationClues: 'Water-soaked sunken black leathery patch directly on the bottom (blossom end) of developing green fruit. Not a pathogen or fungus!',
    actionThreshold: 'Immediately audit watering consistency and soil calcium uptake.',
    preventionCulture: 'Maintain steady, consistent soil moisture through deep watering and mulching. Irregular wet/dry cycles restrict calcium transpiration to fast-growing fruit.',
    physicalBarriers: 'Soaker hose / drip irrigation and moisture-conserving organic mulch.',
    biologicalOrganicRemedy: 'Check soil pH (optimum 6.2-6.8); test for soil calcium before dumping random eggshells (eggshells take months to break down and cannot cure an active crisis). Ensure balanced watering.',
    pollinatorWarning: 'Completely non-infectious; no sprays required.'
  }
];

export interface CompostingGuide {
  method: 'Hot Aerobic' | 'Cold Passive' | 'Vermicomposting' | 'Bokashi Fermentation' | 'Leaf Mold';
  idealCNRatio: string;
  greenInputs: string[];
  brownInputs: string[];
  temperatureRange: string;
  turnSchedule: string;
  cureTime: string;
  safetyRules: string[];
}

export const COMPOST_METHODS: CompostingGuide[] = [
  {
    method: 'Hot Aerobic',
    idealCNRatio: '30:1 (roughly 2-3 parts brown carbon to 1 part green nitrogen by volume)',
    greenInputs: ['Fresh kitchen scraps', 'Coffee grounds (C:N 20:1)', 'Fresh lawn clippings', 'Young weeds without seed heads'],
    brownInputs: ['Dry fall leaves', 'Shredded cardboard & non-glossy paper', 'Clean straw', 'Wood shavings'],
    temperatureRange: '135°F - 155°F (57°C - 68°C)',
    turnSchedule: 'Turn every 3-5 days when temperature peaks and begins dropping below 120°F.',
    cureTime: '6 to 12 weeks',
    safetyRules: [
      'Maintain temperatures above 131°F for at least 15 days to destroy human pathogens (E. coli, Salmonella) and weed seeds.',
      'USDA Good Agricultural Practices (GAP): If using raw animal manure, allow 120 days between application and harvest for edible crops touching soil, and 90 days for crops not touching soil.',
      'Never compost dog or cat feces in vegetable garden compost.'
    ]
  },
  {
    method: 'Bokashi Fermentation',
    idealCNRatio: 'Anaerobic lactobacillus inoculation (bran fermented)',
    greenInputs: ['Vegetable scraps', 'Fruit peels', 'Cooked grains', 'Small dairy/meat scraps (allowed in Bokashi!)'],
    brownInputs: ['Inoculated Bokashi bran with effective microorganisms (EM-1)'],
    temperatureRange: 'Ambient indoor 65°F - 75°F',
    turnSchedule: 'Do not turn! Keep strictly airtight in sealed bokashi bucket for 14 days.',
    cureTime: '14 days ferment + 14 days burying in garden trench',
    safetyRules: [
      'CRITICAL: Bokashi is an acidic pre-ferment (pH ~4.0), not finished compost. It CANNOT be placed directly against delicate plant roots.',
      'Bury fermented bokashi waste in a garden soil trench at least 8 inches deep and wait 2-3 weeks for soil microbes to neutralize the acidity before planting.'
    ]
  },
  {
    method: 'Vermicomposting',
    idealCNRatio: 'Eisenia fetida (Red Wiggler earthworms)',
    greenInputs: ['Melon rinds', 'Squash trimmings', 'Lettuce scraps', 'Used coffee grounds'],
    brownInputs: ['Damp shredded unbleached cardboard', 'Shredded brown leaves'],
    temperatureRange: '55°F - 77°F (Keep indoors or shaded garage)',
    turnSchedule: 'Gentle pocket feeding once per week.',
    cureTime: '3 to 6 months for premium worm castings',
    safetyRules: [
      'Avoid large quantities of citrus peels, raw onions, hot peppers, or oily salty foods which irritate worm skin.',
      'Keep moisture like a wrung-out sponge.'
    ]
  }
];

export interface HydroponicsSpec {
  systemType: 'Deep Water Culture (DWC)' | 'Nutrient Film Technique (NFT)' | 'Kratky Passive' | 'Aquaponics Media Bed';
  bestCrops: string[];
  targetPh: string;
  targetEcMs: string;
  waterTempF: string;
  monitoringRoutine: string;
  prosAndCons: string;
}

export const HYDROPONIC_SPECS: HydroponicsSpec[] = [
  {
    systemType: 'Deep Water Culture (DWC)',
    bestCrops: ['Lettuce', 'Spinach', 'Basil', 'Kale', 'Bok Choy'],
    targetPh: '5.5 - 6.5 (sweet spot 5.8 - 6.2)',
    targetEcMs: '1.2 - 1.8 mS/cm (600 - 900 PPM 500-scale)',
    waterTempF: '65°F - 68°F (CRITICAL: >72°F triggers Pythium root rot!)',
    monitoringRoutine: 'Check pH and EC daily; maintain vigorous air stone bubbling 24/7; flush reservoir every 14 days.',
    prosAndCons: 'Pros: Rapid leafy growth, simple to construct. Cons: Vulnerable to warm water root rot and power outages.'
  },
  {
    systemType: 'Kratky Passive',
    bestCrops: ['Loose-leaf Lettuce', 'Butterhead', 'Mint', 'Arugula'],
    targetPh: '5.8 - 6.2',
    targetEcMs: '1.0 - 1.4 mS/cm (500 - 700 PPM)',
    waterTempF: '62°F - 70°F',
    monitoringRoutine: 'Fill reservoir once at transplanting; air gap forms as plant drinks water, supplying oxygen to roots without pumps or electricity.',
    prosAndCons: 'Pros: Zero electricity, zero pumps, ultra-low cost. Cons: Leafy greens only; cannot support heavy fruiting tomatoes.'
  },
  {
    systemType: 'Aquaponics Media Bed',
    bestCrops: ['Basil', 'Strawberries', 'Peppers', 'Mint', 'Watercress'],
    targetPh: '6.8 - 7.0 (Compromise zone: fish prefer 7.0-8.0, plants prefer 6.0-6.5)',
    targetEcMs: 'Driven by biological nitrates (NO3- 40-100 ppm)',
    waterTempF: 'Dependent on fish species (Tilapia: 75-85°F, Goldfish: 65-72°F, Trout: 55-65°F)',
    monitoringRoutine: 'Test Ammonia (NH3/NH4+) and Nitrite (NO2-) daily during 4-6 week biological cycling; both MUST be 0 ppm. Track Nitrate (NO3-) for plant nutrition.',
    prosAndCons: 'Pros: Fully closed-loop organic ecosystem; yields fresh fish protein alongside produce. Cons: High startup learning curve; absolutely ZERO synthetic pesticides allowed near fish!'
  }
];
