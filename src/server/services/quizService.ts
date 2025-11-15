import { QuizStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { checkQuizCreationAllowed, incrementUsage } from './planService';
import { validateQuestionSet } from '@/src/server/validators/quizValidator';

export async function listQuizzes(userId: string) {
  return prisma.quiz.findMany({
    where: { ownerId: userId, status: { not: 'ARCHIVED' } },
    orderBy: { updatedAt: 'desc' },
    include: { questions: { include: { options: true } } },
  });
}

export type QuizInput = {
  title: string;
  description: string;
  language?: string;
  tags?: string[];
  questions: Array<{
    prompt: string;
    type: string;
    timeLimit: number;
    points: number;
    options: Array<{ label: string; isCorrect: boolean }>;
  }>;
};

export async function createQuiz(userId: string, payload: QuizInput) {
  await checkQuizCreationAllowed(userId);
  const quiz = await prisma.quiz.create({
    data: {
      ownerId: userId,
      title: payload.title,
      description: payload.description,
      language: payload.language ?? 'en',
      tags: payload.tags ?? [],
      questions: {
        create: payload.questions.map((question, idx) => ({
          prompt: question.prompt,
          type: question.type as any,
          timeLimit: question.timeLimit,
          points: question.points,
          orderIndex: idx,
          options: { create: question.options },
        })),
      },
    },
    include: { questions: { include: { options: true } } },
  });
  await incrementUsage(userId, 'quizzesCreatedCount');
  return quiz;
}

export async function updateQuizStatus(quizId: string, status: QuizStatus) {
  if (status === 'PUBLISHED') {
    await validateQuizReady(quizId);
  }
  return prisma.quiz.update({ where: { id: quizId }, data: { status } });
}

export async function validateQuizReady(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) throw new Error('Quiz not found');
  validateQuestionSet(quiz.questions);
}

export async function duplicateQuiz(quizId: string, ownerId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) throw new Error('Quiz not found');
  const clone = await prisma.quiz.create({
    data: {
      ownerId,
      title: `${quiz.title} (Copy)`,
      description: quiz.description,
      language: quiz.language,
      tags: quiz.tags,
      status: 'DRAFT',
      questions: {
        create: quiz.questions.map((question) => ({
          prompt: question.prompt,
          type: question.type,
          timeLimit: question.timeLimit,
          points: question.points,
          isAiGenerated: question.isAiGenerated,
          reviewStatus: question.reviewStatus,
          aiConfidence: question.aiConfidence,
          originalAiText: question.originalAiText,
          orderIndex: question.orderIndex,
          options: {
            create: question.options.map((option) => ({
              label: option.label,
              isCorrect: option.isCorrect,
            })),
          },
        })),
      },
    },
  });
  return clone;
}
