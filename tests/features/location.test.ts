import { expect, it } from 'vitest';

import { assertFreshLocation } from '@/src/lib/location';

it('rejects a stale fix instead of presenting it as current', () => {
  expect(() =>
    assertFreshLocation(
      {
        latitude: 24.18,
        longitude: 121.28,
        accuracyMeters: 25,
        capturedAt: new Date('2026-07-12T08:00:00Z'),
        source: 'gps',
      },
      new Date('2026-07-12T08:06:01Z'),
    ),
  ).toThrow('Location is stale');
});
