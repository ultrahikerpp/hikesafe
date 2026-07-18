import { describe, expect, it } from 'vitest';

import { assertFreshLineLocation, assertFreshLocation } from '@/src/lib/location';

const now = new Date('2026-07-12T08:06:01Z');
const validFix = {
  latitude: 24.18,
  longitude: 121.28,
  accuracyMeters: 25,
  capturedAt: new Date('2026-07-12T08:06:00Z'),
  source: 'gps' as const,
};

describe('location validation', () => {
  it('accepts a fresh LINE location without invented accuracy', () => {
    expect(() =>
      assertFreshLineLocation(
        {
          latitude: 23.47,
          longitude: 120.95,
          capturedAt: new Date('2026-07-18T08:00:00.000Z'),
          source: 'line',
        },
        new Date('2026-07-18T08:00:05.000Z'),
      ),
    ).not.toThrow();
  });

  it('rejects a stale fix instead of presenting it as current', () => {
    expect(() =>
      assertFreshLocation(
        { ...validFix, capturedAt: new Date('2026-07-12T08:00:00Z') },
        now,
      ),
    ).toThrow('Location is stale');
  });

  it('rejects invalid and implausibly future timestamps', () => {
    expect(() =>
      assertFreshLocation({ ...validFix, capturedAt: new Date('invalid') }, now),
    ).toThrow('Location timestamp is invalid');
    expect(() =>
      assertFreshLocation(
        { ...validFix, capturedAt: new Date('2026-07-12T08:06:32Z') },
        now,
      ),
    ).toThrow('Location timestamp is in the future');
  });

  it('allows up to 30 seconds of device clock skew', () => {
    const fix = {
      ...validFix,
      capturedAt: new Date('2026-07-12T08:06:31Z'),
    };

    expect(assertFreshLocation(fix, now)).toBe(fix);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1])(
    'rejects invalid accuracy %s',
    (accuracyMeters) => {
      expect(() =>
        assertFreshLocation({ ...validFix, accuracyMeters }, now),
      ).toThrow('Location accuracy is invalid');
    },
  );

  it.each([
    ['latitude', 17.99, 121.28],
    ['latitude', 27.01, 121.28],
    ['longitude', 24.18, 115.99],
    ['longitude', 24.18, 123.01],
    ['latitude', Number.NaN, 121.28],
    ['longitude', 24.18, Number.POSITIVE_INFINITY],
  ])('rejects a %s outside Taiwan', (_axis, latitude, longitude) => {
    expect(() =>
      assertFreshLocation({ ...validFix, latitude, longitude }, now),
    ).toThrow('Location coordinates are outside Taiwan');
  });

  it('rejects an implausibly future LINE timestamp', () => {
    expect(() =>
      assertFreshLineLocation(
        {
          latitude: 23.47,
          longitude: 120.95,
          capturedAt: new Date('2026-07-18T08:00:31.000Z'),
          source: 'line',
        },
        new Date('2026-07-18T08:00:00.000Z'),
      ),
    ).toThrow('Location timestamp is in the future');
  });
});
