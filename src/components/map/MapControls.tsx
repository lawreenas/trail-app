import { useState } from 'react';
import { Eye, EyeOff, Locate, LocateFixed } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

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
    <div className="absolute top-16 right-4 z-[1000] flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setShowAll(!showAll)}
        title={showAll ? 'Hide other tracks' : 'Show all tracks'}
        aria-label={showAll ? 'Hide other tracks' : 'Show all tracks'}
        className={`flex items-center justify-center w-9 h-9 rounded-md backdrop-blur-md border transition-colors shadow-lg ${
          showAll
            ? 'bg-black/60 border-white/10 text-white hover:bg-black/80'
            : 'bg-black/60 border-white/10 text-gray-500 hover:text-white hover:bg-black/80'
        }`}
      >
        {showAll ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>

      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        title="Center on my location"
        aria-label="Center on my location"
        className={`flex items-center justify-center w-9 h-9 rounded-md backdrop-blur-md border transition-colors shadow-lg ${
          userLocation
            ? 'bg-black/60 border-primary/30 text-primary hover:bg-black/80'
            : 'bg-black/60 border-white/10 text-white hover:bg-black/80'
        } ${locating ? 'animate-pulse' : ''}`}
      >
        {userLocation ? <LocateFixed size={15} /> : <Locate size={15} />}
      </button>
    </div>
  );
}
