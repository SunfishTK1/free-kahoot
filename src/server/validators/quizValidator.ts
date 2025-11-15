export type ValidatableQuestion = {
  id?: string;
  options: Array<{ id?: string; isCorrect: boolean }>;
};

export function validateQuestionSet(questions: ValidatableQuestion[]) {
  if (!questions.length) {
    throw new Error('Quiz requires at least one question');
  }
  questions.forEach((question, index) => {
    const correct = question.options.filter((option) => option.isCorrect);
    if (correct.length !== 1) {
      throw new Error(`Question ${question.id ?? index} must have exactly one correct option`);
    }
  });
}
