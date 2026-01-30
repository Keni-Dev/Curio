/**
 * OfflineBanner Component
 * 
 * Fixed top banner displaying offline status with pending sync count.
 * Follows Curio design system with teal-700 background and glass effect.
 */

import { useOffline } from '~hooks/useOffline';
import { cn } from '~lib/utils';

// ============================================================================
// Icons (inline for bundle size)
// ============================================================================

function CloudOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m2 2 20 20" />
      <path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193" />
      <path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncPendingReports } = useOffline();

  // Don't show banner when online with no pending items
  if (isOnline && pendingCount === 0) {
    return null;
  }

  // Syncing state
  if (isSyncing) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'flex items-center justify-center gap-2',
          'px-4 py-2.5',
          'bg-teal-700/95 backdrop-blur-sm',
          'text-white text-sm font-medium',
          'shadow-md',
          'transition-all duration-300 ease-out'
        )}
        role="status"
        aria-live="polite"
      >
        <RefreshIcon className="h-4 w-4" />
        <span>Syncing {pendingCount} pending report{pendingCount !== 1 ? 's' : ''}...</span>
      </div>
    );
  }

  // Offline state
  if (!isOnline) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'flex items-center justify-between',
          'px-4 py-2.5',
          'bg-gray-800/95 backdrop-blur-sm',
          'text-white text-sm',
          'shadow-md',
          'transition-all duration-300 ease-out'
        )}
        role="status"
        aria-live="assertive"
      >
        <div className="flex items-center gap-2">
          <CloudOffIcon className="h-4 w-4 text-amber-400" />
          <span className="font-medium">Offline Mode</span>
          <span className="text-gray-300">• Using cached data</span>
        </div>

        {pendingCount > 0 && (
          <div
            className={cn(
              'flex items-center gap-1.5',
              'px-2.5 py-1',
              'bg-amber-500/20 rounded-full',
              'text-amber-300 text-xs font-semibold'
            )}
          >
            <span>{pendingCount}</span>
            <span className="hidden sm:inline">pending</span>
          </div>
        )}
      </div>
    );
  }

  // Online but has pending items (sync failed or just came back online)
  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        'px-4 py-2.5',
        'bg-teal-700/95 backdrop-blur-sm',
        'text-white text-sm',
        'shadow-md',
        'transition-all duration-300 ease-out'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <CloudIcon className="h-4 w-4 text-cyan-300" />
        <span className="font-medium">Back Online</span>
        <span className="text-teal-100">• {pendingCount} report{pendingCount !== 1 ? 's' : ''} to sync</span>
      </div>

      <button
        onClick={() => syncPendingReports()}
        className={cn(
          'flex items-center gap-1.5',
          'px-3 py-1.5',
          'bg-white/20 hover:bg-white/30',
          'rounded-lg',
          'text-xs font-semibold',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
          'min-h-[44px] min-w-[44px]' // Touch target
        )}
        aria-label={`Sync ${pendingCount} pending reports`}
      >
        <RefreshIcon className="h-3.5 w-3.5 animate-none" />
        <span>Sync Now</span>
      </button>
    </div>
  );
}

// ============================================================================
// Spacer Component (to prevent content from going under the banner)
// ============================================================================

export function OfflineBannerSpacer() {
  const { isOnline, pendingCount } = useOffline();

  // Only show spacer when banner is visible
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return <div className="h-10" aria-hidden="true" />;
}
