import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try { session = await verifySession(token); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { id } = await params;
  const [{ db }, { lineBindings }] = await Promise.all([
    import('@/src/db/client'), import('@/src/db/schema'),
  ]);
  const revoked = await db.update(lineBindings).set({ revokedAt: new Date() }).where(and(
    eq(lineBindings.id, id),
    eq(lineBindings.userId, session.userId),
    isNull(lineBindings.revokedAt),
  )).returning({ id: lineBindings.id });

  if (revoked.length === 0) return NextResponse.json({ error: 'Binding not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
};
