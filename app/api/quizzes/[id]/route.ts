import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { updateQuizStatus, validateQuizReady } from '@/src/server/services/quizService';

const metadataSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id, ownerId: user.id },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) return error('Quiz not found', 404);
  return json(quiz);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const body = await req.json();
  const metadata = metadataSchema.safeParse(body);
  if (!metadata.success) return error('Invalid payload', 422);
  const quiz = await prisma.quiz.findUnique({ where: { id: params.id, ownerId: user.id } });
  if (!quiz) return error('Quiz not found', 404);

  if (metadata.data.status) {
    await updateQuizStatus(quiz.id, metadata.data.status);
  }

  const updated = await prisma.quiz.update({
    where: { id: quiz.id },
    data: {
      title: metadata.data.title ?? quiz.title,
      description: metadata.data.description ?? quiz.description,
      status: metadata.data.status ?? quiz.status,
    },
  });
  return json(updated);
}
