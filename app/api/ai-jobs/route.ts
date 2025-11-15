import { NextRequest } from 'next/server';
import { z } from 'zod';
import { json, error } from '@/src/server/api/responses';
import { createAIJob } from '@/src/server/services/aiService';

const schema = z.object({
  sourceType: z.enum(['pdf', 'url']),
  sourceRef: z.string().min(1),
  questionCount: z.number().int().min(1).max(25).default(10),
});

// Demo user ID for non-auth version
const DEMO_USER_ID = 'demo-user-id';

export async function POST(req: NextRequest) {
  const payload = schema.safeParse(await req.json());
  if (!payload.success) return error('Invalid payload', 422);
  const job = await createAIJob(DEMO_USER_ID, payload.data.sourceType, payload.data.sourceRef, payload.data.questionCount);
  return json(job, 201);
}
