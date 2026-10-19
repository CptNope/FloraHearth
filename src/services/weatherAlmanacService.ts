import { GardenLocation } from '../types/garden';
import {
  CurrentConditions,
  DailyForecastDay,
  HourlyForecastPoint,
  AgriculturalIndices,
  LunarPlantingInfo,
  BestAlmanacDay,
  WeatherLoreItem,
  WeatherAlmanacData,
  MoonPhaseName,
  ZodiacSignName,
  ZodiacElement,
  FertilityGrade,
} from '../types/weatherAlmanac';
import { localDateStr } from './dates';

// ==========================================
// 1. ASTROLOGICAL & LUNAR ALMANAC ENGINE
// ==========================================

const SYNODIC_MONTH = 29.53058867; // Days from New Moon to New Moon
// Reference New Moon: Jan 11, 2024 at 11:57 UTC
const REF_NEW_MOON_MS = 1704974220000;

const ZODIAC_SIGNS: {
  name: ZodiacSignName;
  element: ZodiacElement;
  fertility: FertilityGrade;
  advice: string;
}[] = [
  {
    name: 'Aries',
    element: 'Fire',
    fertility: 'Barren & Dry (Cultivate Only)',
    advice: 'Cultivate, destroy noxious weeds, turn compost. Avoid sowing tender seed.',
  },
  {
    name: 'Taurus',
    element: 'Earth',
    fertility: 'Productive & Semi-Fertile',
    advice: 'Favorable for root crops, potatoes, beets, carrots, and cold-hardy perennials.',
  },
  {
    name: 'Gemini',
    element: 'Air',
    fertility: 'Barren & Dry (Cultivate Only)',
    advice: 'Best for cultivation, weeding, checking trellis lines, and harvesting for storage.',
  },
  {
    name: 'Cancer',
    element: 'Water',
    fertility: 'Very Fertile & Fruitful',
    advice: 'Premier sign for all planting! Sow leafy greens, tomatoes, squash, and fruiting crops.',
  },
  {
    name: 'Leo',
    element: 'Fire',
    fertility: 'Barren & Dry (Cultivate Only)',
    advice: 'Most barren sign. Excellent for weeding, clearing brush, pruning dormant wood, and tilling.',
  },
  {
    name: 'Virgo',
    element: 'Earth',
    fertility: 'Productive & Semi-Fertile',
    advice: 'Good for flowering vines, medicinal herbs, and establishing ground covers.',
  },
  {
    name: 'Libra',
    element: 'Air',
    fertility: 'Productive & Semi-Fertile',
    advice: 'Semi-fruitful. Splendid for beautiful flowers, aromatic herbs, and vining legumes.',
  },
  {
    name: 'Scorpio',
    element: 'Water',
    fertility: 'Very Fertile & Fruitful',
    advice: 'Extremely fruitful and sturdy. Ideal for sowing seeds, transplanting, and building vigorous roots.',
  },
  {
    name: 'Sagittarius',
    element: 'Fire',
    fertility: 'Barren & Dry (Cultivate Only)',
    advice: 'Planting onion sets, garlic cloves, or shallow cultivation and harvesting grain.',
  },
  {
    name: 'Capricorn',
    element: 'Earth',
    fertility: 'Productive & Semi-Fertile',
    advice: 'Hardy and productive. Great for potatoes, parsnips, root cellaring crops, and woody grafts.',
  },
  {
    name: 'Aquarius',
    element: 'Air',
    fertility: 'Barren & Dry (Cultivate Only)',
    advice: 'Barren. Perfect day to weed, clean seed trays, sharpen garden tools, and turn soil.',
  },
  {
    name: 'Pisces',
    element: 'Water',
    fertility: 'Very Fertile & Fruitful',
    advice: 'Highly fruitful water sign. Magnificent for root development, salad greens, and berry starts.',
  },
];

/**
 * Calculate the exact Moon Phase & Almanac Lunar Gardening Data for any given date
 */
