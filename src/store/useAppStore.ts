import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { loadAllRoutes } from '../services/dataLoader';
import {
  upsertLocalRoute,
  deleteLocalRoute,
  upsertLocalTag,
  deleteLocalTag,
} from '../services/routeStorage';
import { simplifyTrack } from '../utils/simplify';
import type {
  AppStore,
  FilterState,
  LngLat,
  MapTheme,
  TagDefinition,
  TrailRoute,
  UserLocation,
} from '../types';

const LOCAL_TRACK_TOLERANCE = 0.00006;
const MAP_THEME_KEY = 'trail-app:map-theme';
const FAVORITES_KEY = 'trail-app:favorites';
const SHOW_ALL_TRACKS_KEY = 'trail-app:show-all-tracks';

function readInitialMapTheme(): MapTheme {
  try {
    const stored = localStorage.getItem(MAP_THEME_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'terrain' || stored === 'satellite') {
      return stored;
    }
  } catch { /* localStorage unavailable */ }
  return 'dark';
}

function readInitialFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function readInitialShowAllTracks(): boolean {
  try {
    const stored = localStorage.getItem(SHOW_ALL_TRACKS_KEY);
    if (stored === 'false') return false;
  } catch { /* ignore */ }
  return true;
}

function persistFavorites(favorites: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
  } catch { /* ignore */ }
}

function trackForRoute(route: TrailRoute): LngLat[] | null {
  if (!route.geoJson || route.geoJson.geometry.type !== 'LineString') return null;
  const coords = (route.geoJson.geometry.coordinates as number[][]).map(
    ([lng, lat]) => [lng, lat] as LngLat
  );
  return simplifyTrack(coords, LOCAL_TRACK_TOLERANCE);
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  difficulties: [],
  routeTypes: [],
  favoritesOnly: false,
  minDistanceKm: null,
  maxDistanceKm: null,
  minElevationGainM: null,
  maxElevationGainM: null,
  region: null,
  sort: 'name',
};

