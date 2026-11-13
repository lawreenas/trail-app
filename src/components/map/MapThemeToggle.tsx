import { useEffect, useRef, useState } from 'react';
import { Layers, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { MapTheme } from '../../types';

/** Swatches approximate each basemap so the choice is visual, not just a word. */
const THEMES: Array<{ id: MapTheme; label: string; swatch: string }> = [
  { id: 'dark', label: 'Dark', swatch: 'linear-gradient(135deg,#2a2a2e 0%,#3b3b40 50%,#1c1c1f 100%)' },
  { id: 'light', label: 'Light', swatch: 'linear-gradient(135deg,#f4f4f2 0%,#e3e3e0 50%,#fafaf9 100%)' },
  { id: 'terrain', label: 'Terrain', swatch: 'linear-gradient(135deg,#cfdcb4 0%,#e9dfc4 45%,#b9c99a 100%)' },
  { id: 'satellite', label: 'Satellite', swatch: 'linear-gradient(135deg,#27361f 0%,#4a5a3a 45%,#1f2a1a 100%)' },
];

export function MapLayerPicker() {
  const theme = useAppStore((s) => s.mapTheme);
  const setTheme = useAppStore((s) => s.setMapTheme);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Map style"
        aria-label="Map style"
        className={`map-control map-control-solo ${open ? 'text-primary' : ''}`}
      >
        <Layers size={17} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-full top-0 mr-2 w-[208px] p-2 rounded-xl bg-surface-raised/95 backdrop-blur-md border border-white/10 shadow-2xl grid grid-cols-2 gap-2"
        >
          {THEMES.map(({ id, label, swatch }) => {
            const active = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => { setTheme(id); setOpen(false); }}
                className="group text-left"
              >
                <span
                  className={`relative block h-14 rounded-lg border-2 transition-colors ${
                    active ? 'border-primary' : 'border-transparent group-hover:border-white/30'
                  }`}
                  style={{ background: swatch }}
                >
                  {active && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className={`block mt-1 text-xs font-medium ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
