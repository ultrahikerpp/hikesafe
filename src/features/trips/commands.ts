import { and, eq, sql } from 'drizzle-orm';

import { alertDeliveries, alertEvents, checkIns, idempotencyKeys, tripMembers, trips } from '@/src/db/schema';
import { scheduleAlertEvents } from '@/src/features/alerts/domain';
import { canFinishTrip, type TripRole, type TripStatus } from '@/src/features/trips/domain';
import { hashIdempotencyRequest } from '@/src/lib/idempotency';
import { assertFreshLocation, type LocationFix } from '@/src/lib/location';

interface TripSnapshot {
  id: string;
  status: TripStatus;
  plannedFinishAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
}

interface StoredCheckIn {
  id: string;
  tripId: string;
  userId: string;
  message?: string;
  locationStatus: 'available' | 'unavailable';
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  locationCapturedAt?: Date;
  locationSource?: 'gps';
  createdAt: Date;
}

type IdempotencyReservation =
  | { kind: 'reserved' }
  | { kind: 'existing'; requestHash: string; result: unknown };

export interface TripCommandsTransaction {
  lockTrip(tripId: string): Promise<TripSnapshot | undefined>;
  findMembership(tripId: string, userId: string): Promise<TripRole | undefined>;
  listMembershipRoles(tripId: string): Promise<TripRole[]>;
  reserveIdempotency(input: { userId: string; key: string; requestHash: string }): Promise<IdempotencyReservation>;
  saveIdempotencyResponse(input: { userId: string; key: string; result: unknown }): Promise<void>;
  activateTrip(input: { tripId: string; startedAt: Date }): Promise<void>;
  createLifecycleNotification(input: { tripId: string; kind: 'started' | 'extended' | 'help' | 'finished'; dueAt: Date }): Promise<void>;
  insertCheckIn(input: Omit<StoredCheckIn, 'id'>): Promise<StoredCheckIn>;
  replaceUnsentAlertSchedule(input: { tripId: string; plannedFinishAt: Date }): Promise<void>;
  finishTrip(input: { tripId: string; finishedAt: Date }): Promise<void>;
  recordHelpRequested(input: { tripId: string; at: Date }): Promise<void>;
  cancelUnsentAlerts(tripId: string): Promise<void>;
}

export interface TripCommandsRepository extends TripCommandsTransaction {
  transaction<T>(operation: (transaction: TripCommandsTransaction) => Promise<T>): Promise<T>;
}

export interface StartTripCommand {
  tripId: string;
  userId: string;
  location: LocationFix;
  idempotencyKey: string;
  now: Date;
}

export interface RecordCheckInCommand {
  tripId: string;
  userId: string;
  message?: string;
  location?: LocationFix;
  idempotencyKey: string;
  now: Date;
}

export interface ExtendTripCommand {
  tripId: string;
  userId: string;
  plannedFinishAt: Date;
  idempotencyKey: string;
  now: Date;
}

export interface FinishTripCommand {
  tripId: string;
  userId: string;
  message?: string;
  location?: LocationFix;
  idempotencyKey: string;
  now: Date;
}
export interface HelpTripCommand extends FinishTripCommand {}

const assertGps = (location: LocationFix, now: Date) => {
  if (location.source !== 'gps') throw new Error('Location must be GPS');
  return assertFreshLocation(location, now);
};

const checkInValues = (
  command: Pick<RecordCheckInCommand | FinishTripCommand, 'tripId' | 'userId' | 'message' | 'location' | 'now'>,
) => {
  if (!command.location) {
    return {
      tripId: command.tripId,
      userId: command.userId,
      message: command.message,
      locationStatus: 'unavailable' as const,
      createdAt: command.now,
    };
  }
  const location = assertGps(command.location, command.now);
  return {
    tripId: command.tripId,
    userId: command.userId,
    message: command.message,
    locationStatus: 'available' as const,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracyMeters: location.accuracyMeters,
    locationCapturedAt: location.capturedAt,
    locationSource: 'gps' as const,
    createdAt: command.now,
  };
};

const assertMember = (role: TripRole | undefined) => {
  if (!role) throw new Error('Trip membership is required');
  return role;
};

const assertManager = (role: TripRole | undefined) => {
  if (!role || !canFinishTrip(role)) throw new Error('Only leader or deputy may extend or finish');
};

const assertStatus = (trip: TripSnapshot, expected: TripStatus) => {
  if (trip.status !== expected) throw new Error(`Trip must be ${expected}`);
};

