/**
 * AchievementToast Component
 *
 * Animated toast notification when user unlocks a new achievement.
 * Auto-dismisses after a few seconds with swipe-to-dismiss support.
 *
 * @see references/user_profile_&_alay_dashboard/code.html
 */

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
}

interface AchievementToastProps {
  /** Achievement that was unlocked */
  achievement: Achievement;
  /** Callback when toast is dismissed */
  onClose: () => void;
  /** Auto-dismiss duration in ms (default: 5000) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const rarityConfig: Record<BadgeRarity, {
  gradient: string;
  glow: string;
  label: string;
}> = {
  common: {
    gradient: 'from-slate-500 to-slate-600',
    glow: 'shadow-slate-500/30',
    label: 'Common',
  },
  rare: {
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/40',
    label: 'Rare',
  },
  epic: {
    gradient: 'from-purple-500 to-purple-600',
    glow: 'shadow-purple-500/40',
    label: 'Epic',
  },
  legendary: {
    gradient: 'from-amber-400 via-amber-500 to-orange-500',
    glow: 'shadow-amber-500/50',
    label: 'Legendary',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function AchievementToast({
  achievement,
  onClose,
  duration = 5000,
  className,
}: AchievementToastProps) {
  const [stage, setStage] = useState<'entering' | 'showing' | 'exiting'>('entering');
  const [progress, setProgress] = useState(100);

  const config = rarityConfig[achievement.rarity];

  const handleClose = useCallback(() => {
    setStage('exiting');
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setStage('showing'), 50);

    // Progress bar countdown
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto-dismiss
    const dismissTimer = setTimeout(handleClose, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, [duration, handleClose]);

  return (
    <div
      className={cn(
        'fixed top-4 left-4 right-4 z-[200] transition-all duration-300',
        stage === 'entering' && 'opacity-0 -translate-y-4',
        stage === 'showing' && 'opacity-100 translate-y-0',
        stage === 'exiting' && 'opacity-0 -translate-y-4',
        className
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl shadow-2xl',
          'bg-gradient-to-r',
          config.gradient,
          config.glow,
          'max-w-md mx-auto'
        )}
        role="alert"
        aria-live="polite"
      >
        {/* Content */}
        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex-shrink-0 size-14 rounded-xl bg-white/20 backdrop-blur-sm',
              'flex items-center justify-center',
              achievement.rarity === 'legendary' && 'animate-pulse-subtle'
            )}
          >
            <span className="material-symbols-outlined text-white text-3xl">
              {achievement.icon}
            </span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                🏆 Achievement Unlocked!
              </span>
              {achievement.rarity === 'legendary' && (
                <span className="animate-spin-slow">✨</span>
              )}
            </div>
            <h3 className="text-white font-bold text-lg leading-tight truncate">
              {achievement.title}
            </h3>
            <p className="text-white/80 text-sm truncate">
              {achievement.description}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-white/80 text-xl">
              close
            </span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/60 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Sparkle effects for legendary */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-2 left-8 text-yellow-200 animate-float-fast opacity-60">✦</div>
            <div className="absolute top-4 right-16 text-yellow-200 animate-float-medium opacity-60">✦</div>
            <div className="absolute bottom-4 left-20 text-yellow-200 animate-float-slow opacity-60">✦</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export for use in context/store
export type { Achievement, AchievementToastProps };

export default AchievementToast;
