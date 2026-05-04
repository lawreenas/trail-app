import { useEffect, useMemo, useRef, useState } from 'react';
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
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!route) {
      setGeometry(null);
      return;
    }
    if (route.geoJson) {
      setGeometry(route.geoJson);
      return;
    }
    let cancelled = false;
    setGeometry(null);
    loadRouteGeometry(route.gpxFileName)
      .then((feature) => { if (!cancelled) setGeometry(feature); })
      .catch((err) => console.error('Failed to load GPX', err));
    return () => { cancelled = true; };
  }, [route?.id, route?.gpxFileName, route?.geoJson]);

  // Pop full-detail line above the simplified base track
  useEffect(() => {
    layerRef.current?.bringToFront();
  }, [geometry]);

  const style = useMemo(() => {
    if (!route) return undefined;
    return {
      color: COLORS[route.difficulty],
      weight: 5,
      opacity: 1,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
    };
  }, [route?.difficulty]);

  if (!route || !geometry) return null;

  return (
    <GeoJSON
      ref={layerRef}
      key={route.id}
      data={geometry}
      style={style}
    />
  );
}
