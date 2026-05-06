import { memo, useMemo, useRef, useEffect } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useAppStore } from '../../store/useAppStore';
import { formatDistance, formatElevation } from '../../utils/formatters';
import { MAP_COLORS } from '../../utils/mapColors';
import type { LngLat, TrailRoute } from '../../types';

interface Props {
  routeId: string;
  coords: LngLat[];
  route: TrailRoute;
}

function TrackPolylineImpl({ routeId, coords, route }: Props) {
  const isHovered = useAppStore((s) => s.hoveredRouteId === routeId);
  const isSelected = useAppStore((s) => s.selectedRouteId === routeId);
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const showAllTracks = useAppStore((s) => s.showAllTracks);
  const mapTheme = useAppStore((s) => s.mapTheme);
  const hover = useAppStore((s) => s.hoverRoute);
  const select = useAppStore((s) => s.selectRoute);

  const positions = useMemo<LatLngExpression[]>(
    () => coords.map(([lng, lat]) => [lat, lng]),
    [coords]
  );

  const polylineRef = useRef<L.Polyline | null>(null);
  const isActive = isHovered || isSelected;
  const hasSelection = selectedRouteId != null;

  useEffect(() => {
    if (isActive) polylineRef.current?.bringToFront();
  }, [isActive]);

  const eventHandlers = useMemo(() => ({
    mouseover: () => hover(routeId),
    mouseout: () => hover(null),
    click: () => select(routeId),
  }), [routeId, hover, select]);

  // When the "show all" toggle is off, only the selected track renders.
  if (!showAllTracks && !isSelected) {
    return null;
  }

  const palette = MAP_COLORS[mapTheme];
  const color = isSelected
    ? palette.trackSelected
    : isHovered
    ? palette.trackHovered
    : palette.trackDefault;
  const weight = isSelected ? 5 : isHovered ? 4 : 2.5;
  const opacity = isSelected ? 1 : isHovered ? 0.95 : hasSelection ? 0.2 : 0.5;

  return (
    <Polyline
      ref={polylineRef}
      positions={positions}
      pathOptions={{
        color,
        weight,
        opacity,
        lineCap: 'round',
        lineJoin: 'round',
      }}
      eventHandlers={eventHandlers}
      interactive={true}
    >
      {!isSelected && (
        <Tooltip sticky direction="top" opacity={1} className="!font-sans">
          <div className="space-y-0.5">
            <div className="font-semibold text-[13px] leading-tight">{route.name}</div>
            <div className="flex items-center gap-2 text-[11px] tabular-nums opacity-80">
              <span>{formatDistance(route.metrics.distanceKm)}</span>
              <span className="opacity-50">·</span>
              <span>↑ {formatElevation(route.metrics.elevationGainM)}</span>
            </div>
          </div>
        </Tooltip>
      )}
    </Polyline>
  );
}

export const TrackPolyline = memo(TrackPolylineImpl);
