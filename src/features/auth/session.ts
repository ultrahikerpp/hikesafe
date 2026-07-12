import { SignJWT, jwtVerify } from 'jose';

import { getEnv } from '@/src/env';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface SessionIdentity {
  userId: string;
  lineUserId: string;
}

interface SessionDependencies {
  now?: () => Date;
}

const sessionKey = () => Buffer.from(getEnv().SESSION_SECRET, 'utf8');

export const createSession = async (
  identity: SessionIdentity,
  dependencies: SessionDependencies = {},
) => {
  const issuedAt = Math.floor(
    (dependencies.now ?? (() => new Date()))().getTime() / 1_000,
  );
  return new SignJWT({
    userId: identity.userId,
    lineUserId: identity.lineUserId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(issuedAt + SESSION_TTL_SECONDS)
    .sign(sessionKey());
};

export const verifySession = async (token: string) => {
  const { payload } = await jwtVerify(token, sessionKey(), {
    algorithms: ['HS256'],
  });
  if (
    typeof payload.userId !== 'string' ||
    typeof payload.lineUserId !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    throw new Error('Invalid session');
  }
  return {
    userId: payload.userId,
    lineUserId: payload.lineUserId,
    expiresAt: new Date(payload.exp * 1_000),
  };
};

export const sessionCookie = {
  name: 'besafe_session',
  maxAge: SESSION_TTL_SECONDS,
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};
