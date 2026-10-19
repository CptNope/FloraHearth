/**
 * Date helpers that work in the user's local time zone.
 *
 * `new Date().toISOString().split('T')[0]` returns the UTC date, which is
 * already "tomorrow" in the evening across the US (after 8 pm Eastern,
 * 5 pm Pacific). Use these helpers for any calendar date the user sees.
 */

/** YYYY-MM-DD for the given moment in local time (defaults to now). */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as local midnight (Date('YYYY-MM-DD') parses as UTC). */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Return a new Date offset by a number of days. */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/** Same calendar date one year (or more) later, in local time. */
export function addYears(d: Date, years: number): Date {
  const out = new Date(d);
  out.setFullYear(out.getFullYear() + years);
  return out;
}

/** Whole days from today (local) until the given YYYY-MM-DD; negative if past. */
export function daysUntil(dateStr: string, from: Date = new Date()): number {
  const target = parseLocalDate(dateStr).getTime();
  const today = parseLocalDate(localDateStr(from)).getTime();
  return Math.round((target - today) / 86_400_000);
}
