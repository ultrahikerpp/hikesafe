import { randomBytes as nodeRandomBytes } from 'node:crypto';

import { hashIdempotencyRequest, hashViewerGrant } from '@/src/lib/idempotency';

import type { TripRole } from './domain';

export interface CreateTripCommand {
  ownerUserId: string;
  routeVersionId: string;
  startsAt: Date;
  plannedFinishAt: Date;
  members: Array<{ userId: string; role: TripRole }>;
  guardianBindingIds: string[];
  vehicle: string;
  equipment: string[];
  idempotencyKey: string;
}

export interface ViewerGrantMessage {
  guardianBindingId: string;
  token: string;
}

export interface CreateTripResult {
  tripId: string;
  viewerGrants: ViewerGrantMessage[];
}

type IdempotencyReservation =
  | { kind: 'reserved' }
  | { kind: 'existing'; requestHash: string; tripId: string };

export interface CreateTripTransaction {
  findRouteVersion(id: string): Promise<{ id: string; isActive: boolean } | undefined>;
  findBoundGuardianBindings(ownerUserId: string, ids: string[]): Promise<string[]>;
  reserveIdempotency(value: {
    ownerUserId: string;
    key: string;
    requestHash: string;
  }): Promise<IdempotencyReservation>;
  saveIdempotencyResponse(value: {
    ownerUserId: string;
    key: string;
    tripId: string;
  }): Promise<void>;
  insertTrip(command: CreateTripCommand): Promise<{ id: string }>;
  insertMembers(tripId: string, members: CreateTripCommand['members']): Promise<void>;
  insertGuardians(
    tripId: string,
    bindingIds: string[],
  ): Promise<Array<{ id: string; lineBindingId: string }>>;
  insertViewerGrant(value: {
    tripId: string;
    guardianId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
}

export interface CreateTripRepository extends CreateTripTransaction {
  transaction<T>(operation: (transaction: CreateTripTransaction) => Promise<T>): Promise<T>;
}

interface CreateTripDependencies {
  randomBytes?: (size: number) => Uint8Array;
}

const hasDuplicates = (values: string[]) => new Set(values).size !== values.length;

const validateCommand = (command: CreateTripCommand) => {
  if (command.plannedFinishAt <= command.startsAt) {
    throw new Error('Planned finish must be after start');
  }
  if (hasDuplicates(command.members.map(({ userId }) => userId))) {
    throw new Error('Trip members must be unique');
  }
  if (hasDuplicates(command.guardianBindingIds)) {
    throw new Error('Guardian bindings must be unique');
  }
  if (command.members.filter(({ role }) => role === 'leader').length !== 1 ||
    !command.members.some(({ userId, role }) => userId === command.ownerUserId && role === 'leader')) {
    throw new Error('Trip owner must be the only leader');
  }
  if (command.members.length > 1 && !command.members.some(({ role }) => role === 'deputy')) {
    throw new Error('Multi-person trips require a deputy');
  }
};

const createDatabaseTransaction = (database: any): CreateTripTransaction => ({
  async findRouteVersion(id) {
    const [{ eq }, { routeVersions }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/schema'),
    ]);
    const [routeVersion] = await database
      .select({ id: routeVersions.id, isActive: routeVersions.isActive })
      .from(routeVersions)
      .where(eq(routeVersions.id, id))
      .limit(1);
    return routeVersion;
  },

  async findBoundGuardianBindings(ownerUserId, ids) {
    if (ids.length === 0) return [];
    const [{ and, eq, inArray, isNotNull, isNull }, { lineBindings }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/schema'),
    ]);
    const bindings = await database
      .select({ id: lineBindings.id })
      .from(lineBindings)
      .where(and(
        eq(lineBindings.userId, ownerUserId),
        inArray(lineBindings.id, ids),
        isNotNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
      ));
    return bindings.map(({ id }: { id: string }) => id);
  },

  async reserveIdempotency({ ownerUserId, key, requestHash }) {
    const [{ and, eq }, { idempotencyKeys }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/schema'),
    ]);
    const [reserved] = await database
      .insert(idempotencyKeys)
      .values({ userId: ownerUserId, key, requestHash })
      .onConflictDoNothing()
      .returning({ id: idempotencyKeys.id });
    if (reserved) return { kind: 'reserved' as const };

    const [existing] = await database
      .select({ requestHash: idempotencyKeys.requestHash, response: idempotencyKeys.response })
      .from(idempotencyKeys)
      .where(and(eq(idempotencyKeys.userId, ownerUserId), eq(idempotencyKeys.key, key)))
      .limit(1);
    const response = existing?.response as { tripId?: string } | null | undefined;
    if (!existing || !response?.tripId) throw new Error('Idempotency request is pending');
    return { kind: 'existing' as const, requestHash: existing.requestHash, tripId: response.tripId };
  },

