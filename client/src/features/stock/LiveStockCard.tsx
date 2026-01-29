/**
 * LiveStockCard Component
 *
 * Enhanced stock item card with real-time freshness indicator.
 * Shows visual freshness bar, helpful vote button, and auto-updates time.
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { StockIndicator } from './StockIndicator';
import { useVoteHelpful } from './hooks/useVoteHelpful';
import { useHasVoted } from '@/stores/useVotedStore';
import {
  calculateFreshness,
  getFreshnessLevel,
  getFreshnessText,
  getFreshnessBarColor,
  type FreshnessLevel,
} from '@/lib/freshness';
import type { MedicineStock } from './types';

// =============================================================================
// TYPES
// =============================================================================

interface LiveStockCardProps {
  item: MedicineStock;
  pharmacyId: string;
  onClick?: (item: MedicineStock) => void;
  onVoteSuccess?: () => void;
  className?: string;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface FreshnessBarProps {
  level: FreshnessLevel;
  score: number;
}

function FreshnessBar({ level, score }: FreshnessBarProps) {
  const barColor = getFreshnessBarColor(level);

  return (
    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl overflow-hidden bg-slate-100">
      <div
        className={cn('w-full transition-all duration-500', barColor)}
        style={{ height: `${score * 100}%` }}
      />
    </div>
  );
}

interface VoteButtonProps {
  reportId: string;
  pharmacyId: string;
  helpfulCount: number;
  isDisabled: boolean;
  onSuccess?: () => void;
}

function VoteButton({
  reportId,
  pharmacyId,
  helpfulCount,
  isDisabled,
  onSuccess,
}: VoteButtonProps) {
  const hasVoted = useHasVoted(reportId);
  const { vote, isVoting } = useVoteHelpful({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasVoted && !isVoting) {
        vote({ reportId, isHelpful: true, pharmacyId });
      }
    },
    [hasVoted, isVoting, vote, reportId, pharmacyId]
  );

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || hasVoted || isVoting}
      className={cn(
        'flex items-center gap-1 px-2.5 py-1.5 rounded-full',
        'text-xs font-medium transition-all duration-200',
        'min-h-[32px]', // Touch target
        hasVoted
          ? 'bg-emerald-100 text-emerald-700 cursor-default'
          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95',
        isVoting && 'opacity-50 cursor-wait',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={hasVoted ? 'Nakapag-vote na' : 'I-mark bilang nakatulong'}
    >
      <span className="material-symbols-outlined text-[16px]">
        {hasVoted ? 'check_circle' : 'thumb_up'}
      </span>
      <span>{helpfulCount}</span>
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function LiveStockCardComponent({
  item,
  pharmacyId,
  onClick,
  onVoteSuccess,
  className,
}: LiveStockCardProps) {
  // Freshness state - updates every minute
  const [freshnessScore, setFreshnessScore] = useState(() =>
    calculateFreshness(item.lastReportedAt)
  );
  const [freshnessLevel, setFreshnessLevel] = useState<FreshnessLevel>(() =>
    getFreshnessLevel(item.lastReportedAt)
  );
  const [freshnessText, setFreshnessText] = useState(() =>
    getFreshnessText(item.lastReportedAt)
  );

  // Auto-update freshness every minute
  useEffect(() => {
    const updateFreshness = () => {
      setFreshnessScore(calculateFreshness(item.lastReportedAt));
      setFreshnessLevel(getFreshnessLevel(item.lastReportedAt));
      setFreshnessText(getFreshnessText(item.lastReportedAt));
    };

    // Update immediately
    updateFreshness();

    // Then update every minute
    const interval = setInterval(updateFreshness, 60 * 1000);

    return () => clearInterval(interval);
  }, [item.lastReportedAt]);

  const handleClick = useCallback(() => {
    onClick?.(item);
  }, [onClick, item]);

  const isStale = freshnessLevel === 'stale';

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'relative w-full flex items-center gap-3 p-4 pl-5',
        'bg-white rounded-xl border border-slate-100',
        'transition-all duration-200',
        'hover:bg-slate-50 hover:border-slate-200',
        'active:scale-[0.99]',
        'min-h-[88px]', // Touch target
        'cursor-pointer',
        // Stale items have reduced opacity
        isStale && 'opacity-60',
        className
      )}
    >
      {/* Freshness Bar (left side) */}
      <FreshnessBar level={freshnessLevel} score={freshnessScore} />

      {/* Medicine Info */}
      <div className="flex-1 min-w-0">
        {/* Brand Name */}
        <h4 className="text-base font-semibold text-text-primary truncate">
          {item.brandName || item.medicineName}
        </h4>

        {/* Generic Name + Dosage */}
        <p className="text-sm text-text-secondary truncate">
          {item.genericName && (
            <span className="text-text-muted">{item.genericName}</span>
          )}
          {item.genericName && item.dosage && <span className="mx-1">•</span>}
          {item.dosage && <span>{item.dosage}</span>}
          {item.formulation && (
            <>
              <span className="mx-1">•</span>
              <span className="capitalize">{item.formulation}</span>
            </>
          )}
        </p>

        {/* Price + Freshness */}
        <div className="flex items-center gap-2 mt-1">
          {item.price && (
            <span className="text-sm font-semibold text-primary">
              {formatPrice(item.price)}
            </span>
          )}
          <span
            className={cn(
              'text-xs',
              freshnessLevel === 'fresh' && 'text-emerald-600',
              freshnessLevel === 'aging' && 'text-amber-600',
              freshnessLevel === 'stale' && 'text-rose-500'
            )}
          >
            {freshnessText}
          </span>
        </div>

        {/* Reporter (if available) */}
        {item.reportedBy && (
          <p className="text-xs text-text-muted mt-0.5 truncate">
            ni {item.reportedBy.displayName}
          </p>
        )}
      </div>

      {/* Right Side: Status + Vote */}
      <div className="flex flex-col items-end gap-2">
        <StockIndicator
          status={item.status}
          size="sm"
          showFreshness={false}
        />
        <VoteButton
          reportId={item.id}
          pharmacyId={pharmacyId}
          helpfulCount={item.verifiedCount || 0}
          isDisabled={isStale}
          onSuccess={onVoteSuccess}
        />
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders in list
export const LiveStockCard = memo(LiveStockCardComponent);

export default LiveStockCard;
