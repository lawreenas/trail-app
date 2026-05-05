import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useAppStore } from '../store/useAppStore';
import { TrailMap } from '../components/map/TrailMap';
import { MapThemeToggle } from '../components/map/MapThemeToggle';
import { MapControls } from '../components/map/MapControls';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MobileFAB } from '../components/mobile/MobileFAB';
import { MobileDrawer } from '../components/mobile/MobileDrawer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export function MapPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setSidebarMode = useAppStore((s) => s.setSidebarMode);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Selecting a route (e.g. tapping a marker on the map) auto-opens the drawer.
  useEffect(() => {
    if (!isDesktop && selectedRouteId) setDrawerOpen(true);
  }, [isDesktop, selectedRouteId]);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Clear selection so re-opening starts at the list, not at a stale detail view.
    selectRoute(null);
    setSidebarMode('list');
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface">
      <ErrorBoundary>
        <div className={isDesktop ? 'relative flex-1 h-full' : 'absolute inset-0'}>
          <TrailMap />
          <MapThemeToggle />
          <MapControls />
        </div>
      </ErrorBoundary>

      {isDesktop ? (
        <Sidebar />
      ) : (
        <>
          {!drawerOpen && <MobileFAB onClick={() => setDrawerOpen(true)} />}
          <AnimatePresence>
            {drawerOpen && <MobileDrawer onClose={handleDrawerClose} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
