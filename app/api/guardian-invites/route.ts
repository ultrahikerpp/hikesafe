import { NextResponse } from 'next/server';

import { getEnv } from '@/src/env';
import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { createGuardianInvite } from '@/src/features/line/guardian-invites';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

const currentUser = async (request: Request) => {
  const token = sessionToken(request);
  if (!token) return undefined;
  try { return await verifySession(token); } catch { return undefined; }
};

export const POST = async (request: Request) => {
  const session = await currentUser(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const invite = await createGuardianInvite({ userId: session.userId, now: new Date() });
    return NextResponse.json({
      inviteUrl: `https://liff.line.me/${getEnv().NEXT_PUBLIC_LIFF_ID}/guardian/accept?token=${invite.token}`,
      expiresAt: invite.expiresAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Guardian invite creation failed', { userId: session.userId, error });
    return NextResponse.json({ error: 'Too many pending guardian invites' }, { status: 409 });
  }
};
