import type { Difficulty } from '../../types';

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  expert: 'Expert',
};

const CLASSES: Record<Difficulty, string> = {
  easy: 'bg-difficulty-easy/20 text-difficulty-easy border-difficulty-easy/30',
  moderate: 'bg-difficulty-moderate/20 text-difficulty-moderate border-difficulty-moderate/30',
  hard: 'bg-difficulty-hard/20 text-difficulty-hard border-difficulty-hard/30',
  expert: 'bg-difficulty-expert/20 text-difficulty-expert border-difficulty-expert/30',
};

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

export function DifficultyBadge({ difficulty, size = 'sm' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${CLASSES[difficulty]}`}>
      {LABELS[difficulty]}
    </span>
  );
}