export const useAppStore = create<AppStore>((set, _get) => ({
  routes: [],
  tracks: {},
  tagLibrary: [],
  isLoading: false,
  loadError: null,
  selectedRouteId: null,
  hoveredRouteId: null,
  filters: DEFAULT_FILTERS,
  sidebarMode: 'list',
  isAdminAuthenticated: false,
  mapTheme: readInitialMapTheme(),
  chartHoverPoint: null,
  favorites: readInitialFavorites(),
  showAllTracks: readInitialShowAllTracks(),
  userLocation: null,

  setMapTheme: (theme) => {
    set({ mapTheme: theme });
    try { localStorage.setItem(MAP_THEME_KEY, theme); } catch { /* ignore */ }
  },

  setChartHoverPoint: (point) => set({ chartHoverPoint: point }),

  toggleFavorite: (routeId: string) => {
    set((state) => {
      const favorites = new Set(state.favorites);
      if (favorites.has(routeId)) favorites.delete(routeId);
      else favorites.add(routeId);
      persistFavorites(favorites);
      return { favorites };
    });
  },

  setShowAllTracks: (v: boolean) => {
    set({ showAllTracks: v });
    try { localStorage.setItem(SHOW_ALL_TRACKS_KEY, String(v)); } catch { /* ignore */ }
  },

  setUserLocation: (loc: UserLocation | null) => set({ userLocation: loc }),

  loadRoutes: async () => {
    set({ isLoading: true, loadError: null });
    try {
      const { routes, tracks, tagLibrary } = await loadAllRoutes();
      set({ routes, tracks, tagLibrary, isLoading: false });
    } catch (err) {
      set({ loadError: String(err), isLoading: false });
    }
  },

  selectRoute: (id) => {
    set({ selectedRouteId: id, sidebarMode: id ? 'detail' : 'list' });
  },

  hoverRoute: (id) => set({ hoveredRouteId: id }),

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  upsertRoute: async (route: TrailRoute) => {
    await upsertLocalRoute(route);
    set((state) => {
      const existing = state.routes.findIndex((r) => r.id === route.id);
      const routes =
        existing >= 0
          ? state.routes.map((r) => (r.id === route.id ? route : r))
          : [...state.routes, route].sort((a, b) => a.name.localeCompare(b.name));
      const track = trackForRoute(route);
      const tracks = track ? { ...state.tracks, [route.id]: track } : state.tracks;
      return { routes, tracks };
    });
  },

  deleteRoute: async (id: string) => {
    await deleteLocalRoute(id);
    set((state) => {
      const { [id]: _removed, ...tracks } = state.tracks;
      return {
        routes: state.routes.filter((r) => r.id !== id),
        tracks,
        selectedRouteId: state.selectedRouteId === id ? null : state.selectedRouteId,
        sidebarMode: state.selectedRouteId === id ? 'list' : state.sidebarMode,
      };
    });
  },

  upsertTag: async (tag: TagDefinition) => {
    await upsertLocalTag(tag);
    set((state) => {
      const idx = state.tagLibrary.findIndex((t) => t.name === tag.name);
      const tagLibrary =
        idx >= 0
          ? state.tagLibrary.map((t, i) => (i === idx ? tag : t))
          : [...state.tagLibrary, tag].sort((a, b) => a.name.localeCompare(b.name));
      return { tagLibrary };
    });
  },

  deleteTag: async (name: string) => {
    await deleteLocalTag(name);
    set((state) => ({
      tagLibrary: state.tagLibrary.filter((t) => t.name !== name),
    }));
  },

  setSidebarMode: (mode) => set({ sidebarMode: mode }),

  authenticateAdmin: async (password: string) => {
    const hash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    if (!hash) {
      set({ isAdminAuthenticated: true });
      return true;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    const ok = hashHex === hash.toLowerCase();
    if (ok) set({ isAdminAuthenticated: true });
    return ok;
  },
}));

export function useFilteredRoutes() {
  return useAppStore(
    useShallow((state) => {
      const { routes, filters, favorites } = state;
      const filtered = routes.filter((route) => {
        if (filters.favoritesOnly && !favorites.has(route.id)) return false;
        if (
          filters.search &&
          !route.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !route.tags.some((t) => t.toLowerCase().includes(filters.search.toLowerCase()))
        ) {
          return false;
        }
        if (filters.difficulties.length && !filters.difficulties.includes(route.difficulty)) {
          return false;
        }
        if (filters.routeTypes.length && (!route.type || !filters.routeTypes.includes(route.type))) {
          return false;
        }
        if (filters.minDistanceKm !== null && route.metrics.distanceKm < filters.minDistanceKm) {
          return false;
        }
        if (filters.maxDistanceKm !== null && route.metrics.distanceKm > filters.maxDistanceKm) {
          return false;
        }
        if (filters.minElevationGainM !== null && route.metrics.elevationGainM < filters.minElevationGainM) {
          return false;
        }
        if (filters.maxElevationGainM !== null && route.metrics.elevationGainM > filters.maxElevationGainM) {
          return false;
        }
        if (filters.region && route.region !== filters.region) {
          return false;
        }
        return true;
      });

      const sorted = [...filtered];
      switch (filters.sort) {
        case 'distance-asc':
          sorted.sort((a, b) => a.metrics.distanceKm - b.metrics.distanceKm);
          break;
        case 'distance-desc':
          sorted.sort((a, b) => b.metrics.distanceKm - a.metrics.distanceKm);
          break;
        case 'elevation-asc':
          sorted.sort((a, b) => a.metrics.elevationGainM - b.metrics.elevationGainM);
          break;
        case 'elevation-desc':
          sorted.sort((a, b) => b.metrics.elevationGainM - a.metrics.elevationGainM);
          break;
        case 'recent':
          sorted.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
          break;
        case 'name':
        default:
          sorted.sort((a, b) => a.name.localeCompare(b.name));
      }
      return sorted;
    })
  );
}

export function useRouteMetricRange() {
  return useAppStore(
    useShallow((state) => {
      const distances = state.routes.map((r) => r.metrics.distanceKm);
      const elevations = state.routes.map((r) => r.metrics.elevationGainM);
      return {
        minDistance: Math.floor(distances.length ? Math.min(...distances) : 0),
        maxDistance: Math.ceil(distances.length ? Math.max(...distances) : 100),
        minElevation: Math.floor(elevations.length ? Math.min(...elevations) : 0),
        maxElevation: Math.ceil(elevations.length ? Math.max(...elevations) : 2000),
      };
    })
  );
}
