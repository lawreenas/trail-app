import { memo } from 'react';
import { Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDistance, formatElevation, formatDurationShort } from '../../utils/formatters';
import { ROUTE_TYPE_LABEL, tagColor } from '../../utils/routeMeta';
import { MAP_COLORS } from '../../utils/mapColors';
import { DifficultyPill } from '../ui/DifficultyPill';
import { Sparkline } from '../ui/Sparkline';
import type { TrailRoute } from '../../types';

interface Props {
  route: TrailRoute;
}

function RouteCardImpl({ route }: Props) {
  const isSelected = useAppStore((s) => s.selectedRouteId === route.id);
  const isHovered = useAppStore((s) => s.hoveredRouteId === route.id);
  const isFavorite = useAppStore((s) => s.favorites.has(route.id));
  const selectRoute = useAppStore((s) => s.selectRoute);
  const hoverRoute = useAppStore((s) => s.hoverRoute);
  const tagLibrary = useAppStore((s) => s.tagLibrary);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const accent = useAppStore((s) => MAP_COLORS[s.mapTheme].trackSelected);

  const highlighted = isSelected || isHovered;
  const { distanceKm, elevationGainM, estimatedTimeMin } = route.metrics;

  return (
    <li>
      <div
        onClick={() => selectRoute(route.id)}
        onMouseEnter={() => hoverRoute(route.id)}
        onMouseLeave={() => hoverRoute(null)}
        role="button"
        tabIndex={0}
        aria-current={isSelected || undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectRoute(route.id);
          }
        }}
        className={`group relative mx-2 px-3 py-3 rounded-xl cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isSelected ? 'bg-white/[0.07]' : isHovered ? 'bg-white/[0.04]' : 'hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-white truncate leading-snug">
                {route.name}
              </h3>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(route.id); }}
                className={`shrink-0 -my-1 p-1 rounded-md transition ${
                  isFavorite
                    ? 'text-primary'
                    : 'text-gray-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-white'
                }`}
                aria-label={isFavorite ? 'Remove from saved' : 'Save route'}
                aria-pressed={isFavorite}
              >
                <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.25} />
              </button>
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[13px] text-gray-400 tabular-nums whitespace-nowrap">
              <DifficultyPill difficulty={route.difficulty} />
              <span className="text-gray-200 font-medium">{formatDistance(distanceKm)}</span>
              <Dot />
              <span>↑ {formatElevation(elevationGainM)}</span>
              {estimatedTimeMin > 0 && (
                <>
                  <Dot />
                  <span>{formatDurationShort(estimatedTimeMin)}</span>
                </>
              )}
            </div>

            {(route.tags.length > 0 || route.type) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                {route.type && <span>{ROUTE_TYPE_LABEL[route.type]}</span>}
                {route.tags.map((name) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tagColor(name, tagLibrary) }} />
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <Sparkline
              data={route.elevationProfile}
              color={highlighted ? accent : '#71717a'}
              fillOpacity={highlighted ? 0.2 : 0.12}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function Dot() {
  return <span className="text-gray-700" aria-hidden="true">·</span>;
}

export const RouteCard = memo(RouteCardImpl);
