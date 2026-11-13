import { useAppStore } from '../../store/useAppStore';
import { RouteBrowser } from './RouteBrowser';
import { RouteDetail } from './RouteDetail';

export function Sidebar() {
  const sidebarMode = useAppStore((s) => s.sidebarMode);

  return (
    <aside className="w-[420px] shrink-0 h-full bg-surface flex flex-col border-l border-white/[0.06] overflow-hidden">
      {sidebarMode === 'detail' ? <RouteDetail /> : <RouteBrowser />}
    </aside>
  );
}
