import { describe, expect, it, vi } from 'vitest';

import {
  createGrantToken,
  materializeDeliveryMessages,
  processDueAlerts,
  retryAt,
  type AlertDeliveryWork,
  type AlertProcessRepository,
} from '@/src/features/alerts/process';

const now = new Date('2026-07-12T05:00:00.000Z');
const message = { type: 'text' as const, text: 'alert snapshot' };
const claim = { eventId: 'event-1', claimToken: 'opaque-token', claimVersion: 1 };
const event = {
  id: 'event-1',
  stage: 'due' as const,
  trip: {
    id: 'trip-1',
    plannedFinishAt: now,
    routeName: '玉山主峰',
    team: ['阿山'],
    lastCheckInAt: null,
    lastLocationStatus: 'unavailable' as const,
  },
  recipients: [{ id: 'line-user-1', name: '阿山' }],
};

const repository = (overrides: Partial<AlertProcessRepository> = {}): AlertProcessRepository => ({
  claimDueActiveEvents: vi.fn().mockResolvedValue([claim]),
  confirmClaimedActiveEvent: vi.fn().mockResolvedValue(event),
  markSent: vi.fn().mockResolvedValue(true),
  rescheduleFailure: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('processDueAlerts', () => {
  it('derives the same raw viewer token from delivery id and grant version without persisting it', () => {
    const one = createGrantToken('delivery-1', 2, 'grant-secret');
    const two = createGrantToken('delivery-1', 2, 'grant-secret');
    expect(one).toBe(two);
    expect(one).not.toBe(createGrantToken('delivery-1', 3, 'grant-secret'));
  });

  it('reconstructs a viewer URL from a token-free persisted message template', () => {
    const template = [{ type: 'text' as const, text: 'https://viewer?grant=__BESAFE_GRANT_TOKEN__' }];
    const sent = materializeDeliveryMessages(template, 'delivery-1', 1, 'grant-secret');
    expect(JSON.stringify(template)).toContain('__BESAFE_GRANT_TOKEN__');
    expect(JSON.stringify(template)).not.toContain(createGrantToken('delivery-1', 1, 'grant-secret'));
    expect(JSON.stringify(sent)).toContain(createGrantToken('delivery-1', 1, 'grant-secret'));
  });

  it('reports a dispatched event with no recipients as an explicit skip', async () => {
    const store = repository({ dispatchClaim: vi.fn().mockResolvedValue('skipped') });
    await expect(processDueAlerts({ now, repository: store })).resolves.toEqual({ claimed: 1, sent: 0, failed: 0, skipped: 1 });
  });

  it('sends only after a delivery has been durably linearized, outside the database operation', async () => {
    const prepared = {
      outcome: 'ready' as const, id: 'delivery-1', to: 'line-user-1', retryKey: 'retry-1',
      messages: [message],
    };
    const store = repository({
      claimDueActiveEvents: vi.fn().mockResolvedValue([]),
      claimDueDeliveries: vi.fn().mockResolvedValue([{ id: 'delivery-1' }]),
      prepareDelivery: vi.fn().mockResolvedValue(prepared),
      markDeliverySent: vi.fn().mockResolvedValue(true),
      rescheduleDeliveryFailure: vi.fn().mockResolvedValue(true),
    });
    const send = vi.fn().mockResolvedValue(undefined);

    await processDueAlerts({ now, repository: store, send });

    expect(store.prepareDelivery.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0]);
    expect(send).toHaveBeenCalledWith({ to: 'line-user-1', messages: prepared.messages, idempotencyKey: 'retry-1' });
    expect(store.markDeliverySent).toHaveBeenCalledWith({ deliveryId: 'delivery-1', now });
  });

  it('reclaims an expired sending lease and preserves the persistent retry key and message', async () => {
    const store = repository({
      claimDueActiveEvents: vi.fn().mockResolvedValue([]),
      claimDueDeliveries: vi.fn().mockResolvedValue([{ id: 'delivery-1' }]),
      prepareDelivery: vi.fn().mockResolvedValue({
        outcome: 'ready' as const, id: 'delivery-1', to: 'line-user-1', retryKey: 'retry-1', messages: [message],
      }),
      markDeliverySent: vi.fn().mockResolvedValue(true),
      rescheduleDeliveryFailure: vi.fn().mockResolvedValue(true),
    });
    const send = vi.fn().mockResolvedValue(undefined);
    await processDueAlerts({ now, repository: store, send });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'retry-1', messages: [message] }));
  });

  it('allows lifecycle cancellation to win before sending, but never cancels an already sending delivery', async () => {
    const store = repository({
      claimDueActiveEvents: vi.fn().mockResolvedValue([]),
      claimDueDeliveries: vi.fn().mockResolvedValue([{ id: 'cancelled' }, { id: 'sending' }]),
      prepareDelivery: vi.fn()
        .mockResolvedValueOnce({ outcome: 'skipped' })
        .mockResolvedValueOnce({ outcome: 'ready', id: 'sending', to: 'line-user-1', retryKey: 'retry-2', messages: [message] }),
      markDeliverySent: vi.fn().mockResolvedValue(true),
      rescheduleDeliveryFailure: vi.fn().mockResolvedValue(true),
    });
    const send = vi.fn().mockResolvedValue(undefined);
    await expect(processDueAlerts({ now, repository: store, send })).resolves.toEqual({ claimed: 0, sent: 1, failed: 0, skipped: 1 });
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('delivers each recipient independently with its persistent retry key', async () => {
    const deliveries: AlertDeliveryWork[] = [
      { id: 'delivery-a', retryKey: 'retry-a' },
      { id: 'delivery-b', retryKey: 'retry-b' },
    ];
    const store = repository({
      claimDeliveries: vi.fn().mockResolvedValue(deliveries),
      deliverLocked: vi.fn().mockImplementation(async ({ send, delivery }) => {
        await send({ to: 'line-user-1', messages: [event], idempotencyKey: delivery.retryKey });
        return 'sent';
      }),
    });
    const send = vi.fn().mockResolvedValue(undefined);

    await processDueAlerts({ now, repository: store, send });

    expect(store.claimDeliveries).toHaveBeenCalledWith({ claim, now });
    expect(store.deliverLocked).toHaveBeenCalledTimes(2);
    expect(send.mock.calls.map(([delivery]) => delivery.idempotencyKey)).toEqual(['retry-a', 'retry-b']);
  });

  it('treats LINE retry-key conflict (409) as an accepted delivery', async () => {
    const store = repository({
      claimDeliveries: vi.fn().mockResolvedValue([{ id: 'delivery-1', retryKey: 'retry-1' }]),
      deliverLocked: vi.fn().mockImplementation(async ({ send, delivery }) => {
        try { await send({ to: 'line-user-1', messages: [event], idempotencyKey: delivery.retryKey }); }
        catch (error) { if ((error as Error & { status?: number }).status !== 409) throw error; }
        return 'sent';
      }),
    });
    const conflict = Object.assign(new Error('retry key already used'), { status: 409 });

    await expect(processDueAlerts({ now, repository: store, send: vi.fn().mockRejectedValue(conflict) }))
      .resolves.toEqual({ claimed: 1, sent: 1, failed: 0, skipped: 0 });
  });

  it('keeps a timed-out recipient pending for its own retry without resending other recipients', async () => {
    const store = repository({
      claimDeliveries: vi.fn().mockResolvedValue([
        { id: 'delivery-a', retryKey: 'retry-a' },
        { id: 'delivery-b', retryKey: 'retry-b' },
      ]),
      deliverLocked: vi.fn()
        .mockResolvedValueOnce('failed')
        .mockResolvedValueOnce('sent'),
    });

    await expect(processDueAlerts({ now, repository: store, send: vi.fn() })).resolves.toEqual({
      claimed: 1, sent: 1, failed: 1, skipped: 0,
    });
  });

  it('does not push when lifecycle cancellation wins the trip lock immediately before delivery', async () => {
    const store = repository({
      claimDeliveries: vi.fn().mockResolvedValue([{ id: 'delivery-1', retryKey: 'retry-1' }]),
      deliverLocked: vi.fn().mockResolvedValue('skipped'),
    });
    const send = vi.fn();

    await expect(processDueAlerts({ now, repository: store, send })).resolves.toEqual({
      claimed: 1, sent: 0, failed: 0, skipped: 1,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('claims no more than 100 events and sends with the stable event ID as idempotency key', async () => {
    const store = repository();
    const send = vi.fn().mockResolvedValue(undefined);

    await expect(processDueAlerts({ now, repository: store, send })).resolves.toEqual({
      claimed: 1, sent: 1, failed: 0, skipped: 0,
    });
    expect(store.claimDueActiveEvents).toHaveBeenCalledWith({ now, limit: 100 });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'line-user-1', idempotencyKey: 'event-1',
    }));
    expect(store.markSent).toHaveBeenCalledWith({ claim, now });
  });

  it('never sends when a completion, cancellation, expiry, or other worker invalidates the claim before delivery', async () => {
    const store = repository({ confirmClaimedActiveEvent: vi.fn().mockResolvedValue(undefined) });
    const send = vi.fn();

    await expect(processDueAlerts({ now, repository: store, send })).resolves.toEqual({
      claimed: 1, sent: 0, failed: 0, skipped: 1,
    });
    expect(send).not.toHaveBeenCalled();
    expect(store.markSent).not.toHaveBeenCalled();
  });

  it('rechecks ownership before every recipient so an extension cannot send an old alert after its first target', async () => {
    const store = repository({
      confirmClaimedActiveEvent: vi.fn().mockResolvedValueOnce({
        ...event,
        recipients: [
          { id: 'line-user-1', name: '阿山' },
          { id: 'line-user-2', name: '小玉' },
        ],
      }).mockResolvedValueOnce(undefined),
    });
    const send = vi.fn().mockResolvedValue(undefined);

    await expect(processDueAlerts({ now, repository: store, send })).resolves.toEqual({
      claimed: 1, sent: 0, failed: 0, skipped: 1,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(store.markSent).not.toHaveBeenCalled();
  });

  it('increments attempts and schedules bounded retry delays without marking the event sent on LINE failure', async () => {
    const store = repository();
    const send = vi.fn().mockRejectedValue(new Error('LINE unavailable'));

    await expect(processDueAlerts({ now, repository: store, send })).resolves.toEqual({
      claimed: 1, sent: 0, failed: 1, skipped: 0,
    });
    expect(store.rescheduleFailure).toHaveBeenCalledWith({
      claim,
      now,
      error: 'LINE unavailable',
    });
    expect(store.markSent).not.toHaveBeenCalled();
  });

  it('uses the required 1, 5, 15, then 30 minute bounded retry schedule', () => {
    expect([1, 2, 3, 4, 5].map((attempt) => retryAt(now, attempt).toISOString())).toEqual([
      '2026-07-12T05:01:00.000Z',
      '2026-07-12T05:05:00.000Z',
      '2026-07-12T05:15:00.000Z',
      '2026-07-12T05:30:00.000Z',
      '2026-07-12T05:30:00.000Z',
    ]);
  });
});
