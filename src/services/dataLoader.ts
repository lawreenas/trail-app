import { getAllLocalRoutes } from './routeStorage';
import { simplifyTrack } from '../utils/simplify';
import type { LngLat, RoutesDataFile, TracksDataFile, TrailRoute } from '../types';

const LOCAL_TRACK_TOLERANCE = 0.00006; // matches scripts/import-gpx.mjs

export interface LoadedData {
  routes: TrailRoute[];
  tracks: Record<string, LngLat[]>;
}

export async function loadAllRoutes(): Promise<LoadedData> {
  const base = import.meta.env.BASE_URL ?? '/';

  // Fetch routes metadata and simplified tracks in parallel
  const [dataRes, tracksRes, localRoutes] = await Promise.all([
    fetch(`${base}routes-data.json`).catch(() => null),
    fetch(`${base}routes-tracks.json`).catch(() => null),
    getAllLocalRoutes(),
  ]);

  let publicRoutes: TrailRoute[] = [];
  if (dataRes && dataRes.ok) {
    const data: RoutesDataFile = await dataRes.json();
    publicRoutes = data.routes.map((r) => ({ ...r, source: 'public' as const }));
  }

  const tracks: Record<string, LngLat[]> = {};
  if (tracksRes && tracksRes.ok) {
    const t: TracksDataFile = await tracksRes.json();
    Object.assign(tracks, t.tracks);
  }

  // For local (admin) routes, derive a simplified track from the embedded geoJson
  for (const r of localRoutes) {
    if (!tracks[r.id] && r.geoJson?.geometry?.type === 'LineString') {
      const coords = (r.geoJson.geometry.coordinates as number[][]).map(
        ([lng, lat]) => [lng, lat] as LngLat
      );
      tracks[r.id] = simplifyTrack(coords, LOCAL_TRACK_TOLERANCE);
    }
  }

  // Merge: local overrides public by id
  const merged = new Map<string, TrailRoute>();
  for (const r of publicRoutes) merged.set(r.id, r);
  for (const r of localRoutes) merged.set(r.id, r);

  const routes = Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
  return { routes, tracks };
}
