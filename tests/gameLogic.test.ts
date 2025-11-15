import { describe, expect, it } from 'vitest';
import { transitionAllowed, scoreAnswer } from '@/src/server/services/gameLogic';

describe('transitionAllowed', () => {
  it('allows valid transitions', () => {
    expect(transitionAllowed('LOBBY', 'IN_PROGRESS')).toBe(true);
    expect(transitionAllowed('IN_PROGRESS', 'COMPLETED')).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(transitionAllowed('COMPLETED', 'IN_PROGRESS')).toBe(false);
    expect(transitionAllowed('LOBBY', 'COMPLETED')).toBe(false);
  });
});

describe('scoreAnswer', () => {
  const question = {
    id: 'q1',
    points: 1000,
    options: [
      { id: 'a', isCorrect: true },
      { id: 'b', isCorrect: false },
    ],
  };

  it('grants points on correct answers', () => {
    const { isCorrect, delta } = scoreAnswer(question, 'a');
    expect(isCorrect).toBe(true);
    expect(delta).toBe(1000);
  });

  it('grants zero on incorrect answers', () => {
    const { isCorrect, delta } = scoreAnswer(question, 'b');
    expect(isCorrect).toBe(false);
    expect(delta).toBe(0);
  });
});
