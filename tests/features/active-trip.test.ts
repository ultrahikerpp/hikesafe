import { describe, expect, it, vi } from 'vitest';

import {
  loadActiveTripState,
  type ActiveTripRepository,
} from '@/src/features/trips/active-trip';
import { copy } from '@/src/features/i18n/copy';

const now = new Date('2026-07-12T01:00:00.000Z');

describe('loadActiveTripState', () => {
  it('reads the active trip and its last successfully stored check-in only in the authenticated member scope', async () => {
    const findActiveTripForMember = vi.fn().mockResolvedValue({
      startedAt: new Date('2026-07-12T00:00:00.000Z'),
      plannedFinishAt: new Date('2026-07-12T05:00:00.000Z'),
    });
    const findLastSuccessfulCheckIn = vi.fn().mockResolvedValue({
      createdAt: new Date('2026-07-12T00:30:00.000Z'),
      locationStatus: 'available' as const,
      locationCapturedAt: new Date('2026-07-12T00:59:00.000Z'),
    });
    const repository: ActiveTripRepository = { findActiveTripForMember, findLastSuccessfulCheckIn };

    await expect(loadActiveTripState({ tripId: 'trip-1', userId: 'member-1', now }, repository)).resolves.toEqual({
      startedAt: '2026-07-12T00:00:00.000Z',
      plannedFinishAt: '2026-07-12T05:00:00.000Z',
      lastSuccessfulCheckInAt: '2026-07-12T00:30:00.000Z',
      gpsFreshness: copy.gpsFreshness(1),
      now: '2026-07-12T01:00:00.000Z',
      pendingQueueCount: 0,
    });
    expect(findActiveTripForMember).toHaveBeenCalledWith('trip-1', 'member-1');
    expect(findLastSuccessfulCheckIn).toHaveBeenCalledWith('trip-1');
  });

  it('does not read check-ins when the authenticated user is not a participant', async () => {
    const repository: ActiveTripRepository = {
      findActiveTripForMember: vi.fn().mockResolvedValue(undefined),
      findLastSuccessfulCheckIn: vi.fn(),
    };

    await expect(loadActiveTripState({ tripId: 'trip-1', userId: 'outsider-1', now }, repository)).resolves.toBeUndefined();
    expect(repository.findLastSuccessfulCheckIn).not.toHaveBeenCalled();
  });
});
