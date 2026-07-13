import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { acceptTripInvite } from '@/src/features/trips/invites';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const POST = async (request: Request, { params }: { params: Promise<{ token: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const session = await verifySession(token);
    return NextResponse.json(await acceptTripInvite({ token: (await params).token, userId: session.userId, now: new Date() }));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to join trip' }, { status: 422 }); }
};
