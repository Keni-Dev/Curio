/**
 * RateLimitDisplay Component
 *
 * Shows rate limiting status to users:
 * - Cooldown countdown timer
 * - Daily reports remaining
 * - Progress bar for daily limit
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCooldown, getDailyLimitPercentage, type RateLimitStatus } from '../hooks/useRateLimit';

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitDisplayProps {
  /** Rate limit status from useRateLimit hook */
  rateLimit: RateLimitStatus;
  /** Additional CSS classes */
  className?: string;
  /** Show compact version (inline) */
  compact?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RateLimitDisplay({
  rateLimit,
  className,
  compact = false,
}: RateLimitDisplayProps) {
  // Initialize countdown from prop, then manage locally for smooth decrementing
  const [countdown, setCountdown] = useState(() => rateLimit.cooldownRemaining);

  // Sync countdown when prop changes (from server refresh)
  useEffect(() => {
    // Only update if the new value differs significantly (avoid jitter)
    if (Math.abs(rateLimit.cooldownRemaining - countdown) > 2) {
      setCountdown(rateLimit.cooldownRemaining);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateLimit.cooldownRemaining]);

  // Decrement countdown every second
  const isCountdownActive = countdown > 0;
  useEffect(() => {
    if (!isCountdownActive) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountdownActive]);

  const dailyPercentage = getDailyLimitPercentage(rateLimit);
  const isNearLimit = dailyPercentage >= 80;
  const isAtLimit = rateLimit.reason === 'daily_limit_reached';
  const isOnCooldown = rateLimit.reason === 'cooldown';

  // Compact inline version
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        {isOnCooldown && countdown > 0 && (
          <span className="text-amber-600 font-medium">
            ⏳ {formatCooldown(countdown)}
          </span>
        )}
        <span className={cn(
          'text-text-secondary',
          isNearLimit && 'text-amber-600',
          isAtLimit && 'text-rose-600'
        )}>
          {rateLimit.reportsRemaining}/{rateLimit.maxReportsToday} natitira
        </span>
      </div>
    );
  }

  // Full display version
  return (
    <div
      className={cn(
        'rounded-xl p-4 space-y-3',
        isAtLimit
          ? 'bg-rose-50 border border-rose-200'
          : isOnCooldown
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-slate-50 border border-slate-200',
        className
      )}
    >
      {/* Cooldown Timer */}
      {isOnCooldown && countdown > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 text-xl">
              timer
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Maghintay muna...
            </p>
            <p className="text-2xl font-bold text-amber-600 font-mono">
              {formatCooldown(countdown)}
            </p>
          </div>
        </div>
      )}

      {/* Daily Limit Reached */}
      {isAtLimit && (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-rose-600 text-xl">
              block
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-800">
              Na-reach mo na ang limit mo ngayong araw
            </p>
            <p className="text-xs text-rose-600">
              Mag-reset sa 12:00 AM
            </p>
          </div>
        </div>
      )}

      {/* Daily Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Reports Ngayong Araw</span>
          <span
            className={cn(
              'font-semibold',
              isAtLimit
                ? 'text-rose-600'
                : isNearLimit
                ? 'text-amber-600'
                : 'text-text-primary'
            )}
          >
            {rateLimit.reportsToday} / {rateLimit.maxReportsToday}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isAtLimit
                ? 'bg-rose-500'
                : isNearLimit
                ? 'bg-amber-500'
                : 'bg-primary'
            )}
            style={{ width: `${Math.min(100, dailyPercentage)}%` }}
          />
        </div>

        {/* Remaining Message */}
        {!isAtLimit && (
          <p className="text-xs text-text-secondary">
            {rateLimit.reportsRemaining > 10
              ? `May ${rateLimit.reportsRemaining} pang reports ka ngayong araw`
              : `${rateLimit.reportsRemaining} na lang ang pwede mong i-report ngayong araw`}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// BLOCKING OVERLAY
// =============================================================================

interface RateLimitBlockerProps {
  rateLimit: RateLimitStatus;
  onClose?: () => void;
}

/**
 * Full-screen blocker when rate limited
 */
export function RateLimitBlocker({ rateLimit, onClose }: RateLimitBlockerProps) {
  // Initialize countdown from prop
  const [countdown, setCountdown] = useState(() => rateLimit.cooldownRemaining);

  // Sync countdown when prop changes (from server refresh)
  useEffect(() => {
    if (Math.abs(rateLimit.cooldownRemaining - countdown) > 2) {
      setCountdown(rateLimit.cooldownRemaining);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateLimit.cooldownRemaining]);

  // Handle close when countdown reaches 0
  useEffect(() => {
    if (countdown <= 0 && rateLimit.cooldownRemaining <= 0) {
      onClose?.();
    }
  }, [countdown, rateLimit.cooldownRemaining, onClose]);

  // Decrement countdown every second
  const isBlockerCountdownActive = countdown > 0;
  useEffect(() => {
    if (!isBlockerCountdownActive) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlockerCountdownActive]);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      {/* Animated Timer Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-amber-600 text-4xl animate-pulse">
            hourglass_top
          </span>
        </div>
        {/* Circular Progress */}
        <svg
          className="absolute inset-0 w-20 h-20 -rotate-90"
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-amber-200"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-amber-500"
            strokeDasharray={226}
            strokeDashoffset={226 * (1 - countdown / 30)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
      </div>

      {/* Countdown */}
      <div>
        <p className="text-4xl font-bold font-mono text-amber-600">
          {formatCooldown(countdown)}
        </p>
        <p className="text-sm text-text-secondary mt-2">
          Sandali lang, para maiwasan ang spam
        </p>
      </div>

      {/* Bayanihan Message */}
      <p className="text-xs text-text-tertiary max-w-xs">
        Salamat sa pagtutulungan! Ang cooldown ay tumutulong panatilihing
        tama ang mga reports.
      </p>
    </div>
  );
}
