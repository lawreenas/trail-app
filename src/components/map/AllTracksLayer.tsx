import { useAppStore, useFilteredRoutes } from '../../store/useAppStore';
import { TrackPolyline } from './TrackPolyline';

export function AllTracksLayer() {
  const filteredRoutes = useFilteredRoutes();
  const tracks = useAppStore((s) => s.tracks);

  return (
    <>
      {filteredRoutes.map((route) => {
        const coords = tracks[route.id];
        if (!coords || coords.length < 2) return null;
        return (
          <TrackPolyline
            key={route.id}
            routeId={route.id}
            coords={coords}
          />
        );
      })}
    </>
  );
}
