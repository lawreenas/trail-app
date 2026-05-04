import { useAppStore } from '../../store/useAppStore';
import { RouteDetail } from '../sidebar/RouteDetail';
import { FilterBar } from '../sidebar/FilterBar';
import { RouteList } from '../sidebar/RouteList';

export function MobileContent() {
  const sidebarMode = useAppStore((s) => s.sidebarMode);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-2 shrink-0">
        <h1 className="text-sm font-bold text-white">🏔 Trail Routes</h1>
      </div>
      {sidebarMode === 'list' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <FilterBar />
          <RouteList />
        </div>
      ) : (
        <RouteDetail />
      )}
    </div>
  );
}
