import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/src/lib/auth';
import { json } from '@/src/server/api/responses';

export async function POST() {
  clearSessionCookie();
  return json({ message: 'Logged out' });
}
