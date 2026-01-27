/**
 * MapView Component
 *
 * Main map container using react-leaflet.
 * Displays the map with pharmacy markers and user location.
 * Syncs viewport state with Zustand store.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { MAP_CONFIG } from '~lib/constants';
import { useMapStore } from '~stores/useMapStore';
import { PharmacyMarkers } from './PharmacyMarkers';
import { UserLocationMarker } from './UserLocationMarker';
import type { PharmacyWithStock } from '~types/pharmacy';

// =============================================================================
// TYPES
// =============================================================================

interface MapViewProps {
  pharmacies: PharmacyWithStock[];
  isLoading?: boolean;
  onPharmacyClick?: (pharmacy: PharmacyWithStock) => void;
}

// =============================================================================
// MAP SYNC COMPONENT
// =============================================================================

/**
 * Internal component to sync map events with Zustand store
 */
function MapEventHandler(): null {
  const map = useMap();
  const { setCenter, setZoom, center, zoom } = useMapStore();
  const isExternalUpdate = useRef(false);

  // Sync store changes to map
  useEffect(() => {
    isExternalUpdate.current = true;
    map.setView([center.lat, center.lng], zoom, { animate: true });
    // Small timeout to prevent immediate event feedback
    const timer = setTimeout(() => {
      isExternalUpdate.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  // Sync map events to store
  useMapEvents({
    moveend: () => {
      if (isExternalUpdate.current) return;
      const mapCenter = map.getCenter();
      setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
    },
    zoomend: () => {
      if (isExternalUpdate.current) return;
      setZoom(map.getZoom());
    },
  });

  return null;
}

// =============================================================================
// MAP VIEW COMPONENT
// =============================================================================

const MapView: React.FC<MapViewProps> = ({
  pharmacies,
  isLoading = false,
  onPharmacyClick,
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const { center, zoom, selectedPharmacyId, selectPharmacy } = useMapStore();

  const handlePharmacyClick = useCallback(
    (pharmacy: PharmacyWithStock) => {
      selectPharmacy(pharmacy.id);
      onPharmacyClick?.(pharmacy);
    },
    [selectPharmacy, onPharmacyClick]
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={zoom}
        minZoom={MAP_CONFIG.MIN_ZOOM}
        maxZoom={MAP_CONFIG.MAX_ZOOM}
        className="h-full w-full z-0"
        zoomControl={false}
        attributionControl={true}
      >
        {/* Tile Layer */}
        <TileLayer
          url={MAP_CONFIG.TILE_URL}
          attribution={MAP_CONFIG.TILE_ATTRIBUTION}
        />

        {/* Sync map with store */}
        <MapEventHandler />

        {/* Pharmacy markers */}
        <PharmacyMarkers
          pharmacies={pharmacies}
          selectedId={selectedPharmacyId}
          onMarkerClick={handlePharmacyClick}
        />

        {/* User location */}
        <UserLocationMarker />
      </MapContainer>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-text-secondary">
              Loading pharmacies...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