export function getLunarPlantingInfo(date: Date = new Date()): LunarPlantingInfo {
  const diffMs = date.getTime() - REF_NEW_MOON_MS;
  const daysSinceRef = diffMs / (1000 * 60 * 60 * 24);
  let moonAge = daysSinceRef % SYNODIC_MONTH;
  if (moonAge < 0) moonAge += SYNODIC_MONTH;

  // Illumination calculation (percentage 0 - 100%)
  const angle = (moonAge / SYNODIC_MONTH) * 2 * Math.PI;
  const illuminationFraction = (1 - Math.cos(angle)) / 2;
  const illuminationPct = Math.round(illuminationFraction * 100);

  // Phase naming according to Farmers' Almanac standards
  let phase: MoonPhaseName;
  let phaseCode: string;
  let phaseEmoji: string;
  let phaseQuarter: '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';

  if (moonAge < 1.84) {
    phase = 'New Moon';
    phaseCode = 'new_moon';
    phaseEmoji = '🌑';
    phaseQuarter = '1st Quarter';
  } else if (moonAge < 5.53) {
    phase = 'Waxing Crescent';
    phaseCode = 'waxing_crescent';
    phaseEmoji = '🌒';
    phaseQuarter = '1st Quarter';
  } else if (moonAge < 9.22) {
    phase = 'First Quarter';
    phaseCode = 'first_quarter';
    phaseEmoji = '🌓';
    phaseQuarter = '2nd Quarter';
  } else if (moonAge < 12.91) {
    phase = 'Waxing Gibbous';
    phaseCode = 'waxing_gibbous';
    phaseEmoji = '🌔';
    phaseQuarter = '2nd Quarter';
  } else if (moonAge < 16.61) {
    phase = 'Full Moon';
    phaseCode = 'full_moon';
    phaseEmoji = '🌕';
    phaseQuarter = '3rd Quarter';
  } else if (moonAge < 20.3) {
    phase = 'Waning Gibbous';
    phaseCode = 'waning_gibbous';
    phaseEmoji = '🌖';
    phaseQuarter = '3rd Quarter';
  } else if (moonAge < 23.99) {
    phase = 'Last Quarter';
    phaseCode = 'last_quarter';
    phaseEmoji = '🌗';
    phaseQuarter = '4th Quarter';
  } else if (moonAge < 27.68) {
    phase = 'Waning Crescent';
    phaseCode = 'waning_crescent';
    phaseEmoji = '🌘';
    phaseQuarter = '4th Quarter';
  } else {
    phase = 'New Moon';
    phaseCode = 'new_moon';
    phaseEmoji = '🌑';
    phaseQuarter = '1st Quarter';
  }

  // Next New Moon and Full Moon countdowns
  const nextNewMoonDays = Math.round(SYNODIC_MONTH - moonAge);
  const nextFullMoonDays = Math.round(
    moonAge < 14.76 ? 14.76 - moonAge : 14.76 + SYNODIC_MONTH - moonAge
  );

  // Zodiac Sign Calculation (~27.32166 days sidereal cycle)
  const SIDEREAL_MONTH = 27.321661;
  const REF_SIDEREAL_MS = 1704153600000; // Jan 2, 2024 Moon in Virgo
  const siderealDiffDays = (date.getTime() - REF_SIDEREAL_MS) / (1000 * 60 * 60 * 24);
  let siderealPos = (siderealDiffDays % SIDEREAL_MONTH) / SIDEREAL_MONTH;
  if (siderealPos < 0) siderealPos += 1;
  const signIndex = Math.floor(siderealPos * 12) % 12;
  const zodiac = ZODIAC_SIGNS[signIndex];

  // Old Farmer's Almanac Golden Rules:
  // Light of the Moon (Waxing): Above ground crops (leaves, seeds on outside, fruits, flowers)
  // Dark of the Moon (Waning): Below ground crops (roots, tubers, bulbs)
  // 4th Quarter: Resting, cultivating, weeding, harvesting for storage, destroying pests
  const isWaxing = moonAge <= 14.76;
  const isFourthQuarter = phaseQuarter === '4th Quarter';

  let lunarRuleSummary = '';
  let actionTitle = '';
  const recommendedCrops: string[] = [];
  const avoidCrops: string[] = [];
  let choreToday = '';

  if (isFourthQuarter || zodiac.fertility === 'Barren & Dry (Cultivate Only)') {
    lunarRuleSummary =
      '4th Quarter Moon or Barren Sign: Low sap pressure. Ideal resting time to weed, cultivate soil, compost, and harvest for long storage.';
    actionTitle = 'Cultivate, Weed & Prepare Soil';
    recommendedCrops.push('Turn compost pile', 'Pull stubborn weeds', 'Prune to retard suckers', 'Solarize garden beds');
    avoidCrops.push('Direct sowing tender crops', 'Transplanting sensitive seedlings');
    choreToday =
      'Sharpen garden shears, weed the walking paths, aerate compost bins, or harvest herbs for hang-drying.';
  } else if (isWaxing) {
    if (phaseQuarter === '1st Quarter') {
      lunarRuleSummary =
        '1st Quarter (Waxing): Rising sap & increasing moonlight. Best for above-ground annuals with leafy yield.';
      actionTitle = 'Sow Leafy Greens & Annual Herbs';
      recommendedCrops.push('Spinach', 'Lettuce & Greens', 'Kale & Chard', 'Broccoli & Cabbage', 'Cilantro & Parsley');
      avoidCrops.push('Root vegetables (Carrots, Beets, Potatoes)');
      choreToday = 'Direct-sow cold-hardy salad greens or start brassica seeds in nursery flats.';
    } else {
      lunarRuleSummary =
        '2nd Quarter (Waxing to Full): Strong gravitational pull and peak moonlight. Premier window for above-ground fruiting crops.';
      actionTitle = 'Plant Fruiting Crops, Beans & Melons';
      recommendedCrops.push('Tomatoes', 'Peppers', 'Bush & Pole Beans', 'Summer Squash', 'Cucumbers', 'Sweet Corn');
      avoidCrops.push('Deep root vegetables');
      choreToday = 'Transplant warm-season starts into beds or trellises, water deeply with compost tea.';
    }
  } else {
    // 3rd Quarter (Waning from Full)
    lunarRuleSummary =
      '3rd Quarter (Waning): Moonlight decreases while sap energy descends into root systems. Premier window for root crops and perennials.';
    actionTitle = 'Plant Root Crops, Bulbs & Perennials';
    recommendedCrops.push('Carrots & Parsnips', 'Beets & Radishes', 'Onions & Leeks', 'Garlic Cloves', 'Potatoes', 'Berry Bushes');
    avoidCrops.push('Leafy green starts (risk of premature bolting)');
    choreToday = 'Plant root crop seeds in deeply loosened, loamy soil; divide perennial herbs.';
  }

  return {
    phase,
    phaseCode,
    phaseEmoji,
    phaseQuarter,
    illuminationPct,
    moonAgeDays: Math.round(moonAge * 10) / 10,
    nextNewMoonDays,
    nextFullMoonDays,
    zodiacSign: zodiac.name,
    element: zodiac.element,
    fertility: zodiac.fertility,
    lunarRuleSummary,
    actionTitle,
    recommendedCrops,
    avoidCrops,
    almanacChoreToday: choreToday,
  };
}

/**
 * Generate 30-day Almanac Best Days Calendar
 */
