import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { createTrip } from '@/src/features/trips/service';

const requestSchema = z.object({
  routeVersionId: z.string().uuid(),
  startsAt: z.coerce.date(),
  plannedFinishAt: z.coerce.date(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['deputy', 'member']),
  })),
  guardianBindingIds: z.array(z.string().uuid()),
  vehicle: z.string(),
  equipment: z.array(z.string()),
  leaderPhone: z.string().trim().regex(/^\+?[0-9 -]{7,20}$/).optional().default(''),
  idempotencyKey: z.string().uuid(),
}).strict();

const sessionToken = (request: Request) =>
  request.headers.get('cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie.name}=`))
    ?.slice(sessionCookie.name.length + 1);

export const handleCreateTrip = async (request: Request) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  if (parsed.data.members.some((member) => member.userId === session.userId)) {
    return NextResponse.json({ error: 'Session owner must not be submitted as a member' }, { status: 400 });
  }

  try {
    const result = await createTrip({
      ...parsed.data,
      ownerUserId: session.userId,
      members: [
        { userId: session.userId, role: 'leader' },
        ...parsed.data.members,
      ],
    });
    return NextResponse.json({ tripId: result.tripId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to create trip',
    }, { status: 422 });
  }
};

export const POST = (request: Request) => handleCreateTrip(request);
