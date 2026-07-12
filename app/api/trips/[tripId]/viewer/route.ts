import { NextResponse } from 'next/server';

import { authorizeTripViewer } from '@/src/features/auth/authorize-trip';
import { sessionCookie, verifySession } from '@/src/features/auth/session';

const sessionToken = (request: Request) =>
  request.headers.get('cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie.name}=`))
    ?.slice(sessionCookie.name.length + 1);

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { tripId } = await params;
  const viewerToken = new URL(request.url).searchParams.get('grant') ?? undefined;
  const authorized = await authorizeTripViewer({
    tripId,
    userId: session.userId,
    viewerToken,
  });
  if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ authorized: true });
};
