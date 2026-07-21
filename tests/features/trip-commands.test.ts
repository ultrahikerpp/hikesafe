import { describe, expect, it } from 'vitest';

import {
  extendTrip,
  finishTrip,
  requestHelp,
  recordCheckIn,
  startTrip,
  type TripCommandsRepository,
} from '@/src/features/trips/commands';

const now = new Date('2026-07-12T01:00:00.000Z');
const freshGps = {
  latitude: 24.18,
  longitude: 121.28,
  accuracyMeters: 12,
  capturedAt: new Date('2026-07-12T00:59:00.000Z'),
  source: 'gps' as const,
};

const freshLineFix = {
  latitude: 24.18,
  longitude: 121.28,
  capturedAt: new Date('2026-07-12T00:59:00.000Z'),
  source: 'line' as const,
};

const makeRepository = (): TripCommandsRepository & {
  trip: any;
  checkIns: any[];
  alertEvents: any[];
  calls: string[];
} => {
  const idempotency = new Map<string, { requestHash: string; result: unknown }>();
  const repository: TripCommandsRepository & { trip: any; checkIns: any[]; alertEvents: any[]; calls: string[] } = {
    trip: { id: 'trip-1', status: 'draft', plannedFinishAt: new Date('2026-07-12T05:00:00.000Z'), startedAt: null, finishedAt: null },
    checkIns: [],
    alertEvents: [
      { id: 'old-due', status: 'pending', stage: 'due' },
      { id: 'old-60', status: 'pending', stage: 'overdue_60' },
      { id: 'old-120', status: 'sent', stage: 'overdue_120' },
    ],
    calls: [],
    transaction: async (operation) => operation(repository),
    lockTrip: async (tripId) => tripId === 'trip-1' ? repository.trip : undefined,
    findMembership: async (_tripId, userId) => userId === 'leader-1' ? 'leader' : userId === 'deputy-1' ? 'deputy' : userId === 'member-1' ? 'member' : undefined,
    listMembershipRoles: async () => ['leader'],
    reserveIdempotency: async ({ userId, key, requestHash }) => {
      const existing = idempotency.get(`${userId}:${key}`);
      if (existing) return { kind: 'existing', ...existing };
      idempotency.set(`${userId}:${key}`, { requestHash, result: undefined });
      return { kind: 'reserved' };
    },
    saveIdempotencyResponse: async ({ userId, key, result }) => {
      idempotency.set(`${userId}:${key}`, { requestHash: idempotency.get(`${userId}:${key}`)!.requestHash, result });
    },
    activateTrip: async ({ startedAt }) => { repository.calls.push('activate'); repository.trip = { ...repository.trip, status: 'active', startedAt }; },
    createLifecycleNotification: async ({ kind }) => { repository.calls.push(`notify-${kind}`); },
    insertCheckIn: async (checkIn) => { repository.calls.push('check-in'); const result = { id: `check-in-${repository.checkIns.length + 1}`, ...checkIn }; repository.checkIns.push(result); return result; },
    replaceUnsentAlertSchedule: async ({ plannedFinishAt }) => {
      repository.calls.push('replace-alerts');
      repository.alertEvents = repository.alertEvents.map((event) => event.status === 'pending' || event.status === 'claimed' ? { ...event, status: 'cancelled' } : event);
      repository.alertEvents.push(...(['due', 'overdue_60', 'overdue_120'] as const).map((stage) => ({ id: `new-${stage}`, stage, status: 'pending', dueAt: new Date(plannedFinishAt.getTime() + ({ due: 0, overdue_60: 60, overdue_120: 120 }[stage] * 60_000)) })));
      repository.trip = { ...repository.trip, plannedFinishAt };
    },
    finishTrip: async ({ finishedAt }) => { repository.calls.push('finish'); repository.trip = { ...repository.trip, status: 'finished', finishedAt }; },
    recordHelpRequested: async () => { repository.calls.push('help-requested'); },
    cancelUnsentAlerts: async () => { repository.calls.push('cancel-alerts'); repository.alertEvents = repository.alertEvents.map((event) => event.status === 'pending' || event.status === 'claimed' ? { ...event, status: 'cancelled' } : event); },
  };
  return repository;
};

