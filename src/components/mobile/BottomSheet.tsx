import { useRef, useState, useEffect, type ReactNode } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const SNAP_COLLAPSED = 0.08; // 8vh visible
const SNAP_HALF = 0.42;      // 42vh visible
const SNAP_EXPANDED = 0.88;  // 88vh visible

interface Props {
  children: ReactNode;
}

export function BottomSheet({ children }: Props) {
  const [snapRatio, setSnapRatio] = useState(SNAP_HALF);
  const selectedRouteId = useAppStore((s) => s.selectedRouteId);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getVh = () => window.innerHeight;

  const snapTo = (ratio: number) => {
    const target = (1 - ratio) * getVh();
    animate(y, target, { type: 'spring', stiffness: 320, damping: 32 });
    setSnapRatio(ratio);
  };

  // Snap to half when a route is selected
  useEffect(() => {
    if (selectedRouteId && snapRatio < SNAP_HALF) {
      snapTo(SNAP_HALF);
    }
  }, [selectedRouteId]);

  // Initialize position
  useEffect(() => {
    y.set((1 - SNAP_HALF) * getVh());
  }, []);

  const handleDragEnd = (_: unknown, info: { velocity: { y: number }; offset: { y: number } }) => {
    const vh = getVh();
    const currentRatio = 1 - y.get() / vh;
    const vel = info.velocity.y;

    let target: number;
    if (vel > 300) {
      // Flick down
      target = currentRatio < SNAP_HALF ? SNAP_COLLAPSED : SNAP_HALF;
    } else if (vel < -300) {
      // Flick up
      target = currentRatio > SNAP_HALF ? SNAP_EXPANDED : SNAP_HALF;
    } else {
      // Snap to nearest
      const dists = [SNAP_COLLAPSED, SNAP_HALF, SNAP_EXPANDED].map((s) => Math.abs(s - currentRatio));
      target = [SNAP_COLLAPSED, SNAP_HALF, SNAP_EXPANDED][dists.indexOf(Math.min(...dists))];
    }
    snapTo(target);
  };

  const sheetHeight = `${Math.round(SNAP_EXPANDED * 100)}vh`;

  return (
    <motion.div
      ref={containerRef}
      className="fixed left-0 right-0 bottom-0 z-50 bg-surface rounded-t-2xl shadow-2xl flex flex-col"
      style={{ height: sheetHeight, y, touchAction: 'none' }}
      drag="y"
      dragConstraints={{ top: (1 - SNAP_EXPANDED) * 1000, bottom: (1 - SNAP_COLLAPSED) * 1000 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
    >
      {/* Drag handle */}
      <div className="shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing">
        <div className="w-10 h-1 bg-surface-overlay rounded-full" />
      </div>

      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </motion.div>
  );
}
