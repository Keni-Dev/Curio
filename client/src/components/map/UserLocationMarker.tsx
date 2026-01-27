/**
 * UserLocationMarker Component
 *
 * Displays the user's current location on the map.
 * Shows a blue pulsing dot with accuracy circle.
 */

import React, { useEffect } from 'react';
import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '~hooks/useGeolocation';
import { useMapStore } from '~stores/useMapStore';

// =============================================================================
// MARKER ICON
// =============================================================================

/**
 * Creates a pulsing blue dot icon for user location
 */
function createUserLocationIcon(): L.DivIcon {
  const html = `
    <div class="user-location-marker">
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    </div>
  `;

  return L.divIcon({
    className: 'user-marker',
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const userIcon = createUserLocationIcon();

// =============================================================================
// USER LOCATION MARKER COMPONENT
// =============================================================================

const UserLocationMarker: React.FC = () => {
  const { coordinates, isLoading, error } = useGeolocation({
    watchPosition: true,
    enableHighAccuracy: true,
  });
  const { setUserLocation, setIsLocatingUser } = useMapStore();

  // Sync geolocation to store
  useEffect(() => {
    if (coordinates) {
      setUserLocation(coordinates);
    }
    setIsLocatingUser(isLoading);
  }, [coordinates, isLoading, setUserLocation, setIsLocatingUser]);

  // Don't render if no coordinates or error
  if (!coordinates || error) {
    return null;
  }

  return (
    <>
      {/* Accuracy circle */}
      <Circle
        center={[coordinates.lat, coordinates.lng]}
        radius={50} // Could be dynamic based on accuracy
        pathOptions={{
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 1,
        }}
      />

      {/* User location marker */}
      <Marker
        position={[coordinates.lat, coordinates.lng]}
        icon={userIcon}
        zIndexOffset={2000}
      />
    </>
  );
};

export { UserLocationMarker };
export default UserLocationMarker;
