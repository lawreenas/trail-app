import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDistance } from '../../utils/formatters';
import { ROUTE_TYPE_LABEL, formatGain, tagColor } from '../../utils/routeMeta';
import type { TrailRoute } from '../../types';

interface Props {
  onEdit: (route: TrailRoute) => void;
  onUpload: () => void;
}

export function RouteList({ onEdit, onUpload }: Props) {
  const routes = useAppStore((s) => s.routes);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return routes.filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [routes, search]);

  const localCount = routes.filter((r) => r.source === 'local').length;
  const deletedCount = useAppStore((s) => s.pendingDeletions.length);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Routes</h2>
          <p className="text-xs text-gray-500 mt-1">
            <span className="tabular-nums">{routes.length}</span> total
            {localCount > 0 && (
              <span className="ml-2 text-amber-400">
                · <span className="tabular-nums">{localCount}</span> unpublished
              </span>
            )}
            {deletedCount > 0 && (
              <span className="ml-2 text-amber-400">
                · <span className="tabular-nums">{deletedCount}</span> deleted
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onUpload}
          className="bg-white text-black text-sm font-medium rounded-md px-3.5 py-2 hover:bg-gray-200 transition-colors"
        >
          Upload GPX
        </button>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or tag…"
          className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-md px-3 py-2 outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors placeholder:text-gray-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-500">
          {routes.length === 0 ? (
            <>
              No routes yet.{' '}
              <button onClick={onUpload} className="text-white hover:underline">
                Upload a GPX
              </button>{' '}
              to begin.
            </>
          ) : (
            'No routes match.'
          )}
        </div>
      ) : (
        <ul className="border-t border-white/[0.06]">
          {filtered.map((route) => (
            <li key={route.id}>
              <RouteRow route={route} onEdit={() => onEdit(route)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RouteRow({ route, onEdit }: { route: TrailRoute; onEdit: () => void }) {
  const tagLibrary = useAppStore((s) => s.tagLibrary);
  const deleteRoute = useAppStore((s) => s.deleteRoute);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRoute(route.id);
    } finally {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-4 border-b border-white/[0.06] py-4 px-3 -mx-2 rounded-md bg-red-500/[0.05]">
        <p className="flex-1 min-w-0 text-sm text-white truncate">
          Delete <span className="font-medium">{route.name}</span>?
        </p>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          autoFocus
          className="bg-red-500 text-white text-sm font-medium rounded-md px-3 py-1.5 hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 border-b border-white/[0.06] -mx-2">
      <button
        onClick={onEdit}
        className="flex-1 min-w-0 text-left py-4 px-2 rounded-md hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h3 className="text-[15px] font-medium text-white truncate flex-1">
                {route.name}
              </h3>
              {route.source === 'local' && (
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-medium shrink-0">
                  unpublished
                </span>
              )}
            </div>

            {route.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                {route.tags.map((name) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: tagColor(name, tagLibrary) }}
                    />
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 text-right shrink-0">
            <div className="flex items-baseline gap-3 text-sm font-medium text-white tabular-nums">
              <span>{formatDistance(route.metrics.distanceKm)}</span>
              <span>{formatGain(route)}</span>
            </div>
            {route.type && (
              <span className="text-[11px] text-gray-500">{ROUTE_TYPE_LABEL[route.type]}</span>
            )}
          </div>

          <span className="text-gray-600 group-hover:text-gray-300 transition-colors text-sm self-center">→</span>
        </div>
      </button>
      <button
        onClick={() => setConfirming(true)}
        title="Delete route"
        aria-label={`Delete ${route.name}`}
        className="shrink-0 w-9 h-9 mr-1 flex items-center justify-center rounded-md text-gray-600 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