export function get30DayAlmanacCalendar(startDate: Date = new Date()): BestAlmanacDay[] {
  const days: BestAlmanacDay[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < 30; i++) {
    const targetDate = new Date(current);
    targetDate.setDate(current.getDate() + i);

    const lunar = getLunarPlantingInfo(targetDate);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isoDate = localDateStr(targetDate);

    const bestFor: ('above-ground-crops' | 'root-crops' | 'pruning' | 'weeding' | 'harvest-storage' | 'compost-fertilize')[] = [];
    let rating: 'exceptional' | 'favorable' | 'neutral' = 'neutral';

    const isWater = lunar.element === 'Water';
    const isEarth = lunar.element === 'Earth';
    const isBarren = lunar.fertility === 'Barren & Dry (Cultivate Only)';

    if (lunar.phaseQuarter === '1st Quarter' || lunar.phaseQuarter === '2nd Quarter') {
      if (isWater) {
        bestFor.push('above-ground-crops', 'compost-fertilize');
        rating = 'exceptional';
      } else if (lunar.element === 'Air' || isEarth) {
        bestFor.push('above-ground-crops');
        rating = 'favorable';
      }
    } else if (lunar.phaseQuarter === '3rd Quarter') {
      if (isEarth || isWater) {
        bestFor.push('root-crops', 'harvest-storage');
        rating = isEarth ? 'exceptional' : 'favorable';
      } else {
        bestFor.push('root-crops');
      }
    } else {
      // 4th Quarter
      if (isBarren) {
        bestFor.push('weeding', 'pruning', 'harvest-storage');
        rating = 'exceptional';
      } else {
        bestFor.push('weeding', 'pruning');
        rating = 'favorable';
      }
    }

    days.push({
      date: isoDate,
      dayOfWeek,
      formattedDate,
      moonPhase: lunar.phase,
      moonEmoji: lunar.phaseEmoji,
      sign: lunar.zodiacSign,
      element: lunar.element,
      bestFor,
      rating,
    });
  }

  return days;
}

// ==========================================
// 2. AUTHENTIC FARMER'S ALMANAC WEATHER LORE
// ==========================================

export const FARMERS_ALMANAC_LORE: WeatherLoreItem[] = [
  {
    id: 'lore-1',
    saying: 'When dew is on the grass, rain will never come to pass.',
    category: 'Wind & Air',
    scienceExplanation:
      'Clear nighttime skies and calm winds promote radiative cooling of the ground, producing heavy morning dew. Those same stable atmospheric conditions indicate a persistent high-pressure system with little chance of rain.',
    traditionNote: 'First recorded in 18th-century New England almanacs.',
    historicalContext: 'Folk meteorology rule for hay harvesting.',
  },
  {
    id: 'lore-2',
    saying: 'Clear moon, frost soon.',
    category: 'Frost & Winter',
    scienceExplanation:
      'Cloud cover acts like a thermal blanket, trapping infrared heat radiating from the soil. On crystal clear autumn and spring nights, heat escapes freely into space, causing ground temperatures to plummet toward freezing.',
    traditionNote: 'Old Farmer’s Almanac warning for covering cold frames and tender crops.',
    historicalContext: 'Classic advice for autumn squash and tomato growers.',
  },
  {
    id: 'lore-3',
    saying: 'Red sky at night, shepherd’s delight; Red sky in morning, shepherd’s warning.',
    category: 'Clouds & Sky',
    scienceExplanation:
      'Weather systems in temperate latitudes typically move west to east. A red evening sky means setting sunlight is passing through clean, dry high-pressure air advancing from the west. A red morning sky shows high pressure has moved east, clearing the path for approaching moisture.',
    traditionNote: 'Recorded in maritime folklore and agricultural almanacs since biblical antiquity.',
    historicalContext: 'Recognized by meteorologists as one of the most reliable optical weather proverbs.',
  },
  {
    id: 'lore-4',
    saying: 'Mackerel scales and mare’s tails make lofty ships carry low sails.',
    category: 'Clouds & Sky',
    scienceExplanation:
      'High cirrocumulus ("mackerel scales") and wispy cirrus ("mare’s tails") clouds indicate moisture aloft and strong upper-level winds, frequently preceding an advancing warm front and significant precipitation by 24 to 36 hours.',
    traditionNote: 'Favored by both colonial sailing captains and coastal vegetable farmers.',
    historicalContext: 'Accurate predictor of frontal squalls.',
  },
  {
    id: 'lore-5',
    saying: 'Onion skins very thin, mild winter coming in; Onion skins thick and tough, coming winter cold and rough.',
    category: 'Plants & Trees',
    scienceExplanation:
      'While trees and root alliums respond to summer and late-season moisture stress by thickening skin layers, generations of agrarian homesteaders relied on autumn onion harvests to gauge winter insulation needs.',
    traditionNote: 'Found throughout Appalachian and Pennsylvania Dutch farm almanacs.',
    historicalContext: 'Homestead harvest ritual for pantry winterization.',
  },
  {
    id: 'lore-6',
    saying: 'When chimney smoke drifts down to the ground, expect foul weather to be around.',
    category: 'Wind & Air',
    scienceExplanation:
      'Low atmospheric pressure and high humidity before an approaching storm prevent smoke from rising briskly, while downward air currents and temperature inversions force smoke to roll along the ground.',
    traditionNote: 'Colonial homestead barometer lore.',
    historicalContext: 'Used before household barometers became common.',
  },
  {
    id: 'lore-7',
    saying: 'Plant corn when oak leaves are the size of a mouse’s ear.',
    category: 'Plants & Trees',
    scienceExplanation:
      'Phenology: Native oak leaf emergence responds precisely to sustained soil warming above 50°F–55°F, signaling that soil temperatures are warm enough for sweet corn and bean seeds to germinate without rotting.',
    traditionNote: 'Native American agricultural wisdom adopted by early American farmers.',
    historicalContext: 'Nature’s living soil thermometer.',
  },
  {
    id: 'lore-8',
    saying: 'Halo around the sun or moon means rain or snow is coming soon.',
    category: 'Clouds & Sky',
    scienceExplanation:
      'A 22-degree optical ring around the sun or moon is caused by hexagonal ice crystals in high cirrostratus clouds, which often form the leading edge of a warm frontal system bringing steady rain within 12 to 24 hours.',
    traditionNote: 'Documented in the 1792 first edition of The Old Farmer’s Almanac.',
    historicalContext: 'High correlation with mid-latitude cyclonic precipitation.',
  },
  {
    id: 'lore-9',
    saying: 'Ants build their hills higher before a soaking rain.',
    category: 'Animals & Nature',
    scienceExplanation:
      'Ants are sensitive to sudden drops in barometric pressure and rising relative humidity. They build up perimeter earthen rims around their mound entrances to prevent floodwaters from drowning underground chambers.',
    traditionNote: 'Common folklore observed across North American grasslands and farm fields.',
    historicalContext: 'Entomological barometric response.',
  },
  {
    id: 'lore-10',
    saying: 'If bees stay close to their hive, rain will soon arrive.',
    category: 'Animals & Nature',
    scienceExplanation:
      'Bees sense electrostatic charges and falling barometric pressure preceding convective thunderstorms, staying within foraging range of their colony to avoid being battered down by rain.',
    traditionNote: 'Beekeepers’ and orchardists’ golden rule.',
    historicalContext: 'Practical apiary observation for pollination timing.',
  },
  {
    id: 'lore-11',
    saying: 'When dandelion blossoms close up tight, expect rain before the night.',
    category: 'Plants & Trees',
    scienceExplanation:
      'Many flowering plants, including dandelions, clover, and chickweed, exhibit nyctinasty and hygroscopic sensitivity, closing their petals to protect pollen from being washed away by high-humidity rains.',
    traditionNote: 'Garden weed wisdom from 19th-century farm journals.',
    historicalContext: 'Plant self-defense mechanisms used as living forecasts.',
  },
  {
    id: 'lore-12',
    saying: 'A dry March, a wet April, and a cool May fill barn and cellar and bring much hay.',
    category: 'Frost & Winter',
    scienceExplanation:
      'A dry early spring allows farmers to till without compacting wet soils; gentle April showers establish deep roots; and a cool May prevents premature bolting while grain heads fill out.',
    traditionNote: 'Classic English and American seasonal agronomy proverb.',
    historicalContext: 'Optimal seasonal weather pattern for temperate agricultural yields.',
  },
];

