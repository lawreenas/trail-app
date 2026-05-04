import { useAppStore } from '../../store/useAppStore';

export function MapThemeToggle() {
  const theme = useAppStore((s) => s.mapTheme);
  const setTheme = useAppStore((s) => s.setMapTheme);
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} map`}
      title={`Switch to ${next} map`}
      className="absolute top-4 left-4 z-[1000] flex items-center justify-center w-10 h-10 rounded-full bg-surface-raised/95 backdrop-blur border border-surface-overlay text-base text-white hover:bg-surface-overlay transition-colors shadow-lg"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '🌙'}</span>
    </button>
  );
}
