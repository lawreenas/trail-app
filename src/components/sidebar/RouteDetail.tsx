import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Pencil,
  Share2,
  Navigation,
  Download,
  ExternalLink,
  Check,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ElevationChart } from './ElevationChart';
import {
  distanceParts,
  elevationParts,
  formatDistance,
  formatElevation,
} from '../../utils/formatters';
import { ROUTE_TYPE_LABEL, ROUTE_TYPE_ICON, effectiveRouteType, tagColor } from '../../utils/routeMeta';
import { MAP_COLORS } from '../../utils/mapColors';
import { gpxUrl } from '../../services/gpxLoader';
import type { ElevationPoint, TrailRoute } from '../../types';

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
  const navigate = useNavigate();
  const [activePoint, setActivePoint] = useState<ElevationPoint | null>(null);

  const route = routes.find((r) => r.id === selectedRouteId);
  if (!route) return null;
  const trackCoords = tracks[route.id];
  const isFavorite = favorites.has(route.id);
  const TypeIcon = ROUTE_TYPE_ICON[effectiveRouteType(route.type)];
  const accent = MAP_COLORS[mapTheme].trackSelected;
  const m = route.metrics;

  const handleClose = () => {
    selectRoute(null);
    setSidebarMode('list');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 h-14 border-b border-white/[0.06] shrink-0">
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors rounded-lg pl-2 pr-3 h-9"
          aria-label="Back to all routes"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span className="font-medium">All routes</span>
        </button>
        <div className="flex items-center gap-1">
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={() => navigate('/admin', { state: { editRouteId: route.id } })}
              title="Edit in admin"
              aria-label="Edit in admin"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Pencil size={16} />
            </button>
          )}
          <ShareButton route={route} />
          <button
            type="button"
            onClick={() => toggleFavorite(route.id)}
            aria-pressed={isFavorite}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium border transition-colors ${
              isFavorite
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-white/[0.09] text-gray-200 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.25} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <header className="px-5 pt-6 pb-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {route.region && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {route.region}
              </span>
            )}
            {route.region && route.type && <span className="text-gray-700">·</span>}
            {route.type && (
              <span className="inline-flex items-center gap-1">
                <TypeIcon size={12} />
                {ROUTE_TYPE_LABEL[route.type]}
              </span>
            )}
          </div>
          <h2 className="font-display text-[32px] leading-[1.05] font-semibold text-white tracking-tight">
            {route.name}
          </h2>
          {route.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {route.tags.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/[0.05] rounded px-2 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tagColor(name, tagLibrary) }} />
                  {name}
                </span>
              ))}
            </div>
          )}
        </header>

        <section className="mx-5 grid grid-cols-3 rounded-xl bg-white/[0.03] border border-white/[0.06] divide-x divide-white/[0.06]">
          <HeroStat label="Distance" parts={distanceParts(m.distanceKm)} />
          <HeroStat label="Elevation gain" parts={elevationParts(m.elevationGainM)} />
          <HeroStat label="Elevation loss" parts={elevationParts(m.elevationLossM)} />
        </section>

        {route.elevationProfile.length > 0 && (
          <section className="px-5 pt-7">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Elevation</h3>
              <span className="text-xs tabular-nums text-gray-400">
                {activePoint ? (
                  <>
                    <span className="text-white font-medium">{formatElevation(activePoint.elevationM)}</span>
                    {' '}at {formatDistance(activePoint.distanceKm)}
                  </>
                ) : (
                  <>
                    {formatElevation(m.elevationMinM)} – {formatElevation(m.elevationMaxM)}
                  </>
                )}
              </span>
            </div>
            <ElevationChart
              data={route.elevationProfile}
              color={accent}
              trackCoords={trackCoords}
              onActiveChange={setActivePoint}
            />
          </section>
        )}

        <section className="px-5 pt-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-white/[0.05] py-4">
            <DetailStat label="Highest point" value={formatElevation(m.elevationMaxM)} />
            <DetailStat label="Lowest point" value={formatElevation(m.elevationMinM)} />
            {route.terrain && <DetailStat label="Terrain" value={route.terrain} wide />}
          </dl>
        </section>

        {route.description && (
          <section className="px-5 pt-6">
            <h3 className="text-sm font-semibold text-white mb-2">About this route</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {route.description}
            </p>
          </section>
        )}

        <div className="h-6" />
      </div>

      <ActionBar route={route} />
    </div>
  );
}

function HeroStat({ label, parts: [value, unit] }: { label: string; parts: [string, string] }) {
  return (
    <div className="px-3 py-3.5 min-w-0">
      <div className="text-[11px] text-gray-500 truncate">{label}</div>
      <div className="mt-1 flex items-baseline gap-1 text-white tabular-nums">
        <span className="font-display text-[26px] leading-none font-semibold">{value}</span>
        <span className="text-xs text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  );
}

function DetailStat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-white font-medium tabular-nums truncate">{value}</dd>
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

function ShareButton({ route }: { route: TrailRoute }) {
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
    <button
      type="button"
      onClick={handleShare}
      title={copied ? 'Link copied' : 'Share route'}
      aria-label={copied ? 'Link copied' : 'Share route'}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
        copied ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
      }`}
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
    </button>
  );
}

/** Sticky footer: the main thing you do with a route is go run it. */
function ActionBar({ route }: { route: TrailRoute }) {
  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2">
      <a
        href={navigateUrl(route.startPoint.lat, route.startPoint.lng)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
      >
        <Navigation size={15} strokeWidth={2.5} />
        Directions to start
      </a>
      {route.source === 'public' && (
        <SecondaryAction
          icon={Download}
          label="GPX"
          title={`Download ${route.gpxFileName}`}
          href={gpxUrl(route.gpxFileName)}
          download={route.gpxFileName}
        />
      )}
      {route.link && (
        <SecondaryAction
          icon={ExternalLink}
          label="Event"
          title="Open event page"
          href={route.link}
          target="_blank"
          rel="noopener noreferrer"
        />
      )}
    </div>
  );
}

function SecondaryAction({
  icon: Icon,
  label,
  title,
  ...rest
}: {
  icon: typeof Download;
  label: string;
  title: string;
  href: string;
  download?: string;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      {...rest}
      title={title}
      className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-lg border border-white/[0.1] text-sm font-medium text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      <Icon size={15} />
      {label}
    </a>
  );
}
