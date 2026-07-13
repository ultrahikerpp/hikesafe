import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { assignDeputy } from '@/src/features/trips/invites';

const schema = z.object({ memberUserId: z.string().uuid() }).strict();
const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const POST = async (request: Request, { params }: { params: Promise<{ tripId: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  try {
    const session = await verifySession(token);
    await assignDeputy({ tripId: (await params).tripId, ownerUserId: session.userId, memberUserId: parsed.data.memberUserId });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to assign deputy' }, { status: 422 }); }
};
