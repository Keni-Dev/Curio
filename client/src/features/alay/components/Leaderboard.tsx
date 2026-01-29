/**
 * Leaderboard Component
 *
 * Displays top contributors with their Alay Points, levels, and ranks.
 * Shows podium for top 3 and list for remaining entries.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/user';
import { LevelBadgeCompact } from './LevelBadge';

// =============================================================================
// TYPES
// =============================================================================

interface LeaderboardProps {
  /** List of leaderboard entries */
  entries: LeaderboardEntry[];
  /** Current user's ID (to highlight their entry) */
  currentUserId?: string;
  /** Show podium view for top 3 */
  showPodium?: boolean;
  /** Maximum entries to display */
  maxEntries?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const rankColors: Record<number, { bg: string; text: string; border: string }> = {
  1: {
    bg: 'bg-gradient-to-br from-amber-400 to-amber-500',
    text: 'text-amber-900',
    border: 'border-amber-300',
  },
  2: {
    bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
    text: 'text-slate-800',
    border: 'border-slate-200',
  },
  3: {
    bg: 'bg-gradient-to-br from-amber-600 to-amber-700',
    text: 'text-amber-100',
    border: 'border-amber-500',
  },
};

const podiumHeights = {
  1: 'h-28',
  2: 'h-20',
  3: 'h-16',
};

// =============================================================================
// COMPONENTS
// =============================================================================

function RankBadge({ rank }: { rank: number }) {
  const colors = rankColors[rank] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center size-8 rounded-full font-bold text-sm border-2',
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
    </div>
  );
}

function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];
  
  // Need exactly 3 entries for podium
  if (!first || !second || !third) return null;
  
  const podiumOrder = [second, first, third];

  return (
    <div className="flex items-end justify-center gap-2 mb-6">
      {podiumOrder.map((entry, index) => {
        const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3;
        const height = podiumHeights[actualRank as keyof typeof podiumHeights];
        const colors = rankColors[actualRank] ?? { bg: 'bg-surface-tertiary', border: 'border-text-tertiary' };

        return (
          <div key={entry.userId} className="flex flex-col items-center">
            {/* Avatar */}
            <div
              className={cn(
                'relative mb-2 transition-transform hover:scale-105',
                actualRank === 1 && 'animate-pulse-subtle'
              )}
            >
              <div
                className={cn(
                  'size-16 rounded-full bg-cover bg-center border-4',
                  colors.border
                )}
                style={{
                  backgroundImage: entry.avatarUrl
                    ? `url(${entry.avatarUrl})`
                    : `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId})`,
                }}
              />
              {actualRank === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
                  👑
                </span>
              )}
            </div>

            {/* Name */}
            <p className="text-sm font-bold text-text-primary dark:text-white text-center truncate max-w-[80px]">
              {entry.displayName}
            </p>

            {/* Points */}
            <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mb-2">
              {entry.alayPoints.toLocaleString()} pts
            </p>

            {/* Podium block */}
            <div
              className={cn(
                'w-24 rounded-t-xl flex items-center justify-center',
                height,
                colors.bg
              )}
            >
              <span className="text-2xl font-bold">{actualRank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-colors',
        isCurrentUser
          ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30'
          : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800'
      )}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Avatar */}
      <div
        className="size-12 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shadow-sm"
        style={{
          backgroundImage: entry.avatarUrl
            ? `url(${entry.avatarUrl})`
            : `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId})`,
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-text-primary dark:text-white truncate">
            {entry.displayName}
          </p>
          {isCurrentUser && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              You
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <LevelBadgeCompact level={entry.level} />
          <span className="text-xs text-text-secondary">
            {entry.contributionCount} reports
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
          {entry.alayPoints.toLocaleString()}
        </p>
        <p className="text-xs text-text-muted">points</p>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
        >
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function Leaderboard({
  entries,
  currentUserId,
  showPodium = true,
  maxEntries = 10,
  isLoading = false,
  className,
}: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className={cn('', className)}>
        <LeaderboardSkeleton />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <span className="text-4xl mb-4 block">🏆</span>
        <p className="text-text-secondary">No leaderboard data yet</p>
        <p className="text-sm text-text-muted mt-1">
          Be the first to contribute!
        </p>
      </div>
    );
  }

  const displayEntries = entries.slice(0, maxEntries);
  const topThree = showPodium ? displayEntries.slice(0, 3) : [];
  const restEntries = showPodium ? displayEntries.slice(3) : displayEntries;

  return (
    <div className={cn('', className)}>
      {/* Podium */}
      {showPodium && topThree.length >= 3 && (
        <LeaderboardPodium entries={topThree} />
      )}

      {/* List */}
      <div className="space-y-2">
        {restEntries.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUserId}
          />
        ))}
      </div>

      {/* Current user not in top entries */}
      {currentUserId && !displayEntries.find((e) => e.userId === currentUserId) && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-text-muted text-center mb-2">
            Your position
          </p>
          {/* Would need to fetch current user's rank */}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT LEADERBOARD
// =============================================================================

interface LeaderboardCompactProps {
  entries: LeaderboardEntry[];
  maxEntries?: number;
  className?: string;
}

export function LeaderboardCompact({
  entries,
  maxEntries = 5,
  className,
}: LeaderboardCompactProps) {
  const displayEntries = entries.slice(0, maxEntries);

  return (
    <div className={cn('space-y-2', className)}>
      {displayEntries.map((entry) => (
        <div
          key={entry.userId}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="text-sm font-bold text-text-secondary w-6 text-center">
            {entry.rank <= 3
              ? entry.rank === 1
                ? '🥇'
                : entry.rank === 2
                ? '🥈'
                : '🥉'
              : entry.rank}
          </span>
          <div
            className="size-8 rounded-full bg-cover bg-center"
            style={{
              backgroundImage: entry.avatarUrl
                ? `url(${entry.avatarUrl})`
                : `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId})`,
            }}
          />
          <span className="flex-1 text-sm font-medium truncate">
            {entry.displayName}
          </span>
          <span className="text-sm font-mono text-amber-600">
            {entry.alayPoints.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;
