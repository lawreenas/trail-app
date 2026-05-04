import type { Difficulty, RouteMetrics } from '../types';

export function classifyDifficulty(metrics: RouteMetrics): Difficulty {
  // Score: distance in km * 2 + elevation gain per 100m
  const score = metrics.distanceKm * 2 + metrics.elevationGainM / 100;
  if (score < 10) return 'easy';
  if (score < 25) return 'moderate';
  if (score < 50) return 'hard';
  return 'expert';
}
