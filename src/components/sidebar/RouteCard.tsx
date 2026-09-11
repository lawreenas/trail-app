import { Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDistance, formatElevation } from '../../utils/formatters';
import {
  ROUTE_TYPE_ICON,
  ROUTE_TYPE_LABEL,
  effectiveRouteType,
  elevationColor,
  tagColor,
} from '../../utils/routeMeta';
import type { TrailRoute } from '../../types';

interface Props {
  route: TrailRoute;
}

/** Thin separator between stats on the meta line. */
function Dot() {
  return <span className="text-gray-600" aria-hidden>·</span>;
}

export function RouteCard({ route }: Props) {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const hoveredRouteId = useAppStore((s) => s.hoveredRouteId);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const hoverRoute = useAppStore((s) => s.hoverRoute);
  const tagLibrary = useAppStore((s) => s.tagLibrary);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const isSelected = selectedRouteId === route.id;
  const isHovered = hoveredRouteId === route.id;
  const isFavorite = favorites.has(route.id);

  const TypeIcon = ROUTE_TYPE_ICON[effectiveRouteType(route.type)];

  return (
    <div
      onClick={() => selectRoute(route.id)}
      onMouseEnter={() => hoverRoute(route.id)}
      onMouseLeave={() => hoverRoute(null)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') selectRoute(route.id); }}
      className={`group relative w-full text-left px-5 py-3 border-b border-white/[0.04] transition-colors cursor-pointer ${
        isSelected
          ? 'bg-primary/[0.06]'
          : isHovered
          ? 'bg-white/[0.03]'
          : 'hover:bg-white/[0.02]'
      }`}
    >
      {isSelected && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
      )}

      {/* Line 1 — the hero: elevation-hued accent dot + route name (+ type icon),
          with favorite pinned right */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: elevationColor(route.metrics.elevationGainM) }}
            title={`↑ ${formatElevation(route.metrics.elevationGainM)} gain`}
            aria-hidden="true"
          />
          <h3 className="text-[15px] font-semibold text-white truncate leading-snug">
            {route.name}
          </h3>
          {route.type && (
            <TypeIcon
              size={11}
              strokeWidth={2}
              className="text-gray-500 shrink-0"
              aria-label={ROUTE_TYPE_LABEL[route.type]}
            />
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(route.id); }}
          className={`shrink-0 p-1.5 -m-1.5 rounded transition-colors ${
            isFavorite ? 'text-primary' : 'text-gray-600 hover:text-white'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </div>

      {/* Line 2 — secondary meta: the key stats, one line, muted but readable. */}
      <div className="mt-1 flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[12px] leading-snug">
        <span className="font-medium text-gray-200 tabular-nums">
          {formatDistance(route.metrics.distanceKm)}
        </span>
        <Dot />
        <span className="font-medium text-gray-200 tabular-nums">
          <span className="text-gray-500 mr-0.5">↑</span>
          {formatElevation(route.metrics.elevationGainM)}
        </span>
      </div>

      {/* Line 3 — quietest: tags when present, else fall back to the route type
          so a row is never metadata-bare. */}
      {route.tags.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-gray-500">
          {route.tags.map((name) => (
            <span key={name} className="inline-flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: tagColor(name, tagLibrary) }}
              />
              {name}
            </span>
          ))}
        </div>
      ) : (
        route.type && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500">
            <TypeIcon size={10} strokeWidth={2} className="shrink-0" />
            {ROUTE_TYPE_LABEL[route.type]}
          </div>
        )
      )}
    </div>
  );
}
