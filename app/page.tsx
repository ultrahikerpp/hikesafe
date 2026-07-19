import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { formatTime } from '@/src/lib/format-time';

import { HomeContent, type HomeActiveTrip } from './HomeContent';

const loadActiveTrip = async (): Promise<HomeActiveTrip | undefined> => {
  const token = (await cookies()).get(sessionCookie.name)?.value;
  if (!token) return undefined;
  try {
    const session = await verifySession(token);
    const [{ db }, { routeVersions, tripMembers, trips }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    const [trip] = await db
      .select({ id: trips.id, routeName: routeVersions.routeName, plannedFinishAt: trips.plannedFinishAt })
      .from(trips)
      .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, session.userId)))
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(eq(trips.status, 'active'))
      .limit(1);
    if (!trip) return undefined;
    return { id: trip.id, routeName: trip.routeName, plannedFinishAt: formatTime(trip.plannedFinishAt.toISOString()) };
  } catch (error) {
    console.error('Failed to load active trip for home page', error);
    return undefined;
  }
};

export default async function Home() {
  return <HomeContent activeTrip={await loadActiveTrip()} />;
}
