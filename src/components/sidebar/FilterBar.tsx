import { useRef, useState } from 'react';
import { Search, Heart, SlidersHorizontal, X } from 'lucide-react';
import { useAppStore, useRouteMetricRange } from '../../store/useAppStore';
import { ROUTE_TYPES, ROUTE_TYPE_LABEL } from '../../utils/routeMeta';
import type { Difficulty, SortKey } from '../../types';

const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'hard', 'expert'];

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Mod',
  hard: 'Hard',
  expert: 'Expert',
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: 'bg-difficulty-easy',
  moderate: 'bg-difficulty-moderate',
  hard: 'bg-difficulty-hard',
  expert: 'bg-difficulty-expert',
};

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'name', label: 'Name (A→Z)' },
  { value: 'distance-asc', label: 'Distance ↑' },
  { value: 'distance-desc', label: 'Distance ↓' },
  { value: 'elevation-asc', label: 'Elevation ↑' },
  { value: 'elevation-desc', label: 'Elevation ↓' },
  { value: 'recent', label: 'Recently updated' },
];

export function FilterBar() {
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const range = useRouteMetricRange();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilters({ search: value }), 250);
  };

  const toggleDifficulty = (d: Difficulty) => {
    const current = filters.difficulties;
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
    setFilters({ difficulties: next });
  };

  const toggleType = (t: typeof ROUTE_TYPES[number]) => {
    const current = filters.routeTypes;
    const next = current.includes(t) ? current.filter((x) => x !== t) : [...current, t];
    setFilters({ routeTypes: next });
  };

  const hasActive =
    filters.search ||
    filters.favoritesOnly ||
    filters.difficulties.length > 0 ||
    filters.routeTypes.length > 0 ||
    filters.minDistanceKm !== null ||
    filters.maxDistanceKm !== null ||
    filters.minElevationGainM !== null ||
    filters.maxElevationGainM !== null;

  const clearAll = () =>
    setFilters({
      search: '',
      favoritesOnly: false,
      difficulties: [],
      routeTypes: [],
      minDistanceKm: null,
      maxDistanceKm: null,
      minElevationGainM: null,
      maxElevationGainM: null,
    });

  const minDistance = filters.minDistanceKm ?? range.minDistance;
  const maxDistance = filters.maxDistanceKm ?? range.maxDistance;
  const minElevation = filters.minElevationGainM ?? range.minElevation;
  const maxElevation = filters.maxElevationGainM ?? range.maxElevation;

  return (
    <div className="px-5 pb-4 space-y-3 shrink-0 border-b border-white/[0.06]">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search routes or tags…"
          className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-md pl-9 pr-3 py-2 outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors placeholder:text-gray-600"
          defaultValue={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search routes"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            filters.favoritesOnly
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-transparent border-white/[0.08] text-gray-400 hover:text-white hover:border-white/15'
          }`}
        >
          <Heart size={12} fill={filters.favoritesOnly ? 'currentColor' : 'none'} strokeWidth={2} />
          Favorites
        </button>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value as SortKey })}
          className="flex-1 bg-white/[0.04] border border-white/[0.08] text-xs text-gray-300 rounded-md px-2.5 py-1.5 outline-none focus:border-white/30 transition-colors"
          aria-label="Sort routes"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
            advancedOpen || hasActive
              ? 'text-primary bg-primary/10'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
          }`}
          title="More filters"
          aria-label="More filters"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1 -mx-1">
        {DIFFICULTIES.map((d) => {
          const active = filters.difficulties.includes(d);
          return (
            <button
              key={d}
              onClick={() => toggleDifficulty(d)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[d]}`} />
              {DIFFICULTY_LABEL[d]}
            </button>
          );
        })}
      </div>

      {advancedOpen && (
        <div className="space-y-4 pt-3 mt-1 border-t border-white/[0.04]">
          <div>
            <SectionLabel>Type</SectionLabel>
            <div className="flex gap-1.5 flex-wrap">
              {ROUTE_TYPES.map((t) => {
                const active = filters.routeTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                      active
                        ? 'bg-white/[0.08] border-white/20 text-white'
                        : 'bg-transparent border-white/[0.08] text-gray-500 hover:text-white hover:border-white/15'
                    }`}
                  >
                    {ROUTE_TYPE_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <RangeSlider
            label="Distance"
            unit="km"
            min={range.minDistance}
            max={range.maxDistance}
            step={1}
            valueMin={minDistance}
            valueMax={maxDistance}
            onChangeMin={(v) => setFilters({ minDistanceKm: v <= range.minDistance ? null : v })}
            onChangeMax={(v) => setFilters({ maxDistanceKm: v >= range.maxDistance ? null : v })}
          />

          <RangeSlider
            label="Elevation gain"
            unit="m"
            min={range.minElevation}
            max={range.maxElevation}
            step={50}
            valueMin={minElevation}
            valueMax={maxElevation}
            onChangeMin={(v) => setFilters({ minElevationGainM: v <= range.minElevation ? null : v })}
            onChangeMax={(v) => setFilters({ maxElevationGainM: v >= range.maxElevation ? null : v })}
          />
        </div>
      )}

      {hasActive && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-colors"
        >
          <X size={11} />
          Clear filters
        </button>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1.5">
      {children}
    </div>
  );
}

function RangeSlider({
  label,
  unit,
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <SectionLabel>{label}</SectionLabel>
        <span className="text-[11px] text-gray-300 tabular-nums">
          {valueMin}–{valueMax} {unit}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), valueMax);
            onChangeMin(v);
          }}
          aria-label={`Minimum ${label.toLowerCase()}`}
          className="w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), valueMin);
            onChangeMax(v);
          }}
          aria-label={`Maximum ${label.toLowerCase()}`}
          className="w-full"
        />
      </div>
    </div>
  );
}
