export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export type ZodiacSignName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type ZodiacElement = 'Water' | 'Earth' | 'Air' | 'Fire';

export type FertilityGrade =
  | 'Very Fertile & Fruitful'
  | 'Productive & Semi-Fertile'
  | 'Barren & Dry (Cultivate Only)';

export interface HourlyForecastPoint {
  time: string; // ISO string
  displayTime: string; // "2 PM"
  tempF: number;
  feelsLikeF: number;
  humidityPct: number;
  popPct: number; // Probability of precipitation %
  precipInches: number;
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  soilTempF: number; // 0-10cm depth
  soilMoisturePct: number; // m³/m³ as %
  uvIndex: number;
  windMph: number;
}

export interface DailyForecastDay {
  date: string; // YYYY-MM-DD
  dayName: string; // "Today", "Thu", etc.
  formattedDate: string; // "Oct 15"
  tempMaxF: number;
  tempMinF: number;
  apparentMaxF: number;
  apparentMinF: number;
  weatherCode: number;
  weatherDesc: string;
  icon: string;
  popPct: number; // Max precip prob %
  precipSumInches: number;
  windSpeedMaxMph: number;
  uvIndexMax: number;
  sunriseTime: string;
  sunsetTime: string;
  frostRisk: 'none' | 'watch' | 'frost' | 'hard-freeze';
  frostRiskLabel: string;
  lunarPhase: MoonPhaseName;
  moonIcon: string;
}

export interface CurrentConditions {
  tempF: number;
  feelsLikeF: number;
  tempMinToday: number;
  tempMaxToday: number;
  humidityPct: number;
  windSpeedMph: number;
  windDirectionDeg: number;
  windDirectionText: string;
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  isDay: boolean;
  uvIndex: number;
  precipitationInches: number;
  cloudCoverPct: number;
  surfacePressureInHg: number;
  soilTemp0to10cmF: number;
  soilMoisturePct: number;
  dewPointF: number;
  updatedAt: string;
}

export interface AgriculturalIndices {
  frostWarning: {
    /** 'unknown' when there is no live forecast (offline estimate): never treat as safe. */
    level: 'none' | 'watch' | 'frost' | 'hard-freeze' | 'unknown';
    badge: string;
    headline: string;
    details: string;
    actionAdvice: string;
    tonightMinTemp: number;
  };
  soilGermination: {
    soilTempF: number;
    status: 'cold-dormant' | 'cool-season-ready' | 'warm-season-optimal' | 'high-heat';
    summary: string;
    suitableCrops: string[];
    unfavorableCrops: string[];
  };
  sprayingWindow: {
    status: 'ideal' | 'marginal' | 'unfavorable';
    badge: string;
    reason: string;
    windMph: number;
    rainRiskPct: number;
  };
  tillingAndMowing: {
    status: 'good' | 'caution' | 'too-wet';
    badge: string;
    notes: string;
  };
  growingDegreeDaysBase50: number; // GDD accumulated
}

export interface LunarPlantingInfo {
  phase: MoonPhaseName;
  phaseCode: string;
  phaseEmoji: string;
  phaseQuarter: '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';
  illuminationPct: number; // 0 to 100
  moonAgeDays: number;
  nextNewMoonDays: number;
  nextFullMoonDays: number;
  zodiacSign: ZodiacSignName;
  element: ZodiacElement;
  fertility: FertilityGrade;
  lunarRuleSummary: string;
  actionTitle: string;
  recommendedCrops: string[];
  avoidCrops: string[];
  almanacChoreToday: string;
}

export interface BestAlmanacDay {
  date: string;
  dayOfWeek: string;
  formattedDate: string;
  moonPhase: MoonPhaseName;
  moonEmoji: string;
  sign: ZodiacSignName;
  element: ZodiacElement;
  bestFor: ('above-ground-crops' | 'root-crops' | 'pruning' | 'weeding' | 'harvest-storage' | 'compost-fertilize')[];
  rating: 'exceptional' | 'favorable' | 'neutral';
}

export interface WeatherLoreItem {
  id: string;
  saying: string;
  category: 'Clouds & Sky' | 'Wind & Air' | 'Animals & Nature' | 'Plants & Trees' | 'Frost & Winter';
  scienceExplanation: string;
  traditionNote: string;
  historicalContext: string;
}

export interface WeatherAlmanacData {
  locationName: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  current: CurrentConditions;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastDay[];
  indices: AgriculturalIndices;
  lunar: LunarPlantingInfo;
  bestDays: BestAlmanacDay[];
  dailyLore: WeatherLoreItem;
  fetchedAt: string;
  /** True for seasonal estimates generated when no forecast could be fetched. */
  isMockOrFallback: boolean;
  /**
   * live: fetched just now (or within the 25 min cache)
   * cached: the weather service could not be reached; this is today's last live forecast
   * estimate: no forecast available; values are seasonal estimates for the zone
   */
  forecastStatus: 'live' | 'cached' | 'estimate';
}
