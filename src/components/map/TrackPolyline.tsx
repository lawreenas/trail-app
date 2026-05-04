import { memo, useMemo, useRef, useEffect } from 'react';
import { Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useAppStore } from '../../store/useAppStore';
import type { Difficulty, LngLat } from '../../types';

const COLORS: Record<Difficulty, string> = {
  easy: '#22c55e',
  moderate: '#f59e0b',
  hard: '#f97316',
  expert: '#ef4444',
};

interface Props {
  routeId: string;
  difficulty: Difficulty;
  coords: LngLat[];
}

function TrackPolylineImpl({ routeId, difficulty, coords }: Props) {
  // Each polyline subscribes only to its own hover/selected state — other store
  // changes don't re-render or restyle this polyline. Critical for smoothness.
  const isHovered = useAppStore((s) => s.hoveredRouteId === routeId);
  const isSelected = useAppStore((s) => s.selectedRouteId === routeId);
  const hover = useAppStore((s) => s.hoverRoute);
  const select = useAppStore((s) => s.selectRoute);

  const positions = useMemo<LatLngExpression[]>(
    () => coords.map(([lng, lat]) => [lat, lng]),
    [coords]
  );

  const polylineRef = useRef<L.Polyline | null>(null);
  const isActive = isHovered || isSelected;

  // Imperatively update style when hover/selected changes — avoids re-creating
  // the layer (faster + no flicker) and bypasses any react-leaflet diff cost.
  useEffect(() => {
    const layer = polylineRef.current;
    if (!layer) return;
    layer.setStyle({
      color: COLORS[difficulty],
      weight: isActive ? 5 : 3,
      opacity: isActive ? 1 : 0.6,
    });
    if (isActive) layer.bringToFront();
  }, [isActive, difficulty]);

  const eventHandlers = useMemo(() => ({
    mouseover: () => hover(routeId),
    mouseout: () => hover(null),
    click: () => select(routeId),
  }), [routeId, hover, select]);

  return (
    <Polyline
      ref={polylineRef}
      positions={positions}
      pathOptions={{
        color: COLORS[difficulty],
        weight: isActive ? 5 : 3,
        opacity: isActive ? 1 : 0.6,
        lineCap: 'round',
        lineJoin: 'round',
        // Enlarged invisible hit area for forgiving hover detection
        // (offset between visible stroke and hover-target stroke)
        bubblingMouseEvents: false,
      }}
      eventHandlers={eventHandlers}
      interactive={true}
    />
  );
}

export const TrackPolyline = memo(TrackPolylineImpl);
