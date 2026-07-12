// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeJwt } from 'jose';

import { handleLineAuth } from '@/app/api/auth/line/route';
import { createSession, verifySession } from '@/src/features/auth/session';
import { verifyLineIdToken } from '@/src/integrations/line/verify-id-token';

const env = {
  DATABASE_URL: 'postgres://localhost/besafe',
  LINE_CHANNEL_ID: 'channel-id',
  LINE_CHANNEL_SECRET: 'channel-secret',
  LINE_CHANNEL_ACCESS_TOKEN: 'channel-access-token',
  SESSION_SECRET: 'session-secret-with-at-least-32-characters',
  JOB_SECRET: 'job-secret-with-at-least-32-characters',
  NEXT_PUBLIC_LIFF_ID: 'liff-id',
};

const stubEnv = () => {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
};

describe('LINE identity verification', () => {
  beforeEach(() => {
    stubEnv();
  });

  afterEach(() => vi.unstubAllEnvs());

  it('rejects an identity token issued for another audience', async () => {
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        sub: 'line-user-1',
        name: '登山者',
        aud: 'another-channel',
        exp: 2_000,
      }),
    );

    await expect(
      verifyLineIdToken('id-token', { fetch, now: () => new Date(1_000_000) }),
    ).rejects.toThrow('Invalid LINE identity token');
  });

  it('rejects an expired identity token', async () => {
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        sub: 'line-user-1',
        name: '登山者',
        aud: env.LINE_CHANNEL_ID,
        exp: 999,
      }),
    );

    await expect(
      verifyLineIdToken('id-token', { fetch, now: () => new Date(1_000_000) }),
    ).rejects.toThrow('Invalid LINE identity token');
  });

  it('posts the ID token to LINE and returns the verified identity', async () => {
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        sub: 'line-user-1',
        name: '登山者',
        picture: 'https://example.com/avatar.png',
        aud: env.LINE_CHANNEL_ID,
        exp: 2_000,
      }),
    );

    await expect(
      verifyLineIdToken('id-token', { fetch, now: () => new Date(1_000_000) }),
    ).resolves.toEqual({
      lineUserId: 'line-user-1',
      displayName: '登山者',
      pictureUrl: 'https://example.com/avatar.png',
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.line.me/oauth2/v2.1/verify',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(URLSearchParams),
      }),
    );
  });
});

describe('signed session', () => {
  beforeEach(stubEnv);
  afterEach(() => vi.unstubAllEnvs());

  it('contains only internal user ID, LINE user ID, and expiry', async () => {
    const token = await createSession(
      { userId: 'user-1', lineUserId: 'line-user-1' },
      { now: () => new Date('2026-07-12T00:00:00Z') },
    );

    expect(decodeJwt(token)).toEqual({
      userId: 'user-1',
      lineUserId: 'line-user-1',
      exp: 1_786_406_400,
    });

    await expect(verifySession(token)).resolves.toEqual({
      userId: 'user-1',
      lineUserId: 'line-user-1',
      expiresAt: new Date('2026-08-11T00:00:00.000Z'),
    });
  });
});

describe('POST /api/auth/line', () => {
  it('accepts only an ID token and sets a hardened session cookie', async () => {
    const verifyIdentity = vi.fn().mockResolvedValue({
      lineUserId: 'verified-line-user',
      displayName: '登山者',
    });
    const response = await handleLineAuth(
      new Request('http://localhost/api/auth/line', {
        method: 'POST',
        body: JSON.stringify({ idToken: 'id-token' }),
      }),
      {
        verifyIdentity,
        upsertUser: vi.fn().mockResolvedValue('internal-user'),
        createSessionToken: vi.fn().mockResolvedValue('signed-session'),
      },
    );

    expect(response.status).toBe(200);
    expect(verifyIdentity).toHaveBeenCalledWith('id-token');
    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('besafe_session=signed-session');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('Max-Age=2592000');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=lax');
  });

  it('rejects a client-supplied LINE user ID', async () => {
    const verifyIdentity = vi.fn();
    const response = await handleLineAuth(
      new Request('http://localhost/api/auth/line', {
        method: 'POST',
        body: JSON.stringify({ idToken: 'id-token', lineUserId: 'attacker-value' }),
      }),
      {
        verifyIdentity,
        upsertUser: vi.fn(),
        createSessionToken: vi.fn(),
      },
    );

    expect(response.status).toBe(400);
    expect(verifyIdentity).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON without verifying an identity', async () => {
    const verifyIdentity = vi.fn();
    const response = await handleLineAuth(
      new Request('http://localhost/api/auth/line', {
        method: 'POST',
        body: '{not-json',
      }),
      {
        verifyIdentity,
        upsertUser: vi.fn(),
        createSessionToken: vi.fn(),
      },
    );

    expect(response.status).toBe(400);
    expect(verifyIdentity).not.toHaveBeenCalled();
  });
});
