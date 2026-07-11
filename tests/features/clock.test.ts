import { expect, it } from 'vitest';
import { createTestClock } from '@/src/lib/clock';

it('returns deterministic time', () => {
  expect(createTestClock('2026-07-12T05:00:00+08:00').now().toISOString())
    .toBe('2026-07-11T21:00:00.000Z');
});
