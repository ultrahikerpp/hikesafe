import { and, desc, eq } from 'drizzle-orm';

import { checkIns, tripMembers, trips } from '@/src/db/schema';

export interface ActiveTripInitialState {
  startedAt?: string;
  plannedFinishAt?: string;
  lastSuccessfulCheckInAt?: string;
  gpsFreshness: string;
  now: string;
  pendingQueueCount: number;
}

interface ActiveTrip {
  startedAt: Date | null;
  plannedFinishAt: Date;
}

interface SuccessfulCheckIn {
  createdAt: Date;
  locationStatus: 'available' | 'unavailable' | 'redacted';
  locationCapturedAt: Date | null;
}

export interface ActiveTripRepository {
  findActiveTripForMember(tripId: string, userId: string): Promise<ActiveTrip | undefined>;
  findLastSuccessfulCheckIn(tripId: string): Promise<SuccessfulCheckIn | undefined>;
}

export const loadActiveTripState = async (
  input: { tripId: string; userId: string; now: Date },
  repository: ActiveTripRepository = databaseRepository,
): Promise<ActiveTripInitialState | undefined> => {
  const trip = await repository.findActiveTripForMember(input.tripId, input.userId);
  if (!trip) return undefined;

  const lastCheckIn = await repository.findLastSuccessfulCheckIn(input.tripId);
  return {
    startedAt: trip.startedAt?.toISOString(),
    plannedFinishAt: trip.plannedFinishAt.toISOString(),
    lastSuccessfulCheckInAt: lastCheckIn?.createdAt.toISOString(),
    gpsFreshness: formatGpsFreshness(lastCheckIn, input.now),
    now: input.now.toISOString(),
    pendingQueueCount: 0,
  };
};

const formatGpsFreshness = (checkIn: SuccessfulCheckIn | undefined, now: Date) => {
  if (!checkIn) return '尚未取得';
  if (checkIn.locationStatus !== 'available' || !checkIn.locationCapturedAt) return '未取得 GPS';
  const minutes = Math.max(0, Math.floor((now.getTime() - checkIn.locationCapturedAt.getTime()) / 60_000));
  return minutes <= 5 ? `新鮮（${minutes} 分鐘前）` : `過期（${minutes} 分鐘前）`;
};

const databaseRepository: ActiveTripRepository = {
  async findActiveTripForMember(tripId, userId) {
    const { db } = await import('@/src/db/client');
    const [trip] = await db.select({ startedAt: trips.startedAt, plannedFinishAt: trips.plannedFinishAt })
      .from(trips)
      .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, userId)))
      .where(and(eq(trips.id, tripId), eq(trips.status, 'active')))
      .limit(1);
    return trip;
  },

  async findLastSuccessfulCheckIn(tripId) {
    const { db } = await import('@/src/db/client');
    const [checkIn] = await db.select({
      createdAt: checkIns.createdAt,
      locationStatus: checkIns.locationStatus,
      locationCapturedAt: checkIns.locationCapturedAt,
    }).from(checkIns).where(eq(checkIns.tripId, tripId)).orderBy(desc(checkIns.createdAt)).limit(1);
    return checkIn;
  },
};
