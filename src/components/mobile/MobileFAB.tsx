import { Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onClick: () => void;
}

/** Bottom search bar — reads as "tap to explore" rather than a generic floating button. */
export function MobileFAB({ onClick }: Props) {
  const totalRoutes = useAppStore((s) => s.routes.length);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Browse routes"
      className="fixed left-4 right-4 z-[1100] flex items-center gap-3 h-14 pl-4 pr-2 rounded-2xl bg-surface-raised/95 backdrop-blur-md border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.55)] active:scale-[0.99] transition-transform text-left"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <Search size={18} className="text-gray-400 shrink-0" />
      <span className="flex-1 text-[15px] text-gray-300">Find a route</span>
      <span className="h-10 px-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center tabular-nums">
        {totalRoutes} routes
      </span>
    </button>
  );
}