export function getLoreOfTheDay(date: Date = new Date()): WeatherLoreItem {
  // Rotate consistently by day of year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % FARMERS_ALMANAC_LORE.length;
  return FARMERS_ALMANAC_LORE[index];
}

// ==========================================
// 3. WMO WEATHER CODE TRANSLATION
// ==========================================

export function interpretWmoCode(code: number, isDay = true): { desc: string; icon: string; category: string } {
  switch (code) {
    case 0:
      return { desc: isDay ? 'Clear & Sunny' : 'Clear Skies', icon: isDay ? '☀️' : '🌙', category: 'clear' };
    case 1:
      return { desc: 'Mainly Clear', icon: isDay ? '🌤️' : '🌤️', category: 'clear' };
    case 2:
      return { desc: 'Partly Cloudy', icon: '⛅', category: 'cloudy' };
    case 3:
      return { desc: 'Overcast & Cloudy', icon: '☁️', category: 'cloudy' };
    case 45:
    case 48:
      return { desc: 'Misty Fog', icon: '🌫️', category: 'fog' };
    case 51:
      return { desc: 'Light Drizzle', icon: '🌦️', category: 'drizzle' };
    case 53:
      return { desc: 'Moderate Drizzle', icon: '🌦️', category: 'drizzle' };
    case 55:
      return { desc: 'Dense Drizzle', icon: '🌧️', category: 'drizzle' };
    case 61:
      return { desc: 'Gentle Rain Showers', icon: '🌧️', category: 'rain' };
    case 63:
      return { desc: 'Moderate Soaking Rain', icon: '🌧️', category: 'rain' };
    case 65:
      return { desc: 'Heavy Rain Downpour', icon: '🌧️', category: 'rain' };
    case 71:
      return { desc: 'Slight Snow Fall', icon: '🌨️', category: 'snow' };
    case 73:
      return { desc: 'Moderate Snow Fall', icon: '❄️', category: 'snow' };
    case 75:
      return { desc: 'Heavy Snow Fall', icon: '❄️', category: 'snow' };
    case 80:
    case 81:
    case 82:
      return { desc: 'Passing Rain Showers', icon: '🌦️', category: 'rain' };
    case 85:
    case 86:
      return { desc: 'Snow Showers', icon: '🌨️', category: 'snow' };
    case 95:
      return { desc: 'Thunderstorms', icon: '⛈️', category: 'thunder' };
    case 96:
    case 99:
      return { desc: 'Severe Storm with Hail', icon: '⛈️', category: 'thunder' };
    default:
      return { desc: 'Partly Cloudy', icon: '⛅', category: 'cloudy' };
  }
}

export function windDegreesToDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

// ==========================================
// 4. AGRICULTURAL INDICES CALCULATION
// ==========================================

