import { and, desc, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { createBindingCode } from '@/src/features/line/bindings';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

const currentUser = async (request: Request) => {
  const token = sessionToken(request);
  if (!token) return undefined;
  try { return await verifySession(token); } catch { return undefined; }
};

export const GET = async (request: Request) => {
  const session = await currentUser(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [{ db }, { lineBindings }] = await Promise.all([import('@/src/db/client'), import('@/src/db/schema')]);
  const bindings = await db.select({ id: lineBindings.id, sourceType: lineBindings.sourceType, displayName: lineBindings.displayName, sourceId: lineBindings.sourceId, boundAt: lineBindings.boundAt })
    .from(lineBindings).where(and(eq(lineBindings.userId, session.userId), isNull(lineBindings.revokedAt))).orderBy(desc(lineBindings.createdAt));
  return NextResponse.json({ bindings });
};

export const POST = async (request: Request) => {
  const session = await currentUser(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const binding = await createBindingCode(session.userId);
  return NextResponse.json(binding, { status: 201 });
};
