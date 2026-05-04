import { CircleMarker } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';

/**
 * "You are here" indicator that mirrors the elevation-chart hover position.
 * Subscribes only to chartHoverPoint, so it only re-renders when that changes.
 */
export function ChartHoverMarker() {
  const point = useAppStore((s) => s.chartHoverPoint);
  if (!point) return null;
  const [lng, lat] = point;
  return (
    <>
      {/* Outer halo */}
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{
          color: '#ff6b35',
          weight: 2,
          fillColor: '#ff6b35',
          fillOpacity: 0.15,
          interactive: false,
        }}
        interactive={false}
      />
      {/* Inner dot */}
      <CircleMarker
        center={[lat, lng]}
        radius={6}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          fillColor: '#ff6b35',
          fillOpacity: 1,
          interactive: false,
        }}
        interactive={false}
      />
    </>
  );
}
