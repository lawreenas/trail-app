import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileContent } from './MobileRouteDetail';

interface Props {
  onClose: () => void;
}

const SWIPE_DOWN_DISMISS_OFFSET = 120;
const SWIPE_DOWN_DISMISS_VELOCITY = 600;

export function MobileDrawer({ onClose }: Props) {
  const handleDragEnd = (
    _: unknown,
    info: { velocity: { y: number }; offset: { y: number } },
  ) => {
    if (info.offset.y > SWIPE_DOWN_DISMISS_OFFSET || info.velocity.y > SWIPE_DOWN_DISMISS_VELOCITY) {
      onClose();
    }
  };

  return (
    <>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[1200] bg-black/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        key="drawer"
        className="fixed inset-x-0 bottom-0 z-[1210] flex flex-col bg-surface rounded-t-[20px] border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] overflow-hidden"
        style={{ height: '90dvh', maxHeight: '90vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={handleDragEnd}
      >
        <div className="shrink-0 relative flex justify-center items-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing select-none">
          <div className="w-10 h-1 rounded-full bg-white/20" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-1.5 flex items-center justify-center w-9 h-9 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Close drawer"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <MobileContent />
        </div>
      </motion.div>
    </>
  );
}
