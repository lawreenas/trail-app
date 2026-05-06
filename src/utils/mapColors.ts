import type { MapTheme } from '../types';

export interface MapColors {
  /** Polyline color when no interaction. */
  trackDefault: string;
  /** Polyline color when the user is hovering it (route card hover or pointer hover on the line). */
  trackHovered: string;
  /** Polyline color for the currently-selected route. */
  trackSelected: string;
  /** Start-marker fill when no interaction. */
  markerDefault: string;
  /** Start-marker fill for the selected route. */
  markerSelected: string;
  /** Start-marker stroke (outline) — high-contrast against the marker fill. */
  markerStroke: string;
  /** Pulsing-ring color around the selected start marker. */
  pulseRing: string;
  /** Color used by the chart-hover marker (mirroring elevation chart hover). */
  chartHover: string;
}

/**
 * Theme-tuned colors for map drawing. Goal: maximum legibility per theme,
 * with the selected/hovered route always being a punchy accent that reads
 * unambiguously against the underlying tile palette.
 */
export const MAP_COLORS: Record<MapTheme, MapColors> = {
  // Dark Matter (CartoDB) — mid-grey terrain after our brightness/saturation filter.
  dark: {
    trackDefault: '#a3a3a8',
    trackHovered: '#c4ff00',
    trackSelected: '#c4ff00',
    markerDefault: '#e5e5e7',
    markerSelected: '#c4ff00',
    markerStroke: '#0d0d0e',
    pulseRing: '#c4ff00',
    chartHover: '#c4ff00',
  },
  // Positron (CartoDB) — clean cream/light-grey background.
  light: {
    trackDefault: '#1f2937',
    trackHovered: '#dc2626',
    trackSelected: '#dc2626',
    markerDefault: '#1f2937',
    markerSelected: '#dc2626',
    markerStroke: '#ffffff',
    pulseRing: '#dc2626',
    chartHover: '#dc2626',
  },
  // OpenTopoMap — beige/green topographic. Dark default + hot red accent reads cleanly.
  terrain: {
    trackDefault: '#1f2937',
    trackHovered: '#dc2626',
    trackSelected: '#dc2626',
    markerDefault: '#1f2937',
    markerSelected: '#dc2626',
    markerStroke: '#ffffff',
    pulseRing: '#dc2626',
    chartHover: '#dc2626',
  },
  // Esri World Imagery — dark, busy satellite. White default + lime accent maximises contrast.
  satellite: {
    trackDefault: '#ffffff',
    trackHovered: '#c4ff00',
    trackSelected: '#c4ff00',
    markerDefault: '#ffffff',
    markerSelected: '#c4ff00',
    markerStroke: '#0d0d0e',
    pulseRing: '#c4ff00',
    chartHover: '#c4ff00',
  },
};