  async saveIdempotencyResponse({ ownerUserId, key, tripId }) {
    const [{ and, eq }, { idempotencyKeys }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/schema'),
    ]);
    await database.update(idempotencyKeys).set({ response: { tripId } }).where(and(
      eq(idempotencyKeys.userId, ownerUserId),
      eq(idempotencyKeys.key, key),
    ));
  },

  async insertTrip(command) {
    const [{ trips }] = await Promise.all([import('@/src/db/schema')]);
    const [trip] = await database.insert(trips).values({
      ownerUserId: command.ownerUserId,
      routeVersionId: command.routeVersionId,
      startsAt: command.startsAt,
      plannedFinishAt: command.plannedFinishAt,
      vehicle: command.vehicle,
      equipment: command.equipment,
    }).returning({ id: trips.id });
    return trip;
  },

  async insertMembers(tripId, members) {
    const [{ tripMembers }] = await Promise.all([import('@/src/db/schema')]);
    await database.insert(tripMembers).values(members.map((member) => ({ tripId, ...member })));
  },

  async insertGuardians(tripId, bindingIds) {
    if (bindingIds.length === 0) return [];
    const [{ guardians }] = await Promise.all([import('@/src/db/schema')]);
    return database.insert(guardians).values(
      bindingIds.map((lineBindingId) => ({ tripId, lineBindingId })),
    ).returning({ id: guardians.id, lineBindingId: guardians.lineBindingId });
  },

  async insertViewerGrant(grant) {
    const [{ viewerGrants }] = await Promise.all([import('@/src/db/schema')]);
    await database.insert(viewerGrants).values(grant);
  },
});

const databaseRepository: CreateTripRepository = {
  transaction: async (operation) => {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (database) => operation(createDatabaseTransaction(database)));
  },
  ...createDatabaseTransaction(undefined),
};

export const createTrip = async (
  command: CreateTripCommand,
  repository: CreateTripRepository = databaseRepository,
  dependencies: CreateTripDependencies = {},
): Promise<CreateTripResult> => {
  validateCommand(command);
  const requestHash = hashIdempotencyRequest(command);
  const randomBytes = dependencies.randomBytes ?? nodeRandomBytes;

  return repository.transaction(async (transaction) => {
    const idempotency = await transaction.reserveIdempotency({
      ownerUserId: command.ownerUserId,
      key: command.idempotencyKey,
      requestHash,
    });
    if (idempotency.kind === 'existing') {
      if (idempotency.requestHash !== requestHash) {
        throw new Error('Idempotency key does not match request');
      }
      return { tripId: idempotency.tripId, viewerGrants: [] };
    }

    const routeVersion = await transaction.findRouteVersion(command.routeVersionId);
    if (!routeVersion?.isActive) throw new Error('Route version is not active');

    const boundBindings = await transaction.findBoundGuardianBindings(
      command.ownerUserId,
      command.guardianBindingIds,
    );
    if (boundBindings.length !== command.guardianBindingIds.length) {
      throw new Error('Guardian binding is not active');
    }

    const trip = await transaction.insertTrip(command);
    await transaction.insertMembers(trip.id, command.members);
    const guardians = await transaction.insertGuardians(trip.id, command.guardianBindingIds);
    const viewerGrants = guardians.map(({ id, lineBindingId }) => {
      const token = Buffer.from(randomBytes(32)).toString('base64url');
      return { guardianId: id, guardianBindingId: lineBindingId, token };
    });
    await Promise.all(viewerGrants.map(({ guardianId, token }) => transaction.insertViewerGrant({
      tripId: trip.id,
      guardianId,
      tokenHash: hashViewerGrant(token),
      expiresAt: command.plannedFinishAt,
    })));
    await transaction.saveIdempotencyResponse({
      ownerUserId: command.ownerUserId,
      key: command.idempotencyKey,
      tripId: trip.id,
    });
    return {
      tripId: trip.id,
      viewerGrants: viewerGrants.map(({ guardianBindingId, token }) => ({ guardianBindingId, token })),
    };
  });
};
