import { randomUUID } from 'node:crypto';

import { SignJWT, jwtVerify } from 'jose';

import { getEnv } from '@/src/env';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface SessionIdentity {
  userId: string;
  lineUserId: string;
}

interface SessionDependencies {
  now?: () => Date;
  isRevoked?: (sessionId: string) => Promise<boolean>;
}

const databaseSessionRevocation = {
  async isRevoked(sessionId: string) {
    const [{ db }, { sessionRevocations }, { eq }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'), import('drizzle-orm'),
    ]);
    const [revocation] = await db.select({ sessionId: sessionRevocations.sessionId })
      .from(sessionRevocations).where(eq(sessionRevocations.sessionId, sessionId)).limit(1);
    return Boolean(revocation);
  },
  async revoke(sessionId: string) {
    const [{ db }, { sessionRevocations }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    await db.insert(sessionRevocations).values({ sessionId }).onConflictDoNothing();
  },
};

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
    .setJti(randomUUID())
    .setExpirationTime(issuedAt + SESSION_TTL_SECONDS)
    .sign(sessionKey());
};

export const verifySession = async (token: string, dependencies: SessionDependencies = {}) => {
  const { payload } = await jwtVerify(token, sessionKey(), {
    algorithms: ['HS256'],
  });
  if (
    typeof payload.userId !== 'string' ||
    typeof payload.lineUserId !== 'string' ||
    typeof payload.exp !== 'number' ||
    (payload.jti !== undefined && typeof payload.jti !== 'string')
  ) {
    throw new Error('Invalid session');
  }
  if (payload.jti && await (dependencies.isRevoked ?? databaseSessionRevocation.isRevoked)(payload.jti)) {
    throw new Error('Session revoked');
  }
  return {
    userId: payload.userId,
    lineUserId: payload.lineUserId,
    expiresAt: new Date(payload.exp * 1_000),
    ...(payload.jti ? { sessionId: payload.jti } : {}),
  };
};

export const revokeSession = async (token: string, dependencies: { revoke?: (sessionId: string) => Promise<void> } = {}) => {
  const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
  if (typeof payload.jti !== 'string') throw new Error('Invalid session');
  await (dependencies.revoke ?? databaseSessionRevocation.revoke)(payload.jti);
};

export const sessionCookie = {
  name: 'besafe_session',
  maxAge: SESSION_TTL_SECONDS,
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};
