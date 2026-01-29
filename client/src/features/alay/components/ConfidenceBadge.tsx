/**
 * ConfidenceBadge Component
 *
 * Visual indicator showing the reliability/confidence of a stock report.
 * Uses colors and icons to convey trust level.
 */

import { cn } from '@/lib/utils';
import {
  type ConfidenceLevel,
  getConfidenceColor,
  getConfidenceLabel,
  getConfidenceLabelFilipino,
} from '../lib/trustScore';

// =============================================================================
// TYPES
// =============================================================================

interface ConfidenceBadgeProps {
  /** Confidence level */
  level: ConfidenceLevel;
  /** Confidence score (0-1) for optional display */
  score?: number;
  /** Show score percentage */
  showScore?: boolean;
  /** Use Filipino labels */
  filipino?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<ConfidenceLevel, string> = {
  high: 'verified',
  medium: 'check_circle',
  low: 'help',
  unverified: 'question_mark',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ConfidenceBadge({
  level,
  score,
  showScore = false,
  filipino = true,
  size = 'md',
  className,
}: ConfidenceBadgeProps) {
  const colors = getConfidenceColor(level);
  const label = filipino ? getConfidenceLabelFilipino(level) : getConfidenceLabel(level);
  const icon = iconMap[level];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'text-[14px]',
    md: 'text-[16px]',
    lg: 'text-[20px]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('material-symbols-outlined', iconSizes[size])}>
        {icon}
      </span>
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75">({Math.round(score * 100)}%)</span>
      )}
    </div>
  );
}

// =============================================================================
// CONFIDENCE INDICATOR (BAR VERSION)
// =============================================================================

interface ConfidenceIndicatorProps {
  /** Confidence score (0-1) */
  score: number;
  /** Show label text */
  showLabel?: boolean;
  /** Use Filipino labels */
  filipino?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Horizontal bar indicator showing confidence level
 */
export function ConfidenceIndicator({
  score,
  showLabel = true,
  filipino = true,
  className,
}: ConfidenceIndicatorProps) {
  const level = getConfidenceLevelFromScore(score);
  const colors = getConfidenceColor(level);
  const label = filipino ? getConfidenceLabelFilipino(level) : getConfidenceLabel(level);

  const barColor = {
    high: 'bg-emerald-500',
    medium: 'bg-amber-500',
    low: 'bg-orange-500',
    unverified: 'bg-gray-400',
  }[level];

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className={colors.text}>{label}</span>
          <span className="text-text-secondary">{Math.round(score * 100)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// HELPER
// =============================================================================

function getConfidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  if (score >= 0.2) return 'low';
  return 'unverified';
}

// =============================================================================
// CONFIDENCE TOOLTIP
// =============================================================================

interface ConfidenceTooltipContentProps {
  factors: {
    distance: number;
    userTrust: number;
    votes: number;
    freshness: number;
  };
  filipino?: boolean;
}

/**
 * Content for tooltip showing confidence factor breakdown
 */
export function ConfidenceTooltipContent({
  factors,
  filipino = true,
}: ConfidenceTooltipContentProps) {
  const labels = filipino
    ? {
        distance: 'Layo sa pharmacy',
        userTrust: 'Trust ng reporter',
        votes: 'Community votes',
        freshness: 'Kailan nireport',
      }
    : {
        distance: 'Distance to pharmacy',
        userTrust: 'Reporter trust',
        votes: 'Community votes',
        freshness: 'Report freshness',
      };

  const factorItems = [
    { key: 'distance', label: labels.distance, value: factors.distance, weight: 30 },
    { key: 'userTrust', label: labels.userTrust, value: factors.userTrust, weight: 25 },
    { key: 'votes', label: labels.votes, value: factors.votes, weight: 25 },
    { key: 'freshness', label: labels.freshness, value: factors.freshness, weight: 20 },
  ];

  return (
    <div className="space-y-2 text-xs">
      <p className="font-semibold text-text-primary mb-2">
        {filipino ? 'Paano kinalkula' : 'Confidence breakdown'}
      </p>
      {factorItems.map(({ key, label, value, weight }) => (
        <div key={key} className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-between">
            <span className="text-text-secondary">{label}</span>
            <span className="font-medium">
              {Math.round(value * 100)}%
            </span>
          </div>
          <span className="text-text-tertiary w-8 text-right">×{weight}%</span>
        </div>
      ))}
    </div>
  );
}
