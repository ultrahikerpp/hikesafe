import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/src/env';

describe('parseEnv', () => {
  it('rejects missing LINE credentials', () => {
    expect(() => parseEnv({ DATABASE_URL: 'postgres://localhost/besafe' }))
      .toThrow(/LINE_CHANNEL_ID/);
  });
});
