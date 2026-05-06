import { memo, useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../store/useAppStore';
import { effectiveRouteType, ROUTE_TYPE_LABEL } from '../../utils/routeMeta';
import { MAP_COLORS, type MapColors } from '../../utils/mapColors';
import { formatDistance, formatElevation } from '../../utils/formatters';
import type { TrailRoute } from '../../types';

interface Props {
  route: TrailRoute;
}

const SIZE_DEFAULT = 16;
const SIZE_SELECTED = 22;

/**
 * Build an SVG-based DivIcon. Hover changes the fill (matches the polyline's
 * hover color) but keeps the same size — only selection grows the marker and
 * adds a pulse ring.
 */
function buildIcon(
  type: string,
  isSelected: boolean,
  isHovered: boolean,
  colors: MapColors,
): L.DivIcon {
  const size = isSelected ? SIZE_SELECTED : SIZE_DEFAULT;
  const half = size / 2;
  const fill = isSelected || isHovered ? colors.markerSelected : colors.markerDefault;
  const stroke = colors.markerStroke;
  const strokeWidth = isSelected ? 1.8 : 1.2;

  const isTriangle = type === 'hill-repeats';
  const shape = isTriangle
    ? `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
         <polygon points="${half},2 ${size - 2},${size - 2} 2,${size - 2}"
                  fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
       </svg>`
    : `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
         <circle cx="${half}" cy="${half}" r="${half - 2}"
                 fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
       </svg>`;

  const pulse = isSelected
    ? `<span class="absolute inset-0 rounded-full" style="border:2px solid ${colors.pulseRing}; animation: pulse-ring 1.6s ease-out infinite;"></span>`
    : '';

  return L.divIcon({
    html: `<div class="relative" style="width:${size}px;height:${size}px;">${pulse}${shape}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

function StartMarkerImpl({ route }: Props) {
  const isSelected = useAppStore((s) => s.selectedRouteId === route.id);
  const isHovered = useAppStore((s) => s.hoveredRouteId === route.id);
  const mapTheme = useAppStore((s) => s.mapTheme);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const hoverRoute = useAppStore((s) => s.hoverRoute);

  const type = effectiveRouteType(route.type);
  const colors = MAP_COLORS[mapTheme];

  // Hover recolors the marker to match the polyline's hover accent (no resize).
  const icon = useMemo(
    () => buildIcon(type, isSelected, isHovered, colors),
    [type, isSelected, isHovered, colors],
  );

  const eventHandlers = useMemo(() => ({
    click: () => selectRoute(route.id),
    mouseover: () => hoverRoute(route.id),
    mouseout: () => hoverRoute(null),
  }), [route.id, selectRoute, hoverRoute]);

  return (
    <Marker
      position={[route.startPoint.lat, route.startPoint.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
      zIndexOffset={isSelected ? 1000 : isHovered ? 500 : 0}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
        <div className="space-y-1 min-w-[140px]">
          <div className="font-semibold text-[13px] leading-tight">{route.name}</div>
          <div className="flex items-center gap-2 text-[11px] tabular-nums opacity-80">
            <span>{formatDistance(route.metrics.distanceKm)}</span>
            <span className="opacity-50">·</span>
            <span>↑ {formatElevation(route.metrics.elevationGainM)}</span>
          </div>
          {route.type && (
            <div className="text-[10px] uppercase tracking-wider opacity-60">
              {ROUTE_TYPE_LABEL[route.type]}
            </div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}

export const StartMarker = memo(StartMarkerImpl);
