import { useAppStore } from '../../store/useAppStore';
import type { RoutesDataFile } from '../../types';

export function ExportPanel() {
  const routes = useAppStore((s) => s.routes);
  const deleteRoute = useAppStore((s) => s.deleteRoute);

  const localCount = routes.filter((r) => r.source === 'local').length;
  const publicCount = routes.filter((r) => r.source === 'public').length;

  const handleExport = () => {
    const data: RoutesDataFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      routes: routes.map(({ source: _source, ...rest }) => rest),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routes-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface-raised rounded-xl p-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Published routes</span>
          <span className="text-white font-semibold">{publicCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Local (unpublished)</span>
          <span className={localCount > 0 ? 'text-yellow-400 font-semibold' : 'text-white font-semibold'}>{localCount}</span>
        </div>
        <div className="flex justify-between border-t border-surface-overlay pt-1 mt-1">
          <span className="text-gray-300">Total</span>
          <span className="text-white font-bold">{routes.length}</span>
        </div>
      </div>

      {localCount > 0 && (
        <p className="text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-3 py-2">
          ⚠ You have {localCount} unpublished route{localCount > 1 ? 's' : ''}. Export and commit <code>routes-data.json</code> to publish them.
        </p>
      )}

      <button
        onClick={handleExport}
        disabled={routes.length === 0}
        className="w-full bg-accent text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-accent-muted transition-colors disabled:opacity-50"
      >
        Export routes-data.json
      </button>

      <div className="text-xs text-gray-500">
        After exporting, commit the file to <code className="text-gray-300">public/routes-data.json</code> and push to trigger a GitHub Pages deploy.
      </div>

      {routes.length > 0 && (
        <div className="border-t border-surface-overlay pt-4">
          <p className="text-xs text-gray-400 mb-2">Manage routes</p>
          <div className="space-y-1">
            {routes.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-200 truncate flex-1">{r.name}</span>
                {r.source === 'local' && (
                  <button
                    onClick={() => { if (confirm(`Delete "${r.name}"?`)) deleteRoute(r.id); }}
                    className="ml-2 text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
