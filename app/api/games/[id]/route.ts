import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { transitionGame } from '@/src/server/services/gameService';

const actionSchema = z.object({
  action: z.enum(['start', 'complete', 'abort']),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const game = await prisma.gameSession.findUnique({
    where: { id: params.id, hostId: user.id },
    include: { players: true },
  });
  if (!game) return error('Game not found', 404);
  return json(game);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const body = await req.json();
  const payload = actionSchema.safeParse(body);
  if (!payload.success) return error('Invalid payload', 422);
  const game = await prisma.gameSession.findUnique({ where: { id: params.id, hostId: user.id } });
  if (!game) return error('Game not found', 404);
  const state = payload.data.action === 'start' ? 'IN_PROGRESS' : payload.data.action === 'complete' ? 'COMPLETED' : 'ABORTED';
  const updated = await transitionGame(game.id, state as any);
  return json(updated);
}
