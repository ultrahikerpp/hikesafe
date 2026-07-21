import { describe, expect, it } from 'vitest';

import { parsePostback } from '@/src/features/line/postback';

describe('parsePostback', () => {
  it('parses check-in postbacks', () => {
    expect(parsePostback('hikesafe:check-in:trip-1:safe')).toEqual({ kind: 'check-in', tripId: 'trip-1', message: 'safe' });
    expect(parsePostback('hikesafe:check-in:trip-1:shelter')).toEqual({ kind: 'check-in', tripId: 'trip-1', message: 'shelter' });
  });

  it('parses help postbacks', () => {
    expect(parsePostback('hikesafe:help:trip-1:confirm')).toEqual({ kind: 'help', tripId: 'trip-1', action: 'confirm' });
    expect(parsePostback('hikesafe:help:trip-1:cancel')).toEqual({ kind: 'help', tripId: 'trip-1', action: 'cancel' });
  });

  it('parses every trip chooser intent', () => {
    for (const intent of ['select', 'extend', 'finish', 'help'] as const) {
      expect(parsePostback(`hikesafe:trip:trip-1:${intent}`)).toEqual({ kind: 'trip', tripId: 'trip-1', intent });
    }
  });

  it('parses start postbacks', () => {
    expect(parsePostback('hikesafe:start:trip-1:confirm')).toEqual({ kind: 'start', tripId: 'trip-1', action: 'confirm' });
    expect(parsePostback('hikesafe:start:trip-1:cancel')).toEqual({ kind: 'start', tripId: 'trip-1', action: 'cancel' });
  });

  it('parses the three supported extension lengths as numbers', () => {
    expect(parsePostback('hikesafe:extend:trip-1:30')).toEqual({ kind: 'extend', tripId: 'trip-1', minutes: 30 });
    expect(parsePostback('hikesafe:extend:trip-1:60')).toEqual({ kind: 'extend', tripId: 'trip-1', minutes: 60 });
    expect(parsePostback('hikesafe:extend:trip-1:120')).toEqual({ kind: 'extend', tripId: 'trip-1', minutes: 120 });
  });

  it('parses finish postbacks', () => {
    expect(parsePostback('hikesafe:finish:trip-1:confirm')).toEqual({ kind: 'finish', tripId: 'trip-1', action: 'confirm' });
    expect(parsePostback('hikesafe:finish:trip-1:cancel')).toEqual({ kind: 'finish', tripId: 'trip-1', action: 'cancel' });
  });

  it('rejects unknown, malformed, and unsupported values', () => {
    for (const data of [
      '',
      'hikesafe:unknown:trip-1:confirm',
      'hikesafe:check-in:trip-1:bogus',
      'hikesafe:extend:trip-1:45',
      'hikesafe:trip:trip-1:bogus',
      'hikesafe:check-in::safe',
      'hikesafe:check-in:trip:extra:safe',
      'nothikesafe:check-in:trip-1:safe',
    ]) {
      expect(parsePostback(data)).toBeUndefined();
    }
  });
});
