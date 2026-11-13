import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useAppStore } from '../store/useAppStore';
import { TrailMap } from '../components/map/TrailMap';
import { MapControls } from '../components/map/MapControls';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MobileFAB } from '../components/mobile/MobileFAB';
import { MobileDrawer } from '../components/mobile/MobileDrawer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { LogoMark } from '../components/ui/Logo';

export function MapPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setSidebarMode = useAppStore((s) => s.setSidebarMode);
  const sidebarMode = useAppStore((s) => s.sidebarMode);

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
          <MapControls />
          {!isDesktop && (
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 h-10 pl-1.5 pr-3.5 rounded-xl bg-surface-raised/90 backdrop-blur-md border border-white/10 shadow-xl">
              <LogoMark size={28} />
              <span className="font-display text-lg font-semibold tracking-wide uppercase text-white">Trails</span>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {isDesktop ? (
        <Sidebar />
      ) : (
        <>
          {!drawerOpen && <MobileFAB onClick={() => setDrawerOpen(true)} />}
          <AnimatePresence>
            {drawerOpen && <MobileDrawer onClose={handleDrawerClose} compact={sidebarMode === 'detail'} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
