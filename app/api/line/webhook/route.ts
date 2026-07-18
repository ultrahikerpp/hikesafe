import { createHmac, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

import { getEnv } from '@/src/env';
import {
  consumeBindingCode,
  type BindingRepository,
  type LineSourceType,
} from '@/src/features/line/bindings';
import { bilingual } from '@/src/features/i18n/copy';
import {
  handleLineConversation,
  type LineConversationEvent,
} from '@/src/features/line/conversation';
import type { LineMessage } from '@/src/features/line/messages';

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

const textEventSchema = z.object({
  type: z.literal('message'),
  webhookEventId: z.string().min(1),
  replyToken: z.string().min(1),
  source: sourceSchema,
  message: z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
});

const locationEventSchema = z.object({
  type: z.literal('message'),
  webhookEventId: z.string().min(1),
  replyToken: z.string().min(1),
  source: sourceSchema,
  message: z.object({
    type: z.literal('location'),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const postbackEventSchema = z.object({
  type: z.literal('postback'),
  webhookEventId: z.string().min(1),
  replyToken: z.string().min(1),
  source: sourceSchema,
  postback: z.object({ data: z.string() }),
});

const conversationEventSchema = z.union([
  textEventSchema,
  locationEventSchema,
  postbackEventSchema,
]);

const webhookSchema = z.object({
  events: z.array(z.unknown()),
});

interface WebhookDependencies {
  repository?: BindingRepository;
  now?: () => Date;
  conversation?: (event: LineConversationEvent) => Promise<LineMessage[]>;
  reply?: (replyToken: string, messages: LineMessage[]) => Promise<void>;
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

const replyToLine = async (replyToken: string, messages: LineMessage[]) => {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${getEnv().LINE_CHANNEL_ACCESS_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ replyToken, messages }),
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

const bindingSuccess: LineMessage = {
  type: 'text',
  text: bilingual(
    '已綁定 HikeSafe 留守通知',
    'HikeSafe guardian notifications linked',
  ),
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
    const parsedEvent = conversationEventSchema.safeParse(value);
    if (!parsedEvent.success) continue;
    const event = parsedEvent.data;
    const eventNow = (dependencies.now ?? (() => new Date()))();
    const match = event.type === 'message' && event.message.type === 'text'
      ? /^綁定 ([A-Z0-9]{6})$/.exec(event.message.text.trim())
      : null;
    if (match) {
      const bound = await consumeBindingCode(
        {
          code: match[1],
          ...sourceValue(event.source),
          now: eventNow,
        },
        dependencies.repository,
      );
      if (!bound) continue;
      try {
        await (dependencies.reply ?? replyToLine)(event.replyToken, [bindingSuccess]);
      } catch {
        (dependencies.logger ?? console).error('Unable to send LINE binding reply');
      }
      continue;
    }

    const conversationEvent: LineConversationEvent = {
      lineUserId: event.source.userId,
      eventId: event.webhookEventId,
      now: eventNow,
      ...(event.type === 'postback'
        ? { postbackData: event.postback.data }
        : event.message.type === 'text'
          ? { text: event.message.text }
          : {
              location: {
                latitude: event.message.latitude,
                longitude: event.message.longitude,
                capturedAt: eventNow,
                source: 'line' as const,
              },
            }),
    };
    const messages = await (dependencies.conversation ?? handleLineConversation)(conversationEvent);
    if (messages.length === 0) continue;
    try {
      await (dependencies.reply ?? replyToLine)(event.replyToken, messages);
    } catch {
      (dependencies.logger ?? console).error('Unable to send LINE conversation reply');
    }
  }
  return new Response('OK');
};

export const POST = (request: Request) => handleLineWebhook(request);
