import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import { loadRouteGeometry } from '../../services/gpxLoader';

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
  const [geometry, setGeometry] = useState<GeoJSON.Feature | null>(null);

  useEffect(() => {
    if (!route) {
      setGeometry(null);
      return;
    }
    // Local admin uploads embed the geometry directly
    if (route.geoJson) {
      setGeometry(route.geoJson);
      return;
    }
    // Public routes lazy-load from /gpx/<filename>
    let cancelled = false;
    setGeometry(null);
    loadRouteGeometry(route.gpxFileName)
      .then((feature) => { if (!cancelled) setGeometry(feature); })
      .catch((err) => { console.error('Failed to load GPX', err); });
    return () => { cancelled = true; };
  }, [route?.id, route?.gpxFileName, route?.geoJson]);

  if (!route || !geometry) return null;

  return (
    <GeoJSON
      key={route.id}
      data={geometry}
      style={{
        color: COLORS[route.difficulty],
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}
