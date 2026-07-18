import { desc, eq } from 'drizzle-orm';

import { copy } from '@/src/features/i18n/copy';

export interface GuardianViewer {
  route: string;
  team: string[];
  lastCheckIn: { at: string; location: { latitude: number; longitude: number; accuracyMeters: number | null; capturedAt: string; source: 'gps' | 'network' | 'line' } | null } | null;
  report: string;
}

export const loadGuardianViewer = async ({ tripId }: { tripId: string }): Promise<GuardianViewer | undefined> => {
  const [{ db }, { checkIns, routeVersions, tripMembers, trips, users }] = await Promise.all([
    import('@/src/db/client'), import('@/src/db/schema'),
  ]);
  const [trip] = await db.select({ route: routeVersions.routeName, plannedFinishAt: trips.plannedFinishAt })
    .from(trips).innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId)).where(eq(trips.id, tripId)).limit(1);
  if (!trip) return undefined;
  const team = await db.select({ name: users.displayName }).from(tripMembers).innerJoin(users, eq(users.id, tripMembers.userId)).where(eq(tripMembers.tripId, tripId));
  const [checkIn] = await db.select({ createdAt: checkIns.createdAt, latitude: checkIns.latitude, longitude: checkIns.longitude, accuracyMeters: checkIns.accuracyMeters, locationCapturedAt: checkIns.locationCapturedAt, locationSource: checkIns.locationSource, locationStatus: checkIns.locationStatus })
    .from(checkIns).where(eq(checkIns.tripId, tripId)).orderBy(desc(checkIns.createdAt)).limit(1);
  const location = checkIn?.locationStatus === 'available' && checkIn.latitude !== null && checkIn.longitude !== null && checkIn.locationCapturedAt !== null && checkIn.locationSource !== null
    ? { latitude: checkIn.latitude, longitude: checkIn.longitude, accuracyMeters: checkIn.accuracyMeters, capturedAt: checkIn.locationCapturedAt.toISOString(), source: checkIn.locationSource } : null;
  const lastCheckIn = checkIn ? { at: checkIn.createdAt.toISOString(), location } : null;
  return { route: trip.route, team: team.map((member) => member.name), lastCheckIn,
    report: [
      copy.reportTitle,
      copy.reportRoute(trip.route),
      copy.reportTeam(team.map((member) => member.name)),
      copy.reportPlannedFinish(trip.plannedFinishAt.toISOString()),
      copy.reportLastCheckIn(lastCheckIn?.at),
    ].join('\n') };
};
