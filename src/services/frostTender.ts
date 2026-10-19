import { Crop, GardenSpace } from '../types/garden';
import { getCropById } from '../data/cropsData';

/**
 * A crop is frost-tender when it cannot go outside until after the last
 * spring frost: its transplant (or, for direct-sown crops, its sowing) window
 * starts on or after the frost date, and it is not marked as overwintering.
 *
 * Deriving this from the timing data avoids family shortcuts: Lamiaceae holds
 * both basil (tender) and rosemary/thyme/sage (hardy), and tender crops such
 * as okra and sweet potato sit outside the usual nightshade/cucurbit families.
 */
export function isFrostTender(crop: Crop): boolean {
  const t = crop.plantingTiming;
  if (t.overwinteringSafe) return false;

  const min = (w: number | [number, number] | undefined) =>
    w === undefined ? undefined : Array.isArray(w) ? Math.min(w[0], w[1]) : w;

  const transplant = min(t.transplantWeeksAfterLastFrost);
  if (transplant !== undefined) return transplant >= 0;

  const sowAfter = min(t.directSowWeeksAfterLastFrost);
  const sowsBefore = t.directSowWeeksBeforeLastFrost !== undefined;
  return sowAfter !== undefined && sowAfter >= 0 && !sowsBefore;
}

export interface TenderCropsInBed {
  spaceId: string;
  bedName: string;
  crops: string[];
}

/** Frost-tender crops currently placed in each outdoor bed. */
export function getTenderCropsByBed(spaces: GardenSpace[]): TenderCropsInBed[] {
  const indoor = new Set(['indoor', 'greenhouse', 'hydroponics', 'aquaponics']);
  return spaces
    .filter(sp => !indoor.has(sp.type))
    .map(sp => {
      const names: string[] = [];
      sp.cells.forEach(c => {
        const crop = c.cropId ? getCropById(c.cropId) : undefined;
        if (!crop || !isFrostTender(crop)) return;
        const name = crop.name.split('(')[0].trim();
        if (!names.includes(name)) names.push(name);
      });
      return { spaceId: sp.id, bedName: sp.name, crops: names };
    })
    .filter(b => b.crops.length > 0);
}
