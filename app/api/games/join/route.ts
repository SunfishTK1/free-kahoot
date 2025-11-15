import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { joinGame } from '@/src/server/services/gameService';

const schema = z.object({
  code: z.string().min(4),
  nickname: z.string().min(2).max(20),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const payload = schema.safeParse(await req.json());
  if (!payload.success) return error('Invalid payload', 422);
  const player = await joinGame(payload.data.code.toUpperCase(), payload.data.nickname, user?.id);
  return json(player, 201);
}
