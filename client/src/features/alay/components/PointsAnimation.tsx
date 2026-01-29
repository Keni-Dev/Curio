/**
 * PointsAnimation Component
 *
 * Animated celebration overlay when user earns Alay Points.
 * Shows base points, first-of-day bonus, and streak bonuses with
 * Bayanihan spirit messaging.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface PointsAnimationProps {
  /** Base points earned */
  points: number;
  /** Whether this is the first report of the day */
  isFirstOfDay?: boolean;
  /** Bonus points from streak */
  streakBonus?: number;
  /** Current streak days */
  currentStreak?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PointsAnimation({
  points,
  isFirstOfDay = false,
  streakBonus = 0,
  currentStreak = 0,
  onComplete,
  className,
}: PointsAnimationProps) {
  const [stage, setStage] = useState<'entering' | 'showing' | 'bonus' | 'exiting'>('entering');
  const [isVisible, setIsVisible] = useState(true);

  const firstOfDayBonus = isFirstOfDay ? 5 : 0;
  const totalBonus = firstOfDayBonus + streakBonus;
  const totalPoints = points + totalBonus;

  const handleComplete = useCallback(() => {
    setStage('exiting');
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  }, [onComplete]);

  useEffect(() => {
    // Stage transitions
    const enterTimer = setTimeout(() => setStage('showing'), 100);
    const bonusTimer = setTimeout(() => {
      if (totalBonus > 0) {
        setStage('bonus');
      }
    }, 800);
    const exitTimer = setTimeout(handleComplete, 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(bonusTimer);
      clearTimeout(exitTimer);
    };
  }, [handleComplete, totalBonus]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto',
        className
      )}
      onClick={handleComplete}
      role="dialog"
      aria-label="Points earned animation"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          stage === 'entering' && 'opacity-0',
          stage === 'exiting' && 'opacity-0'
        )}
      />

      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating coins */}
        <div className="absolute top-1/4 left-1/4 animate-float-slow">
          <span className="text-4xl">🪙</span>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-medium">
          <span className="text-3xl">✨</span>
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float-fast">
          <span className="text-3xl">⭐</span>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float-slow delay-500">
          <span className="text-2xl">🎉</span>
        </div>
      </div>

      {/* Main card */}
      <div
        className={cn(
          'relative bg-white dark:bg-surface-dark rounded-3xl p-8 mx-4 max-w-sm w-full',
          'shadow-2xl shadow-primary/20 border border-white/50 dark:border-white/10',
          'transition-all duration-500',
          stage === 'entering' && 'scale-50 opacity-0',
          stage === 'showing' && 'scale-100 opacity-100',
          stage === 'bonus' && 'scale-100 opacity-100',
          stage === 'exiting' && 'scale-90 opacity-0'
        )}
      >
        {/* Decorative background glow */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative text-center">
          {/* Icon */}
          <div className="mb-4 animate-bounce-gentle">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30">
              <span className="material-symbols-outlined text-white !text-[48px]">
                monetization_on
              </span>
            </div>
          </div>

          {/* Headline */}
          <p className="text-body text-text-secondary dark:text-slate-400 mb-1">
            Salamat, Bayani!
          </p>

          {/* Base points */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl font-bold text-amber-500 font-mono tracking-tight animate-count-up">
              +{points}
            </span>
            <span className="text-2xl">🪙</span>
          </div>

          {/* Bonuses */}
          <div
            className={cn(
              'space-y-2 transition-all duration-500',
              stage === 'bonus' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            {isFirstOfDay && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                <span>🌅</span>
                <span>First Report Today: +{firstOfDayBonus} bonus!</span>
              </div>
            )}

            {streakBonus > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-sm font-medium">
                <span>🔥</span>
                <span>{currentStreak}-Day Streak: +{streakBonus} bonus!</span>
              </div>
            )}
          </div>

          {/* Total */}
          {totalBonus > 0 && (
            <div
              className={cn(
                'mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 transition-all duration-500 delay-200',
                stage === 'bonus' ? 'opacity-100' : 'opacity-0'
              )}
            >
              <p className="text-caption text-text-secondary dark:text-slate-400 mb-1">
                Total Earned
              </p>
              <p className="text-2xl font-bold text-primary dark:text-primary-light">
                +{totalPoints} Alay Points
              </p>
            </div>
          )}

          {/* Tap to dismiss hint */}
          <p className="mt-6 text-caption text-text-muted animate-pulse">
            Tap anywhere to continue
          </p>
        </div>
      </div>
    </div>
  );
}

export default PointsAnimation;
