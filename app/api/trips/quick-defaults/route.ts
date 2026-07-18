import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { loadQuickTripDefaults } from '@/src/features/trips/quick-defaults';

const sessionToken = (request: Request) => request.headers.get('cookie')
  ?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))
  ?.slice(sessionCookie.name.length + 1);

export const GET = async (request: Request) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ defaults: await loadQuickTripDefaults(session.userId) });
  } catch {
    return NextResponse.json({ error: 'Quick defaults unavailable' }, { status: 503 });
  }
};
