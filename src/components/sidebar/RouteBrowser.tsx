import { useAppStore } from '../../store/useAppStore';
import { Brand } from '../ui/Logo';
import { FilterBar } from './FilterBar';
import { RouteList } from './RouteList';

/** Header + filters + results. Shared by the desktop sidebar and the mobile drawer. */
export function RouteBrowser({ compactHeader = false }: { compactHeader?: boolean }) {
  const routes = useAppStore((s) => s.routes);
  const uniqueRegions = Array.from(new Set(routes.map((r) => r.region).filter(Boolean)));
  const subtitle =
    uniqueRegions.length === 1
      ? `Trail running routes around ${uniqueRegions[0]}`
      : 'Trail running routes';

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className={`px-4 shrink-0 ${compactHeader ? 'pt-1 pb-4' : 'pt-5 pb-4'}`}>
        <Brand subtitle={subtitle} />
      </div>
      <FilterBar />
      <RouteList />
    </div>
  );
}
