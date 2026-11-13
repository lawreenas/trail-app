import { useState } from 'react';
import { Route, LocateFixed, Locate, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MapLayerPicker } from './MapThemeToggle';

export function MapControls() {
  const showAll = useAppStore((s) => s.showAllTracks);
  const setShowAll = useAppStore((s) => s.setShowAllTracks);
  const userLocation = useAppStore((s) => s.userLocation);
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <MapLayerPicker />
      <div className="map-control-group">
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          aria-pressed={showAll}
          title={showAll ? 'Hide other routes' : 'Show all routes'}
          aria-label={showAll ? 'Hide other routes' : 'Show all routes'}
          className={`map-control ${showAll ? '' : 'text-gray-500'}`}
        >
          <Route size={17} />
        </button>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          title="Show my location"
          aria-label="Show my location"
          className={`map-control ${userLocation ? 'text-primary' : ''}`}
        >
          {locating ? (
            <Loader2 size={17} className="animate-spin" />
          ) : userLocation ? (
            <LocateFixed size={17} />
          ) : (
            <Locate size={17} />
          )}
        </button>
      </div>
    </div>
  );
}
