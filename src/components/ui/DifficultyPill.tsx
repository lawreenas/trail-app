import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../../utils/routeMeta';
import type { Difficulty } from '../../types';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

export function DifficultyPill({ difficulty, size = 'sm' }: Props) {
  const c = DIFFICULTY_COLOR[difficulty];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium uppercase tracking-wider rounded ${sizeClass} ${c.bg} ${c.fg}`}
    >
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}
