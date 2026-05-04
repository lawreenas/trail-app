import type { LngLat } from '../types';

function haversineKm([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Build a cumulative-distance index for a coordinate sequence. Pre-computing
 * once per track means hover lookups are O(log n) via binary search instead of
 * O(n) walks.
 */
export function buildDistanceIndex(coords: LngLat[]): number[] {
  const cum: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + haversineKm(coords[i - 1], coords[i]));
  }
  return cum;
}

/** Linearly interpolate the [lng, lat] at `targetKm` along the track. */
export function coordAtDistance(
  coords: LngLat[],
  cumKm: number[],
  targetKm: number
): LngLat | null {
  if (coords.length < 2) return null;
  const total = cumKm[cumKm.length - 1];
  const t = Math.max(0, Math.min(total, targetKm));

  // Binary search for the segment that contains `t`
  let lo = 0;
  let hi = cumKm.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >>> 1;
    if (cumKm[mid] <= t) lo = mid;
    else hi = mid;
  }
  const segLen = cumKm[hi] - cumKm[lo] || 1e-9;
  const f = (t - cumKm[lo]) / segLen;
  const [lng1, lat1] = coords[lo];
  const [lng2, lat2] = coords[hi];
  return [lng1 + f * (lng2 - lng1), lat1 + f * (lat2 - lat1)];
}
