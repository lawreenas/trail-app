import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { DifficultyBadge } from '../ui/DifficultyBadge';
import { StatItem } from '../ui/StatItem';
import { ElevationChart } from './ElevationChart';
import { formatDistance, formatElevation, formatTime } from '../../utils/formatters';

const COLORS: Record<string, string> = {
  easy: '#22c55e',
  moderate: '#f59e0b',
  hard: '#f97316',
  expert: '#ef4444',
};

export function RouteDetail() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setSidebarMode = useAppStore((s) => s.setSidebarMode);

  const route = routes.find((r) => r.id === selectedRouteId);
  if (!route) return null;

  const color = COLORS[route.difficulty];

  const handleBack = () => {
    selectRoute(null);
    setSidebarMode('list');
  };

  return (
    <motion.div
      className="flex flex-col h-full overflow-hidden"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-overlay shrink-0">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-lg hover:bg-surface-overlay transition-colors text-gray-400 hover:text-white"
          aria-label="Back to list"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-white truncate flex-1">{route.name}</span>
        <DifficultyBadge difficulty={route.difficulty} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {route.region && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>📍</span> {route.region}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 bg-surface-raised rounded-xl p-3">
          <StatItem icon="📏" label="Distance" value={formatDistance(route.metrics.distanceKm)} />
          <StatItem icon="⬆" label="Gain" value={formatElevation(route.metrics.elevationGainM)} />
          <StatItem icon="⏱" label="Est. time" value={formatTime(route.metrics.estimatedTimeMin)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-raised rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Max elevation</div>
            <div className="text-sm font-semibold text-white">{formatElevation(route.metrics.elevationMaxM)}</div>
          </div>
          <div className="bg-surface-raised rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Descent</div>
            <div className="text-sm font-semibold text-white">{formatElevation(route.metrics.elevationLossM)}</div>
          </div>
        </div>

        {route.elevationProfile.length > 0 && (
          <div className="bg-surface-raised rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">Elevation profile</div>
            <ElevationChart data={route.elevationProfile} color={color} />
          </div>
        )}

        {route.description && (
          <div className="bg-surface-raised rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-2">Description</div>
            <p className="text-sm text-gray-200 leading-relaxed">{route.description}</p>
          </div>
        )}

        {route.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {route.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-surface-overlay text-gray-300 rounded-full border border-surface-overlay"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 pb-2">
          File: {route.gpxFileName}
          {route.source === 'local' && (
            <span className="ml-2 text-yellow-500">● Unpublished</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
