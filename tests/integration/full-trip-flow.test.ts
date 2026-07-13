import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { processDueAlerts, type AlertProcessRepository } from '@/src/features/alerts/process';
import { deleteExpiredPreciseLocations, type RetentionRepository } from '@/src/features/retention/delete-expired-precise-locations';
import { createTrip, type CreateTripRepository } from '@/src/features/trips/service';
import { extendTrip, finishTrip, recordCheckIn, startTrip, type TripCommandsRepository } from '@/src/features/trips/commands';

const linePushes: Array<{ retryKey: string; text: string }> = [];
const server = setupServer(http.post('https://api.line.me/v2/bot/message/push', async ({ request }) => {
  const body = await request.json() as { messages: Array<{ text?: string }> };
  linePushes.push({ retryKey: request.headers.get('x-line-retry-key') ?? '', text: body.messages[0]?.text ?? '' });
  return HttpResponse.json({});
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { linePushes.length = 0; server.resetHandlers(); });
afterAll(() => server.close());

type Event = { id: string; stage: 'started' | 'extended' | 'due' | 'overdue_60' | 'overdue_120'; dueAt: Date; status: 'pending' | 'claimed' | 'sent' | 'cancelled'; token?: string };
type Delivery = { id: string; eventId: string; status: 'pending' | 'claimed' | 'sending' | 'sent' | 'cancelled'; retryKey: string; token?: string; attempts: number; message?: Array<{ type: 'text'; text: string }> };

class FlowStore implements CreateTripRepository, TripCommandsRepository, AlertProcessRepository, RetentionRepository {
  trip = { id: 'trip-1', status: 'draft' as 'draft' | 'active' | 'finished', plannedFinishAt: new Date('2026-07-12T02:00:00.000Z'), startedAt: null as Date | null, finishedAt: null as Date | null };
  checkIns: Array<any> = [];
  events: Event[] = [];
  deliveries: Delivery[] = [];
  private idempotency = new Map<string, { requestHash: string; result: unknown }>();
  private next = 0;
  async transaction<T>(operation: (transaction: any) => Promise<T>) { return operation(this); }
  async findRouteVersion() { return { id: 'route-1', isActive: true }; }
  async findBoundGuardianBindings() { return ['guardian-binding-1']; }
  async insertTrip(command: any) { this.trip.plannedFinishAt = command.plannedFinishAt; return { id: this.trip.id }; }
  async insertMembers() {}
  async insertGuardians() { return [{ id: 'guardian-1', lineBindingId: 'guardian-binding-1' }]; }
  async insertViewerGrant() {}
  async reserveIdempotency({ userId, key, requestHash }: any) {
    const id = `${userId}:${key}`; const existing = this.idempotency.get(id);
    if (existing) return { kind: 'existing' as const, ...existing, tripId: existing.result && (existing.result as any).tripId };
    this.idempotency.set(id, { requestHash, result: undefined }); return { kind: 'reserved' as const };
  }
  async saveIdempotencyResponse({ userId, key, tripId, result }: any) {
    const id = `${userId}:${key}`; const requestHash = this.idempotency.get(id)!.requestHash;
    this.idempotency.set(id, { requestHash, result: result ?? { tripId } });
  }
  async lockTrip(id: string) { return id === this.trip.id ? this.trip : undefined; }
  async findMembership(_tripId: string, userId: string) { return userId === 'leader-1' ? 'leader' : userId === 'deputy-1' ? 'deputy' : userId === 'member-1' ? 'member' : undefined; }
  async activateTrip({ startedAt }: any) { this.trip.status = 'active'; this.trip.startedAt = startedAt; }
  async createLifecycleNotification({ kind, dueAt }: any) { this.events.push({ id: `event-${++this.next}`, stage: kind, dueAt, status: 'pending' }); }
  async insertCheckIn(input: any) { const checkIn = { id: `check-in-${this.checkIns.length + 1}`, ...input }; this.checkIns.push(checkIn); return checkIn; }
  async replaceUnsentAlertSchedule({ plannedFinishAt }: any) {
    this.trip.plannedFinishAt = plannedFinishAt;
    this.events.forEach((event) => { if ((event.stage === 'due' || event.stage === 'overdue_60' || event.stage === 'overdue_120') && (event.status === 'pending' || event.status === 'claimed')) event.status = 'cancelled'; });
    for (const [stage, offset] of [['due', 0], ['overdue_60', 60], ['overdue_120', 120]] as const) {
      this.events.push({ id: `event-${++this.next}`, stage, dueAt: new Date(plannedFinishAt.getTime() + offset * 60_000), status: 'pending' });
    }
  }
  async finishTrip({ finishedAt }: any) { this.trip.status = 'finished'; this.trip.finishedAt = finishedAt; }
  async cancelUnsentAlerts() { this.events.forEach((event) => { if (event.status === 'pending' || event.status === 'claimed') event.status = 'cancelled'; }); this.deliveries.forEach((delivery) => { if (delivery.status !== 'sent') delivery.status = 'cancelled'; }); }
  async claimDueActiveEvents({ now }: any) {
    return this.events.filter((event) => this.trip.status === 'active' && event.status === 'pending' && event.dueAt <= now).map((event) => {
      event.status = 'claimed'; event.token = `event-token-${event.id}`; return { eventId: event.id, claimToken: event.token!, claimVersion: 1 };
    });
  }
  async dispatchClaim({ claim }: any) {
    const event = this.events.find((candidate) => candidate.id === claim.eventId);
    if (!event || event.status !== 'claimed' || this.trip.status !== 'active') return 'skipped' as const;
    event.status = 'sent'; this.deliveries.push({ id: `delivery-${event.id}`, eventId: event.id, status: 'pending', retryKey: `retry-${event.id}`, attempts: 0 });
    return 'dispatched' as const;
  }
  async claimDueDeliveries() { return this.deliveries.filter((delivery) => delivery.status === 'pending').map((delivery) => { delivery.status = 'claimed'; delivery.token = `delivery-token-${delivery.id}-${delivery.attempts}`; return { id: delivery.id, claimToken: delivery.token! }; }); }
  async prepareDelivery({ deliveryId, claimToken }: any) {
    const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); const event = this.events.find((candidate) => candidate.id === delivery?.eventId);
    if (!delivery || !event || delivery.status !== 'claimed' || delivery.token !== claimToken || this.trip.status !== 'active') return { outcome: 'skipped' as const };
    const messages = delivery.message ?? [{ type: 'text' as const, text: `BeSafe ${event.stage} ${this.trip.id}` }];
    delivery.message = messages; return { outcome: 'ready' as const, id: delivery.id, claimToken, to: 'line-recipient-1', retryKey: delivery.retryKey, messages };
  }
  async beginDeliverySend({ deliveryId, claimToken }: any) { const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); if (!delivery || delivery.status !== 'claimed' || delivery.token !== claimToken || this.trip.status !== 'active') return { outcome: 'skipped' as const }; delivery.status = 'sending'; return { outcome: 'ready' as const, id: delivery.id, claimToken, to: 'line-recipient-1', retryKey: delivery.retryKey, messages: delivery.message! }; }
  async markDeliverySent({ deliveryId, claimToken }: any) { const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); if (!delivery || delivery.status !== 'sending' || delivery.token !== claimToken) return false; delivery.status = 'sent'; return true; }
  async rescheduleDeliveryFailure({ deliveryId, claimToken }: any) { const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); if (!delivery || delivery.status !== 'sending' || delivery.token !== claimToken) return false; delivery.status = 'pending'; delivery.attempts += 1; return true; }
  async confirmClaimedActiveEvent() { return undefined; }
  async markSent() { return false; }
  async rescheduleFailure() { return false; }
  async redactEligibleLocations(cutoff: Date) {
    if (this.trip.status !== 'finished' || !this.trip.finishedAt || this.trip.finishedAt >= cutoff || this.events.some((event) => event.status === 'pending' || event.status === 'claimed') || this.deliveries.some((delivery) => delivery.status !== 'sent' && delivery.status !== 'cancelled')) return 0;
    const precise = this.checkIns.filter((checkIn) => checkIn.locationStatus === 'available');
    precise.forEach((checkIn) => Object.assign(checkIn, { locationStatus: 'redacted', latitude: undefined, longitude: undefined, accuracyMeters: undefined, locationCapturedAt: undefined, locationSource: undefined }));
    return precise.length;
  }
}