const runIdempotent = async <T>(
  transaction: TripCommandsTransaction,
  userId: string,
  key: string,
  request: unknown,
  mutation: () => Promise<T>,
): Promise<T> => {
  const requestHash = hashIdempotencyRequest(request);
  const reservation = await transaction.reserveIdempotency({ userId, key, requestHash });
  if (reservation.kind === 'existing') {
    if (reservation.requestHash !== requestHash) throw new Error('Idempotency key does not match request');
    return reservation.result as T;
  }
  const result = await mutation();
  await transaction.saveIdempotencyResponse({ userId, key, result });
  return result;
};

export const startTrip = async (
  command: StartTripCommand,
  repository: TripCommandsRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  const trip = await transaction.lockTrip(command.tripId);
  if (!trip) throw new Error('Trip not found');
  assertMember(await transaction.findMembership(command.tripId, command.userId));
  return runIdempotent(transaction, command.userId, command.idempotencyKey, {
    tripId: command.tripId, location: command.location,
  }, async () => {
    assertStatus(trip, 'draft');
    assertGps(command.location, command.now);
    const roles = await transaction.listMembershipRoles(trip.id);
    if (roles.length > 1 && !roles.includes('deputy')) throw new Error('Multi-person trips require a deputy before start');
    await transaction.activateTrip({ tripId: trip.id, startedAt: command.now });
    await transaction.replaceUnsentAlertSchedule({ tripId: trip.id, plannedFinishAt: trip.plannedFinishAt });
    await transaction.createLifecycleNotification({ tripId: trip.id, kind: 'started', dueAt: command.now });
    return { tripId: trip.id, status: 'active' as const, startedAt: command.now };
  });
});

export const recordCheckIn = async (
  command: RecordCheckInCommand,
  repository: TripCommandsRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  const trip = await transaction.lockTrip(command.tripId);
  if (!trip) throw new Error('Trip not found');
  assertMember(await transaction.findMembership(command.tripId, command.userId));
  return runIdempotent(transaction, command.userId, command.idempotencyKey, {
    tripId: command.tripId, message: command.message, location: command.location,
  }, async () => {
    assertStatus(trip, 'active');
    return transaction.insertCheckIn(checkInValues(command));
  });
});

export const extendTrip = async (
  command: ExtendTripCommand,
  repository: TripCommandsRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  const trip = await transaction.lockTrip(command.tripId);
  if (!trip) throw new Error('Trip not found');
  assertManager(await transaction.findMembership(command.tripId, command.userId));
  return runIdempotent(transaction, command.userId, command.idempotencyKey, {
    tripId: command.tripId, plannedFinishAt: command.plannedFinishAt,
  }, async () => {
    assertStatus(trip, 'active');
    if (command.plannedFinishAt <= command.now || command.plannedFinishAt <= trip.plannedFinishAt) {
      throw new Error('Planned finish must extend the active trip');
    }
    await transaction.replaceUnsentAlertSchedule({ tripId: trip.id, plannedFinishAt: command.plannedFinishAt });
    await transaction.createLifecycleNotification({ tripId: trip.id, kind: 'extended', dueAt: command.now });
    return { tripId: trip.id, plannedFinishAt: command.plannedFinishAt };
  });
});

export const finishTrip = async (
  command: FinishTripCommand,
  repository: TripCommandsRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  const trip = await transaction.lockTrip(command.tripId);
  if (!trip) throw new Error('Trip not found');
  assertManager(await transaction.findMembership(command.tripId, command.userId));
  return runIdempotent(transaction, command.userId, command.idempotencyKey, {
    tripId: command.tripId, message: command.message, location: command.location,
  }, async () => {
    assertStatus(trip, 'active');
    const finalCheckIn = await transaction.insertCheckIn(checkInValues(command));
    await transaction.finishTrip({ tripId: trip.id, finishedAt: command.now });
    await transaction.cancelUnsentAlerts(trip.id);
    await transaction.createLifecycleNotification({ tripId: trip.id, kind: 'finished', dueAt: command.now });
    return { tripId: trip.id, finishedAt: command.now, finalCheckInId: finalCheckIn.id };
  });
});

export const requestHelp = async (
  command: HelpTripCommand,
  repository: TripCommandsRepository = databaseRepository,
) => repository.transaction(async (transaction) => {
  const trip = await transaction.lockTrip(command.tripId);
  if (!trip) throw new Error('Trip not found');
  assertMember(await transaction.findMembership(command.tripId, command.userId));
  return runIdempotent(transaction, command.userId, command.idempotencyKey, { tripId: command.tripId, message: command.message, location: command.location, kind: 'help' }, async () => {
    assertStatus(trip, 'active');
    const checkIn = await transaction.insertCheckIn(checkInValues(command));
    await transaction.recordHelpRequested({ tripId: trip.id, at: command.now });
    await transaction.createLifecycleNotification({ tripId: trip.id, kind: 'help', dueAt: command.now });
    return { tripId: trip.id, helpCheckInId: checkIn.id, requestedAt: command.now };
  });
});

