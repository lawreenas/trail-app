import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import type { MapTheme } from '../../types';
import { StartMarkersLayer } from './StartMarkersLayer';
import { AllTracksLayer } from './AllTracksLayer';

const TILE_BY_THEME: Record<MapTheme, { url: string; bg: string }> = {
  // CartoDB Dark Matter — pushed toward mid-grey via CSS filter in index.css
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', bg: '#2e2f31' },
  // CartoDB Positron — clean light/grey "Justin Map Trail" feel
  light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', bg: '#f5f5f3' },
};
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_CENTER: [number, number] = [54.6872, 25.2797]; // Vilnius
const DEFAULT_ZOOM = 11;

function MapController() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const tracks = useAppStore((s) => s.tracks);
  const map = useMap();
  const prevId = useRef<string | null>(null);
  const didFitInitial = useRef(false);

  // Initial fit-to-bounds: zoom out to show all tracks once on first load
  useEffect(() => {
    if (didFitInitial.current) return;
    if (!routes.length) return;
    const trackEntries = Object.values(tracks);
    if (!trackEntries.length) return;
    const allLatLngs: L.LatLngExpression[] = [];
    for (const coords of trackEntries) {
      for (const [lng, lat] of coords) allLatLngs.push([lat, lng]);
    }
    if (allLatLngs.length) {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [40, 40], animate: false });
      didFitInitial.current = true;
    }
  }, [routes.length, tracks, map]);

  // Smooth fit when a route is selected. flyToBounds re-renders the canvas
  // every animation frame for ~900ms which fights with hover state — keep it
  // short and use gentler easing.
  useEffect(() => {
    if (selectedRouteId && selectedRouteId !== prevId.current) {
      const coords = tracks[selectedRouteId];
      if (coords && coords.length) {
        const latLngs = coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);
        const bounds = L.latLngBounds(latLngs);
        const currentBounds = map.getBounds();
        // If the route is already mostly in view, skip the animation entirely
        if (currentBounds.contains(bounds)) {
          map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.35 });
        } else {
          map.flyToBounds(bounds, {
            padding: [40, 40],
            duration: 0.55,
            easeLinearity: 0.4,
          });
        }
      }
    }
    prevId.current = selectedRouteId;
  }, [selectedRouteId, tracks, map]);

  return null;
}

export function TrailMap() {
  const theme = useAppStore((s) => s.mapTheme);
  const tile = TILE_BY_THEME[theme];

  return (
    <div data-map-theme={theme} className="h-full w-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        preferCanvas={true}
        className="h-full w-full"
        style={{ background: tile.bg }}
      >
        {/* keying on theme forces the TileLayer to remount with the new URL
            so cached old-theme tiles don't flash through during the swap. */}
        <TileLayer key={theme} url={tile.url} attribution={ATTRIBUTION} maxZoom={19} />
        <ZoomControl position="bottomleft" />
        <MapController />
        <AllTracksLayer />
        <StartMarkersLayer />
      </MapContainer>
    </div>
  );
}
