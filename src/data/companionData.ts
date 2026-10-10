export interface CompanionRelation {
  cropA: string;
  cropB: string;
  relationship: 'beneficial' | 'antagonistic';
  mechanism: 'pollinator-attraction' | 'shade-niche' | 'nitrogen-fixation' | 'physical-trellis' | 'trap-crop' | 'allelopathy' | 'disease-vector' | 'nutrient-competition';
  scientificEvidence: 'High (Peer-reviewed field studies)' | 'Moderate (Extension recommendations)' | 'Traditional / Folklore (Limited empirical proof)';
  notes: string;
}

export const COMPANION_PAIRS: CompanionRelation[] = [
  {
    cropA: 'tomato',
    cropB: 'basil',
    relationship: 'beneficial',
    mechanism: 'pollinator-attraction',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Aromatic foliage helps confuse airborne pests like thrips and whiteflies; blooming basil feeds pollinators that buzz-pollinate tomatoes.'
  },
  {
    cropA: 'tomato',
    cropB: 'marigold',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'French marigolds (Tagetes patula) release alpha-terthienyl from roots, which significantly suppresses Meloidogyne root-knot nematodes over the season.'
  },
  {
    cropA: 'tomato',
    cropB: 'potatoes',
    relationship: 'antagonistic',
    mechanism: 'disease-vector',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Both share Phytophthora infestans (Late blight) and Colorado potato beetles. Proximity enables rapid disease epidemics between vines.'
  },
  {
    cropA: 'bush-beans',
    cropB: 'corn',
    relationship: 'beneficial',
    mechanism: 'physical-trellis',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Indigenous Milpa Three Sisters system: Sturdy corn stalks support beans, beans fix atmospheric nitrogen, and ground-level squash shades weeds and conserves moisture.'
  },
  {
    cropA: 'bush-beans',
    cropB: 'garlic',
    relationship: 'antagonistic',
    mechanism: 'allelopathy',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Sulfur compounds in allium root exudates inhibit the growth of symbiotic Rhizobium nitrogen-fixing bacteria nodules on legume roots.'
  },
  {
    cropA: 'kale',
    cropB: 'sweet-alyssum',
    relationship: 'beneficial',
    mechanism: 'pollinator-attraction',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'University trials show alyssum borders provide shallow nectar cups for adult hoverflies (Syrphidae), whose predatory larvae devour up to 80% of cabbage aphids.'
  },
  {
    cropA: 'broccoli',
    cropB: 'dill',
    relationship: 'beneficial',
    mechanism: 'pollinator-attraction',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Umbellifer flowers attract braconid wasps (Cotesia glomerata), which parasitize imported cabbageworm and looper caterpillars.'
  },
  {
    cropA: 'carrots',
    cropB: 'rosemary',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'The strong aromatic camphor oils of rosemary mask the scent of carrot roots from the egg-laying carrot rust fly (Psila rosae).'
  },
  {
    cropA: 'cucumber',
    cropB: 'radish',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Fast-sprouting radishes attract flea beetles away from tender young cucumber seedlings and break crusted soil.'
  },
  {
    cropA: 'lettuce',
    cropB: 'sweet-pepper',
    relationship: 'beneficial',
    mechanism: 'shade-niche',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Pepper plants grow upright and provide dappled shade during hot midday hours, preventing lettuce from bolting and turning bitter prematurely.'
  },
  {
    cropA: 'strawberry',
    cropB: 'borage',
    relationship: 'beneficial',
    mechanism: 'pollinator-attraction',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Borage produces copious nectar with high sugar concentration (over 40%), drawing bumblebees that increase strawberry cross-pollination and fruit weight.'
  },
  {
    cropA: 'cabbage',
    cropB: 'thyme',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Thymol terpenes strongly mask brassica scent, reducing cabbage looper egg-laying by up to 65% in university field trials.'
  },
  {
    cropA: 'cabbage',
    cropB: 'chamomile',
    relationship: 'beneficial',
    mechanism: 'pollinator-attraction',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Chamomile flowers attract predatory syrphid flies while sulfur compounds promote brassica vigor.'
  },
  {
    cropA: 'asparagus',
    cropB: 'tomato',
    relationship: 'beneficial',
    mechanism: 'allelopathy',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Tomatoes produce solanine which deters asparagus beetles, while asparagus roots release chemical exudates that suppress root-knot nematodes.'
  },
  {
    cropA: 'potato',
    cropB: 'sweet-corn',
    relationship: 'antagonistic',
    mechanism: 'nutrient-competition',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Both are heavy potassium and nitrogen feeders with shallow fibrous roots that compete severely when grown in close proximity.'
  },
  {
    cropA: 'peppermint',
    cropB: 'cabbage',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Strong menthol volatile oils disorient cabbage butterflies and flea beetles; grow mint in an adjacent pot to avoid root takeover.'
  },
  {
    cropA: 'pole-beans',
    cropB: 'savory',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Volatile thymol and carvacrol oils from summer savory deter Mexican bean beetles, reducing leaf defoliation on climbing bean vines.'
  },
  {
    cropA: 'cauliflower',
    cropB: 'celery',
    relationship: 'beneficial',
    mechanism: 'trap-crop',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Celery foliage emits potent phthalides that mask the glucosinolates of cauliflower, confusing egg-laying cabbage white butterflies.'
  },
  {
    cropA: 'tomatillo',
    cropB: 'hot-pepper',
    relationship: 'beneficial',
    mechanism: 'pollinator-attraction',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Sharing flowering periods attracts common bumblebees and solitary bees essential for pollinating both crops in Mesoamerican polyculture beds.'
  },
  {
    cropA: 'horseradish',
    cropB: 'potatoes',
    relationship: 'beneficial',
    mechanism: 'allelopathy',
    scientificEvidence: 'High (Peer-reviewed field studies)',
    notes: 'Pungent allyl isothiocyanate vapors from horseradish roots provide systemic insect deterrent activity against Colorado potato beetles.'
  },
  {
    cropA: 'chives',
    cropB: 'strawberry',
    relationship: 'beneficial',
    mechanism: 'disease-vector',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Sulfur compounds exhaled by chive root systems inhibit fungal spores responsible for gray mold (Botrytis cinerea) on ripe berries.'
  },
  {
    cropA: 'stinging-nettle',
    cropB: 'rosemary',
    relationship: 'beneficial',
    mechanism: 'shade-niche',
    scientificEvidence: 'Moderate (Extension recommendations)',
    notes: 'Proximity to stinging nettle has been documented in biodynamic trials to increase the aromatic terpene and essential oil concentration of neighboring medicinal herbs.'
  }
];

