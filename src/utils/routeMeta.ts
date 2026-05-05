import { RefreshCw, ArrowRight, Flag, Triangle, type LucideIcon } from 'lucide-react';
import type { Difficulty, RouteType } from '../types';

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

/** Color-coded accent for each difficulty. Used in pills and dots. */
export const DIFFICULTY_COLOR: Record<Difficulty, { bg: string; fg: string; dot: string }> = {
  easy: { bg: 'bg-difficulty-easy/15', fg: 'text-difficulty-easy', dot: 'bg-difficulty-easy' },
  moderate: { bg: 'bg-difficulty-moderate/15', fg: 'text-difficulty-moderate', dot: 'bg-difficulty-moderate' },
  hard: { bg: 'bg-difficulty-hard/15', fg: 'text-difficulty-hard', dot: 'bg-difficulty-hard' },
  expert: { bg: 'bg-difficulty-expert/15', fg: 'text-difficulty-expert', dot: 'bg-difficulty-expert' },
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  expert: 'Expert',
};

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
