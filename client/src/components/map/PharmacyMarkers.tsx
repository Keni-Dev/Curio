/**
 * PharmacyMarkers Component
 *
 * Renders custom pharmacy markers on the map with stock-based colors.
 * Uses Leaflet divIcon for custom marker styling.
 */

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { PharmacyWithStock, StockStatus } from '~types/pharmacy';
import { formatDistance } from '~lib/utils';

// Helper to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return date.toLocaleDateString();
}

// =============================================================================
// TYPES
// =============================================================================

interface PharmacyMarkersProps {
  pharmacies: PharmacyWithStock[];
  selectedId: string | null;
  onMarkerClick?: (pharmacy: PharmacyWithStock) => void;
}

// =============================================================================
// MARKER COLORS
// =============================================================================

const MARKER_COLORS: Record<StockStatus, { bg: string; text: string; border: string }> = {
  in_stock: {
    bg: '#0F766E', // teal-700
    text: '#FFFFFF',
    border: '#FFFFFF',
  },
  low_stock: {
    bg: '#F59E0B', // amber-500
    text: '#FFFFFF',
    border: '#FFFFFF',
  },
  out_of_stock: {
    bg: '#F43F5E', // rose-500
    text: '#FFFFFF',
    border: '#FFFFFF',
  },
  unknown: {
    bg: '#9CA3AF', // gray-400
    text: '#FFFFFF',
    border: '#FFFFFF',
  },
};

const STOCK_ICONS: Record<StockStatus, string> = {
  in_stock: 'check_circle',
  low_stock: 'warning',
  out_of_stock: 'cancel',
  unknown: 'help',
};

const STOCK_LABELS: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  unknown: 'Unknown',
};

// =============================================================================
// MARKER ICON FACTORY
// =============================================================================

/**
 * Creates a custom Leaflet divIcon with stock-based styling
 */
function createPharmacyIcon(
  status: StockStatus,
  isSelected: boolean,
  showLabel: boolean = true
): L.DivIcon {
  const colors = MARKER_COLORS[status];
  const icon = STOCK_ICONS[status];
  const label = STOCK_LABELS[status];
  const scale = isSelected ? 'scale-110' : '';
  const shadow = isSelected ? 'shadow-xl' : 'shadow-lg';
  const zIndex = isSelected ? 'z-20' : 'z-10';

  const html = showLabel
    ? `
    <div class="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110 ${scale} ${zIndex} pharmacy-marker-container">
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full ${shadow} filter drop-shadow-md pharmacy-marker-pill"
           style="background-color: ${colors.bg}; color: ${colors.text};">
        <span class="material-symbols-outlined text-[18px]">${icon}</span>
        <span class="text-xs font-bold whitespace-nowrap">${label}</span>
      </div>
      <div class="w-1 h-3 rounded-full" style="background-color: ${colors.bg};"></div>
      <div class="w-2.5 h-2.5 rounded-full border-2" style="background-color: ${colors.bg}; border-color: ${colors.border};"></div>
    </div>
  `
    : `
    <div class="pharmacy-marker-dot ${scale}" style="background-color: ${colors.bg};">
      <div class="size-4 rounded-full border-2 ${shadow}" style="background-color: ${colors.bg}; border-color: ${colors.border};"></div>
    </div>
  `;

  return L.divIcon({
    className: 'pharmacy-marker',
    html,
    iconSize: showLabel ? [100, 60] : [16, 16],
    iconAnchor: showLabel ? [50, 60] : [8, 8],
    popupAnchor: showLabel ? [0, -60] : [0, -8],
  });
}

// =============================================================================
// POPUP CONTENT
// =============================================================================

interface PopupContentProps {
  pharmacy: PharmacyWithStock;
}

const PopupContent: React.FC<PopupContentProps> = ({ pharmacy }) => {
  const colors = MARKER_COLORS[pharmacy.stockStatus];
  const timeAgo = pharmacy.lastReportedAt
    ? formatTimeAgo(new Date(pharmacy.lastReportedAt))
    : 'No recent reports';

  return (
    <div className="min-w-[240px] p-1">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
          {pharmacy.logoUrl ? (
            <img
              src={pharmacy.logoUrl}
              alt={pharmacy.name}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg">💊</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-slate-800 truncate">
            {pharmacy.name}
          </h3>
          <p className="text-xs text-slate-500">
            {pharmacy.distance ? formatDistance(pharmacy.distance) : ''} •{' '}
            {pharmacy.is24Hours ? 'Open 24 Hours' : 'Varies'}
          </p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: `${colors.bg}20`, color: colors.bg }}
        >
          {STOCK_LABELS[pharmacy.stockStatus]}
        </span>
        {pharmacy.isVerified && (
          <span className="flex items-center gap-1 text-xs text-blue-600">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Verified
          </span>
        )}
      </div>

      {/* Last Update */}
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
        <span className="material-symbols-outlined text-[14px]">schedule</span>
        <span>Updated {timeAgo}</span>
      </div>

      {/* Address */}
      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
        {pharmacy.address}
      </p>

      {/* View Details Link */}
      <a
        href={`/pharmacy/${pharmacy.slug}`}
        className="mt-3 flex items-center justify-center gap-1 w-full py-2 px-3 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors"
      >
        View Details
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </a>
    </div>
  );
};

// =============================================================================
// PHARMACY MARKERS COMPONENT
// =============================================================================

const PharmacyMarkers: React.FC<PharmacyMarkersProps> = ({
  pharmacies,
  selectedId,
  onMarkerClick,
}) => {
  // Memoize markers to prevent unnecessary re-renders
  const markers = useMemo(() => {
    return pharmacies.map((pharmacy) => {
      const isSelected = pharmacy.id === selectedId;
      const icon = createPharmacyIcon(pharmacy.stockStatus, isSelected, true);

      return (
        <Marker
          key={pharmacy.id}
          position={[pharmacy.location.lat, pharmacy.location.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onMarkerClick?.(pharmacy),
          }}
          zIndexOffset={isSelected ? 1000 : 0}
        >
          <Popup className="pharmacy-popup" closeButton={false}>
            <PopupContent pharmacy={pharmacy} />
          </Popup>
        </Marker>
      );
    });
  }, [pharmacies, selectedId, onMarkerClick]);

  return <>{markers}</>;
};

export { PharmacyMarkers };
export default PharmacyMarkers;
