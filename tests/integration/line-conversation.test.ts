// @vitest-environment node

import { createHmac } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleLineWebhook } from '@/app/api/line/webhook/route';
import { buildCheckInPrompt } from '@/src/features/line/prompts';
import type { LineMessage } from '@/src/features/line/messages';

const now = new Date('2026-07-18T04:00:00.000Z');
const secret = 'channel-secret';
const env = {
  DATABASE_URL: 'postgres://localhost/besafe',
  LINE_CHANNEL_ID: 'channel-id',
  LINE_CHANNEL_SECRET: secret,
  LINE_CHANNEL_ACCESS_TOKEN: 'channel-access-token',
  SESSION_SECRET: 'session-secret-with-at-least-32-characters',
  JOB_SECRET: 'job-secret-with-at-least-32-characters',
  GRANT_TOKEN_SECRET: 'grant-secret-with-at-least-32-characters',
  NEXT_PUBLIC_LIFF_ID: 'liff-id',
};

const signedRequest = (events: unknown[]) => {
  const body = JSON.stringify({ events });
  return new Request('http://localhost/api/line/webhook', {
    method: 'POST',
    headers: {
      'x-line-signature': createHmac('sha256', secret).update(body).digest('base64'),
    },
    body,
  });
};

const source = { type: 'user', userId: 'line-user-1' } as const;

describe('LINE conversation webhook', () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('forwards signed text events and replies with the returned Quick Reply messages', async () => {
    const prompt = buildCheckInPrompt({ tripId: 'trip-1', includeLocation: true });
    const conversation = vi.fn().mockResolvedValue([prompt]);
    const reply = vi.fn().mockResolvedValue(undefined);

    const response = await handleLineWebhook(signedRequest([{
      type: 'message',
      webhookEventId: 'event-text-1',
      replyToken: 'reply-text-1',
      source,
      userId: 'client-supplied-user',
      message: { id: 'message-1', type: 'text', text: '回報' },
    }]), { now: () => now, conversation, reply });

    expect(response.status).toBe(200);
    expect(conversation).toHaveBeenCalledWith({
      lineUserId: 'line-user-1',
      eventId: 'event-text-1',
      text: '回報',
      now,
    });
    expect(reply).toHaveBeenCalledWith('reply-text-1', [prompt]);
  });

  it('forwards signed postback data with the LINE event identity', async () => {
    const messages: LineMessage[] = [{ type: 'text', text: '回報已成功送出\nCheck-in sent successfully' }];
    const conversation = vi.fn().mockResolvedValue(messages);
    const reply = vi.fn().mockResolvedValue(undefined);

    await handleLineWebhook(signedRequest([{
      type: 'postback',
      webhookEventId: 'event-postback-1',
      replyToken: 'reply-postback-1',
      source: { type: 'group', groupId: 'group-1', userId: 'line-user-1' },
      postback: { data: 'hikesafe:check-in:trip-1:safe' },
    }]), { now: () => now, conversation, reply });

    expect(conversation).toHaveBeenCalledWith({
      lineUserId: 'line-user-1',
      eventId: 'event-postback-1',
      postbackData: 'hikesafe:check-in:trip-1:safe',
      now,
    });
    expect(reply).toHaveBeenCalledWith('reply-postback-1', messages);
  });

  it('forwards signed LINE locations without inventing accuracy', async () => {
    const conversation = vi.fn().mockResolvedValue([]);
    const reply = vi.fn().mockResolvedValue(undefined);

    await handleLineWebhook(signedRequest([{
      type: 'message',
      webhookEventId: 'event-location-1',
      replyToken: 'reply-location-1',
      source: { type: 'room', roomId: 'room-1', userId: 'line-user-1' },
      message: {
        id: 'message-2',
        type: 'location',
        latitude: 23.5,
        longitude: 121.25,
        address: '測試位置',
      },
    }]), { now: () => now, conversation, reply });

    expect(conversation).toHaveBeenCalledWith({
      lineUserId: 'line-user-1',
      eventId: 'event-location-1',
      location: {
        latitude: 23.5,
        longitude: 121.25,
        capturedAt: now,
        source: 'line',
      },
      now,
    });
    expect(reply).not.toHaveBeenCalled();
  });

  it('treats unsupported and malformed event shapes as successful no-ops', async () => {
    const conversation = vi.fn();
    const reply = vi.fn();

    const response = await handleLineWebhook(signedRequest([
      { type: 'follow', webhookEventId: 'event-follow-1', source },
      {
        type: 'message',
        webhookEventId: 'event-image-1',
        replyToken: 'reply-image-1',
        source,
        message: { id: 'message-3', type: 'image' },
      },
      {
        type: 'postback',
        webhookEventId: 'event-missing-user',
        replyToken: 'reply-missing-user',
        source: { type: 'group', groupId: 'group-1' },
        postback: { data: 'hikesafe:check-in:trip-1:safe' },
      },
    ]), { now: () => now, conversation, reply });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('OK');
    expect(conversation).not.toHaveBeenCalled();
    expect(reply).not.toHaveBeenCalled();
  });
});
