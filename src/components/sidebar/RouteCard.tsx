import { Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDistance, formatElevation } from '../../utils/formatters';
import {
  ROUTE_TYPE_ICON,
  ROUTE_TYPE_LABEL,
  effectiveRouteType,
  tagColor,
} from '../../utils/routeMeta';
import { DifficultyPill } from '../ui/DifficultyPill';
import type { TrailRoute } from '../../types';

interface Props {
  route: TrailRoute;
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
      className={`group relative w-full text-left px-5 py-4 border-b border-white/[0.04] transition-colors cursor-pointer ${
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

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-medium text-white truncate leading-tight">
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
          <div className="mt-1">
            <DifficultyPill difficulty={route.difficulty} />
          </div>
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

      <div className="flex items-baseline gap-5 text-base font-medium text-white tabular-nums font-display">
        <span>{formatDistance(route.metrics.distanceKm)}</span>
        <span>
          <span className="text-gray-500 font-normal mr-1.5 text-sm">↑</span>
          {formatElevation(route.metrics.elevationGainM)}
        </span>
      </div>

      {route.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
          {route.tags.map((name) => (
            <span key={name} className="inline-flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: tagColor(name, tagLibrary) }}
              />
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
