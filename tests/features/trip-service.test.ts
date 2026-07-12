import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  createTrip,
  type CreateTripRepository,
} from '@/src/features/trips/service';

const command = {
  ownerUserId: 'owner-1',
  routeVersionId: 'route-version-active',
  startsAt: new Date('2026-07-13T01:00:00Z'),
  plannedFinishAt: new Date('2026-07-13T07:00:00Z'),
  members: [
    { userId: 'owner-1', role: 'leader' as const },
    { userId: 'deputy-1', role: 'deputy' as const },
  ],
  guardianBindingIds: ['binding-1'],
  vehicle: 'car',
  equipment: ['headlamp'],
  idempotencyKey: 'request-1',
};

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

const makeRepository = (): CreateTripRepository & {
  trips: Array<{ id: string }>;
  grants: Array<{ tokenHash: string }>;
} => {
  const idempotency = new Map<string, { requestHash: string; tripId: string }>();
  const trips: Array<{ id: string }> = [];
  const grants: Array<{ tokenHash: string }> = [];
  const repository: CreateTripRepository & {
    trips: Array<{ id: string }>;
    grants: Array<{ tokenHash: string }>;
  } = {
    trips,
    grants,
    transaction: async (operation) => operation(repository),
    findRouteVersion: async (id) => ({ id, isActive: id === 'route-version-active' }),
    findBoundGuardianBindings: async (ownerUserId, ids) =>
      ids.filter((id) => ownerUserId === 'owner-1' && id === 'binding-1'),
    reserveIdempotency: async ({ ownerUserId, key, requestHash: hash }) => {
      const existing = idempotency.get(`${ownerUserId}:${key}`);
      if (existing) return { kind: 'existing', ...existing };
      idempotency.set(`${ownerUserId}:${key}`, { requestHash: hash, tripId: '' });
      return { kind: 'reserved' };
    },
    saveIdempotencyResponse: async ({ ownerUserId, key, tripId }) => {
      idempotency.set(`${ownerUserId}:${key}`, {
        requestHash: idempotency.get(`${ownerUserId}:${key}`)!.requestHash,
        tripId,
      });
    },
    insertTrip: async () => {
      const trip = { id: `trip-${trips.length + 1}` };
      trips.push(trip);
      return trip;
    },
    insertMembers: async () => undefined,
    insertGuardians: async (_tripId, bindingIds) =>
      bindingIds.map((lineBindingId, index) => ({
        id: `guardian-${index + 1}`,
        lineBindingId,
      })),
    insertViewerGrant: async (grant) => { grants.push(grant); },
  };
  return repository;
};

describe('createTrip', () => {
  it('rejects a superseded route version', async () => {
    await expect(createTrip({ ...command, routeVersionId: 'route-version-old' }, makeRepository()))
      .rejects.toThrow('Route version is not active');
  });

  it('rejects a planned finish that is not after the start', async () => {
    await expect(createTrip({ ...command, plannedFinishAt: command.startsAt }, makeRepository()))
      .rejects.toThrow('Planned finish must be after start');
  });

  it('requires a deputy when more than one person is on the trip', async () => {
    await expect(createTrip({
      ...command,
      members: [
        { userId: 'owner-1', role: 'leader' },
        { userId: 'member-1', role: 'member' },
      ],
    }, makeRepository())).rejects.toThrow('Multi-person trips require a deputy');
  });

  it('rejects duplicate member IDs', async () => {
    await expect(createTrip({
      ...command,
      members: [
        { userId: 'owner-1', role: 'leader' },
        { userId: 'owner-1', role: 'deputy' },
      ],
    }, makeRepository())).rejects.toThrow('Trip members must be unique');
  });

  it('rejects an unbound guardian', async () => {
    await expect(createTrip({ ...command, guardianBindingIds: ['unbound'] }, makeRepository()))
      .rejects.toThrow('Guardian binding is not active');
  });

  it('rejects an idempotency key reused with a different request', async () => {
    const repository = makeRepository();
    await createTrip(command, repository);

    await expect(createTrip({ ...command, vehicle: 'bus' }, repository))
      .rejects.toThrow('Idempotency key does not match request');
  });

  it('returns the original trip for an identical idempotent request', async () => {
    const repository = makeRepository();
    const first = await createTrip(command, repository);
    const repeated = await createTrip(command, repository);

    expect(repeated.tripId).toBe(first.tripId);
    expect(repository.trips).toHaveLength(1);
  });

  it('stores only the SHA-256 hash of a 32-byte viewer grant', async () => {
    const repository = makeRepository();
    const result = await createTrip(command, repository, {
      randomBytes: () => Uint8Array.from({ length: 32 }, (_, index) => index),
    });

    expect(result.viewerGrants).toEqual([
      { guardianBindingId: 'binding-1', token: Buffer.from(Uint8Array.from({ length: 32 }, (_, index) => index)).toString('base64url') },
    ]);
    expect(repository.grants).toEqual([
      expect.objectContaining({
        tokenHash: tokenHash(Buffer.from(Uint8Array.from({ length: 32 }, (_, index) => index)).toString('base64url')),
      }),
    ]);
    expect(JSON.stringify(repository.grants)).not.toContain(result.viewerGrants[0].token);
  });
});
