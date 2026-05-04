import { gpx } from '@tmcw/togeojson';
import { v4 as uuid } from 'uuid';
import { computeMetrics } from '../utils/gpxMetrics';
import { classifyDifficulty } from '../utils/difficultyClassifier';
import type { TrailRoute } from '../types';

export async function parseGpxFile(file: File): Promise<Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'>> {
  const text = await file.text();
  const dom = new DOMParser().parseFromString(text, 'text/xml');
  const geoJson = gpx(dom);

  const feature = geoJson.features.find(
    (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
  );

  if (!feature) throw new Error('No track found in GPX file');

  let coordinates: number[][];
  const geom = feature.geometry;
  if (geom.type === 'LineString') {
    coordinates = geom.coordinates as number[][];
  } else if (geom.type === 'MultiLineString') {
    coordinates = (geom.coordinates as number[][][]).flat();
  } else {
    throw new Error('Unexpected geometry type in GPX');
  }

  const { metrics, elevationProfile } = computeMetrics(coordinates);

  // GeoJSON is [lng, lat] — Leaflet needs [lat, lng] for startPoint
  const [startLng, startLat] = coordinates[0];

  const lineFeature: GeoJSON.Feature = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: feature.properties ?? {},
  };

  const difficulty = classifyDifficulty(metrics);
  const now = new Date().toISOString();

  return {
    id: uuid(),
    difficulty,
    startPoint: { lat: startLat, lng: startLng },
    metrics,
    elevationProfile,
    geoJson: lineFeature,
    gpxFileName: file.name,
    uploadedAt: now,
    updatedAt: now,
  };
}
