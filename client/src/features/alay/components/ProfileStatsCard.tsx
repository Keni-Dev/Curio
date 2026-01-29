/**
 * ProfileStatsCard Component
 *
 * Dashboard card displaying user's Alay Points, level, streak,
 * and contribution statistics with Bayanihan spirit theming.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { cn } from '@/lib/utils';
import type { UserLevel } from '@/types/user';
import { LevelBadge } from './LevelBadge';
import { StreakCounter } from './StreakCounter';
import { LEVEL_THRESHOLDS } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

interface ProfileStatsCardProps {
  /** Current Alay Points */
  points: number;
  /** Current user level */
  level: UserLevel;
  /** Current streak days */
  streakDays: number;
  /** Total contribution count */
  contributionCount: number;
  /** Helpful votes received */
  helpfulVotes?: number;
  /** User's rank (e.g., "Top 5%") */
  rank?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getPointsToNextLevel(level: UserLevel, points: number): number {
  const levels: UserLevel[] = ['Baguhan', 'Scout', 'Champion', 'Legend'];
  const currentIndex = levels.indexOf(level);
  
  if (currentIndex >= levels.length - 1) return 0;
  
  const nextLevel = levels[currentIndex + 1];
  if (!nextLevel) return 0;
  return Math.max(LEVEL_THRESHOLDS[nextLevel] - points, 0);
}

function getLevelProgress(level: UserLevel, points: number): number {
  const levels: UserLevel[] = ['Baguhan', 'Scout', 'Champion', 'Legend'];
  const currentIndex = levels.indexOf(level);
  
  if (currentIndex >= levels.length - 1) return 100;
  
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextLevel = levels[currentIndex + 1];
  if (!nextLevel) return 100;
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  
  return Math.min(
    ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
    100
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProfileStatsCard({
  points,
  level,
  streakDays,
  contributionCount,
  helpfulVotes = 0,
  rank,
  className,
}: ProfileStatsCardProps) {
  const progress = getLevelProgress(level, points);
  const pointsToNext = getPointsToNextLevel(level, points);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Alay Points Card - Dark themed */}
      <div className="relative bg-slate-900 dark:bg-[#081211] rounded-2xl p-6 shadow-card overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary font-medium text-sm mb-1 uppercase tracking-wider">
                Available Balance
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-tight">
                  {points.toLocaleString()}
                </h2>
                <div className="bg-amber-500/20 p-2 rounded-full border border-amber-500/50 animate-pulse">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">
                    monetization_on
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2 font-mono">Alay Points</p>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="flex flex-col gap-3">
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-1">
              <div
                className="bg-gradient-to-r from-primary to-amber-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {pointsToNext > 0
                ? `${pointsToNext} points to next level`
                : '🎉 Maximum level reached!'}
            </p>
            <button className="w-full mt-2 py-3 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group">
              <span>Redeem Rewards</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contributions */}
        <StatCard
          icon="edit_note"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          label="Contributions"
          value={contributionCount}
        />

        {/* Helpful Votes */}
        <StatCard
          icon="thumb_up"
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          label="Helpful Votes"
          value={helpfulVotes}
        />

        {/* Streak */}
        <StatCard
          icon="local_fire_department"
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          label="Day Streak"
          value={streakDays}
          highlight={streakDays >= 7}
        />

        {/* Rank */}
        <StatCard
          icon="leaderboard"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          label="Rank"
          value={rank || 'N/A'}
        />
      </div>
    </div>
  );
}

// =============================================================================
// STAT CARD
// =============================================================================

interface StatCardProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: number | string;
  highlight?: boolean;
}

function StatCard({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm',
        'border border-transparent hover:border-primary/20 transition-colors'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
          iconBgColor,
          iconColor
        )}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p
        className={cn(
          'text-2xl font-bold font-mono mt-1',
          'text-text-primary dark:text-white',
          highlight && 'text-orange-500 dark:text-orange-400'
        )}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

// =============================================================================
// COMPACT VARIANT
// =============================================================================

interface ProfileStatsCompactProps {
  points: number;
  level: UserLevel;
  streakDays: number;
  className?: string;
}

export function ProfileStatsCompact({
  points,
  level,
  streakDays,
  className,
}: ProfileStatsCompactProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800',
        className
      )}
    >
      <LevelBadge level={level} points={points} size="sm" />
      <div className="flex-1">
        <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
          {points.toLocaleString()} pts
        </p>
      </div>
      <StreakCounter days={streakDays} size="sm" showMilestone={false} />
    </div>
  );
}

export default ProfileStatsCard;
