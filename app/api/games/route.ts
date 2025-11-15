import { NextRequest } from 'next/server';
import { z } from 'zod';
import { json, error } from '@/src/server/api/responses';
import { createGameSession, listGameSessions } from '@/src/server/services/gameService';

const schema = z.object({
  quizId: z.string().cuid(),
  maxPlayers: z.number().int().min(2).max(500),
});

// Demo user ID for non-auth version
const DEMO_USER_ID = 'demo-user-id';

export async function GET() {
  const games = await listGameSessions(DEMO_USER_ID);
  return json(games);
}

export async function POST(req: NextRequest) {
  const payload = schema.safeParse(await req.json());
  if (!payload.success) return error('Invalid payload', 422);
  const game = await createGameSession(DEMO_USER_ID, payload.data.quizId, payload.data.maxPlayers);
  return json(game, 201);
}
