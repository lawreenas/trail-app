import { CircleMarker } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import { MAP_COLORS } from '../../utils/mapColors';

/**
 * "You are here" indicator that mirrors the elevation-chart hover position.
 * Subscribes to chartHoverPoint + mapTheme so it picks up theme-tuned accents.
 */
export function ChartHoverMarker() {
  const point = useAppStore((s) => s.chartHoverPoint);
  const mapTheme = useAppStore((s) => s.mapTheme);
  if (!point) return null;
  const [lng, lat] = point;
  const accent = MAP_COLORS[mapTheme].chartHover;
  // Inner-ring stroke colour: dark on light tiles, light on dark tiles.
  const innerStroke = mapTheme === 'light' || mapTheme === 'terrain' ? '#ffffff' : '#0d0d0e';

  return (
    <>
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{
          color: accent,
          weight: 1.5,
          fillColor: accent,
          fillOpacity: 0.18,
          interactive: false,
        }}
        interactive={false}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={5}
        pathOptions={{
          color: innerStroke,
          weight: 2,
          fillColor: accent,
          fillOpacity: 1,
          interactive: false,
        }}
        interactive={false}
      />
    </>
  );
}