describe('trip lifecycle commands', () => {
  it('starts a draft trip only with a fresh GPS fix', async () => {
    const repository = makeRepository();
    const command = { tripId: 'trip-1', userId: 'leader-1', location: freshGps, idempotencyKey: 'start-1', now };
    await startTrip(command, repository);
    await startTrip(command, repository);
    expect(repository.trip).toMatchObject({ status: 'active', startedAt: now });
    expect(repository.calls.filter((call) => call === 'activate')).toHaveLength(1);
    expect(repository.calls.filter((call) => call === 'notify-started')).toHaveLength(1);
    expect(repository.alertEvents.filter((event) => event.id.startsWith('new-'))).toHaveLength(3);
    await expect(startTrip({ tripId: 'trip-1', userId: 'leader-1', location: { ...freshGps, capturedAt: new Date('2026-07-12T00:54:59.000Z') }, idempotencyKey: 'stale-1', now }, makeRepository())).rejects.toThrow('Location is stale');
  });

  it('refuses to start a multi-person draft until a deputy has been designated', async () => {
    const repository = makeRepository();
    repository.listMembershipRoles = async () => ['leader', 'member'];
    await expect(startTrip({ tripId: 'trip-1', userId: 'leader-1', location: freshGps, idempotencyKey: 'start-without-deputy', now }, repository))
      .rejects.toThrow('Multi-person trips require a deputy before start');
  });

  it('lets a member record a text-only check-in with explicit unavailable location', async () => {
    const repository = makeRepository();
    repository.trip.status = 'active';
    const command = { tripId: 'trip-1', userId: 'member-1', message: '平安，無定位訊號', idempotencyKey: 'check-in-1', now };
    await recordCheckIn(command, repository);
    await recordCheckIn(command, repository);
    expect(repository.checkIns).toEqual([expect.objectContaining({ userId: 'member-1', message: '平安，無定位訊號', locationStatus: 'unavailable' })]);
  });

  it('accepts a fresh network location for check-ins', async () => {
    const repository = makeRepository();
    repository.trip.status = 'active';
    await recordCheckIn({
      tripId: 'trip-1',
      userId: 'member-1',
      location: { ...freshGps, source: 'network' },
      idempotencyKey: 'network-1',
      now,
    }, repository);

    expect(repository.checkIns).toEqual([
      expect.objectContaining({
        locationStatus: 'available',
        accuracyMeters: 12,
        locationSource: 'network',
      }),
    ]);
  });

  it('allows a LINE location for both check-ins and trip start', async () => {
    const repository = makeRepository();
    repository.trip.status = 'active';
    await recordCheckIn({
      tripId: 'trip-1',
      userId: 'member-1',
      location: {
        latitude: 23.47,
        longitude: 120.95,
        capturedAt: now,
        source: 'line',
      },
      idempotencyKey: 'line-check-in-1',
      now,
    }, repository);

    expect(repository.checkIns).toEqual([
      expect.objectContaining({
        locationStatus: 'available',
        latitude: 23.47,
        longitude: 120.95,
        accuracyMeters: null,
        locationSource: 'line',
      }),
    ]);

    const startRepository = makeRepository();
    const result = await startTrip({
      tripId: 'trip-1',
      userId: 'leader-1',
      location: {
        latitude: 23.47,
        longitude: 120.95,
        capturedAt: now,
        source: 'line',
      },
      idempotencyKey: 'start-line-1',
      now,
    }, startRepository);
    expect(result).toMatchObject({ tripId: 'trip-1', status: 'active' });
  });

  it('starts a draft trip from a LINE location fix', async () => {
    const repository = makeRepository();

    const result = await startTrip({
      tripId: 'trip-1', userId: 'leader-1', location: freshLineFix, idempotencyKey: 'start-line-1', now,
    }, repository);

    expect(result).toMatchObject({ tripId: 'trip-1', status: 'active' });
    expect(repository.trip).toMatchObject({ status: 'active', startedAt: now });
  });

  it('rejects a stale LINE location fix when starting', async () => {
    await expect(startTrip({
      tripId: 'trip-1',
      userId: 'leader-1',
      location: { ...freshLineFix, capturedAt: new Date('2026-07-12T00:54:59.000Z') },
      idempotencyKey: 'start-line-stale',
      now,
    }, makeRepository())).rejects.toThrow('Location is stale');
  });

  it('rejects a LINE location fix outside Taiwan when starting', async () => {
    await expect(startTrip({
      tripId: 'trip-1',
      userId: 'leader-1',
      location: { ...freshLineFix, latitude: 35.68, longitude: 139.77 },
      idempotencyKey: 'start-line-abroad',
      now,
    }, makeRepository())).rejects.toThrow('Location coordinates are outside Taiwan');
  });

  it('allows only leader or deputy to extend and atomically replaces unsent alerts', async () => {
    const repository = makeRepository();
    repository.trip.status = 'active';
    repository.alertEvents[0].status = 'claimed';
    const plannedFinishAt = new Date('2026-07-12T06:00:00.000Z');
    const command = { tripId: 'trip-1', userId: 'deputy-1', plannedFinishAt, idempotencyKey: 'extend-1', now };
    await extendTrip(command, repository);
    await extendTrip(command, repository);
    expect(repository.calls).toContain('replace-alerts');
    expect(repository.calls.filter((call) => call === 'replace-alerts')).toHaveLength(1);
    expect(repository.calls.filter((call) => call === 'notify-extended')).toHaveLength(1);
    expect(repository.alertEvents.filter((event) => event.id.startsWith('old-') && event.status === 'cancelled')).toHaveLength(2);
    expect(repository.alertEvents.filter((event) => event.id.startsWith('new-') && event.status === 'pending')).toHaveLength(3);
    await expect(extendTrip({ tripId: 'trip-1', userId: 'member-1', plannedFinishAt, idempotencyKey: 'extend-2', now }, makeRepository())).rejects.toThrow('Only leader or deputy may extend or finish');
  });

  it('finishes once and cancels every pending alert', async () => {
    const repository = makeRepository();
    repository.trip.status = 'active';
    const command = { tripId: 'trip-1', userId: 'leader-1', idempotencyKey: 'finish-1', now };
    const first = await finishTrip(command, repository);
    const repeated = await finishTrip(command, repository);
    expect(repeated).toEqual(first);
    expect(repository.trip).toMatchObject({ status: 'finished', finishedAt: now });
    expect(repository.alertEvents.filter((event) => event.status === 'pending')).toHaveLength(0);
    expect(repository.calls.filter((call) => call === 'finish')).toHaveLength(1);
    expect(repository.calls).toContain('notify-finished');
  });

  it('records an idempotent help request with explicit unavailable location and reliable guardian notification', async () => {
    const repository = makeRepository();
    repository.trip.status = 'active';
    const command = { tripId: 'trip-1', userId: 'member-1', message: '需要協助', idempotencyKey: 'help-1', now };
    await requestHelp(command, repository);
    await requestHelp(command, repository);
    expect(repository.checkIns).toEqual([expect.objectContaining({ locationStatus: 'unavailable', message: '需要協助' })]);
    expect(repository.calls.filter((call) => call === 'help-requested')).toHaveLength(1);
    expect(repository.calls.filter((call) => call === 'notify-help')).toHaveLength(1);
  });
});
