import { useState, type FormEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UploadZone } from './UploadZone';
import { RouteEditor } from './RouteEditor';
import { RouteList } from './RouteList';
import { ExportPanel } from './ExportPanel';
import type { TrailRoute } from '../../types';

type View = 'routes' | 'export';
type RoutesMode = { kind: 'list' } | { kind: 'upload' } | { kind: 'edit'; route: TrailRoute } | { kind: 'create'; partial: PendingUpload };
type PendingUpload = Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'>;

export function AdminPage() {
  const isAdminAuthenticated = useAppStore((s) => s.isAdminAuthenticated);

  if (!isAdminAuthenticated) return <LoginScreen />;

  return <AdminShell />;
}

function AdminShell() {
  const localCount = useAppStore((s) => s.routes.filter((r) => r.source === 'local').length);
  const [view, setView] = useState<View>('routes');
  const [mode, setMode] = useState<RoutesMode>({ kind: 'list' });

  const goToList = () => setMode({ kind: 'list' });
  const switchView = (next: View) => {
    setView(next);
    setMode({ kind: 'list' });
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      <header className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-base font-semibold tracking-tight">Admin</h1>
            <span className="text-xs text-gray-500">Trail data</span>
          </div>
          <a href="#/" className="text-xs text-gray-400 hover:text-white transition-colors">
            ← Back to map
          </a>
        </div>

        <nav className="max-w-5xl mx-auto px-6 sm:px-10 flex gap-6 -mb-px">
          <NavTab active={view === 'routes'} onClick={() => switchView('routes')} label="Routes" />
          <NavTab
            active={view === 'export'}
            onClick={() => switchView('export')}
            label="Export"
            badge={localCount > 0 ? localCount : undefined}
          />
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        {view === 'routes' && (
          <>
            {mode.kind === 'list' && (
              <RouteList
                onEdit={(route) => setMode({ kind: 'edit', route })}
                onUpload={() => setMode({ kind: 'upload' })}
              />
            )}

            {mode.kind === 'upload' && (
              <Pane title="Upload GPX" subtitle="Drop a .gpx file to begin" onBack={goToList}>
                <UploadZone onParsed={(partial) => setMode({ kind: 'create', partial })} />
              </Pane>
            )}

            {mode.kind === 'create' && (
              <Pane title="New route" subtitle="Fill in the details before saving" onBack={goToList}>
                <RouteEditor
                  partial={mode.partial}
                  onSaved={goToList}
                  onCancel={goToList}
                />
              </Pane>
            )}

            {mode.kind === 'edit' && (
              <Pane
                title="Edit route"
                subtitle={mode.route.id}
                subtitleMono
                onBack={goToList}
              >
                <RouteEditor
                  key={mode.route.id}
                  partial={mode.route}
                  existing={mode.route}
                  onSaved={goToList}
                  onCancel={goToList}
                />
              </Pane>
            )}
          </>
        )}

        {view === 'export' && <ExportPanel />}
      </main>
    </div>
  );
}

function NavTab({ active, onClick, label, badge }: { active: boolean; onClick: () => void; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-3 text-sm font-medium transition-colors ${
        active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {label}
        {badge !== undefined && (
          <span className="text-[10px] font-semibold text-amber-400 tabular-nums">
            {badge}
          </span>
        )}
      </span>
      {active && <span className="absolute left-0 right-0 -bottom-px h-px bg-white" />}
    </button>
  );
}

function Pane({
  title,
  subtitle,
  subtitleMono,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  subtitleMono?: boolean;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2"
          >
            ← Routes
          </button>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className={`text-xs text-gray-500 mt-1 ${subtitleMono ? 'font-mono' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function LoginScreen() {
  const authenticateAdmin = useAppStore((s) => s.authenticateAdmin);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await authenticateAdmin(password);
    if (!ok) setAuthError(true);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Sign in to manage routes</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
            placeholder="Password"
            className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-md px-3 py-2.5 outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors placeholder:text-gray-600"
            autoFocus
          />
          {authError && <p className="text-xs text-red-400">Incorrect password</p>}
          <button
            type="submit"
            className="w-full bg-white text-black text-sm font-medium rounded-md py-2.5 hover:bg-gray-200 transition-colors"
          >
            Sign in
          </button>
        </form>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Dev mode (no <code className="text-gray-500">VITE_ADMIN_PASSWORD_HASH</code>) accepts any password.
        </p>
      </div>
    </div>
  );
}
