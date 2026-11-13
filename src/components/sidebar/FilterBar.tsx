import { useEffect, useRef, useState } from 'react';
import { Search, Heart, SlidersHorizontal, X } from 'lucide-react';
import { useAppStore, useRouteMetricRange } from '../../store/useAppStore';
import { ROUTE_TYPES, ROUTE_TYPE_LABEL, DIFFICULTY_LABEL } from '../../utils/routeMeta';
import type { Difficulty, FilterState } from '../../types';

const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'hard', 'expert'];

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: 'bg-difficulty-easy',
  moderate: 'bg-difficulty-moderate',
  hard: 'bg-difficulty-hard',
  expert: 'bg-difficulty-expert',
};

/** Distance buckets that map to how runners actually think about runs. */
const DISTANCE_PRESETS: Array<{ label: string; min: number | null; max: number | null }> = [
  { label: 'Any', min: null, max: null },
  { label: 'Under 10', min: null, max: 10 },
  { label: '10–21', min: 10, max: 21 },
  { label: '21–42', min: 21, max: 42 },
  { label: '42+', min: 42, max: null },
];

export const EMPTY_FILTERS: Partial<FilterState> = {
  search: '',
  favoritesOnly: false,
  difficulties: [],
  routeTypes: [],
  minDistanceKm: null,
  maxDistanceKm: null,
  minElevationGainM: null,
  maxElevationGainM: null,
};

/** Number of filters beyond the always-visible chips (shown as a badge on the Filters button). */
function advancedCount(f: FilterState): number {
  let n = f.routeTypes.length;
  if (f.minDistanceKm !== null || f.maxDistanceKm !== null) n++;
  if (f.minElevationGainM !== null || f.maxElevationGainM !== null) n++;
  return n;
}

export function hasActiveFilters(f: FilterState): boolean {
  return (
    !!f.search ||
    f.favoritesOnly ||
    f.difficulties.length > 0 ||
    advancedCount(f) > 0
  );
}

export function FilterBar() {
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const routes = useAppStore((s) => s.routes);
  const range = useRouteMetricRange();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [query, setQuery] = useState(filters.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when filters are reset from elsewhere (e.g. "Clear all").
  useEffect(() => {
    setQuery(filters.search);
  }, [filters.search]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilters({ search: value }), 200);
  };

  const clearSearch = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setQuery('');
    setFilters({ search: '' });
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

  // Only offer the type filter when the data actually has types to choose from.
  const availableTypes = ROUTE_TYPES.filter((t) => routes.some((r) => r.type === t));
  const extraCount = advancedCount(filters);

  const minElevation = filters.minElevationGainM ?? range.minElevation;
  const maxElevation = filters.maxElevationGainM ?? range.maxElevation;

  return (
    <div className="px-4 pb-3 space-y-2.5 shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            inputMode="search"
            placeholder="Search by name or tag"
            className="w-full h-10 bg-white/[0.05] border border-white/[0.07] text-white text-sm rounded-lg pl-9 pr-9 outline-none focus:border-primary/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/15 transition placeholder:text-gray-500"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') clearSearch(); }}
            aria-label="Search routes"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-white/[0.08] transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          className={`relative h-10 flex items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
            advancedOpen || extraCount > 0
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-white/[0.07] bg-white/[0.05] text-gray-300 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {extraCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center tabular-nums">
              {extraCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-4 px-4">
        <Chip
          active={filters.favoritesOnly}
          onClick={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
        >
          <Heart size={12} fill={filters.favoritesOnly ? 'currentColor' : 'none'} strokeWidth={2.25} />
          Saved
        </Chip>
        {DIFFICULTIES.map((d) => (
          <Chip key={d} active={filters.difficulties.includes(d)} onClick={() => toggleDifficulty(d)}>
            <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[d]}`} />
            {DIFFICULTY_LABEL[d]}
          </Chip>
        ))}
      </div>

      {advancedOpen && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 space-y-5">
          <div>
            <SectionLabel>Distance (km)</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {DISTANCE_PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  active={filters.minDistanceKm === p.min && filters.maxDistanceKm === p.max}
                  onClick={() => setFilters({ minDistanceKm: p.min, maxDistanceKm: p.max })}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          <DualRange
            label="Elevation gain"
            unit="m"
            min={range.minElevation}
            max={range.maxElevation}
            step={10}
            valueMin={minElevation}
            valueMax={maxElevation}
            onChange={(lo, hi) =>
              setFilters({
                minElevationGainM: lo <= range.minElevation ? null : lo,
                maxElevationGainM: hi >= range.maxElevation ? null : hi,
              })
            }
          />

          {availableTypes.length > 0 && (
            <div>
              <SectionLabel>Route type</SectionLabel>
              <div className="flex gap-1.5 flex-wrap">
                {availableTypes.map((t) => (
                  <Chip key={t} active={filters.routeTypes.includes(t)} onClick={() => toggleType(t)}>
                    {ROUTE_TYPE_LABEL[t]}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-white text-black border-white'
          : 'bg-transparent border-white/[0.09] text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-gray-400 mb-2">{children}</div>;
}

/** Single-track, two-thumb range slider built from two overlaid native inputs. */
function DualRange({
  label,
  unit,
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (lo: number, hi: number) => void;
}) {
  const span = Math.max(max - min, 1);
  const loPct = ((valueMin - min) / span) * 100;
  const hiPct = ((valueMax - min) / span) * 100;
  const isFull = valueMin <= min && valueMax >= max;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <SectionLabel>{label}</SectionLabel>
        <span className="text-xs text-gray-300 tabular-nums">
          {isFull ? 'Any' : `${valueMin.toLocaleString()}–${valueMax.toLocaleString()} ${unit}`}
        </span>
      </div>
      <div className="dual-range relative h-5">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/[0.08]" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
          aria-label={`Minimum ${label.toLowerCase()}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
          aria-label={`Maximum ${label.toLowerCase()}`}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-600 tabular-nums mt-1">
        <span>{min.toLocaleString()} {unit}</span>
        <span>{max.toLocaleString()} {unit}</span>
      </div>
    </div>
  );
}
