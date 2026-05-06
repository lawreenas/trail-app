import { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Pencil,
  X,
  Ruler,
  TrendingUp,
  TrendingDown,
  Mountain,
  Share2,
  Navigation,
  Download,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ElevationChart } from './ElevationChart';
import { formatDistance, formatElevation } from '../../utils/formatters';
import {
  ROUTE_TYPE_LABEL,
  ROUTE_TYPE_ICON,
  effectiveRouteType,
  tagColor,
} from '../../utils/routeMeta';
import { MAP_COLORS } from '../../utils/mapColors';
import { DifficultyPill } from '../ui/DifficultyPill';
import { gpxUrl } from '../../services/gpxLoader';
import type { TrailRoute } from '../../types';

export function RouteDetail() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const tracks = useAppStore((s) => s.tracks);
  const tagLibrary = useAppStore((s) => s.tagLibrary);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isAdminAuthenticated = useAppStore((s) => s.isAdminAuthenticated);
  const mapTheme = useAppStore((s) => s.mapTheme);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setSidebarMode = useAppStore((s) => s.setSidebarMode);

  const route = routes.find((r) => r.id === selectedRouteId);
  if (!route) return null;
  const trackCoords = tracks[route.id];
  const isFavorite = favorites.has(route.id);
  const TypeIcon = ROUTE_TYPE_ICON[effectiveRouteType(route.type)];
  const accent = MAP_COLORS[mapTheme].trackSelected;

  const handleClose = () => {
    selectRoute(null);
    setSidebarMode('list');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-white/[0.06] shrink-0 bg-surface/95 backdrop-blur-sm">
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors rounded-md px-2.5 py-1.5"
          aria-label="Back to route list"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span className="font-medium">Routes</span>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => toggleFavorite(route.id)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
              isFavorite ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
          {isAdminAuthenticated && (
            <a
              href="#/admin"
              title="Edit in admin"
              aria-label="Edit in admin"
              className="flex items-center justify-center w-9 h-9 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <Pencil size={16} />
            </a>
          )}
          <button
            type="button"
            onClick={handleClose}
            title="Close"
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
        <header className="space-y-3">
          {route.type && (
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">
              <TypeIcon size={11} strokeWidth={2} />
              {ROUTE_TYPE_LABEL[route.type]}
            </div>
          )}
          <div className="flex items-start gap-3">
            <span
              className="mt-2 w-1 self-stretch rounded-full shrink-0"
              style={{ background: accent }}
              aria-hidden="true"
            />
            <h2 className="font-display text-[28px] leading-[1.1] font-semibold text-white tracking-tight flex-1">
              {route.name}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-gray-400">
            <DifficultyPill difficulty={route.difficulty} size="md" />
            {route.region && (
              <>
                <span className="text-gray-700" aria-hidden="true">·</span>
                <span className="text-[11px] uppercase tracking-wider font-medium">
                  {route.region}
                </span>
              </>
            )}
          </div>
          {route.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {route.tags.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 text-[11px] text-gray-300 bg-white/[0.04] border border-white/[0.06] rounded px-2 py-0.5"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: tagColor(name, tagLibrary) }}
                  />
                  {name}
                </span>
              ))}
            </div>
          )}
        </header>

        <section className="grid grid-cols-2 gap-x-4 gap-y-5 border-y border-white/[0.06] py-5">
          <Stat
            icon={Ruler}
            label="Distance"
            value={formatDistance(route.metrics.distanceKm)}
          />
          <Stat
            icon={TrendingUp}
            label="Elevation gain"
            value={formatElevation(route.metrics.elevationGainM)}
          />
          <Stat
            icon={TrendingDown}
            label="Descent"
            value={formatElevation(route.metrics.elevationLossM)}
          />
          <Stat
            icon={Mountain}
            label={route.terrain ? 'Terrain' : 'Max elevation'}
            value={route.terrain ?? formatElevation(route.metrics.elevationMaxM)}
          />
        </section>

        {route.elevationProfile.length > 0 && (
          <section>
            <SectionLabel>Elevation profile</SectionLabel>
            <ElevationChart
              data={route.elevationProfile}
              color={accent}
              trackCoords={trackCoords}
            />
          </section>
        )}

        <ActionButtons route={route} />

        {route.description && (
          <section>
            <SectionLabel>About</SectionLabel>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {route.description}
            </p>
          </section>
        )}

        <div className="text-[11px] font-mono text-gray-600 pt-2 truncate">
          {route.gpxFileName}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-400 shrink-0">
        <Icon size={13} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</div>
        <div className="font-display text-lg text-white mt-0.5 tabular-nums truncate">{value}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2.5">
      {children}
    </div>
  );
}

function navigateUrl(lat: number, lng: number): string {
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
        // user cancelled — fall through to clipboard
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
      <a
        href={navigateUrl(route.startPoint.lat, route.startPoint.lng)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground text-sm font-semibold rounded-md py-2.5 hover:bg-primary-hover transition-colors"
      >
        <Navigation size={14} strokeWidth={2.5} />
        Navigate to start
      </a>
      <div className="grid grid-cols-3 gap-2">
        <ActionGhost
          icon={copied ? Check : Share2}
          label={copied ? 'Copied' : 'Share'}
          onClick={handleShare}
        />
        {route.source === 'public' ? (
          <ActionGhost
            icon={Download}
            label="GPX"
            href={gpxUrl(route.gpxFileName)}
            download={route.gpxFileName}
          />
        ) : (
          <span
            className="flex items-center justify-center gap-1.5 text-[11px] text-amber-400/80 border border-amber-400/20 rounded-md py-2"
            title="Export and commit to publish"
          >
            Unpublished
          </span>
        )}
        {route.link ? (
          <ActionGhost
            icon={ExternalLink}
            label="Race info"
            href={route.link}
            target="_blank"
            rel="noopener noreferrer"
          />
        ) : (
          <ActionGhost icon={ExternalLink} label="Race info" disabled />
        )}
      </div>
    </div>
  );
}

interface GhostProps {
  icon: typeof Share2;
  label: string;
  onClick?: () => void;
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
}

function ActionGhost({ icon: Icon, label, onClick, href, download, target, rel, disabled }: GhostProps) {
  const className = `flex items-center justify-center gap-1.5 text-xs font-medium border rounded-md py-2 transition-colors ${
    disabled
      ? 'text-gray-700 border-white/[0.04] cursor-not-allowed'
      : 'text-gray-300 hover:text-white border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'
  }`;
  if (href && !disabled) {
    return (
      <a href={href} download={download} target={target} rel={rel} className={className}>
        <Icon size={13} strokeWidth={2} />
        {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      <Icon size={13} strokeWidth={2} />
      {label}
    </button>
  );
}
