import { NextResponse } from 'next/server';

import { authorizeTripViewer } from '@/src/features/auth/authorize-trip';
import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { loadGuardianViewer } from '@/src/features/guardian-viewer/service';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const GET = async (request: Request, { params }: { params: Promise<{ tripId: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let session;
  try { session = await verifySession(token); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { tripId } = await params;
  const viewerToken = new URL(request.url).searchParams.get('grant') ?? undefined;
  if (!await authorizeTripViewer({ tripId, userId: session.userId, lineUserId: session.lineUserId, viewerToken, requireGrant: true })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const viewer = await loadGuardianViewer({ tripId });
  if (!viewer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(viewer);
};
