import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { DifficultyBadge } from '../ui/DifficultyBadge';
import { StatItem } from '../ui/StatItem';
import { ElevationChart } from './ElevationChart';
import { formatDistance, formatElevation, formatTime } from '../../utils/formatters';
import { gpxUrl } from '../../services/gpxLoader';
import type { TrailRoute } from '../../types';

const COLORS: Record<string, string> = {
  easy: '#22c55e',
  moderate: '#f59e0b',
  hard: '#f97316',
  expert: '#ef4444',
};

export function RouteDetail() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const tracks = useAppStore((s) => s.tracks);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setSidebarMode = useAppStore((s) => s.setSidebarMode);

  const route = routes.find((r) => r.id === selectedRouteId);
  if (!route) return null;
  const trackCoords = tracks[route.id];

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
            <ElevationChart
              data={route.elevationProfile}
              color={color}
              trackCoords={trackCoords}
            />
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

        <ActionButtons route={route} />

        <div className="text-xs text-gray-500 pb-2 truncate">{route.gpxFileName}</div>
      </div>
    </motion.div>
  );
}

function navigateUrl(lat: number, lng: number): string {
  // Cross-platform — Google Maps directions URL works on iOS, Android and desktop
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

function shareableUrl(routeId: string): string {
  const { origin, pathname, hash } = window.location;
  const [path, queryStr = ''] = (hash || '#/').slice(1).split('?');
  const params = new URLSearchParams(queryStr);
  params.set('r', routeId);
  return `${origin}${pathname}#${path}?${params.toString()}`;
}

function ActionButtons({ route }: { route: TrailRoute }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = shareableUrl(route.id);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: route.name, url });
        return;
      } catch {
        // user cancelled or platform blocked — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={navigateUrl(route.startPoint.lat, route.startPoint.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-accent text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-accent-muted transition-colors"
          aria-label="Open driving directions to start"
        >
          <span>📍</span>
          <span>Navigate</span>
        </a>
        <button
          onClick={handleShare}
          className={`flex items-center justify-center gap-1.5 text-sm font-semibold rounded-xl py-2.5 transition-colors ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-surface-raised hover:bg-surface-overlay text-white border border-surface-overlay'
          }`}
          aria-label="Copy share link"
        >
          <span>{copied ? '✓' : '🔗'}</span>
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {route.source === 'public' ? (
        <a
          href={gpxUrl(route.gpxFileName)}
          download={route.gpxFileName}
          className="flex items-center justify-center gap-2 w-full bg-surface-raised hover:bg-surface-overlay text-white text-sm font-medium rounded-xl py-2.5 transition-colors border border-surface-overlay"
        >
          <span>⬇</span>
          <span>Download GPX</span>
        </a>
      ) : (
        <div className="text-xs text-yellow-500 text-center bg-yellow-500/10 rounded-lg px-3 py-2">
          ● Unpublished — export to make this route downloadable
        </div>
      )}
    </div>
  );
}
