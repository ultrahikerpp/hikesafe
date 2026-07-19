import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { copy } from '@/src/features/i18n/copy';
import { Card } from '@/app/components/Card';

export default async function ActiveTripPage() {
  const token = (await cookies()).get(sessionCookie.name)?.value;
  if (token) {
    try {
      const session = await verifySession(token);
      const [{ db }, { tripMembers, trips }] = await Promise.all([
        import('@/src/db/client'), import('@/src/db/schema'),
      ]);
      const [trip] = await db.select({ id: trips.id }).from(trips).innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, session.userId)))
        .where(eq(trips.status, 'active')).limit(1);
      if (trip) redirect(`/trips/${trip.id}`);
    } catch { /* render the controlled prerequisite state */ }
  }
  return <main>
    <h1>{copy.currentTrip}</h1>
    <Card>
      <p>{copy.noActiveTrip}</p>
      <p className="source-note">{copy.noActiveTripInstructions}</p>
      <Link className="btn btn-primary" href="/trips/new">{copy.createTrip}</Link>
    </Card>
  </main>;
}
