import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { createQuiz, listQuizzes } from '@/src/server/services/quizService';

const questionSchema = z.object({
  prompt: z.string().min(5),
  type: z.enum(['MC_SINGLE', 'TRUE_FALSE']).default('MC_SINGLE'),
  timeLimit: z.number().int().min(10).max(120),
  points: z.number().int().min(100).max(2000),
  options: z.array(z.object({ label: z.string().min(1), isCorrect: z.boolean() })).min(2),
});

const quizSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  language: z.string().default('en'),
  tags: z.array(z.string()).optional(),
  questions: z.array(questionSchema).min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const quizzes = await listQuizzes(user.id);
  return json(quizzes);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const payload = quizSchema.safeParse(await req.json());
  if (!payload.success) return error('Invalid quiz payload', 422);
  const quiz = await createQuiz(user.id, payload.data);
  return json(quiz, 201);
}
