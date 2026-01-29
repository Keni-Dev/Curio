/**
 * StreakCounter Component
 *
 * Displays the user's current contribution streak with fire emoji
 * and milestone celebrations at 7, 30, and 100 days.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface StreakCounterProps {
  /** Number of consecutive days */
  days: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show milestone badge */
  showMilestone?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const MILESTONES = [7, 30, 100, 365] as const;

const sizeClasses = {
  sm: {
    container: 'text-xs gap-1',
    icon: 'text-base',
    milestone: 'text-[10px] px-1.5 py-0.5',
  },
  md: {
    container: 'text-sm gap-1.5',
    icon: 'text-lg',
    milestone: 'text-xs px-2 py-0.5',
  },
  lg: {
    container: 'text-base gap-2',
    icon: 'text-xl',
    milestone: 'text-sm px-2.5 py-1',
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function getMilestoneInfo(days: number): {
  isMilestone: boolean;
  currentMilestone: number | null;
  nextMilestone: number | null;
  daysToNext: number | null;
} {
  const isMilestone = MILESTONES.includes(days as (typeof MILESTONES)[number]);
  
  let currentMilestone: number | null = null;
  let nextMilestone: number | null = null;

  for (const milestone of MILESTONES) {
    if (days >= milestone) {
      currentMilestone = milestone;
    } else if (nextMilestone === null) {
      nextMilestone = milestone;
    }
  }

  const daysToNext = nextMilestone ? nextMilestone - days : null;

  return { isMilestone, currentMilestone, nextMilestone, daysToNext };
}

function getStreakEmoji(days: number): string {
  if (days === 0) return '💨';
  if (days >= 100) return '🔥';
  if (days >= 30) return '🔥';
  if (days >= 7) return '🔥';
  return '🔥';
}

function getStreakColor(days: number): string {
  if (days === 0) return 'text-slate-400 dark:text-slate-500';
  if (days >= 100) return 'text-purple-600 dark:text-purple-400';
  if (days >= 30) return 'text-amber-600 dark:text-amber-400';
  if (days >= 7) return 'text-orange-500 dark:text-orange-400';
  return 'text-orange-400 dark:text-orange-300';
}

function getMilestoneLabel(days: number): string | null {
  if (days === 7) return 'Week Warrior!';
  if (days === 30) return 'Monthly Master!';
  if (days === 100) return 'Century Legend!';
  if (days === 365) return 'Year Champion!';
  return null;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StreakCounter({
  days,
  size = 'md',
  showMilestone = true,
  className,
}: StreakCounterProps) {
  const classes = sizeClasses[size];
  const { isMilestone, nextMilestone, daysToNext } = getMilestoneInfo(days);
  const isActive = days > 0;
  const milestoneLabel = getMilestoneLabel(days);

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'inline-flex items-center font-semibold',
          classes.container,
          getStreakColor(days)
        )}
      >
        <span
          className={cn(
            classes.icon,
            isActive && isMilestone && 'animate-bounce-gentle'
          )}
        >
          {getStreakEmoji(days)}
        </span>
        <span>
          {days} day{days !== 1 ? 's' : ''} streak
        </span>
      </div>

      {/* Milestone badge */}
      {showMilestone && isMilestone && milestoneLabel && (
        <span
          className={cn(
            'rounded-full font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white',
            'animate-pulse-subtle shadow-sm shadow-amber-500/30',
            classes.milestone
          )}
        >
          {milestoneLabel}
        </span>
      )}

      {/* Days to next milestone hint */}
      {showMilestone && !isMilestone && daysToNext && daysToNext <= 3 && isActive && (
        <span className="text-xs text-text-muted">
          {daysToNext} day{daysToNext !== 1 ? 's' : ''} to {nextMilestone}-day milestone!
        </span>
      )}
    </div>
  );
}

// =============================================================================
// INLINE VARIANT
// =============================================================================

interface StreakCounterInlineProps {
  days: number;
  className?: string;
}

export function StreakCounterInline({ days, className }: StreakCounterInlineProps) {
  const isActive = days > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium',
        isActive ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400',
        className
      )}
    >
      <span>{isActive ? '🔥' : '💨'}</span>
      <span>{days}</span>
    </span>
  );
}

export default StreakCounter;
