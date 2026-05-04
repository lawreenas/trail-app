import { useFilteredRoutes } from '../../store/useAppStore';
import { StartMarker } from './StartMarker';

export function StartMarkersLayer() {
  const routes = useFilteredRoutes();
  return (
    <>
      {routes.map((route) => (
        <StartMarker key={route.id} route={route} />
      ))}
    </>
  );
}
