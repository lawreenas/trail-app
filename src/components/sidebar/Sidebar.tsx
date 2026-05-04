import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { FilterBar } from './FilterBar';
import { RouteList } from './RouteList';
import { RouteDetail } from './RouteDetail';

export function Sidebar() {
  const sidebarMode = useAppStore((s) => s.sidebarMode);

  return (
    <div className="w-[360px] shrink-0 h-full bg-surface flex flex-col border-l border-surface-overlay overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-overlay shrink-0">
        <h1 className="text-base font-bold text-white tracking-tight">🏔 Trail Routes</h1>
      </div>

      <AnimatePresence mode="wait">
        {sidebarMode === 'list' ? (
          <div key="list" className="flex flex-col flex-1 overflow-hidden">
            <FilterBar />
            <RouteList />
          </div>
        ) : (
          <RouteDetail key="detail" />
        )}
      </AnimatePresence>
    </div>
  );
}
