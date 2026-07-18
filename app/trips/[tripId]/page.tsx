import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { copy } from '@/src/features/i18n/copy';
import { loadActiveTripState } from '@/src/features/trips/active-trip';

import { TripActions } from './TripActions';
import { DraftTrip } from './DraftTrip';

export default async function ActiveTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const token = (await cookies()).get(sessionCookie.name)?.value;
  if (!token) redirect('/');
  let session;
  try {
    session = await verifySession(token);
  } catch {
    redirect('/');
  }
  const [{ db }, { guardians, lineBindings, routeVersions, tripMembers, trips, users }] = await Promise.all([
    import('@/src/db/client'), import('@/src/db/schema'),
  ]);
  const [trip] = await db.select({ status: trips.status, routeName: routeVersions.routeName, plannedFinishAt: trips.plannedFinishAt, ownerUserId: trips.ownerUserId })
    .from(trips).innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
    .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, session.userId)))
    .where(eq(trips.id, tripId)).limit(1);
  if (!trip) notFound();
  if (trip.status === 'draft') {
    const boundGuardians = await db.select({ name: lineBindings.displayName, sourceType: lineBindings.sourceType, owner: users.displayName })
      .from(guardians).innerJoin(lineBindings, eq(lineBindings.id, guardians.lineBindingId)).innerJoin(users, eq(users.id, lineBindings.userId))
      .where(eq(guardians.tripId, tripId));
    const members = await db.select({ id: users.id, name: users.displayName, role: tripMembers.role }).from(tripMembers).innerJoin(users, eq(users.id, tripMembers.userId)).where(eq(tripMembers.tripId, tripId));
    return <main><DraftTrip tripId={tripId} routeName={trip.routeName} plannedFinishAt={trip.plannedFinishAt.toISOString()} guardians={boundGuardians.map((guardian) => guardian.name ?? guardian.owner ?? guardian.sourceType ?? undefined)} members={members} isOwner={trip.ownerUserId === session.userId} /></main>;
  }
  if (trip.status !== 'active') notFound();
  const initialState = await loadActiveTripState({ tripId, userId: session.userId, now: new Date() });
  if (!initialState) notFound();
  return <main>
    <h1>{copy.activeTrip}</h1>
    <TripActions tripId={tripId} initialState={initialState} />
  </main>;
}
