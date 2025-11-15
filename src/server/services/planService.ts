import type { PlanType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';

export async function getPlanLimits(planType: PlanType) {
  const limits = await prisma.planLimit.findUnique({ where: { planType } });
  if (limits) return limits;
  return {
    planType,
    maxPlayersPerGame: planType === 'FREE' ? 50 : planType === 'PRO' ? 200 : 500,
    maxQuizzes: planType === 'FREE' ? 10 : planType === 'PRO' ? 200 : 1000,
    maxAIQuizzesPerMonth: planType === 'FREE' ? 5 : planType === 'PRO' ? 100 : 500,
    createdAt: new Date(),
  };
}

export async function ensurePlanLimitSeeded() {
  const existing = await prisma.planLimit.findUnique({ where: { planType: 'FREE' } });
  if (!existing) {
    await prisma.planLimit.create({
      data: {
        planType: 'FREE',
        maxPlayersPerGame: 50,
        maxQuizzes: 10,
        maxAIQuizzesPerMonth: 5,
      },
    });
  }
}

export async function checkQuizCreationAllowed(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const limits = await getPlanLimits(user.planType);
  const quizCount = await prisma.quiz.count({ where: { ownerId: userId, status: { in: ['DRAFT', 'PUBLISHED'] } } });
  if (quizCount >= limits.maxQuizzes) {
    throw new Error(`Plan limit reached: ${limits.maxQuizzes} quizzes allowed for ${user.planType}`);
  }
}

export async function checkAiQuota(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const limits = await getPlanLimits(user.planType);
  const { start, end } = getUsagePeriod();
  const usage = await prisma.usage.findFirst({ where: { userId, periodStart: start, periodEnd: end } });
  if (usage && usage.aiQuizzesGeneratedCount >= limits.maxAIQuizzesPerMonth) {
    throw new Error(`AI quota exceeded for ${user.planType} plan`);
  }
}

export function getUsagePeriod() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export async function incrementUsage(
  userId: string,
  field: 'aiQuizzesGeneratedCount' | 'gamesHostedCount' | 'quizzesCreatedCount',
) {
  const { start, end } = getUsagePeriod();
  const existing = await prisma.usage.findFirst({ where: { userId, periodStart: start, periodEnd: end } });
  if (existing) {
    await prisma.usage.update({
      where: { id: existing.id },
      data: { [field]: existing[field] + 1 },
    });
  } else {
    await prisma.usage.create({
      data: {
        userId,
        periodStart: start,
        periodEnd: end,
        aiQuizzesGeneratedCount: field === 'aiQuizzesGeneratedCount' ? 1 : 0,
        gamesHostedCount: field === 'gamesHostedCount' ? 1 : 0,
        quizzesCreatedCount: field === 'quizzesCreatedCount' ? 1 : 0,
      },
    });
  }
}

export async function checkMaxPlayers(userId: string, playersRequested: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const limits = await getPlanLimits(user.planType);
  if (playersRequested > limits.maxPlayersPerGame) {
    throw new Error(`Player cap exceeded. ${user.planType} allows ${limits.maxPlayersPerGame} players.`);
  }
}
