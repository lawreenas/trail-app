import { gpx } from '@tmcw/togeojson';

const cache = new Map<string, GeoJSON.Feature>();
const inflight = new Map<string, Promise<GeoJSON.Feature>>();

function parseLineString(xml: string): GeoJSON.Feature {
  const dom = new DOMParser().parseFromString(xml, 'text/xml');
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

  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: feature.properties ?? {},
  };
}

export function gpxUrl(filename: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}gpx/${filename}`;
}

export async function loadRouteGeometry(filename: string): Promise<GeoJSON.Feature> {
  const cached = cache.get(filename);
  if (cached) return cached;
  const pending = inflight.get(filename);
  if (pending) return pending;

  const promise = (async () => {
    const res = await fetch(gpxUrl(filename));
    if (!res.ok) throw new Error(`Failed to fetch GPX (${res.status})`);
    const xml = await res.text();
    const feature = parseLineString(xml);
    cache.set(filename, feature);
    inflight.delete(filename);
    return feature;
  })();

  inflight.set(filename, promise);
  return promise;
}
