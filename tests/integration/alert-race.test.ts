import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { processDueAlerts, type AlertProcessRepository } from '@/src/features/alerts/process';
import { finishTrip, type TripCommandsRepository } from '@/src/features/trips/commands';

let lineAttempts = 0;
let retryMode = false;
const server = setupServer(http.post('https://api.line.me/v2/bot/message/push', () => {
  lineAttempts += 1;
  return retryMode && lineAttempts === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({});
}));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { lineAttempts = 0; retryMode = false; server.resetHandlers(); });
afterAll(() => server.close());

const sendLine = async (delivery: { to: string; messages: Array<{ type: 'text'; text: string }>; idempotencyKey: string }) => {
  const response = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'content-type': 'application/json', 'x-line-retry-key': delivery.idempotencyKey }, body: JSON.stringify(delivery) });
  if (!response.ok) throw new Error(`LINE ${response.status}`);
};

class RaceStore implements AlertProcessRepository, TripCommandsRepository {
  trip = { id: 'trip-1', status: 'active' as 'active' | 'finished', plannedFinishAt: new Date('2026-07-12T05:00:00.000Z'), startedAt: new Date('2026-07-12T01:00:00.000Z'), finishedAt: null as Date | null };
  events = ['due', 'overdue_60', 'overdue_120'].map((stage) => ({ id: stage, stage, status: 'pending' as 'pending' | 'claimed' | 'cancelled' }));
  deliveries: Array<{ id: string; status: 'pending' | 'claimed' | 'sending' | 'sent' | 'cancelled'; token?: string; attempts: number }> = [];
  claimed!: () => void;
  release!: () => void;
  waitForDispatch = new Promise<void>((resolve) => { this.release = resolve; });
  private idempotency = new Map<string, { requestHash: string; result: unknown }>();
  async transaction<T>(operation: (transaction: any) => Promise<T>) { return operation(this); }
  async lockTrip(id: string) { return id === this.trip.id ? this.trip : undefined; }
  async findMembership(_tripId: string, userId: string) { return userId === 'deputy-1' ? 'deputy' : undefined; }
  async reserveIdempotency({ userId, key, requestHash }: any) { const id = `${userId}:${key}`; const existing = this.idempotency.get(id); if (existing) return { kind: 'existing' as const, ...existing }; this.idempotency.set(id, { requestHash, result: undefined }); return { kind: 'reserved' as const }; }
  async saveIdempotencyResponse({ userId, key, result }: any) { this.idempotency.set(`${userId}:${key}`, { requestHash: this.idempotency.get(`${userId}:${key}`)!.requestHash, result }); }
  async insertCheckIn(input: any) { return { id: 'finish-checkin', ...input }; }
  async finishTrip({ finishedAt }: any) { this.trip.status = 'finished'; this.trip.finishedAt = finishedAt; }
  async cancelUnsentAlerts() { this.events.forEach((event) => { if (event.status !== 'cancelled') event.status = 'cancelled'; }); this.deliveries.forEach((delivery) => { if (delivery.status !== 'sent') delivery.status = 'cancelled'; }); }
  async activateTrip() {}
  async replaceUnsentAlertSchedule() {}
  async claimDueActiveEvents() {
    const claims = this.events.filter((event) => event.status === 'pending').map((event) => { event.status = 'claimed'; return { eventId: event.id, claimToken: `claim-${event.id}`, claimVersion: 1 }; });
    this.claimed?.(); return claims;
  }
  async dispatchClaim({ claim }: any) {
    await this.waitForDispatch;
    const event = this.events.find((candidate) => candidate.id === claim.eventId);
    if (!event || event.status !== 'claimed' || this.trip.status !== 'active') return 'skipped' as const;
    event.status = 'cancelled'; this.deliveries.push({ id: `delivery-${event.id}`, status: 'pending', attempts: 0 }); return 'dispatched' as const;
  }
  async claimDueDeliveries() { return this.deliveries.filter((delivery) => delivery.status === 'pending').map((delivery) => { delivery.status = 'claimed'; delivery.token = `token-${delivery.id}-${delivery.attempts}`; return { id: delivery.id, claimToken: delivery.token }; }); }
  async prepareDelivery({ deliveryId, claimToken }: any) { const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); if (!delivery || delivery.status !== 'claimed' || delivery.token !== claimToken || this.trip.status !== 'active') return { outcome: 'skipped' as const }; delivery.status = 'sending'; return { outcome: 'ready' as const, id: delivery.id, claimToken, to: 'line-1', retryKey: delivery.id, messages: [{ type: 'text' as const, text: delivery.id }] }; }
  async markDeliverySent({ deliveryId, claimToken }: any) { const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); if (!delivery || delivery.status !== 'sending' || delivery.token !== claimToken) return false; delivery.status = 'sent'; return true; }
  async rescheduleDeliveryFailure({ deliveryId, claimToken }: any) { const delivery = this.deliveries.find((candidate) => candidate.id === deliveryId); if (!delivery || delivery.status !== 'sending' || delivery.token !== claimToken) return false; delivery.status = 'pending'; delivery.attempts += 1; return true; }
  async confirmClaimedActiveEvent() { return undefined; }
  async markSent() { return false; }
  async rescheduleFailure() { return false; }
}

describe('alert worker races and LINE failure recovery', () => {
  it('allows a finishing deputy transaction to cancel claims held by two concurrent workers', async () => {
    const store = new RaceStore(); const claimed = new Promise<void>((resolve) => { store.claimed = resolve; }); const now = new Date('2026-07-12T05:00:00.000Z');
    const first = processDueAlerts({ now, repository: store, send: sendLine });
    const second = processDueAlerts({ now, repository: store, send: sendLine });
    await claimed;
    await finishTrip({ tripId: 'trip-1', userId: 'deputy-1', idempotencyKey: 'finish-1', now }, store);
    store.release();
    await expect(Promise.all([first, second])).resolves.toEqual([
      { claimed: 3, sent: 0, failed: 0, skipped: 3 },
      { claimed: 0, sent: 0, failed: 0, skipped: 0 },
    ]);
    expect(lineAttempts).toBe(0);
    expect(new Set(store.events.map((event) => event.id)).size).toBe(3);
  });

  it('retries a LINE 500 once and records one eventual sent delivery with two attempts', async () => {
    const store = new RaceStore(); store.events = []; store.deliveries = [{ id: 'delivery-retry', status: 'pending', attempts: 0 }]; retryMode = true; const now = new Date('2026-07-12T05:00:00.000Z');
    await expect(processDueAlerts({ now, repository: store, send: sendLine })).resolves.toEqual({ claimed: 0, sent: 0, failed: 1, skipped: 0 });
    await expect(processDueAlerts({ now: new Date('2026-07-12T05:01:00.000Z'), repository: store, send: sendLine })).resolves.toEqual({ claimed: 0, sent: 1, failed: 0, skipped: 0 });
    expect(lineAttempts).toBe(2);
    expect(store.deliveries).toEqual([expect.objectContaining({ id: 'delivery-retry', status: 'sent', attempts: 1 })]);
  });
});