export function calculateAgriculturalIndices(
  currentTempF: number,
  tonightMinTempF: number,
  soilTempF: number,
  soilMoisturePct: number,
  windMph: number,
  rainProbPct: number,
  dailyForecasts: { tempMinF: number }[]
): AgriculturalIndices {
  // 1. Frost Warning evaluation
  const minUpcoming = Math.min(tonightMinTempF, ...(dailyForecasts.slice(0, 3).map((d) => d.tempMinF) || [tonightMinTempF]));
  let frostLevel: 'none' | 'watch' | 'frost' | 'hard-freeze' = 'none';
  let frostBadge = 'No Frost Expected';
  let frostHeadline = 'Safe & Mild Conditions';
  let frostDetails = `Overnight low is predicted at ${Math.round(tonightMinTempF)}°F, well above freezing thresholds.`;
  let frostAction = 'Normal garden watering and harvesting routine.';

  if (minUpcoming <= 28) {
    frostLevel = 'hard-freeze';
    frostBadge = 'Hard Freeze Warning (≤28°F)';
    frostHeadline = `Severe Freeze Warning: ${Math.round(minUpcoming)}°F`;
    frostDetails =
      'A killing hard freeze will freeze plant tissues solid and damage unharvested squashes, tomatoes, and tender perennials.';
    frostAction =
      'Immediately harvest remaining ripe tomatoes, peppers, and pumpkins. Disconnect garden hoses and cover cold frames with double-layer floating row covers.';
  } else if (minUpcoming <= 32) {
    frostLevel = 'frost';
    frostBadge = 'Frost Advisory (29°F - 32°F)';
    frostHeadline = `Frost Advisory: Low ${Math.round(minUpcoming)}°F`;
    frostDetails = 'Light frost crystals will form on leaves in open, low-lying garden beds.';
    frostAction =
      'Cover tender warm-season crops (basil, eggplants, squash) with frost cloth or inverted buckets. Cold-hardy greens (kale, collards, spinach) will sweeten!';
  } else if (minUpcoming <= 36) {
    frostLevel = 'watch';
    frostBadge = 'Frost Watch (33°F - 36°F)';
    frostHeadline = `Patchy Frost Watch: Low ${Math.round(minUpcoming)}°F`;
    frostDetails =
      'Microclimates in valley bottoms and sheltered corners may see patchy frost if skies remain clear and wind is calm.';
    frostAction = 'Keep row covers handy. Water beds in late afternoon as damp soil retains heat longer than dry soil.';
  }

  // 2. Soil Germination Temperature Suitability
  let soilStatus: 'cold-dormant' | 'cool-season-ready' | 'warm-season-optimal' | 'high-heat' = 'cool-season-ready';
  let soilSummary = '';
  const suitableCrops: string[] = [];
  const unfavorableCrops: string[] = [];

  if (soilTempF < 45) {
    soilStatus = 'cold-dormant';
    soilSummary = `${Math.round(soilTempF)}°F Soil: Cold and sluggish germination. Microbe activity is slow.`;
    suitableCrops.push('Winter garlic cloves (dormant rooting)', 'Overwintered spinach', 'Rhubarb crowns');
    unfavorableCrops.push('Tomatoes', 'Peppers', 'Squash', 'Beans', 'Cucumbers');
  } else if (soilTempF < 60) {
    soilStatus = 'cool-season-ready';
    soilSummary = `${Math.round(soilTempF)}°F Soil: Ideal for cool-season germination and vigorous early root growth.`;
    suitableCrops.push('Peas', 'Spinach', 'Radishes', 'Lettuce & Asian Greens', 'Kale', 'Carrots', 'Beets');
    unfavorableCrops.push('Eggplants', 'Melons', 'Okra (seeds will rot in cold soil)');
  } else if (soilTempF < 78) {
    soilStatus = 'warm-season-optimal';
    soilSummary = `${Math.round(soilTempF)}°F Soil: Optimal sweet spot for warm-weather garden staples! Rapid seed emergence.`;
    suitableCrops.push('Tomatoes', 'Peppers', 'Snap & Dry Beans', 'Squash & Zucchini', 'Sweet Corn', 'Basil');
    unfavorableCrops.push('Late spinach (will bolt rapidly)');
  } else {
    soilStatus = 'high-heat';
    soilSummary = `${Math.round(soilTempF)}°F Soil: High soil heat. Heavy mulch needed to retain moisture and cool root zones.`;
    suitableCrops.push('Watermelons', 'Cantaloupe', 'Sweet Potatoes', 'Okra', 'Cowpeas / Southern Peas');
    unfavorableCrops.push('Lettuce (thermo-dormancy stops germination)');
  }

  // 3. Spraying Window (Neem oil, Bacillus thuringiensis, organic compost teas)
  let sprayStatus: 'ideal' | 'marginal' | 'unfavorable' = 'ideal';
  let sprayBadge = 'Ideal for Garden Applications';
  let sprayReason = 'Calm winds and clear skies ensure maximum foliar adhesion without chemical drift or immediate wash-off.';

  if (windMph > 12 || rainProbPct > 50) {
    sprayStatus = 'unfavorable';
    sprayBadge = 'Unfavorable Spraying Window';
    sprayReason = `High winds (${Math.round(windMph)} mph) or rain threat (${rainProbPct}%) will cause drift onto beneficial insect zones or wash spray off before absorption.`;
  } else if (windMph > 8 || rainProbPct > 25) {
    sprayStatus = 'marginal';
    sprayBadge = 'Marginal: Exercise Caution';
    sprayReason = `Moderate breeze (${Math.round(windMph)} mph). Spray early in the morning before thermal breezes pick up.`;
  }

  // 4. Tilling & Mowing
  let tillStatus: 'good' | 'caution' | 'too-wet' = 'good';
  let tillBadge = 'Good Bed Workability';
  let tillNotes = 'Soil moisture is balanced. Beds can be turned or hoed without creating clods or hardpan.';

  if (soilMoisturePct > 40) {
    tillStatus = 'too-wet';
    tillBadge = 'Beds Saturated — Do Not Till';
    tillNotes =
      'Working wet soil destroys soil aggregate structure and compacts pore spaces. Wait for 24-48 hours of drying.';
  } else if (soilMoisturePct > 28) {
    tillStatus = 'caution';
    tillBadge = 'Moist Soil: Light Cultivation Only';
    tillNotes = 'Shallow hand-hoeing for weed management is fine, but avoid heavy machine tilling or stepping on beds.';
  }

  // 5. Growing Degree Days (GDD Base 50°F)
  const gdd = Math.max(0, (currentTempF + tonightMinTempF) / 2 - 50);

  return {
    frostWarning: {
      level: frostLevel,
      badge: frostBadge,
      headline: frostHeadline,
      details: frostDetails,
      actionAdvice: frostAction,
      tonightMinTemp: tonightMinTempF,
    },
    soilGermination: {
      soilTempF,
      status: soilStatus,
      summary: soilSummary,
      suitableCrops,
      unfavorableCrops,
    },
    sprayingWindow: {
      status: sprayStatus,
      badge: sprayBadge,
      reason: sprayReason,
      windMph,
      rainRiskPct: rainProbPct,
    },
    tillingAndMowing: {
      status: tillStatus,
      badge: tillBadge,
      notes: tillNotes,
    },
    growingDegreeDaysBase50: Math.round(gdd * 10) / 10,
  };
}

