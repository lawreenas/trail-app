import { getAllLocalRoutes } from './routeStorage';
import type { TrailRoute, RoutesDataFile } from '../types';

export async function loadAllRoutes(): Promise<TrailRoute[]> {
  let publicRoutes: TrailRoute[] = [];

  try {
    const base = import.meta.env.BASE_URL ?? '/';
    const res = await fetch(`${base}routes-data.json`);
    if (res.ok) {
      const data: RoutesDataFile = await res.json();
      publicRoutes = data.routes.map((r) => ({ ...r, source: 'public' as const }));
    }
  } catch {
    // No public data file yet — that's fine
  }

  const localRoutes = await getAllLocalRoutes();

  const merged = new Map<string, TrailRoute>();
  for (const r of publicRoutes) merged.set(r.id, r);
  for (const r of localRoutes) merged.set(r.id, r); // local overrides public

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
}
