import { NextResponse } from 'next/server';

export function json(data: unknown, init?: number | ResponseInit) {
  const status = typeof init === 'number' ? { status: init } : init;
  return NextResponse.json({ success: true, data }, status);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
