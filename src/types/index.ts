export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export type RouteType = 'loop' | 'point-to-point' | 'race' | 'hill-repeats';

export interface TagDefinition {
  name: string;
  color: string;
}

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
  type?: RouteType;
  /** Optional surface/terrain note shown alongside metrics (e.g. "Forest singletrack"). */
  terrain?: string;
  /** Optional external link (race info / event page). */
  link?: string;
  region: string;
  tags: string[];
  startPoint: { lat: number; lng: number };
  metrics: RouteMetrics;
  elevationProfile: ElevationPoint[];
  /** Lazy-loaded for public routes (fetched from /gpx/<filename> when selected). Always present for local admin uploads. */
  geoJson?: GeoJSON.Feature;
  /** Original GPX XML text. Set only for routes uploaded via admin so we can include them in exports. */
  gpxText?: string;
  gpxFileName: string;
  source: 'public' | 'local';
  uploadedAt: string;
  updatedAt: string;
}

export interface RoutesDataFile {
  version: number;
  exportedAt: string;
  routes: Omit<TrailRoute, 'source' | 'gpxText' | 'geoJson'>[];
  tags?: TagDefinition[];
}

/** Lng/Lat pair (GeoJSON convention). */
export type LngLat = [number, number];

/** Pre-simplified track geometry for the overview map. Keyed by route id. */
export interface TracksDataFile {
  version: number;
  exportedAt: string;
  tracks: Record<string, LngLat[]>;
}

export interface FilterState {
  search: string;
  difficulties: Difficulty[];
  routeTypes: RouteType[];
  favoritesOnly: boolean;
  minDistanceKm: number | null;
  maxDistanceKm: number | null;
  minElevationGainM: number | null;
  maxElevationGainM: number | null;
  region: string | null;
  sort: SortKey;
}

export type MapTheme = 'dark' | 'light' | 'terrain' | 'satellite';

export type SortKey = 'distance-asc' | 'distance-desc' | 'elevation-asc' | 'elevation-desc' | 'name' | 'recent';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface AppStore {
  routes: TrailRoute[];
  /** Simplified track geometry per route id, used to draw all trails on the overview map. */
  tracks: Record<string, LngLat[]>;
  /** Shared tag library — name + color. Merges public + local definitions. */
  tagLibrary: TagDefinition[];
  isLoading: boolean;
  loadError: string | null;
  selectedRouteId: string | null;
  hoveredRouteId: string | null;
  filters: FilterState;
  sidebarMode: 'list' | 'detail';
  isAdminAuthenticated: boolean;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  /** Set of route ids the user has favorited (persisted to localStorage). */
  favorites: Set<string>;
  toggleFavorite: (routeId: string) => void;
  /** Whether all (non-selected) tracks are visible. */
  showAllTracks: boolean;
  setShowAllTracks: (v: boolean) => void;
  /** User geolocation, if granted. */
  userLocation: UserLocation | null;
  setUserLocation: (loc: UserLocation | null) => void;
  /** Lng/Lat of the elevation-chart hover position, or null when not hovering. */
  chartHoverPoint: LngLat | null;
  setChartHoverPoint: (point: LngLat | null) => void;
  loadRoutes: () => Promise<void>;
  selectRoute: (id: string | null) => void;
  hoverRoute: (id: string | null) => void;
  setFilters: (partial: Partial<FilterState>) => void;
  upsertRoute: (route: TrailRoute) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  upsertTag: (tag: TagDefinition) => Promise<void>;
  deleteTag: (name: string) => Promise<void>;
  setSidebarMode: (mode: 'list' | 'detail') => void;
  authenticateAdmin: (password: string) => Promise<boolean>;
}
