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

// Mock data for when database is unavailable
const mockGames = [
  {
    id: 'game-1',
    code: 'ABC123',
    quizTitle: 'JavaScript Basics',
    state: 'COMPLETED',
    playerCount: 24,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'game-2',
    code: 'XYZ789',
    quizTitle: 'React Hooks',
    state: 'COMPLETED',
    playerCount: 18,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'game-3',
    code: 'DEF456',
    quizTitle: 'TypeScript Advanced',
    state: 'IN_PROGRESS',
    playerCount: 12,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
];

export async function GET() {
  try {
    const games = await listGameSessions(DEMO_USER_ID);
    return json(games);
  } catch (err) {
    console.error('Error fetching games:', err);
    // Return mock data if database is unavailable
    return json(mockGames);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = schema.safeParse(await req.json());
    if (!payload.success) return error('Invalid payload', 422);
    const game = await createGameSession(DEMO_USER_ID, payload.data.quizId, payload.data.maxPlayers);
    return json(game, 201);
  } catch (err) {
    console.error('Error creating game:', err);
    return error('Failed to create game. Database may not be connected.', 500);
  }
}
