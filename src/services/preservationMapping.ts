import { Crop, PantryItem } from '../types/garden';

export type CropPreservationMethod = Crop['preservationMethods'][number];

export interface PantryDefaults {
  preservationType: PantryItem['preservationType'];
  unit: string;
  storageLocation: PantryItem['storageLocation'];
  /** Approximate pounds of fresh produce per unit, used to estimate a quantity. */
  lbsPerUnit: number;
  /** Shelf life in months, used for the best-by date. */
  shelfLifeMonths: number;
  label: string;
}

/**
 * One explicit entry per crop preservation method. Every method maps to its own
 * pantry type: a low-acid crop that lists `pressure-canning` must never be
 * recorded as water-bath canned.
 */
export const PANTRY_DEFAULTS: Record<CropPreservationMethod, PantryDefaults> = {
  'freezing': { preservationType: 'frozen', unit: '1-lb freezer bags', storageLocation: 'Freezer', lbsPerUnit: 1, shelfLifeMonths: 12, label: 'Freeze' },
  'dehydration': { preservationType: 'dehydrated', unit: 'pint jars (dried)', storageLocation: 'Pantry Shelf', lbsPerUnit: 4, shelfLifeMonths: 12, label: 'Dehydrate' },
  'fermentation': { preservationType: 'fermented', unit: 'quart jars', storageLocation: 'Crisper', lbsPerUnit: 2, shelfLifeMonths: 6, label: 'Ferment' },
  'cold-storage': { preservationType: 'cured-storage', unit: 'lbs', storageLocation: 'Root Cellar', lbsPerUnit: 1, shelfLifeMonths: 4, label: 'Cold store' },
  'water-bath-canning': { preservationType: 'water-bath-canned', unit: 'quart jars', storageLocation: 'Pantry Shelf', lbsPerUnit: 2.5, shelfLifeMonths: 12, label: 'Water-bath can' },
  'pressure-canning': { preservationType: 'pressure-canned', unit: 'quart jars', storageLocation: 'Pantry Shelf', lbsPerUnit: 2.5, shelfLifeMonths: 12, label: 'Pressure can' },
};

const CANNING_METHODS: CropPreservationMethod[] = ['water-bath-canning', 'pressure-canning'];

export function isCanningMethod(method: CropPreservationMethod): boolean {
  return CANNING_METHODS.includes(method);
}

/**
 * Methods that are safe to log in one tap from a harvest entry. Canning is
 * excluded on purpose: it needs a tested, altitude-adjusted procedure, so it
 * goes through the Safe Preservation tab instead.
 */
export function getQuickPreserveMethods(crop: Crop | null | undefined): CropPreservationMethod[] {
  if (!crop) return ['freezing'];
  return crop.preservationMethods.filter(m => !isCanningMethod(m));
}

export function getCanningMethods(crop: Crop | null | undefined): CropPreservationMethod[] {
  if (!crop) return [];
  return crop.preservationMethods.filter(isCanningMethod);
}
