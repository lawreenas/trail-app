import { CircleMarker, Tooltip } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import type { TrailRoute } from '../../types';

const COLORS: Record<string, string> = {
  easy: '#22c55e',
  moderate: '#f59e0b',
  hard: '#f97316',
  expert: '#ef4444',
};

interface Props {
  route: TrailRoute;
}

export function StartMarker({ route }: Props) {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const hoveredRouteId = useAppStore((s) => s.hoveredRouteId);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const hoverRoute = useAppStore((s) => s.hoverRoute);

  const isSelected = selectedRouteId === route.id;
  const isHovered = hoveredRouteId === route.id;
  const color = COLORS[route.difficulty];
  const radius = isSelected || isHovered ? 11 : 8;

  return (
    <CircleMarker
      center={[route.startPoint.lat, route.startPoint.lng]}
      radius={radius}
      pathOptions={{
        color: '#ffffff',
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: isSelected || isHovered ? 1 : 0.85,
      }}
      eventHandlers={{
        click: () => selectRoute(route.id),
        mouseover: () => hoverRoute(route.id),
        mouseout: () => hoverRoute(null),
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
        <div className="text-xs font-medium">{route.name}</div>
      </Tooltip>
    </CircleMarker>
  );
}
