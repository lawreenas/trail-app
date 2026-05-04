import { useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Difficulty } from '../../types';

const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'hard', 'expert'];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: 'border-difficulty-easy text-difficulty-easy',
  moderate: 'border-difficulty-moderate text-difficulty-moderate',
  hard: 'border-difficulty-hard text-difficulty-hard',
  expert: 'border-difficulty-expert text-difficulty-expert',
};

const DIFF_ACTIVE: Record<Difficulty, string> = {
  easy: 'bg-difficulty-easy/20 border-difficulty-easy text-difficulty-easy',
  moderate: 'bg-difficulty-moderate/20 border-difficulty-moderate text-difficulty-moderate',
  hard: 'bg-difficulty-hard/20 border-difficulty-hard text-difficulty-hard',
  expert: 'bg-difficulty-expert/20 border-difficulty-expert text-difficulty-expert',
};

export function FilterBar() {
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const routes = useAppStore((s) => s.routes);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const regions = Array.from(new Set(routes.map((r) => r.region).filter(Boolean))).sort();
  const hasActiveFilters =
    filters.search ||
    filters.difficulties.length > 0 ||
    filters.minDistanceKm !== null ||
    filters.maxDistanceKm !== null ||
    filters.region !== null;

  const handleSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilters({ search: value }), 300);
  };

  const toggleDifficulty = (d: Difficulty) => {
    const current = filters.difficulties;
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
    setFilters({ difficulties: next });
  };

  const clearFilters = () =>
    setFilters({ search: '', difficulties: [], minDistanceKm: null, maxDistanceKm: null, region: null });

  return (
    <div className="px-4 py-3 border-b border-surface-overlay space-y-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search"
            placeholder="Search routes…"
            className="w-full bg-surface-overlay text-white text-sm rounded-lg pl-8 pr-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-accent/50"
            defaultValue={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search routes"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => toggleDifficulty(d)}
            className={`px-2.5 py-0.5 rounded-full text-xs border capitalize transition-colors ${
              filters.difficulties.includes(d) ? DIFF_ACTIVE[d] : `border-surface-overlay text-gray-400 hover:${DIFF_COLORS[d]}`
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {regions.length > 1 && (
        <select
          value={filters.region ?? ''}
          onChange={(e) => setFilters({ region: e.target.value || null })}
          className="w-full bg-surface-overlay text-sm text-gray-300 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-accent/50"
          aria-label="Filter by region"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      )}
    </div>
  );
}
