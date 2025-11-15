import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error('Invalid payload', 422);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return error('Invalid credentials', 401);
  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return error('Invalid credentials', 401);

  const token = await createSessionToken(user.id);
  setSessionCookie(token);
  return json({ id: user.id, email: user.email, name: user.name, planType: user.planType });
}
