import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { loadActiveTripState } from '@/src/features/trips/active-trip';

import { TripActions } from './TripActions';

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
  const initialState = await loadActiveTripState({ tripId, userId: session.userId, now: new Date() });
  if (!initialState) notFound();
  return <main>
    <h1>進行中行程</h1>
    <TripActions tripId={tripId} initialState={initialState} />
  </main>;
}