const databaseTransaction = (database: any): TripCommandsTransaction => ({
  async lockTrip(tripId) {
    const [trip] = await database.select({
      id: trips.id, status: trips.status, plannedFinishAt: trips.plannedFinishAt,
      startedAt: trips.startedAt, finishedAt: trips.finishedAt,
    }).from(trips).where(eq(trips.id, tripId)).for('update');
    return trip;
  },
  async findMembership(tripId, userId) {
    const [membership] = await database.select({ role: tripMembers.role }).from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))).limit(1);
    return membership?.role;
  },
  async listMembershipRoles(tripId) {
    const memberships = await database.select({ role: tripMembers.role }).from(tripMembers).where(eq(tripMembers.tripId, tripId));
    return memberships.map((membership: { role: TripRole }) => membership.role);
  },
  async reserveIdempotency({ userId, key, requestHash }) {
    const [inserted] = await database.insert(idempotencyKeys).values({ userId, key, requestHash })
      .onConflictDoNothing().returning({ id: idempotencyKeys.id });
    if (inserted) return { kind: 'reserved' as const };
    const [existing] = await database.select({ requestHash: idempotencyKeys.requestHash, result: idempotencyKeys.response })
      .from(idempotencyKeys).where(and(eq(idempotencyKeys.userId, userId), eq(idempotencyKeys.key, key))).limit(1);
    if (!existing?.result) throw new Error('Idempotency request is pending');
    return { kind: 'existing' as const, requestHash: existing.requestHash, result: existing.result };
  },
  async saveIdempotencyResponse({ userId, key, result }) {
    await database.update(idempotencyKeys).set({ response: result }).where(and(eq(idempotencyKeys.userId, userId), eq(idempotencyKeys.key, key)));
  },
  async activateTrip({ tripId, startedAt }) {
    await database.update(trips).set({ status: 'active', startedAt, updatedAt: startedAt }).where(eq(trips.id, tripId));
  },
  async createLifecycleNotification({ tripId, kind, dueAt }) {
    await database.insert(alertEvents).values({ tripId, stage: kind, status: 'pending', dueAt });
  },
  async recordHelpRequested({ tripId, at }) {
    await database.update(trips).set({ helpRequestedAt: at, updatedAt: at }).where(eq(trips.id, tripId));
  },
  async insertCheckIn(value) {
    const [checkIn] = await database.insert(checkIns).values(value).returning();
    return checkIn as StoredCheckIn;
  },
  async replaceUnsentAlertSchedule({ tripId, plannedFinishAt }) {
    await database.update(alertEvents).set({ status: 'cancelled' })
      .where(and(eq(alertEvents.tripId, tripId), sql`${alertEvents.status} in ('pending', 'claimed') and ${alertEvents.stage} in ('due', 'overdue_60', 'overdue_120')`));
    await database.update(alertDeliveries).set({ status: 'cancelled' })
      .where(sql`${alertDeliveries.eventId} in (select ${alertEvents.id} from ${alertEvents} where ${alertEvents.tripId} = ${tripId} and ${alertEvents.stage} in ('due', 'overdue_60', 'overdue_120')) and ${alertDeliveries.status} in ('pending', 'claimed')`);
    await database.insert(alertEvents).values(scheduleAlertEvents(tripId, plannedFinishAt).map(({ stage, dueAt }) => ({
      tripId, stage, status: 'pending' as const, dueAt,
    })));
    await database.update(trips).set({ plannedFinishAt, updatedAt: new Date() }).where(eq(trips.id, tripId));
  },
  async finishTrip({ tripId, finishedAt }) {
    await database.update(trips).set({ status: 'finished', finishedAt, updatedAt: finishedAt }).where(eq(trips.id, tripId));
  },
  async cancelUnsentAlerts(tripId) {
    await database.update(alertEvents).set({ status: 'cancelled' })
      .where(and(eq(alertEvents.tripId, tripId), sql`${alertEvents.status} in ('pending', 'claimed')`));
    await database.update(alertDeliveries).set({ status: 'cancelled' })
      .where(sql`${alertDeliveries.eventId} in (select ${alertEvents.id} from ${alertEvents} where ${alertEvents.tripId} = ${tripId}) and ${alertDeliveries.status} in ('pending', 'claimed')`);
  },
});

const databaseRepository: TripCommandsRepository = {
  transaction: async (operation) => {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (transaction) => operation(databaseTransaction(transaction)));
  },
  ...databaseTransaction(undefined),
};
