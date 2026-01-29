/**
 * ProximityCheck Component
 *
 * Location verification UI showing loading, verified, warning, or error states.
 * Displays pharmacy mini-map header with distance indicator.
 *
 * @see references/alay_stock_report_contribution/code.html
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useProximityCheck } from '../hooks/useProximityCheck';
import { ALAY_COPY, MAX_REPORT_DISTANCE } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

interface ProximityCheckProps {
  /** Pharmacy location coordinates */
  pharmacyLocation: { lat: number; lng: number };
  /** Pharmacy name for display */
  pharmacyName: string;
  /** Whether user can proceed despite distance */
  onProceed: () => void;
  /** Whether check is verified */
  onVerified?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProximityCheck({
  pharmacyLocation,
  pharmacyName,
  onProceed,
  onVerified,
  className,
}: ProximityCheckProps) {
  const {
    status,
    isVerified,
    distanceText,
    errorMessage,
    refresh,
  } = useProximityCheck({ pharmacyLocation, maxDistance: MAX_REPORT_DISTANCE });

  // Auto-proceed when verified
  if (isVerified && onVerified) {
    // Small delay for UX
    setTimeout(onVerified, 500);
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Mini-Map Header */}
      <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 mb-6">
        {/* Map placeholder - in production, use actual map tile */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5" />
        
        {/* Pharmacy Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="size-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[24px]">
                local_pharmacy
              </span>
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 size-12 rounded-full bg-primary/30 animate-ping" />
          </div>
        </div>

        {/* Location Tag */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/90 dark:bg-surface/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">
              location_on
            </span>
            <span className="text-sm font-medium text-text-primary truncate">
              {pharmacyName}
            </span>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={cn(
          'rounded-xl p-4 border-2 transition-all',
          // Status-based styling
          status === 'loading' && 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10',
          status === 'verified' && 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          status === 'too_far' && 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          (status === 'error' || status === 'unsupported') && 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0',
              status === 'loading' && 'bg-slate-200 dark:bg-white/10 text-muted',
              status === 'verified' && 'bg-emerald-500 text-white',
              status === 'too_far' && 'bg-amber-500 text-white',
              (status === 'error' || status === 'unsupported') && 'bg-rose-500 text-white'
            )}
          >
            {status === 'loading' && (
              <div className="size-5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
            )}
            {status === 'verified' && (
              <span className="material-symbols-outlined text-[20px]">check</span>
            )}
            {status === 'too_far' && (
              <span className="material-symbols-outlined text-[20px]">warning</span>
            )}
            {(status === 'error' || status === 'unsupported') && (
              <span className="material-symbols-outlined text-[20px]">location_off</span>
            )}
          </div>

          {/* Status Text */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-bold',
                status === 'loading' && 'text-muted',
                status === 'verified' && 'text-emerald-700 dark:text-emerald-300',
                status === 'too_far' && 'text-amber-700 dark:text-amber-300',
                (status === 'error' || status === 'unsupported') && 'text-rose-700 dark:text-rose-300'
              )}
            >
              {status === 'loading' && ALAY_COPY.checkingLocation}
              {status === 'verified' && ALAY_COPY.verifiedLocation}
              {status === 'too_far' && ALAY_COPY.tooFar}
              {status === 'error' && ALAY_COPY.locationDenied}
              {status === 'unsupported' && 'Location not supported'}
            </p>

            {/* Distance or Error Message */}
            <p className="text-sm text-muted mt-0.5">
              {distanceText && `(${distanceText})`}
              {errorMessage && errorMessage}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {status === 'verified' && (
            <Button onClick={onProceed} fullWidth>
              Magpatuloy
            </Button>
          )}

          {status === 'too_far' && (
            <>
              <Button variant="outline" onClick={refresh} className="flex-1">
                I-refresh
              </Button>
              <Button variant="ghost" onClick={onProceed} className="flex-1">
                Ituloy pa rin
              </Button>
            </>
          )}

          {status === 'error' && (
            <Button variant="outline" onClick={refresh} fullWidth>
              {ALAY_COPY.enableLocation}
            </Button>
          )}

          {status === 'loading' && (
            <div className="w-full h-12 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
          )}
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted text-center mt-4">
        Para sa mas tumpak na impormasyon, kailangan mong nasa loob ng{' '}
        {MAX_REPORT_DISTANCE}m mula sa pharmacy.
      </p>
    </div>
  );
}

export default ProximityCheck;
