/**
 * SelectedPharmacySheet Component
 *
 * Bottom sheet that displays when a pharmacy marker is clicked on the map.
 * Shows pharmacy details with actions:
 * - Get directions (opens Google Maps)
 * - View full stock details
 * - Call pharmacy
 *
 * Integrates with useMapStore for selection state.
 */

import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button, StockBadge } from '@/components/ui';
import { useMapStore } from '@/stores/useMapStore';
import { useNearbyPharmacies } from './hooks/useNearbyPharmacies';
import { formatDistance, formatRelativeTime } from '@/lib/utils';

// =============================================================================
// COMPONENT
// =============================================================================

export function SelectedPharmacySheet() {
  const navigate = useNavigate();
  const { selectedPharmacyId, selectPharmacy } = useMapStore();
  const { pharmacies } = useNearbyPharmacies({
    center: { lat: 0, lng: 0 }, // Will use cached data
    enabled: false,
  });

  // Find the selected pharmacy from the cached list
  const selectedPharmacy = pharmacies?.find((p) => p.id === selectedPharmacyId);

  // Close handler
  const handleClose = () => {
    selectPharmacy(null);
  };

  // Navigate to pharmacy detail page
  const handleViewDetails = () => {
    if (selectedPharmacy) {
      navigate(`/pharmacy/${selectedPharmacy.slug}`);
    }
  };

  // Open Google Maps for directions
  const handleGetDirections = () => {
    if (selectedPharmacy) {
      const { lat, lng } = selectedPharmacy.location;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  // Call the pharmacy
  const handleCall = () => {
    if (selectedPharmacy?.phone) {
      window.location.href = `tel:${selectedPharmacy.phone}`;
    }
  };

  // Don't render if no pharmacy selected
  if (!selectedPharmacy) return null;

  return (
    <BottomSheet
      isOpen={!!selectedPharmacyId}
      onClose={handleClose}
      defaultSnap="half"
    >
      <div className="px-4 py-3">
        {/* Header: Logo + Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {selectedPharmacy.logoUrl ? (
              <img
                src={selectedPharmacy.logoUrl}
                alt={`${selectedPharmacy.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">
                {selectedPharmacy.chainName ? '🏪' : '💊'}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name + Verified */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-text-primary dark:text-white truncate">
                {selectedPharmacy.name}
              </h3>
              {selectedPharmacy.isVerified && (
                <span
                  className="material-symbols-outlined text-blue-500 flex-shrink-0"
                  style={{ fontSize: '20px' }}
                  title="Verified Pharmacy"
                >
                  verified
                </span>
              )}
            </div>

            {/* Address + Distance */}
            <p className="text-sm text-text-secondary dark:text-slate-400 line-clamp-2">
              {selectedPharmacy.address}
              {selectedPharmacy.distance !== undefined && (
                <>
                  <span className="mx-1.5">•</span>
                  <span className="font-medium text-primary">
                    {formatDistance(selectedPharmacy.distance)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Stock Status Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Stock Status
              </p>
              <StockBadge status={selectedPharmacy.stockStatus} />
            </div>

            {/* Freshness */}
            {selectedPharmacy.lastReportedAt && (
              <div className="text-right">
                <p className="text-xs text-text-muted">Last updated</p>
                <p className="text-sm font-medium text-text-secondary">
                  {formatRelativeTime(selectedPharmacy.lastReportedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {selectedPharmacy.is24Hours && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Open 24/7
            </span>
          )}
          {selectedPharmacy.isVerified && (
            <span className="inline-flex items-center gap-1.5 text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                verified
              </span>
              Verified Pharmacy
            </span>
          )}
          {selectedPharmacy.type === 'Generics' && (
            <span className="inline-flex items-center gap-1.5 text-sm text-accent bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
              💰 Generics Available
            </span>
          )}
        </div>

        {/* Contact Info */}
        {selectedPharmacy.phone && (
          <button
            onClick={handleCall}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-4"
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                call
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary dark:text-white">
                {selectedPharmacy.phone}
              </p>
              <p className="text-xs text-text-muted">Tap to call</p>
            </div>
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={handleGetDirections}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              near_me
            </span>
            Directions
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleViewDetails}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              visibility
            </span>
            View Stock
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