export interface EcologicalInsectGuide {
  name: string;
  type: 'beneficial-predator' | 'pollinator' | 'parasitoid';
  targetPests: string[];
  preferredFlowers: string[];
  habitatTips: string;
}

export const ECOLOGICAL_INSECTS: EcologicalInsectGuide[] = [
  {
    name: 'Syrphid Fly (Hoverfly)',
    type: 'beneficial-predator',
    targetPests: ['Aphids', 'Thrips', 'Small caterpillars'],
    preferredFlowers: ['Sweet Alyssum', 'Dill', 'Fennel', 'Coriander / Cilantro'],
    habitatTips: 'Adults eat nectar; larvae consume up to 400 aphids each before pupation. Plant continuous succession of tiny flat flowers.'
  },
  {
    name: 'Green Lacewing',
    type: 'beneficial-predator',
    targetPests: ['Aphids', 'Spider mites', 'Whiteflies', 'Mealybugs'],
    preferredFlowers: ['Cosmos', 'Dill', 'Sweet Alyssum', 'Yarrow'],
    habitatTips: 'Called "aphid lions" in their larval stage with sickle-shaped jaws. Avoid broad-spectrum sprays that decimate egg stalks.'
  },
  {
    name: 'Parasitic Micro-Wasps (Braconidae)',
    type: 'parasitoid',
    targetPests: ['Tomato hornworm', 'Cabbage looper', 'Cutworms'],
    preferredFlowers: ['Carrot blossoms', 'Dill', 'Sweet Alyssum', 'Parsley'],
    habitatTips: 'If you find a tomato hornworm covered in white silken cocoons, DO NOT kill it! Those are pupating beneficial wasps that will hatch and patrol your garden.'
  },
  {
    name: 'Bumblebees (Bombus spp.)',
    type: 'pollinator',
    targetPests: ['None (pure pollinator)'],
    preferredFlowers: ['Borage', 'Sunflowers', 'Clover', 'Zinnias', 'Squash blossoms'],
    habitatTips: 'Masters of "sonication" or buzz-pollination: they vibrate their flight muscles at ~400Hz to shake pollen loose from nightshade family anthers (tomatoes, peppers, eggplants).'
  }
];
