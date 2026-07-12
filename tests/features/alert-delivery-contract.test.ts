import { describe, expect, it, vi } from 'vitest';

import {
  claimDueActiveAlerts,
  deliverClaimedActiveAlert,
  type AlertClaim,
  type AlertDeliveryRepository,
} from '@/src/features/alerts/delivery-contract';

const claim: AlertClaim = {
  eventId: 'event-1',
  claimToken: 'opaque-claim-token',
  claimVersion: 4,
};

describe('alert delivery contract', () => {
  it('returns opaque ownership from the atomic due-event claim', async () => {
    const claimDueActiveEvents = vi.fn().mockResolvedValue([claim]);
    const repository: AlertDeliveryRepository = {
      claimDueActiveEvents,
      confirmClaimedActiveEvent: vi.fn(),
    };

    await expect(claimDueActiveAlerts({ now: new Date('2026-07-12T01:00:00.000Z'), limit: 100 }, repository)).resolves.toEqual([claim]);
    expect(claimDueActiveEvents).toHaveBeenCalledWith({ now: new Date('2026-07-12T01:00:00.000Z'), limit: 100 });
  });

  it('sends only when the stable event ID still has this unexpired claim on an active trip', async () => {
    const repository: AlertDeliveryRepository = {
      claimDueActiveEvents: vi.fn(),
      confirmClaimedActiveEvent: vi.fn().mockResolvedValue({ id: 'event-1' }),
    };
    const deliver = vi.fn().mockResolvedValue(undefined);

    await expect(deliverClaimedActiveAlert(claim, repository, deliver)).resolves.toBe('sent');
    expect(repository.confirmClaimedActiveEvent).toHaveBeenCalledWith(claim);
    expect(deliver).toHaveBeenCalledWith({ eventId: 'event-1', idempotencyKey: 'event-1' });
  });

  it('skips another worker, an expired claim, or a cancelled event without calling the provider', async () => {
    const repository: AlertDeliveryRepository = {
      claimDueActiveEvents: vi.fn(),
      confirmClaimedActiveEvent: vi.fn().mockResolvedValue(undefined),
    };
    const deliver = vi.fn();

    await expect(deliverClaimedActiveAlert({ ...claim, claimToken: 'stale-token' }, repository, deliver)).resolves.toBe('skipped');
    expect(deliver).not.toHaveBeenCalled();
  });
});
