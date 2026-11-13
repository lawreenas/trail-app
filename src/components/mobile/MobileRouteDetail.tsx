import { useAppStore } from '../../store/useAppStore';
import { RouteDetail } from '../sidebar/RouteDetail';
import { RouteBrowser } from '../sidebar/RouteBrowser';

export function MobileContent() {
  const sidebarMode = useAppStore((s) => s.sidebarMode);

  if (sidebarMode === 'detail') return <RouteDetail />;
  return <RouteBrowser compactHeader />;
}
