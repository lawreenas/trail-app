import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import { StartMarkersLayer } from './StartMarkersLayer';
import { AllTracksLayer } from './AllTracksLayer';
import { RouteLayer } from './RouteLayer';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
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

  // Smooth fly-to when a route is selected
  useEffect(() => {
    if (selectedRouteId && selectedRouteId !== prevId.current) {
      const coords = tracks[selectedRouteId];
      if (coords && coords.length) {
        const latLngs = coords.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);
        map.flyToBounds(L.latLngBounds(latLngs), {
          padding: [60, 60],
          duration: 0.9,
          easeLinearity: 0.25,
        });
      }
    }
    prevId.current = selectedRouteId;
  }, [selectedRouteId, tracks, map]);

  return null;
}

export function TrailMap() {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      preferCanvas={true}
      className="h-full w-full"
      style={{ background: '#1c1c1e' }}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <ZoomControl position="bottomleft" />
      <MapController />
      <AllTracksLayer />
      <RouteLayer />
      <StartMarkersLayer />
    </MapContainer>
  );
}
