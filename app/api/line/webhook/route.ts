import { createHmac, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

import { getEnv } from '@/src/env';
import {
  consumeBindingCode,
  type BindingRepository,
  type LineSourceType,
} from '@/src/features/line/bindings';

const sourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('user'), userId: z.string().min(1) }),
  z.object({
    type: z.literal('group'),
    groupId: z.string().min(1),
    userId: z.string().min(1),
  }),
  z.object({
    type: z.literal('room'),
    roomId: z.string().min(1),
    userId: z.string().min(1),
  }),
]);

const messageEventSchema = z.object({
  type: z.literal('message'),
  replyToken: z.string().min(1),
  source: sourceSchema,
  message: z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
});

const webhookSchema = z.object({
  events: z.array(z.unknown()),
});

interface WebhookDependencies {
  repository?: BindingRepository;
  now?: () => Date;
  reply?: (replyToken: string, text: string) => Promise<void>;
  logger?: Pick<Console, 'error'>;
}

const validSignature = (body: string, signature: string | null) => {
  if (!signature) return false;
  const expected = Buffer.from(
    createHmac('sha256', getEnv().LINE_CHANNEL_SECRET).update(body).digest('base64'),
  );
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
};

const replyToLine = async (replyToken: string, text: string) => {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${getEnv().LINE_CHANNEL_ACCESS_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  });
  if (!response.ok) throw new Error('LINE reply failed');
};

const sourceValue = (source: z.infer<typeof sourceSchema>): {
  ownerLineUserId: string;
  sourceType: LineSourceType;
  sourceId: string;
} => {
  if (source.type === 'group') {
    return { ownerLineUserId: source.userId, sourceType: 'group', sourceId: source.groupId };
  }
  if (source.type === 'room') {
    return { ownerLineUserId: source.userId, sourceType: 'room', sourceId: source.roomId };
  }
  return { ownerLineUserId: source.userId, sourceType: 'user', sourceId: source.userId };
};

export const handleLineWebhook = async (
  request: Request,
  dependencies: WebhookDependencies = {},
) => {
  const body = await request.text();
  if (!validSignature(body, request.headers.get('x-line-signature'))) {
    return new Response('Invalid signature', { status: 401 });
  }

  let payload: z.infer<typeof webhookSchema>;
  try {
    payload = webhookSchema.parse(JSON.parse(body));
  } catch {
    return new Response('Invalid webhook', { status: 400 });
  }

  for (const value of payload.events) {
    const parsedEvent = messageEventSchema.safeParse(value);
    if (!parsedEvent.success) continue;
    const event = parsedEvent.data;
    const match = /^綁定 ([A-Z0-9]{6})$/.exec(event.message.text.trim());
    if (!match) continue;
    const bound = await consumeBindingCode(
      {
        code: match[1],
        ...sourceValue(event.source),
        now: (dependencies.now ?? (() => new Date()))(),
      },
      dependencies.repository,
    );
    if (!bound) continue;
    try {
      await (dependencies.reply ?? replyToLine)(
        event.replyToken,
        '已綁定 HikeSafe 留守通知',
      );
    } catch {
      (dependencies.logger ?? console).error('Unable to send LINE binding reply');
    }
  }
  return new Response('OK');
};

export const POST = (request: Request) => handleLineWebhook(request);
