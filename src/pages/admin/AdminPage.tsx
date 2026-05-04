import { useState, type FormEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UploadZone } from './UploadZone';
import { RouteEditor } from './RouteEditor';
import { ExportPanel } from './ExportPanel';
import type { TrailRoute } from '../../types';

type Tab = 'upload' | 'export';

export function AdminPage() {
  const isAdminAuthenticated = useAppStore((s) => s.isAdminAuthenticated);
  const authenticateAdmin = useAppStore((s) => s.authenticateAdmin);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [tab, setTab] = useState<Tab>('upload');
  const [pendingRoute, setPendingRoute] = useState<Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'> | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await authenticateAdmin(password);
    if (!ok) setAuthError(true);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface-raised rounded-2xl p-6 space-y-4">
          <h1 className="text-xl font-bold text-white">🔐 Admin</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
              placeholder="Admin password"
              className="w-full bg-surface-overlay text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-accent/50"
              autoFocus
            />
            {authError && <p className="text-sm text-red-400">Incorrect password</p>}
            <button
              type="submit"
              className="w-full bg-accent text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-accent-muted transition-colors"
            >
              Sign in
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center">
            In dev mode (no VITE_ADMIN_PASSWORD_HASH set), any password works.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">🔧 Admin Panel</h1>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Back to map</a>
        </div>

        <div className="flex gap-1 bg-surface-raised rounded-xl p-1">
          {(['upload', 'export'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                tab === t ? 'bg-surface-overlay text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'upload' ? '📁 Upload Route' : '📤 Export & Manage'}
            </button>
          ))}
        </div>

        <div className="bg-surface-raised rounded-2xl p-5">
          {tab === 'upload' ? (
            pendingRoute ? (
              <RouteEditor
                partial={pendingRoute}
                onSaved={() => setPendingRoute(null)}
                onCancel={() => setPendingRoute(null)}
              />
            ) : (
              <UploadZone onParsed={setPendingRoute} />
            )
          ) : (
            <ExportPanel />
          )}
        </div>
      </div>
    </div>
  );
}
