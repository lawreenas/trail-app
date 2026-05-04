import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { loadAllRoutes } from '../services/dataLoader';
import { upsertLocalRoute, deleteLocalRoute } from '../services/routeStorage';
import { simplifyTrack } from '../utils/simplify';
import type { AppStore, FilterState, LngLat, TrailRoute } from '../types';

const LOCAL_TRACK_TOLERANCE = 0.00006;

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
  minDistanceKm: null,
  maxDistanceKm: null,
  region: null,
};

export const useAppStore = create<AppStore>((set, get) => ({
  routes: [],
  tracks: {},
  isLoading: false,
  loadError: null,
  selectedRouteId: null,
  hoveredRouteId: null,
  filters: DEFAULT_FILTERS,
  sidebarMode: 'list',
  isAdminAuthenticated: false,

  loadRoutes: async () => {
    set({ isLoading: true, loadError: null });
    try {
      const { routes, tracks } = await loadAllRoutes();
      set({ routes, tracks, isLoading: false });
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

  setSidebarMode: (mode) => set({ sidebarMode: mode }),

  authenticateAdmin: async (password: string) => {
    const hash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    if (!hash) {
      // Dev mode: any password works
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
      const { routes, filters } = state;
      return routes.filter((route) => {
        if (
          filters.search &&
          !route.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !route.region.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }
        if (filters.difficulties.length && !filters.difficulties.includes(route.difficulty)) {
          return false;
        }
        if (filters.minDistanceKm !== null && route.metrics.distanceKm < filters.minDistanceKm) {
          return false;
        }
        if (filters.maxDistanceKm !== null && route.metrics.distanceKm > filters.maxDistanceKm) {
          return false;
        }
        if (filters.region && route.region !== filters.region) {
          return false;
        }
        return true;
      });
    })
  );
}
