import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { createGameSession } from '@/src/server/services/gameService';

const schema = z.object({
  quizId: z.string().cuid(),
  maxPlayers: z.number().int().min(2).max(500),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error('Unauthorized', 401);
  const payload = schema.safeParse(await req.json());
  if (!payload.success) return error('Invalid payload', 422);
  const game = await createGameSession(user.id, payload.data.quizId, payload.data.maxPlayers);
  return json(game, 201);
}
