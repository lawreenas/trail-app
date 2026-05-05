import { CircleMarker } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';

const PRIMARY = '#c4ff00';

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
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{
          color: PRIMARY,
          weight: 1.5,
          fillColor: PRIMARY,
          fillOpacity: 0.18,
          interactive: false,
        }}
        interactive={false}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={5}
        pathOptions={{
          color: '#0d0d0e',
          weight: 2,
          fillColor: PRIMARY,
          fillOpacity: 1,
          interactive: false,
        }}
        interactive={false}
      />
    </>
  );
}
