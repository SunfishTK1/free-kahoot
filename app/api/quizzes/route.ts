import { NextRequest } from 'next/server';
import { z } from 'zod';
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

// Demo user ID for non-auth version
const DEMO_USER_ID = 'demo-user-id';

// Mock data for when database is unavailable
const mockQuizzes = [
  {
    id: 'quiz-1',
    title: 'Sample Quiz: JavaScript Basics',
    description: 'Test your knowledge of JavaScript fundamentals',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
    plays: 42,
    averageScore: 85,
  },
  {
    id: 'quiz-2',
    title: 'Sample Quiz: React Hooks',
    description: 'Understanding useState, useEffect, and custom hooks',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }, { id: 'q4' }],
    plays: 28,
    averageScore: 78,
  },
  {
    id: 'quiz-3',
    title: 'Sample Quiz: TypeScript Advanced',
    description: 'Advanced TypeScript concepts and patterns',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    questions: [{ id: 'q1' }, { id: 'q2' }],
    plays: 0,
    averageScore: 0,
  },
];

export async function GET() {
  try {
    const quizzes = await listQuizzes(DEMO_USER_ID);
    return json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    // Return mock data if database is unavailable
    return json(mockQuizzes);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = quizSchema.safeParse(await req.json());
    if (!payload.success) return error('Invalid quiz payload', 422);
    const quiz = await createQuiz(DEMO_USER_ID, payload.data);
    return json(quiz, 201);
  } catch (err) {
    console.error('Error creating quiz:', err);
    return error('Failed to create quiz. Database may not be connected.', 500);
  }
}
