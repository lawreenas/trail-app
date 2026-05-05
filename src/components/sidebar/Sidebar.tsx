import { useAppStore } from '../../store/useAppStore';
import { FilterBar } from './FilterBar';
import { RouteList } from './RouteList';
import { RouteDetail } from './RouteDetail';

export function Sidebar() {
  const sidebarMode = useAppStore((s) => s.sidebarMode);
  const totalRoutes = useAppStore((s) => s.routes.length);

  return (
    <div className="w-[400px] shrink-0 h-full bg-surface flex flex-col border-l border-white/[0.06] overflow-hidden">
      {sidebarMode === 'detail' ? (
        <RouteDetail />
      ) : (
        <>
          <div className="px-5 pt-6 pb-4 shrink-0">
            <h1 className="font-display text-2xl font-semibold tracking-wider text-white uppercase">
              Trails
            </h1>
            <p className="text-[11px] text-gray-500 mt-1 font-medium tabular-nums uppercase tracking-wider">
              {totalRoutes} route{totalRoutes === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <FilterBar />
            <RouteList />
          </div>
        </>
      )}
    </div>
  );
}
