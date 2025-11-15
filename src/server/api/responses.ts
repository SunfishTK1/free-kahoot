import { NextResponse } from 'next/server';

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
