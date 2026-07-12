import { describe, expect, it, vi } from 'vitest';

import {
  deliverPendingActiveAlert,
  type AlertDeliveryRepository,
} from '@/src/features/alerts/delivery-contract';

describe('alert delivery contract', () => {
  it('confirms the stable event ID is still pending on an active trip before delivery and uses it as the idempotency key', async () => {
    const repository: AlertDeliveryRepository = {
      findPendingActiveEvent: vi.fn().mockResolvedValue({ id: 'event-1' }),
    };
    const deliver = vi.fn().mockResolvedValue(undefined);

    await expect(deliverPendingActiveAlert('event-1', repository, deliver)).resolves.toBe('sent');
    expect(repository.findPendingActiveEvent).toHaveBeenCalledWith('event-1');
    expect(deliver).toHaveBeenCalledWith({ eventId: 'event-1', idempotencyKey: 'event-1' });
  });

  it('skips a cancelled or claimed historical event instead of sending it', async () => {
    const repository: AlertDeliveryRepository = {
      findPendingActiveEvent: vi.fn().mockResolvedValue(undefined),
    };
    const deliver = vi.fn();

    await expect(deliverPendingActiveAlert('old-event-1', repository, deliver)).resolves.toBe('skipped');
    expect(deliver).not.toHaveBeenCalled();
  });
});
