import { ChevronDown, SearchX } from 'lucide-react';
import { useAppStore, useFilteredRoutes } from '../../store/useAppStore';
import { EMPTY_FILTERS, hasActiveFilters } from './FilterBar';
import { RouteCard } from './RouteCard';
import type { SortKey } from '../../types';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'distance-asc', label: 'Shortest first' },
  { value: 'distance-desc', label: 'Longest first' },
  { value: 'elevation-desc', label: 'Most climbing' },
  { value: 'elevation-asc', label: 'Least climbing' },
  { value: 'recent', label: 'Recently added' },
];

export function RouteList() {
  const routes = useFilteredRoutes();
  const total = useAppStore((s) => s.routes.length);
  const isLoading = useAppStore((s) => s.isLoading);
  const loadError = useAppStore((s) => s.loadError);
  const loadRoutes = useAppStore((s) => s.loadRoutes);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const filtered = hasActiveFilters(filters);

  if (loadError) {
    return (
      <EmptyState
        title="Couldn’t load routes"
        body="Check your connection and try again."
        action={{ label: 'Retry', onClick: () => loadRoutes() }}
      />
    );
  }

  if (isLoading && total === 0) {
    return (
      <ul className="flex-1 overflow-hidden pt-1" aria-busy="true" aria-label="Loading routes">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="mx-2 px-3 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-white/[0.04] animate-pulse" />
            </div>
            <div className="w-[72px] h-7 rounded bg-white/[0.04] animate-pulse" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between gap-3 px-5 py-2 border-y border-white/[0.06] shrink-0">
        <p className="text-xs text-gray-400 tabular-nums" aria-live="polite">
          {filtered ? (
            <>
              <span className="text-white font-medium">{routes.length}</span> of {total} routes
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="ml-2 text-primary hover:underline underline-offset-2"
              >
                Clear
              </button>
            </>
          ) : (
            <>
              <span className="text-white font-medium">{total}</span> routes
            </>
          )}
        </p>
        <label className="relative flex items-center gap-1 text-xs text-gray-400">
          <span className="sr-only">Sort routes</span>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ sort: e.target.value as SortKey })}
            className="appearance-none bg-transparent text-gray-200 font-medium pr-5 py-1 outline-none cursor-pointer hover:text-white focus-visible:text-primary"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-surface-raised">
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-0 pointer-events-none text-gray-500" />
        </label>
      </div>

      {routes.length === 0 ? (
        <EmptyState
          title="No routes match"
          body="Try a different search or loosen your filters."
          action={filtered ? { label: 'Clear all filters', onClick: () => setFilters(EMPTY_FILTERS) } : undefined}
        />
      ) : (
        <ul className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
      <div className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-500 mb-4">
        <SearchX size={18} />
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{body}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 h-8 px-3.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-xs font-medium text-white transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
