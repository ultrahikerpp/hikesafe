import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { createTripInvite } from '@/src/features/trips/invites';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const POST = async (request: Request, { params }: { params: Promise<{ tripId: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const session = await verifySession(token);
    const invite = await createTripInvite({ tripId: (await params).tripId, ownerUserId: session.userId, now: new Date() });
    return NextResponse.json(invite, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create invite' }, { status: 422 }); }
};
