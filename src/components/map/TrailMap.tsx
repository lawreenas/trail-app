import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import type { MapTheme } from '../../types';
import { StartMarkersLayer } from './StartMarkersLayer';
import { AllTracksLayer } from './AllTracksLayer';
import { ChartHoverMarker } from './ChartHoverMarker';
import { UserLocationLayer } from './UserLocationLayer';

const TILE_BY_THEME: Record<MapTheme, { url: string; bg: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    bg: '#1a1a1c',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    bg: '#f5f5f3',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    bg: '#d8d4c5',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    bg: '#0a0a0a',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
};

const DEFAULT_CENTER: [number, number] = [54.6872, 25.2797]; // Vilnius
const DEFAULT_ZOOM = 11;

function MapController() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const tracks = useAppStore((s) => s.tracks);
  const map = useMap();
  const prevId = useRef<string | null>(null);
  const didFitInitial = useRef(false);

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
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [60, 60], animate: false });
      didFitInitial.current = true;
    }
  }, [routes.length, tracks, map]);

  useEffect(() => {
    if (selectedRouteId && selectedRouteId !== prevId.current) {
      const coords = tracks[selectedRouteId];
      if (coords && coords.length) {
        const latLngs = coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);
        const bounds = L.latLngBounds(latLngs);
        const currentBounds = map.getBounds();
        if (currentBounds.contains(bounds)) {
          map.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 0.35 });
        } else {
          map.flyToBounds(bounds, {
            padding: [60, 60],
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
        <TileLayer
          key={theme}
          url={tile.url}
          attribution={tile.attribution}
          maxZoom={tile.maxZoom}
        />
        <ZoomControl position="bottomleft" />
        <MapController />
        <AllTracksLayer />
        <ChartHoverMarker />
        <UserLocationLayer />
        <StartMarkersLayer />
      </MapContainer>
    </div>
  );
}
