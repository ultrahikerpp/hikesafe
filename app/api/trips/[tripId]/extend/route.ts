import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { extendTrip } from '@/src/features/trips/commands';

const requestSchema = z.object({ plannedFinishAt: z.coerce.date(), idempotencyKey: z.string().min(1) }).strict();
const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const handleExtend = async (request: Request, { params }: { params: Promise<{ tripId: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let session;
  try { session = await verifySession(token); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const parsed = requestSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  try {
    const result = await extendTrip({ ...(await params), ...parsed.data, userId: session.userId, now: new Date() });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to extend trip' }, { status: 422 });
  }
};

export const POST = handleExtend;
