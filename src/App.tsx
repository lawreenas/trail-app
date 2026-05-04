import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MapPage } from './pages/MapPage';
import { AdminPage } from './pages/admin/AdminPage';
import { useAppStore } from './store/useAppStore';
import { useRouteUrlSync } from './hooks/useRouteUrlSync';

function AppLoader() {
  const loadRoutes = useAppStore((s) => s.loadRoutes);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useRouteUrlSync();

  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppLoader />
    </HashRouter>
  );
}
