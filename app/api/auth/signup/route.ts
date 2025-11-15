import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { hashPassword, createSessionToken, setSessionCookie } from '@/src/lib/auth';
import { json, error } from '@/src/server/api/responses';
import { ensurePlanLimitSeeded } from '@/src/server/services/planService';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error('Invalid payload', 422);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return error('Email already registered', 409);

  await ensurePlanLimitSeeded();

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
    },
  });
  const token = await createSessionToken(user.id);
  setSessionCookie(token);
  return json({ id: user.id, email: user.email, name: user.name, planType: user.planType });
}
