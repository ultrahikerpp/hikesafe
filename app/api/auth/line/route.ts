import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSession, sessionCookie } from '@/src/features/auth/session';
import { verifyLineIdToken, type LineIdentity } from '@/src/integrations/line/verify-id-token';

const requestSchema = z.object({ idToken: z.string().min(1) }).strict();

interface AuthDependencies {
  verifyIdentity?: typeof verifyLineIdToken;
  upsertUser?: (identity: LineIdentity) => Promise<string>;
  createSessionToken?: typeof createSession;
}

const upsertLineUser = async (identity: LineIdentity) => {
  const [{ db }, { users }] = await Promise.all([
    import('@/src/db/client'),
    import('@/src/db/schema'),
  ]);
  const [user] = await db
    .insert(users)
    .values({
      lineUserId: identity.lineUserId,
      displayName: identity.displayName,
      pictureUrl: identity.pictureUrl,
    })
    .onConflictDoUpdate({
      target: users.lineUserId,
      set: {
        displayName: identity.displayName,
        pictureUrl: identity.pictureUrl,
        updatedAt: new Date(),
      },
    })
    .returning({ id: users.id });
  return user.id;
};

export const handleLineAuth = async (
  request: Request,
  dependencies: AuthDependencies = {},
) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    const identity = await (dependencies.verifyIdentity ?? verifyLineIdToken)(
      parsed.data.idToken,
    );
    const userId = await (dependencies.upsertUser ?? upsertLineUser)(identity);
    const token = await (dependencies.createSessionToken ?? createSession)({
      userId,
      lineUserId: identity.lineUserId,
    });
    const response = NextResponse.json({ userId });
    response.cookies.set(sessionCookie.name, token, sessionCookie);
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid LINE identity token' }, { status: 401 });
  }
};

export const POST = (request: Request) => handleLineAuth(request);
