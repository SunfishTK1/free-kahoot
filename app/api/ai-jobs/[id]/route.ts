import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { processAIJob } from '@/src/server/services/aiService';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const job = await prisma.aIJob.findUnique({ where: { id: params.id, userId: user.id } });
  if (!job) return error('Job not found', 404);
  return json(job);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const body = await req.json();
  const content = body.extractedContent as string;
  if (!content) return error('Missing extractedContent', 422);
  const job = await prisma.aIJob.findUnique({ where: { id: params.id, userId: user.id } });
  if (!job) return error('Job not found', 404);
  const quiz = await processAIJob(job.id, content);
  return json({ jobId: job.id, quizId: quiz.id });
}
