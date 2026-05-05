import { useAppStore } from '../../store/useAppStore';
import { RouteDetail } from '../sidebar/RouteDetail';
import { FilterBar } from '../sidebar/FilterBar';
import { RouteList } from '../sidebar/RouteList';

export function MobileContent() {
  const sidebarMode = useAppStore((s) => s.sidebarMode);
  const totalRoutes = useAppStore((s) => s.routes.length);

  if (sidebarMode === 'detail') return <RouteDetail />;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 pb-3 shrink-0">
        <h1 className="font-display text-xl font-semibold tracking-wider text-white uppercase">
          Trails
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5 font-medium tabular-nums uppercase tracking-wider">
          {totalRoutes} route{totalRoutes === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <FilterBar />
        <RouteList />
      </div>
    </div>
  );
}