const gps = (at: string) => ({ latitude: 24.18, longitude: 121.28, accuracyMeters: 12, capturedAt: new Date(at), source: 'gps' as const });
const sendLine = async (delivery: { to: string; messages: Array<{ type: 'text'; text: string }>; idempotencyKey: string }) => {
  const response = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'content-type': 'application/json', 'x-line-retry-key': delivery.idempotencyKey }, body: JSON.stringify({ to: delivery.to, messages: delivery.messages }) });
  if (!response.ok) throw new Error(`LINE ${response.status}`);
};

describe('full trip flow with an explicit development repository fixture', () => {
  it('runs create, start, member check-in, extension, all three alerts, finish, and 91-day precision retention', async () => {
    const store = new FlowStore(); const startAt = new Date('2026-07-12T01:00:00.000Z'); const extended = new Date('2026-07-12T03:00:00.000Z');
    const created = await createTrip({ ownerUserId: 'leader-1', routeVersionId: 'route-1', startsAt: startAt, plannedFinishAt: new Date('2026-07-12T02:00:00.000Z'), members: [{ userId: 'leader-1', role: 'leader' }, { userId: 'deputy-1', role: 'deputy' }, { userId: 'member-1', role: 'member' }], guardianBindingIds: ['guardian-binding-1'], vehicle: '車', equipment: ['雨衣'], idempotencyKey: 'create-1' }, store, { randomBytes: () => new Uint8Array(32).fill(1) });
    expect(created.tripId).toBe('trip-1');
    await startTrip({ tripId: created.tripId, userId: 'leader-1', location: gps('2026-07-12T00:59:30.000Z'), idempotencyKey: 'start-1', now: startAt }, store);
    await recordCheckIn({ tripId: created.tripId, userId: 'member-1', message: '平安', location: gps('2026-07-12T01:10:00.000Z'), idempotencyKey: 'check-1', now: new Date('2026-07-12T01:10:00.000Z') }, store);
    await extendTrip({ tripId: created.tripId, userId: 'deputy-1', plannedFinishAt: extended, idempotencyKey: 'extend-1', now: new Date('2026-07-12T01:15:00.000Z') }, store);
    for (const at of [extended, new Date(extended.getTime() + 60 * 60_000), new Date(extended.getTime() + 120 * 60_000)]) await processDueAlerts({ now: at, repository: store, send: sendLine });
    expect(linePushes.map((push) => push.text)).toEqual(['BeSafe started trip-1', 'BeSafe due trip-1', 'BeSafe extended trip-1', 'BeSafe overdue_60 trip-1', 'BeSafe overdue_120 trip-1']);
    await finishTrip({ tripId: created.tripId, userId: 'deputy-1', location: gps('2026-07-12T05:01:00.000Z'), idempotencyKey: 'finish-1', now: new Date('2026-07-12T05:01:00.000Z') }, store);
    await processDueAlerts({ now: new Date('2026-07-12T05:02:00.000Z'), repository: store, send: sendLine });
    expect(linePushes).toHaveLength(5);
    await expect(deleteExpiredPreciseLocations(() => new Date('2026-10-12T05:02:00.000Z'), store)).resolves.toEqual({ deleted: 2 });
    expect(store.checkIns.every((checkIn) => checkIn.locationStatus !== 'available')).toBe(true);
  });
});
