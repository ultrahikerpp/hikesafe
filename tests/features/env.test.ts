import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/src/env';

describe('parseEnv', () => {
  it('rejects missing LINE credentials', () => {
    expect(() => parseEnv({ DATABASE_URL: 'postgres://localhost/besafe' }))
      .toThrow(/LINE_CHANNEL_ID/);
  });

  it('requires an independent secret for deterministic viewer grants', () => {
    expect(() => parseEnv({
      DATABASE_URL: 'postgres://localhost/besafe',
      LINE_CHANNEL_ID: 'line', LINE_CHANNEL_SECRET: 'secret', LINE_CHANNEL_ACCESS_TOKEN: 'token',
      SESSION_SECRET: 'a'.repeat(32), JOB_SECRET: 'b'.repeat(32), NEXT_PUBLIC_LIFF_ID: 'liff',
    })).toThrow(/GRANT_TOKEN_SECRET/);
  });
});
