import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

// Hash format: `#/?r=<routeId>`. We manipulate window.location.hash directly
// rather than going through react-router so the two-way binding stays simple
// and doesn't fight router-driven re-renders.

function parseRouteIdFromHash(): string | null {
  const hash = window.location.hash;
  const q = hash.indexOf('?');
  if (q === -1) return null;
  return new URLSearchParams(hash.slice(q + 1)).get('r');
}

function writeRouteIdToHash(id: string | null) {
  const hash = window.location.hash || '#/';
  const [path, queryStr = ''] = hash.slice(1).split('?');
  const params = new URLSearchParams(queryStr);
  if (id) params.set('r', id);
  else params.delete('r');
  const queryPart = params.toString();
  const next = queryPart ? `#${path}?${queryPart}` : `#${path}`;
  if (next === hash) return;
  window.history.pushState(null, '', next);
}

/**
 * Two-way binding between `selectedRouteId` and the URL `?r=` query param.
 * - On initial routes load, hydrates selection from the URL.
 * - When the user uses back/forward, syncs selection to whatever the URL says.
 * - When the user picks a route via the UI, pushes the new URL into history.
 */
export function useRouteUrlSync() {
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const routes = useAppStore((s) => s.routes);
  const initialized = useRef(false);

  // Initial hydrate — runs once after routes load
  useEffect(() => {
    if (initialized.current || routes.length === 0) return;
    initialized.current = true;
    const fromUrl = parseRouteIdFromHash();
    if (fromUrl && routes.some((r) => r.id === fromUrl)) {
      useAppStore.getState().selectRoute(fromUrl);
    }
  }, [routes.length]);

  // Browser back/forward (or external hash edits) → state
  useEffect(() => {
    const handler = () => {
      const fromUrl = parseRouteIdFromHash();
      const state = useAppStore.getState();
      if (fromUrl === state.selectedRouteId) return;
      if (fromUrl === null) {
        state.selectRoute(null);
      } else if (state.routes.some((r) => r.id === fromUrl)) {
        state.selectRoute(fromUrl);
      }
    };
    window.addEventListener('popstate', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('hashchange', handler);
    };
  }, []);

  // State → URL
  useEffect(() => {
    if (!initialized.current) return;
    if (parseRouteIdFromHash() !== selectedRouteId) {
      writeRouteIdToHash(selectedRouteId);
    }
  }, [selectedRouteId]);
}
