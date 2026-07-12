import { desc, eq } from 'drizzle-orm';

export interface GuardianViewer {
  route: string;
  team: string[];
  lastCheckIn: { at: string; location: { latitude: number; longitude: number; accuracyMeters: number } | null } | null;
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
  const [checkIn] = await db.select({ createdAt: checkIns.createdAt, latitude: checkIns.latitude, longitude: checkIns.longitude, accuracyMeters: checkIns.accuracyMeters, locationStatus: checkIns.locationStatus })
    .from(checkIns).where(eq(checkIns.tripId, tripId)).orderBy(desc(checkIns.createdAt)).limit(1);
  const location = checkIn?.locationStatus === 'available' && checkIn.latitude !== null && checkIn.longitude !== null && checkIn.accuracyMeters !== null
    ? { latitude: checkIn.latitude, longitude: checkIn.longitude, accuracyMeters: checkIn.accuracyMeters } : null;
  const lastCheckIn = checkIn ? { at: checkIn.createdAt.toISOString(), location } : null;
  return { route: trip.route, team: team.map((member) => member.name), lastCheckIn,
    report: `BeSafe 通報摘要\n路線：${trip.route}\n隊伍：${team.map((member) => member.name).join('、')}\n預計下山：${trip.plannedFinishAt.toISOString()}\n最後回報：${lastCheckIn?.at ?? '尚無回報'}` };
};
