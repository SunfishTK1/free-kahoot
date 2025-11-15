import { describe, expect, it, vi } from 'vitest';
import { getUsagePeriod } from '@/src/server/services/planService';

describe('planService helpers', () => {
  it('returns start as first day of month', () => {
    const realDate = Date;
    const fixed = new Date('2024-05-18T10:00:00Z');
    vi.setSystemTime(fixed);
    const { start, end } = getUsagePeriod();
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(0);
    expect(end.getMonth()).toBe(fixed.getMonth() + 1);
    vi.useRealTimers();
  });
});
