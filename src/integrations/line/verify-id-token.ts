import { z } from 'zod';

import { getEnv } from '@/src/env';

export interface LineIdentity {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
}

interface VerifyDependencies {
  fetch?: typeof globalThis.fetch;
  now?: () => Date;
}

const verifiedTokenSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  picture: z.string().url().optional(),
  aud: z.string().min(1),
  exp: z.number(),
});

export const verifyLineIdToken = async (
  idToken: string,
  dependencies: VerifyDependencies = {},
): Promise<LineIdentity> => {
  const env = getEnv();
  const response = await (dependencies.fetch ?? globalThis.fetch)(
    'https://api.line.me/oauth2/v2.1/verify',
    {
      method: 'POST',
      body: new URLSearchParams({
        id_token: idToken,
        client_id: env.LINE_CHANNEL_ID,
      }),
    },
  );
  if (!response.ok) throw new Error('Invalid LINE identity token');

  const parsed = verifiedTokenSchema.safeParse(await response.json());
  const nowSeconds = Math.floor((dependencies.now ?? (() => new Date()))().getTime() / 1_000);
  if (
    !parsed.success ||
    parsed.data.aud !== env.LINE_CHANNEL_ID ||
    parsed.data.exp <= nowSeconds
  ) {
    throw new Error('Invalid LINE identity token');
  }

  return {
    lineUserId: parsed.data.sub,
    displayName: parsed.data.name,
    ...(parsed.data.picture ? { pictureUrl: parsed.data.picture } : {}),
  };
};
