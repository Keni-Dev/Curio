/**
 * MapControls Component
 *
 * Floating control buttons for the map.
 * Includes zoom in/out, locate user, and layer toggle.
 * Uses glass panel styling from design system.
 */

import React, { useCallback } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { useMapStore } from '~stores/useMapStore';
import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface MapControlsProps {
  mapRef: React.RefObject<LeafletMap | null>;
}

// =============================================================================
// CONTROL BUTTON COMPONENT
// =============================================================================

interface ControlButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  isActive?: boolean;
  isLoading?: boolean;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  icon,
  label,
  isActive = false,
  isLoading = false,
  className,
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={cn(
      'size-12 rounded-full glass-panel shadow-glass',
      'flex items-center justify-center',
      'transition-all duration-200 touch-feedback',
      'hover:bg-white hover:shadow-lg',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      isActive && 'bg-primary text-white',
      className
    )}
    disabled={isLoading}
  >
    {isLoading ? (
      <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    ) : (
      <span
        className={cn(
          'material-symbols-outlined text-[22px]',
          isActive ? 'text-white' : 'text-slate-700'
        )}
      >
        {icon}
      </span>
    )}
  </button>
);

// =============================================================================
// MAP CONTROLS COMPONENT
// =============================================================================

const MapControls: React.FC<MapControlsProps> = ({ mapRef }) => {
  const {
    zoom,
    setZoom,
    centerOnUser,
    userLocation,
    isLocatingUser,
    resetViewport,
  } = useMapStore();

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    } else {
      setZoom(zoom + 1);
    }
  }, [mapRef, zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    } else {
      setZoom(zoom - 1);
    }
  }, [mapRef, zoom, setZoom]);

  const handleLocate = useCallback(() => {
    if (userLocation) {
      centerOnUser();
      if (mapRef.current) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 16, {
          animate: true,
        });
      }
    }
  }, [userLocation, centerOnUser, mapRef]);

  const handleReset = useCallback(() => {
    resetViewport();
    if (mapRef.current) {
      mapRef.current.setView([14.8527, 120.815], 14, { animate: true });
    }
  }, [resetViewport, mapRef]);

  return (
    <>
      {/* Desktop controls - right side */}
      <div className="absolute right-4 top-20 z-20 hidden md:flex flex-col gap-3 pointer-events-auto">
        <ControlButton
          onClick={handleLocate}
          icon="my_location"
          label="My Location"
          isActive={false}
          isLoading={isLocatingUser}
        />
        <ControlButton onClick={handleZoomIn} icon="add" label="Zoom In" />
        <ControlButton onClick={handleZoomOut} icon="remove" label="Zoom Out" />
        <ControlButton onClick={handleReset} icon="home" label="Reset View" />
      </div>

      {/* Mobile controls - bottom right, above bottom nav */}
      <div className="absolute right-4 bottom-24 z-20 flex md:hidden flex-col gap-2 pointer-events-auto">
        <ControlButton
          onClick={handleLocate}
          icon="my_location"
          label="My Location"
          isActive={false}
          isLoading={isLocatingUser}
        />
        <div className="flex flex-col gap-0.5 rounded-full glass-panel shadow-glass overflow-hidden">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="size-11 flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-700">
              add
            </span>
          </button>
          <div className="h-px bg-slate-200" />
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="size-11 flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-700">
              remove
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export { MapControls };
export default MapControls;