// ==========================================
// 5. OPEN-METEO WEATHER CLIENT & DATA FETCHER
// ==========================================

const CACHE_STORAGE_KEY = 'florahearth_weather_cache';
const CACHE_DURATION_MS = 25 * 60 * 1000; // 25 minutes cache

interface StoredCache {
  data: WeatherAlmanacData;
  timestamp: number;
  lat: number;
  lng: number;
}

/**
 * Get coordinates for a given location (via geocoding or fallback map)
 */
export async function resolveCoordinates(
  location: GardenLocation
): Promise<{ lat: number; lng: number; name: string }> {
  // If location already has valid coordinates
  if (location.latitude && location.longitude) {
    return {
      lat: location.latitude,
      lng: location.longitude,
      name: `${location.city}, ${location.state}`,
    };
  }

  // Predefined US city coordinates map for instantaneous zero-latency lookup
  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    Seattle: { lat: 47.6062, lng: -122.3321 },
    Portland: { lat: 45.5152, lng: -122.6784 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    Phoenix: { lat: 33.4484, lng: -112.074 },
    Denver: { lat: 39.7392, lng: -104.9903 },
    Chicago: { lat: 41.8781, lng: -87.6298 },
    Minneapolis: { lat: 44.9778, lng: -93.265 },
    Dallas: { lat: 32.7767, lng: -96.797 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    Atlanta: { lat: 33.749, lng: -84.388 },
    Miami: { lat: 25.7617, lng: -80.1918 },
    'New York': { lat: 40.7128, lng: -74.006 },
    Boston: { lat: 42.3601, lng: -71.0589 },
    Montpelier: { lat: 44.2601, lng: -72.5754 },
    Raleigh: { lat: 35.7796, lng: -78.6382 },
    'St. Louis': { lat: 38.627, lng: -90.1994 },
    Anchorage: { lat: 61.2181, lng: -149.9003 },
    Honolulu: { lat: 21.3069, lng: -157.8583 },
  };

  if (location.city && CITY_COORDS[location.city]) {
    return {
      lat: CITY_COORDS[location.city].lat,
      lng: CITY_COORDS[location.city].lng,
      name: `${location.city}, ${location.state}`,
    };
  }

  // Try Open-Meteo free geocoding API
  try {
    const query = location.zipCode ? location.zipCode : `${location.city}, ${location.state}`;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const geoJson = await res.json();
      if (geoJson.results && geoJson.results.length > 0) {
        const top = geoJson.results[0];
        return {
          lat: top.latitude,
          lng: top.longitude,
          name: `${top.name}${top.admin1 ? ', ' + top.admin1 : ''}`,
        };
      }
    }
  } catch (err) {
    console.warn('Geocoding fallback triggered:', err);
  }

  // Default fallback: Geographic center of US (Lebanon, KS) or Austin TX
  return {
    lat: 39.8283,
    lng: -98.5795,
    name: `${location.city || 'US Garden'}, ${location.state || 'USA'}`,
  };
}

/**
 * Main Fetcher: Combines Open-Meteo Weather API + Farmer's Almanac Lunar & Lore Engine
 */
