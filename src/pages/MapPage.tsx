import { useMediaQuery } from '../hooks/useMediaQuery';
import { TrailMap } from '../components/map/TrailMap';
import { Sidebar } from '../components/sidebar/Sidebar';
import { BottomSheet } from '../components/mobile/BottomSheet';
import { MobileContent } from '../components/mobile/MobileRouteDetail';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export function MapPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface">
      <ErrorBoundary>
        <div className={isDesktop ? 'flex-1 h-full' : 'absolute inset-0'}>
          <TrailMap />
        </div>
      </ErrorBoundary>

      {isDesktop ? (
        <Sidebar />
      ) : (
        <BottomSheet>
          <MobileContent />
        </BottomSheet>
      )}
    </div>
  );
}
