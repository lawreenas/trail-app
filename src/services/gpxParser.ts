import { gpx } from '@tmcw/togeojson';
import { v4 as uuid } from 'uuid';
import { analyzeTrack } from '../utils/elevation';
import type { TrailRoute } from '../types';

/** Extract the track as GeoJSON-order coordinates ([lng, lat, ele?]) plus its GPX properties. */
function readTrack(text: string): { coordinates: number[][]; properties: GeoJSON.GeoJsonProperties } {
  const dom = new DOMParser().parseFromString(text, 'text/xml');
  const geoJson = gpx(dom);

  const feature = geoJson.features.find(
    (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
  );

  if (!feature) throw new Error('No track found in GPX file');

  const geom = feature.geometry;
  const properties = feature.properties ?? {};
  if (geom.type === 'LineString') return { coordinates: geom.coordinates as number[][], properties };
  if (geom.type === 'MultiLineString') return { coordinates: (geom.coordinates as number[][][]).flat(), properties };
  throw new Error('Unexpected geometry type in GPX');
}

/** Metrics + elevation profile computed from raw GPX text (used by admin "Recalculate"). */
export function analyzeGpxText(text: string) {
  return analyzeTrack(readTrack(text).coordinates);
}

export async function parseGpxFile(file: File): Promise<Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'>> {
  const text = await file.text();
  const { coordinates, properties } = readTrack(text);
  const { metrics, elevationProfile } = analyzeTrack(coordinates);

  // GeoJSON is [lng, lat] — Leaflet needs [lat, lng] for startPoint
  const [startLng, startLat] = coordinates[0];

  const lineFeature: GeoJSON.Feature = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties,
  };

  const now = new Date().toISOString();

  return {
    id: uuid(),
    type: 'loop',
    startPoint: { lat: startLat, lng: startLng },
    metrics,
    elevationProfile,
    geoJson: lineFeature,
    gpxText: text,
    gpxFileName: file.name,
    uploadedAt: now,
    updatedAt: now,
  };
}
