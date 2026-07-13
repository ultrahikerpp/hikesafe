import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { requestHelp } from '@/src/features/trips/commands';

const location = z.object({ latitude: z.number(), longitude: z.number(), accuracyMeters: z.number(), capturedAt: z.coerce.date(), source: z.enum(['gps', 'network']) }).strict();
const schema = z.object({ message: z.string().max(1000).optional(), location: location.optional(), idempotencyKey: z.string().min(1) }).strict();
const token = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const POST = async (request: Request, { params }: { params: Promise<{ tripId: string }> }) => {
  const sessionToken = token(request);
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  try {
    const session = await verifySession(sessionToken);
    return NextResponse.json(await requestHelp({ ...(await params), ...parsed.data, userId: session.userId, now: new Date() }), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to request help' }, { status: 422 }); }
};
