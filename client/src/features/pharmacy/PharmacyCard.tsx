/**
 * PharmacyCard Component
 *
 * Displays pharmacy information in a glass-morphism card with:
 * - Pharmacy name, chain, and address
 * - Distance badge
 * - Stock status indicator
 * - Verified/24-hours/generics badges
 * - Hover/tap animations
 *
 * @see DESIGN_SYSTEM.md - Pharmacy Card section
 */

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistance, formatRelativeTime } from '@/lib/utils';
import { StockBadge } from '@/components/ui';
import type { PharmacyWithStock } from '@/types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

interface PharmacyCardProps {
  /** Pharmacy data with stock information */
  pharmacy: PharmacyWithStock;
  /** Show distance from user location */
  showDistance?: boolean;
  /** Compact mode for lists */
  compact?: boolean;
  /** Click handler - if provided, card won't link to detail page */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPER: Generate accessible label for pharmacy card
// =============================================================================

function getAccessibleLabel(pharmacy: PharmacyWithStock, showDistance: boolean): string {
  const parts: string[] = [pharmacy.name];
  
  if (pharmacy.isVerified) {
    parts.push('verified pharmacy');
  }
  
  if (showDistance && pharmacy.distance !== undefined) {
    parts.push(`${formatDistance(pharmacy.distance)} away`);
  }
  
  // Stock status
  const stockLabels: Record<string, string> = {
    in_stock: 'medicine in stock',
    low_stock: 'low stock',
    out_of_stock: 'out of stock',
    unknown: 'stock status unknown',
  };
  parts.push(stockLabels[pharmacy.stockStatus] || 'stock status unknown');
  
  if (pharmacy.is24Hours) {
    parts.push('open 24 hours');
  }
  
  return parts.join(', ');
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PharmacyCard({
  pharmacy,
  showDistance = true,
  compact = false,
  onClick,
  className,
}: PharmacyCardProps) {
  const accessibleLabel = getAccessibleLabel(pharmacy, showDistance);
  
  const cardContent = (
    <article
      aria-label={accessibleLabel}
      className={cn(
        // Glass morphism effect from DESIGN_SYSTEM.md
        'bg-white/90 dark:bg-surface-dark/80',
        'backdrop-blur-md',
        'rounded-2xl shadow-card',
        'border border-white/50 dark:border-white/5',
        // Hover/tap animations
        'transition-all duration-200',
        'hover:bg-white dark:hover:bg-surface-dark',
        'hover:shadow-md hover:scale-[1.01]',
        'active:scale-[0.99]',
        'cursor-pointer group',
        // Padding
        compact ? 'p-3' : 'p-4',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex justify-between items-start gap-3">
        {/* Left: Logo + Info */}
        <div className="flex gap-3 min-w-0 flex-1">
          {/* Logo/Icon */}
          <div
            className={cn(
              'flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-800',
              'flex items-center justify-center overflow-hidden',
              compact ? 'size-10' : 'size-12'
            )}
            aria-hidden="true"
          >
            {pharmacy.logoUrl ? (
              <img
                src={pharmacy.logoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className={compact ? 'text-lg' : 'text-xl'}>
                {pharmacy.chainName ? '🏪' : '💊'}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            {/* Name with verified badge */}
            <div className="flex items-center gap-1.5">
              <h3
                className={cn(
                  'font-bold text-text-primary dark:text-white truncate',
                  'group-hover:text-primary transition-colors',
                  compact ? 'text-sm' : 'text-base'
                )}
              >
                {pharmacy.name}
              </h3>
              {pharmacy.isVerified && (
                <span
                  className="material-symbols-outlined text-blue-500 flex-shrink-0"
                  style={{ fontSize: compact ? '16px' : '18px' }}
                  aria-hidden="true"
                >
                  verified
                </span>
              )}
            </div>

            {/* Chain name if applicable */}
            {pharmacy.chainName && !compact && (
              <p className="text-xs text-text-muted truncate">
                {pharmacy.chainName}
              </p>
            )}

            {/* Distance + Hours */}
            <p
              className={cn(
                'text-text-secondary dark:text-slate-400 truncate',
                compact ? 'text-xs' : 'text-sm'
              )}
            >
              {showDistance && pharmacy.distance !== undefined && (
                <>
                  <span className="font-medium">
                    {formatDistance(pharmacy.distance)}
                  </span>
                  <span className="mx-1.5">•</span>
                </>
              )}
              {pharmacy.is24Hours ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Open 24 Hours
                </span>
              ) : (
                <span>
                  {pharmacy.address.split(',')[0]}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Stock Badge */}
        <div className="flex-shrink-0">
          <StockBadge status={pharmacy.stockStatus} showIcon={!compact} />
        </div>
      </div>

      {/* Bottom: Tags + Freshness */}
      {!compact && (
        <div className="mt-3 pl-15 flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {pharmacy.is24Hours && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
                24/7
              </span>
            )}
            {pharmacy.type === 'Generics' && (
              <span className="text-xs text-accent bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                <span aria-hidden="true">💰</span> Generics
              </span>
            )}
          </div>

          {/* Freshness indicator */}
          {pharmacy.lastReportedAt && (
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px' }}
                aria-hidden="true"
              >
                schedule
              </span>
              <span>Updated {formatRelativeTime(pharmacy.lastReportedAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Arrow indicator for non-compact */}
      {!compact && !onClick && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            chevron_right
          </span>
        </div>
      )}
    </article>
  );

  // Wrap in Link if not compact and no custom onClick
  if (!compact && !onClick) {
    return (
      <Link
        to={`/pharmacy/${pharmacy.slug}`}
        className="block relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
        aria-label={`View details for ${pharmacy.name}`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
