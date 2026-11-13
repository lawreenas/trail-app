import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../../utils/routeMeta';
import type { Difficulty } from '../../types';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

/**
 * Tinted badge: colored dot + label on a faint wash of the difficulty color.
 * Enough presence to scan a list by difficulty, quiet enough that the map's
 * accent stays the loudest thing on screen.
 */
export function DifficultyPill({ difficulty, size = 'sm' }: Props) {
  const c = DIFFICULTY_COLOR[difficulty];
  const sizing = size === 'sm' ? 'text-[11px] px-1.5 py-px gap-1' : 'text-xs px-2 py-0.5 gap-1.5';
  return (
    <span className={`inline-flex items-center rounded font-medium ${c.bg} ${c.fg} ${sizing}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}
