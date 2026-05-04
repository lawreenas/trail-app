import { useFilteredRoutes } from '../../store/useAppStore';
import { RouteCard } from './RouteCard';

export function RouteList() {
  const routes = useFilteredRoutes();

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 p-8">
        <span className="text-3xl">🥾</span>
        <p className="text-sm text-center">No routes match your filters</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
      {routes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
