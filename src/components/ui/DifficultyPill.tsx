import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../../utils/routeMeta';
import type { Difficulty } from '../../types';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

/**
 * Subtle indicator: tiny colored dot (the only difficulty-colored element)
 * + neutral uppercase label. No filled background — keeps the chrome quiet
 * so the map's accent color stays the loudest thing on screen.
 */
export function DifficultyPill({ difficulty, size = 'sm' }: Props) {
  const c = DIFFICULTY_COLOR[difficulty];
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium uppercase tracking-wider text-gray-400 ${textSize}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}
