import { memo, useMemo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import type { TrailRoute } from '../../types';

const MARKER_COLOR = '#ff6b35'; // matches the unified track colour
const MARKER_RADIUS = 7;        // constant — no resize on hover

interface Props {
  route: TrailRoute;
}

function StartMarkerImpl({ route }: Props) {
  // Subscribe only to per-route booleans for minimal re-renders
  const isSelected = useAppStore((s) => s.selectedRouteId === route.id);
  const isHovered = useAppStore((s) => s.hoveredRouteId === route.id);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const hoverRoute = useAppStore((s) => s.hoverRoute);

  const isActive = isSelected || isHovered;

  const eventHandlers = useMemo(() => ({
    click: () => selectRoute(route.id),
    mouseover: () => hoverRoute(route.id),
    mouseout: () => hoverRoute(null),
  }), [route.id, selectRoute, hoverRoute]);

  return (
    <CircleMarker
      center={[route.startPoint.lat, route.startPoint.lng]}
      radius={MARKER_RADIUS}
      pathOptions={{
        color: '#0b0b0c',
        weight: isActive ? 2.5 : 1.5,
        fillColor: MARKER_COLOR,
        fillOpacity: 1,
      }}
      eventHandlers={eventHandlers}
    >
      <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
        <div className="text-xs font-medium">{route.name}</div>
      </Tooltip>
    </CircleMarker>
  );
}

export const StartMarker = memo(StartMarkerImpl);
