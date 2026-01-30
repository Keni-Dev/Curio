/**
 * Pharmacy Result Card Component
 *
 * Enhanced pharmacy card for search results displaying:
 * - Pharmacy logo/name
 * - Stock status badge
 * - Address and distance
 * - Last updated timestamp
 * - Price per unit
 * - Navigate CTA button
 */

import { cn } from '~lib/utils';
import { StockBadge } from '~components/ui/Badge';
import { Button } from '~components/ui/Button';
import type { StockStatus } from '~types/database';

// =============================================================================
// TYPES
// =============================================================================

interface PharmacyResultCardProps {
  id: string;
  name: string;
  slug: string;
  address: string;
  distanceMeters: number;
  stockStatus: StockStatus;
  price: number | null;
  lastReportedAt: string | null;
  isVerified?: boolean;
  is24Hours?: boolean;
  chainName?: string | null;
  logoUrl?: string | null;
  isBestMatch?: boolean;
  onNavigate?: () => void;
  onCardClick?: () => void;
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'No reports yet';

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `Updated ${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Updated yesterday';
  return `Updated ${diffDays}d ago`;
}

function formatPrice(price: number | null): string {
  if (price === null) return '--.--';
  return `₱${price.toFixed(2)}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PharmacyResultCard({
  name,
  slug,
  address,
  distanceMeters,
  stockStatus,
  price,
  lastReportedAt,
  isVerified,
  is24Hours,
  chainName,
  logoUrl,
  isBestMatch = false,
  onNavigate,
  onCardClick,
  className,
}: PharmacyResultCardProps) {
  const isOutOfStock = stockStatus === 'out_of_stock';
  const displayName = chainName || name;

  const handleNavigate = () => {
    if (isOutOfStock || !onNavigate) return;

    // Open Google Maps navigation
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    onNavigate?.();
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      // Navigate to pharmacy detail page
      window.location.href = `/pharmacy/${slug}`;
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 border shadow-card',
        'flex flex-col sm:flex-row gap-4 sm:items-center relative group',
        'transition-all duration-200',
        isBestMatch
          ? 'bg-primary/5 border-primary/20 hover:shadow-glow'
          : 'bg-white/90 backdrop-blur-md border-slate-100 hover:shadow-md',
        isOutOfStock && 'opacity-60 hover:opacity-100',
        className
      )}
    >
      {/* Best Match Badge */}
      {isBestMatch && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
          Best Match
        </div>
      )}

      {/* Logo/Icon */}
      <button
        type="button"
        onClick={handleCardClick}
        className={cn(
          'w-16 h-16 rounded-xl shrink-0 flex items-center justify-center overflow-hidden p-2',
          'transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
          isBestMatch
            ? 'bg-white border border-primary/10'
            : 'bg-slate-50 border border-slate-100',
          isOutOfStock && 'grayscale'
        )}
        aria-label={`View ${name} details`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div
            className={cn(
              'font-bold text-center leading-none text-xs',
              isBestMatch ? 'text-primary' : 'text-text-secondary'
            )}
          >
            {displayName
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')}
          </div>
        )}
      </button>

      {/* Info Section */}
      <div
        className={cn('flex-1 min-w-0', isOutOfStock && 'grayscale')}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      >
        {/* Name and Badge */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-lg font-bold text-text-primary truncate">
            {name}
          </h3>
          <StockBadge status={stockStatus} showIcon={false} />
          {isVerified && (
            <span
              className="text-primary text-sm"
              title="Verified Pharmacy"
              aria-label="Verified pharmacy"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                verified
              </span>
            </span>
          )}
          {is24Hours && (
            <span
              className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
              title="Open 24 Hours"
            >
              24H
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-text-secondary mb-2 truncate">{address}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              near_me
            </span>
            {formatDistance(distanceMeters)}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              schedule
            </span>
            {formatTimeAgo(lastReportedAt)}
          </span>
        </div>
      </div>

      {/* Price and CTA Section */}
      <div
        className={cn(
          'flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-1',
          'mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto',
          isOutOfStock && 'grayscale'
        )}
      >
        {/* Price */}
        <div className="text-right">
          <span
            className={cn(
              'block text-2xl font-bold font-mono',
              isOutOfStock ? 'text-text-muted' : 'text-text-primary'
            )}
          >
            {formatPrice(price)}
          </span>
          <span className="block text-[10px] text-text-muted uppercase font-bold">
            {isOutOfStock ? 'Unavailable' : 'Per Unit'}
          </span>
        </div>

        {/* Navigate Button */}
        <Button
          variant={isOutOfStock ? 'secondary' : 'accent'}
          size="sm"
          disabled={isOutOfStock}
          onClick={handleNavigate}
          className={cn(
            'w-full sm:w-auto min-w-[100px]',
            isOutOfStock && 'cursor-not-allowed'
          )}
          aria-label={`Navigate to ${name}`}
        >
          <span>Navigate</span>
          {!isOutOfStock && (
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              navigation
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PharmacyResultCard;
