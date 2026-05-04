export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export interface RouteMetrics {
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  elevationMaxM: number;
  elevationMinM: number;
  estimatedTimeMin: number;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

export interface TrailRoute {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  region: string;
  tags: string[];
  startPoint: { lat: number; lng: number };
  metrics: RouteMetrics;
  elevationProfile: ElevationPoint[];
  /** Lazy-loaded for public routes (fetched from /gpx/<filename> when selected). Always present for local admin uploads. */
  geoJson?: GeoJSON.Feature;
  gpxFileName: string;
  source: 'public' | 'local';
  uploadedAt: string;
  updatedAt: string;
}

export interface RoutesDataFile {
  version: number;
  exportedAt: string;
  routes: Omit<TrailRoute, 'source'>[];
}

export interface FilterState {
  search: string;
  difficulties: Difficulty[];
  minDistanceKm: number | null;
  maxDistanceKm: number | null;
  region: string | null;
}

export interface AppStore {
  routes: TrailRoute[];
  isLoading: boolean;
  loadError: string | null;
  selectedRouteId: string | null;
  hoveredRouteId: string | null;
  filters: FilterState;
  sidebarMode: 'list' | 'detail';
  isAdminAuthenticated: boolean;
  loadRoutes: () => Promise<void>;
  selectRoute: (id: string | null) => void;
  hoverRoute: (id: string | null) => void;
  setFilters: (partial: Partial<FilterState>) => void;
  upsertRoute: (route: TrailRoute) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  setSidebarMode: (mode: 'list' | 'detail') => void;
  authenticateAdmin: (password: string) => Promise<boolean>;
}
