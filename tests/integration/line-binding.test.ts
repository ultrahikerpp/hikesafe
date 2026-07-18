// @vitest-environment node

import { createHmac } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createBindingCode,
  type BindingRepository,
} from '@/src/features/line/bindings';
import { handleLineWebhook } from '@/app/api/line/webhook/route';

const now = new Date('2026-07-12T00:00:00Z');
const secret = 'channel-secret';
const accessToken = 'channel-access-token-must-not-be-logged';
const env = {
  DATABASE_URL: 'postgres://localhost/besafe',
  LINE_CHANNEL_ID: 'channel-id',
  LINE_CHANNEL_SECRET: secret,
  LINE_CHANNEL_ACCESS_TOKEN: accessToken,
  SESSION_SECRET: 'session-secret-with-at-least-32-characters',
  JOB_SECRET: 'job-secret-with-at-least-32-characters',
  GRANT_TOKEN_SECRET: 'grant-secret-with-at-least-32-characters',
  NEXT_PUBLIC_LIFF_ID: 'liff-id',
};

const signedRequest = (body: string, signature?: string) =>
  new Request('http://localhost/api/line/webhook', {
    method: 'POST',
    headers: signature ? { 'x-line-signature': signature } : undefined,
    body,
  });

const sign = (body: string) =>
  createHmac('sha256', secret).update(body).digest('base64');

const makeRepository = (): BindingRepository & {
  codes: Map<string, { userId: string; ownerLineUserId: string; expiresAt: Date; used: boolean }>;
  bound: Array<{ sourceType: 'user' | 'group' | 'room'; sourceId: string }>;
} => {
  const codes = new Map();
  const bound: Array<{ sourceType: 'user' | 'group' | 'room'; sourceId: string }> = [];
  return {
    codes,
    bound,
    async saveCode(value) {
      codes.set(value.code, { ...value, ownerLineUserId: `line-${value.userId}`, used: false });
    },
    async consumeCode(value) {
      const code = codes.get(value.code);
      if (
        !code ||
        code.used ||
        code.expiresAt <= value.now ||
        code.ownerLineUserId !== value.ownerLineUserId
      ) return false;
      code.used = true;
      bound.push({ sourceType: value.sourceType, sourceId: value.sourceId });
      return true;
    },
  };
};

describe('binding codes', () => {
  it('creates a six-character code that expires after 10 minutes', async () => {
    const repository = makeRepository();
    const result = await createBindingCode('user-1', {
      repository,
      now: () => now,
      randomBytes: () => Uint8Array.from([0, 1, 2, 3, 4, 5]),
    });

    expect(result).toEqual({
      code: 'ABCDEF',
      expiresAt: new Date('2026-07-12T00:10:00.000Z'),
    });
    expect(repository.codes.get('ABCDEF')?.expiresAt).toEqual(result.expiresAt);
  });
});

describe('LINE webhook binding', () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('returns 401 before parsing events when the signature is invalid', async () => {
    const repository = makeRepository();
    const response = await handleLineWebhook(
      signedRequest('{not-json', 'invalid'),
      { repository, now: () => now, reply: vi.fn() },
    );

    expect(response.status).toBe(401);
  });

  it.each([
    ['user', { type: 'user', userId: 'line-user-1' }, 'line-user-1'],
    ['group', { type: 'group', groupId: 'group-1', userId: 'line-user-1' }, 'group-1'],
    ['room', { type: 'room', roomId: 'room-1', userId: 'line-user-1' }, 'room-1'],
  ] as const)('stores verified %s webhook source and replies without logging secrets', async (
    sourceType,
    source,
    sourceId,
  ) => {
    const repository = makeRepository();
    await repository.saveCode({
      userId: 'user-1',
      code: 'ABC123',
      expiresAt: new Date(now.getTime() + 600_000),
    });
    const body = JSON.stringify({
      events: [{
        type: 'message',
        webhookEventId: 'binding-event-1',
        replyToken: 'reply-token',
        source,
        message: { type: 'text', text: '綁定 ABC123' },
      }],
    });
    const reply = vi.fn().mockResolvedValue(undefined);
    const logger = { error: vi.fn() };

    const response = await handleLineWebhook(signedRequest(body, sign(body)), {
      repository,
      now: () => now,
      reply,
      logger,
    });

    expect(response.status).toBe(200);
    expect(repository.bound).toEqual([{ sourceType, sourceId }]);
    expect(reply).toHaveBeenCalledWith('reply-token', [{
      type: 'text',
      text: '已綁定 HikeSafe 留守通知\nHikeSafe guardian notifications linked',
    }]);
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(accessToken);
  });

  it('allows only the code owner and consumes a code once', async () => {
    const repository = makeRepository();
    await repository.saveCode({
      userId: 'user-1',
      code: 'ABC123',
      expiresAt: new Date(now.getTime() + 600_000),
    });
    const event = (userId: string) => JSON.stringify({
      events: [{
        type: 'message',
        webhookEventId: 'binding-event-2',
        replyToken: 'reply-token',
        source: { type: 'group', groupId: 'group-1', userId },
        message: { type: 'text', text: '綁定 ABC123' },
      }],
    });
    const reply = vi.fn().mockResolvedValue(undefined);

    const stolenBody = event('line-attacker');
    await handleLineWebhook(signedRequest(stolenBody, sign(stolenBody)), {
      repository,
      now: () => now,
      reply,
    });
    expect(repository.bound).toEqual([]);

    const ownerBody = event('line-user-1');
    await handleLineWebhook(signedRequest(ownerBody, sign(ownerBody)), {
      repository,
      now: () => now,
      reply,
    });
    await handleLineWebhook(signedRequest(ownerBody, sign(ownerBody)), {
      repository,
      now: () => now,
      reply,
    });
    expect(repository.bound).toEqual([{ sourceType: 'group', sourceId: 'group-1' }]);
  });

  it('processes a binding message alongside unrelated LINE events', async () => {
    const repository = makeRepository();
    await repository.saveCode({
      userId: 'user-1',
      code: 'ABC123',
      expiresAt: new Date(now.getTime() + 600_000),
    });
    const body = JSON.stringify({
      events: [
        { type: 'follow', source: { type: 'user', userId: 'line-user-1' } },
        {
          type: 'message',
          webhookEventId: 'binding-event-3',
          replyToken: 'reply-token',
          source: { type: 'group', groupId: 'group-1', userId: 'line-user-1' },
          message: { type: 'text', text: '綁定 ABC123' },
        },
      ],
    });

    await handleLineWebhook(signedRequest(body, sign(body)), {
      repository,
      now: () => now,
      reply: vi.fn(),
    });

    expect(repository.bound).toEqual([{ sourceType: 'group', sourceId: 'group-1' }]);
  });

  it('rejects a code after 10 minutes', async () => {
    const repository = makeRepository();
    await repository.saveCode({ userId: 'user-1', code: 'ABC123', expiresAt: now });
    const body = JSON.stringify({
      events: [{
        type: 'message',
        webhookEventId: 'binding-event-4',
        replyToken: 'reply-token',
        source: { type: 'user', userId: 'line-user-1' },
        message: { type: 'text', text: '綁定 ABC123' },
      }],
    });

    await handleLineWebhook(signedRequest(body, sign(body)), {
      repository,
      now: () => now,
      reply: vi.fn(),
    });

    expect(repository.bound).toEqual([]);
  });
});
