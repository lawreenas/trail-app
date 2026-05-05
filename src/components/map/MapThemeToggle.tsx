import { Moon, Sun, Mountain, Satellite } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { MapTheme } from '../../types';

const THEMES: Array<{ id: MapTheme; label: string; Icon: typeof Moon }> = [
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'terrain', label: 'Terrain', Icon: Mountain },
  { id: 'satellite', label: 'Satellite', Icon: Satellite },
];

export function MapThemeToggle() {
  const theme = useAppStore((s) => s.mapTheme);
  const setTheme = useAppStore((s) => s.setMapTheme);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-md p-1 gap-0.5 shadow-xl">
      {THEMES.map(({ id, label, Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-label={`Switch to ${label} map`}
            title={label}
            className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Icon size={14} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
