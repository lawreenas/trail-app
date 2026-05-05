import { useFilteredRoutes } from '../../store/useAppStore';
import { RouteCard } from './RouteCard';

export function RouteList() {
  const routes = useFilteredRoutes();

  if (routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-gray-500">No routes match.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {routes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
