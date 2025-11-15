import type { GameState } from '@prisma/client';

export type QuestionSnapshot = {
  id: string;
  points: number;
  options: Array<{ id: string; isCorrect: boolean }>;
};

export function transitionAllowed(current: GameState, next: GameState) {
  const allowed: Record<GameState, GameState[]> = {
    LOBBY: ['IN_PROGRESS', 'ABORTED'],
    IN_PROGRESS: ['COMPLETED', 'ABORTED'],
    COMPLETED: [],
    ABORTED: [],
  };
  return allowed[current].includes(next);
}

export function scoreAnswer(question: QuestionSnapshot, optionId: string) {
  const correct = question.options.find((option) => option.isCorrect);
  const isCorrect = correct?.id === optionId;
  return {
    isCorrect,
    delta: isCorrect ? question.points : 0,
  };
}
