import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { sessionCookie, verifySession } from '@/src/features/auth/session';

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
    <h1>目前行程</h1>
    <p>尚未選擇進行中的行程。請先建立行程；建立完成後會自動前往該行程頁面，再開始、回報或安全下山。</p>
    <Link href="/trips/new">建立行程</Link>
  </main>;
}
