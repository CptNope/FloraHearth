import React from 'react';
import { CloudOff, History } from 'lucide-react';
import { WeatherAlmanacData } from '../types/weatherAlmanac';

/** Short, single-line description of where the weather numbers came from. */
export function forecastSourceLabel(data: WeatherAlmanacData | null): string {
  if (!data) return 'Loading forecast…';
  if (data.forecastStatus === 'estimate') return 'Estimate only · no live forecast';
  if (data.forecastStatus === 'cached') {
    const t = new Date(data.fetchedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `Offline · forecast from ${t}`;
  }
  return 'Live forecast · Open-Meteo';
}

/**
 * Banner shown whenever the weather on screen is not a fresh forecast.
 * Estimates in particular must never be mistaken for a real frost outlook.
 */
export const ForecastStatusNotice: React.FC<{ data: WeatherAlmanacData | null; onRetry?: () => void }> = ({ data, onRetry }) => {
  if (!data || data.forecastStatus === 'live') return null;

  const isEstimate = data.forecastStatus === 'estimate';
  const Icon = isEstimate ? CloudOff : History;
  return (
    <div
      role="status"
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-xs ${
        isEstimate
          ? 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-100'
          : 'bg-stone-50 border-stone-300 text-stone-800 dark:bg-[#17271e] dark:border-[#2a4535] dark:text-stone-100'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          {isEstimate ? (
            <>
              <strong>These are seasonal estimates, not a forecast.</strong> FloraHearth couldn&apos;t reach the weather
              service, so temperatures, frost and soil readings are typical values for your zone. Check a local forecast
              before relying on them.
            </>
          ) : (
            <>
              <strong>You&apos;re offline.</strong> Showing today&apos;s last forecast, fetched at{' '}
              {new Date(data.fetchedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. Current
              conditions may have changed.
            </>
          )}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start sm:self-auto shrink-0 min-h-6 px-3 py-1 rounded-lg border border-current font-semibold hover:bg-black/5 dark:hover:bg-white/10"
        >
          Try again
        </button>
      )}
    </div>
  );
};
