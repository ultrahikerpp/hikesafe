import { describe, expect, it, vi } from 'vitest';

import {
  processDueAlerts,
  retryAt,
  type AlertProcessRepository,
} from '@/src/features/alerts/process';

const now = new Date('2026-07-12T05:00:00.000Z');
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
