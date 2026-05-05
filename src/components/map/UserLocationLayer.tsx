import { useEffect } from 'react';
import { Circle, CircleMarker, useMap } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';

export function UserLocationLayer() {
  const userLocation = useAppStore((s) => s.userLocation);
  const map = useMap();

  // Center on the user's location when it's first set or refreshed.
  useEffect(() => {
    if (!userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 13), {
      duration: 0.6,
    });
  }, [userLocation, map]);

  if (!userLocation) return null;

  return (
    <>
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={userLocation.accuracy}
        pathOptions={{
          color: '#3b82f6',
          weight: 1,
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          interactive: false,
        }}
      />
      <CircleMarker
        center={[userLocation.lat, userLocation.lng]}
        radius={6}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          interactive: false,
        }}
      />
    </>
  );
}
