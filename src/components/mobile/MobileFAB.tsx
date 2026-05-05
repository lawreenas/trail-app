import { List } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onClick: () => void;
}

export function MobileFAB({ onClick }: Props) {
  const totalRoutes = useAppStore((s) => s.routes.length);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open route list"
      className="fixed right-5 z-[1100] flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm rounded-full pl-4 pr-5 py-3 shadow-[0_8px_24px_rgba(196,255,0,0.35)] hover:bg-primary-hover active:scale-95 transition-all"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
    >
      <List size={16} strokeWidth={2.25} />
      <span className="font-display tracking-wider uppercase">Routes</span>
      <span className="text-[11px] tabular-nums opacity-70 font-sans">
        {totalRoutes}
      </span>
    </button>
  );
}
