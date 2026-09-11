import { RefreshCw, ArrowRight, Flag, Triangle, type LucideIcon } from 'lucide-react';
import type { RouteType } from '../types';

export const ROUTE_TYPES: RouteType[] = ['loop', 'point-to-point', 'race', 'hill-repeats'];

export const ROUTE_TYPE_LABEL: Record<RouteType, string> = {
  loop: 'Loop',
  'point-to-point': 'Point-to-point',
  race: 'Race',
  'hill-repeats': 'Hill repeats',
};

export const ROUTE_TYPE_ICON: Record<RouteType, LucideIcon> = {
  loop: RefreshCw,
  'point-to-point': ArrowRight,
  race: Flag,
  'hill-repeats': Triangle,
};

/** Returns the route's type or a sensible default for visual fallbacks. */
export function effectiveRouteType(t: RouteType | undefined): RouteType {
  return t ?? 'loop';
}

/**
 * Data-driven accent hue for a route, derived from its elevation gain.
 * Green (flat) → amber → red (big climbs). A sqrt scale capped at CAP spreads
 * the crowded low/mid range across the hue band so a single high outlier
 * doesn't flatten every other route to green.
 */
export function elevationColor(gainM: number): string {
  const CAP = 1200; // gains at/above this read as max intensity
  const t = Math.min(1, Math.sqrt(Math.max(0, gainM) / CAP));
  const hue = Math.round(140 - 140 * t); // 140° green → 0° red
  return `hsl(${hue}, 70%, 55%)`;
}

/** Preset palette for tag colors. Curated for legibility on the dark surface. */
export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#94a3b8', // slate
];

/** Stable default color for a tag with no library entry — same name always picks same color. */
export function defaultTagColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function tagColor(name: string, library: { name: string; color: string }[]): string {
  return library.find((t) => t.name === name)?.color ?? defaultTagColor(name);
}
