import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { DifficultyBadge } from '../ui/DifficultyBadge';
import { formatDistance, formatElevation, formatTime } from '../../utils/formatters';
import type { TrailRoute } from '../../types';

interface Props {
  route: TrailRoute;
}

export function RouteCard({ route }: Props) {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const hoveredRouteId = useAppStore((s) => s.hoveredRouteId);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const hoverRoute = useAppStore((s) => s.hoverRoute);

  const isSelected = selectedRouteId === route.id;
  const isHovered = hoveredRouteId === route.id;

  return (
    <motion.button
      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
        isSelected
          ? 'bg-surface-overlay border-accent/50'
          : isHovered
          ? 'bg-surface-overlay border-surface-overlay'
          : 'bg-surface-raised border-transparent hover:bg-surface-overlay'
      }`}
      onClick={() => selectRoute(route.id)}
      onMouseEnter={() => hoverRoute(route.id)}
      onMouseLeave={() => hoverRoute(null)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.12 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-white leading-snug">{route.name}</span>
        <DifficultyBadge difficulty={route.difficulty} />
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>📍 {route.region || 'Unknown'}</span>
        <span>📏 {formatDistance(route.metrics.distanceKm)}</span>
        <span>⬆ {formatElevation(route.metrics.elevationGainM)}</span>
        <span>⏱ {formatTime(route.metrics.estimatedTimeMin)}</span>
      </div>
    </motion.button>
  );
}
