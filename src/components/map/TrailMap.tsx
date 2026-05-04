import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import { StartMarkersLayer } from './StartMarkersLayer';
import { RouteLayer } from './RouteLayer';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_CENTER: [number, number] = [54.6872, 25.2797]; // Vilnius
const DEFAULT_ZOOM = 10;

function MapController() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedRouteId && selectedRouteId !== prevId.current) {
      const route = routes.find((r) => r.id === selectedRouteId);
      if (route) {
        map.flyTo([route.startPoint.lat, route.startPoint.lng], 13, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    }
    prevId.current = selectedRouteId;
  }, [selectedRouteId, routes, map]);

  return null;
}

export function TrailMap() {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      style={{ background: '#1c1c1e' }}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <ZoomControl position="bottomleft" />
      <MapController />
      <StartMarkersLayer />
      <RouteLayer />
    </MapContainer>
  );
}
