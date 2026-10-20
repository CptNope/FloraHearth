/**
 * Tab <-> URL routing for a static (GitHub Pages) app without a router.
 *
 * - `?tab=<id>` selects the tab on load (PWA shortcuts and JAT-OS deep links
 *   use planner / crops / calendar; every other tab id works too).
 * - Changing tabs pushes a history entry, so Back/Forward move between tabs
 *   and a reload stays on the same tab.
 * - Other query params (e.g. v_reset) and the hash are preserved.
 */

export const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  'weather-almanac': 'Weather & Almanac',
  planner: 'Bed Designer',
  crops: 'Crop Guides',
  calendar: 'Calendar & Tasks',
  companions: 'Companion Ecology',
  soil: 'Soil & IPM',
  preservation: 'Safe Preservation',
  pantry: 'Pantry & Yields',
  journal: 'Journal & ROI',
  hydro: 'Indoor & Hydro',
};

export const DEFAULT_TAB = 'dashboard';

export function isKnownTab(id: string | null | undefined): id is string {
  return !!id && Object.prototype.hasOwnProperty.call(TAB_TITLES, id);
}

/** The tab named in the current URL, or the dashboard for missing/unknown values. */
export function tabFromLocation(loc: Location = window.location): string {
  const requested = new URLSearchParams(loc.search).get('tab');
  return isKnownTab(requested) ? requested : DEFAULT_TAB;
}

export function urlForTab(tab: string, loc: Location = window.location): string {
  const params = new URLSearchParams(loc.search);
  if (tab === DEFAULT_TAB) params.delete('tab');
  else params.set('tab', tab);
  const qs = params.toString();
  return `${loc.pathname}${qs ? `?${qs}` : ''}${loc.hash}`;
}

export function titleForTab(tab: string): string {
  const name = TAB_TITLES[tab];
  return name && tab !== DEFAULT_TAB ? `${name} · FloraHearth` : 'FloraHearth: US Garden, Harvest & Pantry Planner';
}
