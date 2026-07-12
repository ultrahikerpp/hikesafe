import { NextResponse } from 'next/server';

import { authorizeTripViewer } from '@/src/features/auth/authorize-trip';
import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { loadEmergencyReport } from '@/src/features/reports/build-report';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const GET = async (request: Request, { params }: { params: Promise<{ tripId: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let session;
  try { session = await verifySession(token); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { tripId } = await params;
  const viewerToken = new URL(request.url).searchParams.get('grant') ?? undefined;
  if (!await authorizeTripViewer({ tripId, userId: session.userId, lineUserId: session.lineUserId, viewerToken })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const report = await loadEmergencyReport(tripId);
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (new URL(request.url).searchParams.get('format') === 'text') {
    return new Response(report.text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  return NextResponse.json(report);
};
