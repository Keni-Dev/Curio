/**
 * LevelBadge Component
 *
 * Displays user's current Alay level with optional progress indicator.
 * Levels: Baguhan → Scout → Champion → Legend
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { cn } from '@/lib/utils';
import type { UserLevel } from '@/types/user';
import { LEVEL_THRESHOLDS } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

interface LevelBadgeProps {
  /** Current user level */
  level: UserLevel;
  /** Current total points */
  points: number;
  /** Badge size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show progress bar to next level */
  showProgress?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

interface LevelConfig {
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  nextLevel: UserLevel | null;
  nextThreshold: number | null;
}

const levelConfig: Record<UserLevel, LevelConfig> = {
  Baguhan: {
    emoji: '🌱',
    label: 'Baguhan',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    glowColor: 'shadow-emerald-500/20',
    nextLevel: 'Scout',
    nextThreshold: LEVEL_THRESHOLDS.Scout,
  },
  Scout: {
    emoji: '🔍',
    label: 'Scout',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    glowColor: 'shadow-blue-500/20',
    nextLevel: 'Champion',
    nextThreshold: LEVEL_THRESHOLDS.Champion,
  },
  Champion: {
    emoji: '🏆',
    label: 'Champion',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    glowColor: 'shadow-amber-500/20',
    nextLevel: 'Legend',
    nextThreshold: LEVEL_THRESHOLDS.Legend,
  },
  Legend: {
    emoji: '⭐',
    label: 'Legend',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-gradient-to-r from-purple-100 to-amber-100 dark:from-purple-900/40 dark:to-amber-900/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    glowColor: 'shadow-purple-500/30',
    nextLevel: null,
    nextThreshold: null,
  },
};

const sizeClasses = {
  sm: {
    badge: 'px-2.5 py-1 text-xs gap-1',
    emoji: 'text-sm',
    progress: 'h-1 mt-1.5',
    progressLabel: 'text-[10px] mt-1',
  },
  md: {
    badge: 'px-3 py-1.5 text-sm gap-1.5',
    emoji: 'text-base',
    progress: 'h-1.5 mt-2',
    progressLabel: 'text-xs mt-1',
  },
  lg: {
    badge: 'px-4 py-2 text-base gap-2',
    emoji: 'text-lg',
    progress: 'h-2 mt-2.5',
    progressLabel: 'text-sm mt-1.5',
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function getLevelIndex(level: UserLevel): number {
  const levels: UserLevel[] = ['Baguhan', 'Scout', 'Champion', 'Legend'];
  return levels.indexOf(level);
}

function getProgressToNextLevel(level: UserLevel, points: number): number {
  const config = levelConfig[level];
  if (!config.nextThreshold) return 100;

  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = config.nextThreshold;
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return Math.min(Math.max(progress, 0), 100);
}

function getPointsToNextLevel(level: UserLevel, points: number): number {
  const config = levelConfig[level];
  if (!config.nextThreshold) return 0;
  return Math.max(config.nextThreshold - points, 0);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LevelBadge({
  level,
  points,
  size = 'md',
  showProgress = false,
  className,
}: LevelBadgeProps) {
  const config = levelConfig[level];
  const classes = sizeClasses[size];
  const progress = getProgressToNextLevel(level, points);
  const pointsToNext = getPointsToNextLevel(level, points);

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      {/* Badge */}
      <span
        className={cn(
          'inline-flex items-center rounded-full font-semibold border',
          'transition-all duration-300 hover:scale-105',
          config.bgColor,
          config.color,
          config.borderColor,
          classes.badge,
          level === 'Legend' && 'shadow-lg animate-pulse-subtle'
        )}
      >
        <span className={classes.emoji}>{config.emoji}</span>
        <span>{config.label}</span>
        {level === 'Legend' && (
          <span className="ml-1 text-amber-500">✦</span>
        )}
      </span>

      {/* Progress bar */}
      {showProgress && config.nextThreshold && (
        <div className="w-full max-w-[140px]">
          <div
            className={cn(
              'w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
              classes.progress
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                'bg-gradient-to-r from-primary to-primary-light'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p
            className={cn(
              'text-text-secondary dark:text-slate-400 text-center',
              classes.progressLabel
            )}
          >
            {pointsToNext} points to {config.nextLevel}
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT VARIANT
// =============================================================================

interface LevelBadgeCompactProps {
  level: UserLevel;
  className?: string;
}

export function LevelBadgeCompact({ level, className }: LevelBadgeCompactProps) {
  const config = levelConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>Level {getLevelIndex(level) + 1}</span>
    </span>
  );
}

export default LevelBadge;
