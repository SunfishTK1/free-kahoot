import { describe, expect, it } from 'vitest';
import { validateQuestionSet } from '@/src/server/validators/quizValidator';

describe('validateQuestionSet', () => {
  it('accepts well-formed questions', () => {
    expect(() =>
      validateQuestionSet([
        { options: [{ isCorrect: true }, { isCorrect: false }] },
        { options: [{ isCorrect: false }, { isCorrect: true }] },
      ]),
    ).not.toThrow();
  });

  it('throws when no questions are present', () => {
    expect(() => validateQuestionSet([])).toThrow('at least one question');
  });

  it('throws when multiple correct options exist', () => {
    expect(() =>
      validateQuestionSet([
        { options: [{ isCorrect: true }, { isCorrect: true }] },
      ]),
    ).toThrow('exactly one correct option');
  });
});
