import { GeoJSON } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';

const COLORS: Record<string, string> = {
  easy: '#22c55e',
  moderate: '#f59e0b',
  hard: '#f97316',
  expert: '#ef4444',
};

export function RouteLayer() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const route = routes.find((r) => r.id === selectedRouteId);

  if (!route) return null;

  const color = COLORS[route.difficulty];

  return (
    <GeoJSON
      key={route.id}
      data={route.geoJson}
      style={{
        color,
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}