export async function fetchWeatherAndAlmanac(
  location: GardenLocation,
  forceRefresh = false
): Promise<WeatherAlmanacData> {
  const coords = await resolveCoordinates(location);

  // Check cache unless forceRefresh
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(CACHE_STORAGE_KEY);
      if (cachedStr) {
        const cached: StoredCache = JSON.parse(cachedStr);
        const isRecent = Date.now() - cached.timestamp < CACHE_DURATION_MS;
        const isSameArea =
          Math.abs(cached.lat - coords.lat) < 0.1 && Math.abs(cached.lng - coords.lng) < 0.1;
        if (isRecent && isSameArea) {
          // Recompute dynamic moon info for current exact moment
          cached.data.lunar = getLunarPlantingInfo(new Date());
          cached.data.dailyLore = getLoreOfTheDay(new Date());
          return cached.data;
        }
      }
    } catch {
      // Ignore cache parse error
    }
  }

  try {
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure` +
      `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,soil_temperature_0_to_10cm,soil_moisture_0_to_1cm,uv_index,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`;

    const response = await fetch(weatherUrl, { signal: AbortSignal.timeout(6500) });
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }

    const json = await response.json();

    // 1. Process Current Conditions
    const cur = json.current;
    const curCode = cur.weather_code ?? 0;
    const curInterp = interpretWmoCode(curCode, cur.is_day === 1);

    // Current soil temp & moisture from current hour index
    const nowHour = new Date().getHours();
    const soilTempNow =
      json.hourly?.soil_temperature_0_to_10cm?.[nowHour] ??
      json.hourly?.soil_temperature_0_to_10cm?.[0] ??
      Math.max(40, cur.temperature_2m - 2);
    const soilMoistureNow = Math.round(
      (json.hourly?.soil_moisture_0_to_1cm?.[nowHour] ?? 0.25) * 100
    );
    const dewPointNow = json.hourly?.dew_point_2m?.[nowHour] ?? cur.temperature_2m - 10;

    const current: CurrentConditions = {
      tempF: Math.round(cur.temperature_2m),
      feelsLikeF: Math.round(cur.apparent_temperature),
      tempMinToday: Math.round(json.daily.temperature_2m_min[0] ?? cur.temperature_2m - 5),
      tempMaxToday: Math.round(json.daily.temperature_2m_max[0] ?? cur.temperature_2m + 5),
      humidityPct: Math.round(cur.relative_humidity_2m),
      windSpeedMph: Math.round(cur.wind_speed_10m),
      windDirectionDeg: cur.wind_direction_10m,
      windDirectionText: windDegreesToDirection(cur.wind_direction_10m),
      weatherCode: curCode,
      weatherDesc: curInterp.desc,
      weatherIcon: curInterp.icon,
      isDay: cur.is_day === 1,
      uvIndex: json.hourly?.uv_index?.[nowHour] ?? 5,
      precipitationInches: cur.precipitation ?? 0,
      cloudCoverPct: cur.cloud_cover ?? 10,
      surfacePressureInHg: Math.round(((cur.surface_pressure ?? 1013) * 0.02953) * 100) / 100,
      soilTemp0to10cmF: Math.round(soilTempNow * 10) / 10,
      soilMoisturePct: soilMoistureNow,
      dewPointF: Math.round(dewPointNow),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 2. Process Hourly Forecast (Next 24 Hours)
    const hourlyPoints: HourlyForecastPoint[] = [];
    const hourlyTimes: string[] = json.hourly?.time || [];
    const limit = Math.min(24, hourlyTimes.length);

    for (let i = 0; i < limit; i++) {
      const timeStr = hourlyTimes[i];
      const dateObj = new Date(timeStr);
      const code = json.hourly.weather_code[i] ?? 0;
      const interp = interpretWmoCode(code, dateObj.getHours() >= 6 && dateObj.getHours() <= 19);

      hourlyPoints.push({
        time: timeStr,
        displayTime: dateObj.toLocaleTimeString([], { hour: 'numeric' }),
        tempF: Math.round(json.hourly.temperature_2m[i]),
        feelsLikeF: Math.round(json.hourly.temperature_2m[i]),
        humidityPct: Math.round(json.hourly.relative_humidity_2m[i] ?? 50),
        popPct: Math.round(json.hourly.precipitation_probability?.[i] ?? 0),
        precipInches: Math.round((json.hourly.precipitation?.[i] ?? 0) * 100) / 100,
        weatherCode: code,
        weatherDesc: interp.desc,
        weatherIcon: interp.icon,
        soilTempF: Math.round((json.hourly.soil_temperature_0_to_10cm?.[i] ?? 55) * 10) / 10,
        soilMoisturePct: Math.round((json.hourly.soil_moisture_0_to_1cm?.[i] ?? 0.25) * 100),
        uvIndex: Math.round(json.hourly.uv_index?.[i] ?? 0),
        windMph: Math.round(json.hourly.wind_speed_10m?.[i] ?? 5),
      });
    }

    // 3. Process Daily Forecast (7 Days)
    const dailyForecast: DailyForecastDay[] = [];
    const dailyTimes: string[] = json.daily?.time || [];

    for (let i = 0; i < dailyTimes.length; i++) {
      const dStr = dailyTimes[i];
      const dObj = new Date(dStr + 'T12:00:00');
      const minT = Math.round(json.daily.temperature_2m_min[i]);
      const maxT = Math.round(json.daily.temperature_2m_max[i]);
      const code = json.daily.weather_code[i] ?? 0;
      const interp = interpretWmoCode(code, true);

      let frostRisk: 'none' | 'watch' | 'frost' | 'hard-freeze' = 'none';
      let frostRiskLabel = 'Frost-Free';
      if (minT <= 28) {
        frostRisk = 'hard-freeze';
        frostRiskLabel = 'Hard Freeze';
      } else if (minT <= 32) {
        frostRisk = 'frost';
        frostRiskLabel = 'Frost Alert';
      } else if (minT <= 36) {
        frostRisk = 'watch';
        frostRiskLabel = 'Patchy Frost';
      }

      // Format times
      const sunriseIso = json.daily.sunrise?.[i] || '';
      const sunsetIso = json.daily.sunset?.[i] || '';
      const sunriseTime = sunriseIso
        ? new Date(sunriseIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '6:30 AM';
      const sunsetTime = sunsetIso
        ? new Date(sunsetIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '7:30 PM';

      const lunarInfo = getLunarPlantingInfo(dObj);

      dailyForecast.push({
        date: dStr,
        dayName: i === 0 ? 'Today' : dObj.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tempMaxF: maxT,
        tempMinF: minT,
        apparentMaxF: Math.round(json.daily.apparent_temperature_max[i]),
        apparentMinF: Math.round(json.daily.apparent_temperature_min[i]),
        weatherCode: code,
        weatherDesc: interp.desc,
        icon: interp.icon,
        popPct: Math.round(json.daily.precipitation_probability_max?.[i] ?? 0),
        precipSumInches: Math.round((json.daily.precipitation_sum?.[i] ?? 0) * 100) / 100,
        windSpeedMaxMph: Math.round(json.daily.wind_speed_10m_max?.[i] ?? 8),
        uvIndexMax: Math.round(json.daily.uv_index_max?.[i] ?? 6),
        sunriseTime,
        sunsetTime,
        frostRisk,
        frostRiskLabel,
        lunarPhase: lunarInfo.phase,
        moonIcon: lunarInfo.phaseEmoji,
      });
    }

    // 4. Calculate Agricultural Indices
    const tonightLow = dailyForecast[0]?.tempMinF ?? current.tempMinToday;
    const indices = calculateAgriculturalIndices(
      current.tempF,
      tonightLow,
      current.soilTemp0to10cmF,
      current.soilMoisturePct,
      current.windSpeedMph,
      dailyForecast[0]?.popPct ?? 10,
      dailyForecast
    );

    // 5. Lunar & Farmer's Almanac Engine
    const lunar = getLunarPlantingInfo(new Date());
    const bestDays = get30DayAlmanacCalendar(new Date());
    const dailyLore = getLoreOfTheDay(new Date());

    const result: WeatherAlmanacData = {
      locationName: coords.name,
      latitude: coords.lat,
      longitude: coords.lng,
      elevationMeters: json.elevation ?? 100,
      current,
      hourly: hourlyPoints,
      daily: dailyForecast,
      indices,
      lunar,
      bestDays,
      dailyLore,
      fetchedAt: new Date().toISOString(),
      isMockOrFallback: false,
    };

    // Save to Cache
    if (typeof window !== 'undefined') {
      try {
        const toCache: StoredCache = {
          data: result,
          timestamp: Date.now(),
          lat: coords.lat,
          lng: coords.lng,
        };
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(toCache));
      } catch {
        // Ignore cache write error
      }
    }

    return result;
  } catch (err) {
    console.warn('Open-Meteo live request failed, generating fallback seasonal data:', err);
    return generateFallbackAlmanacData(location, coords);
  }
}

/**
 * Robust Fallback Generator: When offline or network blocked, produces realistic seasonal data
 * tailored to user's USDA Hardiness Zone and current calendar date.
 */
function generateFallbackAlmanacData(
  location: GardenLocation,
  coords: { lat: number; lng: number; name: string }
): WeatherAlmanacData {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const isSummer = month >= 5 && month <= 8;
  const isWinter = month === 11 || month <= 1;

  // Base seasonal temperature according to zone
  const zoneNum = parseInt(location.usdaZone) || 7;
  const baseAvgTemp = 40 + zoneNum * 4 + (isSummer ? 18 : isWinter ? -14 : 0);
  const minTemp = Math.round(baseAvgTemp - 14);
  const maxTemp = Math.round(baseAvgTemp + 10);
  const currentTemp = Math.round((minTemp + maxTemp) / 2);

  const curInterp = interpretWmoCode(2, true);

  const current: CurrentConditions = {
    tempF: currentTemp,
    feelsLikeF: currentTemp - 2,
    tempMinToday: minTemp,
    tempMaxToday: maxTemp,
    humidityPct: 58,
    windSpeedMph: 7,
    windDirectionDeg: 190,
    windDirectionText: 'S',
    weatherCode: 2,
    weatherDesc: 'Partly Sunny & Mild',
    weatherIcon: '⛅',
    isDay: true,
    uvIndex: 5,
    precipitationInches: 0.0,
    cloudCoverPct: 35,
    surfacePressureInHg: 30.05,
    soilTemp0to10cmF: Math.round(currentTemp - 4),
    soilMoisturePct: 24,
    dewPointF: currentTemp - 12,
    updatedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const daily: DailyForecastDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dMin = Math.round(minTemp + (Math.sin(i) * 3));
    const dMax = Math.round(maxTemp + (Math.cos(i) * 4));
    const lunarInfo = getLunarPlantingInfo(d);

    daily.push({
      date: localDateStr(d),
      dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tempMaxF: dMax,
      tempMinF: dMin,
      apparentMaxF: dMax,
      apparentMinF: dMin,
      weatherCode: 1,
      weatherDesc: 'Mainly Clear & Mild',
      icon: '🌤️',
      popPct: 15,
      precipSumInches: 0.0,
      windSpeedMaxMph: 8,
      uvIndexMax: 6,
      sunriseTime: '6:45 AM',
      sunsetTime: '7:15 PM',
      frostRisk: dMin <= 28 ? 'hard-freeze' : dMin <= 32 ? 'frost' : dMin <= 36 ? 'watch' : 'none',
      frostRiskLabel: dMin <= 32 ? 'Frost Risk' : 'Frost-Free',
      lunarPhase: lunarInfo.phase,
      moonIcon: lunarInfo.phaseEmoji,
    });
  }

  const hourly: HourlyForecastPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const d = new Date(now);
    d.setHours(d.getHours() + h);
    hourly.push({
      time: d.toISOString(),
      displayTime: d.toLocaleTimeString([], { hour: 'numeric' }),
      tempF: Math.round(minTemp + Math.sin(h / 3.8) * (maxTemp - minTemp)),
      feelsLikeF: Math.round(minTemp + Math.sin(h / 3.8) * (maxTemp - minTemp)),
      humidityPct: 55,
      popPct: 10,
      precipInches: 0,
      weatherCode: 1,
      weatherDesc: 'Clear to Partly Cloudy',
      weatherIcon: '🌤️',
      soilTempF: current.soilTemp0to10cmF,
      soilMoisturePct: current.soilMoisturePct,
      uvIndex: h >= 10 && h <= 16 ? 5 : 0,
      windMph: 6,
    });
  }

  const indices = calculateAgriculturalIndices(
    current.tempF,
    daily[0].tempMinF,
    current.soilTemp0to10cmF,
    current.soilMoisturePct,
    current.windSpeedMph,
    daily[0].popPct,
    daily
  );

  return {
    locationName: coords.name,
    latitude: coords.lat,
    longitude: coords.lng,
    elevationMeters: 150,
    current,
    hourly,
    daily,
    indices,
    lunar: getLunarPlantingInfo(now),
    bestDays: get30DayAlmanacCalendar(now),
    dailyLore: getLoreOfTheDay(now),
    fetchedAt: now.toISOString(),
    isMockOrFallback: true,
  };
}
