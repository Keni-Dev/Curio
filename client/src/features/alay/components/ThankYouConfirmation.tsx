/**
 * ThankYouConfirmation Component
 *
 * Success celebration screen after submitting a stock report.
 * Shows Bayanihan spirit messaging, points earned, and streak tracking.
 *
 * @see references/alay_stock_report_contribution/code.html
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ALAY_COPY, LEVEL_PROGRESS, ALAY_ANIMATIONS } from '../constants';
import type { UserLevel } from '@/types/user';

// =============================================================================
// TYPES
// =============================================================================

interface ThankYouConfirmationProps {
  /** Points earned from this report */
  pointsEarned: number;
  /** Bonus points breakdown */
  bonusPoints?: number;
  /** Current streak days */
  currentStreak: number;
  /** Total reports today */
  todayCount: number;
  /** Current user level */
  userLevel: UserLevel;
  /** Current total points */
  totalPoints: number;
  /** Whether report was queued offline */
  wasQueued?: boolean;
  /** Close handler */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getLevelProgress(level: UserLevel, points: number): number {
  const { min, max } = LEVEL_PROGRESS[level];
  if (max === Infinity) return 100;
  return Math.min(((points - min) / (max - min)) * 100, 100);
}

function getNextLevel(level: UserLevel): UserLevel | undefined {
  const levels: UserLevel[] = ['Baguhan', 'Scout', 'Champion', 'Legend'];
  const currentIndex = levels.indexOf(level);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined;
}

function getPointsToNextLevel(level: UserLevel, points: number): number {
  const nextLevel = getNextLevel(level);
  if (nextLevel === undefined) return 0;
  return LEVEL_PROGRESS[nextLevel].min - points;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ThankYouConfirmation({
  pointsEarned,
  bonusPoints = 0,
  currentStreak,
  todayCount,
  userLevel,
  totalPoints,
  wasQueued = false,
  onClose,
  className,
}: ThankYouConfirmationProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const progress = getLevelProgress(userLevel, totalPoints);
  const pointsToNext = getPointsToNextLevel(userLevel, totalPoints);
  const nextLevel = getNextLevel(userLevel);

  return (
    <div className={cn('w-full text-center', className)}>
      {/* Success Icon with Animation */}
      <div
        className={cn(
          'mx-auto mb-6 transition-all duration-500',
          showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        )}
      >
        <div className="relative inline-flex">
          {/* Outer glow */}
          <div className="absolute inset-0 size-24 rounded-full bg-primary/20 animate-ping" />
          
          {/* Inner circle */}
          <div className="relative size-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-white text-[48px] fill-1">
              celebration
            </span>
          </div>
        </div>
      </div>

      {/* Headline */}
      <h2
        className={cn(
          'text-2xl font-extrabold text-text-primary mb-2 transition-all duration-500 delay-100',
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {ALAY_COPY.successHeadline}
      </h2>

      {/* Subtext */}
      <p
        className={cn(
          'text-muted mb-6 transition-all duration-500 delay-200',
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {ALAY_COPY.successSubtext(todayCount)}
      </p>

      {/* Queued Banner (if offline) */}
      {wasQueued && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-2 justify-center text-amber-700 dark:text-amber-300">
            <span className="material-symbols-outlined text-[18px]">cloud_off</span>
            <span className="text-sm font-medium">{ALAY_COPY.offlineBanner}</span>
          </div>
        </div>
      )}

      {/* Points Card */}
      <div
        className={cn(
          'bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 mb-6 transition-all duration-500 delay-300',
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {/* Points Earned */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="material-symbols-outlined text-yellow-500 text-[28px] fill-1">
            stars
          </span>
          <span className="text-3xl font-extrabold text-primary font-mono">
            +{pointsEarned}
          </span>
          <span className="text-lg font-bold text-text-primary">
            Alay Points
          </span>
        </div>

        {/* Bonus Breakdown */}
        {bonusPoints > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted mb-4">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              +{bonusPoints} bonus
            </span>
            {currentStreak > 1 && (
              <span>from {currentStreak}-day streak</span>
            )}
          </div>
        )}

        {/* Streak Display */}
        {currentStreak > 0 && (
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 px-4 py-2 rounded-full">
            <span className="text-xl">🔥</span>
            <span className="font-bold">{ALAY_COPY.streakLabel(currentStreak)}</span>
          </div>
        )}
      </div>

      {/* Level Progress */}
      <div
        className={cn(
          'bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-6 transition-all duration-500 delay-400',
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Level {userLevel}
          </span>
          {nextLevel && (
            <span className="text-xs text-muted">
              {pointsToNext} pts to {nextLevel}
            </span>
          )}
        </div>

        {/* Progress Bar with Shimmer */}
        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full relative overflow-hidden transition-all duration-1000"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect - animated gradient sweep */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: `shimmer ${ALAY_ANIMATIONS.SHIMMER_DURATION}ms infinite`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        fullWidth
        size="lg"
        className={cn(
          'transition-all duration-500 delay-500',
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        Tapos na
      </Button>

      {/* Shimmer Keyframes - injected via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
}

export default ThankYouConfirmation;
