import type { LineMessage } from '@/src/features/line/messages';

import { getEnv } from '@/src/env';

export interface LinePushRequest {
  to: string;
  messages: LineMessage[];
  idempotencyKey: string;
}

export const pushLineMessage = async ({ to, messages, idempotencyKey }: LinePushRequest) => {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${getEnv().LINE_CHANNEL_ACCESS_TOKEN}`,
      'content-type': 'application/json',
      'x-line-retry-key': idempotencyKey,
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!response.ok) throw new Error(`LINE push failed (${response.status})`);
};
