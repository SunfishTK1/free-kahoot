import type { AIJobStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { env } from '@/src/lib/env';
import { checkAiQuota, incrementUsage } from './planService';

type SourceType = 'pdf' | 'url';

type AzureResponse = {
  quiz_title: string;
  description: string;
  language: string;
  questions: Array<{
    prompt: string;
    type: string;
    timeLimit: number;
    points: number;
    options: Array<{ label: string; isCorrect: boolean }>;
  }>;
};

export async function createAIJob(userId: string, sourceType: SourceType, sourceRef: string, questionCount = 10) {
  await checkAiQuota(userId);
  const job = await prisma.aIJob.create({
    data: {
      userId,
      sourceType,
      sourceRef,
      questionCountRequested: questionCount,
    },
  });
  return job;
}

export async function processAIJob(jobId: string, extractedContent: string) {
  const job = await prisma.aIJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('Job not found');
  await prisma.aIJob.update({ where: { id: job.id }, data: { status: 'GENERATING' } });

  try {
    const payload = await callAzure(extractedContent, job.questionCountRequested);
    const quiz = await prisma.quiz.create({
      data: {
        ownerId: job.userId,
        title: payload.quiz_title,
        description: payload.description,
        language: payload.language,
        status: 'DRAFT',
        source: 'AI_GENERATED',
        isAiGenerated: true,
        questions: {
          create: payload.questions.map((question, idx) => ({
            prompt: question.prompt,
            type: question.type as any,
            timeLimit: question.timeLimit,
            points: question.points,
            orderIndex: idx,
            isAiGenerated: true,
            reviewStatus: 'pending',
            options: {
              create: question.options,
            },
          })),
        },
      },
    });
    await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'COMPLETED', quizId: quiz.id } });
    await incrementUsage(job.userId, 'aiQuizzesGeneratedCount');
    return quiz;
  } catch (error: any) {
    await prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', failureReason: error?.message ?? 'Unknown error' },
    });
    throw error;
  }
}

async function callAzure(content: string, questionCount: number): Promise<AzureResponse> {
  if (!env.AZURE_API_KEY || !env.AZURE_ENDPOINT || !env.AZURE_MODEL) {
    // fallback for local dev
    return {
      quiz_title: 'Offline Draft Quiz',
      description: 'Development fallback quiz',
      language: 'en',
      questions: Array.from({ length: Math.max(1, questionCount) }).map((_, idx) => ({
        prompt: `Placeholder question ${idx + 1} derived from content`,
        type: 'MC_SINGLE',
        timeLimit: 20,
        points: 1000,
        options: [
          { label: 'Option A', isCorrect: true },
          { label: 'Option B', isCorrect: false },
          { label: 'Option C', isCorrect: false },
          { label: 'Option D', isCorrect: false },
        ],
      })),
    };
  }

  const response = await fetch(`${env.AZURE_ENDPOINT}/openai/deployments/${env.AZURE_MODEL}/chat/completions?api-version=${env.AZURE_VERSION}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.AZURE_API_KEY,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert instructional designer. Generate JSON matching the provided schema with validated quiz data.',
        },
        {
          role: 'user',
          content: `Create ${questionCount} multiple choice questions using this source: ${content}`,
        },
      ],
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'quiz_schema',
          schema: {
            type: 'object',
            required: ['quiz_title', 'description', 'language', 'questions'],
            properties: {
              quiz_title: { type: 'string' },
              description: { type: 'string' },
              language: { type: 'string' },
              questions: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  required: ['prompt', 'type', 'timeLimit', 'points', 'options'],
                  properties: {
                    prompt: { type: 'string' },
                    type: { type: 'string', enum: ['MC_SINGLE', 'TRUE_FALSE'] },
                    timeLimit: { type: 'integer', minimum: 10, maximum: 90 },
                    points: { type: 'integer', minimum: 100, maximum: 2000 },
                    options: {
                      type: 'array',
                      minItems: 2,
                      items: {
                        type: 'object',
                        required: ['label', 'isCorrect'],
                        properties: {
                          label: { type: 'string' },
                          isCorrect: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const contentJson = data.choices?.[0]?.message?.content;
  if (!contentJson) throw new Error('Azure response missing content');
  const parsed = JSON.parse(contentJson) as AzureResponse;
  return parsed;
}
