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

// Mock AI jobs data
const mockAIJobs = [
  {
    id: 'ai-job-1',
    sourceType: 'url',
    sourceRef: 'https://example.com/article',
    status: 'COMPLETED',
    questionCount: 10,
    quizId: 'quiz-1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ai-job-2',
    sourceType: 'pdf',
    sourceRef: 'document.pdf',
    status: 'COMPLETED',
    questionCount: 15,
    quizId: 'quiz-2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export async function GET() {
  try {
    // In a real implementation, this would fetch AI jobs from the database
    // For now, return mock data
    return json(mockAIJobs);
  } catch (err) {
    console.error('Error fetching AI jobs:', err);
    return json(mockAIJobs);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = schema.safeParse(await req.json());
    if (!payload.success) {
      console.error('AI job validation error:', payload.error);
      return error('Invalid payload', 422);
    }
    const job = await createAIJob(DEMO_USER_ID, payload.data.sourceType, payload.data.sourceRef, payload.data.questionCount);
    return json(job, 201);
  } catch (err) {
    console.error('Error creating AI job:', err);
    return error('Failed to create AI job. Database may not be connected.', 500);
  }
}
