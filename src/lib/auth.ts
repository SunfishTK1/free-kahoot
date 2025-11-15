import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { env } from './env';

const SESSION_COOKIE = 'fk_session';
const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(jwtSecret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, jwtSecret);
  return payload.sub as string;
}

export async function getCurrentUserId(req?: NextRequest) {
  const cookieStore = req ? req.cookies : cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch (error) {
    console.warn('Invalid session token', error);
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest) {
  const userId = await getCurrentUserId(req);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
