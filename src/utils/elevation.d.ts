import type { ElevationPoint, RouteMetrics } from '../types';

/** Distance, smoothed elevation gain/loss and a downsampled elevation profile for a track. */
export function analyzeTrack(coordinates: number[][]): {
  metrics: RouteMetrics;
  elevationProfile: ElevationPoint[];
};
