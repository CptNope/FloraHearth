import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home } from 'lucide-react';
import { executeHardCacheReset } from '../services/pwaVersionService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FloraHearth ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetToSafeDefaults = async () => {
    try {
      // Clear potentially corrupt localStorage keys
      const keysToClear = [
        'florahearth_location_v1',
        'florahearth_preferences_v1',
        'florahearth_spaces_v1',
        'florahearth_tasks_v1',
        'florahearth_pantry_v1',
        'florahearth_journal_v1',
        'florahearth_soil_v1',
        'florahearth_hydro_v1',
        'florahearth_expenses_v1',
        'florahearth_setup_done_v1',
      ];
      keysToClear.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (_) {}
      });
      await executeHardCacheReset({ preserveGardenData: false });
    } catch (_) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b1510] text-[#ecfdf5] flex items-center justify-center p-4 font-sans-botanical">
          <div className="max-w-md w-full bg-[#121f17] border border-[#223d2e] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif-botanical text-white">
                FloraHearth Encountered a Hiccup
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                The application detected an unexpected state or cached data conflict. Don&apos;t worry—your garden companion can be restored immediately.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#0a130e] border border-[#1b3124] rounded-xl p-3 text-left overflow-x-auto text-xs font-mono text-stone-400">
                <span className="text-amber-300 font-semibold block mb-1">Diagnostic:</span>
                {this.state.error.message || 'Unknown render exception'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#05140b] font-bold text-xs transition-colors shadow-md"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Reload App</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetToSafeDefaults}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
